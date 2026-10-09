/* ============================================
   TOAST — Unified toast notifications
   ============================================ */

export function showToast(message, type = 'info', options = {}) {
  const { duration = 2500, action = null, onAction = null } = options;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;

  if (action && onAction) {
    toast.innerHTML = `
      <span class="toast__message">${message}</span>
      <button class="toast__action">${action}</button>
    `;
  } else {
    toast.textContent = message;
  }

  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 12px 20px;
    background: var(--bg-primary);
    border: 1px solid var(--border-primary);
    border-radius: 10px;
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    font-size: 14px;
    font-weight: 600;
    animation: slideIn 0.3s ease;
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 90vw;
  `;

  const actionBtn = toast.querySelector('.toast__action');
  if (actionBtn) {
    actionBtn.style.cssText = `
      background: linear-gradient(135deg, #a78bfa, #8b5cf6);
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      white-space: nowrap;
    `;

    actionBtn.addEventListener('click', () => {
      onAction();
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    });
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}