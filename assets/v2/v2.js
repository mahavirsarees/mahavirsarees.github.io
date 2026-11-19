/* Mahavir Sarees v2 — header, WhatsApp links, runway lookbook, enquiry form, motion. No dependencies except optional GSAP. */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  var WA = '919920753269';
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function wa(msg) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg); }
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  /* WhatsApp links: <a data-wa="message"> */
  $$('[data-wa]').forEach(function (a) {
    a.href = wa(a.getAttribute('data-wa'));
    a.target = '_blank'; a.rel = 'noopener';
  });

  /* Header: solid after hero, hide on scroll down, mobile menu */
  var hdr = $('.hdr'), lastY = 0;
  function onScroll() {
    var y = w.scrollY || 0;
    if (!hdr) return;
    hdr.classList.toggle('solid', y > 40);
    if (!hdr.classList.contains('open')) hdr.classList.toggle('hide', y > 500 && y > lastY + 4);
    if (y < lastY - 4) hdr.classList.remove('hide');
    lastY = y;
  }
  w.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var mb = $('.menu-btn');
  if (mb) {
    mb.addEventListener('click', function () {
      var open = hdr.classList.toggle('open');
      mb.setAttribute('aria-expanded', open ? 'true' : 'false');
      d.body.style.overflow = open ? 'hidden' : '';
    });
    $$('.nav a').forEach(function (a) {
      a.addEventListener('click', function () { hdr.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); d.body.style.overflow = ''; });
    });
  }

  /* Collections exhibition: keyboard/touch-friendly active panel */
  var panels = $$('.panel');
  panels.forEach(function (p, i) {
    p.addEventListener('mouseenter', function () { panels.forEach(function (q) { q.classList.toggle('is-on', q === p); }); });
    p.addEventListener('focus', function () { panels.forEach(function (q) { q.classList.toggle('is-on', q === p); }); });
  });

  /* Store video plays only while visible */
  var vid = $('.stage video');
  if (vid && !reduce && 'IntersectionObserver' in w) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); } else vid.pause(); });
    }, { threshold: .3 }).observe(vid);
  }

  /* Wholesale enquiry form -> WhatsApp */
  var form = $('#ws-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements, err = $('.form-err', form);
      var name = f.name.value.trim(), store = f.store.value.trim(), city = f.city.value.trim(),
          phone = f.phone.value.replace(/[^\d+]/g, ''), msg = f.message.value.trim();
      if (!name || !city || phone.replace(/\D/g, '').length < 10) {
        err.textContent = 'Please add your name, city and a 10-digit WhatsApp number.';
        return;
      }
      err.textContent = '';
      var text = 'Namaste Mahavir Sarees, I have a wholesale enquiry.\n\n' +
        'Name: ' + name + '\n' +
        (store ? 'Business / Store: ' + store + '\n' : '') +
        'City: ' + city + '\n' +
        'WhatsApp: ' + phone + '\n' +
        (msg ? '\nEnquiry: ' + msg : '');
      var url = wa(text), go = $('.form-go', form);
      if (go) { go.href = url; go.hidden = false; }
      var win = null; try { win = w.open(url, '_blank', 'noopener'); } catch (x) {}
    });
  }

  /* Runway lookbook */
  var stage = $('.rw-stage');
  if (stage) runway(stage);

  function runway(stage) {
    var cards = $$('.rw-card', stage), N = cards.length;
    var titleEl = $('.rw-info h3'), subEl = $('.rw-info p'), countEl = $('.rw-count b'),
        cta = $('.rw-cta a'), live = $('.rw-live');
    var pos = 0, target = 0, dragging = false, startX = 0, startPos = 0, moved = 0, raf = 0, last = -1;

    function wrap(v) { return ((v % N) + N) % N; }
    function layout() {
      var W = stage.clientWidth, small = W < 760;
      var cw = cards[0].offsetWidth || 300;
      var base = small ? -W * 0.12 : -W * 0.26;
      for (var i = 0; i < N; i++) {
        var dd = i - pos; dd = ((dd % N) + N) % N; if (dd > N / 2) dd -= N;
        var c = cards[i], x, z, ry, op, bl, sc;
        if (dd >= 0) {
          x = base + dd * cw * (small ? 0.42 : 0.62) - dd * dd * cw * 0.018;
          z = -dd * (small ? 170 : 230);
          ry = -Math.min(dd, 1) * 10;
          op = dd > 6 ? 0 : 1 - Math.max(0, dd - 4.5) * 0.8;
          bl = Math.min(dd, 6) * 1.5;
          sc = 1;
        } else {
          x = base + dd * cw * 1.25;
          z = -dd * -40;
          ry = 18 * dd;
          op = Math.max(0, 1 + dd * 1.4);
          bl = -dd * 3;
          sc = 1 + dd * 0.06;
        }
        c.style.transform = 'translate(-50%,-50%) translate3d(' + x.toFixed(1) + 'px,0,' + z.toFixed(1) + 'px) rotateY(' + ry.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
        c.style.opacity = op.toFixed(3);
        c.style.filter = bl > 0.2 ? 'blur(' + bl.toFixed(1) + 'px) brightness(' + (1 - Math.min(Math.abs(dd), 6) * 0.06).toFixed(2) + ')' : 'none';
        c.style.zIndex = String(200 - Math.round(Math.abs(dd) * 10) - (dd < 0 ? 5 : 0));
        c.setAttribute('aria-hidden', Math.abs(dd) < 0.5 ? 'false' : 'true');
      }
      var cur = wrap(Math.round(pos));
      if (cur !== last) { last = cur; info(cur); }
    }
    function info(i) {
      var c = cards[i];
      titleEl.textContent = c.getAttribute('data-title');
      subEl.textContent = c.getAttribute('data-sub');
      countEl.textContent = String(i + 1).padStart(2, '0');
      cta.href = wa('Namaste Mahavir Sarees, I would like to enquire about this look: ' + c.getAttribute('data-title') + ' (' + c.getAttribute('data-sub') + '). Please share details and wholesale rates.');
      if (live) live.textContent = 'Look ' + (i + 1) + ' of ' + N + ': ' + c.getAttribute('data-title');
    }
    function tick() {
      var diff = target - pos;
      if (reduce) { pos = target; layout(); raf = 0; return; }
      if (Math.abs(diff) < 0.001 && !dragging) { pos = target; layout(); raf = 0; return; }
      if (!dragging) pos += diff * 0.12;
      layout(); raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }
    function go(step) { target = Math.round(target) + step; kick(); }

    stage.addEventListener('pointerdown', function (e) {
      dragging = true; moved = 0; startX = e.clientX; startPos = pos; target = pos;
      stage.classList.add('drag'); stage.setPointerCapture && stage.setPointerCapture(e.pointerId); kick();
    });
    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX; moved = Math.max(moved, Math.abs(dx));
      var cw = cards[0].offsetWidth || 300;
      pos = startPos - dx / (cw * 0.75); target = pos;
    });
    function end() {
      if (!dragging) return; dragging = false; stage.classList.remove('drag');
      var v = pos - startPos;
      target = Math.abs(v) > 0.15 && Math.abs(v) < 0.5 ? (v > 0 ? Math.ceil(pos) : Math.floor(pos)) : Math.round(pos);
      kick();
    }
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end); stage.addEventListener('pointerleave', end);
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    // click a card behind the front one to bring it forward
    cards.forEach(function (c, i) {
      c.addEventListener('click', function () {
        if (moved > 6) return;
        var dd = i - Math.round(target); dd = ((dd % N) + N) % N; if (dd > N / 2) dd -= N;
        if (dd !== 0) { target = Math.round(target) + dd; kick(); }
      });
    });
    var prev = $('.rw-prev'), next = $('.rw-next');
    prev && prev.addEventListener('click', function () { go(-1); });
    next && next.addEventListener('click', function () { go(1); });
    // arrows also work while the section is on screen
    var inView = false;
    if ('IntersectionObserver' in w) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }, { threshold: .5 }).observe(stage);
    d.addEventListener('keydown', function (e) {
      if (!inView || /INPUT|TEXTAREA|SELECT/.test((d.activeElement || {}).tagName || '') || d.activeElement === stage) return;
      if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1);
    });
    w.addEventListener('resize', layout);
    layout();
  }

  /* Hero: pointer depth on the arched windows */
  var heroStage = $('.hero .stage');
  if (heroStage && !reduce && w.matchMedia('(hover:hover)').matches) {
    var arches = $$('.arch', heroStage), mx = 0, my = 0, cx = 0, cy = 0, hr = 0;
    d.querySelector('.hero').addEventListener('pointermove', function (e) {
      var r = heroStage.getBoundingClientRect();
      mx = (e.clientX - (r.left + r.width / 2)) / r.width; my = (e.clientY - (r.top + r.height / 2)) / r.height;
      if (!hr) hr = requestAnimationFrame(loop);
    });
    function loop() {
      cx += (mx - cx) * 0.08; cy += (my - cy) * 0.08;
      arches.forEach(function (a) {
        var k = parseFloat(a.getAttribute('data-depth') || '1');
        a.style.transform = 'translate3d(' + (cx * 26 * k).toFixed(2) + 'px,' + (cy * 14 * k).toFixed(2) + 'px,0) rotateY(' + (cx * 6 * k).toFixed(2) + 'deg) rotateX(' + (-cy * 4 * k).toFixed(2) + 'deg)';
      });
      hr = (Math.abs(mx - cx) + Math.abs(my - cy) > 0.001) ? requestAnimationFrame(loop) : 0;
    }
  }

  /* Scroll motion (GSAP) */
  if (reduce || !w.gsap || !w.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('js-anim');

  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero-logo', { opacity: 0, y: 20, duration: 1 })
    .from('.hero .h-display .ln > span', { yPercent: 110, duration: 1.1, stagger: .12 }, '-=.6')
    .from('.hero .lede, .hero-ctas, .hero-meta', { opacity: 0, y: 24, duration: .9, stagger: .1 }, '-=.6')
    .from('.arch.a1', { opacity: 0, y: 80, scale: .92, duration: 1.4 }, .2)
    .from('.arch.a2, .arch.a3', { opacity: 0, y: 120, duration: 1.4, stagger: .12 }, .4)
    .from('.stage .frame', { opacity: 0, scale: .96, duration: 1.6 }, .5)
    .from('.stage .tag', { opacity: 0, x: 20, duration: .8 }, 1.1);

  gsap.to('.arch.a1 img', { yPercent: 8, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.arch.a2', { y: -60, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.arch.a3', { y: -110, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  $$('[data-rv]').forEach(function (el) {
    gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  $$('[data-clip]').forEach(function (el) {
    gsap.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'power4.inOut', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    var img = el.querySelector('img');
    if (img) gsap.fromTo(img, { scale: 1.2 }, { scale: 1, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
  gsap.from('.panel', { opacity: 0, y: 60, rotateX: -8, transformPerspective: 1200, duration: 1.2, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.exhibit', start: 'top 82%', once: true } });
  gsap.from('.rw-stage', { opacity: 0, y: 60, duration: 1.3, ease: 'power3.out', scrollTrigger: { trigger: '.rw-stage', start: 'top 85%', once: true } });
  gsap.from('.prod', { opacity: 0, y: 60, duration: 1.1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.products', start: 'top 82%', once: true } });
  gsap.from('.why-item', { opacity: 0, y: 40, duration: 1, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.why-grid', start: 'top 82%', once: true } });
})();
