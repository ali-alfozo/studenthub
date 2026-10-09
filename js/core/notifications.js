/* ============================================
   NOTIFICATIONS — Notifications API
   ============================================ */

import { i18n } from '../i18n/i18n.js';

/* ============================================
   STORAGE HELPERS
   ============================================ */

const storage = {
  get(key, fallback = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
};

/* ============================================
   NOTIFICATION STATE
   ============================================ */

// حفظ الإشعارات اللي انعرضت (لتجنب التكرار)
const NOTIFIED_KEY = 'notified_items';

/* ============================================
   CHECK SUPPORT
   ============================================ */

export function isNotificationSupported() {
  return 'Notification' in window;
}

export function getPermissionStatus() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/* ============================================
   REQUEST PERMISSION
   ============================================ */

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    console.warn('⚠️ Notifications API not supported');
    return 'unsupported';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission === 'denied') {
    return 'denied';
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Permission request error:', error);
    return 'denied';
  }
}

/* ============================================
   SHOW NOTIFICATION
   ============================================ */

export function showNotification(title, options = {}) {
  if (!isNotificationSupported()) return null;
  
  if (Notification.permission !== 'granted') {
    console.warn('⚠️ Notification permission not granted');
    return null;
  }
  
  const defaultOptions = {
    icon: 'assets/icons/icon-192.png',
    badge: 'assets/icons/icon-192.png',
    tag: 'studenthub-' + Date.now(),
    requireInteraction: false,
    silent: false,
    ...options
  };
  
  try {
    const notification = new Notification(title, defaultOptions);
    
    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);
    
    // Click handler
    notification.onclick = () => {
      window.focus();
      if (options.url) {
        window.location.href = options.url;
      }
      notification.close();
    };
    
    return notification;
  } catch (error) {
    console.error('Notification error:', error);
    return null;
  }
}

/* ============================================
   CHECK UPCOMING EXAMS
   ============================================ */

export function checkUpcomingExams() {
  const exams = storage.get('exams', []);
  const notifyExams = storage.get('notifyExams', true);
  
  if (!notifyExams || exams.length === 0) return;
  
  const notifyDays = parseInt(storage.get('notifyDaysBefore', '1')) || 1;
  const now = Date.now();
  const notified = storage.get(NOTIFIED_KEY, {});
  
  exams.forEach(exam => {
    if (!exam.date) return;
    
    const examDate = new Date(`${exam.date}T${exam.time || '00:00'}`);
    const diff = examDate.getTime() - now;
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    // Only if exam is in the future and within the notify window
    if (daysLeft > 0 && daysLeft <= notifyDays) {
      const notifyKey = `exam_${exam.id}_${daysLeft}`;
      
      // Don't notify twice
      if (notified[notifyKey]) return;
      
      const title = i18n.getLang() === 'ar' 
        ? `📝 امتحان قريب: ${exam.name}`
        : `📝 Exam Soon: ${exam.name}`;
      
      const body = i18n.getLang() === 'ar'
        ? (daysLeft === 1 
            ? `امتحانك غداً! ${exam.time || ''}`
            : `امتحانك بعد ${daysLeft} أيام - ${exam.date}`)
        : (daysLeft === 1
            ? `Your exam is tomorrow! ${exam.time || ''}`
            : `Your exam is in ${daysLeft} days - ${exam.date}`);
      
      showNotification(title, {
        body,
        tag: `exam-${exam.id}`,
        url: 'exams.html',
        requireInteraction: daysLeft === 1 // Only interactive if 1 day left
      });
      
      // Mark as notified
      notified[notifyKey] = Date.now();
    }
  });
  
  // Clean old notified keys (older than 7 days)
  const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  Object.keys(notified).forEach(key => {
    if (notified[key] < weekAgo) {
      delete notified[key];
    }
  });
  
  storage.set(NOTIFIED_KEY, notified);
}

/* ============================================
   CHECK TASKS (Notes)
   ============================================ */

export function checkPendingTasks() {
  const notes = storage.get('notes', []);
  const notifyTasks = storage.get('notifyTasks', true);
  
  if (!notifyTasks || notes.length === 0) return;
  
  const pinnedNotes = notes.filter(n => n.pinned);
  
  if (pinnedNotes.length === 0) return;
  
  // Notify once per day (in the morning)
  const now = new Date();
  const todayKey = `tasks_${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const notified = storage.get(NOTIFIED_KEY, {});
  
  if (notified[todayKey]) return;
  
  // Only notify in the morning (6-10 AM)
  const hour = now.getHours();
  if (hour < 6 || hour > 10) return;
  
  const title = i18n.getLang() === 'ar'
    ? `📌 لديك ${pinnedNotes.length} ملاحظة مثبتة`
    : `📌 You have ${pinnedNotes.length} pinned notes`;
  
  const body = i18n.getLang() === 'ar'
    ? pinnedNotes.slice(0, 3).map(n => `• ${n.title}`).join('\n')
    : pinnedNotes.slice(0, 3).map(n => `• ${n.title}`).join('\n');
  
  showNotification(title, {
    body,
    tag: 'tasks-daily',
    url: 'notes.html'
  });
  
  notified[todayKey] = Date.now();
  storage.set(NOTIFIED_KEY, notified);
}

/* ============================================
   CHECK ALL NOTIFICATIONS
   ============================================ */

export function checkAllNotifications() {
  if (Notification.permission !== 'granted') return;
  
  checkUpcomingExams();
  checkPendingTasks();
}

/* ============================================
   START NOTIFICATION SCHEDULER
   ============================================ */

let schedulerInterval = null;

export function startNotificationScheduler() {
  // Run once immediately
  checkAllNotifications();
  
  // Check every 30 minutes
  if (schedulerInterval) clearInterval(schedulerInterval);
  schedulerInterval = setInterval(checkAllNotifications, 30 * 60 * 1000);
  
  console.log('✅ Notification scheduler started');
}

export function stopNotificationScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('⏸️ Notification scheduler stopped');
  }
}

/* ============================================
   TEST NOTIFICATION
   ============================================ */

export async function sendTestNotification() {
  const permission = await requestNotificationPermission();
  
  if (permission !== 'granted') {
    return false;
  }
  
  const title = i18n.getLang() === 'ar'
    ? '🔔 اختبار الإشعارات'
    : '🔔 Test Notification';
  
  const body = i18n.getLang() === 'ar'
    ? 'إذا شفت هذا الإشعار، فهذا يعني أن الإشعارات تعمل بشكل صحيح!'
    : 'If you see this notification, it means notifications are working!';
  
  showNotification(title, {
    body,
    tag: 'test-notification',
    requireInteraction: true
  });
  
  return true;
}