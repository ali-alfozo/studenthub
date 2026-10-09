/* ============================================
   SETTINGS PAGE — StudentHub
   v2.1 — Fixed fontSize selector + Notification status
   ============================================ */

import { i18n } from '../i18n/i18n.js';
import { storage } from '../utils/storage.js';
import { showToast } from '../utils/toast.js';
import {
  isNotificationSupported,
  getPermissionStatus,
  requestNotificationPermission,
  sendTestNotification,
  startNotificationScheduler
} from '../core/notifications.js';

/* ============================================
   DEFAULT SETTINGS
   ============================================ */

const DEFAULT_SETTINGS = {
  profile: {
    name: 'علي',
    university: 'جامعة حمص',
    major: 'هندسة معلوماتية',
    year: '3'
  },
  language: 'ar',
  theme: 'light',
  primaryColor: 'indigo',
  fontSize: 'medium',
  gpaSystem: '100',
  studyHours: 4,
  notifyExams: true,
  notifyTasks: true,
  weekStart: 'saturday'
};

/* ============================================
   LOAD SETTINGS INTO UI
   ============================================ */

function loadSettings() {
  // Profile
  const profile = storage.get('profile', DEFAULT_SETTINGS.profile);
  const nameEl = document.getElementById('profileName');
  const uniEl = document.getElementById('profileUniversity');
  const majorEl = document.getElementById('profileMajor');
  const yearEl = document.getElementById('profileYear');

  if (nameEl) nameEl.value = profile.name || '';
  if (uniEl) uniEl.value = profile.university || '';
  if (majorEl) majorEl.value = profile.major || '';
  if (yearEl) yearEl.value = profile.year || '3';

  // Language
  const lang = localStorage.getItem('language') || 'ar';
  const langRadio = document.querySelector(`input[name="language"][value="${lang}"]`);
  if (langRadio) langRadio.checked = true;

  // ✅ Theme
  const theme = localStorage.getItem('theme') || 'light';
  const themeRadio = document.querySelector(`input[name="theme"][value="${theme}"]`);
  if (themeRadio) themeRadio.checked = true;

  // ✅ Font Size
  const fontSize = localStorage.getItem('fontSize') || 'medium';
  const fontSizeRadio = document.querySelector(`input[name="fontSize"][value="${fontSize}"]`);
  if (fontSizeRadio) fontSizeRadio.checked = true;

  // ✅ Primary Color
  const color = localStorage.getItem('primaryColor') || 'indigo';
  const colorBtn = document.querySelector(`.settings__color[data-color="${color}"]`);
  if (colorBtn) {
    document.querySelectorAll('.settings__color').forEach(b => b.classList.remove('active'));
    colorBtn.classList.add('active');
  }

  // GPA System
  const gpaSystem = localStorage.getItem('gpaSystem') || '100';
  const gpaRadio = document.querySelector(`input[name="gpaSystem"][value="${gpaSystem}"]`);
  if (gpaRadio) gpaRadio.checked = true;

  // Study Hours
  const studyHoursEl = document.getElementById('studyHours');
  if (studyHoursEl) studyHoursEl.value = storage.get('studyHours', 4);

  // Notifications
  const notifyExamsEl = document.getElementById('notifyExams');
  const notifyTasksEl = document.getElementById('notifyTasks');

  if (notifyExamsEl) notifyExamsEl.checked = storage.get('notifyExams', true);
  if (notifyTasksEl) notifyTasksEl.checked = storage.get('notifyTasks', true);

  // Week Start
  const weekStart = localStorage.getItem('weekStart') || 'saturday';
  const weekRadio = document.querySelector(`input[name="weekStart"][value="${weekStart}"]`);
  if (weekRadio) weekRadio.checked = true;
}

/* ============================================
   SAVE PROFILE
   ============================================ */

function saveProfile() {
  const profile = {
    name: document.getElementById('profileName')?.value.trim() || '',
    university: document.getElementById('profileUniversity')?.value.trim() || '',
    major: document.getElementById('profileMajor')?.value.trim() || '',
    year: document.getElementById('profileYear')?.value || '3'
  };

  storage.set('profile', profile);

  window.dispatchEvent(new CustomEvent('avatarChanged'));

  showToast('✅ تم حفظ الملف الشخصي', 'success');
}

/* ============================================
   AVATAR UPLOAD
   ============================================ */

const avatarEl = document.getElementById('profileAvatar');
const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
const removeAvatarBtn = document.getElementById('removeAvatarBtn');
const avatarInput = document.getElementById('avatarInput');

function loadAvatar() {
  const avatar = storage.get('avatar');
  const profile = storage.get('profile', DEFAULT_SETTINGS.profile);
  const initial = (profile.name || 'أ').charAt(0);

  if (avatarEl) {
    if (avatar) {
      avatarEl.style.backgroundImage = `url(${avatar})`;
      avatarEl.style.backgroundSize = 'cover';
      avatarEl.style.backgroundPosition = 'center';
      avatarEl.textContent = '';
    } else {
      avatarEl.style.backgroundImage = '';
      avatarEl.textContent = initial;
    }
  }

  if (removeAvatarBtn) {
    removeAvatarBtn.style.display = avatar ? 'inline-flex' : 'none';
  }
}

if (uploadAvatarBtn && avatarInput) {
  uploadAvatarBtn.addEventListener('click', () => {
    avatarInput.click();
  });

  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast(i18n.t('settings.profile.invalidImage'), 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('❌ الصورة أكبر من 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;

      try {
        storage.set('avatar', base64);

        if (avatarEl) {
          avatarEl.style.backgroundImage = `url(${base64})`;
          avatarEl.style.backgroundSize = 'cover';
          avatarEl.style.backgroundPosition = 'center';
          avatarEl.textContent = '';
        }

        if (removeAvatarBtn) removeAvatarBtn.style.display = 'inline-flex';

        window.dispatchEvent(new CustomEvent('avatarChanged'));

        showToast(i18n.t('settings.profile.photoUploaded'), 'success');
      } catch (err) {
        showToast('❌ الصورة كبيرة جداً', 'error');
      }
    };
    reader.readAsDataURL(file);

    avatarInput.value = '';
  });
}

if (removeAvatarBtn) {
  removeAvatarBtn.addEventListener('click', () => {
    storage.remove('avatar');
    loadAvatar();

    window.dispatchEvent(new CustomEvent('avatarChanged'));

    showToast(i18n.t('settings.profile.photoRemoved'), 'success');
  });
}

/* ============================================
   THEME
   ============================================ */

function applyTheme(theme) {
  const html = document.documentElement;

  html.classList.add('theme-transitioning');

  if (theme === 'auto') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
  } else {
    html.setAttribute('data-theme', theme);
  }

  localStorage.setItem('theme', theme);

  setTimeout(() => {
    html.classList.remove('theme-transitioning');
  }, 400);
}

/* ============================================
   FONT SIZE
   ============================================ */

const FONT_SCALES = {
  small: 0.9,
  medium: 1,
  large: 1.15
};

function applyFontSize(size) {
  const scale = FONT_SCALES[size] || 1;
  document.documentElement.style.setProperty('--font-scale', scale);

  localStorage.setItem('fontSize', size);
}

/* ============================================
   PRIMARY COLOR
   ============================================ */

const COLOR_MAP = {
  indigo: { 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
  blue:   { 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
  green:  { 500: '#10b981', 600: '#059669', 700: '#047857' },
  purple: { 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce' },
  red:    { 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
  orange: { 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
  pink:   { 500: '#ec4899', 600: '#db2777', 700: '#be185d' },
  cyan:   { 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490' },
  yellow: { 500: '#eab308', 600: '#ca8a04', 700: '#a16207' },
  teal:   { 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e' },
  rose:   { 500: '#f43f5e', 600: '#e11d48', 700: '#be123c' },
  amber:  { 500: '#d97706', 600: '#b45309', 700: '#92400e' }
};

function applyPrimaryColor(colorName) {
  const color = COLOR_MAP[colorName];
  if (!color) return;

  const root = document.documentElement;
  root.style.setProperty('--primary-500', color[500]);
  root.style.setProperty('--primary-600', color[600]);
  root.style.setProperty('--primary-700', color[700]);

  localStorage.setItem('primaryColor', colorName);
}

/* ============================================
   EVENT LISTENERS — Navigation
   ============================================ */

document.querySelectorAll('.settings__nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();

    const target = item.getAttribute('href');
    const section = document.querySelector(target);

    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });

      document.querySelectorAll('.settings__nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    }
  });
});

// Active section on scroll
const sections = document.querySelectorAll('.settings__section');
const navItems = document.querySelectorAll('.settings__nav-item');

if (sections.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(item => {
          item.classList.toggle('active', item.getAttribute('data-section') === id);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(section => observer.observe(section));
}

/* ============================================
   EVENT LISTENERS — Forms
   ============================================ */

// Profile — Save on change
['profileName', 'profileUniversity', 'profileMajor', 'profileYear'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', saveProfile);
});

// Language
document.querySelectorAll('input[name="language"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    i18n.setLang(e.target.value);
  });
});

// Theme
document.querySelectorAll('input[name="theme"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    applyTheme(e.target.value);
  });
});

// Font Size
document.querySelectorAll('input[name="fontSize"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    applyFontSize(e.target.value);
  });
});

// Primary Color
document.querySelectorAll('.settings__color').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.settings__color').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const color = btn.getAttribute('data-color');
    applyPrimaryColor(color);
  });
});

// GPA System
document.querySelectorAll('input[name="gpaSystem"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    localStorage.setItem('gpaSystem', e.target.value);
    showToast(`✅ تم تغيير نظام المعدل إلى ${e.target.value}`, 'success');
  });
});

// Study Hours
document.getElementById('studyHours')?.addEventListener('change', (e) => {
  storage.set('studyHours', e.target.value);
});

// Notify Exams Toggle
document.getElementById('notifyExams')?.addEventListener('change', (e) => {
  storage.set('notifyExams', e.target.checked);
});

// Notify Tasks Toggle
document.getElementById('notifyTasks')?.addEventListener('change', (e) => {
  storage.set('notifyTasks', e.target.checked);
});

// Week Start
document.querySelectorAll('input[name="weekStart"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    localStorage.setItem('weekStart', e.target.value);
  });
});

/* ============================================
   NOTIFICATIONS PERMISSION — Status Display
   ============================================ */

function updateNotificationStatus() {
  const statusEl = document.getElementById('notifStatus');
  if (!statusEl) return;

  const isAr = i18n.getLang() === 'ar';

  // 1. غير مدعوم
  if (!isNotificationSupported()) {
    statusEl.className = 'settings__notif-status settings__notif-status--unsupported';
    statusEl.innerHTML = `
      <span class="settings__notif-status-icon">❌</span>
      <span>${isAr ? 'الإشعارات غير مدعومة في متصفحك' : 'Notifications not supported in your browser'}</span>
    `;
    return;
  }

  // 2. اقرأ الحالة الحقيقية
  const permission = getPermissionStatus();

  if (permission === 'granted') {
    statusEl.className = 'settings__notif-status settings__notif-status--granted';
    statusEl.innerHTML = `
      <span class="settings__notif-status-icon">✅</span>
      <span>${isAr ? 'الإشعارات مفعلة' : 'Notifications enabled'}</span>
    `;

    // عطّل زر "تفعيل" (لأنه مفعّل مسبقاً)
    const enableBtn = document.getElementById('enableNotificationsBtn');
    if (enableBtn) {
      enableBtn.disabled = true;
      enableBtn.style.opacity = '0.5';
      enableBtn.style.cursor = 'not-allowed';
    }
  } else if (permission === 'denied') {
    statusEl.className = 'settings__notif-status settings__notif-status--denied';
    statusEl.innerHTML = `
      <span class="settings__notif-status-icon">🚫</span>
      <span>${isAr ? 'الإشعارات محظورة - فعّلها من إعدادات المتصفح' : 'Notifications blocked - enable from browser settings'}</span>
    `;

    const enableBtn = document.getElementById('enableNotificationsBtn');
    if (enableBtn) {
      enableBtn.disabled = false;
      enableBtn.style.opacity = '1';
      enableBtn.style.cursor = 'pointer';
    }
  } else {
    statusEl.className = 'settings__notif-status settings__notif-status--default';
    statusEl.innerHTML = `
      <span class="settings__notif-status-icon">🔔</span>
      <span>${isAr ? 'الإشعارات غير مفعلة - اضغط لتفعيلها' : 'Notifications not enabled - click to enable'}</span>
    `;

    const enableBtn = document.getElementById('enableNotificationsBtn');
    if (enableBtn) {
      enableBtn.disabled = false;
      enableBtn.style.opacity = '1';
      enableBtn.style.cursor = 'pointer';
    }
  }
}

// Enable notifications button
document.getElementById('enableNotificationsBtn')?.addEventListener('click', async () => {
  const permission = await requestNotificationPermission();

  if (permission === 'granted') {
    showToast(i18n.t('settings.notifications.enabled') || '✅ تم تفعيل الإشعارات', 'success');
    startNotificationScheduler();
  } else if (permission === 'denied') {
    showToast(i18n.t('settings.notifications.denied') || '❌ تم رفض الإشعارات', 'error');
  } else {
    showToast(i18n.t('settings.notifications.unsupported') || '⚠️ الإشعارات غير مدعومة', 'error');
  }

  updateNotificationStatus();
});

// Test notification button
document.getElementById('testNotificationBtn')?.addEventListener('click', async () => {
  const success = await sendTestNotification();

  if (success) {
    showToast(i18n.t('settings.notifications.testSent') || '✅ تم إرسال الإشعار', 'success');
  } else {
    showToast(i18n.t('settings.notifications.testFailed') || '❌ فشل إرسال الإشعار', 'error');
  }

  updateNotificationStatus();
});

/* ============================================
   EXPORT DATA
   ============================================ */

document.getElementById('exportData')?.addEventListener('click', () => {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    try {
      data[key] = JSON.parse(localStorage.getItem(key));
    } catch {
      data[key] = localStorage.getItem(key);
    }
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `studenthub-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  showToast(i18n.t('settings.data.exportSuccess'), 'success');
});

/* ============================================
   IMPORT DATA
   ============================================ */

const importDialog = document.getElementById('importDialog');
const importPreview = document.getElementById('importPreview');
const confirmImportBtn = document.getElementById('confirmImportBtn');
const cancelImportBtn = document.getElementById('cancelImportBtn');

let pendingImportData = null;

document.getElementById('importData')?.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        pendingImportData = data;

        if (importPreview) {
          importPreview.innerHTML = '';

          Object.keys(data).forEach(key => {
            const value = data[key];
            const displayValue = typeof value === 'object'
              ? JSON.stringify(value).substring(0, 30) + '...'
              : String(value).substring(0, 30);

            const item = document.createElement('div');
            item.className = 'dialog__preview-item';
            item.innerHTML = `
              <span class="dialog__preview-key">${key}:</span>
              <span class="dialog__preview-value">${displayValue}</span>
            `;
            importPreview.appendChild(item);
          });
        }

        if (importDialog) importDialog.showModal();

      } catch {
        showToast(i18n.t('settings.data.importError'), 'error');
      }
    };
    reader.readAsText(file);
  });

  input.click();
});

confirmImportBtn?.addEventListener('click', () => {
  if (!pendingImportData) return;

  try {
    Object.keys(pendingImportData).forEach(key => {
      const value = pendingImportData[key];

      if (typeof value === 'string') {
        localStorage.setItem(key, value);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });

    showToast(i18n.t('settings.data.importSuccess'), 'success');
    if (importDialog) importDialog.close();

    setTimeout(() => location.reload(), 1500);
  } catch {
    showToast(i18n.t('settings.data.importError'), 'error');
  }

  pendingImportData = null;
});

cancelImportBtn?.addEventListener('click', () => {
  pendingImportData = null;
  if (importDialog) importDialog.close();
});

/* ============================================
   DELETE DATA
   ============================================ */

const deleteDialog = document.getElementById('deleteDialog');
const deleteConfirmInput = document.getElementById('deleteConfirmInput');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const deleteDataBtn = document.getElementById('deleteData');

deleteDataBtn?.addEventListener('click', () => {
  if (deleteDialog) {
    deleteDialog.showModal();
    if (deleteConfirmInput) {
      deleteConfirmInput.value = '';
      deleteConfirmInput.focus();
    }
    if (confirmDeleteBtn) confirmDeleteBtn.disabled = true;
  }
});

deleteConfirmInput?.addEventListener('input', (e) => {
  if (confirmDeleteBtn) {
    confirmDeleteBtn.disabled = e.target.value !== 'DELETE';
  }
});

confirmDeleteBtn?.addEventListener('click', () => {
  localStorage.clear();

  if (deleteDialog) deleteDialog.close();

  showToast(i18n.t('settings.data.deleteSuccess'), 'success');
  setTimeout(() => location.reload(), 1500);
});

cancelDeleteBtn?.addEventListener('click', () => {
  if (deleteDialog) deleteDialog.close();
});

deleteDialog?.addEventListener('close', () => {
  if (deleteConfirmInput) deleteConfirmInput.value = '';
  if (confirmDeleteBtn) confirmDeleteBtn.disabled = true;
});

/* ============================================
   SAVE BAR
   ============================================ */

const saveBar = document.getElementById('saveBar');
const saveAllBtn = document.getElementById('saveAllBtn');
const discardBtn = document.getElementById('discardBtn');

let hasUnsavedChanges = false;

function showSaveBar() {
  hasUnsavedChanges = true;
  if (saveBar) saveBar.classList.add('visible');
}

function hideSaveBar() {
  hasUnsavedChanges = false;
  if (saveBar) saveBar.classList.remove('visible');
}

document.querySelectorAll('.settings__content input, .settings__content select').forEach(input => {
  input.addEventListener('change', showSaveBar);
});

saveAllBtn?.addEventListener('click', () => {
  hideSaveBar();
  showToast(i18n.t('settings.saved'), 'success');
});

discardBtn?.addEventListener('click', () => {
  if (confirm('⚠️ سيتم تجاهل التغييرات. هل أنت متأكد؟')) {
    location.reload();
  }
});

window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = '';
  }
});

/* ============================================
   ✅ UPDATE NOTIFICATION STATUS ON RETURN
   ============================================ */

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    updateNotificationStatus();
  }
});

window.addEventListener('storage', (e) => {
  if (e.key === 'notifyExams' || e.key === 'notifyTasks') {
    updateNotificationStatus();
  }
});

/* ============================================
   INITIALIZE
   ============================================ */

function initSettings() {
  loadSettings();
  loadAvatar();
  updateNotificationStatus();

  // اقرأ الثيم مباشرة من localStorage
  const theme = localStorage.getItem('theme') || 'light';
  applyTheme(theme);

  // اقرأ اللون مباشرة
  const color = localStorage.getItem('primaryColor') || 'indigo';
  applyPrimaryColor(color);

  // اقرأ حجم الخط مباشرة
  const fontSize = localStorage.getItem('fontSize') || 'medium';
  applyFontSize(fontSize);

  // ✅ استدعاء متأخر للتأكد من تحديث الحالة
  setTimeout(() => {
    updateNotificationStatus();
  }, 500);

  // Start scheduler if permission granted
  if (isNotificationSupported() && getPermissionStatus() === 'granted') {
    startNotificationScheduler();
  }

  console.log('✅ Settings initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSettings);
} else {
  setTimeout(initSettings, 100);
}