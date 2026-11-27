/* Mahavir Sarees · Launch sections: showcase controls + one-time scroll reveal.
   Without this file every section still shows its content (first launch, all images). */
(function () {
  'use strict';

  /* ---------- Launch showcase ---------- */
  function initShowcase(root) {
    var data;
    try { data = JSON.parse(root.querySelector('script[type="application/json"]').textContent); }
    catch (e) { return; }                                   // keep the static first launch
    if (!data || data.length < 2) return;

    var media = root.querySelector('.ml-show__media'),
        title = root.querySelector('.ml-show__title'),
        desc  = root.querySelector('.ml-show__desc'),
        link  = root.querySelector('.ml-show__link'),
        num   = root.querySelector('.ml-show__num'),
        total = root.querySelector('.ml-show__total');

    var first = media.querySelector('img');
    var imgs = data.map(function (p, i) {
      var im = i === 0 && first ? first : document.createElement('img');
      if (im !== first) {
        im.src = p.src; im.srcset = p.srcset; im.sizes = p.sizes;
        im.alt = p.alt; im.decoding = 'async'; im.loading = 'lazy';
        im.width = 864; im.height = 1080;
        media.appendChild(im);
      }
      return im;
    });

    var cur = 0;
    function show(i) {
      cur = (i + data.length) % data.length;
      var p = data[cur];
      imgs.forEach(function (im, k) {
        var on = k === cur;
        im.classList.toggle('is-active', on);
        if (on) { im.removeAttribute('aria-hidden'); im.loading = 'eager'; } else { im.setAttribute('aria-hidden', 'true'); }
      });
      title.textContent = p.title; desc.textContent = p.desc;
      if (link && p.wa) { link.href = p.wa; link.setAttribute('aria-label', 'Enquire about ' + p.title + ' on WhatsApp'); }
      num.textContent = String(cur + 1).padStart(2, '0');
    }

    total.textContent = String(data.length).padStart(2, '0');
    root.querySelectorAll('[data-ml-js]').forEach(function (el) { el.hidden = false; });
    root.querySelector('.ml-prev').addEventListener('click', function () { show(cur - 1); });
    root.querySelector('.ml-next').addEventListener('click', function () { show(cur + 1); });
    root.addEventListener('keydown', function (e) {
      if (e.target.closest('a')) return;
      if (e.key === 'ArrowLeft') show(cur - 1);
      else if (e.key === 'ArrowRight') show(cur + 1);
    });
    show(0);
  }

  /* ---------- One-time scroll reveal ---------- */
  function initReveal() {
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;   // content simply stays visible
    var html = document.documentElement;
    html.classList.add('ml-rv');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-ml-reveal]').forEach(function (s) {
      io.observe(s);
      s.addEventListener('focusin', function () {                    // keyboard: never focus a faded element
        if (!s.classList.contains('is-in')) s.classList.add('is-in', 'ml-instant');
      });
    });
    window.addEventListener('beforeprint', function () { html.classList.remove('ml-rv'); });
  }

  function start() {
    document.querySelectorAll('.ml-show').forEach(initShowcase);
    initReveal();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
