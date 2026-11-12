/* Wolgawurzeln: Verwaltung. Vorgänge bearbeiten, Kunden antworten, Dokumente einstellen, Anfragen und Ersteinschätzungen sichten. */
(function (w, d) {
  'use strict';
  var B = w.WW_BEREICH, e = B.e, root = d.getElementById('bereich');
  var TEXT = { titel: 'Verwaltung', text: 'Anmeldung nur mit der Adresse des Betreibers. Der Link kommt per Mail.' };
  var S = { daten: null, tab: 'vorgaenge', akt: 0, filter: 'offen', such: '', neu: null, meldung: '', loesch: 0, weg: false };
  var ART_DOK = { bericht: 'Bericht', rechnung: 'Rechnung', quelle: 'Fund aus der Recherche', unterlage: 'Unterlage vom Kunden' };

  function laden(behalte) {
    return B.ruf('/verwaltung/daten').then(function (r) {
      if (r.st === 401) return B.abgelaufen(root, TEXT);
      if (r.st === 403) { w.location.replace('konto.html'); return; }
      if (r.st !== 200 || !r.j) { root.innerHTML = B.kopf() + '<main class="k-login"><section class="k-card"><h1>Keine Verbindung</h1><p>Der Dienst ist gerade nicht erreichbar.</p></section></main>'; return; }
      S.daten = r.j; if (!behalte) S.meldung = ''; zeigen();
    });
  }
  var fertig = function (v) { return v.stufe >= v.stufen.length - 1; };
  var leer = function (v) { return v.std.b > 0 && v.std.v >= v.std.b && !fertig(v); };
  var wartet = function (v) { var n = v.nachrichten; return n.length && n[n.length - 1].von === 'kunde'; };
  function vorgang() { return S.daten.vorgaenge.filter(function (v) { return v.id === S.akt; })[0]; }
  function gefiltert() {
    var q = S.such.toLowerCase();
    return S.daten.vorgaenge.filter(function (v) {
      if (S.filter === 'offen' && fertig(v)) return false;
      if (S.filter === 'fertig' && !fertig(v)) return false;
      if (S.filter === 'wartet' && !wartet(v)) return false;
      return !q || (v.titel + ' ' + v.nr + ' ' + v.kunde.name + ' ' + v.kunde.email + ' ' + v.bestellnr).toLowerCase().indexOf(q) >= 0;
    });
  }
  function listeHTML() {
    var l = gefiltert();
    return l.length ? l.map(function (v) {
      return '<li><button type="button" data-vorgang="' + v.id + '"' + (v.id === S.akt ? ' aria-current="true"' : '') + '><b>' + e(v.titel) + '</b>' +
        '<span class="v-zeile"><span>' + e(v.nr) + '</span><span>' + e(v.kunde.name) + '</span></span>' +
        '<span class="v-zeile"><span class="k-tag' + (fertig(v) ? ' still' : '') + '">' + e(v.stufen[v.stufe]) + '</span>' + (wartet(v) ? '<span class="k-tag rot">Antwort offen</span>' : '') + (leer(v) ? '<span class="k-tag still">Stunden aufgebraucht</span>' : '') + '</span></button></li>';
    }).join('') : '<li class="k-leer">Kein Vorgang in dieser Ansicht.</li>';
  }
  function feld(id, lab, wert, typ, mehr) { return '<div class="v-feld"><label class="k-lab" for="' + id + '">' + lab + '</label><input class="k-in" id="' + id + '" type="' + (typ || 'text') + '" value="' + e(wert) + '"' + (mehr || '') + '></div>'; }
  function detail(v) {
    var k = v.kunde, stunden = v.art !== 'hb' && v.art !== 'fg';
    return '<button class="k-link v-zurueck" type="button" data-a="zurueck">Zurück zur Liste</button>' +
      '<section class="k-card"><p class="k-eye">Vorgang ' + e(v.nr) + (v.bestellnr ? ', Bestellung ' + e(v.bestellnr) : '') + ', ' + e(v.artName) + '</p><h2>' + e(k.name) + '</h2>' +
      '<p class="k-meta"><a href="mailto:' + e(k.email) + '">' + e(k.email) + '</a>' + (k.tel ? '<a href="tel:' + e(k.tel.replace(/[^0-9+]/g, '')) + '">' + e(k.tel) + '</a>' : '') + '</p>' +
      '<form class="k-form" data-f="vorgang">' + feld('v-titel', 'Titel, wie ihn der Kunde sieht', v.titel, 'text', ' maxlength="140"') +
      '<div class="v-paar"><div class="v-feld"><label class="k-lab" for="v-stufe">Stand</label><select class="k-in" id="v-stufe">' + v.stufen.map(function (s, i) { return '<option value="' + i + '"' + (i === v.stufe ? ' selected' : '') + '>' + (i + 1) + '. ' + e(s) + '</option>'; }).join('') + '</select></div>' +
      feld('v-geplant', 'Bericht geplant bis', v.geplant, 'date') + '</div>' +
      '<div class="v-feld"><label class="k-lab" for="v-aktuell">Woran gerade gearbeitet wird (sieht der Kunde)</label><textarea class="k-in" id="v-aktuell" rows="2" maxlength="600">' + e(v.aktuell) + '</textarea></div>' +
      (stunden ? '<div class="v-drei">' + feld('v-stdb', 'Stunden beauftragt', B.zahl(v.std.b), 'text', ' inputmode="decimal"') + feld('v-stdv', 'Stunden verbraucht', B.zahl(v.std.v), 'text', ' inputmode="decimal"') + feld('v-preis', 'Preis je weitere Stunde', v.std.preis, 'text', ' inputmode="numeric"') + '</div>' : '') +
      '<div class="v-feld"><label class="k-lab" for="v-intern">Interne Notiz (sieht nur die Verwaltung)</label><textarea class="k-in" id="v-intern" rows="6" maxlength="2000">' + e(v.intern) + '</textarea></div>' +
      '<label class="v-haken"><input type="checkbox" id="v-melden"> Kunden per Mail informieren, wenn sich der Stand ändert</label>' +
      '<p class="k-err" role="alert"></p><div class="v-knoepfe"><button class="k-btn" type="submit">Speichern</button><button class="k-btn line" type="button" data-a="einladen">Zugangslink senden</button></div>' +
      '<p class="k-status" role="status">' + e(S.meldung) + '</p></form></section>' +

      '<section class="k-card"><h2>Nachrichten</h2>' + (v.nachrichten.length ? v.nachrichten.map(function (n) {
        return '<div class="k-msg' + (n.von === 'kunde' ? '' : ' ich') + '"><small>' + B.zeit(n.zeit) + ', ' + (n.von === 'kunde' ? e(k.name) : 'Wolgawurzeln') + '</small><p>' + e(n.text) + '</p></div>';
      }).join('') : '<p class="k-leer">Noch keine Nachrichten.</p>') +
      '<form class="k-form" data-f="antwort"><label class="k-lab" for="v-text">Antwort an den Kunden</label><textarea class="k-in" id="v-text" rows="3" maxlength="2000"></textarea>' +
      '<label class="v-haken"><input type="checkbox" id="v-text-mail" checked> Zusätzlich per Mail zustellen</label><p class="k-err" role="alert"></p><button class="k-btn" type="submit">Antwort senden</button></form></section>' +

      '<section class="k-card"><h2>Dateien</h2>' + (v.dateien.length ? '<ul class="k-rows">' + v.dateien.map(function (f) {
        return '<li><span><b>' + e(f.name) + '</b><small>' + (ART_DOK[f.art] || 'Datei') + ', ' + B.datum(f.zeit) + ', ' + B.groesse(f.groesse) + '</small></span><span class="v-akt">' +
          '<button class="k-link" type="button" data-datei="' + f.id + '" data-name="' + e(f.name) + '">Herunterladen</button>' +
          '<button class="k-link rot" type="button" data-loesch="' + f.id + '">' + (S.loesch === f.id ? 'Wirklich löschen' : 'Löschen') + '</button></span></li>';
      }).join('') + '</ul>' : '<p class="k-leer">Noch keine Dateien.</p>') +
      (S.daten.speicher ? '<div class="v-paar v-hoch"><div class="v-feld"><label class="k-lab" for="v-art">Art des Dokuments</label><select class="k-in" id="v-art"><option value="bericht">Bericht</option><option value="rechnung">Rechnung</option>' + (stunden ? '<option value="quelle">Fund aus der Recherche</option>' : '') + '</select></div>' +
        '<label class="v-haken"><input type="checkbox" id="v-datei-mail" checked> Kunden per Mail informieren</label></div>' +
        '<div class="v-feld"><label class="k-lab" for="v-notiz">Anmerkung für den Kunden (freiwillig)</label><input class="k-in" id="v-notiz" type="text" maxlength="400" placeholder="Was das Dokument zeigt, in ein bis zwei Sätzen"></div>' +
        '<input type="file" id="v-datei" multiple accept="' + B.erlaubt + '" hidden><button class="k-btn line" type="button" data-a="datei">Dokument für den Kunden einstellen</button>' +
        '<p class="k-fine">PDF oder Bild, je Datei bis 15 MB. Keine Scans aus Archion einstellen, die Nutzungsbedingungen erlauben die Weitergabe nicht.' + (stunden ? ' Funde aus der Recherche: nur Geprüftes, am besten ein bis drei Stücke kurz bevor weitere Stunden freizugeben sind.' : '') + '</p>'
        : '<p class="k-note">Der Dateispeicher ist noch nicht eingerichtet. Solange gehen Dokumente per Mail an den Kunden.</p>') + '</section>' +
      '<p class="v-ende"><button class="k-link rot" type="button" data-a="weg">' + (S.weg ? 'Wirklich löschen, mit allen Nachrichten und Dateien' : 'Vorgang löschen') + '</button></p>';
  }
  function neuHTML() {
    var n = S.neu;
    return '<button class="k-link v-zurueck" type="button" data-a="neu-zu">Zurück zur Liste</button><section class="k-card"><h2>Neuer Vorgang</h2>' + (n.aus ? '<p class="k-fine">Angelegt aus ' + e(n.aus) + '.</p>' : '') +
      '<form class="k-form" data-f="neu"><div class="v-paar">' + feld('n-name', 'Name des Kunden', n.name || '', 'text', ' maxlength="120" required') + feld('n-mail', 'Mailadresse', n.email || '', 'email', ' required') + '</div>' +
      '<div class="v-paar">' + feld('n-tel', 'Telefon', n.tel || '') + '<div class="v-feld"><label class="k-lab" for="n-art">Leistung</label><select class="k-in" id="n-art">' +
      Object.keys(S.daten.arten).map(function (a) { return '<option value="' + a + '"' + (a === (n.art || 'ez') ? ' selected' : '') + '>' + e(S.daten.arten[a]) + '</option>'; }).join('') + '</select></div></div>' +
      feld('n-titel', 'Titel, wie ihn der Kunde sieht', n.titel || '', 'text', ' maxlength="140" placeholder="Einzelfallrecherche Familie Weber"') +
      '<div class="v-paar">' + feld('n-stdb', 'Stunden beauftragt', n.std_b == null ? '3' : n.std_b, 'text', ' inputmode="decimal"') + feld('n-preis', 'Preis je weitere Stunde', '50', 'text', ' inputmode="numeric"') + '</div>' +
      '<div class="v-feld"><label class="k-lab" for="n-intern">Interne Notiz</label><textarea class="k-in" id="n-intern" rows="4" maxlength="2000">' + e(n.intern || '') + '</textarea></div>' +
      '<label class="v-haken"><input type="checkbox" id="n-einladen"> Zugangslink gleich per Mail an den Kunden senden</label>' +
      '<p class="k-err" role="alert"></p><button class="k-btn" type="submit">Vorgang anlegen</button></form></section>';
  }
  function eingangHTML() {
    var an = S.tab === 'anfragen', l = an ? S.daten.anfragen : S.daten.einschaetzungen;
    if (!l.length) return '<section class="k-card"><p class="k-leer">Noch nichts eingegangen.</p></section>';
    return '<div class="v-eingang">' + l.map(function (x, i) {
      var namen = x.namen || ''; try { var j = JSON.parse(namen); if (j && j.map) namen = j.map(function (y) { return y.name || y; }).join(', '); } catch (er) {}
      return '<section class="k-card"><p class="k-eye">' + e(x.nr || '') + ', ' + B.zeit(x.zeit) + '</p><h2>' + e(an ? x.name : namen) + '</h2>' +
        '<p class="k-meta"><a href="mailto:' + e(x.email) + '">' + e(x.email) + '</a>' + (x.tel ? '<span>' + e(x.tel) + '</span>' : '') + '</p><dl class="v-dl">' +
        (an ? '<dt>Nachname</dt><dd>' + e(x.nachname) + '</dd>' + (x.ort ? '<dt>Ort</dt><dd>' + e(x.ort) + '</dd>' : '') + (x.anliegen ? '<dt>Anliegen</dt><dd>' + e(x.anliegen) + '</dd>' : '')
          : (x.region ? '<dt>Region</dt><dd>' + e(x.region) + '</dd>' : '') + (x.wunsch ? '<dt>Wunsch</dt><dd>' + e(S.daten.arten[x.wunsch] || x.wunsch) + '</dd>' : '') + (x.notiz ? '<dt>Notiz</dt><dd>' + e(x.notiz) + '</dd>' : '')) +
        '</dl><button class="k-btn line" type="button" data-anlegen="' + i + '">Als Vorgang anlegen</button></section>';
    }).join('') + '</div>';
  }
  function zeigen() {
    var D = S.daten, v = vorgang(), offen = D.vorgaenge.filter(function (x) { return !fertig(x); }).length, wart = D.vorgaenge.filter(wartet).length;
    var tab = function (id, name, n) { return '<button type="button" data-tab="' + id + '" aria-pressed="' + (S.tab === id) + '">' + name + ' <span>' + n + '</span></button>'; };
    var fil = function (id, name) { return '<button type="button" data-filter="' + id + '" aria-pressed="' + (S.filter === id) + '">' + name + '</button>'; };
    var rechts = S.neu ? neuHTML() : v ? detail(v) : '<section class="k-card v-leer"><p class="k-leer">Wählen Sie links einen Vorgang, oder legen Sie einen neuen an.</p></section>';
    root.innerHTML = B.kopf('<span class="k-ort">Verwaltung</span><button class="k-out" type="button" data-a="abmelden">Abmelden</button>') +
      '<div class="k-head"><div><div class="k-wahl">' + tab('vorgaenge', 'Vorgänge', offen) + tab('anfragen', 'Anfragen', D.anfragen.length) + tab('einschaetzungen', 'Ersteinschätzungen', D.einschaetzungen.length) + '</div></div></div>' +
      (S.tab === 'vorgaenge' ? '<main class="v-main' + (v || S.neu ? ' hat-detail' : '') + '"><div class="v-links"><button class="k-btn" type="button" data-a="neu">Neuer Vorgang</button>' +
        '<label class="k-lab" for="v-such">Suchen</label><input class="k-in" id="v-such" type="search" value="' + e(S.such) + '" placeholder="Name, Nummer, Mail">' +
        '<div class="k-wahl klein">' + fil('offen', 'Offen') + fil('wartet', 'Antwort offen' + (wart ? ' (' + wart + ')' : '')) + fil('fertig', 'Geliefert') + fil('alle', 'Alle') + '</div>' +
        '<ul class="v-liste">' + listeHTML() + '</ul></div><div class="v-rechts">' + rechts + '</div></main>'
        : '<main class="v-main eins">' + eingangHTML() + '</main>');
  }
  var wert = function (id) { var x = d.getElementById(id); return x ? x.value.trim() : ''; };

  root.addEventListener('input', function (ev) { if (ev.target.id === 'v-such') { S.such = ev.target.value; root.querySelector('.v-liste').innerHTML = listeHTML(); } });
  root.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-a],[data-datei],[data-vorgang],[data-tab],[data-filter],[data-loesch],[data-anlegen]'); if (!t) return;
    var ds = t.dataset;
    if (ds.datei) return B.dateiHolen(ds.datei, ds.name, t);
    if (ds.loesch) {
      var id = Number(ds.loesch);
      if (S.loesch !== id) { S.loesch = id; t.textContent = 'Wirklich löschen'; return; }
      S.loesch = 0; t.disabled = true; B.ruf('/verwaltung/datei-loeschen', { body: { id: id } }).then(function () { laden(); }); return;
    }
    S.loesch = 0; if (ds.a !== 'weg') S.weg = false;
    if (ds.vorgang) { S.akt = Number(ds.vorgang); S.neu = null; S.meldung = ''; zeigen(); if (w.innerWidth < 900) w.scrollTo(0, 0); return; }
    if (ds.tab) { S.tab = ds.tab; S.neu = null; zeigen(); return; }
    if (ds.filter) { S.filter = ds.filter; zeigen(); return; }
    if (ds.anlegen) {
      var an = S.tab === 'anfragen', x = (an ? S.daten.anfragen : S.daten.einschaetzungen)[Number(ds.anlegen)], namen = x.namen || '';
      try { var j = JSON.parse(namen); if (j && j.map) namen = j.map(function (y) { return y.name || y; }).join(', '); } catch (er) {}
      S.neu = an ? { aus: 'Anfrage ' + x.nr, name: x.name, email: x.email, tel: x.tel, art: 'ez', titel: 'Einzelfallrecherche ' + x.nachname, intern: 'Anfrage ' + x.nr + (x.ort ? '\nOrt: ' + x.ort : '') + (x.anliegen ? '\nAnliegen: ' + x.anliegen : '') }
        : { aus: 'Ersteinschätzung ' + x.nr, name: namen, email: x.email, art: S.daten.arten[x.wunsch] ? x.wunsch : 'ez', titel: (S.daten.arten[x.wunsch] || 'Einzelfallrecherche') + ' ' + namen, std_b: x.wunsch === 'hb' || x.wunsch === 'fg' ? '0' : '3',
          intern: 'Ersteinschätzung ' + x.nr + (x.region ? '\nRegion: ' + x.region : '') + (x.notiz ? '\nNotiz: ' + x.notiz : '') };
      S.tab = 'vorgaenge'; S.akt = 0; zeigen(); w.scrollTo(0, 0); return;
    }
    var a = ds.a;
    if (a === 'abmelden') B.abmelden();
    if (a === 'neu') { S.neu = {}; S.akt = 0; zeigen(); w.scrollTo(0, 0); }
    if (a === 'neu-zu' || a === 'zurueck') { S.neu = null; S.akt = 0; zeigen(); }
    if (a === 'datei') d.getElementById('v-datei').click();
    if (a === 'weg') {
      if (!S.weg) { S.weg = true; t.textContent = 'Wirklich löschen, mit allen Nachrichten und Dateien'; return; }
      t.disabled = true; B.ruf('/verwaltung/vorgang-loeschen', { body: { id: S.akt } }).then(function () { S.akt = 0; S.weg = false; laden(); });
    }
    if (a === 'einladen') {
      t.disabled = true;
      B.ruf('/verwaltung/einladen', { body: { vorgang: S.akt } }).then(function (r) { S.meldung = r.st === 200 ? 'Zugangslink ist an den Kunden unterwegs.' : 'Der Link konnte nicht gesendet werden.'; laden(true); });
    }
  });
  root.addEventListener('change', function (ev) {
    if (ev.target.id !== 'v-datei' || !ev.target.files.length) return;
    var v = vorgang(), knopf = root.querySelector('[data-a="datei"]'), alt = knopf.textContent; knopf.disabled = true;
    B.hochladen('/verwaltung/hochladen?vorgang=' + v.id + '&art=' + wert('v-art') + (wert('v-notiz') ? '&notiz=' + encodeURIComponent(wert('v-notiz')) : '') + (d.getElementById('v-datei-mail').checked ? '&melden=1' : ''), ev.target.files, function (t) { knopf.textContent = t; }, function (fehler) {
      knopf.textContent = alt; S.meldung = fehler || ''; laden(true);
    });
  });
  root.addEventListener('submit', function (ev) {
    var f = ev.target.closest('form[data-f]'); if (!f) return; ev.preventDefault();
    var err = f.querySelector('.k-err'), knopf = f.querySelector('button[type=submit]'), alt = knopf.textContent, art = f.dataset.f;
    function los() { err.textContent = ''; knopf.disabled = true; knopf.textContent = 'Wird gespeichert'; }
    function fehler(text) { knopf.disabled = false; knopf.textContent = alt; err.textContent = text || 'Das hat nicht geklappt. Bitte noch einmal versuchen.'; }
    if (art === 'vorgang') {
      var v = vorgang(); los();
      B.ruf('/verwaltung/vorgang', { body: { id: v.id, titel: wert('v-titel'), stufe: Number(wert('v-stufe')), geplant: wert('v-geplant'), aktuell: wert('v-aktuell'), intern: d.getElementById('v-intern').value,
        std_b: d.getElementById('v-stdb') ? wert('v-stdb') : v.std.b, std_v: d.getElementById('v-stdv') ? wert('v-stdv') : v.std.v, std_preis: d.getElementById('v-preis') ? wert('v-preis') : v.std.preis,
        melden: d.getElementById('v-melden').checked } }).then(function (r) { if (r.st === 200) { S.meldung = 'Gespeichert um ' + B.zeit(new Date().toISOString()).split(', ')[1] + '.'; laden(true); } else fehler(); });
    }
    if (art === 'antwort') {
      var text = wert('v-text'); if (text.length < 2) { err.textContent = 'Bitte zuerst die Antwort schreiben.'; return; }
      los(); B.ruf('/konto/nachricht', { body: { vorgang: S.akt, text: text, melden: d.getElementById('v-text-mail').checked } }).then(function (r) { if (r.st === 200) laden(); else fehler(); });
    }
    if (art === 'neu') {
      if (wert('n-name').length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(wert('n-mail'))) { err.textContent = 'Bitte Name und Mailadresse prüfen.'; return; }
      los(); B.ruf('/verwaltung/vorgang', { body: { name: wert('n-name'), email: wert('n-mail'), tel: wert('n-tel'), art: wert('n-art'), titel: wert('n-titel'), std_b: wert('n-stdb'), std_preis: wert('n-preis'),
        intern: d.getElementById('n-intern').value, einladen: d.getElementById('n-einladen').checked } }).then(function (r) {
        if (r.st === 200 && r.j) { S.neu = null; S.akt = r.j.id; S.filter = 'alle'; S.meldung = 'Vorgang ' + r.j.nr + ' ist angelegt.'; laden(true); } else fehler(r.j && r.j.grund === 'angaben' ? 'Bitte Name und Mailadresse prüfen.' : ''); });
    }
  });
  B.start(root, TEXT, function () { laden(); });
})(window, document);
