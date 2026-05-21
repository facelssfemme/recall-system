/**
 * Phase-1 access gate (client-side only).
 * Swap or remove this module when moving to real authentication.
 */

/** @type {string} Change this value to update the access password. */
export const ACCESS_PASSWORD = 'FOLLOWUP26';

const SESSION_KEY = 'medspa-builder-unlocked';

const gateEl = document.getElementById('access-gate');
const appEl = document.getElementById('app-content');
const accessForm = document.getElementById('access-form');
const passwordInput = document.getElementById('access-password');
const accessError = document.getElementById('access-error');
const logoutBtn = document.getElementById('logout-btn');

let appLoaded = false;

function isUnlocked() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

function setUnlocked() {
  sessionStorage.setItem(SESSION_KEY, 'true');
}

function clearUnlock() {
  sessionStorage.removeItem(SESSION_KEY);
}

function showGate() {
  gateEl.classList.remove('hidden');
  appEl.classList.add('hidden');
  if (logoutBtn) logoutBtn.classList.add('hidden');
  passwordInput.value = '';
  accessError.textContent = '';
}

function showApp() {
  gateEl.classList.add('hidden');
  appEl.classList.remove('hidden');
  if (logoutBtn) logoutBtn.classList.remove('hidden');
}

async function loadApp() {
  if (!appLoaded) {
    await import('./main.js');
    appLoaded = true;
  }
}

async function unlock() {
  setUnlocked();
  showApp();
  await loadApp();
}

function handleSubmit(e) {
  e.preventDefault();
  accessError.textContent = '';

  const entered = passwordInput.value.trim();
  if (entered === ACCESS_PASSWORD) {
    unlock();
    return;
  }

  accessError.textContent = 'Incorrect password. Please try again.';
  passwordInput.focus();
}

function handleLogout() {
  clearUnlock();
  showGate();
  passwordInput.focus();
}

accessForm.addEventListener('submit', handleSubmit);
logoutBtn?.addEventListener('click', handleLogout);

passwordInput.addEventListener('input', () => {
  if (accessError.textContent) accessError.textContent = '';
});

if (isUnlocked()) {
  showApp();
  loadApp();
} else {
  showGate();
}
