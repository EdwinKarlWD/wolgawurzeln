/* Wolgawurzeln: gemeinsame Teile für Kundenbereich und Verwaltung (Anmeldung per Maillink, Hilfen). */
(function (w, d) {
  'use strict';
  var D = w.WW_DIENST, KEY = 'ww_sitzung', B = w.WW_BEREICH = {};
  var lager = { get: function () { try { return w.localStorage.getItem(KEY) || ''; } catch (e) { return ''; } },
    set: function (v) { try { v ? w.localStorage.setItem(KEY, v) : w.localStorage.removeItem(KEY); } catch (e) {} } };
  B.sitzung = lager.get();
  B.e = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  B.datum = function (iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return m ? m[3] + '.' + m[2] + '.' + m[1] : ''; };
  B.zeit = function (iso) {
    var t = new Date(iso); if (isNaN(t)) return '';
    var z = function (n) { return (n < 10 ? '0' : '') + n; };
    return z(t.getDate()) + '.' + z(t.getMonth() + 1) + '.' + t.getFullYear() + ', ' + z(t.getHours()) + ':' + z(t.getMinutes()) + ' Uhr';
  };
  B.groesse = function (n) { return n >= 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; };
  B.zahl = function (n) { return String(Math.round(n * 100) / 100).replace('.', ','); };
  B.std = function (n) { return B.zahl(n) + (n === 1 ? ' Stunde' : ' Stunden'); };
  B.ruf = function (pfad, o) {
    o = o || {}; o.sitzung = B.sitzung;
    return D.ruf(pfad, o).then(function (r) { if (r.st === 401) { B.sitzung = ''; lager.set(''); } return r; });
  };
  var TYP = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic', heif: 'image/heif' };
  B.typ = function (f) { var x = (/\.([a-z0-9]+)$/i.exec(f.name) || [])[1]; return TYP[(x || '').toLowerCase()] && (!f.type || f.type === 'application/octet-stream') ? TYP[x.toLowerCase()] : f.type; };
  B.erlaubt = 'application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif,.pdf,.jpg,.jpeg,.png,.webp,.heic';
  B.UPLOAD_FEHLER = { 415: 'Dieses Dateiformat können wir nicht annehmen. Möglich sind PDF und Fotos (JPG, PNG, HEIC).', 413: 'Die Datei ist größer als 15 MB. Bitte verkleinern oder teilen Sie sie.',
    429: 'Zu diesem Vorgang liegen schon sehr viele Dateien vor. Bitte schreiben Sie uns kurz.', 503: 'Das Hochladen ist noch nicht freigeschaltet. Bitte senden Sie die Unterlagen per Mail.' };
  // Mehrere Dateien nacheinander hochladen. meld(text) zeigt den Fortschritt, fertig(fehlerText) am Ende.
  B.hochladen = function (pfad, dateien, meld, fertig) {
    var liste = [].slice.call(dateien), i = 0, fehler = '';
    (function weiter() {
      if (i >= liste.length) return fertig(fehler);
      var f = liste[i++]; meld('Lade ' + i + ' von ' + liste.length + ' hoch: ' + f.name);
      B.ruf(pfad + (pfad.indexOf('?') < 0 ? '?' : '&') + 'name=' + encodeURIComponent(f.name), { datei: f, typ: B.typ(f) || 'application/octet-stream' }).then(function (r) {
        if (r.st !== 200) fehler = f.name + ': ' + (B.UPLOAD_FEHLER[r.st] || 'Das Hochladen hat nicht geklappt. Bitte versuchen Sie es noch einmal.');
        weiter();
      });
    })();
  };
  B.dateiHolen = function (id, name, knopf) {
    var alt = knopf && knopf.textContent; if (knopf) { knopf.disabled = true; knopf.textContent = 'Lädt'; }
    B.ruf('/konto/datei?id=' + id, { blob: true }).then(function (r) {
      if (knopf) { knopf.disabled = false; knopf.textContent = alt; }
      if (!r.blob) { if (knopf) knopf.textContent = 'Nicht verfügbar'; return; }
      var u = URL.createObjectURL(r.blob), a = d.createElement('a'); a.href = u; a.download = name; d.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(u); }, 60000);
    });
  };
  B.kopf = function (rechts) {
    return '<div class="k-top"><a class="k-brand" href="/"><img src="img/wappen-120.png" alt="" width="27" height="32"><span>Wolgawurzeln</span></a>' + (rechts || '') + '</div>';
  };
  B.abmelden = function () { B.ruf('/konto/abmelden', { m: 'POST' }).then(function () { B.sitzung = ''; lager.set(''); w.location.reload(); }); };

  // Anmeldemaske. o: { titel, text, hinweis }
  B.maske = function (root, o) {
    root.innerHTML = B.kopf() + '<main class="k-login"><section class="k-card"><h1>' + o.titel + '</h1>' + (o.hinweis ? '<p class="k-note">' + o.hinweis + '</p>' : '') + '<p>' + o.text + '</p>' +
      '<form novalidate><label class="k-lab" for="k-mail">Ihre Mailadresse</label><input class="k-in" id="k-mail" type="email" autocomplete="email" inputmode="email" required>' +
      '<p class="k-err" role="alert"></p><button class="k-btn" type="submit">Anmeldelink senden</button></form>' +
      '<p class="k-fine">Der Link kommt per Mail und gilt 30 Minuten. Ein Passwort brauchen Sie nicht.</p></section></main>';
    var f = root.querySelector('form'), err = root.querySelector('.k-err'), feld = root.querySelector('#k-mail'), knopf = f.querySelector('button');
    f.addEventListener('submit', function (ev) {
      ev.preventDefault(); var mail = feld.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) { err.textContent = 'Bitte prüfen Sie die Mailadresse.'; feld.focus(); return; }
      err.textContent = ''; knopf.disabled = true; knopf.textContent = 'Wird gesendet';
      D.token().then(function (ts) { return D.ruf('/konto/anmelden', { body: { email: mail, ts: ts } }); }, function () { return { st: 403 }; }).then(function (r) {
        if (r.st === 200) {
          root.querySelector('.k-card').innerHTML = '<h1>Bitte sehen Sie in Ihr Postfach</h1><p>Wenn zu <b>' + B.e(mail) + '</b> ein Zugang besteht, ist der Anmeldelink in wenigen Minuten bei Ihnen. Er gilt 30 Minuten.</p>' +
            '<p class="k-fine">Nichts angekommen? Schauen Sie bitte auch im Spamordner nach, oder schreiben Sie uns an <a href="mailto:edwin@wolgawurzeln.de">edwin@wolgawurzeln.de</a>.</p>' +
            '<button class="k-btn line" type="button">Andere Adresse eingeben</button>';
          root.querySelector('.k-btn').addEventListener('click', function () { B.maske(root, o); });
          if (r.j && r.j.dev_link) root.querySelector('.k-card').insertAdjacentHTML('beforeend', '<p class="k-fine"><a id="k-dev" href="' + B.e(r.j.dev_link.replace(/^https:\/\/wolgawurzeln\.de/, '')) + '">Testbetrieb: Link öffnen</a></p>');
          return;
        }
        knopf.disabled = false; knopf.textContent = 'Anmeldelink senden';
        err.innerHTML = r.st === 0 ? 'Keine Verbindung. Bitte versuchen Sie es gleich noch einmal.' : 'Die Anmeldung ist gerade nicht möglich. Schreiben Sie uns bitte an <a href="mailto:edwin@wolgawurzeln.de">edwin@wolgawurzeln.de</a>.';
      });
    });
  };

  // Start: Link aus der Mail einlösen, sonst vorhandene Sitzung nutzen, sonst Maske zeigen.
  B.start = function (root, o, bereit) {
    var m = /[#&]t=([A-Za-z0-9]{20,64})/.exec(w.location.hash);
    if (m) {
      try { w.history.replaceState(null, '', w.location.pathname); } catch (e) {}
      root.innerHTML = B.kopf() + '<main class="k-login"><section class="k-card"><p>Sie werden angemeldet.</p></section></main>';
      D.ruf('/konto/sitzung', { body: { t: m[1] } }).then(function (r) {
        if (r.st === 200 && r.j && r.j.sitzung) { B.sitzung = r.j.sitzung; lager.set(B.sitzung); bereit(); }
        else if (B.sitzung) bereit();
        else B.maske(root, { titel: o.titel, text: o.text, hinweis: 'Dieser Link ist abgelaufen oder wurde schon benutzt. Fordern Sie bitte einen neuen an.' });
      });
      return;
    }
    if (B.sitzung) bereit(); else B.maske(root, o);
  };
  w.addEventListener('hashchange', function () { if (/[#&]t=[A-Za-z0-9]{20,64}/.test(w.location.hash)) w.location.reload(); });
  B.abgelaufen = function (root, o) { B.maske(root, { titel: o.titel, text: o.text, hinweis: 'Ihre Anmeldung ist abgelaufen. Fordern Sie bitte einen neuen Link an.' }); };
})(window, document);
