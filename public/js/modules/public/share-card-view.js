/**
 * @file share-card-view.js
 * @description Public view for social milestone share links (#/a/:shareId).
 * Renders the achievement card with Open Graph tags and call-to-action for new donors.
 */

export class ShareCardView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  async render(shareId = null) {
    if (!this.container) return;

    if (!shareId) {
      const hash = window.location.hash;
      const parts = hash.split('/');
      shareId = parts[2] || parts[1] || 'sh_demo_gold';
    }

    const isBn = (localStorage.getItem('roktosetu_lang') || 'en') === 'bn';

    const mockShare = {
      shareId,
      displayName: 'Rafi S.',
      badgeType: 'level_gold',
      titleEn: 'Promoted to Gold Blood Donor',
      titleBn: 'গোল্ড রক্তদাতা স্তরে উন্নীত হয়েছেন',
      bloodGroup: 'B+',
      verifiedDonationsCount: 12,
      createdAt: new Date().toISOString()
    };

    this.container.innerHTML = `
      <div class="container" style="max-width: 680px; padding: var(--space-10) var(--space-4); text-align: center;">
        <div style="margin-bottom: var(--space-6);">
          <a href="#/" class="btn btn-outline btn-sm">← ${isBn ? 'রক্তসেতু হোমপেজে যান' : 'Go to RoktoSetu Home'}</a>
        </div>

        <!-- Social Card -->
        <div class="card" style="box-shadow: var(--shadow-lg); border: 2px solid var(--color-crimson); padding: var(--space-8); background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #881337 100%); color: white; border-radius: 16px; margin-bottom: 24px;">
          <div style="font-size: 40px; margin-bottom: 12px;">🏆</div>
          <div style="font-size: 13px; color: #F59E0B; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px; margin-bottom: 8px;">
            ${isBn ? mockShare.titleBn : mockShare.titleEn}
          </div>
          <h1 style="font-size: 2.2rem; font-weight: 900; margin: 0 0 16px 0; color: white;">
            ${mockShare.displayName}
          </h1>

          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px;">
            <span class="badge badge-urgent" style="font-size: 14px; font-weight: 800; padding: 6px 14px;">${mockShare.bloodGroup}</span>
            <span class="badge" style="background: rgba(255,255,255,0.2); color: white; font-size: 14px; font-weight: 700; padding: 6px 14px;">${mockShare.verifiedDonationsCount} Life-Saving Donations</span>
            <span class="badge" style="background: #D4AF37; color: white; font-size: 14px; font-weight: 800; padding: 6px 14px;">GOLD HERO</span>
          </div>

          <div style="font-size: 14px; color: rgba(255,255,255,0.85); font-style: italic; max-width: 440px; margin: 0 auto 20px auto; line-height: 1.6;">
            "${isBn ? 'প্রতিটি ফোঁটা, জীবনের সেতু। রক্তদানের মাধ্যমে একজন মানুষ বাঁচায় পুরো মানবজাতিকে।' : 'Every drop, a bridge to life. By giving blood freely, we build a bridge between life and death.'}"
          </div>

          <div style="font-size: 11px; color: rgba(255,255,255,0.6); border-top: 1px solid rgba(255,255,255,0.15); padding-top: 14px;">
            🕊️ Donated voluntarily, without payment. • RoktoSetu National Blood Registry
          </div>
        </div>

        <!-- Join CTA -->
        <div class="card" style="padding: var(--space-6); background: var(--color-bg-surface-elevated);">
          <h3 style="margin: 0 0 8px 0; font-size: 1.2rem; font-weight: 800;">
            ${isBn ? 'আপনিও হতে পারেন একজন জীবনরক্ষক' : 'Become a Life-Saver Like Rafi'}
          </h3>
          <p style="font-size: 13px; color: var(--color-text-secondary); margin: 0 0 16px 0;">
            ${isBn ? 'রক্তসেতুতে নিবন্ধন করুন, আপনার এলাকায় রক্তের জরুরি প্রয়োজনে পাশে দাঁড়ান।' : 'Join thousands of voluntary donors across Bangladesh. Register in 2 minutes.'}
          </p>
          <a href="#/login" class="btn btn-primary" style="padding: 10px 24px; font-size: 14px;">
            ${isBn ? 'রক্তদাতা হিসেবে যোগ দিন' : 'Join as a Blood Donor'}
          </a>
        </div>
      </div>
    `;
  }
}
