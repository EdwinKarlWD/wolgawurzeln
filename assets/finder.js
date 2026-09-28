/* Wolgawurzeln: Namensprüfung auf der Titelseite.
   Läuft vollständig im Browser, es wird nichts gespeichert oder gesendet.
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
    hb: { t: 'Aus welcher Kolonie stammt mein Name?', n: 'Herkunftsbericht', price: '39 €', d: 'Kolonie, Herkunft in Deutschland und der Weg der Familie bis heute, jede Angabe mit Quelle. Als PDF in 3 bis 5 Tagen.', order: true },
    fg: { t: 'Woher stammen alle Linien unserer Familie?', n: 'Familiengeschichte', price: '69 €', d: 'Bis zu vier Nachnamen als erzählte Familiengeschichte mit Karte und Zeitleiste. Als PDF in 5 bis 8 Tagen.', order: true },
    ez: { t: 'Wer genau waren meine Vorfahren?', n: 'Einzelfallrecherche', price: '149 € für 3 Stunden', d: 'Gezielte Suche nach Ihren Vorfahren mit Namen und Daten in Kirchenbüchern, Listen und Archivakten. Weitere Stunden nur nach Ihrer Freigabe. Vorab erhalten Sie ein Angebot.', order: false, cta: 'Anfrage per WhatsApp' },
    tr: { t: 'Was steht in einem alten Dokument?', n: 'Transkription', price: 'Preis nach Sichtung', d: 'Alte deutsche Schrift und russische Handschrift, übertragen und erklärt. Schicken Sie ein Foto des Dokuments, Sie erhalten vorab ein Angebot.', order: false, cta: 'Dokument per WhatsApp schicken' }
  };
  var KNOW = { jahre: 'Geburtsjahre der Großeltern', ort: 'Geburtsort oder Dorf', doku: 'Alte Dokumente oder Fotos' };

  var st = { name: '', reg: '', want: '', know: {} };

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
  /* Empfehlung im Ergebnisfeld sichtbar machen, ohne die Seite zu verschieben */
  function showRec(sel) {
    var box2 = out.querySelector('.fz-res'), rc = out.querySelector(sel || '.fz-rec');
    if (!box2 || !rc) return;
    var top = rc.offsetTop - box2.offsetTop, need = top + rc.offsetHeight - box2.clientHeight + 8;
    if (need > box2.scrollTop) { try { box2.scrollTo({ top: need, behavior: 'smooth' }); } catch (e) { box2.scrollTop = need; } }
  }
  function knownList() { return Object.keys(KNOW).filter(function (k) { return st.know[k]; }); }
  function leadText(a, intro) {
    var code = (st.want ? st.want.toUpperCase() : 'NP') + stufe(a);
    var L = ['Hallo Edwin, ' + intro + ' (Namensprüfung ' + code + ').', '', 'Nachname: ' + st.name];
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
  function loadNM() {
    if (nmP) return nmP;
    nmP = new Promise(function (ok) {
      var sc = d.createElement('script'); sc.src = 'assets/namen.js'; sc.async = true;
      sc.onload = function () { NM = w.WW_NM || null; if (NM) { NM.k = {}; NM.known.split(' ').forEach(function (x) { NM.k[x] = 1; }); } ok(NM); };
      sc.onerror = function () { ok(null); };
      d.head.appendChild(sc);
    });
    return nmP;
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

  function factsHTML(a) {
    var facts = [];
    if (a.russian || (a.kind === 'unklar' && !a.cyr)) { /* keine Umschrift anzeigen */ }
    else if (a.cyr) facts.push('<li><span class="fz-k">Deutsche Schreibweise</span>Wahrscheinlich <b>' + a.forms.map(esc).join('</b>, <b>') + '</b>. In russischen Akten wurden deutsche Namen nach Gehör geschrieben, deshalb gibt es oft mehrere Formen.</li>');
    else facts.push('<li><span class="fz-k">In russischen Akten</span>Zum Beispiel als <b lang="ru">' + a.forms.map(esc).join('</b> oder <b lang="ru">') + '</b>. Unter diesen Schreibweisen wird in Archiven in Russland gesucht. <a href="wissen/namen-in-russischen-akten.html">Mehr zu Namen in russischen Akten</a></li>');
    if (a.menno) facts.push('<li><span class="fz-k">Hinweis</span>Der Name ist unter den Russlandmennoniten verbreitet, deren Vorfahren ab 1789 aus dem Weichseldelta an den Dnjepr zogen. <a href="wissen/schwarzes-meer.html#mennoniten">Zu den Mennoniten</a></li>');
    a.colonies.slice(0, 1).forEach(function (c) { facts.push('<li><span class="fz-k">Gut zu wissen</span>An der Wolga gab es eine Kolonie mit diesem Namen: <a href="wissen/' + c[2] + '.html">' + esc(c[0]) + '</a>, gegründet ' + esc(c[4]) + '. Viele Kolonien trugen den Namen ihres ersten Vorstehers. Ob Ihre Familie von dort stammt, sagt der Name allein noch nicht.</li>'); });
    if (a.kind === 'unklar') facts.push('<li><span class="fz-k">Namensform</span>Keine typisch deutsche Namensform. Das schließt eine russlanddeutsche Familie nicht aus: In russischen Akten wurden Namen oft verändert, und häufig liegt die deutsche Linie bei Mutter oder Großmutter. <button type="button" class="fz-again">Anderen Namen prüfen</button></li>');
    if (a.russian) facts.push('<li><span class="fz-k">Herkunft des Namens</span>Russische oder ukrainische Namensform. <button type="button" class="fz-again">Anderen Namen prüfen</button></li>');
    return facts.join('');
  }
  function verdictHTML(a) {
    var v = verdict(a), r = st.reg ? REG[st.reg] : null;
    return v ? '<div class="fz-v fz-' + v.c + '"><p class="fz-vh">' + v.h + '</p><p>' + v.p + '</p>' + (r ? '<p class="fz-src">' + r.src + ' <a href="' + r.u + '">' + r.l + '</a></p>' : '') + '</div>' : '';
  }
  function waLink(a, intro) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(leadText(a, intro)); }
  function mailLink(a, intro, subj) { return 'mailto:edwin@wolgawurzeln.de?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(leadText(a, intro)); }
  function recHTML(a) {
    if (!st.want) return '<p class="fz-alt">Lieber gleich fragen? <a href="' + waLink(a, 'ich habe eine Frage zu meiner Familie') + '" target="_blank" rel="noopener">Nachricht per WhatsApp</a></p>';
    var W = WANT[st.want];
    var intro = W.order ? 'ich interessiere mich für ' + (st.want === 'hb' ? 'den ' : 'die ') + W.n : 'ich interessiere mich für eine ' + W.n;
    if (a.kind !== 'de') {
      var ask = 'ich interessiere mich für ' + (W.order ? (st.want === 'hb' ? 'den ' : 'die ') : 'eine ') + W.n + ' und möchte vorab wissen, ob sich mein Name zuordnen lässt';
      return '<div class="fz-rec"><p class="fz-rk">Vor dem Auftrag</p>' +
        '<p class="fz-rn">' + W.n + ' <b class="num">' + W.price + '</b></p><p class="fz-rd">Bei dieser Namensform schauen wir vorab kostenlos, ob sie in russlanddeutschen Familien vorkommt. So bestellen Sie nur, was auch Ergebnisse bringt.</p>' +
        '<div class="fz-cta"><a class="btn btn-seal" href="' + waLink(a, ask) + '" target="_blank" rel="noopener">Vorab prüfen lassen</a>' +
        (W.order ? '<button type="button" class="btn ghost" data-fz-order="' + st.want + '">Direkt bestellen</button>' : '<a class="btn ghost" href="' + mailLink(a, ask, 'Anfrage ' + W.n + ': ' + st.name) + '">Anfrage per Mail</a>') +
        '</div></div>';
    }
    return '<div class="fz-rec"><p class="fz-rk">Passend zu Ihrer Frage</p>' +
      '<p class="fz-rn">' + W.n + ' <b class="num">' + W.price + '</b></p><p class="fz-rd">' + W.d + '</p>' +
      '<div class="fz-cta">' + (W.order
        ? '<button type="button" class="btn btn-seal" data-fz-order="' + st.want + '">' + W.n + ' bestellen</button><a class="btn ghost" href="' + waLink(a, intro) + '" target="_blank" rel="noopener">Vorher eine Frage stellen</a>'
        : '<a class="btn btn-seal" href="' + waLink(a, intro) + '" target="_blank" rel="noopener">' + W.cta + '</a><a class="btn ghost" href="' + mailLink(a, intro, 'Anfrage ' + W.n + ': ' + st.name) + '">Anfrage per Mail</a>') +
      '</div></div>';
  }

  function render() {
    var prevBox = out.querySelector('.fz-res'), keep = prevBox ? prevBox.scrollTop : 0;
    var a = analyse(st.name);
    if (a.kind === 'bad') {
      out.innerHTML =
        '<div class="fz-res">' +
        '<p class="fz-h">Erste Einschätzung für <b>' + esc(st.name) + '</b></p>' +
        '<div class="fz-v fz-no"><p class="fz-vh">Diesen Namen können wir so nicht zuordnen</p><p>Bitte prüfen Sie die Schreibweise. Geben Sie den Nachnamen so ein, wie er in Urkunden oder alten Pässen steht, gern auch auf Russisch.</p>' +
        '<p><button type="button" class="fz-again">Anderen Namen prüfen</button></p></div>' +
        '<p class="fz-alt">Der Name stimmt so? <a href="' + waLink(a, 'mein Name wurde bei der Namensprüfung nicht erkannt') + '" target="_blank" rel="noopener">Schreiben Sie uns</a></p>' +
        '</div>';
      box.classList.add('has-res');
      w.dispatchEvent(new Event('fz:change'));
      return;
    }
    var regBtns = Object.keys(REG).map(function (k) { return '<button type="button" class="fz-chip" data-reg="' + k + '" aria-pressed="' + (st.reg === k) + '">' + REG[k].t + '</button>'; }).join('');
    var wantBtns = Object.keys(WANT).map(function (k) { return '<button type="button" class="fz-chip" data-want="' + k + '" aria-pressed="' + (st.want === k) + '">' + WANT[k].t + '</button>'; }).join('');
    var knowBtns = Object.keys(KNOW).map(function (k) { return '<button type="button" class="fz-chip" data-know="' + k + '" aria-pressed="' + !!st.know[k] + '">' + KNOW[k] + '</button>'; }).join('');
    out.innerHTML =
      '<div class="fz-res">' +
      '<p class="fz-h">Erste Einschätzung für <b>' + esc(st.name) + '</b></p>' +
      '<ul class="fz-facts">' + factsHTML(a) + '</ul>' +
      '<div class="fz-q"><p class="fz-ql"><span class="fz-n">1</span>Wo lebte die Familie vor 1941?</p><div class="fz-chips">' + regBtns + '</div>' +
      '</div>' +
      '<div class="fz-vwrap">' + verdictHTML(a) + '</div>' +
      '<div class="fz-q fz-q-w"><p class="fz-ql"><span class="fz-n">2</span>Was möchten Sie herausfinden?</p><div class="fz-chips fz-chips-w">' + wantBtns + '</div></div>' +
      (st.want ? '<div class="fz-q fz-q3"><p class="fz-ql"><span class="fz-n">3</span>Was ist schon bekannt? <small>Freiwillig, mehrere möglich</small></p><div class="fz-chips">' + knowBtns + '</div></div>' : '') +
      '<div class="fz-recwrap">' + recHTML(a) + '</div>' +
      '<p class="fz-fine">Welche Kolonie es genau ist und welchen Weg Ihre Familie nahm, klärt der Herkunftsbericht.</p>' +
      '</div>';
    var nb = out.querySelector('.fz-res'); if (nb && keep) nb.scrollTop = keep;
    box.classList.add('has-res');
    w.dispatchEvent(new Event('fz:change'));
  }

  inp.addEventListener('focus', loadNM);
  inp.addEventListener('pointerdown', loadNM);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = (inp.value || '').replace(/\s+/g, ' ').trim();
    if (v.length < 2) { box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); inp.focus(); return; }
    st.name = v; st.want = ''; st.know = {};
    inp.blur();
    var done = false, go = function () { if (!done) { done = true; render(); } };
    loadNM().then(go);
    setTimeout(go, 2500);
  });
  out.addEventListener('click', function (e) {
    var b = e.target.closest('[data-reg]');
    if (b) { st.reg = b.getAttribute('data-reg'); render(); showRec('.fz-q-w'); return; }
    var wb = e.target.closest('[data-want]');
    if (wb) { var k = wb.getAttribute('data-want'); st.want = st.want === k ? '' : k; render(); showRec(); return; }
    var kb = e.target.closest('[data-know]');
    if (kb) { var q = kb.getAttribute('data-know'); st.know[q] = !st.know[q]; render(); return; }
    var ob = e.target.closest('[data-fz-order]');
    if (ob) {
      var trg = d.querySelector('.pk-act [data-order="' + ob.getAttribute('data-fz-order') + '"]'), kn = d.getElementById('order-know'), nm = d.getElementById('order-name');
      if (nm) nm.value = st.name;
      if (kn && !kn.value.trim()) kn.value = knowSummary();
      if (trg) trg.click();
      return;
    }
    if (e.target.closest('.fz-again')) { inp.value = ''; inp.focus(); return; }
    var g = e.target.closest('[data-fz-go]');
    if (g) {
      e.preventDefault();
      var pk = d.getElementById('pakete'), pick = d.querySelector('[data-pick="' + g.getAttribute('data-fz-go') + '"]');
      if (pick) pick.click();
      if (pk) pk.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  var cl = box.querySelector('.fz-close');
  if (cl) cl.addEventListener('click', function () { out.innerHTML = ''; box.classList.remove('has-res'); st = { name: '', reg: '', want: '', know: {} }; w.dispatchEvent(new Event('fz:change')); });

  /* für Tests */
  w.__fz = { deToRu: deToRu, ruToDe: ruToDe, analyse: analyse, stufe: stufe, nameKind: nameKind, loadNM: loadNM, st: function () { return st; } };
})();
