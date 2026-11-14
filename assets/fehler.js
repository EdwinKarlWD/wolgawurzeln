/* Wolgawurzeln: anonyme Fehlermeldungen an den eigenen Dienst.
   Gemeldet werden nur technische Angaben: Art des Fehlers, Meldung, Datei und Zeile, Seite. Den Browser und das Gerät
   ergänzt der Dienst aus der Anfrage. Keine Eingaben, keine Namen, keine Mailadressen, höchstens fünf Meldungen je Seitenaufruf.
   Dazu zwei Wächter für die Ersteinschätzung:
   - Namensfeld angetippt, aber es nimmt die Eingabe nicht an (kein Fokus nach zwei Sekunden)
   - „Starten“ angetippt, aber die Prüfung startet nicht (nach drei Sekunden)
   - Ersteinschätzung nach zehn Sekunden nicht geladen */
(function (w, d) {
  'use strict';
  var API = w.WW_FEHLER_API || 'https://wolgawurzeln-api.edwin3222.workers.dev/fehler';
  if (!w.WW_FEHLER_API && !/(^|\.)wolgawurzeln\.de$/.test(location.hostname)) return;
  var n = 0, gesehen = {};
  function eigen(u) { return !u || u.indexOf(location.host) > -1 || u.charAt(0) === '/'; }
  function melde(art, msg, src) {
    var k = art + '|' + msg + '|' + src;
    if (gesehen[k] || ++n > 5) return;
    gesehen[k] = 1;
    try {
      var body = JSON.stringify({ art: art, msg: String(msg || '').slice(0, 300), src: String(src || '').slice(0, 160), page: location.pathname, sid: w.WW_SID || '' });
      if (navigator.sendBeacon && navigator.sendBeacon(API, new Blob([body], { type: 'text/plain' }))) return;
      var x = new XMLHttpRequest(); x.open('POST', API, true); x.setRequestHeader('Content-Type', 'text/plain'); x.send(body);
    } catch (e) {}
  }
  w.WW_FEHLER = melde;

  w.addEventListener('error', function (e) {
    var t = e && e.target;
    if (t && t !== w && t.nodeType === 1) {
      var u = t.src || t.href || '';
      if (eigen(u)) melde('laden', (t.tagName || '').toLowerCase() + ' lädt nicht', u);
      return;
    }
    var m = e && e.message;
    if (!m || m === 'Script error.' || m === 'Script error') return; /* fremde Skripte ohne Angaben */
    if (e.filename && !eigen(e.filename)) return;
    melde('skript', m, (e.filename || '') + ':' + (e.lineno || 0) + ':' + (e.colno || 0));
  }, true);

  w.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason, s = r && r.stack ? String(r.stack).split('\n').slice(0, 2).join(' ') : '';
    if (s && /https?:\/\//.test(s) && s.indexOf(location.host) < 0) return; /* fremde Skripte */
    melde('versprechen', r && (r.message || String(r)), s);
  });

  /* Wächter der Ersteinschätzung */
  d.addEventListener('pointerdown', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.id === 'fz-name') {
      setTimeout(function () { if (d.activeElement !== t) melde('waechter', 'Namensfeld nimmt keinen Fokus', 'pointer ' + (e.pointerType || '')); }, 2000);
    } else if (t.closest('.fz-go')) {
      var vor = w.WW_FZ_SUB || 0, f = d.getElementById('fz-name');
      setTimeout(function () {
        var leer = !f || (f.value || '').replace(/\s+/g, '').length < 2;
        if (!leer && (w.WW_FZ_SUB || 0) === vor) melde('waechter', 'Starten ohne Wirkung', w.WW_FZ ? 'Skript geladen' : 'Skript fehlt');
      }, 3000);
    }
  }, true);
  w.addEventListener('load', function () {
    setTimeout(function () { if (d.getElementById('fz-name') && !w.WW_FZ) melde('waechter', 'Ersteinschätzung nicht geladen', ''); }, 10000);
  });
})(window, document);
