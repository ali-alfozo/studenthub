/* ============================================
   NOTES PAGE
   ============================================ */

import { i18n } from '../i18n/i18n.js';
import { storage } from '../utils/storage.js';
import { escapeHtml } from '../utils/html.js';
import { showToast } from '../utils/toast.js';

/* ============================================
   STATE
   ============================================ */

let notes = [];
let courses = [];
let editingId = null;
let deletingId = null;
let selectedColor = '#fef3c7';

/* ============================================
   ELEMENTS
   ============================================ */

const notesGrid = document.getElementById('notesGrid');
const notesEmpty = document.getElementById('notesEmpty');
const noteDialog = document.getElementById('noteDialog');
const noteDialogTitle = document.getElementById('noteDialogTitle');
const noteForm = document.getElementById('noteForm');
const deleteDialog = document.getElementById('deleteDialog');

const addNoteBtn = document.getElementById('addNoteBtn');
const addFirstNoteBtn = document.getElementById('addFirstNoteBtn');
const closeDialogBtn = document.getElementById('closeDialogBtn');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

const noteSearch = document.getElementById('noteSearch');
const noteFilterPinned = document.getElementById('noteFilterPinned');

/* ============================================
   LOAD
   ============================================ */

function loadData() {
  notes = storage.get('notes', []);
  courses = storage.get('courses', []);
  render();
  populateCourses();
}

/* ============================================
   POPULATE COURSES DROPDOWN
   ============================================ */

function populateCourses() {
  const select = document.getElementById('noteCourse');
  if (!select) return;

  // احفظ الاختيار الحالي
  const currentValue = select.value;

  // امسح الخيارات (ما عدا الأول)
  select.innerHTML = `<option value="" data-i18n="notes.fields.noCourse">${i18n.t('notes.fields.noCourse') || 'بدون مادة'}</option>`;

  // أضف المواد
  courses.forEach(course => {
    const option = document.createElement('option');
    option.value = course.name;
    option.textContent = course.name;
    select.appendChild(option);
  });

  // رجّع الاختيار
  if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) {
    select.value = currentValue;
  }
}

/* ============================================
   SAVE
   ============================================ */

function saveNotes() {
  storage.set('notes', notes);
  // ✅ إشعار الصفحات الأخرى (Dashboard + AI)
  window.dispatchEvent(new CustomEvent('studentDataChanged'));
}

/* ============================================
   RENDER
   ============================================ */

function render() {
  const query = noteSearch?.value.trim().toLowerCase() || '';
  const filterPinned = noteFilterPinned?.value || 'all';

  let filtered = notes.filter(note => {
    const matchesSearch = !query
      || note.title.toLowerCase().includes(query)
      || (note.content || '').toLowerCase().includes(query)
      || (note.tags || '').toLowerCase().includes(query);

    const matchesPinned = filterPinned === 'all' || (filterPinned === 'pinned' && note.pinned);

    return matchesSearch && matchesPinned;
  });

  // Empty State
  if (notes.length === 0) {
    notesGrid.innerHTML = '';
    notesGrid.style.display = 'none';
    notesEmpty.style.display = 'flex';
    return;
  }

  notesGrid.style.display = 'grid';
  notesEmpty.style.display = 'none';

  // No results
  if (filtered.length === 0) {
    notesGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state__icon">🔍</div>
        <h3 class="empty-state__title">${i18n.t('notes.noResults') || 'لا توجد نتائج'}</h3>
        <p class="empty-state__text">${i18n.t('notes.noResultsText') || 'جرب بحث مختلف'}</p>
      </div>
    `;
    return;
  }

  // Sort: pinned first, then by updatedAt (newest first)
  filtered.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt);
  });

  notesGrid.innerHTML = filtered.map(note => renderNoteCard(note)).join('');

  attachCardListeners();
}

/* ============================================
   RENDER NOTE CARD
   ============================================ */

function renderNoteCard(note) {
  const tags = note.tags
    ? note.tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const date = new Date(note.updatedAt || note.createdAt);
  const dateStr = date.toLocaleDateString(
    i18n.getLang() === 'ar' ? 'ar-EG' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  return `
    <div class="note-card ${note.pinned ? 'note-card--pinned' : ''}" 
         style="--note-color: ${note.color || '#fef3c7'};" 
         data-id="${note.id}">
      
      <div class="note-card__header">
        <h3 class="note-card__title">${escapeHtml(note.title)}</h3>
        <div class="note-card__actions">
          <button class="note-card__action pin ${note.pinned ? 'active' : ''}" 
                  data-action="pin" 
                  data-id="${note.id}" 
                  title="${i18n.t('notes.pin') || 'تثبيت'}">
            📌
          </button>
          <button class="note-card__action" 
                  data-action="edit" 
                  data-id="${note.id}" 
                  title="${i18n.t('common.edit')}">
            ✏️
          </button>
          <button class="note-card__action" 
                  data-action="delete" 
                  data-id="${note.id}" 
                  title="${i18n.t('common.delete')}">
            🗑️
          </button>
        </div>
      </div>
      
      ${note.content ? `<div class="note-card__content">${escapeHtml(note.content)}</div>` : ''}
      
      <div class="note-card__footer">
        <div>
          ${note.course ? `<span class="note-card__course">📚 ${escapeHtml(note.course)}</span>` : ''}
          ${tags.length ? `<div class="note-card__tags">${tags.map(t => `<span class="note-card__tag">#${escapeHtml(t)}</span>`).join('')}</div>` : ''}
        </div>
        <div class="note-card__date">${dateStr}</div>
      </div>
      
    </div>
  `;
}

/* ============================================
   ATTACH CARD LISTENERS
   ============================================ */

function attachCardListeners() {
  document.querySelectorAll('.note-card__action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const id = btn.dataset.id;

      if (action === 'edit') openEditDialog(id);
      if (action === 'delete') openDeleteDialog(id);
      if (action === 'pin') togglePin(id);
    });
  });
}

/* ============================================
   TOGGLE PIN
   ============================================ */

function togglePin(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  note.pinned = !note.pinned;
  note.updatedAt = Date.now();
  saveNotes();
  render();

  showToast(note.pinned ? '📌 تم التثبيت' : '📌 تم إلغاء التثبيت', 'success');
}

/* ============================================
   OPEN ADD DIALOG
   ============================================ */

function openAddDialog() {
  editingId = null;
  noteDialogTitle.textContent = i18n.t('notes.addNew') || 'إضافة ملاحظة';
  noteForm.reset();
  selectedColor = '#fef3c7';
  updateColorSelection();
  populateCourses();

  noteDialog.showModal();
  setTimeout(() => document.getElementById('noteTitle')?.focus(), 100);
}

/* ============================================
   OPEN EDIT DIALOG
   ============================================ */

function openEditDialog(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;

  editingId = id;
  noteDialogTitle.textContent = i18n.t('notes.editTitle') || 'تعديل ملاحظة';

  document.getElementById('noteTitle').value = note.title || '';
  document.getElementById('noteContent').value = note.content || '';
  document.getElementById('noteTags').value = note.tags || '';
  document.getElementById('notePinned').checked = !!note.pinned;

  populateCourses();
  document.getElementById('noteCourse').value = note.course || '';

  selectedColor = note.color || '#fef3c7';
  updateColorSelection();

  noteDialog.showModal();
  setTimeout(() => document.getElementById('noteTitle')?.focus(), 100);
}

/* ============================================
   CLOSE DIALOG
   ============================================ */

function closeDialog() {
  noteDialog.close();
  editingId = null;
  noteForm.reset();
}

/* ============================================
   SAVE NOTE
   ============================================ */

function handleSaveNote(e) {
  e.preventDefault();

  const noteData = {
    title: document.getElementById('noteTitle').value.trim(),
    content: document.getElementById('noteContent').value.trim(),
    course: document.getElementById('noteCourse').value,
    tags: document.getElementById('noteTags').value.trim(),
    color: selectedColor,
    pinned: document.getElementById('notePinned').checked
  };

  if (!noteData.title) {
    showToast('❌ العنوان مطلوب', 'error');
    return;
  }

  if (editingId) {
    const index = notes.findIndex(n => n.id === editingId);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...noteData, updatedAt: Date.now() };
      showToast('✅ تم تعديل الملاحظة', 'success');
    }
  } else {
    const newNote = {
      id: generateId(),
      ...noteData,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    notes.push(newNote);
    showToast('✅ تمت إضافة الملاحظة', 'success');
  }

  saveNotes();
  render();
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

  notes = notes.filter(n => n.id !== deletingId);
  saveNotes();
  render();
  deleteDialog.close();
  deletingId = null;

  showToast('✅ تم حذف الملاحظة', 'success');
}

/* ============================================
   GENERATE ID
   ============================================ */

function generateId() {
  return 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

/* ============================================
   COLOR SELECTION
   ============================================ */

function updateColorSelection() {
  document.querySelectorAll('.notes__color').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === selectedColor);
  });
}

/* ============================================
   EVENT LISTENERS
   ============================================ */

addNoteBtn?.addEventListener('click', openAddDialog);
addFirstNoteBtn?.addEventListener('click', openAddDialog);
closeDialogBtn?.addEventListener('click', closeDialog);
cancelNoteBtn?.addEventListener('click', closeDialog);
noteForm?.addEventListener('submit', handleSaveNote);
cancelDeleteBtn?.addEventListener('click', () => deleteDialog.close());
confirmDeleteBtn?.addEventListener('click', handleConfirmDelete);

// Search & Filter
noteSearch?.addEventListener('input', render);
noteFilterPinned?.addEventListener('change', render);

// Color Selection
document.querySelectorAll('.notes__color').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedColor = btn.dataset.color;
    updateColorSelection();
  });
});

// Close dialog on ESC
noteDialog?.addEventListener('close', () => {
  editingId = null;
  noteForm.reset();
});

// Language change
window.addEventListener('languageChanged', () => {
  render();
  populateCourses();
});

// Storage change (courses updated in another tab)
window.addEventListener('storage', (e) => {
  if (e.key === 'courses') {
    courses = storage.get('courses', []);
    populateCourses();
  }
});

/* ============================================
   INITIALIZE
   ============================================ */

function init() {
  loadData();
  console.log('✅ Notes page initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  setTimeout(init, 100);
}