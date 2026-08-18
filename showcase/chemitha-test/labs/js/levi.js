// levi.js for labs (audio sources use absolute URLs to avoid sandbox issues)

(function () {
  // ---------------------------
  // Configuration
  // ---------------------------
  const TARGET = "LEVI";
  const DURATION_MS = 9000;
  const BLADE_GAP_MS = 200;
  const BG_RISE_DURATION = 2200;
  const QUOTES = [
    "The only thing we're allowed to do is believe that we won't regret the choice we made.",
    "We can't always carry our fallen comrades home, but we carry their memory.",
    "Give up on your dream and die.",
    "Your strength won't die with you.",
    "Just do the best you can and choose whichever you'll regret the least."
  ];

  // Use absolute URLs for audio so labs subdomain can load them from the main domain
  const BLADE_SRC_1 = "https://chemitha.com/js/sword-slice-2-393845.mp3";
  const BLADE_SRC_2 = "https://chemitha.com/js/sword-slice-2-393845.mp3";

  let seq = "";               // typed sequence buffer
  let isActive = false;       // prevent overlapping Levi modes

  const blade1 = new Audio(BLADE_SRC_1);
  const blade2 = new Audio(BLADE_SRC_2);
  blade1.preload = "auto";
  blade2.preload = "auto";

  // ---------------------------
  // Inject CSS once
  // ---------------------------
  function injectCSS() {
    if (document.getElementById("levi-mode-css")) return;

    const css = `
body.levi-active .container,
body.levi-active .card,
body.levi-active .project-table,
body.levi-active .footer {
  opacity: 1 !important;
  transition: opacity 0.45s ease;
  pointer-events: none;
}

.header {
  position: relative;
  z-index: 10050;
  pointer-events: auto;
}

body.levi-active .header h1 {
  transform: translateY(-6px) scale(1.02);
  transition: transform 0.35s ease, text-shadow 0.35s ease;
  text-shadow: 0 8px 30px rgba(0,0,0,0.45);
}

.levi-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.62);
  z-index: 10000;
  opacity: 0;
  transition: opacity 0.45s ease;
  pointer-events: none;
}
.levi-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

.levi-bg {
  position: fixed;
  left: 0;
  width: 100%;
  height: 120%;
  bottom: -120%;
  background: url("https://chemitha.com/assets/images/thumb-1920-606225.jpg") center/cover no-repeat;
  z-index: 10005;
  opacity: 0.58;
  transition: bottom ${BG_RISE_DURATION}ms cubic-bezier(.2,.9,.2,1);
  will-change: bottom;
  pointer-events: none;
}
.levi-bg.active {
  bottom: 0;
}

@media (max-width: 600px) {
  .levi-bg {
    background: url("https://chemitha.com/assets/images/attack-on-titan-walls-height.png") center/cover no-repeat;
  }
}

@media (prefers-reduced-motion: reduce) {
  .levi-bg { transition: none; }
}
`;
    const style = document.createElement("style");
    style.id = "levi-mode-css";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  // ---------------------------
  // Create overlay and background
  // ---------------------------
  function createVisualNodes() {
    const overlay = document.createElement("div");
    overlay.className = "levi-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const bg = document.createElement("div");
    bg.className = "levi-bg";
    bg.setAttribute("aria-hidden", "true");

    document.body.appendChild(overlay);
    document.body.appendChild(bg);

    return { overlay, bg };
  }

  function removeVisualNodes(overlay, bg) {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (bg && bg.parentNode) bg.parentNode.removeChild(bg);
  }

  // ---------------------------
  // Trigger Levi Mode
  // ---------------------------
  function triggerLeviMode() {
    if (isActive) return; // prevent overlapping triggers
    isActive = true;

    // fresh DOM references
    const headerEl = document.querySelector(".header h1");
    const subtitleEl = document.querySelector(".header .subtitle");

    const originalHeaderText = headerEl ? headerEl.textContent : "";
    const originalSubtitleHTML = subtitleEl ? subtitleEl.innerHTML : "";

    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    if (headerEl) headerEl.textContent = `"${randomQuote}"`;
    if (subtitleEl) subtitleEl.innerHTML = "<em>~LEVI ACKERMAN~</em>";

    injectCSS();
    const { overlay, bg } = createVisualNodes();
    void overlay.offsetHeight; 
    void bg.offsetHeight;

    overlay.classList.add("active");
    bg.classList.add("active");
    document.body.classList.add("levi-active");

    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch { window.scrollTo(0,0); }

    blade1.currentTime = 0; blade1.play().catch(() => {});
    setTimeout(() => { blade2.currentTime = 0; blade2.play().catch(() => {}); }, BLADE_GAP_MS);

    // Restore state
    setTimeout(() => {
      overlay.classList.remove("active");
      bg.classList.remove("active");
      document.body.classList.remove("levi-active");

      setTimeout(() => {
        if (headerEl) headerEl.textContent = originalHeaderText;
        if (subtitleEl) subtitleEl.innerHTML = originalSubtitleHTML;
        removeVisualNodes(overlay, bg);
        isActive = false; // ready for next trigger
      }, 700);
    }, DURATION_MS);
  }

  // ---------------------------
  // Handle key sequence
  // ---------------------------
  function onKeyDown(e) {
    if (!e.key || e.key.length !== 1) return;
    seq += e.key.toUpperCase();
    if (seq.length > TARGET.length) seq = seq.slice(-TARGET.length);
    if (seq === TARGET) {
      seq = "";
      triggerLeviMode();
    }
  }

  // ---------------------------
  // Init
  // ---------------------------
  function init() {
    injectCSS();
    document.addEventListener("keydown", (e) => {
      const active = document.activeElement;
      const tag = active && active.tagName ? active.tagName.toLowerCase() : "";
      // Ignore typing in inputs/textarea/contenteditable
      if (tag === "input" || tag === "textarea" || active.isContentEditable) return;
      onKeyDown(e);
    }, { passive: true });
  }

  // run init
  init();
})();
