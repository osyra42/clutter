// Popup script for toggling clutter on/off

const toggle = document.getElementById('enableToggle');
const status = document.getElementById('status');

// Load the current state
chrome.storage.sync.get(['clutterEnabled'], (result) => {
  const isEnabled = result.clutterEnabled !== false; // Default to true
  toggle.checked = isEnabled;
  updateStatus(isEnabled);
});

// Listen for toggle changes
toggle.addEventListener('change', () => {
  const isEnabled = toggle.checked;

  // Save the new state
  chrome.storage.sync.set({ clutterEnabled: isEnabled }, () => {
    updateStatus(isEnabled);

    // Notify all tabs to update
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'toggleClutter',
          enabled: isEnabled
        }).catch(() => {
          // Ignore errors for tabs that don't have the content script
        });
      });
    });
  });
});

function updateStatus(isEnabled) {
  if (isEnabled) {
    status.textContent = '✨ Clutter is enabled';
    status.style.color = '#4CAF50';
  } else {
    status.textContent = '⭕ Clutter is disabled';
    status.style.color = '#999';
  }
}
