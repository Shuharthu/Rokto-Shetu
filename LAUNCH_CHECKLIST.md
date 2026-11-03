# RoktoSetu Production Launch Checklist

This checklist must be reviewed and signed off by the Security Architect, Lead Engineer, and Legal Counsel prior to deploying to the production Firebase environment.

---

## 1. Firebase Identity Platform & Auth Setup
- [ ] Upgrade Firebase project to Google Cloud Identity Platform.
- [ ] Enforce mandatory Multi-Factor Authentication (SMS / TOTP) for all administrative and verifier staff.
- [ ] Enable Google Sign-In and Email Link passwordless authentication.
- [ ] Configure Authorized Domains in Firebase Auth console (`roktosetu.org`, `auth.roktosetu.org`).

## 2. Firebase App Check Enforcement
- [ ] Register Web App with reCAPTCHA Enterprise in Google Cloud Console.
- [ ] Enable App Check enforcement for Cloud Functions, Cloud Storage, and Firestore.
- [ ] Verify that debug tokens are restricted to local development environments only.

## 3. Google Cloud KMS Provisioning
- [ ] Create Key Ring: `projects/roktosetu-prod/locations/global/keyRings/roktosetu-security`.
- [ ] Create CryptoKey: `nid-encryption-key` with 90-day automatic rotation schedule.
- [ ] Grant `roles/cloudkms.cryptoKeyEncrypterDecrypter` exclusively to the Cloud Functions runtime service account (`roktosetu-prod@appspot.gserviceaccount.com`).

## 4. Telephony & SMS Provider Configuration
- [ ] Register official Sender ID with Bangladesh Telecommunication Regulatory Commission (BTRC).
- [ ] Store SMS Gateway API keys in Google Secret Manager (`ROKTOSETU_SMS_GATEWAY_TOKEN`).
- [ ] Configure low-balance automated recharge alert when SMS pool drops below 5,000 credits.

## 5. Payments & Double-Entry Escrow Verification
- [ ] Register merchant agreements with bKash (bKash Payment Gateway) and SSLCommerz.
- [ ] Store webhook signing secrets in Secret Manager (`BKASH_WEBHOOK_SECRET`, `SSLCOMMERZ_STORE_PASS`).
- [ ] Verify double-entry ledger invariant tests pass (`sum(debits) === sum(credits)`).
- [ ] Confirm zero platform fees are deducted from patient treatment tranches.

## 6. Custom Domains & White-Label Infrastructure
- [ ] Configure DNS A and CNAME records pointing `roktosetu.org` and `*.roktosetu.org` to Firebase Hosting.
- [ ] Verify Let's Encrypt / Google Trust Services SSL certificate provisioning.
- [ ] Test hospital white-label subdomains (e.g. `blood.dhakacentral.org -> cname.roktosetu.org`).

## 7. Firestore Security Rules & Storage Guardrails
- [ ] Verify Firestore security rules pass automated tenant isolation test harness.
- [ ] Confirm client direct write access to `audit_logs`, `users_private`, and `ledger_entries` is denied.
- [ ] Test Cloud Storage rules enforce 8MB upload ceiling and valid image MIME types (`image/jpeg`, `image/png`, `application/pdf`).

## 8. Backup, Disaster Recovery & BigQuery Export
- [ ] Schedule daily automated Firestore exports to a Cloud Storage cold-line bucket.
- [ ] Enable Firestore-to-BigQuery streaming extension for national epidemiological supply/demand analytics.
- [ ] Set Cloud Storage bucket retention policy to prevent accidental object deletion.

## 9. Ethics, Certification & Anti-Commercialization Audit
- [ ] Verify automated chat and request filters block monetary terms in English and Bengali (`tk`, `taka`, `টাকা`, `মূল্য`) using boundary-aware Unicode matching.
- [ ] Verify legitimate medical/transport expenses (CNG/ambulance, hospital admission, cross-match lab fees) are exempted from chat block.
- [ ] Verify donor coordinates are fuzzed to ~500m geohash grid before client delivery.
- [ ] Verify donor telephone numbers remain hidden until mutual request acceptance.
- [ ] Configure `CERT_HMAC_SECRET` in Google Secret Manager for tamper-proof certificate signing.
- [ ] Verify public verification endpoints (`/verify/:certId` and `/card/:token`) return zero PII.
- [ ] Verify automatic certificate issuance triggers strictly on 3rd verified donation (server-side only).
- [ ] Test Apple Wallet (`.pkpass`) signing certificates and Google Wallet Issuer Account integration.
- [ ] Verify Open Graph and Twitter Card dynamic meta tags for social achievement sharing (`/a/:shareId`).

## 10. Critical Patient Fundraisers & 4-Eyes Payout Safeguards
- [ ] Verify strict 4-Eyes review separation (First Eye: Medical Reviewer; Second Eye: Senior Administrator).
- [ ] Verify watermarked 60-second signed URL viewer functions for reviewer document inspections.
- [ ] Ensure automated fraud engine flags duplicate document SHA-256 hashes and reused payout accounts.
- [ ] Confirm double-entry financial ledger balances on all donation and milestone payouts.

## 11. Legal, Privacy & Compliance Sign-Off
- [ ] Legal counsel sign-off on Terms of Service, Privacy Policy, and Medical Disclaimer.
- [ ] Verify compliance with Bangladesh ICT Act 2006, Digital Security Act, and Medical Council directives.
- [ ] Ensure all mock and seed data is isolated from production collections.
