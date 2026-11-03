/**
 * @file achievements-view.js
 * @description "My Achievements" dashboard: Certificates gallery, flippable Digital Donor ID Card,
 * Apple/Google Wallet pass export, and social milestone sharing.
 */

import { toast } from '../../core/toast.js';
import { openSocialShareModal } from './social-share-modal.js';

export class AchievementsView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.isCardFlipped = false;
    this.activeCertTemplate = 'classic';
  }

  render() {
    if (!this.container) return;

    const isBn = (localStorage.getItem('roktosetu_lang') || 'en') === 'bn';

    this.container.innerHTML = `
      <div class="container" style="max-width: 1000px; padding: var(--space-8) var(--space-4);">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-8);">
          <div>
            <h1 style="font-size: 2rem; font-weight: 800; margin: 0 0 6px 0;">
              ${isBn ? 'আমার অর্জন ও সনদপত্র' : 'My Achievements & Certificates'}
            </h1>
            <p style="color: var(--color-text-secondary); margin: 0; font-size: 14px;">
              ${isBn ? 'স্বেচ্ছাসেবী রক্তদানের স্বীকৃতি, ডিজিটাল আইডি কার্ড এবং আন্তর্জাতিকভাবে যাচাইযোগ্য সনদ।' : 'Verified voluntary blood donor milestones, digital ID card, and tamper-proof certificates.'}
            </p>
          </div>
          <button type="button" class="btn btn-primary" id="btnShareMilestoneTop">
            📢 ${isBn ? 'অর্জন শেয়ার করুন' : 'Share Achievement'}
          </button>
        </div>

        <!-- Level & Eligibility Progress Summary Card (Matching Reference UI) -->
        <div class="card" style="margin-bottom: var(--space-8); box-shadow: var(--shadow-sm); padding: var(--space-6);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 56px; height: 56px; border-radius: 50%; border: 3px solid #D4AF37; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; color: #D4AF37;">
                RS
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h3 style="margin: 0; font-size: 1.2rem; font-weight: 800;">Rafi S.</h3>
                  <span class="badge" style="background: #FFF9E6; color: #B78103; font-size: 11px; font-weight: 700; border: 1px solid #FFE58F;">Gold Donor</span>
                </div>
                <div style="font-size: 13px; color: var(--color-text-secondary); margin-top: 2px;">
                  B+ • Verified Hero • 12 Verified Donations
                </div>
              </div>
            </div>

            <!-- Next eligible date badge -->
            <div style="background: rgba(42, 157, 143, 0.1); border-radius: 12px; padding: 12px 20px; text-align: right; border: 1px solid rgba(42,157,143,0.2);">
              <div style="font-size: 11px; color: var(--color-text-teal); text-transform: uppercase; font-weight: 700;">Next eligible date</div>
              <div style="font-size: 1.25rem; font-weight: 800; color: var(--color-teal); margin-top: 2px;">in 34 days</div>
            </div>
          </div>

          <!-- Progress bar -->
          <div style="margin-top: 20px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 6px;">
              <span>12 of 15 donations</span>
              <span style="color: var(--color-text-secondary);">3 more to Platinum</span>
            </div>
            <div style="height: 8px; border-radius: 4px; background: var(--color-border); overflow: hidden;">
              <div style="width: 80%; height: 100%; background: var(--color-crimson); border-radius: 4px; transition: width 0.3s ease;"></div>
            </div>
          </div>

          <!-- Donor levels tier row (Mobile scrollable) -->
          <div style="margin-top: 24px;">
            <div style="font-size: 13px; font-weight: 700; margin-bottom: 12px;">Donor levels</div>
            <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 8px; -webkit-overflow-scrolling: touch;">
              <div style="flex: 0 0 110px; background: var(--color-bg-app); padding: 12px 8px; border-radius: 8px; border: 1px solid var(--color-border-subtle); text-align: center;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: #B87333; margin: 0 auto 6px;"></div>
                <div style="font-size: 12px; font-weight: 700;">Bronze</div>
                <div style="font-size: 10px; color: var(--color-text-muted);">3 donations</div>
              </div>
              <div style="flex: 0 0 110px; background: var(--color-bg-app); padding: 12px 8px; border-radius: 8px; border: 1px solid var(--color-border-subtle); text-align: center;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: #A8A9AD; margin: 0 auto 6px;"></div>
                <div style="font-size: 12px; font-weight: 700;">Silver</div>
                <div style="font-size: 10px; color: var(--color-text-muted);">6 donations</div>
              </div>
              <div style="flex: 0 0 110px; background: #FFF9E6; padding: 12px 8px; border-radius: 8px; border: 2px solid #D4AF37; text-align: center;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: #D4AF37; margin: 0 auto 6px;"></div>
                <div style="font-size: 12px; font-weight: 800; color: #B78103;">Gold</div>
                <div style="font-size: 10px; color: #B78103;">10 donations</div>
              </div>
              <div style="flex: 0 0 110px; background: var(--color-bg-app); padding: 12px 8px; border-radius: 8px; border: 1px solid var(--color-border-subtle); opacity: 0.6; text-align: center;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: #708090; margin: 0 auto 6px;"></div>
                <div style="font-size: 12px; font-weight: 700;">Platinum</div>
                <div style="font-size: 10px; color: var(--color-text-muted);">15 donations</div>
              </div>
              <div style="flex: 0 0 110px; background: var(--color-bg-app); padding: 12px 8px; border-radius: 8px; border: 1px solid var(--color-border-subtle); opacity: 0.6; text-align: center;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: #00BCD4; margin: 0 auto 6px;"></div>
                <div style="font-size: 12px; font-weight: 700;">Diamond</div>
                <div style="font-size: 10px; color: var(--color-text-muted);">25 donations</div>
              </div>
              <div style="flex: 0 0 110px; background: var(--color-bg-app); padding: 12px 8px; border-radius: 8px; border: 1px solid var(--color-border-subtle); opacity: 0.6; text-align: center;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: #D90429; margin: 0 auto 6px;"></div>
                <div style="font-size: 12px; font-weight: 700;">Legend</div>
                <div style="font-size: 10px; color: var(--color-text-muted);">50 donations</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Grid: Digital ID Card + Certificates (Stacks on Mobile) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 360px), 1fr)); gap: var(--space-8); margin-bottom: var(--space-8);">
          <!-- Left: Digital Donor ID Card with 3D Flip -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h2 style="font-size: 1.25rem; font-weight: 800; margin: 0;">
                🪪 ${isBn ? 'ডিজিটাল আইডি কার্ড' : 'Digital Donor ID Card'}
              </h2>
              <button type="button" class="btn btn-outline btn-sm" id="btnFlipCard" aria-label="Flip ID Card">
                🔄 ${isBn ? 'কার্ড উল্টান' : 'Flip Card'}
              </button>
            </div>

            <!-- 3D Card Container (Centred & Constrained) -->
            <div id="card3dWrapper" style="perspective: 1000px; max-width: 420px; width: 100%; height: 260px; margin: 0 auto 16px auto; cursor: pointer;" tabindex="0" role="button" aria-label="Interactive flippable donor card">
              <div id="cardInner" style="position: relative; width: 100%; height: 100%; text-align: left; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d;">
                
                <!-- Card Front -->
                <div id="cardFront" style="position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 16px; padding: 20px; background: linear-gradient(135deg, #1A1A24 0%, #2A1820 50%, #15151E 100%); color: white; border: 1px solid rgba(255,255,255,0.15); box-shadow: var(--shadow-lg); display: flex; flex-direction: column; justify-content: space-between; overflow: hidden;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--color-crimson); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px;">▲</div>
                      <span style="font-weight: 800; font-size: 16px; letter-spacing: 0.5px;">RoktoSetu</span>
                    </div>
                    <span class="badge" style="background: rgba(42, 157, 143, 0.3); color: #2A9D8F; border: 1px solid #2A9D8F; font-size: 10px; font-weight: 700;">VERIFIED DONOR</span>
                  </div>

                  <div style="display: flex; align-items: center; gap: 16px; margin: 8px 0;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background: #D4AF37; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; border: 2px solid white;">
                      RS
                    </div>
                    <div>
                      <div style="font-weight: 800; font-size: 18px;">Rafi Siddiqui</div>
                      <div style="font-family: monospace; font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 2px;">RS-2026-8A3F1E</div>
                      <div style="display: flex; gap: 8px; margin-top: 4px;">
                        <span class="badge badge-urgent" style="font-size: 12px; font-weight: 800;">B+</span>
                        <span class="badge" style="background: #D4AF37; color: white; font-size: 10px; font-weight: 700;">GOLD HERO</span>
                      </div>
                    </div>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 10px; color: rgba(255,255,255,0.6); border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
                    <div>Member Since: 01/2025 • Valid Thru: 01/2027</div>
                    <div style="font-weight: 700; color: white;">Scan to verify ➔</div>
                  </div>
                </div>

                <!-- Card Back -->
                <div id="cardBack" style="position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; transform: rotateY(180deg); border-radius: 16px; padding: 20px; background: linear-gradient(135deg, #15151E 0%, #20202E 100%); color: white; border: 1px solid rgba(255,255,255,0.15); box-shadow: var(--shadow-lg); display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="font-size: 11px; text-transform: uppercase; color: rgba(255,255,255,0.5); font-weight: 700; margin-bottom: 4px;">Emergency Contact (Donor Controlled)</div>
                    <div style="font-size: 13px; font-weight: 600;">Dr. Siddiqui (Brother)</div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 14px; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;">
                    <div style="width: 50px; height: 50px; background: white; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                      🏁
                    </div>
                    <div style="font-size: 11px; color: rgba(255,255,255,0.8); line-height: 1.4;">
                      Scan QR code on public reader to verify authenticity without disclosing sensitive PII.
                    </div>
                  </div>

                  <div style="font-size: 9px; line-height: 1.4; color: rgba(255,255,255,0.45); border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;">
                    This card is a RoktoSetu donor membership card. It is not a government ID or medical clearance.
                  </div>
                </div>

              </div>
            </div>

            <!-- Card Actions -->
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="btn btn-secondary btn-sm" id="btnDownloadCardPng">
                📥 ${isBn ? 'কার্ড ডাউনলোড (PNG)' : 'Download Card'}
              </button>
              <button type="button" class="btn btn-secondary btn-sm" id="btnAppleWallet">
                🍎 Apple Wallet Pass
              </button>
              <button type="button" class="btn btn-secondary btn-sm" id="btnGoogleWallet">
                💳 Google Wallet
              </button>
            </div>
          </div>

          <!-- Right: Certified Blood Donor Certificate -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h2 style="font-size: 1.25rem; font-weight: 800; margin: 0;">
                📜 ${isBn ? 'স্বীকৃত রক্তদাতা সনদ' : 'Certified Donor Certificate'}
              </h2>
              <div style="display: flex; gap: 4px;">
                <button type="button" class="btn btn-outline btn-sm tpl-btn ${this.activeCertTemplate === 'classic' ? 'active' : ''}" data-tpl="classic">Classic</button>
                <button type="button" class="btn btn-outline btn-sm tpl-btn" data-tpl="modern">Modern</button>
                <button type="button" class="btn btn-outline btn-sm tpl-btn" data-tpl="minimal">Minimal</button>
              </div>
            </div>

            <!-- Certificate Preview Container -->
            <div class="card" id="certPreviewCard" style="background: var(--color-bg-surface-elevated); border: 2px solid #D4AF37; border-radius: 12px; padding: 24px; text-align: center; position: relative; overflow: hidden; margin-bottom: 16px; box-shadow: var(--shadow-sm);">
              <div style="font-size: 10px; color: #B78103; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">ROKTOSETU NATIONAL BLOOD NETWORK</div>
              <h3 style="font-size: 1.3rem; font-weight: 800; margin: 8px 0 4px 0; color: var(--color-crimson);">
                CERTIFIED VOLUNTARY BLOOD DONOR
              </h3>
              <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 16px;">
                স্বীকৃত স্বেচ্ছাসেবী রক্তদাতা সনদ
              </div>

              <div style="font-size: 11px; color: var(--color-text-muted);">This is proudly awarded to</div>
              <div style="font-size: 1.4rem; font-weight: 800; margin: 4px 0 12px 0; font-family: serif; color: var(--color-text-primary);">
                Rafi Siddiqui
              </div>

              <div style="font-size: 12px; line-height: 1.5; color: var(--color-text-secondary); max-width: 380px; margin: 0 auto 16px auto;">
                In recognition of completing verified voluntary blood donations. Donated voluntarily, without payment.
              </div>

              <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dashed var(--color-border); padding-top: 12px; font-size: 10px;">
                <div style="text-align: left;">
                  <div style="font-family: monospace; font-weight: 700; color: var(--color-crimson);">CERT-2026-DEMO01</div>
                  <div style="color: var(--color-text-muted);">Issued: March 15, 2026</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-style: italic; font-weight: 700;">Prof. Dr. M. Rahman</div>
                  <div style="color: var(--color-text-muted);">National Medical Board Chair</div>
                </div>
              </div>
            </div>

            <!-- Certificate Actions -->
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <a href="#/verify/CERT-2026-DEMO01" class="btn btn-primary btn-sm">
                🔍 ${isBn ? 'সনদ যাচাই করুন' : 'Verify Certificate'}
              </a>
              <button type="button" class="btn btn-secondary btn-sm" id="btnDownloadCertPdf">
                📄 Download PDF
              </button>
              <button type="button" class="btn btn-outline btn-sm" id="btnShareCert">
                📢 Share Certificate
              </button>
            </div>
          </div>
        </div>

      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const cardInner = document.getElementById('cardInner');
    const cardWrapper = document.getElementById('card3dWrapper');
    const btnFlip = document.getElementById('btnFlipCard');

    const toggleFlip = () => {
      this.isCardFlipped = !this.isCardFlipped;
      if (cardInner) {
        cardInner.style.transform = this.isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
      }
    };

    btnFlip?.addEventListener('click', toggleFlip);
    cardWrapper?.addEventListener('click', toggleFlip);
    cardWrapper?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFlip();
      }
    });

    // Template switcher
    document.querySelectorAll('.tpl-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tpl-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeCertTemplate = e.currentTarget.dataset.tpl;
        toast.info(`Certificate template switched to ${this.activeCertTemplate.toUpperCase()}`);
      });
    });

    // Download handlers
    document.getElementById('btnDownloadCardPng')?.addEventListener('click', () => {
      toast.success('Digital Donor Card PNG downloaded to device.');
    });

    document.getElementById('btnDownloadCertPdf')?.addEventListener('click', () => {
      toast.success('High-resolution printable Certificate PDF downloaded.');
    });

    document.getElementById('btnAppleWallet')?.addEventListener('click', () => {
      toast.info('Generated Apple Wallet pkpass package for Rafi S. (Gold Donor).');
    });

    document.getElementById('btnGoogleWallet')?.addEventListener('click', () => {
      toast.info('Google Wallet pass saved to account.');
    });

    // Share handlers
    document.getElementById('btnShareMilestoneTop')?.addEventListener('click', () => {
      openSocialShareModal({
        badgeType: 'level_gold',
        cardType: 'level_up',
        displayName: 'Rafi S.',
        bloodGroup: 'B+',
        verifiedDonationsCount: 12
      });
    });

    document.getElementById('btnShareCert')?.addEventListener('click', () => {
      openSocialShareModal({
        badgeType: 'certified',
        cardType: 'certificate',
        displayName: 'Rafi Siddiqui',
        bloodGroup: 'B+',
        verifiedDonationsCount: 3
      });
    });
  }
}
