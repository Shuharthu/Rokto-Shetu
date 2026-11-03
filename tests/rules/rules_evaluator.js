/**
 * @file rules_evaluator.js
 * @description Logic evaluation harness for firestore.rules rulesets.
 * Mirrors the exact logic in firestore.rules to enable automated unit testing.
 */

export class RulesEvaluator {
  /**
   * Evaluates if a Firestore operation is permitted.
   * @param {object} params
   * @param {object|null} params.auth - request.auth { uid, token: { ...claims } }
   * @param {string} params.path - e.g. "users/u123", "inventory_units/unit456"
   * @param {'get'|'list'|'create'|'update'|'delete'} params.operation
   * @param {object|null} [params.resource] - Existing document data
   * @param {object|null} [params.requestResource] - Incoming document data
   * @returns {{ allowed: boolean, reason?: string }}
   */
  static evaluate({ auth, path, operation, resource = null, requestResource = null }) {
    const isAuth = auth != null && auth.uid != null;
    const uid = isAuth ? auth.uid : null;
    const token = isAuth ? (auth.token || {}) : {};

    const isSuperAdmin = isAuth && token.super_admin === true;
    const isAdmin = isSuperAdmin || (isAuth && token.admin === true);
    const isModerator = isAdmin || (isAuth && token.moderator === true);
    const isIdentityVerifier = isAdmin || (isAuth && token.identity_verifier === true);
    const isFundraiserReviewer = isAdmin || (isAuth && (token.fundraiser_reviewer === true || token.senior_reviewer === true));
    const isFinanceApprover = isAdmin || (isAuth && token.finance_approver === true);
    const isVerifiedUser = isAuth && token.verified === true;

    const isOwner = (targetUid) => isAuth && uid === targetUid;
    const isOrgMember = (orgId) => isAuth && token.orgId === orgId;
    const isOrgRole = (orgId, role) => isOrgMember(orgId) && (token.orgRole === role || token.orgRole === 'owner');

    const unaffected = (fieldList) => {
      if (!resource || !requestResource) return true;
      for (const field of fieldList) {
        if (JSON.stringify(resource[field]) !== JSON.stringify(requestResource[field])) {
          return false;
        }
      }
      return true;
    };

    const pathSegments = path.replace(/^\//, '').split('/');
    const collection = pathSegments[0];
    const docId = pathSegments[1];
    const subCollection = pathSegments[2];
    const subDocId = pathSegments[3];

    // Subcollection: chats/{chatId}/messages/{msgId}
    if (collection === 'chats' && subCollection === 'messages') {
      const isRead = operation === 'get' || operation === 'list';
      if (isRead) {
        // Must be participant in chat
        const isParticipant = resource && Array.isArray(resource.participants) && resource.participants.includes(uid);
        return { allowed: isAuth && isParticipant };
      }
      if (operation === 'create') {
        const isSender = requestResource && requestResource.senderId === uid;
        return { allowed: isAuth && isSender };
      }
      if (operation === 'update' || operation === 'delete') {
        return { allowed: isModerator };
      }
    }

    switch (collection) {
      // 1. Users
      case 'users': {
        if (operation === 'get' || operation === 'list') {
          return { allowed: isAuth };
        }
        if (operation === 'create') {
          const allowed = isOwner(docId) &&
            requestResource?.uid === docId &&
            requestResource?.verificationStatus === 'pending' &&
            (!requestResource.roles || requestResource.roles.length === 0);
          return { allowed };
        }
        if (operation === 'update') {
          if (isAdmin) return { allowed: true };
          const allowed = isOwner(docId) && unaffected(['uid', 'roles', 'verificationStatus', 'isDonor', 'profileCompletion']);
          return { allowed };
        }
        if (operation === 'delete') {
          return { allowed: isAdmin };
        }
        return { allowed: false };
      }

      // 2. Users Private
      case 'users_private': {
        if (operation === 'get' || operation === 'list') {
          return { allowed: isOwner(docId) || isIdentityVerifier };
        }
        if (operation === 'create') {
          return { allowed: isOwner(docId) };
        }
        if (operation === 'update') {
          if (isIdentityVerifier) return { allowed: true };
          return { allowed: isOwner(docId) && unaffected(['encryptedNID', 'idNumberHash']) };
        }
        if (operation === 'delete') {
          return { allowed: isAdmin };
        }
        return { allowed: false };
      }

      // 3. Identity Docs & Hash Index (Cloud Functions only)
      case 'identity_docs': {
        if (operation === 'get' || operation === 'list') {
          return { allowed: isIdentityVerifier };
        }
        return { allowed: false };
      }
      case 'id_hash_index': {
        return { allowed: false };
      }

      // 4. Donors
      case 'donors': {
        if (operation === 'get' || operation === 'list') {
          return { allowed: isAuth };
        }
        if (operation === 'create') {
          return { allowed: isOwner(docId) };
        }
        if (operation === 'update') {
          if (isAdmin) return { allowed: true };
          return { allowed: isOwner(docId) && unaffected(['totalDonations', 'level', 'badgeUrl', 'points', 'isEligible', 'nextEligibleDate']) };
        }
        if (operation === 'delete') {
          return { allowed: isAdmin };
        }
        return { allowed: false };
      }

      // 5. Seeker Requests
      case 'requests': {
        if (operation === 'get' || operation === 'list') {
          return { allowed: isAuth };
        }
        if (operation === 'create') {
          return { allowed: isVerifiedUser && requestResource?.seekerId === uid };
        }
        if (operation === 'update') {
          if (isAdmin) return { allowed: true };
          return { allowed: isAuth && resource?.seekerId === uid && unaffected(['seekerId', 'createdAt', 'verificationCode']) };
        }
        if (operation === 'delete') {
          return { allowed: isAdmin };
        }
        return { allowed: false };
      }

      // 6. Request Matches & Donations
      case 'request_matches': {
        if (operation === 'get' || operation === 'list') {
          return { allowed: isAuth && (resource?.donorId === uid || resource?.seekerId === uid || isAdmin) };
        }
        if (operation === 'update') {
          // Donor updating response status
          const keys = Object.keys(requestResource || {}).filter(k => requestResource[k] !== resource[k]);
          const onlyStatusAndResponded = keys.every(k => ['status', 'respondedAt'].includes(k));
          return { allowed: isAuth && resource?.donorId === uid && onlyStatusAndResponded };
        }
        return { allowed: false };
      }

      case 'donations': {
        if (operation === 'get' || operation === 'list') {
          return { allowed: isAuth && (resource?.donorId === uid || resource?.seekerId === uid || isAdmin) };
        }
        return { allowed: false }; // Created exclusively by Cloud Function
      }

      // 7. B2B Multi-Tenant Organizations
      case 'orgs': {
        if (operation === 'get' || operation === 'list') {
          return { allowed: isOrgMember(docId) || isAdmin };
        }
        if (operation === 'create') return { allowed: isSuperAdmin };
        if (operation === 'update') {
          if (isAdmin) return { allowed: true };
          return { allowed: isOrgRole(docId, 'owner') && unaffected(['planId', 'subscriptionStatus']) };
        }
        if (operation === 'delete') return { allowed: isSuperAdmin };
        return { allowed: false };
      }

      case 'org_members': {
        if (operation === 'get' || operation === 'list') {
          return { allowed: isAuth && (resource?.orgId === token.orgId || isAdmin) };
        }
        return { allowed: false }; // Managed by Cloud Functions
      }

      case 'inventory_units': {
        const targetOrgId = resource?.orgId || requestResource?.orgId;
        if (operation === 'get' || operation === 'list') {
          return { allowed: isOrgMember(targetOrgId) || isAdmin };
        }
        if (operation === 'create') {
          return { allowed: isOrgMember(targetOrgId) && ['owner', 'manager', 'inventory_staff'].includes(token.orgRole) };
        }
        if (operation === 'update') {
          return { allowed: isOrgMember(targetOrgId) && ['owner', 'manager', 'inventory_staff'].includes(token.orgRole) && unaffected(['orgId', 'unitId']) };
        }
        if (operation === 'delete') {
          return { allowed: isOrgRole(targetOrgId, 'manager') || isAdmin };
        }
        return { allowed: false };
      }

      // 8. Critical Patient Fundraiser Engine
      case 'fundraisers': {
        if (operation === 'get' || operation === 'list') {
          return { allowed: isAuth && (resource?.applicantId === uid || isFundraiserReviewer) };
        }
        if (operation === 'create') {
          return { allowed: isVerifiedUser && requestResource?.applicantId === uid && requestResource?.status === 'draft' && requestResource?.raisedAmountBDT === 0 };
        }
        if (operation === 'update') {
          if (isFundraiserReviewer) return { allowed: true };
          const isDraftOrMoreInfo = resource?.status === 'draft' || resource?.status === 'needs_more_info';
          return {
            allowed: isAuth && resource?.applicantId === uid && isDraftOrMoreInfo && unaffected(['applicantId', 'status', 'raisedAmountBDT', 'donorCount'])
          };
        }
        return { allowed: false };
      }

      case 'public_fundraisers': {
        if (operation === 'get' || operation === 'list') return { allowed: true };
        return { allowed: false }; // Generated projection
      }

      case 'ledger_entries': {
        if (operation === 'get' || operation === 'list') return { allowed: isFinanceApprover };
        return { allowed: false }; // Append-only by Cloud Functions
      }

      case 'audit_logs': {
        if (operation === 'get' || operation === 'list') return { allowed: isAdmin };
        return { allowed: false };
      }

      default:
        return { allowed: false };
    }
  }
}
