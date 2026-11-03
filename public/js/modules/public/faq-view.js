/**
 * @file faq-view.js
 * @description Blood Donation FAQ, Myths vs Facts, Ramadan Guidelines & Fainting Prevention.
 */

export class FaqView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.faqs = [
      {
        q: 'Is donating blood safe? Can I catch an infection?',
        a: 'Donating blood is completely safe. Every needle, collection bag, and tube is 100% sterile, single-use, and disposed of immediately after donation. There is zero risk of contracting HIV, Hepatitis, or any infection from donating.'
      },
      {
        q: 'Can I donate blood while fasting during Ramadan?',
        a: 'Yes, but it is strongly advised by Islamic scholars and medical authorities to donate after Iftar. Donating after breaking your fast ensures proper hydration and avoids dizziness or dehydration during fasting hours.'
      },
      {
        q: 'How can I prevent feeling dizzy or fainting after donating?',
        a: 'Drink at least 500 ml of water or fruit juice 30 minutes before donating. Eat a light meal 2–3 hours prior. After donation, rest in the recliner for 10–15 minutes and enjoy the complimentary snack provided.'
      },
      {
        q: 'Why does RoktoSetu have a strict zero-cash rule?',
        a: 'Under Bangladesh and WHO ethical guidelines, blood donation must be strictly voluntary and unpaid. Monetizing blood endangers patients by encouraging dishonest health disclosures and exploits vulnerable individuals. Anyone attempting to buy or sell blood on RoktoSetu is permanently banned and reported.'
      },
      {
        q: 'How often can I donate whole blood?',
        a: 'In accordance with Bangladesh transfusion medicine standards, healthy male donors can donate every 90 days (3 months), and female donors every 120 days (4 months). Your red blood cells replenish within a few weeks.'
      },
      {
        q: 'What happens to my National ID (NID) and personal phone number?',
        a: 'Your NID is encrypted using Google Cloud KMS (AES-256-GCM) and only verified staff can view it. Your exact phone number is NEVER visible publicly on the map; it is only revealed to a seeker after you explicitly accept their donation request.'
      }
    ];
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container" style="padding:var(--space-8) var(--space-4); max-width:880px;">
        <div style="text-align:center; margin-bottom:var(--space-8);">
          <span class="badge" style="background:var(--color-crimson-subtle); color:var(--color-crimson); font-size:11px; font-weight:800; margin-bottom:8px;">
            KNOWLEDGE BASE & GUIDELINES
          </span>
          <h1 style="font-size:var(--font-size-3xl); font-weight:900;">Frequently Asked Questions</h1>
          <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); margin-top:4px;">
            Clear medical, ethical, and practical answers to common blood donation questions in Bangladesh.
          </p>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          ${this.faqs.map((faq, idx) => `
            <div class="card" style="padding:20px; border:1px solid var(--color-border); border-radius:var(--radius-md);">
              <h3 style="font-size:var(--font-size-md); font-weight:800; color:var(--color-text-primary); margin-bottom:8px;">
                Q: ${faq.q}
              </h3>
              <p style="color:var(--color-text-secondary); font-size:var(--font-size-sm); line-height:1.7;">
                ${faq.a}
              </p>
            </div>
          `).join('')}
        </div>

        <div class="card" style="margin-top:var(--space-8); text-align:center; background:var(--color-bg-base);">
          <h3 style="font-size:var(--font-size-md); font-weight:800; margin-bottom:6px;">Still have questions or medical doubts?</h3>
          <p style="font-size:var(--font-size-xs); color:var(--color-text-secondary); margin-bottom:16px;">
            Our support and medical review volunteers are available 24/7.
          </p>
          <a href="#/map" class="btn btn-primary" style="font-size:12px; font-weight:800;">Find Nearby Emergency Requests</a>
        </div>
      </div>
    `;
  }
}
