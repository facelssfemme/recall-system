/**
 * Template engine for MedSpa follow-up copy.
 * Composes messages from scenario bases, tone modifiers, and offer snippets.
 */

const SCENARIO_LABELS = {
  'no-show': 'No-show',
  'same-day-cancellation': 'Same-day cancellation',
  'overdue-rebooking': 'Overdue rebooking',
  'post-treatment': 'Post-treatment follow-up',
};

const TONE = {
  luxe: {
    greet: 'Hello',
    signOff: 'Warm regards',
    softener: 'when it suits you',
    sms1close: 'Reply with a day and time that works, or call our front desk to reschedule.',
    sms2cta:
      'Text back with your preferred day and time, or call the front desk and we will place you on the schedule.',
    sms3cta:
      'If you would like to keep your appointment, reply with when you would like to come in.',
    emailClose: 'Reply to this email with your availability, or call the front desk to reserve a new time.',
  },
  warm: {
    greet: 'Hi',
    signOff: 'Take care',
    softener: 'when you get a chance',
    sms1close: 'Send us a day and time by text, or call the front desk to book a new visit.',
    sms2cta:
      'Text us your preferred day and time, or call the front desk — we will get you back on the calendar.',
    sms3cta: 'Reply with when you would like to come in and we will confirm your appointment.',
    emailClose: 'Reply with a few times that work for you, or call the front desk to rebook.',
  },
  clinical: {
    greet: 'Hello',
    signOff: 'Thank you',
    softener: 'at your earliest convenience',
    sms1close:
      'Reply with your preferred appointment day and time, or call the front desk to reschedule.',
    sms2cta:
      'Text your availability or call the front desk to schedule your next appointment.',
    sms3cta: 'To reschedule, reply with your preferred day and time, or call the front desk.',
    emailClose:
      'Reply with your preferred appointment times, or call the front desk to reschedule.',
  },
  direct: {
    greet: 'Hi',
    signOff: 'Thanks',
    softener: 'today if you can',
    sms1close: 'Text your preferred day/time or call the front desk to rebook.',
    sms2cta: 'Reply with a day and time, or call the front desk to hold a spot.',
    sms3cta: 'Text a day/time to rebook, or call us to secure your appointment.',
    emailClose: 'Reply with your availability or call the front desk to rebook.',
  },
};

const OFFER_SMS = {
  none: '',
  'gentle-reminder': ' We have openings later this week — reply with a day and time to confirm.',
  'limited-time':
    ' Reschedule within 7 days and mention this message at check-in for a courtesy adjustment.',
  membership: ' Members can call our member line for priority scheduling.',
};

const OFFER_EMAIL = {
  none: '',
  'gentle-reminder':
    '\n\nWe have availability later this week. Reply with a day and time that works and we will confirm your appointment.',
  'limited-time':
    '\n\nIf you rebook within the next 7 days, mention this email at check-in and we will apply a courtesy adjustment.',
  membership:
    '\n\nAs a member, you can call our member line for priority scheduling and preferred appointment times.',
};

function interpolate(text, vars) {
  return text
    .replace(/\{\{brandName\}\}/g, vars.brandName)
    .replace(/\{\{treatmentType\}\}/g, vars.treatmentType)
    .replace(/\{\{timeSinceEvent\}\}/g, vars.timeSinceEvent)
    .replace(/\{\{greet\}\}/g, vars.greet)
    .replace(/\{\{signOff\}\}/g, vars.signOff)
    .replace(/\{\{softener\}\}/g, vars.softener)
    .replace(/\{\{sms1close\}\}/g, vars.sms1close)
    .replace(/\{\{sms2cta\}\}/g, vars.sms2cta)
    .replace(/\{\{sms3cta\}\}/g, vars.sms3cta)
    .replace(/\{\{emailClose\}\}/g, vars.emailClose);
}

function contextNote(additionalContext, tone) {
  const trimmed = (additionalContext || '').trim();
  if (!trimmed) return '';
  if (tone === 'clinical') return ` Note: ${trimmed}.`;
  if (tone === 'direct') return ` (${trimmed})`;
  return ` ${trimmed}.`;
}

function buildVars(formData) {
  const tone = TONE[formData.tone] || TONE.warm;
  return {
    brandName: formData.brandName.trim(),
    treatmentType: formData.treatmentType.trim(),
    timeSinceEvent: formData.timeSinceEvent,
    greet: tone.greet,
    signOff: tone.signOff,
    softener: tone.softener,
    sms1close: tone.sms1close,
    sms2cta: tone.sms2cta,
    sms3cta: tone.sms3cta,
    emailClose: tone.emailClose,
    context: contextNote(formData.additionalContext, formData.tone),
  };
}

const SCENARIOS = {
  'no-show': {
    sms1:
      '{{greet}}, this is {{brandName}}. We missed you for your {{treatmentType}} appointment today. {{sms1close}}',
    sms2:
      '{{greet}} — following up about your missed {{treatmentType}} visit. {{sms2cta}}',
    sms3:
      'Your {{treatmentType}} appointment is still open on our schedule. {{sms3cta}}',
    email1Subject: 'Your {{treatmentType}} appointment today',
    email1Body:
      '{{greet}},\n\nWe noticed you were not able to make your {{treatmentType}} appointment today (about {{timeSinceEvent}} ago).\n\nIf something came up, we can help you find a new time. {{emailClose}}\n\n{{signOff}},\n{{brandName}}',
    email2Subject: 'Reschedule your {{treatmentType}} visit',
    email2Body:
      '{{greet}},\n\nWe have not heard back regarding your missed {{treatmentType}} appointment. If you still plan to come in, we can reserve a time that works better for you.\n\n{{emailClose}}\n\n{{signOff}},\n{{brandName}}',
    callScript:
      '{{greet}}, this is [Your name] calling from {{brandName}} about your {{treatmentType}} appointment today. I wanted to see if you would like to reschedule — we have a few openings later this week. Would morning or afternoon work better for you?',
  },

  'same-day-cancellation': {
    sms1:
      '{{greet}}, this is {{brandName}}. We received your same-day cancellation for {{treatmentType}}. {{sms1close}}',
    sms2:
      '{{greet}} — following up on your {{treatmentType}} cancellation. We can often fit you in within the next few days. {{sms2cta}}',
    sms3:
      'If you are ready to rebook your {{treatmentType}}, {{sms3cta}}',
    email1Subject: 'Rebook your {{treatmentType}} appointment',
    email1Body:
      '{{greet}},\n\nThank you for letting us know you needed to cancel your {{treatmentType}} appointment today.\n\nIf you would like to rebook, we can secure a new time — often within the same week. {{emailClose}}\n\n{{signOff}},\n{{brandName}}',
    email2Subject: 'Openings for your {{treatmentType}} visit',
    email2Body:
      '{{greet}},\n\nFollowing up on your {{treatmentType}} cancellation (about {{timeSinceEvent}} ago). We have a few spots on the schedule if you would like to return.\n\n{{emailClose}}\n\n{{signOff}},\n{{brandName}}',
    callScript:
      '{{greet}}, this is [Your name] from {{brandName}}. I am calling about your {{treatmentType}} appointment that was cancelled today. We have availability later this week if you would like to rebook — what day works best for you?',
  },

  'overdue-rebooking': {
    sms1:
      '{{greet}}, this is {{brandName}}. It has been about {{timeSinceEvent}} since your last {{treatmentType}} visit. {{sms1close}}',
    sms2:
      '{{greet}} — your {{treatmentType}} visit may be due based on your last appointment. {{sms2cta}}',
    sms3:
      'Many clients book their next {{treatmentType}} around this interval. {{sms3cta}}',
    email1Subject: 'Time for your next {{treatmentType}}?',
    email1Body:
      '{{greet}},\n\nIt has been about {{timeSinceEvent}} since your last {{treatmentType}} visit with us.\n\nIf you are ready for your next session, we would be happy to reserve a time that fits your schedule. {{emailClose}}\n\n{{signOff}},\n{{brandName}}',
    email2Subject: 'Reserve your next {{treatmentType}} appointment',
    email2Body:
      '{{greet}},\n\nYour {{treatmentType}} visit may be due based on your last appointment (about {{timeSinceEvent}} ago). We have availability and can hold a time for you.\n\n{{emailClose}}\n\n{{signOff}},\n{{brandName}}',
    callScript:
      '{{greet}}, this is [Your name] from {{brandName}}. It has been about {{timeSinceEvent}} since your last {{treatmentType}} visit, and I wanted to help you book your next appointment if you are ready. Do weekdays or weekends work better for you?',
  },

  'post-treatment': {
    sms1:
      '{{greet}}, this is {{brandName}} following up after your {{treatmentType}}. How are you feeling? Reply here or call us with any questions.',
    sms2:
      '{{greet}} — hope you are doing well after your {{treatmentType}}. If you would like your next visit on the calendar, {{sms2cta}}',
    sms3:
      'When you are ready for your next {{treatmentType}}, {{sms3cta}}',
    email1Subject: 'After your {{treatmentType}} visit',
    email1Body:
      '{{greet}},\n\nThank you for your recent {{treatmentType}} visit (about {{timeSinceEvent}} ago).\n\nWe hope you are feeling well. If you have questions about aftercare or what to expect over the next few days, reply to this email and our team will help.\n\n{{signOff}},\n{{brandName}}',
    email2Subject: 'Schedule your next {{treatmentType}} visit',
    email2Body:
      '{{greet}},\n\nFollowing up after your recent {{treatmentType}}. Many clients book their next visit around this point to stay on track with their plan.\n\n{{emailClose}}\n\n{{signOff}},\n{{brandName}}',
    callScript:
      '{{greet}}, this is [Your name] from {{brandName}}. I am calling to see how you are doing after your {{treatmentType}}. Do you have any questions for us? If you are ready, I can help schedule your next visit now — would you prefer a weekday or weekend?',
  },
};

function getTimingOffset(timeSinceEvent) {
  const immediate = ['2 hours', '1 day'];
  const delayed = ['3 days', '2 weeks', '6 weeks'];
  if (immediate.includes(timeSinceEvent)) return 'immediate';
  if (delayed.includes(timeSinceEvent)) return 'delayed';
  return 'immediate';
}

const TIMING_TEMPLATES = {
  'no-show': {
    immediate: [
      { channel: 'SMS 1', when: 'Within 1–2 hours of the missed appointment' },
      { channel: 'Email 1', when: 'Same day, 3–4 hours after the no-show' },
      { channel: 'SMS 2', when: 'Next business day, late morning' },
      { channel: 'Email 2', when: '48 hours after the no-show if no reply' },
      { channel: 'SMS 3', when: '72 hours after the no-show if still no response' },
    ],
    delayed: [
      { channel: 'SMS 1', when: 'Send now — acknowledge the missed visit promptly' },
      { channel: 'Email 1', when: 'Within 24 hours of sending SMS 1' },
      { channel: 'SMS 2', when: '24 hours after SMS 1 if no reply' },
      { channel: 'Email 2', when: '48–72 hours after SMS 1 if still no response' },
      { channel: 'SMS 3', when: 'One week after first outreach as a final follow-up' },
    ],
  },
  'same-day-cancellation': {
    immediate: [
      { channel: 'SMS 1', when: 'Within 30–60 minutes of the cancellation' },
      { channel: 'Email 1', when: 'Same day, 2–3 hours after cancellation' },
      { channel: 'SMS 2', when: 'Next business day' },
      { channel: 'Email 2', when: '3 days after cancellation if no rebook' },
      { channel: 'SMS 3', when: '5–7 days after cancellation as a final follow-up' },
    ],
    delayed: [
      { channel: 'SMS 1', when: 'Send now — it has already been some time since the cancellation' },
      { channel: 'Email 1', when: 'Within 24 hours of SMS 1' },
      { channel: 'SMS 2', when: '48 hours after SMS 1' },
      { channel: 'Email 2', when: '4–5 days after first outreach' },
      { channel: 'SMS 3', when: 'One week after SMS 2 if no response' },
    ],
  },
  'overdue-rebooking': {
    immediate: [
      { channel: 'SMS 1', when: 'Send now — client is due based on treatment interval' },
      { channel: 'Email 1', when: 'Same day, 2–4 hours after SMS 1' },
      { channel: 'SMS 2', when: '3 days after SMS 1' },
      { channel: 'Email 2', when: '7 days after first outreach' },
      { channel: 'SMS 3', when: '10–14 days after SMS 2' },
    ],
    delayed: [
      { channel: 'SMS 1', when: 'Send now — overdue window has passed' },
      { channel: 'Email 1', when: 'Within 24 hours of SMS 1' },
      { channel: 'SMS 2', when: '4 days after SMS 1' },
      { channel: 'Email 2', when: '7–10 days after first outreach' },
      { channel: 'SMS 3', when: '2 weeks after SMS 2 as a final reminder' },
    ],
  },
  'post-treatment': {
    immediate: [
      { channel: 'SMS 1', when: 'Day of treatment or next morning' },
      { channel: 'Email 1', when: '24–48 hours post-treatment' },
      { channel: 'SMS 2', when: '5–7 days post-treatment' },
      { channel: 'Email 2', when: '2–3 weeks post-treatment for rebooking' },
      { channel: 'SMS 3', when: '3–4 weeks post-treatment if not yet rebooked' },
    ],
    delayed: [
      { channel: 'SMS 1', when: 'Send now — follow up on how they are feeling' },
      { channel: 'Email 1', when: 'Within 24 hours of SMS 1' },
      { channel: 'SMS 2', when: '3–5 days after SMS 1' },
      { channel: 'Email 2', when: '1 week after SMS 2 to prompt next booking' },
      { channel: 'SMS 3', when: '10 days after Email 2 if no appointment scheduled' },
    ],
  },
};

export function getScenarioLabel(scenario) {
  return SCENARIO_LABELS[scenario] || scenario;
}

export function buildFromTemplates(formData) {
  const scenario = SCENARIOS[formData.scenario];
  if (!scenario) {
    throw new Error('Unknown scenario');
  }

  const vars = buildVars(formData);
  const offerSms = OFFER_SMS[formData.offerStyle] || '';
  const offerEmail = OFFER_EMAIL[formData.offerStyle] || '';

  let sms2 = interpolate(scenario.sms2, vars);
  if (vars.context) {
    sms2 = sms2.replace(/\.$/, '') + vars.context;
  }

  const sms3Base = interpolate(scenario.sms3, vars) + interpolate(offerSms, vars);

  const email2Body =
    interpolate(scenario.email2Body, vars) + interpolate(offerEmail, vars);

  const offset = getTimingOffset(formData.timeSinceEvent);
  const timing = TIMING_TEMPLATES[formData.scenario][offset];

  return {
    sms: [
      { label: 'SMS 1', body: interpolate(scenario.sms1, vars) },
      { label: 'SMS 2', body: sms2 },
      { label: 'SMS 3', body: sms3Base },
    ],
    emails: [
      {
        label: 'Email 1',
        subject: interpolate(scenario.email1Subject, vars),
        body: interpolate(scenario.email1Body, vars),
      },
      {
        label: 'Email 2',
        subject: interpolate(scenario.email2Subject, vars),
        body: email2Body,
      },
    ],
    timing,
    callScript: {
      title: 'Call / voicemail script',
      body: interpolate(scenario.callScript, vars),
    },
  };
}
