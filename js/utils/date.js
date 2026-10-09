/* ============================================
   DATE — Unified date helpers
   يحل مشكلة Time Zone نهائياً
   ============================================ */

/**
 * يحوّل تاريخ + وقت الامتحان إلى timestamp (توقيت محلي)
 * @param {Object} exam - { date: 'YYYY-MM-DD', time: 'HH:MM' }
 * @returns {number} timestamp
 */
export function getExamDateTime(exam) {
  if (!exam || !exam.date) return 0;

  const [y, m, d] = exam.date.split('-').map(Number);
  const [h, min] = (exam.time || '00:00').split(':').map(Number);

  return new Date(y, m - 1, d, h, min, 0, 0).getTime();
}

/**
 * تنسيق تاريخ بصيغة محلية
 */
export function formatDate(dateStr, options = {}) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const lang = document.documentElement.lang === 'ar' ? 'ar-EG' : 'en-US';

  return date.toLocaleDateString(lang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  });
}

/**
 * تنسيق التاريخ من timestamp
 */
export function formatTimestamp(timestamp, options = {}) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const lang = document.documentElement.lang === 'ar' ? 'ar-EG' : 'en-US';

  return date.toLocaleDateString(lang, {
    month: 'short',
    day: 'numeric',
    ...options
  });
}

/**
 * بداية اليوم (00:00:00)
 */
export function getStartOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * تنسيق العداد التنازلي
 */
export function formatCountdown(diff) {
  if (diff < 0) return '—';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const isAr = document.documentElement.lang === 'ar';

  if (days > 0) {
    return isAr
      ? `${days} يوم : ${hours} ساعة : ${minutes} دقيقة`
      : `${days}d : ${hours}h : ${minutes}m`;
  }

  if (hours > 0) {
    return isAr
      ? `${hours} ساعة : ${minutes} دقيقة : ${seconds} ثانية`
      : `${hours}h : ${minutes}m : ${seconds}s`;
  }

  return isAr
    ? `${minutes} دقيقة : ${seconds} ثانية`
    : `${minutes}m : ${seconds}s`;
}