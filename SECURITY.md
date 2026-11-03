# Security Policy & Cryptographic Architecture

## 1. Supported Versions
Security updates are actively maintained and backported for the following versions of RoktoSetu:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

---

## 2. Reporting a Vulnerability
The RoktoSetu engineering team treats patient data confidentiality and system integrity as critical humanitarian duties.

If you believe you have found a security vulnerability in RoktoSetu:
1. **Do not** open a public issue on GitHub.
2. Email your detailed findings to **`security@roktosetu.org`**.
3. Include reproducible proof-of-concept steps or scripts.
4. Our security team will acknowledge your report within **24 hours** and provide regular progress updates through remediation.

---

## 3. STRIDE Threat Model & Mitigations Summary

| Threat Category | Potential Attack Vector | Applied RoktoSetu Safeguards |
| :--- | :--- | :--- |
| **Spoofing** | Attacker impersonates doctor or super-admin | Firebase Authentication with mandatory MFA, Cloud Functions Custom Claims validated strictly via `requireRole`, and BMDC doctor registration checks. |
| **Tampering** | User modifies donor verification status or inventory count | Deny-by-default Firestore Security Rules; client write access to `users_private`, `audit_logs`, `ledger_entries`, and `public_fundraisers` is blocked. All state transitions happen exclusively via Cloud Functions. |
| **Repudiation** | Staff member denies suspending user or approving payout | Append-only `audit_logs` collection with SHA-256 hashes recording `actorUid`, `timestamp`, `action`, and state diffs. Firestore rules prevent update/delete on audit logs. |
| **Information Disclosure** | Scraping donor GPS coordinates or NID numbers | 1. GPS coordinates fuzzed to ~500m geohash grid before seeker delivery.<br>2. Exact donor phone hidden until mutual request acceptance.<br>3. NID numbers encrypted with Google Cloud KMS (AES-256-GCM). |
| **Denial of Service** | Bot flooding donor match requests or webhooks | Sliding-window IP rate limiter, App Check enforcement (reCAPTCHA Enterprise), and SSRF validation blocking localhost and loopback targets. |
| **Elevation of Privilege** | Tenant A reads or transfers Tenant B's inventory | Organization scoping enforced in Firestore rules (`request.auth.token.orgId == resource.data.orgId`) and verified via automated tenant isolation unit tests. |

---

## 4. Cryptographic Standards
- **National ID Protection:** Hardware-backed Google Cloud KMS (`projects/roktosetu/locations/global/keyRings/roktosetu-security/cryptoKeys/nid-encryption-key`) with AES-256-GCM authenticated encryption.
- **Duplicate NID Detection:** Salted SHA-256 hash stored in `id_hash_index` prevents duplicate account creation without storing plaintext national identifiers.
- **Webhooks:** Timing-safe comparison using `crypto.timingSafeEqual` prevents timing attacks on HMAC-SHA256 signatures (`X-RoktoSetu-Signature-256`).
- **Financial Ledger:** Immutable double-entry bookkeeping with balanced debits/credits enforcement and audit event logging.
- **Section 17 Donor Certificates & ID Cards:**
  - HMAC-SHA256 digital signature embedded into all QR verification payloads.
  - Constant-time verification (`crypto.timingSafeEqual`) flags tampered or forged certificates.
  - Zero-PII public projection: public verification endpoints (`/verify/:certId` and `/card/:token`) return only sanitized name, level, issue date, and validity status. Contact phone numbers, home addresses, dates of birth, and NID numbers are strictly omitted.
- **Zero-Commercialization Filter:**
  - Boundary-aware Unicode regex matching blocks monetary demands for blood donation.
  - Scoped strictly to blood requests and chats (never applied to crowdfunding or invoices).
  - Explicit exemptions for auxiliary patient expenses (CNG/ambulance transport, hospital bills, cross-matching lab fees).
  - User-facing explanatory dialogs with false-positive audit appeals.
- **4-Eyes Critical Fundraiser Safeguards:**
  - Medical reviewer approval followed by senior reviewer sign-off (enforcing distinct individuals).
  - Forensic watermarked 60s document inspection sessions for reviewer audits.
  - Automated fraud detection analyzing duplicate document SHA-256 hashes, reused payout bank accounts, and PDF file anomalies.
