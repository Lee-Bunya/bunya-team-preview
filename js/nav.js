/* Single-source site navigation for the Bunya website (v2 rebuild, approved mega-menu, 5 Oct 2026).
 * Each page needs <div id="site-nav"></div> and <body data-nav="cc|sol|gs|cs|res"> for the active item.
 * Same API as the production nav.js, so it ports straight into Production/marketing.
 */
(function () {
  var caret = '<svg class="caret" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 4 L6 8 L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var foot = '<div class="mega-foot"><div><span>New to Bunya? Start with a demo: one meeting to see Command Centre and talk through your firm.</span><a href="booking.html">Book a demo →</a></div></div>';

  var HEADER = '<header class="nav">' +
  '<div class="nav-inner">' +
    '<a href="index.html" class="logo"><img src="assets/71cabd5c4963.png" alt="Bunya AI home" class="logo-img"></a>' +
    '<button class="menu-btn" aria-label="Open menu" aria-controls="mMenu" aria-expanded="false">&#8801;</button>' +
    '<nav class="nav-links" aria-label="Main">' +
      '<button class="nav-trigger" data-key="cc" aria-expanded="false" aria-controls="mega-cc">Command Centre ' + caret + '</button>' +
      '<button class="nav-trigger" data-key="sol" aria-expanded="false" aria-controls="mega-sol">Solutions ' + caret + '</button>' +
      '<a href="getting-started.html" data-key="gs">Getting started</a>' +
      '<a href="case-studies.html" data-key="cs">Customer stories</a>' +
      '<button class="nav-trigger" data-key="res" aria-expanded="false" aria-controls="mega-res">Resources ' + caret + '</button>' +
      '<a href="booking.html" class="nav-cta">Book a demo</a>' +
    '</nav>' +
  '</div>' +

  // Command Centre
  '<div class="mega" id="mega-cc" role="region" aria-label="Command Centre">' +
    '<div class="mega-body mega-cols">' +
      '<div><p class="mega-label">Command Centre</p>' +
        '<a class="mega-link" href="command-centre.html"><strong>Overview</strong><span>One record and one workflow, from first meeting to implemented advice.</span></a>' +
        '<a class="mega-link" href="ai-workflows-integrations.html"><strong>AI workflows &amp; integrations</strong><span>AI prepares the prework. Your existing tools stay connected.</span></a>' +
        '<a class="mega-link" href="security-your-data.html"><strong>Security &amp; your data</strong><span>Built in your own Microsoft 365, with every approval on the record.</span></a>' +
      '</div>' +
      '<div><p class="mega-label">Optional add-ons</p>' +
        '<a class="mega-link" href="bunya-voice.html"><strong>Bunya Voice</strong><span>Calls, meetings &amp; follow-up</span></a>' +
        '<a class="mega-link" href="broadcast-hq.html"><strong>Broadcast HQ</strong><span>Marketing &amp; client communications</span></a>' +
        '<p class="mega-note">Command Centre delivers advice without either add-on.</p>' +
      '</div>' +
      '<a class="mega-feature" href="booking.html"><span class="k">See it with your firm in mind</span><span class="t">One meeting: the demo, and how your firm works today.</span><span class="b">Book a demo ↗</span></a>' +
    '</div>' + foot +
  '</div>' +

  // Solutions
  '<div class="mega" id="mega-sol" role="region" aria-label="Solutions">' +
    '<div class="mega-body">' +
      '<div class="mega-head"><p class="mega-label">Solutions · follow the advice journey</p><a class="text-link" href="index.html#journey">See the whole journey →</a></div>' +
      '<div class="mega-journey">' +
        '<a href="client-onboarding.html"><span class="n">01 · Start</span><strong>Client onboarding</strong><span>Every new client, start to finish, with an owner at each step.</span></a>' +
        '<a href="soa-preparation.html"><span class="n">02 · Prepare</span><strong>SoA preparation &amp; paraplanning</strong><span>Clear the prework between the strategy meeting and the SoA.</span></a>' +
        '<a href="advice-implementation.html"><span class="n">03 · Implement</span><strong>Advice implementation</strong><span>From sign-off to advice in place, with nothing left hanging.</span></a>' +
        '<a href="reviews-fee-consent.html"><span class="n">04 · Every year</span><strong>Client reviews &amp; fee consent</strong><span>Reviews that start on time, with consent tracked every cycle.</span></a>' +
      '</div>' +
      '<a class="mega-across" href="compliance-evidence.html"><span class="k">Across every stage</span><strong>Compliance &amp; evidence</strong><span>When someone asks what was done, the evidence is already there.</span></a>' +
    '</div>' + foot +
  '</div>' +

  // Resources
  '<div class="mega" id="mega-res" role="region" aria-label="Resources">' +
    '<div class="mega-body mega-cols">' +
      '<div><p class="mega-label">Learn</p>' +
        '<a class="mega-link" href="faq.html"><strong>FAQs</strong><span>Straight answers about Bunya, AI and your data.</span></a>' +
        '<a class="mega-link" href="guides.html"><strong>Guides &amp; videos</strong><span>Practical guides for advice firms, and short how-to videos.</span></a>' +
        '<a class="mega-link" href="cost-calculator.html"><strong>Tools &amp; calculators</strong><span>Test your own assumptions on cost and capacity.</span></a>' +
      '</div>' +
      '<div><p class="mega-label">Company</p>' +
        '<a class="mega-link" href="about.html"><strong>About Bunya AI</strong><span>Why we exist, who we are and what you can hold us to.</span></a>' +
        '<a class="mega-link" href="contact.html"><strong>Contact</strong><span>info@bunya.ai · +61 7 3461 0370</span></a>' +
      '</div>' +
      '<a class="mega-feature light" href="cost-calculator.html"><span class="k">Cost &amp; capacity calculator</span><span class="t">How much capacity could your team get back?</span><span class="b">Open the calculator ↗</span></a>' +
    '</div>' + foot +
  '</div>' +
  '</header><div class="nav-scrim" aria-hidden="true"></div>';

  var MOBILE = '<div class="m-overlay" id="mMenu" role="dialog" aria-modal="true" aria-label="Site navigation" inert>' +
    '<div class="m-top"><a href="index.html" class="logo"><img src="assets/84374dbcdaa8.svg" alt="Bunya AI home" class="logo-img"></a><button class="m-close" aria-label="Close menu">&#10005;</button></div>' +
    '<nav class="m-scroll" aria-label="Mobile navigation">' +
      '<details class="m-group"><summary>Command Centre</summary>' +
        '<a href="command-centre.html">Overview</a><a href="ai-workflows-integrations.html">AI workflows &amp; integrations</a><a href="security-your-data.html">Security &amp; your data</a>' +
        '<p class="m-sub">Optional add-ons</p>' +
        '<a href="bunya-voice.html">Bunya Voice<small>Calls, meetings &amp; follow-up</small></a><a href="broadcast-hq.html">Broadcast HQ<small>Marketing &amp; client communications</small></a>' +
      '</details>' +
      '<details class="m-group"><summary>Solutions</summary>' +
        '<a href="client-onboarding.html"><span class="num">01</span>Client onboarding</a><a href="soa-preparation.html"><span class="num">02</span>SoA preparation &amp; paraplanning</a>' +
        '<a href="advice-implementation.html"><span class="num">03</span>Advice implementation</a><a href="reviews-fee-consent.html"><span class="num">04</span>Client reviews &amp; fee consent</a>' +
        '<p class="m-sub">Across every stage</p><a href="compliance-evidence.html">Compliance &amp; evidence</a>' +
      '</details>' +
      '<a href="getting-started.html" class="m-direct">Getting started</a>' +
      '<a href="case-studies.html" class="m-direct">Customer stories</a>' +
      '<details class="m-group"><summary>Resources</summary>' +
        '<a href="faq.html">FAQs</a><a href="guides.html">Guides &amp; videos</a><a href="cost-calculator.html">Tools &amp; calculators</a>' +
        '<p class="m-sub">Company</p><a href="about.html">About Bunya AI</a><a href="contact.html">Contact</a>' +
      '</details>' +
    '</nav>' +
    '<div class="m-cta"><a href="booking.html">Book a demo</a></div>' +
  '</div>';

  function mount() {
    var slot = document.getElementById('site-nav');
    if (!slot) return;
    slot.innerHTML = HEADER + MOBILE;

    var header = slot.querySelector('header.nav');
    var triggers = [].slice.call(slot.querySelectorAll('.nav-trigger'));
    var scrim = slot.querySelector('.nav-scrim');
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var timer = null, hoverAt = 0;

    // Active top-level item from <body data-nav="...">
    var active = document.body.getAttribute('data-nav');
    if (active) slot.querySelectorAll('.nav-links [data-key="' + active + '"]').forEach(function (el) { el.classList.add('active'); });

    function open(btn) {
      clearTimeout(timer);
      var target = btn ? document.getElementById(btn.getAttribute('aria-controls')) : null;
      var switching = target && slot.querySelector('.mega.open') && !target.classList.contains('open');
      header.classList.toggle('nav-switching', !!switching);
      if (switching) setTimeout(function () { header.classList.remove('nav-switching'); }, 40);
      triggers.forEach(function (t) {
        var on = t === btn;
        t.setAttribute('aria-expanded', on ? 'true' : 'false');
        document.getElementById(t.getAttribute('aria-controls')).classList.toggle('open', on);
      });
      scrim.classList.toggle('show', !!btn);
    }
    function closeAll() { open(null); }

    triggers.forEach(function (t) {
      t.addEventListener('click', function () {
        var isOpen = t.getAttribute('aria-expanded') === 'true';
        if (isOpen && Date.now() - hoverAt > 500) closeAll(); else open(t);
      });
      if (canHover) t.addEventListener('mouseenter', function () {
        if (t.getAttribute('aria-expanded') !== 'true') { hoverAt = Date.now(); open(t); }
      });
    });
    if (canHover) {
      header.addEventListener('mouseleave', function () { timer = setTimeout(closeAll, 180); });
      header.addEventListener('mouseenter', function () { clearTimeout(timer); });
      slot.querySelectorAll('.nav-links > a, .logo').forEach(function (a) { a.addEventListener('mouseenter', closeAll); });
    }
    scrim.addEventListener('click', closeAll);

    // Mobile overlay
    var menu = document.getElementById('mMenu');
    var btn = slot.querySelector('.menu-btn');
    function openMenu() { menu.inert = false; menu.classList.add('open'); document.body.classList.add('menu-open'); btn.setAttribute('aria-expanded', 'true'); menu.querySelector('.m-close').focus(); }
    function closeMenu() {
      if (!menu.classList.contains('open')) return;
      menu.classList.remove('open'); document.body.classList.remove('menu-open'); btn.setAttribute('aria-expanded', 'false'); menu.inert = true; btn.focus();
    }
    btn.addEventListener('click', openMenu);
    menu.querySelector('.m-close').addEventListener('click', closeMenu);
    menu.addEventListener('click', function (e) { if (e.target.closest('a[href]')) closeMenu(); });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      closeAll(); closeMenu();
    });
    window.addEventListener('resize', function () { if (getComputedStyle(btn).display === 'none') closeMenu(); else closeAll(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
