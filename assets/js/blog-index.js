/* Blog index: topic filter, 3D pointer tilt, scroll-in 3D reveals (GSAP + ScrollTrigger, self-hosted). */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = w.matchMedia && w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  /* Topic filter */
  var chips = $$('.chip'), cards = $$('.ac'), empty = d.querySelector('.empty');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var t = c.getAttribute('data-topic');
      chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
      var shown = 0;
      cards.forEach(function (a) {
        var ok = t === 'all' || (a.getAttribute('data-topics') || '').split(' ').indexOf(t) > -1;
        a.hidden = !ok; if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
      if (w.gsap && !reduce) {
        gsap.fromTo(cards.filter(function (a) { return !a.hidden; }), { opacity: 0, y: 40, rotateX: 12 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', overwrite: true });
        if (w.ScrollTrigger) ScrollTrigger.refresh();
      }
      if (t !== 'all') { var l = d.getElementById('guides'); if (l && l.getBoundingClientRect().top > w.innerHeight * 0.6) l.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
    });
  });

  /* 3D pointer tilt + light glare */
  if (fine && !reduce) {
    $$('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 8, raf = 0, rx = 0, ry = 0, gx = 50, gy = 0;
      function apply() { raf = 0; el.style.transform = 'perspective(1000px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)'; el.style.setProperty('--gx', gx + '%'); el.style.setProperty('--gy', gy + '%'); }
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        ry = (px - 0.5) * 2 * max; rx = -(py - 0.5) * 2 * max; gx = Math.round(px * 100); gy = Math.round(py * 100);
        if (!raf) raf = requestAnimationFrame(apply);
      });
      el.addEventListener('pointerleave', function () { rx = 0; ry = 0; if (!raf) raf = requestAnimationFrame(apply); });
    });
  }

  if (reduce || !w.gsap || !w.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  d.documentElement.classList.add('bx-anim');

  /* Hero bento: cards rise in with depth */
  gsap.from('.bx-hero .bc', { opacity: 0, y: 60, rotateX: -10, transformPerspective: 1200, transformOrigin: '50% 100%', duration: 1.1, stagger: 0.09, ease: 'power3.out', clearProps: 'transform' });
  gsap.from('.b-feat .r1', { scale: 0.6, opacity: 0, duration: 1.4, ease: 'power3.out', delay: 0.25 });
  gsap.from('.b-feat .r2', { scale: 0.4, opacity: 0, duration: 1.4, ease: 'power3.out', delay: 0.4 });
  gsap.from('.b-feat .cover', { y: 80, rotateX: 25, opacity: 0, transformPerspective: 1200, duration: 1.4, ease: 'power3.out', delay: 0.5, clearProps: 'opacity' });
  gsap.from('.b-feat .word', { xPercent: -20, opacity: 0, duration: 1.6, ease: 'power3.out', delay: 0.3 });

  /* Featured cover floats a little as you scroll */
  gsap.to('.b-feat .cover', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.b-feat', start: 'top top', end: 'bottom top', scrub: 0.5 } });

  /* Background orbs drift */
  gsap.utils.toArray('.bx-orbs i').forEach(function (o, i) {
    gsap.to(o, { y: (i % 2 ? -1 : 1) * 120, ease: 'none', scrollTrigger: { trigger: '.bx', start: 'top top', end: 'bottom bottom', scrub: 1 } });
  });

  /* Reveals */
  gsap.utils.toArray('[data-rv]').forEach(function (el) {
    gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  /* Article cards: flip up out of the page, one after another */
  gsap.set('.ac', { opacity: 0 });
  ScrollTrigger.batch('.ac', {
    start: 'top 90%', once: true,
    onEnter: function (batch) {
      gsap.fromTo(batch, { opacity: 0, y: 90, rotateX: 28, z: -120, transformOrigin: '50% 100%' },
        { opacity: 1, y: 0, rotateX: 0, z: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out' });
    }
  });

  /* CTA */
  gsap.from('.cta-card', { opacity: 0, scale: 0.94, y: 40, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.cta-card', start: 'top 88%', once: true } });
  gsap.to('.cta-card .k1', { rotate: 40, ease: 'none', scrollTrigger: { trigger: '.cta-card', start: 'top bottom', end: 'bottom top', scrub: 1 } });

  w.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
