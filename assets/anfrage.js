/* Wolgawurzeln: Anfrageformular. Geht über den eigenen Dienst direkt per Mail ein, nichts öffnet sich.
   Solange der Dienst nicht freigeschaltet ist, öffnet sich als Ersatz das Mailprogramm mit der fertigen Anfrage. */
(function (w, d) {
  'use strict';
  var D = w.WW_DIENST, rf = d.getElementById('reqform'), ordner = d.currentScript && d.currentScript.src ? d.currentScript.src.replace(/[^\/]+$/, '') : 'assets/'; if (!rf || !D) return;
  var T = w.WW_T || function (s) { return s; }, SPR = w.WW_SPRACHE || 'de';
  /* Herkunftsort: Vorschläge aus den deutschen Siedlungsgebieten. Liste und Logik (assets/orte.js) laden erst beim ersten Antippen. */
  (function () {
    var ort = rf.querySelector('input[name=ort]'), geholt = false; if (!ort || SPR !== 'de') return; /* Vorschläge gibt es bisher nur auf Deutsch */
    ort.addEventListener('focus', function () {
      if (geholt) return; geholt = true;
      var sk = d.createElement('script'); sk.src = ordner + 'orte.js'; sk.onload = function () { if (w.WW_ORTE) w.WW_ORTE.an(ort); }; d.head.appendChild(sk);
    });
  })();
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function quelle() {
    try {
      var u = new URLSearchParams(w.location.search), q = u.get('utm_source') || u.get('quelle');
      if (q) return q.slice(0, 40);
      var r = d.referrer ? new URL(d.referrer).hostname.replace(/^www\./, '') : '';
      return r && !/wolgawurzeln\.de$/.test(r) ? r.slice(0, 40) : '';
    } catch (e) { return ''; }
  }
  rf.addEventListener('input', function (e) { var er = rf.querySelector('.req-err'); if (er) er.hidden = true; if (e.target.removeAttribute) e.target.removeAttribute('aria-invalid'); });
  rf.addEventListener('submit', function (e) {
    e.preventDefault();
    var el = rf.elements, v = function (n) { return el[n] ? (el[n].value || '').trim() : ''; }, err = rf.querySelector('.req-err'), btn = rf.querySelector('.btn');
    var zeig = function (t) { err.innerHTML = t; err.hidden = !t; };
    var ok = true; zeig('');
    ['name', 'email', 'nachname'].forEach(function (n) {
      var gut = n === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v(n)) : v(n).length > 1;
      if (gut) el[n].removeAttribute('aria-invalid'); else { el[n].setAttribute('aria-invalid', 'true'); ok = false; }
    });
    if (!ok) { zeig(T('Bitte füllen Sie Name, Mailadresse und Nachname der Familie aus.')); rf.querySelector('[aria-invalid="true"]').focus(); return; }
    var a9 = el['einwilligung'];
    if (a9 && !a9.checked) { zeig(T('Bitte bestätigen Sie die Einwilligung zu Konfession und Herkunft, dann können Sie die Anfrage senden.')); a9.focus(); return; }
    var a9txt = a9 ? a9.parentNode.querySelector('span').firstChild.textContent.trim() : '';
    var text = T('Anfrage über wolgawurzeln.de') + '\n' + T('Name: ') + v('name') + '\n' + T('Nachname der Familie: ') + v('nachname') + (v('ort') ? '\n' + T('Herkunftsort oder Region: ') + v('ort') : '') + (v('tel') ? '\n' + T('Telefon: ') + v('tel') : '') + (v('anliegen') ? '\n' + T('Anliegen: ') + v('anliegen') : '') + (a9txt ? '\n\n' + a9txt : '');
    var perMail = 'mailto:edwin@wolgawurzeln.de?subject=' + encodeURIComponent(T('Anfrage: ') + v('nachname')) + '&body=' + encodeURIComponent(text);
    var pech = T('Das Senden hat gerade nicht geklappt. Bitte versuchen Sie es noch einmal oder {a}schreiben Sie uns per Mail{/a}.').replace('{a}', '<a href="' + perMail + '">').replace('{/a}', '</a>');
    if (!D.an()) { w.location.href = perMail; return; }
    if (rf.getAttribute('data-busy')) return;
    rf.setAttribute('data-busy', '1'); btn.disabled = true; btn.textContent = T('Wird gesendet');
    var ende = function () { rf.removeAttribute('data-busy'); btn.disabled = false; btn.textContent = T('Anfrage senden'); };
    D.token().then(function (tok) {
      return D.ruf('/anfrage', { body: { name: v('name'), email: v('email'), nachname: v('nachname'), ort: v('ort'), tel: v('tel'), anliegen: v('anliegen'), hp: v('firma'), einwilligung: a9 && a9.checked ? 'konfession-herkunft' : '', sprache: SPR, quelle: quelle(), page: w.location.pathname, ts: tok } });
    }).then(function (x) {
      if (x.j && x.j.ok) {
        rf.outerHTML = '<div class="req-ok" role="status" tabindex="-1"><svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect width="20" height="20" fill="#0F2342"/><path d="M5 10.4l3.2 3.2L15 6.8" fill="none" stroke="#FFFDF9" stroke-width="2" stroke-linecap="square"/></svg>' +
          '<h3>' + T('Ihre Anfrage ist eingegangen') + '</h3><p>' + T('Vielen Dank, {name}. Wolgawurzeln meldet sich in der Regel innerhalb eines Tages persönlich bei Ihnen, per Mail an {mail}.').replace('{name}', esc(v('name'))).replace('{mail}', '<b>' + esc(v('email')) + '</b>') + '</p>' +
          (x.j.nr ? '<p class="req-nr">' + T('Ihr Vorgang: ') + esc(x.j.nr) + '</p>' : '') + '</div>';
        var okBox = d.querySelector('.req-ok'); if (okBox) { try { okBox.focus({ preventScroll: true }); } catch (er) {} }
        return;
      }
      ende();
      var g = x.j && x.j.grund;
      zeig(g === 'mail' ? T('Bitte prüfen Sie die Mailadresse.') : g === 'limit' ? T('Heute sind von Ihnen schon mehrere Anfragen eingegangen. Wir melden uns.') : pech);
    }, function () { ende(); zeig(pech); });
  });
})(window, document);
