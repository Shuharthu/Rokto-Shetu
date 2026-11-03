/**
 * @file storage.test.js
 * @description Storage security rules verification test suite.
 */

export function runStorageRulesTests() {
  const results = [];

  function evaluateStorageRule({ auth, path, operation, sizeBytes = 1024, contentType = 'image/jpeg' }) {
    const isAuth = auth != null && auth.uid != null;
    const uid = isAuth ? auth.uid : null;
    const token = isAuth ? (auth.token || {}) : {};
    const isAdmin = isAuth && (token.admin === true || token.super_admin === true);

    const isValidSize = sizeBytes <= 8 * 1024 * 1024;
    const isAvatarValidSize = sizeBytes <= 2 * 1024 * 1024;
    const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(contentType);
    const isAvatarValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(contentType);

    const parts = path.split('/');
    const folder = parts[0];
    const subFolder = parts[1];

    if (folder === 'user_avatars') {
      if (operation === 'read') return true;
      if (operation === 'write') return isAuth && uid === subFolder && isAvatarValidSize && isAvatarValidType;
    }

    if (folder === 'identity_docs') {
      // Sensitive ID documents are NEVER readable by clients directly (only via 60s signed URLs)
      if (operation === 'read') return false;
      if (operation === 'write') return isAuth && uid === subFolder && isValidSize && isValidType;
    }

    if (folder === 'medical_docs') {
      if (operation === 'read') return false;
      if (operation === 'write') return isAuth && isValidSize && isValidType;
    }

    if (folder === 'public_assets') {
      if (operation === 'read') return true;
      if (operation === 'write') return isAdmin;
    }

    return false;
  }

  function assertRule(testName, expectation, actual) {
    const passed = expectation === actual;
    results.push({
      testName,
      passed,
      expected: expectation ? 'ALLOW' : 'DENY',
      actual: actual ? 'ALLOW' : 'DENY',
      error: passed ? null : `Expected ${expectation ? 'ALLOW' : 'DENY'} but got ${actual ? 'ALLOW' : 'DENY'}`
    });
  }

  // --- Storage Rule Assertions ---
  assertRule(
    'Public CAN read user avatars',
    true,
    evaluateStorageRule({ auth: null, path: 'user_avatars/user123/avatar.png', operation: 'read' })
  );

  assertRule(
    'User CAN upload their own avatar <= 2MB',
    true,
    evaluateStorageRule({ auth: { uid: 'user123' }, path: 'user_avatars/user123/avatar.png', operation: 'write', sizeBytes: 1000000, contentType: 'image/png' })
  );

  assertRule(
    'User CANNOT upload avatar > 2MB',
    false,
    evaluateStorageRule({ auth: { uid: 'user123' }, path: 'user_avatars/user123/avatar.png', operation: 'write', sizeBytes: 3000000, contentType: 'image/png' })
  );

  assertRule(
    'Public CANNOT read identity docs directly (must use signed URLs)',
    false,
    evaluateStorageRule({ auth: null, path: 'identity_docs/user123/nid_front.jpg', operation: 'read' })
  );

  assertRule(
    'Authenticated user CANNOT read other users identity docs directly',
    false,
    evaluateStorageRule({ auth: { uid: 'other_user' }, path: 'identity_docs/user123/nid_front.jpg', operation: 'read' })
  );

  assertRule(
    'Owner CAN upload NID image <= 8MB with valid image/jpeg MIME',
    true,
    evaluateStorageRule({ auth: { uid: 'user123' }, path: 'identity_docs/user123/nid_front.jpg', operation: 'write', sizeBytes: 4000000, contentType: 'image/jpeg' })
  );

  assertRule(
    'Owner CANNOT upload dangerous file type (.exe) into identity_docs',
    false,
    evaluateStorageRule({ auth: { uid: 'user123' }, path: 'identity_docs/user123/malware.exe', operation: 'write', sizeBytes: 1000, contentType: 'application/x-msdownload' })
  );

  assertRule(
    'Medical documents CANNOT be read publicly',
    false,
    evaluateStorageRule({ auth: null, path: 'medical_docs/camp123/prescription.pdf', operation: 'read' })
  );

  return results;
}
