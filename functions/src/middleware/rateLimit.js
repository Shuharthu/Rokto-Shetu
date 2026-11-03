/**
 * @file rateLimit.js
 * @description Sliding window in-memory rate limiter for Cloud Functions endpoints.
 */

class MemoryRateLimiter {
  constructor() {
    /** @type {Map<string, number[]>} */
    this.hits = new Map();
  }

  /**
   * Checks whether an identifier (e.g., user UID or IP) exceeds the rate limit.
   * @param {string} key - Identifier (user UID, IP, phone number)
   * @param {number} maxRequests - Maximum allowed requests in window
   * @param {number} windowMs - Time window in milliseconds
   * @returns {boolean} True if allowed; throws Error if exceeded.
   */
  check(key, maxRequests = 30, windowMs = 60000) {
    const now = Date.now();
    const timestamps = this.hits.get(key) || [];

    // Filter out timestamps outside the active window
    const validTimestamps = timestamps.filter(ts => now - ts < windowMs);

    if (validTimestamps.length >= maxRequests) {
      const error = new Error(`RESOURCE_EXHAUSTED: Rate limit exceeded. Try again in ${Math.ceil((windowMs - (now - validTimestamps[0])) / 1000)} seconds.`);
      error.code = 'resource-exhausted';
      throw error;
    }

    validTimestamps.push(now);
    this.hits.set(key, validTimestamps);
    return true;
  }

  /**
   * Resets rate limiter memory for testing.
   */
  reset() {
    this.hits.clear();
  }
}

export const rateLimiter = new MemoryRateLimiter();
