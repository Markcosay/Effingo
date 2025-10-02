// popup.js
// Inject content script when popup opens
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    files: ['content.js']
  });
});

document.getElementById('cancel').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'deactivate' });
  });
  window.close();
});

window.addEventListener('blur', () => {
  setTimeout(() => window.close(), 100);
});