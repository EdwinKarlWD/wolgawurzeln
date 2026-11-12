/* Wolgawurzeln: Kundenbereich. Stand der Recherche, Nachrichten, Stundenkonto, Dokumente, eigene Unterlagen. */
(function (w, d) {
  'use strict';
  var B = w.WW_BEREICH, e = B.e, root = d.getElementById('bereich');
  var TEXT = { titel: 'Kundenbereich', text: 'Geben Sie die Mailadresse ein, mit der Sie bei uns bestellt oder angefragt haben. Wir schicken Ihnen einen Link zur Anmeldung.' };
  var S = { daten: null, akt: 0, geladen: 0, entwurf: '', frei: false, meldung: '' };
  var ART_DOK = { bericht: 'Bericht', rechnung: 'Rechnung', quelle: 'Quelle' };

  function laden() {
    return B.ruf('/konto/daten').then(function (r) {
      if (r.st === 401) return B.abgelaufen(root, TEXT);
      if (r.st !== 200 || !r.j) { root.innerHTML = B.kopf() + '<main class="k-login"><section class="k-card"><h1>Keine Verbindung</h1><p>Der Kundenbereich ist gerade nicht erreichbar. Bitte laden Sie die Seite in ein paar Minuten neu.</p></section></main>'; return; }
      if (r.j.admin) { w.location.replace('verwaltung.html'); return; }
      S.daten = r.j; S.geladen = Date.now();
      if (!S.daten.vorgaenge.some(function (v) { return v.id === S.akt; })) S.akt = S.daten.vorgaenge.length ? S.daten.vorgaenge[0].id : 0;
      zeigen();
    });
  }
  function vorgang() { return S.daten.vorgaenge.filter(function (v) { return v.id === S.akt; })[0]; }

  function verlauf(v) {
    var fertig = v.stufe >= v.stufen.length - 1;
    return '<section class="k-card"><h2>Stand der Recherche</h2><ol class="k-tl">' + v.stufen.map(function (name, i) {
      var cls = i < v.stufe || fertig ? 'done' : i === v.stufe ? 'on' : '', klein = '';
      if (v.daten[i]) klein = (cls === 'on' && i > 0 ? 'seit ' : '') + B.datum(v.daten[i]);
      else if (i === v.stufen.length - 1 && v.geplant) klein = 'geplant bis ' + B.datum(v.geplant);
      return '<li class="' + cls + '"><span class="k-dot"></span><span><b>' + e(name) + '</b>' + (klein ? '<small>' + klein + '</small>' : '') +
        (i === v.stufe && v.aktuell ? '<span class="akt">' + e(v.aktuell) + '</span>' : '') + '</span></li>';
    }).join('') + '</ol></section>';
  }
  function nachrichten(v) {
    return '<section class="k-card"><h2>Nachrichten</h2>' + (v.nachrichten.length ? v.nachrichten.map(function (n) {
      return '<div class="k-msg' + (n.von === 'kunde' ? ' ich' : '') + '"><small>' + B.zeit(n.zeit) + ', ' + (n.von === 'kunde' ? 'Sie' : 'Wolgawurzeln') + '</small><p>' + e(n.text) + '</p></div>';
    }).join('') : '<p class="k-leer">Noch keine Nachrichten. Wenn Sie etwas ergänzen oder fragen möchten, schreiben Sie uns hier.</p>') +
      '<form class="k-form" data-f="nachricht"><label class="k-lab" for="k-text">Ihre Nachricht</label><textarea class="k-in" id="k-text" rows="3" maxlength="2000">' + e(S.entwurf) + '</textarea>' +
      '<p class="k-err" role="alert"></p><button class="k-btn" type="submit">Nachricht senden</button></form></section>';
  }
  function stunden(v) {
    if (!v.std.b) return '';
    var offen = Math.max(v.std.b - v.std.v, 0), anteil = Math.min(100, Math.round(v.std.v / v.std.b * 1000) / 10);
    return '<section class="k-card"><h2>Stundenkonto</h2><div class="k-bar" role="img" aria-label="' + B.std(v.std.v) + ' von ' + B.zahl(v.std.b) + ' verbraucht"><i style="width:' + anteil + '%"></i></div>' +
      '<p class="k-zahl"><span><b>' + B.std(v.std.v) + '</b> verbraucht</span><span><b>' + B.std(offen) + '</b> offen</span></p>' +
      (S.frei ? '<form class="k-form k-frei" data-f="freigabe"><label class="k-lab" for="k-std">Wie viele weitere Stunden geben Sie frei?</label>' +
        '<select class="k-in" id="k-std">' + [1, 2, 3, 4, 5].map(function (n) { return '<option value="' + n + '">' + B.std(n) + ', ' + n * v.std.preis + ' €</option>'; }).join('') + '</select>' +
        '<p class="k-err" role="alert"></p><button class="k-btn" type="submit">Zahlungspflichtig freigeben</button><button class="k-btn line" type="button" data-a="frei-zu">Abbrechen</button>' +
        '<p class="k-fine">Mit der Freigabe beauftragen Sie die gewählten Stunden zu je ' + v.std.preis + ' €. Die Rechnung erhalten Sie mit der Lieferung.</p></form>'
        : '<button class="k-btn line" type="button" data-a="frei-auf">Weitere Stunden freigeben</button><p class="k-fine">' + v.std.preis + ' € je weitere Stunde. Gearbeitet wird erst nach Ihrer Freigabe.</p>') + '</section>';
  }
  function zeile(f, beschr) { return '<li><span><b>' + e(f.name) + '</b><small>' + beschr + '</small>' + (f.notiz ? '<span class="k-anm">' + e(f.notiz) + '</span>' : '') + '</span><button class="k-link" type="button" data-datei="' + f.id + '" data-name="' + e(f.name) + '">Herunterladen</button></li>'; }
  function dokumente(v) {
    var von = v.dateien.filter(function (f) { return f.von !== 'kunde' && f.art !== 'quelle'; }), funde = v.dateien.filter(function (f) { return f.von !== 'kunde' && f.art === 'quelle'; }), eigen = v.dateien.filter(function (f) { return f.von === 'kunde'; });
    return '<section class="k-card"><h2>Dokumente</h2>' + (von.length ? '<ul class="k-rows">' + von.map(function (f) { return zeile(f, (ART_DOK[f.art] || 'Dokument') + ' vom ' + B.datum(f.zeit) + ', ' + B.groesse(f.groesse)); }).join('') + '</ul>'
      : '<p class="k-leer">Hier finden Sie Ihren Bericht und Ihre Rechnung, sobald sie fertig sind.</p>') +
      (funde.length ? '<h3 class="k-sub">Funde aus der Recherche</h3><ul class="k-rows">' + funde.map(function (f) { return zeile(f, 'eingestellt am ' + B.datum(f.zeit) + ', ' + B.groesse(f.groesse)); }).join('') + '</ul>' +
        '<p class="k-fine">Zwischenstand aus der laufenden Arbeit. Die Einordnung aller Funde steht im Bericht.</p>' : '') +
      '<h3 class="k-sub">Ihre Unterlagen</h3>' + (eigen.length ? '<ul class="k-rows">' + eigen.map(function (f) { return zeile(f, 'hochgeladen am ' + B.datum(f.zeit) + ', ' + B.groesse(f.groesse)); }).join('') + '</ul>'
      : '<p class="k-leer">Urkunden, Fotos, alte Briefe: Alles, was Sie zur Familie haben, hilft bei der Recherche.</p>') +
      (S.daten.speicher === false ? '<p class="k-fine">Unterlagen senden Sie uns bitte per Mail an <a href="mailto:edwin@wolgawurzeln.de">edwin@wolgawurzeln.de</a>.</p>'
        : '<input type="file" id="k-datei" multiple accept="' + B.erlaubt + '" hidden><button class="k-btn line" type="button" data-a="datei">Unterlagen hochladen</button>' +
        '<p class="k-status" role="status">' + e(S.meldung) + '</p><p class="k-fine">PDF oder Foto, je Datei bis 15 MB. Nur wir sehen Ihre Unterlagen.</p>') + '</section>';
  }
  function partner() {
    return '<section class="k-card"><h2>Ihr Ansprechpartner</h2><div class="k-pers"><span aria-hidden="true">EK</span><span><b>Edwin Karl</b><small>Ihr Ansprechpartner bei Wolgawurzeln</small></span></div>' +
      '<p class="k-fine">Antwort in der Regel innerhalb eines Werktags, auf Deutsch, Russisch oder Englisch.</p></section>';
  }
  function zeigen() {
    var alle = S.daten.vorgaenge, v = vorgang(), oben = B.kopf('<button class="k-out" type="button" data-a="abmelden">Abmelden</button>');
    if (!v) { root.innerHTML = oben + '<main class="k-login"><section class="k-card"><h1>Noch kein Vorgang</h1><p>Zu Ihrer Adresse liegt noch kein Vorgang vor. Schreiben Sie uns gern an <a href="mailto:edwin@wolgawurzeln.de">edwin@wolgawurzeln.de</a>.</p></section></main>'; return; }
    root.innerHTML = oben + '<div class="k-head"><div><p class="k-eye">' + (alle.length > 1 ? 'Ihre Vorgänge' : 'Ihr Vorgang') + '</p>' +
      (alle.length > 1 ? '<div class="k-wahl">' + alle.map(function (x) { return '<button type="button" data-vorgang="' + x.id + '"' + (x.id === v.id ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>' + e(x.titel) + '</button>'; }).join('') + '</div>' : '') +
      '<h1>' + e(v.titel) + '</h1><p class="k-meta"><span class="k-tag">' + e(v.stufen[v.stufe]) + '</span><span>Vorgang ' + e(v.nr) + '</span>' +
      (v.geplant && v.stufe < v.stufen.length - 1 ? '<span>Bericht geplant bis ' + B.datum(v.geplant) + '</span>' : '') + '</p></div></div>' +
      '<main class="k-main"><div class="k-col">' + verlauf(v) + nachrichten(v) + '</div><div class="k-col">' + stunden(v) + dokumente(v) + partner() + '</div></main>';
  }
  function halten() { var t = d.getElementById('k-text'); if (t) S.entwurf = t.value; }

  root.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-a],[data-datei],[data-vorgang]'); if (!t) return;
    if (t.dataset.datei) return B.dateiHolen(t.dataset.datei, t.dataset.name, t);
    halten();
    if (t.dataset.vorgang) { S.akt = Number(t.dataset.vorgang); S.frei = false; S.meldung = ''; S.entwurf = ''; zeigen(); w.scrollTo(0, 0); return; }
    var a = t.dataset.a;
    if (a === 'abmelden') B.abmelden();
    if (a === 'frei-auf' || a === 'frei-zu') { S.frei = a === 'frei-auf'; zeigen(); var z = d.getElementById('k-std'); if (z) z.focus(); }
    if (a === 'datei') d.getElementById('k-datei').click();
  });
  root.addEventListener('change', function (ev) {
    if (ev.target.id !== 'k-datei' || !ev.target.files.length) return;
    var v = vorgang(), status = root.querySelector('.k-status'), knopf = root.querySelector('[data-a="datei"]'); knopf.disabled = true; halten();
    B.hochladen('/konto/hochladen?vorgang=' + v.id, ev.target.files, function (t) { status.textContent = t; }, function (fehler) {
      S.meldung = fehler || 'Hochgeladen. Vielen Dank, wir sehen uns die Unterlagen an.';
      if (B.sitzung) laden(); else B.abgelaufen(root, TEXT);
    });
  });
  root.addEventListener('submit', function (ev) {
    var f = ev.target.closest('form[data-f]'); if (!f) return; ev.preventDefault();
    var v = vorgang(), err = f.querySelector('.k-err'), knopf = f.querySelector('button[type=submit]'), alt = knopf.textContent;
    function fehler(r) { knopf.disabled = false; knopf.textContent = alt; err.textContent = r.st === 0 ? 'Keine Verbindung. Bitte versuchen Sie es gleich noch einmal.' : 'Das hat nicht geklappt. Bitte versuchen Sie es noch einmal.'; }
    if (f.dataset.f === 'nachricht') {
      var text = d.getElementById('k-text').value.trim();
      if (text.length < 2) { err.textContent = 'Bitte schreiben Sie zuerst Ihre Nachricht.'; return; }
      knopf.disabled = true; knopf.textContent = 'Wird gesendet';
      B.ruf('/konto/nachricht', { body: { vorgang: v.id, text: text } }).then(function (r) { if (r.st === 200) { S.entwurf = ''; laden(); } else if (r.st === 401) B.abgelaufen(root, TEXT); else fehler(r); });
    }
    if (f.dataset.f === 'freigabe') {
      knopf.disabled = true; knopf.textContent = 'Wird gesendet'; halten();
      B.ruf('/konto/freigabe', { body: { vorgang: v.id, stunden: Number(d.getElementById('k-std').value) } }).then(function (r) { if (r.st === 200) { S.frei = false; laden(); } else if (r.st === 401) B.abgelaufen(root, TEXT); else fehler(r); });
    }
  });
  d.addEventListener('visibilitychange', function () {
    if (d.visibilityState !== 'visible' || !S.daten || !B.sitzung || Date.now() - S.geladen < 60000) return;
    var t = d.getElementById('k-text'); if ((t && t.value.trim()) || S.frei) return;
    laden();
  });
  B.start(root, TEXT, laden);
})(window, document);
