/* Wolgawurzeln · Interaktionen */
(function () {
  'use strict';
  var WA = '491735412807';
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  function go(url) { if (coarse) location.href = url; else window.open(url, '_blank', 'noopener'); }

  /* Menü */
  var mbtn = document.querySelector('.menu-btn'), mnav = document.getElementById('mnav');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    if (mbtn) mbtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (mnav) mnav.hidden = !open;
  }
  if (mbtn && mnav) {
    mbtn.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); mbtn.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 1060) setMenu(false); });
  }

  /* Ersteinschätzung per WhatsApp */
  document.querySelectorAll('form.nform').forEach(function (f) {
    var i = f.querySelector('input');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = (i.value || '').trim();
      if (!n) { i.setAttribute('aria-invalid', 'true'); i.focus(); return; }
      i.removeAttribute('aria-invalid');
      go('https://wa.me/' + WA + '?text=' + encodeURIComponent((f.getAttribute('data-wa') || '{n}').replace('{n}', n)));
    });
    i.addEventListener('input', function () { i.removeAttribute('aria-invalid'); });
  });

  /* Dialoge */
  document.querySelectorAll('dialog.dlg').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('.dlg-close')) d.close(); });
  });
  var lb = document.getElementById('lb');
  if (lb && lb.showModal) {
    document.querySelectorAll('[data-full]').forEach(function (b) {
      b.addEventListener('click', function () {
        lb.querySelector('img').src = b.getAttribute('data-full');
        lb.querySelector('img').alt = (b.querySelector('img') || {}).alt || '';
        lb.querySelector('figcaption').textContent = b.getAttribute('data-caption') || '';
        lb.showModal();
      });
    });
  }

  /* Auftrag: vorzeitiger Beginn bestätigen, dann Bezahlseite */
  var od = document.getElementById('order');
  if (od && od.showModal) {
    var P = {
      hb: { art: 'den', name: 'Herkunftsbericht', price: '39 €', time: 'Lieferung als PDF in 3 bis 5 Tagen.', code: 'HB39', url: 'https://buy.stripe.com/aFa00cb0y8gw8UlceM6Vq01' },
      fg: { art: 'die', name: 'Familiengeschichte', price: '69 €', time: 'Lieferung als PDF in 5 bis 8 Tagen.', code: 'FG69', url: 'https://buy.stripe.com/9B6cMYc4C8gwc6xceM6Vq00' }
    };
    var cur = null, w = od.querySelector('#chk-waiver'), r = od.querySelector('#chk-review'), bk = od.querySelector('#chk-book'), pay = od.querySelector('#order-pay'), wa = od.querySelector('#order-wa'), ml = od.querySelector('#order-mail');
    var WAIVE = 'Ich verlange ausdrücklich, dass mit der Erstellung schon vor Ablauf der Widerrufsfrist begonnen wird. Mir ist bekannt, dass mein Widerrufsrecht mit Beginn der Ausführung erlischt.';
    function msg() {
      return 'Hallo Edwin, ich möchte ' + (cur.art || 'den') + ' ' + cur.name + ' (' + cur.price + ') bestellen und per Überweisung oder PayPal bezahlen.' +
        (bk && bk.checked ? ' Zusätzlich hätte ich gern das gedruckte Fotobuch (29 €).' : '') + ' ' + WAIVE + (r.checked ? ' Eine Mail mit der Bitte um eine Bewertung nach der Lieferung ist in Ordnung.' : '') + ' Mein Nachname: ';
    }
    function setA(a, ok, href) { if (!a) return; a.setAttribute('aria-disabled', ok ? 'false' : 'true'); if (ok) a.setAttribute('href', href); else a.removeAttribute('href'); }
    function upd() {
      var ok = !!(cur && w.checked);
      if (!ok) { setA(pay, false); setA(wa, false); setA(ml, false); return; }
      var ts = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
      setA(pay, true, cur.url + '?locale=de&client_reference_id=' + encodeURIComponent([cur.code, 'verzicht-ja', 'bewertung-' + (r.checked ? 'ja' : 'nein'), 'fotobuch-' + (bk && bk.checked ? 'ja' : 'nein'), ts].join('_')));
      setA(wa, true, 'https://wa.me/491735412807?text=' + encodeURIComponent(msg()));
      setA(ml, true, 'mailto:edwin@wolgawurzeln.de?subject=' + encodeURIComponent('Bestellung ' + cur.name) + '&body=' + encodeURIComponent(msg()));
    }
    document.querySelectorAll('[data-order]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault(); cur = P[b.getAttribute('data-order')]; if (!cur) return;
        od.querySelector('#order-title').textContent = 'Auftrag: ' + cur.name + ', ' + cur.price;
        od.querySelector('#order-time').textContent = cur.time;
        w.checked = false; r.checked = false; if (bk) bk.checked = b.hasAttribute('data-book'); upd(); od.showModal();
      });
    });
    [w, r, bk].forEach(function (x) { if (x) x.addEventListener('change', upd); });
    [pay, wa, ml].forEach(function (a) {
      if (!a) return;
      a.addEventListener('click', function (e) {
        if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); w.focus(); w.closest('.check').classList.add('nudge'); setTimeout(function () { w.closest('.check').classList.remove('nudge'); }, 900); return; }
        upd(); setTimeout(function () { od.close(); }, 400);
      });
    });
  }

  /* Inhaltsverzeichnis: aktuellen Abschnitt markieren */
  var toc = document.querySelectorAll('.toc a');
  if (toc.length && 'IntersectionObserver' in window) {
    var map = {};
    toc.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) { toc.forEach(function (a) { a.classList.remove('on'); }); map[en.target.id].classList.add('on'); }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* Koloniefilter */
  var fi = document.getElementById('colfilter');
  if (fi) {
    var rows = Array.prototype.slice.call(document.querySelectorAll('.col-tbl tbody tr'));
    var out = document.getElementById('colcount');
    var norm = function (s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };
    fi.addEventListener('input', function () {
      var q = norm(fi.value.trim()), n = 0;
      rows.forEach(function (tr) { var hit = !q || norm(tr.textContent).indexOf(q) > -1; tr.hidden = !hit; if (hit) n++; });
      out.textContent = q ? n + ' Treffer' : rows.length + ' Orte';
    });
  }
})();

/* Portalfunktionen */
(function () {
  'use strict';
  var WA = '491735412807';
  var norm = function (s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };

  /* Suche */
  var si = document.getElementById('site-search'), idxEl = document.getElementById('search-index');
  if (si && idxEl) {
    var idx = JSON.parse(idxEl.textContent), box = document.getElementById('search-results'), sel = -1;
    var render = function () {
      var q = norm(si.value.trim()); sel = -1;
      if (q.length < 2) { box.hidden = true; box.innerHTML = ''; return; }
      var hits = idx.filter(function (e) { return norm(e.n + ' ' + (e.a || '')).indexOf(q) > -1; }).slice(0, 8);
      if (!hits.length) {
        box.innerHTML = '<p>Kein Treffer im Nachschlagewerk. Suchen Sie einen Nachnamen? Die Zuordnung klärt eine <a href="#anfrage">kostenlose Ersteinschätzung</a>.</p>';
      } else {
        box.innerHTML = hits.map(function (e) { return '<a href="' + e.u + '"><span class="t">' + e.t + '</span><span><b>' + e.n + '</b>' + (e.a ? '<small>' + e.a + '</small>' : '') + '</span></a>'; }).join('');
      }
      box.hidden = false;
    };
    si.addEventListener('input', render);
    si.addEventListener('keydown', function (e) {
      var links = box.querySelectorAll('a[href]:not([href="#anfrage"])');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); if (!links.length) return;
        sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
        links.forEach(function (l, i) { l.classList.toggle('on', i === sel); });
      } else if (e.key === 'Enter' && links.length) { e.preventDefault(); location.href = links[Math.max(sel, 0)].getAttribute('href'); }
      else if (e.key === 'Escape') { box.hidden = true; }
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.search')) box.hidden = true; });
  }

  /* Kolonieverzeichnis mit Suchbegriff aus der Adresse */
  var cf = document.getElementById('colfilter');
  if (cf) {
    var q = new URLSearchParams(location.search).get('q');
    if (q) { cf.value = q; cf.dispatchEvent(new Event('input')); }
  }

  /* Schriftbeispiel umschalten */
  document.querySelectorAll('.seg').forEach(function (seg) {
    var bs = Array.prototype.slice.call(seg.querySelectorAll('button'));
    bs.forEach(function (b) {
      b.addEventListener('click', function () {
        bs.forEach(function (x) {
          var on = x === b; x.setAttribute('aria-selected', on ? 'true' : 'false');
          var p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on;
        });
      });
    });
  });

  /* Anfrageformular: öffnet WhatsApp oder Mail mit vorbereiteter Nachricht */
  var rf = document.getElementById('reqform');
  if (rf) {
    rf.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (n) { return (rf.elements[n].value || '').trim(); };
      var must = ['name', 'nachname'], ok = true;
      must.forEach(function (n) { var el = rf.elements[n]; if (!v(n)) { el.setAttribute('aria-invalid', 'true'); ok = false; } else el.removeAttribute('aria-invalid'); });
      if (!ok) { rf.querySelector('[aria-invalid="true"]').focus(); return; }
      var text = 'Anfrage über wolgawurzeln.de\nName: ' + v('name') + '\nNachname(n): ' + v('nachname') + (v('ort') ? '\nHerkunftsort oder Region: ' + v('ort') : '') + (v('anliegen') ? '\nAnliegen: ' + v('anliegen') : '');
      var via = (rf.querySelector('input[name="via"]:checked') || {}).value;
      var url = via === 'mail'
        ? 'mailto:edwin@wolgawurzeln.de?subject=' + encodeURIComponent('Anfrage: ' + v('nachname')) + '&body=' + encodeURIComponent(text)
        : 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
      if (via === 'mail' || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) location.href = url; else window.open(url, '_blank', 'noopener');
    });
  }
})();

/* Wolgawurzeln v3: Kopfzeile, Paketwahl, Kaufleiste, Siegel, Vorbelegung */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hdr = d.querySelector('.hdr');
  var onHdr = function () { if (hdr) hdr.classList.toggle('solid', (w.scrollY || 0) > 8); };
  w.addEventListener('scroll', onHdr, { passive: true }); onHdr();
  var si = d.getElementById('site-search');
  if (si && w.matchMedia && w.matchMedia('(max-width: 560px)').matches) si.placeholder = 'Kolonie oder Begriff suchen';

  d.querySelectorAll('[data-prefill]').forEach(function (a) {
    a.addEventListener('click', function () {
      var f = d.getElementById('reqform'); if (!f) return;
      var t = f.elements['anliegen']; if (t && !t.value.trim()) t.value = a.getAttribute('data-prefill') + ': ';
    });
  });

  var track = d.getElementById('pk-track'); if (!track) return;
  var cards = [].slice.call(track.querySelectorAll('.pk'));
  var picks = [].slice.call(d.querySelectorAll('[data-pick]'));
  var dots = [].slice.call(d.querySelectorAll('.pk-dots i'));
  var mq = w.matchMedia('(max-width: 880px)');
  var bar = d.getElementById('pkbar'), sec = d.getElementById('pakete'), req = d.getElementById('anfrage');
  var cur = 'fg', touched = false, dismissed = false, past = false, nearEnd = false;
  var card = function (id) { return d.getElementById('pk-' + id); };

  function updBar() {
    if (!bar) return;
    var c = card(cur); if (!c) return;
    bar.querySelector('.pkbar-n').textContent = c.getAttribute('data-name');
    bar.querySelector('.pkbar-p').textContent = c.getAttribute('data-price');
    var ord = d.getElementById('pkbar-order'), ask = d.getElementById('pkbar-ask');
    var buy = cur === 'hb' || cur === 'fg';
    ord.hidden = !buy; ask.hidden = buy;
    if (buy) ord.setAttribute('data-order', cur); else ask.setAttribute('data-prefill', c.getAttribute('data-name'));
    bar.hidden = !(mq.matches && touched && !dismissed && past && !nearEnd && !d.body.classList.contains('menu-open'));
  }
  function setActive(id) {
    cur = id;
    cards.forEach(function (c, i) {
      var on = c.getAttribute('data-pk') === id;
      c.classList.toggle('is-active', on);
      if (dots[i]) dots[i].classList.toggle('on', on);
    });
    picks.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-pick') === id ? 'true' : 'false'); });
    updBar();
  }
  function center(id, smooth) {
    var c = card(id); if (!c) return;
    var left = c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2;
    if (track.scrollTo) track.scrollTo({ left: left, behavior: smooth && !reduce ? 'smooth' : 'auto' }); else track.scrollLeft = left;
  }
  picks.forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-pick'); touched = true; setActive(id);
      if (mq.matches) center(id, true);
    });
  });
  var raf = 0;
  track.addEventListener('scroll', function () {
    if (!mq.matches) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () {
      var mid = track.scrollLeft + track.clientWidth / 2, best = null, bd = Infinity;
      cards.forEach(function (c) { var dd = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (dd < bd) { bd = dd; best = c; } });
      if (best && best.getAttribute('data-pk') !== cur) { touched = true; setActive(best.getAttribute('data-pk')); }
    });
  }, { passive: true });
  setActive(cur);
  if (mq.matches) center(cur, false);
  if (mq.addEventListener) mq.addEventListener('change', function () { if (mq.matches) center(cur, false); updBar(); });

  var ticking = false;
  w.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (sec) past = sec.getBoundingClientRect().bottom < 0;
      if (req) nearEnd = req.getBoundingClientRect().top < w.innerHeight;
      updBar();
    });
  }, { passive: true });
  if (bar) bar.querySelector('.pkbar-x').addEventListener('click', function () { dismissed = true; updBar(); });

  var seal = d.querySelector('.seal-badge');
  if (seal && !reduce && 'IntersectionObserver' in w) {
    seal.classList.add('pre');
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { seal.classList.remove('pre'); seal.classList.add('stamp'); so.disconnect(); } });
    }, { threshold: 0.7 });
    so.observe(seal);
  }
})();
/* Runde 2: Zähler im Hero, Einblenden beim Scrollen */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in w)) return;
  function count(el, delay) {
    var t = +el.getAttribute('data-count');
    if (reduce) { el.textContent = t.toLocaleString('de-DE'); return; }
    setTimeout(function () {
      var s = performance.now(), dur = t > 100000 ? 2200 : 1500;
      (function f(n) {
        var p = Math.min(1, (n - s) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(t * e).toLocaleString('de-DE');
        if (p < 1) requestAnimationFrame(f);
      })(s);
    }, delay);
  }
  var nums = d.querySelectorAll('.hero [data-count]');
  if (nums.length) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var inNotes = !!e.target.closest('.geo-notes'), fresh = performance.now() < 2500;
        var i = inNotes ? Array.prototype.indexOf.call(d.querySelectorAll('.geo-notes [data-count]'), e.target) : 0;
        count(e.target, inNotes ? (fresh ? 1500 + i * 400 : 150 + i * 300) : (fresh ? 1200 : 200));
      });
    }, { threshold: .4 });
    nums.forEach(function (el) { cio.observe(el); });
  }
  if (reduce) return;
  var sels = ['.sec-head', '.pick-opts button', '.pk', '.trust li', '.rd-doc', '.rd-copy', '.ablauf li', '.regs li', '.art', '.portal-in > *', '.origin li', '.faq-side', '.faq details', '.req-copy', '.reqform'];
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in'); io.unobserve(e.target);
      var st = e.target.closest('.ablauf'); if (st) st.classList.add('in');
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: .1 });
  sels.forEach(function (s) {
    d.querySelectorAll(s).forEach(function (el) {
      var i = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.classList.add('rv'); el.style.setProperty('--i', Math.min(i, 7)); io.observe(el);
    });
  });
})();

window.VOLGA={"s0":60.0,"ds":0.5,"cx":[119.431,118.951,118.452,117.954,117.459,116.966,116.474,115.983,115.493,115.004,114.515,114.027,113.541,113.055,112.571,112.09,111.61,111.133,110.66,110.192,109.729,109.276,108.83,108.381,107.926,107.467,107.003,106.532,106.056,105.567,105.068,104.569,104.074,103.584,103.102,102.627,102.157,101.692,101.232,100.777,100.328,99.884,99.445,99.013,98.587,98.166,97.751,97.343,96.94,96.544,96.156,95.776,95.405,95.035,94.651,94.252,93.838,93.41,92.967,92.511,92.043,91.583,91.133,90.693,90.265,89.846,89.437,89.038,88.647,88.252,87.853,87.449,87.042,86.631,86.218,85.8,85.38,84.958,84.532,84.099,83.66,83.215,82.764,82.308,81.846,81.379,80.907,80.431,79.951,79.473,78.997,78.524,78.055,77.596,77.158,76.753,76.377,76.026,75.7,75.402,75.115,74.835,74.56,74.288,74.018,73.752,73.486,73.221,72.951,72.675,72.387,72.093,71.789,71.472,71.145,70.806,70.447,70.073,69.681,69.283,68.89,68.505,68.128,67.761,67.405,67.065,66.729,66.37,65.996,65.611,65.218,64.819,64.413,64.003,63.59,63.174,62.756,62.334,61.91,61.482,61.046,60.601,60.133,59.696,59.294,58.909,58.536,58.169,57.808,57.452,57.099,56.749,56.392,56.028,55.651,55.268,54.873,54.461,54.037,53.597,53.14,52.663,52.172,51.676,51.176,50.676,50.177,49.681,49.187,48.694,48.205,47.718,47.233,46.746,46.258,45.769,45.279,44.788,44.294,43.799,43.302,42.803,42.306,41.811,41.318,40.829,40.345,39.87,39.41,38.961,38.522,38.091,37.669,37.253,36.839,36.422,36.0,35.573,35.138,34.688,34.208,33.709,33.216,32.732,32.255,31.784,31.318,30.848,30.376,29.903,29.427,28.95,28.471,27.991,27.51,27.027,26.544,26.06,25.58,25.104,24.634,24.171,23.717,23.271,22.839,22.426,22.032,21.664,21.307,20.956,20.61,20.276,19.959,19.692,19.512,19.396,19.322,19.277,19.222,19.142,19.036,18.906,18.75,18.569,18.355,18.11,17.83,17.512,17.198,16.904,16.622,16.352,16.09,15.834,15.584,15.348,15.124,14.909,14.704,14.506,14.318,14.137,13.962,13.793,13.631,13.468,13.296,13.113,12.92,12.715,12.494,12.252,11.983,11.679,11.338,10.974,10.594,10.203,9.805,9.4,8.99,8.576,8.16,7.739,7.317,6.894,6.468,6.041,5.611,5.18,4.748,4.313,3.878,3.44,3.001,2.561,2.119,1.676,1.237,0.8,0.367,-0.061,-0.481,-0.89,-1.277,-1.599,-1.771,-1.874,-1.95,-2.009,-2.056,-2.093,-2.125,-2.152,-2.174,-2.193,-2.218,-2.247,-2.287,-2.331,-2.388,-2.459,-2.545,-2.653,-2.795,-2.993,-3.249,-3.535,-3.839,-4.154,-4.477,-4.805,-5.14,-5.478,-5.82,-6.165,-6.511,-6.854,-7.195,-7.529,-7.862,-8.189,-8.51,-8.828,-9.137,-9.438,-9.73,-10.013,-10.281,-10.533,-10.767,-10.982,-11.177,-11.349,-11.498,-11.622,-11.718,-11.792,-11.851,-11.898,-11.937,-11.966,-11.991,-12.01,-12.024,-12.036,-12.042,-12.048,-12.048,-12.048,-12.044,-12.04,-12.032,-12.022,-12.008,-11.99,-11.97,-11.941,-11.906,-11.862,-11.805,-11.728,-11.628,-11.506,-11.36,-11.194,-11.006,-10.799,-10.573,-10.33,-10.07,-9.793,-9.498,-9.188,-8.861,-8.519,-8.162,-7.794,-7.418,-7.035,-6.648,-6.257,-5.863,-5.466,-5.067,-4.666,-4.264,-3.859,-3.454,-3.053,-2.652,-2.256,-1.862,-1.473,-1.089,-0.715,-0.352,-0.01,0.283,0.531,0.729,0.874,0.973,1.02,1.028,0.993,0.926,0.828,0.701,0.579,0.495,0.451,0.444,0.471,0.529,0.617,0.725,0.853,1.004,1.176,1.369,1.584,1.821,2.045,2.25,2.441,2.618,2.784,2.939,3.085,3.221,3.343,3.447,3.527,3.579,3.594,3.553,3.444,3.293,3.121,2.929,2.721,2.499,2.261,1.987,1.687,1.369,1.037,0.693,0.34,-0.02,-0.384,-0.757,-1.143,-1.552,-1.973,-2.404,-2.842,-3.289,-3.736,-4.194,-4.651,-5.111,-5.576,-6.041,-6.507,-6.978,-7.449,-7.919,-8.394,-8.869,-9.344,-9.819,-10.298,-10.776,-11.255,-11.733,-12.21,-12.688,-13.165,-13.642,-14.118,-14.594,-15.069,-15.543,-16.018,-16.491,-16.962,-17.434,-17.902,-18.37,-18.832,-19.29,-19.74,-20.166,-20.582,-20.985,-21.366,-21.719,-22.024,-22.281,-22.5,-22.685,-22.841,-22.965,-23.038,-23.08,-23.102,-23.11,-23.105,-23.091,-23.072,-23.045,-23.014,-22.979,-22.942,-22.903,-22.861,-22.816,-22.768,-22.714,-22.652,-22.578,-22.481,-22.294,-22.061,-21.805,-21.532,-21.248,-20.957,-20.66,-20.357,-20.051,-19.74,-19.427,-19.118,-18.811,-18.506,-18.204,-17.903,-17.606,-17.309,-17.014,-16.722,-16.429,-16.14,-15.851,-15.562,-15.277,-14.992,-14.708,-14.426,-14.144,-13.862,-13.583,-13.304,-13.025,-12.75,-12.475,-12.2,-11.929,-11.659,-11.39,-11.126,-10.862,-10.604,-10.347,-10.098,-9.851,-9.617,-9.392,-9.184,-9.002,-8.832,-8.675,-8.531,-8.402,-8.289,-8.192,-8.114,-8.063,-8.047,-8.063,-8.109,-8.185,-8.29,-8.421,-8.611,-8.838,-9.086,-9.35,-9.631,-9.915,-10.213,-10.511,-10.821,-11.13,-11.446,-11.763,-12.083,-12.408,-12.734,-13.057,-13.38,-13.702,-14.022,-14.341,-14.659,-14.975,-15.29,-15.601,-15.913,-16.22,-16.526,-16.827,-17.127,-17.422,-17.711,-18.0,-18.307,-18.622,-18.947,-19.284,-19.625,-19.979,-20.335,-20.7,-21.069,-21.444,-21.823,-22.207,-22.594,-22.987,-23.38,-23.766,-24.153,-24.534,-24.914,-25.29,-25.664,-26.034,-26.4,-26.764,-27.122,-27.48,-27.831,-28.182,-28.525,-28.868,-29.204,-29.54,-29.882,-30.225,-30.576,-30.928,-31.289,-31.651,-32.022,-32.396,-32.779,-33.167,-33.56,-33.964,-34.373,-34.79,-35.205,-35.62,-36.032,-36.443,-36.849,-37.251,-37.644,-38.02,-38.374,-38.706,-39.013,-39.295,-39.512,-39.707,-39.887,-40.063,-40.233,-40.399,-40.562,-40.723,-40.881,-41.039,-41.193,-41.347,-41.501,-41.652,-41.803,-41.954,-42.107,-42.26,-42.413,-42.568,-42.723,-42.88,-43.038,-43.197,-43.36,-43.524,-43.693,-43.867,-44.051,-44.258,-44.437,-44.576,-44.693,-44.794,-44.885,-44.97,-45.048,-45.12,-45.189,-45.252,-45.314,-45.372,-45.43,-45.483,-45.535,-45.581,-45.627,-45.667,-45.704,-45.738,-45.764,-45.787,-45.805,-45.814,-45.815,-45.807,-45.789,-45.757,-45.711,-45.651,-45.575,-45.479,-45.363,-45.24,-45.125,-45.022,-44.938,-44.88,-44.898,-45.055,-45.263,-45.495,-45.741,-45.994],"cz":[-115.386,-115.261,-115.275,-115.326,-115.396,-115.477,-115.565,-115.66,-115.76,-115.862,-115.969,-116.077,-116.193,-116.312,-116.438,-116.572,-116.713,-116.863,-117.026,-117.2,-117.391,-117.601,-117.828,-118.046,-118.255,-118.453,-118.638,-118.807,-118.958,-119.06,-119.089,-119.067,-119.001,-118.899,-118.767,-118.612,-118.441,-118.257,-118.061,-117.854,-117.635,-117.405,-117.165,-116.914,-116.652,-116.382,-116.103,-115.815,-115.519,-115.213,-114.898,-114.573,-114.238,-113.902,-113.582,-113.281,-113.001,-112.743,-112.511,-112.305,-112.129,-111.936,-111.718,-111.479,-111.222,-110.949,-110.661,-110.36,-110.048,-109.741,-109.441,-109.146,-108.855,-108.57,-108.289,-108.014,-107.743,-107.475,-107.213,-106.963,-106.724,-106.497,-106.28,-106.074,-105.884,-105.707,-105.542,-105.389,-105.249,-105.102,-104.949,-104.788,-104.612,-104.416,-104.176,-103.882,-103.554,-103.198,-102.818,-102.417,-102.008,-101.593,-101.176,-100.756,-100.335,-99.913,-99.489,-99.065,-98.644,-98.227,-97.819,-97.414,-97.018,-96.631,-96.253,-95.885,-95.536,-95.205,-94.896,-94.594,-94.283,-93.964,-93.636,-93.297,-92.946,-92.58,-92.21,-91.861,-91.529,-91.21,-90.902,-90.601,-90.308,-90.022,-89.741,-89.463,-89.19,-88.92,-88.656,-88.398,-88.153,-87.926,-87.753,-87.514,-87.217,-86.897,-86.565,-86.225,-85.88,-85.528,-85.174,-84.817,-84.468,-84.124,-83.795,-83.475,-83.169,-82.884,-82.62,-82.384,-82.184,-82.034,-81.941,-81.889,-81.87,-81.88,-81.916,-81.974,-82.048,-82.135,-82.237,-82.352,-82.471,-82.585,-82.694,-82.799,-82.899,-82.991,-83.073,-83.143,-83.194,-83.231,-83.283,-83.352,-83.438,-83.542,-83.665,-83.822,-84.017,-84.236,-84.475,-84.729,-84.996,-85.274,-85.554,-85.83,-86.099,-86.359,-86.605,-86.823,-86.951,-86.932,-86.85,-86.724,-86.574,-86.407,-86.227,-86.055,-85.89,-85.73,-85.575,-85.426,-85.283,-85.143,-85.007,-84.875,-84.747,-84.622,-84.481,-84.329,-84.159,-83.969,-83.762,-83.535,-83.284,-83.002,-82.694,-82.357,-82.006,-81.651,-81.289,-80.917,-80.531,-80.109,-79.644,-79.158,-78.664,-78.166,-77.669,-77.175,-76.687,-76.204,-75.729,-75.263,-74.811,-74.376,-73.962,-73.576,-73.187,-72.783,-72.37,-71.949,-71.523,-71.093,-70.661,-70.22,-69.773,-69.321,-68.866,-68.406,-67.943,-67.477,-67.009,-66.538,-66.065,-65.592,-65.123,-64.658,-64.196,-63.741,-63.292,-62.855,-62.433,-62.036,-61.671,-61.329,-61.005,-60.693,-60.391,-60.096,-59.81,-59.53,-59.253,-58.983,-58.714,-58.449,-58.187,-57.927,-57.672,-57.418,-57.167,-56.92,-56.674,-56.432,-56.192,-55.955,-55.721,-55.489,-55.25,-55.008,-54.758,-54.499,-54.228,-53.94,-53.625,-53.246,-52.779,-52.29,-51.796,-51.299,-50.801,-50.303,-49.804,-49.305,-48.805,-48.305,-47.806,-47.307,-46.809,-46.311,-45.814,-45.319,-44.826,-44.338,-43.86,-43.402,-42.972,-42.562,-42.165,-41.777,-41.395,-41.018,-40.647,-40.278,-39.913,-39.552,-39.191,-38.827,-38.461,-38.089,-37.716,-37.338,-36.955,-36.569,-36.176,-35.777,-35.371,-34.958,-34.537,-34.105,-33.663,-33.212,-32.751,-32.282,-31.805,-31.321,-30.83,-30.336,-29.839,-29.342,-28.843,-28.344,-27.845,-27.345,-26.845,-26.345,-25.845,-25.345,-24.845,-24.345,-23.845,-23.345,-22.845,-22.346,-21.846,-21.346,-20.846,-20.347,-19.849,-19.35,-18.854,-18.36,-17.87,-17.386,-16.907,-16.436,-15.972,-15.517,-15.072,-14.635,-14.208,-13.791,-13.387,-12.996,-12.617,-12.253,-11.903,-11.564,-11.234,-10.913,-10.597,-10.285,-9.977,-9.673,-9.371,-9.073,-8.776,-8.483,-8.189,-7.891,-7.592,-7.287,-6.978,-6.665,-6.344,-6.013,-5.669,-5.305,-4.9,-4.466,-4.007,-3.529,-3.039,-2.542,-2.042,-1.544,-1.048,-0.558,-0.074,0.41,0.903,1.401,1.9,2.399,2.896,3.388,3.876,4.359,4.836,5.306,5.767,6.218,6.658,7.105,7.561,8.023,8.491,8.962,9.438,9.916,10.397,10.882,11.371,11.864,12.361,12.861,13.359,13.846,14.322,14.792,15.254,15.708,16.156,16.596,17.014,17.414,17.799,18.173,18.536,18.89,19.237,19.579,19.913,20.229,20.517,20.786,21.038,21.279,21.503,21.728,21.929,22.131,22.328,22.512,22.695,22.876,23.044,23.213,23.381,23.539,23.695,23.851,24.005,24.15,24.296,24.441,24.587,24.735,24.884,25.033,25.184,25.337,25.49,25.645,25.803,25.962,26.124,26.29,26.456,26.632,26.808,26.999,27.198,27.417,27.678,27.955,28.251,28.575,28.929,29.325,29.753,30.202,30.666,31.142,31.626,32.12,32.618,33.117,33.617,34.117,34.617,35.117,35.616,36.115,36.614,37.112,37.611,38.109,38.607,39.105,39.602,40.098,40.592,41.083,41.546,41.988,42.417,42.837,43.248,43.655,44.056,44.454,44.849,45.241,45.631,46.024,46.419,46.815,47.214,47.612,48.015,48.417,48.821,49.226,49.632,50.04,50.448,50.856,51.267,51.678,52.089,52.502,52.915,53.328,53.743,54.158,54.573,54.99,55.408,55.825,56.246,56.666,57.088,57.512,57.937,58.365,58.794,59.228,59.662,60.105,60.551,61.005,61.471,61.941,62.416,62.895,63.378,63.865,64.355,64.849,65.346,65.846,66.345,66.843,67.337,67.826,68.308,68.77,69.215,69.649,70.074,70.487,70.899,71.3,71.701,72.094,72.488,72.875,73.261,73.645,74.025,74.405,74.786,75.168,75.55,75.935,76.319,76.706,77.093,77.482,77.873,78.264,78.658,79.054,79.452,79.853,80.257,80.664,81.073,81.467,81.855,82.235,82.604,82.97,83.324,83.674,84.016,84.354,84.684,85.011,85.33,85.647,85.956,86.266,86.582,86.899,87.223,87.548,87.877,88.21,88.546,88.887,89.23,89.578,89.927,90.283,90.64,91.003,91.367,91.737,92.108,92.473,92.836,93.192,93.547,93.893,94.238,94.573,94.905,95.227,95.542,95.85,96.146,96.433,96.709,96.987,97.267,97.549,97.835,98.126,98.424,98.732,99.062,99.414,99.789,100.183,100.596,101.046,101.506,101.973,102.441,102.911,103.383,103.855,104.329,104.803,105.278,105.753,106.229,106.704,107.181,107.658,108.134,108.611,109.087,109.563,110.038,110.513,110.988,111.462,111.936,112.409,112.881,113.352,113.821,114.286,114.741,115.207,115.687,116.173,116.663,117.154,117.647,118.141,118.636,119.131,119.627,120.123,120.62,121.116,121.614,122.111,122.609,123.107,123.605,124.104,124.602,125.102,125.601,126.101,126.601,127.101,127.601,128.1,128.599,129.097,129.593,130.087,130.578,131.064,131.549,132.036,132.525,133.018,133.514,134.01,134.484,134.938,135.381,135.817,136.248],"m":[{"n":"Wolsk","s":83.5,"d":1.16,"k":"c"},{"n":"Schaffhausen","s":94.75,"d":-5.99,"k":"k"},{"n":"Biberstein","s":97.0,"d":-5.36,"k":"k"},{"n":"Bettinger","s":98.25,"d":-6.04,"k":"k"},{"n":"Kratz","s":101.5,"d":-5.61,"k":"k"},{"n":"Zürich","s":103.25,"d":-5.84,"k":"k"},{"n":"Schönchen","s":114.0,"d":-5.17,"k":"k"},{"n":"Zug","s":115.75,"d":-3.13,"k":"k"},{"n":"Meinhard","s":122.75,"d":-4.03,"k":"k"},{"n":"Kind","s":123.75,"d":-3.89,"k":"k"},{"n":"Näb","s":125.25,"d":-4.16,"k":"k"},{"n":"Orlowskoje","s":130.25,"d":-4.12,"k":"k"},{"n":"Obermonjou","s":135.75,"d":-3.71,"k":"k"},{"n":"Boisroux","s":138.0,"d":-9.77,"k":"k"},{"n":"Philippsfeld","s":140.5,"d":-8.97,"k":"k"},{"n":"Louis","s":140.75,"d":-39.9,"k":"k"},{"n":"Katharinenstadt","s":141.25,"d":-4.11,"k":"c"},{"n":"Mariental","s":142.0,"d":-31.83,"k":"kh"},{"n":"Herzog","s":142.5,"d":-27.1,"k":"k"},{"n":"Graf","s":143.25,"d":-28.31,"k":"k"},{"n":"Paulskoje","s":143.75,"d":-6.58,"k":"k"},{"n":"Schäfer","s":145.0,"d":-23.92,"k":"k"},{"n":"Urbach","s":146.0,"d":-23.47,"k":"k"},{"n":"Enders","s":152.25,"d":-10.42,"k":"k"},{"n":"Schwed","s":153.25,"d":-16.68,"k":"k"},{"n":"Rosenheim","s":154.75,"d":-11.88,"k":"k"},{"n":"Baum","s":176.25,"d":55.18,"k":"k"},{"n":"Reinwald","s":182.75,"d":-20.37,"k":"k"},{"n":"Pokrowsk","s":203.75,"d":-4.73,"k":"c"},{"n":"Saratow","s":208.25,"d":4.13,"k":"c"},{"n":"Schilling","s":248.0,"d":3.13,"k":"k"},{"n":"Walter","s":248.0,"d":71.87,"k":"k"},{"n":"Norka","s":248.5,"d":36.7,"k":"k"},{"n":"Beideck","s":249.0,"d":11.59,"k":"k"},{"n":"Kolb","s":250.5,"d":62.15,"k":"k"},{"n":"Huck","s":251.75,"d":33.37,"k":"k"},{"n":"Dönhof","s":254.0,"d":30.21,"k":"k"},{"n":"Bangert","s":255.0,"d":-6.01,"k":"k"},{"n":"Balzer","s":257.0,"d":16.23,"k":"kh"},{"n":"Moor","s":258.5,"d":20.17,"k":"k"},{"n":"Stahl am Tarlyk","s":260.75,"d":-4.17,"k":"k"},{"n":"Kukkus","s":262.75,"d":-1.59,"k":"kh"},{"n":"Lauwe","s":268.5,"d":-1.64,"k":"k"},{"n":"Jost","s":270.0,"d":-2.33,"k":"k"},{"n":"Laub","s":271.25,"d":-3.97,"k":"k"},{"n":"Dinkel","s":271.5,"d":-5.69,"k":"k"},{"n":"Straub","s":279.5,"d":-6.9,"k":"k"},{"n":"Warenburg","s":283.75,"d":-3.01,"k":"k"},{"n":"Preuß","s":288.75,"d":-4.57,"k":"k"},{"n":"Hölzel","s":289.5,"d":-5.47,"k":"k"},{"n":"Seelmann","s":296.0,"d":-7.3,"k":"kh"},{"n":"Leitsinger","s":313.5,"d":-2.74,"k":"k"},{"n":"Messer","s":316.25,"d":27.33,"k":"k"},{"n":"Bauer","s":319.0,"d":28.91,"k":"k"},{"n":"Frank","s":319.75,"d":71.24,"k":"kh"},{"n":"Merkel","s":319.75,"d":32.42,"k":"k"},{"n":"Dietel","s":320.0,"d":40.39,"k":"k"},{"n":"Degott","s":320.25,"d":25.06,"k":"k"},{"n":"Kauz","s":320.25,"d":44.23,"k":"k"},{"n":"Kratzke","s":320.25,"d":35.93,"k":"k"},{"n":"Seewald","s":320.75,"d":39.5,"k":"k"},{"n":"Rothammel","s":321.0,"d":42.29,"k":"k"},{"n":"Hussenbach","s":321.5,"d":62.09,"k":"k"},{"n":"Schuck","s":321.5,"d":24.66,"k":"k"},{"n":"Husaren","s":322.25,"d":15.2,"k":"k"},{"n":"Vollmer","s":322.25,"d":16.15,"k":"k"},{"n":"Bähr","s":324.75,"d":16.77,"k":"k"},{"n":"Hildmann","s":331.5,"d":19.78,"k":"k"},{"n":"Köhler","s":331.5,"d":21.92,"k":"k"},{"n":"Röthling","s":332.5,"d":29.67,"k":"k"},{"n":"Göbel","s":335.0,"d":24.28,"k":"k"},{"n":"Kraft","s":335.75,"d":21.29,"k":"k"},{"n":"Stephan","s":337.75,"d":8.03,"k":"k"},{"n":"Müller","s":340.25,"d":1.23,"k":"k"},{"n":"Holstein","s":352.75,"d":12.6,"k":"k"},{"n":"Galka","s":367.5,"d":4.2,"k":"k"},{"n":"Dreispitz","s":374.25,"d":11.33,"k":"k"},{"n":"Kamyschin","s":410.25,"d":2.01,"k":"c"}]};
(function () {
  'use strict';
  var d = document, w = window, sec = d.getElementById('intro'), D = w.VOLGA;
  if (!sec || !D) return;
  var stage = sec.querySelector('.intro-stage'), cv = sec.querySelector('.intro-canvas'), copy = sec.querySelector('.intro-copy'), cue = sec.querySelector('.intro-cuewrap'), lab = sec.querySelector('.intro-labels');
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = w.matchMedia('(max-width: 880px)').matches;
  var hero = d.querySelector('.hero'), prog = 0, titleOn = 1, draw = null, find = sec.querySelector('.intro-find'), fzBox = d.getElementById('fz'), fzOp = 1;
  function sm(t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }
  function st(a, b, x) { return sm((x - a) / (b - a)); }
  function onScroll() {
    var r = sec.getBoundingClientRect(), total = sec.offsetHeight - stage.offsetHeight;
    prog = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    titleOn = 1 - st(0.04, 0.34, prog);
    /* Namensprüfung: sichtbar halten, solange sie benutzt wird */
    var open = sec.classList.contains('fz-open'), busy = open || (fzBox && fzBox.contains(d.activeElement)), hold = 1 - st(0.3, 0.55, prog);
    copy.style.opacity = String(open ? 0 : (busy ? Math.max(titleOn, hold) : titleOn));
    copy.style.transform = 'translateY(' + (-60 * st(0, 0.5, prog)).toFixed(1) + 'px)';
    fzOp = busy ? hold : 1 - st(0.1, 0.36, prog);
    if (find) { find.style.opacity = String(fzOp); find.style.visibility = fzOp < 0.02 ? 'hidden' : ''; }
    if (cue) cue.style.opacity = String(1 - st(0, 0.12, prog));
    d.body.classList.toggle('at-intro', r.bottom > 80);
    if (reduce && draw) draw(performance.now());
  }
  if (hero) {
    if ('IntersectionObserver' in w) { var ho = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { hero.classList.add('go'); ho.disconnect(); } }); }, { threshold: 0.2 }); ho.observe(hero); }
    else hero.classList.add('go');
  }
  w.addEventListener('scroll', onScroll, { passive: true });
  if (fzBox) {
    w.addEventListener('fz:change', function () { sec.classList.toggle('fz-open', fzBox.classList.contains('has-res')); onScroll(); });
    fzBox.addEventListener('focusin', onScroll); fzBox.addEventListener('focusout', function () { setTimeout(onScroll, 50); });
  }
  var gl = null;
  try { gl = cv.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false }); } catch (e) { gl = null; }
  if (!gl) { sec.classList.add('no-gl'); onScroll(); return; }
  onScroll();
  /* Aufbau erst nach dem ersten Bild, damit der Titel sofort steht */
  w.requestAnimationFrame(function () { try { setup(); } catch (e) { sec.classList.add('no-gl'); if (w.console) console.warn('Intro', e); } });

  function setup() {
    /* Flusslauf: Mittellinie in km, x nach Osten, z nach Süden, an beiden Enden geradlinig verlängert. */
    var EXT = 110, DS = D.ds, N0 = D.cx.length, NPT = N0 + 2 * EXT, CX = new Float64Array(NPT), CZ = new Float64Array(NPT);
    (function () {
      var i, tx, tz, L;
      for (i = 0; i < N0; i++) { CX[EXT + i] = D.cx[i]; CZ[EXT + i] = D.cz[i]; }
      tx = D.cx[0] - D.cx[6]; tz = D.cz[0] - D.cz[6]; L = Math.hypot(tx, tz); tx /= L; tz /= L;
      for (i = 1; i <= EXT; i++) { CX[EXT - i] = D.cx[0] + tx * i * DS; CZ[EXT - i] = D.cz[0] + tz * i * DS; }
      tx = D.cx[N0 - 1] - D.cx[N0 - 7]; tz = D.cz[N0 - 1] - D.cz[N0 - 7]; L = Math.hypot(tx, tz); tx /= L; tz /= L;
      for (i = 1; i <= EXT; i++) { CX[EXT + N0 - 1 + i] = D.cx[N0 - 1] + tx * i * DS; CZ[EXT + N0 - 1 + i] = D.cz[N0 - 1] + tz * i * DS; }
    })();
    var S0 = D.s0 - EXT * DS, SEND = S0 + (NPT - 1) * DS;
    function C(s, o) { var f = (s - S0) / DS; if (f < 0) f = 0; if (f > NPT - 1.001) f = NPT - 1.001; var i = Math.floor(f), t = f - i; o[0] = CX[i] + (CX[i + 1] - CX[i]) * t; o[1] = CZ[i] + (CZ[i + 1] - CZ[i]) * t; return o; }
    var _a = [0, 0], _b = [0, 0];
    /* T zeigt nach Süden (wachsendes s), N nach Westen (Bergseite). L = halbe Sehnenlänge der Glättung */
    function TN(s, o, L) { L = L || 1.2; C(s - L, _a); C(s + L, _b); var tx = _b[0] - _a[0], tz = _b[1] - _a[1], l = Math.hypot(tx, tz) || 1; o[0] = tx / l; o[1] = tz / l; o[2] = -tz / l; o[3] = tx / l; return o; }
    function Csm(s, o) { var x = 0, z = 0, n = 0; for (var k = -4; k <= 4; k++) { C(s + k * 0.9, _a); x += _a[0]; z += _a[1]; n++; } o[0] = x / n; o[1] = z / n; return o; }
    function Tsm(s, o) { Csm(s - 2, _a); var ax = _a[0], az = _a[1]; Csm(s + 2, _b); var tx = _b[0] - ax, tz = _b[1] - az, L = Math.hypot(tx, tz) || 1; o[0] = tx / L; o[1] = tz / L; return o; }
    /* Projektion eines Weltpunkts auf die Mittellinie: PJ = [s, t]. iG: ungefährer Index, win: Suchfenster; iG < 0 = Gesamtsuche */
    var PJ = [0, 0];
    function proj(x, z, iG, win) {
      var lo, hi, i, dx, dz, dd, best = 0, bd = 1e30;
      if (iG < 0) {
        for (i = 0; i < NPT; i += 6) { dx = CX[i] - x; dz = CZ[i] - z; dd = dx * dx + dz * dz; if (dd < bd) { bd = dd; best = i; } }
        lo = Math.max(0, best - 8); hi = Math.min(NPT - 1, best + 8); bd = 1e30;
      } else { lo = Math.max(0, iG - win); hi = Math.min(NPT - 1, iG + win); }
      for (i = lo; i <= hi; i++) { dx = CX[i] - x; dz = CZ[i] - z; dd = dx * dx + dz * dz; if (dd < bd) { bd = dd; best = i; } }
      var bj = -1, bu = 0, bq = 1e30, qx = 0, qz = 0, btx = 0, btz = 0;
      for (var j = Math.max(0, best - 1); j <= Math.min(NPT - 2, best); j++) {
        var ax = CX[j], az = CZ[j], bx = CX[j + 1] - ax, bz = CZ[j + 1] - az, l2 = bx * bx + bz * bz || 1e-9;
        var u = ((x - ax) * bx + (z - az) * bz) / l2; if (u < 0) u = 0; if (u > 1) u = 1;
        var px = ax + bx * u, pz = az + bz * u, q = (px - x) * (px - x) + (pz - z) * (pz - z);
        if (q < bq) { bq = q; bj = j; bu = u; qx = px; qz = pz; btx = bx; btz = bz; }
      }
      var l = Math.hypot(btx, btz) || 1;
      PJ[0] = S0 + (bj + bu) * DS; PJ[1] = (x - qx) * (-btz / l) + (z - qz) * (btx / l);
      return PJ;
    }

    /* Rauschen */
    function hash(n) { var s = Math.sin(n) * 43758.5453123; return s - Math.floor(s); }
    function noise(x, y) {
      var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
      var a = hash(ix * 127.1 + iy * 311.7), b = hash((ix + 1) * 127.1 + iy * 311.7), c = hash(ix * 127.1 + (iy + 1) * 311.7), e = hash((ix + 1) * 127.1 + (iy + 1) * 311.7);
      var ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
      return a + (b - a) * ux + (c - a) * uy + (a - b - c + e) * ux * uy;
    }
    function fbm(x, y) { var v = 0, amp = 0.5; for (var i = 0; i < 4; i++) { v += amp * noise(x, y); x = x * 2.03 + 1.7; y = y * 2.03 + 9.2; amp *= 0.5; } return v; }
    function halfW(s) { return 1.25 + 0.5 * noise(s * 0.07, 0.37) + 0.25 * noise(s * 0.23 + 5, 0.91); }
    /* Höhe in km (überhöht). t: seitlicher Abstand von der Flussmitte, positiv = Westen (Bergseite) */
    function height(t, s) {
      var hw = halfW(s), a = Math.abs(t);
      if (a < hw) return -0.03;
      var e = a - hw;
      if (t > 0) {
        var bl = 0.72 * sm(e / 1.2) * (0.65 + 0.55 * fbm(s * 0.15 + 3.1, t * 0.3));
        var gully = -bl * 0.45 * Math.pow(Math.max(0, noise(s * 0.85 + 7.3, 2.5) * 1.6 - 0.75), 1.3) * sm(e / 0.6);
        var plat = 0.14 * sm(e / 9) * fbm(s * 0.05 + 1.7, t * 0.06 + 2.2);
        return 0.02 * sm(e / 0.35) + bl + gully + plat;
      }
      return 0.012 * sm(e / 0.5) + 0.05 * sm(e / 6) * fbm(s * 0.07 + 9.1, t * 0.08 + 4.2) + 0.035 * sm(e / 14) * (0.5 + fbm(s * 0.03 + 4.4, t * 0.03));
    }
    /* Geländehöhe als Funktion des Weltpunkts */
    function F(x, z, iG, win) { proj(x, z, iG, win); return height(PJ[1], PJ[0]); }
    /* reale Entfernung vom Fluss (km) auf Weltabstand: nahe Orte echt, ferne Orte auf halbe Distanz gerückt */
    function latWorld(dl, s) { var a = Math.abs(dl); return (dl < 0 ? -1 : 1) * (halfW(s) + 0.6 + (a < 3 ? a * 0.8 : 2.4 + (a - 3) * 0.5)); }

    /* Vertex: Position 3, Normale 3, t, hw, s */
    var STR = 9, tn = [0, 0, 0, 0], cc = [0, 0];
    function vert(arr, i, x, z, iG, win) {
      proj(x, z, iG, win); var s = PJ[0], t = PJ[1], h = height(t, s), dl = 0.2;
      var hx = F(x + dl, z, iG, win), hz = F(x, z + dl, iG, win);
      var nx = -(hx - h) / dl, nz = -(hz - h) / dl, L = Math.hypot(nx, 1, nz);
      arr[i] = x; arr[i + 1] = h; arr[i + 2] = z; arr[i + 3] = nx / L; arr[i + 4] = 1 / L; arr[i + 5] = nz / L; arr[i + 6] = t; arr[i + 7] = halfW(s); arr[i + 8] = s;
    }
    function quad(arr, j, a0, b0, c) { arr[j] = a0 + c; arr[j + 1] = b0 + c; arr[j + 2] = a0 + c + 1; arr[j + 3] = a0 + c + 1; arr[j + 4] = b0 + c; arr[j + 5] = b0 + c + 1; return j + 6; }

    /* Feines Band um die Kamera, ±LT km. Zeile 0 liegt hinten (Süden), Zeile ROWS-1 vorn (Norden).
       Seitliche Richtung je Spalte über längere Sehnen geglättet, damit sich die Zeilen in Flussbiegungen nicht kreuzen. */
    var ROWS = mobile ? 116 : 150, COLS = mobile ? 72 : 96, RS = 0.4, LT = 12, BACK = 6;
    var NV = ROWS * COLS, vb = new Float32Array(NV * STR), rowS = new Float32Array(ROWS), far = ROWS - 1;
    var tOf = new Float32Array(COLS), LS = [1.2, 3, 6, 10, 14], NLs = [];
    for (var c = 0; c < COLS; c++) { var u = -1 + 2 * c / (COLS - 1), au = Math.abs(u); var a = au < 0.5 ? 4 * au : 2 + (LT - 2) * Math.pow((au - 0.5) * 2, 1.3); tOf[c] = u < 0 ? -a : a; }
    for (c = 0; c < LS.length; c++) NLs.push([0, 0, 0, 0]);
    function fillRow(r) {
      var s = rowS[r], iG = Math.round((s - S0) / DS); C(s, cc);
      for (var k = 0; k < LS.length; k++) TN(s, NLs[k], LS[k]);
      var o = r * COLS * STR;
      for (var c = 0; c < COLS; c++) {
        var t = tOf[c], a = Math.abs(t), k = 0; while (k < LS.length - 2 && a > LS[k + 1]) k++;
        var wgt = a <= LS[k] ? 0 : Math.min(1, (a - LS[k]) / (LS[k + 1] - LS[k]));
        var nx = NLs[k][2] * (1 - wgt) + NLs[k + 1][2] * wgt, nz = NLs[k][3] * (1 - wgt) + NLs[k + 1][3] * wgt, L = Math.hypot(nx, nz) || 1;
        vert(vb, o + c * STR, cc[0] + nx / L * t, cc[1] + nz / L * t, iG, 30 + Math.round(a * 3));
      }
    }
    /* Flug nach Norden: s nimmt ab. Start bei Stephan und Müller, Ende bei Wolsk. */
    var SSTART = 346, SFIN = 92;
    var sCam = reduce ? 262 : SSTART;
    for (var r = 0; r < ROWS; r++) { rowS[r] = sCam + BACK - r * RS; fillRow(r); }
    var PER = (COLS - 1) * 6, idx = new Uint16Array(ROWS * PER), k = 0;
    for (r = 0; r < ROWS; r++) k = quadRow(idx, k, r * COLS, ((r + 1) % ROWS) * COLS, COLS);
    function quadRow(arr, j, a0, b0, n) { for (var c = 0; c < n - 1; c++) j = quad(arr, j, a0, b0, c); return j; }

    /* Schmales Band des ganzen Flusses (für die Draufsicht), 1 km Schritt */
    var RD = 1.0, NR = Math.floor((SEND - S0) / RD) + 1, RM = [4, 1.8, 0.7, 0.15], RC = 11;
    function rcol(c, hw) { if (c < 4) return -(hw + RM[c]); if (c < 7) return (c - 5) * 0.5 * hw; return hw + RM[10 - c]; }
    var rvb = new Float32Array(NR * RC * STR);
    for (var i = 0; i < NR; i++) {
      var s = S0 + i * RD, iG = Math.round((s - S0) / DS), hw = halfW(s), o = i * RC * STR; C(s, cc); TN(s, tn);
      for (c = 0; c < RC; c++) { var t = rcol(c, hw); vert(rvb, o + c * STR, cc[0] + tn[2] * t, cc[1] + tn[3] * t, iG, 24); }
    }
    var RPER = (RC - 1) * 6, ridx = new Uint16Array((NR - 1) * RPER); k = 0;
    for (i = 0; i < NR - 1; i++) k = quadRow(ridx, k, i * RC, (i + 1) * RC, RC);

    /* Weltgitter als Hintergrund (2 km), Höhen über Projektion; unter dem Fluss abgesenkt */
    var GC = 2.0, mnx = 1e9, mxx = -1e9, mnz = 1e9, mxz = -1e9;
    for (i = 0; i < NPT; i++) { if (CX[i] < mnx) mnx = CX[i]; if (CX[i] > mxx) mxx = CX[i]; if (CZ[i] < mnz) mnz = CZ[i]; if (CZ[i] > mxz) mxz = CZ[i]; }
    var GM = 56, GX0 = mnx - GM, GZ0 = mnz - GM, GX = Math.ceil((mxx - mnx + 2 * GM) / GC) + 1, GZ = Math.ceil((mxz - mnz + 2 * GM) / GC) + 1;
    var gh = new Float32Array(GX * GZ), gt = new Float32Array(GX * GZ), gs = new Float32Array(GX * GZ), ghw = new Float32Array(GX * GZ);
    for (var gz = 0; gz < GZ; gz++) for (var gx = 0; gx < GX; gx++) {
      var x = GX0 + gx * GC, z = GZ0 + gz * GC, gi = gz * GX + gx;
      proj(x, z, -1, 0); var s_ = PJ[0], t_ = PJ[1], hw_ = halfW(s_);
      gt[gi] = t_; gs[gi] = s_; ghw[gi] = hw_;
      gh[gi] = Math.abs(t_) < hw_ + 2.4 ? -0.25 : height(t_, s_) - 0.035;
    }
    var gvb = new Float32Array(GX * GZ * STR);
    for (gz = 0; gz < GZ; gz++) for (gx = 0; gx < GX; gx++) {
      gi = gz * GX + gx; o = gi * STR;
      var hl = gh[gz * GX + Math.max(0, gx - 1)], hr = gh[gz * GX + Math.min(GX - 1, gx + 1)], hu = gh[Math.max(0, gz - 1) * GX + gx], hd = gh[Math.min(GZ - 1, gz + 1) * GX + gx];
      var nx = -(hr - hl) / (2 * GC), nz = -(hd - hu) / (2 * GC), L = Math.hypot(nx, 1, nz);
      gvb[o] = GX0 + gx * GC; gvb[o + 1] = gh[gi]; gvb[o + 2] = GZ0 + gz * GC; gvb[o + 3] = nx / L; gvb[o + 4] = 1 / L; gvb[o + 5] = nz / L; gvb[o + 6] = gt[gi]; gvb[o + 7] = ghw[gi]; gvb[o + 8] = gs[gi];
    }
    var gidx = new Uint16Array((GX - 1) * (GZ - 1) * 6); k = 0;
    for (gz = 0; gz < GZ - 1; gz++) k = quadRow(gidx, k, gz * GX, (gz + 1) * GX, GX);

    /* Orte: Marker, Siedlungsflächen, Beschriftungen */
    var M = D.m, NM = M.length, mp = new Float32Array(NM * 3), ms = new Float32Array(NM), els = [], lw = new Float32Array(NM);
    var vq = new Float32Array(NM * 4 * 6), vqi = new Uint16Array(NM * 6);
    for (var m = 0; m < NM; m++) {
      var om = M[m], sm_ = om.s, tw = latWorld(om.d, sm_), iGm = Math.round((sm_ - S0) / DS); C(sm_, cc); TN(sm_, tn, 1.2 + Math.abs(tw));
      var px = cc[0] + tn[2] * tw, pz = cc[1] + tn[3] * tw, winm = 30 + Math.round(Math.abs(tw) * 3);
      mp[m * 3] = px; mp[m * 3 + 1] = F(px, pz, iGm, winm) + 0.02; mp[m * 3 + 2] = pz; ms[m] = om.k === 'c' ? 1.8 : om.k === 'kh' ? 1.3 : 1;
      var ha = om.k === 'c' ? 1.4 : om.k === 'kh' ? 0.42 : 0.3, hl2 = om.k === 'c' ? 2.4 : om.k === 'kh' ? 1.3 : 0.95, q = m * 24, ci = 0;
      for (var ea = -1; ea <= 1; ea += 2) for (var el_ = -1; el_ <= 1; el_ += 2) {
        var cx_ = px + tn[2] * ea * ha + tn[0] * el_ * hl2, cz_ = pz + tn[3] * ea * ha + tn[1] * el_ * hl2;
        vq[q + ci * 6] = cx_; vq[q + ci * 6 + 1] = F(cx_, cz_, iGm, winm) + 0.012; vq[q + ci * 6 + 2] = cz_;
        vq[q + ci * 6 + 3] = ea < 0 ? 0 : 1; vq[q + ci * 6 + 4] = el_ < 0 ? 0 : 1; vq[q + ci * 6 + 5] = om.k === 'c' ? 1 : 0; ci++;
      }
      var vi = m * 4, ii = m * 6; vqi[ii] = vi; vqi[ii + 1] = vi + 1; vqi[ii + 2] = vi + 2; vqi[ii + 3] = vi + 1; vqi[ii + 4] = vi + 3; vqi[ii + 5] = vi + 2;
      if (lab) { var el = d.createElement('div'); el.className = 'il ' + om.k + (om.d > 0 ? ' l' : ' r'); el.innerHTML = '<i></i><span>' + om.n.replace(/</g, '&lt;') + '</span>'; el.style.opacity = '0'; lab.appendChild(el); els.push(el); }
    }
    function measure() { for (var m = 0; m < NM; m++) lw[m] = els[m].offsetWidth || 90; }
    if (lab) { measure(); if (d.fonts && d.fonts.ready) d.fonts.ready.then(measure); }

    /* Shader */
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    function pr(v, f) { var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, v)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, f)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); return p; }
    var PREC = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';
    var NOISE = 'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
      'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);float a=hash(i),b=hash(i+vec2(1.0,0.0)),c=hash(i+vec2(0.0,1.0)),d=hash(i+vec2(1.0,1.0));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}';
    var VS = 'attribute vec3 aPos;attribute vec3 aNor;attribute float aT;attribute float aHW;attribute float aS;uniform mat4 uVP;uniform vec3 uCam;uniform float uSA;uniform float uSB;uniform float uTL;uniform float uSink;varying vec3 vP;varying vec3 vN;varying float vT;varying float vHW;varying float vD;void main(){vec3 p=aPos;if(uSink>0.5&&aS>uSA&&aS<uSB&&abs(aT)<uTL){p.y-=3.0;}vP=p;vN=aNor;vT=aT;vHW=aHW;vD=distance(p,uCam);gl_Position=uVP*vec4(p,1.0);}';
    var FS = PREC + 'varying vec3 vP;varying vec3 vN;varying float vT;varying float vHW;varying float vD;uniform vec3 uCam;uniform vec3 uSun;uniform float uT;uniform float uN;uniform float uF;uniform float uA;uniform float uMap;' + NOISE +
      'void main(){float at=abs(vT);float shore=smoothstep(vHW-0.04,vHW+0.04,at);vec3 V=normalize(uCam-vP);vec3 n=normalize(mix(normalize(vN),vec3(0.0,1.0,0.0),0.85*smoothstep(24.0,60.0,vD)));float lam=max(dot(n,uSun),0.0);' +
      /* Land: Grundton, Hangschatten */
      'float hg=clamp(vP.y/0.75,0.0,1.0);float li=0.25+0.75*lam;vec3 grass=mix(vec3(0.30,0.44,0.20),vec3(0.50,0.52,0.30),smoothstep(0.08,0.5,vP.y)*0.8);'+
      'vec3 land=grass*(0.35+0.85*li);land+=vec3(0.16,0.10,0.03)*max(lam-0.4,0.0)*smoothstep(0.03,0.3,vP.y);' +
      /* Felder: gedrehtes Gitter, Zellen etwa 0,8 x 1,1 km, mit hellen Feldrainen */
      'vec2 p=vP.xz;float rg=noise(p*0.03+vec2(11.0,5.0));float an=rg*2.6;vec2 fp=mat2(cos(an),sin(an),-sin(an),cos(an))*p;fp+=0.4*vec2(noise(p*0.45),noise(p*0.45+vec2(7.0,3.0)));' +
      'vec2 cs=vec2(0.75,1.4)*(0.7+0.7*noise(p*0.02+vec2(3.0,9.0)));vec2 g=fp/cs;float fld=hash(floor(g));float flat_=smoothstep(0.975,0.995,n.y);' +
      'float fm=(1.0-smoothstep(18.0,75.0,vD))*smoothstep(vHW+0.6,vHW+2.0,at)*flat_*(0.6+0.4*step(0.0,-vT));float h3=hash(floor(g)+vec2(5.3,2.1));' +
      'vec3 fc=fld<0.35?vec3(0.36,0.52,0.22):fld<0.6?vec3(0.66,0.60,0.32):fld<0.8?vec3(0.24,0.40,0.17):vec3(0.50,0.42,0.27);fc*=0.9+0.2*h3;land=mix(land,fc*(0.35+0.85*li),fm*0.75);' +
      'vec2 fr=fract(g);float edge=min(min(fr.x,1.0-fr.x)*cs.x,min(fr.y,1.0-fr.y)*cs.y);land=mix(land,vec3(0.62,0.58,0.40)*(0.4+0.8*li),(1.0-smoothstep(0.0,0.03,edge))*fm*0.35*(1.0-smoothstep(5.0,11.0,vD)));' +
      'float forest=smoothstep(0.60,0.72,0.62*noise(p*0.55+vec2(2.0,8.0))+0.38*noise(p*1.9+vec2(4.0,1.0)))*(1.0-0.65*smoothstep(10.0,32.0,vD))*smoothstep(vHW+0.8,vHW+2.5,at)*(1.0-smoothstep(vHW+9.0,vHW+16.0,at))*(0.35+0.65*step(0.0,-vT))*(1.0-smoothstep(26.0,50.0,vD));land=mix(land,vec3(0.10,0.21,0.09)*(0.5+0.6*li),forest*0.7);' +
      /* Auwald und Baumgruppen am Ufer */
      'float tr=noise(vP.xz*2.6);float au=smoothstep(vHW+2.2,vHW+0.25,at)*shore*(vT<0.0?1.0:0.4)*(0.3+0.7*tr);land=mix(land,vec3(0.12,0.24,0.10)*(0.5+0.6*li),au*0.8);' +
      /* Höhenlinien auf der Bergseite */
      'float ch=fract(vP.y/0.065);float con=smoothstep(0.0,0.05,ch)*smoothstep(0.13,0.07,ch)*step(0.02,vP.y)*(1.0-smoothstep(10.0,28.0,vD));land=mix(land,land*0.85,con*0.35*(1.0-smoothstep(8.0,18.0,vD)));' +
      /* Sandufer */
      'float bank=smoothstep(vHW+0.32,vHW,at)*shore;land=mix(land,vec3(0.78,0.69,0.50)*(0.55+0.5*li),bank*0.7);' +
      /* Wasser: isotrope Wellen, leichte Strömungsstreifen, Himmelsspiegelung, Sonnenglanz */
      'vec2 wuv=vP.xz*1.6;float rip=noise(wuv*3.0+vec2(0.0,uT*0.45))+0.5*noise(wuv*7.0+vec2(uT*0.3,uT*0.8))+0.25*noise(wuv*15.0-vec2(uT*0.5,uT*0.3));' +
      'float cur=noise(vec2(vT*2.6,(vP.z+uT*0.9)*0.3));vec3 wn=normalize(vec3((rip-0.875)*0.34+(cur-0.5)*0.07,1.0,(noise(wuv*5.0+uT*0.4)-0.5)*0.3));' +
      'float fres=pow(1.0-max(dot(wn,V),0.0),3.0);vec3 R=reflect(-V,wn);float spec=pow(max(dot(R,uSun),0.0),90.0);' +
      'float toSun=pow(max(dot(normalize(vec3(R.x,0.0,R.z)),normalize(vec3(uSun.x,0.0,uSun.z))),0.0),4.0);' +
      'vec3 deep=vec3(0.10,0.24,0.40);vec3 sky=vec3(0.56,0.68,0.86);vec3 warm=vec3(0.95,0.66,0.55);vec3 water=mix(deep,mix(sky,warm,toSun*0.6),0.25+0.6*fres)+spec*vec3(1.0,0.92,0.80)*0.9;' +
      'float shallow=smoothstep(vHW-0.4,vHW,at)*(0.4+0.6*noise(vP.xz*2.2));water=mix(water,vec3(0.36,0.52,0.58),shallow*0.4);' +
      'vec3 col=mix(water,land,shore);vec3 mapL=mix(vec3(0.06,0.11,0.22),vec3(0.19,0.31,0.50),0.2*hg+0.8*lam);col=mix(col,mix(vec3(0.27,0.45,0.72),mapL,shore),uMap);' +
      'float f=smoothstep(uN,uF,vD);gl_FragColor=vec4(col,(1.0-f)*uA);}';
    /* Siedlungen */
    var VV = 'attribute vec3 aPos;attribute vec3 aUV;uniform mat4 uVP;uniform vec3 uCam;varying vec3 vUV;varying float vD;void main(){vUV=aUV;vD=distance(aPos,uCam);gl_Position=uVP*vec4(aPos,1.0);}';
    var FV = PREC + 'varying vec3 vUV;varying float vD;uniform float uA;' + NOISE +
      'void main(){bool city=vUV.z>0.5;vec2 g=vUV.xy*(city?vec2(14.0,26.0):vec2(4.0,18.0));vec2 f=fract(g);vec2 cid=floor(g);float h=hash(cid+vec2(3.7,1.3));float h2=hash(cid+vec2(9.1,4.4));' +
      'vec2 lo=vec2(0.15+0.2*h2,0.12+0.15*h),hi=vec2(0.85-0.2*h,0.88-0.15*h2);float house=step(lo.x,f.x)*step(f.x,hi.x)*step(lo.y,f.y)*step(f.y,hi.y)*step(city?0.12:0.3,h);' +
      'float street=1.0-smoothstep(0.03,0.06,abs(vUV.x-0.5));if(city){street=max(street,1.0-smoothstep(0.02,0.04,min(abs(fract(vUV.y*5.0)-0.5),abs(fract(vUV.x*3.0)-0.5))));}' +
      'vec3 ground=vec3(0.33,0.32,0.24);vec3 col=mix(ground,mix(vec3(0.60,0.53,0.42),vec3(0.75,0.68,0.55),h2),house);col=mix(col,vec3(0.48,0.45,0.40),street*0.85);' +
      'float near=1.0-smoothstep(10.0,30.0,vD);vec3 farc=vec3(0.44,0.42,0.37);col=mix(farc,col,near);float a=(1.0-smoothstep(40.0,110.0,vD))*uA*0.92;' +
      'vec2 e=abs(vUV.xy-0.5)*2.0;float wob=0.35*(noise(vUV.xy*vec2(3.0,9.0)+cid*0.01)-0.5);float rim=1.0-smoothstep(0.6,0.98,max(e.x,e.y)+wob);gl_FragColor=vec4(col,a*rim);}';
    var VP_ = 'attribute vec3 aPos;attribute float aS;uniform mat4 uVP;uniform vec3 uCam;uniform float uPx;uniform float uE;varying float vA;void main(){vec4 p=uVP*vec4(aPos,1.0);gl_Position=p;float dd=distance(aPos,uCam);gl_PointSize=min(26.0*uPx,uPx*aS*(5.0+70.0/max(dd,1.5)));vA=1.0-smoothstep(12.0+70.0*uE,30.0+90.0*uE,dd);}';
    var FP = PREC + 'varying float vA;uniform float uA;void main(){vec2 q=gl_PointCoord-0.5;float r=length(q);float g=exp(-r*r*26.0)*0.9+smoothstep(0.22,0.12,r)*0.6;gl_FragColor=vec4(0.93,0.82,0.45,min(1.0,g*vA*uA));}';
    var PF = pr(VS, FS), PP = pr(VP_, FP), PV = pr(VV, FV);
    function buf(tg, data, usage) { var b = gl.createBuffer(); gl.bindBuffer(tg, b); gl.bufferData(tg, data, usage); return b; }
    var bV = buf(gl.ARRAY_BUFFER, vb, gl.DYNAMIC_DRAW), bI = buf(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    var bRV = buf(gl.ARRAY_BUFFER, rvb, gl.STATIC_DRAW), bRI = buf(gl.ELEMENT_ARRAY_BUFFER, ridx, gl.STATIC_DRAW);
    var bGV = buf(gl.ARRAY_BUFFER, gvb, gl.STATIC_DRAW), bGI = buf(gl.ELEMENT_ARRAY_BUFFER, gidx, gl.STATIC_DRAW);
    var bM = buf(gl.ARRAY_BUFFER, mp, gl.STATIC_DRAW), bS = buf(gl.ARRAY_BUFFER, ms, gl.STATIC_DRAW);
    var bQ = buf(gl.ARRAY_BUFFER, vq, gl.STATIC_DRAW), bQI = buf(gl.ELEMENT_ARRAY_BUFFER, vqi, gl.STATIC_DRAW);
    function upRow(q) { gl.bindBuffer(gl.ARRAY_BUFFER, bV); gl.bufferSubData(gl.ARRAY_BUFFER, q * COLS * STR * 4, vb.subarray(q * COLS * STR, (q + 1) * COLS * STR)); }
    function U(p, names) { var o = {}; names.forEach(function (n) { o[n] = n.charAt(0) === 'a' ? gl.getAttribLocation(p, n) : gl.getUniformLocation(p, n); }); return o; }
    var uF = U(PF, ['uVP', 'uCam', 'uSun', 'uT', 'uN', 'uF', 'uA', 'uMap', 'uSA', 'uSB', 'uTL', 'uSink', 'aPos', 'aNor', 'aT', 'aHW', 'aS']), uP = U(PP, ['uVP', 'uCam', 'uPx', 'uA', 'uE', 'aPos', 'aS']), uV = U(PV, ['uVP', 'uCam', 'uA', 'aPos', 'aUV']);
    function persp(fy, asp, n, f) { var t = 1 / Math.tan(fy / 2), nf = 1 / (n - f); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]); }
    function lookAt(e, ct, u) {
      var zx = e[0] - ct[0], zy = e[1] - ct[1], zz = e[2] - ct[2], l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
      var xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx; l = Math.hypot(xx, xy, xz) || 1; xx /= l; xy /= l; xz /= l;
      var yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
      return new Float32Array([xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0, -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1]);
    }
    function mul(a, b) { var o = new Float32Array(16); for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) { var s = 0; for (var q = 0; q < 4; q++) s += a[q * 4 + j] * b[i * 4 + q]; o[i * 4 + j] = s; } return o; }
    var dpr = 1, W = 1, H = 1, t0 = performance.now(), last = t0, loopT = t0, mx = 0, my = 0, tmx = 0, tmy = 0, running = false, onScreen = true;
    var SUN = [0.72, 0.30, 0.34]; (function () { var l = Math.hypot(SUN[0], SUN[1], SUN[2]); SUN = [SUN[0] / l, SUN[1] / l, SUN[2] / l]; })();
    function resize() { W = stage.clientWidth; H = stage.clientHeight; dpr = Math.min(w.devicePixelRatio || 1, mobile ? 1.4 : 1.25); cv.width = Math.max(1, Math.round(W * dpr)); cv.height = Math.max(1, Math.round(H * dpr)); }
    resize();
    w.addEventListener('resize', function () { resize(); if (!running) draw(performance.now()); });
    w.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse') return; tmx = e.clientX / w.innerWidth - 0.5; tmy = e.clientY / w.innerHeight - 0.5; }, { passive: true });
    function attrib(loc, b, size, stride, off) { if (loc < 0) return; gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, off); }
    function terrain(bv, bi, sink, ranges) {
      gl.uniform1f(uF.uSink, sink);
      attrib(uF.aPos, bv, 3, STR * 4, 0); attrib(uF.aNor, bv, 3, STR * 4, 12); attrib(uF.aT, bv, 1, STR * 4, 24); attrib(uF.aHW, bv, 1, STR * 4, 28); attrib(uF.aS, bv, 1, STR * 4, 32);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bi);
      for (var i = 0; i < ranges.length; i += 2) if (ranges[i + 1] > 0) gl.drawElements(gl.TRIANGLES, ranges[i + 1], gl.UNSIGNED_SHORT, ranges[i] * 2);
    }
    var eye = [0, 0, 0], tgt = [0, 0, 0], up = [0, 1, 0], c0 = [0, 0], c1 = [0, 0], f0 = [0, 0], f1 = [0, 0], SPEED = mobile ? 1.9 : 2.2;
    var cand = [], placed = [];
    draw = function (now) {
      var dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
      if (!reduce) { sCam -= dt * SPEED; if (sCam < SFIN - 3) { sCam = SSTART; loopT = now; } }
      for (var q = 0; q < ROWS; q++) if (rowS[q] > sCam + BACK + RS) { rowS[q] -= ROWS * RS; fillRow(q); upRow(q); far = q; }
      var fade = Math.min(sm((now - loopT) / 1600), 1 - st(SFIN, SFIN - 3, sCam));
      mx += (tmx - mx) * 0.03; my += (tmy - my) * 0.03;
      var e = sm(prog), camS = sCam - 14 * e, ahead = 7 * (1 - e) + 0.02, alt = (mobile ? 1.4 : 1.2) + 60 * e;
      Csm(camS, c0); Csm(camS - ahead, c1); TN(camS, tn); Tsm(camS, f0); Tsm(camS - 4, f1);
      /* Vorwärts = Norden = -T; Kurvenneigung aus der Richtungsänderung */
      var fx = -f0[0], fz = -f0[1], ax = -f1[0], az = -f1[1], turn = fx * az - fz * ax, roll = Math.max(-0.11, Math.min(0.11, turn * 0.35)) * (1 - e);
      var lat = mx * 2.2 * (1 - e);
      eye[0] = c0[0] + tn[2] * lat; eye[1] = alt - my * 0.5 * (1 - e); eye[2] = c0[1] + tn[3] * lat;
      tgt[0] = c1[0]; tgt[1] = 0.12 * (1 - e); tgt[2] = c1[1];
      /* rechts = Osten = -N */
      var rx = -tn[2], rz = -tn[3], cr = Math.cos(roll), sr = Math.sin(roll);
      up[0] = sr * rx * (1 - e) + fx * e; up[1] = cr * (1 - e); up[2] = sr * rz * (1 - e) + fz * e;
      var ul = Math.hypot(up[0], up[1], up[2]) || 1; up[0] /= ul; up[1] /= ul; up[2] /= ul;
      var fov = (W < H ? 74 : 58) * Math.PI / 180;
      var VP = mul(persp(fov, cv.width / cv.height, 0.3, 320), lookAt(eye, tgt, up));
      var hd = Math.hypot(tgt[0] - eye[0], tgt[2] - eye[2]), pitch = Math.atan2(eye[1] - tgt[1], hd);
      var hz = 0.5 - 0.5 * Math.tan(pitch) / Math.tan(fov / 2); if (hz < -0.6) hz = -0.6;
      stage.style.setProperty('--hz', (hz * 100).toFixed(1) + '%'); var mm = st(0.72, 0.98, prog); stage.style.setProperty('--mm', mm.toFixed(3));
      var tt = (now - t0) / 1000, A = reduce ? 1 : fade, n = 16 + 60 * e, f = 46 + 90 * e;
      gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(true); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(PF); gl.uniformMatrix4fv(uF.uVP, false, VP); gl.uniform3fv(uF.uCam, eye); gl.uniform3fv(uF.uSun, SUN); gl.uniform1f(uF.uT, tt); gl.uniform1f(uF.uN, n); gl.uniform1f(uF.uF, f); gl.uniform1f(uF.uA, A); gl.uniform1f(uF.uMap, mm);
      /* Bereich des feinen Bandes: Hintergrund dort absenken */
      var sLo = sCam + BACK - (ROWS - 1) * RS, sHi = sCam + BACK;
      gl.uniform1f(uF.uSA, sLo + 3); gl.uniform1f(uF.uSB, sHi - 3); gl.uniform1f(uF.uTL, 9);
      gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(2, 6);
      terrain(bGV, bGI, 1, [0, gidx.length]);
      gl.polygonOffset(1, 3);
      terrain(bRV, bRI, 1, [0, ridx.length]);
      gl.disable(gl.POLYGON_OFFSET_FILL);
      terrain(bV, bI, 0, [0, far * PER, (far + 1) * PER, (ROWS - 1 - far) * PER]);
      /* Siedlungen */
      gl.useProgram(PV); gl.uniformMatrix4fv(uV.uVP, false, VP); gl.uniform3fv(uV.uCam, eye); gl.uniform1f(uV.uA, A * (1 - mm));
      attrib(uV.aPos, bQ, 3, 24, 0); attrib(uV.aUV, bQ, 3, 24, 12);
      gl.disable(gl.DEPTH_TEST); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bQI); gl.drawElements(gl.TRIANGLES, NM * 6, gl.UNSIGNED_SHORT, 0);
      /* Marker */
      gl.useProgram(PP); gl.uniformMatrix4fv(uP.uVP, false, VP); gl.uniform3fv(uP.uCam, eye); gl.uniform1f(uP.uPx, dpr); gl.uniform1f(uP.uA, A); gl.uniform1f(uP.uE, e);
      attrib(uP.aPos, bM, 3, 0, 0); attrib(uP.aS, bS, 1, 0, 0);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE); gl.drawArrays(gl.POINTS, 0, NM); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.enable(gl.DEPTH_TEST);
      /* Beschriftungen mit Überlappungsprüfung */
      if (!lab) return;
      cand.length = 0; placed.length = 0;
      var fr = null;
      if (fzBox && fzOp > 0.05) { var b1 = fzBox.getBoundingClientRect(), b0 = stage.getBoundingClientRect(); fr = [b1.left - b0.left - 24, b1.top - b0.top - 16, b1.right - b0.left + 24, b1.bottom - b0.top + 16]; }
      for (var m = 0; m < NM; m++) {
        var x = mp[m * 3], y = mp[m * 3 + 1], z = mp[m * 3 + 2], el = els[m], kk = M[m].k;
        var cw = VP[3] * x + VP[7] * y + VP[11] * z + VP[15];
        if (cw <= 0.2) { el.style.opacity = '0'; continue; }
        var nx = (VP[0] * x + VP[4] * y + VP[8] * z + VP[12]) / cw, ny = (VP[1] * x + VP[5] * y + VP[9] * z + VP[13]) / cw;
        if (nx < -1.15 || nx > 1.15 || ny < -1.15 || ny > 1.15) { el.style.opacity = '0'; continue; }
        var sx = (nx + 1) * 0.5 * W, sy = (1 - ny) * 0.5 * H, dist = Math.hypot(x - eye[0], y - eye[1], z - eye[2]);
        var lim = kk === 'c' ? 1.6 : kk === 'kh' ? 1.25 : 1;
        var op = (1 - st((14 + 60 * e) * lim, (30 + 100 * e) * lim, dist)) * st(0.6, 1.6, dist) * A;
        if (kk === 'k' && e > 0.3) op *= 1 - st(0.3, 0.6, e);
        if (sy < 0.44 * H) op *= 1 - titleOn * st(0.44 * H, 0.36 * H, sy);
        if (fr && sx > fr[0] && sx < fr[2] && sy > fr[1] && sy < fr[3]) op *= 1 - fzOp;
        if (op < 0.03) { el.style.opacity = '0'; continue; }
        var sc = Math.min(1.12, Math.max(0.8, 1.22 - dist / 42));
        cand.push([kk === 'c' ? 0 : kk === 'kh' ? 1 : 2, dist, m, sx, sy, op, sc]);
      }
      cand.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
      for (var ci = 0; ci < cand.length; ci++) {
        var cd = cand[ci], mm = cd[2], left = M[mm].d > 0, bw = lw[mm] * cd[6], bh = 22 * cd[6];
        var x0 = left ? cd[3] - bw : cd[3], y0 = cd[4] - bh / 2, x1 = x0 + bw, y1 = y0 + bh, ok = true;
        for (var pi = 0; pi < placed.length; pi++) { var p = placed[pi]; if (x0 < p[2] + 4 && x1 > p[0] - 4 && y0 < p[3] + 3 && y1 > p[1] - 3) { ok = false; break; } }
        var e2 = els[mm];
        if (!ok) { e2.style.opacity = '0'; continue; }
        placed.push([x0, y0, x1, y1]);
        e2.style.opacity = cd[5].toFixed(2);
        e2.style.transform = 'translate(' + cd[3].toFixed(1) + 'px,' + cd[4].toFixed(1) + 'px) translate(' + (left ? '-100%' : '0') + ',-50%) scale(' + cd[6].toFixed(2) + ')';
      }
    };
    function loop(now) { if (!running) return; draw(now); w.requestAnimationFrame(loop); }
    function start() { if (running || reduce) return; running = true; last = performance.now(); w.requestAnimationFrame(loop); }
    function stop() { running = false; }
    if ('IntersectionObserver' in w) new IntersectionObserver(function (es) { es.forEach(function (x) { onScreen = x.isIntersecting; if (onScreen && !d.hidden) start(); else stop(); }); }).observe(sec);
    d.addEventListener('visibilitychange', function () { if (d.hidden) stop(); else if (onScreen) start(); });
    draw(performance.now()); start();
  }
})();
