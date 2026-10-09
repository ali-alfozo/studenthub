/* ============================================
   GPA PAGE — StudentHub
   v4.0 — Semesters + Undo + Clear All + Comparison
   ============================================ */

import { i18n } from '../i18n/i18n.js';
import { storage } from '../utils/storage.js';
import { escapeHtml } from '../utils/html.js';
import { showToast } from '../utils/toast.js';

/* ============================================
   SEMESTERS
   ============================================ */

const SEMESTERS = {
  fall:   { icon: '🍂', label: 'الفصل الأول',  labelEn: 'Fall Semester' },
  spring: { icon: '🌸', label: 'الفصل الثاني', labelEn: 'Spring Semester' },
  summer: { icon: '☀️', label: 'الفصل الصيفي', labelEn: 'Summer Semester' }
};

const DEFAULT_SEMESTER = 'fall';

/* ============================================
   STATE
   ============================================ */

let grades = [];
let editingId = null;
let deletingId = null;
let currentView = 'list';
let currentSemester = 'all';
let lastBackup = null;

/* ============================================
   ELEMENTS
   ============================================ */

const gpaList = document.getElementById('gpaList');
const gpaChart = document.getElementById('gpaChart');
const gpaEmpty = document.getElementById('gpaEmpty');

const gradeDialog = document.getElementById('gradeDialog');
const gradeDialogTitle = document.getElementById('gradeDialogTitle');
const gradeForm = document.getElementById('gradeForm');
const deleteDialog = document.getElementById('deleteDialog');

const addGradeBtn = document.getElementById('addGradeBtn');
const addFirstGradeBtn = document.getElementById('addFirstGradeBtn');
const closeDialogBtn = document.getElementById('closeDialogBtn');
const cancelGradeBtn = document.getElementById('cancelGradeBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

const gradeSearch = document.getElementById('gradeSearch');
const viewList = document.getElementById('viewList');
const viewChart = document.getElementById('viewChart');

const cumulativeValue = document.getElementById('cumulativeValue');
const cumulativeMax = document.getElementById('cumulativeMax');
const cumulativeProgress = document.getElementById('cumulativeProgress');
const cumulativeStatus = document.getElementById('cumulativeStatus');
const cumulativeMeta = document.getElementById('cumulativeMeta');

const semesterValue = document.getElementById('semesterValue');
const semesterMax = document.getElementById('semesterMax');
const semesterProgress = document.getElementById('semesterProgress');
const semesterStatus = document.getElementById('semesterStatus');
const semesterMeta = document.getElementById('semesterMeta');

const semesterFilter = document.getElementById('semesterFilter');

const coursesCount = document.getElementById('coursesCount');
const totalCredits = document.getElementById('totalCredits');
const highestGrade = document.getElementById('highestGrade');
const lowestGrade = document.getElementById('lowestGrade');

const clearAllGradesBtn = document.getElementById('clearAllGradesBtn');
const clearAllDialog = document.getElementById('clearAllDialog');
const clearAllMessage = document.getElementById('clearAllMessage');
const clearAllConfirmInput = document.getElementById('clearAllConfirmInput');
const cancelClearAllBtn = document.getElementById('cancelClearAllBtn');
const confirmClearAllBtn = document.getElementById('confirmClearAllBtn');

// 🆕 Comparison
const gpaComparison = document.getElementById('gpaComparison');
const semesterLineChart = document.getElementById('semesterLineChart');
const semesterStats = document.getElementById('semesterStats');
const comparisonSummary = document.getElementById('comparisonSummary');

/* ============================================
   GET GPA SYSTEM
   ============================================ */

function getGpaSystem() {
  return localStorage.getItem('gpaSystem') || '100';
}

function getMaxGrade() {
  const system = getGpaSystem();
  return system === '4' ? 4 : 100;
}

/* ============================================
   LOAD / SAVE
   ============================================ */

function loadGrades() {
  grades = storage.get('grades', []);
  render();
}

function saveGrades() {
  storage.set('grades', grades);
  // ✅ إشعار الصفحات الأخرى (Dashboard + AI)
  window.dispatchEvent(new CustomEvent('studentDataChanged'));
}

/* ============================================
   SEMESTER HELPERS
   ============================================ */

function getCurrentSemesterGrades() {
  if (currentSemester === 'all') return grades;
  return grades.filter(g => (g.semester || DEFAULT_SEMESTER) === currentSemester);
}

/* ============================================
   CALCULATE GPA
   ============================================ */

function calculateGpaForList(list) {
  if (!list || list.length === 0) return 0;

  const allHaveCredits = list.every(g => {
    const c = parseFloat(g.credits);
    return !isNaN(c) && c > 0;
  });

  const noneHaveCredits = list.every(g => {
    const c = parseFloat(g.credits);
    return isNaN(c) || c <= 0;
  });

  if (allHaveCredits) {
    let totalPoints = 0;
    let totalCredits = 0;
    list.forEach(grade => {
      const credits = parseFloat(grade.credits) || 0;
      const value = parseFloat(grade.value) || 0;
      totalPoints += value * credits;
      totalCredits += credits;
    });
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }

  if (noneHaveCredits) {
    const total = list.reduce((sum, g) => sum + (parseFloat(g.value) || 0), 0);
    return total / list.length;
  }

  const total = list.reduce((sum, g) => sum + (parseFloat(g.value) || 0), 0);
  return total / list.length;
}

function calculateCumulativeGpa() {
  return calculateGpaForList(grades);
}

function calculateSemesterGpa(semester) {
  if (!semester || semester === 'all') {
    return calculateCumulativeGpa();
  }
  const filtered = grades.filter(g => (g.semester || DEFAULT_SEMESTER) === semester);
  return calculateGpaForList(filtered);
}

/* ============================================
   GRADE LETTER
   ============================================ */

function getGradeLetter(value, system = getGpaSystem()) {
  if (system === '100') {
    if (value >= 90) return 'A';
    if (value >= 80) return 'B';
    if (value >= 70) return 'C';
    if (value >= 60) return 'D';
    return 'F';
  } else {
    if (value >= 3.7) return 'A';
    if (value >= 3.0) return 'B';
    if (value >= 2.0) return 'C';
    if (value >= 1.0) return 'D';
    return 'F';
  }
}

function getGradeClass(value, system = getGpaSystem()) {
  const letter = getGradeLetter(value, system);
  return `grade-${letter.toLowerCase()}`;
}

function getStatusText(gpa, system) {
  if (gpa <= 0) return '';

  if (system === '100') {
    if (gpa >= 90) return '🏆 ممتاز';
    if (gpa >= 80) return '⭐ جيد جداً';
    if (gpa >= 70) return '👍 جيد';
    if (gpa >= 60) return '📚 مقبول';
    return '⚠️ يحتاج تحسين';
  } else {
    if (gpa >= 3.7) return '🏆 ممتاز';
    if (gpa >= 3.0) return '⭐ جيد جداً';
    if (gpa >= 2.0) return '👍 جيد';
    if (gpa >= 1.0) return '📚 مقبول';
    return '⚠️ يحتاج تحسين';
  }
}

/* ============================================
   RENDER — Main
   ============================================ */

function render() {
  updateCumulativeCard();
  updateSemesterCard();
  updateStats();
  renderList();
  renderSemesterComparison();
}

/* ============================================
   UPDATE CARDS
   ============================================ */

function updateCumulativeCard() {
  const system = getGpaSystem();
  const max = getMaxGrade();
  const gpa = calculateCumulativeGpa();
  const percentage = max > 0 ? (gpa / max) * 100 : 0;

  if (cumulativeValue) cumulativeValue.textContent = gpa > 0 ? gpa.toFixed(2) : '—';
  if (cumulativeMax) cumulativeMax.textContent = gpa > 0 ? `/ ${max}` : '';
  if (cumulativeProgress) cumulativeProgress.style.width = Math.min(100, percentage) + '%';
  if (cumulativeStatus) cumulativeStatus.textContent = getStatusText(gpa, system);

  if (cumulativeMeta) {
    const credits = grades.reduce((sum, g) => {
      const c = parseFloat(g.credits);
      return sum + (isNaN(c) ? 0 : c);
    }, 0);
    const isAr = i18n.getLang() === 'ar';
    cumulativeMeta.textContent = isAr
      ? `${grades.length} مادة • ${credits} ساعة`
      : `${grades.length} courses • ${credits} credits`;
  }
}

function updateSemesterCard() {
  const system = getGpaSystem();
  const max = getMaxGrade();
  const semesterGrades = getCurrentSemesterGrades();
  const gpa = calculateSemesterGpa(currentSemester);
  const percentage = max > 0 ? (gpa / max) * 100 : 0;

  if (semesterValue) semesterValue.textContent = gpa > 0 ? gpa.toFixed(2) : '—';
  if (semesterMax) semesterMax.textContent = gpa > 0 ? `/ ${max}` : '';
  if (semesterProgress) semesterProgress.style.width = Math.min(100, percentage) + '%';
  if (semesterStatus) semesterStatus.textContent = getStatusText(gpa, system);

  if (semesterMeta) {
    const credits = semesterGrades.reduce((sum, g) => {
      const c = parseFloat(g.credits);
      return sum + (isNaN(c) ? 0 : c);
    }, 0);
    const isAr = i18n.getLang() === 'ar';

    let label = '';
    if (currentSemester === 'all') {
      label = isAr ? 'كل الفصول' : 'All Semesters';
    } else {
      const sem = SEMESTERS[currentSemester];
      label = isAr ? sem.label : sem.labelEn;
    }

    semesterMeta.textContent = isAr
      ? `${label} • ${semesterGrades.length} مادة • ${credits} ساعة`
      : `${label} • ${semesterGrades.length} courses • ${credits} credits`;
  }
}

function updateStats() {
  const currentGrades = getCurrentSemesterGrades();

  if (coursesCount) coursesCount.textContent = currentGrades.length;

  const total = currentGrades.reduce((sum, g) => {
    const c = parseFloat(g.credits);
    return sum + (isNaN(c) ? 0 : c);
  }, 0);

  if (totalCredits) {
    if (total === 0 && currentGrades.length > 0) {
      totalCredits.textContent = '—';
    } else {
      totalCredits.textContent = total;
    }
  }

  if (highestGrade && lowestGrade) {
    if (currentGrades.length > 0) {
      const values = currentGrades.map(g => parseFloat(g.value) || 0);
      highestGrade.textContent = Math.max(...values).toFixed(1);
      lowestGrade.textContent = Math.min(...values).toFixed(1);
    } else {
      highestGrade.textContent = '—';
      lowestGrade.textContent = '—';
    }
  }
}

/* ============================================
   RENDER LIST
   ============================================ */

function renderList() {
  const query = gradeSearch?.value.trim().toLowerCase() || '';
  const semesterGrades = getCurrentSemesterGrades();

  const filtered = semesterGrades.filter(g =>
    !query || g.name.toLowerCase().includes(query)
  );

  if (semesterGrades.length === 0) {
    if (gpaList) gpaList.style.display = 'none';
    if (gpaChart) gpaChart.style.display = 'none';
    if (gpaEmpty) gpaEmpty.style.display = 'flex';
    return;
  }

  if (gpaEmpty) gpaEmpty.style.display = 'none';

  if (currentView === 'list') {
    if (gpaList) gpaList.style.display = 'flex';
    if (gpaChart) gpaChart.style.display = 'none';

    if (filtered.length === 0) {
      if (gpaList) {
        gpaList.innerHTML = `
          <div class="empty-state">
            <div class="empty-state__icon">🔍</div>
            <h3 class="empty-state__title">${i18n.t('gpa.noResults') || 'لا توجد نتائج'}</h3>
          </div>
        `;
      }
      return;
    }

    if (gpaList) {
      gpaList.innerHTML = filtered.map(g => renderGradeItem(g)).join('');
      attachGradeListeners();
    }
  } else {
    if (gpaList) gpaList.style.display = 'none';
    if (gpaChart) gpaChart.style.display = 'block';
    renderChart();
  }
}

/* ============================================
   RENDER GRADE ITEM
   ============================================ */

function renderGradeItem(grade) {
  const value = parseFloat(grade.value) || 0;
  const letter = getGradeLetter(value);
  const gradeClass = getGradeClass(value);

  const credits = parseFloat(grade.credits);
  const hasCredits = !isNaN(credits) && credits > 0;

  const semester = grade.semester || DEFAULT_SEMESTER;
  const semInfo = SEMESTERS[semester];
  const isAr = i18n.getLang() === 'ar';

  return `
    <div class="grade-item" data-id="${grade.id}">
      <div class="grade-item__icon">${grade.name.charAt(0).toUpperCase()}</div>
      <div class="grade-item__info">
        <div class="grade-item__name">${escapeHtml(grade.name)}</div>
        <div class="grade-item__credits">
          ${hasCredits ? `${credits} ${i18n.t('gpa.creditsLabel') || 'ساعات'}` : i18n.t('gpa.noCredits') || 'بدون ساعات'}
          ${semInfo ? ` • ${semInfo.icon} ${isAr ? semInfo.label : semInfo.labelEn}` : ''}
        </div>
      </div>
      <div class="grade-item__value ${gradeClass}">${value.toFixed(1)}</div>
      <div class="grade-item__letter">${letter}</div>
      <div class="grade-item__actions">
        <button class="grade-item__action edit" data-action="edit" data-id="${grade.id}" title="${i18n.t('common.edit') || 'تعديل'}">✏️</button>
        <button class="grade-item__action delete" data-action="delete" data-id="${grade.id}" title="${i18n.t('common.delete') || 'حذف'}">🗑️</button>
      </div>
    </div>
  `;
}

/* ============================================
   RENDER CHART
   ============================================ */

function renderChart() {
  const wrapper = document.querySelector('.gpa-chart-wrapper');
  if (!wrapper) return;

  const currentGrades = getCurrentSemesterGrades();

  if (currentGrades.length === 0) {
    wrapper.innerHTML = `
      <div class="gpa-chart-empty" style="grid-column: 1/-1;">
        <div class="gpa-chart-empty__icon">📊</div>
        <p>${i18n.t('gpa.noDataForChart') || 'لا توجد بيانات للعرض'}</p>
      </div>
    `;
    return;
  }

  const max = getMaxGrade();
  const gpa = calculateSemesterGpa(currentSemester);

  renderDonut(gpa, max);
  renderChartSummary(gpa, max);
  renderTopBottom();
}

function renderDonut(gpa, max) {
  const donut = document.getElementById('donutProgress');
  const valueEl = document.getElementById('donutValue');
  if (!donut || !valueEl) return;

  const circumference = 502.65;
  const percentage = max > 0 ? Math.min(gpa / max, 1) : 0;
  const offset = circumference * (1 - percentage);

  donut.style.strokeDasharray = circumference;
  donut.style.strokeDashoffset = offset;

  valueEl.textContent = gpa > 0 ? gpa.toFixed(2) : '—';
}

function renderChartSummary(gpa, max) {
  const targetEl = document.getElementById('chartTarget');
  const diffEl = document.getElementById('chartDiff');
  if (!targetEl || !diffEl) return;

  const targetInput = document.getElementById('targetGpa');
  const target = parseFloat(targetInput?.value) || 85;
  targetEl.textContent = target.toFixed(2);

  const diff = gpa - target;
  const diffText = (diff >= 0 ? '+' : '') + diff.toFixed(2);

  diffEl.textContent = diffText;
  diffEl.classList.remove('is-positive', 'is-negative');
  diffEl.classList.add(diff >= 0 ? 'is-positive' : 'is-negative');
}

function renderTopBottom() {
  const max = getMaxGrade();
  const currentGrades = getCurrentSemesterGrades();

  const sorted = [...currentGrades].sort((a, b) =>
    (parseFloat(b.value) || 0) - (parseFloat(a.value) || 0)
  );

  const top = sorted.slice(0, 5);
  const bottom = sorted.slice(-3).reverse();

  const topList = document.getElementById('topCoursesList');
  const bottomList = document.getElementById('bottomCoursesList');

  if (topList) topList.innerHTML = top.map(g => renderChartItem(g, max)).join('');
  if (bottomList) bottomList.innerHTML = bottom.map(g => renderChartItem(g, max)).join('');

  document.querySelectorAll('.gpa-chart-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      if (id && typeof openEditDialog === 'function') openEditDialog(id);
    });
  });
}

function renderChartItem(grade, max) {
  const value = parseFloat(grade.value) || 0;
  const percentage = max > 0 ? (value / max) * 100 : 0;

  let gradeClass = 'grade-weak';
  if (value >= 90) gradeClass = 'grade-excellent';
  else if (value >= 80) gradeClass = 'grade-good';
  else if (value >= 70) gradeClass = 'grade-average';

  return `
    <div class="gpa-chart-item" data-id="${grade.id}">
      <div class="gpa-chart-item__info">
        <div class="gpa-chart-item__name" title="${escapeHtml(grade.name)}">
          ${escapeHtml(grade.name)}
        </div>
        <div class="gpa-chart-item__bar-wrapper">
          <div
            class="gpa-chart-item__bar ${gradeClass}"
            style="width: ${percentage}%;"
          ></div>
        </div>
      </div>
      <div class="gpa-chart-item__value ${gradeClass}">
        ${value.toFixed(1)}
      </div>
    </div>
  `;
}

/* ============================================
   🆕 SEMESTER COMPARISON
   ============================================ */

function renderSemesterComparison() {
  if (!gpaComparison) return;

  const semestersWithData = getSemestersWithData();

  if (semestersWithData.length < 2) {
    gpaComparison.style.display = 'none';
    return;
  }

  gpaComparison.style.display = 'block';

  renderLineChart(semestersWithData);
  renderSemesterStats(semestersWithData);
  renderComparisonSummary(semestersWithData);
}

function getSemestersWithData() {
  const result = [];
  const semOrder = ['fall', 'spring', 'summer'];

  semOrder.forEach(sem => {
    const filtered = grades.filter(g => (g.semester || DEFAULT_SEMESTER) === sem);
    if (filtered.length > 0) {
      const gpa = calculateGpaForList(filtered);
      const credits = filtered.reduce((sum, g) => {
        const c = parseFloat(g.credits);
        return sum + (isNaN(c) ? 0 : c);
      }, 0);

      result.push({
        key: sem,
        info: SEMESTERS[sem],
        gpa: gpa,
        count: filtered.length,
        credits: credits
      });
    }
  });

  return result;
}

/* ---------- Line Chart ---------- */
function renderLineChart(semesters) {
  if (!semesterLineChart) return;

  const max = getMaxGrade();
  const isAr = i18n.getLang() === 'ar';

  const padding = { top: 40, right: 40, bottom: 50, left: 50 };
  const width = 600;
  const height = 240;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const stepX = semesters.length > 1
    ? chartWidth / (semesters.length - 1)
    : 0;

  const points = semesters.map((sem, i) => ({
    x: padding.left + (i * stepX),
    y: padding.top + chartHeight - ((sem.gpa / max) * chartHeight),
    ...sem
  }));

  const linePath = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  const gridLines = [];
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartHeight / 4) * i;
    const value = Math.round(max - (max / 4) * i);
    gridLines.push(`
      <line class="chart-grid-line" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" />
      <text class="chart-axis-label" x="${padding.left - 10}" y="${y + 4}" text-anchor="end">${value}</text>
    `);
  }

  const pointsHTML = points.map(p => `
    <g>
      <text class="chart-point-icon" x="${p.x}" y="${p.y - 20}">${p.info.icon}</text>
      <circle
        class="chart-point"
        cx="${p.x}"
        cy="${p.y}"
        r="6"
        stroke="${p.info.icon === '🍂' ? '#f59e0b' : p.info.icon === '🌸' ? '#10b981' : '#3b82f6'}"
        data-semester="${p.key}"
        data-gpa="${p.gpa.toFixed(2)}"
      />
      <text class="chart-point-value" x="${p.x}" y="${p.y - 30}" style="display: none;">${p.gpa.toFixed(2)}</text>
      <text class="chart-axis-label" x="${p.x}" y="${height - 10}" text-anchor="middle">${isAr ? p.info.label : p.info.labelEn}</text>
    </g>
  `).join('');

  const svg = `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#a78bfa" />
          <stop offset="100%" stop-color="#8b5cf6" />
        </linearGradient>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0" />
        </linearGradient>
      </defs>

      ${gridLines.join('')}

      <path class="chart-area" d="${areaPath}" />
      <path class="chart-line" d="${linePath}" />

      ${pointsHTML}
    </svg>
  `;

  semesterLineChart.innerHTML = svg;

  setTimeout(() => {
    semesterLineChart.querySelectorAll('.chart-point').forEach(point => {
      point.addEventListener('mouseenter', () => {
        const group = point.closest('g');
        const valueText = group.querySelector('.chart-point-value');
        if (valueText) valueText.style.display = 'block';
        point.setAttribute('r', '8');
      });
      point.addEventListener('mouseleave', () => {
        const group = point.closest('g');
        const valueText = group.querySelector('.chart-point-value');
        if (valueText) valueText.style.display = 'none';
        point.setAttribute('r', '6');
      });
    });
  }, 50);
}

/* ---------- Semester Stats ---------- */
function renderSemesterStats(semesters) {
  if (!semesterStats) return;

  const bestGpa = Math.max(...semesters.map(s => s.gpa));
  const isAr = i18n.getLang() === 'ar';

  semesterStats.innerHTML = semesters.map(sem => {
    const isBest = sem.gpa === bestGpa;
    const label = isAr ? sem.info.label : sem.info.labelEn;

    return `
      <div class="gpa__semester-stat ${isBest ? 'gpa__semester-stat--best' : ''}">
        <div class="gpa__semester-stat__icon">${sem.info.icon}</div>
        <div class="gpa__semester-stat__label">${label}</div>
        <div class="gpa__semester-stat__value">${sem.gpa.toFixed(2)}</div>
        <div class="gpa__semester-stat__meta">
          ${sem.count} ${isAr ? 'مادة' : 'courses'} • ${sem.credits} ${isAr ? 'ساعة' : 'credits'}
        </div>
      </div>
    `;
  }).join('');
}

/* ---------- Comparison Summary ---------- */
function renderComparisonSummary(semesters) {
  if (!comparisonSummary) return;

  if (semesters.length < 2) {
    comparisonSummary.innerHTML = '';
    return;
  }

  const isAr = i18n.getLang() === 'ar';
  const first = semesters[0];
  const last = semesters[semesters.length - 1];
  const diff = last.gpa - first.gpa;
  const best = semesters.reduce((max, s) => s.gpa > max.gpa ? s : max, semesters[0]);
  const worst = semesters.reduce((min, s) => s.gpa < min.gpa ? s : min, semesters[0]);

  const diffClass = diff >= 0 ? 'positive' : 'negative';
  const diffText = (diff >= 0 ? '+' : '') + diff.toFixed(2);

  const improvementLabel = isAr ? '📈 التحسّن' : '📈 Improvement';
  const bestLabel = isAr ? '🏆 أفضل فصل' : '🏆 Best Semester';
  const worstLabel = isAr ? '⚠️ أضعف فصل' : '⚠️ Weakest Semester';

  const fromText = isAr
    ? `من ${first.info.label} إلى ${last.info.label}`
    : `From ${first.info.labelEn} to ${last.info.labelEn}`;

  const bestText = `${best.info.icon} ${isAr ? best.info.label : best.info.labelEn} (${best.gpa.toFixed(2)})`;
  const worstText = `${worst.info.icon} ${isAr ? worst.info.label : worst.info.labelEn} (${worst.gpa.toFixed(2)})`;

  comparisonSummary.innerHTML = `
    <div class="gpa__comparison-summary__item">
      <span class="gpa__comparison-summary__label">${improvementLabel}:</span>
      <span class="gpa__comparison-summary__value gpa__comparison-summary__value--${diffClass}">
        ${diffText}
      </span>
      <span style="color: var(--text-secondary); font-weight: 500; font-size: var(--text-xs); margin-inline-start: auto;">
        ${fromText}
      </span>
    </div>
    <div class="gpa__comparison-summary__item">
      <span class="gpa__comparison-summary__label">${bestLabel}:</span>
      <span class="gpa__comparison-summary__value">${bestText}</span>
    </div>
    <div class="gpa__comparison-summary__item">
      <span class="gpa__comparison-summary__label">${worstLabel}:</span>
      <span class="gpa__comparison-summary__value">${worstText}</span>
    </div>
  `;
}

/* ============================================
   ATTACH LISTENERS
   ============================================ */

function attachGradeListeners() {
  document.querySelectorAll('.grade-item__action').forEach(btn => {
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
   ADD / EDIT DIALOG
   ============================================ */

function openAddDialog() {
  editingId = null;
  if (gradeDialogTitle) gradeDialogTitle.textContent = i18n.t('gpa.addNew') || 'إضافة علامة';
  gradeForm?.reset();

  const max = getMaxGrade();
  const hint = document.getElementById('gradeMaxHint');
  if (hint) hint.textContent = `${i18n.t('gpa.max') || 'الحد الأقصى'}: ${max}`;

  const valueInput = document.getElementById('gradeValue');
  if (valueInput) valueInput.max = max;

  const defaultSemester = document.querySelector(`input[name="gradeSemester"][value="${DEFAULT_SEMESTER}"]`);
  if (defaultSemester) defaultSemester.checked = true;

  gradeDialog?.showModal();
  setTimeout(() => document.getElementById('gradeName')?.focus(), 100);
}

function openEditDialog(id) {
  const grade = grades.find(g => g.id === id);
  if (!grade) return;

  editingId = id;
  if (gradeDialogTitle) gradeDialogTitle.textContent = i18n.t('gpa.editTitle') || 'تعديل علامة';

  const nameInput = document.getElementById('gradeName');
  const valueInput = document.getElementById('gradeValue');
  const creditsInput = document.getElementById('gradeCredits');

  if (nameInput) nameInput.value = grade.name || '';
  if (valueInput) valueInput.value = grade.value || '';

  const credits = parseFloat(grade.credits);
  if (creditsInput) {
    creditsInput.value = (!isNaN(credits) && credits > 0) ? credits : '';
  }

  const gradeSemester = grade.semester || DEFAULT_SEMESTER;
  const semesterRadio = document.querySelector(`input[name="gradeSemester"][value="${gradeSemester}"]`);
  if (semesterRadio) semesterRadio.checked = true;

  const max = getMaxGrade();
  const hint = document.getElementById('gradeMaxHint');
  if (hint) hint.textContent = `${i18n.t('gpa.max') || 'الحد الأقصى'}: ${max}`;
  if (valueInput) valueInput.max = max;

  gradeDialog?.showModal();
  setTimeout(() => document.getElementById('gradeName')?.focus(), 100);
}

function closeDialog() {
  gradeDialog?.close();
  editingId = null;
  gradeForm?.reset();
}

/* ============================================
   SAVE GRADE
   ============================================ */

function handleSaveGrade(e) {
  e.preventDefault();

  const max = getMaxGrade();
  const valueInput = document.getElementById('gradeValue');
  const creditsInput = document.getElementById('gradeCredits');
  const nameInput = document.getElementById('gradeName');

  const value = parseFloat(valueInput?.value);
  const creditsRaw = creditsInput?.value.trim() || '';

  if (isNaN(value) || value < 0 || value > max) {
    showToast(`❌ العلامة يجب أن تكون بين 0 و ${max}`, 'error');
    return;
  }

  let credits = null;
  if (creditsRaw !== '') {
    const c = parseInt(creditsRaw);
    if (!isNaN(c) && c > 0) credits = c;
  }

  const semesterRadio = document.querySelector('input[name="gradeSemester"]:checked');
  const semester = semesterRadio ? semesterRadio.value : DEFAULT_SEMESTER;

  const gradeData = {
    name: nameInput?.value.trim() || '',
    value: value,
    credits: credits,
    semester: semester
  };

  if (!gradeData.name) {
    showToast('❌ اسم المادة مطلوب', 'error');
    return;
  }

  if (editingId) {
    const index = grades.findIndex(g => g.id === editingId);
    if (index !== -1) {
      grades[index] = { ...grades[index], ...gradeData };
      showToast('✅ تم تعديل العلامة', 'success');
    }
  } else {
    const newGrade = {
      id: generateId(),
      ...gradeData,
      createdAt: Date.now()
    };
    grades.push(newGrade);
    showToast('✅ تمت إضافة العلامة', 'success');
  }

  saveGrades();
  render();

  if (currentView === 'chart') renderChart();

  closeDialog();
}

/* ============================================
   DELETE ONE
   ============================================ */

function openDeleteDialog(id) {
  deletingId = id;
  deleteDialog?.showModal();
}

function handleConfirmDelete() {
  if (!deletingId) return;

  grades = grades.filter(g => g.id !== deletingId);
  saveGrades();
  render();

  if (currentView === 'chart') renderChart();

  deleteDialog?.close();
  deletingId = null;

  showToast('✅ تم حذف العلامة', 'success');
}

/* ============================================
   CLEAR ALL — with Undo
   ============================================ */

function openClearAllDialog() {
  if (grades.length === 0) {
    showToast('⚠️ لا توجد علامات لحذفها', 'error');
    return;
  }

  if (clearAllMessage) {
    const count = grades.length;
    const isAr = i18n.getLang() === 'ar';
    clearAllMessage.textContent = isAr
      ? `سيتم حذف ${count} ${count === 1 ? 'علامة' : 'علامات'}. يمكنك التراجع خلال 7 ثواني.`
      : `This will delete ${count} grade${count === 1 ? '' : 's'}. You can undo within 7 seconds.`;
  }

  if (clearAllConfirmInput) clearAllConfirmInput.value = '';
  if (confirmClearAllBtn) confirmClearAllBtn.disabled = true;

  clearAllDialog?.showModal();
  setTimeout(() => clearAllConfirmInput?.focus(), 100);
}

function closeClearAllDialog() {
  clearAllDialog?.close();
  if (clearAllConfirmInput) clearAllConfirmInput.value = '';
  if (confirmClearAllBtn) confirmClearAllBtn.disabled = true;
}

function handleConfirmClearAll() {
  if (!clearAllConfirmInput || clearAllConfirmInput.value !== 'DELETE') return;

  lastBackup = [...grades];
  const count = lastBackup.length;

  grades = [];
  saveGrades();
  render();

  if (currentView === 'chart') renderChart();

  closeClearAllDialog();

  const isAr = i18n.getLang() === 'ar';
  const msg = isAr
    ? `🗑️ تم حذف ${count} ${count === 1 ? 'علامة' : 'علامات'}`
    : `🗑️ Deleted ${count} grade${count === 1 ? '' : 's'}`;
  const undoLabel = isAr ? '↶ تراجع' : '↶ Undo';
  const restoredMsg = isAr ? '✅ تم استرجاع العلامات' : '✅ Grades restored';

  showToast(msg, 'success', {
    duration: 7000,
    action: undoLabel,
    onAction: () => {
      if (!lastBackup) return;

      grades = lastBackup;
      saveGrades();
      render();

      if (currentView === 'chart') renderChart();

      lastBackup = null;
      showToast(restoredMsg, 'success');
    }
  });
}

/* ============================================
   GENERATE ID
   ============================================ */

function generateId() {
  return 'grade_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

/* ============================================
   WHAT-IF
   ============================================ */

function calculateWhatIf() {
  const targetInput = document.getElementById('targetGpa');
  const remainingInput = document.getElementById('remainingCredits');
  const resultEl = document.getElementById('whatIfResult');

  const targetGpa = parseFloat(targetInput?.value);
  const remainingCount = parseInt(remainingInput?.value);

  if (isNaN(targetGpa) || isNaN(remainingCount) || remainingCount <= 0) {
    showToast('❌ أدخل قيم صحيحة', 'error');
    return;
  }

  const currentGpa = calculateCumulativeGpa();

  if (grades.length === 0) {
    if (resultEl) {
      resultEl.textContent = '⚠️ أضف علامات أولاً';
      resultEl.style.display = 'block';
    }
    return;
  }

  const currentCount = grades.length;
  const needed = ((targetGpa * (currentCount + remainingCount)) - (currentGpa * currentCount)) / remainingCount;
  const max = getMaxGrade();

  if (resultEl) {
    if (needed > max) {
      resultEl.textContent = `❌ مستحيل! تحتاج ${needed.toFixed(2)} لكن الحد الأقصى ${max}`;
    } else if (needed < 0) {
      resultEl.textContent = `✅ أنت بالفعل فوق الهدف! حافظ على مستواك`;
    } else {
      resultEl.textContent = `🎯 تحتاج معدل ${needed.toFixed(2)} في ${remainingCount} مادة للوصول إلى ${targetGpa}`;
    }
    resultEl.style.display = 'block';
  }

  if (currentView === 'chart') renderChart();
}

/* ============================================
   EVENT LISTENERS
   ============================================ */

addGradeBtn?.addEventListener('click', openAddDialog);
addFirstGradeBtn?.addEventListener('click', openAddDialog);
closeDialogBtn?.addEventListener('click', closeDialog);
cancelGradeBtn?.addEventListener('click', closeDialog);
gradeForm?.addEventListener('submit', handleSaveGrade);

cancelDeleteBtn?.addEventListener('click', () => deleteDialog?.close());
confirmDeleteBtn?.addEventListener('click', handleConfirmDelete);

clearAllGradesBtn?.addEventListener('click', openClearAllDialog);
cancelClearAllBtn?.addEventListener('click', closeClearAllDialog);
confirmClearAllBtn?.addEventListener('click', handleConfirmClearAll);

clearAllConfirmInput?.addEventListener('input', (e) => {
  if (confirmClearAllBtn) {
    confirmClearAllBtn.disabled = e.target.value !== 'DELETE';
  }
});

clearAllConfirmInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && clearAllConfirmInput.value === 'DELETE') {
    handleConfirmClearAll();
  }
});

clearAllDialog?.addEventListener('close', () => {
  if (clearAllConfirmInput) clearAllConfirmInput.value = '';
  if (confirmClearAllBtn) confirmClearAllBtn.disabled = true;
});

semesterFilter?.addEventListener('change', (e) => {
  currentSemester = e.target.value;
  render();
  if (currentView === 'chart') renderChart();
});

gradeSearch?.addEventListener('input', renderList);

viewList?.addEventListener('click', () => {
  currentView = 'list';
  viewList.classList.add('active');
  viewChart?.classList.remove('active');
  renderList();
});

viewChart?.addEventListener('click', () => {
  currentView = 'chart';
  viewChart.classList.add('active');
  viewList?.classList.remove('active');
  renderList();
});

document.getElementById('calculateWhatIf')?.addEventListener('click', calculateWhatIf);

document.getElementById('targetGpa')?.addEventListener('input', () => {
  if (currentView === 'chart') renderChart();
});

gradeDialog?.addEventListener('close', () => {
  editingId = null;
  gradeForm?.reset();
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
    if (lastBackup && grades.length === 0) {
      e.preventDefault();
      grades = lastBackup;
      saveGrades();
      render();
      if (currentView === 'chart') renderChart();

      const isAr = i18n.getLang() === 'ar';
      showToast(
        isAr ? '✅ تم استرجاع العلامات' : '✅ Grades restored',
        'success'
      );

      lastBackup = null;
    }
  }
});

window.addEventListener('languageChanged', () => {
  render();
  if (currentView === 'chart') renderChart();
});

/* ============================================
   INIT
   ============================================ */

function init() {
  loadGrades();
  console.log('✅ GPA page initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  setTimeout(init, 100);
}