/**
 * History Management Module
 * Handles history overlay, tabs, and history-related UI components
 */

class HistoryManager {
  constructor(storageManager, themeManager) {
    this.storageManager = storageManager;
    this.themeManager = themeManager;
    this.historyOverlay = null;
    this.currentTab = 'analyzed';
    this.historyIcon = null;
    this.init();
  }

  /**
   * Initialize history management
   */
  init() {
    this.createHistoryIcon();
    this.setupEventListeners();
  }

  /**
   * Create and setup history icon
   */
  createHistoryIcon() {
    this.historyIcon = document.getElementById('history-icon');
    if (!this.historyIcon) return;

    this.historyIcon.style.cssText = [
      'position: fixed',
      'top: 8px',
      'right: 8px',
      'z-index: 10001',
      'background: transparent',
      'border: 1px solid var(--modal-border)',
      'border-radius: 8px',
      'width: 32px',
      'height: 32px',
      'display: flex',
      'align-items: center',
      'justify-content: center',
      'font-size: 16px',
      'cursor: pointer',
      'transition: all 0.2s ease',
      'box-shadow: 0 2px 4px rgba(0,0,0,0.1)',
      'color: var(--modal-text)'
    ].join(';');

    // Update icon theme when theme changes
    this.updateHistoryIconTheme();
  }

  /**
   * Update history icon styling based on current theme
   */
  updateHistoryIconTheme() {
    if (!this.historyIcon) return;
    
    const isDark = this.themeManager.isDarkMode();
    this.historyIcon.style.borderColor = isDark ? '#27272a' : '#e2e8f0';
    this.historyIcon.style.color = isDark ? '#f1f5f9' : '#374151';
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (this.historyIcon) {
      this.historyIcon.addEventListener('click', () => this.showHistoryOverlay());
    }

    // Watch for theme changes
    const observer = new MutationObserver(() => this.updateHistoryIconTheme());
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
  }

  /**
   * Show history overlay modal
   */
  async showHistoryOverlay() {
    if (this.historyOverlay) return;

    this.historyOverlay = document.createElement('div');
    this.historyOverlay.style.cssText = `
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

    const modal = this.createModal();
    this.historyOverlay.appendChild(modal);
    document.body.appendChild(this.historyOverlay);

    // Hide theme toggle and history icon when modal is open
    this.themeManager.hide();
    this.hide();

    this.addAnimationStyles();
    this.setupModalEventListeners();
    await this.loadHistoryContent();
  }

  /**
   * Create the main modal structure
   * @returns {HTMLElement} Modal element
   */
  createModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: var(--modal-bg);
      border-radius: 18px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      width: 420px;
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

    // Create header
    const header = this.createHeader();
    modal.appendChild(header);

    // Create tab container
    const tabContainer = this.createTabContainer();
    modal.appendChild(tabContainer);

    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.id = 'history-content';
    modal.appendChild(contentContainer);

    return modal;
  }

  /**
   * Create modal header with title and close button
   * @returns {HTMLElement} Header element
   */
  createHeader() {
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
    closeBtn.onclick = () => this.closeHistoryOverlay();

    header.appendChild(title);
    header.appendChild(closeBtn);
    return header;
  }

  /**
   * Create tab container with navigation tabs
   * @returns {HTMLElement} Tab container element
   */
  createTabContainer() {
    const tabContainer = document.createElement('div');
    tabContainer.style.cssText = 'display: flex; border-bottom: 1px solid var(--modal-border); margin: 18px 0 0 0; z-index: 10002;';

    const tabs = [
      { id: 'analyzed', label: '📊 Analyzed' },
      { id: 'visited', label: '🔗 Visited' },
      { id: 'favorites', label: '❤️ Favorites' }
    ];

    tabs.forEach(tab => {
      const tabBtn = this.createTabButton(tab);
      tabContainer.appendChild(tabBtn);
    });

    return tabContainer;
  }

  /**
   * Create individual tab button
   * @param {Object} tab - Tab configuration
   * @returns {HTMLElement} Tab button element
   */
  createTabButton(tab) {
    const tabBtn = document.createElement('button');
    const isActive = this.currentTab === tab.id;
    
    tabBtn.innerHTML = `<span style="margin-right: 8px;">${tab.label.split(' ')[0]}</span> ${tab.label.split(' ')[1]}`;
    tabBtn.style.cssText = [
      'flex: 1',
      'padding: 16px 20px',
      'border: none',
      `background: ${isActive ? 'var(--tab-active-bg)' : 'var(--tab-inactive-bg)'}`,
      `color: ${isActive ? 'var(--tab-active-color)' : 'var(--tab-inactive-color)'}`,
      `font-weight: ${isActive ? '600' : '500'}`,
      'font-size: 14px',
      'cursor: pointer',
      'transition: all 0.2s ease',
      `border-bottom: 3px solid ${isActive ? 'var(--tab-active-color)' : 'transparent'}`,
      'display: flex',
      'align-items: center',
      'justify-content: center'
    ].join(';');

    tabBtn.onmouseover = () => {
      if (this.currentTab !== tab.id) {
        tabBtn.style.background = 'var(--modal-hover)';
      }
    };

    tabBtn.onmouseout = () => {
      if (this.currentTab !== tab.id) {
        tabBtn.style.background = 'transparent';
      }
    };

    tabBtn.onclick = async () => {
      this.currentTab = tab.id;
      await this.loadHistoryContent();
      this.updateTabStyles();
    };

    return tabBtn;
  }

  /**
   * Update tab button styles based on current selection
   */
  updateTabStyles() {
    const tabButtons = document.querySelectorAll('.history-modal button');
    const tabs = [
      { id: 'analyzed', label: '📊 Analyzed' },
      { id: 'visited', label: '🔗 Visited' },
      { id: 'favorites', label: '❤️ Favorites' }
    ];

    // Skip the close button (first button)
    for (let i = 1; i < tabButtons.length && i <= tabs.length; i++) {
      const btn = tabButtons[i];
      const tab = tabs[i - 1];
      const isActive = tab.id === this.currentTab;
      
      btn.style.background = isActive ? 'var(--tab-active-bg)' : 'transparent';
      btn.style.color = isActive ? 'var(--tab-active-color)' : 'var(--tab-inactive-color)';
      btn.style.fontWeight = isActive ? '600' : '500';
      btn.style.borderBottom = `3px solid ${isActive ? 'var(--tab-active-color)' : 'transparent'}`;
    }
  }

  /**
   * Add CSS animations for modal
   */
  addAnimationStyles() {
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
  }

  /**
   * Setup modal event listeners
   */
  setupModalEventListeners() {
    this.historyOverlay.onclick = (e) => {
      if (e.target === this.historyOverlay) {
        this.closeHistoryOverlay();
      }
    };
  }

  /**
   * Close history overlay modal
   */
  closeHistoryOverlay() {
    if (!this.historyOverlay) return;

    this.historyOverlay.style.animation = 'fadeOut 0.2s ease-out forwards';
    const modal = this.historyOverlay.querySelector('.history-modal');
    modal.style.animation = 'slideDown 0.2s ease-out forwards';

    setTimeout(() => {
      if (this.historyOverlay) {
        this.historyOverlay.remove();
        this.historyOverlay = null;
        
        // Show theme toggle and history icon again
        this.themeManager.show();
        this.show();
      }
    }, 200);
  }

  /**
   * Load content for current tab
   */
  async loadHistoryContent() {
    const container = document.getElementById('history-content');
    if (!container) return;

    container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--empty-desc);">Loading...</div>';

    try {
      switch (this.currentTab) {
        case 'analyzed':
          await this.loadAnalyzedHistory(container);
          break;
        case 'visited':
          await this.loadVisitedHistory(container);
          break;
        case 'favorites':
          await this.loadFavoritesHistory(container);
          break;
      }
    } catch (error) {
      console.error('[History] Error loading content:', error);
      container.innerHTML = this.createEmptyState('❌', 'Error loading data', 'Please try again later.');
    }
  }

  /**
   * Load analyzed repository history
   * @param {HTMLElement} container - Container element
   */
  async loadAnalyzedHistory(container) {
    const history = await this.storageManager.getAnalyzedHistory();
    
    if (history.length === 0) {
      container.innerHTML = this.createEmptyState('📊', 'No analyzed repositories', 'Analyze some repositories to see them here!');
    } else {
      container.innerHTML = '';
      history.forEach((item, index) => {
        const historyItem = this.createAnalyzedHistoryItem(item, index);
        container.appendChild(historyItem);
      });
    }
  }

  /**
   * Load visited repository history
   * @param {HTMLElement} container - Container element
   */
  async loadVisitedHistory(container) {
    const visited = await this.storageManager.getVisitedRepos();
    
    if (visited.length === 0) {
      container.innerHTML = this.createEmptyState('🔗', 'No visited repositories', 'Browse GitHub repositories to see them here!');
    } else {
      container.innerHTML = '';
      visited.forEach((item, index) => {
        const historyItem = this.createVisitedHistoryItem(item, index);
        container.appendChild(historyItem);
      });
    }
  }

  /**
   * Load favorites history
   * @param {HTMLElement} container - Container element
   */
  async loadFavoritesHistory(container) {
    const favorites = await this.storageManager.getFavorites();
    
    if (favorites.length === 0) {
      container.innerHTML = this.createEmptyState('❤️', 'No favorite repositories', 'Star repositories to add them to favorites!');
    } else {
      container.innerHTML = '';
      favorites.forEach((item, index) => {
        const historyItem = this.createFavoriteHistoryItem(item, index);
        container.appendChild(historyItem);
      });
    }
  }

  /**
   * Create empty state HTML
   * @param {string} icon - Icon to display
   * @param {string} title - Title text
   * @param {string} description - Description text
   * @returns {string} HTML string
   */
  createEmptyState(icon, title, description) {
    return `
      <div style="text-align: center; padding: 60px 20px; color: var(--empty-desc);">
        <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.6;">${icon}</div>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: var(--empty-title);">${title}</div>
        <div style="font-size: 14px; line-height: 1.5; color: var(--empty-desc);">${description}</div>
      </div>
    `;
  }

  /**
   * Create analyzed history item element
   * @param {Object} item - History item data
   * @param {number} index - Item index
   * @returns {HTMLElement} History item element
   */
  createAnalyzedHistoryItem(item, index) {
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

    this.addHoverEffects(itemDiv);

    itemDiv.innerHTML = `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center;">
            <img src="icons/icon16.png" alt="Repo" style="width:18px; height:18px; margin-right: 10px; border-radius: 4px;">
            <a href="${item.url}" target="_blank" style="font-weight: 700; color: var(--modal-title); text-decoration: none; font-size: 12px;">
              ${item.owner}/${item.repo}
            </a>
          </div>
          <span style="color: var(--empty-desc); font-size: 11px; background: var(--summary-bg); padding: 3px 7px; border-radius: 6px; white-space: nowrap;">
            ${this.formatTimestamp(item.timestamp)}
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

    this.addAnalyzedItemButtons(itemDiv, item);
    this.addItemClickHandler(itemDiv, item);

    return itemDiv;
  }

  /**
   * Create visited history item element
   * @param {Object} item - History item data
   * @param {number} index - Item index
   * @returns {HTMLElement} History item element
   */
  createVisitedHistoryItem(item, index) {
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

    this.addHoverEffects(itemDiv, true);

    itemDiv.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center;">
          <div style="background: var(--empty-desc); color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; margin-right: 12px;">
            🔗 VISITED ${item.visitCount > 1 ? `(${item.visitCount}x)` : ''}
          </div>
          <a href="${item.url}" target="_blank" style="font-weight: 600; color: var(--modal-title); text-decoration: none; font-size: 15px;">
            ${item.owner}/${item.repo}
          </a>
        </div>
        <span style="color: var(--empty-desc); font-size: 11px; background: var(--summary-bg); padding: 3px 6px; border-radius: 4px;">
          ${this.formatTimestamp(item.timestamp)}
        </span>
      </div>
    `;

    itemDiv.onclick = () => window.open(item.url, '_blank');
    return itemDiv;
  }

  /**
   * Create favorite history item element
   * @param {Object} item - History item data
   * @param {number} index - Item index
   * @returns {HTMLElement} History item element
   */
  createFavoriteHistoryItem(item, index) {
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

    this.addHoverEffects(itemDiv);

    itemDiv.innerHTML = `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center;">
            <img src="icons/icon16.png" alt="Repo" style="width:18px; height:18px; margin-right: 10px; border-radius: 4px;">
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

    this.addFavoriteItemHandlers(itemDiv, item);
    return itemDiv;
  }

  /**
   * Add hover effects to history items
   * @param {HTMLElement} itemDiv - Item element
   * @param {boolean} subtle - Whether to use subtle effects
   */
  addHoverEffects(itemDiv, subtle = false) {
    const transform = subtle ? 'translateY(-1px)' : 'translateY(-2px)';
    const shadow = subtle ? '0 4px 12px rgba(0,0,0,0.08)' : '0 8px 25px rgba(0,0,0,0.1)';
    const borderColor = subtle ? 'var(--history-item-border)' : '#667eea';

    itemDiv.onmouseover = () => {
      itemDiv.style.transform = transform;
      itemDiv.style.boxShadow = shadow;
      if (!subtle) itemDiv.style.borderColor = borderColor;
    };

    itemDiv.onmouseout = () => {
      itemDiv.style.transform = 'translateY(0)';
      itemDiv.style.boxShadow = 'none';
      itemDiv.style.borderColor = 'var(--history-item-border)';
    };
  }

  /**
   * Add buttons to analyzed history items
   * @param {HTMLElement} itemDiv - Item element
   * @param {Object} item - Item data
   */
  addAnalyzedItemButtons(itemDiv, item) {
    const btnRow = itemDiv.querySelector('.analyzed-btn-row');
    
    // Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = '📄 Download Report';
    downloadBtn.style.cssText = 'background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;';
    downloadBtn.onclick = (e) => {
      e.stopPropagation();
      this.downloadReport(item);
    };
    btnRow.appendChild(downloadBtn);

    // Favorite button
    const favBtn = document.createElement('button');
    favBtn.className = 'favorite-btn';
    favBtn.style.cssText = 'background: none; color: #f59e0b; border: none; padding: 6px 12px; border-radius: 6px; font-size: 13px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 4px;';
    
    this.updateFavoriteButton(favBtn, item);
    this.addFavoriteButtonHandler(favBtn, item);
    
    btnRow.appendChild(favBtn);
  }

  /**
   * Update favorite button appearance
   * @param {HTMLElement} favBtn - Favorite button element
   * @param {Object} item - Item data
   */
  async updateFavoriteButton(favBtn, item) {
    const isFav = await this.storageManager.isFavorite(item.url);
    
    if (isFav) {
      favBtn.innerHTML = '<span class="fav-star" style="font-size: 15px; color: #f59e0b;">★</span> <span>Favorited</span>';
      favBtn.style.background = 'rgba(245, 158, 11, 0.08)';
    } else {
      favBtn.innerHTML = '<span class="fav-star" style="font-size: 15px;">☆</span> <span>Add to Favorites</span>';
      favBtn.style.background = 'none';
    }
  }

  /**
   * Add favorite button click handler
   * @param {HTMLElement} favBtn - Favorite button element
   * @param {Object} item - Item data
   */
  addFavoriteButtonHandler(favBtn, item) {
    favBtn.onclick = async (e) => {
      e.stopPropagation();
      
      const newStatus = await this.storageManager.toggleFavorite(item);
      await this.updateFavoriteButton(favBtn, item);
      
      // Refresh favorites tab if it's currently active
      if (this.currentTab === 'favorites') {
        await this.loadHistoryContent();
      }
    };
  }

  /**
   * Add handlers for favorite items
   * @param {HTMLElement} itemDiv - Item element
   * @param {Object} item - Item data
   */
  addFavoriteItemHandlers(itemDiv, item) {
    const removeBtn = itemDiv.querySelector('.remove-fav-btn');
    if (removeBtn) {
      removeBtn.onclick = async (e) => {
        e.stopPropagation();
        await this.storageManager.removeFavorite(item.url);
        await this.loadHistoryContent();
      };
    }
  }

  /**
   * Add click handler for analyzed items
   * @param {HTMLElement} itemDiv - Item element
   * @param {Object} item - Item data
   */
  addItemClickHandler(itemDiv, item) {
    itemDiv.onclick = (e) => {
      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
        // Show summary in main popup
        if (window.showMessage && item.summary) {
          window.showMessage(item.summary, 'success');
          this.closeHistoryOverlay();
        }
      }
    };
  }

  /**
   * Download report for analyzed item
   * @param {Object} item - Item data
   */
  downloadReport(item) {
    if (item.projectPaper) {
      const blob = new Blob([item.projectPaper], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.owner}_${item.repo}_report.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Format timestamp for display
   * @param {number} timestamp - Timestamp to format
   * @returns {string} Formatted timestamp
   */
  formatTimestamp(timestamp) {
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

  /**
   * Hide history icon
   */
  hide() {
    if (this.historyIcon) {
      this.historyIcon.style.display = 'none';
    }
  }

  /**
   * Show history icon
   */
  show() {
    if (this.historyIcon) {
      this.historyIcon.style.display = '';
    }
  }
}

// Export for use in other modules
window.HistoryManager = HistoryManager;