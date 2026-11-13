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
  correctMessage: "That's it!",
  hints: {
    eomr: "Hmm... pretty close, but I think you missed a step",
  },
  wrongMessages: [
    "Nope!",
    "Not quite...",
    "Try again!",
    "Hmm, no.",
    "Keep thinking!",
  ],
  checkMs: 300, // per letter while a wrong answer is "checked"
  clearMs: 250, // letters fading away afterwards
};

// Called when the correct answer is entered. The big reveal goes here.
function onCorrect() {}

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

// Wrong answer: each letter is checked in turn, the box shakes, then
// the letters clear. The box stays locked until it's over.
async function wrong() {
  setLocked(true);
  answerMessage.textContent = "";

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
    span.classList.add("checked");
    await wait(ANSWER.checkMs);
  }

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

answerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const guess = normalize(answerInput.value);
  if (!guess || answerInput.disabled) return;

  if (guess === ANSWER.correct) {
    answerMessage.textContent = ANSWER.correctMessage;
    setLocked(true);
    onCorrect();
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
