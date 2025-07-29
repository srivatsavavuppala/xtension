/**
 * GitHub Repository Summarizer - Main Application
 * Refactored modular architecture with improved error handling and theming
 */

class GitHubRepoSummarizer {
  constructor() {
    // Initialize managers
    this.themeManager = null;
    this.apiManager = null;
    this.storageManager = null;
    this.historyManager = null;
    
    // UI elements
    this.summarizeBtn = null;
    this.downloadBtn = null;
    this.summaryDiv = null;
    
    // State
    this.projectPaper = '';
    this.isLoading = false;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      Utils.log('App', 'info', 'Initializing GitHub Repository Summarizer');
      
      // Initialize managers
      this.initializeManagers();
      
      // Get UI elements
      this.getUIElements();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Check if we're on GitHub
      await this.checkGitHubPage();
      
      // Restore previous state
      await this.restoreState();
      
      // Cleanup old data
      await this.storageManager.cleanup();
      
      Utils.log('App', 'info', 'Application initialized successfully');
    } catch (error) {
      Utils.log('App', 'error', 'Failed to initialize application', error);
      this.showMessage('❌ Failed to initialize extension. Please refresh and try again.', 'error');
    }
  }

  /**
   * Initialize all managers
   */
  initializeManagers() {
    this.themeManager = new ThemeManager();
    this.apiManager = new APIManager();
    this.storageManager = new StorageManager();
    this.historyManager = new HistoryManager(this.storageManager, this.themeManager);
    
    Utils.log('App', 'info', 'All managers initialized');
  }

  /**
   * Get references to UI elements
   */
  getUIElements() {
    this.summarizeBtn = document.getElementById('summarizeBtn');
    this.downloadBtn = document.getElementById('downloadBtn');
    this.summaryDiv = document.getElementById('summary');
    
    if (!this.summarizeBtn || !this.downloadBtn || !this.summaryDiv) {
      throw Utils.createError('Required UI elements not found', 'UI_ELEMENTS_MISSING');
    }
    
    Utils.log('App', 'info', 'UI elements found and referenced');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Summarize button
    this.summarizeBtn.addEventListener('click', 
      Utils.debounce(() => this.handleSummarize(), 1000, true)
    );
    
    // Download button
    this.downloadBtn.addEventListener('click', () => this.handleDownload());
    
    // Make showMessage available globally for history module
    window.showMessage = (message, type) => this.showMessage(message, type);
    
    Utils.log('App', 'info', 'Event listeners setup complete');
  }

  /**
   * Check if current page is a GitHub repository
   */
  async checkGitHubPage() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0]?.url;
        
        if (!currentUrl || !currentUrl.includes('github.com')) {
          this.showMessage('Please navigate to a GitHub repository page to use this extension.', 'error');
          this.summarizeBtn.disabled = true;
          Utils.log('App', 'warn', 'Not on GitHub page', { url: currentUrl });
        } else {
          Utils.log('App', 'info', 'GitHub page detected', { url: currentUrl });
        }
        
        resolve();
      });
    });
  }

  /**
   * Restore previous application state
   */
  async restoreState() {
    try {
      const state = await this.storageManager.getSummaryState();
      
      if (state.summaryStatus === 'pending') {
        this.showMessage('🔍 Extracting repository information...', 'loading');
        this.setLoadingState(true);
        this.downloadBtn.style.display = 'none';
      } else if (state.summaryStatus === 'done' && state.summaryResult) {
        this.showMessage(state.summaryResult.summary, 'success');
        this.projectPaper = state.summaryResult.project_paper;
        this.showDownloadButton();
        this.setLoadingState(false);
      } else {
        this.hideDownloadButton();
      }
      
      Utils.log('App', 'info', 'State restored', { status: state.summaryStatus });
    } catch (error) {
      Utils.log('App', 'error', 'Failed to restore state', error);
    }
  }

  /**
   * Handle summarize button click
   */
  async handleSummarize() {
    if (this.isLoading) {
      Utils.log('App', 'warn', 'Summarization already in progress');
      return;
    }

    try {
      this.setLoadingState(true);
      this.showMessage('🔍 Extracting repository information...', 'loading');
      
      await this.storageManager.saveSummaryState('pending');
      
      Utils.log('App', 'info', 'Starting repository summarization');
      
      // Get current tab and extract repo info
      const tabs = await this.getCurrentTab();
      const currentTab = tabs[0];
      
      // Track visited repository
      await this.storageManager.trackVisitedRepo(currentTab.url);
      
      // Extract repository information
      const repoInfo = await this.extractRepoInfo(currentTab.id);
      
      if (!repoInfo) {
        throw Utils.createError(
          'Could not extract repository information. Please make sure you\'re on a GitHub repository page.',
          'EXTRACTION_FAILED'
        );
      }
      
      // Call API to summarize
      const result = await this.apiManager.summarizeRepository(
        repoInfo,
        (message, type) => this.showMessage(message, type)
      );
      
      // Success - update UI and save state
      this.projectPaper = result.project_paper;
      this.showMessage(result.summary, 'success');
      this.showDownloadButton();
      
      await this.storageManager.saveSummaryState('done', result, currentTab.url);
      
      // Save to analyzed history
      const historyItem = {
        url: currentTab.url,
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        description: repoInfo.description,
        summary: result.summary,
        timestamp: Date.now(),
        projectPaper: result.project_paper
      };
      
      await this.storageManager.saveAnalyzedHistory(historyItem);
      
      Utils.log('App', 'info', 'Summarization completed successfully');
      
    } catch (error) {
      Utils.log('App', 'error', 'Summarization failed', error);
      
      let errorMessage = '❌ Error generating summary: ';
      
      if (error.code === 'EXTRACTION_FAILED') {
        errorMessage += error.message;
      } else if (error.message.includes('timed out')) {
        errorMessage += 'Request timed out. The repository might be too large or the server is busy. Please try again.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Network error. Please check your internet connection and try again.';
      } else {
        errorMessage += error.message || 'Unknown error occurred. Please try again later.';
      }
      
      this.showMessage(errorMessage, 'error');
      await this.storageManager.saveSummaryState('error');
      
    } finally {
      this.setLoadingState(false);
    }
  }

  /**
   * Handle download button click
   */
  handleDownload() {
    if (!this.projectPaper) {
      this.showMessage('❌ No project report available to download.', 'error');
      return;
    }

    try {
      const blob = new Blob([this.projectPaper], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'github_project_report.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Visual feedback
      const originalText = this.downloadBtn.innerHTML;
      this.downloadBtn.innerHTML = '✅ Downloaded!';
      this.downloadBtn.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
      
      setTimeout(() => {
        this.downloadBtn.innerHTML = originalText;
        this.downloadBtn.style.background = '';
      }, 2000);
      
      Utils.log('App', 'info', 'Report downloaded successfully');
      
    } catch (error) {
      Utils.log('App', 'error', 'Download failed', error);
      this.showMessage('❌ Error downloading file: ' + error.message, 'error');
    }
  }

  /**
   * Get current active tab
   * @returns {Promise<Array>} Array of tabs
   */
  getCurrentTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, resolve);
    });
  }

  /**
   * Extract repository information from GitHub page
   * @param {number} tabId - Tab ID
   * @returns {Promise<Object>} Repository information
   */
  extractRepoInfo(tabId) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(Utils.createError(
          'Timed out extracting repository information. The repository may be too large or the page is not supported.',
          'EXTRACTION_TIMEOUT'
        ));
      }, 30000);

      chrome.tabs.sendMessage(tabId, { action: 'extractRepoInfo' }, (response) => {
        clearTimeout(timeout);
        
        if (chrome.runtime.lastError) {
          reject(Utils.createError(
            'Failed to communicate with page content script',
            'CONTENT_SCRIPT_ERROR',
            { error: chrome.runtime.lastError }
          ));
          return;
        }
        
        if (!response) {
          reject(Utils.createError(
            'No response from content script',
            'NO_RESPONSE'
          ));
          return;
        }
        
        Utils.log('App', 'info', 'Repository info extracted', response);
        resolve(response);
      });
    });
  }

  /**
   * Set loading state for UI
   * @param {boolean} loading - Whether app is loading
   */
  setLoadingState(loading) {
    this.isLoading = loading;
    const buttonText = this.summarizeBtn.querySelector('.button-text');
    
    if (loading) {
      this.summarizeBtn.disabled = true;
      this.summarizeBtn.classList.add('loading-button');
      if (buttonText) buttonText.style.opacity = '0';
      this.downloadBtn.style.display = 'none';
    } else {
      this.summarizeBtn.disabled = false;
      this.summarizeBtn.classList.remove('loading-button');
      if (buttonText) buttonText.style.opacity = '1';
    }
  }

  /**
   * Show download button with animation
   */
  showDownloadButton() {
    this.downloadBtn.style.display = 'block';
    this.downloadBtn.style.background = '#10b981';
    this.downloadBtn.style.color = 'white';
    this.downloadBtn.style.border = 'none';
    this.downloadBtn.style.boxShadow = 'none';
    
    // Animate in
    setTimeout(() => {
      this.downloadBtn.style.opacity = '1';
      this.downloadBtn.style.transform = 'translateY(0)';
    }, 100);
  }

  /**
   * Hide download button
   */
  hideDownloadButton() {
    this.downloadBtn.style.display = 'none';
    this.downloadBtn.style.opacity = '0';
    this.downloadBtn.style.transform = 'translateY(10px)';
    this.downloadBtn.style.transition = 'all 0.3s ease';
  }

  /**
   * Show message in summary area
   * @param {string} message - Message to display
   * @param {string} type - Message type: 'info', 'success', 'error', 'loading'
   */
  showMessage(message, type = 'info') {
    // Clear existing classes
    this.summaryDiv.className = '';
    this.summaryDiv.classList.add(type);
    
    // Get appropriate icon
    let icon = '';
    switch (type) {
      case 'loading':
        icon = '⏳';
        break;
      case 'error':
        icon = '❌';
        break;
      case 'success':
        icon = '✅';
        break;
      case 'info':
      default:
        icon = 'ℹ️';
        break;
    }
    
    // Sanitize message for security
    const sanitizedMessage = Utils.sanitizeHTML(message);
    
    // Update content
    this.summaryDiv.innerHTML = `<span class="status-indicator ${type}">${icon}</span> ${sanitizedMessage}`;
    this.summaryDiv.style.display = 'block';
    
    Utils.log('App', 'info', `Message shown: ${type}`, { message });
  }

  /**
   * Get application statistics
   * @returns {Promise<Object>} Application statistics
   */
  async getStats() {
    try {
      const storageStats = await this.storageManager.getStorageStats();
      const cacheStats = this.apiManager.getCacheStats();
      
      return {
        storage: storageStats,
        cache: cacheStats,
        theme: this.themeManager.isDarkMode() ? 'dark' : 'light',
        version: chrome.runtime.getManifest().version
      };
    } catch (error) {
      Utils.log('App', 'error', 'Failed to get stats', error);
      return {};
    }
  }
}

// Initialize the application
const app = new GitHubRepoSummarizer();

// Export for debugging
window.app = app;
