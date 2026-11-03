/**
 * @file capture-screenshots.js
 * @description Automated headless Chrome screenshot runner for browser walkthrough artifact.
 */

import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'C:\\Users\\UESR\\.gemini\\antigravity\\brain\\3dc8820f-f5b9-4cf2-94ab-d5b06264e33b\\screenshots';
const TEMP_USER_DATA = path.join(os.tmpdir(), 'chrome_headless_screens');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const CAPTURE_TARGETS = [
  {
    name: 'desktop-light-home.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-dark-home.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-bn-home.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=bn#/',
    width: 1280,
    height: 900
  },
  {
    name: 'mobile-dark-home.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/',
    width: 375,
    height: 812
  },
  {
    name: 'desktop-register-wizard.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=bn#/register',
    width: 1280,
    height: 950
  },
  {
    name: 'desktop-verify-queue.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/verify-queue',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-map-search.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/map',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-request-blood.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/request',
    width: 1280,
    height: 950
  },
  {
    name: 'desktop-availability-scheduler.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/availability',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-moderated-chat.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/chat',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-donor-levels.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/donor/profile',
    width: 1280,
    height: 1100
  },
  {
    name: 'desktop-rewards-catalog.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/rewards',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-leaderboard.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/leaderboard',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-certificate.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/certificate',
    width: 1280,
    height: 950
  },
  {
    name: 'desktop-org-dashboard.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/org',
    width: 1280,
    height: 1000
  },
  {
    name: 'desktop-org-inventory.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/org/inventory',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-org-campaigns.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/org/campaigns',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-org-crm.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/org/crm',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-pricing.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/pricing',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-api-keys.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/org/api-keys',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-white-label.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/org/white-label',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-fundraisers.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/fundraisers',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-fundraiser-apply.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/fundraiser/apply',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-fundraiser-view.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/fundraiser/view',
    width: 1280,
    height: 950
  },
  {
    name: 'desktop-fundraiser-payout.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/fundraiser/payout',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-admin-dashboard.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/admin',
    width: 1280,
    height: 1000
  },
  {
    name: 'desktop-admin-moderation.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/admin/moderation',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-admin-fundraisers.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/admin/fundraisers',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-admin-audit.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/admin/audit',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-compatibility.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/compatibility',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-eligibility.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/eligibility',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-faq.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/faq',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-terms.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/terms',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-achievements.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/achievements',
    width: 1280,
    height: 950
  },
  {
    name: 'mobile-achievements.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=bn#/achievements',
    width: 375,
    height: 900
  },
  {
    name: 'desktop-verify-cert.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/verify/CERT-2026-DEMO01',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-verify-card.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/card/tok_mock_verified_donor_token_2026',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-share-card.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/a/sh_demo_gold',
    width: 1280,
    height: 900
  },
  {
    name: 'desktop-fundraiser-apply-6step.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/fundraiser/apply',
    width: 1280,
    height: 950
  }
];

console.log('Starting automated browser screenshot capture...');

for (const target of CAPTURE_TARGETS) {
  const outputPath = path.join(SCREENSHOT_DIR, target.name);
  console.log(`Capturing [${target.name}] (${target.width}x${target.height}) from ${target.url}...`);

  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--window-size=${target.width},${target.height}`,
    `--user-data-dir=${TEMP_USER_DATA}`,
    `--screenshot=${outputPath}`,
    target.url
  ];

  try {
    execFileSync(CHROME_PATH, args, { stdio: 'inherit' });
    console.log(`✓ Saved: ${outputPath}`);
  } catch (err) {
    console.error(`Failed to capture ${target.name}:`, err.message);
  }
}

console.log('All screenshots captured successfully!');
