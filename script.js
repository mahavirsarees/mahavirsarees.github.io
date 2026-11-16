(function(){
  var d=document,root=d.documentElement;root.classList.add('js');
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal
  var els=d.querySelectorAll('.reveal');
  if('IntersectionObserver' in window&&!reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{rootMargin:'0px 0px -8% 0px',threshold:.12});
    els.forEach(function(el){io.observe(el)});
  }else{els.forEach(function(el){el.classList.add('in')});}

  // Header shadow
  var hdr=d.querySelector('.site-header');
  var onScroll=function(){hdr.classList.toggle('scrolled',scrollY>8)};
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  // Mobile menu
  var btn=d.querySelector('.menu-btn'),nav=d.getElementById('nav');
  if(btn){btn.addEventListener('click',function(){var o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',o);btn.setAttribute('aria-label',o?'Close menu':'Open menu')});
    nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');btn.setAttribute('aria-expanded','false')})});}

  // Gentle parallax on hero mandalas
  if(!reduce){
    var m=d.querySelectorAll('.hero .mandala'),tick=false;
    addEventListener('scroll',function(){if(tick)return;tick=true;requestAnimationFrame(function(){var y=Math.min(scrollY,900);m.forEach(function(el,i){el.style.transform='translate3d(0,'+(y*(i?-.12:.18))+'px,0)'});tick=false;})},{passive:true});
  }

  // Hero video: respect reduced motion, pause off-screen
  var v=d.querySelector('.hero-video');
  if(v){
    if(reduce){v.removeAttribute('autoplay');v.pause();}
    else if('IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause();})}).observe(v);}
    var sb=d.querySelector('.sound-btn');
    if(sb)sb.addEventListener('click',function(){var on=v.muted;v.muted=!on;sb.setAttribute('aria-pressed',on?'true':'false');sb.setAttribute('aria-label',on?'Turn sound off':'Turn sound on');if(on){var p=v.play();if(p&&p.catch)p.catch(function(){})}});
  }

  // Count-up
  var c=d.querySelectorAll('.count');
  if(!reduce&&'IntersectionObserver' in window){
    var co=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;co.unobserve(e.target);var el=e.target,to=+el.dataset.to,t0=null;
      function step(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/1400);el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step)}
      el.textContent='0';requestAnimationFrame(step);})},{threshold:.6});
    c.forEach(function(el){co.observe(el)});
  }

  // Open now (shop time = India Standard Time)
  try{
    var parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
    var get=function(t){return (parts.find(function(p){return p.type===t})||{}).value};
    var days={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6},day=days[get('weekday')],mins=(+get('hour'))*60+(+get('minute'));
    var open=day===0?[630,1080]:[570,1200];
    var isOpen=mins>=open[0]&&mins<open[1];
    var badge=d.getElementById('open-now');
    if(badge){badge.textContent=isOpen?'Open now':'Closed now';badge.classList.toggle('closed',!isOpen);badge.hidden=false;}
    d.querySelectorAll('.hours tr').forEach(function(tr){if(tr.dataset.days.split(',').indexOf(String(day))>-1)tr.classList.add('today')});
  }catch(e){}

  var yr=d.getElementById('yr');if(yr)yr.textContent=new Date().getFullYear();

  // Product gallery (product pages): thumbs scroll the swipeable track
  var track=d.getElementById('g-track');
  if(track){
    var thumbs=d.querySelectorAll('.g-thumb');
    var mark=function(i){thumbs.forEach(function(t,j){if(j===i)t.setAttribute('aria-current','true');else t.removeAttribute('aria-current');});};
    thumbs.forEach(function(t){t.addEventListener('click',function(ev){ev.preventDefault();var i=+t.getAttribute('data-i');track.scrollTo({left:i*track.clientWidth,behavior:reduce?'auto':'smooth'});mark(i);});});
    var tid;track.addEventListener('scroll',function(){clearTimeout(tid);tid=setTimeout(function(){mark(Math.round(track.scrollLeft/track.clientWidth));},80);},{passive:true});
  }
})();

// Product purchase page template: hero switcher, colour, quantity, WhatsApp order text
(function(){
  var d=document,card=d.querySelector('.pdx-card');if(!card)return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var slides=d.querySelectorAll('.pdx-slide'),thumbs=d.querySelectorAll('.pdx-thumb'),num=d.getElementById('pdx-n'),cur=0,n=slides.length;
  function show(i){
    i=(i+n)%n;if(i===cur)return;cur=i;
    slides.forEach(function(s,j){var on=j===i;s.classList.toggle('is-on',on);if(on)s.removeAttribute('aria-hidden');else s.setAttribute('aria-hidden','true');
      if(on){var im=s.querySelector('img');if(im&&im.loading==='lazy')im.loading='eager';}});
    thumbs.forEach(function(t,j){t.setAttribute('aria-pressed',j===i?'true':'false')});
    if(num)num.textContent=(i<9?'0':'')+(i+1);
  }
  thumbs.forEach(function(t){t.addEventListener('click',function(){show(+t.getAttribute('data-i'))})});
  // warm the other photos once the page is idle
  setTimeout(function(){slides.forEach(function(s){var im=s.querySelector('img');if(im&&im.loading==='lazy')im.loading='eager'})},1500);
  var box=d.getElementById('pdx-slides'),x0=null,y0=null;
  if(box){
    box.addEventListener('touchstart',function(ev){x0=ev.touches[0].clientX;y0=ev.touches[0].clientY},{passive:true});
    box.addEventListener('touchend',function(ev){if(x0===null)return;var dx=ev.changedTouches[0].clientX-x0,dy=ev.changedTouches[0].clientY-y0;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))show(cur+(dx<0?1:-1));x0=null},{passive:true});
  }
  d.addEventListener('keydown',function(ev){if(ev.target.closest&&ev.target.closest('input,textarea'))return;if(ev.key==='ArrowRight')show(cur+1);else if(ev.key==='ArrowLeft')show(cur-1)});
  var base=card.getAttribute('data-wa-base'),wa=card.getAttribute('data-wa-number'),label=d.getElementById('pdx-colour'),qty=d.getElementById('pdx-qty');
  function colour(){var c=card.querySelector('input[name="colour"]:checked');return c?c.value:''}
  function count(){var q=parseInt(qty.value,10);if(!(q>=1))q=1;if(q>999)q=999;return q}
  function update(){
    var c=colour(),q=count();if(label)label.textContent=c;
    var href='https://wa.me/'+wa+'?text='+encodeURIComponent(base+'\nColour: '+c+'\nQuantity: '+q);
    d.querySelectorAll('.js-wa').forEach(function(a){a.href=href});
  }
  card.querySelectorAll('input[name="colour"]').forEach(function(r){r.addEventListener('change',update)});
  card.querySelectorAll('.pdx-q').forEach(function(b){b.addEventListener('click',function(){qty.value=Math.max(1,Math.min(999,count()+(+b.getAttribute('data-d'))));update()})});
  qty.addEventListener('input',update);qty.addEventListener('blur',function(){qty.value=count();update()});
  update();
})();
