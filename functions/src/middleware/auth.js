/**
 * @file auth.js
 * @description Authentication & Custom Claims authorization middleware for RoktoSetu Cloud Functions.
 */

/**
 * Ensures the caller is authenticated.
 * @param {object} context - Callable function context or decoded token
 * @throws {Error} If unauthenticated
 */
export function requireAuth(context) {
  if (!context || !context.auth || !context.auth.uid) {
    const error = new Error('UNAUTHENTICATED: Authentication required for this operation.');
    error.code = 'unauthenticated';
    throw error;
  }
  return context.auth;
}

/**
 * Asserts that the authenticated caller has a specific custom claim or super_admin status.
 * @param {object} context - Function context
 * @param {string|string[]} requiredRoles - Role or array of acceptable roles
 */
export function requireRole(context, requiredRoles) {
  const auth = requireAuth(context);
  const token = auth.token || {};

  // Super admin possesses all permissions
  if (token.super_admin === true) {
    return auth;
  }

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const hasMatchingRole = roles.some(role => token[role] === true);

  if (!hasMatchingRole) {
    const error = new Error(`PERMISSION_DENIED: User lacks required role(s): ${roles.join(', ')}`);
    error.code = 'permission-denied';
    throw error;
  }
  return auth;
}

/**
 * Verifies that the caller belongs to the target organization.
 * @param {object} context - Function context
 * @param {string} orgId - Organization ID
 * @param {string[]} [allowedRoles] - Specific roles within the organization
 */
export function requireOrgMember(context, orgId, allowedRoles = []) {
  const auth = requireAuth(context);
  const token = auth.token || {};

  if (token.super_admin === true) {
    return auth;
  }

  if (token.orgId !== orgId) {
    const error = new Error('PERMISSION_DENIED: User does not belong to this organization.');
    error.code = 'permission-denied';
    throw error;
  }

  if (allowedRoles.length > 0) {
    const userOrgRole = token.orgRole;
    if (userOrgRole !== 'owner' && !allowedRoles.includes(userOrgRole)) {
      const error = new Error(`PERMISSION_DENIED: Organization role '${userOrgRole}' is insufficient.`);
      error.code = 'permission-denied';
      throw error;
    }
  }

  return auth;
}
