// Background service worker for the clutter extension

// Initialize default settings when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ clutterEnabled: true }, () => {
    console.log('Clutter extension installed - enabled by default');
  });
});
