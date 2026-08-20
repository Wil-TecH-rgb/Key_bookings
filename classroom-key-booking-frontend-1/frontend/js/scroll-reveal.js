// ============================================================
// scroll-reveal.js — fades/rises sections into view as the user
// scrolls, using IntersectionObserver (no scroll-event polling).
// Add class="reveal" (single block) or class="reveal-stagger"
// (staggers its direct children) to any element to opt it in.
// ============================================================

function initScrollReveal() {
  const targets = document.querySelectorAll(".reveal, .reveal-stagger");
  if (targets.length === 0) return;

  // If the browser doesn't support IntersectionObserver, just show everything.
  if (!("IntersectionObserver" in window)) {
    targets.forEach(el => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target); // reveal once, don't re-trigger
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px"
  });

  targets.forEach(el => observer.observe(el));
}

document.addEventListener("DOMContentLoaded", initScrollReveal);

// Dashboard/admin load room/booking data asynchronously after page load,
// so newly-inserted content (like the room grid) needs a re-scan.
// Call this after you finish rendering dynamic content into the DOM.
function refreshScrollReveal() {
  initScrollReveal();
}
