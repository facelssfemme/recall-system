import { generateFollowUp } from './generator.js';
import { getScenarioLabel } from './templates.js';

const form = document.getElementById('generator-form');
const resultsSection = document.getElementById('results-section');
const formHint = document.getElementById('form-hint');
const formBannerError = document.getElementById('form-banner-error');
const resultsMeta = document.getElementById('results-meta');
const timingList = document.getElementById('timing-list');
const smsCards = document.getElementById('sms-cards');
const emailCards = document.getElementById('email-cards');
const callCard = document.getElementById('call-card');
const resetBtn = document.getElementById('reset-btn');

const REQUIRED_FIELDS = [
  'scenario',
  'treatmentType',
  'timeSinceEvent',
  'offerStyle',
  'tone',
  'brandName',
];

const FIELD_LABELS = {
  scenario: 'Scenario',
  treatmentType: 'Treatment type',
  timeSinceEvent: 'Time since event',
  offerStyle: 'Offer style',
  tone: 'Tone',
  brandName: 'Business / brand name',
};

const OFFER_LABELS = {
  none: 'None',
  'gentle-reminder': 'Gentle reminder',
  'limited-time': 'Limited-time incentive',
  membership: 'Membership nudge',
};

const TONE_LABELS = {
  luxe: 'Luxe',
  warm: 'Warm',
  clinical: 'Clinical',
  direct: 'Direct',
};

function getFormData() {
  const data = new FormData(form);
  return {
    scenario: data.get('scenario'),
    treatmentType: (data.get('treatmentType') || '').trim(),
    timeSinceEvent: data.get('timeSinceEvent'),
    offerStyle: data.get('offerStyle'),
    tone: data.get('tone'),
    brandName: (data.get('brandName') || '').trim(),
    additionalContext: (data.get('additionalContext') || '').trim(),
  };
}

function clearErrors() {
  REQUIRED_FIELDS.forEach((name) => {
    const el = document.getElementById(`error-${name}`);
    const field = form.elements[name]?.closest('.field');
    if (el) el.textContent = '';
    if (field) field.classList.remove('field--invalid');
  });
  formBannerError.classList.add('hidden');
  formBannerError.textContent = '';
}

function showFieldError(name, message) {
  const el = document.getElementById(`error-${name}`);
  const field = form.elements[name]?.closest('.field');
  if (el) el.textContent = message;
  if (field) field.classList.add('field--invalid');
}

function validate(formData) {
  clearErrors();
  let valid = true;

  REQUIRED_FIELDS.forEach((name) => {
    const value = formData[name];
    if (!value) {
      showFieldError(name, `${FIELD_LABELS[name]} is required.`);
      valid = false;
    }
  });

  return valid;
}

async function copyText(text, button) {
  const original = button.textContent;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopy(text);
    }
    button.textContent = 'Copied';
    button.classList.add('copied');
    setTimeout(() => {
      button.textContent = original;
      button.classList.remove('copied');
    }, 2000);
    return true;
  } catch {
    showCopyFallback(button.parentElement);
    return false;
  }
}

function fallbackCopy(text) {
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

function showCopyFallback(container) {
  let fb = container.querySelector('.copy-fallback');
  if (!fb) {
    fb = document.createElement('p');
    fb.className = 'copy-fallback';
    fb.textContent = 'Could not copy automatically — select the text and copy manually.';
    container.appendChild(fb);
  }
}

function createCopyButton(label, getText) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--ghost';
  btn.textContent = label;
  btn.addEventListener('click', () => copyText(getText(), btn));
  return btn;
}

function renderSmsCards(smsList) {
  smsCards.innerHTML = '';
  smsList.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'output-card';
    card.innerHTML = `
      <p class="output-card__label">${escapeHtml(item.label)}</p>
      <p class="output-card__body"></p>
    `;
    card.querySelector('.output-card__body').textContent = item.body;

    const actions = document.createElement('div');
    actions.className = 'btn-group';
    actions.appendChild(
      createCopyButton('Copy message', () => item.body)
    );
    card.appendChild(actions);
    smsCards.appendChild(card);
  });
}

function renderEmailCards(emails) {
  emailCards.innerHTML = '';
  emails.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'output-card';
    card.innerHTML = `
      <p class="output-card__label">${escapeHtml(item.label)}</p>
      <p class="output-card__subject"></p>
      <p class="output-card__body"></p>
    `;
    card.querySelector('.output-card__subject').textContent =
      `Subject: ${item.subject}`;
    card.querySelector('.output-card__body').textContent = item.body;

    const fullEmail = `Subject: ${item.subject}\n\n${item.body}`;

    const actions = document.createElement('div');
    actions.className = 'btn-group';
    actions.appendChild(
      createCopyButton('Copy subject', () => item.subject)
    );
    actions.appendChild(
      createCopyButton('Copy email', () => fullEmail)
    );
    card.appendChild(actions);
    emailCards.appendChild(card);
  });
}

function renderTiming(timing) {
  timingList.innerHTML = '';
  timing.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="timing-list__channel">${escapeHtml(item.channel)}</span>
      <span class="timing-list__when">${escapeHtml(item.when)}</span>
    `;
    timingList.appendChild(li);
  });
}

function renderCallScript(callScript) {
  callCard.innerHTML = `
    <p class="output-card__body"></p>
  `;
  callCard.querySelector('.output-card__body').textContent = callScript.body;

  const actions = document.createElement('div');
  actions.className = 'btn-group';
  actions.appendChild(
    createCopyButton('Copy script', () => callScript.body)
  );
  callCard.appendChild(actions);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderResults(output, formData) {
  const scenarioLabel = getScenarioLabel(formData.scenario);
  const toneLabel = TONE_LABELS[formData.tone] || formData.tone;
  const offerLabel = OFFER_LABELS[formData.offerStyle] || formData.offerStyle;

  resultsMeta.textContent = `${scenarioLabel} · ${formData.treatmentType} · ${formData.timeSinceEvent} ago · ${toneLabel} tone · ${offerLabel}`;

  renderTiming(output.timing);
  renderSmsCards(output.sms);
  renderEmailCards(output.emails);
  renderCallScript(output.callScript);

  resultsSection.classList.remove('hidden');
  formHint.textContent = 'Your sequence is ready below. Copy each block into your SMS or email tool.';

  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideResults() {
  resultsSection.classList.add('hidden');
  formHint.textContent =
    'Fill in the details above to generate your follow-up sequence.';
}

function resetForm() {
  form.reset();
  clearErrors();
  hideResults();
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = getFormData();

  if (!validate(formData)) {
    formBannerError.textContent = 'Please complete all required fields.';
    formBannerError.classList.remove('hidden');
    return;
  }

  try {
    const output = generateFollowUp(formData);
    renderResults(output, formData);
  } catch {
    formBannerError.textContent =
      'Something went wrong generating your messages. Please try again.';
    formBannerError.classList.remove('hidden');
  }
});

form.addEventListener('input', () => {
  clearErrors();
});

resetBtn.addEventListener('click', resetForm);
