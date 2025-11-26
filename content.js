// Content script that injects the clutter library into every page
console.log('[Clutter Extension] Content script loaded');

let clutterScript = null;
let clutterActive = false;

// Function to inject the clutter script
function injectClutter() {
  console.log('[Clutter Extension] injectClutter() called, clutterActive:', clutterActive);
  if (clutterActive) return;

  // Check if scripts already exist
  if (document.getElementById('clutter-script') || document.getElementById('themes-script')) {
    console.log('[Clutter Extension] Scripts already injected, skipping');
    clutterActive = true;
    return;
  }

  // Inject themes.js first
  const themesScript = document.createElement('script');
  themesScript.src = chrome.runtime.getURL('themes.js');
  themesScript.id = 'themes-script';
  themesScript.onload = () => {
    console.log('[Clutter Extension] themes.js script loaded successfully');

    // Then inject the clutter script
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
  };
  themesScript.onerror = (error) => {
    console.error('[Clutter Extension] Failed to load themes.js script:', error);
  };
  (document.head || document.documentElement).appendChild(themesScript);

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
  const clutterStyles = document.querySelectorAll('style');
  clutterStyles.forEach(style => {
    if (style.textContent.includes('.clutter')) {
      style.remove();
    }
  });

  // Remove the injected scripts
  const clutterScript = document.getElementById('clutter-script');
  if (clutterScript) {
    clutterScript.remove();
  }

  const themesScript = document.getElementById('themes-script');
  if (themesScript) {
    themesScript.remove();
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
  } else if (message.action === 'changeTheme') {
    // When theme changes, send message to the page to reinitialize
    console.log('[Clutter Extension] Theme changed to:', message.theme);

    // Send message to the injected clutter script
    window.postMessage({
      type: 'CLUTTER_CHANGE_THEME',
      theme: message.theme
    }, '*');
  }
});
