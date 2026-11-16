/* Wolgawurzeln · Interaktionen */
/* Besuchszählung ohne Cookies (assets/zaehler.js) nachladen */
(function (d) { try { var c = d.currentScript; if (!c || !/(^|\.)wolgawurzeln\.de$/.test(location.hostname)) return; var s = d.createElement('script'); s.src = c.src.replace(/[^\/]*$/, 'zaehler.js'); s.async = true; d.head.appendChild(s); } catch (e) {} })(document);
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
    d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('.dlg-close,[data-close]')) d.close(); });
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

  /* Der Bestelldialog steht seit 16.11.2026 in assets/bestellen.js, eine Fassung für alle Seiten. */

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

/* Firmenauftritt: schwebender Kopf, Einblenden beim Scrollen */
(function () {
  'use strict';
  var hdr = document.querySelector('.hdr');
  var onS = function () { if (hdr) hdr.classList.toggle('solid', (window.scrollY || 0) > 40); };
  window.addEventListener('scroll', onS, { passive: true }); onS();
  if (!('IntersectionObserver' in window) || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var els = document.querySelectorAll('.card, .sec-head, .reg li, .script-frame, .reqform, .cols > div, .stats > div, .lst a, .index > div');
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach(function (el, i) { el.classList.add('rv'); el.style.transitionDelay = ((i % 4) * 70) + 'ms'; io.observe(el); });
})();

/* Karte der Kolonien: Die Punkte sind am Handy nur etwa fünf Pixel groß. Unter die Punkte kommt je eine unsichtbare Tippfläche
   von 24 Pixeln. Sie liegen unter allen sichtbaren Punkten, ein Tipp genau auf einen Punkt trifft also immer den richtigen Ort. */
(function () {
  if (!window.matchMedia || !window.matchMedia('(hover: none), (pointer: coarse), (max-width: 880px)').matches) return;
  var NS = 'http://www.w3.org/2000/svg';
  Array.prototype.forEach.call(document.querySelectorAll('svg.col-map'), function (svg) {
    var links = svg.querySelectorAll('a[href]');
    if (!links.length || svg.querySelector('.cm-hits')) return;
    var m = svg.getScreenCTM && svg.getScreenCTM(), scale = m && m.a ? Math.abs(m.a) : 0;
    if (!scale) return;
    var r = Math.max(3, 12 / scale), g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'cm-hits'); g.setAttribute('aria-hidden', 'true');
    Array.prototype.forEach.call(links, function (a) {
      var c = a.querySelector('circle'); if (!c) return;
      var h = document.createElementNS(NS, 'a'), k = document.createElementNS(NS, 'circle');
      h.setAttribute('href', a.getAttribute('href')); h.setAttribute('tabindex', '-1');
      k.setAttribute('cx', c.getAttribute('cx')); k.setAttribute('cy', c.getAttribute('cy')); k.setAttribute('r', r.toFixed(1));
      h.appendChild(k); g.appendChild(h);
    });
    links[0].parentNode.insertBefore(g, links[0]);
  });
})();

/* Vorbelegung des Anfrageformulars aus der Adresse, z. B. kontakt.html?anliegen=Transkription#anfrage (15.11.2026) */
(function () {
  try {
    var f = document.getElementById('reqform'); if (!f) return;
    var a = new URLSearchParams(location.search).get('anliegen'); if (!a) return;
    var t = f.elements['anliegen'], u = new URLSearchParams(location.search).get('nachname'), n = f.elements['nachname'];
    if (t && !t.value.trim()) { a = a.replace(/[<>]/g, '').slice(0, 1500); t.value = /\n/.test(a) ? a : a + ': '; }
    if (u && n && !n.value.trim()) n.value = u.replace(/[<>]/g, '').slice(0, 80);
  } catch (e) {}
})();

/* Weihnachtshinweis beim Fotobuch: sichtbar bis einschließlich data-bis, danach von selbst weg (16.11.2026) */
(function () {
  try {
    var h = new Date(), t = h.getFullYear() * 10000 + (h.getMonth() + 1) * 100 + h.getDate();
    document.querySelectorAll('.xmas[data-bis]').forEach(function (e) {
      if (t <= +e.getAttribute('data-bis').replace(/-/g, '')) e.classList.add('an');
    });
  } catch (e) {}
})();
