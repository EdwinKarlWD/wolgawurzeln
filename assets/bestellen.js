/* Wolgawurzeln · Bestelldialog. Eine Fassung für alle Seiten mit dem Dialog #auftrag (Startseite, Leistungen, englische und russische Seite).
   Der Dialog hieß früher #order. Der neue Name sorgt dafür, dass ein noch zwischengespeichertes altes Skript ihn nicht mehr findet und nichts doppelt meldet.
   Jede Bestellung wird dem eigenen Dienst gemeldet (assets/dienst.js): Mail an Wolgawurzeln, Eingangsbestätigung an den Kunden, Vorgang im Kundenbereich.
   Stand 16.11.2026: Einzelfallrecherche bestellbar, Grenze bei den Nachnamen, Überweisung ohne Mailprogramm. */
(function () {
  'use strict';
  var od = document.getElementById('auftrag');
  if (!od || !od.showModal) return;
  var T = window.WW_T || function (s) { return s; }, SPR = window.WW_SPRACHE || 'de';
  var P = {
    hb: { key: 'hb', art: 'den', name: T('Herkunftsbericht'), price: T('49 €'), time: T('Lieferung als PDF in 3 bis 5 Tagen.'), umfang: T('Herkunftsbericht für einen Nachnamen, als PDF in 3 bis 5 Tagen.'), code: 'HB49', max: 1, url: 'https://buy.stripe.com/8x214gd8G68o6MddiQ6Vq02', bookPrice: T('78 €'), bookUrl: 'https://buy.stripe.com/dRmaEQ5GebsIfiJceM6Vq04' },
    fg: { key: 'fg', art: 'die', name: T('Familiengeschichte'), price: T('89 €'), time: T('Lieferung als PDF in 5 bis 8 Tagen.'), umfang: T('Familiengeschichte für bis zu vier Nachnamen, als PDF in 5 bis 8 Tagen.'), code: 'FG89', max: 4, url: 'https://buy.stripe.com/8x2aEQ9WueEUgmN92A6Vq03', bookPrice: T('118 €'), bookUrl: 'https://buy.stripe.com/28EeV63y668oc6x1A86Vq05' },
    /* Einzelfallrecherche: Dienstleistung nach Zeit, kein Fotobuch, keine Grenze bei den Namen */
    ez: { key: 'ez', art: 'die', name: T('Einzelfallrecherche'), price: T('149 €'), time: T('Drei Stunden Recherche einschließlich Bericht, in der Regel nach 7 bis 10 Tagen.'), umfang: T('Einzelfallrecherche, drei Stunden einschließlich Bericht, in der Regel nach 7 bis 10 Tagen.'), code: 'EZ149', max: 0, dienst: true, url: 'https://buy.stripe.com/28EfZac4C40g5I9ceM6Vq08' }
  };
  var q = function (s) { return od.querySelector(s); };
  var cur = null, ono = '', lastPre = '', w = q('#chk-waiver'), bk = q('#chk-book'), pay = q('#order-pay'), ml = q('#order-mail'), nm = q('#order-name'), em = q('#order-email'), ph = q('#order-phone'), kn = q('#order-know'), lg = q('#order-lang'), hint = q('#order-hint'), oform = q('#order-form'), done = q('#order-done'), a9 = q('#chk-a9'), sum = q('#order-sum');
  if (!w || !pay || !nm) return;
  var note = q('.dlg-note'), wtxt = w.parentNode.querySelector('span'), bkbox = bk && (bk.closest('.bk-extra') || bk.closest('.check')), gw = q('.gw-row');
  /* Hinweis und Zustimmung: für die Berichte stehen sie im Seitentext, für die Dienstleistung kommen sie von hier */
  var NOTE0 = note ? note.textContent : '', WAIVE0 = wtxt ? wtxt.textContent : '';
  var NOTE_EZ = T('Sie bestellen eine Dienstleistung. Vor der Bestellung bestätigen Sie bitte den sofortigen Beginn der Recherche.');
  var WAIVE_EZ = T('Ich verlange ausdrücklich, dass die Recherche schon vor Ablauf der Widerrufsfrist beginnt. Mir ist bekannt, dass mein Widerrufsrecht erlischt, sobald die Leistung vollständig erbracht ist, und dass ich bei einem Widerruf davor die bis dahin erbrachte Leistung anteilig bezahle.');
  var val = function (x) { return x ? x.value.trim() : ''; };
  /* Einwilligung nach Art. 9 DSGVO, Text wie im Kästchen (ohne den Verweis) */
  var A9TXT = a9 ? a9.parentNode.querySelector('span').firstChild.textContent.trim() : '';
  var withBook = function () { return !!(bk && bk.checked && cur && cur.bookUrl); };
  var sname = function () { return val(nm).replace(/\s+/g, ' '); };
  /* Nachnamen zählen: getrennt durch Komma, Semikolon, Schrägstrich, Plus, Und Zeichen oder das Wort und */
  var namen = function () { return sname().split(/\s*[,;\/+&]\s*|\s+(?:und|and|и)\s+/i).filter(function (x) { return x.replace(/[^A-Za-zÀ-ſЀ-ӿ]/g, '').length > 1; }); };
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
  /* Sprache des Berichts: Vorgabe ist die Sprache der Seite */
  var BSPR = { de: 'Deutsch', ru: 'Russisch', en: 'Englisch' };
  var bericht = function () { return lg && BSPR[lg.value] ? lg.value : 'de'; };
  var waive = function () { return cur && cur.dienst ? WAIVE_EZ : WAIVE0; };
  function ref() { return [ono, cur.code, sref(sname()), 'verzicht-ja', 'fotobuch-' + (withBook() ? 'ja' : 'nein'), 'bericht-' + bericht()].join('_').slice(0, 200); }
  /* Text der Mail, falls der Dienst nicht erreichbar ist und die Bestellung über das Mailprogramm läuft */
  function msg() {
    var L = [T('Bestellnummer: ') + ono, T('Nachname der Familie: ') + sname(), T('E-Mail: ') + val(em), T('Sprache des Berichts: ') + T(BSPR[bericht()])];
    if (val(ph)) L.push(T('Telefon: ') + val(ph));
    if (val(kn)) L.push(T('Das weiß ich schon: ') + val(kn));
    return T('Guten Tag, ich möchte {art} {name} ({preis}) bestellen und per Überweisung oder PayPal bezahlen.').replace('{art}', cur.art).replace('{name}', cur.name).replace('{preis}', cur.price) +
      (withBook() ? T(' Zusätzlich hätte ich gern das gedruckte Fotobuch (29 €).') : '') + '\n\n' + L.join('\n') + '\n\n' + waive() + (A9TXT ? '\n\n' + A9TXT : '');
  }
  function mailto() { return 'mailto:edwin@wolgawurzeln.de?subject=' + encodeURIComponent(T('Bestellung ') + ono + ': ' + cur.name) + '&body=' + encodeURIComponent(msg()); }
  function setA(a, ok, href) { if (!a) return; a.setAttribute('aria-disabled', ok ? 'false' : 'true'); if (ok && href) a.setAttribute('href', href); else a.removeAttribute('href'); }
  function missing() {
    if (!sname()) return 'name';
    var n = namen().length;
    if (cur.max && n > 4) return 'viele';
    if (cur.max === 1 && n > 1) return 'mehrere';
    return !mailOk() ? 'email' : !w.checked ? 'waiver' : a9 && !a9.checked ? 'art9' : '';
  }
  var HINT = {
    name: T('Bitte oben den Nachnamen der Familie eintragen, dann wird der Bestellknopf frei.'),
    email: T('Bitte Ihre E-Mail eintragen, damit wir uns bei Ihnen melden können. Dann wird der Bestellknopf frei.'),
    waiver: T('Bitte den Bearbeitungsbeginn bestätigen (Kästchen oben), dann wird der Bestellknopf frei.'),
    art9: T('Bitte die Einwilligung zu Konfession und Herkunft bestätigen (Kästchen oben), dann wird der Bestellknopf frei.'),
    mehrere: T('Der Herkunftsbericht gilt für einen Nachnamen. Für mehrere Namen ist die Familiengeschichte gedacht, sie deckt bis zu vier Nachnamen ab und kostet 89 €.'),
    viele: T('Das sind mehr als vier Nachnamen. Die Familiengeschichte deckt bis zu vier ab. Für mehr Namen erhalten Sie ein eigenes Angebot.')
  };
  var WEITER = { mehrere: T('Zur Familiengeschichte wechseln'), viele: T('Anfrage stellen') };
  function setzeHinweis(m) {
    if (!hint) return;
    hint.classList.toggle('off', !m);
    hint.textContent = m ? HINT[m] : '';
    if (!WEITER[m]) return;
    var a = document.createElement('a');
    a.href = '#'; a.textContent = WEITER[m]; a.setAttribute('data-weiter', m); a.style.cssText = 'display:block;margin-top:6px;font-weight:600';
    hint.appendChild(a);
  }
  /* Paket setzen: Titel, Lieferzeit, Hinweis, Zustimmung und Fotobuch passend zur Leistung */
  function setze(key) {
    cur = P[key];
    var tm = q('#order-time'); if (tm) tm.textContent = cur.time;
    if (note) note.textContent = cur.dienst ? NOTE_EZ : NOTE0;
    if (wtxt) wtxt.textContent = waive();
    if (bkbox) bkbox.style.display = cur.bookUrl ? '' : 'none';
    if (gw) gw.style.display = cur.bookUrl ? '' : 'none';
    if (bk && !cur.bookUrl) bk.checked = false;
  }
  function upd() {
    if (!cur) return;
    var m = missing();
    var tt = q('#order-title'); if (tt) tt.textContent = T('Auftrag: ') + cur.name + (withBook() ? T(' mit Fotobuch, ') + cur.bookPrice : ', ' + cur.price);
    if (sum) { sum.textContent = cur.umfang + (withBook() ? T(' Dazu das gedruckte Fotobuch, Lieferung nur innerhalb Deutschlands, etwa 10 Werktage nach dem Bericht. Als Einzelanfertigung ohne Widerrufsrecht.') : '') + ' ';
      var gp = document.createElement('b'); gp.textContent = T('Gesamtpreis ') + (withBook() ? cur.bookPrice : cur.price) + '.'; sum.appendChild(gp); }
    setzeHinweis(m);
    if (m) { setA(pay, false); setA(ml, false); return; }
    setA(pay, true, (withBook() ? cur.bookUrl : cur.url) + '?locale=' + SPR + '&client_reference_id=' + encodeURIComponent(ref()) + (val(em) ? '&prefilled_email=' + encodeURIComponent(val(em)) : ''));
    setA(ml, true, mailto());
  }
  function flag(el) { var f = el && el.closest('.dlg-f'); if (!f) return; el.focus(); f.classList.add('miss'); setTimeout(function () { f.classList.remove('miss'); }, 1400); }
  /* Meldung an den Dienst. Antwort immer als { st, j }, ohne Dienst st 0. */
  function send(weg) {
    var D = window.WW_DIENST;
    if (!D || !D.an() || !window.fetch) return Promise.resolve({ st: 0, j: null });
    var daten = { einwilligung: a9 && a9.checked ? 'konfession-herkunft' : '', nr: ono, paket: cur.key, name: sname(), namen: namen().length, email: val(em), tel: val(ph), wissen: val(kn), sprache: SPR, bericht: bericht(), fotobuch: withBook(), weg: weg, ref: ref(), seite: location.pathname.slice(0, 60) };
    return D.token().then(function (ts) { daten.ts = ts; return D.ruf('/auftrag', { body: daten }); }).catch(function () { return { st: 0, j: null }; });
  }
  function remember() { try { localStorage.setItem('ww_order', JSON.stringify({ no: ono, p: cur.key, book: withBook(), t: Date.now() })); } catch (e) {} }
  var DONE = {
    pay: [T('Die gesicherte Bezahlseite ist in einem neuen Fenster geöffnet. Nach der Zahlung sehen Sie unsere Bestätigungsseite.'), T('Bezahlseite erneut öffnen')],
    mail: [T('Ihr Mailprogramm ist mit Ihrer Bestellung geöffnet. Bitte senden Sie die Mail ab, Sie erhalten dann die Zahlungsdaten.'), T('Mail erneut öffnen')],
    bank: [T('Ihre Bestellung ist eingegangen. Bankverbindung, Betrag und Verwendungszweck stehen in der Bestätigungsmail, die jetzt an Sie unterwegs ist.'), ''],
    bank2: [T('Ihre Bestellung ist eingegangen. Die Zahlungsdaten erhalten Sie per Mail.'), ''],
    schon: [T('Zu diesem Angebot liegt bereits eine Bestellung vor. Falls die Zahlung noch offen ist, können Sie sie hier abschließen.'), T('Bezahlseite öffnen')],
    bezahlt: [T('Diese Bestellung ist bereits eingegangen und bezahlt. Sie müssen nichts weiter tun.'), '']
  };
  function showDone(kind, href) {
    if (!done || !oform) { od.close(); return; }
    q('#order-no').textContent = ono;
    q('#order-done-t').textContent = DONE[kind][0];
    var ag = q('#order-again');
    if (ag) {
      ag.style.display = DONE[kind][1] && href ? '' : 'none';
      ag.textContent = DONE[kind][1];
      if (href) ag.setAttribute('href', href); else ag.removeAttribute('href');
      if (kind === 'mail') ag.removeAttribute('target'); else ag.setAttribute('target', '_blank');
    }
    oform.hidden = true; done.hidden = false; od.scrollTop = 0;
  }
  /* Dialog öffnen. b = auslösender Knopf (kann fehlen, etwa beim persönlichen Bestelllink) */
  function oeffne(key, b) {
    if (!P[key]) return false;
    setze(key);
    ono = newNo();
    w.checked = false; if (a9) a9.checked = false; if (bk) bk.checked = !!(b && b.hasAttribute('data-book') && cur.bookUrl);
    var fz = window.__fz && window.__fz.st ? window.__fz.st().name : '';
    var pre = ((b && b.getAttribute('data-name')) || fz || (document.getElementById('fz-name') || {}).value || '').replace(/\s+/g, ' ').trim();
    if (pre && pre !== lastPre) { nm.value = pre; lastPre = pre; }
    if (oform) oform.hidden = false; if (done) done.hidden = true;
    upd(); od.showModal(); od.scrollTop = 0;
    if (!sname()) setTimeout(function () { nm.focus(); }, 60);
    return true;
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-order]');
    if (!b || od.contains(b)) return;
    if (oeffne(b.getAttribute('data-order'), b)) e.preventDefault();
  });
  [w, a9, bk, lg].forEach(function (x) { if (x) x.addEventListener('change', upd); });
  [nm, em, ph, kn].forEach(function (x) { if (x) x.addEventListener('input', upd); });
  /* Wege aus dem Hinweis: zur Familiengeschichte wechseln oder mit vielen Namen ins Anfrageformular */
  if (hint) hint.addEventListener('click', function (e) {
    var a = e.target.closest('[data-weiter]'); if (!a) return;
    e.preventDefault();
    if (a.getAttribute('data-weiter') === 'mehrere') { setze('fg'); upd(); return; }
    var text = T('Recherche zu mehreren Nachnamen') + ': ' + sname(), rf = document.getElementById('reqform');
    if (!rf) { location.href = 'kontakt.html?nachname=' + encodeURIComponent(sname().slice(0, 80)) + '&anliegen=' + encodeURIComponent(T('Recherche zu mehreren Nachnamen')) + '#anfrage'; return; }
    var n = rf.elements['nachname'], t = rf.elements['anliegen'], m = rf.elements['email'];
    if (n && !n.value.trim()) n.value = sname().slice(0, 80);
    if (t && !t.value.trim()) t.value = text + (val(kn) ? '\n' + val(kn) : '');
    if (m && !m.value.trim() && mailOk()) m.value = val(em);
    od.close();
    var ziel = document.getElementById('anfrage'); if (ziel) { ziel.classList.add('an-auf'); ziel.scrollIntoView(); }
  });
  /* Bezahlen auf der Bezahlseite: Der Link öffnet sich, die Bestellung wird nebenher gemeldet */
  pay.addEventListener('click', function (e) {
    if (pay.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return fehlt(); }
    upd(); send('pay'); remember();
    var href = pay.getAttribute('href');
    setTimeout(function () { showDone('pay', href); }, 250);
  });
  /* Überweisung: Die Bestellung geht an den Dienst, die Zahlungsdaten kommen mit der Bestätigungsmail.
     Nur wenn der Dienst nicht antwortet, öffnet sich wie früher das Mailprogramm. */
  var laeuft = false;
  if (ml) ml.addEventListener('click', function (e) {
    e.preventDefault();
    if (ml.getAttribute('aria-disabled') === 'true') return fehlt();
    if (laeuft) return;
    upd(); laeuft = true; ml.style.opacity = '.5';
    var href = mailto();
    send('bank').then(function (r) {
      laeuft = false; ml.style.opacity = '';
      remember();
      if (r && r.j && r.j.ok) { showDone(r.j.zahldaten ? 'bank' : 'bank2'); return; }
      location.href = href; showDone('mail', href);
    });
  });
  function fehlt() {
    var m = missing();
    if (m === 'name' || m === 'mehrere' || m === 'viele') return flag(nm);
    if (m === 'email') return flag(em);
    var k = m === 'art9' && a9 ? a9 : w;
    k.focus(); var c = k.closest('.check'); if (c) { c.classList.add('nudge'); setTimeout(function () { c.classList.remove('nudge'); }, 900); }
  }
  /* Persönlicher Bestelllink aus Einschätzung oder Angebot: ?bestellen=hb|fg|ez&b=<Schlüssel> öffnet den Auftrag mit Name, Mail und Vorgang.
     Liegt zu diesem Vorgang schon eine Bestellung derselben Leistung vor, wird das gesagt, statt eine zweite anzulegen. */
  (function () {
    var u; try { u = new URLSearchParams(location.search); } catch (e) { return; }
    var pk = u.get('bestellen'), tk = u.get('b');
    if (!pk || !P[pk]) return;
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
    var start = function (dt) {
      if (!oeffne(pk)) return;
      if (!dt || !dt.np) return;
      if (dt.name) { nm.value = dt.name; lastPre = dt.name; }
      if (em && dt.email) em.value = dt.email;
      if (kn) kn.value = ['Vorgang ' + dt.np, dt.notiz].filter(Boolean).join('. ');
      ono = dt.np.replace(/\s+/g, '');
      upd();
      if (dt.stand === 'bezahlt') return showDone('bezahlt');
      if (dt.stand === 'bestellt') return showDone('schon', cur.url + '?locale=' + SPR + '&client_reference_id=' + encodeURIComponent(ref()) + (val(em) ? '&prefilled_email=' + encodeURIComponent(val(em)) : ''));
      setTimeout(function () { w.focus(); }, 80);
    };
    if (!tk || !window.fetch) { start(null); return; }
    fetch((window.WW_DIENST ? window.WW_DIENST.api : 'https://wolgawurzeln-api.edwin3222.workers.dev') + '/bestellung?b=' + encodeURIComponent(tk) + '&p=' + pk)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(start, function () { start(null); });
  })();
})();
