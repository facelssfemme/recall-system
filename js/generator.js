/**
 * Public generation API.
 *
 * Phase 1: template engine (client-side, no API key).
 * Phase 2: swap implementation to call an LLM API — keep the return shape identical.
 */

import { buildFromTemplates } from './templates.js';

/**
 * @param {Object} formData
 * @param {string} formData.scenario
 * @param {string} formData.treatmentType
 * @param {string} formData.timeSinceEvent
 * @param {string} formData.offerStyle
 * @param {string} formData.tone
 * @param {string} formData.brandName
 * @param {string} [formData.additionalContext]
 * @returns {Object} Follow-up sequence (sms, emails, timing, callScript)
 */
export function generateFollowUp(formData) {
  return buildFromTemplates(formData);
}

// --- Future API wiring (uncomment and replace export above) ---
//
// export async function generateFollowUp(formData) {
//   const response = await fetch('/api/generate', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(formData),
//   });
//   if (!response.ok) throw new Error('Generation failed');
//   return response.json();
// }
