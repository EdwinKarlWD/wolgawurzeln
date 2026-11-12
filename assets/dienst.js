/* Wolgawurzeln: Verbindung zum eigenen Dienst (Formulare, Bestellung, Kundenbereich).
   key = Site Key der unsichtbaren Prüfung gegen automatische Einsendungen. Nur hier eintragen, alle Seiten lesen ihn von hier. */
(function (w, d) {
  'use strict';
  var D = w.WW_DIENST = { api: 'https://wolgawurzeln-api.edwin3222.workers.dev', key: '' }, tsP;
  // Der Dienst ist nutzbar, sobald der Site Key eingetragen ist (oder im Testbetrieb auf dem eigenen Rechner).
  D.an = function () { return !!D.key || /^http:\/\/(localhost|127\.0\.0\.1)[:\/]/.test(D.api); };
  function laden() {
    if (tsP) return tsP;
    tsP = new Promise(function (ok, no) {
      if (w.turnstile) return ok(w.turnstile);
      var sc = d.createElement('script'); sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; sc.async = true;
      sc.onload = function () { ok(w.turnstile); }; sc.onerror = function () { tsP = null; no(new Error('ts')); };
      d.head.appendChild(sc);
    });
    return tsP;
  }
  // Liefert das Prüfzeichen für eine Einsendung. Ohne Site Key leer, der Dienst lehnt dann ab.
  D.token = function () {
    if (!D.key) return Promise.resolve('');
    return laden().then(function (ts) {
      return new Promise(function (ok, no) {
        var c = d.getElementById('ww-ts'); if (c) { try { ts.remove('#ww-ts'); } catch (e) {} c.remove(); }
        c = d.createElement('div'); c.id = 'ww-ts'; c.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:400'; d.body.appendChild(c);
        ts.render(c, { sitekey: D.key, appearance: 'interaction-only', language: d.documentElement.lang || 'de', callback: ok, 'error-callback': function () { no(new Error('ts')); }, 'timeout-callback': function () { no(new Error('ts')); } });
      });
    });
  };
  // Aufruf des Dienstes. Antwort immer als { st, j }, auch bei Netzfehler (st 0).
  D.ruf = function (pfad, o) {
    o = o || {};
    var h = {}, body;
    if (o.sitzung) h.Authorization = 'Bearer ' + o.sitzung;
    if (o.datei) { body = o.datei; h['Content-Type'] = o.typ; } else if (o.body) { body = JSON.stringify(o.body); h['Content-Type'] = 'application/json'; }
    return fetch(D.api + pfad, { method: o.m || (body ? 'POST' : 'GET'), headers: h, body: body, cache: 'no-store' }).then(function (r) {
      if (o.blob && r.ok) return r.blob().then(function (b) { return { st: r.status, blob: b }; });
      return r.json().catch(function () { return null; }).then(function (j) { return { st: r.status, j: j }; });
    }).catch(function () { return { st: 0, j: null }; });
  };
})(window, document);
