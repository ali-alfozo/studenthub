/* ============================================
   EXAMS PAGE
   ============================================ */

import { i18n } from '../i18n/i18n.js';
import { storage } from '../utils/storage.js';
import { escapeHtml } from '../utils/html.js';
import { showToast } from '../utils/toast.js';
import { getExamDateTime, formatCountdown } from '../utils/date.js';

/* ============================================
   STATE
   ============================================ */

let exams = [];
let editingId = null;
let deletingId = null;
let countdownInterval = null;

/* ============================================
   ELEMENTS
   ============================================ */

const examsGrid = document.getElementById('examsGrid');
const examsEmpty = document.getElementById('examsEmpty');
const examDialog = document.getElementById('examDialog');
const examDialogTitle = document.getElementById('examDialogTitle');
const examForm = document.getElementById('examForm');
const deleteDialog = document.getElementById('deleteDialog');

const addExamBtn = document.getElementById('addExamBtn');
const addFirstExamBtn = document.getElementById('addFirstExamBtn');
const closeDialogBtn = document.getElementById('closeDialogBtn');
const cancelExamBtn = document.getElementById('cancelExamBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

const examSearch = document.getElementById('examSearch');
const examFilterType = document.getElementById('examFilterType');
const examFilterStatus = document.getElementById('examFilterStatus');

/* ============================================
   LOAD
   ============================================ */

function loadExams() {
  exams = storage.get('exams', []);
  renderExams();
  startCountdown();
}

function saveExams() {
  storage.set('exams', exams);
  // ✅ إشعار الصفحات الأخرى (Dashboard + AI)
  window.dispatchEvent(new CustomEvent('studentDataChanged'));
}

/* ============================================
   RENDER
   ============================================ */

function renderExams() {
  const query = examSearch?.value.trim().toLowerCase() || '';
  const filterType = examFilterType?.value || '';
  const filterStatus = examFilterStatus?.value || 'all';

  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTodayTime = startOfToday.getTime();

  let filtered = exams.filter(exam => {
    const examDateTime = getExamDateTime(exam);

    const isPast = examDateTime < startOfTodayTime;

    const matchesSearch = !query || exam.name.toLowerCase().includes(query);
    const matchesType = !filterType || exam.type === filterType;

    let matchesStatus = true;
    if (filterStatus === 'upcoming') matchesStatus = !isPast;
    if (filterStatus === 'past') matchesStatus = isPast;

    return matchesSearch && matchesType && matchesStatus;
  });

  if (exams.length === 0) {
    examsGrid.innerHTML = '';
    examsGrid.style.display = 'none';
    examsEmpty.style.display = 'flex';
    return;
  }

  examsGrid.style.display = 'grid';
  examsEmpty.style.display = 'none';

  if (filtered.length === 0) {
    examsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">🔍</div>
        <h3 class="empty-state__title">${i18n.t('exams.noResults') || 'لا توجد نتائج'}</h3>
        <p class="empty-state__text">${i18n.t('exams.noResultsText') || 'جرب بحث مختلف'}</p>
      </div>
    `;
    return;
  }

  if (filterStatus === 'past') {
    filtered.sort((a, b) => getExamDateTime(b) - getExamDateTime(a));
  } else {
    filtered.sort((a, b) => getExamDateTime(a) - getExamDateTime(b));
  }

  examsGrid.innerHTML = filtered.map(exam => renderExamCard(exam)).join('');
  attachCardListeners();
}

/* ============================================
   STATUS
   ============================================ */

function getExamStatus(exam) {
  const now = Date.now();
  const examTime = getExamDateTime(exam);
  const diff = examTime - now;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTodayTime = startOfToday.getTime();

  if (examTime < startOfTodayTime) return 'past';

  const days = diff / (1000 * 60 * 60 * 24);

  if (days < 0) return 'today';
  if (days < 3) return 'urgent';
  if (days < 7) return 'soon';
  if (days < 14) return 'medium';
  return 'far';
}

function getTypeIcon(type) {
  const icons = { midterm: '📝', final: '🎓', lab: '💻', oral: '🎤' };
  return icons[type] || '📝';
}

/* ============================================
   RENDER CARD
   ============================================ */

function renderExamCard(exam) {
  const status = getExamStatus(exam);
  const isPast = status === 'past';

  const typeKey = `exams.types.${exam.type}`;
  const typeName = i18n.t(typeKey) || exam.type;

  // ✅ استخدام دالة موحّدة للتنسيق
  const examDate = new Date(getExamDateTime(exam));
  const dateStr = examDate.toLocaleDateString(
    i18n.getLang() === 'ar' ? 'ar-EG' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return `
    <div class="exam-card exam-card--${status}" data-id="${exam.id}">
      <div class="exam-card__header">
        <div class="exam-card__badges">
          <span class="exam-card__badge exam-card__badge--type-${exam.type}">
            ${getTypeIcon(exam.type)} ${typeName}
          </span>
          ${isPast ? `<span class="exam-card__badge exam-card__badge--past">✅ ${i18n.t('exams.status.past')}</span>` : ''}
        </div>
        <div class="exam-card__actions">
          <button class="exam-card__action edit" data-action="edit" data-id="${exam.id}" title="${i18n.t('common.edit')}">✏️</button>
          <button class="exam-card__action delete" data-action="delete" data-id="${exam.id}" title="${i18n.t('common.delete')}">🗑️</button>
        </div>
      </div>

      <h3 class="exam-card__name">${escapeHtml(exam.name)}</h3>

      ${!isPast ? `
        <div class="exam-card__countdown">
          <div class="exam-card__countdown-label">⏰ ${i18n.t('exams.countdown') || 'الوقت المتبقي'}</div>
          <div class="exam-card__countdown-value" data-countdown="${exam.id}">
            ${formatCountdown(getExamDateTime(exam) - Date.now())}
          </div>
        </div>

        <div class="exam-card__progress">
          <div class="exam-card__progress-bar">
            <div class="exam-card__progress-fill" style="width: ${getProgressPercent(exam)}%;" data-progress="${exam.id}"></div>
          </div>
        </div>
      ` : ''}

      <div class="exam-card__meta">
        <span class="exam-card__meta-item">📅 ${dateStr}</span>
        ${exam.time ? `<span class="exam-card__meta-item">⏰ ${exam.time}</span>` : ''}
        ${exam.room ? `<span class="exam-card__meta-item">📍 ${escapeHtml(exam.room)}</span>` : ''}
      </div>

      ${exam.notes ? `<div class="exam-card__notes">💬 ${escapeHtml(exam.notes)}</div>` : ''}
    </div>
  `;
}

function getProgressPercent(exam) {
  const examTime = getExamDateTime(exam);
  const now = Date.now();
  const diff = examTime - now;

  if (diff < 0) return 100;

  const days = diff / (1000 * 60 * 60 * 24);
  const maxDays = 30;

  return Math.max(0, Math.min(100, 100 - (days / maxDays) * 100));
}

/* ============================================
   COUNTDOWN
   ============================================ */

function startCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    document.querySelectorAll('[data-countdown]').forEach(el => {
      const id = el.dataset.countdown;
      const exam = exams.find(e => e.id === id);
      if (!exam) return;

      const diff = getExamDateTime(exam) - Date.now();

      if (diff <= 0) {
        renderExams();
        return;
      }

      el.textContent = formatCountdown(diff);

      const days = diff / (1000 * 60 * 60 * 24);
      el.classList.toggle('urgent', days < 3);
    });

    document.querySelectorAll('[data-progress]').forEach(el => {
      const id = el.dataset.progress;
      const exam = exams.find(e => e.id === id);
      if (!exam) return;

      el.style.width = getProgressPercent(exam) + '%';
    });
  }, 1000);
}

/* ============================================
   LISTENERS
   ============================================ */

function attachCardListeners() {
  document.querySelectorAll('.exam-card__action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const id = btn.dataset.id;

      if (action === 'edit') openEditDialog(id);
      if (action === 'delete') openDeleteDialog(id);
    });
  });
}

/* ============================================
   DIALOGS
   ============================================ */

function openAddDialog() {
  editingId = null;
  examDialogTitle.textContent = i18n.t('exams.addNew') || 'إضافة امتحان';
  examForm.reset();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('examDate').value = tomorrow.toISOString().split('T')[0];
  document.getElementById('examTime').value = '09:00';

  examDialog.showModal();
  setTimeout(() => document.getElementById('examName')?.focus(), 100);
}

function openEditDialog(id) {
  const exam = exams.find(e => e.id === id);
  if (!exam) return;

  editingId = id;
  examDialogTitle.textContent = i18n.t('exams.editTitle') || 'تعديل امتحان';

  document.getElementById('examName').value = exam.name || '';
  document.getElementById('examType').value = exam.type || 'midterm';
  document.getElementById('examRoom').value = exam.room || '';
  document.getElementById('examDate').value = exam.date || '';
  document.getElementById('examTime').value = exam.time || '09:00';
  document.getElementById('examNotes').value = exam.notes || '';

  examDialog.showModal();
  setTimeout(() => document.getElementById('examName')?.focus(), 100);
}

function closeDialog() {
  examDialog.close();
  editingId = null;
  examForm.reset();
}

function handleSaveExam(e) {
  e.preventDefault();

  const examData = {
    name: document.getElementById('examName').value.trim(),
    type: document.getElementById('examType').value,
    room: document.getElementById('examRoom').value.trim(),
    date: document.getElementById('examDate').value,
    time: document.getElementById('examTime').value,
    notes: document.getElementById('examNotes').value.trim()
  };

  if (!examData.name || !examData.date) {
    showToast('❌ اسم المادة والتاريخ مطلوبان', 'error');
    return;
  }

  if (editingId) {
    const index = exams.findIndex(e => e.id === editingId);
    if (index !== -1) {
      exams[index] = { ...exams[index], ...examData };
      showToast('✅ تم تعديل الامتحان', 'success');
    }
  } else {
    exams.push({
      id: generateId(),
      ...examData,
      createdAt: Date.now()
    });
    showToast('✅ تمت إضافة الامتحان', 'success');
  }

  saveExams();
  renderExams();
  closeDialog();
}

function openDeleteDialog(id) {
  deletingId = id;
  deleteDialog.showModal();
}

function handleConfirmDelete() {
  if (!deletingId) return;

  exams = exams.filter(e => e.id !== deletingId);
  saveExams();
  renderExams();
  deleteDialog.close();
  deletingId = null;

  showToast('✅ تم حذف الامتحان', 'success');
}

function generateId() {
  return 'exam_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

/* ============================================
   EVENTS
   ============================================ */

addExamBtn?.addEventListener('click', openAddDialog);
addFirstExamBtn?.addEventListener('click', openAddDialog);
closeDialogBtn?.addEventListener('click', closeDialog);
cancelExamBtn?.addEventListener('click', closeDialog);
examForm?.addEventListener('submit', handleSaveExam);
cancelDeleteBtn?.addEventListener('click', () => deleteDialog.close());
confirmDeleteBtn?.addEventListener('click', handleConfirmDelete);

examSearch?.addEventListener('input', renderExams);
examFilterType?.addEventListener('change', renderExams);
examFilterStatus?.addEventListener('change', renderExams);

examDialog?.addEventListener('close', () => {
  editingId = null;
  examForm.reset();
});

window.addEventListener('languageChanged', () => {
  renderExams();
});

/* ============================================
   INIT
   ============================================ */

function init() {
  loadExams();
  console.log('✅ Exams page initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  setTimeout(init, 100);
}