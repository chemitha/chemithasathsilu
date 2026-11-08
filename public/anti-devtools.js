(function () {
  'use strict';

  // 1. Injected Anti-DevTools Protection & Key/Event Shields
  const preventInspectKeys = (e) => {
    const key = e.key ? e.key.toUpperCase() : '';
    const code = e.code ? e.code.toUpperCase() : '';
    const isCmdOrCtrl = e.ctrlKey || e.metaKey;

    // F12
    const isF12 = key === 'F12' || code === 'F12';
    // Ctrl+Shift+I, J, C, K, E, S, M (Device Mode), etc.
    const isDevToolsCombo =
      isCmdOrCtrl && e.shiftKey && ['I', 'J', 'C', 'K', 'E', 'S', 'M'].includes(key);
    // Ctrl+U (View Source), Ctrl+S (Save Page), Ctrl+P (Print Page)
    const isSourceOrSave = isCmdOrCtrl && ['U', 'S', 'P'].includes(key);

    if (isF12 || isDevToolsCombo || isSourceOrSave) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
      return false;
    }
  };

  ['keydown', 'keyup', 'keypress'].forEach((evt) => {
    window.addEventListener(evt, preventInspectKeys, true);
    document.addEventListener(evt, preventInspectKeys, true);
  });

  // Global Context Menu Blocker (Capture Phase)
  const blockContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') {
      e.stopImmediatePropagation();
    }
    return false;
  };

  window.addEventListener('contextmenu', blockContextMenu, true);
  document.addEventListener('contextmenu', blockContextMenu, true);

  // Disable dragstart & selectstart as additional protection
  window.addEventListener('dragstart', (e) => e.preventDefault(), true);

  // 2. Minimalist B&W Blocked Screen trigger
  const triggerBlockedScreen = () => {
    if (document.getElementById('devtools-block-overlay')) return;

    // Remove any running intervals/timers if possible and freeze
    const style = document.createElement('style');
    style.id = 'devtools-block-style';
    style.innerHTML = `
      #devtools-block-overlay {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 2147483647 !important;
        background-color: #000000 !important;
        color: #ffffff !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        text-align: center !important;
        padding: 24px !important;
        user-select: none !important;
        cursor: default !important;
        pointer-events: auto !important;
      }
      #devtools-block-overlay h1 {
        font-size: 1.5rem !important;
        font-weight: 600 !important;
        letter-spacing: -0.02em !important;
        margin: 0 0 8px 0 !important;
        color: #ffffff !important;
      }
      #devtools-block-overlay p {
        font-size: 0.875rem !important;
        color: #888888 !important;
        margin: 0 0 24px 0 !important;
      }
      #devtools-block-overlay button {
        background-color: #ffffff !important;
        color: #000000 !important;
        border: none !important;
        padding: 10px 20px !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        border-radius: 100vh !important;
        cursor: pointer !important;
        transition: opacity 0.15s ease !important;
        pointer-events: auto !important;
      }
      #devtools-block-overlay button:hover {
        opacity: 0.85 !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'devtools-block-overlay';
    overlay.innerHTML = `
      <h1>Inspection Disabled</h1>
      <p>Developer tools and source inspection are restricted for this showcase app.</p>
      <button id="reload-btn">Reload Page</button>
    `;

    if (document.body) {
      document.body.innerHTML = '';
      document.body.appendChild(overlay);
    } else {
      document.documentElement.appendChild(overlay);
    }

    const reloadBtn = document.getElementById('reload-btn');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => {
        window.top.location.reload();
      });
    }
  };

  // 3. Multi-layer DevTools Detection Traps
  // Trap A: Debugger timing differential
  const detectTimingDebugger = () => {
    const startTime = performance.now();
    (function () {}['constructor']('debugger')());
    if (performance.now() - startTime > 100) {
      triggerBlockedScreen();
    }
  };

  // Trap B: Console element format inspection (triggers when console is open)
  const elementTracker = document.createElement('div');
  let devtoolsTriggered = false;
  Object.defineProperty(elementTracker, 'id', {
    get: function () {
      if (!devtoolsTriggered) {
        devtoolsTriggered = true;
        triggerBlockedScreen();
      }
      return 'devtools-tracker';
    },
    configurable: true,
  });

  const checkConsoleElement = () => {
    try {
      console.log('%c', elementTracker);
      console.clear();
    } catch (_) {}
  };

  // Trap C: Window dimension differential (detects docked DevTools)
  const checkWindowDimensions = () => {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth > threshold;
    const heightDiff = window.outerHeight - window.innerHeight > threshold;
    if (widthDiff || heightDiff) {
      triggerBlockedScreen();
    }
  };

  // Initial immediate check
  detectTimingDebugger();
  checkConsoleElement();
  checkWindowDimensions();

  // Continuous monitoring
  setInterval(() => {
    detectTimingDebugger();
    checkConsoleElement();
    checkWindowDimensions();
  }, 200);

  window.addEventListener('resize', checkWindowDimensions);
})();