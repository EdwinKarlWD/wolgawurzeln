/* Wolgawurzeln: Namensprüfung auf der Titelseite.
   Läuft vollständig im Browser, es wird nichts gespeichert oder gesendet. */
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
  function colonyByPlace(q) {
    var k = fold(q); if (k.length < 3) return null;
    var exact = null, pre = null;
    COL.forEach(function (c) {
      [c[0]].concat(c[1]).forEach(function (n) {
        var f = fold(n);
        if (f === k) exact = exact || c;
        else if (k.length >= 4 && f.indexOf(k) === 0) pre = pre || c;
      });
    });
    return exact || pre;
  }

  /* Datalist für Dorf oder Kolonie */
  var dl = d.getElementById('fz-dorfe');
  if (dl) {
    var opts = [];
    COL.forEach(function (c) { opts.push(c[0]); c[1].forEach(function (v) { if (opts.indexOf(v) < 0) opts.push(v); }); });
    dl.innerHTML = opts.sort(function (a, b) { return a.localeCompare(b, 'de'); }).map(function (o) { return '<option value="' + esc(o) + '">'; }).join('');
  }

  var REG = {
    wolga: { t: 'An der Wolga', src: 'Für die Wolgakolonien sind die Listen der Ansiedlung von 1764 bis 1767 erhalten, dazu Revisionslisten bis 1857 und Kirchenbücher. Die Erstansiedlerliste nennt oft den Herkunftsort in Deutschland.', u: 'wissen/quellen-der-wolgakolonien.html', l: 'Die Quellen der Wolgakolonien' },
    meer: { t: 'Am Schwarzen Meer', src: 'Für die Kolonien am Schwarzen Meer, in Bessarabien und auf der Krim gibt es evangelische Kirchenbuchduplikate von 1833 bis 1885 und für viele Familien die Einbürgerungsakten der Einwandererzentralstelle aus den Jahren 1940 bis 1945 im Bundesarchiv.', u: 'wissen/schwarzes-meer.html', l: 'Die Schwarzmeerdeutschen' },
    wolhynien: { t: 'In Wolhynien', src: 'Für Wolhynien gibt es die Kirchenbücher der lutherischen Kirchspiele und für die Umgesiedelten von 1939 bis 1944 die Einbürgerungsakten der Einwandererzentralstelle im Bundesarchiv.', u: 'wissen/wolhynien.html', l: 'Die Wolhyniendeutschen' },
    kaukasus: { t: 'Im Kaukasus', src: 'Für die Kolonien im Kaukasus sind Kirchenbücher der lutherischen Gemeinden überliefert, dazu Akten zur Deportation im Herbst 1941.', u: 'wissen/kaukasus.html', l: 'Die Kaukasiendeutschen' },
    unklar: { t: 'Weiß ich nicht', src: 'Die Herkunftsregion lässt sich oft über Unterlagen aus der Zeit nach 1941 eingrenzen: Akten der Sondersiedlung und der Arbeitsarmee nennen meist den Geburtsort, ebenso Aussiedlerpapiere und Geburtsurkunden der Großeltern.', u: 'wissen/deportation-1941.html', l: 'Die Deportation von 1941' }
  };

  var st = { name: '', reg: '', dorf: '', col: null };

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
    return res;
  }

  function verdict(a) {
    if (a.russian && (!st.reg || st.reg === 'unklar')) return { c: 'mid', h: 'Über die deutsche Linie gut möglich', p: 'Der Name selbst ist russischer oder ukrainischer Herkunft. In vielen russlanddeutschen Familien liegt die deutsche Linie bei Mutter, Großmutter oder Großvater. Prüfen Sie am besten auch deren Geburtsnamen.' };
    if (st.col) return { c: 'top', h: 'Sehr gute Voraussetzungen', p: 'Für die Kolonie ' + st.col[0] + ' ist die Quellenlage gut. Wie Ihre Familie dorthin kam und woher sie in Deutschland stammte, lässt sich in der Regel belegen.' };
    if (st.reg && st.reg !== 'unklar') return { c: 'good', h: 'Gute Voraussetzungen', p: 'Für diese Region sind die wichtigen Quellen erhalten. Mit Ihrem Nachnamen und den Geburtsdaten der Großeltern lässt sich die Herkunft meist eingrenzen.' };
    if (st.reg === 'unklar') return { c: 'good', h: 'Das lässt sich klären', p: 'Auch ohne bekannte Region ist die Spur selten verloren. Mit Nachname, Geburtsjahren und Geburtsorten der Großeltern lässt sich die Region fast immer bestimmen.' };
    return null;
  }

  function render() {
    var a = analyse(st.name), facts = [];
    if (a.russian) { /* russische Namensform: keine Umschrift anzeigen */ }
    else if (a.cyr) facts.push('<li><span class="fz-k">Deutsche Schreibweise</span>Wahrscheinlich <b>' + a.forms.map(esc).join('</b>, <b>') + '</b>. In russischen Akten wurden deutsche Namen nach Gehör geschrieben, deshalb gibt es oft mehrere Formen.</li>');
    else facts.push('<li><span class="fz-k">In russischen Akten</span>Zum Beispiel als <b lang="ru">' + a.forms.map(esc).join('</b> oder <b lang="ru">') + '</b>. Unter diesen Schreibweisen wird in Archiven in Russland gesucht. <a href="wissen/namen-in-russischen-akten.html">Mehr zu Namen in russischen Akten</a></li>');
    if (a.menno) facts.push('<li><span class="fz-k">Hinweis</span>Der Name ist unter den Russlandmennoniten verbreitet, deren Vorfahren ab 1789 aus dem Weichseldelta an den Dnjepr zogen. <a href="wissen/schwarzes-meer.html#mennoniten">Zu den Mennoniten</a></li>');
    a.colonies.slice(0, 1).forEach(function (c) { facts.push('<li><span class="fz-k">Gut zu wissen</span>An der Wolga gab es eine Kolonie mit diesem Namen: <a href="wissen/' + c[2] + '.html">' + esc(c[0]) + '</a>, gegründet ' + esc(c[4]) + '. Viele Kolonien trugen den Namen ihres ersten Vorstehers. Ob Ihre Familie von dort stammt, sagt der Name allein noch nicht.</li>'); });
    if (a.russian) facts.push('<li><span class="fz-k">Herkunft des Namens</span>Russische oder ukrainische Namensform. <button type="button" class="fz-again">Anderen Namen prüfen</button></li>');

    var regBtns = Object.keys(REG).map(function (k) { return '<button type="button" class="fz-chip" data-reg="' + k + '" aria-pressed="' + (st.reg === k) + '">' + REG[k].t + '</button>'; }).join('');
    var v = verdict(a), r = st.reg ? REG[st.reg] : null;
    var colInfo = st.col ? '<p class="fz-col"><b>' + esc(st.col[0]) + '</b>, ' + (st.col[3] ? 'Bergseite' : 'Wiesenseite') + ', gegründet ' + esc(st.col[4]) + (st.col[1].length ? ', auch ' + esc(st.col[1].slice(0, 2).join(', ')) : '') + '. <a href="wissen/' + st.col[2] + '.html">Zur Kolonieseite</a></p>' : '';
    var msg = 'Hallo Edwin, ich habe auf wolgawurzeln.de die Namensprüfung gemacht. Nachname: ' + st.name + (st.reg ? '. Region: ' + REG[st.reg].t : '') + (st.dorf ? '. Dorf: ' + st.dorf : '') + '. Was lässt sich zu meiner Familie finden?';
    out.innerHTML =
      '<div class="fz-res">' +
      '<p class="fz-h">Erste Einschätzung für <b>' + esc(st.name) + '</b></p>' +
      '<ul class="fz-facts">' + facts.join('') + '</ul>' +
      '<div class="fz-q"><p class="fz-ql">Wo lebte die Familie vor 1941?</p><div class="fz-chips">' + regBtns + '</div>' +
      (st.reg === 'wolga' ? '<label class="fz-dorf"><span>Dorf oder Kolonie, falls bekannt</span><input id="fz-dorf" list="fz-dorfe" autocomplete="off" value="' + esc(st.dorf) + '" placeholder="zum Beispiel Balzer oder Norka"></label>' + colInfo : '') +
      '</div>' +
      (v ? '<div class="fz-v fz-' + v.c + '"><p class="fz-vh">' + v.h + '</p><p>' + v.p + '</p>' + (r ? '<p class="fz-src">' + r.src + ' <a href="' + r.u + '">' + r.l + '</a></p>' : '') + '</div>' : '') +
      '<div class="fz-cta"><a class="btn btn-seal" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(msg) + '" target="_blank" rel="noopener">Kostenlose Ersteinschätzung</a><a class="btn ghost" href="#pakete" data-fz-go="hb">Herkunftsbericht ansehen</a></div>' +
      '<p class="fz-fine">Welche Kolonie es genau ist und welchen Weg Ihre Familie nahm, klärt der Herkunftsbericht.</p>' +
      '</div>';
    box.classList.add('has-res');
    var di = d.getElementById('fz-dorf');
    if (di) {
      di.addEventListener('change', function () { st.dorf = di.value.trim(); st.col = colonyByPlace(st.dorf); render(); var n = d.getElementById('fz-dorf'); if (n) n.focus(); });
    }
    w.dispatchEvent(new Event('fz:change'));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = (inp.value || '').replace(/\s+/g, ' ').trim();
    if (v.length < 2) { box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); inp.focus(); return; }
    st.name = v; st.dorf = ''; st.col = null;
    render();
    inp.blur();
  });
  out.addEventListener('click', function (e) {
    var b = e.target.closest('[data-reg]');
    if (b) { st.reg = b.getAttribute('data-reg'); if (st.reg !== 'wolga') { st.dorf = ''; st.col = null; } render(); var n = d.getElementById('fz-dorf'); if (n && st.reg === 'wolga') n.focus({ preventScroll: true }); return; }
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
  if (cl) cl.addEventListener('click', function () { out.innerHTML = ''; box.classList.remove('has-res'); st = { name: '', reg: '', dorf: '', col: null }; w.dispatchEvent(new Event('fz:change')); });

  /* für Tests */
  w.__fz = { deToRu: deToRu, ruToDe: ruToDe, analyse: analyse };
})();
