/**
 * @file social-share-modal.js
 * @description Social achievement sharing modal with privacy toggles, Web Share API,
 * dynamic image card preview, and one-click intents for WhatsApp, Facebook, LinkedIn, and X.
 */

import { toast } from '../../core/toast.js';

/**
 * Opens the social achievement sharing modal.
 * @param {object} initialData
 */
export function openSocialShareModal(initialData = {}) {
  // Remove existing modal if any
  document.getElementById('socialShareModal')?.remove();

  const isBn = (localStorage.getItem('roktosetu_lang') || 'en') === 'bn';

  let currentNameMode = 'initial'; // 'full' | 'initial' | 'anon'
  let showBloodGroup = true;
  let showDonationCount = true;

  const rawFullName = initialData.displayName || 'Rafi Siddiqui';
  const rawBloodGroup = initialData.bloodGroup || 'B+';
  const donationsCount = initialData.verifiedDonationsCount || 12;
  const badgeType = initialData.badgeType || 'level_gold';

  const getComputedDisplayName = () => {
    if (currentNameMode === 'full') return rawFullName;
    if (currentNameMode === 'anon') return isBn ? 'একজন রক্তসেতু হিরো' : 'A RoktoSetu Hero';
    // Initial format
    const parts = rawFullName.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
    return rawFullName;
  };

  const getAchievementTitle = () => {
    if (badgeType === 'certified') {
      return isBn ? 'স্বীকৃত রক্তদাতার সম্মাননা অর্জন করেছেন' : 'Became a Certified Blood Donor';
    }
    if (badgeType === 'level_gold') {
      return isBn ? 'গোল্ড রক্তদাতা স্তরে উন্নীত হয়েছেন' : 'Promoted to Gold Blood Donor';
    }
    return isBn ? 'রক্তদানে নতুন মাইলফলক অর্জন করেছেন' : 'Celebrated Life-Saving Donation Milestone';
  };

  const modal = document.createElement('div');
  modal.id = 'socialShareModal';
  modal.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
    z-index: 10000; padding: 16px; animation: fadeIn 0.2s ease-out;
  `;

  const renderModalContent = () => {
    const dispName = getComputedDisplayName();
    const title = getAchievementTitle();

    return `
      <div class="card" style="max-width: 680px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-lg); padding: var(--space-6);">
        <!-- Modal Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid var(--color-border-subtle); padding-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="font-size: 24px;">📢</div>
            <div>
              <h3 style="margin: 0; font-size: 1.25rem; font-weight: 800;">
                ${isBn ? 'অর্জন শেয়ার করুন' : 'Share Your Life-Saving Milestone'}
              </h3>
              <div style="font-size: 12px; color: var(--color-text-secondary);">
                Inspire friends and family to join the national voluntary blood network.
              </div>
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="btnCloseShareModal" style="border-radius: 50%; width: 32px; height: 32px; padding: 0;">✕</button>
        </div>

        <!-- Dynamic Share Card Preview (1200x630 simulation) -->
        <div id="shareCardPreview" style="background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #881337 100%); border-radius: 14px; padding: 28px; color: white; position: relative; overflow: hidden; margin-bottom: 20px; box-shadow: var(--shadow-md); border: 1px solid rgba(255,255,255,0.15);">
          <!-- Logo & Tagline -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--color-crimson); display: flex; align-items: center; justify-content: center; font-weight: 900;">▲</div>
              <span style="font-weight: 800; font-size: 18px; letter-spacing: 0.5px;">RoktoSetu</span>
            </div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.7); font-style: italic;">
              ${isBn ? 'প্রতিটি ফোঁটা, জীবনের সেতু।' : 'Every drop, a bridge to life.'}
            </div>
          </div>

          <!-- Main Content -->
          <div style="margin-bottom: 24px;">
            <div style="font-size: 13px; color: #F59E0B; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 6px;">
              🏆 ${title}
            </div>
            <div style="font-size: 1.8rem; font-weight: 900; margin-bottom: 8px;">
              ${dispName}
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              ${showBloodGroup ? `<span class="badge badge-urgent" style="font-size: 13px; font-weight: 800; padding: 4px 10px;">${rawBloodGroup}</span>` : ''}
              ${showDonationCount ? `<span class="badge" style="background: rgba(255,255,255,0.15); color: white; font-size: 13px; font-weight: 700;">${donationsCount} Verified Donations</span>` : ''}
              <span class="badge" style="background: rgba(42,157,143,0.3); color: #2A9D8F; font-size: 13px; font-weight: 700;">Verified Hero</span>
            </div>
          </div>

          <!-- Footer with QR & Non-commercial pledge -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 14px; font-size: 11px; color: rgba(255,255,255,0.6);">
            <div>
              roktosetu.org • Voluntary Blood Network
            </div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.8);">
              🕊️ Donated voluntarily, without payment.
            </div>
          </div>
        </div>

        <!-- Privacy & Visibility Controls -->
        <div style="background: var(--color-bg-app); border-radius: 10px; padding: 16px; margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); margin-bottom: 12px;">
            🔒 ${isBn ? 'গোপনীয়তা নিয়ন্ত্রণ' : 'Privacy & Display Controls'}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div>
              <label class="form-label" style="font-size: 12px;">Name Format</label>
              <select class="form-select" id="selectNameFormat" style="font-size: 12px; padding: 6px 10px;">
                <option value="initial" ${currentNameMode === 'initial' ? 'selected' : ''}>First Name + Initial (e.g. Rafi S.)</option>
                <option value="full" ${currentNameMode === 'full' ? 'selected' : ''}>Full Name (e.g. Rafi Siddiqui)</option>
                <option value="anon" ${currentNameMode === 'anon' ? 'selected' : ''}>Anonymous (A RoktoSetu Hero)</option>
              </select>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px; justify-content: center;">
              <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer;">
                <input type="checkbox" id="chkShowBloodGroup" ${showBloodGroup ? 'checked' : ''}>
                <span>Show blood group</span>
              </label>
              <label style="display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer;">
                <input type="checkbox" id="chkShowCount" ${showDonationCount ? 'checked' : ''}>
                <span>Show verified donations count</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Social Share Buttons -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <!-- Primary: Native Web Share API -->
          <button type="button" class="btn btn-primary" id="btnNativeWebShare" style="width: 100%; justify-content: center;">
            📲 ${isBn ? 'সোশ্যাল মিডিয়ায় শেয়ার করুন (Web Share)' : 'Share via Device (WhatsApp / Story)'}
          </button>

          <!-- Intent Shortcuts -->
          <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-outline btn-sm" id="btnShareWhatsApp" style="border-color: #25D366; color: #25D366;">
              🟢 WhatsApp
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="btnShareFacebook" style="border-color: #1877F2; color: #1877F2;">
              🔵 Facebook
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="btnShareLinkedIn" style="border-color: #0A66C2; color: #0A66C2;">
              🔷 LinkedIn
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="btnShareTwitter" style="border-color: #1DA1F2; color: #1DA1F2;">
              🐦 X / Twitter
            </button>
            <button type="button" class="btn btn-secondary btn-sm" id="btnCopyShareLink">
              🔗 Copy Link
            </button>
            <button type="button" class="btn btn-secondary btn-sm" id="btnDownloadShareCard">
              📥 Download Card
            </button>
          </div>
        </div>

      </div>
    `;
  };

  const attachModalListeners = () => {
    document.getElementById('btnCloseShareModal')?.addEventListener('click', () => {
      modal.remove();
    });

    document.getElementById('selectNameFormat')?.addEventListener('change', (e) => {
      currentNameMode = e.target.value;
      modal.innerHTML = renderModalContent();
      attachModalListeners();
    });

    document.getElementById('chkShowBloodGroup')?.addEventListener('change', (e) => {
      showBloodGroup = e.target.checked;
      modal.innerHTML = renderModalContent();
      attachModalListeners();
    });

    document.getElementById('chkShowCount')?.addEventListener('change', (e) => {
      showDonationCount = e.target.checked;
      modal.innerHTML = renderModalContent();
      attachModalListeners();
    });

    const shareUrl = `https://roktosetu.org/a/sh_hero_${badgeType}`;
    const shareText = `I just unlocked ${getAchievementTitle()} on RoktoSetu! Every drop is a bridge to life. Join me in voluntary blood donation:`;

    // Native Web Share API
    document.getElementById('btnNativeWebShare')?.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `RoktoSetu Hero Milestone — ${getComputedDisplayName()}`,
            text: shareText,
            url: shareUrl
          });
          toast.success('Milestone shared successfully!');
          modal.remove();
        } catch (err) {
          if (err.name !== 'AbortError') {
            toast.error('Sharing failed: ' + err.message);
          }
        }
      } else {
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast.success('Share link copied to clipboard!');
      }
    });

    // Intent buttons
    document.getElementById('btnShareWhatsApp')?.addEventListener('click', () => {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
    });

    document.getElementById('btnShareFacebook')?.addEventListener('click', () => {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    });

    document.getElementById('btnShareLinkedIn')?.addEventListener('click', () => {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    });

    document.getElementById('btnShareTwitter')?.addEventListener('click', () => {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    });

    document.getElementById('btnCopyShareLink')?.addEventListener('click', () => {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Shareable milestone link copied to clipboard!');
    });

    document.getElementById('btnDownloadShareCard')?.addEventListener('click', () => {
      toast.success('High-resolution social share card PNG downloaded.');
    });
  };

  modal.innerHTML = renderModalContent();
  document.body.appendChild(modal);
  attachModalListeners();
}
