/* Wolgawurzeln · Bestelldialog. Eine Fassung für alle Seiten mit dem Dialog #auftrag (Startseite, Leistungen, englische und russische Seite).
   Der Dialog hieß früher #order. Der neue Name sorgt dafür, dass ein noch zwischengespeichertes altes Skript ihn nicht mehr findet und nichts doppelt meldet.
   Jede Bestellung wird dem eigenen Dienst gemeldet (assets/dienst.js): Mail an Wolgawurzeln, Eingangsbestätigung an den Kunden, Vorgang im Kundenbereich.
   Stand 16.11.2026: Einzelfallrecherche bestellbar, Grenze bei den Nachnamen, Überweisung ohne Mailprogramm.
   Zwei Schritte: 1 Ihre Angaben, 2 Prüfen und bestellen. Hinweise erscheinen erst, wenn jemand weiter will und etwas fehlt.
   Stand 17.11.2026, kurze Fassung: je Bildschirm eine Entscheidung und ein Häkchen.
   Schritt 1 „Für welche Familie?“: Nachname, Mail, Berichtssprache, Einwilligung zu Konfession und Herkunft (dort, wo die Angaben eingegeben werden).
   Schritt 2 „Auftrag abschließen“: Leistung umschalten, Fotobuch, Zahlungsart, sofortiger Beginn, Übersicht direkt über dem Bestellknopf.
   Überweisung bleibt ganz auf der Seite (Dienst schickt die Zahlungsdaten), Karte und Klarna öffnen die Bezahlseite von Stripe.
   Stand 22.11.2026: Der persönliche Bestelllink führt ohne zweites Häkchen direkt zu Schritt 2, denn die Einwilligung liegt seit der Ersteinschätzung vor
   (Edwin: einmal reicht). Die Schritte im Dialog gehen ohne Eingaben an die eigene Besuchszählung (assets/zaehler.js), damit sichtbar wird, wo Leute aussteigen.
   Stand 23.11.2026: Derselbe Einstieg steht der Schlussseite der Ersteinschätzung offen (WW_BESTELLEN in assets/finder.js, „Gleich beauftragen“). */
(function () {
  'use strict';
  var od = document.getElementById('auftrag');
  if (!od || !od.showModal) return;
  var T = window.WW_T || function (s) { return s; }, SPR = window.WW_SPRACHE || 'de';
  var P = {
    hb: { key: 'hb', art: 'den', name: T('Herkunftsbericht'), price: T('49 €'), time: T('Lieferung als PDF in 3 bis 5 Tagen.'), umfang: T('Herkunftsbericht für einen Nachnamen, als PDF in 3 bis 5 Tagen.'), code: 'HB49', max: 1, url: 'https://buy.stripe.com/8x214gd8G68o6MddiQ6Vq02', bookPrice: T('78 €'), bookUrl: 'https://buy.stripe.com/dRmaEQ5GebsIfiJceM6Vq04' },
    fg: { key: 'fg', art: 'die', name: T('Familiengeschichte'), price: T('89 €'), time: T('Lieferung als PDF in 5 bis 7 Tagen.'), umfang: T('Familiengeschichte für bis zu vier Nachnamen, als PDF in 5 bis 7 Tagen.'), code: 'FG89', max: 4, url: 'https://buy.stripe.com/8x2aEQ9WueEUgmN92A6Vq03', bookPrice: T('118 €'), bookUrl: 'https://buy.stripe.com/28EeV63y668oc6x1A86Vq05' },
    /* Einzelfallrecherche: Dienstleistung nach Zeit, kein Fotobuch, keine Grenze bei den Namen */
    ez: { key: 'ez', art: 'die', name: T('Einzelfallrecherche'), price: T('149 €'), time: T('Drei Stunden Recherche einschließlich Bericht, in der Regel nach 7 bis 10 Tagen.'), umfang: T('Einzelfallrecherche, drei Stunden einschließlich Bericht, in der Regel nach 7 bis 10 Tagen.'), code: 'EZ149', max: 0, dienst: true, url: 'https://buy.stripe.com/28EfZac4C40g5I9ceM6Vq08' }
  };
  /* Was die Leistung enthält, für das eine Angebot oben in Schritt 2 (23.11.2026) */
  P.hb.inhalt = T('Kolonie, Herkunft in Deutschland und der Weg der Familie bis heute, jede Angabe mit Quelle.');
  P.fg.inhalt = T('Für bis zu vier Nachnamen. Kolonie und Herkunft jeder Linie, mit Karte und Zeitleiste.');
  P.ez.inhalt = T('Gezielte Suche nach Ihren Vorfahren mit Namen und Daten in Kirchenbüchern, Listen und Archivakten.');
  var q = function (s) { return od.querySelector(s); };
  var cur = null, ono = '', lastPre = '', w = q('#chk-waiver'), bk = q('#chk-book'), pay = q('#order-pay'), nm = q('#order-name'), em = q('#order-email'), kn = q('#order-know'), kick = q('#order-kick'), schild = q('#order-schild'), wahl = q('.dlg-wahl'), lg = q('#order-lang'), hint = q('#order-hint'), oform = q('#order-form'), done = q('#order-done'), a9 = q('#chk-a9'), rec = q('#order-rec'), forl = q('#order-for'), s1 = q('#order-s1'), s2 = q('#order-s2'), next = q('#order-next'), back = q('#order-back');
  var stufe = 1, versucht = false, perLink = false, bestellt = false, autoFg = false;
  if (!w || !pay || !nm) return;
  /* Schritte im Dialog für die eigene Besuchszählung: nur feste Kennwörter, keine Eingaben. Lädt der Zähler später, holt er die Liste nach. */
  function zm(s) { try { var z = window.WW_ZQ = window.WW_ZQ || []; if (!z.length || z.length < 40) z.push(s); } catch (e) {} }
  var a9box = a9 && a9.closest('.check'), KICK2 = '';
  var note = q('.dlg-note'), wtxt = w.parentNode.querySelector('.ck-w') || w.parentNode.querySelector('.ck-txt'), bkbox = bk && (bk.closest('.bk-extra') || bk.closest('.check')), gw = q('.gw-row');
  /* Hinweis und Zustimmung: für die Berichte stehen sie im Seitentext, für die Dienstleistung kommen sie von hier */
  var NOTE0 = note ? note.textContent : '', WAIVE0 = wtxt ? wtxt.textContent : '', SCHILD0 = schild ? schild.textContent : '';
  /* Beruhigender Satz über den Paketen, bei der Dienstleistung die Erstattung nicht genutzter Stunden (AGB § 4a) */
  var SCHILD_EZ = T('Nicht genutzte Stunden werden erstattet, 50 € je volle Stunde.');
  var zahl = function () { var r = q('input[name="order-zahl"]:checked'); return r ? r.value : 'bank'; };
  var NOTE_EZ = T('Sie bestellen eine Dienstleistung. Vor der Bestellung bestätigen Sie bitte den sofortigen Beginn der Recherche.');
  var WAIVE_EZ = T('Ich verlange ausdrücklich, dass die Recherche schon vor Ablauf der Widerrufsfrist beginnt. Mir ist bekannt, dass mein Widerrufsrecht erlischt, sobald die Leistung vollständig erbracht ist.');
  var val = function (x) { return x ? x.value.trim() : ''; };
  /* Einwilligung nach Art. 9 DSGVO, Text wie im Kästchen (ohne den Verweis) */
  var A9TXT = a9 ? (a9.parentNode.querySelector('.ck-txt') || a9.parentNode.querySelector('span')).firstChild.textContent.trim() : '';
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
    if (val(kn)) L.push(T('Das weiß ich schon: ') + val(kn));
    return T('Guten Tag, ich möchte {art} {name} ({preis}) bestellen und per Überweisung oder PayPal bezahlen.').replace('{art}', cur.art).replace('{name}', cur.name).replace('{preis}', cur.price) +
      (withBook() ? T(' Zusätzlich hätte ich gern das gedruckte Fotobuch (29 €).') : '') + '\n\n' + L.join('\n') + '\n\n' + waive() + (A9TXT ? '\n\n' + A9TXT : '');
  }
  function mailto() { return 'mailto:edwin@wolgawurzeln.de?subject=' + encodeURIComponent(T('Bestellung ') + ono + ': ' + cur.name) + '&body=' + encodeURIComponent(msg()); }
  function setA(a, ok, href) { if (!a) return; a.setAttribute('aria-disabled', ok ? 'false' : 'true'); if (ok && href) a.setAttribute('href', href); else a.removeAttribute('href'); }
  /* Schritt 1: Name, Zahl der Namen, Mail, Einwilligung zu Konfession und Herkunft */
  function missing1() {
    if (!sname()) return 'name';
    var n = namen().length;
    if (cur.max && n > 4) return 'viele';
    if (cur.max === 1 && n > 1) return 'mehrere';
    if (!mailOk()) return 'email';
    /* Persönlicher Bestelllink: Die Einwilligung wurde mit der Ersteinschätzung erteilt, das Häkchen entfällt. */
    return a9 && !perLink && !a9.checked ? 'art9' : '';
  }
  /* alles zusammen: Schritt 1 und der sofortige Beginn */
  function missing() { return missing1() || (!w.checked ? 'waiver' : ''); }
  var HINT = {
    name: T('Bitte den Nachnamen der Familie eintragen.'),
    email: T('Bitte Ihre E-Mail eintragen, damit wir uns bei Ihnen melden können.'),
    waiver: T('Bitte den Bearbeitungsbeginn bestätigen (Kästchen oben), dann wird der Bestellknopf frei.'),
    art9: T('Bitte die Einwilligung zu Konfession und Herkunft bestätigen. Ohne sie kann die Recherche nicht beginnen.'),
    mehrere: T('Der Herkunftsbericht gilt für einen Nachnamen. Für mehrere Namen ist die Familiengeschichte gedacht, sie deckt bis zu vier Nachnamen ab und kostet 89 €.'),
    viele: T('Das sind mehr als vier Nachnamen. Die Familiengeschichte deckt bis zu vier ab. Für mehr Namen ist die Einzelfallrecherche gedacht, dazu erhalten Sie ein persönliches Angebot.')
  };
  var WEITER = { mehrere: T('Zur Familiengeschichte wechseln'), viele: T('Anfrage stellen') };
  function setzeHinweis(m) {
    if (!hint) return;
    /* Passt der Name nicht zur gewählten Leistung, steht der Hinweis direkt unter der Umschaltung */
    var ort = stufe === 2 && WEITER[m] && ang ? ang : (stufe === 1 ? s1 : s2).querySelector('.dlg-pay');
    if (ort && hint.previousElementSibling !== ort) ort.parentNode.insertBefore(hint, ort.nextSibling);
    hint.classList.toggle('off', !m || !(versucht || WEITER[m]));
    hint.textContent = m ? HINT[m] : '';
    if (!WEITER[m]) return;
    var a = document.createElement('a');
    a.href = '#'; a.textContent = WEITER[m]; a.setAttribute('data-weiter', m); a.style.cssText = 'display:block;margin-top:6px;font-weight:600';
    hint.appendChild(a);
  }
  /* Ein konkretes Angebot statt Auswahl (Edwin, 23.11.2026): Viele schauen sich auf der Seite nicht um, im Dialog wird nicht erklärt,
     was was ist, die Auswahl gehört nicht in den Warenkorb. Oben in Schritt 2 steht deshalb nur die passende Leistung mit Inhalt und Preis.
     Die Reiter (.dlg-wahl) bleiben im HTML, sind aber ausgeblendet. Angelegt hier, damit alle vier Seiten mit dem Dialog es haben. */
  var ang = null;
  function zeigeAngebot() {
    var s2el = q('#order-s2'); if (!s2el) return;
    if (!ang) {
      ang = document.createElement('div'); ang.className = 'dlg-ang';
      ang.innerHTML = '<p class="dlg-ang-k"><b></b><b></b></p><p class="dlg-ang-d"></p>';
      s2el.insertBefore(ang, s2el.firstChild);
    }
    var b = ang.querySelectorAll('b');
    b[0].textContent = cur.name; b[1].textContent = cur.price;
    ang.querySelector('.dlg-ang-d').textContent = [cur.inhalt, cur.time].filter(Boolean).join(' ');
  }
  /* Fotobuch: Weihnachtshinweis in den Baustein holen, nur das Geschenk als Zeichen (Edwin 23.11.2026: Tannenbaum kann weg) */
  (function () {
    var box = q('.check-book'), xm = box && box.querySelector('.xmas'), tx = box && box.querySelector('.bk-txt');
    if (!xm || !tx) return;
    tx.appendChild(xm);
    var sv = xm.querySelector('svg'), g = sv && sv.querySelector('g');
    if (g && g.children.length > 4) { g.removeChild(g.children[0]); g.removeChild(g.children[0]); sv.setAttribute('viewBox', '16 7 15 16'); }
  })();
  /* Paket setzen: Titel, Lieferzeit, Hinweis, Zustimmung und Fotobuch passend zur Leistung */
  function setze(key) {
    cur = P[key];
    var tm = q('#order-time'); if (tm) tm.textContent = cur.name + ', ' + cur.price + '. ' + cur.time;
    if (note) note.textContent = cur.dienst ? NOTE_EZ : NOTE0;
    if (wtxt) wtxt.textContent = waive();
    if (schild) schild.textContent = cur.dienst ? SCHILD_EZ : SCHILD0;
    if (wahl) {
      wahl.hidden = !cur.bookUrl;
      [].forEach.call(wahl.querySelectorAll('[data-p]'), function (x) {
        var k = x.getAttribute('data-p'), pr = x.querySelector('span');
        x.setAttribute('aria-checked', k === key ? 'true' : 'false');
        if (pr && P[k]) pr.textContent = P[k].price;
      });
    }
    if (bkbox) bkbox.style.display = cur.bookUrl ? '' : 'none';
    if (gw) gw.style.display = cur.bookUrl ? '' : 'none';
    if (bk && !cur.bookUrl) bk.checked = false;
    zeigeAngebot();
  }
  var BUCH = T(' Dazu das gedruckte Fotobuch, Versand kostenlos und nur innerhalb Deutschlands, etwa 10 Werktage nach dem Bericht. Einzelanfertigung ohne Widerrufsrecht.').trim();
  function zeile(txt, preis, kl) {
    var r = document.createElement('div'), a = document.createElement('span'), b = document.createElement('b');
    r.className = 'rc-r' + (kl ? ' ' + kl : ''); a.textContent = txt; b.textContent = preis; r.appendChild(a); r.appendChild(b); return r;
  }
  /* Schritt wechseln: 1 Ihre Angaben, 2 Prüfen und bestellen */
  function schritt(n, fokus) {
    stufe = n; versucht = false;
    if (s1) s1.hidden = n !== 1; if (s2) s2.hidden = n !== 2;
    if (kick) kick.textContent = n === 1 ? T('Schritt 1 von 2') : (KICK2 || T('Schritt 2 von 2'));
    if (n === 2) zm('dialog schritt 2 ' + cur.key);
    var tt = q('#order-title'); if (tt) tt.textContent = n === 1 ? T('Für welche Familie?') : T('Auftrag abschließen');
    upd(); od.scrollTop = 0;
    if (fokus && n === 2 && s2) { try { s2.focus({ preventScroll: true }); } catch (e) {} }
    if (fokus && n === 1 && nm) { try { nm.focus({ preventScroll: true }); } catch (e) {} }
  }
  function upd() {
    if (!cur) return;
    /* Immer das passende Angebot: Stehen zwei bis vier Nachnamen beim Herkunftsbericht, gilt die Familiengeschichte.
       Wird es wieder ein Name, geht es zurück zum Herkunftsbericht, aber nur, wenn hier gewechselt wurde. */
    var nn = namen().length;
    /* Beim persönlichen Bestelllink gilt die Leistung aus Edwins Angebot, dort bleibt es beim Hinweis mit dem Wechsel von Hand. */
    if (!perLink && cur.key === 'hb' && nn > 1 && nn <= 4 && P.fg) { setze('fg'); autoFg = true; zm('dialog passend fg'); }
    else if (autoFg && cur.key === 'fg' && nn <= 1) { setze('hb'); autoFg = false; zm('dialog passend hb'); }
    var m = missing(), m1 = missing1();
    if (rec) {
      rec.textContent = '';
      rec.appendChild(zeile(cur.umfang, cur.price));
      if (withBook()) rec.appendChild(zeile(BUCH, T('29 €')));
      rec.appendChild(zeile(T('Gesamtpreis ').trim(), withBook() ? cur.bookPrice : cur.price, 'rc-sum'));
    }
    if (forl) forl.textContent = [sname(), val(em), T(BSPR[bericht()])].filter(Boolean).join(' · ');
    [w, a9].forEach(function (x) { var c = x && x.checked && x.closest('.check'); if (c) c.classList.remove('miss'); });
    setzeHinweis(stufe === 1 ? m1 : m);
    if (m) { setA(pay, false); pay.removeAttribute('target'); return; }
    /* Karte: Link zur Bezahlseite in neuem Fenster. Überweisung: bleibt auf der Seite, der Klick meldet die Bestellung an den Dienst. */
    if (zahl() === 'karte') { setA(pay, true, stripe()); pay.setAttribute('target', '_blank'); pay.setAttribute('rel', 'noopener'); }
    else { setA(pay, true, '#'); pay.removeAttribute('target'); }
  }
  function stripe() { return (withBook() ? cur.bookUrl : cur.url) + '?locale=' + SPR + '&client_reference_id=' + encodeURIComponent(ref()) + (val(em) ? '&prefilled_email=' + encodeURIComponent(val(em)) : ''); }
  function flag(el) { var f = el && el.closest('.dlg-f'); if (!f) return; el.focus(); f.classList.add('miss'); setTimeout(function () { f.classList.remove('miss'); }, 1400); }
  /* Meldung an den Dienst. Antwort immer als { st, j }, ohne Dienst st 0. */
  function send(weg) {
    var D = window.WW_DIENST;
    if (!D || !D.an() || !window.fetch) return Promise.resolve({ st: 0, j: null });
    var daten = { einwilligung: perLink ? 'ersteinschaetzung' : (a9 && a9.checked ? 'konfession-herkunft' : ''), nr: ono, paket: cur.key, name: sname(), namen: namen().length, email: val(em), wissen: val(kn), sprache: SPR, bericht: bericht(), fotobuch: withBook(), weg: weg, ref: ref(), seite: location.pathname.slice(0, 60) };
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
    stufe = 1; versucht = false; perLink = false; bestellt = false; KICK2 = ''; autoFg = false;
    if (a9box) a9box.style.display = '';
    [w, a9].forEach(function (x) { var c = x && x.closest('.check'); if (c) c.classList.remove('miss'); });
    w.checked = false; if (a9) a9.checked = false; if (bk) bk.checked = !!(b && b.hasAttribute('data-book') && cur.bookUrl);
    /* Vorauswahl Überweisung (Edwin lieber, bleibt auf der Seite). Auf der englischen Seite Karte, weil Überweisungen aus den USA und Kanada teuer sind. */
    var zb = q('input[name="order-zahl"][value="' + (SPR === 'en' ? 'karte' : 'bank') + '"]'); if (zb) zb.checked = true;
    var fz = window.__fz && window.__fz.st ? window.__fz.st().name : '';
    var pre = ((b && b.getAttribute('data-name')) || fz || (document.getElementById('fz-name') || {}).value || '').replace(/\s+/g, ' ').trim();
    if (pre && pre !== lastPre) { nm.value = pre; lastPre = pre; }
    if (oform) oform.hidden = false; if (done) done.hidden = true;
    schritt(1); od.showModal(); od.scrollTop = 0;
    if (!sname()) setTimeout(function () { nm.focus(); }, 60);
    return true;
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-order]');
    if (!b || od.contains(b)) return;
    if (oeffne(b.getAttribute('data-order'), b)) e.preventDefault();
  });
  [w, a9, bk, lg].forEach(function (x) { if (x) x.addEventListener('change', upd); });
  [].forEach.call(od.querySelectorAll('input[name="order-zahl"]'), function (x) { x.addEventListener('change', function () { upd(); zm('dialog zahl ' + zahl()); }); });
  w.addEventListener('change', function () { zm('dialog sofort ' + (w.checked ? 'an' : 'aus')); });
  if (bk) bk.addEventListener('change', function () { zm('dialog fotobuch ' + (bk.checked ? 'an' : 'aus')); });
  /* Dialog geschlossen, ohne zu bestellen: der Schritt, an dem jemand aussteigt */
  od.addEventListener('close', function () { if (cur && !bestellt && oform && !oform.hidden) zm('dialog zu schritt ' + stufe + ' ' + cur.key); });
  [nm, em].forEach(function (x) { if (x) x.addEventListener('input', upd); });
  /* Leistung umschalten wie eine Anzahl: Herkunftsbericht oder Familiengeschichte */
  if (wahl) wahl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-p]'); if (!b || !P[b.getAttribute('data-p')]) return;
    setze(b.getAttribute('data-p')); upd();
  });
  if (wahl) wahl.addEventListener('keydown', function (e) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) < 0) return;
    e.preventDefault(); var k = cur.key === 'hb' ? 'fg' : 'hb'; setze(k); upd();
    var b = wahl.querySelector('[data-p="' + k + '"]'); if (b) b.focus();
  });
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
  if (next) next.addEventListener('click', function () {
    if (missing1()) { zm('dialog fehlt ' + missing1()); versucht = true; upd(); return fehlt(); }
    schritt(2, true);
  });
  if (back) back.addEventListener('click', function () { schritt(1, true); });
  [nm, em].forEach(function (x) { if (x) x.addEventListener('keydown', function (e) { if (e.key === 'Enter' && next) { e.preventDefault(); next.click(); } }); });
  /* Bezahlen auf der Bezahlseite: Der Link öffnet sich, die Bestellung wird nebenher gemeldet */
  pay.addEventListener('click', function (e) {
    if (pay.getAttribute('aria-disabled') === 'true') { e.preventDefault(); zm('dialog fehlt ' + missing()); versucht = true; upd(); return fehlt(); }
    if (zahl() !== 'karte') { e.preventDefault(); return ueberweisung(); }
    upd(); send('pay'); remember(); bestellt = true; zm('dialog bestellt karte ' + cur.key);
    var href = pay.getAttribute('href');
    setTimeout(function () { showDone('pay', href); }, 250);
  });
  /* Überweisung: Die Bestellung geht an den Dienst, die Zahlungsdaten kommen mit der Bestätigungsmail.
     Nur wenn der Dienst nicht antwortet, öffnet sich wie früher das Mailprogramm. */
  var laeuft = false;
  function ueberweisung() {
    if (laeuft) return;
    upd(); laeuft = true; pay.style.opacity = '.5';
    var href = mailto();
    send('bank').then(function (r) {
      laeuft = false; pay.style.opacity = '';
      remember(); bestellt = true;
      if (r && r.j && r.j.ok) { zm('dialog bestellt bank ' + cur.key); showDone(r.j.zahldaten ? 'bank' : 'bank2'); return; }
      zm('dialog bestellt mailprogramm ' + cur.key);
      location.href = href; showDone('mail', href);
    });
  }
  function fehlt() {
    var m = missing();
    if (missing1() && stufe !== 1) { schritt(1); versucht = true; upd(); }
    if (m === 'name' || m === 'mehrere' || m === 'viele') return flag(nm);
    if (m === 'email') return flag(em);
    var k = m === 'art9' && a9 ? a9 : w;
    if (!k) return;
    k.focus(); var c = k.closest('.check'); if (c) { c.classList.add('nudge', 'miss'); setTimeout(function () { c.classList.remove('nudge'); }, 900); }
  }
  /* Auftrag zu einem vorhandenen Vorgang der Ersteinschätzung öffnen. Zwei Wege führen hierher: der persönliche Bestelllink (woher „link“)
     und die Schlussseite der Ersteinschätzung (woher „fenster“). Name, Mail und Vorgang sind eingetragen, die Einwilligung zu Konfession
     und Herkunft liegt seit der Ersteinschätzung vor: kein zweites Häkchen, der Vorgang steht in der Kopfzeile, es geht direkt in Schritt 2. */
  function mitVorgang(pk, dt, woher) {
    if (!oeffne(pk)) return false;
    if (!dt || !dt.np) { zm('dialog ' + woher + ' ' + pk + ' ohne vorgang'); return true; }
    if (dt.name) { nm.value = dt.name; lastPre = dt.name; }
    if (em && dt.email) em.value = dt.email;
    if (kn) kn.value = ['Vorgang ' + dt.np, dt.notiz].filter(Boolean).join('. ');
    ono = dt.np.replace(/\s+/g, '');
    perLink = true; KICK2 = T('Ihr Vorgang: ') + dt.np;
    if (a9box) a9box.style.display = 'none';
    zm('dialog ' + woher + ' ' + pk + (dt.stand ? ' ' + dt.stand : ''));
    upd();
    if (dt.stand === 'bezahlt') { showDone('bezahlt'); return true; }
    if (dt.stand === 'bestellt') { showDone('schon', cur.url + '?locale=' + SPR + '&client_reference_id=' + encodeURIComponent(ref()) + (val(em) ? '&prefilled_email=' + encodeURIComponent(val(em)) : '')); return true; }
    if (!missing1()) schritt(2, true);
    return true;
  }
  /* Für die Schlussseite der Ersteinschätzung (assets/finder.js): dt = { np, name, email, notiz } */
  window.WW_BESTELLEN = function (pk, dt) { return mitVorgang(pk, dt, 'fenster'); };
  /* Persönlicher Bestelllink aus Einschätzung oder Angebot: ?bestellen=hb|fg|ez&b=<Schlüssel> öffnet den Auftrag mit Name, Mail und Vorgang.
     Liegt zu diesem Vorgang schon eine Bestellung derselben Leistung vor, wird das gesagt, statt eine zweite anzulegen. */
  (function () {
    var u; try { u = new URLSearchParams(location.search); } catch (e) { return; }
    var pk = u.get('bestellen'), tk = u.get('b');
    if (!pk || !P[pk]) return;
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
    var start = function (dt) { mitVorgang(pk, dt, 'link'); };
    if (!tk || !window.fetch) { start(null); return; }
    fetch((window.WW_DIENST ? window.WW_DIENST.api : 'https://wolgawurzeln-api.edwin3222.workers.dev') + '/bestellung?b=' + encodeURIComponent(tk) + '&p=' + pk)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(start, function () { start(null); });
  })();
})();
