/* Wolgawurzeln: kostenlose Ersteinschätzung auf der Titelseite (Nachname, Region, PDF per Mail).
   Ablauf in Ansichten: Region (mit erstem Befund), Zusendung, fertig. Am Handy als ganzer Bildschirm über der Seite.
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
  var KNOW = { jahre: 'Geburtsjahre der Großeltern', ort: 'Geburtsort oder Dorf', doku: 'Alte Dokumente oder Fotos' };

  var st = { name: '', names: [], reg: '', want: '', know: {}, pdf: {}, step: '' };
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
        namen: pdfNamen(a), region: st.reg, wunsch: st.want, email: p.mail, notiz: p.notiz, sid: SID, quelle: quelle(), page: location.pathname, ts: token
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
    return p >= 4 ? 1 : p >= 2.5 ? 2 : 3;
  }
  function knownList() { return Object.keys(KNOW).filter(function (k) { return st.know[k]; }); }
  function leadText(a, intro) {
    var code = (st.want ? st.want.toUpperCase() : 'NP') + stufe(a);
    var L = ['Guten Tag, ' + intro + ' (Ersteinschätzung ' + code + ').', '', (st.names.length > 1 ? 'Nachnamen: ' : 'Nachname: ') + st.name];
    if (st.reg) L.push('Region: ' + REG[st.reg].t);
    if (st.want) L.push('Interesse: ' + WANT[st.want].n);
    var k = knownList();
    if (k.length) L.push('Bekannt: ' + k.map(function (x) { return KNOW[x]; }).join(', '));
    L.push('', 'Meine Frage: ');
    return L.join('\n');
  }
  function knowSummary() {
    var t = [];
    if (st.reg) t.push('Region: ' + REG[st.reg].t);
    var k = knownList();
    if (k.length) t.push('Vorhanden: ' + k.map(function (x) { return KNOW[x]; }).join(', '));
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
      if (w.WW_PL) { PL = {}; w.WW_PL.split(' ').forEach(function (x) { PL[x] = 1; }); }
      return NM;
    });
    return nmP;
  }
  /* Ansiedlungslisten 1764 bis 1767 (assets/pleve.js): hier nur, ob ein Name verzeichnet ist.
     Zahlen, Konfessionen und Schreibweisen stehen erst im PDF. Gleiche Normalisierung wie im Worker (pruefung_basis.js). */
  var PL = null;
  function variante(x) {
    var v = String(x || '').toLowerCase().replace(/ß/g, 'ss').replace(/ae|ä/g, 'e').replace(/oe|ö/g, 'e').replace(/ue|ü/g, 'i').replace(/[^a-z]/g, '');
    v = v.replace(/^ph/, 'f').replace(/ph/g, 'f').replace(/th/g, 't').replace(/dt/g, 't').replace(/tz/g, 'z').replace(/ck/g, 'k').replace(/ai|ay|ey/g, 'ei').replace(/ie/g, 'i').replace(/y/g, 'i')
      .replace(/([aeiou])h(?=[^aeiou]|$)/g, '$1').replace(/(sch|ch)/g, function (m) { return m.toUpperCase(); }).replace(/c(?=[aou]|$)/g, 'k').replace(/c/g, 'z').toLowerCase().replace(/(.)\1+/g, '$1').replace(/d$/, 't');
    return v;
  }
  function inPleve(forms) {
    return !!PL && forms.some(function (f) { var k = variante(f); return k.length > 1 && PL[k] === 1; });
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
    var pl = inPleve(isC ? res.forms.slice(0, 2) : [name]);
    if (pl && res.kind === 'unklar') res.kind = 'de';
    res.pleve = pl && res.kind === 'de';
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
  /* Zeilen der Ergebniskarte: Bezeichnung und kurzer Wert. Zahlen stehen erst im PDF. */
  function zeilen(a) {
    var z = [];
    if (a.all && a.all.length > 1) {
      a.all.forEach(function (x) {
        var v = x.kind === 'bad' ? 'bitte Schreibweise prüfen' : (x.russian || x.kind === 'ru') ? 'russische oder ukrainische Namensform' : x.kind === 'unklar' ? 'keine typisch deutsche Namensform' :
          x.cyr ? 'wahrscheinlich ' + x.forms.map(esc).join(', ') : '<span lang="ru">' + x.forms.map(esc).join(', ') + '</span>';
        z.push([esc(x.name), v + (x.pleve ? '<br>' + IN_LISTEN + ' in den Ansiedlungslisten' : '')]);
      });
      if (a.all.length > 4) z.push(['Hinweis', 'Die Ersteinschätzung umfasst die ersten vier Namen. Für mehr stellen wir eine individuelle Recherche zusammen.']);
      return z;
    }
    if (a.russian || (a.kind === 'unklar' && !a.cyr)) { /* keine Umschrift anzeigen */ }
    else if (a.cyr) z.push(['Deutsche Schreibweise', 'wahrscheinlich ' + a.forms.map(esc).join(', ')]);
    else z.push(['In russischen Akten', '<span lang="ru">' + a.forms.map(esc).join(', ') + '</span>']);
    if (a.pleve) z.push(['Ansiedlungslisten 1764 bis 1767', IN_LISTEN]);
    if (a.menno) z.push(['Hinweis', 'unter Russlandmennoniten verbreitet']);
    if (!a.pleve) a.colonies.slice(0, 1).forEach(function (c) { z.push(['Gut zu wissen', 'Es gab eine Wolgakolonie dieses Namens: <a href="wissen/' + c[2] + '.html">' + esc(c[0]) + '</a>, gegründet ' + esc(c[4]) + '. Ob Ihre Familie von dort stammt, sagt der Name allein noch nicht.']); });
    if (a.kind === 'unklar') z.push(['Namensform', 'Keine typisch deutsche Form. Häufig liegt die deutsche Linie bei Mutter oder Großmutter.']);
    if (a.russian) z.push(['Namensform', 'Russisch oder ukrainisch. Häufig liegt die deutsche Linie bei Mutter, Großmutter oder Großvater.']);
    return z;
  }
  function kvHTML(z) {
    return '<dl class="ez-kv">' + z.map(function (x) { return '<div' + (x[1].replace(/<[^>]+>/g, '').length > 34 ? ' class="lang"' : '') + '><dt>' + x[0] + '</dt><dd>' + x[1] + '</dd></div>'; }).join('') + '</dl>';
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
  function befundHTML(a) {
    var treffer = (a.all || [a]).some(function (x) { return x.pleve; });
    return '<section class="ez-card" aria-label="Erster Befund"><div class="ez-rh">' + (a.kind === 'de' ? HAKEN : '') + '<h2 class="ez-name' + (st.name.length > 16 ? ' lang' : '') + '" tabindex="-1">' + esc(st.name) + '</h2>' +
      '<button type="button" class="ez-link fz-again">Ändern</button></div>' + kvHTML(zeilen(a)) +
      (treffer ? '<p class="ez-hint">Zahlen, Konfession und Schreibweisen stehen in Ihrer Ersteinschätzung.</p>' : '') + '</section>';
  }
  function regionHTML(a) {
    var opts = Object.keys(REG).map(function (k) {
      return '<button type="button" class="ez-opt" data-reg="' + k + '"' + (st.reg === k ? ' aria-current="true"' : '') + '>' + SVG('ez-ic', '0 0 24 24', IC[k]).replace('<svg', '<svg stroke-width="1.5"') +
        '<span class="ez-ot"><b>' + REG[k].t + '</b><small>' + REG_T[k] + '</small></span></button>';
    }).join('');
    return '<div class="ez">' + kopf(2) + '<div class="ez-body">' + befundHTML(a) +
      '<h2 class="ez-q" id="ez-q">Wo lebte die Familie vor 1941?</h2><div class="ez-opts" role="group" aria-labelledby="ez-q">' + opts + '</div></div></div>';
  }
  /* Leiser Nebenweg unter dem Formular: direkt bestellen oder gleich fragen */
  function altHTML(a) {
    var W = st.want ? WANT[st.want] : null, t = [];
    if (W && W.order && a.kind === 'de') t.push('<button type="button" class="ez-link" data-fz-order="' + st.want + '">' + W.n + ' für ' + W.price + ' direkt bestellen</button>');
    if (TS_KEY) t.push('<a href="' + waLink(a, 'ich habe eine Frage zu meiner Familie') + '" target="_blank" rel="noopener">Lieber gleich per WhatsApp fragen</a>');
    return t.length ? '<p class="ez-foot">' + t.join('<br>') + '</p>' : '';
  }
  function mailHTML(a) {
    var p = st.pdf, v = verdict(a), r = REG[st.reg], haupt;
    var deutsch = (a.all || [a]).some(function (x) { return !(x.russian || x.kind === 'ru'); });
    var karte = '<section class="ez-card" aria-label="Ihre Angaben"><dl class="ez-kv oben"><div><dt>Name</dt><dd>' + esc(st.name) + '</dd></div>' +
      '<div><dt>Region</dt><dd>' + (st.reg === 'unklar' ? 'noch offen' : r.t) + '<button type="button" class="ez-link" data-ez-back>Ändern</button></dd></div></dl>' +
      (v ? '<p class="ez-status">' + (v.c === 'good' ? HAKEN : '') + '<span><b>' + v.h + '.</b> ' + (v.c === 'good' ? v.p.split('. ')[0].replace(/\.?$/, '.') : v.p) + (TS_KEY ? '' : ' ' + r.src + ' <a href="' + r.u + '">' + r.l + '</a>') + '</span></p>' : '') + '</section>';
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
    st = { name: '', names: [], reg: '', want: '', know: {}, pdf: {}, step: '' };
    ebene(false);
    if (goBtn) { try { goBtn.focus({ preventScroll: true }); } catch (e) {} }
    w.dispatchEvent(new Event('fz:change'));
  }
  function schliessen() {
    if (hist) { var n = hist; hist = 0; still = true; try { history.go(-n); } catch (e) { still = false; } }
    leeren();
  }
  w.addEventListener('popstate', function () {
    if (still) { still = false; return; }
    if (!hist) return;
    hist--;
    if (hist === 1 && st.step === 'mail' && !st.pdf.done) { st.step = 'region'; render(); oben(); return; }
    if (hist) { var n = hist; hist = 0; still = true; try { history.go(-n); } catch (e) { still = false; } }
    hist = 0; leeren();
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && offen) schliessen(); });
  sheet.addEventListener('click', function (e) { if (e.target === sheet || e.target === out) schliessen(); });

  function render() {
    var a = analyseAll();
    out.innerHTML = a.kind === 'bad' ? badHTML(a) : st.pdf.done ? fertigHTML(a) : (st.reg && st.step === 'mail') ? mailHTML(a) : regionHTML(a);
    ebene(true);
    w.dispatchEvent(new Event('fz:change'));
  }

  inp.addEventListener('focus', loadNM);
  inp.addEventListener('pointerdown', loadNM);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = (inp.value || '').replace(/\s+/g, ' ').trim();
    if (v.length < 2) { box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); inp.focus(); return; }
    st.names = splitNames(v); st.name = st.names.join(', '); st.want = st.names.length > 4 ? 'ez' : st.names.length > 1 ? 'fg' : ''; st.know = {}; st.pdf = {}; st.step = 'region';
    npLog('pruefung');
    inp.blur();
    var done = false, go = function () { if (!done) { done = true; render(); oben(); } };
    loadNM().then(go);
    setTimeout(go, 2500);
  });
  out.addEventListener('click', function (e) {
    var lk = e.target.closest('a[href^="https://wa.me"], a[href^="mailto:"]');
    if (lk) npLog(/^mailto/.test(lk.getAttribute('href')) ? 'mail' : 'whatsapp');
    if (e.target.closest('.ez-x, [data-ez-close]')) { schliessen(); return; }
    var b = e.target.closest('[data-reg]');
    if (b) {
      st.reg = b.getAttribute('data-reg'); st.step = 'mail'; npLog('region');
      if (hist === 1) { try { history.pushState({ fz: 2 }, ''); hist = 2; } catch (er) {} }
      render(); oben('fz-pm'); return;
    }
    if (e.target.closest('[data-ez-back]')) {
      if (hist === 2) history.back();
      else { st.step = 'region'; render(); oben(); }
      return;
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
  w.__fz = { deToRu: deToRu, ruToDe: ruToDe, analyse: analyse, stufe: stufe, nameKind: nameKind, loadNM: loadNM, st: function () { return st; }, close: schliessen };
})();
