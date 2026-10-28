# AB-Werkstatt

Arbeitsblätter für den Deutschunterricht aus Bausteinen setzen, als A4 ansehen und als PDF oder Word speichern.

**Seite öffnen:** https://moritzbauer171-art.github.io/Abbaukasten/

## Was die Seite kann

- **Reiter je Klasse:** Grundkurs, Klasse 10 und Klasse 9/10. Jeder Reiter hat eine eigene Ablage. Neue Blätter übernehmen Kursbezeichnung, Farbe und Anrede der Klasse (Grundkurs: Sie, Klasse 10 und 9/10: du). Über das Feld „Reiter“ im Kopf lässt sich ein Blatt in eine andere Klasse verschieben.
- **Bausteine:** Material mit automatischen Zeilennummern, Aufgaben, Infokasten, Tabelle, Schreibfläche (Linien oder Kästchen), Überschrift, Absatz, Zitat, Bild, Seitenumbruch.
- **Worterklärungen:** In der Vorschau ein Wort im Material anklicken (oder mehrere Wörter markieren), Erklärung eintippen, Enter. Hochzahl und Fußnote setzt die Seite selbst und nummeriert in Textreihenfolge. Im Editor geht es auch über „+ Worterklärung“.
- **Formatierung der Materialien:** Standard ist Blocksatz mit Serifenschrift. Unter „Formatierung“ in der Materialkarte lassen sich Ausrichtung, Schrift, Schriftgröße, Zeilenabstand, Absatzeinzug, Zeilennummern und ein Rand für Notizen einstellen.
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
