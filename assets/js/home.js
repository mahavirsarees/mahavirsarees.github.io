/* Mahavir Sarees homepage: soft bento motion (GSAP + ScrollTrigger, self-hosted). */
(function () {
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Store video plays only while visible
  var v = d.querySelector('.s-video video');
  if (v && !reduce && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
    }, { threshold: .25 }).observe(v);
  }
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('js-anim');

  // Hero entrance
  var hero = gsap.utils.toArray('.hb [data-in]');
  gsap.to(hero, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out', stagger: .1, delay: .1 });
  gsap.from('.c-feature .r1', { scale: .6, opacity: 0, duration: 1.4, ease: 'power3.out', delay: .3 });
  gsap.from('.c-feature .r2', { scale: .4, opacity: 0, duration: 1.4, ease: 'power3.out', delay: .45 });
  gsap.from('.feat-cut', { yPercent: 18, opacity: 0, duration: 1.4, ease: 'power3.out', delay: .55 });
  gsap.from('.big-word', { xPercent: -20, opacity: 0, duration: 1.6, ease: 'power3.out', delay: .4 });

  // Everything else rises in as it enters
  gsap.utils.toArray('.mx [data-in]').forEach(function (el) {
    if (el.closest('.hb')) return;
    gsap.to(el, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  gsap.utils.toArray('.pcard').forEach(function (el, i) {
    gsap.from(el, { y: 70, opacity: 0, rotate: i % 2 ? 2 : -2, duration: 1.1, ease: 'power3.out', delay: (i % 4) * .08, scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  var mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', function () {
    // Feature card: rings rotate/drift as you scroll away
    gsap.to('.c-feature .r1', { rotate: 40, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.hb', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.c-feature .r2', { scale: .9, yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hb', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.feat-cut', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hb', start: 'top top', end: 'bottom top', scrub: true } });
    // Floating orbs drift at different speeds
    [['.o1', -160], ['.o2', 260], ['.o3', -320], ['.o4', 200]].forEach(function (o) {
      gsap.to(o[0], { y: o[1], ease: 'none', scrollTrigger: { trigger: '.mx', start: 'top top', end: 'bottom bottom', scrub: true } });
    });
    // Product discs grow as cards cross the middle of the screen
    gsap.utils.toArray('.pstage .disc').forEach(function (el) {
      gsap.fromTo(el, { scale: .82 }, { scale: 1.04, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'center 40%', scrub: true } });
    });
    // Collection images drift inside their cards
    gsap.utils.toArray('.col img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // Gentle 3D tilt on hover for cards
    gsap.utils.toArray('.card, .pcard').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        gsap.to(c, { rotateY: x * 5, rotateX: -y * 5, transformPerspective: 900, duration: .5, ease: 'power2.out' });
      });
      c.addEventListener('pointerleave', function () { gsap.to(c, { rotateY: 0, rotateX: 0, duration: .7, ease: 'power3.out' }); });
    });
  });
  addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
