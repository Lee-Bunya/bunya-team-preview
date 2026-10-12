/* PREVIEW ONLY: never port this file to Production.
   The Book a demo popup (js/forms-v2.js) is the live site's, unchanged. On bunya.ai it talks to
   /api/forms/v2, which saves the request in the CRM, emails the visitor and books the sales calendar.
   This preview has no API, so this file answers those calls in the browser instead: every step,
   the time picker and the confirmation work, and nothing leaves this browser.
   It also makes Book a demo links open the popup when the site is served from a sub-folder
   (the live script only recognises /booking/ at the site root). */
(() => {
  const config = window.BUNYA_FORMS_V2;
  if (!config) return;

  // Book a demo links open the popup, wherever the preview is hosted.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || link.dataset.formsV2Open) return;
    try {
      const url = new URL(link.href, location.href);
      if (url.origin === location.origin && /(?:^|\/)booking(?:\.html|\/)?$/.test(url.pathname)) link.dataset.formsV2Open = 'demo';
    } catch { /* not a URL */ }
  }, true);

  // Say so in the popup itself.
  const style = document.createElement('style');
  style.textContent = '.bd-preview-note{flex:1;margin:0 16px;font-size:12px;line-height:1.35;color:#6a7f82}';
  document.head.append(style);
  new MutationObserver(() => {
    for (const top of document.querySelectorAll('.bd-modal .bd-top:not([data-preview])')) {
      top.dataset.preview = '';
      const note = document.createElement('span');
      note.className = 'bd-preview-note';
      note.textContent = 'Preview: nothing you enter is sent, saved or booked.';
      top.querySelector('.bd-brand')?.after(note);
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  // Requests live in this browser only, keyed by the popup's resume token.
  const KEY = 'bunya.preview.forms.';
  const load = token => { try { return JSON.parse(localStorage.getItem(KEY + token) || 'null'); } catch { return null; } };
  const keep = (token, request) => { try { localStorage.setItem(KEY + token, JSON.stringify(request)); } catch { /* private window */ } };
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));

  // Example times: weekdays for the next three weeks, Brisbane business hours (UTC+10, no daylight saving).
  function slots() {
    const out = [];
    const now = Date.now();
    for (let d = 1; d <= 21; d++) {
      const day = new Date(now + d * 864e5);
      const y = day.getUTCFullYear(), m = day.getUTCMonth(), date = day.getUTCDate();
      const weekday = new Date(Date.UTC(y, m, date)).getUTCDay();
      if (weekday === 0 || weekday === 6) continue;
      for (const hour of [9, 10, 11, 13, 14, 15]) out.push(new Date(Date.UTC(y, m, date, hour - 10)).toISOString());
    }
    return out;
  }

  function answer(op, body) {
    const token = body.token;
    const request = token ? load(token) : null;
    const missing = { status: 404, body: { error: 'not_found' } };
    switch (op) {
      case 'start': {
        const made = request || { request_ref: uuid(), form_type: body.form_type, status: 'draft', current_step: 'email', fields: {}, preference_state: 'not_answered' };
        made.fields = { ...made.fields, ...(body.fields || {}) };
        keep(token, made);
        return { body: { request_ref: made.request_ref, form_type: made.form_type, status: made.status, current_step: made.current_step } };
      }
      case 'save':
        if (!request) return missing;
        request.fields = { ...(body.fields || {}) };
        request.current_step = body.step;
        keep(token, request);
        return { body: { status: request.status, current_step: request.current_step } };
      case 'resume':
        if (!request) return missing;
        if (request.status === 'draft') return { body: { request_ref: request.request_ref, form_type: request.form_type, status: 'draft', current_step: request.current_step, fields: request.fields } };
        return { body: { request_ref: request.request_ref, form_type: request.form_type, status: request.status, current_step: 'review', preference_state: request.preference_state, can_book: request.status === 'booking_pending', booked_on: request.booked_on } };
      case 'status':
        if (!request) return missing;
        return { body: { status: request.status, preference_state: request.preference_state } };
      case 'submit': {
        if (!request) return missing;
        const duplicate = request.status !== 'draft';
        if (!duplicate) { request.fields = { ...(body.fields || {}) }; request.status = 'booking_pending'; keep(token, request); }
        return { body: { accepted: true, duplicate, status: request.status, email_status: 'scheduled', can_book: request.status === 'booking_pending', request_ref: request.request_ref } };
      }
      case 'slots':
        return { body: { time_zone: 'Australia/Brisbane', duration_minutes: 0, slots: slots() } };
      case 'book': {
        if (!request) return missing;
        request.status = 'booked';
        request.booked_on = body.start;
        keep(token, request);
        return { body: { status: 'booked', start: body.start, end: new Date(Date.parse(body.start) + 36e5).toISOString(), staff_name: '', join_url: '' } };
      }
      case 'preferences':
        if (!request) return missing;
        request.preference_state = body.preference_state;
        keep(token, request);
        return { body: { preference_state: request.preference_state } };
      default: // booking-link and cancel come from emailed links, which the preview never sends
        return missing;
    }
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    const base = new URL(config.api + '/', location.href);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return realFetch(input, init);
    let body = {};
    try { body = JSON.parse(init.body || '{}'); } catch { /* empty */ }
    await new Promise(resolve => setTimeout(resolve, 450)); // feels like a network round trip
    const reply = answer(url.pathname.slice(base.pathname.length), body);
    return new Response(JSON.stringify(reply.body), { status: reply.status || 200, headers: { 'Content-Type': 'application/json' } });
  };
})();
