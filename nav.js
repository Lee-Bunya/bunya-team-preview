/* Single-source site navigation for the Bunya website.
 * Edit the nav ONCE here and every page updates.
 * Each page only needs, in <head>:   <script src="nav.js" defer></script>
 * and, where the nav should appear:  <div id="site-nav"></div>
 */
(function () {
  var HEADER = `<header class="nav">
  <div class="nav-inner">
    <a href="index.html" class="logo"><img src="assets/brand/bunya-primary.svg" alt="Bunya" class="logo-img"></a>
    <button class="menu-btn" aria-label="Open menu" aria-controls="mMenu" aria-expanded="false" onclick="openMenu()">&#8801;</button>
    <nav class="nav-links">
      <a href="index.html">Home</a>
      <div class="nav-item">
        <a role="button" tabindex="0" aria-label="Platform menu">Platform <svg class="caret" viewBox="0 0 12 12" fill="none"><path d="M2 4 L6 8 L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
        <div class="dropdown">
          <a href="command-centre.html" class="dd-link"><span class="t">Command Centre</span><span class="d">The core platform that runs the practice</span></a>
          <a href="broadcast-hq.html" class="dd-link"><span class="t">Broadcast HQ</span><span class="d">Campaigns, publishing and engagement</span></a>
          <a href="bunya-voice.html" class="dd-link"><span class="t">Bunya Voice</span><span class="d">Calls &amp; meetings, captured to the record</span></a>
        </div>
      </div>
      <a href="how-it-works.html">How it works</a>
      <div class="nav-item">
        <a role="button" tabindex="0" aria-label="Resources menu">Resources <svg class="caret" viewBox="0 0 12 12" fill="none"><path d="M2 4 L6 8 L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
        <div class="dropdown"><a href="resources.html" class="dd-link"><span class="t">Resource library</span><span class="d">Explore all resources</span></a><a href="blog.html" class="dd-link"><span class="t">Insights</span><span class="d">Practical guides and articles</span></a><a href="resources.html#comparisons" class="dd-link"><span class="t">Comparisons</span><span class="d">Evaluate software approaches</span></a><a href="resources.html#tools" class="dd-link"><span class="t">Tools & calculators</span><span class="d">Explore costs and team capacity</span></a><a href="faq.html" class="dd-link"><span class="t">FAQs</span><span class="d">Answers to your questions</span></a></div>
      </div>
      <a href="about.html">About</a>
      <a href="booking.html" class="nav-cta">Book a Demo &#8594;</a>
    </nav>
  </div>
</header>`;
  var MOBILE = `<div class="m-overlay" id="mMenu" role="dialog" aria-modal="true" aria-label="Site navigation" inert>
  <div class="m-top"><a href="index.html" class="logo"><img src="assets/brand/bunya-reversed.svg" alt="Bunya" class="logo-img"></a><button class="m-close" aria-label="Close menu" onclick="closeMenu()">&#10005;</button></div>
  <nav class="m-scroll" aria-label="Mobile navigation">
    <a href="index.html" class="m-direct">Home</a>
    <details class="m-group"><summary>Platform</summary><a href="command-centre.html">Command Centre</a><a href="broadcast-hq.html">Broadcast HQ</a><a href="bunya-voice.html">Bunya Voice</a></details>
    <a href="how-it-works.html" class="m-direct">How it works</a>
    <details class="m-group"><summary>Resources</summary><a href="resources.html">Resource library</a><a href="blog.html">Insights</a><a href="resources.html#comparisons">Comparisons</a><a href="cost-calculator.html">Cost calculator</a><a href="faq.html">FAQs</a></details>
    <a href="about.html" class="m-direct">About</a><a href="contact.html" class="m-direct">Contact</a>
  </nav>
  <div class="m-cta"><a href="test-drive.html?source=mobile-menu">Test Drive it Yourself</a><a href="booking.html?source=mobile-menu">Book a Demo &#8594;</a></div>
</div>`;

  function mount() {
    var slot = document.getElementById('site-nav');
    if (!slot) return;
    slot.outerHTML = HEADER + MOBILE;

    // Highlight the current top-level page (skip the "Book a Demo" CTA button)
    var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var links = document.querySelectorAll('.nav-links > a[href]:not(.nav-cta)');
    for (var i = 0; i < links.length; i++) {
      if ((links[i].getAttribute('href') || '').toLowerCase() === here) {
        links[i].classList.add('active');
        links[i].setAttribute('aria-current', 'page');
      }
    }
  }

  window.openMenu = function () {
    var m = document.getElementById('mMenu');
    if (!m) return;
    m.inert=false; m.classList.add('open'); document.body.classList.add('menu-open');
    document.querySelector('.menu-btn').setAttribute('aria-expanded','true');
    m.querySelector('.m-close').focus();
  };
  window.closeMenu = function () {
    var m=document.getElementById('mMenu');
    if (!m || !m.classList.contains('open')) return;
    m.classList.remove('open'); document.body.classList.remove('menu-open');
    var opener=document.querySelector('.menu-btn');
    opener.setAttribute('aria-expanded','false'); opener.focus(); m.inert=true;
  };
  document.addEventListener('click',function(e){
    if(e.target.closest('#mMenu a[href]')) window.closeMenu();
  });
  document.addEventListener('keydown',function(e){
    var m=document.getElementById('mMenu');
    if(!m || !m.classList.contains('open')) return;
    if(e.key==='Escape'){e.preventDefault();window.closeMenu();}
    if(e.key==='Tab'){
      var items=Array.from(m.querySelectorAll('a[href],button,summary')).filter(function(el){return el.getClientRects().length>0;});
      var first=items[0],last=items[items.length-1];
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  window.addEventListener('resize',function(){if(getComputedStyle(document.querySelector('.menu-btn')).display==='none') window.closeMenu();});

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();

