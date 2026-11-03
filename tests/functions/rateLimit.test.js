/**
 * @file rateLimit.test.js
 * @description In-memory sliding window rate limiter unit tests.
 */

import { rateLimiter } from '../../functions/src/middleware/rateLimit.js';

export function runRateLimitTests() {
  const results = [];

  function assert(name, fn) {
    try {
      fn();
      results.push({ testName: name, passed: true, error: null });
    } catch (err) {
      results.push({ testName: name, passed: false, error: err.message });
    }
  }

  rateLimiter.reset();

  assert('rateLimiter permits requests within the limit', () => {
    const key = 'test_user_allowed';
    for (let i = 0; i < 5; i++) {
      rateLimiter.check(key, 5, 1000);
    }
  });

  assert('rateLimiter blocks request exceeding the limit', () => {
    const key = 'test_user_blocked';
    for (let i = 0; i < 3; i++) {
      rateLimiter.check(key, 3, 1000);
    }

    let threw = false;
    try {
      rateLimiter.check(key, 3, 1000);
    } catch (err) {
      threw = err.code === 'resource-exhausted';
    }

    if (!threw) {
      throw new Error('Expected rate limiter to throw resource-exhausted error');
    }
  });

  return results;
}
