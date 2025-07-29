/**
 * API Communication Module
 * Handles all backend requests with caching, error handling, and timeouts
 */

class APIManager {
  constructor() {
    this.baseUrl = 'https://xtension-git-main-srivatsavavuppalas-projects.vercel.app/api/';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.requestTimeout = 30000; // 30 seconds
  }

  /**
   * Fetch with timeout support
   * @param {string} resource - URL to fetch
   * @param {Object} options - Fetch options
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise} Fetch promise with timeout
   */
  fetchWithTimeout(resource, options = {}, timeout = this.requestTimeout) {
    return Promise.race([
      fetch(resource, options),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), timeout)
      )
    ]);
  }

  /**
   * Generate cache key for repository info
   * @param {Object} repoInfo - Repository information
   * @returns {string} Cache key
   */
  getCacheKey(repoInfo) {
    return `${repoInfo.owner}/${repoInfo.repo}`;
  }

  /**
   * Check if cached data is still valid
   * @param {Object} cachedData - Cached data object
   * @returns {boolean} True if cache is valid
   */
  isCacheValid(cachedData) {
    return cachedData && (Date.now() - cachedData.timestamp) < this.cacheTimeout;
  }

  /**
   * Get cached response if available and valid
   * @param {Object} repoInfo - Repository information
   * @returns {Object|null} Cached response or null
   */
  getCachedResponse(repoInfo) {
    const cacheKey = this.getCacheKey(repoInfo);
    const cachedData = this.cache.get(cacheKey);
    
    if (this.isCacheValid(cachedData)) {
      console.log('[API] Using cached response for:', cacheKey);
      return cachedData.data;
    }
    
    return null;
  }

  /**
   * Cache API response
   * @param {Object} repoInfo - Repository information
   * @param {Object} response - API response to cache
   */
  cacheResponse(repoInfo, response) {
    const cacheKey = this.getCacheKey(repoInfo);
    this.cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });
    console.log('[API] Cached response for:', cacheKey);
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, data] of this.cache.entries()) {
      if (now - data.timestamp >= this.cacheTimeout) {
        this.cache.delete(key);
        console.log('[API] Cleared expired cache for:', key);
      }
    }
  }

  /**
   * Sanitize repository information
   * @param {Object} repoInfo - Raw repository information
   * @returns {Object} Sanitized repository information
   */
  sanitizeRepoInfo(repoInfo) {
    return {
      repo: String(repoInfo.repo || '').trim(),
      owner: String(repoInfo.owner || '').trim(),
      description: String(repoInfo.description || '').trim(),
      readme: String(repoInfo.readme || '').trim().substring(0, 4000),
      structure: Array.isArray(repoInfo.structure) ? repoInfo.structure : []
    };
  }

  /**
   * Validate repository information
   * @param {Object} repoInfo - Repository information to validate
   * @throws {Error} If validation fails
   */
  validateRepoInfo(repoInfo) {
    if (!repoInfo || typeof repoInfo !== 'object') {
      throw new Error('Invalid repository information provided');
    }

    const required = ['repo', 'owner'];
    for (const field of required) {
      if (!repoInfo[field] || typeof repoInfo[field] !== 'string') {
        throw new Error(`Missing or invalid required field: ${field}`);
      }
    }

    if (repoInfo.repo.length > 100 || repoInfo.owner.length > 100) {
      throw new Error('Repository name or owner is too long');
    }
  }

  /**
   * Summarize repository using the API
   * @param {Object} repoInfo - Repository information
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<Object>} API response with summary and project paper
   */
  async summarizeRepository(repoInfo, onProgress = () => {}) {
    try {
      // Clear expired cache entries
      this.clearExpiredCache();

      // Validate and sanitize input
      this.validateRepoInfo(repoInfo);
      const sanitizedRepoInfo = this.sanitizeRepoInfo(repoInfo);

      // Check cache first
      const cachedResponse = this.getCachedResponse(sanitizedRepoInfo);
      if (cachedResponse) {
        onProgress('Using cached results...', 'info');
        return cachedResponse;
      }

      onProgress('🤖 Generating AI summary...', 'loading');
      console.log('[API] Sending request to backend:', sanitizedRepoInfo);

      const response = await this.fetchWithTimeout(this.baseUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(sanitizedRepoInfo)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(`Server error: ${errorMessage}`);
      }

      const data = await response.json();

      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.summary || !data.project_paper) {
        throw new Error('Incomplete response from server');
      }

      // Cache the successful response
      this.cacheResponse(sanitizedRepoInfo, data);

      console.log('[API] Successfully received response');
      return data;

    } catch (error) {
      console.error('[API] Error during summarization:', error);
      
      // Provide more specific error messages
      if (error.message.includes('timed out')) {
        throw new Error('Request timed out. The repository might be too large or the server is busy. Please try again.');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (error.message.includes('Server error')) {
        throw new Error(`Server error: ${error.message.replace('Server error: ', '')}`);
      }
      
      throw error;
    }
  }

  /**
   * Get API health status
   * @returns {Promise<Object>} Health status
   */
  async getHealthStatus() {
    try {
      const response = await this.fetchWithTimeout(this.baseUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      }, 5000);

      if (response.ok) {
        return await response.json();
      }
      
      throw new Error(`Health check failed: ${response.status}`);
    } catch (error) {
      console.error('[API] Health check failed:', error);
      throw new Error('API health check failed');
    }
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
    console.log('[API] Cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const [key, data] of this.cache.entries()) {
      if (now - data.timestamp < this.cacheTimeout) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      total: this.cache.size,
      valid: validEntries,
      expired: expiredEntries,
      cacheTimeout: this.cacheTimeout
    };
  }
}

// Export for use in other modules
window.APIManager = APIManager;