/**
 * @file i18n.js
 * @description Bilingual (English / Bangla) translation engine with data-i18n parser & numeral converter.
 */

let currentLang = localStorage.getItem('roktosetu_lang') || 'en';
const dictionaries = {
  en: null,
  bn: null
};

const BANGLA_NUMERALS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/**
 * Converts Western digits (0-9) to Eastern Bangla digits (০-৯).
 * @param {string|number} num
 * @returns {string}
 */
export function toBanglaNumeral(num) {
  if (num === null || num === undefined) return '';
  return String(num).replace(/[0-9]/g, digit => BANGLA_NUMERALS[parseInt(digit, 10)]);
}

/**
 * Initializes i18n dictionaries.
 */
export async function initI18n() {
  try {
    const [enRes, bnRes] = await Promise.all([
      fetch('/i18n/en.json'),
      fetch('/i18n/bn.json')
    ]);

    dictionaries.en = await enRes.json();
    dictionaries.bn = await bnRes.json();
  } catch (err) {
    console.error('Failed to load i18n dictionaries:', err);
    // Fallback minimal dictionary to prevent crashes
    dictionaries.en = {};
    dictionaries.bn = {};
  }

  setLanguage(currentLang);
}

/**
 * Gets a nested translation value by dot path (e.g., 'hero.titlePrefix').
 * @param {string} keyPath
 * @param {object} [params]
 * @returns {string}
 */
export function t(keyPath, params = {}) {
  const dict = dictionaries[currentLang] || dictionaries.en || {};
  const keys = keyPath.split('.');
  let val = dict;

  for (const k of keys) {
    if (val && typeof val === 'object' && k in val) {
      val = val[k];
    } else {
      return keyPath; // Fallback to key if not found
    }
  }

  if (typeof val === 'string') {
    return val.replace(/\{\{(\w+)\}\}/g, (_, p) => {
      let paramVal = params[p] !== undefined ? params[p] : '';
      if (currentLang === 'bn' && typeof paramVal === 'number') {
        paramVal = toBanglaNumeral(paramVal);
      }
      return paramVal;
    });
  }

  return keyPath;
}

/**
 * Sets current language, persists choice, updates document lang, and parses DOM.
 * @param {'en'|'bn'} lang
 */
export function setLanguage(lang) {
  currentLang = lang === 'bn' ? 'bn' : 'en';
  localStorage.setItem('roktosetu_lang', currentLang);
  document.documentElement.setAttribute('lang', currentLang);

  // Update language toggle buttons in UI
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });

  translateDOM();
  window.dispatchEvent(new CustomEvent('roktosetu:lang_changed', { detail: { lang: currentLang } }));
}

/**
 * Returns current language code ('en' | 'bn').
 */
export function getLanguage() {
  return currentLang;
}

/**
 * Scans document for data-i18n and data-i18n-placeholder and translates them.
 * @param {HTMLElement} [rootNode=document]
 */
export function translateDOM(rootNode = document) {
  rootNode.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  rootNode.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });
}
