/* Minimal pages. Every answer, panel and card is in the page HTML; this only switches what is shown.
 * 1. Tab groups (.ask-qs): "Ask the file", the workflow explorer, the step explorer.
 * 2. Sticky index (.sheet-nav): marks the part of the page in view.
 * 3. FAQ search (#faq-q): filters the answers across every topic.
 * 4. Guide library (.lib-grid): topic filters and search. */
(function () {
  document.querySelectorAll('.ask-qs').forEach(function (list) {
    var tabs = [].slice.call(list.querySelectorAll('[role=tab]'));
    function pick(i, focus) {
      tabs.forEach(function (t, j) {
        var on = j === i, panel = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        if (panel) panel.hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(i); });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? i - 1 : null;
        if (n === null) return;
        e.preventDefault(); pick((n + tabs.length) % tabs.length, true);
      });
    });
  });

  var links = [].slice.call(document.querySelectorAll('.sheet-nav a[href^="#"]'));
  if (links.length && 'IntersectionObserver' in window) {
    var mark = function (id) {
      links.forEach(function (a) {
        if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) mark(e.target.id); });
    }, { rootMargin: '-30% 0px -65% 0px' });
    links.forEach(function (a) { var el = document.getElementById(a.getAttribute('href').slice(1)); if (el) io.observe(el); });
  }

  var q = document.getElementById('faq-q');
  if (q) {
    var items = [].slice.call(document.querySelectorAll('.faq-topics details'));
    var topics = [].slice.call(document.querySelectorAll('.faq-topics .sheet-body > article'));
    var count = document.getElementById('faq-count'), none = document.getElementById('faq-none'), base = count.textContent;
    q.addEventListener('input', function () {
      var term = q.value.trim().toLowerCase(), shown = 0;
      items.forEach(function (d) {
        var hit = !term || d.textContent.toLowerCase().indexOf(term) > -1;
        d.hidden = !hit; if (hit) shown++;
      });
      topics.forEach(function (t) { t.hidden = !!term && !t.querySelector('details:not([hidden])'); });
      count.textContent = term ? shown + (shown === 1 ? ' answer matches' : ' answers match') : base;
      if (none) none.hidden = shown > 0;
    });
  }

  var grid = document.querySelector('.lib-grid:not(.two)');
  if (grid) {
    var cards = [].slice.call(grid.children), btns = [].slice.call(document.querySelectorAll('.lib-filters button'));
    var lq = document.getElementById('lib-q'), lnone = document.getElementById('lib-none'), topic = 'all';
    var apply = function () {
      var term = lq ? lq.value.trim().toLowerCase() : '', n = 0;
      cards.forEach(function (c) {
        var ok = (topic === 'all' || c.getAttribute('data-topic') === topic) && (!term || c.textContent.toLowerCase().indexOf(term) > -1);
        c.hidden = !ok; if (ok) n++;
      });
      if (lnone) lnone.hidden = n > 0;
    };
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        topic = b.getAttribute('data-topic');
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        apply();
      });
    });
    if (lq) lq.addEventListener('input', apply);
  }
})();
