/**
 * Thank-you / access page — update these before deploy.
 * ACCESS_PASSWORD must match ACCESS_PASSWORD in gate.js.
 */

/** @type {string} Path or full URL to the builder */
export const BUILDER_URL = 'https://recallsystem.easeandempire.co/app';

/** @type {string} Phase-1 access password shown to buyers */
export const ACCESS_PASSWORD = 'FOLLOWUP26';

const builderUrlDisplay = document.getElementById('builder-url-display');
const passwordDisplay = document.getElementById('password-display');
const builderLink = document.getElementById('builder-link');
const copyUrlBtn = document.getElementById('copy-url-btn');
const copyPasswordBtn = document.getElementById('copy-password-btn');

const resolvedBuilderUrl = new URL(BUILDER_URL, window.location.href).href;

builderUrlDisplay.textContent = resolvedBuilderUrl;
passwordDisplay.textContent = ACCESS_PASSWORD;
builderLink.href = resolvedBuilderUrl;

async function copyText(text, button) {
  const original = button.textContent;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    button.textContent = 'Copied';
    button.classList.add('copied');
    setTimeout(() => {
      button.textContent = original;
      button.classList.remove('copied');
    }, 2000);
  } catch {
    button.textContent = 'Copy failed';
    setTimeout(() => {
      button.textContent = original;
    }, 2000);
  }
}

copyUrlBtn.addEventListener('click', () => copyText(resolvedBuilderUrl, copyUrlBtn));
copyPasswordBtn.addEventListener('click', () =>
  copyText(ACCESS_PASSWORD, copyPasswordBtn)
);
