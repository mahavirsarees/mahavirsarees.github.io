/* Mahavir Sarees v3 — dark cinematic experience. GSAP + ScrollTrigger (self-hosted). */
(function () {
  'use strict';
  var d = document, w = window, root = d.documentElement;
  var WA = '919920753269';
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = !!(w.gsap && w.ScrollTrigger) && !reduce;
  function wa(msg) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg); }
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  if (hasG) root.classList.add('js-anim');

  /* WhatsApp links */
  $$('[data-wa]').forEach(function (a) { a.href = wa(a.getAttribute('data-wa')); a.target = '_blank'; a.rel = 'noopener'; });

  /* Header */
  var hdr = $('.hdr'), lastY = 0, ticking = false;
  function onScroll() {
    ticking = false;
    var y = w.scrollY || 0;
    hdr.classList.toggle('solid', y > 60);
    if (!hdr.classList.contains('open')) {
      if (y > 600 && y > lastY + 6) hdr.classList.add('hide');
      else if (y < lastY - 6) hdr.classList.remove('hide');
    }
    lastY = y;
  }
  w.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  var mb = $('.menu-btn');
  if (mb) {
    mb.addEventListener('click', function () {
      var open = hdr.classList.toggle('open');
      mb.setAttribute('aria-expanded', open ? 'true' : 'false');
      d.body.style.overflow = open ? 'hidden' : '';
    });
    $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { hdr.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); d.body.style.overflow = ''; }); });
  }

  /* Videos: right source per screen, play only while on screen */
  var small = w.matchMedia('(max-width: 900px)').matches;
  $$('video[data-src]').forEach(function (v) {
    var src = (small && v.getAttribute('data-src-sm')) || v.getAttribute('data-src');
    v.src = src;
    if (v.hasAttribute('data-offset')) v.addEventListener('loadedmetadata', function () { try { v.currentTime = parseFloat(v.getAttribute('data-offset')); } catch (e) {} }, { once: true });
    if (reduce) return;
    if ('IntersectionObserver' in w) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); });
      }, { threshold: 0.05 }).observe(v);
    }
  });

  /* Wholesale form -> WhatsApp */
  var form = $('#ws-form');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, err = $('.form-err', form);
    var name = f.name.value.trim(), store = f.store.value.trim(), city = f.city.value.trim(),
        phone = f.phone.value.replace(/[^\d+]/g, ''), msg = f.message.value.trim();
    if (!name || !city || phone.replace(/\D/g, '').length < 10) { err.textContent = 'Please add your name, city and a 10-digit WhatsApp number.'; return; }
    err.textContent = '';
    var url = wa('Namaste Mahavir Sarees, I have a wholesale enquiry.\n\nName: ' + name + '\n' + (store ? 'Business / Store: ' + store + '\n' : '') + 'City: ' + city + '\nWhatsApp: ' + phone + '\n' + (msg ? '\nEnquiry: ' + msg : ''));
    var go = $('.form-go', form); if (go) { go.href = url; go.hidden = false; }
    try { w.open(url, '_blank', 'noopener'); } catch (x) {}
  });

  /* RAMP WALK data + info panel */
  var ramp = $('.ramp'), rampData = [], rampModels = [], curRamp = -1;
  if (ramp) {
    try { rampData = JSON.parse($('#ramp-data').textContent); } catch (e) {}
    rampModels = $$('.model', ramp);
  }
  function setRampInfo(i) {
    if (i === curRamp || !rampData[i]) return;
    curRamp = i;
    var p = rampData[i], card = $('.ramp-card', ramp);
    card.classList.add('swap');
    setTimeout(function () {
      $('.ramp-count', ramp).textContent = 'Design ' + String(i + 1).padStart(2, '0') + ' / ' + String(rampData.length).padStart(2, '0');
      $('h3', card).textContent = p.name;
      $('.cat', card).textContent = p.cat;
      $('.desc', card).textContent = p.desc;
      var sw = $('.swatches', card); sw.innerHTML = '';
      p.colours.forEach(function (c) {
        var a = d.createElement('a');
        a.className = 'sw' + (c.shown ? ' on' : '');
        a.href = wa('Namaste Mahavir Sarees, please send photos of ' + p.name + ' ' + p.cat + ' in ' + c.name + ' colour.');
        a.target = '_blank'; a.rel = 'noopener';
        a.innerHTML = '<i style="background:' + c.hex + '"></i>' + c.name + (c.shown ? ' · shown' : '');
        sw.appendChild(a);
      });
      $('.sw-note', card).textContent = p.colours.length > 1 ? 'Photos show the ' + p.colours.filter(function (c) { return c.shown; })[0].name + ' colour. Tap any colour to get its photos on WhatsApp.' : 'Comes in a single designer colour, exactly as shown.';
      $('.ramp-enq', card).href = wa('Namaste Mahavir Sarees, I would like to enquire about ' + p.name + ' ' + p.cat + '. Please share details and wholesale rates.');
      $('.ramp-view', card).href = '/' + p.slug + '/';
      $$('.ramp-chips button', ramp).forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      card.classList.remove('swap');
    }, curRamp === 0 && !card.dataset.ready ? 0 : 180);
    card.dataset.ready = '1';
  }
  if (ramp) setRampInfo(0);

  /* Gallery runway (drag / swipe / keys / infinite) */
  var stage = $('.rw-stage');
  if (stage) gallery(stage);
  function gallery(stage) {
    var cards = $$('.rw-card', stage), N = cards.length;
    var titleEl = $('.rw-info h3'), subEl = $('.rw-info p'), countEl = $('.rw-count b'), cta = $('.rw-cta a'), live = $('.rw-live');
    var pos = 0, target = 0, dragging = false, startX = 0, startPos = 0, moved = 0, raf = 0, last = -1;
    function wrap(v) { return ((v % N) + N) % N; }
    function layout() {
      var W = stage.clientWidth, sm = W < 760, cw = cards[0].offsetWidth || 300, base = sm ? -W * 0.12 : -W * 0.26;
      for (var i = 0; i < N; i++) {
        var dd = i - pos; dd = ((dd % N) + N) % N; if (dd > N / 2) dd -= N;
        var x, z, ry, op, sc = 1, br;
        if (dd >= 0) { x = base + dd * cw * (sm ? 0.42 : 0.62) - dd * dd * cw * 0.018; z = -dd * (sm ? 170 : 230); ry = -Math.min(dd, 1) * 10; op = dd > 6 ? 0 : 1 - Math.max(0, dd - 4.5) * 0.8; br = 1 - Math.min(dd, 6) * 0.11; }
        else { x = base + dd * cw * 1.25; z = 40 * dd; ry = 18 * dd; op = Math.max(0, 1 + dd * 1.4); sc = 1 + dd * 0.06; br = 1; }
        var c = cards[i];
        c.style.transform = 'translate(-50%,-50%) translate3d(' + x.toFixed(1) + 'px,0,' + z.toFixed(1) + 'px) rotateY(' + ry.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
        c.style.opacity = op.toFixed(3);
        c.style.filter = dd > 0.3 ? 'blur(' + Math.min(dd * 1.4, 7).toFixed(1) + 'px) brightness(' + br.toFixed(2) + ')' : 'none';
        c.style.zIndex = String(200 - Math.round(Math.abs(dd) * 10) - (dd < 0 ? 5 : 0));
      }
      var cur = wrap(Math.round(pos));
      if (cur !== last) {
        last = cur; var c2 = cards[cur];
        titleEl.textContent = c2.dataset.title; subEl.textContent = c2.dataset.sub;
        countEl.textContent = String(cur + 1).padStart(2, '0');
        cta.href = wa('Namaste Mahavir Sarees, I would like to enquire about this look: ' + c2.dataset.title + ' (' + c2.dataset.sub + '). Please share similar designs and wholesale rates.');
        if (live) live.textContent = 'Look ' + (cur + 1) + ' of ' + N + ': ' + c2.dataset.title;
      }
    }
    function tick() {
      if (reduce) { pos = target; layout(); raf = 0; return; }
      var diff = target - pos;
      if (Math.abs(diff) < 0.001 && !dragging) { pos = target; layout(); raf = 0; return; }
      if (!dragging) pos += diff * 0.14;
      layout(); raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }
    function go(s) { target = Math.round(target) + s; kick(); }
    stage.addEventListener('pointerdown', function (e) { dragging = true; moved = 0; startX = e.clientX; startPos = pos; target = pos; stage.classList.add('drag'); if (stage.setPointerCapture) stage.setPointerCapture(e.pointerId); kick(); });
    stage.addEventListener('pointermove', function (e) { if (!dragging) return; var dx = e.clientX - startX; moved = Math.max(moved, Math.abs(dx)); pos = startPos - dx / ((cards[0].offsetWidth || 300) * 0.75); target = pos; });
    function end() { if (!dragging) return; dragging = false; stage.classList.remove('drag'); var v = pos - startPos; target = Math.abs(v) > 0.15 && Math.abs(v) < 0.5 ? (v > 0 ? Math.ceil(pos) : Math.floor(pos)) : Math.round(pos); kick(); }
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end); stage.addEventListener('pointerleave', end);
    stage.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } });
    cards.forEach(function (c, i) { c.addEventListener('click', function () { if (moved > 6) return; var dd = i - Math.round(target); dd = ((dd % N) + N) % N; if (dd > N / 2) dd -= N; if (dd) { target = Math.round(target) + dd; kick(); } }); });
    $('.rw-prev').addEventListener('click', function () { go(-1); });
    $('.rw-next').addEventListener('click', function () { go(1); });
    var inView = false;
    if ('IntersectionObserver' in w) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }, { threshold: 0.5 }).observe(stage);
    d.addEventListener('keydown', function (e) {
      if (!inView || d.activeElement === stage || /INPUT|TEXTAREA|SELECT/.test((d.activeElement || {}).tagName || '')) return;
      if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1);
    });
    w.addEventListener('resize', layout);
    layout();
  }

  /* ---------- No-animation fallback ---------- */
  if (!hasG) {
    if (ramp) {
      rampModels.forEach(function (m, k) { m.style.opacity = k === 0 ? 1 : 0; });
      $$('.ramp-chips button', ramp).forEach(function (b, k) { b.addEventListener('click', function () { rampModels.forEach(function (m, j) { m.style.opacity = j === k ? 1 : 0; }); setRampInfo(k); }); });
    }
    return;
  }

  /* ---------- Motion ---------- */
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ force3D: true });
  var mm = gsap.matchMedia();

  // Hero intro
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.screen.main video', { opacity: 0, duration: 1.4 })
    .from('.screen.side', { opacity: 0, y: 60, duration: 1.4, stagger: 0.1 }, 0.2)
    .from('.arch-line', { opacity: 0, duration: 1.6 }, 0.4)
    .from('.hero-title .ln > span', { yPercent: 110, duration: 1.1, stagger: 0.1 }, 0.5)
    .from('.hero-logo, .hero-side', { opacity: 0, y: 24, duration: 1, stagger: 0.12 }, 0.8);

  // Hero: the centre screen opens into the store as you scroll
  mm.add({ desk: '(min-width: 901px)', mob: '(max-width: 900px)' }, function (ctx) {
    var desk = ctx.conditions.desk;
    var startClip = function () {
      if (!desk) return 'inset(11% 9% 30% 9% round 220px 220px 0px 0px)';
      var W = w.innerWidth, H = w.innerHeight, fw = H * 0.8 * 9 / 16 + 40, x = Math.max(8, (W - fw) / 2 / W * 100);
      var al = d.querySelector('.arch-line'); if (al) { al.style.left = al.style.right = (x - 1.4).toFixed(2) + '%'; }
      return 'inset(14% ' + x.toFixed(2) + '% 6% ' + x.toFixed(2) + '% round 300px 300px 0px 0px)';
    };
    gsap.set('.screen.main', { clipPath: startClip() });
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=110%', pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true } });
    tl.fromTo('.screen.main', { clipPath: startClip }, { clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)', ease: 'power2.inOut', duration: 1, immediateRender: false }, 0)
      .to('.hero-copy', { opacity: 0, y: -40, duration: 0.4 }, 0)
      .to('.arch-line', { opacity: 0, scale: 1.3, duration: 0.5 }, 0)
      .to('.hero-enter', { opacity: 1, duration: 0.3 }, 0.55)
      .to('.hero-enter', { opacity: 0, duration: 0.25 }, 0.9);
    if (desk) tl.to('.screen.s-l', { xPercent: -140, opacity: 0, duration: 0.8 }, 0).to('.screen.s-r', { xPercent: 140, opacity: 0, duration: 0.8 }, 0);
  });

  // Reveals
  $$('[data-rv]').forEach(function (el) {
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  $$('.h-sec em').forEach(function (el) {
    gsap.fromTo(el, { backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0', duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  // Signboard: plates swing in one by one
  gsap.from('.plate', { rotateX: -90, transformOrigin: '50% 0%', opacity: 0, duration: 0.6, stagger: 0.06, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.post', start: 'top 78%', once: true } });

  // Wardrobes
  mm.add({ desk: '(min-width: 901px)', mob: '(max-width: 900px)' }, function (ctx) {
    var wrs = $$('.wr');
    if (ctx.conditions.desk) {
      var track = $('.wr-track');
      var dist = function () { return Math.max(0, track.scrollWidth - w.innerWidth); };
      var h = gsap.to(track, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: { trigger: '.wardrobes', start: 'top top', end: function () { return '+=' + (dist() + w.innerHeight * 0.4); }, pin: '.wr-pin', scrub: 0.5, invalidateOnRefresh: true, anticipatePin: 1 } });
      wrs.forEach(function (el) {
        var t = gsap.timeline({ scrollTrigger: { trigger: el, containerAnimation: h, start: 'left 88%', end: 'left 42%', scrub: 0.4 } });
        t.to($('.door.dl', el), { rotateY: -108, ease: 'power2.inOut' }, 0)
         .to($('.door.dr', el), { rotateY: 108, ease: 'power2.inOut' }, 0)
         .to($('.wr-light', el), { opacity: 1 }, 0.3)
         .to($('.wr-in img', el), { scale: 1, ease: 'power2.out' }, 0);
      });
    } else {
      wrs.forEach(function (el) {
        var t = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 35%', scrub: 0.4 } });
        t.to($('.door.dl', el), { rotateY: -108 }, 0).to($('.door.dr', el), { rotateY: 108 }, 0).to($('.wr-light', el), { opacity: 1 }, 0.3).to($('.wr-in img', el), { scale: 1 }, 0);
      });
    }
  });

  // Ramp walk: each design walks from the back of the runway to the front
  if (ramp && rampModels.length) {
    var n = rampModels.length;
    gsap.set(rampModels, { opacity: 0, scale: 0.42, yPercent: -26 });
    var rt = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
      trigger: '.ramp', start: 'top top', end: '+=' + (n * 85) + '%', pin: '.ramp-pin', scrub: 0.5, anticipatePin: 1,
      onUpdate: function (st) {
        var i = Math.min(n - 1, Math.floor(st.progress * n * 0.999));
        setRampInfo(i);
        gsap.set('.ramp-progress i', { scaleX: st.progress });
      } } });
    rampModels.forEach(function (m, i) {
      var t0 = i;
      // walk in: back of stage -> front, with a gentle stride
      rt.to(m, { opacity: 1, duration: 0.18 }, t0)
        .to(m, { scale: 1, yPercent: 0, duration: 0.62, ease: 'power1.out' }, t0)
        .to(m, { rotate: 1.2, duration: 0.15, yoyo: true, repeat: 3, ease: 'sine.inOut' }, t0)
        .to(m, { rotate: 0, duration: 0.02 }, t0 + 0.62);
      if (i < n - 1) rt.to(m, { xPercent: i % 2 ? 70 : -170, scale: 1.12, opacity: 0, duration: 0.3, ease: 'power1.in' }, t0 + 0.72);
      else rt.to({}, { duration: 0.3 }, t0 + 0.72);
    });
    var stTotal = function () { return rt.scrollTrigger; };
    $$('.ramp-chips button', ramp).forEach(function (b, k) {
      b.addEventListener('click', function () {
        var st = stTotal(); if (!st) return;
        var y = st.start + (st.end - st.start) * ((k + 0.66) / n);
        w.scrollTo({ top: y, behavior: 'smooth' });
      });
    });
  }

  // Gallery
  gsap.from('.rw-stage', { opacity: 0, y: 60, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.rw-stage', start: 'top 85%', once: true } });

  // Counters
  $$('[data-count]').forEach(function (el) {
    var end = parseFloat(el.getAttribute('data-count')), suf = el.getAttribute('data-suffix') || '', o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true }, onUpdate: function () { el.textContent = Math.round(o.v) + suf; } });
  });
  gsap.from('.why-item', { opacity: 0, y: 40, duration: 0.9, stagger: 0.07, ease: 'power3.out', scrollTrigger: { trigger: '.why-grid', start: 'top 85%', once: true } });

  // Visit photos parallax
  $$('.visit-photos img').forEach(function (img, i) {
    gsap.fromTo(img, { yPercent: -8 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: 0.4 } });
  });
  gsap.from('.ws-media img', { scale: 1.2, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: '.ws-media', start: 'top 85%', once: true } });

  w.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
