document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('[data-bunya-form]');
  if (!form) return;
  const config = window.BUNYA_FORMS_CONFIG || {};
  const path = form.dataset.bunyaForm;
  const status = document.getElementById('form-status');
  const button = form.querySelector('button[type="submit"]');
  const secureUrl = value => { try { return new URL(value).protocol === 'https:'; } catch { return false; } };
  const ready = secureUrl(config.endpoint) && secureUrl(config.privacyUrl) && !!config.privacyVersion && (path !== 'demo' || secureUrl(config.bookingsUrl));
  document.getElementById('preview-note').hidden = ready;
  if (secureUrl(config.privacyUrl)) {
    document.getElementById('privacy-link').href = config.privacyUrl;
    document.getElementById('privacy-note').hidden = true;
  }
  const params = new URLSearchParams(location.search);
  const campaign = {};
  ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(key => {
    if (params.has(key)) campaign[key] = params.get(key).slice(0, 250);
  });
  // Only explicit attribution is carried; contact details are never saved in the browser.
  document.querySelectorAll('.bf-intro a').forEach(link => {
    const url = new URL(link.href);
    Object.entries(campaign).forEach(([key,value]) => url.searchParams.set(key,value));
    if (params.has('source')) url.searchParams.set('source',params.get('source').slice(0,150));
    link.href = url.href;
  });
  let sending = false;
  const submissionId = crypto.randomUUID();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    if (!ready) {
      status.textContent = 'Preview checked: your required fields are complete. Nothing has been sent. Live submissions will be enabled once the booking, privacy and email connections are configured.';
      status.focus();
      return;
    }
    const data = new FormData(form);
    const fields = {};
    ['first_name','last_name','role_title','work_email','phone','firm_name','client_groups_band','staff_band','current_software','timeframe','focus_notes','prompt_reason'].forEach(key => {
      if (data.has(key)) fields[key] = String(data.get(key)).trim();
    });
    fields.work_email = fields.work_email.toLowerCase();
    const payload = {
      schema_version: 1, submission_id: submissionId, path, ...fields,
      primary_need: data.getAll('primary_need'),
      consent: data.has('consent'), marketing_consent: data.has('marketing_consent'),
      privacy_version: config.privacyVersion,
      attribution: { lead_source: path, button_source: (params.get('source') || path).slice(0,150), landing_page: location.origin + location.pathname, ...campaign }
    };
    sending = true; button.disabled = true; status.textContent = 'Sending your request…';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(config.endpoint, {method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':submissionId},body:JSON.stringify(payload),signal:controller.signal,credentials:'omit'});
      if (!response.ok) throw new Error('Submission failed');
      const result = await response.json();
      if (result.accepted !== true) throw new Error('Not accepted');
      if (path === 'demo') {
        status.textContent = 'Your details have been received. Choose a time to complete your booking.';
        const link = document.createElement('a');
        link.href = config.bookingsUrl; link.className = 'hp-text-link'; link.textContent = 'Open the booking calendar ↗';
        status.append(document.createElement('br'),link);
        location.assign(config.bookingsUrl);
      } else {
        if (result.email_status !== 'sent') throw new Error('Email unconfirmed');
        status.textContent = 'Check your inbox — your demo link is on its way. If it does not arrive, check your junk folder or contact info@bunya.ai.';
        form.reset();
      }
      button.hidden = true;
    } catch {
      status.textContent = 'We could not confirm your request was completed. Please try again, or email info@bunya.ai. Your entries are still here.';
    } finally {
      clearTimeout(timer); sending = false; button.disabled = false; status.focus();
    }
  });
});
