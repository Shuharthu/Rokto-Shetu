# RoktoSetu (রক্তসেতু)

> **"Every drop, a bridge to life." / "প্রতিটি ফোঁটা, জীবনের সেতু।"**

RoktoSetu is a production-ready, multi-tenant SaaS blood-donation network and transparent critical patient medical treatment crowdfunding platform designed for Bangladesh and multi-region deployment.

Built strictly with **zero client frameworks** (vanilla HTML5, CSS3, ES modules, PWA) and backed by **Google Firebase 2nd Gen / Google Cloud Platform**.

---

## 🏛️ The Three Platform Pillars

### 1. Free Community Blood Network
- **Live Interactive Map:** Powered by Leaflet & OpenStreetMap with ~500m geohash privacy fuzzing.
- **Expanding Ring Matching Engine:** Finds compatible donors in expanding radii (5 km, 10 km, 25 km) without exposing exact coordinates or telephone numbers until mutual acceptance.
- **Donor Availability Scheduler:** Weekly recurring + emergency-only availability with automated 90-day (male) and 120-day (female) donation recovery gap tracking.
- **Gamification & Rewards:** Bronze to Legend tiers, cryptographic partner discount coupons, digital donor ID card with dynamic QR, and PDF certificates with celebratory animations.
- **Anti-Commercialization Filter:** Automatic regex blocking of monetary/payment demands in both English and Bengali (`tk`, `taka`, `টাকা`, `মূল্য`).

### 2. Paid B2B Organization Workspace
- **Hospital Blood Bank CRM:** Multi-branch inventory tracking with strict First-Expired-First-Out (FEFO) dispensing algorithms.
- **Mobile Donation Drives & Camps:** RSVP manager, scheduling, and donor recall campaigns.
- **Public REST API & Webhooks:** Documented with OpenAPI 3.0, protected by timing-safe HMAC-SHA256 signatures and SSRF filters.
- **White-Labeling:** Custom CNAME subdomain delegation with automated SSL, brand color picker with WCAG contrast verification, and embeddable live inventory widgets.

### 3. Critical Patient Treatment Fundraiser
- **Ethical Decoupling:** Blood is never monetized; fundraisers cover hospital surgery and ICU treatment costs.
- **BMDC Doctor Validation:** Verifies Bangladesh Medical & Dental Council registration credentials.
- **Four-Eyes Sign-Off:** Dual-control review pipeline requiring independent medical verification and senior finance authorization before campaign activation.
- **Double-Entry Append-Only Ledger:** Mathematical accounting balance (`Debits === Credits`) in audited escrow accounts with staged milestone payouts against hospital invoices.

---

## 🛡️ Security & Privacy Architecture

- **Hardware-Backed Cryptography:** Sensitive National ID (NID) and Passport numbers are encrypted using Google Cloud KMS (`AES-256-GCM`).
- **De-Identified Duplicate Detection:** Salted SHA-256 hash indexing in `id_hash_index`.
- **SSRF Protection:** Webhook registration blocks loopback (`127.0.0.1`), RFC 1918 private subnets, and cloud metadata (`169.254.169.254`).
- **Timing-Safe Signatures:** Webhook verification leverages `crypto.timingSafeEqual` to eliminate side-channel timing attacks.
- **Deny-by-Default Firestore Rules:** 40+ collections locked down with strict tenant isolation, immutable audit logs, and custom claims RBAC.

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js 18+ (tested on Node.js 20 & 24)
- Google Chrome (for automated headless visual testing)

### Installation
```bash
# Clone the repository
git clone https://github.com/roktosetu/roktosetu.git
cd roktosetu

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### Running Local Static Server
```bash
# Starts the lightweight HTTP dev server on port 5000
node server.js
```
Open your browser at: **`http://localhost:5000/`**

---

## 🧪 Automated Test Suite (Phases 1–11)

The codebase includes 91 comprehensive automated unit and security tests verifying rules, encryption, matching, FEFO inventory, billing, fundraisers, and admin operations:

```bash
# Run all automated test suites
node tests/run-all-tests.js
```

### Automated Headless Browser Screenshots
```bash
# Captures 32 browser screenshots across desktop, mobile, light/dark themes, and English/Bangla
node tests/capture-screenshots.js
```

---

## 🌱 Database Seeding

Populate realistic Bangladesh hospitals (DMCH, NICVD, NICRH, NITOR), verified donors, FEFO inventory units, and critical fundraisers:

```bash
# Execute deterministic database seed
node seed/seed.js
```

---

## 📜 Legal & Compliance

- **Anti-Commercialization Charter:** Complies with Bangladesh Transfusion Medicine standards and World Health Organization guidelines. Blood is a gift of life and must never be sold.
- **License:** Proprietary humanitarian license for RoktoSetu Foundation.
