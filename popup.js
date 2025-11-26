// Popup script for toggling clutter on/off

const toggle = document.getElementById('enableToggle');
const status = document.getElementById('status');
const themeSelect = document.getElementById('themeSelect');

// Load the current state
chrome.storage.sync.get(['clutterEnabled', 'clutterTheme'], (result) => {
  const isEnabled = result.clutterEnabled !== false; // Default to true
  const savedTheme = result.clutterTheme || 'auto';

  toggle.checked = isEnabled;
  themeSelect.value = savedTheme;
  updateStatus(isEnabled, savedTheme);
});

// Listen for toggle changes
toggle.addEventListener('change', () => {
  const isEnabled = toggle.checked;
  const currentTheme = themeSelect.value;

  // Save the new state
  chrome.storage.sync.set({ clutterEnabled: isEnabled }, () => {
    updateStatus(isEnabled, currentTheme);

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

// Listen for theme selection changes
themeSelect.addEventListener('change', () => {
  const selectedTheme = themeSelect.value;
  const isEnabled = toggle.checked;

  // Save the new theme
  chrome.storage.sync.set({ clutterTheme: selectedTheme }, () => {
    updateStatus(isEnabled, selectedTheme);

    // Notify all tabs to update the theme
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'changeTheme',
          theme: selectedTheme
        }).catch(() => {
          // Ignore errors for tabs that don't have the content script
        });
      });
    });
  });
});

function updateStatus(isEnabled, theme) {
  const actualTheme = theme === 'auto' ? getCurrentTheme() : theme;
  const themeInfo = getThemeInfo(actualTheme);

  if (isEnabled) {
    status.textContent = `${themeInfo.emoji} ${themeInfo.displayName} theme active`;
    status.style.color = '#4CAF50';
  } else {
    status.textContent = '⭕ Clutter is disabled';
    status.style.color = '#999';
  }
}
