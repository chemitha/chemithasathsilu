(function () {
  'use strict';

  // Render the minimalist B&W blocked screen
  const triggerBlockedScreen = () => {
    // Avoid re-rendering if already showing
    if (document.getElementById('devtools-block-overlay')) return;

    // Inject styles directly into head
    const style = document.createElement('style');
    style.innerHTML = `
      #devtools-block-overlay {
        position: fixed;
        inset: 0;
        z-index: 999999999;
        background-color: #000000;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 24px;
        user-select: none;
        cursor: default !important;
        pointer-events: auto !important;
      }
      #devtools-block-overlay h1 {
        font-size: 1.5rem;
        font-weight: 600;
        letter-spacing: -0.02em;
        margin: 0 0 8px 0;
        color: #ffffff;
      }
      #devtools-block-overlay p {
        font-size: 0.875rem;
        color: #888888;
        margin: 0 0 24px 0;
      }
      #devtools-block-overlay button {
        background-color: #ffffff;
        color: #000000;
        border: none;
        padding: 10px 20px;
        font-size: 0.875rem;
        font-weight: 500;
        border-radius: 100vh;
        cursor: pointer !important;
        transition: opacity 0.15s ease;
        pointer-events: auto !important;
      }
      #devtools-block-overlay button:hover {
        opacity: 0.85;
        scale: 1.5;
      }
    `;
    document.head.appendChild(style);

    // Replace body content with the warning overlay
    document.body.innerHTML = `
      <div id="devtools-block-overlay">
        <h1>Inspection Disabled</h1>
        <p>Developer tools are restricted for this showcase app.</p>
        <button id="reload-btn">Reload Page</button>
      </div>
    `;

    // Attach reload trigger
    document.getElementById('reload-btn').addEventListener('click', () => {
      window.top.location.reload();
    });
  };

  // 1. DevTools Detection Trap (Timing & Debugger)
  const detectDevTools = () => {
    const startTime = performance.now();
    
    // Executes debugger check
    (function () {}['constructor']('debugger')());

    // If DevTools is open, execution pauses here, causing a time delay
    if (performance.now() - startTime > 100) {
      triggerBlockedScreen();
    }
  };

  setInterval(detectDevTools, 100);

  // 2. Comprehensive Key Blocker (Capture Phase)
  const preventInspectKeys = (e) => {
    const key = e.key ? e.key.toUpperCase() : '';
    const code = e.code ? e.code.toUpperCase() : '';
    const isCmdOrCtrl = e.ctrlKey || e.metaKey;

    const isF12 = key === 'F12' || code === 'F12';
    const isDevToolsCombo =
      isCmdOrCtrl && e.shiftKey && ['I', 'J', 'C', 'K', 'E', 'S'].includes(key);
    const isSourceOrSave = isCmdOrCtrl && ['U', 'S'].includes(key);

    if (isF12 || isDevToolsCombo || isSourceOrSave) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  };

  ['keydown', 'keyup', 'keypress'].forEach((evt) => {
    window.addEventListener(evt, preventInspectKeys, true);
    document.addEventListener(evt, preventInspectKeys, true);
  });

  // 3. Context Menu Blocker
  window.addEventListener('contextmenu', (e) => e.preventDefault(), true);
})();