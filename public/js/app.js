/**
 * @file app.js
 * @description Main application controller, router bindings, and PWA registration for RoktoSetu.
 */

import { initI18n, setLanguage, getLanguage, translateDOM, t } from './core/i18n.js';
import { initTheme, toggleTheme } from './core/theme.js';
import { Router } from './core/router.js';
import { modal } from './core/modal.js';
import { toast } from './core/toast.js';
import { store } from './core/store.js';
import { subscribeAuthState, signOutFromFirebase } from './core/firebase.js';
import { AuthView } from './modules/auth/auth-view.js';
import { OnboardingWizard } from './modules/onboarding/wizard.js';
import { IdentityVerifierQueue } from './modules/admin/verify-queue.js';
import { MapSearchModule } from './modules/seeker/map-search.js';
import { RequestBloodModule } from './modules/seeker/request-blood.js';
import { DonorAvailabilityModule } from './modules/donor/availability.js';
import { ChatModule } from './modules/chat/chat-view.js';
import { DigitalDonorCard } from './modules/donor/donor-card.js';
import { RewardsView } from './modules/donor/rewards-view.js';
import { LeaderboardView } from './modules/donor/leaderboard.js';
import { CertificateView } from './modules/donor/certificate-view.js';
import { ReferralView } from './modules/donor/referral.js';
import { OrgDashboardView } from './modules/org/org-dashboard.js';
import { InventoryView } from './modules/org/inventory-view.js';
import { CampaignsView } from './modules/org/campaigns-view.js';
import { CrmView } from './modules/org/crm-view.js';
import { TeamView } from './modules/org/team-view.js';
import { PricingView } from './modules/billing/pricing-view.js';
import { ApiKeysView } from './modules/org/api-keys-view.js';
import { WhiteLabelView } from './modules/org/white-label-view.js';
import { FundraiserListView } from './modules/fundraiser/campaign-list-view.js';
import { FundraiserApplyView } from './modules/fundraiser/apply-view.js';
import { PublicCampaignView } from './modules/fundraiser/public-campaign-view.js';
import { FundraiserPayoutView } from './modules/fundraiser/payout-view.js';
import { PlatformAdminDashboard } from './modules/admin/admin-dashboard.js';
import { UserModerationView } from './modules/admin/user-moderation-view.js';
import { FundraiserAdminConsole } from './modules/admin/fundraiser-console.js';
import { AuditLogViewer } from './modules/admin/audit-viewer.js';
import { BloodCompatibilityView } from './modules/public/compatibility-view.js';
import { DonorEligibilityQuiz } from './modules/public/eligibility-quiz.js';
import { FaqView } from './modules/public/faq-view.js';
import { LegalViews } from './modules/public/legal-views.js';
import { VerifyCertView } from './modules/public/verify-cert-view.js';
import { VerifyCardView } from './modules/public/verify-card-view.js';
import { AchievementsView } from './modules/donor/achievements-view.js';
import { ShareCardView } from './modules/public/share-card-view.js';
import { HomeView } from './modules/home/home-view.js';

class RoktoSetuApp {
  constructor() {
    this.router = new Router();
    this.authView = new AuthView('authModalContainer');
    this.onboardingWizard = null;
    this.verifierQueue = null;
    this.mapSearch = null;
    this.requestBlood = null;
    this.availability = null;
    this.chat = null;
    this.homeView = null;
  }

  async init() {
    initTheme();
    await initI18n();

    this.setupNavbar();
    this.setupRoutes();
    this.authView.render();
    this.setupServiceWorker();

    store.subscribe((state) => this.renderUserNav(state));

    // Subscribe to Firebase Auth state
    try {
      await subscribeAuthState((user) => {
        if (user) {
          store.setUser(user);
        }
      });
    } catch (e) {
      console.warn('[RoktoSetu] Auth listener fallback:', e);
    }
  }

  setupNavbar() {
    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.currentTarget.dataset.lang;
        setLanguage(lang);
      });
    });

    // Theme toggle button
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => toggleTheme());
    }

    // Login button
    const btnLogin = document.getElementById('btnLoginNav');
    if (btnLogin) {
      btnLogin.addEventListener('click', async () => {
        if (store.state.isAuthenticated) {
          await signOutFromFirebase();
          store.setUser(null);
          toast.info('Logged out successfully.');
        } else {
          modal.open('authModal');
        }
      });
    }

    // Mobile Navigation Drawer Toggle & Links
    const drawer = document.getElementById('mobileNavDrawer');
    const btnToggleMobile = document.getElementById('mobileMenuToggle');
    const btnCloseMobile = document.getElementById('btnCloseMobileNav');
    const backdropMobile = document.getElementById('mobileNavBackdrop');

    const openDrawer = () => {
      if (drawer) {
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        btnToggleMobile?.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      }
    };

    const closeDrawer = () => {
      if (drawer) {
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        btnToggleMobile?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    };

    btnToggleMobile?.addEventListener('click', openDrawer);
    btnCloseMobile?.addEventListener('click', closeDrawer);
    backdropMobile?.addEventListener('click', closeDrawer);

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer?.classList.contains('open')) {
        closeDrawer();
      }
    });

    // Mobile Login Button in Drawer
    document.getElementById('btnLoginMobile')?.addEventListener('click', async () => {
      closeDrawer();
      if (store.state.isAuthenticated) {
        await signOutFromFirebase();
        store.setUser(null);
        toast.info('Logged out successfully.');
      } else {
        modal.open('authModal');
      }
    });

    // SOS Emergency Button in Nav/Hero
    document.querySelectorAll('.btn-emergency-sos-action').forEach(btn => {
      btn.addEventListener('click', () => {
        toast.error('Emergency SOS Mode Activated! Expanding immediate alerts to nearby available donors.');
        window.location.hash = '#/map';
      });
    });

    // Scroll-driven Navbar Shrink & Crimson Border Glow + Progress Bar
    const navbar = document.getElementById('siteNavbar');
    const progressBar = document.getElementById('scrollProgressBar');
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      if (navbar) {
        if (scrolled > 40) {
          navbar.classList.add('navbar-scrolled');
        } else {
          navbar.classList.remove('navbar-scrolled');
        }
      }
      if (progressBar) {
        const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = totalHeight > 0 ? (scrolled / totalHeight) * 100 : 0;
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      }
    }, { passive: true });

    // Desktop "More" Dropdown Trigger & Esc/Click-Outside Handler
    const dropdownBtn = document.getElementById('navMoreDropdownBtn');
    const dropdownMenu = document.getElementById('navMoreDropdownMenu');
    if (dropdownBtn && dropdownMenu) {
      dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdownMenu.classList.contains('open');
        if (isOpen) {
          dropdownMenu.classList.remove('open');
          dropdownBtn.setAttribute('aria-expanded', 'false');
        } else {
          dropdownMenu.classList.add('open');
          dropdownBtn.setAttribute('aria-expanded', 'true');
        }
      });

      document.addEventListener('click', (e) => {
        if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
          dropdownMenu.classList.remove('open');
          dropdownBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdownMenu.classList.contains('open')) {
          dropdownMenu.classList.remove('open');
          dropdownBtn.setAttribute('aria-expanded', 'false');
          dropdownBtn.focus();
        }
      });

      dropdownMenu.querySelectorAll('.nav-dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
          dropdownMenu.classList.remove('open');
          dropdownBtn.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  renderUserNav(state) {
    const btnLogin = document.getElementById('btnLoginNav');
    if (btnLogin) {
      if (state.isAuthenticated) {
        btnLogin.textContent = `${state.user?.displayName || 'User'} (Logout)`;
        btnLogin.classList.remove('btn-primary');
        btnLogin.classList.add('btn-outline');
      } else {
        btnLogin.textContent = t('nav.login');
        btnLogin.classList.add('btn-primary');
        btnLogin.classList.remove('btn-outline');
      }
    }
  }

  setupRoutes() {
    const appRoot = document.getElementById('appRoot');

    // 1. HOME VIEW (12-Section Futuristic Bio-Tech Experience with Video Hero)
    this.router.addRoute('#/', () => {
      if (this.homeView) {
        this.homeView.destroy();
      }
      this.homeView = new HomeView('appRoot');
      this.homeView.render();
    });

    // 2. REGISTRATION & VERIFICATION WIZARD
    this.router.addRoute('#/register', () => {
      appRoot.innerHTML = `<div id="wizardMount"></div>`;
      this.onboardingWizard = new OnboardingWizard('wizardMount');
      this.onboardingWizard.init();
      translateDOM(appRoot);
    });

    // 3. ADMIN IDENTITY REVIEWER QUEUE
    this.router.addRoute('#/verify-queue', () => {
      appRoot.innerHTML = `<div id="queueMount"></div>`;
      this.verifierQueue = new IdentityVerifierQueue('queueMount');
      this.verifierQueue.render();
      translateDOM(appRoot);
    });

    // 4. LIVE DONOR MAP SEARCH MODULE (Matching uploaded dark mode map screenshot)
    this.router.addRoute('#/map', () => {
      this.mapSearch = new MapSearchModule('appRoot');
      this.mapSearch.render();
      translateDOM(appRoot);
    });

    // 5. BLOOD REQUEST CREATION & TRACKING MODULE
    this.router.addRoute('#/request', () => {
      this.requestBlood = new RequestBloodModule('appRoot');
      this.requestBlood.render();
      translateDOM(appRoot);
    });

    // 6. DONOR AVAILABILITY SCHEDULER & PRIVACY
    this.router.addRoute('#/availability', () => {
      this.availability = new DonorAvailabilityModule('appRoot');
      this.availability.render();
      translateDOM(appRoot);
    });

    // 7. IN-APP MODERATED CHAT
    this.router.addRoute('#/chat', () => {
      this.chat = new ChatModule('appRoot');
      this.chat.render();
      translateDOM(appRoot);
    });

    // 8. REWARDS & PARTNER COUPONS
    this.router.addRoute('#/rewards', () => {
      new RewardsView('appRoot').render();
      translateDOM(appRoot);
    });

    // 9. LEADERBOARD
    this.router.addRoute('#/leaderboard', () => {
      new LeaderboardView('appRoot').render();
      translateDOM(appRoot);
    });

    // 10. CERTIFICATE VIEW WITH CONFETTI
    this.router.addRoute('#/certificate', () => {
      new CertificateView('appRoot').render();
      translateDOM(appRoot);
    });

    // 10B. SECTION 17: MY ACHIEVEMENTS & CERTIFICATES DASHBOARD
    this.router.addRoute('#/achievements', () => {
      new AchievementsView('appRoot').render();
      translateDOM(appRoot);
    });

    // 10C. SECTION 17: PUBLIC CERTIFICATE VERIFICATION (#/verify)
    this.router.addRoute('#/verify', () => {
      new VerifyCertView('appRoot').render();
      translateDOM(appRoot);
    });

    // 10D. SECTION 17: PUBLIC DIGITAL DONOR CARD VERIFICATION (#/card)
    this.router.addRoute('#/card', () => {
      new VerifyCardView('appRoot').render();
      translateDOM(appRoot);
    });

    // 10E. SECTION 17: PUBLIC ACHIEVEMENT SHARE CARD (#/a and #/share)
    this.router.addRoute('#/a', () => {
      new ShareCardView('appRoot').render();
      translateDOM(appRoot);
    });
    this.router.addRoute('#/share', () => {
      new ShareCardView('appRoot').render();
      translateDOM(appRoot);
    });

    // 11. REFERRAL PROGRAM
    this.router.addRoute('#/referral', () => {
      new ReferralView('appRoot').render();
      translateDOM(appRoot);
    });

    // 12. B2B ORGANIZATION WORKSPACE DASHBOARD
    this.router.addRoute('#/org', () => {
      new OrgDashboardView('appRoot').render();
      translateDOM(appRoot);
    });

    // 13. BLOOD INVENTORY (FEFO ENFORCED)
    this.router.addRoute('#/org/inventory', () => {
      new InventoryView('appRoot').render();
      translateDOM(appRoot);
    });

    // 14. CAMPAIGNS & CAMPS
    this.router.addRoute('#/org/campaigns', () => {
      new CampaignsView('appRoot').render();
      translateDOM(appRoot);
    });

    // 15. DONOR CRM & RECALL
    this.router.addRoute('#/org/crm', () => {
      new CrmView('appRoot').render();
      translateDOM(appRoot);
    });

    // 16. TEAM ROLES & MULTI-BRANCH
    this.router.addRoute('#/org/team', () => {
      new TeamView('appRoot').render();
      translateDOM(appRoot);
    });

    // 17. SAAS PRICING & TIERS
    this.router.addRoute('#/pricing', () => {
      new PricingView('appRoot').render();
      translateDOM(appRoot);
    });

    // 18. B2B DEVELOPER API KEYS & WEBHOOKS
    this.router.addRoute('#/org/api-keys', () => {
      new ApiKeysView('appRoot').render();
      translateDOM(appRoot);
    });

    // 19. WHITE-LABEL & CUSTOM BRANDING
    this.router.addRoute('#/org/white-label', () => {
      new WhiteLabelView('appRoot').render();
      translateDOM(appRoot);
    });

    // 20. CRITICAL PATIENT FUNDRAISERS DIRECTORY
    this.router.addRoute('#/fundraisers', () => {
      new FundraiserListView('appRoot').render();
      translateDOM(appRoot);
    });

    // 21. FUNDRAISER APPLICATION WIZARD
    this.router.addRoute('#/fundraiser/apply', () => {
      new FundraiserApplyView('appRoot').render();
      translateDOM(appRoot);
    });

    // 22. PUBLIC CAMPAIGN DETAILS & DONATION
    this.router.addRoute('#/fundraiser/view', () => {
      new PublicCampaignView('appRoot').render();
      translateDOM(appRoot);
    });

    // 23. MILESTONE INVOICES & HOSPITAL PAYOUTS
    this.router.addRoute('#/fundraiser/payout', () => {
      new FundraiserPayoutView('appRoot').render();
      translateDOM(appRoot);
    });

    // 24. UNIFIED PLATFORM ADMIN DASHBOARD
    this.router.addRoute('#/admin', () => {
      new PlatformAdminDashboard('appRoot').render();
      translateDOM(appRoot);
    });

    // 25. USER & ORG MODERATION
    this.router.addRoute('#/admin/moderation', () => {
      new UserModerationView('appRoot').render();
      translateDOM(appRoot);
    });

    // 26. FUNDRAISER 4-EYES ADMIN CONSOLE
    this.router.addRoute('#/admin/fundraisers', () => {
      new FundraiserAdminConsole('appRoot').render();
      translateDOM(appRoot);
    });

    // 27. IMMUTABLE AUDIT TRAIL
    this.router.addRoute('#/admin/audit', () => {
      new AuditLogViewer('appRoot').render();
      translateDOM(appRoot);
    });

    // 28. BLOOD COMPATIBILITY MATRIX
    this.router.addRoute('#/compatibility', () => {
      new BloodCompatibilityView('appRoot').render();
      translateDOM(appRoot);
    });

    // 29. DONOR ELIGIBILITY QUIZ
    this.router.addRoute('#/eligibility', () => {
      new DonorEligibilityQuiz('appRoot').render();
      translateDOM(appRoot);
    });

    // 30. FAQ VIEW
    this.router.addRoute('#/faq', () => {
      new FaqView('appRoot').render();
      translateDOM(appRoot);
    });

    // 31. LEGAL: TERMS OF SERVICE
    this.router.addRoute('#/terms', () => {
      new LegalViews('appRoot', 'terms').render();
      translateDOM(appRoot);
    });

    // 32. LEGAL: PRIVACY POLICY
    this.router.addRoute('#/privacy', () => {
      new LegalViews('appRoot', 'privacy').render();
      translateDOM(appRoot);
    });

    // 33. LEGAL: MEDICAL DISCLAIMER
    this.router.addRoute('#/disclaimer', () => {
      new LegalViews('appRoot', 'disclaimer').render();
      translateDOM(appRoot);
    });

    // 5. DONOR GAMIFICATION PREVIEW (Matching uploaded Rafi S. Gold screenshot)
    this.router.addRoute('#/donor/profile', () => {
      appRoot.innerHTML = `
        <div class="container" style="padding:var(--space-8) var(--space-4);">
          <!-- Top Profile Banner -->
          <div class="card" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:var(--space-4); margin-bottom:var(--space-8);">
            <div style="display:flex; align-items:center; gap:var(--space-4);">
              <div style="width:72px; height:72px; border-radius:50%; border:3px solid #D4AF37; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.5rem; color:#D4AF37; background:var(--color-bg-subtle);">
                RS
              </div>
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <h2 style="font-size:var(--font-size-xl); font-weight:800;">Rafi S.</h2>
                  <span style="background:#FFF3CD; color:#856404; font-size:11px; font-weight:700; padding:2px 8px; border-radius:12px;">Gold Donor</span>
                </div>
                <div style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-top:2px;">
                  B+ • Verified Hero • Sample profile
                </div>
                <div style="margin-top:10px; width:300px;">
                  <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
                    <span>12 of 15 donations</span>
                    <span style="color:var(--color-text-secondary);">3 more to Platinum</span>
                  </div>
                  <div style="height:6px; background:var(--color-border); border-radius:3px; overflow:hidden;">
                    <div style="width:80%; height:100%; background:var(--color-crimson);"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Next eligible badge -->
            <div style="background:var(--color-teal-subtle); padding:12px 20px; border-radius:var(--radius-lg); text-align:center;">
              <div style="font-size:11px; color:var(--color-text-secondary);">Next eligible date</div>
              <div style="font-size:var(--font-size-lg); font-weight:800; color:var(--color-teal);">in 34 days</div>
            </div>
          </div>

          <!-- Donor levels carousel -->
          <h3 style="font-size:var(--font-size-xl); font-weight:800; margin-bottom:var(--space-4);">Donor levels</h3>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:var(--space-3); margin-bottom:var(--space-6);">
            <div class="card" style="text-align:center; padding:var(--space-4);">
              <div style="width:36px; height:36px; border-radius:50%; background:#B87333; margin:0 auto 8px;"></div>
              <div style="font-weight:700; font-size:var(--font-size-sm);">Bronze</div>
              <div style="font-size:11px; color:var(--color-text-muted);">3 donations</div>
            </div>
            <div class="card" style="text-align:center; padding:var(--space-4);">
              <div style="width:36px; height:36px; border-radius:50%; background:#A8A9AD; margin:0 auto 8px;"></div>
              <div style="font-weight:700; font-size:var(--font-size-sm);">Silver</div>
              <div style="font-size:11px; color:var(--color-text-muted);">6 donations</div>
            </div>
            <div class="card" style="text-align:center; padding:var(--space-4); border:2px solid #D4AF37; box-shadow:0 0 10px rgba(212,175,55,0.3);">
              <div style="width:36px; height:36px; border-radius:50%; background:#D4AF37; margin:0 auto 8px;"></div>
              <div style="font-weight:700; font-size:var(--font-size-sm); color:#D4AF37;">Gold</div>
              <div style="font-size:11px; color:var(--color-text-muted);">10 donations</div>
            </div>
            <div class="card" style="text-align:center; padding:var(--space-4);">
              <div style="width:36px; height:36px; border-radius:50%; background:#708090; margin:0 auto 8px;"></div>
              <div style="font-weight:700; font-size:var(--font-size-sm);">Platinum</div>
              <div style="font-size:11px; color:var(--color-text-muted);">15 donations</div>
            </div>
            <div class="card" style="text-align:center; padding:var(--space-4);">
              <div style="width:36px; height:36px; border-radius:50%; background:#00BCD4; margin:0 auto 8px;"></div>
              <div style="font-weight:700; font-size:var(--font-size-sm);">Diamond</div>
              <div style="font-size:11px; color:var(--color-text-muted);">25 donations</div>
            </div>
            <div class="card" style="text-align:center; padding:var(--space-4);">
              <div style="width:36px; height:36px; border-radius:50%; background:#D90429; margin:0 auto 8px;"></div>
              <div style="font-weight:700; font-size:var(--font-size-sm); color:#D90429;">Legend</div>
              <div style="font-size:11px; color:var(--color-text-muted);">50 donations</div>
            </div>
          </div>

          <!-- Bottom Rewards Bar -->
          <div style="background:var(--color-bg-surface-elevated); border:1px solid var(--color-border); border-radius:var(--radius-lg); padding:var(--space-4) var(--space-6); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div style="font-size:var(--font-size-sm); color:var(--color-text-secondary);">
              Rewards: badge, profile frame, certificate, priority listing, partner coupons
            </div>
            <div style="display:flex; gap:8px;">
              <a href="#/rewards" class="btn btn-primary btn-sm">View rewards</a>
              <a href="#/certificate" class="btn btn-outline btn-sm">Official Certificate</a>
            </div>
          </div>

          <!-- Digital Donor Pass Display -->
          <div style="margin-top:var(--space-12);">
            <h3 style="font-size:var(--font-size-xl); font-weight:800; margin-bottom:var(--space-4); text-align:center;">Digital Donor ID Pass</h3>
            ${new DigitalDonorCard().render()}
          </div>
        </div>
      `;
      translateDOM(appRoot);
    });

    this.router.handleRouting();
  }

  setupServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('/service-worker.js').catch(err => {
        console.warn('Service Worker registration skipped in current environment:', err);
      });
    }
  }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
  const app = new RoktoSetuApp();
  app.init().catch(console.error);
});
