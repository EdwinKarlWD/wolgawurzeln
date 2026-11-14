/* Wolgawurzeln: kostenlose Ersteinschätzung auf der Titelseite (Nachname, Region, PDF per Mail).
   Ablauf in Ansichten: Region (mit erstem Befund), drei kurze Fragen zur Familie, Zusendung, fertig.
   Am Handy als ganzer Bildschirm über der Seite.
   Der erste Befund läuft im Browser. Gesendet wird nur die anonyme Statistik (npLog, keine IP, keine Cookies)
   und, wenn jemand die Erste Einschätzung als PDF anfordert, die Anfrage mit Mailadresse an den Worker.
   Die Anfrage per WhatsApp oder Mail trägt eine Kennung (z. B. HB1): Paket plus Stufe 1 sehr gute, 2 gute, 3 offene Voraussetzungen. */
(function () {
  'use strict';
  var d = document, w = window;
  var box = d.getElementById('fz');
  if (!box) return;
  var form = box.querySelector('form'), inp = d.getElementById('fz-name'), out = d.getElementById('fz-out');
  var COL = [];
  try { COL = JSON.parse(d.getElementById('fz-data').textContent); } catch (e) { COL = []; }
  var WA = '491735412807';

  /* Häufige Namen: deutsche Schreibweise und übliche Schreibweisen in russischen Akten */
  var DICT = [
    ['Schmidt', 'Шмидт', 'Шмит'], ['Schmitt', 'Шмитт', 'Шмит'], ['Müller', 'Миллер', 'Мюллер'], ['Miller', 'Миллер'], ['Schneider', 'Шнейдер', 'Шнайдер'],
    ['Fischer', 'Фишер'], ['Weber', 'Вебер'], ['Meier', 'Мейер', 'Майер'], ['Meyer', 'Мейер', 'Майер'], ['Maier', 'Майер', 'Мейер'], ['Mayer', 'Майер', 'Мейер'],
    ['Wagner', 'Вагнер'], ['Becker', 'Беккер', 'Бекер'], ['Schulz', 'Шульц'], ['Schultz', 'Шульц'], ['Hoffmann', 'Гофман', 'Хоффман'], ['Hofmann', 'Гофман', 'Хофман'],
    ['Schäfer', 'Шефер', 'Шеффер'], ['Koch', 'Кох'], ['Bauer', 'Бауэр', 'Бауер'], ['Richter', 'Рихтер'], ['Klein', 'Клейн', 'Кляйн'], ['Wolf', 'Вольф'],
    ['Schröder', 'Шрёдер', 'Шредер'], ['Neumann', 'Нейман', 'Нойман'], ['Schwarz', 'Шварц'], ['Zimmermann', 'Циммерман'], ['Braun', 'Браун'], ['Krüger', 'Крюгер', 'Кригер'],
    ['Hartmann', 'Гартман', 'Хартман'], ['Lange', 'Ланге'], ['Werner', 'Вернер'], ['Krause', 'Краузе'], ['Lehmann', 'Леман'], ['Kaiser', 'Кайзер', 'Кейзер'],
    ['Fuchs', 'Фукс'], ['Hermann', 'Герман', 'Херман'], ['König', 'Кёниг', 'Кениг'], ['Walter', 'Вальтер'], ['Keller', 'Келлер'], ['Frank', 'Франк'],
    ['Berger', 'Бергер'], ['Roth', 'Рот'], ['Beck', 'Бек'], ['Lorenz', 'Лоренц'], ['Baumann', 'Бауман'], ['Albrecht', 'Альбрехт'], ['Schuster', 'Шустер'],
    ['Ludwig', 'Людвиг'], ['Böhm', 'Бём', 'Бем'], ['Winter', 'Винтер'], ['Kraus', 'Краус'], ['Schumacher', 'Шумахер'], ['Krämer', 'Кремер'], ['Vogt', 'Фогт'],
    ['Stein', 'Штейн', 'Штайн'], ['Jäger', 'Егер', 'Йегер'], ['Sommer', 'Зоммер'], ['Groß', 'Гросс', 'Грос'], ['Seidel', 'Зейдель', 'Зайдель'], ['Heinrich', 'Генрих'],
    ['Brandt', 'Брандт'], ['Haas', 'Гаас', 'Хаас'], ['Schreiber', 'Шрейбер', 'Шрайбер'], ['Graf', 'Граф'], ['Dietrich', 'Дитрих'], ['Ziegler', 'Циглер'],
    ['Kuhn', 'Кун'], ['Kühn', 'Кюн'], ['Engel', 'Энгель'], ['Horn', 'Горн', 'Хорн'], ['Busch', 'Буш'], ['Bergmann', 'Бергман'], ['Vogel', 'Фогель'],
    ['Sauer', 'Зауэр', 'Зауер'], ['Pfeifer', 'Пфейфер', 'Пфайфер'], ['Pfeiffer', 'Пфейфер', 'Пфайфер'], ['Heckmann', 'Гекман', 'Хекман'], ['Herzog', 'Герцог'],
    ['Kraft', 'Крафт'], ['Kolb', 'Кольб'], ['Schilling', 'Шиллинг'], ['Huck', 'Гук', 'Хук'], ['Stephan', 'Штефан', 'Стефан'], ['Hummel', 'Гуммель', 'Хуммель'],
    ['Kind', 'Кинд'], ['Schwab', 'Шваб'], ['Wittmann', 'Витман'], ['Ritter', 'Риттер'], ['Bender', 'Бендер'], ['Dietz', 'Дитц'], ['Eckhardt', 'Экгардт', 'Эккардт'],
    ['Fritzler', 'Фрицлер'], ['Gerber', 'Гербер'], ['Gerlach', 'Герлах'], ['Göbel', 'Гёбель', 'Гебель'], ['Hahn', 'Ган', 'Хан'], ['Heinz', 'Гейнц', 'Хайнц'],
    ['Kessler', 'Кесслер'], ['Knaub', 'Кнауб'], ['Krieger', 'Кригер'], ['Lang', 'Ланг'], ['Mai', 'Май'], ['Martin', 'Мартин'], ['Merkel', 'Меркель'],
    ['Reichert', 'Рейхерт', 'Райхерт'], ['Schmal', 'Шмаль'], ['Schreiner', 'Шрейнер', 'Шрайнер'], ['Seibel', 'Зейбель', 'Зайбель'], ['Spomer', 'Шпомер'],
    ['Stoll', 'Штоль'], ['Weigandt', 'Вейгандт', 'Вайгандт'], ['Magel', 'Магель'], ['Flach', 'Флах'], ['Nussbaum', 'Нуссбаум'], ['Wenz', 'Венц'],
    ['Henning', 'Геннинг', 'Хеннинг'], ['Friesen', 'Фризен'], ['Penner', 'Пеннер'], ['Klassen', 'Классен'], ['Janzen', 'Янцен'], ['Thiessen', 'Тиссен'],
    ['Wiebe', 'Вибе'], ['Enns', 'Энс', 'Эннс'], ['Neufeld', 'Нойфельд', 'Нейфельд'], ['Dyck', 'Дик', 'Дюк'], ['Dück', 'Дюк', 'Дик'], ['Rempel', 'Ремпель'],
    ['Froese', 'Фрезе'], ['Löwen', 'Лёвен', 'Левен'], ['Martens', 'Мартенс'], ['Epp', 'Эпп'], ['Harder', 'Гардер', 'Хардер'], ['Warkentin', 'Варкентин'],
    ['Reimer', 'Реймер', 'Раймер'], ['Unruh', 'Унру'], ['Toews', 'Тевс'], ['Funk', 'Функ'], ['Hiebert', 'Гиберт'], ['Kröker', 'Крекер'], ['Sawatzky', 'Саватский'],
    ['Wiens', 'Винс'], ['Hildebrandt', 'Гильдебрандт'], ['Siemens', 'Зименс'], ['Quiring', 'Квиринг'], ['Ratzlaff', 'Ратцлаф'], ['Regier', 'Регир'],
    ['Goertzen', 'Гёрцен', 'Герцен'], ['Klippenstein', 'Клиппенштейн'], ['Letkemann', 'Леткеман'], ['Voth', 'Фот'], ['Willms', 'Вильмс'], ['Wedel', 'Ведель'],
    ['Pankratz', 'Панкрац'], ['Sudermann', 'Зудерман'], ['Kehler', 'Келер'], ['Lepp', 'Лепп'], ['Driedger', 'Дридгер'], ['Fast', 'Фаст']
  ];
  var MENNO = 'friesen penner klassen claassen janzen jantzen thiessen tiessen wiebe enns neufeld dyck duck dueck rempel froese frose loewen lowen martens epp harder warkentin reimer unruh unrau toews tews funk hiebert kroeker kroker sawatzky wiens hildebrandt siemens pauls quiring ratzlaff regier heinrichs goertzen gortzen klippenstein letkemann teichrob voth willms bergen driedger fast kehler lepp pankratz sudermann wedel wall nickel dirksen braul';
  var MENNOSET = {}; MENNO.split(' ').forEach(function (k) { MENNOSET[k] = 1; });

  function cyr(s) { return /[А-Яа-яЁё]/.test(s); }
  function fold(s) {
    return (s || '').toLowerCase().replace(/ß/g, 'ss').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u')
      .replace(/([^aeiouq])ae/g, '$1a').replace(/([^aeiouq])oe/g, '$1o').replace(/([^aeiouq])ue/g, '$1u').replace(/^ae/, 'a').replace(/^oe/, 'o').replace(/^ue/, 'u')
      .replace(/[^a-z]/g, '');
  }
  function cfold(s) { return (s || '').toLowerCase().replace(/ё/g, 'е').replace(/[^а-я]/g, ''); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var BYDE = {}, BYRU = {};
  DICT.forEach(function (e) {
    var k = fold(e[0]); (BYDE[k] = BYDE[k] || []).push(e);
    e.slice(1).forEach(function (r) { var q = cfold(r); (BYRU[q] = BYRU[q] || []).push(e[0]); });
  });

  /* Deutsch nach Kyrillisch, nach den Gewohnheiten sowjetischer Akten */
  function deToRu(name) {
    var s = name.toLowerCase().replace(/ß/g, 'ss')
      .replace(/([^aeiouq]|^)ae/g, '$1ä').replace(/([^aeiouq]|^)oe/g, '$1ö').replace(/([^aeiouq]|^)ue/g, '$1ü');
    var V = 'aeiouyäöü', A = [], B = [], i = 0, n = s.length;
    function isV(c) { return !!c && V.indexOf(c) > -1; }
    function isL(c) { return !!c && /[a-zäöü]/.test(c); }
    function put(a, b) { A.push(a); B.push(b === undefined ? a : b); }
    while (i < n) {
      var c = s[i], r2 = s.substr(i, 2), r3 = s.substr(i, 3), r4 = s.substr(i, 4), prev = s[i - 1], start = i === 0 || !isL(prev), end2 = !isL(s[i + 2]);
      if (r4 === 'tsch') { put('ч'); i += 4; continue; }
      if (r3 === 'sch') { put('ш'); i += 3; continue; }
      if (r3 === 'chs') { put('кс'); i += 3; continue; }
      if (start && (r2 === 'sp' || r2 === 'st')) { put(r2 === 'sp' ? 'шп' : 'шт'); i += 2; continue; }
      if (r2 === 'ch') { put('х'); i += 2; continue; }
      if (r2 === 'ck') { put(isV(s[i + 2]) ? 'кк' : 'к'); i += 2; continue; }
      if (r2 === 'tz') { put('ц'); i += 2; continue; }
      if (r2 === 'dt') { put('дт'); i += 2; continue; }
      if (r2 === 'th') { put('т'); i += 2; continue; }
      if (r2 === 'ph') { put('ф'); i += 2; continue; }
      if (r2 === 'pf') { put('пф'); i += 2; continue; }
      if (r2 === 'qu') { put('кв'); i += 2; continue; }
      if (r2 === 'ei' || r2 === 'ey') { put(start ? 'эй' : 'ей', start ? 'ай' : 'ай'); i += 2; continue; }
      if (r2 === 'ai' || r2 === 'ay') { put(start ? 'ай' : 'ай', start ? 'эй' : 'ей'); i += 2; continue; }
      if (r2 === 'eu' || r2 === 'äu') { put(start ? 'эй' : 'ей', start ? 'ой' : 'ой'); i += 2; continue; }
      if (r2 === 'ie') { put('и'); i += 2; continue; }
      if (r2 === 'au') { put('ау'); i += 2; continue; }
      if (c === 'j' && isV(s[i + 1])) { var m = { a: 'я', 'ä': 'е', e: 'е', o: 'йо', u: 'ю', 'ü': 'ю', i: 'йи', y: 'йи', 'ö': 'йо' }[s[i + 1]]; put(m); i += 2; continue; }
      if (r2 === 'ss') { var dip = /(ei|ai|au|eu|ey|ay)$/.test(s.slice(0, i)); put(end2 ? (dip ? 'с' : 'сс') : 'сс', end2 ? 'с' : 'сс'); i += 2; continue; }
      if (r2 === 'll') { put(end2 ? 'ль' : 'лл'); i += 2; continue; }
      if (r2 === 'nn') { put(end2 ? 'н' : 'нн'); i += 2; continue; }
      if (r2 === 'ff') { put('ф'); i += 2; continue; }
      if (/^(mm|tt|pp|rr|dd|gg|bb|kk)$/.test(r2)) { var dm = { m: 'мм', t: 'тт', p: 'пп', r: 'рр', d: 'дд', g: 'гг', b: 'бб', k: 'кк' }[c]; put(dm); i += 2; continue; }
      if (c === 'x') { put('кс'); i++; continue; }
      if (c === 'z') { put('ц'); i++; continue; }
      if (c === 'c') { put('eiäy'.indexOf(s[i + 1]) > -1 ? 'ц' : 'к'); i++; continue; }
      if (c === 'h') { if (start) put('г', 'х'); i++; continue; }
      if (c === 's') { put(((start || isV(prev)) && isV(s[i + 1])) ? 'з' : 'с'); i++; continue; }
      if (c === 'l') { put(isV(s[i + 1]) ? 'л' : 'ль'); i++; continue; }
      if (c === 'e') { put(start || isV(prev) ? 'э' : 'е'); i++; continue; }
      if (c === 'ä') { put(start ? 'э' : 'е'); i++; continue; }
      if (c === 'ö') { put(start ? 'э' : 'е', start ? 'э' : 'ё'); i++; continue; }
      if (c === 'ü') { put('ю', start ? 'ю' : 'и'); i++; continue; }
      var M = { a: 'а', b: 'б', d: 'д', f: 'ф', g: 'г', i: 'и', j: 'й', k: 'к', m: 'м', n: 'н', o: 'о', p: 'п', r: 'р', t: 'т', u: 'у', v: 'ф', w: 'в', y: 'и' };
      put(M[c] !== undefined ? M[c] : c); i++;
    }
    return uniq([cap(A.join('')), cap(B.join(''))]);
  }

  /* Kyrillisch nach Deutsch: wörtliche und eingedeutschte Lesart */
  function ruToDe(name) {
    var s = cfold(name), V = 'аеёиоуыэюя';
    function isV(c) { return !!c && V.indexOf(c) > -1; }
    function build(mode) {
      var o = '', i = 0, n = s.length;
      while (i < n) {
        var c = s[i], r2 = s.substr(i, 2), r3 = s.substr(i, 3), prev = s[i - 1], nx = s[i + 1], start = i === 0;
        if (start && (r2 === 'шт' || r2 === 'шп')) { o += r2 === 'шт' ? 'st' : 'sp'; i += 2; continue; }
        if (r3 === 'ман' && i + 3 === n) { o += 'mann'; i += 3; continue; }
        if (r2 === 'кк') { o += 'ck'; i += 2; continue; }
        if (r2 === 'кс') { o += (mode > 0 && i + 2 === n && isV(prev)) ? 'chs' : 'ks'; i += 2; continue; }
        if (r2 === 'кв') { o += 'qu'; i += 2; continue; }
        if (r2 === 'дт') { o += 'dt'; i += 2; continue; }
        if (r2 === 'ей') { o += mode > 1 ? 'eu' : 'ei'; i += 2; continue; }
        if (r2 === 'ай') { o += mode > 0 ? 'ei' : 'ai'; i += 2; continue; }
        if (r2 === 'ой') { o += 'eu'; i += 2; continue; }
        if (r2 === 'яй') { o += 'ei'; i += 2; continue; }
        if (r2 === 'сс') { o += 'ss'; i += 2; continue; }
        if (r2 === 'ль') { o += 'l'; i += 2; continue; }
        switch (c) {
          case 'щ': o += 'schtsch'; break;
          case 'ш': o += 'sch'; break;
          case 'ч': o += 'tsch'; break;
          case 'ж': o += 'sch'; break;
          case 'ц': o += 'z'; break;
          case 'х': o += start ? 'h' : 'ch'; break;
          case 'г': o += (start && mode > 0 && isV(nx)) ? 'h' : 'g'; break;
          case 'е': o += start ? (mode > 0 ? 'jä' : 'je') : ((mode > 0 && prev === 'ш') ? 'ä' : 'e'); break;
          case 'ё': o += 'ö'; break;
          case 'э': o += 'e'; break;
          case 'ю': o += (start || isV(prev)) ? 'ju' : 'ü'; break;
          case 'я': o += 'ja'; break;
          case 'ы': o += 'y'; break;
          case 'и': o += 'i'; break;
          case 'й': o += 'i'; break;
          case 'у': o += 'u'; break;
          case 'о': o += 'o'; break;
          case 'а': o += 'a'; break;
          case 'з': o += 's'; break;
          case 'с': o += 's'; break;
          case 'в': o += 'w'; break;
          case 'ф': o += (start && mode > 0 && s.length > 4 && /^фо/.test(s)) ? 'v' : 'f'; break;
          case 'к': o += (mode > 0 && isV(prev) && prev !== 'и' && (!nx || !isV(nx))) ? 'ck' : 'k'; break;
          case 'ь': case 'ъ': break;
          default: o += ({ б: 'b', д: 'd', л: 'l', м: 'm', н: 'n', п: 'p', р: 'r', т: 't' })[c] || '';
        }
        i++;
      }
      return cap(o);
    }
    return uniq([build(1), build(0)]).slice(0, 2);
  }
  function uniq(a) { var seen = {}, r = []; a.forEach(function (x) { var k = (x || '').toLowerCase(); if (x && !seen[k]) { seen[k] = 1; r.push(x); } }); return r; }

  var RU_LAT = /(ov|ow|ev|ew|off|eff|ski|sky|skij|skiy|skaja|zki|zky|enko|chuk|tschuk|czuk|vich|witsch|owitsch|evich|ewitsch|shvili|dze|jan|yan|ova|owa|eva|ewa|ina|yna|in|yn)$/;
  var RU_CYR = /(ов|ев|ёв|ин|ын|ский|цкий|ской|ская|цкая|ова|ева|ёва|ина|ына|енко|ко|ук|юк|чук|щук|ич|вич|ян|янц|дзе|швили)$/;

  function colonyByName(keys) {
    var hits = [];
    COL.forEach(function (c) {
      var names = [c[0]].concat(c[0].indexOf(' ') > -1 ? [] : []);
      if (keys.some(function (k) { return fold(c[0]) === k; })) hits.push(c);
    });
    return hits;
  }

  var REG = {
    wolga: { t: 'An der Wolga', src: 'Für die Wolgakolonien sind die Listen der Ansiedlung von 1764 bis 1767 erhalten, dazu Revisionslisten bis 1857 und Kirchenbücher. Die Erstansiedlerliste nennt oft den Herkunftsort in Deutschland.', u: 'wissen/quellen-der-wolgakolonien.html', l: 'Die Quellen der Wolgakolonien' },
    meer: { t: 'Am Schwarzen Meer', src: 'Für die Kolonien am Schwarzen Meer, in Bessarabien und auf der Krim gibt es evangelische Kirchenbuchduplikate von 1833 bis 1885 und für viele Familien die Einbürgerungsakten der Einwandererzentralstelle aus den Jahren 1940 bis 1945 im Bundesarchiv.', u: 'wissen/schwarzes-meer.html', l: 'Die Schwarzmeerdeutschen' },
    wolhynien: { t: 'In Wolhynien', src: 'Für Wolhynien gibt es die Kirchenbücher der lutherischen Kirchspiele und für die Umgesiedelten von 1939 bis 1944 die Einbürgerungsakten der Einwandererzentralstelle im Bundesarchiv.', u: 'wissen/wolhynien.html', l: 'Die Wolhyniendeutschen' },
    kaukasus: { t: 'Im Kaukasus', src: 'Für die Kolonien im Kaukasus sind Kirchenbücher der lutherischen Gemeinden überliefert, dazu Akten zur Deportation im Herbst 1941.', u: 'wissen/kaukasus.html', l: 'Die Kaukasiendeutschen' },
    unklar: { t: 'Weiß ich nicht', src: 'Die Herkunftsregion lässt sich oft über Unterlagen aus der Zeit nach 1941 eingrenzen: Akten der Sondersiedlung und der Arbeitsarmee nennen meist den Geburtsort, ebenso Aussiedlerpapiere und Geburtsurkunden der Großeltern.', u: 'wissen/deportation-1941.html', l: 'Die Deportation von 1941' }
  };

  /* Was die Familie wissen möchte, passend zu den Paketen */
  var WANT = {
    hb: { t: 'Aus welcher Kolonie stammt mein Name?', n: 'Herkunftsbericht', price: '49 €', d: 'Kolonie, Herkunft in Deutschland und der Weg der Familie bis heute, jede Angabe mit Quelle. Als PDF in 3 bis 5 Tagen.', order: true },
    fg: { t: 'Woher stammen alle Linien unserer Familie?', n: 'Familiengeschichte', price: '89 €', d: 'Recherche zu bis zu vier Nachnamen: Kolonie und Herkunft jeder Linie, mit Karte und Zeitleiste. Als PDF in 5 bis 8 Tagen.', order: true },
    ez: { t: 'Wer genau waren meine Vorfahren?', n: 'Einzelfallrecherche', price: '149 € für 3 Stunden', d: 'Gezielte Suche nach Ihren Vorfahren mit Namen und Daten in Kirchenbüchern, Listen und Archivakten. Weitere Stunden nur nach Ihrer Freigabe. Vorab erhalten Sie ein Angebot.', order: false, cta: 'Anfrage per WhatsApp' },
    ar: { t: 'Wie komme ich an Dokumente aus Russland?', n: 'Archivanfrage', price: 'Festpreis nach Sichtung', d: 'Für Kirchenbucheinträge und Akten, die nicht online liegen, über Kontaktpersonen vor Ort. Sie erhalten eine Kopie des Originals mit Fundstelle, den Festpreis erfahren Sie vorab. Bezahlt wird die Anfrage, nicht der Fund.', order: false, cta: 'Anfrage per WhatsApp' },
    tr: { t: 'Was steht in einem alten Dokument?', n: 'Transkription', price: 'Preis nach Sichtung', d: 'Alte deutsche Schrift und russische Handschrift, übertragen und erklärt. Schicken Sie ein Foto des Dokuments, Sie erhalten vorab ein Angebot.', order: false, cta: 'Dokument per WhatsApp schicken' }
  };
  var KNOW = { jahre: 'Geburtsjahre der Großeltern', ort: 'Geburtsort oder Dorf', doku: 'Urkunden oder Aussiedlerpapiere', fotos: 'Alte Fotos oder Briefe' };

  /* Fragenkatalog nach der Wahl der Region: drei kurze Fragen, jede lässt sich überspringen.
     Das Ergebnis nennt bewusst keine Kolonie und bei unbekannter Region kein Siedlungsgebiet, das ist der Herkunftsbericht.
     Es sagt nur, ob und womit sich die Herkunft klären lässt. Die Antworten gehen mit der Anfrage an Wolgawurzeln. */
  var LAND = { kz: ['Kasachstan', ''], ru: ['Russland', 'zum Beispiel Sibirien, Altai oder Ural'], ma: ['Mittelasien', 'Kirgisistan, Usbekistan, Tadschikistan'], ua: ['Ukraine', ''], de: ['Schon seit dem Krieg in Deutschland', 'Umsiedlung oder Flucht bis etwa 1950'], sonst: ['Anderes Land', 'oder nicht bekannt'] };
  var KONF = { ev: ['Evangelisch', 'lutherisch oder reformiert'], kath: ['Katholisch', ''], menn: ['Mennonitisch', ''], unklar: ['Weiß ich nicht', ''] };
  var KNOW_B = { ort: 'Ein Geburtsort oder Dorfname' };
  var KNOW_T = { jahre: '', ort: 'auch ungefähr oder nur vom Erzählen', doku: 'Geburtsurkunde, Registrierschein, Arbeitsbuch', fotos: '' };
  var FRAGEN = [
    { k: 'land', t: 'Aus welchem Land kam die Familie nach Deutschland?', h: 'Das zeigt, in welchen Akten die Familie nach 1941 zu finden ist.', o: LAND },
    { k: 'know', t: 'Was ist in der Familie bekannt oder vorhanden?', h: 'Mehrere Antworten sind möglich.', multi: true },
    { k: 'konf', t: 'Welcher Konfession gehörten die Vorfahren an?', h: 'Die meisten Kolonien hatten nur eine Konfession. Das grenzt die Suche ein.', o: KONF }
  ];
  function frAktiv() { return !!st.reg && !!st.fr; }
  /* Was eine Antwort bedeutet: Jede Antwort bekommt ihren eigenen Satz, wo es sinnvoll ist auch je Kombination mit der Region.
     Nur allgemeine Geschichte und Quellenlage, nie eine Kolonie und bei unbekannter Region kein Gebiet. */
  function deutLand() {
    var l = st.fr.land, r = st.reg;
    if (!l || l === 'sonst') return '';
    if (l === 'de') return r === 'wolga' ? 'Für Familien von der Wolga ist das ungewöhnlich, denn die Wolgadeutschen wurden 1941 nach Osten deportiert. Wichtig ist dann, wann die Familie die Wolga verlassen hat.'
      : (r === 'meer' || r === 'wolhynien') ? 'Viele Familien aus dieser Region kamen im Krieg durch die Umsiedlung nach Deutschland. Dazu liegen oft Einbürgerungsakten im Bundesarchiv, die Herkunftsort und Verwandte nennen.'
      : 'Für Familien, die im Krieg nach Deutschland kamen, liegen oft Einbürgerungsakten im Bundesarchiv. Sie nennen Herkunftsort und Verwandte.';
    if (l === 'ma') return 'Nach Mittelasien zogen viele deutsche Familien erst nach 1956, als die Sondersiedlung aufgehoben wurde.';
    if (l === 'ua') return r === 'unklar' ? 'In der Ukraine lagen mehrere deutsche Siedlungsgebiete.' : '';
    if (r === 'wolga') return 'Die Wolgadeutschen wurden im September 1941 nach Sibirien und Kasachstan deportiert. Die Akten dazu nennen meist das Heimatdorf.';
    if (r === 'kaukasus') return 'Die Deutschen im Kaukasus wurden im Herbst 1941 deportiert, die meisten nach Kasachstan.';
    if (r === 'meer') return 'Vom Schwarzen Meer kamen deutsche Familien auf zwei Wegen dorthin: durch die Deportation von 1941 oder durch die Rückführung nach 1945.';
    if (r === 'wolhynien') return 'Aus Wolhynien kamen deutsche Familien auf mehreren Wegen dorthin: durch die Vertreibung von 1915, die Umsiedlung von 1936 oder die Rückführung nach 1945.';
    return l === 'kz' ? 'Nach Kasachstan kamen deutsche Familien auf zwei Wegen: als Siedler um 1900 oder durch die Deportation von 1941.'
      : 'Nach Sibirien und in den Ural kamen deutsche Familien als Siedler um 1900, die meisten aber ab 1941 durch Deportation und Arbeitsarmee.';
  }
  function deutKonf() {
    var c = st.fr.konf, r = st.reg;
    if (!c || c === 'unklar') return '';
    if (c === 'menn') return r === 'wolga' ? 'An der Wolga gab es nur wenige mennonitische Siedlungen. Das grenzt die Suche stark ein.'
      : r === 'meer' ? 'Die mennonitischen Kolonien am Schwarzen Meer gehören zu den am besten dokumentierten überhaupt.'
      : 'Für mennonitische Familien ist die Quellenlage besonders gut.';
    if (r === 'wolga') return c === 'kath' ? 'Die katholischen Kolonien waren an der Wolga in der Minderheit. Das grenzt die Suche deutlich ein.'
      : 'Die meisten Wolgakolonien waren evangelisch. Zusammen mit einem Ortsnamen oder Geburtsjahren hilft die Konfession trotzdem weiter.';
    if (r === 'unklar') return 'Die meisten Kolonien hatten nur eine Konfession. Das grenzt die möglichen Orte ein.';
    return 'Die Kolonien waren meist nach Konfession getrennt. Das grenzt die möglichen Orte ein.';
  }
  function deutKnow() {
    var k = st.know, o = k.ort, u = k.doku, j = k.jahre, f = k.fotos, t;
    if (o && u && j) t = 'Ortsname, Geburtsjahre und Urkunden zusammen sind der beste Ausgangspunkt. Damit lässt sich die Familie gezielt suchen.';
    else if (o && u) t = 'Der Ortsname zeigt, wo zu suchen ist, und die Urkunden liefern Namen und Daten dazu.';
    else if (o && j) t = 'Mit Ortsname und Geburtsjahren lässt sich die Familie gezielt in Kirchenbüchern und Listen suchen.';
    else if (u && j) t = 'In den Urkunden steht meist auch der Geburtsort. Zusammen mit den Geburtsjahren ist das ein guter Einstieg.';
    else if (o) t = 'Ein Ortsname ist der wichtigste Anhaltspunkt, auch wenn er nur ungefähr bekannt ist.';
    else if (u) t = 'In Geburtsurkunden und Aussiedlerpapieren steht meist der Geburtsort. Das ist oft der Schlüssel.';
    else if (j) t = 'Mit Geburtsjahren lassen sich Familien gleichen Namens in den Listen unterscheiden.';
    else return f ? 'Auf alten Fotos und Briefen stehen oft Ortsnamen, Stempel oder Daten. Ein Blick auf die Rückseite lohnt sich.' : '';
    return t + (f ? ' Auf alten Fotos und Briefen stehen oft weitere Orte und Daten.' : '');
  }
  /* Antworten als kurze Zeilen [Bezeichnung, Antwort, Deutung]: für die Karte, die Anfrage und den Bestelldialog */
  function frAngaben() {
    var t = [], k = knownList();
    if (frAktiv()) {
      if (st.fr.land === 'de') t.push(['In Deutschland', 'seit dem Krieg oder kurz danach', deutLand()]);
      else if (st.fr.land && st.fr.land !== 'sonst') t.push(['Ausreise aus', LAND[st.fr.land][0], deutLand()]);
      if (st.fr.konf && st.fr.konf !== 'unklar') t.push(['Konfession der Vorfahren', KONF[st.fr.konf][0].toLowerCase(), deutKonf()]);
    }
    if (st.know.ort && st.ort) t.push(['Herkunftsort', st.ort, '']);
    if (k.length) t.push(['Bekannt oder vorhanden', k.map(function (x) { return KNOW[x]; }).join(', '), frAktiv() ? deutKnow() : '']);
    return t;
  }

  var st = { name: '', names: [], reg: '', want: '', know: {}, pdf: {}, step: '', fr: null, ort: '' };
  /* Mehrere Nachnamen: einzeln einordnen. Vornamen, Vatersnamen und Namenszusätze fallen weg. */
  var FIRST = {}; ('anna maria marie olga irina natalia natalja natalie elena helena jelena tatjana tatiana svetlana swetlana ludmila ljudmila galina valentina lidia lydia nina ekaterina katharina katharine katarina katja lena emma amalia elisabeth elizabeth margarete margaretha frieda erna lilli lilia larissa alla wera vera sofia sophie julia oksana inna tamara raisa rosa luise louise alexandra '
    + 'alexander andreas andrej andrei viktor victor wladimir vladimir sergej sergei sergey nikolai nikolaj peter pjotr johann johannes heinrich jakob jacob david eduard waldemar woldemar alexej aleksej juri jurij michael michail dmitri dmitrij igor oleg artur arthur edwin paul georg friedrich konrad conrad eugen jewgeni evgeni ivan iwan iwanowitsch robert rudolf otto emil wilhelm karl carl franz walter valeri valerij anatoli gennadi leonid boris pavel pawel stepan konstantin roman denis maxim maksim ilja ilya anton '
    + 'анна мария ольга ирина наталья наталия елена татьяна светлана людмила галина валентина лидия нина екатерина эмма амалия елизавета лариса алла вера софия юлия оксана инна тамара раиса роза '
    + 'александр андрей виктор владимир сергей николай пётр петр иван яков давид эдуард вальдемар алексей юрий михаил дмитрий игорь олег артур евгений генрих фридрих иоганн роберт рудольф отто эмиль вильгельм карл франц валерий анатолий геннадий леонид борис павел степан константин роман денис максим илья антон').split(' ').forEach(function (k) { FIRST[k] = 1; });
  function splitNames(v) {
    var parts = v.split(/[\s,;\/&+]+/).filter(function (p) { return p && !/^(und|and|и|oder|или|von|van|vom|de|der|zu)$/i.test(p); });
    parts = parts.filter(function (p) { return !/(ович|евич|овна|евна|ична|owitsch|ewitsch|owna|ewna)$/i.test(p) || parts.length === 1; });
    var fam = parts.filter(function (p) { return !FIRST[p.toLowerCase().replace(/ё/g, 'е')]; });
    if (!fam.length) fam = parts.slice(-1);
    return fam.length ? uniq(fam) : [v];
  }
  /* Anonyme Statistik der Namensprüfung: nur die Eingaben, keine IP, keine Cookies */
  var NP_API = 'https://wolgawurzeln-api.edwin3222.workers.dev/np', SID = Math.random().toString(36).slice(2, 10);
  function npLog(art) {
    try {
      if (!st.name || !/wolgawurzeln\.de$/.test(location.hostname)) return;
      var body = JSON.stringify({ art: art, name: st.name, reg: st.reg, want: st.want, sid: SID, page: location.pathname });
      if (navigator.sendBeacon) navigator.sendBeacon(NP_API, new Blob([body], { type: 'text/plain' }));
      else fetch(NP_API, { method: 'POST', body: body, keepalive: true, headers: { 'Content-Type': 'text/plain' } });
    } catch (e) {}
  }
  /* Ersteinschätzung als PDF per Mail. Ohne Turnstile Schlüssel steht an der Stelle die Anfrage per WhatsApp oder Mail. */
  var WD = w.WW_DIENST || {}, EZ_API = (WD.api || 'https://wolgawurzeln-api.edwin3222.workers.dev') + '/einschaetzung', TS_KEY = WD.key || ''; /* Site Key steht in assets/dienst.js */
  /* Texte, die den Versand per Mail versprechen, erst zeigen, wenn der Dienst eingerichtet ist */
  if (TS_KEY) [].forEach.call(d.querySelectorAll('[data-mit-dienst]'), function (el) { el.textContent = el.getAttribute('data-mit-dienst'); });
  function quelle() {
    try {
      var u = new URLSearchParams(location.search), q = u.get('utm_source') || u.get('quelle');
      if (q) return q.slice(0, 40);
      var r = d.referrer ? new URL(d.referrer).hostname.replace(/^www\./, '') : '';
      return r && !/wolgawurzeln\.de$/.test(r) ? r.slice(0, 40) : '';
    } catch (e) { return ''; }
  }
  function pdfNamen(a) {
    return (a.all || [a]).filter(function (x) { return x.kind !== 'bad'; }).slice(0, 4).map(function (x) {
      return { name: x.name, art: (x.russian || x.kind === 'ru') ? 'ru' : (x.kind === 'unklar' ? 'unklar' : 'de'), dict: !!x.dict, formen: (x.russian || x.kind === 'ru') ? [] : (x.forms || []).slice(0, 2) };
    });
  }
  var tsP = null;
  function loadTS() {
    if (tsP) return tsP;
    tsP = new Promise(function (ok, no) {
      var sc = d.createElement('script'); sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; sc.async = true;
      sc.onload = function () { ok(w.turnstile); }; sc.onerror = function () { tsP = null; no(new Error('ts')); };
      d.head.appendChild(sc);
    });
    return tsP;
  }
  function tsToken() {
    return loadTS().then(function (ts) {
      return new Promise(function (ok, no) {
        var c = d.getElementById('fz-ts'); if (c) { try { ts.remove('#fz-ts'); } catch (e) {} c.remove(); }
        c = d.createElement('div'); c.id = 'fz-ts'; c.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:400'; d.body.appendChild(c);
        ts.render(c, { sitekey: TS_KEY, appearance: 'interaction-only', language: 'de', callback: ok, 'error-callback': function () { no(new Error('ts')); }, 'timeout-callback': function () { no(new Error('ts')); } });
      });
    });
  }
  var PDF_FEHLER = {
    mail: 'Bitte prüfen Sie die Mailadresse.',
    limit: 'Für diese Adresse ist heute schon eine Einschätzung unterwegs. Schauen Sie bitte auch im Spamordner nach.',
    sonst: 'Das hat leider nicht geklappt. Schreiben Sie uns gern direkt an <a href="mailto:edwin@wolgawurzeln.de">edwin@wolgawurzeln.de</a>.'
  };
  function pdfSenden(f) {
    var a = analyseAll(), p = st.pdf;
    p.mail = (f.mail.value || '').trim(); p.notiz = (f.notiz.value || '').trim(); p.err = '';
    if (f.wunsch) st.want = f.wunsch.value;
    if (!/^[^\s@<>()",;:]+@[^\s@]+\.[A-Za-z]{2,}$/.test(p.mail)) { p.err = PDF_FEHLER.mail; render(); return; }
    if (f.firma.value) return;
    p.busy = true; render(); npLog('pdf');
    tsToken().then(function (token) {
      return fetch(EZ_API, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({
        namen: pdfNamen(a), region: st.reg, wunsch: st.want, email: p.mail, notiz: p.notiz, angaben: frAngaben().map(function (x) { return x[0] + ': ' + x[1]; }).join('. '), sid: SID, quelle: quelle(), page: location.pathname, ts: token
      }) }).then(function (r) { return r.json().catch(function () { return { ok: false }; }); });
    }).then(function (j) {
      p.busy = false;
      if (j && j.np && (j.ok || j.status === 'spaeter')) { p.done = j.ok ? 'gesendet' : 'spaeter'; p.np = j.np; }
      else p.err = PDF_FEHLER[j && j.grund] || PDF_FEHLER.sonst;
      render();
    }).catch(function () { p.busy = false; p.err = PDF_FEHLER.sonst; render(); })
      .then(function () { var c = d.getElementById('fz-ts'); if (c) c.remove(); });
  }

  function analyseAll() {
    var all = (st.names.length ? st.names : [st.name]).map(analyse), good = all.filter(function (x) { return x.kind !== 'bad'; });
    var a = good.length ? good[0] : all[0];
    a.all = all;
    if (!good.length) a.kind = 'bad';
    return a;
  }

  /* Interne Einstufung für die Anfrage: 1 sehr gute Voraussetzungen, 2 gut, 3 offen */
  function stufe(a) {
    if (a.kind === 'bad') return 3;
    var p = a.kind === 'ru' ? -2 : a.kind === 'unklar' ? -1 : 1;
    if (a.dict || a.menno || a.colonies.length) p += 1;
    if (st.reg && st.reg !== 'unklar') p += 1;
    if (st.want) p += 1;
    p += Math.min(knownList().length, 2) * 0.5;
    if (frAktiv() && (st.fr.land || st.fr.konf)) p += 0.5;
    return p >= 4 ? 1 : p >= 2.5 ? 2 : 3;
  }
  function knownList() { return Object.keys(KNOW).filter(function (k) { return st.know[k]; }); }
  function leadText(a, intro) {
    var code = (st.want ? st.want.toUpperCase() : 'NP') + stufe(a);
    var L = ['Guten Tag, ' + intro + ' (Ersteinschätzung ' + code + ').', '', (st.names.length > 1 ? 'Nachnamen: ' : 'Nachname: ') + st.name];
    if (st.reg) L.push('Region: ' + REG[st.reg].t);
    if (st.want) L.push('Interesse: ' + WANT[st.want].n);
    frAngaben().forEach(function (x) { L.push(x[0] + ': ' + x[1]); });
    L.push('', 'Meine Frage: ');
    return L.join('\n');
  }
  function knowSummary() {
    var t = [];
    if (st.reg) t.push('Region: ' + (st.reg === 'unklar' ? 'noch offen' : REG[st.reg].t));
    frAngaben().forEach(function (x) { t.push(x[0] + ': ' + x[1]); });
    return t.join('. ');
  }

  /* Plausibilität des Namens: Sprachmodell (assets/namen.js) wird beim ersten Antippen des Feldes geladen */
  var NM = null, nmP = null;
  function loadJS(src) {
    return new Promise(function (ok) {
      var sc = d.createElement('script'); sc.src = src; sc.async = true;
      sc.onload = function () { ok(true); }; sc.onerror = function () { ok(false); };
      d.head.appendChild(sc);
    });
  }
  function loadNM() {
    if (nmP) return nmP;
    nmP = Promise.all([loadJS('assets/namen.js'), loadJS('assets/pleve.js')]).then(function () {
      NM = w.WW_NM || null;
      if (NM) { NM.k = {}; NM.known.split(' ').forEach(function (x) { NM.k[x] = 1; }); }
      if (w.WW_PL) {
        PL = {}; w.WW_PL.split(' ').forEach(function (x) { PL[x] = 1; });
        (w.WW_PLH || '').split(' ').forEach(function (x) { var m = /^([a-z]+)(\d+)$/.exec(x); if (m && PL[m[1]]) PL[m[1]] = +m[2]; });
      }
      return NM;
    });
    return nmP;
  }
  var ortP = null;
  function ortFeld() {
    var f = d.getElementById('ez-ort'); if (!f) return;
    if (!ortP) ortP = w.WW_ORTE ? Promise.resolve(true) : loadJS('assets/orte.js');
    ortP.then(function () { var g = d.getElementById('ez-ort'); if (g && w.WW_ORTE) w.WW_ORTE.an(g); });
  }
  /* Ansiedlungslisten 1764 bis 1767 (assets/pleve.js): ob ein Name verzeichnet ist und mit wie vielen Haushalten.
     Zahl der Kolonien, Konfessionen und Schreibweisen stehen erst im PDF, Kolonienamen nirgends.
     Gleiche Normalisierung und gleiche Reihenfolge wie im Worker (pruefung_basis.js, pruefung.js), damit Seite und PDF dieselbe Zahl nennen. */
  var PL = null;
  function variante(x) {
    var v = String(x || '').toLowerCase().replace(/ß/g, 'ss').replace(/ae|ä/g, 'e').replace(/oe|ö/g, 'e').replace(/ue|ü/g, 'i').replace(/[^a-z]/g, '');
    v = v.replace(/^ph/, 'f').replace(/ph/g, 'f').replace(/th/g, 't').replace(/dt/g, 't').replace(/tz/g, 'z').replace(/ck/g, 'k').replace(/ai|ay|ey/g, 'ei').replace(/ie/g, 'i').replace(/y/g, 'i')
      .replace(/([aeiou])h(?=[^aeiou]|$)/g, '$1').replace(/(sch|ch)/g, function (m) { return m.toUpperCase(); }).replace(/c(?=[aou]|$)/g, 'k').replace(/c/g, 'z').toLowerCase().replace(/(.)\1+/g, '$1').replace(/d$/, 't');
    return v;
  }
  function plZahl(forms) {
    if (!PL) return 0;
    for (var i = 0; i < forms.length; i++) { var k = variante(forms[i]); if (k.length > 1 && PL[k] > 0) return PL[k]; }
    return 0;
  }
  function inPleve(forms) { return plZahl(forms) > 0; }
  /* Häufige Namen: 10, wenn höchstens zehn Namen so viele Haushalte haben, 50 entsprechend, sonst 0. Gleichstände zählen mit, damit die Aussage stimmt. */
  var PLS = null;
  function plTop(n) {
    if (!PL || n < 2) return 0;
    if (!PLS) { PLS = []; for (var k in PL) if (PL[k] > 1) PLS.push(PL[k]); PLS.sort(function (a, b) { return b - a; }); }
    var c = 0; while (c < PLS.length && PLS[c] >= n) c++;
    return c <= 10 ? 10 : c <= 50 ? 50 : 0;
  }
  var CTX = '^abcdefghijklmnopqrstuvwxyz', NXT = 'abcdefghijklmnopqrstuvwxyz$';
  var BLOCK = {}; ('test tester testname hallo hello name nachname familienname vorname nein keine keiner egal blabla bla pizza banane auto tisch mustermann musterfrau muster beispiel abc abcd xyz xxx lol asdf qwertz qwerty niemand unbekannt weissnicht ahnung').split(' ').forEach(function (x) { BLOCK[x] = 1; });
  var FREMD = {}; ('smith johnson williams jones davis wilson taylor anderson jackson white harris thompson robinson walker young allen wright scott green baker adams nelson hill campbell mitchell roberts carter phillips evans turner parker collins edwards stewart morris murphy cook rogers morgan cooper garcia martinez rodriguez lopez gonzalez hernandez perez sanchez ramirez rossi russo ferrari esposito bianchi romano ricci marino yilmaz kaya demir sahin celik yildiz yildirim ozturk aydin ozdemir arslan dogan kilic nguyen tran pham mohammed muhammad mohamed mohammad ahmed ahmad ali hassan hussein husein ibrahim mahmoud abdullah khalil khan singh kumar patel wang zhang liu chen yang huang').split(' ').forEach(function (x) { FREMD[x] = 1; });
  var KBR = ['qwertzuiopu', 'asdfghjkl', 'yxcvbnm', 'qwertyuiop', 'zxcvbnm'];
  KBR = KBR.concat(KBR.map(function (r) { return r.split('').reverse().join(''); }));
  var KBC = ['йцукенгшщзхъ', 'фывапролджэ', 'ячсмитьбю'];
  KBC = KBC.concat(KBC.map(function (r) { return r.split('').reverse().join(''); }));
  function nnorm(x) {
    x = (x || '').toLowerCase().replace(/ß/g, 'ss').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u');
    try { x = x.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) {}
    return x.replace(/ł/g, 'l').replace(/ı/g, 'i').replace(/ø/g, 'o').replace(/[^a-z]/g, '');
  }
  function rows4(x, rows) {
    for (var r = 0; r < rows.length; r++) for (var i = 0; i + 4 <= rows[r].length; i++) if (x.indexOf(rows[r].substr(i, 4)) > -1) return true;
    return false;
  }
  function heurBad(n) {
    if (n.length < 2) return true;
    if (!/[aeiouy]/.test(n)) return true;
    if (/(.)\1\1/.test(n)) return true;
    if (rows4(n, KBR)) return true;
    if (/[bcdfghjklmnpqrstvwxz]{6,}/.test(n)) return true;
    var m5 = n.match(/[bcdfghjklmnpqrstvwxz]{5}/g);
    if (m5 && m5.some(function (x) { return x.indexOf('sch') < 0; })) return true;
    if (n.length >= 4 && /^(.{1,4})\1+$/.test(n)) return true;
    return false;
  }
  function qv(T, i) { var c = T.charCodeAt(i); return c > 92 ? c - 36 : c - 35; }
  function tscore(T, x) {
    var t = '^^' + x + '$', sum = 0;
    for (var i = 2; i < t.length; i++) sum -= qv(T, (CTX.indexOf(t[i - 2]) * 27 + CTX.indexOf(t[i - 1])) * 27 + NXT.indexOf(t[i])) * NM.step;
    return sum / (t.length - 2);
  }
  function variants(n) {
    var v = [n], g = n.replace(/(^|[^sc])sh/g, '$1sch').replace(/zh/g, 'sch').replace(/kh/g, 'ch').replace(/ts/g, 'tz');
    if (g !== n) v.push(g);
    if (/^g[aeiou]/.test(g)) v.push('h' + g.slice(1));
    return v;
  }
  /* 'de' deutsche Namensform, 'unklar' keine typisch deutsche Form, 'bad' kein erkennbarer Name */
  function nameKind(raw, whole) {
    var n = nnorm(raw);
    if (!n || BLOCK[n] || BLOCK[nnorm(whole)]) return 'bad';
    if (NM && NM.k[n]) return 'de';
    if (FREMD[n]) return 'unklar';
    if (heurBad(n)) return 'bad';
    if (!NM) return 'de';
    var llr = -99, top = -99;
    variants(n).forEach(function (x) { var a = tscore(NM.de, x), b = tscore(NM.ot, x); llr = Math.max(llr, a - b); top = Math.max(top, a, b); });
    if (top < -5) return 'bad';
    return llr >= 0.1 ? 'de' : 'unklar';
  }

  function analyse(name) {
    var isC = cyr(name), words = name.split(/[\s\-]+/).filter(Boolean), main = words[words.length - 1] || name;
    var res = { name: name, cyr: isC, forms: [], dict: null, menno: false, colonies: [], russian: false };
    if (isC) {
      var de = BYRU[cfold(main)];
      if (de) { res.dict = true; res.forms = uniq(de).slice(0, 3); }
      else res.forms = ruToDe(main);
      var keys = res.forms.map(fold);
      res.menno = keys.some(function (k) { return MENNOSET[k]; });
      res.colonies = colonyByName(keys);
      res.russian = !res.dict && !res.menno && !res.colonies.length && RU_CYR.test(cfold(main));
    } else {
      var k = fold(main), e = BYDE[k];
      if (e) { res.dict = true; res.forms = uniq(e[0].slice(1)).slice(0, 3); }
      else res.forms = deToRu(main).slice(0, 2);
      res.menno = !!MENNOSET[k];
      res.colonies = colonyByName([k]);
      res.russian = !res.dict && !res.menno && !res.colonies.length && RU_LAT.test(k) && !/(mann|stein|lein|berg|feld)$/.test(k);
    }
    var known = !!(NM && res.forms.concat([main]).some(function (f) { return NM.k[nnorm(f)]; }));
    var probe = nnorm(isC ? (res.forms[0] || '') : main);
    if (res.dict || res.menno || res.colonies.length || known) { res.kind = 'de'; res.russian = false; }
    else if (BLOCK[probe] || BLOCK[nnorm(name)] || (isC && rows4(main.toLowerCase(), KBC)) || heurBad(probe)) { res.kind = 'bad'; res.russian = false; }
    else if (res.russian) res.kind = 'ru';
    else res.kind = nameKind(isC ? (res.forms[0] || '') : main, name);
    var plz = plZahl(isC ? res.forms.slice(0, 2) : [name]), pl = plz > 0;
    if (pl && res.kind === 'unklar') res.kind = 'de';
    res.pleve = pl && res.kind === 'de';
    /* Liegt im Browser noch eine ältere pleve.js ohne Zahlen, steht dort nur „verzeichnet“ statt einer falschen 1 */
    res.plz = res.pleve && typeof w.WW_PLH === 'string' ? plz : 0;
    res.plt = res.plz ? plTop(res.plz) : 0;
    return res;
  }

  function verdict(a) {
    if (a.kind === 'bad') return null;
    if (a.kind === 'unklar') return { c: 'open', h: 'Vorab kurz prüfen', p: 'Die Namensform ist nicht typisch deutsch. Ob sich eine deutsche Herkunft belegen lässt, zeigt erst ein Blick in die Quellen. Schicken Sie uns dazu am besten Geburtsorte und Geburtsjahre der Großeltern, dann sagen wir Ihnen vorab, ob sich eine Recherche lohnt.' };
    if (a.kind === 'ru' && st.reg && st.reg !== 'unklar') return { c: 'open', h: 'Über die deutsche Linie prüfen', p: 'Der Name selbst ist russischer oder ukrainischer Herkunft. Stammt ein Teil der Familie aus dieser Region, liegt die deutsche Linie meist bei Mutter, Großmutter oder Großvater. Mit deren Geburtsnamen lässt sich vorab klären, ob sich eine Recherche lohnt.' };
    if (a.russian && (!st.reg || st.reg === 'unklar')) return { c: 'mid', h: 'Über die deutsche Linie gut möglich', p: 'Der Name selbst ist russischer oder ukrainischer Herkunft. In vielen russlanddeutschen Familien liegt die deutsche Linie bei Mutter, Großmutter oder Großvater. Prüfen Sie am besten auch deren Geburtsnamen.' };
    if (st.reg && st.reg !== 'unklar') return { c: 'good', h: 'Gute Voraussetzungen', p: 'Für diese Region sind die wichtigen Quellen erhalten. Mit Ihrem Nachnamen und den Geburtsdaten der Großeltern lässt sich die Herkunft meist eingrenzen.' };
    if (st.reg === 'unklar') return { c: 'good', h: 'Das lässt sich klären', p: 'Auch ohne bekannte Region ist die Spur selten verloren. Mit Nachname, Geburtsjahren und Geburtsorten der Großeltern lässt sich die Region fast immer bestimmen.' };
    return null;
  }

  /* Einordnung nach dem Fragenkatalog: Überschrift nach Stärke der Angaben und der Verweis auf das passende Paket.
     Die Einzelheiten stehen als Deutung bei den Antworten. Vorsichtig formuliert, ohne Kolonie, bei unbekannter Region ohne Gebiet. */
  function einordnung(a) {
    if (!frAktiv() || !st.fr.fertig || a.kind !== 'de' || a.russian) return null;
    var k = st.know, f = st.fr, s = [], offen = st.reg === 'unklar', stark = k.ort || k.doku, etwas = stark || k.jahre || k.fotos || (f.land && f.land !== 'sonst') || (f.konf && f.konf !== 'unklar');
    var h = offen ? (stark ? 'Ein guter Ausgangspunkt' : 'Das lässt sich klären') : (stark ? 'Sehr gute Voraussetzungen' : 'Gute Voraussetzungen');
    if (!etwas) s.push('Auch ohne weitere Angaben ist die Spur selten verloren.');
    /* Bei Herkunft von der Wolga führt die Zahl aus den Ansiedlungslisten zum Herkunftsbericht. Die Kolonie selbst steht nie hier.
       Bei anderer oder offener Region sagt die Zahl nichts über die Familie, dort bleibt der allgemeine Satz. */
    var n = st.names.length, lz = st.reg === 'wolga' && a.pleve && a.plz ? a.plz : 0;
    if (n <= 1 && lz === 1) s.push('In den Ansiedlungslisten steht der Name genau einmal. In welcher Kolonie, zeigt ein Herkunftsbericht.');
    else if (n <= 1 && lz > 1) s.push('In den Ansiedlungslisten stehen ' + lz + ' Haushalte mit diesem Namen. In welchen Kolonien, zeigt ein Herkunftsbericht.');
    else if (n <= 1) s.push('Woher die Familie kam, ist die Frage, der ein Herkunftsbericht nachgeht.');
    else if (n <= 4) s.push('Woher die einzelnen Linien kamen, ist die Frage, der eine Familiengeschichte nachgeht.');
    return { c: 'good', h: h, p: s.join(' '), voll: true };
  }

  function oneLine(x) {
    var n = '<b>' + esc(x.name) + '</b>: ';
    if (x.kind === 'bad') return n + 'so nicht zuzuordnen, bitte Schreibweise prüfen';
    if (x.russian || x.kind === 'ru') return n + 'russische oder ukrainische Namensform, die deutsche Linie liegt dann oft bei Mutter oder Großmutter';
    if (x.kind === 'unklar') return n + 'keine typisch deutsche Namensform, vorab kurz prüfen';
    if (x.cyr) return n + 'wahrscheinlich ' + x.forms.map(esc).join(', ');
    return n + 'in russischen Akten zum Beispiel als <span lang="ru">' + x.forms.map(esc).join(' oder ') + '</span>' + (x.menno ? ', verbreitet unter Russlandmennoniten' : '');
  }
  function waLink(a, intro) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(leadText(a, intro)); }
  function mailLink(a, intro, subj) { return 'mailto:edwin@wolgawurzeln.de?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(leadText(a, intro)); }

  /* ---------- Ansichten: ein Schritt pro Ansicht, aufgebaut wie die Abläufe großer Portale:
     Kopf mit Marke, Schrittleiste, Ergebniskarte, Auswahlkacheln, Formularkarte mit festem Knopf. Helle Fläche, alles eckig. ---------- */
  var SVG = function (cls, box, inner) { return '<svg class="' + cls + '" viewBox="' + box + '" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + inner + '</svg>'; };
  var X_SVG = SVG('', '0 0 24 24', '<path stroke-width="1.8" stroke-linecap="square" d="M6 6l12 12M18 6 6 18"/>');
  var HAKEN = '<svg class="ez-ok" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect width="20" height="20" fill="currentColor"/><path d="M5 10.4l3.2 3.2L15 6.8" fill="none" stroke="#FFFDF9" stroke-width="2" stroke-linecap="square"/></svg>';
  var SCHLOSS = SVG('ez-lock', '0 0 20 20', '<rect x="4" y="9" width="12" height="8" stroke-width="1.5"/><path stroke-width="1.5" d="M7 9V6.5a3 3 0 016 0V9"/>');
  var IC = {
    wolga: '<path d="M3 8c3 0 3 3 6 3s3-3 6-3 3 3 6 3"/><path d="M3 15c3 0 3 3 6 3s3-3 6-3 3 3 6 3"/>',
    meer: '<path d="M12 13V4l6 7H8"/><path d="M4 14h16l-2 3H6z"/><path d="M3 20.5c2 0 2-1 4.5-1s2.5 1 4.5 1 2-1 4.5-1 2.5 1 4.5 1"/>',
    wolhynien: '<path d="M12 3l5 7h-3l4 6H6l4-6H7z"/><path d="M12 16v5"/>',
    kaukasus: '<path d="M2 19l7-11 4 6 2-3 7 8z"/>',
    unklar: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>'
  };
  var REG_T = { wolga: 'Bei Saratow und Samara', meer: 'Odessa, Bessarabien, Krim, Dnjepr', wolhynien: 'Nordwesten der heutigen Ukraine', kaukasus: 'Tiflis, Aserbaidschan, Nordkaukasus', unklar: 'Wir grenzen die Region mit Ihnen ein' };
  var IN_LISTEN = '<span class="ez-ja">verzeichnet</span>';
  /* Zahl der Haushalte mit dem Namen in den Listen. Sagt nichts über die Kolonie und nichts über die eigene Familie. */
  function haushalte(n) { return '<span class="ez-ja">' + (n === 1 ? '1 Haushalt' : n + ' Haushalte') + '</span>'; }
  /* Zeilen der Ergebniskarte: Bezeichnung und kurzer Wert. Zahlen stehen erst im PDF. */
  function zeilen(a) {
    var z = [];
    if (a.all && a.all.length > 1) {
      a.all.forEach(function (x) {
        var v = x.kind === 'bad' ? 'bitte Schreibweise prüfen' : (x.russian || x.kind === 'ru') ? 'russische oder ukrainische Namensform' : x.kind === 'unklar' ? 'keine typisch deutsche Namensform' :
          x.cyr ? 'wahrscheinlich ' + x.forms.map(esc).join(', ') : '<span lang="ru">' + x.forms.map(esc).join(', ') + '</span>';
        z.push([esc(x.name), v + (x.pleve ? '<br>' + (x.plz ? haushalte(x.plz) : IN_LISTEN) + ' in den Ansiedlungslisten' : '')]);
      });
      if (a.all.length > 4) z.push(['Hinweis', 'Die Ersteinschätzung umfasst die ersten vier Namen. Für mehr stellen wir eine individuelle Recherche zusammen.']);
      return z;
    }
    if (a.russian || (a.kind === 'unklar' && !a.cyr)) { /* keine Umschrift anzeigen */ }
    else if (a.cyr) z.push(['Deutsche Schreibweise', 'wahrscheinlich ' + a.forms.map(esc).join(', ')]);
    else z.push(['In russischen Akten', '<span lang="ru">' + a.forms.map(esc).join(', ') + '</span>']);
    if (a.pleve) z.push(['Ansiedlungslisten 1764 bis 1767', a.plz ? haushalte(a.plz) + ' <span class="ez-zus">' + (a.plt === 10 ? 'einer der zehn häufigsten' : a.plt === 50 ? 'einer der 50 häufigsten' : 'mit diesem Namen') + '</span>' : IN_LISTEN]);
    if (a.menno) z.push(['Hinweis', 'unter Russlandmennoniten verbreitet']);
    if (!a.pleve) a.colonies.slice(0, 1).forEach(function (c) { z.push(['Gut zu wissen', 'Es gab eine Wolgakolonie dieses Namens: <a href="wissen/' + c[2] + '.html">' + esc(c[0]) + '</a>, gegründet ' + esc(c[4]) + '. Ob Ihre Familie von dort stammt, sagt der Name allein noch nicht.']); });
    if (a.kind === 'unklar') z.push(['Namensform', 'Keine typisch deutsche Form. Häufig liegt die deutsche Linie bei Mutter oder Großmutter.']);
    if (a.russian) z.push(['Namensform', 'Russisch oder ukrainisch. Häufig liegt die deutsche Linie bei Mutter, Großmutter oder Großvater.']);
    return z;
  }
  function kvHTML(z) {
    return '<dl class="ez-kv">' + z.map(function (x) { return '<div' + (x[1].replace(/<span class="ez-zus">.*?<\/span>/, '').replace(/<[^>]+>/g, '').length > 34 ? ' class="lang"' : '') + '><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd></div>'; }).join('') + '</dl>';
  }
  /* Kopf: Marke und Schließen, darunter die Schrittleiste. n = aktueller Schritt (2, 3), 4 = alles erledigt, 0 = ohne Leiste */
  function kopf(n) {
    var S = ['Name', 'Region', 'Zusendung'];
    return '<div class="ez-top"><span class="ez-brand"><img src="img/wappen-120.png" alt="" width="27" height="26"><span>Wolgawurzeln</span></span><button type="button" class="ez-x" aria-label="Ersteinschätzung schließen">' + X_SVG + '</button></div>' +
      (n ? '<ol class="ez-steps" aria-label="Kostenlose Ersteinschätzung in drei Schritten">' + S.map(function (t, i) {
        var k = i + 1, c = k < n ? 'done' : k === n ? 'on' : '';
        return '<li' + (c ? ' class="' + c + '"' : '') + (c === 'on' ? ' aria-current="step"' : '') + '><span class="ez-sn">' + (c === 'done' ? '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 10.4l3.2 3.2L15 6.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"/></svg>' : k) + '</span>' + t + '</li>';
      }).join('') + '</ol>' : '');
  }
  /* Schreibweise für die Anrede der Seite: Wer klein tippt, bekommt den Namen groß geschrieben */
  function gross(x) { x = String(x || ''); return x === x.toLowerCase() ? x.replace(/(^|[\s-])([a-zäöüа-яё])/g, function (m, v, c) { return v + c.toUpperCase(); }) : x; }
  /* Erster Befund: Name, Schreibweisen und der Vermerk aus den Ansiedlungslisten */
  function befundHTML(a) {
    var treffer = (a.all || [a]).some(function (x) { return x.pleve; }), z = zeilen(a);
    return '<section class="ez-card" aria-label="Erster Befund"><div class="ez-rh">' + (a.kind === 'de' ? HAKEN : '') + '<h2 class="ez-name' + (st.name.length > 16 ? ' lang' : '') + '" tabindex="-1">' + esc(st.name) + '</h2>' +
      '<button type="button" class="ez-link fz-again">Ändern</button></div>' + kvHTML(z) +
      (treffer ? '<p class="ez-hint">Die Zahl der Kolonien, die Konfession und die Schreibweisen stehen in Ihrer Ersteinschätzung.</p>' : '') + '</section>';
  }
  /* Die Seite spricht nach der Namensprüfung von der Familie: Überschriften mit data-fam bekommen den Namen (nur ein deutscher Name).
     Bleibt für den Besuch erhalten, bis ein anderer Name geprüft wird. */
  function familie(n) {
    [].forEach.call(d.querySelectorAll('[data-fam]'), function (e) {
      if (!e.hasAttribute('data-fam0')) e.setAttribute('data-fam0', e.textContent);
      e.textContent = n ? e.getAttribute('data-fam').replace('{n}', n) : e.getAttribute('data-fam0');
    });
    try { if (n) sessionStorage.setItem('ww_fam', n); else sessionStorage.removeItem('ww_fam'); } catch (e) {}
  }
  function familieAus(a) { familie(a.kind === 'de' && !a.russian && !(a.all && a.all.length > 1) ? gross(a.cyr ? a.forms[0] : st.name) : ''); }
  try { var fam0 = sessionStorage.getItem('ww_fam'); if (fam0 && fam0.length < 40) familie(fam0); } catch (e) {}
  function regionHTML(a) {
    var opts = Object.keys(REG).map(function (k) {
      return '<button type="button" class="ez-opt" data-reg="' + k + '"' + (st.reg === k ? ' aria-current="true"' : '') + '>' + SVG('ez-ic', '0 0 24 24', IC[k]).replace('<svg', '<svg stroke-width="1.5"') +
        '<span class="ez-ot"><b>' + REG[k].t + '</b><small>' + REG_T[k] + '</small></span></button>';
    }).join('');
    return '<div class="ez">' + kopf(2) + '<div class="ez-body">' + befundHTML(a) +
      '<h2 class="ez-q" id="ez-q">Wo lebte die Familie vor 1941?</h2><div class="ez-opts" role="group" aria-labelledby="ez-q">' + opts + '</div></div></div>';
  }
  function frageHTML() {
    var f = st.fr, q = FRAGEN[f.i], n = 0, opts;
    if (q.multi) {
      opts = Object.keys(KNOW).map(function (k) {
        if (st.know[k]) n++;
        return '<button type="button" class="ez-opt" data-fr="' + k + '" aria-pressed="' + (st.know[k] ? 'true' : 'false') + '"><span class="ez-ot"><b>' + (KNOW_B[k] || KNOW[k]) + '</b>' + (KNOW_T[k] ? '<small>' + KNOW_T[k] + '</small>' : '') + '</span></button>';
      }).join('');
    } else {
      opts = Object.keys(q.o).map(function (k) {
        return '<button type="button" class="ez-opt" data-fr="' + k + '"' + (f[q.k] === k ? ' aria-current="true"' : '') + '><span class="ez-ot"><b>' + q.o[k][0] + '</b>' + (q.o[k][1] ? '<small>' + q.o[k][1] + '</small>' : '') + '</span></button>';
      }).join('');
    }
    return '<div class="ez">' + kopf(2) + '<div class="ez-body"><p class="ez-fn">Frage ' + (f.i + 1) + ' von ' + FRAGEN.length + '</p>' +
      '<h2 class="ez-q ez-name" id="ez-q" tabindex="-1">' + q.t + '</h2><p class="ez-help ez-qh">' + q.h + '</p>' +
      '<div class="ez-opts' + (q.multi ? ' multi' : '') + '" role="group" aria-labelledby="ez-q">' + opts + '</div>' +
      (q.multi ? '<div class="ez-ort"' + (st.know.ort ? '' : ' hidden') + '><label class="ez-lab" for="ez-ort">Wie heißt der Ort? <small>freiwillig</small></label>' +
        '<div><input id="ez-ort" type="text" maxlength="80" autocomplete="off" autocapitalize="words" spellcheck="false" enterkeyhint="done" placeholder="zum Beispiel Norka oder Мариенталь" value="' + esc(st.ort) + '"></div></div>' : '') +
      (q.multi ? '<div class="ez-bar"><button type="button" class="ez-btn" data-fr-weiter>' + (n ? 'Weiter' : 'Nichts davon, weiter') + '</button></div>' : '') +
      '<p class="ez-foot ez-fnav"><button type="button" class="ez-link" data-fr-back>Zurück</button>' + (q.multi ? '' : '<button type="button" class="ez-link" data-fr-skip>Frage überspringen</button>') + '</p></div></div>';
  }
  /* Leiser Nebenweg unter dem Formular: direkt bestellen oder gleich fragen */
  function altHTML(a) {
    /* Nach dem Fragenkatalog passt bei einem einzelnen deutschen Namen der Herkunftsbericht, auch wenn noch kein Wunsch gewählt ist */
    var art = st.want || (einordnung(a) && st.names.length <= 1 ? 'hb' : ''), W = art ? WANT[art] : null, t = [];
    if (W && W.order && a.kind === 'de') t.push('<button type="button" class="ez-link" data-fz-order="' + art + '">' + W.n + ' für ' + W.price + ' direkt bestellen</button>');
    if (TS_KEY) t.push('<a href="' + waLink(a, 'ich habe eine Frage zu meiner Familie') + '" target="_blank" rel="noopener">Lieber gleich per WhatsApp fragen</a>');
    return t.length ? '<p class="ez-foot">' + t.join('<br>') + '</p>' : '';
  }
  function mailHTML(a) {
    var p = st.pdf, v = einordnung(a) || verdict(a), r = REG[st.reg], haupt;
    var deutsch = (a.all || [a]).some(function (x) { return !(x.russian || x.kind === 'ru'); });
    var karte = '<section class="ez-card" aria-label="Ihre Angaben"><dl class="ez-kv oben"><div><dt>Name</dt><dd>' + esc(st.name) + '</dd></div>' +
      '<div class="mit"><dt>Region</dt><dd>' + (st.reg === 'unklar' ? 'noch offen' : r.t) + '<button type="button" class="ez-link" data-ez-back>Ändern</button></dd><dd class="ez-deut">' + r.src + '</dd></div>' +
      (frAktiv() ? frAngaben().map(function (x) { return '<div class="' + (x[1].length > 30 ? 'lang' : 'mit') + '"><dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd>' + (x[2] ? '<dd class="ez-deut">' + x[2] + '</dd>' : '') + '</div>'; }).join('') : '') + '</dl>' +
      (v ? '<p class="ez-status">' + (v.c === 'good' ? HAKEN : '') + '<span><b>' + v.h + '.</b> ' + (v.voll ? v.p : v.c === 'good' ? v.p.split('. ')[0].replace(/\.?$/, '.') : v.p) + '</span></p>' : '') + '</section>';
    if (!TS_KEY) {
      haupt = '<h2 class="ez-q">Ihre Ersteinschätzung per Nachricht</h2><div class="ez-card"><p class="ez-help first">Schicken Sie uns Ihre Angaben, Wolgawurzeln antwortet Ihnen persönlich.</p>' +
        '<a class="ez-btn" href="' + waLink(a, 'ich möchte eine Ersteinschätzung zu meinem Namen') + '" target="_blank" rel="noopener">Per WhatsApp anfragen</a>' +
        '<a class="ez-btn line" href="' + mailLink(a, 'ich möchte eine Ersteinschätzung zu meinem Namen', 'Ersteinschätzung: ' + st.name) + '">Per Mail anfragen</a></div>';
    } else {
      haupt = '<h2 class="ez-q">Wohin dürfen wir Ihre Ersteinschätzung senden?</h2>' +
        '<form class="ez-form fz-pdf-f" novalidate><div class="ez-card">' +
        '<label class="ez-lab" for="fz-pm">Mailadresse</label><input id="fz-pm" type="email" name="mail" autocomplete="email" inputmode="email" enterkeyhint="send" value="' + esc(p.mail || '') + '"' + (p.err ? ' aria-invalid="true" aria-describedby="ez-err"' : '') + '>' +
        (p.err ? '<p class="ez-err" id="ez-err" role="alert">' + p.err + '</p>' : '') +
        '<p class="ez-help">Sie erhalten ein PDF mit Karte, ' + (deutsch ? 'Schreibweisen' : 'einer Einordnung des Namens') + ' und Quellenlage. Danach meldet sich Wolgawurzeln persönlich bei Ihnen.</p>' +
        '<details class="ez-more"' + (p.more || p.notiz || st.want ? ' open' : '') + '><summary><span>Angaben zur Familie hinzufügen<small>freiwillig</small></span></summary>' +
        '<label class="ez-lab" for="fz-pw">Was möchten Sie herausfinden?</label><select id="fz-pw" name="wunsch"><option value="">Bitte wählen</option>' +
        Object.keys(WANT).map(function (k) { return '<option value="' + k + '"' + (st.want === k ? ' selected' : '') + '>' + WANT[k].t + '</option>'; }).join('') + '</select>' +
        '<label class="ez-lab" for="fz-pn">Was wissen Sie schon über die Familie?</label><textarea id="fz-pn" name="notiz" rows="3" maxlength="600" placeholder="Zum Beispiel Geburtsjahre und Orte der Großeltern">' + esc(p.notiz || '') + '</textarea></details>' +
        '<input class="fz-hp" type="text" name="firma" tabindex="-1" autocomplete="off" aria-hidden="true"></div>' +
        '<div class="ez-bar"><button class="ez-btn" type="submit"' + (p.busy ? ' disabled' : '') + '>' + (p.busy ? 'Wird erstellt …' : 'Kostenlos zusenden') + '</button></div>' +
        '<ul class="ez-trust"><li>Kostenlos und unverbindlich</li><li>Persönliche Antwort</li><li>Keine Werbemails</li></ul>' +
        '<p class="ez-fine">' + SCHLOSS + '<span>Ihre Angaben nutzen wir nur für diese Einschätzung. <a href="datenschutz.html#ersteinschaetzung">Datenschutz</a></span></p></form>';
    }
    return '<div class="ez">' + kopf(3) + '<div class="ez-body">' + karte + haupt + '<div class="fz-altwrap">' + altHTML(a) + '</div></div></div>';
  }
  function fertigHTML(a) {
    var p = st.pdf, ok = p.done === 'gesendet';
    return '<div class="ez">' + kopf(4) + '<div class="ez-body"><div class="ez-done">' + HAKEN + '<h2 class="ez-q ez-name" tabindex="-1">' + (ok ? 'Ihre Ersteinschätzung ist unterwegs' : 'Ihre Anfrage ist angekommen') + '</h2></div>' +
      '<section class="ez-card"><dl class="ez-kv oben"><div><dt>' + (ok ? 'Gesendet an' : 'Mailadresse') + '</dt><dd>' + esc(p.mail) + '</dd></div><div><dt>Name</dt><dd>' + esc(st.name) + '</dd></div><div><dt>Vorgang</dt><dd>' + esc(p.np || '') + '</dd></div></dl></section>' +
      '<h3 class="ez-h3">So geht es weiter</h3><ol class="ez-next"><li>' + (ok ? 'Das PDF kommt in den nächsten Minuten per Mail. Schauen Sie sonst bitte im Spamordner nach.' : 'Das PDF kommt in Kürze per Mail.') + '</li>' +
      '<li>Wolgawurzeln meldet sich danach persönlich bei Ihnen.</li><li>Sie entscheiden in Ruhe, ob Sie eine Recherche möchten.</li></ol>' +
      '<div class="ez-bar"><button type="button" class="ez-btn" data-ez-close>Fertig</button></div>' +
      '<p class="ez-foot"><button type="button" class="ez-link fz-again">Weiteren Namen eingeben</button><br><a href="' + waLink(a, 'ich habe eine Frage zu meiner Ersteinschätzung ' + (p.np || '')) + '" target="_blank" rel="noopener">Frage per WhatsApp stellen</a></p></div></div>';
  }
  function badHTML(a) {
    return '<div class="ez">' + kopf(0) + '<div class="ez-body"><section class="ez-card"><div class="ez-rh"><h2 class="ez-name' + (st.name.length > 16 ? ' lang' : '') + '" tabindex="-1">' + esc(st.name) + '</h2></div>' +
      '<p class="ez-status"><span><b>Diesen Namen können wir so nicht zuordnen.</b> Bitte prüfen Sie die Schreibweise. Geben Sie den Nachnamen so ein, wie er in Urkunden oder alten Pässen steht, gern auch auf Russisch.</span></p></section>' +
      '<div class="ez-bar"><button type="button" class="ez-btn fz-again">Anderen Namen eingeben</button></div>' +
      '<p class="ez-foot"><a href="' + waLink(a, 'mein Name wurde bei der Ersteinschätzung nicht erkannt') + '" target="_blank" rel="noopener">Der Name stimmt so? Schreiben Sie uns</a></p></div></div>';
  }

  /* Die Ersteinschätzung öffnet als eigene Ebene über der Seite: am Handy als ganzer Bildschirm, am Desktop als Fenster
     in der Mitte (eigene Ebene im body, weil die Titelbühne den Inhalt sonst abschneidet). Die Zurück Taste geht einen Schritt zurück. */
  var sheet = d.createElement('div'), offen = false, hist = 0, still = false, goBtn = form.querySelector('.fz-go');
  sheet.className = 'fz-sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', 'Kostenlose Ersteinschätzung');
  d.body.appendChild(sheet); sheet.appendChild(out);
  function ebene(on) {
    offen = on;
    sheet.classList.toggle('on', on);
    d.documentElement.classList.toggle('fz-lock', on);
    [].forEach.call(d.body.children, function (el) {
      if (el === sheet || el.id === 'fz-ts' || el.tagName === 'SCRIPT') return;
      if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
    if (on && !hist) { try { history.pushState({ fz: 1 }, ''); hist = 1; } catch (e) {} }
  }
  function oben(feld) {
    sheet.scrollTop = 0;
    var ez = out.querySelector('.ez'); if (ez) ez.scrollTop = 0;
    var breit = w.matchMedia && w.matchMedia('(min-width: 881px)').matches;
    var f = (feld && breit && d.getElementById(feld)) || out.querySelector('.ez-name');
    if (f) { try { f.focus({ preventScroll: true }); } catch (e) {} }
  }
  function leeren() {
    out.innerHTML = '';
    st = { name: '', names: [], reg: '', want: '', know: {}, pdf: {}, step: '', fr: null };
    ebene(false);
    if (goBtn) { try { goBtn.focus({ preventScroll: true }); } catch (e) {} }
    w.dispatchEvent(new Event('fz:change'));
  }
  function schliessen() {
    if (hist) { var n = hist; hist = 0; still = true; try { history.go(-n); } catch (e) { still = false; } }
    leeren();
  }
  /* Ein Schritt zurück im Ablauf: Zusendung, davor die Fragen, davor die Region */
  function zurueck() {
    if (st.pdf.done) return false;
    if (st.step === 'mail') { if (frAktiv()) { st.step = 'fragen'; st.fr.i = FRAGEN.length - 1; } else st.step = 'region'; return true; }
    if (st.step === 'fragen') { if (st.fr.i > 0) st.fr.i--; else st.step = 'region'; return true; }
    return false;
  }
  /* Jeder Schritt nach vorn bekommt einen Eintrag im Verlauf, damit die Zurück Taste genau einen Schritt zurückgeht */
  function schritt() { if (hist) { try { history.pushState({ fz: hist + 1 }, ''); hist++; } catch (e) {} } }
  var ziel = '';
  w.addEventListener('popstate', function () {
    if (still) { still = false; return; }
    if (!hist) return;
    if (ziel) { hist = 1; st.step = ziel; ziel = ''; render(); oben(); return; }
    hist--;
    if (hist >= 1 && zurueck()) { render(); oben(); return; }
    if (hist) { var n = hist; hist = 0; still = true; try { history.go(-n); } catch (e) { still = false; } }
    hist = 0; leeren();
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && offen) schliessen(); });
  sheet.addEventListener('click', function (e) { if (e.target === sheet || e.target === out) schliessen(); });

  function render() {
    var a = analyseAll();
    if (a.kind !== 'bad') familieAus(a);
    out.innerHTML = a.kind === 'bad' ? badHTML(a) : st.pdf.done ? fertigHTML(a) : (st.reg && st.step === 'mail') ? mailHTML(a) : (frAktiv() && st.step === 'fragen') ? frageHTML() : regionHTML(a);
    ebene(true);
    if (st.know.ort) ortFeld();
    w.dispatchEvent(new Event('fz:change'));
  }

  /* für den Fehlermelder: Ersteinschätzung ist bereit, Sitzung ist bekannt */
  w.WW_FZ = 1; w.WW_SID = SID;
  inp.addEventListener('focus', loadNM);
  inp.addEventListener('pointerdown', loadNM);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = (inp.value || '').replace(/\s+/g, ' ').trim();
    if (v.length < 2) { box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); inp.focus(); return; }
    st.names = splitNames(v); st.name = st.names.join(', '); st.want = st.names.length > 4 ? 'ez' : st.names.length > 1 ? 'fg' : ''; st.know = {}; st.ort = ''; st.pdf = {}; st.fr = null; st.step = 'region';
    w.WW_FZ_SUB = Date.now();
    npLog('pruefung');
    inp.blur();
    var done = false, go = function () { if (!done) { done = true; render(); oben(); } };
    loadNM().then(go);
    setTimeout(go, 2500);
  });
  /* Wurde das Feld abgeschickt, bevor dieses Skript geladen war, steht der Name in der Adresse (?n=Weber). Dann geht es hier weiter.
     Derselbe Weg dient als Verweis von außen, der die Ersteinschätzung gleich mit einem Namen öffnet. */
  try {
    var un = new URLSearchParams(location.search), n0 = (un.get('n') || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    if (n0) {
      un.delete('n'); var rest = un.toString();
      history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
      inp.value = n0;
      if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  } catch (e) {}
  out.addEventListener('click', function (e) {
    var lk = e.target.closest('a[href^="https://wa.me"], a[href^="mailto:"]');
    if (lk) npLog(/^mailto/.test(lk.getAttribute('href')) ? 'mail' : 'whatsapp');
    if (e.target.closest('.ez-x, [data-ez-close]')) { schliessen(); return; }
    var oi = e.target.closest('.ort-info a'); if (oi) { oi.target = '_blank'; oi.rel = 'noopener'; return; }
    var b = e.target.closest('[data-reg]');
    if (b) {
      st.reg = b.getAttribute('data-reg'); npLog('region');
      st.step = 'fragen'; st.fr = st.fr || { i: 0, land: '', konf: '', fertig: false }; st.fr.i = 0;
      schritt(); render(); oben(); return;
    }
    if (e.target.closest('[data-ez-back]')) {
      if (hist > 1) { ziel = 'region'; try { history.go(1 - hist); } catch (er) { ziel = ''; st.step = 'region'; render(); oben(); } }
      else { st.step = 'region'; render(); oben(); }
      return;
    }
    if (st.step === 'fragen' && frAktiv()) {
      var q = FRAGEN[st.fr.i], fo = e.target.closest('[data-fr]'), weiter = false;
      if (fo && q.multi) {
        var kk = fo.getAttribute('data-fr'), wb = out.querySelector('[data-fr-weiter]');
        st.know[kk] = !st.know[kk]; fo.setAttribute('aria-pressed', st.know[kk] ? 'true' : 'false');
        if (kk === 'ort') {
          var ob = out.querySelector('.ez-ort');
          if (ob) { ob.hidden = !st.know.ort; if (st.know.ort) { ortFeld(); try { ob.scrollIntoView({ block: 'nearest' }); } catch (er) {} } }
        }
        if (wb) wb.textContent = knownList().length ? 'Weiter' : 'Nichts davon, weiter';
        return;
      }
      if (fo) { st.fr[q.k] = fo.getAttribute('data-fr'); weiter = true; }
      else if (e.target.closest('[data-fr-skip]')) { st.fr[q.k] = ''; weiter = true; }
      else if (e.target.closest('[data-fr-weiter]')) weiter = true;
      else if (e.target.closest('[data-fr-back]')) {
        if (hist > 1) history.back();
        else { zurueck(); render(); oben(); }
        return;
      }
      if (weiter) {
        if (st.fr.i < FRAGEN.length - 1) st.fr.i++;
        else { st.fr.fertig = true; st.step = 'mail'; if (TS_KEY) npLog('fragen'); }
        schritt(); render(); oben(st.step === 'mail' ? 'fz-pm' : ''); return;
      }
    }
    var ob = e.target.closest('[data-fz-order]');
    if (ob) {
      npLog('bestellen');
      var art = ob.getAttribute('data-fz-order'), name = st.name, wissen = [knowSummary(), st.pdf.notiz || ''].filter(Boolean).join('. ');
      schliessen();
      var trg = d.querySelector('.pk-act [data-order="' + art + '"]'), kn = d.getElementById('order-know'), nm = d.getElementById('order-name');
      if (nm) nm.value = name;
      if (kn && !kn.value.trim()) kn.value = wissen;
      if (trg) trg.click();
      return;
    }
    if (e.target.closest('.fz-again')) { schliessen(); inp.value = ''; inp.focus(); return; }
  });
  out.addEventListener('toggle', function (e) { if (e.target.classList && e.target.classList.contains('ez-more')) st.pdf.more = e.target.open; }, true);
  out.addEventListener('input', function (e) { if (e.target && e.target.id === 'ez-ort') st.ort = e.target.value.replace(/\s+/g, ' ').trim().slice(0, 80); });
  out.addEventListener('submit', function (e) {
    var f = e.target.closest('.fz-pdf-f');
    if (!f) return;
    e.preventDefault();
    if (!st.pdf.busy) pdfSenden(f);
  });
  out.addEventListener('change', function (e) {
    if (e.target.id !== 'fz-pw') return;
    st.want = e.target.value;
    if (st.want) npLog('wunsch');
    var aw = out.querySelector('.fz-altwrap'); if (aw) aw.innerHTML = altHTML(analyseAll());
  });
  out.addEventListener('input', function (e) {
    if (e.target.id === 'fz-pm') st.pdf.mail = e.target.value;
    if (e.target.id === 'fz-pn') st.pdf.notiz = e.target.value;
  });
  var cl = box.querySelector('.fz-close');
  if (cl) cl.addEventListener('click', schliessen);

  /* für Tests */
  w.__fz = { ergebnis: function () { var a = analyseAll(), v = einordnung(a) || verdict(a); return [REG[st.reg] ? REG[st.reg].src : ''].concat(frAngaben().map(function (x) { return x[2]; }), v ? [v.h, v.p] : []).join(' | '); }, deToRu: deToRu, ruToDe: ruToDe, analyse: analyse, stufe: stufe, nameKind: nameKind, loadNM: loadNM, st: function () { return st; }, close: schliessen };
})();
