/* Wolgawurzeln: englische Texte für die Skripte der Seite. Schlüssel ist der deutsche Text.
   Fehlt ein Eintrag, bleibt der deutsche Text stehen. */
(function (w) {
  'use strict';
  w.WW_SPRACHE = 'en';
  var X = {
    'Herkunftsbericht': 'Origin report',
    'Familiengeschichte': 'Family history',
    '49 €': '€49', '78 €': '€78', '89 €': '€89', '118 €': '€118',
    'Lieferung als PDF in 3 bis 5 Tagen.': 'Delivered as a PDF in 3 to 5 days.',
    'Lieferung als PDF in 5 bis 8 Tagen.': 'Delivered as a PDF in 5 to 8 days.',
    'Ich verlange ausdrücklich, dass mit der Erstellung schon vor Ablauf der Widerrufsfrist begonnen wird. Mir ist bekannt, dass mein Widerrufsrecht mit Beginn der Ausführung erlischt.': 'I expressly request that work on the report begins before the withdrawal period ends. I know that my right of withdrawal expires once performance begins.',
    'Bestellnummer: ': 'Order number: ',
    'Nachname der Familie: ': 'Family surname: ',
    'E-Mail: ': 'Email: ',
    'Sprache des Berichts: ': 'Report language: ',
    'Deutsch': 'German', 'Russisch': 'Russian', 'Englisch': 'English',
    'Telefon: ': 'Phone: ',
    'Das weiß ich schon: ': 'What I already know: ',
    'Guten Tag, ich möchte {art} {name} ({preis}) bestellen und per Überweisung oder PayPal bezahlen.': 'Hello, I would like to order the {name} ({preis}) and pay by PayPal or bank transfer.',
    ' Zusätzlich hätte ich gern das gedruckte Fotobuch (29 €).': ' I would also like the printed photo book (€29).',
    'Bitte oben den Nachnamen der Familie eintragen, dann wird der Bestellknopf frei.': 'Please enter the family surname above, then the order button becomes active.',
    'Bitte Ihre E-Mail eintragen, damit wir uns bei Ihnen melden können. Dann wird der Bestellknopf frei.': 'Please enter your email so that Wolgawurzeln can contact you. Then the order button becomes active.',
    'Bitte den Bearbeitungsbeginn bestätigen (Kästchen oben), dann wird der Bestellknopf frei.': 'Please confirm the start of work (box above), then the order button becomes active.',
    'Auftrag: ': 'Order: ',
    ' mit Fotobuch, ': ' with photo book, ',
    'Bestellung ': 'Order ',
    'Die gesicherte Bezahlseite ist in einem neuen Fenster geöffnet. Nach der Zahlung sehen Sie unsere Bestätigungsseite.': 'The secure payment page has opened in a new window. After payment you see our confirmation page.',
    'Bezahlseite erneut öffnen': 'Open payment page again',
    'WhatsApp ist mit Ihrer Bestellung geöffnet. Bitte senden Sie die Nachricht dort ab, Sie erhalten dann die Zahlungsdaten.': 'WhatsApp has opened with your order. Please send the message there, you then receive the payment details.',
    'WhatsApp erneut öffnen': 'Open WhatsApp again',
    'Ihr Mailprogramm ist mit Ihrer Bestellung geöffnet. Bitte senden Sie die Mail ab, Sie erhalten dann die Zahlungsdaten.': 'Your email program has opened with your order. Please send the email, you then receive the payment details.',
    'Mail erneut öffnen': 'Open email again',
    'Bitte füllen Sie Name, Mailadresse und Nachname der Familie aus.': 'Please fill in your name, your email address and the family surname.',
    'Anfrage über wolgawurzeln.de': 'Request via wolgawurzeln.de',
    'Name: ': 'Name: ',
    'Herkunftsort oder Region: ': 'Village or region: ',
    'Anliegen: ': 'Question: ',
    'Anfrage: ': 'Request: ',
    'Das Senden hat gerade nicht geklappt. Bitte versuchen Sie es noch einmal oder {a}schreiben Sie uns per Mail{/a}.': 'Sending did not work just now. Please try again or {a}write to us by email{/a}.',
    'Wird gesendet': 'Sending',
    'Anfrage senden': 'Send request',
    'Ihre Anfrage ist eingegangen': 'Your request has been received',
    'Vielen Dank, {name}. Wolgawurzeln meldet sich in der Regel innerhalb eines Tages persönlich bei Ihnen, per Mail an {mail}.': 'Thank you, {name}. Wolgawurzeln usually replies to you personally within a day, by email to {mail}.',
    'Ihr Vorgang: ': 'Your reference: ',
    'Bitte prüfen Sie die Mailadresse.': 'Please check the email address.',
    'Heute sind von Ihnen schon mehrere Anfragen eingegangen. Wir melden uns.': 'Several requests from you have already arrived today. You will hear from Wolgawurzeln.',
    'Vertrauenspunkte, seitlich verschiebbar': 'How we work, swipe sideways',
    'Alle {n} Fragen anzeigen': 'Show all {n} questions',
    'Nachname Ihrer Familie': 'Surname of your family',
    'Starten': 'Start',
    'Nachname': 'Surname',
    'Kostenlos und unverbindlich, gern auch auf Russisch.': 'Free and without obligation.',
    'Lieber eine Nachricht schreiben': 'Write a message instead'
  };
  w.WW_TEXTE = X;
  w.WW_T = function (s) { return Object.prototype.hasOwnProperty.call(X, s) ? X[s] : s; };
})(window);
