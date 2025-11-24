// Content script that injects the clutter library into every page
console.log('[Clutter Extension] Content script loaded');

let clutterScript = null;
let clutterActive = false;

// Function to inject the clutter script
function injectClutter() {
  console.log('[Clutter Extension] injectClutter() called, clutterActive:', clutterActive);
  if (clutterActive) return;

  // Check if script already exists
  if (document.getElementById('clutter-script')) {
    console.log('[Clutter Extension] Script already injected, skipping');
    clutterActive = true;
    return;
  }

  // Inject the clutter script
  clutterScript = document.createElement('script');
  clutterScript.src = chrome.runtime.getURL('clutter.js');
  clutterScript.id = 'clutter-script';
  clutterScript.onload = () => {
    console.log('[Clutter Extension] clutter.js script loaded successfully');
  };
  clutterScript.onerror = (error) => {
    console.error('[Clutter Extension] Failed to load clutter.js script:', error);
  };
  (document.head || document.documentElement).appendChild(clutterScript);

  clutterActive = true;
  console.log('[Clutter Extension] Injection started');
}

// Function to remove all clutter elements
function removeClutter() {
  if (!clutterActive) return;

  // Remove all clutter elements from the page
  const clutterElements = document.querySelectorAll('.clutter');
  clutterElements.forEach(el => el.remove());

  // Remove the clutter style
  const clutterStyle = document.querySelector('style');
  if (clutterStyle && clutterStyle.textContent.includes('.clutter')) {
    clutterStyle.remove();
  }

  clutterActive = false;
}

// Check if clutter is enabled and inject if so
chrome.storage.sync.get(['clutterEnabled'], (result) => {
  const isEnabled = result.clutterEnabled !== false; // Default to true
  console.log('[Clutter Extension] Clutter enabled status:', isEnabled);
  if (isEnabled) {
    injectClutter();
  } else {
    console.log('[Clutter Extension] Clutter is disabled, not injecting');
  }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'toggleClutter') {
    if (message.enabled) {
      injectClutter();
      // Reload the page to properly initialize clutter
      window.location.reload();
    } else {
      removeClutter();
    }
  }
});
