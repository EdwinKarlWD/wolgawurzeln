/* Wolgawurzeln: eigene Besuchszählung ohne Cookies.
   Meldet je Seitenaufruf an den eigenen Dienst: Seite, Sprache, Herkunft (Link Quelle oder verweisende Website),
   vorherige Seite auf wolgawurzeln.de, sichtbare Verweildauer, wie weit gescrollt wurde und welche Knöpfe und Links
   angetippt wurden. Keine Cookies, im Browser wird nichts gespeichert, keine Eingaben aus Formularen.
   Geladen von site.js und v3.js. Die Kennung des Seitenaufrufs ist dieselbe wie in der Ersteinschätzung (WW_SID),
   so lassen sich Ersteinschätzung und Besuch zusammen auswerten. */
(function (w, d) {
  'use strict';
  if (w.WW_Z) return;
  w.WW_Z = 1;
  var API = w.WW_ZAEHLER_API || 'https://wolgawurzeln-zaehler.edwin3222.workers.dev/v';
  if (!w.WW_ZAEHLER_API && !/(^|\.)wolgawurzeln\.de$/.test(location.hostname)) return;
  var ua = navigator.userAgent || '';
  if (navigator.webdriver || /bot|crawl|spider|headless|lighthouse/i.test(ua)) return;

  var pid = /^[a-z0-9]{6,12}$/.test(w.WW_SID || '') ? w.WW_SID : Math.random().toString(36).slice(2, 10);
  if (pid.length < 6) pid = (pid + Math.random().toString(36).slice(2)).slice(0, 8);
  w.WW_SID = pid;

  var sichtbarSeit = d.visibilityState === 'hidden' ? 0 : Date.now(), zeit = 0, tief = 0, klicks = [], zuletzt = '';

  function senden(o) {
    try {
      var b = JSON.stringify(o);
      if (navigator.sendBeacon && navigator.sendBeacon(API, new Blob([b], { type: 'text/plain' }))) return;
      fetch(API, { method: 'POST', body: b, keepalive: true, mode: 'cors', headers: { 'Content-Type': 'text/plain' } }).catch(function () {});
    } catch (e) {}
  }
  function sek() { return Math.round((zeit + (sichtbarSeit ? Date.now() - sichtbarSeit : 0)) / 1000); }
  function quelle() {
    try { var u = new URLSearchParams(location.search); return (u.get('utm_source') || u.get('quelle') || '').slice(0, 40); }
    catch (e) { return ''; }
  }
  function verweis() {
    try {
      if (!d.referrer) return '';
      var r = new URL(d.referrer);
      return r.host === location.host ? r.pathname.slice(0, 100) : r.hostname.slice(0, 100);
    } catch (e) { return ''; }
  }
  function messen() {
    var e = d.documentElement, h = Math.max(e.scrollHeight, d.body ? d.body.scrollHeight : 0);
    var y = (w.pageYOffset || e.scrollTop || 0) + (w.innerHeight || e.clientHeight || 0);
    if (h > 0) tief = Math.max(tief, Math.min(100, Math.round(y / h * 100)));
  }
  function ende() {
    if (sichtbarSeit) { zeit += Date.now() - sichtbarSeit; sichtbarSeit = 0; }
    messen();
    var o = { a: 'e', pid: pid, d: sek(), s: tief, k: klicks };
    var s = JSON.stringify(o);
    if (s === zuletzt) return;
    zuletzt = s;
    senden(o);
  }

  /* Was wurde angetippt: Paketkarten, Bestellknöpfe, Links (nur Ziel), Knöpfe (nur ihre Beschriftung) */
  function etikett(el) {
    if (!el || !el.closest) return '';
    var z = el.closest('[data-z]');
    if (z) return z.getAttribute('data-z');
    var t = el.closest('a,button,[role=button],[role=tab],summary,input[type=submit],input[type=button]');
    var pk = (t || el).closest('[data-pk]');
    var vor = pk ? 'karte ' + pk.getAttribute('data-pk') + ': ' : '';
    if (!t) return pk ? 'karte ' + pk.getAttribute('data-pk') : '';
    if (t.hasAttribute('data-order')) return 'bestellen ' + t.getAttribute('data-order') + (t.hasAttribute('data-book') ? ' buch' : '');
    if (t.hasAttribute('data-pick')) return 'auswahl ' + t.getAttribute('data-pick');
    if (t.id && /^order-/.test(t.id)) return t.id;
    var h = t.getAttribute('href');
    if (h) {
      if (/^mailto:/i.test(h)) return vor + 'mail';
      if (/^tel:/i.test(h)) return vor + 'telefon';
      if (/^https:\/\/(wa\.me|api\.whatsapp\.com)/i.test(h)) return vor + 'whatsapp';
      if (h.charAt(0) === '#') return vor + h.slice(0, 40);
      try {
        var u = new URL(h, location.href);
        if (u.host === location.host) return vor + (u.pathname.replace(/^\//, '') || 'start') + (u.hash || '');
        return vor + 'extern ' + u.hostname.replace(/^www\./, '');
      } catch (e) {}
    }
    var txt = (t.getAttribute('aria-label') || (t.tagName === 'INPUT' ? t.value : t.textContent) || '').replace(/\s+/g, ' ').trim().slice(0, 30);
    var cls = (t.className && typeof t.className === 'string') ? t.className.split(' ')[0] : '';
    return vor + (txt || cls || t.tagName.toLowerCase());
  }
  function merken(l) { if (l && klicks.length < 25) klicks.push(String(l).slice(0, 60) + ' @' + sek() + 's'); }

  d.addEventListener('click', function (e) { try { merken(etikett(e.target)); } catch (x) {} }, true);
  d.addEventListener('submit', function (e) {
    try { var f = e.target; merken('senden ' + (f.id || (typeof f.className === 'string' ? f.className.split(' ')[0] : '') || 'formular')); } catch (x) {}
  }, true);
  var geplant = false;
  w.addEventListener('scroll', function () {
    if (geplant) return;
    geplant = true;
    (w.requestAnimationFrame || setTimeout)(function () { geplant = false; messen(); });
  }, { passive: true });
  d.addEventListener('visibilitychange', function () {
    if (d.visibilityState === 'hidden') ende();
    else if (!sichtbarSeit) sichtbarSeit = Date.now();
  });
  w.addEventListener('pagehide', ende);

  messen();
  senden({ a: 's', pid: pid, p: location.pathname, l: (d.documentElement.lang || '').slice(0, 5), r: verweis(), u: quelle() });
})(window, document);
