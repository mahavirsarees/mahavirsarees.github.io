/* Blog index: topic filter + calm scroll reveals. No library needed; IntersectionObserver + CSS transitions only. */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  /* Reveal: only things that come up from below animate. Anything already on screen,
     above the screen (e.g. after pressing Back), or entering from the top shows at once. */
  var io = null;
  function showNow(el) { el.classList.add('no-tr', 'is-in'); }
  if (!reduce && 'IntersectionObserver' in w) {
    var els = $$('.bx-hero .bc, [data-rv], .ac');
    var start = function () {
      var vh = w.innerHeight;
      io = new IntersectionObserver(function (entries) {
        var below = [];
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          if (e.boundingClientRect.top < vh * 0.5) showNow(e.target); else below.push(e.target);
        });
        below.sort(function (a, b) { var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return ra.top - rb.top || ra.left - rb.left; });
        below.forEach(function (el, i) { el.style.transitionDelay = Math.min(i, 4) * 80 + 'ms'; el.classList.add('is-in'); });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.92) showNow(el); else io.observe(el);
      });
      root.classList.add('bx-anim'); // hide only what is still below the screen
    };
    start();
    // coming back from the browser cache: make sure everything is visible
    w.addEventListener('pageshow', function (e) { if (e.persisted) els.forEach(showNow); });
  }

  /* Topic filter */
  var chips = $$('.chip'), cards = $$('.ac'), empty = d.querySelector('.empty');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var t = c.getAttribute('data-topic'), shown = 0;
      chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
      cards.forEach(function (a) {
        var ok = t === 'all' || (a.getAttribute('data-topics') || '').split(' ').indexOf(t) > -1;
        a.hidden = !ok;
        if (ok) { shown++; a.classList.add('is-in'); }
      });
      if (empty) empty.hidden = shown > 0;
      if (t !== 'all') {
        var l = d.getElementById('guides');
        if (l && l.getBoundingClientRect().top > w.innerHeight * 0.6) l.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });
})();
