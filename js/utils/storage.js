/* ============================================
   STORAGE — Unified localStorage helpers
   ============================================ */

export const storage = {
  get(key, fallback = null) {
    try {
      const data = localStorage.getItem(key);
      if (data === null) return fallback;
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};