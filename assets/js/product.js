/* Product page (Zalora layout): photo switcher, colour, quantity and the WhatsApp order message. */
(function () {
  var d = document, panel = d.getElementById('pz'); if (!panel) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var slides = d.querySelectorAll('.pz-slide'), dots = d.querySelectorAll('.pz-dot'), num = d.getElementById('pz-n'), cur = 0, n = slides.length;
  function show(i) {
    i = (i + n) % n; if (i === cur) return; cur = i;
    slides.forEach(function (s, j) {
      var on = j === i; s.classList.toggle('is-on', on);
      if (on) { s.removeAttribute('aria-hidden'); var im = s.querySelector('img'); if (im && im.loading === 'lazy') im.loading = 'eager'; }
      else s.setAttribute('aria-hidden', 'true');
    });
    dots.forEach(function (t, j) { t.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
    if (num) num.textContent = (i < 9 ? '0' : '') + (i + 1);
  }
  dots.forEach(function (t) { t.addEventListener('click', function () { show(+t.getAttribute('data-i')); }); });
  setTimeout(function () { slides.forEach(function (s) { var im = s.querySelector('img'); if (im && im.loading === 'lazy') im.loading = 'eager'; }); }, 1500);
  var box = d.getElementById('pz-slides'), x0 = null, y0 = null;
  if (box) {
    box.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(cur + (dx < 0 ? 1 : -1)); x0 = null;
    }, { passive: true });
  }
  d.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('input,textarea')) return;
    if (e.key === 'ArrowRight') show(cur + 1); else if (e.key === 'ArrowLeft') show(cur - 1);
  });

  var base = panel.getAttribute('data-wa-base'), wa = panel.getAttribute('data-wa-number');
  var label = d.getElementById('pdx-colour'), qty = d.getElementById('pdx-qty');
  function colour() { var c = panel.querySelector('input[name="colour"]:checked'); return c ? c.value : ''; }
  function count() { var q = parseInt(qty && qty.value, 10); if (!(q >= 1)) q = 1; if (q > 999) q = 999; return q; }
  function update() {
    var c = colour(), q = count(); if (label) label.textContent = c;
    var href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(base + '\nColour: ' + c + '\nQuantity: ' + q);
    d.querySelectorAll('.js-wa').forEach(function (a) { a.href = href; });
  }
  panel.querySelectorAll('input[name="colour"]').forEach(function (r) { r.addEventListener('change', update); });
  panel.querySelectorAll('.pdx-q').forEach(function (b) { b.addEventListener('click', function () { qty.value = Math.max(1, Math.min(999, count() + (+b.getAttribute('data-d')))); update(); }); });
  if (qty) { qty.addEventListener('input', update); qty.addEventListener('blur', function () { qty.value = count(); update(); }); }
  update();

  // entrance motion
  if (!reduce && panel.animate) {
    var cut = d.querySelector('.pz-cut img');
    [['.pz-ring.r1', 0], ['.pz-ring.r2', 120], ['.pz-letter', 60]].forEach(function (a) {
      var el = d.querySelector(a[0]); if (el) el.animate([{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 1100, delay: a[1], easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    });
    if (cut) cut.animate([{ opacity: 0, transform: 'translateY(60px)' }, { opacity: 1, transform: 'none' }], { duration: 1200, delay: 250, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
  }
})();
