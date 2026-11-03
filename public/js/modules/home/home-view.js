/**
 * @file home-view.js
 * @description Comprehensive 12-section bio-tech scrollable experience for RoktoSetu home page.
 */

import { t, translateDOM } from '../../core/i18n.js';
import { HeroVideoController } from './hero-video.js';
import { toast } from '../../core/toast.js';

export class HomeView {
  constructor(containerId = 'appRoot') {
    this.container = document.getElementById(containerId);
    this.videoController = null;
    this.mapInstance = null;
    this.counterObserver = null;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <main class="home-main-layout">
        <!-- 1. VIDEO HERO SECTION (Flush under Sticky Header) -->
        <section class="hero-video-section" id="heroSection" aria-label="RoktoSetu Introduction">
          <div class="hero-media-wrapper" aria-hidden="true">
            <video id="heroBgVideo"
                   autoplay
                   muted
                   loop
                   playsinline
                   preload="metadata"
                   poster="/assets/video/hero-poster.jpg"
                   aria-hidden="true"
                   disablepictureinpicture
                   tabindex="-1">
              <source src="/assets/video/hero-720.mp4" type="video/mp4" media="(max-width: 768px)">
              <source src="/assets/video/hero-1080.webm" type="video/webm">
              <source src="/assets/video/hero-1080.mp4" type="video/mp4">
            </video>
            <div class="hero-scrim-layer"></div>
            <div class="hero-radial-glow"></div>
            <div class="hero-grid-overlay"></div>
          </div>

          <div class="hero-content-container">
            <div class="hero-grid-layout">
              <!-- Left Column: Hero Text & CTAs -->
              <div class="hero-text-block">
                <div class="hero-badge-pill">
                  <span class="live-pulse-dot" aria-hidden="true"></span>
                  <span class="mono-tag" data-i18n="hero.badge">${t('hero.badge')}</span>
                </div>

                <h1 class="hero-main-heading">
                  <span data-i18n="hero.titlePrefix">${t('hero.titlePrefix')}</span>
                  <span class="gradient-crimson-text" data-i18n="hero.titleHighlight">${t('hero.titleHighlight')}</span>
                </h1>

                <p class="hero-lead-text" data-i18n="hero.subtitle">
                  ${t('hero.subtitle')}
                </p>

                <div class="hero-actions-cluster">
                  <a href="#/map" class="btn btn-primary btn-lg btn-glow" data-i18n="hero.btnFindDonor">${t('hero.btnFindDonor')}</a>
                  <a href="#/register" class="btn btn-outline btn-lg" data-i18n="hero.btnBecomeDonor">${t('hero.btnBecomeDonor')}</a>
                  <button type="button" class="btn btn-sos btn-lg btn-emergency-sos-action" data-i18n="hero.btnEmergencySos">
                    <span class="sos-icon" aria-hidden="true">⚡</span> ${t('hero.btnEmergencySos')}
                  </button>
                </div>

                <div class="hero-micro-status">
                  <div class="micro-status-item">
                    <span class="status-indicator" aria-hidden="true"></span>
                    <span class="micro-status-label" data-i18n="hero.statusNational">${t('hero.statusNational')}</span>
                  </div>
                  <div class="micro-status-item">
                    <span class="status-indicator teal" aria-hidden="true"></span>
                    <span class="micro-status-label" data-i18n="hero.statusPrivacy">${t('hero.statusPrivacy')}</span>
                  </div>
                </div>
              </div>

              <!-- Right Column: Glass HUD Quick Search Card -->
              <div class="hero-card-block">
                <div class="card glass-hud-card" id="heroQuickSearchCard">
                  <div class="hud-corner-tl" aria-hidden="true"></div>
                  <div class="hud-corner-tr" aria-hidden="true"></div>
                  <div class="hud-corner-bl" aria-hidden="true"></div>
                  <div class="hud-corner-br" aria-hidden="true"></div>

                  <div class="hud-card-header">
                    <div class="hud-title-wrap">
                      <span class="mono-micro-badge">GEO_RADAR</span>
                      <h2 class="hud-card-title" data-i18n="searchCard.title">${t('searchCard.title')}</h2>
                    </div>
                    <span class="live-status-pill">ACTIVE</span>
                  </div>

                  <form id="heroQuickSearchForm" onsubmit="event.preventDefault();">
                    <div class="form-group">
                      <label class="form-label" data-i18n="searchCard.bloodGroupLabel">${t('searchCard.bloodGroupLabel')}</label>
                      <div class="blood-group-selector" id="heroBloodSelector" role="radiogroup" aria-label="Select Blood Group">
                        <button type="button" role="radio" aria-checked="true" class="blood-btn active" data-group="O+">O+</button>
                        <button type="button" role="radio" aria-checked="false" class="blood-btn" data-group="A+">A+</button>
                        <button type="button" role="radio" aria-checked="false" class="blood-btn" data-group="B+">B+</button>
                        <button type="button" role="radio" aria-checked="false" class="blood-btn" data-group="AB+">AB+</button>
                        <button type="button" role="radio" aria-checked="false" class="blood-btn" data-group="O-">O-</button>
                        <button type="button" role="radio" aria-checked="false" class="blood-btn" data-group="A-">A-</button>
                        <button type="button" role="radio" aria-checked="false" class="blood-btn" data-group="B-">B-</button>
                        <button type="button" role="radio" aria-checked="false" class="blood-btn" data-group="AB-">AB-</button>
                      </div>
                    </div>

                    <div class="form-group">
                      <label class="form-label" for="heroLocationInput" data-i18n="searchCard.locationLabel">${t('searchCard.locationLabel')}</label>
                      <div class="input-with-icon">
                        <span class="input-icon" aria-hidden="true">📍</span>
                        <input type="text" id="heroLocationInput" class="form-input" value="Dhaka, Bangladesh" data-i18n-placeholder="searchCard.locationPlaceholder" placeholder="Search District or Hospital...">
                      </div>
                    </div>

                    <button type="button" id="btnHeroQuickSearch" class="btn btn-primary btn-block btn-lg" style="margin-top: var(--space-4);" data-i18n="searchCard.btnSearch">
                      ${t('searchCard.btnSearch')}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom-Right Video Play/Pause Accessible Controller (Layer 3) -->
          <div class="hero-video-controller">
            <button type="button"
                    id="btnToggleHeroVideo"
                    class="btn-video-control"
                    aria-pressed="false"
                    aria-label="${t('hero.pauseVideo')}"
                    data-i18n-label="hero.pauseVideo">
              <span class="pause-icon" aria-hidden="true">⏸</span>
              <span class="play-icon" aria-hidden="true" style="display:none;">▶</span>
              <span class="video-control-text" data-i18n="hero.pauseVideoText">${t('hero.pauseVideoText')}</span>
            </button>
          </div>
        </section>

        <!-- 2. LIVE IMPACT STRIP (Section 2) -->
        <section class="impact-strip-section" aria-label="Verified Platform Impact">
          <div class="container-wide">
            <div class="impact-grid" id="impactCounterGrid">
              <div class="impact-card">
                <div class="impact-number" data-target="14820">14,820+</div>
                <div class="impact-label" data-i18n="impact.donorsLabel">${t('impact.donorsLabel')}</div>
              </div>
              <div class="impact-card">
                <div class="impact-number" data-target="6240">6,240+</div>
                <div class="impact-label" data-i18n="impact.requestsLabel">${t('impact.requestsLabel')}</div>
              </div>
              <div class="impact-card">
                <div class="impact-number" data-target="64">64</div>
                <div class="impact-label" data-i18n="impact.districtsLabel">${t('impact.districtsLabel')}</div>
              </div>
              <div class="impact-card">
                <div class="impact-number" style="color:var(--color-text-teal);">100%</div>
                <div class="impact-label" data-i18n="impact.voluntaryLabel">${t('impact.voluntaryLabel')}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. HOW IT WORKS (Section 3) -->
        <section class="section-aurora-wrap section-aurora-1" aria-labelledby="howItWorksHeading">
          <div class="container-wide">
            <div class="section-header-block">
              <span class="section-pretitle">ARCHITECTURE</span>
              <h2 class="section-title" id="howItWorksHeading" data-i18n="howItWorks.heading">${t('howItWorks.heading')}</h2>
              <p class="section-subtitle" data-i18n="howItWorks.subheading">${t('howItWorks.subheading')}</p>
            </div>

            <!-- ECG Heartbeat SVG Animation -->
            <div class="ecg-line-wrapper" aria-hidden="true">
              <svg class="ecg-svg" viewBox="0 0 800 60">
                <path d="M0,30 L280,30 L300,10 L315,50 L330,15 L345,45 L360,30 L800,30" />
              </svg>
            </div>

            <div class="timeline-grid">
              <div class="step-card-modern">
                <div class="step-badge-num">01</div>
                <h3 class="step-title-modern" data-i18n="howItWorks.step1Title">${t('howItWorks.step1Title')}</h3>
                <p class="step-desc-modern" data-i18n="howItWorks.step1Desc">${t('howItWorks.step1Desc')}</p>
              </div>

              <div class="step-card-modern">
                <div class="step-badge-num">02</div>
                <h3 class="step-title-modern" data-i18n="howItWorks.step2Title">${t('howItWorks.step2Title')}</h3>
                <p class="step-desc-modern" data-i18n="howItWorks.step2Desc">${t('howItWorks.step2Desc')}</p>
              </div>

              <div class="step-card-modern">
                <div class="step-badge-num">03</div>
                <h3 class="step-title-modern" data-i18n="howItWorks.step3Title">${t('howItWorks.step3Title')}</h3>
                <p class="step-desc-modern" data-i18n="howItWorks.step3Desc">${t('howItWorks.step3Desc')}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. LIVE MAP TEASER (Section 4) -->
        <section class="section-aurora-wrap section-aurora-2" aria-labelledby="mapTeaserHeading">
          <div class="container-wide">
            <div class="section-header-block">
              <span class="section-pretitle" data-i18n="mapTeaser.liveBadge">${t('mapTeaser.liveBadge')}</span>
              <h2 class="section-title" id="mapTeaserHeading" data-i18n="mapTeaser.heading">${t('mapTeaser.heading')}</h2>
              <p class="section-subtitle" data-i18n="mapTeaser.subheading">${t('mapTeaser.subheading')}</p>
            </div>

            <div class="map-teaser-card">
              <div class="map-teaser-header">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="live-pulse-dot" aria-hidden="true"></span>
                  <span style="font-family:monospace; font-size:0.85rem; font-weight:700;">BANGLADESH_LIVE_CLUSTERS</span>
                </div>
                <a href="#/map" class="btn btn-primary btn-sm" data-i18n="mapTeaser.btnOpenMap">${t('mapTeaser.btnOpenMap')}</a>
              </div>
              <div id="homeMapTeaserMount" class="map-teaser-preview"></div>
            </div>
          </div>
        </section>

        <!-- 5. DONOR LEVELS SHOWCASE (Section 5) -->
        <section class="section-aurora-wrap section-aurora-1" aria-labelledby="levelsHeading">
          <div class="container-wide">
            <div class="section-header-block">
              <span class="section-pretitle">GAMIFICATION</span>
              <h2 class="section-title" id="levelsHeading" data-i18n="levels.heading">${t('levels.heading')}</h2>
              <p class="section-subtitle" data-i18n="levels.subheading">${t('levels.subheading')}</p>
            </div>

            <div class="levels-carousel-wrapper">
              <div class="levels-carousel" role="region" aria-label="Donor Milestones">
                <div class="level-card-snap">
                  <div class="level-icon-badge">🥉</div>
                  <h3 class="level-card-title">Bronze</h3>
                  <div class="level-card-count" data-i18n="levels.bronze">${t('levels.bronze')}</div>
                </div>

                <div class="level-card-snap">
                  <div class="level-icon-badge">🥈</div>
                  <h3 class="level-card-title">Silver</h3>
                  <div class="level-card-count" data-i18n="levels.silver">${t('levels.silver')}</div>
                </div>

                <div class="level-card-snap active-level">
                  <div class="level-icon-badge">🥇</div>
                  <h3 class="level-card-title">Gold Guardian</h3>
                  <div class="level-card-count" data-i18n="levels.gold">${t('levels.gold')}</div>
                  <span class="badge" style="margin-top:10px; background:var(--color-crimson); color:#fff; font-size:0.7rem;">MOST POPULAR</span>
                </div>

                <div class="level-card-snap">
                  <div class="level-icon-badge">💠</div>
                  <h3 class="level-card-title">Platinum</h3>
                  <div class="level-card-count" data-i18n="levels.platinum">${t('levels.platinum')}</div>
                </div>

                <div class="level-card-snap">
                  <div class="level-icon-badge">💎</div>
                  <h3 class="level-card-title">Diamond Savior</h3>
                  <div class="level-card-count" data-i18n="levels.diamond">${t('levels.diamond')}</div>
                </div>

                <div class="level-card-snap">
                  <div class="level-icon-badge">👑</div>
                  <h3 class="level-card-title">Legend</h3>
                  <div class="level-card-count" data-i18n="levels.legend">${t('levels.legend')}</div>
                </div>
              </div>
            </div>

            <p style="text-align:center; font-size:0.9rem; color:var(--color-text-secondary); margin-top:16px;" data-i18n="levels.progressExample">
              ${t('levels.progressExample')}
            </p>
          </div>
        </section>

        <!-- 6. CERTIFICATE & DIGITAL ID SHOWCASE (Section 6) -->
        <section class="section-aurora-wrap section-aurora-2" aria-labelledby="idCardHeading">
          <div class="container-wide">
            <div class="section-header-block">
              <span class="section-pretitle">IDENTITY CREDENTIALS</span>
              <h2 class="section-title" id="idCardHeading" data-i18n="idCard.heading">${t('idCard.heading')}</h2>
              <p class="section-subtitle" data-i18n="idCard.subheading">${t('idCard.subheading')}</p>
            </div>

            <div class="showcase-grid-dual">
              <!-- Digital Donor ID Card (3D Tilt Card) -->
              <div class="tilt-perspective-box">
                <div class="tilt-card-element sample-id-card" id="tiltDonorCard">
                  <div class="sample-watermark" aria-hidden="true">SAMPLE</div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="font-size:1.5rem;">🩸</span>
                      <div>
                        <div style="font-size:1.1rem; font-weight:800; letter-spacing:-0.02em;">RoktoSetu</div>
                        <div style="font-size:0.65rem; color:#A0A0B0; letter-spacing:0.05em;" data-i18n="idCard.sampleNotice">${t('idCard.sampleNotice')}</div>
                      </div>
                    </div>
                    <span style="font-size:1.8rem; font-weight:900; color:#D90429;">O+</span>
                  </div>

                  <div style="display:flex; gap:16px; align-items:center; margin-bottom:24px;">
                    <div style="width:64px; height:64px; border-radius:50%; background:#2A2A34; border:2px solid #D90429; display:flex; align-items:center; justify-content:center; font-size:1.8rem;">
                      👤
                    </div>
                    <div>
                      <div style="font-size:1.2rem; font-weight:700;">Tanvir Ahmed</div>
                      <div style="font-size:0.8rem; color:#A0A0B0; font-family:monospace;">ID: RS-2026-894215</div>
                      <div style="font-size:0.8rem; color:#2A9D8F; font-weight:600;">Verified Blood Donor</div>
                    </div>
                  </div>

                  <div style="display:flex; justify-content:space-between; align-items:flex-end; font-size:0.75rem; color:#A0A0B0; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">
                    <div>
                      <div>MEMBER SINCE: 2024</div>
                      <div>VALID THROUGH: 2027</div>
                    </div>
                    <div style="width:48px; height:48px; background:#fff; padding:3px; border-radius:6px; display:flex; align-items:center; justify-content:center;">
                      <div style="width:100%; height:100%; background:#000; display:flex; align-items:center; justify-content:center; color:#fff; font-size:9px; font-weight:bold;">QR</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Certificate Preview -->
              <div class="card" style="padding:clamp(24px, 3vw, 36px); background:var(--color-card-bg); border:1.5px solid var(--color-border); border-radius:var(--radius-xl);">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
                  <span style="font-size:1.5rem;">📜</span>
                  <span class="mono-micro-badge">OFFICIAL_ACCREDITATION</span>
                </div>
                <h3 style="font-size:1.4rem; font-weight:800; margin-bottom:12px;" data-i18n="idCard.certTitle">${t('idCard.certTitle')}</h3>
                <p style="font-size:0.92rem; color:var(--color-text-secondary); line-height:1.6; margin-bottom:20px;" data-i18n="idCard.cardNotice">
                  ${t('idCard.cardNotice')}
                </p>
                <div style="display:flex; gap:12px; flex-wrap:wrap;">
                  <a href="#/verify" class="btn btn-outline" data-i18n="idCard.btnViewCert">${t('idCard.btnViewCert')}</a>
                  <a href="#/achievements" class="btn btn-primary">My Achievements</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 7. CRITICAL PATIENT FUNDRAISERS SPOTLIGHT (Section 7) -->
        <section class="section-aurora-wrap section-aurora-1" aria-labelledby="fundraiserHeading">
          <div class="container-wide">
            <div class="section-header-block">
              <span class="section-pretitle">ESCROW CROWDFUNDING</span>
              <h2 class="section-title" id="fundraiserHeading" data-i18n="fundraiserSpotlight.heading">${t('fundraiserSpotlight.heading')}</h2>
              <p class="section-subtitle" data-i18n="fundraiserSpotlight.subheading">${t('fundraiserSpotlight.subheading')}</p>
            </div>

            <div class="fundraiser-spotlight-grid">
              <div class="fundraiser-spotlight-card">
                <div class="fundraiser-card-body">
                  <div class="badge-verified-rs" data-i18n="fundraiserSpotlight.verifiedBadge">
                    <span>🛡️</span> ${t('fundraiserSpotlight.verifiedBadge')}
                  </div>
                  <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:8px;">Ayesha Begum (Heart Surgery)</h3>
                  <div style="font-size:0.85rem; color:var(--color-text-secondary); margin-bottom:16px;">
                    National Heart Foundation, Dhaka • BMDC #41829
                  </div>
                  <div style="margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:700; margin-bottom:6px;">
                      <span>Raised: ৳2,45,000</span>
                      <span style="color:var(--color-crimson);">70%</span>
                    </div>
                    <div style="height:8px; background:var(--color-border); border-radius:4px; overflow:hidden;">
                      <div style="width:70%; height:100%; background:var(--color-crimson); border-radius:4px;"></div>
                    </div>
                    <div style="font-size:0.75rem; color:var(--color-text-muted); margin-top:4px;">Goal: ৳3,50,000 BDT</div>
                  </div>
                  <a href="#/fundraisers" class="btn btn-primary btn-block" data-i18n="fundraiserSpotlight.btnDonate">${t('fundraiserSpotlight.btnDonate')}</a>
                </div>
              </div>

              <div class="fundraiser-spotlight-card">
                <div class="fundraiser-card-body">
                  <div class="badge-verified-rs" data-i18n="fundraiserSpotlight.verifiedBadge">
                    <span>🛡️</span> ${t('fundraiserSpotlight.verifiedBadge')}
                  </div>
                  <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:8px;">Master Shayan (Leukemia Chemotherapy)</h3>
                  <div style="font-size:0.85rem; color:var(--color-text-secondary); margin-bottom:16px;">
                    Chittagong Medical College • BMDC #18930
                  </div>
                  <div style="margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:700; margin-bottom:6px;">
                      <span>Raised: ৳1,80,000</span>
                      <span style="color:var(--color-crimson);">90%</span>
                    </div>
                    <div style="height:8px; background:var(--color-border); border-radius:4px; overflow:hidden;">
                      <div style="width:90%; height:100%; background:var(--color-crimson); border-radius:4px;"></div>
                    </div>
                    <div style="font-size:0.75rem; color:var(--color-text-muted); margin-top:4px;">Goal: ৳2,00,000 BDT</div>
                  </div>
                  <a href="#/fundraisers" class="btn btn-primary btn-block" data-i18n="fundraiserSpotlight.btnDonate">${t('fundraiserSpotlight.btnDonate')}</a>
                </div>
              </div>

              <div class="fundraiser-spotlight-card">
                <div class="fundraiser-card-body">
                  <div class="badge-verified-rs" data-i18n="fundraiserSpotlight.verifiedBadge">
                    <span>🛡️</span> ${t('fundraiserSpotlight.verifiedBadge')}
                  </div>
                  <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:8px;">Rafiqul Islam (ICU Dialysis)</h3>
                  <div style="font-size:0.85rem; color:var(--color-text-secondary); margin-bottom:16px;">
                    Sylhet MAG Osmani Medical • BMDC #52918
                  </div>
                  <div style="margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:700; margin-bottom:6px;">
                      <span>Raised: ৳95,000</span>
                      <span style="color:var(--color-crimson);">47%</span>
                    </div>
                    <div style="height:8px; background:var(--color-border); border-radius:4px; overflow:hidden;">
                      <div style="width:47%; height:100%; background:var(--color-crimson); border-radius:4px;"></div>
                    </div>
                    <div style="font-size:0.75rem; color:var(--color-text-muted); margin-top:4px;">Goal: ৳2,00,000 BDT</div>
                  </div>
                  <a href="#/fundraisers" class="btn btn-primary btn-block" data-i18n="fundraiserSpotlight.btnDonate">${t('fundraiserSpotlight.btnDonate')}</a>
                </div>
              </div>
            </div>

            <div style="text-align:center; margin-top:36px;">
              <a href="#/fundraisers" class="btn btn-outline btn-lg" data-i18n="fundraiserSpotlight.btnBrowseFundraisers">
                ${t('fundraiserSpotlight.btnBrowseFundraisers')}
              </a>
            </div>
          </div>
        </section>

        <!-- 8. B2B HOSPITAL & BLOOD BANK WORKSPACE (Section 8) -->
        <section class="section-aurora-wrap section-aurora-2" aria-labelledby="b2bHeading">
          <div class="container-wide">
            <div class="section-header-block">
              <span class="section-pretitle">ENTERPRISE SAAS</span>
              <h2 class="section-title" id="b2bHeading" data-i18n="hospitalB2B.heading">${t('hospitalB2B.heading')}</h2>
              <p class="section-subtitle" data-i18n="hospitalB2B.subheading">${t('hospitalB2B.subheading')}</p>
            </div>

            <div class="b2b-features-grid">
              <div class="b2b-feature-card">
                <div class="b2b-icon-badge">📦</div>
                <h3 style="font-size:1.15rem; font-weight:700; margin-bottom:8px;" data-i18n="hospitalB2B.fefoTitle">${t('hospitalB2B.fefoTitle')}</h3>
                <p style="font-size:0.9rem; color:var(--color-text-secondary); line-height:1.6;" data-i18n="hospitalB2B.fefoDesc">${t('hospitalB2B.fefoDesc')}</p>
              </div>

              <div class="b2b-feature-card">
                <div class="b2b-icon-badge">⛺</div>
                <h3 style="font-size:1.15rem; font-weight:700; margin-bottom:8px;" data-i18n="hospitalB2B.campsTitle">${t('hospitalB2B.campsTitle')}</h3>
                <p style="font-size:0.9rem; color:var(--color-text-secondary); line-height:1.6;" data-i18n="hospitalB2B.campsDesc">${t('hospitalB2B.campsDesc')}</p>
              </div>

              <div class="b2b-feature-card">
                <div class="b2b-icon-badge">⚡</div>
                <h3 style="font-size:1.15rem; font-weight:700; margin-bottom:8px;" data-i18n="hospitalB2B.apiTitle">${t('hospitalB2B.apiTitle')}</h3>
                <p style="font-size:0.9rem; color:var(--color-text-secondary); line-height:1.6;" data-i18n="hospitalB2B.apiDesc">${t('hospitalB2B.apiDesc')}</p>
              </div>

              <div class="b2b-feature-card">
                <div class="b2b-icon-badge">🏥</div>
                <h3 style="font-size:1.15rem; font-weight:700; margin-bottom:8px;" data-i18n="hospitalB2B.whiteLabelTitle">${t('hospitalB2B.whiteLabelTitle')}</h3>
                <p style="font-size:0.9rem; color:var(--color-text-secondary); line-height:1.6;" data-i18n="hospitalB2B.whiteLabelDesc">${t('hospitalB2B.whiteLabelDesc')}</p>
              </div>
            </div>

            <div style="text-align:center; margin-top:36px;">
              <a href="#/pricing" class="btn btn-primary btn-lg btn-glow" data-i18n="hospitalB2B.btnPricing">
                ${t('hospitalB2B.btnPricing')}
              </a>
            </div>
          </div>
        </section>

        <!-- 9. TRUST, SAFETY & ZERO-COMMERCIALIZATION (Section 9) -->
        <section class="section-aurora-wrap section-aurora-1" aria-labelledby="trustHeading">
          <div class="container-wide">
            <div class="section-header-block">
              <span class="section-pretitle">ETHICS & PRIVACY</span>
              <h2 class="section-title" id="trustHeading" data-i18n="trust.heading">${t('trust.heading')}</h2>
              <p class="section-subtitle" data-i18n="trust.subheading">${t('trust.subheading')}</p>
            </div>

            <div class="trust-pillars-grid">
              <div class="trust-pillar-card">
                <div class="trust-icon-wrap">🚫</div>
                <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:10px;" data-i18n="trust.pillar1Title">${t('trust.pillar1Title')}</h3>
                <p style="font-size:0.92rem; color:var(--color-text-secondary); line-height:1.65;" data-i18n="trust.pillar1Desc">${t('trust.pillar1Desc')}</p>
              </div>

              <div class="trust-pillar-card">
                <div class="trust-icon-wrap">🔐</div>
                <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:10px;" data-i18n="trust.pillar2Title">${t('trust.pillar2Title')}</h3>
                <p style="font-size:0.92rem; color:var(--color-text-secondary); line-height:1.65;" data-i18n="trust.pillar2Desc">${t('trust.pillar2Desc')}</p>
              </div>

              <div class="trust-pillar-card">
                <div class="trust-icon-wrap">🩺</div>
                <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:10px;" data-i18n="trust.pillar3Title">${t('trust.pillar3Title')}</h3>
                <p style="font-size:0.92rem; color:var(--color-text-secondary); line-height:1.65;" data-i18n="trust.pillar3Desc">${t('trust.pillar3Desc')}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 10. STORIES & AWARENESS (Section 10) -->
        <section class="section-aurora-wrap section-aurora-2" aria-labelledby="storiesHeading">
          <div class="container-wide">
            <div class="section-header-block">
              <span class="section-pretitle">CLINICAL INSIGHTS</span>
              <h2 class="section-title" id="storiesHeading" data-i18n="stories.heading">${t('stories.heading')}</h2>
              <p class="section-subtitle" data-i18n="stories.subheading">${t('stories.subheading')}</p>
            </div>

            <div class="stories-grid">
              <div class="story-card-modern">
                <div>
                  <span class="badge" style="background:var(--color-crimson-subtle); color:var(--color-crimson); font-size:0.75rem; margin-bottom:12px;">DONOR HEALTH</span>
                  <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:10px;" data-i18n="stories.story1Title">${t('stories.story1Title')}</h3>
                  <p style="font-size:0.92rem; color:var(--color-text-secondary); line-height:1.6;" data-i18n="stories.story1Desc">${t('stories.story1Desc')}</p>
                </div>
                <a href="#/eligibility" style="margin-top:20px; font-weight:600; font-size:0.88rem; color:var(--color-crimson); text-decoration:none;">Read Medical Guidelines →</a>
              </div>

              <div class="story-card-modern">
                <div>
                  <span class="badge" style="background:var(--color-teal-subtle); color:var(--color-text-teal); font-size:0.75rem; margin-bottom:12px;">PEDIATRICS</span>
                  <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:10px;" data-i18n="stories.story2Title">${t('stories.story2Title')}</h3>
                  <p style="font-size:0.92rem; color:var(--color-text-secondary); line-height:1.6;" data-i18n="stories.story2Desc">${t('stories.story2Desc')}</p>
                </div>
                <a href="#/map" style="margin-top:20px; font-weight:600; font-size:0.88rem; color:var(--color-crimson); text-decoration:none;">Find Ready Donors →</a>
              </div>

              <div class="story-card-modern">
                <div>
                  <span class="badge" style="background:var(--color-crimson-subtle); color:var(--color-crimson); font-size:0.75rem; margin-bottom:12px;">TRANSFUSION SCIENCE</span>
                  <h3 style="font-size:1.2rem; font-weight:700; margin-bottom:10px;" data-i18n="stories.story3Title">${t('stories.story3Title')}</h3>
                  <p style="font-size:0.92rem; color:var(--color-text-secondary); line-height:1.6;" data-i18n="stories.story3Desc">${t('stories.story3Desc')}</p>
                </div>
                <a href="#/compatibility" style="margin-top:20px; font-weight:600; font-size:0.88rem; color:var(--color-crimson); text-decoration:none;">View Compatibility Matrix →</a>
              </div>
            </div>
          </div>
        </section>

        <!-- 11. FAQ ACCORDION & SOS CTA BAND (Section 11) -->
        <section class="section-aurora-wrap section-aurora-1" aria-labelledby="faqHeading">
          <div class="container-wide">
            <div class="section-header-block">
              <span class="section-pretitle">HELP CENTER</span>
              <h2 class="section-title" id="faqHeading" data-i18n="faq.heading">${t('faq.heading')}</h2>
              <p class="section-subtitle" data-i18n="faq.subheading">${t('faq.subheading')}</p>
            </div>

            <div class="faq-accordion-box" id="homeFaqAccordion">
              <div class="faq-item-modern">
                <button type="button" class="faq-trigger-btn" aria-expanded="false">
                  <span data-i18n="faq.q1">${t('faq.q1')}</span>
                  <span class="faq-chevron" aria-hidden="true">▼</span>
                </button>
                <div class="faq-content-panel" data-i18n="faq.a1">${t('faq.a1')}</div>
              </div>

              <div class="faq-item-modern">
                <button type="button" class="faq-trigger-btn" aria-expanded="false">
                  <span data-i18n="faq.q2">${t('faq.q2')}</span>
                  <span class="faq-chevron" aria-hidden="true">▼</span>
                </button>
                <div class="faq-content-panel" data-i18n="faq.a2">${t('faq.a2')}</div>
              </div>

              <div class="faq-item-modern">
                <button type="button" class="faq-trigger-btn" aria-expanded="false">
                  <span data-i18n="faq.q3">${t('faq.q3')}</span>
                  <span class="faq-chevron" aria-hidden="true">▼</span>
                </button>
                <div class="faq-content-panel" data-i18n="faq.a3">${t('faq.a3')}</div>
              </div>

              <div class="faq-item-modern">
                <button type="button" class="faq-trigger-btn" aria-expanded="false">
                  <span data-i18n="faq.q4">${t('faq.q4')}</span>
                  <span class="faq-chevron" aria-hidden="true">▼</span>
                </button>
                <div class="faq-content-panel" data-i18n="faq.a4">${t('faq.a4')}</div>
              </div>
            </div>

            <!-- Final Full-Width Glowing SOS Call to Action -->
            <div class="cta-sos-band">
              <h3 style="font-size:clamp(1.6rem, 2.8vw, 2.2rem); font-weight:800; margin-bottom:12px; color:var(--color-text-primary);" data-i18n="ctaBand.heading">
                ${t('ctaBand.heading')}
              </h3>
              <p style="font-size:clamp(0.95rem, 1.2vw, 1.1rem); color:var(--color-text-secondary); max-width:680px; margin:0 auto 24px auto;" data-i18n="ctaBand.subheading">
                ${t('ctaBand.subheading')}
              </p>
              <div style="display:flex; justify-content:center; gap:16px; flex-wrap:wrap;">
                <a href="#/request" class="btn btn-primary btn-lg btn-glow" data-i18n="ctaBand.btnBroadcastNow">
                  ${t('ctaBand.btnBroadcastNow')}
                </a>
                <a href="#/map" class="btn btn-outline btn-lg" data-i18n="hero.btnFindDonor">
                  ${t('hero.btnFindDonor')}
                </a>
              </div>
            </div>
          </div>
        </section>

        <!-- 12. COMPREHENSIVE FULL-WIDTH FOOTER (Section 12) -->
        <footer class="footer-full-width" role="contentinfo">
          <div class="container-wide">
            <div class="footer-nav-grid">
              <!-- Brand Summary Column -->
              <div>
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
                  <svg class="brand-icon-svg" width="32" height="32" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                    <path d="M50 8C50 8 18 48 18 68C18 85.673 32.327 100 50 100C67.673 100 82 85.673 82 68C82 48 50 8 50 8Z" fill="#D90429"/>
                    <path d="M22 68H40L45 57L50 78L55 63L59 71L62 68H78" stroke="#2A9D8F" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="brand-wordmark"><span class="brand-wordmark-rokto">Rokto</span><span class="brand-wordmark-setu">Setu</span></span>
                </div>
                <p style="font-size:0.88rem; color:var(--color-text-secondary); line-height:1.6; margin-bottom:16px;" data-i18n="footer.mission">
                  ${t('footer.mission')}
                </p>
                <div style="font-family:monospace; font-size:0.78rem; color:var(--color-text-teal);">
                  HOTLINE: 16263 • EMERGENCY SOS
                </div>
              </div>

              <!-- Seekers Column -->
              <div>
                <h4 class="footer-col-title" data-i18n="footer.quickLinks">${t('footer.quickLinks')}</h4>
                <ul class="footer-col-list">
                  <li><a href="#/map" data-i18n="nav.findDonors">Find Donors</a></li>
                  <li><a href="#/request" data-i18n="nav.requestBlood">Request Blood</a></li>
                  <li><a href="#/fundraisers" data-i18n="nav.fundraisers">Fundraisers</a></li>
                  <li><a href="#/compatibility" data-i18n="nav.compatibility">Blood Matrix</a></li>
                </ul>
              </div>

              <!-- Donors Column -->
              <div>
                <h4 class="footer-col-title" data-i18n="footer.donorLinks">${t('footer.donorLinks')}</h4>
                <ul class="footer-col-list">
                  <li><a href="#/register" data-i18n="nav.register">Register as Donor</a></li>
                  <li><a href="#/achievements" data-i18n="nav.achievements">Achievements & ID</a></li>
                  <li><a href="#/verify" data-i18n="nav.verify">Verify Certificate</a></li>
                  <li><a href="#/eligibility" data-i18n="nav.eligibility">Eligibility Quiz</a></li>
                </ul>
              </div>

              <!-- B2B & Hospital Column -->
              <div>
                <h4 class="footer-col-title" data-i18n="footer.b2bLinks">${t('footer.b2bLinks')}</h4>
                <ul class="footer-col-list">
                  <li><a href="#/org" data-i18n="nav.b2bHospital">Hospital Portal</a></li>
                  <li><a href="#/pricing" data-i18n="nav.pricing">Pricing Plans</a></li>
                  <li><a href="#/faq" data-i18n="nav.faq">Help Center</a></li>
                  <li><a href="#/admin" data-i18n="nav.admin">Admin Console</a></li>
                </ul>
              </div>

              <!-- Trust & Governance Column -->
              <div>
                <h4 class="footer-col-title" data-i18n="footer.legalLinks">${t('footer.legalLinks')}</h4>
                <ul class="footer-col-list">
                  <li><a href="#/privacy">Privacy Policy</a></li>
                  <li><a href="#/terms">Terms of Service</a></li>
                  <li><a href="#/disclaimer">Medical Disclaimer</a></li>
                  <li><a href="#/faq">Anti-Commercial Policy</a></li>
                </ul>
              </div>
            </div>

            <div class="footer-bottom-bar">
              <span data-i18n="footer.copyright">${t('footer.copyright')}</span>
              <div style="display:flex; gap:16px;">
                <a href="#/privacy" style="color:inherit; text-decoration:none;">Privacy</a>
                <a href="#/terms" style="color:inherit; text-decoration:none;">Terms</a>
                <a href="#/verify" style="color:inherit; text-decoration:none;">Public Verification</a>
              </div>
            </div>

            <p class="footer-disclaimer-text" data-i18n="footer.disclaimer">
              ${t('footer.disclaimer')}
            </p>
          </div>
        </footer>
      </main>
    `;

    // 1. Initialize Video Hero Controller
    this.videoController = new HeroVideoController('heroBgVideo', 'btnToggleHeroVideo');
    this.videoController.init();

    // 2. Setup Hero Blood Group Selector
    this.setupBloodSelector();

    // 3. Setup Quick Search Button
    document.getElementById('btnHeroQuickSearch')?.addEventListener('click', () => {
      const activeGroup = document.querySelector('#heroBloodSelector .blood-btn.active')?.dataset.group || 'O+';
      const loc = document.getElementById('heroLocationInput')?.value || '';
      window.location.hash = `#/map?group=${encodeURIComponent(activeGroup)}&location=${encodeURIComponent(loc)}`;
    });

    // 4. Setup Impact Counters Animation via IntersectionObserver
    this.setupImpactCounters();

    // 5. Setup Leaflet Map Preview for Section 4
    this.setupMapPreview();

    // 6. Setup 3D Card Tilt on Sample Donor ID
    this.setupTiltCard();

    // 7. Setup FAQ Accordion
    this.setupFaqAccordion();

    // Translate DOM
    translateDOM(this.container);
  }

  setupBloodSelector() {
    const buttons = document.querySelectorAll('#heroBloodSelector .blood-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        buttons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-checked', 'false');
        });
        e.currentTarget.classList.add('active');
        e.currentTarget.setAttribute('aria-checked', 'true');
      });
    });
  }

  setupImpactCounters() {
    const numbers = document.querySelectorAll('#impactCounterGrid .impact-number[data-target]');
    if ('IntersectionObserver' in window && numbers.length) {
      this.counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'), 10);
            if (target) {
              let count = 0;
              const step = Math.max(1, Math.floor(target / 40));
              const timer = setInterval(() => {
                count += step;
                if (count >= target) {
                  el.textContent = target.toLocaleString() + '+';
                  clearInterval(timer);
                } else {
                  el.textContent = count.toLocaleString() + '+';
                }
              }, 25);
            }
            obs.unobserve(el);
          }
        });
      }, { threshold: 0.2 });

      numbers.forEach(el => this.counterObserver.observe(el));
    }
  }

  setupMapPreview() {
    const mapMount = document.getElementById('homeMapTeaserMount');
    if (!mapMount) return;

    if (typeof window.L !== 'undefined') {
      try {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const tileUrl = isDark
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        const map = window.L.map('homeMapTeaserMount', {
          center: [23.8103, 90.4125], // Dhaka center
          zoom: 7,
          zoomControl: false,
          dragging: false,
          scrollWheelZoom: false,
          touchZoom: false
        });

        window.L.tileLayer(tileUrl, { maxZoom: 18, attribution: '' }).addTo(map);

        // Pulsing donor clusters (approximate coordinates)
        const clusters = [
          { lat: 23.8103, lng: 90.4125, group: 'O+', donors: 420 },
          { lat: 22.3569, lng: 91.7832, group: 'A+', donors: 210 },
          { lat: 24.8949, lng: 91.8687, group: 'B+', donors: 140 },
          { lat: 24.3636, lng: 88.6241, group: 'O-', donors: 85 }
        ];

        clusters.forEach(c => {
          window.L.circleMarker([c.lat, c.lng], {
            radius: 12,
            color: '#D90429',
            fillColor: '#D90429',
            fillOpacity: 0.6,
            weight: 2
          }).addTo(map);
        });

        this.mapInstance = map;
      } catch (e) {
        mapMount.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;">Live Radar Active</div>`;
      }
    } else {
      mapMount.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--color-text-secondary);flex-direction:column;gap:12px;">
          <span style="font-size:2.5rem;">🗺️</span>
          <span style="font-family:monospace;font-size:0.9rem;">LIVE_DONOR_RADAR_PREVIEW</span>
        </div>
      `;
    }
  }

  setupTiltCard() {
    const card = document.getElementById('tiltDonorCard');
    if (!card) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || 'ontouchstart' in window) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
    });
  }

  setupFaqAccordion() {
    const items = document.querySelectorAll('#homeFaqAccordion .faq-item-modern');
    items.forEach(item => {
      const btn = item.querySelector('.faq-trigger-btn');
      const panel = item.querySelector('.faq-content-panel');
      btn?.addEventListener('click', () => {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        // Close others
        items.forEach(other => {
          other.querySelector('.faq-trigger-btn')?.setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-content-panel')?.classList.remove('open');
        });
        if (!isOpen) {
          btn.setAttribute('aria-expanded', 'true');
          panel?.classList.add('open');
        }
      });
    });
  }

  destroy() {
    if (this.videoController) {
      this.videoController.destroy();
      this.videoController = null;
    }
    if (this.counterObserver) {
      this.counterObserver.disconnect();
      this.counterObserver = null;
    }
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
    }
  }
}
