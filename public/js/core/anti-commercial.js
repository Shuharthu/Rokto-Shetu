/**
 * @file anti-commercial.js
 * @description Ethics filter for anti-commercialization of blood donations.
 * Strictly enforces zero-cash blood policy while allowing legitimate medical/transport expenses.
 */

// Contexts subject to anti-commercialization filtering
export const REGULATED_CONTEXTS = ['blood_request', 'blood_chat', 'donor_message'];

// Commercial demand/offer keywords (Unicode boundary aware)
const COMMERCIAL_KEYWORDS = [
  'cash', 'money', 'payment', 'paid', 'pay', 'selling', 'sell', 'sold', 'buy', 'buying',
  'bdt', 'tk', 'taka', 'price', 'fee', 'charge', 'rate',
  'টাকা', 'টাকায়', 'মূল্য', 'দাম', 'পয়সা', 'অর্থ', 'পারিশ্রমিক', 'কেনার', 'বিক্রি', 'বিক্রির'
];

// Legitimate auxiliary expense context keywords that exempt legitimate messages
const LEGITIMATE_COST_EXEMPTIONS = [
  'cng', 'c.n.g', 'uber', 'pathao', 'rickshaw', 'রিকশা', 'রিকশাভাড়া', 'বাস', 'বাসভাড়া',
  'ভাড়া', 'ভাড়ার', 'যাতায়াত', 'যাতায়াত খরচ', 'গাড়ি ভাড়া', 'গাড়ি', 'transport', 'fare', 'travel',
  'ambulance', 'অ্যাম্বুলেন্স', 'পেট্রোল', 'যাওয়া আসা',
  'hospital bill', 'admission', 'admission fee', 'test fee', 'screening fee', 'bed fee',
  'cross matching', 'cross-matching', 'crossmatch', 'ক্রসম্যাচ', 'ক্রস ম্যাচিং', 'হাসপাতাল বিল',
  'পরীক্ষা ফি', 'ভর্তি ফি', 'ল্যাব ফি', 'lab fee', 'স্যালাইন', 'সুচ', 'সিরিঞ্জ',
  'ব্লাড ব্যাগ', 'blood bag', 'needle', 'syringe', 'saline', 'medicine', 'medicines', 'pharmacy',
  'ঔষধ', 'ওষুধ', 'ফার্মেসি', 'প্রেসক্রিপশন', 'prescription'
];

function buildBoundaryRegex(words) {
  const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const boundaryPre = '(?:^|[\\s.,!?;:\'"`()\\[\\]{}—–\\-৳/])';
  const boundaryPost = '(?:$|[\\s.,!?;:\'"`()\\[\\]{}—–\\-৳/])';
  return new RegExp(`${boundaryPre}(${escaped.join('|')})${boundaryPost}`, 'i');
}

const commercialRegex = buildBoundaryRegex(COMMERCIAL_KEYWORDS);
const exemptionRegex = buildBoundaryRegex(LEGITIMATE_COST_EXEMPTIONS);

const HARD_PROHIBITED_PHRASES = [
  /রক্ত(?:\s+এর|\s+বিক্রি|\s+বিক্রির|\s+কেনার|\s+দাম|\s+মূল্য|\s+টাকা)/i,
  /রক্তের\s+(?:জন্য\s+)?(?:\d+\s+)?(?:টাকা|মূল্য|দাম|পয়সা)/i,
  /blood\s+(?:selling|sale|buy|price|cost|charge)/i,
  /(?:sell|selling|buy|buying)\s+(?:blood|b\+|a\+|o\+|ab\+|b-|a-|o-|ab-)/i,
  /(?:\d+|cash|payment)\s+(?:for|per)\s+(?:blood|bag\s+of\s+blood|donation)/i
];

/**
 * Evaluates whether text violates the anti-commercialization policy.
 */
export function evaluateCommercialContent(text, context = 'blood_chat') {
  if (!text || typeof text !== 'string') {
    return {
      allowed: true,
      reason: null,
      matchedKeyword: null,
      explanationEn: '',
      explanationBn: '',
      canAppeal: false
    };
  }

  if (!REGULATED_CONTEXTS.includes(context)) {
    return {
      allowed: true,
      reason: 'CONTEXT_EXEMPT',
      matchedKeyword: null,
      explanationEn: '',
      explanationBn: '',
      canAppeal: false
    };
  }

  const cleanText = text.trim();

  for (const phraseRegex of HARD_PROHIBITED_PHRASES) {
    if (phraseRegex.test(cleanText)) {
      return {
        allowed: false,
        reason: 'PROHIBITED_BLOOD_SALE',
        matchedKeyword: 'blood_sale_phrase',
        explanationEn: 'Direct sale or monetary compensation for blood is strictly prohibited by law and RoktoSetu policy.',
        explanationBn: 'রক্তের জন্য কোনো প্রকার আর্থিক পারিশ্রমিক বা বিক্রি আইনত ও রক্তসেতুর নীতি অনুযায়ী সম্পূর্ণ নিষিদ্ধ।',
        canAppeal: true
      };
    }
  }

  const commercialMatch = cleanText.match(commercialRegex);
  if (commercialMatch) {
    const matchedToken = commercialMatch[1];
    const isExempt = exemptionRegex.test(cleanText);
    if (isExempt) {
      return {
        allowed: true,
        reason: 'LEGITIMATE_EXPENSE_EXEMPTION',
        matchedKeyword: matchedToken,
        explanationEn: 'Permitted as legitimate transport or hospital expense context.',
        explanationBn: 'বৈধ যাতায়াত বা চিকিৎসা ব্যয়ের প্রেক্ষাপটে অনুমোদিত।',
        canAppeal: false
      };
    }

    return {
      allowed: false,
      reason: 'COMMERCIAL_KEYWORD_DETECTED',
      matchedKeyword: matchedToken,
      explanationEn: `Monetary keyword ("${matchedToken}") detected. Blood donation is purely voluntary without cash exchange. If you are discussing transport (CNG/bus) or hospital test fees, please include that context.`,
      explanationBn: `আর্থিক শব্দ ("${matchedToken}") পাওয়া গেছে। রক্তদান সম্পূর্ণ স্বেচ্ছাসেবী ও বিনিময়হীন। আপনি যদি যাতায়াত ভাড়া (সিএনজি/বাস) বা হাসপাতালের ফি নিয়ে আলোচনা করে থাকেন, তবে দয়া করে সেটি স্পষ্ট উল্লেখ করুন।`,
      canAppeal: true
    };
  }

  return {
    allowed: true,
    reason: null,
    matchedKeyword: null,
    explanationEn: '',
    explanationBn: '',
    canAppeal: false
  };
}

/**
 * Shows an explanatory policy modal when a user's message is blocked by the anti-commercial filter.
 */
export function showAntiCommercialBlockedModal(evalResult, originalMessage, onAppealSubmitted) {
  const existing = document.getElementById('antiCommercialModal');
  if (existing) existing.remove();

  const isBn = (localStorage.getItem('roktosetu_lang') || 'en') === 'bn';

  const title = isBn ? '⚠️ বার্তাটি নীতিমালার কারণে স্থগিত করা হয়েছে' : '⚠️ Message Blocked by Ethics Filter';
  const explanation = isBn ? evalResult.explanationBn : evalResult.explanationEn;
  const appealBtnText = isBn ? 'ভুল সনাক্তকরণ রিপোর্ট করুন (আপিল)' : 'Report False Positive';
  const closeBtnText = isBn ? 'বুঝেছি' : 'Understood';

  const modal = document.createElement('div');
  modal.id = 'antiCommercialModal';
  modal.style.cssText = `
    position: fixed; inset: 0; background: rgba(0,0,0,0.65);
    display: flex; align-items: center; justify-content: center;
    z-index: 10000; padding: 16px; animation: fadeIn 0.15s ease-out;
  `;

  modal.innerHTML = `
    <div class="card" style="max-width: 520px; width: 100%; border: 2px solid var(--color-danger); box-shadow: var(--shadow-lg);">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
        <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(220, 38, 38, 0.15); display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--color-danger);">
          🚫
        </div>
        <div>
          <h3 style="margin: 0; font-size: 1.1rem; color: var(--color-danger); font-weight: 700;">${title}</h3>
          <span style="font-size: 12px; color: var(--color-text-secondary);">RoktoSetu Zero-Commercialization Policy</span>
        </div>
      </div>

      <div style="background: var(--color-bg-app); border-radius: 8px; padding: 14px; margin-bottom: 16px; font-size: 13px; line-height: 1.6; color: var(--color-text-primary);">
        <p style="margin: 0 0 8px 0; font-weight: 600;">${explanation}</p>
        <p style="margin: 0; font-size: 12px; color: var(--color-text-muted);">
          ${isBn ? 'রক্তসেতুতে রক্ত কেনা-বেচা কঠোরভাবে নিষিদ্ধ। তবে রোগীর যাতায়াত (সিএনজি/অ্যাম্বুলেন্স ভাড়া) বা হাসপাতালের ল্যাব পরীক্ষার বিল সম্পর্কে কথা বলা অনুমোদিত।' : 'RoktoSetu strictly prohibits buying or selling blood. Legitimate auxiliary expenses like patient transport (CNG/ambulance) or hospital lab tests are permitted if specified.'}
        </p>
      </div>

      <div style="font-size: 12px; color: var(--color-text-secondary); margin-bottom: 20px;">
        ${isBn ? 'আপনার বার্তা:' : 'Your blocked message:'} <code style="background: var(--color-bg-surface-elevated); padding: 2px 6px; border-radius: 4px;">${originalMessage.substring(0, 80)}${originalMessage.length > 80 ? '...' : ''}</code>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <button type="button" class="btn btn-secondary" id="btnDismissCommercialModal">
          ${closeBtnText}
        </button>
        <button type="button" class="btn btn-outline" id="btnAppealCommercialFilter" style="border-color: var(--color-warning); color: var(--color-warning);">
          ${appealBtnText}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('btnDismissCommercialModal')?.addEventListener('click', () => {
    modal.remove();
  });

  document.getElementById('btnAppealCommercialFilter')?.addEventListener('click', () => {
    modal.remove();
    if (typeof onAppealSubmitted === 'function') {
      onAppealSubmitted({
        originalMessage,
        reason: evalResult.reason,
        matchedKeyword: evalResult.matchedKeyword,
        reportedAt: new Date().toISOString()
      });
    }
  });
}
