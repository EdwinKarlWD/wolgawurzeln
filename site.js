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
      hb: { name: 'Herkunftsbericht', price: '39 €', time: 'Lieferung als PDF in 3 bis 5 Tagen.', code: 'HB39', url: 'https://buy.stripe.com/aFa00cb0y8gw8UlceM6Vq01' },
      fg: { name: 'Familiengeschichte', price: '69 €', time: 'Lieferung als PDF in 5 bis 8 Tagen.', code: 'FG69', url: 'https://buy.stripe.com/9B6cMYc4C8gwc6xceM6Vq00' }
    };
    var cur = null, w = od.querySelector('#chk-waiver'), r = od.querySelector('#chk-review'), pay = od.querySelector('#order-pay');
    function upd() {
      var ok = !!(cur && w.checked);
      pay.setAttribute('aria-disabled', ok ? 'false' : 'true');
      if (ok) {
        var ts = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
        pay.setAttribute('href', cur.url + '?locale=de&client_reference_id=' + encodeURIComponent([cur.code, 'verzicht-ja', 'bewertung-' + (r.checked ? 'ja' : 'nein'), ts].join('_')));
      } else pay.removeAttribute('href');
    }
    document.querySelectorAll('[data-order]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault(); cur = P[b.getAttribute('data-order')]; if (!cur) return;
        od.querySelector('#order-title').textContent = 'Auftrag: ' + cur.name + ', ' + cur.price;
        od.querySelector('#order-time').textContent = cur.time;
        w.checked = false; r.checked = false; upd(); od.showModal();
      });
    });
    w.addEventListener('change', upd); r.addEventListener('change', upd);
    pay.addEventListener('click', function (e) {
      if (pay.getAttribute('aria-disabled') === 'true') { e.preventDefault(); w.focus(); return; }
      upd(); setTimeout(function () { od.close(); }, 400);
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
