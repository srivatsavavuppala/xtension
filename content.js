chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractRepoInfo') {
    try {
      // Extract repo info from GitHub page
      const repoName = document.querySelector('strong.mr-2.flex-self-stretch a').innerText;
      const owner = document.querySelector('span.author a').innerText;
      const description = document.querySelector('p.f4.my-3').innerText;

      // Fetch README using GitHub API
      fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, {
        headers: { 'Accept': 'application/vnd.github.v3.raw' }
      })
      .then(response => response.ok ? response.text() : '')
      .then(readme => {
        sendResponse({repo: repoName, owner, description, readme});
      });
    } catch (e) {
      sendResponse(null);
    }
    return true; // Keep the message channel open for async response
  }
});
