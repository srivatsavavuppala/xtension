// Guard against double-injection when scripting API re-injects this file
if (window.__xtensionLoaded) {
  // Already running — skip re-registering listeners
} else {
window.__xtensionLoaded = true;

// Speech recognition handler — runs in the tab so it doesn't close the popup
let activeRecognition = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startSpeech') {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      sendResponse({ error: 'not_supported' });
      return true;
    }
    if (activeRecognition) {
      activeRecognition.stop();
      activeRecognition = null;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    activeRecognition = recognition;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      chrome.runtime.sendMessage({ action: 'speechResult', text: transcript });
    };
    recognition.onerror = (event) => {
      chrome.runtime.sendMessage({ action: 'speechError', error: event.error });
      activeRecognition = null;
    };
    recognition.onend = () => {
      activeRecognition = null;
    };
    recognition.start();
    sendResponse({ started: true });
    return true;
  }

  if (request.action === 'stopSpeech') {
    if (activeRecognition) {
      activeRecognition.stop();
      activeRecognition = null;
    }
    sendResponse({ stopped: true });
    return true;
  }

  if (request.action === 'extractRepoInfo') {
    try {
      // Extract minimal repo info
      let repoName = '';
      let owner = '';
      let description = '';

      // Try main repo page selectors
      const repoLink = document.querySelector('strong.mr-2.flex-self-stretch a, strong[itemprop="name"] a');
      if (repoLink) repoName = repoLink.innerText.trim();
      const ownerLink = document.querySelector('span.author a, span[itemprop="author"] a');
      if (ownerLink) owner = ownerLink.innerText.trim();
      // Try new GitHub layout selectors
      if (!repoName || !owner) {
        const pathParts = window.location.pathname.split('/').filter(Boolean);
        if (pathParts.length >= 2) {
          owner = owner || pathParts[0];
          repoName = repoName || pathParts[1];
        }
      }
      // Description
      const descElem = document.querySelector('p.f4.my-3, p[data-testid="repo-description"]');
      if (descElem) description = descElem.innerText.trim();
      // Fallback: try meta tag
      if (!description) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) description = metaDesc.content;
      }
      if (repoName && owner) {
        sendResponse({
          repo: repoName,
          owner,
          description
        });
      } else {
        sendResponse(null);
      }
    } catch (e) {
      console.error('Error extracting repo info:', e);
      sendResponse(null);
    }
    return true;
  }
});

} // end __xtensionLoaded guard
