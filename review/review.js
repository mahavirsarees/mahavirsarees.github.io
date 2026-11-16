/* Mahavir Sarees · Review Helper. Runs only in the browser; nothing is stored or sent. */
(function (root) {
  "use strict";
  var R = Math.random;
  function pick(a) { return a[Math.floor(R() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  var JOIN = { hinglish: " aur ", en: " and ", hi: " और " };
  function list(arr, lang) {
    if (arr.length < 2) return arr[0] || "";
    var sep = lang === "en" ? ", " : ", ";
    return arr.slice(0, -1).join(sep) + JOIN[lang] + arr[arr.length - 1];
  }

  /* ---------- vocabulary ---------- */
  var ITEM = {
    saree:   { hinglish: "saree", en: "saree", hi: "साड़ी", g: "f", sareeish: true },
    bridal:  { hinglish: "bridal saree", en: "bridal saree", hi: "ब्राइडल साड़ी", g: "f", sareeish: true },
    lehenga: { hinglish: "lehenga", en: "lehenga", hi: "लहंगा", g: "m" },
    laccha:  { hinglish: "laccha", en: "laccha", hi: "लच्छा", g: "m" },
    suit:    { hinglish: "suit", en: "suit", hi: "सूट", g: "m" }
  };
  var FAB = {
    banarasi:   { hinglish: "Banarasi", en: "Banarasi", hi: "बनारसी", silk: true },
    kanjivaram: { hinglish: "Kanjivaram", en: "Kanjivaram", hi: "कांजीवरम", silk: true },
    pashmina:   { hinglish: "Pashmina", en: "Pashmina", hi: "पश्मीना", silk: true },
    silk:       { hinglish: "silk", en: "silk", hi: "सिल्क", silk: true, plain: true },
    cotton:     { hinglish: "cotton", en: "cotton", hi: "कॉटन" }
  };
  var OCC = {
    wedding:  { hinglish: ["shaadi ke liye", "shaadi ki shopping ke liye"], en: ["for a wedding"], hi: ["शादी के लिए", "शादी की खरीदारी में"] },
    festival: { hinglish: ["tyohaar ke liye", "festival ke liye"], en: ["for the festive season", "for a festival"], hi: ["त्योहार के लिए"] },
    party:    { hinglish: ["party ke liye", "ek function ke liye"], en: ["for a party", "for a function"], hi: ["पार्टी के लिए", "एक फंक्शन के लिए"] },
    gift:     { hinglish: ["gift dene ke liye"], en: ["as a gift", "to give as a gift"], hi: ["तोहफे में देने के लिए", "गिफ्ट देने के लिए"] },
    daily:    { hinglish: ["daily wear ke liye", "roz pehenne ke liye"], en: ["for everyday wear", "for daily wear"], hi: ["रोज़ पहनने के लिए"] },
    wholesale:{ hinglish: ["apni dukaan ke liye"], en: ["for our shop"], hi: ["अपनी दुकान के लिए"] }
  };

  /* fabric + item phrase, e.g. "Banarasi silk saree", "Banarasi aur Kanjivaram silk sarees" */
  function fabricPhrase(fabs, lang) {
    if (!fabs.length) return null;
    var silky = fabs.filter(function (f) { return FAB[f].silk && !FAB[f].plain; });
    var plainSilk = fabs.indexOf("silk") >= 0;
    var others = fabs.filter(function (f) { return !FAB[f].silk; });
    var parts = [];
    if (silky.length) parts.push(list(silky.map(function (f) { return FAB[f][lang]; }), lang) + " " + FAB.silk[lang]);
    else if (plainSilk) parts.push(FAB.silk[lang]);
    others.forEach(function (f) { parts.push(FAB[f][lang]); });
    var multi = parts.length > 1 || silky.length > 1;
    return { text: list(parts, lang), multi: multi };
  }
  function itemsPhrase(sel, lang) {
    var items = sel.items.length ? sel.items.slice() : [];
    var fpo = fabricPhrase(sel.fabrics, lang);
    var fp = fpo ? fpo.text : "";
    var plural = !!(fpo && fpo.multi);
    if (!items.length) {
      if (!fp) return null;
      items = ["saree"];
    }
    var words = items.map(function (k) { return ITEM[k][lang]; });
    // put the fabric in front of the first saree-type item (or the first item)
    var at = 0; for (var i = 0; i < items.length; i++) { if (ITEM[items[i]].sareeish) { at = i; break; } }
    if (fp) {
      var w = words[at];
      if (plural && ITEM[items[at]].sareeish) w = lang === "en" ? w + "s" : lang === "hi" ? w.replace("साड़ी", "साड़ियाँ") : w + "s";
      words[at] = fp + " " + w;
    }
    if (lang === "en") {
      words = words.map(function (w, i) {
        if (/s$/.test(w)) return w;
        return ("aeiou".indexOf(w.charAt(0).toLowerCase()) >= 0 ? "an " : "a ") + w;
      });
    }
    var phrase = list(words, lang);
    return { text: phrase, g: ITEM[items[items.length - 1]].g, plural: plural || items.length > 1 };
  }

  function cleanCity(c) {
    c = String(c || "").replace(/[<>{}\[\]]/g, "").replace(/\s+/g, " ").trim().slice(0, 40);
    return c;
  }
  function isRewari(c) { return /rewari|रेवाड़ी|रेवाडी/i.test(c); }

  /* ---------- liked sentences ---------- */
  var LIKE = {
    hinglish: {
      quality:  ["Kapde ki quality acchi hai.", "Quality bhi badhiya mili.", "Quality dekh ke man khush ho gaya.", "Quality ke maamle mein koi shikayat nahi."],
      variety:  ["Designs ki variety kaafi hai, ek hi jagah bahut options mil gaye.", "Bahut saare designs dekhne ko mile, choose karna aasaan raha.", "Variety itni thi ki pasand ka design mil hi gaya."],
      price:    ["Rate bhi sahi laga.", "Daam bhi reasonable the.", "Price bhi theek laga."],
      staff:    ["Staff ne aaram se saare options dikhaye.", "Dukaan pe staff ka vyavhaar accha tha.", "Service acchi thi, kisi ne jaldi nahi machayi."],
      latest:   ["Latest designs bhi dekhne ko mile.", "Naye trend wale designs bhi available the.", "Naye designs ka collection accha hai."],
      wholesale:["Wholesale rate bhi accha mila.", "Wholesale mein rate theek lagaya.", "Wholesale ke rate sahi hain."]
    },
    en: {
      quality:  ["The quality is good.", "Really happy with the quality of the fabric.", "The fabric quality is nice."],
      variety:  ["They have a lot of designs to choose from.", "There was plenty of variety, so it was easy to find something I liked.", "Good range of designs in one place."],
      price:    ["Prices were reasonable.", "The rates felt fair.", "Pricing was fair for what you get."],
      staff:    ["The staff were patient and showed us many options.", "Staff were polite and helpful.", "The service was good and nobody rushed us."],
      latest:   ["They also had the latest designs.", "Nice to see new, trending designs as well.", "The new designs collection is good."],
      wholesale:["Wholesale rates are good too.", "Got a fair wholesale rate.", "The wholesale pricing is fair."]
    },
    hi: {
      quality:  ["कपड़े की क्वालिटी अच्छी है।", "क्वालिटी भी बढ़िया मिली।", "क्वालिटी को लेकर कोई शिकायत नहीं।"],
      variety:  ["डिज़ाइन की वैरायटी काफ़ी है, एक ही जगह बहुत विकल्प मिल गए।", "बहुत सारे डिज़ाइन देखने को मिले।", "वैरायटी इतनी थी कि पसंद का डिज़ाइन मिल ही गया।"],
      price:    ["रेट भी सही लगा।", "दाम भी वाजिब थे।", "कीमत भी ठीक लगी।"],
      staff:    ["स्टाफ़ ने आराम से सारे विकल्प दिखाए।", "दुकान पर स्टाफ़ का व्यवहार अच्छा था।", "सर्विस अच्छी थी, किसी ने जल्दबाज़ी नहीं की।"],
      latest:   ["नए डिज़ाइन भी देखने को मिले।", "लेटेस्ट डिज़ाइन भी उपलब्ध थे।"],
      wholesale:["होलसेल रेट भी अच्छा मिला।", "होलसेल में रेट ठीक लगाया।"]
    }
  };
  var LIKE_NOUN = {
    hinglish: { quality: "quality", variety: "variety", price: "rate", staff: "staff ka vyavhaar", latest: "naye designs", wholesale: "wholesale rate" },
    en: { quality: "the quality", variety: "the variety", price: "the prices", staff: "the staff", latest: "the new designs", wholesale: "the wholesale rates" },
    hi: { quality: "क्वालिटी", variety: "वैरायटी", price: "रेट", staff: "स्टाफ़ का व्यवहार", latest: "नए डिज़ाइन", wholesale: "होलसेल रेट" }
  };
  var LIKE_LIST = {
    hinglish: ["{L}, sab accha laga.", "{L} teeno se khush hain.", "Sabse acchi baat: {L}."],
    en: ["Liked {L}.", "{L} were all good.", "What stood out: {L}."],
    hi: ["{L}, सब अच्छा लगा।", "सबसे अच्छी बात: {L}।"]
  };

  /* ---------- purchase sentences ---------- */
  // tokens: {SHOP} {SHOP_R} {OCC} {ITEMS} {V} {CITY}
  var BUY = {
    hinglish: {
      plain: [
        "{SHOP} se {OCC}{ITEMS} {V}.",
        "{OCC_C}{SHOP} se {ITEMS} {V}.",
        "Hamne {SHOP} se {OCC}{ITEMS} {V}.",
        "{OCC_C}{ITEMS} lene {SHOP} aaye the."
      ],
      city: [
        "{CITY} se {SHOP} aaye the, {OCC}{ITEMS} {V}.",
        "{CITY} se aakar {SHOP} se {OCC}{ITEMS} {V}."
      ],
      shopOnly: ["{SHOP} se {OCC}shopping ki.", "{OCC_C}{SHOP} se shopping ki."],
      wholesale: ["Apni dukaan ke liye {SHOP} se wholesale mein {ITEMS} lete hain.", "Hum {SHOP} se dukaan ke liye {ITEMS} wholesale mein lete hain."],
      wholesaleCity: ["{CITY} se aakar {SHOP} se dukaan ke liye {ITEMS} wholesale mein lete hain."]
    },
    en: {
      plain: [
        "Bought {ITEMS} from {SHOP} {OCC}.",
        "We picked up {ITEMS} {OCC} at {SHOP}.",
        "Went to {SHOP} {OCC} and bought {ITEMS}.",
        "Shopped at {SHOP} {OCC} and got {ITEMS}."
      ],
      city: [
        "Came from {CITY} to {SHOP} and bought {ITEMS} {OCC}.",
        "We came all the way from {CITY} to {SHOP} and picked up {ITEMS} {OCC}."
      ],
      shopOnly: ["Shopped at {SHOP} {OCC}.", "Visited {SHOP} {OCC}."],
      wholesale: ["We buy {ITEMS} wholesale from {SHOP} for our shop.", "We stock our shop with {ITEMS} from {SHOP}."],
      wholesaleCity: ["We come from {CITY} to {SHOP} to buy {ITEMS} wholesale for our shop."]
    },
    hi: {
      plain: [
        "{SHOP} से {OCC}{ITEMS} {V}।",
        "{OCC_C}{SHOP} से {ITEMS} {V}।",
        "हमने {SHOP} से {OCC}{ITEMS} {V}।"
      ],
      city: [
        "{CITY} से {SHOP} आए थे, {OCC}{ITEMS} {V}।",
        "{CITY} से आकर {SHOP} से {OCC}{ITEMS} {V}।"
      ],
      shopOnly: ["{SHOP} से {OCC}खरीदारी की।"],
      wholesale: ["अपनी दुकान के लिए {SHOP} से होलसेल में {ITEMS} लेते हैं।"],
      wholesaleCity: ["{CITY} से आकर {SHOP} से दुकान के लिए होलसेल में {ITEMS} लेते हैं।"]
    }
  };
  var SHOP = {
    hinglish: { r: ["Rewari mein Mahavir Sarees", "Mahavir Sarees, Rewari", "Rewari ke Mahavir Sarees"], n: ["Mahavir Sarees"] },
    en: { r: ["Mahavir Sarees in Rewari"], n: ["Mahavir Sarees"] },
    hi: { r: ["रेवाड़ी के Mahavir Sarees", "Mahavir Sarees, रेवाड़ी"], n: ["Mahavir Sarees"] }
  };
  var CLOSE = {
    hinglish: {
      any: ["Dobara zaroor aayenge.", "Family aur doston ko bhi bataenge.", "Saree lena ho to ek baar zaroor dekhiye."],
      wedding: ["Shaadi ke kapde lene hon to ek baar zaroor aaiye."],
      wholesale: ["Dukaan ke liye maal lena ho to accha option hai."]
    },
    en: {
      any: ["Will definitely visit again.", "Would recommend it to friends and family.", "Worth a visit if you are looking for sarees."],
      wedding: ["Worth a visit for wedding shopping."],
      wholesale: ["A good option if you buy for a shop."]
    },
    hi: {
      any: ["दोबारा ज़रूर आएँगे।", "परिवार और दोस्तों को भी बताएँगे।", "साड़ी लेनी हो तो एक बार ज़रूर देखिए।"],
      wedding: ["शादी की खरीदारी के लिए एक बार ज़रूर आइए।"],
      wholesale: ["दुकान के लिए माल लेना हो तो अच्छा विकल्प है।"]
    }
  };

  function verb(it, lang) {
    if (lang === "hinglish") return it.g === "f" ? "li" : "liya";
    if (lang === "hi") return it.plural && it.g === "f" ? "लीं" : it.g === "f" ? "ली" : "लिया";
    return "";
  }

  function generate(sel) {
    sel = sel || {};
    var lang = LIKE[sel.lang] ? sel.lang : "hinglish";
    var s = {
      items: (sel.items || []).filter(function (k) { return ITEM[k]; }),
      fabrics: (sel.fabrics || []).filter(function (k) { return FAB[k]; }),
      occasions: (sel.occasions || []).filter(function (k) { return OCC[k]; }),
      liked: (sel.liked || []).filter(function (k) { return LIKE[lang][k]; })
    };
    // "Price/Rate" and "Wholesale rate" together say one thing: keep the wholesale one
    if (s.liked.indexOf("wholesale") >= 0) s.liked = s.liked.filter(function (k) { return k !== "price"; });
    var city = cleanCity(sel.city);
    var cityIsRewari = city && isRewari(city);
    var wholesale = s.occasions.indexOf("wholesale") >= 0;
    var occs = s.occasions.filter(function (o) { return o !== "wholesale"; }).slice(0, 2);
    var it = itemsPhrase(s, lang);

    // occasion phrase
    var occTxt = "";
    if (occs.length) {
      var ops = occs.map(function (o) { return pick(OCC[o][lang]); });
      occTxt = lang === "en" ? list(ops, lang) : list(ops, lang) + " ";
    }

    // where "Rewari" goes: in the shop name unless the customer's own city is Rewari
    var shopTxt = cityIsRewari ? pick(SHOP[lang].n) : pick(SHOP[lang].r);
    var bank = BUY[lang], tpl;
    var useCity = city && !cityIsRewari;
    if (lang === "en" && cityIsRewari) { cityIsRewari = false; shopTxt = pick(SHOP.en.r); }
    if (wholesale) tpl = pick(useCity ? bank.wholesaleCity : bank.wholesale);
    else if (!it) tpl = pick(bank.shopOnly);
    else tpl = pick(useCity ? bank.city : bank.plain);
    if (cityIsRewari) {
      // a local customer: say so once, in their own words
      var local = { hinglish: "Rewari se hi hain, ", en: "We are from Rewari and ", hi: "रेवाड़ी से ही हैं, " }[lang];
      tpl = local + (lang === "en" ? tpl.charAt(0).toLowerCase() + tpl.slice(1) : tpl);
    }
    var first = tpl
      .replace("{SHOP}", shopTxt)
      .replace("{CITY}", city)
      .replace("{OCC_C}", occTxt ? cap(occTxt) : "")
      .replace("{OCC}", occTxt)
      .replace("{ITEMS}", it ? it.text : (lang === "en" ? "sarees" : lang === "hi" ? "साड़ियाँ" : "sarees"))
      .replace("{V}", it ? verb(it, lang) : "");
    first = first.replace("Rewari mein Mahavir Sarees aaye", "Rewari ke Mahavir Sarees aaye");
    first = first.replace(/\s+([.,।])/g, "$1").replace(/\s{2,}/g, " ").replace(/ ,/g, ",");
    if (lang === "en" && !occTxt) first = first.replace(/\s+\./, ".");
    first = cap(first.trim());

    var out = [first];
    // liked: 1-2 sentences
    var liked = shuffle(s.liked);
    if (liked.length >= 3 && R() < 0.5) {
      var nouns = liked.slice(0, 3).map(function (k) { return LIKE_NOUN[lang][k]; });
      var t = pick(LIKE_LIST[lang]);
      if (lang === "hinglish" && t.indexOf("teeno") >= 0 && nouns.length !== 3) t = LIKE_LIST.hinglish[0];
      var sent = t.replace("{L}", list(nouns, lang));
      out.push(cap(sent));
      if (liked.length > 3) out.push(pick(LIKE[lang][liked[3]]));
    } else {
      liked.slice(0, 2).forEach(function (k) { out.push(pick(LIKE[lang][k])); });
      if (liked.length > 2) {
        var rest = liked.slice(2, 4).map(function (k) { return LIKE_NOUN[lang][k]; });
        var also = { hinglish: cap(list(rest, lang)) + " bhi badhiya.", en: cap(list(rest, lang)) + (rest.length > 1 || /s$/.test(rest[0]) ? " were good too." : " was good too."), hi: list(rest, lang) + " भी बढ़िया।" }[lang];
        out.push(also);
      }
    }
    // closing, only when the customer said they liked something
    if (s.liked.length && out.length < 4 && R() < 0.75) {
      var pool = CLOSE[lang].any.slice();
      var sareeBuyer = !s.items.length || s.items.some(function (k) { return ITEM[k].sareeish; });
      if (!sareeBuyer) pool = pool.slice(0, 2);
      if (wholesale) pool = CLOSE[lang].wholesale.concat(pool.slice(0, 1));
      else if (occs.indexOf("wedding") >= 0) pool = pool.concat(CLOSE[lang].wedding);
      out.push(pick(pool));
    }
    if (out.length > 4) out = out.slice(0, 4);
    return out.join(" ");
  }

  var Gen = { generate: generate, _itemsPhrase: itemsPhrase };
  if (typeof module !== "undefined" && module.exports) module.exports = Gen;
  else root.ReviewGen = Gen;

  /* ---------- page wiring ---------- */
  if (typeof document === "undefined") return;
  var URL_G = "https://search.google.com/local/writereview?placeid=ChIJH-zm0-JbDTkRDstd5M6Uox0";
  var form = document.getElementById("rv");
  var box = document.getElementById("draft");
  var cityEl = document.getElementById("city");
  var toast = document.getElementById("toast");
  var edited = false;

  function vals(name) {
    return [].slice.call(form.querySelectorAll('input[name="' + name + '"]:checked')).map(function (i) { return i.value; });
  }
  function sel() {
    return { items: vals("item"), fabrics: vals("fabric"), occasions: vals("occ"), liked: vals("like"), lang: (vals("lang")[0] || "hinglish"), city: cityEl.value };
  }
  function refresh(force) {
    if (edited && !force) return;
    var prev = box.value, txt, n = 0;
    do { txt = generate(sel()); n++; } while (txt === prev && n < 6);
    box.value = txt;
    box.lang = sel().lang === "hi" ? "hi" : "en-IN";
    edited = false;
    fit();
  }
  function fit() { box.style.height = "auto"; box.style.height = (box.scrollHeight + 4) + "px"; }
  form.addEventListener("change", function (e) { if (e.target !== box) { edited = false; refresh(true); } });
  cityEl.addEventListener("input", function () { clearTimeout(cityEl._t); cityEl._t = setTimeout(function () { edited = false; refresh(true); }, 350); });
  box.addEventListener("input", function () { edited = true; fit(); });
  window.addEventListener("resize", fit);
  document.getElementById("regen").addEventListener("click", function () { refresh(true); });

  function showToast(msg) {
    toast.textContent = msg; toast.classList.add("on");
    clearTimeout(toast._t); toast._t = setTimeout(function () { toast.classList.remove("on"); }, 3200);
  }
  function fallbackCopy(text) {
    var ok = false, t = document.createElement("textarea");
    t.value = text; t.setAttribute("readonly", ""); t.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px";
    document.body.appendChild(t);
    try { t.select(); t.setSelectionRange(0, text.length); ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(t);
    return ok;
  }
  document.getElementById("post").addEventListener("click", function (e) {
    e.preventDefault();
    var text = box.value.trim();
    var done = function () {
      showToast("Copied! Ab Google pe paste karke photo lagaiye ⭐");
      document.getElementById("after").hidden = false;
      setTimeout(function () {
        var w = null;
        try { w = window.open(URL_G, "_blank"); } catch (err) { w = null; }
        if (w) { try { w.opener = null; } catch (err) {} } else { window.location.href = URL_G; }
      }, 900);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  });
  refresh(true);
})(this);
