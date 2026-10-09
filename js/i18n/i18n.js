/* ============================================
   i18n — Internationalization Engine
   ============================================ */

import { ar } from './ar.js';
import { en } from './en.js';

// Available translations
const translations = { ar, en };

// Current language (default: Arabic)
let currentLang = 'ar';

// RTL languages
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

/* ============================================
   i18n Object
   ============================================ */

export const i18n = {
  
  /**
   * Get translation by key
   * Usage: i18n.t('dashboard.greeting')
   * With params: i18n.t('dashboard.changes.nearestExam', { days: 5 })
   */
  t(key, replacements = {}) {
    const keys = key.split('.');
    let value = translations[currentLang];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    // Replace {variable} with actual values
    return value.replace(/\{(\w+)\}/g, (match, name) => {
      return replacements[name] !== undefined ? replacements[name] : match;
    });
  },
  
  /**
   * Get current language
   */
  getLang() {
    return currentLang;
  },
  
  /**
   * Set language
   */
  setLang(lang) {
    if (!translations[lang]) {
      console.warn(`Language "${lang}" not found`);
      return;
    }
    
    currentLang = lang;
    
    // Update HTML attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
    
    // Save to localStorage
    localStorage.setItem('language', lang);
    
    // Translate page
    this.translatePage();
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { lang } 
    }));
  },
  
  /**
   * Load saved language
   */
  init() {
    const savedLang = localStorage.getItem('language') || 'ar';
    this.setLang(savedLang);
  },
  
  /**
   * Translate all elements with data-i18n
   */
  translatePage() {
    // Text content with params support
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const paramsAttr = el.getAttribute('data-i18n-params');
      
      let params = {};
      if (paramsAttr) {
        try {
          params = JSON.parse(paramsAttr);
        } catch (e) {
          console.warn('Invalid data-i18n-params:', paramsAttr);
        }
      }
      
      el.textContent = this.t(key, params);
    });
    
    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });
    
    // Titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });
    
    // Aria labels
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      el.setAttribute('aria-label', this.t(key));
    });
  },
  
  /**
   * Get list of available languages
   */
  getAvailableLanguages() {
    return [
      { code: 'ar', name: 'العربية', dir: 'rtl' },
      { code: 'en', name: 'English', dir: 'ltr' }
    ];
  }
};