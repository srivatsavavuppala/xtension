/**
 * Storage Management Module
 * Handles all Chrome storage operations with data validation and cleanup
 */

class StorageManager {
  constructor() {
    this.maxAnalyzedHistory = 20;
    this.maxVisitedRepos = 50;
    this.maxFavoriteRepos = 100;
    this.analyzedHistoryTTL = 24 * 60 * 60 * 1000; // 24 hours
    this.visitedReposTTL = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  /**
   * Get data from Chrome storage with fallback
   * @param {string|Object} keys - Storage keys to retrieve
   * @param {Object} defaults - Default values
   * @returns {Promise<Object>} Storage data
   */
  async get(keys, defaults = {}) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          console.error('[Storage] Error getting data:', chrome.runtime.lastError);
          resolve(defaults);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * Set data in Chrome storage
   * @param {Object} data - Data to store
   * @returns {Promise<void>}
   */
  async set(data) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          console.error('[Storage] Error setting data:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Remove data from Chrome storage
   * @param {string|string[]} keys - Keys to remove
   * @returns {Promise<void>}
   */
  async remove(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(keys, () => {
        if (chrome.runtime.lastError) {
          console.error('[Storage] Error removing data:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Clear all storage data
   * @returns {Promise<void>}
   */
  async clear() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          console.error('[Storage] Error clearing data:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          console.log('[Storage] All data cleared');
          resolve();
        }
      });
    });
  }

  /**
   * Sanitize repository data
   * @param {Object} repoData - Repository data to sanitize
   * @returns {Object} Sanitized data
   */
  sanitizeRepoData(repoData) {
    return {
      url: String(repoData.url || '').trim(),
      owner: String(repoData.owner || '').trim(),
      repo: String(repoData.repo || '').trim(),
      description: String(repoData.description || '').trim().substring(0, 500),
      timestamp: Number(repoData.timestamp) || Date.now(),
      summary: repoData.summary ? String(repoData.summary).substring(0, 1000) : undefined,
      projectPaper: repoData.projectPaper ? String(repoData.projectPaper).substring(0, 10000) : undefined,
      visitCount: Number(repoData.visitCount) || 1
    };
  }

  /**
   * Save analyzed repository to history
   * @param {Object} historyItem - Repository analysis data
   */
  async saveAnalyzedHistory(historyItem) {
    try {
      const sanitizedItem = this.sanitizeRepoData(historyItem);
      const now = Date.now();
      
      const result = await this.get({ analyzedHistory: [] });
      let history = result.analyzedHistory;

      // Remove duplicates and expired entries
      history = history.filter(item => 
        item.url !== sanitizedItem.url && 
        (now - item.timestamp) < this.analyzedHistoryTTL
      );

      // Add new item at the beginning
      history.unshift(sanitizedItem);

      // Limit the number of entries
      history = history.slice(0, this.maxAnalyzedHistory);

      await this.set({ analyzedHistory: history });
      console.log('[Storage] Saved analyzed history:', sanitizedItem.url);
    } catch (error) {
      console.error('[Storage] Error saving analyzed history:', error);
    }
  }

  /**
   * Get analyzed repository history
   * @returns {Promise<Array>} Analyzed history
   */
  async getAnalyzedHistory() {
    try {
      const result = await this.get({ analyzedHistory: [] });
      const now = Date.now();
      
      // Filter out expired entries
      const validHistory = result.analyzedHistory.filter(item => 
        (now - item.timestamp) < this.analyzedHistoryTTL
      );

      // Update storage if we filtered out expired entries
      if (validHistory.length !== result.analyzedHistory.length) {
        await this.set({ analyzedHistory: validHistory });
      }

      return validHistory;
    } catch (error) {
      console.error('[Storage] Error getting analyzed history:', error);
      return [];
    }
  }

  /**
   * Track visited repository
   * @param {string} url - Repository URL
   */
  async trackVisitedRepo(url) {
    try {
      if (!url || !url.includes('github.com')) return;

      const match = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) return;

      const owner = match[1];
      const repo = match[2];
      const now = Date.now();

      const visitedItem = this.sanitizeRepoData({
        url,
        owner,
        repo,
        timestamp: now,
        visitCount: 1
      });

      const result = await this.get({ visitedRepos: [] });
      let visited = result.visitedRepos;

      // Find existing entry
      const existingIndex = visited.findIndex(item => item.url === url);
      
      if (existingIndex !== -1) {
        // Update existing entry
        visited[existingIndex].timestamp = now;
        visited[existingIndex].visitCount = (visited[existingIndex].visitCount || 0) + 1;
      } else {
        // Add new entry
        visited.unshift(visitedItem);
      }

      // Remove expired entries
      visited = visited.filter(item => 
        (now - item.timestamp) < this.visitedReposTTL
      );

      // Limit entries
      visited = visited.slice(0, this.maxVisitedRepos);

      await this.set({ visitedRepos: visited });
      console.log('[Storage] Tracked visited repo:', url);
    } catch (error) {
      console.error('[Storage] Error tracking visited repo:', error);
    }
  }

  /**
   * Get visited repositories
   * @returns {Promise<Array>} Visited repositories
   */
  async getVisitedRepos() {
    try {
      const result = await this.get({ visitedRepos: [] });
      const now = Date.now();
      
      // Filter out expired entries
      const validRepos = result.visitedRepos.filter(item => 
        (now - item.timestamp) < this.visitedReposTTL
      );

      // Update storage if we filtered out expired entries
      if (validRepos.length !== result.visitedRepos.length) {
        await this.set({ visitedRepos: validRepos });
      }

      return validRepos;
    } catch (error) {
      console.error('[Storage] Error getting visited repos:', error);
      return [];
    }
  }

  /**
   * Add repository to favorites
   * @param {Object} repoData - Repository data
   */
  async addFavorite(repoData) {
    try {
      const sanitizedRepo = this.sanitizeRepoData(repoData);
      const result = await this.get({ favoriteRepos: [] });
      let favorites = result.favoriteRepos || [];

      // Check if already exists
      const exists = favorites.some(fav => fav.url === sanitizedRepo.url);
      if (exists) {
        console.log('[Storage] Repository already in favorites:', sanitizedRepo.url);
        return false;
      }

      // Add to favorites
      favorites.unshift(sanitizedRepo);
      favorites = favorites.slice(0, this.maxFavoriteRepos);

      await this.set({ favoriteRepos: favorites });
      console.log('[Storage] Added to favorites:', sanitizedRepo.url);
      return true;
    } catch (error) {
      console.error('[Storage] Error adding favorite:', error);
      return false;
    }
  }

  /**
   * Remove repository from favorites
   * @param {string} url - Repository URL
   */
  async removeFavorite(url) {
    try {
      const result = await this.get({ favoriteRepos: [] });
      const favorites = result.favoriteRepos.filter(fav => fav.url !== url);
      
      await this.set({ favoriteRepos: favorites });
      console.log('[Storage] Removed from favorites:', url);
      return true;
    } catch (error) {
      console.error('[Storage] Error removing favorite:', error);
      return false;
    }
  }

  /**
   * Get favorite repositories
   * @returns {Promise<Array>} Favorite repositories
   */
  async getFavorites() {
    try {
      const result = await this.get({ favoriteRepos: [] });
      return result.favoriteRepos || [];
    } catch (error) {
      console.error('[Storage] Error getting favorites:', error);
      return [];
    }
  }

  /**
   * Check if repository is in favorites
   * @param {string} url - Repository URL
   * @returns {Promise<boolean>} True if in favorites
   */
  async isFavorite(url) {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav.url === url);
    } catch (error) {
      console.error('[Storage] Error checking favorite status:', error);
      return false;
    }
  }

  /**
   * Toggle favorite status of repository
   * @param {Object} repoData - Repository data
   * @returns {Promise<boolean>} New favorite status
   */
  async toggleFavorite(repoData) {
    try {
      const isFav = await this.isFavorite(repoData.url);
      
      if (isFav) {
        await this.removeFavorite(repoData.url);
        return false;
      } else {
        await this.addFavorite(repoData);
        return true;
      }
    } catch (error) {
      console.error('[Storage] Error toggling favorite:', error);
      return false;
    }
  }

  /**
   * Save summary status and result
   * @param {string} status - Status: 'pending', 'done', 'error'
   * @param {Object} result - Summary result
   * @param {string} tabUrl - Tab URL
   */
  async saveSummaryState(status, result = null, tabUrl = null) {
    try {
      const data = { summaryStatus: status };
      
      if (result) {
        data.summaryResult = result;
      }
      
      if (tabUrl) {
        data.summaryTab = tabUrl;
      }

      await this.set(data);
      console.log('[Storage] Saved summary state:', status);
    } catch (error) {
      console.error('[Storage] Error saving summary state:', error);
    }
  }

  /**
   * Get summary state
   * @returns {Promise<Object>} Summary state
   */
  async getSummaryState() {
    try {
      return await this.get({
        summaryStatus: null,
        summaryResult: null,
        summaryTab: null
      });
    } catch (error) {
      console.error('[Storage] Error getting summary state:', error);
      return {
        summaryStatus: null,
        summaryResult: null,
        summaryTab: null
      };
    }
  }

  /**
   * Clear summary state
   */
  async clearSummaryState() {
    try {
      await this.remove(['summaryStatus', 'summaryResult', 'summaryTab']);
      console.log('[Storage] Cleared summary state');
    } catch (error) {
      console.error('[Storage] Error clearing summary state:', error);
    }
  }

  /**
   * Get storage usage statistics
   * @returns {Promise<Object>} Storage statistics
   */
  async getStorageStats() {
    try {
      const result = await this.get({
        analyzedHistory: [],
        visitedRepos: [],
        favoriteRepos: []
      });

      const stats = {
        analyzedHistory: result.analyzedHistory.length,
        visitedRepos: result.visitedRepos.length,
        favoriteRepos: result.favoriteRepos.length,
        limits: {
          analyzedHistory: this.maxAnalyzedHistory,
          visitedRepos: this.maxVisitedRepos,
          favoriteRepos: this.maxFavoriteRepos
        },
        ttl: {
          analyzedHistory: this.analyzedHistoryTTL,
          visitedRepos: this.visitedReposTTL
        }
      };

      return stats;
    } catch (error) {
      console.error('[Storage] Error getting storage stats:', error);
      return {};
    }
  }

  /**
   * Clean up expired data
   */
  async cleanup() {
    try {
      console.log('[Storage] Starting cleanup...');
      
      // Clean up analyzed history
      await this.getAnalyzedHistory();
      
      // Clean up visited repos
      await this.getVisitedRepos();
      
      console.log('[Storage] Cleanup completed');
    } catch (error) {
      console.error('[Storage] Error during cleanup:', error);
    }
  }
}

// Export for use in other modules
window.StorageManager = StorageManager;