// Add CSS variables for light/dark theme to :root and .dark-theme
(function addThemeVars() {
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --popup-bg: #fff;
      --popup-text: #23272e;
      --modal-bg: #fff;
      --modal-text: #23272e;
      --modal-border: #e2e8f0;
      --modal-title: #374151;
      --modal-close: #64748b;
      --modal-hover: #f1f5f9;
      --history-item-bg: #fff;
      --history-item-border: #e2e8f0;
      --history-item-text: #23272e;
      --summary-text: #23272e;
      --summary-bg: #f1f5f9;
      --empty-title: #374151;
      --empty-desc: #64748b;
      --tab-active-bg: #fff;
      --tab-active-color: #667eea;
      --tab-inactive-bg: transparent;
      --tab-inactive-color: #64748b;
    }
    body.dark-theme {
      --popup-bg: #18181b;
      --popup-text: #f1f5f9;
      --modal-bg: #23232a;
      --modal-text: #f1f5f9;
      --modal-border: #27272a;
      --modal-title: #f1f5f9;
      --modal-close: #a3a3a3;
      --modal-hover: #23232a;
      --history-item-bg: #23232a;
      --history-item-border: #27272a;
      --history-item-text: #f1f5f9;
      --summary-text: #f1f5f9;
      --summary-bg: #23232a;
      --empty-title: #f1f5f9;
      --empty-desc: #a3a3a3;
      --tab-active-bg: #23232a;
      --tab-active-color: #a3e635;
      --tab-inactive-bg: transparent;
      --tab-inactive-color: #a3a3a3;
    }
  `;
  document.head.appendChild(style);
})();
// Inject theme CSS at the very top
const themeStyle = document.createElement('style');
themeStyle.textContent = `
body {
  background: var(--popup-bg) !important;
  color: var(--popup-text) !important;
}
.history-modal, .analyzed-btn-row, .favorite-btn, .remove-fav-btn {
  background: var(--modal-bg) !important;
  color: var(--modal-text) !important;
  border-color: var(--modal-border) !important;
}
.status-indicator.success { color: #059669; }
.status-indicator.error { color: #dc2626; }
.status-indicator.loading { color: #f59e42; }
.status-indicator.info { color: #2563eb; }
button, .tab-btn, .favorite-btn {
  background: #f1f5f9 !important;
  color: #23272e !important;
  border-color: #e2e8f0 !important;
}
input, textarea {
  background: #fff !important;
  color: #23272e !important;
  border-color: #e2e8f0 !important;
}
.history-modal {
  box-shadow: 0 8px 40px rgba(0,0,0,0.12) !important;
}
.analyzed-btn-row button {
  background: #10b981 !important;
  color: #fff !important;
}
.favorite-btn {
  background: #fffbe7 !important;
  color: #f59e0b !important;
}
.remove-fav-btn {
  color: #ef4444 !important;
}
.tab-btn[aria-selected="true"] {
  background: #e0e7ff !important;
  color: #3730a3 !important;
}
#summary {
  background: var(--summary-bg) !important;
  color: var(--summary-text) !important;
  border-color: #e2e8f0 !important;
}

body.dark-theme, body.dark-theme #popup {
  background: var(--popup-bg) !important;
  color: var(--popup-text) !important;
}

body.dark-theme #main {
  background: rgba(35, 35, 42, 0.95) !important;
  color: #f1f5f9 !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
}

body.dark-theme h2 {
  background: linear-gradient(135deg, #a3e635 0%, #84cc16 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

body.dark-theme .subtitle {
  color: #a3a3a3 !important;
}

body.dark-theme button {
  background: linear-gradient(135deg, #334155 0%, #1e293b 100%) !important;
  color: #f1f5f9 !important;
}

body.dark-theme #theme-toggle,
body.dark-theme #history-icon {
  background: transparent !important;
  border: none !important;
  color: #f1f5f9 !important;
  box-shadow: none !important;
}

body.dark-theme #theme-toggle:hover,
body.dark-theme #history-icon:hover {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* Light theme icon styling */
body:not(.dark-theme) #theme-toggle,
body:not(.dark-theme) #history-icon {
  background: transparent !important;
  border: none !important;
  color: #374151 !important;
  box-shadow: none !important;
}

body:not(.dark-theme) #theme-toggle:hover,
body:not(.dark-theme) #history-icon:hover {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

body.dark-theme .history-modal, body.dark-theme .analyzed-btn-row, body.dark-theme .favorite-btn, body.dark-theme .remove-fav-btn {
  background: var(--modal-bg) !important;
  color: var(--modal-text) !important;
  border-color: var(--modal-border) !important;
}
body.dark-theme .status-indicator.success { color: #22d3ee; }
body.dark-theme .status-indicator.error { color: #f87171; }
body.dark-theme .status-indicator.loading { color: #fbbf24; }
body.dark-theme .status-indicator.info { color: #a3e635; }
body.dark-theme button, body.dark-theme .tab-btn, body.dark-theme .favorite-btn {
  background: #23232a !important;
  color: #f1f5f9 !important;
  border-color: #27272a !important;
}
body.dark-theme input, body.dark-theme textarea {
  background: #23232a !important;
  color: #f1f5f9 !important;
  border-color: #27272a !important;
}
body.dark-theme .history-modal {
  box-shadow: 0 8px 40px rgba(0,0,0,0.45) !important;
}
body.dark-theme .analyzed-btn-row button {
  background: #334155 !important;
  color: #f1f5f9 !important;
}
body.dark-theme .favorite-btn {
  background: #23232a !important;
  color: #fbbf24 !important;
}
body.dark-theme .remove-fav-btn {
  color: #f87171 !important;
}
body.dark-theme .tab-btn[aria-selected="true"] {
  background: #18181b !important;
  color: #a3e635 !important;
}
body.dark-theme #summary {
  background: #23232a !important;
  color: #f1f5f9 !important;
  border-color: #27272a !important;
}
`;
document.head.appendChild(themeStyle);
document.addEventListener('DOMContentLoaded', function() {
// THEME TOGGLE UI - Original positioning with improved animations
const themeToggle = document.createElement('button');
themeToggle.id = 'theme-toggle';
themeToggle.innerHTML = '🌙'; // Default to moon icon for light mode
themeToggle.setAttribute('aria-label', 'Toggle dark/light mode');
themeToggle.style.cssText = [
  'position: absolute',
  'top: 8px',
  'left: 8px',
  'z-index: 10001',
  'width: 32px',
  'height: 32px',
  'display: flex',
  'align-items: center',
  'justify-content: center',
  'font-size: 18px',
  'background: transparent',
  'border: none',
  'border-radius: 0',
  'cursor: pointer',
  'transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  'box-shadow: none',
  'color: #374151',
  'overflow: hidden'
].join(';') + ';'

// Theme toggle functionality with smooth animations
function setTheme(isDark) {
  if (isDark) {
    document.body.classList.add('dark-theme');
    // Animate sun icon appearance
    themeToggle.style.transform = 'scale(0.8) rotate(180deg)';
    setTimeout(() => {
      themeToggle.innerHTML = '☀️';
      themeToggle.style.transform = 'scale(1) rotate(0deg)';
    }, 150);
    themeToggle.style.background = 'transparent';
    themeToggle.style.border = 'none';
    themeToggle.style.color = '#f1f5f9';
  } else {
    document.body.classList.remove('dark-theme');
    // Animate moon icon appearance
    themeToggle.style.transform = 'scale(0.8) rotate(-180deg)';
    setTimeout(() => {
      themeToggle.innerHTML = '🌙';
      themeToggle.style.transform = 'scale(1) rotate(0deg)';
    }, 150);
    themeToggle.style.background = 'transparent';
    themeToggle.style.border = 'none';
    themeToggle.style.color = '#374151';
  }
  
  // Ensure transform is reset after animation completes
  setTimeout(() => {
    if (!themeToggle.classList.contains('animating')) {
      themeToggle.style.transform = '';
    }
  }, 300);
}

// Enhanced click handler with animation
themeToggle.onclick = () => {
  // Prevent multiple rapid clicks
  if (themeToggle.classList.contains('animating')) return;
  
  themeToggle.classList.add('animating');
  const isDark = !document.body.classList.contains('dark-theme');
  
  // Add click animation
  themeToggle.style.transform = 'scale(0.9)';
  
  setTimeout(() => {
    setTheme(isDark);
    chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
    
    // Remove animation class after transition
    setTimeout(() => {
      themeToggle.classList.remove('animating');
      // Reset transform to prevent accumulation
      themeToggle.style.transform = '';
    }, 300);
  }, 100);
};

// Enhanced hover effects
themeToggle.onmouseover = function() {
  if (!themeToggle.classList.contains('animating')) {
    themeToggle.style.transform = 'scale(1.1)';
    themeToggle.style.boxShadow = 'none';
  }
};

themeToggle.onmouseout = function() {
  if (!themeToggle.classList.contains('animating')) {
    themeToggle.style.transform = 'scale(1)';
    themeToggle.style.boxShadow = 'none';
  }
};

// Add a safeguard to reset transforms if they get corrupted
function resetThemeToggleTransform() {
  if (themeToggle && !themeToggle.classList.contains('animating')) {
    themeToggle.style.transform = '';
  }
}

// Reset transform on window focus to prevent stuck states
window.addEventListener('focus', resetThemeToggleTransform);

// Add CSS animations for the theme toggle
const themeToggleStyle = document.createElement('style');
themeToggleStyle.textContent = `
  #theme-toggle {
    position: absolute !important;
    top: 8px !important;
    left: 8px !important;
    z-index: 10001 !important;
    transform-origin: center !important;
    will-change: transform !important;
  }
  
  #theme-toggle.animating {
    pointer-events: none;
  }
  
  #theme-toggle {
    font-size: 18px !important;
    line-height: 1 !important;
    text-align: center !important;
    vertical-align: middle !important;
  }
  
  /* Ensure emojis are always visible */
  #theme-toggle::before {
    display: none !important;
  }
  
  @keyframes iconSlideUp {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    50% { transform: translateY(-20px) scale(0.8); opacity: 0.5; }
    100% { transform: translateY(-40px) scale(0.6); opacity: 0; }
  }
  
  @keyframes iconSlideDown {
    0% { transform: translateY(-40px) scale(0.6); opacity: 0; }
    50% { transform: translateY(-20px) scale(0.8); opacity: 0.5; }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }
  
  #theme-toggle.animating::before {
    content: attr(data-icon);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    animation: iconSlideUp 0.3s ease-out forwards;
  }
  
  /* Prevent positioning glitches */
  #theme-toggle, #history-icon {
    backface-visibility: hidden !important;
    -webkit-backface-visibility: hidden !important;
    perspective: 1000px !important;
    -webkit-perspective: 1000px !important;
  }
`;

document.head.appendChild(themeToggleStyle);
document.body.appendChild(themeToggle);

// Load saved theme
chrome.storage.local.get({ theme: 'light' }, (result) => {
  setTheme(result.theme === 'dark');
});

// Theme toggle positioning is now handled by CSS
  const summarizeBtn = document.getElementById('summarizeBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const summaryDiv = document.getElementById('summary');
  const historyIcon = document.getElementById('history-icon');
  if (historyIcon) {
  const updateHistoryIconTheme = () => {
    if (document.body.classList.contains('dark-theme')) {
      historyIcon.style.color = '#f1f5f9';
    } else {
      historyIcon.style.color = '#374151';
    }
  };
  
  
  // Add observer for theme changes
  const observer = new MutationObserver(updateHistoryIconTheme);
  observer.observe(document.body, { 
    attributes: true, 
    attributeFilter: ['class'] 
  });
  
  // Enhanced hover effects for history icon
  historyIcon.onmouseover = function() {
    historyIcon.style.transform = 'scale(1.1)';
    historyIcon.style.boxShadow = 'none';
  };
  
  historyIcon.onmouseout = function() {
    historyIcon.style.transform = 'scale(1)';
    historyIcon.style.boxShadow = 'none';
  };
  
  historyIcon.onclick = function() {
    // Add click animation
    historyIcon.style.transform = 'scale(0.95)';
    setTimeout(() => {
      historyIcon.style.transform = 'scale(1)';
    }, 150);
  };
}
  let projectPaper = '';
  let historyOverlay = null;
  let currentTab = 'analyzed';

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currentUrl = tabs[0].url;
    if (!currentUrl.includes('github.com')) {
      showGitHubError();
      summarizeBtn.disabled = true;
    }
  });

  function fetchWithTimeout(resource, options = {}, timeout = 20000) {
    return Promise.race([
      fetch(resource, options),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), timeout))
    ]);
  }

  chrome.storage.local.get(['summaryStatus', 'summaryResult', 'summaryTab'], (result) => {
    if (result.summaryStatus === 'pending') {
      showMessage('Extracting repository information...', 'loading');
      setLoadingState(true);
      downloadBtn.style.display = 'none';
    } else if (result.summaryStatus === 'done' && result.summaryResult) {
      showMessage(result.summaryResult.summary, 'success');
      projectPaper = result.summaryResult.project_paper;
      downloadBtn.style.display = 'block';
      clearSessionBtn.style.display = 'block';
      downloadBtn.style.background = '#10b981';
      downloadBtn.style.color = 'white';
      downloadBtn.style.border = 'none';
      downloadBtn.style.boxShadow = 'none';
      downloadBtn.style.opacity = '1';
      downloadBtn.style.transform = 'translateY(0)';
      setLoadingState(false);
    } else {
      // Hide and reset download button if not available
      downloadBtn.style.display = 'none';
      downloadBtn.style.background = '';
      downloadBtn.style.color = '';
      downloadBtn.style.border = '';
      downloadBtn.style.boxShadow = '';
      downloadBtn.style.opacity = '';
      downloadBtn.style.transform = '';
    }
  });

  summarizeBtn.addEventListener('click', async () => {
    try {
      setLoadingState(true);
      showMessage('Extracting repository information...', 'loading');
      chrome.storage.local.set({ summaryStatus: 'pending', summaryResult: null });
      console.log('[Xtension] Extraction started. Querying active tab for repo info...');
      let stillWorkingTimeout = null;
      chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
        try {
          trackVisitedRepo(tabs[0].url);
          const sendMessageWithTimeout = (tabId, message, timeout = 30000) => {
            return new Promise((resolve, reject) => {
              let didRespond = false;
              const timer = setTimeout(() => {
                if (!didRespond) {
                  didRespond = true;
                  console.error('[Xtension] Extraction timed out.');
                  setLoadingState(false);
                  showTimeoutError();
                  chrome.storage.local.set({ summaryStatus: 'error', summaryResult: null });
                  reject(new Error('Timed out extracting repository information. The repository may be too large or the page is not supported.'));
                }
              }, timeout);
              chrome.tabs.sendMessage(tabId, message, (response) => {
                if (!didRespond) {
                  clearTimeout(timer);
                  didRespond = true;
                  console.log('[Xtension] Extraction response received:', response);
                  resolve(response);
                }
              });
            });
          };

          let repoInfo;
          try {
            repoInfo = await sendMessageWithTimeout(tabs[0].id, {action: 'extractRepoInfo'}, 30000);
            console.log('[Xtension] Repo info extracted:', repoInfo);
          } catch (timeoutErr) {
            return;
          }
          if (!repoInfo) {
            setLoadingState(false);
            showMessage('Could not extract repository information. Please make sure you\'re on a GitHub repository page.', 'error', 'extraction-error');
            chrome.storage.local.set({ summaryStatus: 'error', summaryResult: null });
            return;
          }
          showMessage('Generating AI summary...', 'loading');
          console.log('[Xtension] Sending repo info to backend:', repoInfo);
          stillWorkingTimeout = setTimeout(() => {
            showMessage('Still working... Large repositories may take up to 30 seconds. Please wait.', 'loading');
            console.log('[Xtension] Still working... waiting for backend response.');
          }, 20000);
          try {
            const response = await fetchWithTimeout('https://xtension-git-main-srivatsavavuppalas-projects.vercel.app/api/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(repoInfo)
            }, 30000);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.error) {
              throw new Error(data.error);
            }
            clearTimeout(stillWorkingTimeout);
            setLoadingState(false);
            showMessage(data.summary, 'success');
            projectPaper = data.project_paper;
            downloadBtn.style.display = 'block';
            clearSessionBtn.style.display = 'block';
            chrome.storage.local.set({ summaryStatus: 'done', summaryResult: data, summaryTab: tabs[0].url });
            const now = Date.now();
            const historyItem = {
              url: tabs[0].url,
              owner: repoInfo.owner,
              repo: repoInfo.repo,
              description: repoInfo.description,
              summary: data.summary,
              timestamp: now,
              projectPaper: data.project_paper
            };
            saveToAnalyzedHistory(historyItem);
            setTimeout(() => {
              downloadBtn.style.opacity = '1';
              downloadBtn.style.transform = 'translateY(0)';
            }, 100);
            console.log('[Xtension] Summarization complete.');
          } catch (fetchError) {
            clearTimeout(stillWorkingTimeout);
            setLoadingState(false);
            showMessage(`Error generating summary: ${fetchError.message}. Please try again later or contact support if the problem persists.`, 'error', 'api-error');
            chrome.storage.local.set({ summaryStatus: 'error', summaryResult: null });
            console.error('[Xtension] Summarization error:', fetchError);
          }
        } catch (tabError) {
          clearTimeout(stillWorkingTimeout);
          setLoadingState(false);
          showMessage('Error accessing the current tab. Please refresh the page and try again.', 'error', 'extraction-error');
          chrome.storage.local.set({ summaryStatus: 'error', summaryResult: null });
          console.error('[Xtension] Tab access error:', tabError);
        }
      });
    } catch (error) {
      setLoadingState(false);
      showMessage(`Unexpected error: ${error.message}`, 'error');
      chrome.storage.local.set({ summaryStatus: 'error', summaryResult: null });
      console.error('[Xtension] Unexpected error:', error);
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!projectPaper) {
      showMessage('No project report available to download.', 'error');
      return;
    }
    try {
      const blob = new Blob([projectPaper], {type: 'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'github_project_report.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      const originalText = downloadBtn.innerHTML;
      downloadBtn.innerHTML = '✅ Downloaded!';
      downloadBtn.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
      setTimeout(() => {
        downloadBtn.innerHTML = originalText;
        downloadBtn.style.background = '';
      }, 2000);
    } catch (error) {
      showMessage('Error downloading file: ' + error.message, 'error');
    }
  });
  const clearSessionBtn = document.getElementById('clearSessionBtn');

  clearSessionBtn.addEventListener('click', () => {
    chrome.storage.local.remove(['summaryStatus', 'summaryResult', 'summaryTab'], () => {
      showMessage('Session cleared. You can generate a new summary now.', 'info');
      downloadBtn.style.display = 'none';
      clearSessionBtn.style.display = 'none';
    });
  });
  function trackVisitedRepo(url) {
    if (!url.includes('github.com')) return;
    const match = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return;
    const owner = match[1];
    const repo = match[2];
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const visitedItem = {
      url,
      owner,
      repo,
      timestamp: now,
      visitCount: 1
    };
    chrome.storage.local.get({ visitedRepos: [] }, (result) => {
      let visited = result.visitedRepos;
      const existingIndex = visited.findIndex(item => item.url === url);
      if (existingIndex !== -1) {
        visited[existingIndex].timestamp = now;
        visited[existingIndex].visitCount++;
      } else {
        visited.unshift(visitedItem);
      }
      visited = visited.filter(item => (now - item.timestamp) < oneWeek);
      visited = visited.slice(0, 50);
      chrome.storage.local.set({ visitedRepos: visited });
    });
  }

  function saveToAnalyzedHistory(historyItem) {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    chrome.storage.local.get({ analyzedHistory: [] }, (result) => {
      let history = result.analyzedHistory;
      history = history.filter(item => item.url !== historyItem.url && (now - item.timestamp) < oneDay);
      history.unshift(historyItem);
      const limited = history.slice(0, 20);
      chrome.storage.local.set({ analyzedHistory: limited });
    });
  }

  function showHistoryOverlay() {
    if (historyOverlay) return;
    historyOverlay = document.createElement('div');
    historyOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.6);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 20px;
      box-sizing: border-box;
      backdrop-filter: blur(4px);
      animation: fadeIn 0.3s ease-out;
    `;
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: var(--modal-bg);
      border-radius: 18px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      width: 380px;
      max-width: 98vw;
      margin-top: 40px;
      animation: slideUp 0.3s ease-out;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      color: var(--modal-text);
      border: 1px solid var(--modal-border);
    `;
    modal.className = 'history-modal';
    const header = document.createElement('div');
header.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 18px 24px 0 24px;';
const title = document.createElement('div');
title.textContent = 'Repo History ⏳';
title.style.cssText = 'font-size: 15px; font-weight: 600; color: var(--modal-title); max-width: 160px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
const closeBtn = document.createElement('button');
closeBtn.innerHTML = '✖';
closeBtn.setAttribute('aria-label', 'Close');
closeBtn.style.cssText = 'width: 32px; height: 32px; min-width: 32px; min-height: 32px; max-width: 32px; max-height: 32px; display: flex; align-items: center; justify-content: center; background: none; border: none; font-size: 18px; color: var(--modal-close); cursor: pointer; border-radius: 6px; transition: background 0.2s; margin-left: 8px;';
closeBtn.onmouseover = () => { closeBtn.style.background = 'var(--modal-hover)'; };
closeBtn.onmouseout = () => { closeBtn.style.background = 'none'; };
header.appendChild(title);
header.appendChild(closeBtn);
modal.appendChild(header);
    const tabContainer = document.createElement('div');
    tabContainer.style.cssText = 'display: flex; border-bottom: 1px solid #e2e8f0; margin: 18px 0 0 0; z-index: 10002;';
    const tabs = [
      { id: 'analyzed', label: '📊 Analyzed' },
      { id: 'visited', label: '🔗 Visited' },
      { id: 'favorites', label: '❤️ Favorites' }
    ];
    tabs.forEach(tab => {
      const tabBtn = document.createElement('button');
      tabBtn.innerHTML = '<span style="margin-right: 8px;">' + tab.label.split(' ')[0] + '</span> ' + tab.label.split(' ')[1];
      tabBtn.style.cssText =
        'flex: 1;' +
        'padding: 16px 20px;' +
        'border: none;' +
        'background: ' + (currentTab === tab.id ? 'var(--tab-active-bg)' : 'var(--tab-inactive-bg)') + ';' +
        'color: ' + (currentTab === tab.id ? 'var(--tab-active-color)' : 'var(--tab-inactive-color)') + ';' +
        'font-weight: ' + (currentTab === tab.id ? '600' : '500') + ';' +
        'font-size: 14px;' +
        'cursor: pointer;' +
        'transition: all 0.2s ease;' +
        'border-bottom: 3px solid ' + (currentTab === tab.id ? 'var(--tab-active-color)' : 'transparent') + ';' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;';
      tabBtn.onmouseover = () => {
        if (currentTab !== tab.id) {
          tabBtn.style.background = '#f1f5f9';
        }
      };
      tabBtn.onmouseout = () => {
        if (currentTab !== tab.id) {
          tabBtn.style.background = 'transparent';
        }
      };
      tabBtn.onclick = () => {
        currentTab = tab.id;
        loadHistoryContent();
        updateTabStyles();
      };
      tabContainer.appendChild(tabBtn);
    });
    modal.appendChild(tabContainer);
    const contentContainer = document.createElement('div');
    contentContainer.id = 'history-content';
    modal.appendChild(contentContainer);
    function updateTabStyles() {
      const tabButtons = tabContainer.querySelectorAll('button');
      tabButtons.forEach(function(btn, index) {
        var isActive = tabs[index].id === currentTab;
        btn.style.background = isActive ? '#fff' : 'transparent';
        btn.style.color = isActive ? '#667eea' : '#64748b';
        btn.style.fontWeight = isActive ? '600' : '500';
        btn.style.borderBottom = '3px solid ' + (isActive ? '#667eea' : 'transparent');
      });
    }
    historyOverlay.appendChild(modal);
    document.body.appendChild(historyOverlay);
    // Hide theme toggle and history icon when history modal is open
    if (document.getElementById('theme-toggle')) {
      document.getElementById('theme-toggle').style.display = 'none';
    }
    if (document.getElementById('history-icon')) {
      document.getElementById('history-icon').style.display = 'none';
    }
    
    // Add CSS to ensure proper hiding
    const hideIconsStyle = document.createElement('style');
    hideIconsStyle.textContent = `
      .history-modal-open #theme-toggle,
      .history-modal-open #history-icon {
        display: none !important;
      }
    `;
    document.head.appendChild(hideIconsStyle);
    document.body.classList.add('history-modal-open');
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    closeBtn.onclick = closeHistoryOverlay;
    historyOverlay.onclick = (e) => {
      if (e.target === historyOverlay) {
        closeHistoryOverlay();
      }
    };
    loadHistoryContent();
  }

  function closeHistoryOverlay() {
    if (historyOverlay) {
      historyOverlay.style.animation = 'fadeOut 0.2s ease-out forwards';
      const modal = historyOverlay.querySelector('div');
      modal.style.animation = 'slideDown 0.2s ease-out forwards';
      const style = document.createElement('style');
      style.textContent = `
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes slideDown {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(30px); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
      setTimeout(() => {
        historyOverlay.remove();
        historyOverlay = null;
        document.head.removeChild(style);
                 // Show theme toggle and history icon again
         document.body.classList.remove('history-modal-open');
         if (document.getElementById('theme-toggle')) {
           document.getElementById('theme-toggle').style.display = '';
           document.getElementById('theme-toggle').style.transform = '';
         }
         if (document.getElementById('history-icon')) {
           document.getElementById('history-icon').style.display = '';
           document.getElementById('history-icon').style.transform = '';
         }
         
         // Ensure main container is properly positioned
         const mainContainer = document.getElementById('main');
         if (mainContainer) {
           mainContainer.style.transform = '';
           mainContainer.style.left = '';
           mainContainer.style.right = '';
         }
      }, 200);
    }
  }

  function loadHistoryContent() {
    const container = document.getElementById('history-content');
    if (!container) return;
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: #64748b;">Loading...</div>';
    if (currentTab === 'analyzed') {
      loadAnalyzedHistory(container);
    } else if (currentTab === 'visited') {
      loadVisitedHistory(container);
    } else if (currentTab === 'favorites') {
      loadFavoritesHistory(container);
    }
  }

  function loadAnalyzedHistory(container) {
    chrome.storage.local.get({ analyzedHistory: [] }, (result) => {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const history = result.analyzedHistory.filter(item => (now - item.timestamp) < oneDay);
      if (history.length === 0) {
        container.innerHTML = createEmptyState('📊', 'No analyzed repositories', 'Analyze some repositories to see them here!');
      } else {
        container.innerHTML = '';
        history.forEach((item, index) => {
          const historyItem = createAnalyzedHistoryItem(item, index);
          container.appendChild(historyItem);
        });
      }
    });
  }

  function loadVisitedHistory(container) {
    chrome.storage.local.get({ visitedRepos: [] }, (result) => {
      const visited = result.visitedRepos;
      if (visited.length === 0) {
        container.innerHTML = createEmptyState('🔗', 'No visited repositories', 'Browse GitHub repositories to see them here!');
      } else {
        container.innerHTML = '';
        visited.forEach((item, index) => {
          const historyItem = createVisitedHistoryItem(item, index);
          container.appendChild(historyItem);
        });
      }
    });
  }

  function loadFavoritesHistory(container) {
    chrome.storage.local.get({ favoriteRepos: [] }, (result) => {
      const favorites = result.favoriteRepos || [];
      if (favorites.length === 0) {
        container.innerHTML = createEmptyState('❤️', 'No favorite repositories', 'Star repositories to add them to favorites!');
      } else {
        container.innerHTML = '';
        favorites.forEach((item, index) => {
          const historyItem = createFavoriteHistoryItem(item, index);
          container.appendChild(historyItem);
        });
      }
    });
  }

  function createEmptyState(icon, title, description) {
    return `
      <div style="text-align: center; padding: 60px 20px; color: var(--empty-desc);">
        <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.6;">${icon}</div>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: var(--empty-title);">${title}</div>
        <div style="font-size: 14px; line-height: 1.5; color: var(--empty-desc);">${description}</div>
      </div>
    `;
  }

  function createAnalyzedHistoryItem(item, index) {
  const itemDiv = document.createElement('div');
  itemDiv.style.cssText = `
    background: var(--history-item-bg);
    margin: 12px 12px;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid var(--history-item-border);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
    color: var(--history-item-text);
  `;

  itemDiv.onmouseover = () => {
    itemDiv.style.transform = 'translateY(-2px)';
    itemDiv.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
    itemDiv.style.borderColor = '#667eea';
  };
  itemDiv.onmouseout = () => {
    itemDiv.style.transform = 'translateY(0)';
    itemDiv.style.boxShadow = 'none';
    itemDiv.style.borderColor = '#e2e8f0';
  };

  let isFavorite = false;
  try {
    const favs = JSON.parse(localStorage.getItem('favoriteRepos') || '[]');
    isFavorite = favs.some(f => f.url === item.url);
  } catch {}

  itemDiv.innerHTML = `
    <div style="margin-bottom: 12px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center;">
          <img src="../icons/icon16.png" alt="Repo" style="width:18px; height:18px; margin-right: 10px; border-radius: 4px;">
          <a href="${item.url}" target="_blank" style="font-weight: 700; color: var(--modal-title); text-decoration: none; font-size: 12px;">
            ${item.owner}/${item.repo}
          </a>
        </div>
        <span style="color: var(--empty-desc); font-size: 11px; background: var(--summary-bg); padding: 3px 7px; border-radius: 6px; white-space: nowrap;">
          ${formatTimestamp(item.timestamp)}
        </span>
      </div>
      <div style="color: var(--empty-desc); font-size: 14px; margin-bottom: 12px; line-height: 1.4;">
        ${item.description || 'No description available'}
      </div>
      <div style="color: var(--modal-title); font-size: 14px; line-height: 1.5; background: var(--summary-bg); padding: 12px; border-radius: 8px; border-left: 3px solid #667eea;">
        ${item.summary ? (item.summary.length > 120 ? item.summary.substring(0, 120) + '...' : item.summary) : 'No summary available'}
      </div>
      <div class="analyzed-btn-row" style="display: flex; gap: 8px; margin-top: 12px;"></div>
    </div>
  `;

  const btnRow = itemDiv.querySelector('.analyzed-btn-row');
  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = '📄 Download Report';
  downloadBtn.style.cssText = 'background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;';
  downloadBtn.onclick = (e) => {
    e.stopPropagation();
    window.downloadReport(item.url);
  };
  btnRow.appendChild(downloadBtn);

const favBtn = document.createElement('button');
favBtn.className = 'favorite-btn';
favBtn.style.cssText = 'background: none; color: #f59e0b; border: none; padding: 6px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 4px;';
favBtn.innerHTML = '<span class="fav-star" style="font-size: 15px;">☆</span> <span>Add to Favorites</span>';

chrome.storage.local.get({ favoriteRepos: [] }, (result) => {
  const favs = result.favoriteRepos || [];
  const exists = favs.some(f => f.url === item.url);
  if (exists) {
    favBtn.innerHTML = '<span class="fav-star" style="font-size: 15px; color: #f59e0b;">★</span> <span>Favorited</span>';
    favBtn.style.background = 'rgba(245, 158, 11, 0.08)';
  } else {
    favBtn.innerHTML = '<span class="fav-star" style="font-size: 15px;">☆</span> <span>Add to Favorites</span>';
    favBtn.style.background = 'none';
  }
  // Add dark theme CSS
  const darkStyle = document.createElement('style');
  darkStyle.textContent = `
    body.dark-theme {
      background: #18181b !important;
      color: #f1f5f9 !important;
    }
    body.dark-theme #popup, body.dark-theme .history-modal, body.dark-theme .analyzed-btn-row, body.dark-theme .favorite-btn, body.dark-theme .remove-fav-btn {
      background: #23232a !important;
      color: #f1f5f9 !important;
      border-color: #27272a !important;
    }
    body.dark-theme .status-indicator.success { color: #22d3ee; }
    body.dark-theme .status-indicator.error { color: #f87171; }
    body.dark-theme .status-indicator.loading { color: #fbbf24; }
    body.dark-theme .status-indicator.info { color: #a3e635; }
    body.dark-theme button, body.dark-theme .tab-btn, body.dark-theme .favorite-btn {
    
      color: #f1f5f9 !important;
      border-color: #27272a !important;
    }
    body.dark-theme input, body.dark-theme textarea {
      background: #23232a !important;
      color: #f1f5f9 !important;
      border-color: #27272a !important;
    }
    body.dark-theme .history-modal {
      box-shadow: 0 8px 40px rgba(0,0,0,0.45) !important;
    }
    body.dark-theme .analyzed-btn-row button {
      background: #334155 !important;
      color: #f1f5f9 !important;
    }
    body.dark-theme .favorite-btn {
      background: #23232a !important;
      color: #fbbf24 !important;
    }
    body.dark-theme .remove-fav-btn {
      color: #f87171 !important;
    }
    body.dark-theme .tab-btn[aria-selected="true"] {
      background: #18181b !important;
      color: #a3e635 !important;
    }
    body.dark-theme #summary {
      background: #23232a !important;
      color: #f1f5f9 !important;
      border-color: #27272a !important;
    }
  `;
  document.head.appendChild(darkStyle);
});

favBtn.onclick = (e) => {
  e.stopPropagation();
  chrome.storage.local.get({ favoriteRepos: [] }, (result) => {
    let favs = result.favoriteRepos || [];
    const exists = favs.some(f => f.url === item.url);
    if (exists) {
      favs = favs.filter(f => f.url !== item.url);
      favBtn.innerHTML = '<span class="fav-star" style="font-size: 15px;">☆</span> <span>Add to Favorites</span>';
      favBtn.style.background = 'none';
    } else {
      favs.push({ url: item.url, owner: item.owner, repo: item.repo, timestamp: Date.now() });
     favBtn.innerHTML = '<div style="display: flex; flex-direction: column; align-items: center; width: 100%;"><span class="fav-star" style="font-size: 15px; color: #f59e0b;">★</span><span style="display: block; text-align: center;">Favorited</span></div>';
      favBtn.style.background = 'rgba(245, 158, 11, 0.08)';
    }
    chrome.storage.local.set({ favoriteRepos: favs }, () => {
      if (typeof currentTab !== 'undefined' && currentTab === 'favorites') {
        loadHistoryContent();
      }
    });
  });
};
btnRow.appendChild(favBtn);

  itemDiv.onclick = (e) => {
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
      showMessage(item.summary, 'success');
      closeHistoryOverlay();
    }
  };

  return itemDiv;
}

  function createVisitedHistoryItem(item, index) {
  const itemDiv = document.createElement('div');
  itemDiv.style.cssText = `
    background: var(--history-item-bg);
    margin: 16px 20px;
    border-radius: 14px;
    padding: 16px;
    border: 1px solid var(--history-item-border);
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
    color: var(--history-item-text);
  `;
  itemDiv.onmouseover = () => {
    itemDiv.style.transform = 'translateY(-1px)';
    itemDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
  };
  itemDiv.onmouseout = () => {
    itemDiv.style.transform = 'translateY(0)';
    itemDiv.style.boxShadow = 'none';
  };
  itemDiv.innerHTML = `
  <div style="display: flex; align-items: center; justify-content: space-between; overflow: hidden;">
    <div style="display: flex; align-items: center;">
      <div style="background: var(--empty-desc); color: white; padding: 3px 6px; border-radius: 6px; font-size: 9px; font-weight: 600; margin-right: 10px; white-space: nowrap;">
        🔗${item.visitCount > 1 ? `(${item.visitCount}x)` : ''}
      </div>
      <a href="${item.url}" target="_blank" style="font-weight: 600; color: var(--modal-title); text-decoration: none; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        ${item.repo}
      </a>
    </div>
    <span style="color: var(--empty-desc); font-size: 11px; background: var(--summary-bg); padding: 3px 6px; border-radius: 4px; white-space: nowrap;">
      ${formatTimestamp(item.timestamp)}
    </span>
  </div>
`;
  itemDiv.onclick = () => {
    window.open(item.url, '_blank');
  };
  return itemDiv;
}
function createFavoriteHistoryItem(item, index) {
  const itemDiv = document.createElement('div');
  itemDiv.style.cssText = `
    background: var(--history-item-bg);
    margin: 12px 12px;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid var(--history-item-border);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
    color: var(--history-item-text);
  `;

  itemDiv.onmouseover = () => {
    itemDiv.style.transform = 'translateY(-2px)';
    itemDiv.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
    itemDiv.style.borderColor = '#667eea';
  };
  itemDiv.onmouseout = () => {
    itemDiv.style.transform = 'translateY(0)';
    itemDiv.style.boxShadow = 'none';
    itemDiv.style.borderColor = '#e2e8f0';
  };

  itemDiv.innerHTML = `
    <div style="margin-bottom: 12px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center;">
          <img src="../icons/icon16.png" alt="Repo" style="width:18px; height:18px; margin-right: 10px; border-radius: 4px;">
          <a href="${item.url}" target="_blank" style="font-weight: 700; color: var(--modal-title); text-decoration: none; font-size: 12px;">
            ${item.owner}/${item.repo}
          </a>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: var(--empty-desc); font-size: 13px; background: var(--summary-bg); padding: 3px 7px; border-radius: 6px; white-space: nowrap; font-weight: bold;">
            ★
          </span>
          <button class="remove-fav-btn" title="Remove from Favorites" style="background: none; color: #ef4444; border: none; padding: 0 4px; border-radius: 6px; font-size: 18px; cursor: pointer; line-height: 1;">🗑️</button>
        </div>
      </div>
    </div>
  `;

  const removeBtn = itemDiv.querySelector('.remove-fav-btn');
  if (removeBtn) {
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      window.removeFavorite(item.url);
    };
  }

  itemDiv.onclick = (e) => {
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
    }
  };

  return itemDiv;
}

  window.downloadReport = function(url) {
    chrome.storage.local.get({ analyzedHistory: [] }, (result) => {
      const item = result.analyzedHistory.find(h => h.url === url);
      if (item && item.projectPaper) {
        const blob = new Blob([item.projectPaper], {type: 'text/plain'});
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${item.owner}_${item.repo}_report.txt`;
        a.click();
        URL.revokeObjectURL(downloadUrl);
      }
    });
  };

  window.toggleFavorite = function(url, owner, repo) {
    chrome.storage.local.get({ favoriteRepos: [] }, (result) => {
      let favorites = result.favoriteRepos || [];
      const existingIndex = favorites.findIndex(f => f.url === url);
      if (existingIndex === -1) {
        favorites.push({ url, owner, repo, timestamp: Date.now() });
      } else {
        favorites.splice(existingIndex, 1);
      }
      chrome.storage.local.set({ favoriteRepos: favorites }, () => {
        if (currentTab === 'favorites') {
          loadHistoryContent();
        }
      });
    });
  };

  window.removeFavorite = function(url) {
    chrome.storage.local.get({ favoriteRepos: [] }, (result) => {
      const favorites = result.favoriteRepos.filter(f => f.url !== url);
      chrome.storage.local.set({ favoriteRepos: favorites }, () => {
        loadHistoryContent();
      });
    });
  };

  if (historyIcon) {
    historyIcon.addEventListener('click', showHistoryOverlay);
  }

  function setLoadingState(loading) {
    const buttonText = summarizeBtn.querySelector('.button-text');
    if (loading) {
      summarizeBtn.disabled = true;
      summarizeBtn.classList.add('loading-button');
      buttonText.style.opacity = '0';
      downloadBtn.style.display = 'none';
    } else {
      summarizeBtn.disabled = false;
      summarizeBtn.classList.remove('loading-button');
      buttonText.style.opacity = '1';
    }
  }

  // Enhanced showMessage: supports errorType for more granular feedback
  function showMessage(message, type = 'info', errorType = null) {
    summaryDiv.className = '';
    summaryDiv.classList.add(type);
    let icon = '';
    if (type === 'loading') {
      icon = '⏳';
    } else if (type === 'error') {
      if (errorType === 'network-error') icon = '🌐';
      else if (errorType === 'api-error') icon = '🤖';
      else if (errorType === 'extraction-error') icon = '📦';
      else icon = '❌';
    } else if (type === 'success') {
      icon = '✅';
    } else if (type === 'info') {
      icon = 'ℹ️';
    }
    
    if (type === 'error') {
      summaryDiv.innerHTML = `<span class="status-indicator ${type}">${icon}</span> ${message}`;
    } else {
      summaryDiv.innerHTML = `<span class="status-indicator ${type}">${icon}</span> ${message}`;
    }
    summaryDiv.style.display = 'block';
  }

  // New function for GitHub-specific error with better styling
  function showGitHubError() {
    summaryDiv.className = 'error';
    summaryDiv.innerHTML = `
      <div class="error-content">
        <div class="error-icon">🔗</div>
        <div class="error-text">
          <h3 class="error-title">GitHub Repository Required</h3>
          <p class="error-description">Please navigate to a GitHub repository page to use this extension.</p>
          <div class="error-actions">
            <button class="error-action-btn">🌐 Go to GitHub</button>
          </div>
        </div>
      </div>
    `;
    summaryDiv.style.display = 'block';
    
    // Add event listener to the button
    const goToGitHubBtn = summaryDiv.querySelector('.error-action-btn');
    if (goToGitHubBtn) {
      goToGitHubBtn.addEventListener('click', openGitHub);
    }
  }

  // Helper functions for error actions
  function openGitHub() {
    chrome.tabs.create({ url: 'https://github.com' });
  }

  function showGitHubHelp() {
    summaryDiv.innerHTML = `
      <div class="error-content">
        <div class="error-icon">❓</div>
        <div class="error-text">
          <h3 class="error-title">How to use Repo Summarizer</h3>
          <p class="error-description">
            1. Navigate to any GitHub repository page (e.g., github.com/username/repo)<br>
            2. Click the "Analyze Repository" button<br>
            3. Wait for the AI to analyze the code and generate a summary<br>
            4. Download the detailed project report if needed
          </p>
          <div class="error-actions">
            <button class="error-action-btn">🌐 Go to GitHub</button>
            <button class="error-action-btn secondary">← Back</button>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners to the buttons
    const goToGitHubBtn = summaryDiv.querySelector('.error-action-btn');
    const backBtn = summaryDiv.querySelector('.error-action-btn.secondary');
    
    if (goToGitHubBtn) {
      goToGitHubBtn.addEventListener('click', openGitHub);
    }
    if (backBtn) {
      backBtn.addEventListener('click', showGitHubError);
    }
  }

  function showTimeoutError() {
    summaryDiv.className = 'error';
    summaryDiv.innerHTML = `
      <div class="error-content">
        <div class="error-icon">⏰</div>
        <div class="error-text">
          <h3 class="error-title">Extraction Timed Out</h3>
          <p class="error-description">The repository analysis took too long. This often happens with large repositories. Please ensure the page is fully loaded and try again.</p>
          <div class="error-actions">
            <button class="error-action-btn">🔄 Retry Analysis</button>
            <button class="error-action-btn secondary">← Back</button>
          </div>
        </div>
      </div>
    `;
    summaryDiv.style.display = 'block';
    
    // Add event listeners to the buttons
    const retryBtn = summaryDiv.querySelector('.error-action-btn');
    const backBtn = summaryDiv.querySelector('.error-action-btn.secondary');
    
    if (retryBtn) {
      retryBtn.addEventListener('click', retryExtraction);
    }
    if (backBtn) {
      backBtn.addEventListener('click', showGitHubError);
    }
  }

  function retryExtraction() {
    summarizeBtn.click();
  }
  // All showMessage calls are now handled in their respective try/catch blocks with correct variable scope

  function formatTimestamp(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  downloadBtn.style.opacity = '0';
  downloadBtn.style.transform = 'translateY(10px)';
  downloadBtn.style.transition = 'all 0.3s ease';
});
