/**
 * @file test-secure-auth.js
 * @description Automated Unit and Security Tests for RoktoSetu Firebase Authentication,
 * Database Profile Synchronization, Password Security, and Multi-Role Access Control.
 */

import assert from 'assert';
import {
  validatePasswordStrength,
  signUpUserWithProfile,
  secureSignInWithEmail,
  checkDatabaseConnection,
  ADMIN_REGISTRATION_PASSCODE
} from '../public/js/core/firebase.js';

export async function runSecureAuthTests() {
  const results = [];

  function record(testName, fn) {
    try {
      fn();
      results.push({ testName, passed: true });
    } catch (e) {
      results.push({ testName, passed: false, error: e.message });
    }
  }

  async function recordAsync(testName, fn) {
    try {
      await fn();
      results.push({ testName, passed: true });
    } catch (e) {
      results.push({ testName, passed: false, error: e.message });
    }
  }

  // 1. Password Strength Policy
  record('Password strength policy enforces >= 8 chars with mixed complexity', () => {
    const weak1 = validatePasswordStrength('short');
    assert.strictEqual(weak1.valid, false);

    const weak2 = validatePasswordStrength('alllowercasepass');
    assert.strictEqual(weak2.valid, false);

    const strong = validatePasswordStrength('RoktoSetu@2026!');
    assert.strictEqual(strong.valid, true);
  });

  // 2. Database Connection Check
  await recordAsync('Database & Auth connectivity probe validates roktoshetu connection', async () => {
    const health = await checkDatabaseConnection();
    assert.strictEqual(health.connected, true);
    assert.strictEqual(health.projectId, 'roktoshetu');
  });

  // 3. User Role: Seeker (user) Registration and Login
  await recordAsync('General Seeker user registers and logs in with proper role segregation', async () => {
    const email = `seeker_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@test.com`;
    const res = await signUpUserWithProfile({
      fullName: 'Rahim Seeker',
      email,
      password: 'Password123!',
      phoneNumber: '+8801711112222',
      role: 'user'
    });

    assert.strictEqual(res.user.role, 'user');
    assert.strictEqual(res.user.isDonor, false);

    const loginRes = await secureSignInWithEmail(email, 'Password123!');
    assert.strictEqual(loginRes.user.email, email);
    assert.strictEqual(loginRes.user.role, 'user');
  });

  // 4. User Role: Blood Donor (donor) Registration with Blood Group
  await recordAsync('Blood Donor registers with blood group and logs in securely', async () => {
    const email = `donor_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@test.com`;

    await assert.rejects(
      async () => {
        await signUpUserWithProfile({
          fullName: 'Karim Donor',
          email,
          password: 'Password123!',
          role: 'donor',
          bloodGroup: null
        });
      },
      /select your blood group/i
    );

    const res = await signUpUserWithProfile({
      fullName: 'Karim Donor',
      email,
      password: 'Password123!',
      phoneNumber: '+8801811113333',
      role: 'donor',
      bloodGroup: 'O+',
      district: 'Chattogram'
    });

    assert.strictEqual(res.user.role, 'donor');
    assert.strictEqual(res.user.bloodGroup, 'O+');
    assert.strictEqual(res.user.isDonor, true);

    const loginRes = await secureSignInWithEmail(email, 'Password123!');
    assert.strictEqual(loginRes.user.role, 'donor');
  });

  // 5. User Role: Admin Protected Registration
  await recordAsync('Administrator registration requires security passcode and assigns admin role', async () => {
    const email = `admin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@test.com`;

    await assert.rejects(
      async () => {
        await signUpUserWithProfile({
          fullName: 'Admin User',
          email,
          password: 'Password123!',
          role: 'admin',
          adminPasscode: 'WRONG_CODE'
        });
      },
      /Invalid Admin Passcode/i
    );

    const res = await signUpUserWithProfile({
      fullName: 'Super Admin',
      email,
      password: 'Password123!',
      role: 'admin',
      adminPasscode: ADMIN_REGISTRATION_PASSCODE
    });

    assert.strictEqual(res.user.role, 'admin');
    assert.ok(res.user.roles.includes('admin'));

    const loginRes = await secureSignInWithEmail(email, 'Password123!');
    assert.strictEqual(loginRes.user.role, 'admin');
  });

  // 6. Sign-Up Before Login Requirement (Rejects Unregistered Account)
  await recordAsync('Login strictly rejects unregistered accounts and demands prior Sign Up', async () => {
    const unregisteredEmail = `unregistered_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@test.com`;
    await assert.rejects(
      async () => {
        await secureSignInWithEmail(unregisteredEmail, 'SomePassword123!');
      },
      /Please (sign up|complete Sign Up) first/i
    );
  });

  return results;
}

if (process.argv[1]?.endsWith('test-secure-auth.js')) {
  console.log('\n--- Running Secure Auth Tests Directly ---');
  const res = await runSecureAuthTests();
  for (const r of res) {
    if (r.passed) console.log(`  [PASS] ${r.testName}`);
    else console.error(`  [FAIL] ${r.testName}: ${r.error}`);
  }
}
