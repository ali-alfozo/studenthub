/* ============================================
   POMODORO TIMER — StudentHub
   v4.0 — With Persistence (يستمر بين الصفحات)
   ============================================ */

import { i18n } from '../i18n/i18n.js';
import { storage } from '../utils/storage.js';

/* ============================================
   CONSTANTS
   ============================================ */

const MODES = {
  study:  { icon: '📚', color: '#3b82f6', defaultDuration: 25, min: 1,  max: 60  },
  deep:   { icon: '🧠', color: '#a855f7', defaultDuration: 90, min: 30, max: 180 },
  review: { icon: '⚡', color: '#f59e0b', defaultDuration: 10, min: 1,  max: 30  },
  break:  { icon: '☕', color: '#10b981', defaultDuration: 5,  min: 1,  max: 30  }
};

const RADIUS = 140;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const STORAGE_KEYS = {
  SETTINGS: 'timerSettings',
  SESSIONS: 'timerSessions',
  STATE: 'timerState'  // ✅ جديد — لحفظ الحالة
};

const TICK_INTERVAL = 250;

/* ============================================
   STATE
   ============================================ */

let currentMode = 'study';
let durations = {
  study:  MODES.study.defaultDuration,
  deep:   MODES.deep.defaultDuration,
  review: MODES.review.defaultDuration,
  break:  MODES.break.defaultDuration
};
let timeLeft = durations.study * 60;
let totalTime = durations.study * 60;
let isRunning = false;
let timerInterval = null;
let endTime = null;
let sessionStartTime = null;

/* ============================================
   DOM ELEMENTS
   ============================================ */

let timerDisplay, timerModeLabel, timerProgress, startBtn, startIcon, startText;
let resetBtn, statTotalMinutes, statSessionsToday, statStreak;
let sessionsList, clearSessionsBtn, dynamicFavicon;

function cacheElements() {
  timerDisplay      = document.getElementById('timerDisplay');
  timerModeLabel    = document.getElementById('timerModeLabel');
  timerProgress     = document.getElementById('timerProgress');
  startBtn          = document.getElementById('startBtn');
  startIcon         = document.getElementById('startIcon');
  startText         = document.getElementById('startText');
  resetBtn          = document.getElementById('resetBtn');
  statTotalMinutes  = document.getElementById('statTotalMinutes');
  statSessionsToday = document.getElementById('statSessionsToday');
  statStreak        = document.getElementById('statStreak');
  sessionsList      = document.getElementById('sessionsList');
  clearSessionsBtn  = document.getElementById('clearSessionsBtn');
  dynamicFavicon    = document.getElementById('dynamicFavicon');
}

/* ============================================
   HELPERS
   ============================================ */

function t(key, fallback = '') {
  try {
    const val = i18n.t(key);
    return val && val !== key ? val : fallback;
  } catch {
    return fallback;
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/* ============================================
   ✅ PERSISTENCE — حفظ واسترجاع الحالة
   ============================================ */

/**
 * يحفظ حالة المؤقت في localStorage
 * يُستدعى عند: start, pause, reset, changeMode
 */
function persistState() {
  try {
    const state = {
      isRunning,
      endTime,
      currentMode,
      timeLeft,
      totalTime,
      durations,
      savedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(state));
  } catch (err) {
    console.warn('⚠️ فشل حفظ حالة المؤقت:', err);
  }
}

/**
 * يستعيد حالة المؤقت من localStorage
 * يُستدعى عند فتح الصفحة (init)
 * @returns {boolean} true لو استرجعنا حالة
 */
function restoreState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATE);
    if (!raw) return false;

    const state = JSON.parse(raw);
    if (!state) return false;

    // تحقق من العمر (لا نستعيد حالة أقدم من 24 ساعة)
    const MAX_AGE = 24 * 60 * 60 * 1000;
    if (state.savedAt && Date.now() - state.savedAt > MAX_AGE) {
      localStorage.removeItem(STORAGE_KEYS.STATE);
      return false;
    }

    // ✅ استرجع الإعدادات
    if (state.durations) {
      Object.keys(MODES).forEach(mode => {
        const val = parseInt(state.durations[mode], 10);
        if (!isNaN(val) && val >= MODES[mode].min && val <= MODES[mode].max) {
          durations[mode] = val;
        }
      });
    }

    // ✅ استرجع الوضع
    if (state.currentMode && MODES[state.currentMode]) {
      currentMode = state.currentMode;
    }

    // ✅ إذا كان المؤقت يعمل → احسب الوقت المتبقي من endTime
    if (state.isRunning && state.endTime) {
      const remaining = Math.max(0, Math.round((state.endTime - Date.now()) / 1000));

      if (remaining <= 0) {
        // انتهت الجلسة أثناء غيابك → احفظها كـ completed
        console.log('⏰ الجلسة انتهت أثناء غيابك — تُحفظ كـ completed');
        saveCompletedSessionOffline(state);
        localStorage.removeItem(STORAGE_KEYS.STATE);
        return false;
      }

      // ✅ استأنف الجلسة من حيث يجب
      isRunning = true;
      endTime = state.endTime;
      totalTime = state.totalTime || durations[currentMode] * 60;
      timeLeft = remaining;

      console.log(`✅ استُرجع المؤقت: ${formatTime(timeLeft)} متبقية`);
      return true;
    }

    // ✅ إذا كان المؤقت متوقفاً → استرجع الوقت المتبقي
    if (!state.isRunning) {
      totalTime = state.totalTime || durations[currentMode] * 60;
      timeLeft = state.timeLeft || totalTime;
      console.log(`✅ استُرجع المؤقت (متوقف): ${formatTime(timeLeft)}`);
      return true;
    }

    return false;
  } catch (err) {
    console.warn('⚠️ فشل استرجاع حالة المؤقت:', err);
    localStorage.removeItem(STORAGE_KEYS.STATE);
    return false;
  }
}

/**
 * يحفظ جلسة انتهت أثناء غياب المستخدم
 */
function saveCompletedSessionOffline(state) {
  const sessions = storage.get(STORAGE_KEYS.SESSIONS, []);
  const last = sessions[sessions.length - 1];

  // تجنب التكرار
  if (last && last.mode === state.currentMode && Date.now() - last.completedAt < 5000) {
    return;
  }

  sessions.push({
    id: Date.now(),
    mode: state.currentMode,
    duration: state.durations?.[state.currentMode] || MODES[state.currentMode].defaultDuration,
    completedAt: state.endTime,
    wasOffline: true  // ✅ علامة أن الجلسة انتهت أثناء غياب المستخدم
  });

  if (sessions.length > 500) {
    sessions.splice(0, sessions.length - 500);
  }

  storage.set(STORAGE_KEYS.SESSIONS, sessions);
  window.dispatchEvent(new CustomEvent('studentDataChanged'));

  console.log('✅ حُفظت الجلسة المنتهية');
}

/**
 * يمسح حالة المؤقت من localStorage
 * يُستدعى عند: انتهاء الجلسة، إعادة تعيين كاملة
 */
function clearPersistedState() {
  try {
    localStorage.removeItem(STORAGE_KEYS.STATE);
  } catch {}
}

/* ============================================
   LOAD / SAVE SETTINGS
   ============================================ */

function loadSettings() {
  const saved = storage.get(STORAGE_KEYS.SETTINGS, null);
  if (saved && typeof saved === 'object') {
    Object.keys(MODES).forEach(mode => {
      const val = parseInt(saved[mode], 10);
      if (!isNaN(val) && val >= MODES[mode].min && val <= MODES[mode].max) {
        durations[mode] = val;
      }
    });
  }
  syncInputsWithDurations();
}

function saveSettings() {
  storage.set(STORAGE_KEYS.SETTINGS, durations);
}

function syncInputsWithDurations() {
  ['study', 'deep', 'review', 'break'].forEach(mode => {
    const input = document.getElementById('setting' + capitalize(mode));
    if (input) input.value = durations[mode];
  });
}

/* ============================================
   UPDATE DISPLAY
   ============================================ */

function updateDisplay() {
  const formatted = formatTime(timeLeft);
  if (timerDisplay) timerDisplay.textContent = formatted;

  const modeName = t(`timer.modes.${currentMode}`, currentMode);
  document.title = `${formatted} — ${modeName}`;

  if (timerProgress) {
    const progress = totalTime > 0 ? timeLeft / totalTime : 0;
    const offset = CIRCLE_CIRCUMFERENCE * (1 - progress);
    timerProgress.style.strokeDashoffset = offset;
  }

  if (timerModeLabel) {
    const sessionKey = `timer.session.${currentMode}`;
    const fallbacks = {
      study:  'جلسة دراسة',
      deep:   'دراسة عميقة',
      review: 'مراجعة سريعة',
      break:  'جلسة راحة'
    };
    timerModeLabel.textContent = t(sessionKey, fallbacks[currentMode]);
  }
}

/* ============================================
   TIMER CORE
   ============================================ */

function startTimer() {
  if (isRunning) return;

  isRunning = true;
  sessionStartTime = Date.now();
  endTime = Date.now() + timeLeft * 1000;

  startIcon.textContent = '⏸';
  startText.textContent = t('timer.pause', 'إيقاف');
  startBtn.classList.add('is-running');

  // ✅ احفظ الحالة
  persistState();

  timerInterval = setInterval(tick, TICK_INTERVAL);
  updateDisplay();
}

function tick() {
  const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));

  if (remaining !== timeLeft) {
    timeLeft = remaining;
    updateDisplay();
  }

  if (timeLeft <= 0) {
    completeSession();
  }
}

function pauseTimer() {
  if (!isRunning) return;

  isRunning = false;
  clearInterval(timerInterval);
  timerInterval = null;
  endTime = null;

  startIcon.textContent = '▶';
  startText.textContent = t('timer.resume', 'استئناف');
  startBtn.classList.remove('is-running');

  // ✅ احفظ الحالة (متوقف)
  persistState();

  updateDisplay();
}

function toggleTimer() {
  isRunning ? pauseTimer() : startTimer();
}

function resetTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  timerInterval = null;
  endTime = null;
  sessionStartTime = null;

  totalTime = durations[currentMode] * 60;
  timeLeft = totalTime;

  if (startIcon) startIcon.textContent = '▶';
  if (startText) startText.textContent = t('timer.start', 'ابدأ');
  if (startBtn)  startBtn.classList.remove('is-running');

  // ✅ احفظ الحالة (معاد)
  persistState();

  updateDisplay();
}

/* ============================================
   COMPLETE SESSION
   ============================================ */

function completeSession() {
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  endTime = null;

  // ✅ امسح الحالة المحفوظة (انتهت)
  clearPersistedState();

  saveSession(currentMode, durations[currentMode]);
  playNotificationSound();
  showNotification(
    t('timer.notification.title', '🎉 انتهت الجلسة!'),
    t('timer.notification.body', 'أحسنت! خذ راحة قصيرة.')
  );

  if (startIcon) startIcon.textContent = '▶';
  if (startText) startText.textContent = t('timer.start', 'ابدأ');
  if (startBtn)  startBtn.classList.remove('is-running');

  timeLeft = 0;
  updateDisplay();

  setTimeout(() => {
    resetTimer();
    updateStats();
    renderSessions();
  }, 3000);
}

/* ============================================
   SOUND
   ============================================ */

function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const audioContext = new AudioCtx();
    const notes = [523.25, 659.25, 783.99];

    notes.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.frequency.value = freq;
      osc.type = 'sine';

      const startTime = audioContext.currentTime + index * 0.15;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  } catch (err) {
    console.warn('Audio not supported:', err);
  }
}

/* ============================================
   NOTIFICATION
   ============================================ */

function showNotification(title, body) {
  if (!('Notification' in window)) return;

  const isSecure =
    location.protocol === 'https:' ||
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.protocol === 'file:';

  if (!isSecure) return;

  if (Notification.permission === 'granted') {
    createNotification(title, body);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') createNotification(title, body);
    });
  }
}

async function createNotification(title, body) {
  const options = {
    body,
    icon: './assets/icons/icon-192.png',
    badge: './assets/icons/icon-72.png',
    tag: 'timer-' + Date.now(),
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200, 100, 200]
  };

  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
      return;
    } catch (err) {
      console.warn('SW notification failed:', err);
    }
  }

  try {
    new Notification(title, options);
  } catch (err) {
    console.warn('Notification error:', err);
  }
}

/* ============================================
   SAVE SESSION
   ============================================ */

function saveSession(mode, duration) {
  const sessions = storage.get(STORAGE_KEYS.SESSIONS, []);
  const last = sessions[sessions.length - 1];

  if (last && last.mode === mode && Date.now() - last.completedAt < 5000) {
    return;
  }

  sessions.push({
    id: Date.now(),
    mode,
    duration,
    completedAt: Date.now()
  });

  if (sessions.length > 500) {
    sessions.splice(0, sessions.length - 500);
  }

  storage.set(STORAGE_KEYS.SESSIONS, sessions);
  window.dispatchEvent(new CustomEvent('studentDataChanged'));

  updateStats();
}

/* ============================================
   UPDATE STATS
   ============================================ */

function updateStats() {
  const sessions = storage.get(STORAGE_KEYS.SESSIONS, []);
  const today = new Date().toDateString();

  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
  if (statTotalMinutes) statTotalMinutes.textContent = totalMinutes;

  const todayCount = sessions.filter(
    s => new Date(s.completedAt).toDateString() === today
  ).length;
  if (statSessionsToday) statSessionsToday.textContent = todayCount;

  const streak = calculateStreak(sessions);
  if (statStreak) statStreak.textContent = streak;
}

/* ============================================
   STREAK
   ============================================ */

function calculateStreak(sessions) {
  if (!sessions.length) return 0;

  const days = [
    ...new Set(sessions.map(s => new Date(s.completedAt).toDateString()))
  ]
    .map(d => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
    .sort((a, b) => b - a);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  if (days[0] !== todayTime && days[0] !== todayTime - oneDay) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i - 1] - days[i] === oneDay) streak++;
    else break;
  }

  return streak;
}

/* ============================================
   RENDER SESSIONS
   ============================================ */

function renderSessions() {
  if (!sessionsList) return;

  const sessions = storage.get(STORAGE_KEYS.SESSIONS, []);

  if (sessions.length === 0) {
    sessionsList.innerHTML = `
      <div class="timer__sessions-empty">
        <div class="timer__sessions-empty-icon">📊</div>
        <div>${t('timer.sessions.empty', 'لا توجد جلسات بعد')}</div>
      </div>
    `;
    return;
  }

  const recent = sessions.slice(-10).reverse();
  const lang = (i18n.getLang && i18n.getLang()) || 'ar';
  const locale = lang === 'ar' ? 'ar-EG' : 'en-US';

  sessionsList.innerHTML = recent
    .map(session => {
      const modeInfo = MODES[session.mode] || MODES.study;
      const date = new Date(session.completedAt);
      const timeStr = date.toLocaleString(locale, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const modeName = t(`timer.modes.${session.mode}`, session.mode);

      return `
        <div class="timer__session-item">
          <div class="timer__session-icon ${session.mode}">
            ${modeInfo.icon}
          </div>
          <div class="timer__session-info">
            <div class="timer__session-title">${modeName}</div>
            <div class="timer__session-time">${timeStr}</div>
          </div>
          <div class="timer__session-duration">
            ${session.duration} ${t('timer.minutes', 'د')}
          </div>
        </div>
      `;
    })
    .join('');
}

/* ============================================
   CHANGE MODE
   ============================================ */

function changeMode(mode) {
  if (!MODES[mode] || isRunning) return;

  currentMode = mode;

  document.querySelectorAll('.timer__mode').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });

  if (timerProgress) {
    timerProgress.classList.remove('mode-study', 'mode-deep', 'mode-review', 'mode-break');
    timerProgress.classList.add(`mode-${mode}`);
  }

  updateFavicon(mode);
  resetTimer();
}

/* ============================================
   FAVICON
   ============================================ */

let lastFaviconURL = null;

function updateFavicon(mode) {
  if (!dynamicFavicon) return;

  const color = MODES[mode]?.color || '#3b82f6';
  const icon = MODES[mode]?.icon || 'S';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" rx="20" fill="${color}"/>
    <text x="50" y="70" font-size="60" text-anchor="middle" fill="white"
          font-family="Arial">${icon}</text>
  </svg>`;

  if (lastFaviconURL) URL.revokeObjectURL(lastFaviconURL);

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  lastFaviconURL = url;

  dynamicFavicon.href = url;
}

/* ============================================
   EVENT LISTENERS
   ============================================ */

function bindEvents() {
  startBtn?.addEventListener('click', toggleTimer);
  resetBtn?.addEventListener('click', resetTimer);

  document.querySelectorAll('.timer__mode').forEach(tab => {
    tab.addEventListener('click', () => changeMode(tab.dataset.mode));
  });

  document.querySelectorAll('.timer__setting-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      const action = btn.dataset.action;
      if (!MODES[mode]) return;

      const input = document.getElementById('setting' + capitalize(mode));
      if (!input) return;

      const current = parseInt(input.value, 10) || MODES[mode].defaultDuration;
      const { min, max } = MODES[mode];

      let newVal = current;
      if (action === 'increment') newVal = Math.min(current + 1, max);
      if (action === 'decrement') newVal = Math.max(current - 1, min);

      input.value = newVal;
      durations[mode] = newVal;
      saveSettings();

      if (mode === currentMode && !isRunning) resetTimer();
    });
  });

  ['study', 'deep', 'review', 'break'].forEach(mode => {
    const input = document.getElementById('setting' + capitalize(mode));
    if (!input) return;

    input.addEventListener('change', () => {
      const { min, max, defaultDuration } = MODES[mode];
      let val = parseInt(input.value, 10) || defaultDuration;
      val = Math.max(min, Math.min(val, max));

      input.value = val;
      durations[mode] = val;
      saveSettings();

      if (mode === currentMode && !isRunning) resetTimer();
    });
  });

  clearSessionsBtn?.addEventListener('click', () => {
    const msg = t('timer.sessions.confirmClear', 'هل أنت متأكد من مسح جميع الجلسات؟');
    if (confirm(msg)) {
      storage.set(STORAGE_KEYS.SESSIONS, []);
      window.dispatchEvent(new CustomEvent('studentDataChanged'));
      updateStats();
      renderSessions();
    }
  });

  document.addEventListener('keydown', handleKeyboard);

  // ✅ عندما تعود للصفحة، تحقق من الوقت المتبقي
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && isRunning && endTime) {
      const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      timeLeft = remaining;

      if (timeLeft <= 0) {
        completeSession();
      } else {
        updateDisplay();
      }
    }
  });

  window.addEventListener('beforeunload', () => {
    // ✅ احفظ الحالة قبل إغلاق الصفحة
    persistState();

    if (isRunning && endTime) {
      timeLeft = Math.max(0, Math.round((endTime - Date.now()) / 1000));
    }
  });
}

function handleKeyboard(e) {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

  if (e.code === 'Space') {
    e.preventDefault();
    toggleTimer();
  }

  if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    resetTimer();
  }
}

/* ============================================
   INIT
   ============================================ */

function init() {
  cacheElements();

  if (!timerDisplay || !startBtn) {
    console.warn('Timer: عناصر DOM غير موجودة');
    return;
  }

  // ✅ حمّل الإعدادات أولاً
  loadSettings();

  // ✅ ثم حاول استرجاع الحالة المحفوظة
  const restored = restoreState();

  if (restored) {
    // استرجعنا حالة → طبّقها على الواجهة
    document.querySelectorAll('.timer__mode').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === currentMode);
    });

    if (timerProgress) {
      timerProgress.classList.remove('mode-study', 'mode-deep', 'mode-review', 'mode-break');
      timerProgress.classList.add(`mode-${currentMode}`);
    }

    updateFavicon(currentMode);
    syncInputsWithDurations();

    // إذا كان المؤقت يعمل → شغّل setInterval
    if (isRunning) {
      startIcon.textContent = '⏸';
      startText.textContent = t('timer.pause', 'إيقاف');
      startBtn.classList.add('is-running');

      timerInterval = setInterval(tick, TICK_INTERVAL);
      console.log('✅ Timer: استُؤنفت الجلسة من الخلفية');
    } else {
      startIcon.textContent = '▶';
      startText.textContent = t('timer.resume', 'استئناف');
    }

    updateDisplay();
  } else {
    // لم نستطع استرجاع → ابدأ من جديد
    if (timerProgress) {
      timerProgress.classList.remove('mode-study', 'mode-deep', 'mode-review', 'mode-break');
      timerProgress.classList.add('mode-study');
    }
    changeMode('study');
  }

  updateStats();
  renderSessions();
  bindEvents();

  console.log('✅ Timer initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  setTimeout(init, 50);
}