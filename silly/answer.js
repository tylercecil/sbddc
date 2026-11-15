// Answer box on the last page. Uses replay(), wait() and TIMING from
// game.js. Loaded before carousel.js so it hears the first pagechange.
// Keeps no state: a reload starts fresh.

// ============================================================
// Answers
// ============================================================
// Answers are compared lowercased with surrounding spaces trimmed.
// hints: near-misses that get a nudge instead of the wrong animation.
// wrongMessages: shown one per wrong answer, in order, then loops.
const ANSWER = {
  correct: "rome",
  correctMessage: "Back to Italy? I'm on it, but you still owe me after the fiasco in Milan!",
  hints: {
    eomr: "Hmm... pretty close, but I think you missed a step",
  },
  wrongMessages: [
    "Nope!",
    "Sure don't think I'm going there...",
    "Did Silly Confuse you?",
    "Did you find Silly's Tricks?",
    "Do you think... maybe you're missing something?",
    "Do you think Silly's Tricks have something to do with the answer?",
    "Have you heard any honks, lately?",
  ],
  checkMs: 300, // per letter while a wrong answer is "checked"
  revealDelayMs: 5000, // correct answer: how long correctMessage shows
  fadeMs: 400,         // header and box fading out
  dropMs: 1200,        // the final letter dropping onto the page
  clearMs: 250, // letters fading away afterwards
  cheerMs: 700, // correct answer: box glowing green after the letters
};

// Correct answer: the header and box fade out, and the final letter
// (#final-letter in index.html) drops onto the page.
async function onCorrect() {
  const page = document.getElementById("answer");
  await wait(ANSWER.revealDelayMs);

  page.classList.add("fading");
  await wait(ANSWER.fadeMs);

  page.classList.add("solved", "letter-page");
  page.scrollTop = 0;
  document.getElementById("final-letter").hidden = false;
  await wait(ANSWER.dropMs);
}

// ============================================================
// Box
// ============================================================
const answerForm = document.getElementById("answer-form");
const answerInput = document.getElementById("answer-input");
const answerButton = answerForm.querySelector("button");
const answerLetters = document.getElementById("answer-letters");
const answerMessage = document.getElementById("answer-message");

let wrongCount = 0;

const normalize = (text) => text.trim().toLowerCase();

function setLocked(locked) {
  answerInput.disabled = locked;
  answerButton.disabled = locked;
}

// Show the guess as separate letters over the input, then mark each in
// turn as "right" (green) or "wrong" (red).
async function checkLetters(result) {
  const style = getComputedStyle(answerInput);
  answerLetters.style.font = style.font;
  answerLetters.style.letterSpacing = style.letterSpacing;
  answerLetters.style.paddingLeft = `calc(${style.paddingLeft} + ${style.borderLeftWidth})`;
  answerLetters.replaceChildren(
    ...[...answerInput.value].map((char) => {
      const span = document.createElement("span");
      span.textContent = char;
      return span;
    })
  );
  answerForm.classList.add("checking");

  for (const span of answerLetters.children) {
    span.classList.add("checked", result);
    await wait(ANSWER.checkMs);
  }
}

// Wrong answer: each letter is checked, the box shakes, then the letters
// clear. The box stays locked until it's over.
async function wrong() {
  setLocked(true);
  answerMessage.textContent = "";
  await checkLetters("wrong");

  replay(answerForm, "shake");
  await wait(TIMING.shake);
  answerForm.classList.remove("shake");

  answerLetters.classList.add("clear");
  await wait(ANSWER.clearMs);
  answerLetters.classList.remove("clear");
  answerForm.classList.remove("checking");

  answerInput.value = "";
  answerMessage.textContent = ANSWER.wrongMessages[wrongCount % ANSWER.wrongMessages.length];
  wrongCount++;
  setLocked(false);
  if (activeAnswerPage) answerInput.focus();
}

// Right answer: each letter turns green, the box glows, then the message
// shows and the final letter is revealed. The box stays locked.
async function right() {
  setLocked(true);
  answerMessage.textContent = "";
  await checkLetters("right");

  replay(answerForm, "cheer");
  await wait(ANSWER.cheerMs);

  answerMessage.textContent = ANSWER.correctMessage;
  await onCorrect();
}

answerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const guess = normalize(answerInput.value);
  if (!guess || answerInput.disabled) return;

  if (guess === ANSWER.correct) {
    right();
  } else if (Object.hasOwn(ANSWER.hints, guess)) {
    answerMessage.textContent = ANSWER.hints[guess];
  } else {
    wrong();
  }
});

// Focus the box whenever its page comes into view.
let activeAnswerPage = false;
document.addEventListener("pagechange", (e) => {
  activeAnswerPage = e.detail.page.contains(answerForm);
  if (activeAnswerPage && !answerInput.disabled) answerInput.focus();
});

document.documentElement.style.setProperty("--check-ms", `${ANSWER.checkMs}ms`);
document.documentElement.style.setProperty("--cheer-ms", `${ANSWER.cheerMs}ms`);
document.documentElement.style.setProperty("--answer-fade-ms", `${ANSWER.fadeMs}ms`);
document.documentElement.style.setProperty("--answer-drop-ms", `${ANSWER.dropMs}ms`);
