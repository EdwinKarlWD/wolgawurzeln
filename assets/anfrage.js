/* Wolgawurzeln: Anfrageformular. Geht über den eigenen Dienst direkt per Mail ein, nichts öffnet sich.
   Solange der Dienst nicht freigeschaltet ist, öffnet sich als Ersatz das Mailprogramm mit der fertigen Anfrage. */
(function (w, d) {
  'use strict';
  var D = w.WW_DIENST, rf = d.getElementById('reqform'); if (!rf || !D) return;
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
    if (!ok) { zeig('Bitte füllen Sie Name, Mailadresse und Nachname der Familie aus.'); rf.querySelector('[aria-invalid="true"]').focus(); return; }
    var text = 'Anfrage über wolgawurzeln.de\nName: ' + v('name') + '\nNachname der Familie: ' + v('nachname') + (v('ort') ? '\nHerkunftsort oder Region: ' + v('ort') : '') + (v('tel') ? '\nTelefon: ' + v('tel') : '') + (v('anliegen') ? '\nAnliegen: ' + v('anliegen') : '');
    var perMail = 'mailto:edwin@wolgawurzeln.de?subject=' + encodeURIComponent('Anfrage: ' + v('nachname')) + '&body=' + encodeURIComponent(text);
    var pech = 'Das Senden hat gerade nicht geklappt. Bitte versuchen Sie es noch einmal oder <a href="' + perMail + '">schreiben Sie uns per Mail</a>.';
    if (!D.an()) { w.location.href = perMail; return; }
    if (rf.getAttribute('data-busy')) return;
    rf.setAttribute('data-busy', '1'); btn.disabled = true; btn.textContent = 'Wird gesendet';
    var ende = function () { rf.removeAttribute('data-busy'); btn.disabled = false; btn.textContent = 'Anfrage senden'; };
    D.token().then(function (tok) {
      return D.ruf('/anfrage', { body: { name: v('name'), email: v('email'), nachname: v('nachname'), ort: v('ort'), tel: v('tel'), anliegen: v('anliegen'), hp: v('firma'), quelle: quelle(), page: w.location.pathname, ts: tok } });
    }).then(function (x) {
      if (x.j && x.j.ok) {
        rf.outerHTML = '<div class="req-ok" role="status" tabindex="-1"><svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect width="20" height="20" fill="#0F2342"/><path d="M5 10.4l3.2 3.2L15 6.8" fill="none" stroke="#FFFDF9" stroke-width="2" stroke-linecap="square"/></svg>' +
          '<h3>Ihre Anfrage ist eingegangen</h3><p>Vielen Dank, ' + esc(v('name')) + '. Wolgawurzeln meldet sich in der Regel innerhalb eines Tages persönlich bei Ihnen, per Mail an <b>' + esc(v('email')) + '</b>.</p>' +
          (x.j.nr ? '<p class="req-nr">Ihr Vorgang: ' + esc(x.j.nr) + '</p>' : '') + '</div>';
        var okBox = d.querySelector('.req-ok'); if (okBox) { try { okBox.focus({ preventScroll: true }); } catch (er) {} }
        return;
      }
      ende();
      var g = x.j && x.j.grund;
      zeig(g === 'mail' ? 'Bitte prüfen Sie die Mailadresse.' : g === 'limit' ? 'Heute sind von Ihnen schon mehrere Anfragen eingegangen. Wir melden uns.' : pech);
    }, function () { ende(); zeig(pech); });
  });
})(window, document);
