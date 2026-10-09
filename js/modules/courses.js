/* ============================================
   COURSES PAGE
   ============================================ */

import { i18n } from '../i18n/i18n.js';
import { storage } from '../utils/storage.js';
import { escapeHtml } from '../utils/html.js';
import { showToast } from '../utils/toast.js';

/* ============================================
   STATE
   ============================================ */

let courses = [];
let editingId = null;
let deletingId = null;
let selectedColor = '#6366f1';

/* ============================================
   ELEMENTS
   ============================================ */

const coursesGrid = document.getElementById('coursesGrid');
const coursesEmpty = document.getElementById('coursesEmpty');
const courseDialog = document.getElementById('courseDialog');
const courseDialogTitle = document.getElementById('courseDialogTitle');
const courseForm = document.getElementById('courseForm');
const deleteDialog = document.getElementById('deleteDialog');

const addCourseBtn = document.getElementById('addCourseBtn');
const addFirstCourseBtn = document.getElementById('addFirstCourseBtn');
const closeDialogBtn = document.getElementById('closeDialogBtn');
const cancelCourseBtn = document.getElementById('cancelCourseBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

const courseSearch = document.getElementById('courseSearch');
const courseFilterDay = document.getElementById('courseFilterDay');

/* ============================================
   LOAD COURSES
   ============================================ */

function loadCourses() {
  courses = storage.get('courses', []);
  renderCourses();
}

/* ============================================
   SAVE COURSES
   ============================================ */

function saveCourses() {
  storage.set('courses', courses);
  // ✅ إشعار الصفحات الأخرى (Dashboard + AI)
  window.dispatchEvent(new CustomEvent('studentDataChanged'));
}

/* ============================================
   RENDER COURSES
   ============================================ */

function renderCourses() {
  const query = courseSearch?.value.trim().toLowerCase() || '';
  const filterDay = courseFilterDay?.value || '';

  let filtered = courses.filter(course => {
    const matchesSearch = !query
      || course.name.toLowerCase().includes(query)
      || (course.professor || '').toLowerCase().includes(query);

    const matchesDay = !filterDay || String(course.day) === filterDay;

    return matchesSearch && matchesDay;
  });

  if (courses.length === 0) {
    coursesGrid.innerHTML = '';
    coursesGrid.style.display = 'none';
    coursesEmpty.style.display = 'flex';
    return;
  }

  coursesGrid.style.display = 'grid';
  coursesEmpty.style.display = 'none';

  if (filtered.length === 0) {
    coursesGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">🔍</div>
        <h3 class="empty-state__title">${i18n.t('courses.noResults') || 'لا توجد نتائج'}</h3>
        <p class="empty-state__text">${i18n.t('courses.noResultsText') || 'جرب بحث مختلف'}</p>
      </div>
    `;
    return;
  }

  filtered.sort((a, b) => (a.day || 0) - (b.day || 0));

  coursesGrid.innerHTML = filtered.map(course => renderCourseCard(course)).join('');

  attachCardListeners();
}

/* ============================================
   RENDER COURSE CARD
   ============================================ */

function renderCourseCard(course) {
  const dayNames = [
    i18n.t('days.sunday'),
    i18n.t('days.monday'),
    i18n.t('days.tuesday'),
    i18n.t('days.wednesday'),
    i18n.t('days.thursday'),
    i18n.t('days.friday'),
    i18n.t('days.saturday')
  ];

  const dayName = dayNames[course.day] || '';

  return `
    <div class="course-card" style="--course-color: ${course.color || '#6366f1'};" data-id="${course.id}">
      
      <div class="course-card__header">
        <div class="course-card__icon">📚</div>
        <div class="course-card__actions">
          <button class="course-card__action edit" data-action="edit" data-id="${course.id}" title="${i18n.t('common.edit')}">✏️</button>
          <button class="course-card__action delete" data-action="delete" data-id="${course.id}" title="${i18n.t('common.delete')}">🗑️</button>
        </div>
      </div>
      
      <div class="course-card__body">
        <h3 class="course-card__name">${escapeHtml(course.name)}</h3>
        ${course.professor ? `<div class="course-card__professor">👨‍🏫 ${escapeHtml(course.professor)}</div>` : ''}
      </div>
      
      <div class="course-card__meta">
        ${course.credits ? `<span class="course-card__meta-item">📊 <span class="course-card__credits">${course.credits}</span> ${i18n.t('courses.creditsLabel') || 'ساعات'}</span>` : ''}
        ${dayName ? `<span class="course-card__meta-item">📅 ${dayName}</span>` : ''}
        ${course.time ? `<span class="course-card__meta-item">⏰ ${course.time}</span>` : ''}
        ${course.room ? `<span class="course-card__meta-item">📍 ${escapeHtml(course.room)}</span>` : ''}
      </div>
      
      ${course.notes ? `<div class="course-card__notes">💬 ${escapeHtml(course.notes)}</div>` : ''}
      
    </div>
  `;
}

/* ============================================
   ATTACH CARD LISTENERS
   ============================================ */

function attachCardListeners() {
  document.querySelectorAll('.course-card__action').forEach(btn => {
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
   OPEN ADD DIALOG
   ============================================ */

function openAddDialog() {
  editingId = null;
  courseDialogTitle.textContent = i18n.t('courses.addNew') || 'إضافة مادة';
  courseForm.reset();
  selectedColor = '#6366f1';
  updateColorSelection();
  courseDialog.showModal();
  setTimeout(() => document.getElementById('courseName')?.focus(), 100);
}

/* ============================================
   OPEN EDIT DIALOG
   ============================================ */

function openEditDialog(id) {
  const course = courses.find(c => c.id === id);
  if (!course) return;

  editingId = id;
  courseDialogTitle.textContent = i18n.t('courses.editTitle') || 'تعديل مادة';

  document.getElementById('courseName').value = course.name || '';
  document.getElementById('courseProfessor').value = course.professor || '';
  document.getElementById('courseCredits').value = course.credits || 3;
  document.getElementById('courseDay').value = course.day ?? 0;
  document.getElementById('courseTime').value = course.time || '09:00';
  document.getElementById('courseRoom').value = course.room || '';
  document.getElementById('courseNotes').value = course.notes || '';

  selectedColor = course.color || '#6366f1';
  updateColorSelection();

  courseDialog.showModal();
  setTimeout(() => document.getElementById('courseName')?.focus(), 100);
}

/* ============================================
   CLOSE DIALOG
   ============================================ */

function closeDialog() {
  courseDialog.close();
  editingId = null;
  courseForm.reset();
}

/* ============================================
   SAVE COURSE
   ============================================ */

function handleSaveCourse(e) {
  e.preventDefault();

  const courseData = {
    name: document.getElementById('courseName').value.trim(),
    professor: document.getElementById('courseProfessor').value.trim(),
    credits: parseInt(document.getElementById('courseCredits').value) || 3,
    day: parseInt(document.getElementById('courseDay').value) || 0,
    time: document.getElementById('courseTime').value,
    room: document.getElementById('courseRoom').value.trim(),
    notes: document.getElementById('courseNotes').value.trim(),
    color: selectedColor
  };

  if (!courseData.name) {
    showToast('❌ اسم المادة مطلوب', 'error');
    return;
  }

  if (editingId) {
    const index = courses.findIndex(c => c.id === editingId);
    if (index !== -1) {
      courses[index] = { ...courses[index], ...courseData };
      showToast('✅ تم تعديل المادة', 'success');
    }
  } else {
    const newCourse = {
      id: generateId(),
      ...courseData,
      createdAt: Date.now()
    };
    courses.push(newCourse);
    showToast('✅ تمت إضافة المادة', 'success');
  }

  saveCourses();
  renderCourses();
  closeDialog();
}

/* ============================================
   OPEN DELETE DIALOG
   ============================================ */

function openDeleteDialog(id) {
  deletingId = id;
  deleteDialog.showModal();
}

/* ============================================
   CONFIRM DELETE
   ============================================ */

function handleConfirmDelete() {
  if (!deletingId) return;

  courses = courses.filter(c => c.id !== deletingId);
  saveCourses();
  renderCourses();
  deleteDialog.close();
  deletingId = null;

  showToast('✅ تم حذف المادة', 'success');
}

/* ============================================
   GENERATE ID
   ============================================ */

function generateId() {
  return 'course_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

/* ============================================
   COLOR SELECTION
   ============================================ */

function updateColorSelection() {
  document.querySelectorAll('.courses__color').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === selectedColor);
  });
}

/* ============================================
   EVENT LISTENERS
   ============================================ */

addCourseBtn?.addEventListener('click', openAddDialog);
addFirstCourseBtn?.addEventListener('click', openAddDialog);
closeDialogBtn?.addEventListener('click', closeDialog);
cancelCourseBtn?.addEventListener('click', closeDialog);
courseForm?.addEventListener('submit', handleSaveCourse);
cancelDeleteBtn?.addEventListener('click', () => deleteDialog.close());
confirmDeleteBtn?.addEventListener('click', handleConfirmDelete);

// Search & Filter
courseSearch?.addEventListener('input', renderCourses);
courseFilterDay?.addEventListener('change', renderCourses);

// Color Selection
document.querySelectorAll('.courses__color').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedColor = btn.dataset.color;
    updateColorSelection();
  });
});

// Close dialog on ESC
courseDialog?.addEventListener('close', () => {
  editingId = null;
  courseForm.reset();
});

// Language change
window.addEventListener('languageChanged', () => {
  renderCourses();
});

/* ============================================
   INITIALIZE
   ============================================ */

function init() {
  loadCourses();
  console.log('✅ Courses page initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  setTimeout(init, 100);
}