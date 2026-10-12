/* Bunya forms v2: the stepped Book a Demo and Test Drive popups.
   Every step is saved through the site's API (/api/forms/v2), which validates it and keeps the
   request in the CRM. This browser keeps only a random resume token per journey, never the
   answers, so a visitor can close the popup and carry on later on the same device.
   Configuration (window.BUNYA_FORMS_V2) is generated from functions/_lib/forms-v2-contract.js. */
(() => {
  const config = window.BUNYA_FORMS_V2;
  if (!config || typeof HTMLDialogElement !== 'function' || !window.crypto?.getRandomValues) return;

  // The standalone form pages, with or without the trailing slash or .html.
  const pageKind = pathname => ({ booking: 'demo', 'test-drive': 'test_drive' })[(pathname.match(/^\/(booking|test-drive)(?:\/|\.html)?$/) || [])[1]];
  const ORDER = ['email', 'firm', 'priorities', 'review'];
  const LABELS = {
    work_email: 'Work email', first_name: 'First name', last_name: 'Last name', firm_name: 'Firm name',
    role_title: 'Your role', client_groups_band: 'Number of client groups',
    primary_outcome: 'What would you most like to improve?', product_interest: 'What would you like to explore?',
    decision_stage: 'Where are you in the process?', organisation_type: 'Which best describes your organisation?',
    current_software: 'What do you mainly run on today?', phone: 'Phone', focus_notes: 'Anything else we should know?',
    heard_about: 'How did you hear about us?', heard_about_detail: 'Please tell us where',
  };
  const SUMMARY = {
    work_email: 'Work email', first_name: 'First name', last_name: 'Last name', firm_name: 'Firm', role_title: 'Role',
    client_groups_band: 'Client groups', primary_outcome: 'Most want to improve', product_interest: 'Exploring',
    decision_stage: 'Stage', organisation_type: 'Organisation', current_software: 'Current software', phone: 'Phone', focus_notes: 'Notes',
    heard_about: 'Heard about us', heard_about_detail: 'Where',
  };
  const INPUT = {
    work_email: ['email', 'email', 254], first_name: ['text', 'given-name', 100], last_name: ['text', 'family-name', 100],
    firm_name: ['text', 'organization', 150], phone: ['tel', 'tel', 40], heard_about_detail: ['text', 'off', 150],
  };
  // "How did you hear about us?" is shown on the priorities step, not tucked into "Add more context";
  // "Please tell us where" appears only for Other.
  const HEARD = ['heard_about', 'heard_about_detail'];
  const ERRORS = {
    network: 'We could not reach Bunya. Check your connection and try again. Your answers are still here.',
    invalid_email: 'Enter one valid work email address.',
    invalid_phone: 'Enter a phone number using digits, spaces and + ( ) - only.',
    invalid_text: 'Please remove the < and > characters.',
    invalid_name: 'Please use letters only in your name (spaces, hyphens, apostrophes and full stops are fine).',
    consent_changed: 'Our privacy wording has just changed. Please reload the page to see it before submitting.',
    expired: 'This request has expired. Please start again.',
    not_found: 'We could not find your saved request. Please start again.',
    already_submitted: 'This request has already been submitted.',
    slot_taken: 'Sorry, that time has just been taken. Please choose another.',
    busy: 'We are booking your demo now. Please wait a moment, then reload this page.',
    invalid_time: 'Sorry, that time is no longer available. Please choose another.',
    calendar_unavailable: 'We could not reach our calendar just now. Please try again in a moment, or leave booking for later and use the link in your email.',
    not_bookable: 'This request can no longer be booked online. Please email info@bunya.ai and we will find a time with you.',
    challenge_failed: 'We could not confirm you’re a person, not a bot. If a check appears above the buttons, complete it, then try again.',
    cannot_change: 'It may be less than a day away, so please reply to your confirmation email and we’ll sort it out.',
    default: 'Something went wrong on our side. Please try again in a moment, or email info@bunya.ai. Your answers are still here.',
  };

  // Booking times in the visitor's own time zone and language.
  const DAYS_SHOWN = 10;
  const visitorZone = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { return ''; } })();
  const format = {
    key: new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }),
    day: new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' }),
    longDay: new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }),
    time: new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }),
    zone: instant => { try { return new Intl.DateTimeFormat(undefined, { timeZoneName: 'long' }).formatToParts(new Date(instant)).find(part => part.type === 'timeZoneName')?.value || ''; } catch { return ''; } },
  };

  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  // Microsoft Clarity, present only once a visitor accepts analytics (analytics.js): fixed names for
  // the steps reached, so recordings can be filtered and drop-off seen. Never anything typed or chosen.
  const clarity = (...args) => { if (typeof window.clarity === 'function') window.clarity(...args); };
  const storage = {
    key: kind => 'bunya.forms.v2.' + kind,
    get(kind) { try { return JSON.parse(localStorage.getItem(this.key(kind)) || 'null'); } catch { return null; } },
    set(kind, value) { try { localStorage.setItem(this.key(kind), JSON.stringify(value)); } catch { /* private mode: resume is unavailable */ } },
    clear(kind) { try { localStorage.removeItem(this.key(kind)); } catch { /* ignore */ } },
  };
  // Cloudflare Turnstile, when configured: Cloudflare's script is loaded only once a popup opens.
  let turnstileScript = null;
  const loadTurnstile = () => turnstileScript || (turnstileScript = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')));
    script.onerror = () => { turnstileScript = null; reject(new Error('turnstile')); };
    document.head.append(script);
  }));

  // The key from the emailed "Choose a time" link: taken out of the address bar straight away, so
  // it is not left in the history or passed on by copying the address, and kept for this tab only,
  // so a reload still works until the demo is booked.
  const bookingLink = {
    name: 'bunya.forms.v2.link',
    take() {
      const params = new URLSearchParams(location.search);
      const key = params.get('key');
      if (key === null) { try { return sessionStorage.getItem(this.name); } catch { return null; } }
      params.delete('key');
      const query = params.toString();
      history.replaceState(history.state, '', location.pathname + (query ? '?' + query : '') + location.hash);
      if (/^[A-Za-z0-9_-]{43}$/.test(key)) { try { sessionStorage.setItem(this.name, key); } catch { /* this load only */ } }
      return key || 'incomplete';
    },
    clear() { try { sessionStorage.removeItem(this.name); } catch { /* ignore */ } },
  };
  const newToken = () => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  // Campaign tags from the landing URL, kept for this tab so they survive browsing before the form opens.
  const attribution = (() => {
    const params = new URLSearchParams(location.search);
    let tags = {};
    try { tags = JSON.parse(sessionStorage.getItem('bunya.forms.v2.utm') || '{}'); } catch { /* ignore */ }
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) if (params.get(key)) tags[key] = params.get(key).slice(0, 250);
    try { sessionStorage.setItem('bunya.forms.v2.utm', JSON.stringify(tags)); } catch { /* ignore */ }
    return tags;
  })();

  // Resolves once the page is in view (at once if it already is).
  const inView = () => new Promise(resolve => {
    if (document.visibilityState === 'visible') return resolve();
    const seen = () => { if (document.visibilityState !== 'visible') return; document.removeEventListener('visibilitychange', seen); resolve(); };
    document.addEventListener('visibilitychange', seen);
  });
  // A dropped connection (most often a phone that switched apps while it waited) is retried once,
  // when the page is back in view. These operations are idempotent on the resume token: a repeat
  // finds what the first attempt did (a submit answers duplicate) rather than doing it twice.
  // Not here: start (its Turnstile token is single-use; see submitStep), book and cancel (calendar).
  const RETRIED = ['save', 'submit', 'preferences', 'resume', 'slots', 'booking-link'];

  async function api(op, body, retried = false) {
    let response;
    try {
      response = await fetch(config.api + '/' + op, {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema_version: config.schemaVersion, ...body }),
        signal: AbortSignal.timeout ? AbortSignal.timeout(35000) : undefined,
      });
    } catch {
      if (retried || !RETRIED.includes(op)) throw { code: 'network' };
      await inView();
      // Time for a first attempt that did arrive to store what it was sent (the request API
      // replies before it writes), so the repeat finds it.
      await new Promise(resolve => setTimeout(resolve, 3000));
      clarity('event', 'forms_retry_' + op);
      return api(op, body, true);
    }
    let data = {};
    try { data = await response.json(); } catch { /* not JSON */ }
    if (!response.ok) throw { status: response.status, code: data.error || 'default', field: data.field };
    return data;
  }

  const journeys = {};
  function journey(kind) {
    if (journeys[kind]) return journeys[kind];
    const demo = kind === 'demo';
    const spec = config.journeys[kind];
    const prefix = demo ? 'fd' : 'ft';
    const required = new Set(Object.values(spec.steps).flatMap(step => step.required));
    const privacy = `<a href="${esc(config.consent.privacyUrl)}" target="_blank" rel="noopener">privacy notice</a>`;
    const star = name => (required.has(name) ? ' <span aria-hidden="true">*</span>' : '');
    const field = name => {
      const id = `${prefix}-${name}`;
      const req = required.has(name) ? ' required aria-required="true"' : '';
      if (config.choices[name]) {
        return `<div class="bd-field"><label for="${id}">${LABELS[name]}${star(name)}</label><select id="${id}" name="${name}"${req}><option value="">Select an option</option>${config.choices[name].map(([value, label]) => `<option value="${esc(value)}">${esc(label)}</option>`).join('')}</select></div>`;
      }
      if (name === 'focus_notes') return `<div class="bd-field bd-wide"><label for="${id}">${LABELS[name]}</label><textarea id="${id}" name="${name}" rows="3" maxlength="2000"></textarea></div>`;
      const [type, auto, max] = INPUT[name];
      return `<div class="bd-field"><label for="${id}">${LABELS[name]}${star(name)}</label><input id="${id}" name="${name}" type="${type}" autocomplete="${auto}" maxlength="${max}"${req}></div>`;
    };
    const priorities = spec.steps.priorities.fields;
    const extra = priorities.filter(name => !required.has(name) && !HEARD.includes(name));
    const heard = HEARD.every(name => priorities.includes(name))
      ? `<div class="bd-grid bd-heard">${field('heard_about')}<div class="bd-heard-detail" hidden>${field('heard_about_detail')}</div></div>` : '';

    const dialog = document.createElement('dialog');
    dialog.className = 'bd-modal';
    dialog.setAttribute('aria-labelledby', prefix + '-title');
    // Clarity session recordings (analytics.js, with consent) never show what is typed or reviewed here.
    dialog.setAttribute('data-clarity-mask', 'true');
    dialog.innerHTML = `<div class="bd-top"><span class="bd-brand">bunya.ai</span><button class="bd-close" type="button" aria-label="Close ${demo ? 'demo request' : 'test drive request'}">×</button></div>
<div class="bd-content">
<ol class="bd-steps" aria-label="Request progress"><li>Email</li><li>Your firm</li><li>Your priorities</li><li>Review</li></ol>
<p class="bd-welcome" hidden>Welcome back. We kept your answers so you can carry on.</p>
<h2 id="${prefix}-title" tabindex="-1"></h2><p class="bd-description"></p>
<form novalidate>
<p class="bd-note bd-required-note">Fields marked * are required.</p>
<p class="bd-error" role="alert" id="${prefix}-error" hidden></p>
<fieldset data-step="email"><legend class="bd-sr">Your email</legend>${field('work_email')}
<p class="bd-notice">${esc(config.consent.collectionNotice).replace('privacy notice', privacy)}</p></fieldset>
<fieldset data-step="firm" hidden disabled><legend class="bd-sr">About your firm</legend><div class="bd-grid">${spec.steps.firm.fields.map(field).join('')}</div>
<p class="bd-note">An approximate count is fine. A client group is a household or related group you advise.</p></fieldset>
<fieldset data-step="priorities" hidden disabled><legend class="bd-sr">Your priorities</legend>
${priorities.filter(name => required.has(name)).map(field).join('')}
${heard}
${extra.length ? `<details class="bd-extra"><summary>Add more context</summary><div class="bd-grid">${extra.map(field).join('')}</div></details>` : '<p class="bd-note">Your test drive is for Command Centre.</p>'}
<label class="bd-consent"><input name="consent" type="checkbox" required aria-required="true"><span>${esc(config.consent.wording).replace('privacy notice', privacy)} <span aria-hidden="true">*</span></span></label>
<label class="bd-consent"><input name="marketing_consent" type="checkbox"><span>${esc(config.consent.marketingWording)}</span></label></fieldset>
<fieldset data-step="review" hidden disabled><legend class="bd-sr">Check your details</legend><dl class="bd-review"></dl></fieldset>
<fieldset data-step="booking" hidden disabled><legend class="bd-sr">Choose a time</legend>
<p class="bd-note bd-picker-status" role="status"></p>
<fieldset class="bd-pick bd-days-group" hidden><legend>Choose a day</legend><div class="bd-chips bd-days"></div><button type="button" class="bd-more" hidden>Show later dates</button></fieldset>
<fieldset class="bd-pick bd-times-group" hidden><legend class="bd-times-legend">Choose a time</legend><div class="bd-chips bd-times"></div></fieldset>
<p class="bd-note bd-tz" hidden></p>
<button type="button" class="bd-more bd-retry" hidden>Try again</button>
<button type="button" class="bd-back bd-later">Leave booking for later →</button></fieldset>
<fieldset data-step="preferences" hidden disabled><legend class="bd-sr">What would help you evaluate Bunya?</legend>
<div class="bd-access" hidden></div>
<p class="bd-question" aria-hidden="true">What would help you evaluate Bunya?</p>
<p class="bd-note">Choose any that would be useful. This does not change your marketing permission.</p>
${config.choices.content_preferences.map(([value, label]) => `<label class="bd-option"><input type="checkbox" name="content_preferences" value="${esc(value)}"><span>${esc(label)}</span></label>`).join('')}
<button type="button" class="bd-back bd-skip">Skip for now</button></fieldset>
<fieldset data-step="done" hidden disabled><legend class="bd-sr">All done</legend><div class="bd-calendar bd-result"></div></fieldset>
<div class="bd-turnstile"></div>
<div class="bd-actions"><button class="bd-back bd-prev" type="button">← Back</button><button class="bd-next" type="submit">Continue →</button></div>
</form></div>`;
    document.body.append(dialog);

    const form = dialog.querySelector('form');
    const title = dialog.querySelector('h2');
    const error = dialog.querySelector('.bd-error');
    const next = dialog.querySelector('.bd-next');
    const heardSelect = form.elements.namedItem('heard_about');
    const heardDetail = dialog.querySelector('.bd-heard-detail');
    const syncHeard = () => {
      if (!heardSelect || !heardDetail) return;
      const other = heardSelect.value === 'other';
      heardDetail.hidden = !other;
      if (!other) form.elements.namedItem('heard_about_detail').value = '';
    };
    heardSelect?.addEventListener('change', syncHeard);
    const state = {
      kind, demo, step: 'email', token: null, requestRef: null, answers: {}, status: null, emailStatus: null,
      // key: from the emailed "Choose a time" link, which books that request without the resume token.
      key: null, canBook: false, days: null, daysShown: DAYS_SHOWN, bookedOn: null, busy: false, trigger: null, ready: false,
      // From a booking made here: who it is with, the Teams link and the add-to-calendar links.
      booking: null,
      // started: the CRM has this journey's request (the first Continue reached it, or it was resumed).
      started: false,
    };
    // The visitor's own demo link: the request reference lets their demo activity follow up this request.
    const demoLink = () => config.demoUrl + (state.requestRef ? '?r=' + encodeURIComponent(state.requestRef) : '');
    const titles = {
      email: demo ? 'Let’s start with your email.' : 'Try Command Centre.', firm: 'A little about your firm.', priorities: 'What matters most to you?',
      review: 'Check your details.', booking: 'Choose a time with our team.', preferences: demo ? 'Make your demo useful.' : 'Your test drive is ready.', done: 'You’re all set.',
    };
    const descriptions = {
      email: demo ? 'A walkthrough focused on your practice.' : 'Explore Command Centre at your own pace.', firm: 'Help us understand your practice.',
      priorities: 'We’ll focus on the outcome that matters to you.', review: 'Go back to change anything before you submit.',
      booking: 'Your request is in. Pick a time that suits you for a guided demo with the Bunya team.', preferences: '', done: '',
    };
    const buttons = { review: 'Submit request →', booking: 'Book this time →', preferences: 'Save preferences', done: 'Close' };
    // Clarity markers such as demo_step_firm, demo_submitted, demo_error_invalid_email, demo_closed_at_review.
    const mark = name => clarity('event', `${kind}_${name}`);
    const markError = code => mark('error_' + (code === 'required' || code === 'validation' || Object.hasOwn(ERRORS, code ?? '') ? code : 'default'));

    const controls = step => [...form.querySelectorAll(`[data-step="${step}"] :is(input,select,textarea)`)];
    const collect = () => {
      for (const step of ORDER) for (const control of controls(step)) {
        if (!control.name || control.type === 'checkbox') continue;
        const value = control.value.trim();
        if (value) state.answers[control.name] = control.name === 'work_email' ? value.toLowerCase() : value;
        else delete state.answers[control.name];
      }
    };
    const fill = () => {
      for (const [name, value] of Object.entries(state.answers)) {
        const control = form.elements.namedItem(name);
        if (control && !(control instanceof RadioNodeList)) control.value = value;
      }
      if (extra.some(name => state.answers[name])) dialog.querySelector('.bd-extra')?.setAttribute('open', '');
      syncHeard();
    };
    const showError = (message, control) => {
      error.textContent = message;
      error.hidden = false;
      if (control) {
        control.setAttribute('aria-invalid', 'true');
        control.setAttribute('aria-describedby', error.id);
        if (control.closest('details')) control.closest('details').open = true;
        control.focus();
      } else {
        error.focus?.();
      }
    };
    const clearErrors = () => {
      error.hidden = true;
      form.querySelectorAll('[aria-invalid]').forEach(control => { control.removeAttribute('aria-invalid'); control.removeAttribute('aria-describedby'); });
    };
    const apiError = failure => {
      markError(failure.code);
      const control = failure.field && form.elements.namedItem(failure.field);
      if (failure.code === 'required' && control) return showError(`Please complete “${(LABELS[failure.field] || 'this field').replace(/\?$/, '')}”.`, control);
      showError(ERRORS[failure.code] || ERRORS.default, control && !(control instanceof RadioNodeList) ? control : null);
    };
    const setBusy = (busy, label) => {
      state.busy = busy;
      next.disabled = busy;
      form.setAttribute('aria-busy', busy ? 'true' : 'false');
      if (busy) next.textContent = label || 'Saving…';
    };

    // ——— Turnstile: an invisible check that a person is using the form, run while they type the
    // email. It shows itself above the buttons only if Cloudflare wants an interaction. Starting a
    // request uses its token, once; the rest of that request needs no further check. ———
    const human = { widget: null, token: null, waiting: [], box: dialog.querySelector('.bd-turnstile'), fold: null };
    // Once Cloudflare is satisfied, its "Success!" box folds away after a moment; it opens again
    // only if Cloudflare asks the visitor to do something. (Folded, not removed: the widget keeps
    // running, so the next step's check still works.)
    const showBox = show => {
      clearTimeout(human.fold);
      if (show) human.box.classList.remove('bd-passed');
      else human.fold = setTimeout(() => human.box.classList.add('bd-passed'), 1200);
    };
    async function prepareHuman() {
      if (!config.turnstile || human.widget !== null || state.started) return;
      human.widget = false; // rendering
      try {
        const turnstile = await loadTurnstile();
        human.widget = turnstile.render(human.box, {
          sitekey: config.turnstile, appearance: 'interaction-only', size: 'flexible',
          callback: token => { human.token = token; showBox(false); human.waiting.splice(0).forEach(resolve => resolve(token)); },
          'before-interactive-callback': () => showBox(true),
          'expired-callback': () => { human.token = null; },
          'error-callback': () => { human.token = null; showBox(true); },
        });
      } catch {
        human.widget = null; // the API then refuses the step, and the visitor can try again
      }
    }
    function humanToken() {
      if (!config.turnstile) return Promise.resolve(undefined);
      if (human.token) return Promise.resolve(human.token);
      prepareHuman();
      return new Promise(resolve => { human.waiting.push(resolve); setTimeout(() => resolve(''), 45000); });
    }
    // After a start: the token is spent. If the start worked, the check is finished with for this
    // request and goes; if not, it runs again for the retry.
    function humanUsed(started) {
      human.token = null;
      if (!human.widget) return;
      try {
        if (started) { window.turnstile.remove(human.widget); human.widget = null; } else window.turnstile.reset(human.widget);
      } catch { /* a new one is made when needed */ }
    }

    function show(step, focus = true) {
      state.step = step;
      mark('step_' + step);
      clearErrors();
      for (const fieldset of form.querySelectorAll('fieldset[data-step]')) {
        fieldset.hidden = fieldset.dataset.step !== step;
        fieldset.disabled = fieldset.hidden;
      }
      title.textContent = titles[step];
      const description = dialog.querySelector('.bd-description');
      description.textContent = descriptions[step];
      description.hidden = !descriptions[step];
      const steps = dialog.querySelector('.bd-steps');
      steps.hidden = !ORDER.includes(step);
      steps.querySelectorAll('li').forEach((item, index) => {
        item.toggleAttribute('aria-current', ORDER[index] === step);
        if (ORDER[index] === step) item.setAttribute('aria-current', 'step');
        item.classList.toggle('bd-done', index < ORDER.indexOf(step));
      });
      dialog.querySelector('.bd-required-note').hidden = !['email', 'firm', 'priorities'].includes(step);
      dialog.querySelector('.bd-prev').hidden = !['firm', 'priorities', 'review'].includes(step);
      next.textContent = buttons[step] || 'Continue →';
      next.hidden = step === 'booking';
      next.disabled = false;
      if (step === 'review') renderReview();
      if (step === 'booking') loadSlots();
      dialog.scrollTop = 0;
      if (focus) title.focus();
    }

    function renderReview() {
      const list = dialog.querySelector('.bd-review');
      list.replaceChildren();
      for (const step of ['email', 'firm', 'priorities']) for (const name of spec.steps[step].fields) {
        if (!state.answers[name] && !required.has(name)) continue;
        const term = document.createElement('dt');
        const detail = document.createElement('dd');
        term.textContent = SUMMARY[name];
        const choice = config.choices[name]?.find(([value]) => value === state.answers[name]);
        detail.textContent = choice ? choice[1] : state.answers[name] || 'Not provided';
        list.append(term, detail);
      }
      if (!demo) {
        const term = document.createElement('dt'); const detail = document.createElement('dd');
        term.textContent = 'Product'; detail.textContent = 'Command Centre';
        list.append(term, detail);
      }
    }

    // ——— booking: free times from the sales calendar, booked with the details already given ———
    const picker = {
      status: dialog.querySelector('.bd-picker-status'), days: dialog.querySelector('.bd-days'), times: dialog.querySelector('.bd-times'),
      dayGroup: dialog.querySelector('.bd-days-group'), timeGroup: dialog.querySelector('.bd-times-group'),
      timesLegend: dialog.querySelector('.bd-times-legend'), more: dialog.querySelector('.bd-days-group .bd-more'), zone: dialog.querySelector('.bd-tz'),
      retry: dialog.querySelector('.bd-retry'),
    };

    // Times arrive as UTC instants and are grouped by the visitor's own calendar day.
    function group(slots) {
      const days = [];
      for (const value of slots) {
        const date = new Date(value);
        const key = format.key.format(date);
        let day = days.at(-1);
        if (!day || day.key !== key) days.push(day = { key, label: format.day.format(date), long: format.longDay.format(date), slots: [] });
        day.slots.push({ value, label: format.time.format(date) });
      }
      return days;
    }

    async function loadSlots() {
      picker.status.textContent = 'Finding times that suit our team…';
      picker.status.hidden = false;
      picker.dayGroup.hidden = picker.timeGroup.hidden = picker.zone.hidden = picker.retry.hidden = true;
      next.hidden = true;
      let slots = null;
      try {
        const found = await api('slots', {});
        slots = found.slots || [];
        state.minutes = found.duration_minutes || 0;
      } catch { /* shown below */ }
      if (state.step !== 'booking') return;
      state.days = slots ? group(slots) : null;
      if (!state.days?.length) {
        picker.status.textContent = state.days
          ? 'There are no times free in the next few weeks. Leave booking for later and our team will be in touch.'
          : 'We could not load our calendar just now. Please try again, or leave booking for later and use the link in your email.';
        picker.retry.hidden = !!state.days;
        return;
      }
      picker.status.hidden = true;
      const zone = format.zone(slots[0]);
      picker.zone.textContent = `Times are in your time zone${zone ? ` (${zone})` : ''}. Each demo is ${state.minutes ? `${state.minutes} minutes` : 'about an hour'} on Microsoft Teams, with the Bunya team.`;
      picker.zone.hidden = false;
      next.hidden = false;
      renderDays(state.days[0].key);
    }

    function renderDays(selected) {
      picker.days.innerHTML = state.days.slice(0, state.daysShown).map(day => `<label class="bd-chip"><input type="radio" name="booking_day" value="${esc(day.key)}"${day.key === selected ? ' checked' : ''}><span>${esc(day.label)}</span></label>`).join('');
      picker.more.hidden = state.days.length <= state.daysShown;
      picker.dayGroup.hidden = false;
      renderTimes(selected);
    }

    function renderTimes(key) {
      const day = state.days.find(d => d.key === key) || state.days[0];
      picker.timesLegend.textContent = `Choose a time on ${day.long}`;
      picker.times.innerHTML = day.slots.map(slot => `<label class="bd-chip"><input type="radio" name="booking_slot" value="${esc(slot.value)}"><span>${esc(slot.label)}</span></label>`).join('');
      picker.timeGroup.hidden = false;
    }

    // The Teams link for a booking made here. No "add to calendar" links: the emailed meeting invite
    // is the visitor's calendar entry, and a second entry would not move or cancel with it.
    const bookingLinks = () => {
      const b = state.booking;
      return b?.join_url ? `<span class="bd-calendar-links"><a href="${esc(b.join_url)}" target="_blank" rel="noopener">Teams link</a></span>` : '';
    };

    const bookedWhen = () => {
      const date = new Date(state.bookedOn || '');
      return isNaN(date) ? '' : `${format.longDay.format(date)} at ${format.time.format(date)}`;
    };

    function toPreferences() {
      const access = dialog.querySelector('.bd-access');
      if (demo) {
        const when = bookedWhen();
        access.innerHTML = state.status === 'booked'
          ? `<strong>Your demo is booked${when ? ` for ${esc(when)}` : ''} with the Bunya team.</strong> We’ve sent you a calendar invite with the Teams link; accept it to keep the demo in your calendar.${bookingLinks()}`
          : `<strong>Your request is in.</strong> ${state.canBook ? 'We’ll email you a link to choose a time whenever you’re ready.' : 'We’ll be in touch to arrange a time that suits you.'}`;
      } else {
        // 'queued': the request API replies at once; the request is stored and the email follows.
        const emailed = { sent: 'We’ve emailed you the demo link.', queued: 'We’re emailing you the demo link.' }[state.emailStatus];
        access.innerHTML = `<strong>${emailed || 'Your request is in.'}</strong> <a class="bd-demo-link" href="${esc(demoLink())}">Open the Command Centre demo ↗</a>`;
      }
      access.hidden = false;
      show('preferences');
    }

    // `keep`: the emailed link was used, so this device's own saved journey (if any) is left alone.
    function finish(message, keep = false, heading = '') {
      dialog.querySelector('.bd-result').innerHTML = message;
      dialog.querySelector('.bd-welcome').hidden = true;
      if (!keep) storage.clear(kind);
      show('done');
      if (heading) title.textContent = heading;
    }

    // A booked demo opened from its emailed "change or cancel" link: when it is, and the choice to
    // move it to another time or cancel it (asked twice).
    function showManage() {
      const when = bookedWhen();
      const booked = `<strong>Your demo is booked${when ? ` for ${esc(when)}` : ''} with the Bunya team.</strong>`;
      finish(state.canChange
        ? `${booked}<p>Need a different time? Choose a new one; your Teams link stays the same.</p><p class="bd-manage"><button type="button" class="bd-primary bd-change">Choose a different time →</button><button type="button" class="bd-back bd-cancel-demo">Cancel this demo</button></p>`
        : `${booked}<p>Your Microsoft Teams link is in the calendar invite we sent you. To change anything, reply to it.</p>`, true, 'Your Bunya demo.');
    }
    const manageMessage = message => { dialog.querySelector('.bd-result').innerHTML = message; };
    dialog.querySelector('.bd-result').addEventListener('click', async event => {
      const button = event.target.closest('button');
      if (!button || state.busy) return;
      if (button.classList.contains('bd-change')) {
        state.rescheduling = true;
        show('booking');
        title.textContent = 'Choose a new time.';
        const description = dialog.querySelector('.bd-description');
        description.textContent = 'Pick a time that suits you better. Your Teams link stays the same.';
        description.hidden = false;
        next.textContent = 'Move my demo →';
      } else if (button.classList.contains('bd-cancel-demo')) {
        const when = bookedWhen();
        manageMessage(`<strong>Cancel your demo${when ? ` on ${esc(when)}` : ''}?</strong><p>We’ll email you to confirm, and you can book a new time from that email whenever you like.</p><p class="bd-manage"><button type="button" class="bd-primary bd-cancel-yes">Yes, cancel it</button><button type="button" class="bd-back bd-cancel-no">Keep my demo</button></p>`);
      } else if (button.classList.contains('bd-cancel-no')) {
        showManage();
      } else if (button.classList.contains('bd-cancel-yes')) {
        state.busy = true;
        button.disabled = true;
        button.textContent = 'Cancelling…';
        try {
          await api('cancel', { key: state.key });
          state.status = 'booking_pending';
          if (typeof window.gtag === 'function') window.gtag('event', 'demo_cancelled', { form_version: 'v2', page_path: location.pathname });
          finish('<strong>Your demo is cancelled.</strong><p>We’ve emailed you to confirm. If you’d like to meet another time, use the link in that email or reply to it.</p>', true, 'Cancelled.');
        } catch (failure) {
          manageMessage(`<strong>We couldn’t cancel it online.</strong><p>${esc(ERRORS[failure.code] || ERRORS.default)}</p>`);
        } finally {
          state.busy = false;
        }
      }
    });

    // The emailed "Choose a time" link: straight to the times for that request, on any device.
    async function beginFromLink() {
      state.ready = true;
      title.textContent = titles.booking;
      try {
        const result = await api('booking-link', { key: state.key });
        state.status = result.status;
        state.canBook = result.can_book === true;
        state.bookedOn = result.booked_on || null;
        if (state.canBook) {
          const welcome = dialog.querySelector('.bd-welcome');
          welcome.textContent = 'Welcome back. We have your details, so just pick a time.';
          welcome.hidden = false;
          return show('booking', false);
        }
        if (result.status === 'booked') {
          state.bookedWith = result.booked_with || '';
          state.canChange = result.can_change === true;
          return showManage();
        }
        return finish('<strong>We have your demo request.</strong><p>Our team will be in touch to arrange a time that suits you.</p>', true);
      } catch (failure) {
        const gone = failure.status === 404 || failure.status === 410 || failure.status === 400;
        if (gone) bookingLink.clear();
        state.key = null;
        return finish(gone
          ? '<strong>This booking link has expired or is incomplete.</strong><p>Check you used the whole link from your email. Otherwise, close this and start a new demo request, or email <a href="mailto:info@bunya.ai">info@bunya.ai</a>.</p>'
          : '<strong>We could not open your booking just now.</strong><p>Please reload this page in a moment to try again, or email <a href="mailto:info@bunya.ai">info@bunya.ai</a>.</p>', true, gone ? 'This link didn’t work.' : 'Let’s try that again.');
      }
    }

    async function begin() {
      // A saved token: carry on where the visitor left off, on this device.
      const saved = storage.get(kind);
      state.ready = true;
      if (!saved?.token) return show('email', false);
      try {
        const result = await api('resume', { token: saved.token });
        state.token = saved.token;
        state.started = true;
        state.status = result.status;
        state.requestRef = result.request_ref || null;
        if (result.fields) {
          state.answers = result.fields;
          fill();
          // Consent is given at submission and not kept with a draft, so a finished draft reopens at
          // the priorities step, where the consent boxes are.
          const resumeAt = { email: 'firm', firm: 'priorities', priorities: 'priorities' }[result.current_step] || 'email';
          dialog.querySelector('.bd-welcome').hidden = false;
          return show(resumeAt, false);
        }
        // Finished, or submitted more than a day ago (an earlier request): start a new request.
        if (result.stale || result.preference_state !== 'not_answered') { storage.clear(kind); state.token = null; state.started = false; state.requestRef = null; return show('email', false); }
        state.canBook = result.can_book === true;
        state.bookedOn = result.booked_on || null;
        if (demo && result.status === 'booking_pending' && state.canBook) return show('booking', false);
        return toPreferences();
      } catch (failure) {
        if (failure.status === 404 || failure.status === 410) storage.clear(kind);
        state.token = null;
        state.started = false;
        return show('email', false);
      }
    }

    async function submitStep() {
      const step = state.step;
      clearErrors();
      dialog.querySelector('.bd-welcome').hidden = true;
      if (ORDER.slice(0, 3).includes(step)) {
        for (const control of controls(step)) if (control.type !== 'checkbox' && control.value) control.value = control.value.trim();
        const invalid = controls(step).find(control => !control.checkValidity());
        if (invalid) {
          const message = invalid.name === 'work_email' ? ERRORS.invalid_email : invalid.name === 'consent' ? 'Please tick the box to agree to the privacy notice.' : 'Please complete the required fields.';
          markError('validation');
          return showError(message, invalid);
        }
        collect();
        setBusy(true);
        try {
          if (step === 'email' && !state.started) {
            // The same token on a retry, so a start that did reach the CRM is found, not repeated.
            if (!state.token) { state.token = newToken(); storage.set(kind, { token: state.token }); }
            let result;
            for (let attempt = 1; !result; attempt++) {
              const cf_token = await humanToken();
              try {
                result = await api('start', { token: state.token, form_type: kind, fields: { work_email: state.answers.work_email }, source_page: location.href.split(/[?#]/)[0], attribution, cf_token });
              } catch (failure) {
                humanUsed(false);
                // A dropped connection: once back in view, start again with a fresh check (the
                // first token may have been spent). The same resume token finds a draft it made.
                if (failure.code !== 'network' || attempt > 1) throw failure;
                await inView();
                clarity('event', 'forms_retry_start');
              }
            }
            humanUsed(true);
            state.started = true;
            state.status = result.status;
            state.requestRef = result.request_ref || null;
          } else {
            await api('save', { token: state.token, form_type: kind, step, fields: state.answers });
          }
          setBusy(false);
          show(ORDER[ORDER.indexOf(step) + 1]);
        } catch (failure) {
          setBusy(false);
          next.textContent = 'Continue →';
          if (failure.status === 404 || failure.status === 410) { storage.clear(kind); state.token = null; state.started = false; }
          apiError(failure);
        }
        return;
      }
      if (step === 'review') {
        setBusy(true, 'Submitting…');
        try {
          const result = await api('submit', {
            token: state.token, fields: state.answers, consent: form.elements.consent.checked,
            marketing_consent: form.elements.marketing_consent.checked, consent_version: config.consent.version,
          });
          if (result.accepted !== true) throw { code: 'default' };
          state.status = result.status;
          state.emailStatus = result.email_status;
          if (result.request_ref) state.requestRef = result.request_ref;
          state.canBook = result.can_book === true;
          setBusy(false);
          // Measures accepted requests only; nothing the visitor typed is sent to analytics.
          if (typeof window.gtag === 'function' && !result.duplicate) window.gtag('event', 'enquiry_form_accepted', { enquiry_type: demo ? 'book_demo' : 'test_drive', form_version: 'v2', page_path: location.pathname });
          // Upgrade: Clarity always keeps the recording of a submitted request.
          mark('submitted');
          clarity('upgrade', `${kind}_submitted`);
          if (demo && state.canBook && result.status === 'booking_pending') show('booking');
          else toPreferences();
        } catch (failure) {
          setBusy(false);
          next.textContent = buttons.review;
          if (failure.code === 'required' && failure.field) {
            const at = ORDER.find(s => spec.steps[s]?.fields.includes(failure.field)) || (failure.field === 'consent' ? 'priorities' : 'review');
            show(at);
          }
          apiError(failure);
        }
        return;
      }
      if (step === 'booking') {
        const chosen = form.querySelector('[name=booking_slot]:checked');
        if (!chosen) { markError('validation'); return showError('Choose a day and a time for your demo.', form.querySelector('[name=booking_slot]')); }
        setBusy(true, state.rescheduling ? 'Moving…' : 'Booking…');
        try {
          const result = await api('book', { ...(state.key ? { key: state.key } : { token: state.token }), start: chosen.value, time_zone: visitorZone, ...(state.rescheduling ? { reschedule: true } : {}) });
          state.status = 'booked';
          state.bookedOn = result.start || chosen.value;
          state.booking = result;
          setBusy(false);
          if (typeof window.gtag === 'function' && !result.duplicate) window.gtag('event', result.rescheduled ? 'demo_rescheduled' : 'demo_booked', { form_version: 'v2', page_path: location.pathname, booked_from: state.key ? 'email_link' : 'popup' });
          mark(result.rescheduled ? 'rescheduled' : 'booked');
          if (!state.key) return toPreferences();
          const when = bookedWhen();
          const withWhom = ' with the Bunya team';
          if (result.rescheduled) {
            state.rescheduling = false;
            return finish(`<strong>Your demo has moved to ${esc(when)}${withWhom}.</strong><p>We’ve sent you the new time. Your Teams link stays the same.</p>${bookingLinks()}`, true, 'All set.');
          }
          bookingLink.clear();
          finish(`<strong>Your demo is booked${when ? ` for ${esc(when)}` : ''}${withWhom}.</strong><p>We’ve sent you a calendar invite with the Teams link; accept it to keep the demo in your calendar. See you soon.</p>${bookingLinks()}`, true);
        } catch (failure) {
          setBusy(false);
          next.textContent = state.rescheduling ? 'Move my demo →' : buttons.booking;
          if (failure.code === 'slot_taken' || failure.code === 'invalid_time') {
            markError(failure.code);
            await loadSlots();
            return showError(ERRORS[failure.code]);
          }
          apiError(failure);
        }
        return;
      }
      if (step === 'preferences') {
        const chosen = [...form.querySelectorAll('[name=content_preferences]:checked')].map(box => box.value);
        if (!chosen.length) { markError('validation'); return showError('Choose at least one, or select Skip for now.', form.querySelector('[name=content_preferences]')); }
        return savePreferences('saved', chosen);
      }
      if (step === 'done') dialog.close();
    }

    async function savePreferences(preferenceState, chosen = []) {
      setBusy(true);
      try {
        await api('preferences', { token: state.token, preference_state: preferenceState, content_preferences: chosen });
        setBusy(false);
        const thanks = preferenceState === 'saved' ? 'Thanks. We’ll use that to make your next step more useful.' : 'No problem.';
        finish(demo
          ? `<strong>${state.status === 'booked' ? `Your demo is booked${bookedWhen() ? ` for ${esc(bookedWhen())}` : ''}.` : 'Your demo request is in.'}</strong><p>${thanks} ${state.status === 'booked' ? 'See you soon.' : 'Watch your inbox for the next step.'}</p>`
          : `<strong>Enjoy your test drive.</strong><p>${thanks}</p><p><a href="${esc(demoLink())}">Open the Command Centre demo ↗</a></p>`);
      } catch (failure) {
        setBusy(false);
        next.textContent = buttons.preferences;
        apiError(failure);
      }
    }

    // Any unexpected failure shows a message and keeps the answers, rather than doing nothing.
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (state.busy) return;
      submitStep().catch(failure => {
        console.error('Bunya form:', failure);
        markError('default');
        setBusy(false);
        next.textContent = buttons[state.step] || 'Continue →';
        showError(ERRORS.default);
      });
    });
    form.addEventListener('input', event => { if (event.target.getAttribute('aria-invalid')) { event.target.removeAttribute('aria-invalid'); error.hidden = true; } });
    dialog.querySelector('.bd-prev').addEventListener('click', () => { collect(); show(ORDER[Math.max(0, ORDER.indexOf(state.step) - 1)]); });
    dialog.querySelector('.bd-skip').addEventListener('click', () => { if (!state.busy) savePreferences('skipped'); });
    picker.days.addEventListener('change', event => {
      if (event.target.name !== 'booking_day') return;
      clearErrors();
      renderTimes(event.target.value);
      picker.timeGroup.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    picker.times.addEventListener('change', () => clearErrors());
    picker.more.addEventListener('click', () => {
      state.daysShown += DAYS_SHOWN;
      renderDays(form.querySelector('[name=booking_day]:checked')?.value || state.days[0].key);
      picker.days.querySelectorAll('input')[state.daysShown - DAYS_SHOWN]?.focus();
    });
    dialog.querySelector('.bd-later').addEventListener('click', () => {
      if (state.rescheduling) { state.rescheduling = false; return showManage(); }
      if (state.key) return finish('<strong>No problem.</strong><p>Use the link in your email whenever you’re ready to choose a time.</p>', true, 'Whenever you’re ready.');
      finish(`<strong>Your demo request is saved.</strong><p>No meeting has been booked yet. ${state.canBook ? 'We’ll email you a link to choose a time whenever you’re ready, and our team will follow up.' : 'Our team will be in touch to arrange a time.'}</p>`);
    });
    picker.retry.addEventListener('click', () => loadSlots());
    dialog.querySelector('.bd-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      document.documentElement.classList.remove('bd-locked');
      if (state.step !== 'done') mark('closed_at_' + state.step);
      if (state.step === 'done') {
        state.answers = {}; state.token = null; state.started = false; state.key = null; state.rescheduling = false; form.reset(); state.ready = false;
        dialog.querySelector('.bd-welcome').textContent = 'Welcome back. We kept your answers so you can carry on.';
      }
      state.trigger?.focus?.();
    });

    journeys[kind] = {
      async open(trigger, key) {
        state.trigger = trigger || document.activeElement;
        document.documentElement.classList.add('bd-locked');
        dialog.showModal();
        if (key) { state.key = key; await beginFromLink(); }
        else {
          if (!state.ready) { title.textContent = titles.email; await begin(); }
          // Only a new request is checked: a resumed or submitted one passed when it started.
          prepareHuman();
        }
        title.focus();
      },
    };
    return journeys[kind];
  }

  // Every Book a Demo / Test Drive link on the site opens the matching popup.
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
    const opener = event.target.closest('[data-forms-v2-open]');
    const link = opener ? null : event.target.closest('a[href]');
    let kind = opener?.dataset.formsV2Open;
    if (link && (!link.target || link.target === '_self')) {
      try {
        const url = new URL(link.href, location.href);
        if (url.origin === location.origin) kind = pageKind(url.pathname);
      } catch { /* not a URL */ }
    }
    if (!kind || !config.journeys[kind]) return;
    event.preventDefault();
    journey(kind).open(opener || link);
  });

  // The standalone /booking/ and /test-drive/ pages open their journey straight away.
  // The emailed "Choose a time" link (/booking/?key=…) opens the demo's time picker instead.
  const auto = document.body?.dataset.formsV2Auto;
  const linkKey = auto === 'demo' ? bookingLink.take() : null;
  if (auto && config.journeys[auto]) journey(auto).open(document.querySelector(`[data-forms-v2-open="${auto}"]`), linkKey);
})();
