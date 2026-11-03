import { execFileSync } from 'child_process';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = 'C:\\Users\\UESR\\.gemini\\antigravity\\brain\\3dc8820f-f5b9-4cf2-94ab-d5b06264e33b\\screenshots';

const mobileTargets = [
  { name: 'mobile-responsive-home.png', url: 'http://localhost:5000/#/', width: 375, height: 812 },
  { name: 'mobile-responsive-map.png', url: 'http://localhost:5000/#/map', width: 375, height: 812 },
  { name: 'mobile-responsive-achievements.png', url: 'http://localhost:5000/#/achievements', width: 375, height: 950 },
  { name: 'mobile-responsive-apply.png', url: 'http://localhost:5000/#/fundraiser/apply', width: 375, height: 950 }
];

for (const t of mobileTargets) {
  const out = path.join(SCREENSHOT_DIR, t.name);
  console.log(`Capturing mobile [${t.name}] (${t.width}x${t.height}) from ${t.url}...`);
  execFileSync(CHROME_PATH, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--window-size=${t.width},${t.height}`,
    `--screenshot=${out}`,
    t.url
  ]);
  console.log(`✓ Saved: ${out}`);
}

console.log('Mobile responsiveness capture completed.');
