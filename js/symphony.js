/* Shared behaviour for pages on the Symphony-inspired design (body.sym).
 * Scroll reveals: elements marked .rv fade up as they arrive. On pages built
 * from Dana's components, the main blocks are marked automatically, so page
 * HTML needs no changes. Load with the other scripts, after site.js. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AUTO = [
    '.section-heading', '.center-heading', '.card-grid > article', '.feature-panel', '.statement-grid',
    '.extensions > .extension', '.delivery-grid > article', '.journey-strip', '.stages > .stage',
    '.ownership-inner', '.closing', '.product-questions > div', '.cc-define-grid', '.cc-trail-wrap',
    '.cc-ledger', '.cc-ai-grid', '.cc-connected-grid'
  ].join(',');
  if (!reduce) document.querySelectorAll('main ' + AUTO.split(',').join(', main ')).forEach(function (el) {
    if (!el.closest('.hero')) el.classList.add('rv');
  });

  // Journey pills: on narrow screens the row scrolls sideways; start with the current stage in view.
  var here = document.querySelector('.jpath [aria-current="page"]');
  function centreHere() {
    var row = here && here.parentNode;
    if (!row || row.scrollWidth <= row.clientWidth) return;
    row.scrollLeft += here.getBoundingClientRect().left - row.getBoundingClientRect().left - (row.clientWidth - here.offsetWidth) / 2;
  }
  centreHere(); addEventListener('load', centreHere);

  var rv = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window) || reduce) { rv.forEach(function (el) { el.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  rv.forEach(function (el) { io.observe(el); });
  // Fallback for throttled observers (background tabs, anchor jumps): reveal anything already near the viewport.
  function sweep() { rv.forEach(function (el) { if (!el.classList.contains('in') && el.getBoundingClientRect().top < innerHeight * .95) el.classList.add('in'); }); }
  addEventListener('scroll', sweep, { passive: true }); addEventListener('hashchange', sweep); setTimeout(sweep, 400);
})();
