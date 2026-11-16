(() => {
  const WA = "https://wa.me/919920753269?text=Hi%20Mahavir%20Sarees%2C%20I%20want%20Rivaz%20saree%20(%E2%82%B92150)";
  const PIN = '<svg viewBox="0 0 24 24"><path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>';
  const EXP = '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>';
  const ENVS = ["Bridal Studio", "Haveli at Dusk", "Mirror Trial Room"];
  const CARDS = [
    { img: "img/p1.webp", pos: "50% 30%", env: 0, kicker: "Mahavir Sarees · New", title: "Rivaz", sub: "Weightless Silk Saree",
      desc: "Weightless Silk Saree in mustard-yellow with all-over arch motifs in red, green & teal.",
      loc: "Mahavir Sarees · Rewari", vdesc: "Our new Weightless Silk saree: mustard-yellow, with arch motifs in red, green & teal.",
      facts: ["Fabric: Weightless Silk, light and easy to drape", "Mustard-yellow base, all-over arch motifs", "Red pallu with printed woman figures", "₹2,150 · Shipping included"] },
    { img: "img/p2.webp", pos: "50% 40%", env: 2, kicker: "Detail 01", title: "The Fabric", sub: "Weightless Silk",
      desc: "Weightless Silk, light and easy to drape. Mustard-yellow base with all-over arch motifs in red, green & teal.",
      loc: "Fabric close-up · real photo", vdesc: "A close look at the saree body, straight from our own photo.",
      facts: ["Weightless Silk, light and easy to drape", "Mustard-yellow base with all-over arch motifs", "Motifs in red, green & teal"] },
    { img: "img/p3.webp", pos: "50% 50%", env: 0, kicker: "Detail 02", title: "Pallu & Border", sub: "Printed arch panels",
      desc: "Red arches, each with a printed woman figure. A teal dome-and-arch band and fine floral stripes.",
      loc: "Pallu detail · real photo", vdesc: "The pallu and border up close, straight from our own photo.",
      facts: ["Pallu: red arches, each with a printed woman figure", "A teal band of dome-and-arch motifs", "Fine floral stripes framing every row"] },
    { img: "img/look.webp", pos: "50% 25%", env: 1, ai: true, kicker: "AI styled preview", title: "The Festive Look", sub: "AI styled",
      desc: "A preview of how Rivaz can be styled for a festive evening. AI styled image; the saree is shown as in our photos.",
      loc: "AI styled · for styling ideas",
      facts: ["AI styled image, for styling ideas only", "See the real saree in the other photos or at our store"] },
    { img: "img/p1.webp", pos: "50% 62%", env: 2, kicker: "Order now", title: "<em>₹2,150</em> · Order", plain: "₹2,150 · Order", sub: "Shipping included",
      desc: "₹2,150 · Shipping included. Order on WhatsApp 99207 53269 or visit our store in Rewari.",
      loc: "Mahavir Chowk, Bajaja Bazaar, Rewari",
      facts: ["₹2,150 · Shipping included", "WhatsApp: 99207 53269", "Mahavir Chowk, Bajaja Bazaar, Rewari (Hanuman Mandir ke saamne)"] }
  ];
  const N = CARDS.length;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s) => document.querySelector(s);
  const ring = $("#ring"), stage = $("#stage"), dotsEl = $("#dots");
  const layers = [...document.querySelectorAll(".env-layer")];

  // ---- build cards
  const els = CARDS.map((c, i) => {
    const el = document.createElement("article");
    el.className = "card";
    el.style.setProperty("--k", i);
    el.setAttribute("aria-roledescription", "slide");
    el.setAttribute("aria-label", `${i + 1} of ${N}: ${c.plain || c.title}`);
    el.innerHTML = `
      <img class="ph" src="${c.img}" alt="Rivaz saree – ${c.plain || c.title}" style="object-position:${c.pos}" ${i > 1 ? 'loading="lazy"' : ""} draggable="false">
      <div class="shine"></div>
      <div class="c-top">
        <button class="pill glass expand" type="button">${EXP}Expand</button>
        <button class="more glass" type="button" aria-label="More about ${c.plain || c.title}">•••</button>
      </div>
      ${c.ai ? '<span class="chip glass c-ai">AI styled</span>' : ""}
      <div class="c-info">
        <h3>${c.title}</h3>
        <p>${c.desc}</p>
        <div class="c-loc">${PIN}<span>${c.loc}</span></div>
      </div>`;
    ring.appendChild(el);
    const d = document.createElement("button");
    d.type = "button"; d.setAttribute("role", "tab"); d.setAttribute("aria-label", `Card ${i + 1}: ${c.plain || c.title}`);
    d.addEventListener("click", () => go(i));
    dotsEl.appendChild(d);
    return el;
  });

  let pos = 0;          // continuous position (index)
  let active = 0;
  let cw = 280;

  function size() {
    const r = stage.getBoundingClientRect();
    const h = Math.max(260, r.height - 16);
    let w = Math.min(window.innerWidth * 0.74, 340, h * 0.58);
    cw = w;
    document.documentElement.style.setProperty("--cw", w + "px");
    document.documentElement.style.setProperty("--ch", Math.min(h, w * 1.72) + "px");
    layout();
  }

  function wrap(d) { d = ((d % N) + N) % N; return d > N / 2 ? d - N : d; }

  function layout() {
    els.forEach((el, i) => {
      const d = wrap(i - pos), a = Math.abs(d), s = Math.sign(d);
      const tx = a <= 1 ? d * cw * 0.80 : s * (cw * 0.80 + (a - 1) * cw * 0.38);
      const tz = -Math.min(a, 2.4) * cw * 0.62;
      const ry = -s * Math.min(a * 34, 62);
      const op = a > 2.2 ? 0 : 1 - Math.max(0, a - 1.2) * 0.75;
      el.style.transform = `translate3d(${tx}px,0,${tz}px) rotateY(${ry}deg)`;
      el.style.opacity = op;
      el.style.zIndex = String(100 - Math.round(a * 10));
      el.style.pointerEvents = a > 1.6 ? "none" : "";
    });
  }

  let envTimer = null, curEnv = 0;
  function setEnv(e) {
    if (e === curEnv) return;
    curEnv = e;
    layers.forEach((l, i) => l.classList.toggle("is-on", i === e));
    $("#envName").textContent = ENVS[e];
  }
  function armEnvDrift() {
    clearInterval(envTimer);
    if (reduce) return;
    envTimer = setInterval(() => { if (!document.hidden && viewer.hidden) setEnv((curEnv + 1) % 3); }, 11000);
  }

  function setActive(i) {
    active = ((i % N) + N) % N;
    els.forEach((el, k) => {
      const on = k === active;
      el.classList.toggle("active", on);
      el.setAttribute("aria-hidden", on ? "false" : "true");
      el.querySelectorAll("button").forEach((b) => (b.tabIndex = on ? 0 : -1));
    });
    [...dotsEl.children].forEach((d, k) => d.setAttribute("aria-selected", String(k === active)));
    const c = CARDS[active];
    $("#barThumb").src = c.img;
    $("#barThumb").style.objectPosition = c.pos;
    $("#barTitle").textContent = c.plain || c.title;
    $("#barSub").textContent = c.sub;
    setEnv(c.env);
    armEnvDrift();
  }

  function go(i) {
    // move along the shortest path
    const target = pos + wrap(i - pos);
    pos = Math.round(target);
    layout();
    setActive(pos);
  }
  const step = (n) => { pos = Math.round(pos) + n; layout(); setActive(pos); };
  $("#prev").addEventListener("click", () => step(-1));
  $("#next").addEventListener("click", () => step(1));

  // ---- drag / swipe
  let sx = 0, sy = 0, sp = 0, dragging = false, decided = false, horiz = false, lastX = 0, lastT = 0, vel = 0, suppressUntil = 0;
  stage.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    sx = lastX = e.clientX; sy = e.clientY; sp = pos; lastT = performance.now(); vel = 0;
    dragging = true; decided = false; horiz = false;
  });
  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!decided && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      decided = true; horiz = Math.abs(dx) > Math.abs(dy);
      if (horiz) { stage.classList.add("dragging"); try { stage.setPointerCapture(e.pointerId); } catch (_) {} }
    }
    if (!horiz) return;
    const now = performance.now();
    vel = (e.clientX - lastX) / Math.max(1, now - lastT); lastX = e.clientX; lastT = now;
    pos = sp - dx / (cw * 0.85);
    layout();
  });
  const end = () => {
    if (!dragging) return;
    dragging = false; stage.classList.remove("dragging");
    if (!horiz) return;
    suppressUntil = performance.now() + 120;
    let target = pos - vel * 180 / (cw * 0.85);
    target = Math.round(target);
    target = Math.max(Math.round(sp) - 2, Math.min(Math.round(sp) + 2, target));
    pos = target; layout(); setActive(pos);
  };
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);

  // clicks on cards
  ring.addEventListener("click", (e) => {
    if (performance.now() < suppressUntil) return;
    const card = e.target.closest(".card"); if (!card) return;
    const i = els.indexOf(card);
    if (i !== active) { go(i); return; }
    if (e.target.closest(".expand, .more") || e.target.closest(".c-info") || e.target.classList.contains("ph")) openViewer(i, card);
  });

  document.addEventListener("keydown", (e) => {
    if (!viewer.hidden) { if (e.key === "Escape") closeViewer(); return; }
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "Enter" && document.activeElement === document.body) openViewer(active, els[active]);
  });

  // ---- heart
  const heart = $("#heart");
  const setHeart = (on) => { heart.setAttribute("aria-pressed", String(on)); try { localStorage.setItem("rivaz-heart", on ? "1" : ""); } catch (_) {} };
  try { if (localStorage.getItem("rivaz-heart")) heart.setAttribute("aria-pressed", "true"); } catch (_) {}
  heart.addEventListener("click", () => setHeart(heart.getAttribute("aria-pressed") !== "true"));

  // ---- viewer
  const viewer = $("#viewer");
  let lastFocus = null;
  function openViewer(i, card) {
    const c = CARDS[i];
    const r = card.getBoundingClientRect(), W = innerWidth, H = innerHeight;
    viewer.style.setProperty("--vt", Math.max(0, r.top) + "px");
    viewer.style.setProperty("--vl", Math.max(0, r.left) + "px");
    viewer.style.setProperty("--vr", Math.max(0, W - r.right) + "px");
    viewer.style.setProperty("--vb", Math.max(0, H - r.bottom) + "px");
    const vi = $("#vImg");
    vi.style.backgroundImage = `url(${c.img})`;
    vi.style.backgroundPosition = c.pos;
    $("#vKicker").textContent = c.kicker;
    $("#vTitle").innerHTML = c.title;
    $("#vDesc").textContent = c.vdesc || c.desc;
    $("#vFacts").innerHTML = c.facts.map((f) => `<li>${f}</li>`).join("");
    $("#vChip").hidden = !c.ai;
    lastFocus = document.activeElement;
    viewer.hidden = false;
    viewer.classList.remove("open"); void viewer.offsetWidth; viewer.classList.add("open");
    $("#vClose").focus({ preventScroll: true });
    try { history.pushState({ v: 1 }, ""); } catch (_) {}
  }
  function closeViewer(fromPop) {
    if (viewer.hidden) return;
    viewer.classList.remove("open");
    viewer.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    if (!fromPop) { try { if (history.state && history.state.v) history.back(); } catch (_) {} }
  }
  $("#vClose").addEventListener("click", () => closeViewer());
  window.addEventListener("popstate", () => closeViewer(true));
  // swipe down to close
  let vy = null;
  viewer.addEventListener("touchstart", (e) => { if (!e.target.closest(".v-panel")) vy = e.touches[0].clientY; }, { passive: true });
  viewer.addEventListener("touchend", (e) => { if (vy !== null && e.changedTouches[0].clientY - vy > 90) closeViewer(); vy = null; }, { passive: true });

  // ---- dust & bokeh
  const cv = document.querySelector(".dust");
  if (!reduce && cv.getContext) {
    const ctx = cv.getContext("2d");
    let w, h, dpr, parts = [];
    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1); w = innerWidth; h = innerHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize(); addEventListener("resize", resize);
    const rnd = (a, b) => a + Math.random() * (b - a);
    for (let i = 0; i < 46; i++) parts.push({ x: rnd(0, 1), y: rnd(0, 1), r: i < 8 ? rnd(14, 34) : rnd(0.6, 2.2), a: i < 8 ? rnd(0.05, 0.12) : rnd(0.25, 0.7),
      vx: rnd(-0.008, 0.008), vy: rnd(-0.018, -0.004), tw: rnd(0, 6.28), big: i < 8 });
    let last = performance.now();
    const frame = (t) => {
      const dt = Math.min(50, t - last) / 1000; last = t;
      if (!document.hidden) {
        ctx.clearRect(0, 0, w, h);
        for (const p of parts) {
          p.x += p.vx * dt; p.y += p.vy * dt; p.tw += dt * 1.3;
          if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
          if (p.x < -0.05) p.x = 1.05; if (p.x > 1.05) p.x = -0.05;
          const x = p.x * w, y = p.y * h, al = p.a * (0.6 + 0.4 * Math.sin(p.tw));
          const g = ctx.createRadialGradient(x, y, 0, x, y, p.r * (p.big ? 1 : 2.4));
          g.addColorStop(0, `rgba(255,214,150,${al})`); g.addColorStop(1, "rgba(255,200,120,0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, p.r * (p.big ? 1 : 2.4), 0, 6.283); ctx.fill();
        }
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  addEventListener("resize", size);
  size(); setActive(0);
  // end intro
  setTimeout(() => document.body.classList.remove("intro"), reduce ? 0 : 2600);
  // preload remaining images
  addEventListener("load", () => ["img/bg-haveli.webp", "img/bg-mirror.webp", "img/look.webp", "img/p3.webp"].forEach((s) => { const im = new Image(); im.src = s; }));
})();
