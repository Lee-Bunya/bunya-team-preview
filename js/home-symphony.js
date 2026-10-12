/* Homepage prototype (Symphony-inspired layout): hero status chip, notification
 * stack, roles wheel, workspace screens and the sticky stepper. Scroll reveals
 * come from js/symphony.js. Load after site.js (uses ccMount). All data shown is illustrative. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero status chip ---------- */
  var status = document.querySelector('[data-status]');
  var lines = ['Preparing today’s work…', 'Drafting a file note…', 'Building an SoA request pack…', 'Checking review dates…', 'Ready for Alex to approve'];
  // Runs through the day's prework once, then stops on the one decision waiting for a person.
  if (status && !reduce) {
    var si = 0, chip = status.closest('.status-chip');
    var timer = setInterval(function () {
      status.style.opacity = 0;
      setTimeout(function () {
        si++; status.textContent = lines[si]; status.style.opacity = 1;
        if (si === lines.length - 1) { clearInterval(timer); if (chip) chip.classList.add('done'); }
      }, 300);
    }, 1800);
  }

  /* ---------- Notification stack ---------- */
  var ico = {
    note: '<svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
    pack: '<svg viewBox="0 0 24 24"><path d="M4 6h10M4 12h7M4 18h10"/><path d="M17 5l3 3-3 3M14 16l3 3 3-3"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="1.5"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    tick: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>',
    doc: '<svg viewBox="0 0 24 24"><path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>'
  };
  var notes = [
    { i: 'note', t: 'Drafted a file note for the Example Family', k: 'File notes', w: 'Waiting for Alex' },
    { i: 'pack', t: 'Prepared an SoA request pack', k: 'Paraplanning', w: 'Ready for Jordan' },
    { i: 'cal', t: 'Flagged a review due in 6 weeks', k: 'Reviews', w: 'Sample Household' },
    { i: 'tick', t: 'File note approved and saved to the record', k: 'Evidence', w: 'Approved by Alex', done: true },
    { i: 'doc', t: 'Filed 4 documents to the client record', k: 'Onboarding', w: 'Example Family' },
    { i: 'cal', t: 'Prepared fee consent paperwork', k: 'Fee consent', w: 'Waiting for approval' }
  ];
  var stack = document.getElementById('note-stack');
  function card(n) {
    var el = document.createElement('div');
    el.className = 'note' + (n.done ? ' done' : '');
    el.innerHTML = '<span class="ni">' + ico[n.i] + '</span><div><b>' + n.t + '</b><small><i class="k">' + n.k + '</i><i>' + n.w + '</i></small></div><span class="st"></span>';
    return el;
  }
  if (stack) {
    var ni = 0;
    for (; ni < 3; ni++) stack.insertBefore(card(notes[ni]), stack.firstChild);
    if (!reduce) setInterval(function () {
      // the front card finishes, then a new one arrives in front
      var front = stack.firstElementChild; if (front) front.classList.add('done');
      setTimeout(function () {
        var el = card(notes[ni % notes.length]); ni++;
        el.classList.add('enter'); stack.insertBefore(el, stack.firstChild);
        requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.remove('enter'); }); });
        while (stack.children.length > 4) stack.removeChild(stack.lastElementChild);
      }, 700);
    }, 3200);
  }

  /* ---------- Roles wheel ---------- */
  var tasks = ['Fact find', 'File notes', 'SoA requests', 'Implementation', 'Reviews', 'Fee consent', 'Evidence', 'Reporting'];
  var roles = [
    { k: 'Principal', h: 'Grow without simply adding headcount.', p: 'See every client, every handoff and the practice position in one place, with the prework handled.', href: 'getting-started.html', l: 'Getting started', t: [7, 4, 6] },
    { k: 'Adviser', h: 'Approve the work. Don’t assemble it.', p: 'Walk into meetings prepared. File notes and follow-up arrive as drafts for you to check.', href: 'client-onboarding.html', l: 'Client onboarding', t: [0, 1, 4] },
    { k: 'Paraplanner', h: 'Requests that arrive complete.', p: 'The fact find, documents and strategy notes in one pack. Questions go back with context.', href: 'soa-preparation.html', l: 'SoA preparation', t: [2, 0, 3] },
    { k: 'Client services', h: 'No tracker to maintain.', p: 'Every client shows who they’re waiting for, and reviews start from real dates.', href: 'reviews-fee-consent.html', l: 'Reviews & fee consent', t: [5, 4, 3] },
    { k: 'Compliance', h: 'The evidence is already there.', p: 'File notes, approvals and AI use kept on the record, with gaps flagged early.', href: 'compliance-evidence.html', l: 'Compliance & evidence', t: [6, 1, 5] }
  ];
  var wheel = document.getElementById('wheel'), tabsEl = document.getElementById('role-tabs');
  var W = 1000, H = 640, cx = W / 2, cy = H / 2, rIn = 165, rOut = 290;
  function pt(r, deg, sx) { var a = deg * Math.PI / 180; return { x: cx + r * Math.cos(a) * (sx || 1), y: cy + r * Math.sin(a) }; }
  var roleBtns = [], taskEls = [], spokes = [], tabBtns = [];
  if (wheel && tabsEl) {
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">' +
      '<ellipse class="ring" cx="' + cx + '" cy="' + cy + '" rx="' + rIn * 1.25 + '" ry="' + rIn + '"/>' +
      '<ellipse class="ring faint" cx="' + cx + '" cy="' + cy + '" rx="' + rOut * 1.45 + '" ry="' + rOut + '"/>';
    var tPos = tasks.map(function (_, i) { return pt(rOut, -90 + 22.5 + i * 45, 1.45); });
    tPos.forEach(function (p, i) {
      svg += '<line class="spoke" data-t="' + i + '" x1="' + cx + '" y1="' + cy + '" x2="' + p.x.toFixed(1) + '" y2="' + p.y.toFixed(1) + '"/>';
      if (!reduce) svg += '<circle class="travel" r="3.5"><animateMotion dur="' + (5 + i % 3) + 's" begin="' + (i * .7) + 's" repeatCount="1" fill="remove" path="M' + cx + ' ' + cy + ' L' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + '"/></circle>';
    });
    svg += '</svg>';
    wheel.innerHTML = svg + '<div class="w-core"><img src="assets/8b9c16f32c12.svg" alt=""></div>';
    spokes = [].slice.call(wheel.querySelectorAll('.spoke'));
    tasks.forEach(function (t, i) {
      var p = tPos[i], el = document.createElement('span');
      el.className = 'w-task' + (p.x < cx - 5 ? ' left' : '');
      el.style.left = (p.x / W * 100) + '%'; el.style.top = (p.y / H * 100) + '%';
      el.textContent = t; wheel.appendChild(el); taskEls.push(el);
    });
    roles.forEach(function (r, i) {
      var p = pt(rIn, -90 + i * 72, 1.25), b = document.createElement('button');
      b.type = 'button'; b.tabIndex = -1;
      b.className = 'w-role' + (p.x < cx - 5 ? ' left' : '');
      b.style.left = (p.x / W * 100) + '%'; b.style.top = (p.y / H * 100) + '%';
      b.innerHTML = '<i class="dot"></i><span>' + r.k + '</span>';
      b.addEventListener('click', function () { pick(i); });
      wheel.appendChild(b); roleBtns.push(b);

      var tb = document.createElement('button');
      tb.type = 'button'; tb.setAttribute('role', 'tab'); tb.textContent = r.k;
      tb.addEventListener('click', function () { pick(i); });
      tb.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? (i + 1) % roles.length : e.key === 'ArrowLeft' ? (i + roles.length - 1) % roles.length : null;
        if (n !== null) { e.preventDefault(); pick(n); tabBtns[n].focus(); }
      });
      tabsEl.appendChild(tb); tabBtns.push(tb);
    });
  }
  function pick(i) {
    var r = roles[i];
    roleBtns.forEach(function (b, j) { b.classList.toggle('on', j === i); });
    tabBtns.forEach(function (b, j) { b.setAttribute('aria-selected', String(j === i)); b.tabIndex = j === i ? 0 : -1; });
    taskEls.forEach(function (el, j) { el.classList.toggle('hot', r.t.indexOf(j) > -1); });
    spokes.forEach(function (s, j) { s.classList.toggle('hot', r.t.indexOf(j) > -1); });
    var c = document.getElementById('role-copy');
    c.innerHTML = '<h3>' + r.h + '</h3><p>' + r.p + '</p>';
    var l = document.getElementById('role-link'); l.href = r.href; l.textContent = r.l + ' ↗';
  }
  if (roleBtns.length) pick(1);

  /* ---------- Workspace screens ---------- */
  var wl = document.querySelectorAll('#w-list [role=tab]');
  wl.forEach(function (b, i) {
    b.addEventListener('click', function () {
      wl.forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); x.tabIndex = x === b ? 0 : -1; });
      var s = document.getElementById('w-screen');
      document.getElementById('w-bar').textContent = b.dataset.bar;
      s.dataset.title = b.dataset.bar + ', illustrative data';
      if (window.ccMount) ccMount(s, b.dataset.screen);
    });
    if (i) b.tabIndex = -1;
  });

  /* ---------- Sticky stepper (desktop) ---------- */
  var track = document.getElementById('steps-track');
  if (track) {
    var steps = track.querySelectorAll('.step'), dots = track.querySelectorAll('.step-dots i'), cur = 0;
    var mq = matchMedia('(min-width:961px)');
    function onScroll() {
      if (!mq.matches) return;
      var r = track.getBoundingClientRect(), span = r.height - innerHeight;
      var p = Math.min(.999, Math.max(0, -r.top / span));
      var i = Math.floor(p * steps.length);
      if (i === cur) return; cur = i;
      steps.forEach(function (s, j) { s.classList.toggle('on', j === i); });
      dots.forEach(function (d, j) { d.classList.toggle('on', j === i); });
    }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();
  }
})();
