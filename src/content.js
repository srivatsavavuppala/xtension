/**
 * GitHub Repository Information Extractor
 * Enhanced content script with better error handling and page detection
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractRepoInfo') {
    try {
      console.log('[Content Script] Starting repository info extraction');
      
      // Validate we're on GitHub
      if (!window.location.hostname.includes('github.com')) {
        console.warn('[Content Script] Not on GitHub domain');
        sendResponse(null);
        return true;
      }

      const repoInfo = extractRepositoryInfo();
      
      if (repoInfo && repoInfo.repo && repoInfo.owner) {
        console.log('[Content Script] Successfully extracted repo info:', repoInfo);
        sendResponse(repoInfo);
      } else {
        console.warn('[Content Script] Could not extract complete repo info');
        sendResponse(null);
      }
    } catch (error) {
      console.error('[Content Script] Error extracting repo info:', error);
      sendResponse(null);
    }
    return true;
  }
});

/**
 * Extract repository information from GitHub page
 * @returns {Object|null} Repository information or null if extraction fails
 */
function extractRepositoryInfo() {
  let repoName = '';
  let owner = '';
  let description = '';
  
  // Method 1: Try GitHub's structured data selectors (most reliable)
  const structuredSelectors = [
    // New GitHub layout
    '[data-testid="AppHeader-context-item-label"]',
    'h1[class*="public"] strong a',
    'h1 strong a[data-pjax="#repo-content-pjax-container"]',
    // Legacy selectors
    'strong.mr-2.flex-self-stretch a',
    'strong[itemprop="name"] a',
    '.js-repo-nav-container strong a'
  ];
  
  for (const selector of structuredSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      repoName = element.textContent.trim();
      console.log('[Content Script] Found repo name via selector:', selector, repoName);
      break;
    }
  }
  
  // Extract owner from various selectors
  const ownerSelectors = [
    'span.author a',
    'span[itemprop="author"] a',
    '[data-testid="AppHeader-context-item-label"]',
    '.AppHeader-context-item-label',
    'h1 span.author a'
  ];
  
  for (const selector of ownerSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      owner = element.textContent.trim();
      console.log('[Content Script] Found owner via selector:', selector, owner);
      break;
    }
  }
  
  // Method 2: Parse from URL as fallback
  if (!repoName || !owner) {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      owner = owner || pathParts[0];
      repoName = repoName || pathParts[1];
      console.log('[Content Script] Extracted from URL path:', { owner, repoName });
    }
  }
  
  // Method 3: Try Open Graph meta tags
  if (!repoName || !owner) {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && ogTitle.content) {
      const match = ogTitle.content.match(/^GitHub - ([^\/]+)\/([^:]+)/);
      if (match) {
        owner = owner || match[1];
        repoName = repoName || match[2];
        console.log('[Content Script] Extracted from OG title:', { owner, repoName });
      }
    }
  }
  
  // Extract description with multiple fallbacks
  const descriptionSelectors = [
    'p[data-testid="repo-description"]',
    'p.f4.my-3',
    '.repository-content .f4',
    '[itemprop="about"]',
    '.BorderGrid-cell p.f4'
  ];
  
  for (const selector of descriptionSelectors) {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      description = element.textContent.trim();
      console.log('[Content Script] Found description via selector:', selector);
      break;
    }
  }
  
  // Fallback: try meta description
  if (!description) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && metaDesc.content) {
      // Clean up GitHub's meta description format
      description = metaDesc.content
        .replace(/^GitHub - [^:]+: /, '')
        .replace(/\. Contribute to .+$/, '')
        .trim();
      console.log('[Content Script] Found description via meta tag');
    }
  }
  
  // Validate extracted data
  if (!repoName || !owner) {
    console.warn('[Content Script] Missing required fields:', { repoName, owner });
    return null;
  }
  
  // Clean up extracted data
  repoName = sanitizeString(repoName);
  owner = sanitizeString(owner);
  description = sanitizeString(description);
  
  // Validate repository name format (basic GitHub validation)
  if (!isValidGitHubName(owner) || !isValidGitHubName(repoName)) {
    console.warn('[Content Script] Invalid GitHub name format:', { owner, repoName });
    return null;
  }
  
  const result = {
    repo: repoName,
    owner: owner,
    description: description || 'No description available',
    url: `https://github.com/${owner}/${repoName}`,
    extractedAt: Date.now()
  };
  
  console.log('[Content Script] Final extracted info:', result);
  return result;
}

/**
 * Sanitize extracted strings
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\r\n\t]/g, ' ')
    .substring(0, 200); // Reasonable length limit
}

/**
 * Validate GitHub username/repository name format
 * @param {string} name - Name to validate
 * @returns {boolean} True if valid
 */
function isValidGitHubName(name) {
  if (!name || typeof name !== 'string') return false;
  
  // GitHub username/repo name rules (simplified)
  const pattern = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;
  return pattern.test(name) && name.length >= 1 && name.length <= 100;
}

/**
 * Check if current page is a valid GitHub repository page
 * @returns {boolean} True if valid repo page
 */
function isValidRepositoryPage() {
  const pathname = window.location.pathname;
  const pathParts = pathname.split('/').filter(Boolean);
  
  // Must have at least owner/repo
  if (pathParts.length < 2) return false;
  
  // Exclude GitHub pages that aren't repositories
  const excludedPaths = [
    'settings', 'notifications', 'pulls', 'issues', 
    'marketplace', 'explore', 'topics', 'collections',
    'orgs', 'enterprises', 'sponsors', 'about'
  ];
  
  return !excludedPaths.includes(pathParts[0]);
}

// Log when content script loads
console.log('[Content Script] GitHub Repository Extractor loaded on:', window.location.href);
