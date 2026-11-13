// Page carousel. Knows nothing about the puzzles: it slides between the
// <section class="page"> elements in index.html (in order) and fires a
// "pagechange" event on document with { detail: { page, index } }.

const SWIPE_MIN_PX = 50;

const track = document.getElementById("pages");
const pages = [...track.querySelectorAll(".page")];
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const label = document.getElementById("nav-label");

let index = 0;

function show(i, { animate = true } = {}) {
  index = Math.max(0, Math.min(pages.length - 1, i));

  track.style.transition = animate ? "" : "none";
  track.style.transform = `translateX(${-index * 100}%)`;
  label.textContent = `Page ${index + 1}`;
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === pages.length - 1;
  history.replaceState(null, "", `#${index + 1}`);

  document.dispatchEvent(
    new CustomEvent("pagechange", { detail: { page: pages[index], index } })
  );
}

prevBtn.addEventListener("click", () => show(index - 1));
nextBtn.addEventListener("click", () => show(index + 1));

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") show(index - 1);
  if (e.key === "ArrowRight") show(index + 1);
});

// Swipe left/right on phones.
let touchStart = null;
track.addEventListener("touchstart", (e) => {
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}, { passive: true });
track.addEventListener("touchend", (e) => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy)) {
    show(index + (dx < 0 ? 1 : -1));
  }
});

// Start on the page in the URL (e.g. silly/#3), without sliding there.
show(parseInt(location.hash.slice(1), 10) - 1 || 0, { animate: false });
