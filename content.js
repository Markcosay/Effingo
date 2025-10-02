// content.js
(() => {
  'use strict';

  // Prevent double injection
  if (window.copyHelperActive) return;
  window.copyHelperActive = true;

  let overlay = null;

  // Declare event handlers FIRST (so they're available in removeOverlay)
  const handleClick = (e) => {
    if (!overlay) return;
    
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && el !== document.body && el !== document.documentElement) {
      e.stopPropagation();
      e.preventDefault();
      
      highlightElement(el);
      const text = getTextFromElement(el);
      copyText(text);
      removeOverlay();
    } else {
      // Clicked on empty space → cancel
      removeOverlay();
    }
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      removeOverlay();
    }
  };

  // Now define removeOverlay (can safely reference handlers)
  function removeOverlay() {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
    // Remove event listeners to prevent memory leaks
    document.removeEventListener('click', handleClick, true);
    window.removeEventListener('keydown', handleEscape);
    window.copyHelperActive = false;
  }

  function createOverlay() {
    if (overlay) return;
    
    overlay = document.createElement('div');
    overlay.id = '__copy-helper-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 2147483647;
      cursor: copy;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
  }

  function highlightElement(el) {
    const rect = el.getBoundingClientRect();
    const highlight = document.createElement('div');
    highlight.style.cssText = `
      position: fixed;
      top: ${rect.top + window.scrollY}px;
      left: ${rect.left + window.scrollX}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 2px dashed #4361ee;
      border-radius: 4px;
      z-index: 2147483646;
      pointer-events: none;
      transition: opacity 0.2s;
    `;
    document.body.appendChild(highlight);
    
    setTimeout(() => {
      highlight.style.opacity = '0';
      setTimeout(() => highlight.remove(), 200);
    }, 300);
  }

  function copyText(text) {
    if (!text || !text.trim()) {
      alert('⚠️ No text to copy!');
      return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
      const msg = document.createElement('div');
      msg.innerText = '✅ Copied!';
      msg.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #06d6a0;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        z-index: 2147483645;
        font-family: system-ui;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      `;
      document.body.appendChild(msg);
      setTimeout(() => msg.remove(), 2000);
    }).catch(err => {
      console.error('Copy failed:', err);
      alert('❌ Failed to copy. Try again.');
    });
  }

  function getTextFromElement(el) {
    // innerText preserves visual line breaks!
    return el.innerText || el.textContent || '';
  }

  // Activate copy mode
  createOverlay();

  // Add listeners (after all functions are defined)
  document.addEventListener('click', handleClick, true);
  window.addEventListener('keydown', handleEscape);

  // Listen for deactivation message from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'deactivate') {
      removeOverlay();
    }
  });

})();