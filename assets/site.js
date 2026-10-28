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

  /* Auftrag: Angaben, vorzeitiger Beginn, dann Bezahlseite */
  var W3F_KEY = ''; /* Web3Forms Zugangsschlüssel. Leer: keine Formularmail, alles andere läuft. */
  var od = document.getElementById('order');
  if (od && od.showModal) {
    var P = {
      hb: { key: 'hb', art: 'den', name: 'Herkunftsbericht', price: '49 €', time: 'Lieferung als PDF in 3 bis 5 Tagen.', code: 'HB49', url: 'https://buy.stripe.com/8x214gd8G68o6MddiQ6Vq02' },
      fg: { key: 'fg', art: 'die', name: 'Familiengeschichte', price: '89 €', time: 'Lieferung als PDF in 5 bis 8 Tagen.', code: 'FG89', url: 'https://buy.stripe.com/8x2aEQ9WueEUgmN92A6Vq03' }
    };
    var q = function (s) { return od.querySelector(s); };
    var cur = null, ono = '', lastPre = '', w = q('#chk-waiver'), bk = q('#chk-book'), pay = q('#order-pay'), wa = q('#order-wa'), ml = q('#order-mail'), nm = q('#order-name'), em = q('#order-email'), ph = q('#order-phone'), kn = q('#order-know'), hint = q('#order-hint'), oform = q('#order-form'), done = q('#order-done');
    var val = function (x) { return x ? x.value.trim() : ''; };
    var sname = function () { return val(nm).replace(/\s+/g, ' '); };
    var mailOk = function () { return !em || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val(em)); };
    var CYR = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюяіїєґ', LAT = ['a','b','w','g','d','e','jo','sch','s','i','i','k','l','m','n','o','p','r','s','t','u','f','ch','z','tsch','sch','schtsch','','y','','e','ju','ja','i','ji','je','g'];
    function translit(v) {
      return v.replace(/[Ѐ-ӿ]/g, function (c) {
        var l = c.toLowerCase(), i = CYR.indexOf(l); if (i < 0) return '';
        var t = LAT[i]; return c !== l && t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
      });
    }
    function sref(v) {
      var t = translit(v).replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss');
      try { t = t.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) {}
      t = t.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100).replace(/-+$/, '');
      return t || 'name-unbekannt';
    }
    function newNo() {
      var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; }, A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = '', x = null;
      try { x = new Uint8Array(4); crypto.getRandomValues(x); } catch (e) { x = null; }
      for (var i = 0; i < 4; i++) r += A.charAt((x ? x[i] : Math.floor(Math.random() * 256)) % A.length);
      return 'WW-' + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + '-' + r;
    }
    var WAIVE = 'Ich verlange ausdrücklich, dass mit der Erstellung schon vor Ablauf der Widerrufsfrist begonnen wird. Mir ist bekannt, dass mein Widerrufsrecht mit Beginn der Ausführung erlischt.';
    function ref() { return [ono, cur.code, sref(sname()), 'verzicht-ja', 'fotobuch-' + (bk && bk.checked ? 'ja' : 'nein')].join('_').slice(0, 200); }
    function msg() {
      var L = ['Bestellnummer: ' + ono, 'Nachname der Familie: ' + sname(), 'E-Mail: ' + val(em)];
      if (val(ph)) L.push('Telefon: ' + val(ph));
      if (val(kn)) L.push('Das weiß ich schon: ' + val(kn));
      return 'Hallo Edwin, ich möchte ' + cur.art + ' ' + cur.name + ' (' + cur.price + ') bestellen und per Überweisung oder PayPal bezahlen.' +
        (bk && bk.checked ? ' Zusätzlich hätte ich gern das gedruckte Fotobuch (29 €).' : '') + '\n\n' + L.join('\n') + '\n\n' + WAIVE;
    }
    function setA(a, ok, href) { if (!a) return; a.setAttribute('aria-disabled', ok ? 'false' : 'true'); if (ok) a.setAttribute('href', href); else a.removeAttribute('href'); }
    function missing() { return !sname() ? 'name' : !mailOk() ? 'email' : !w.checked ? 'waiver' : ''; }
    var HINT = {
      name: 'Bitte oben den Nachnamen der Familie eintragen, dann wird der Bestellknopf frei.',
      email: 'Bitte Ihre E-Mail eintragen, damit wir uns bei Ihnen melden können. Dann wird der Bestellknopf frei.',
      waiver: 'Bitte den Bearbeitungsbeginn bestätigen (Kästchen oben), dann wird der Bestellknopf frei.'
    };
    function upd() {
      var m = cur ? missing() : 'name';
      if (hint) { hint.classList.toggle('off', !m); hint.textContent = m ? HINT[m] : ''; }
      if (m) { setA(pay, false); setA(wa, false); setA(ml, false); return; }
      setA(pay, true, cur.url + '?locale=de&client_reference_id=' + encodeURIComponent(ref()) + (val(em) ? '&prefilled_email=' + encodeURIComponent(val(em)) : ''));
      setA(wa, true, 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg()));
      setA(ml, true, 'mailto:edwin@wolgawurzeln.de?subject=' + encodeURIComponent('Bestellung ' + ono + ': ' + cur.name) + '&body=' + encodeURIComponent(msg()));
    }
    function flag(el) { var f = el && el.closest('.dlg-f'); if (!f) return; el.focus(); f.classList.add('miss'); setTimeout(function () { f.classList.remove('miss'); }, 1400); }
    function send(via) {
      if (!W3F_KEY || !window.fetch || !window.FormData) return;
      var fd = new FormData(), add = function (k, v) { fd.append(k, v); };
      add('access_key', W3F_KEY);
      add('subject', 'Bestellung ' + ono + ': ' + cur.name + ', ' + sname());
      add('from_name', 'Wolgawurzeln Bestellung');
      add('email', val(em));
      add('Bestellnummer', ono);
      add('Paket', cur.name + ' (' + cur.price + ')');
      add('Zahlweg', via);
      add('Nachname der Familie', sname());
      add('Telefon', val(ph) || 'keine Angabe');
      add('Was bekannt ist', val(kn) || 'keine Angabe');
      add('Fotobuch (29 €)', bk && bk.checked ? 'ja' : 'nein');
      add('Vorzeitiger Beginn', 'bestätigt: ' + WAIVE);
      add('Stripe Referenz', ref());
      add('Seite', location.href.split('#')[0]);
      add('Zeit', new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }));
      try { fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd, headers: { Accept: 'application/json' } }).catch(function () {}); } catch (e) {}
    }
    function remember() { try { localStorage.setItem('ww_order', JSON.stringify({ no: ono, p: cur.key, book: !!(bk && bk.checked), t: Date.now() })); } catch (e) {} }
    var DONE = {
      pay: ['Die gesicherte Bezahlseite ist in einem neuen Fenster geöffnet. Nach der Zahlung sehen Sie unsere Bestätigungsseite.', 'Bezahlseite erneut öffnen'],
      wa: ['WhatsApp ist mit Ihrer Bestellung geöffnet. Bitte senden Sie die Nachricht dort ab, Sie erhalten dann die Zahlungsdaten.', 'WhatsApp erneut öffnen'],
      mail: ['Ihr Mailprogramm ist mit Ihrer Bestellung geöffnet. Bitte senden Sie die Mail ab, Sie erhalten dann die Zahlungsdaten.', 'Mail erneut öffnen']
    };
    function showDone(kind, a) {
      if (!done || !oform) { od.close(); return; }
      q('#order-no').textContent = ono;
      q('#order-done-t').textContent = DONE[kind][0];
      var ag = q('#order-again');
      ag.textContent = DONE[kind][1]; ag.setAttribute('href', a.getAttribute('href'));
      if (kind === 'mail') ag.removeAttribute('target'); else ag.setAttribute('target', '_blank');
      oform.hidden = true; done.hidden = false; od.scrollTop = 0;
    }
    document.querySelectorAll('[data-order]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault(); cur = P[b.getAttribute('data-order')]; if (!cur) return;
        ono = newNo();
        q('#order-title').textContent = 'Auftrag: ' + cur.name + ', ' + cur.price;
        q('#order-time').textContent = cur.time;
        w.checked = false; if (bk) bk.checked = b.hasAttribute('data-book');
        var fz = window.__fz && window.__fz.st ? window.__fz.st().name : '';
        var pre = (b.getAttribute('data-name') || fz || (document.getElementById('fz-name') || {}).value || '').replace(/\s+/g, ' ').trim();
        if (nm && pre && pre !== lastPre) { nm.value = pre; lastPre = pre; }
        if (oform) oform.hidden = false; if (done) done.hidden = true;
        upd(); od.showModal(); od.scrollTop = 0;
        if (nm && !sname()) setTimeout(function () { nm.focus(); }, 60);
      });
    });
    [w, bk].forEach(function (x) { if (x) x.addEventListener('change', upd); });
    [nm, em, ph, kn].forEach(function (x) { if (x) x.addEventListener('input', upd); });
    [[pay, 'pay', 'Karte, Klarna oder andere Verfahren über Stripe (Zahlung gestartet)'], [wa, 'wa', 'Überweisung oder PayPal, Bestellung per WhatsApp'], [ml, 'mail', 'Überweisung oder PayPal, Bestellung per Mail']].forEach(function (x) {
      var a = x[0]; if (!a) return;
      a.addEventListener('click', function (e) {
        if (a.getAttribute('aria-disabled') === 'true') {
          e.preventDefault();
          var m = missing();
          if (m === 'name') return flag(nm);
          if (m === 'email') return flag(em);
          w.focus(); w.closest('.check').classList.add('nudge'); setTimeout(function () { w.closest('.check').classList.remove('nudge'); }, 900); return;
        }
        upd(); send(x[2]); remember();
        setTimeout(function () { showDone(x[1], a); }, 250);
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
