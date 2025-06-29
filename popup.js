// Enhanced popup.js with improved history overlay
document.addEventListener('DOMContentLoaded', function() {
  const summarizeBtn = document.getElementById('summarizeBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const summaryDiv = document.getElementById('summary');
  const historyIcon = document.getElementById('history-icon');
  let projectPaper = '';
  let historyOverlay = null;
  let currentTab = 'analyzed'; // 'analyzed', 'visited', 'favorites'

  // Check if we're on a GitHub page on load
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currentUrl = tabs[0].url;
    if (!currentUrl.includes('github.com')) {
      showMessage('Please navigate to a GitHub repository page to use this extension.', 'error');
      summarizeBtn.disabled = true;
    }
  });

  summarizeBtn.addEventListener('click', async () => {
    try {
      // Start loading state
      setLoadingState(true);
      showMessage('🔍 Extracting repository information...', 'loading');
      
      chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
        try {
          // Track visited repo
          trackVisitedRepo(tabs[0].url);
          
          // Extract repo info
          chrome.tabs.sendMessage(tabs[0].id, {action: 'extractRepoInfo'}, async (repoInfo) => {
            if (!repoInfo) {
              setLoadingState(false);
              showMessage('❌ Could not extract repository information. Please make sure you\'re on a GitHub repository page.', 'error');
              return;
            }

            showMessage('🤖 Generating AI summary...', 'loading');

            try {
              // Call the backend API
              const response = await fetch('https://xtension-git-main-srivatsavavuppalas-projects.vercel.app/api/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(repoInfo)
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              
              if (data.error) {
                throw new Error(data.error);
              }

              // Success
              setLoadingState(false);
              showMessage(data.summary, 'success');
              projectPaper = data.project_paper;
              downloadBtn.style.display = 'block';

              // Save to analyzed history
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

              // Animate download button appearance
              setTimeout(() => {
                downloadBtn.style.opacity = '1';
                downloadBtn.style.transform = 'translateY(0)';
              }, 100);

            } catch (fetchError) {
              setLoadingState(false);
              showMessage(`❌ Error generating summary: ${fetchError.message}. Please try again later or contact support if the problem persists.`, 'error');
            }
          });
        } catch (tabError) {
          setLoadingState(false);
          showMessage('❌ Error accessing the current tab. Please refresh the page and try again.', 'error');
        }
      });
    } catch (error) {
      setLoadingState(false);
      showMessage(`❌ Unexpected error: ${error.message}`, 'error');
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!projectPaper) {
      showMessage('❌ No project report available to download.', 'error');
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
      
      // Visual feedback
      const originalText = downloadBtn.innerHTML;
      downloadBtn.innerHTML = '✅ Downloaded!';
      downloadBtn.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
      
      setTimeout(() => {
        downloadBtn.innerHTML = originalText;
        downloadBtn.style.background = '';
      }, 2000);
      
    } catch (error) {
      showMessage(`❌ Error downloading file: ${error.message}`, 'error');
    }
  });

  // Track visited repositories
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
      
      // Check if repo already exists
      const existingIndex = visited.findIndex(item => item.url === url);
      if (existingIndex !== -1) {
        visited[existingIndex].timestamp = now;
        visited[existingIndex].visitCount++;
      } else {
        visited.unshift(visitedItem);
      }
      
      // Remove old entries (older than 1 week) and limit to 50
      visited = visited.filter(item => (now - item.timestamp) < oneWeek);
      visited = visited.slice(0, 50);
      
      chrome.storage.local.set({ visitedRepos: visited });
    });
  }

  // Save to analyzed history
  function saveToAnalyzedHistory(historyItem) {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    chrome.storage.local.get({ analyzedHistory: [] }, (result) => {
      let history = result.analyzedHistory;
      // Remove any previous entry for this repo and any older than 24 hours
      history = history.filter(item => item.url !== historyItem.url && (now - item.timestamp) < oneDay);
      history.unshift(historyItem); // Add new item to the front
      // Limit history to 20 items
      const limited = history.slice(0, 20);
      chrome.storage.local.set({ analyzedHistory: limited });
    });
  }

  // Enhanced history overlay
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
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 8px 30px rgba(0,0,0,0.15);
      max-width: 550px;
      width: 100%;
      max-height: 85vh;
      margin-top: 20px;
      position: relative;
      overflow: hidden;
      flex-direction: column;
    `;
    modal.className = "history-modal";

    // Header with close button
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 28px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      position: relative;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Repository History';
    title.style.cssText = `
      margin: 0;
      font-size: 1.3em;
      font-weight: 700;
      letter-spacing: -0.3px;
    `;
    
    const closeBtn = document.createElement('button');
closeBtn.setAttribute('aria-label', 'Close');
closeBtn.innerHTML = '&times;';
closeBtn.style.cssText = `
  position: absolute;
  top: 20px;
  right: 24px;
  width: 32px;
  height: 32px;
  font-size: 22px;
  font-weight: bold;
  color: white;
  background-color: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
`;

closeBtn.onmouseover = () => {
  closeBtn.style.backgroundColor = 'rgba(255,255,255,0.25)';
};
closeBtn.onmouseout = () => {
  closeBtn.style.backgroundColor = 'rgba(255,255,255,0.15)';
};

    
    // Tab navigation
    const tabContainer = document.createElement('div');
    tabContainer.style.cssText = `
      display: flex;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    `;
    
    const tabs = [
      { id: 'analyzed', label: '🔍 Analyzed', icon: '📊' },
      { id: 'visited', label: '👁️ Visited', icon: '🔗' },
      { id: 'favorites', label: '⭐ Favorites', icon: '❤️' }
    ];
    
    tabs.forEach(tab => {
      const tabBtn = document.createElement('button');
      tabBtn.innerHTML = `
        <span style="margin-right: 8px;">${tab.icon}</span>
        ${tab.label.split(' ')[1]}
      `;
      tabBtn.style.cssText = `
        flex: 1;
        padding: 16px 20px;
        border: none;
        background: ${currentTab === tab.id ? '#fff' : 'transparent'};
        color: ${currentTab === tab.id ? '#667eea' : '#64748b'};
        font-weight: ${currentTab === tab.id ? '600' : '500'};
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        border-bottom: 3px solid ${currentTab === tab.id ? '#667eea' : 'transparent'};
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
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
    
    // ✅ Content container
    const contentContainer = document.createElement('div');
    contentContainer.id = 'history-content';
    modal.appendChild(contentContainer);

    
    // Update tab styles function
    function updateTabStyles() {
      const tabButtons = tabContainer.querySelectorAll('button');
      tabButtons.forEach((btn, index) => {
        const isActive = tabs[index].id === currentTab;
        btn.style.background = isActive ? '#fff' : 'transparent';
        btn.style.color = isActive ? '#667eea' : '#64748b';
        btn.style.fontWeight = isActive ? '600' : '500';
        btn.style.borderBottom = `3px solid ${isActive ? '#667eea' : 'transparent'}`;
      });
    }
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    modal.appendChild(header);
    modal.appendChild(tabContainer);
    modal.className = 'history-modal';
    modal.appendChild(contentContainer);
    historyOverlay.appendChild(modal);
    document.body.appendChild(historyOverlay);

    
    // Add CSS animations
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
    
    // Close functionality
    closeBtn.onclick = closeHistoryOverlay;
    historyOverlay.onclick = (e) => {
      if (e.target === historyOverlay) {
        closeHistoryOverlay();
      }
    };
    
    // Load initial content
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
      <div style="text-align: center; padding: 60px 20px; color: #64748b;">
        <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.6;">${icon}</div>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #374151;">${title}</div>
        <div style="font-size: 14px; line-height: 1.5;">${description}</div>
      </div>
    `;
  }

  function createAnalyzedHistoryItem(item, index) {
  const itemDiv = document.createElement('div');
  itemDiv.style.cssText = `
    background: #fff;
    margin: 12px 12px;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
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

  // Check if favorite
  let isFavorite = false;
  try {
    const favs = JSON.parse(localStorage.getItem('favoriteRepos') || '[]');
    isFavorite = favs.some(f => f.url === item.url);
  } catch {}

  // Build inner HTML except for the buttons
  itemDiv.innerHTML = `
    <div style="margin-bottom: 12px;">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center;">
          <img src="icons/icon16.png" alt="Repo" style="width:18px; height:18px; margin-right: 10px; border-radius: 4px;">
          <a href="${item.url}" target="_blank" style="font-weight: 700; color: #374151; text-decoration: none; font-size: 12px;">
            ${item.owner}/${item.repo}
          </a>
        </div>
        <span style="color: #64748b; font-size: 11px; background: #f1f5f9; padding: 3px 7px; border-radius: 6px; white-space: nowrap;">
          ${formatTimestamp(item.timestamp)}
        </span>
      </div>
      <div style="color: #64748b; font-size: 14px; margin-bottom: 12px; line-height: 1.4;">
        ${item.description || 'No description available'}
      </div>
      <div style="color: #374151; font-size: 14px; line-height: 1.5; background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 3px solid #667eea;">
        ${item.summary ? (item.summary.length > 120 ? item.summary.substring(0, 120) + '...' : item.summary) : 'No summary available'}
      </div>
      <div class="analyzed-btn-row" style="display: flex; gap: 8px; margin-top: 12px;"></div>
    </div>
  `;

  // Add Download button
  const btnRow = itemDiv.querySelector('.analyzed-btn-row');
  const downloadBtn = document.createElement('button');
  downloadBtn.textContent = '📄 Download Report';
  downloadBtn.style.cssText = 'background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;';
  downloadBtn.onclick = (e) => {
    e.stopPropagation();
    window.downloadReport(item.url);
  };
  btnRow.appendChild(downloadBtn);

  // Add Favorite button
// Add Favorite button (modern, always in sync)
const favBtn = document.createElement('button');
favBtn.className = 'favorite-btn';
favBtn.style.cssText = 'background: none; color: #f59e0b; border: none; padding: 6px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 4px;';
favBtn.innerHTML = '<span class="fav-star" style="font-size: 15px;">☆</span> <span>Add to Favorites</span>';

// Set initial state from chrome.storage.local
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
      // If on favorites tab, refresh
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
  setTimeout(() => {
  const favBtn = itemDiv.querySelector('.favorite-btn');
  if (favBtn) {
    favBtn.onclick = (e) => {
      e.stopPropagation();
      let favs = [];
      try { favs = JSON.parse(localStorage.getItem('favoriteRepos') || '[]'); } catch {}
      const exists = favs.some(f => f.url === item.url);
      if (exists) {
        favs = favs.filter(f => f.url !== item.url);
        favBtn.textContent = '☆ Add to Favorites';
      } else {
        favs.push({ url: item.url, owner: item.owner, repo: item.repo, timestamp: Date.now() });
        favBtn.textContent = '★ Favorited';
      }
      localStorage.setItem('favoriteRepos', JSON.stringify(favs));
    };
  }
}, 0);

  function createVisitedHistoryItem(item, index) {
    const itemDiv = document.createElement('div');
    itemDiv.style.cssText = `
      background: #fff;
      margin: 16px 20px;
      border-radius: 14px;
      padding: 16px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
      cursor: pointer;
      position: relative;
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
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center;">
          <div style="background: #64748b; color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; margin-right: 12px;">
            🔗 VISITED ${item.visitCount > 1 ? `(${item.visitCount}x)` : ''}
          </div>
          <a href="${item.url}" target="_blank" style="font-weight: 600; color: #374151; text-decoration: none; font-size: 15px;">
            ${item.owner}/${item.repo}
          </a>
        </div>
        <span style="color: #64748b; font-size: 11px; background: #f1f5f9; padding: 3px 6px; border-radius: 4px;">
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
    background: #fff;
    margin: 12px 12px;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
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
          <img src="icons/icon16.png" alt="Repo" style="width:18px; height:18px; margin-right: 10px; border-radius: 4px;">
          <a href="${item.url}" target="_blank" style="font-weight: 700; color: #374151; text-decoration: none; font-size: 12px;">
            ${item.owner}/${item.repo}
          </a>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: #64748b; font-size: 13px; background: #f1f5f9; padding: 3px 7px; border-radius: 6px; white-space: nowrap; font-weight: bold;">
            ★
          </span>
          <button class="remove-fav-btn" title="Remove from Favorites" style="background: none; color: #ef4444; border: none; padding: 0 4px; border-radius: 6px; font-size: 18px; cursor: pointer; line-height: 1;">🗑️</button>
        </div>
      </div>
    </div>
  `;

  // Remove favorite button logic
  const removeBtn = itemDiv.querySelector('.remove-fav-btn');
  if (removeBtn) {
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      window.removeFavorite(item.url);
    };
  }

  itemDiv.onclick = (e) => {
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
      // Optionally show a message or do nothing
    }
  };

  return itemDiv;
}

  // Global functions for button actions
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

  function showMessage(message, type = 'info') {
    summaryDiv.className = ''; // Reset classes
    summaryDiv.classList.add(type);
    summaryDiv.textContent = message;
    summaryDiv.style.display = 'block';
    // Add status indicator for loading
    if (type === 'loading') {
      const indicator = document.createElement('span');
      indicator.className = 'status-indicator active';
      summaryDiv.prepend(indicator);
    } else if (type === 'error') {
      const indicator = document.createElement('span');
      indicator.className = 'status-indicator error';
      summaryDiv.prepend(indicator);
    }
  }

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

  // Initialize download button styling
  downloadBtn.style.opacity = '0';
  downloadBtn.style.transform = 'translateY(10px)';
  downloadBtn.style.transition = 'all 0.3s ease';
});