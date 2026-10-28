# AB-Werkstatt

Arbeitsblätter für den Deutschunterricht aus Bausteinen setzen, als A4 ansehen und als PDF oder Word speichern.

**Seite öffnen:** https://moritzbauer171-art.github.io/Abbaukasten/

## Was die Seite kann

- **Reiter je Klasse:** Grundkurs, Klasse 10 und Klasse 9/10. Jeder Reiter hat eine eigene Ablage. Neue Blätter übernehmen Kursbezeichnung, Farbe und Anrede der Klasse (Grundkurs: Sie, Klasse 10 und 9/10: du). Über das Feld „Reiter“ im Kopf lässt sich ein Blatt in eine andere Klasse verschieben.
- **Bausteine:** Material mit automatischen Zeilennummern, Aufgaben, Infokasten, Tabelle, Schreibfläche (Linien oder Kästchen), Überschrift, Absatz, Zitat, Bild, Seitenumbruch.
- **Worterklärungen:** In der Vorschau ein Wort im Material anklicken (oder mehrere Wörter markieren), Erklärung eintippen, Enter. Hochzahl und Fußnote setzt die Seite selbst und nummeriert in Textreihenfolge. Im Editor geht es auch über „+ Worterklärung“.
- **Formatierung der Materialien:** Standard ist Blocksatz mit Serifenschrift. Unter „Formatierung“ in der Materialkarte lassen sich Ausrichtung, Schrift, Schriftgröße, Zeilenabstand, Absatzeinzug, Zeilennummern und ein Rand für Notizen einstellen.
- **Designs:** Im Kopf zwischen Klar, Akte (Schreibmaschine, Stempel, Lochung, Papierton), Zeitung (Fraktur-Kopf, Linien) und Tagebuch (Handschrift, Randlinie) wählen. Akte und Zeitung sind einfarbig. Die Word-Datei bleibt im schlichten Standardlayout.
- **Sozialformen:** Jede Aufgabe kann ein Piktogramm für Einzelarbeit, Partnerarbeit, Gruppenarbeit oder Plenum bekommen (auch im Word-Export).
- **Ausgaben:** Neben den Reitern wählen Sie zwischen Arbeitsblatt, Tippkarten und Tafelkarten. PDF und Drucken geben immer das aus, was die Vorschau zeigt.
- **Lehrerfassung:** Unter jeder Aufgabe „Erwartung“ öffnen und Stichpunkte eintragen. Über der Vorschau zwischen Schüler- und Lehrerfassung wechseln; der Erwartungshorizont lässt sich auch als Markdown-Datei speichern.
- **Gruppenblätter:** In „Weitere Einstellungen“ Gruppenblätter A und B einschalten, Bausteine über ⋯ einer Gruppe zuordnen und über der Vorschau Gruppe A oder B ausgeben.
- **Gestufte Hilfen:** Unter jeder Aufgabe bis zu drei Tipps eintragen; sie erscheinen als Tippkarten zum Ausschneiden.
- **Tafelkarten:** Begriff und Stichpunkte eintragen, heraus kommen Karten mit farbigem Rahmen. Einstellbar sind das Format (A4 quer oder A5 quer, zwei pro Blatt), die Schriftgröße (größtmöglich, einheitlich oder fest in pt), die Aufteilung (Stichpunkte pro Karte oder höchstens so viele Wörter pro Karte) und ein Hinweis bei zu langen Stichpunkten.
- **QR-Code:** Baustein für Videos und Online-Quellen, mit Titel und Quellenangabe.
- **Klausur:** Im Kopf „Klausur“ wählen. Die erste Seite wird zum Deckblatt (ohne Thema-Feld und Hinweiskasten), die Gewichtung steht bei den Aufgaben.
- **Sammlung:** Bausteine über ⋯ speichern und in jedes Blatt einfügen; eine Operatorenübersicht ist vorbereitet.
- **Zeilenangaben:** In der Vorschau auf eine Zeilennummer klicken (für einen Bereich danach auf die letzte Zeile) und die Angabe in das zuletzt benutzte Aufgaben- oder Erwartungsfeld einfügen.
- **Einfügen aus PDFs:** Trennstriche am Zeilenende und mitkopierte Zeilennummern werden beim Einfügen entfernt.
- **Genderzeichen:** Hinweis bei Sternchen, Doppelpunkt, Unterstrich oder Binnen-I in eigenen Texten, mit Vorschlag zum Ausschreiben.
- **2 × A5:** Über der Vorschau „2 × A5“ wählen; jede Seite wird zweimal auf A4 quer gesetzt, mit Schnittlinie.
- **Operator-Check:** erkennt Operatoren in Sie- und du-Form und zeigt den Anforderungsbereich an. Grundlage ist der IQB-Grundstock Deutsch.
- **Ausgabe:** PDF zum Drucken, Word-Datei (.docx) zum Weiterbearbeiten oder direkt drucken.
- **Sicherung:** „Meine Blätter“ → „Alle Blätter sichern (.json)“ lädt alle Blätter als Datei herunter, „Sicherung laden“ spielt sie wieder ein, auch in einem anderen Browser.

## Wo die Blätter liegen

Solange die Online-Ablage ausgeschaltet ist, speichert die Seite **nur im Browser**, in dem Sie arbeiten. Wer den Browserverlauf samt Websitedaten löscht, löscht auch die Blätter. Deshalb ab und zu eine Sicherung herunterladen.

## Online-Ablage mit Supabase einschalten (später)

1. Im Supabase-Dashboard das Projekt öffnen (z. B. „ABs“).
2. **SQL Editor** → Inhalt von [`supabase/schema.sql`](supabase/schema.sql) einfügen → **Run**. Das legt die Tabelle `worksheets` an. Jedes Konto sieht nur seine eigenen Blätter.
3. **Authentication → URL Configuration:** als *Site URL* `https://moritzbauer171-art.github.io/Abbaukasten/` eintragen. Dann führen Bestätigungs- und Passwort-Links zurück auf diese Seite.
4. **Project Settings → API:** *Project URL* und *Publishable key* kopieren und in `index.html` eintragen:
   ```js
   const SUPABASE = { url: 'https://xxxx.supabase.co', key: 'sb_publishable_…' };
   ```
   Der Publishable key ist für öffentliche Webseiten gedacht. Den *secret key* niemals hier eintragen.
5. Seite neu laden → **Anmelden** → einmal **Konto anlegen**. Blätter, die bisher nur im Browser lagen, lassen sich mit „Online übernehmen“ hochladen.
6. Empfehlung: Danach unter **Authentication → Sign In / Providers** „Allow new users to sign up“ ausschalten, damit niemand sonst Konten anlegt.

## Dateien

- `index.html`: die ganze Anwendung in einer Datei
- `supabase/schema.sql`: Tabelle und Zugriffsregeln für die Online-Ablage
