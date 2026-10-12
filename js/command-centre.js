/* Command Centre page: the "day in Command Centre" tour.
 * Desktop: the tour pins in place and scrolling steps through the five screens.
 * Small screens: the list becomes a row of tabs. Load after site.js (uses ccMount). */
(function () {
  var track = document.getElementById('tour-track');
  var tabs = [].slice.call(document.querySelectorAll('#tour-list [role=tab]'));
  if (!track || !tabs.length) return;
  var screen = document.getElementById('tour-screen');
  var bar = document.getElementById('tour-bar');
  var caption = document.getElementById('tour-caption');
  var dots = track.querySelectorAll('.tour-dots i');
  var wide = matchMedia('(min-width:961px)');
  var current = 0;

  function show(i) {
    if (i === current && screen.querySelector('iframe')) return;
    current = i;
    var tab = tabs[i];
    tabs.forEach(function (t, j) { t.setAttribute('aria-selected', String(j === i)); t.tabIndex = j === i ? 0 : -1; });
    dots.forEach(function (d, j) { d.classList.toggle('on', j === i); });
    bar.textContent = tab.dataset.bar;
    caption.textContent = tab.querySelector('p').textContent;
    screen.dataset.title = tab.dataset.bar + ', illustrative data';
    if (window.ccMount) ccMount(screen, tab.dataset.screen);
  }

  // Desktop: the scroll position inside the pinned tour picks the screen.
  function onScroll() {
    if (!wide.matches) return;
    var r = track.getBoundingClientRect(), span = r.height - innerHeight;
    if (span <= 0) return;
    var p = Math.min(.999, Math.max(0, -r.top / span));
    var i = Math.floor(p * tabs.length);
    if (i !== current) show(i);
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  // Clicking a step: on desktop scroll to its part of the tour; on small screens just switch.
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () {
      if (wide.matches) {
        var top = track.getBoundingClientRect().top + scrollY;
        var span = track.offsetHeight - innerHeight;
        scrollTo({ top: top + span * (i + .5) / tabs.length, behavior: 'smooth' });
      }
      show(i);
    });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? i - 1 : null;
      if (n === null || n < 0 || n >= tabs.length) return;
      e.preventDefault(); tabs[n].click(); tabs[n].focus();
    });
  });
  onScroll();
})();
