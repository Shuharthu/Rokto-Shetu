/**
 * @file kms.test.js
 * @description Cloud KMS / AES-256-GCM encryption & salted hash unit tests.
 */

import { encryptSensitiveData, decryptSensitiveData, computeIdHash } from '../../functions/src/services/kms.js';

export function runKmsTests() {
  const results = [];

  function assert(name, fn) {
    try {
      fn();
      results.push({ testName: name, passed: true, error: null });
    } catch (err) {
      results.push({ testName: name, passed: false, error: err.message });
    }
  }

  // 1. Encryption & Decryption
  assert('encryptSensitiveData creates 3-part hex string and decrypts cleanly', () => {
    const rawNID = '19951234567890123';
    const encrypted = encryptSensitiveData(rawNID);

    const parts = encrypted.split(':');
    if (parts.length !== 3) {
      throw new Error(`Expected 3 parts (iv:tag:cipher), got ${parts.length}`);
    }

    const decrypted = decryptSensitiveData(encrypted);
    if (decrypted !== rawNID) {
      throw new Error(`Decrypted text '${decrypted}' does not match original '${rawNID}'`);
    }
  });

  assert('decryptSensitiveData fails on tampered ciphertext', () => {
    const rawBankDetails = 'Bank: DBBL, Acc: 102.120.45892';
    const encrypted = encryptSensitiveData(rawBankDetails);
    const parts = encrypted.split(':');

    // Tamper with the ciphertext
    const tamperedCipher = parts[2].slice(0, -2) + (parts[2].endsWith('a') ? 'b' : 'a');
    const tamperedPayload = `${parts[0]}:${parts[1]}:${tamperedCipher}`;

    let threw = false;
    try {
      decryptSensitiveData(tamperedPayload);
    } catch (err) {
      threw = true;
    }

    if (!threw) {
      throw new Error('Expected decryption of tampered payload to fail with auth tag mismatch');
    }
  });

  // 2. Salted duplicate hash index
  assert('computeIdHash produces deterministic normalized SHA-256 hash', () => {
    const nidWithSpaces = ' 1995-1234-5678-90123 ';
    const nidClean = '19951234567890123';

    const hash1 = computeIdHash('nid', nidWithSpaces);
    const hash2 = computeIdHash('nid', nidClean);

    if (hash1 !== hash2) {
      throw new Error('Normalized ID hashes do not match');
    }

    if (hash1.length !== 64) {
      throw new Error(`Expected 64-char hex hash, got ${hash1.length}`);
    }
  });

  return results;
}
