/* ============================================
   AI STUDY ASSISTANT — StudentHub
   ============================================ */

import { i18n } from '../i18n/i18n.js';
import { storage } from '../utils/storage.js';
import { escapeHtml } from '../utils/html.js';
import { getExamDateTime } from '../utils/date.js';

/* ============================================
   CONFIG
   ============================================ */

const WORKER_URL = 'https://studenthub-ai-proxy.alialfozoalialfozo.workers.dev';

const CHAT_STORAGE_KEY = 'ai_chat_history_v1';
const MAX_STORED_MESSAGES = 100;
const CHAT_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

/* ============================================
   DOM
   ============================================ */

const chatContainer = document.getElementById('chatContainer');
const welcomeMessage = document.getElementById('welcomeMessage');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const clearChatBtn = document.getElementById('clearChatBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const studentSnapshot = document.getElementById('studentSnapshot');

/* ============================================
   STATE
   ============================================ */

let isWaitingForResponse = false;
let conversationHistory = [];

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

function getStudentData() {
  const courses = storage.get('courses', []);
  const exams = storage.get('exams', []);
  const grades = storage.get('grades', []);
  const notes = storage.get('notes', []);

  // ✅ استخدام getExamDateTime الموحّد
  const now = Date.now();
  const weekFromNow = now + (7 * 24 * 60 * 60 * 1000);
  const upcomingExams = exams.filter(e => {
    const examTime = getExamDateTime(e);
    return examTime > now && examTime <= weekFromNow;
  });

  // GPA
  let gpa = 0;
  if (grades.length > 0) {
    const allHaveCredits = grades.every(g => {
      const c = parseFloat(g.credits);
      return !isNaN(c) && c > 0;
    });

    if (allHaveCredits) {
      let totalPoints = 0;
      let totalCredits = 0;
      grades.forEach(g => {
        const credits = parseFloat(g.credits) || 0;
        const value = parseFloat(g.value) || 0;
        totalPoints += value * credits;
        totalCredits += credits;
      });
      gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    } else {
      const total = grades.reduce((sum, g) => sum + (parseFloat(g.value) || 0), 0);
      gpa = total / grades.length;
    }
  }

  // Streak
  const sessions = storage.get('timerSessions', []);
  let streak = 0;
  if (sessions.length > 0) {
    const days = [...new Set(sessions.map(s => new Date(s.completedAt).toDateString()))]
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

    if (days[0] === todayTime || days[0] === todayTime - oneDay) {
      streak = 1;
      for (let i = 1; i < days.length; i++) {
        if (days[i - 1] - days[i] === oneDay) streak++;
        else break;
      }
    }
  }

  return {
    courses: courses.length,
    exams: upcomingExams.length,
    gpa: gpa > 0 ? gpa.toFixed(2) : '—',
    notes: notes.length,
    streak
  };
}

/* ============================================
   PERSISTENCE
   ============================================ */

function saveChatHistory() {
  try {
    const data = {
      history: conversationHistory.slice(-MAX_STORED_MESSAGES),
      savedAt: Date.now()
    };
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('⚠️ فشل حفظ المحادثة:', err);
  }
}

function loadChatHistory() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);

    if (data.savedAt && Date.now() - data.savedAt > CHAT_MAX_AGE) {
      localStorage.removeItem(CHAT_STORAGE_KEY);
      return null;
    }

    return data.history || [];
  } catch (err) {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    return null;
  }
}

function restoreChatUI(history) {
  if (!chatContainer || !history || history.length === 0) return;

  if (welcomeMessage) welcomeMessage.style.display = 'none';

  history.forEach(msg => renderMessage(msg.role, msg.text));
  console.log(`✅ تم استرجاع ${history.length} رسالة`);
}

function clearStoredChat() {
  try { localStorage.removeItem(CHAT_STORAGE_KEY); } catch {}
}

function cleanupOldChats() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return;

    const data = JSON.parse(raw);
    if (data.savedAt && Date.now() - data.savedAt > CHAT_MAX_AGE) {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  } catch {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  }
}

/* ============================================
   SNAPSHOT
   ============================================ */

function renderSnapshot() {
  if (!studentSnapshot) return;

  const data = getStudentData();

  studentSnapshot.innerHTML = `
    <div class="ai__snapshot-item">
      <div class="ai__snapshot-icon">📚</div>
      <div class="ai__snapshot-value">${data.courses}</div>
      <div class="ai__snapshot-label">${t('dashboard.stats.courses', 'المواد')}</div>
    </div>
    <div class="ai__snapshot-item">
      <div class="ai__snapshot-icon">📝</div>
      <div class="ai__snapshot-value">${data.exams}</div>
      <div class="ai__snapshot-label">${t('dashboard.stats.exams', 'الامتحانات القادمة')}</div>
    </div>
    <div class="ai__snapshot-item">
      <div class="ai__snapshot-icon">📊</div>
      <div class="ai__snapshot-value">${data.gpa}</div>
      <div class="ai__snapshot-label">${t('gpa.currentGpa', 'المعدل')}</div>
    </div>
    <div class="ai__snapshot-item">
      <div class="ai__snapshot-icon">📔</div>
      <div class="ai__snapshot-value">${data.notes}</div>
      <div class="ai__snapshot-label">${t('dashboard.stats.notes', 'الملاحظات')}</div>
    </div>
    <div class="ai__snapshot-item">
      <div class="ai__snapshot-icon">🔥</div>
      <div class="ai__snapshot-value">${data.streak}</div>
      <div class="ai__snapshot-label">${t('timer.stats.streak', 'أيام متتالية')}</div>
    </div>
  `;
}

/* ============================================
   RENDER MESSAGES
   ============================================ */

function renderMessage(role, text) {
  if (!chatContainer) return;

  if (welcomeMessage) welcomeMessage.style.display = 'none';

  const messageDiv = document.createElement('div');
  messageDiv.className = `ai__message ai__message--${role}`;

  const avatar = role === 'user' ? '👤' : '🤖';

  messageDiv.innerHTML = `
    <div class="ai__message-avatar">${avatar}</div>
    <div class="ai__message-bubble">${escapeHtml(text)}</div>
  `;

  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTypingIndicator() {
  if (!chatContainer) return;

  const typing = document.createElement('div');
  typing.className = 'ai__message ai__message--ai';
  typing.id = 'typingIndicator';
  typing.innerHTML = `
    <div class="ai__message-avatar">🤖</div>
    <div class="ai__typing">
      <div class="ai__typing-dot"></div>
      <div class="ai__typing-dot"></div>
      <div class="ai__typing-dot"></div>
    </div>
  `;

  chatContainer.appendChild(typing);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideTypingIndicator() {
  const typing = document.getElementById('typingIndicator');
  if (typing) typing.remove();
}

function renderError(message) {
  if (!chatContainer) return;

  const error = document.createElement('div');
  error.className = 'ai__error';
  error.textContent = '❌ ' + message;

  chatContainer.appendChild(error);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

/* ============================================
   SEND MESSAGE
   ============================================ */

async function sendMessage(prompt, includeStudentData = false) {
  if (isWaitingForResponse || !prompt.trim()) return;

  isWaitingForResponse = true;
  sendBtn.disabled = true;
  sendBtn.classList.add('is-loading');

  conversationHistory.push({ role: 'user', text: prompt });
  renderMessage('user', prompt);
  saveChatHistory();

  if (chatInput) {
    chatInput.value = '';
    chatInput.style.height = 'auto';
  }

  showTypingIndicator();

  try {
    const body = { prompt };
    if (includeStudentData) body.studentData = getStudentData();

    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    hideTypingIndicator();

    if (data.success && data.response) {
      conversationHistory.push({ role: 'ai', text: data.response });
      renderMessage('ai', data.response);
      saveChatHistory();
    } else {
      renderError(data.error || 'Failed to get response');
      console.error('AI error:', data);
    }

  } catch (err) {
    hideTypingIndicator();
    renderError('تعذّر الاتصال بالمساعد. حاول مرة أخرى.');
    console.error('Fetch error:', err);
  } finally {
    isWaitingForResponse = false;
    // ✅ إصلاح: كان disabled = true (خطأ)
    sendBtn.disabled = false;
    sendBtn.classList.remove('is-loading');
    if (chatInput) chatInput.focus();
  }
}

/* ============================================
   ANALYZE
   ============================================ */

async function analyzeStudent() {
  const data = getStudentData();

  const prompt = `حلل وضعي الدراسي الحالي وأعطني نصائح مخصصة:

- عدد المواد: ${data.courses}
- الامتحانات القادمة (خلال أسبوع): ${data.exams}
- معدلي الحالي: ${data.gpa}
- عدد الملاحظات: ${data.notes}
- أيام الدراسة المتتالية: ${data.streak}

أعطني:
1. تحليل موجز لوضعي
2. أهم 3 نصائح عملية
3. تحذير إذا كان فيه شيء يحتاج اهتمام`;

  await sendMessage(prompt, true);
}

/* ============================================
   CLEAR CHAT
   ============================================ */

function clearChat() {
  if (!chatContainer) return;

  const isAr = i18n.getLang() === 'ar';
  const msg = isAr
    ? '🗑️ هل أنت متأكد من بدء محادثة جديدة؟'
    : '🗑️ Start a new chat?';

  if (!confirm(msg)) return;

  chatContainer.innerHTML = '';

  if (welcomeMessage) {
    welcomeMessage.style.display = 'flex';
    chatContainer.appendChild(welcomeMessage);
  }

  conversationHistory = [];
  clearStoredChat();
}

/* ============================================
   AUTO-RESIZE
   ============================================ */

function autoResizeTextarea() {
  if (!chatInput) return;
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
}

/* ============================================
   EVENTS
   ============================================ */

sendBtn?.addEventListener('click', () => {
  const prompt = chatInput?.value.trim();
  if (prompt) sendMessage(prompt);
});

chatInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const prompt = chatInput.value.trim();
    if (prompt) sendMessage(prompt);
  }
});

chatInput?.addEventListener('input', () => {
  autoResizeTextarea();
  const hasText = chatInput.value.trim().length > 0;
  sendBtn.disabled = !hasText || isWaitingForResponse;
});

clearChatBtn?.addEventListener('click', clearChat);
analyzeBtn?.addEventListener('click', analyzeStudent);

document.querySelectorAll('.ai__suggestion').forEach(btn => {
  btn.addEventListener('click', () => {
    const prompt = btn.dataset.prompt;
    if (prompt) sendMessage(prompt);
  });
});

// ✅ استمع لحدث مخصص (يعمل داخل نفس التبويب)
window.addEventListener('studentDataChanged', renderSnapshot);

// احتياطي: storage event (يعمل بين التبويبات)
window.addEventListener('storage', (e) => {
  if (['courses', 'exams', 'grades', 'notes', 'timerSessions'].includes(e.key)) {
    renderSnapshot();
  }
});

window.addEventListener('languageChanged', () => {
  renderSnapshot();
  saveChatHistory();
});

window.addEventListener('beforeunload', saveChatHistory);

/* ============================================
   INIT
   ============================================ */

function init() {
  cleanupOldChats();
  renderSnapshot();

  const saved = loadChatHistory();
  if (saved && saved.length > 0) {
    conversationHistory = saved;
    restoreChatUI(saved);
  }

  console.log('✅ AI Study Assistant initialized');
  console.log(`📦 محادثات محفوظة: ${conversationHistory.length}`);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  setTimeout(init, 100);
}