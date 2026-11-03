/**
 * @file appCheck.js
 * @description Firebase App Check (reCAPTCHA Enterprise) verification middleware.
 */

import { config } from '../config/env.js';

/**
 * Validates that the request carries a valid App Check token.
 * In development mode, allows bypass if not enforced.
 * @param {object} context - Callable function context containing appCheckData
 */
export function requireAppCheck(context) {
  if (!config.security.appCheckEnforced) {
    return true; // Bypass in local emulator / test environments
  }

  if (!context || !context.app || !context.app.alreadyCheckedAppCheckToken) {
    const error = new Error('FAILED_PRECONDITION: Request rejected. App Check token missing or invalid.');
    error.code = 'failed-precondition';
    throw error;
  }

  return true;
}
