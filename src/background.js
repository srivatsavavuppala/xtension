// Currently not used, but can be used for future background tasks or API proxying
// Show a dot badge on the extension icon when on a GitHub repository page
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && isGitHubRepoPage(tab.url)) {
    chrome.action.setBadgeText({ text: '+', tabId });
    // chrome.action.setBadgeBackgroundColor({ color: '#28a745', tabId }); // green dot
  } else {
    chrome.action.setBadgeText({ text: '', tabId });
  }
});

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && isGitHubRepoPage(tab.url)) {
      chrome.action.setBadgeText({ text: '+', tabId: activeInfo.tabId });
    //   chrome.action.setBadgeBackgroundColor({ color: '#28a745', tabId: activeInfo.tabId });
    } else {
      chrome.action.setBadgeText({ text: '', tabId: activeInfo.tabId });
    }
  });
});

function isGitHubRepoPage(url) {
  const match = url.match(/^https:\/\/github\.com\/[^\/]+\/[^\/]+(\/.*)?$/);
  if (!match) return false;
  const pathParts = new URL(url).pathname.split('/').filter(Boolean);
  return pathParts.length >= 2 && !['settings', 'pulls', 'issues', 'actions', 'projects'].includes(pathParts[2] || '');
}