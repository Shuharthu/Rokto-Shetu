/**
 * @file anti_commercial.test.js
 * @description Comprehensive dual-language test suite for the Anti-Commercialization Filter.
 * Tests false negatives, false positives, legitimate cost exemptions, and context restrictions.
 */

import { evaluateCommercialContent, REGULATED_CONTEXTS } from '../../functions/src/services/antiCommercial.js';

export async function runAntiCommercialTests() {
  const results = [];

  function assert(name, fn) {
    try {
      fn();
      results.push({ testName: name, passed: true, error: null });
    } catch (err) {
      results.push({ testName: name, passed: false, error: err.message });
    }
  }

  // 1. False Negatives (Prohibited commercial demands MUST be blocked)
  assert('Blocks direct blood selling/cash demands in English', () => {
    const prohibitedMessages = [
      'Give me 5000 taka for blood donation',
      'I need 2000 tk for blood',
      'Pay me cash for my B+ blood',
      'Selling blood 3000 BDT per bag',
      'What is the price of blood donation?',
      'Will donate blood if you pay 1500 money'
    ];

    for (const msg of prohibitedMessages) {
      const res = evaluateCommercialContent(msg, 'blood_chat');
      if (res.allowed) {
        throw new Error(`CRITICAL ETHICS BREACH: Prohibited English message was allowed: "${msg}"`);
      }
      if (!res.canAppeal) {
        throw new Error(`Expected canAppeal to be true for blocked message: "${msg}"`);
      }
    }
  });

  assert('Blocks direct blood selling/cash demands in Bengali', () => {
    const prohibitedBengaliMessages = [
      'রক্তের জন্য ৫০০০ টাকা লাগবে',
      'রক্তের দাম কত টাকা?',
      'রক্ত বিক্রি করব জরুরি প্রয়োজনে',
      'রক্তের জন্য পারিশ্রমিক দিতে হবে',
      'রক্তের বিনিময়ে টাকা চাই'
    ];

    for (const msg of prohibitedBengaliMessages) {
      const res = evaluateCommercialContent(msg, 'blood_chat');
      if (res.allowed) {
        throw new Error(`CRITICAL ETHICS BREACH: Prohibited Bengali message was allowed: "${msg}"`);
      }
      if (!res.explanationBn) {
        throw new Error(`Missing Bengali explanation for: "${msg}"`);
      }
    }
  });

  // 2. False Positives (Legitimate auxiliary costs MUST be allowed)
  assert('Allows legitimate transport and travel expenses in English and Bengali', () => {
    const legitimateTransport = [
      'CNG transport fare is 200 tk to CMCH',
      'Ambulance fare will be 1500 bdt to hospital',
      'Need rickshaw fare to reach blood bank quickly',
      'রোগীর সিএনজি ভাড়া লাগবে ২০০ টাকা',
      'অ্যাম্বুলেন্স ভাড়া বাবদ ১৫০০ টাকা প্রয়োজন',
      'যাতায়াত খরচ বাবদ বাসভাড়া লাগবে'
    ];

    for (const msg of legitimateTransport) {
      const res = evaluateCommercialContent(msg, 'blood_chat');
      if (!res.allowed) {
        throw new Error(`FALSE POSITIVE: Legitimate transport expense was blocked: "${msg}" (reason: ${res.reason})`);
      }
    }
  });

  assert('Allows legitimate hospital bills, lab tests, and clinical supplies', () => {
    const legitimateMedical = [
      'Hospital admission fee and bed charges are pending at counter',
      'Cross matching test fee at the laboratory is 500 tk',
      'Need blood bag, syringe, and needle from pharmacy',
      'হাসপাতাল বিল পরিশোধ করতে হবে কাউন্টারে',
      'ল্যাব ক্রসম্যাচ পরীক্ষা ফি ৫০০ টাকা জমা দিয়েছি',
      'ফার্মেসি থেকে স্যালাইন ও প্রেসক্রিপশনের ওষুধ আনতে হবে'
    ];

    for (const msg of legitimateMedical) {
      const res = evaluateCommercialContent(msg, 'blood_chat');
      if (!res.allowed) {
        throw new Error(`FALSE POSITIVE: Legitimate clinical bill was blocked: "${msg}" (reason: ${res.reason})`);
      }
    }
  });

  assert('Allows benign conversational messages without false positives', () => {
    const benignMessages = [
      'I am arriving at the hospital ward 4 now',
      'The patient is undergoing surgery in OT 2',
      'Thank you so much brother, may Allah bless you',
      'আমি হাসপাতালের জরুরি বিভাগে পৌঁছে গেছি',
      'রোগীর অবস্থা এখন আগের চেয়ে ভালো আছে'
    ];

    for (const msg of benignMessages) {
      const res = evaluateCommercialContent(msg, 'blood_chat');
      if (!res.allowed) {
        throw new Error(`FALSE POSITIVE: Normal polite chat was blocked: "${msg}"`);
      }
    }
  });

  // 3. Context Restrictions: Fundraisers & Invoices are NEVER filtered
  assert('Never blocks fundraiser donations or billing invoices (context exemption)', () => {
    const fundraiserText = 'Raised 50000 BDT for cancer chemotherapy treatment costs';
    const invoiceText = 'B2B Hospital subscription fee 15000 tk per month';

    const fundraiserRes = evaluateCommercialContent(fundraiserText, 'fundraiser');
    if (!fundraiserRes.allowed || fundraiserRes.reason !== 'CONTEXT_EXEMPT') {
      throw new Error('Fundraiser text was incorrectly filtered by anti-commercial filter');
    }

    const billingRes = evaluateCommercialContent(invoiceText, 'billing');
    if (!billingRes.allowed || billingRes.reason !== 'CONTEXT_EXEMPT') {
      throw new Error('Billing invoice was incorrectly filtered by anti-commercial filter');
    }
  });

  // 4. Boundary precision: Words like 'attack' or 'taking' should not trigger 'tk' or 'taka'
  assert('Enforces strict word boundaries so partial substring matches do not trigger', () => {
    const trickyWords = [
      'Heart attack patient in ICU',
      'Taking the patient to surgery',
      'Contact number is updated'
    ];

    for (const msg of trickyWords) {
      const res = evaluateCommercialContent(msg, 'blood_chat');
      if (!res.allowed) {
        throw new Error(`FALSE POSITIVE on partial word boundary: "${msg}"`);
      }
    }
  });

  return results;
}
