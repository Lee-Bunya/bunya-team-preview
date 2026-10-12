/* Single-source site footer for the Bunya website (v2 rebuild). Needs <div id="site-footer"></div>. */
(function () {
  var FOOTER = '<footer class="site"><div class="container"><div class="fcols">' +
    '<div><div class="logo"><img src="assets/84374dbcdaa8.svg" alt="Bunya AI" class="logo-img"></div>' +
      '<p class="tagline">Bunya AI builds Bunya Command Centre, the practice operating system for Australian financial advice firms. AI prepares the work. Your team approves every step.</p>' +
      '<a href="mailto:info@bunya.ai">info@bunya.ai</a><a href="tel:+61734610370">+61 7 3461 0370</a></div>' +
    '<div><h4>Command Centre</h4><a href="command-centre.html">Overview</a><a href="ai-workflows-integrations.html">AI workflows &amp; integrations</a><a href="security-your-data.html">Security &amp; your data</a><a href="bunya-voice.html">Bunya Voice (add-on)</a><a href="broadcast-hq.html">Broadcast HQ (add-on)</a></div>' +
    '<div><h4>Solutions</h4><a href="client-onboarding.html">Client onboarding</a><a href="soa-preparation.html">SoA preparation &amp; paraplanning</a><a href="advice-implementation.html">Advice implementation</a><a href="reviews-fee-consent.html">Client reviews &amp; fee consent</a><a href="compliance-evidence.html">Compliance &amp; evidence</a></div>' +
    '<div><h4>Get started</h4><a href="getting-started.html">Getting started</a><a href="case-studies.html">Customer stories</a><a href="booking.html">Book a demo</a></div>' +
    '<div><h4>Resources</h4><a href="faq.html">FAQs</a><a href="guides.html">Guides &amp; videos</a><a href="cost-calculator.html">Tools &amp; calculators</a><a href="about.html">About Bunya AI</a><a href="team.html">Meet the team</a><a href="contact.html">Contact</a></div>' +
    '<div class="fine"><span>&copy; 2026 Bunya AI Pty Ltd · ABN 39 700 067 545</span><span>Financial advice software for Australian advice firms · Built on Microsoft 365</span></div>' +
  '</div></div></footer>';

  function mount() {
    var slot = document.getElementById('site-footer');
    if (slot) slot.outerHTML = FOOTER;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
