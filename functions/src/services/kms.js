/**
 * @file kms.js
 * @description Cloud KMS & AES-256-GCM symmetric encryption for sensitive PII (NID, Passport, Bank Details).
 * Computes salted duplicate-detection SHA-256 hashes.
 */

import crypto from 'crypto';
import { config } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT = 'roktosetu_bangladesh_identity_salt_2026';

/**
 * Derives a 32-byte key from the configured KMS fallback/environment secret.
 * @returns {Buffer} 32-byte key
 */
function getDerivedKey() {
  return crypto.scryptSync(config.kms.fallbackSecret, 'salt_kdf_roktosetu', 32);
}

/**
 * Encrypts sensitive text (e.g., raw NID, bank account) using AES-256-GCM.
 * @param {string} plaintext - Sensitive text to encrypt
 * @returns {string} Base64 encoded payload format: iv:authTag:ciphertext
 */
export function encryptSensitiveData(plaintext) {
  if (!plaintext || typeof plaintext !== 'string') {
    throw new Error('Plaintext string is required for encryption');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getDerivedKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts sensitive text previously encrypted with encryptSensitiveData.
 * @param {string} encryptedPayload - Format: iv:authTag:ciphertext
 * @returns {string} Decrypted plaintext string
 */
export function decryptSensitiveData(encryptedPayload) {
  if (!encryptedPayload || typeof encryptedPayload !== 'string') {
    throw new Error('Encrypted payload string is required for decryption');
  }

  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getDerivedKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Computes a salted SHA-256 hash for duplicate identity detection.
 * Raw ID numbers are never stored in index tables.
 * @param {string} idType - 'nid' or 'passport'
 * @param {string} rawIdNumber - User provided ID number
 * @returns {string} Salted hex hash
 */
export function computeIdHash(idType, rawIdNumber) {
  if (!rawIdNumber) throw new Error('ID number is required to compute hash');
  const normalized = rawIdNumber.trim().toUpperCase().replace(/[\s-]/g, '');
  return crypto.createHash('sha256').update(`${SALT}:${idType}:${normalized}`).digest('hex');
}
