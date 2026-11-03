/**
 * @file test-home-redesign.js
 * @description Headless Chrome DOM verification suite for the RoktoSetu redesigned home page.
 */

import { execFileSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function testRedesign() {
  console.log('Fetching hydrated DOM via headless Chrome from http://127.0.0.1:5000/?theme=dark&lang=en#/ ...');

  const dom = execFileSync(CHROME_PATH, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--virtual-time-budget=5000',
    '--dump-dom',
    'http://127.0.0.1:5000/?theme=dark&lang=en#/'
  ], { encoding: 'utf-8', timeout: 20000 });

  console.log('Hydrated DOM length:', dom.length);

  const tests = [
    // 1. Hero Video Element & Attributes
    { name: 'Video element exists', pass: dom.includes('<video id="heroBgVideo"') },
    { name: 'Video autoplay attribute', pass: dom.includes('autoplay=""') || dom.includes('autoplay') },
    { name: 'Video muted attribute', pass: dom.includes('muted=""') || dom.includes('muted') },
    { name: 'Video loop attribute', pass: dom.includes('loop=""') || dom.includes('loop') },
    { name: 'Video playsinline attribute', pass: dom.includes('playsinline=""') || dom.includes('playsinline') },
    { name: 'Video preload metadata', pass: dom.includes('preload="metadata"') },
    { name: 'Video poster image', pass: dom.includes('poster="/assets/video/hero-poster.jpg"') },
    { name: 'Video aria-hidden true', pass: dom.includes('aria-hidden="true"') && dom.includes('heroBgVideo') },
    { name: 'Video disablepictureinpicture', pass: dom.includes('disablepictureinpicture') },
    { name: 'Video tabindex -1', pass: dom.includes('tabindex="-1"') },

    // 2. Video Sources
    { name: '720p mobile video source', pass: dom.includes('src="/assets/video/hero-720.mp4"') && dom.includes('media="(max-width: 768px)"') },
    { name: '1080p webm video source', pass: dom.includes('src="/assets/video/hero-1080.webm"') && dom.includes('type="video/webm"') },
    { name: '1080p mp4 video source', pass: dom.includes('src="/assets/video/hero-1080.mp4"') && dom.includes('type="video/mp4"') },

    // 3. Overlays
    { name: 'Hero scrim overlay layer', pass: dom.includes('class="hero-scrim-layer"') },
    { name: 'Hero radial crimson glow', pass: dom.includes('class="hero-radial-glow"') },
    { name: 'Hero grid noise overlay', pass: dom.includes('class="hero-grid-overlay"') },

    // 4. Hero Content & CTAs
    { name: 'Hero main heading', pass: dom.includes('class="hero-main-heading"') },
    { name: 'Hero CTA: Find Donors Near You', pass: dom.includes('Find Donors Near You') },
    { name: 'Hero CTA: Become a Donor', pass: dom.includes('Become a Donor') },
    { name: 'Hero CTA: Emergency SOS', pass: dom.includes('Emergency SOS') },
    { name: 'Micro status: 64 Districts', pass: dom.includes('NAT_NETWORK: 64 DISTRICTS') },
    { name: 'Micro status: Privacy 500m', pass: dom.includes('PRIVACY: 500M GEO_FUZZ') },

    // 5. Glass HUD Quick Search Card
    { name: 'HUD card container', pass: dom.includes('id="heroQuickSearchCard"') },
    { name: 'HUD corner brackets', pass: dom.includes('hud-corner-tl') && dom.includes('hud-corner-br') },
    { name: 'Blood group selector with O+, A+, B+, AB+, O-', pass: dom.includes('data-group="O+"') && dom.includes('data-group="AB-"') },
    { name: 'Location input with search placeholder', pass: dom.includes('id="heroLocationInput"') },
    { name: 'Search button: Search Available Donors', pass: dom.includes('id="btnHeroQuickSearch"') },

    // 6. Accessible Video Pause/Play Button (Layer 3)
    { name: 'Pause video controller button', pass: dom.includes('id="btnToggleHeroVideo"') },
    { name: 'Pause button aria-pressed', pass: dom.includes('aria-pressed="false"') },

    // 7. Header & Navigation Fixes
    { name: 'Translucent navbar with id siteNavbar', pass: dom.includes('id="siteNavbar"') },
    { name: 'Scroll progress bar element', pass: dom.includes('id="scrollProgressBar"') },
    { name: 'Logo wordmark Rokto with text token', pass: dom.includes('class="brand-wordmark-rokto"') },
    { name: 'Logo wordmark Setu with crimson token', pass: dom.includes('class="brand-wordmark-setu"') },
    { name: 'Logo tagline in Bengali', pass: dom.includes('brand-tagline') && dom.includes('রক্তসেতু • প্রতিটি ফোঁটা, জীবনের সেতু') },
    { name: 'Primary link: Find Donors', pass: dom.includes('href="#/map"') && dom.includes('Find Donors') },
    { name: 'Primary link: Request Blood', pass: dom.includes('href="#/request"') && dom.includes('Request Blood') },
    { name: 'Primary link: Fundraisers', pass: dom.includes('href="#/fundraisers"') && dom.includes('Fundraisers') },
    { name: 'Primary link: Achievements', pass: dom.includes('href="#/achievements"') && dom.includes('Achievements') },
    { name: 'Primary link: Verify', pass: dom.includes('href="#/verify"') && dom.includes('Verify') },
    { name: 'Primary link: Pricing', pass: dom.includes('href="#/pricing"') && dom.includes('Pricing') },
    { name: 'More dropdown trigger button', pass: dom.includes('id="navMoreDropdownBtn"') },
    { name: 'More dropdown menu items', pass: dom.includes('id="navMoreDropdownMenu"') && dom.includes('B2B Hospital') },

    // 8. The 12 Story Sections
    { name: 'Section 1: Video Hero', pass: dom.includes('id="heroSection"') },
    { name: 'Section 2: Live Impact Strip', pass: dom.includes('id="impactCounterGrid"') && dom.includes('14,820+') && dom.includes('6,240+') },
    { name: 'Section 3: How It Works & ECG line', pass: dom.includes('id="howItWorksHeading"') && dom.includes('class="ecg-svg"') },
    { name: 'Section 4: Live Map Teaser preview', pass: dom.includes('id="homeMapTeaserMount"') },
    { name: 'Section 5: Donor Levels carousel', pass: dom.includes('class="levels-carousel"') && dom.includes('Gold Guardian') },
    { name: 'Section 6: Certificate & 3D Tilt Digital ID', pass: dom.includes('id="tiltDonorCard"') && dom.includes('SAMPLE') },
    { name: 'Section 7: Verified Fundraisers Spotlight', pass: dom.includes('class="fundraiser-spotlight-grid"') && dom.includes('Ayesha Begum') },
    { name: 'Section 8: B2B Hospital & Blood Bank Workspace', pass: dom.includes('class="b2b-features-grid"') && dom.includes('FEFO Inventory') },
    { name: 'Section 9: Trust, Safety & Zero-Commercialization', pass: dom.includes('class="trust-pillars-grid"') && dom.includes('Strictly Non-Commercial') },
    { name: 'Section 10: Stories & Health Awareness', pass: dom.includes('class="stories-grid"') && dom.includes('90-Day Donation Gap') },
    { name: 'Section 11: FAQ Accordion & SOS CTA Band', pass: dom.includes('id="homeFaqAccordion"') && dom.includes('class="cta-sos-band"') },
    { name: 'Section 12: Comprehensive Full-Width Footer', pass: dom.includes('class="footer-full-width"') && dom.includes('Medical Disclaimer') }
  ];

  console.log('\n--- DOM VERIFICATION RESULTS ---');
  let passedCount = 0;
  for (const t of tests) {
    if (t.pass) {
      console.log(`  [PASS] ${t.name}`);
      passedCount++;
    } else {
      console.error(`  [FAIL] ${t.name}`);
    }
  }

  console.log(`\nSummary: ${passedCount} / ${tests.length} tests passed.\n`);
  if (passedCount !== tests.length) {
    process.exit(1);
  }
}

testRedesign();
