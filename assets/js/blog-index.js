/* Blog index: topic filter + calm scroll reveals. No library needed; IntersectionObserver + CSS transitions only. */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  /* Reveal: elements fade and rise once, in order, as they enter */
  var io = null;
  if (!reduce && 'IntersectionObserver' in w) {
    root.classList.add('bx-anim');
    io = new IntersectionObserver(function (entries) {
      var shown = entries.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
      shown.sort(function (a, b) { return a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left; });
      shown.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i, 5) * 90 + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
        setTimeout(function () { el.style.transitionDelay = ''; }, 1600);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    $$('.bx-hero .bc, [data-rv], .ac').forEach(function (el) { io.observe(el); });
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
