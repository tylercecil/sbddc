// ============================================================
// Puzzles
// ============================================================
// answer:        the correct word (uppercase, 5 letters)
// specialColumn: column (1-5) that always shows a wrong grade
// winMessage:    shown with the confetti
const PUZZLES = [
  { answer: "GOOSE", specialColumn: 5, winMessage: "HONK HONK!" },
];

// Answers always count as real words, even if words.js lacks them.
PUZZLES.forEach((p) => WORDS.add(p.answer));

// ============================================================
// Timing (ms). Pushed into CSS variables so CSS and JS agree.
// ============================================================
const TIMING = {
  pop: 100,           // tile bump when typing
  shake: 500,         // row shake for an invalid word
  vanish: 250,        // letters falling away after the shake
  reveal: 500,        // one tile hopping + flipping
  revealStagger: 250, // delay between tiles starting their reveal
  flash: 900,         // one tile's win flash/jump
  flashStagger: 100,  // delay between tiles in the win wave
  toast: 1500,        // how long messages stay up
};

const WORD_LENGTH = 5;
const GRADES = ["correct", "present", "absent"];

// ============================================================
// Grading
// ============================================================

// Standard Wordle rules. Greens are claimed first so duplicate
// letters only go yellow while unclaimed copies remain in the answer.
function gradeHonest(guess, answer) {
  const grades = Array(WORD_LENGTH).fill("absent");
  const unclaimed = {};

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === answer[i]) {
      grades[i] = "correct";
    } else {
      unclaimed[answer[i]] = (unclaimed[answer[i]] || 0) + 1;
    }
  }
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (grades[i] !== "correct" && unclaimed[guess[i]] > 0) {
      grades[i] = "present";
      unclaimed[guess[i]]--;
    }
  }
  return grades;
}

// Any grade except the true one.
function lie(trueGrade) {
  const wrong = GRADES.filter((g) => g !== trueGrade);
  return wrong[Math.floor(Math.random() * wrong.length)];
}

function grade(guess, puzzle) {
  const grades = gradeHonest(guess, puzzle.answer);
  const i = puzzle.specialColumn - 1;
  grades[i] = lie(grades[i]);
  return grades;
}

// ============================================================
// Sound (placeholder: called at every animation beat)
// ============================================================
// names: "type", "delete", "shake", "flip", "win"
function playSound(name) {}

// ============================================================
// Animation helpers
// ============================================================
const typer = document.getElementById("typer");
const toastEl = document.getElementById("toast");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Re-trigger a CSS animation class even if it's already applied.
function replay(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

let toastTimer;
function toast(message, ms = TIMING.toast) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  if (ms) toastTimer = setTimeout(() => toastEl.classList.remove("show"), ms);
}

function hideToast() {
  clearTimeout(toastTimer);
  toastEl.classList.remove("show");
}

// ============================================================
// One game = one board + one puzzle
// ============================================================
function createGame(board, puzzle) {
  let row;          // the .row element currently being typed into
  let current = ""; // letters typed into that row
  let busy = false; // true while an animation runs; input is ignored
  let won = false;

  function addRow() {
    row = document.createElement("div");
    row.className = "row";
    for (let i = 0; i < WORD_LENGTH; i++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      row.appendChild(tile);
    }
    board.appendChild(row);
    // Center the new row in the board (the board is the scroll container).
    const top = row.offsetTop - board.clientHeight / 2 + row.offsetHeight / 2;
    board.scrollTo({ top, behavior: "smooth" });
  }

  function tiles() {
    return [...row.children];
  }

  function render() {
    tiles().forEach((tile, i) => {
      tile.textContent = current[i] || "";
      tile.classList.toggle("filled", i < current.length);
    });
  }

  // ---------- Animations ----------

  async function animateTooShort() {
    playSound("shake");
    replay(row, "shake");
    await wait(TIMING.shake);
    row.classList.remove("shake");
  }

  async function animateInvalid() {
    toast("Not in word list");
    playSound("shake");
    replay(row, "shake");
    await wait(TIMING.shake);
    row.classList.remove("shake");

    tiles().forEach((t) => t.classList.add("vanish"));
    await wait(TIMING.vanish);
    tiles().forEach((t) => t.classList.remove("vanish"));
    fill("");
  }

  // Each tile hops and flips in turn; its color appears mid-flip.
  async function animateReveal(grades) {
    const ts = tiles();
    for (let i = 0; i < ts.length; i++) {
      const tile = ts[i];
      playSound("flip");
      replay(tile, "reveal");
      setTimeout(() => (tile.dataset.state = grades[i]), TIMING.reveal / 2);
      await wait(TIMING.revealStagger);
    }
    await wait(TIMING.reveal - TIMING.revealStagger);
    ts.forEach((t) => t.classList.remove("reveal"));
  }

  async function animateWin() {
    await animateReveal(Array(WORD_LENGTH).fill("correct"));

    playSound("win");
    tiles().forEach((tile, i) => {
      tile.style.animationDelay = `${i * TIMING.flashStagger}ms`;
      replay(tile, "win");
    });
    confetti();
    toast(puzzle.winMessage, 0);
  }

  // ---------- Input ----------

  // Typing goes through here; ignored while animating or after a win.
  function setLetters(letters) {
    if (busy || won) {
      typer.value = current;
      return;
    }
    fill(letters);
  }

  function fill(letters) {
    const before = current.length;
    current = letters;
    if (activeGame === game) typer.value = letters;
    render();
    if (current.length > before) {
      playSound("type");
      replay(tiles()[current.length - 1], "pop");
    } else if (current.length < before) {
      playSound("delete");
    }
  }

  async function submit() {
    if (busy || won) return;
    busy = true;

    const guess = current;
    if (guess.length < WORD_LENGTH) {
      await animateTooShort();
    } else if (!WORDS.has(guess)) {
      await animateInvalid();
    } else if (guess === puzzle.answer) {
      won = true;
      typer.blur();
      await animateWin();
    } else {
      await animateReveal(grade(guess, puzzle));
      current = "";
      if (activeGame === game) typer.value = "";
      addRow();
    }

    busy = false;
  }

  addRow();
  const game = {
    puzzle,
    setLetters,
    submit,
    letters: () => current,
    isWon: () => won,
  };
  return game;
}

// The game currently receiving keystrokes (null on non-puzzle pages).
let activeGame = null;

// The hidden input is the source of truth for letters, so phone
// keyboards (which often don't send useful keydown events) work.
typer.addEventListener("input", () => {
  if (!activeGame) return;
  const letters = typer.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, WORD_LENGTH);
  activeGame.setLetters(letters);
});

typer.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    activeGame?.submit();
  }
});

// Keep the input focused: tap anywhere on phones, any key on desktop.
const wantsTyping = () => activeGame && !activeGame.isWon();
document.addEventListener("click", () => {
  if (wantsTyping()) typer.focus();
});
document.addEventListener("keydown", () => {
  if (wantsTyping() && document.activeElement !== typer) typer.focus();
});

// ============================================================
// Confetti
// ============================================================
const CONFETTI = {
  count: 180,
  colors: ["#6aaa64", "#c9b458", "#e8635a", "#5a9be8", "#c45ae8", "#f5f5f5"],
  gravity: 0.25,
  drag: 0.985,
  durationMs: 5000,
};

function confetti() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);

  // Two cannons in the bottom corners, aimed up and inward.
  const pieces = Array.from({ length: CONFETTI.count }, (_, i) => {
    const fromLeft = i % 2 === 0;
    const angle = (fromLeft ? -60 : -120) * (Math.PI / 180) + (Math.random() - 0.5) * 0.6;
    const speed = 10 + Math.random() * 12;
    return {
      x: fromLeft ? 0 : innerWidth,
      y: innerHeight,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 6 + Math.random() * 6,
      spin: Math.random() * Math.PI,
      spinSpeed: (Math.random() - 0.5) * 0.3,
      color: CONFETTI.colors[i % CONFETTI.colors.length],
    };
  });

  const start = performance.now();
  function frame(now) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of pieces) {
      p.vx *= CONFETTI.drag;
      p.vy = p.vy * CONFETTI.drag + CONFETTI.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.spin += p.spinSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.spin);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    if (now - start < CONFETTI.durationMs) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
  }
  requestAnimationFrame(frame);
}

// ============================================================
// Start
// ============================================================
for (const [name, ms] of Object.entries(TIMING)) {
  document.documentElement.style.setProperty(`--${name}-ms`, `${ms}ms`);
}
activeGame = createGame(document.getElementById("board"), PUZZLES[0]);
typer.focus();
