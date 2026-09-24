/* Single-source site footer for the Bunya website.
 * Edit the footer ONCE here and every page updates.
 * Each page only needs, in <head>:   <script src="footer.js" defer><\/script>
 * and, where the footer should appear: <div id="site-footer"></div>
 */
(function () {
  var FOOTER = `<footer class="site">
  <div class="container">
    <div class="fcols">
      <div>
        <div class="logo"><img src="assets/dana/media/5490b1fa8be0869f.svg" alt="Bunya" class="logo-img"></div>
        <p class="tagline">One operating system for your whole advice business. Command Centre, Broadcast HQ and Bunya Voice, connected through Microsoft.</p><a href="mailto:daniel@bunya.ai">daniel@bunya.ai</a><a href="tel:+61734610370">+61 7 3461 0370</a>
      </div>
      <div><h4>Platform</h4><a href="index.html#whatis">Operating system overview</a><a href="command-centre.html">Command Centre</a><a href="broadcast-hq.html">Broadcast HQ</a><a href="bunya-voice.html">Bunya Voice</a><a href="how-it-works.html">How it works</a></div><div><h4>Resources</h4><a href="resources.html">Resource library</a><a href="blog.html">Insights</a><a href="resources.html#comparisons">Comparisons</a><a href="case-studies.html">Case studies</a><a href="faq.html">FAQs</a></div><div><h4>Company</h4><a href="about.html">About</a><a href="contact.html">Contact</a><a href="grow.html">Grow services</a></div><div><h4>Get started</h4><a href="test-drive.html">Test Drive it Yourself</a><a href="booking.html">Book a Demo</a><a href="cost-calculator.html">Cost calculator</a></div>
    </div>
    <div class="fine"><span>&copy; 2026 Bunya. The operating system for Australian financial advice firms.</span><span>Australia &middot; Power Platform delivery</span></div>
  </div>
</footer>`;
  function mount() {
    var slot = document.getElementById('site-footer');
    if (slot) slot.outerHTML = FOOTER;
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();

