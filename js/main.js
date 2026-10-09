/* ============================================
   StudentHub — Main Entry Point
   ============================================ */

import { i18n } from './i18n/i18n.js';
import { storage } from './utils/storage.js';
import { escapeHtml } from './utils/html.js';
import { highlightText } from './utils/html.js';
import { getExamDateTime } from './utils/date.js';
import {
  isNotificationSupported,
  getPermissionStatus,
  startNotificationScheduler
} from './core/notifications.js';

/* ============================================
   SERVICE WORKER
   ============================================ */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 New Service Worker found');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✅ New version available');
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}

/* ============================================
   THEME TOGGLE
   ============================================ */

const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

if (themeToggle) {
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    html.classList.add('theme-transitioning');
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);

    setTimeout(() => {
      html.classList.remove('theme-transitioning');
    }, 400);
  });
}

function updateThemeIcon(theme) {
  if (!themeToggle) return;
  themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
}

/* ============================================
   SIDEBAR TOGGLE
   ============================================ */

const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');

if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024) {
      if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    }
  });
}

/* ============================================
   CURRENT DATE
   ============================================ */

function updateCurrentDate() {
  const dateEl = document.getElementById('currentDate');
  if (!dateEl) return;

  const now = new Date();
  const lang = i18n.getLang();

  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
  dateEl.textContent = now.toLocaleDateString(locale, options);
}

/* ============================================
   AVATAR
   ============================================ */

function loadAvatarGlobal() {
  try {
    const avatarRaw = localStorage.getItem('avatar');
    const profileRaw = localStorage.getItem('profile');

    let avatar = null;
    let profile = { name: 'أ' };

    if (avatarRaw && avatarRaw !== 'null') {
      try { avatar = JSON.parse(avatarRaw); } catch { avatar = avatarRaw; }
    }

    if (profileRaw) {
      try { profile = JSON.parse(profileRaw); } catch { profile = { name: 'أ' }; }
    }

    const initial = (profile.name || 'أ').charAt(0);

    document.querySelectorAll('.header .avatar').forEach(el => {
      if (avatar) {
        el.style.backgroundImage = `url(${avatar})`;
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        el.style.backgroundRepeat = 'no-repeat';
        el.textContent = '';
      } else {
        el.style.backgroundImage = '';
        el.textContent = initial;
      }
    });
  } catch (error) {
    console.error('Load avatar error:', error);
  }
}

/* ============================================
   GREETING
   ============================================ */

function loadGreeting() {
  const greetingEl = document.getElementById('dashboardGreeting')
    || document.querySelector('[data-i18n="dashboard.welcomeTitle"]');
  const subtitleEl = document.getElementById('dashboardSubtitle')
    || document.querySelector('[data-i18n="dashboard.welcomeSubtitle"]');

  if (!greetingEl) return;

  try {
    const profileRaw = localStorage.getItem('profile');
    let name = null;

    if (profileRaw) {
      const profile = JSON.parse(profileRaw);
      if (profile.name && profile.name.trim() !== '' && profile.name.trim() !== 'علي') {
        name = profile.name.trim();
      }
    }

    if (name) {
      const template = i18n.t('dashboard.greeting');
      greetingEl.textContent = template.replace('{name}', name);
      if (subtitleEl) subtitleEl.textContent = i18n.t('dashboard.subtitle');
    } else {
      greetingEl.textContent = i18n.t('dashboard.welcomeTitle');
      if (subtitleEl) subtitleEl.textContent = i18n.t('dashboard.welcomeSubtitle');
    }
  } catch (error) {
    console.error('Load greeting error:', error);
  }
}

/* ============================================
   GPA CALCULATION
   ============================================ */

function calculateGpaFromStorage() {
  const grades = storage.get('grades', []);
  if (grades.length === 0) return null;

  const allHaveCredits = grades.every(g => {
    const c = parseFloat(g.credits);
    return !isNaN(c) && c > 0;
  });

  const noneHaveCredits = grades.every(g => {
    const c = parseFloat(g.credits);
    return isNaN(c) || c <= 0;
  });

  if (allHaveCredits) {
    let totalPoints = 0;
    let totalCredits = 0;
    grades.forEach(grade => {
      const credits = parseFloat(grade.credits) || 0;
      const value = parseFloat(grade.value) || 0;
      totalPoints += value * credits;
      totalCredits += credits;
    });
    return totalCredits > 0 ? totalPoints / totalCredits : null;
  }

  const total = grades.reduce((sum, g) => sum + (parseFloat(g.value) || 0), 0);
  return total / grades.length;
}

function getGpaSystemFromStorage() {
  return storage.get('gpaSystem', '100');
}

function getMaxGradeFromStorage() {
  return getGpaSystemFromStorage() === '4' ? 4 : 100;
}

/* ============================================
   DASHBOARD STATS
   ============================================ */

function loadDashboardStats() {
  // 1. Courses
  const courses = storage.get('courses', []);
  const coursesCount = courses.length;
  const statCoursesEl = document.getElementById('statCourses');
  const statCoursesChangeEl = document.getElementById('statCoursesChange');

  if (statCoursesEl) statCoursesEl.textContent = coursesCount;

  if (statCoursesChangeEl) {
    if (coursesCount === 0) {
      statCoursesChangeEl.textContent = i18n.t('dashboard.changes.noCourses') || 'لا توجد مواد بعد';
      statCoursesChangeEl.className = 'stat-card__change';
    } else {
      statCoursesChangeEl.textContent = `${coursesCount} ${i18n.t('dashboard.changes.coursesCount') || 'مادة مسجلة'}`;
      statCoursesChangeEl.className = 'stat-card__change positive';
    }
  }

  // 2. Upcoming Exams
  const exams = storage.get('exams', []);
  const now = Date.now();

  const upcomingExams = exams
    .filter(e => getExamDateTime(e) > now)
    .sort((a, b) => getExamDateTime(a) - getExamDateTime(b));

  const statExamsEl = document.getElementById('statExams');
  const statExamsChangeEl = document.getElementById('statExamsChange');

  if (statExamsEl) statExamsEl.textContent = upcomingExams.length;

  if (statExamsChangeEl) {
    if (upcomingExams.length === 0) {
      statExamsChangeEl.textContent = i18n.t('dashboard.changes.noExams') || 'لا توجد امتحانات قادمة';
      statExamsChangeEl.className = 'stat-card__change';
    } else {
      const nearest = upcomingExams[0];
      const nearestDate = getExamDateTime(nearest);
      const daysLeft = Math.ceil((nearestDate - now) / (1000 * 60 * 60 * 24));

      statExamsChangeEl.textContent = i18n.t('dashboard.changes.nearestExam', { days: daysLeft })
        || `الأقرب بعد ${daysLeft} أيام`;
      statExamsChangeEl.className = 'stat-card__change';
    }
  }

  // 3. GPA
  const gpa = calculateGpaFromStorage();
  const maxGrade = getMaxGradeFromStorage();

  const statGpaEl = document.getElementById('statGpa');
  const statGpaChangeEl = document.getElementById('statGpaChange');

  if (statGpaEl) {
    statGpaEl.textContent = gpa === null ? '—' : gpa.toFixed(2);
  }

  if (statGpaChangeEl) {
    if (gpa === null) {
      statGpaChangeEl.textContent = i18n.t('dashboard.changes.noGrades') || 'أضف علاماتك لحساب المعدل';
      statGpaChangeEl.className = 'stat-card__change';
    } else {
      statGpaChangeEl.textContent = `/ ${maxGrade}`;
      statGpaChangeEl.className = 'stat-card__change positive';
    }
  }

  // 4. Notes
  const notes = storage.get('notes', []);
  const notesCount = notes.length;
  const pinnedCount = notes.filter(n => n.pinned).length;

  const statNotesEl = document.getElementById('statNotes');
  const statNotesChangeEl = document.getElementById('statNotesChange');

  if (statNotesEl) statNotesEl.textContent = notesCount;

  if (statNotesChangeEl) {
    if (notesCount === 0) {
      statNotesChangeEl.textContent = i18n.t('dashboard.changes.noNotes') || 'لا توجد ملاحظات';
      statNotesChangeEl.className = 'stat-card__change';
    } else if (pinnedCount > 0) {
      statNotesChangeEl.textContent = `📌 ${pinnedCount} ${i18n.t('dashboard.changes.pinned') || 'مثبتة'}`;
      statNotesChangeEl.className = 'stat-card__change positive';
    } else {
      statNotesChangeEl.textContent = i18n.t('dashboard.changes.notesTotal') || 'ملاحظة';
      statNotesChangeEl.className = 'stat-card__change';
    }
  }
}

/* ============================================
   UPCOMING EXAMS WIDGET
   ============================================ */

function loadUpcomingExamsWidget() {
  const widget = document.getElementById('upcomingExamsWidget');
  if (!widget) return;

  const exams = storage.get('exams', []);
  const now = Date.now();

  const upcoming = exams
    .filter(e => getExamDateTime(e) > now)
    .sort((a, b) => getExamDateTime(a) - getExamDateTime(b))
    .slice(0, 3);

  if (upcoming.length === 0) {
    widget.innerHTML = `
      <div class="empty-state" style="padding: var(--space-6) var(--space-4);">
        <div class="empty-state__icon" style="font-size: 36px;">📝</div>
        <p class="empty-state__text">${i18n.t('dashboard.widgets.noUpcomingExams') || 'لا توجد امتحانات قادمة'}</p>
      </div>
    `;
    return;
  }

  const typeIcons = {
    midterm: '📝',
    final: '🎓',
    lab: '💻',
    oral: '🎤'
  };

  widget.innerHTML = upcoming.map(exam => {
    const examDate = new Date(getExamDateTime(exam));
    const diff = examDate.getTime() - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    const isUrgent = days <= 3;
    const dateStr = examDate.toLocaleDateString(
      i18n.getLang() === 'ar' ? 'ar-EG' : 'en-US',
      { month: 'short', day: 'numeric' }
    );

    const icon = typeIcons[exam.type] || '📝';

    return `
      <div class="exam-item">
        <div class="exam-item__icon">${icon}</div>
        <div class="exam-item__content">
          <div class="exam-item__title">${escapeHtml(exam.name)}</div>
          <div class="exam-item__meta">📅 ${dateStr}${exam.room ? ` • ${escapeHtml(exam.room)}` : ''}</div>
        </div>
        <div class="exam-item__countdown ${isUrgent ? 'urgent' : ''}">
          ${days} ${i18n.t('dashboard.exams.days') || 'أيام'}
        </div>
      </div>
    `;
  }).join('');
}

/* ============================================
   QUICK NOTES WIDGET
   ============================================ */

function loadQuickNotesWidget() {
  const widget = document.getElementById('quickNotesWidget');
  if (!widget) return;

  const notes = storage.get('notes', []);

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
  });

  const topNotes = sorted.slice(0, 3);

  if (topNotes.length === 0) {
    widget.innerHTML = `
      <div class="empty-state" style="padding: var(--space-6) var(--space-4);">
        <div class="empty-state__icon" style="font-size: 36px;">📔</div>
        <p class="empty-state__text">${i18n.t('dashboard.widgets.noNotes') || 'لا توجد ملاحظات بعد'}</p>
      </div>
    `;
    return;
  }

  widget.innerHTML = topNotes.map(note => {
    const date = new Date(note.updatedAt || note.createdAt);
    const dateStr = date.toLocaleDateString(
      i18n.getLang() === 'ar' ? 'ar-EG' : 'en-US',
      { month: 'short', day: 'numeric' }
    );

    return `
      <div class="quick-note" style="${note.pinned ? 'border-right-color: var(--brand);' : ''}">
        <span>${note.pinned ? '📌 ' : ''}${escapeHtml(note.title)}</span>
        <div class="quick-note__date">${dateStr}</div>
      </div>
    `;
  }).join('');
}

/* ============================================
   GLOBAL SEARCH
   ============================================ */

const globalSearchInput = document.getElementById('globalSearch');
const searchResultsEl = document.getElementById('searchResults');
let searchTimeout = null;

function performGlobalSearch(query) {
  if (!query || query.trim().length < 1) {
    closeSearchResults();
    return;
  }

  const q = query.trim().toLowerCase();

  const courses = storage.get('courses', []);
  const courseResults = courses
    .filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.professor || '').toLowerCase().includes(q) ||
      (c.room || '').toLowerCase().includes(q)
    )
    .slice(0, 3)
    .map(c => ({
      type: 'course',
      icon: '📚',
      title: c.name,
      subtitle: c.professor || `${c.credits || 0} ${i18n.t('gpa.creditsLabel') || 'ساعات'}`,
      url: 'courses.html'
    }));

  const exams = storage.get('exams', []);
  const examResults = exams
    .filter(e => e.name.toLowerCase().includes(q) || (e.room || '').toLowerCase().includes(q))
    .slice(0, 3)
    .map(e => {
      const examDate = new Date(getExamDateTime(e));
      const dateStr = examDate.toLocaleDateString(
        i18n.getLang() === 'ar' ? 'ar-EG' : 'en-US',
        { month: 'short', day: 'numeric' }
      );
      const typeName = i18n.t(`exams.types.${e.type}`) || e.type;
      return {
        type: 'exam',
        icon: '📝',
        title: e.name,
        subtitle: `${typeName} • ${dateStr}`,
        url: 'exams.html'
      };
    });

  const grades = storage.get('grades', []);
  const gradeResults = grades
    .filter(g => g.name.toLowerCase().includes(q))
    .slice(0, 3)
    .map(g => ({
      type: 'grade',
      icon: '📊',
      title: g.name,
      subtitle: `${i18n.t('gpa.fields.grade') || 'العلامة'}: ${g.value}`,
      url: 'gpa.html'
    }));

  const notes = storage.get('notes', []);
  const noteResults = notes
    .filter(n =>
      n.title.toLowerCase().includes(q) ||
      (n.content || '').toLowerCase().includes(q) ||
      (n.tags || '').toLowerCase().includes(q)
    )
    .slice(0, 3)
    .map(n => ({
      type: 'note',
      icon: '📔',
      title: n.title,
      subtitle: n.content ? n.content.substring(0, 50) + (n.content.length > 50 ? '...' : '') : '',
      url: 'notes.html'
    }));

  renderSearchResults({
    courses: courseResults,
    exams: examResults,
    grades: gradeResults,
    notes: noteResults
  }, query);
}

function renderSearchResults(results, query) {
  if (!searchResultsEl) return;

  const sections = [];
  const sectionLabels = {
    courses: i18n.t('search.sections.courses') || 'المواد',
    exams: i18n.t('search.sections.exams') || 'الامتحانات',
    grades: i18n.t('search.sections.grades') || 'العلامات',
    notes: i18n.t('search.sections.notes') || 'الملاحظات'
  };

  const iconClasses = {
    course: 'search-result-item__icon--course',
    exam: 'search-result-item__icon--exam',
    grade: 'search-result-item__icon--grade',
    note: 'search-result-item__icon--note'
  };

  Object.keys(results).forEach(key => {
    const items = results[key];
    if (items.length === 0) return;

    const itemsHTML = items.map(item => `
      <a href="${item.url}" class="search-result-item">
        <div class="search-result-item__icon ${iconClasses[item.type]}">${item.icon}</div>
        <div class="search-result-item__content">
          <div class="search-result-item__title">${highlightText(item.title, query)}</div>
          ${item.subtitle ? `<div class="search-result-item__subtitle">${escapeHtml(item.subtitle)}</div>` : ''}
        </div>
        <div class="search-result-item__arrow">←</div>
      </a>
    `).join('');

    sections.push(`
      <div class="search-results__section">
        <div class="search-results__section-title">${sectionLabels[key]}</div>
        ${itemsHTML}
      </div>
    `);
  });

  if (sections.length === 0) {
    searchResultsEl.innerHTML = `
      <div class="search-results__empty">
        <div class="search-results__empty-icon">🔍</div>
        <div>${i18n.t('search.noResults') || 'لا توجد نتائج'}</div>
      </div>
    `;
    searchResultsEl.classList.add('active');
    return;
  }

  searchResultsEl.innerHTML = sections.join('');
  searchResultsEl.classList.add('active');
}

function closeSearchResults() {
  if (searchResultsEl) {
    searchResultsEl.classList.remove('active');
  }
}

if (globalSearchInput) {
  globalSearchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value;
    searchTimeout = setTimeout(() => performGlobalSearch(query), 200);
  });

  globalSearchInput.addEventListener('focus', () => {
    if (globalSearchInput.value.trim().length > 0) {
      performGlobalSearch(globalSearchInput.value);
    }
  });

  globalSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      globalSearchInput.value = '';
      closeSearchResults();
      globalSearchInput.blur();
    }
  });

  document.addEventListener('click', (e) => {
    if (!globalSearchInput.contains(e.target) &&
        searchResultsEl &&
        !searchResultsEl.contains(e.target)) {
      closeSearchResults();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    globalSearchInput?.focus();
    globalSearchInput?.select();
  }
});

/* ============================================
   NOTIFICATIONS
   ============================================ */

const notificationsBtn = document.getElementById('notificationsBtn');
const notificationsDropdown = document.getElementById('notificationsDropdown');
const notificationsBadge = document.getElementById('notificationsBadge');

function getNotifications() {
  const items = [];
  const now = Date.now();
  const isAr = i18n.getLang() === 'ar';

  const exams = storage.get('exams', []);
  const upcomingExams = exams
    .filter(e => getExamDateTime(e) > now)
    .sort((a, b) => getExamDateTime(a) - getExamDateTime(b))
    .slice(0, 5);

  upcomingExams.forEach(exam => {
    const examDate = new Date(getExamDateTime(exam));
    const diff = examDate.getTime() - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const isUrgent = days <= 3;

    items.push({
      type: 'exam',
      icon: isUrgent ? '🔥' : '📝',
      iconClass: isUrgent ? 'notification-item__icon--urgent' : 'notification-item__icon--exam',
      title: exam.name,
      subtitle: isAr
        ? (days === 1 ? 'غداً' : `بعد ${days} أيام`)
        : (days === 1 ? 'Tomorrow' : `In ${days} days`),
      badge: days <= 3 ? (isAr ? 'عاجل' : 'Urgent') : null,
      badgeClass: 'notification-item__badge',
      url: 'exams.html'
    });
  });

  const notes = storage.get('notes', []);
  const pinnedNotes = notes
    .filter(n => n.pinned)
    .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt))
    .slice(0, 3);

  pinnedNotes.forEach(note => {
    const date = new Date(note.updatedAt || note.createdAt);
    const dateStr = date.toLocaleDateString(
      isAr ? 'ar-EG' : 'en-US',
      { month: 'short', day: 'numeric' }
    );

    items.push({
      type: 'note',
      icon: '📌',
      iconClass: 'notification-item__icon--note',
      title: note.title,
      subtitle: `${isAr ? 'مثبتة' : 'Pinned'} • ${dateStr}`,
      badge: null,
      url: 'notes.html'
    });
  });

  return items;
}

function renderNotifications() {
  if (!notificationsDropdown) return;

  const items = getNotifications();
  const isAr = i18n.getLang() === 'ar';

  if (notificationsBadge) {
    if (items.length > 0) {
      notificationsBadge.textContent = items.length > 9 ? '9+' : items.length;
      notificationsBadge.classList.add('visible');
    } else {
      notificationsBadge.classList.remove('visible');
    }
  }

  const headerHTML = `
    <div class="notifications-dropdown__header">
      <div class="notifications-dropdown__title">${isAr ? '🔔 الإشعارات' : '🔔 Notifications'}</div>
    </div>
  `;

  if (items.length === 0) {
    notificationsDropdown.innerHTML = `
      ${headerHTML}
      <div class="notifications-dropdown__empty">
        <div class="notifications-dropdown__empty-icon">🔕</div>
        <div class="notifications-dropdown__empty-text">
          ${isAr ? 'لا توجد إشعارات' : 'No notifications'}
        </div>
      </div>
    `;
    return;
  }

  const itemsHTML = items.map(item => `
    <a href="${item.url}" class="notification-item">
      <div class="notification-item__icon ${item.iconClass}">${item.icon}</div>
      <div class="notification-item__content">
        <div class="notification-item__title">${escapeHtml(item.title)}</div>
        <div class="notification-item__subtitle">${escapeHtml(item.subtitle)}</div>
      </div>
      ${item.badge ? `<div class="${item.badgeClass}">${item.badge}</div>` : ''}
    </a>
  `).join('');

  const footerHTML = `
    <div class="notifications-dropdown__footer">
      <a href="exams.html">${isAr ? 'عرض كل الامتحانات' : 'View all exams'}</a>
    </div>
  `;

  notificationsDropdown.innerHTML = headerHTML + itemsHTML + footerHTML;
}

if (notificationsBtn && notificationsDropdown) {
  notificationsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isActive = notificationsDropdown.classList.contains('active');

    closeSearchResults();

    if (!isActive) {
      renderNotifications();
      notificationsDropdown.classList.add('active');
    } else {
      notificationsDropdown.classList.remove('active');
    }
  });

  document.addEventListener('click', (e) => {
    if (!notificationsBtn.contains(e.target) &&
        !notificationsDropdown.contains(e.target)) {
      notificationsDropdown.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      notificationsDropdown.classList.remove('active');
    }
  });
}

/* ============================================
   PWA INSTALL
   ============================================ */

let deferredPrompt = null;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (installBtn) {
    installBtn.style.display = 'inline-flex';
    console.log('📲 Install prompt available');
  }
});

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      installBtn.style.display = 'none';
    }

    deferredPrompt = null;
  });
}

window.addEventListener('appinstalled', () => {
  if (installBtn) installBtn.style.display = 'none';
  deferredPrompt = null;
});

if (window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true) {
  if (installBtn) installBtn.style.display = 'none';
}

/* ============================================
   TOAST ANIMATIONS
   ============================================ */

const toastStyles = document.createElement('style');
toastStyles.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(toastStyles);

/* ============================================
   ✅ TIMER WATCHER — يعمل في كل الصفحات
   ============================================ */

let lastTimerNotification = 0;

function checkTimerStatus() {
  try {
    const raw = localStorage.getItem('timerState');
    if (!raw) return;

    const state = JSON.parse(raw);
    if (!state || !state.isRunning || !state.endTime) return;

    const remaining = state.endTime - Date.now();

    if (remaining <= 0) {
      if (lastTimerNotification === state.endTime) return;
      lastTimerNotification = state.endTime;

      showTimerEndNotification(state);

      localStorage.removeItem('timerState');

      window.dispatchEvent(new CustomEvent('studentDataChanged'));
    }
  } catch (err) {
    console.warn('Timer watcher error:', err);
  }
}

function showTimerEndNotification(state) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const modeNames = {
    study:  'جلسة دراسة',
    deep:   'دراسة عميقة',
    review: 'مراجعة سريعة',
    break:  'جلسة راحة'
  };
  const modeName = modeNames[state.currentMode] || 'جلسة';

  const title = '🎉 انتهت الجلسة!';
  const body = `${modeName} اكتملت — أحسنت! خذ راحة قصيرة.`;

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready
      .then(reg => {
        reg.showNotification(title, {
          body,
          icon: './assets/icons/icon-192.png',
          badge: './assets/icons/icon-72.png',
          tag: 'timer-end-' + state.endTime,
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200]
        });
      })
      .catch(() => {
        try {
          new Notification(title, { body, icon: './assets/icons/icon-192.png' });
        } catch {}
      });
    return;
  }

  try {
    new Notification(title, { body, icon: './assets/icons/icon-192.png' });
  } catch (err) {
    console.warn('Notification failed:', err);
  }
}

// ✅ ابدأ المراقبة — كل ثانية
setInterval(checkTimerStatus, 1000);

// ✅ افحص فوراً عند تحميل الصفحة
setTimeout(checkTimerStatus, 500);

/* ============================================
   INIT
   ============================================ */

function initApp() {
  i18n.init();

  updateCurrentDate();
  loadAvatarGlobal();

  setTimeout(loadGreeting, 150);

  setTimeout(() => {
    loadDashboardStats();
    loadUpcomingExamsWidget();
    loadQuickNotesWidget();
    renderNotifications();
  }, 200);

  setInterval(updateCurrentDate, 60000);

  if (document.getElementById('statExams')) {
    setInterval(() => {
      loadDashboardStats();
      loadUpcomingExamsWidget();
    }, 30000);
  }

  if (isNotificationSupported() && getPermissionStatus() === 'granted') {
    startNotificationScheduler();
  }

  window.addEventListener('languageChanged', () => {
    updateCurrentDate();
    setTimeout(loadGreeting, 50);
    setTimeout(() => {
      loadDashboardStats();
      loadUpcomingExamsWidget();
      loadQuickNotesWidget();
      renderNotifications();
    }, 100);
  });

  window.addEventListener('avatarChanged', () => {
    loadAvatarGlobal();
    loadGreeting();
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'avatar' || e.key === 'profile') {
      loadAvatarGlobal();
      loadGreeting();
    }

    if (['courses', 'exams', 'grades', 'notes'].includes(e.key)) {
      loadDashboardStats();
      loadUpcomingExamsWidget();
      loadQuickNotesWidget();
      renderNotifications();
    }
  });

  window.addEventListener('studentDataChanged', () => {
    loadDashboardStats();
    loadUpcomingExamsWidget();
    loadQuickNotesWidget();
    renderNotifications();
  });

  window.addEventListener('dashboardUpdate', () => {
    loadDashboardStats();
    loadUpcomingExamsWidget();
    loadQuickNotesWidget();
    renderNotifications();
  });

  console.log('✅ StudentHub initialized');
}

initApp();