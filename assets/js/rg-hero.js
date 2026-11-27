/* Mahavir Sarees · Raj Gharana hero.
   Desktop: the hero pins for a short scroll and steps through 5 real-photo
   details (01–05). Rail buttons switch details too. Without JS, GSAP or with
   reduced motion, the hero is static and the rail still works by click. */
(function () {
  'use strict';
  var root = document.getElementById('rg-hero');
  if (!root) return;

  var header = document.querySelector('.site-header');
  function setHeader() { if (header) root.style.setProperty('--rg-hh', header.offsetHeight + 'px'); }
  setHeader(); window.addEventListener('resize', setHeader);

  var imgs = root.querySelectorAll('.rg-hero__frame img'),
      btns = root.querySelectorAll('.rg-hero__rail button'),
      num = root.querySelector('.rg-hero__num'),
      cap = root.querySelector('.rg-hero__cap'),
      names = ['Peacock arch', 'Pallu', 'Border', 'Blouse', 'Zardozi booti'],
      cur = 0;

  function show(i) {
    if (i === cur || i < 0 || i >= imgs.length) return;
    imgs[cur].classList.remove('is-on'); imgs[i].classList.add('is-on');
    btns[cur].removeAttribute('aria-current'); btns[i].setAttribute('aria-current', 'true');
    num.textContent = '0' + (i + 1); cap.textContent = names[i];
    cur = i;
  }

  var st = null;
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var i = +b.getAttribute('data-i');
      if (st && st.isActive !== undefined && st.end > st.start) {
        // keep the scroll position in step with the chosen detail
        window.scrollTo({ top: st.start + (st.end - st.start) * (i + 0.5) / imgs.length, behavior: 'smooth' });
      }
      show(i);
    });
  });

  function initMotion() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var mm = gsap.matchMedia();
    mm.add('(min-width: 821px)', function () {
      var model = root.querySelector('.rg-hero__model img');
      st = ScrollTrigger.create({
        trigger: root, start: 'top top+=' + (header ? header.offsetHeight : 0),
        end: '+=' + Math.round(window.innerHeight * 1.4), pin: true, pinSpacing: true,
        onUpdate: function (self) { show(Math.min(imgs.length - 1, Math.floor(self.progress * imgs.length))); }
      });
      var tw = gsap.fromTo(model, { scale: 1 }, { scale: 1.035, transformOrigin: '50% 100%', ease: 'none',
        scrollTrigger: { trigger: root, start: st.start, end: st.end, scrub: 0.6 } });
      return function () { st && st.kill(); st = null; tw.kill(); };
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMotion);
  else initMotion();
})();
