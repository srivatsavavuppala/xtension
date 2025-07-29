/**
 * Utility Functions Module
 * Common helper functions and utilities
 */

class Utils {
  /**
   * Debounce function to limit function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Whether to execute immediately
   * @returns {Function} Debounced function
   */
  static debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }

  /**
   * Throttle function to limit function calls
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Sanitize HTML to prevent XSS
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  static sanitizeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Escape HTML entities
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  static escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} length - Maximum length
   * @param {string} suffix - Suffix to add when truncated
   * @returns {string} Truncated text
   */
  static truncateText(text, length = 100, suffix = '...') {
    if (!text || text.length <= length) return text || '';
    return text.substring(0, length).trim() + suffix;
  }

  /**
   * Format file size in human readable format
   * @param {number} bytes - Size in bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted size
   */
  static formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Format timestamp in relative time
   * @param {number} timestamp - Timestamp to format
   * @returns {string} Relative time string
   */
  static formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    if (months < 12) return `${months}mo ago`;
    return `${years}y ago`;
  }

  /**
   * Format timestamp as absolute date
   * @param {number} timestamp - Timestamp to format
   * @returns {string} Formatted date string
   */
  static formatAbsoluteTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid URL
   */
  static isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate GitHub repository URL
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid GitHub repo URL
   */
  static isValidGitHubURL(url) {
    if (!this.isValidURL(url)) return false;
    const pattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/;
    return pattern.test(url);
  }

  /**
   * Extract repository info from GitHub URL
   * @param {string} url - GitHub URL
   * @returns {Object|null} Repository info or null
   */
  static parseGitHubURL(url) {
    if (!this.isValidGitHubURL(url)) return null;
    
    const match = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/);
    if (!match) return null;
    
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ''),
      url: url
    };
  }

  /**
   * Generate a random ID
   * @param {number} length - Length of the ID
   * @returns {string} Random ID
   */
  static generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Deep clone an object
   * @param {Object} obj - Object to clone
   * @returns {Object} Cloned object
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = this.deepClone(obj[key]);
      });
      return cloned;
    }
    return obj;
  }

  /**
   * Check if object is empty
   * @param {Object} obj - Object to check
   * @returns {boolean} True if empty
   */
  static isEmpty(obj) {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    return Object.keys(obj).length === 0;
  }

  /**
   * Retry a function with exponential backoff
   * @param {Function} fn - Function to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Promise} Promise that resolves with function result
   */
  static async retry(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (i === maxRetries) {
          throw lastError;
        }
        
        const delay = baseDelay * Math.pow(2, i);
        await this.sleep(delay);
      }
    }
  }

  /**
   * Sleep for specified milliseconds
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise} Promise that resolves after delay
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a loading indicator element
   * @param {string} text - Loading text
   * @returns {HTMLElement} Loading element
   */
  static createLoadingIndicator(text = 'Loading...') {
    const loader = document.createElement('div');
    loader.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: var(--empty-desc);
      font-size: 14px;
    `;
    
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: 16px;
      height: 16px;
      border: 2px solid var(--modal-border);
      border-top: 2px solid var(--tab-active-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 8px;
    `;
    
    const textNode = document.createTextNode(text);
    
    loader.appendChild(spinner);
    loader.appendChild(textNode);
    
    // Add spinner animation if not already present
    if (!document.querySelector('#spinner-styles')) {
      const style = document.createElement('style');
      style.id = 'spinner-styles';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    return loader;
  }

  /**
   * Show a toast notification
   * @param {string} message - Message to show
   * @param {string} type - Type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in milliseconds
   */
  static showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10002;
      animation: slideInRight 0.3s ease-out;
      max-width: 300px;
      word-wrap: break-word;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Add animation styles
    if (!document.querySelector('#toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Auto remove
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  /**
   * Log with timestamp and module info
   * @param {string} module - Module name
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {any} data - Additional data
   */
  static log(module, level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${module}] [${level.toUpperCase()}]`;
    
    switch (level.toLowerCase()) {
      case 'error':
        console.error(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'info':
        console.info(prefix, message, data);
        break;
      case 'debug':
        console.debug(prefix, message, data);
        break;
      default:
        console.log(prefix, message, data);
    }
  }

  /**
   * Create error with additional context
   * @param {string} message - Error message
   * @param {string} code - Error code
   * @param {Object} context - Additional context
   * @returns {Error} Enhanced error object
   */
  static createError(message, code = 'UNKNOWN_ERROR', context = {}) {
    const error = new Error(message);
    error.code = code;
    error.context = context;
    error.timestamp = Date.now();
    return error;
  }

  /**
   * Measure execution time of a function
   * @param {Function} fn - Function to measure
   * @param {string} label - Label for the measurement
   * @returns {Promise|any} Function result
   */
  static async measureTime(fn, label = 'Operation') {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      console.log(`${label} took ${(end - start).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.log(`${label} failed after ${(end - start).toFixed(2)}ms`);
      throw error;
    }
  }
}

// Export for use in other modules
window.Utils = Utils;