chrome.action.onClicked.addListener((tab) => {
  // Inject content script into active tab
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
});