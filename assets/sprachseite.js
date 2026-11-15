/* Wolgawurzeln: Einstieg auf der englischen und russischen Seite.
   Solange die Ersteinschätzung dort nicht automatisch läuft, führt das Namensfeld ins Anfrageformular.
   Der Name wird übernommen, gesendet wird erst im Formular. */
(function (w, d) {
  'use strict';
  var form = d.querySelector('.fz-form'), feld = d.getElementById('fz-name');
  if (!form || !feld) return;
  w.WW_FZ = true; /* für den Wächter in fehler.js: der Einstieg ist geladen */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    w.WW_FZ_SUB = (w.WW_FZ_SUB || 0) + 1;
    var name = (feld.value || '').replace(/\s+/g, ' ').trim();
    if (name.length < 2) { feld.focus(); return; }
    var ziel = d.getElementById('anfrage'), rf = d.getElementById('reqform');
    if (!ziel || !rf) return;
    var nach = rf.elements['nachname'], erst = rf.elements['name'];
    if (nach && !nach.value.trim()) nach.value = name;
    /* am Handy ist das Formular zugeklappt, hier wird es gebraucht */
    ziel.classList.add('an-auf');
    var mehr = d.querySelector('.an-mehr'); if (mehr) mehr.setAttribute('aria-expanded', 'true');
    feld.blur();
    var ruhig = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(function () {
      var handy = d.documentElement.classList.contains('m2');
      var y = (handy ? rf : ziel).getBoundingClientRect().top + (w.pageYOffset || d.documentElement.scrollTop) - (handy ? 84 : 64);
      try { w.scrollTo({ top: y, behavior: ruhig ? 'auto' : 'smooth' }); } catch (er) { w.scrollTo(0, y); }
      if (erst) setTimeout(function () { try { erst.focus({ preventScroll: true }); } catch (er) { erst.focus(); } }, ruhig ? 0 : 700);
    }, 60);
  });
})(window, document);
