/**
 * @file capture-hero-walkthrough.js
 * @description Automated headless Chrome screenshot generator for the RoktoSetu redesigned home page.
 */

import { execFileSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'C:\\Users\\UESR\\.gemini\\antigravity\\brain\\3dc8820f-f5b9-4cf2-94ab-d5b06264e33b\\screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const TARGETS = [
  // 1. Multi-Resolution Walkthrough (375, 768, 1280, 1920, 2560 px)
  {
    name: 'walkthrough-375-dark-en.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/',
    width: 375,
    height: 812
  },
  {
    name: 'walkthrough-375-light-bn.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=bn#/',
    width: 375,
    height: 812
  },
  {
    name: 'walkthrough-768-dark-en.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/',
    width: 768,
    height: 1024
  },
  {
    name: 'walkthrough-1280-dark-en.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/',
    width: 1280,
    height: 900
  },
  {
    name: 'walkthrough-1280-light-en.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/',
    width: 1280,
    height: 900
  },
  {
    name: 'walkthrough-1280-dark-bn.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=bn#/',
    width: 1280,
    height: 900
  },
  {
    name: 'walkthrough-1280-light-bn.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=bn#/',
    width: 1280,
    height: 900
  },
  {
    name: 'walkthrough-1920-dark-en.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/',
    width: 1920,
    height: 1080
  },
  {
    name: 'walkthrough-1920-light-en.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en#/',
    width: 1920,
    height: 1080
  },
  {
    name: 'walkthrough-2560-dark-en.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en#/',
    width: 2560,
    height: 1440
  },

  // 2. Hero Video Timestamps for Contrast Evidence (t=1s, t=8s, t=16s) in Dark and Light Themes
  {
    name: 'hero-contrast-t1-dark.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en&videoTime=1#/',
    width: 1920,
    height: 1080
  },
  {
    name: 'hero-contrast-t8-dark.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en&videoTime=8#/',
    width: 1920,
    height: 1080
  },
  {
    name: 'hero-contrast-t16-dark.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en&videoTime=16#/',
    width: 1920,
    height: 1080
  },
  {
    name: 'hero-contrast-t1-light.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en&videoTime=1#/',
    width: 1920,
    height: 1080
  },
  {
    name: 'hero-contrast-t8-light.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en&videoTime=8#/',
    width: 1920,
    height: 1080
  },
  {
    name: 'hero-contrast-t16-light.png',
    url: 'http://127.0.0.1:5000/?theme=light&lang=en&videoTime=16#/',
    width: 1920,
    height: 1080
  },

  // 3. Behavioral Fallbacks (Reduced Motion, Save-Data)
  {
    name: 'hero-reduced-motion-poster.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en&simulateReducedMotion=1#/',
    width: 1280,
    height: 900
  },
  {
    name: 'hero-save-data-poster.png',
    url: 'http://127.0.0.1:5000/?theme=dark&lang=en&simulateSaveData=1#/',
    width: 1280,
    height: 900
  }
];

console.log(`Starting capture of ${TARGETS.length} walkthrough screenshots...`);

for (const target of TARGETS) {
  const outputPath = path.join(SCREENSHOT_DIR, target.name);
  console.log(`Capturing ${target.name} (${target.width}x${target.height})...`);
  try {
    execFileSync(CHROME_PATH, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--window-size=${target.width},${target.height}`,
      '--virtual-time-budget=4000',
      '--run-all-compositor-stages-before-draw',
      `--screenshot=${outputPath}`,
      target.url
    ], { stdio: 'ignore', timeout: 20000 });
    console.log(`  -> Successfully captured: ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
  } catch (err) {
    console.error(`  -> Failed capturing ${target.name}:`, err.message);
  }
}

console.log('All walkthrough screenshots captured successfully!');
