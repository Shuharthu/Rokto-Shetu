/**
 * @file antiCommercial.js
 * @description Ethics filter for anti-commercialization of blood donations.
 * Strictly enforces zero-cash blood policy while allowing legitimate medical/transport expenses.
 */

// Contexts subject to anti-commercialization filtering
export const REGULATED_CONTEXTS = ['blood_request', 'blood_chat', 'donor_message'];

// Commercial demand/offer keywords (Unicode boundary aware)
// English + Bengali
const COMMERCIAL_KEYWORDS = [
  // English
  'cash', 'money', 'payment', 'paid', 'pay', 'selling', 'sell', 'sold', 'buy', 'buying',
  'bdt', 'tk', 'taka', 'price', 'fee', 'charge', 'rate',
  // Bengali
  'টাকা', 'টাকায়', 'মূল্য', 'দাম', 'পয়সা', 'অর্থ', 'পারিশ্রমিক', 'কেনার', 'বিক্রি', 'বিক্রির', 'পারিশ্রমিক'
];

// Legitimate auxiliary expense context keywords that exempt legitimate messages
const LEGITIMATE_COST_EXEMPTIONS = [
  // Transport & Travel
  'cng', 'c.n.g', 'uber', 'pathao', 'rickshaw', 'রিকশা', 'রিকশাভাড়া', 'বাস', 'বাসভাড়া',
  'ভাড়া', 'ভাড়ার', 'যাতায়াত', 'যাতায়াত খরচ', 'গাড়ি ভাড়া', 'গাড়ি', 'transport', 'fare', 'travel',
  'ambulance', 'অ্যাম্বুলেন্স', 'পেট্রোল', 'যাওয়া আসা',
  // Hospital & Clinical Supplies
  'hospital bill', 'admission', 'admission fee', 'test fee', 'screening fee', 'bed fee',
  'cross matching', 'cross-matching', 'crossmatch', 'ক্রসম্যাচ', 'ক্রস ম্যাচিং', 'হাসপাতাল বিল',
  'পরীক্ষা ফি', 'ভর্তি ফি', 'ল্যাব ফি', 'lab fee', 'স্যালাইন', 'সুচ', 'সিরিঞ্জ',
  'ব্লাড ব্যাগ', 'blood bag', 'needle', 'syringe', 'saline', 'medicine', 'medicines', 'pharmacy',
  'ঔষধ', 'ওষুধ', 'ফার্মেসি', 'প্রেসক্রিপশন', 'prescription'
];

/**
 * Builds boundary-aware regex pattern for a list of words.
 * Works with Unicode characters (e.g. Bengali).
 * @param {string[]} words
 * @returns {RegExp}
 */
function buildBoundaryRegex(words) {
  const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  // Match with start of string, whitespace, or common punctuation before and after
  const boundaryPre = '(?:^|[\\s.,!?;:\'"`()\\[\\]{}—–\\-৳/])';
  const boundaryPost = '(?:$|[\\s.,!?;:\'"`()\\[\\]{}—–\\-৳/])';
  return new RegExp(`${boundaryPre}(${escaped.join('|')})${boundaryPost}`, 'i');
}

const commercialRegex = buildBoundaryRegex(COMMERCIAL_KEYWORDS);
const exemptionRegex = buildBoundaryRegex(LEGITIMATE_COST_EXEMPTIONS);

/**
 * Direct blood selling/buying phrase detector - these are never exempt even if transport is mentioned.
 */
const HARD_PROHIBITED_PHRASES = [
  /রক্ত(?:\s+এর|\s+বিক্রি|\s+বিক্রির|\s+কেনার|\s+দাম|\s+মূল্য|\s+টাকা)/i,
  /রক্তের\s+(?:জন্য\s+)?(?:\d+\s+)?(?:টাকা|মূল্য|দাম|পয়সা)/i,
  /blood\s+(?:selling|sale|buy|price|cost|charge)/i,
  /(?:sell|selling|buy|buying)\s+(?:blood|b\+|a\+|o\+|ab\+|b-|a-|o-|ab-)/i,
  /(?:\d+|cash|payment)\s+(?:for|per)\s+(?:blood|bag\s+of\s+blood|donation)/i
];

/**
 * Evaluates whether text violates the anti-commercialization policy.
 * @param {string} text - Message or request text
 * @param {string} context - 'blood_chat', 'blood_request', 'fundraiser', 'billing'
 * @returns {{
 *   allowed: boolean,
 *   reason: string | null,
 *   matchedKeyword: string | null,
 *   explanationEn: string,
 *   explanationBn: string,
 *   canAppeal: boolean
 * }}
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

  // Strictly NOT applied to fundraisers, invoices, or billing receipts
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

  // 1. Check for hard prohibited phrases (direct blood sale)
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

  // 2. Check for commercial keywords
  const commercialMatch = cleanText.match(commercialRegex);
  if (commercialMatch) {
    const matchedToken = commercialMatch[1];

    // Check if legitimate auxiliary expense exemption applies
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
