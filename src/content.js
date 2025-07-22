chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
