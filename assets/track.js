/* Mahavir Sarees: count enquiries in Google Analytics (whatsapp_click, call_click, directions_click). */
(function(){
  function kind(href){
    if(!href) return null;
    if(/^tel:/i.test(href)) return 'call_click';
    if(/^https?:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com|web\.whatsapp\.com)\//i.test(href) || /^whatsapp:/i.test(href)) return 'whatsapp_click';
    if(/^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|(www\.)?google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.apple\.com)/i.test(href)) return 'directions_click';
    return null;
  }
  document.addEventListener('click', function(ev){
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
    if(!a) return;
    var href = a.getAttribute('href') || '';
    var name = kind(href);
    if(!name) return;
    var text = (a.innerText || a.getAttribute('aria-label') || '').replace(/\s+/g,' ').trim().slice(0,100);
    var params = { page_path: location.pathname, link_url: href.slice(0,300), link_text: text, transport_type: 'beacon' };
    try { if (typeof window.gtag === 'function') window.gtag('event', name, params); } catch(e) {}
    try { if (typeof window.clarity === 'function') window.clarity('event', name); } catch(e) {}
  }, true);
})();
