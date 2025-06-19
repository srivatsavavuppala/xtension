chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractRepoInfo') {
    try {
      // Extract basic repo info
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
      // Fetch README using GitHub API
      if (repoName && owner) {
        fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, {
          headers: { 'Accept': 'application/vnd.github.v3.raw' }
        })
        .then(response => response.ok ? response.text() : '')
        .then(readme => {
          // Then fetch the repository structure
          return fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees/master?recursive=1`)
            .then(response => response.json())
            .then(data => {
              // Filter and organize file structure
              const files = data.tree
                .filter(item => !item.path.includes('node_modules/') && !item.path.includes('.git/'))
                .map(item => ({
                  path: item.path,
                  type: item.type, // 'blob' for files, 'tree' for directories
                  size: item.size
                }));

              // Send all information back
              sendResponse({
                repo: repoName,
                owner,
                description,
                readme,
                structure: files
              });
            });
        });
      } else {
        sendResponse(null);
      }
    } catch (e) {
      console.error('Error extracting repo info:', e);
      sendResponse(null);
    }
    return true; // Keep the message channel open for async response
  }
});
