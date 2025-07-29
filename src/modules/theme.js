/**
 * Theme Management Module
 * Handles dark/light theme switching and persistence
 */

class ThemeManager {
  constructor() {
    this.themeToggle = null;
    this.init();
  }

  /**
   * Initialize theme management
   */
  init() {
    this.injectThemeCSS();
    this.createThemeToggle();
    this.loadSavedTheme();
  }

  /**
   * Inject theme CSS variables and styles
   */
  injectThemeCSS() {
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

      /* Apply theme variables to elements */
      body {
        background: var(--popup-bg) !important;
        color: var(--popup-text) !important;
      }

      #main {
        background: var(--popup-bg) !important;
        color: var(--popup-text) !important;
      }

      .history-modal {
        background: var(--modal-bg) !important;
        color: var(--modal-text) !important;
        border-color: var(--modal-border) !important;
        box-shadow: 0 8px 40px rgba(0,0,0,0.12) !important;
      }

      body.dark-theme .history-modal {
        box-shadow: 0 8px 40px rgba(0,0,0,0.45) !important;
      }

      .status-indicator.success { color: #059669; }
      .status-indicator.error { color: #dc2626; }
      .status-indicator.loading { color: #f59e42; }
      .status-indicator.info { color: #2563eb; }

      body.dark-theme .status-indicator.success { color: #22d3ee; }
      body.dark-theme .status-indicator.error { color: #f87171; }
      body.dark-theme .status-indicator.loading { color: #fbbf24; }
      body.dark-theme .status-indicator.info { color: #a3e635; }

      #summary {
        background: var(--summary-bg) !important;
        color: var(--summary-text) !important;
        border-color: var(--modal-border) !important;
      }

      .tab-btn[aria-selected="true"] {
        background: var(--tab-active-bg) !important;
        color: var(--tab-active-color) !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Create and setup theme toggle button
   */
  createThemeToggle() {
    this.themeToggle = document.createElement('button');
    this.themeToggle.id = 'theme-toggle';
    this.themeToggle.innerHTML = '🌙';
    this.themeToggle.setAttribute('aria-label', 'Toggle dark/light mode');
    this.themeToggle.style.cssText = [
      'position: fixed',
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
      'border: 1px solid var(--modal-border)',
      'border-radius: 8px',
      'cursor: pointer',
      'transition: all 0.2s ease',
      'box-shadow: 0 2px 4px rgba(0,0,0,0.1)',
      'color: var(--modal-text)'
    ].join(';');

    this.themeToggle.onclick = () => this.toggleTheme();
    document.body.appendChild(this.themeToggle);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const isDark = !document.body.classList.contains('dark-theme');
    this.setTheme(isDark);
    chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
  }

  /**
   * Set theme based on isDark parameter
   * @param {boolean} isDark - Whether to set dark theme
   */
  setTheme(isDark) {
    if (isDark) {
      document.body.classList.add('dark-theme');
      this.themeToggle.innerHTML = '☀️';
    } else {
      document.body.classList.remove('dark-theme');
      this.themeToggle.innerHTML = '🌙';
    }
    
    // Update toggle button styling
    this.updateToggleButtonStyle();
  }

  /**
   * Update theme toggle button styling based on current theme
   */
  updateToggleButtonStyle() {
    const isDark = document.body.classList.contains('dark-theme');
    this.themeToggle.style.borderColor = isDark ? '#27272a' : '#e2e8f0';
    this.themeToggle.style.color = isDark ? '#f1f5f9' : '#374151';
  }

  /**
   * Load saved theme from storage
   */
  loadSavedTheme() {
    chrome.storage.local.get({ theme: 'light' }, (result) => {
      this.setTheme(result.theme === 'dark');
    });
  }

  /**
   * Hide theme toggle (used when modal is open)
   */
  hide() {
    if (this.themeToggle) {
      this.themeToggle.style.display = 'none';
    }
  }

  /**
   * Show theme toggle
   */
  show() {
    if (this.themeToggle) {
      this.themeToggle.style.display = '';
    }
  }

  /**
   * Check if dark theme is currently active
   * @returns {boolean} True if dark theme is active
   */
  isDarkMode() {
    return document.body.classList.contains('dark-theme');
  }
}

// Export for use in other modules
window.ThemeManager = ThemeManager;