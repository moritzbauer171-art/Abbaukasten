/* ================= Hilfen je Operator: gestufte Tipps, Schritte für die Basis-Fassung, Satzanfänge =================
   {du-Form|Sie-Form} wird je nach Anrede des Blatts aufgelöst. ph: Formulierungshilfen-Vorlagen (Überschriften), starts: eigene Satzanfänge. */
const duSie = (s, du) => String(s).replace(/\{([^|{}]*)\|([^{}]*)\}/g, (m, a, b) => (du ? a : b));
const OPH_FAM = { wiedergeben: 'wieder', zusammenfassen: 'wieder', skizzieren: 'wieder', nennen: 'nennen', benennen: 'nennen',
  beschreiben: 'beschreib', darstellen: 'beschreib', aufzeigen: 'beschreib',
  analysieren: 'analyse', untersuchen: 'analyse', erschließen: 'analyse', herausarbeiten: 'analyse',
  interpretieren: 'interpret', deuten: 'interpret', charakterisieren: 'charakter',
  vergleichen: 'vergleich', gegenüberstellen: 'vergleich', 'in Beziehung setzen': 'vergleich',
  erläutern: 'erlaeutern', erklären: 'erlaeutern', begründen: 'erlaeutern', belegen: 'erlaeutern', nachweisen: 'erlaeutern',
  erörtern: 'eroertern', diskutieren: 'eroertern', abwägen: 'eroertern', 'sich auseinandersetzen': 'eroertern',
  beurteilen: 'urteil', bewerten: 'urteil', 'Stellung nehmen': 'urteil', überprüfen: 'urteil', prüfen: 'urteil',
  gestalten: 'gestalt', verfassen: 'gestalt', entwerfen: 'gestalt', entwickeln: 'gestalt', einordnen: 'einordnen', zuordnen: 'einordnen',
  'Hypothesen aufstellen': 'hypo', formulieren: 'hypo', planen: 'planen', protokollieren: 'protokoll', dokumentieren: 'protokoll',
  zeichnen: 'zeichnen', beschriften: 'zeichnen', erstellen: 'zeichnen', auswerten: 'auswerten',
  ableiten: 'ableiten', herleiten: 'ableiten', verallgemeinern: 'ableiten', beweisen: 'ableiten', anwenden: 'ableiten',
  berechnen: 'rechnen', abschätzen: 'rechnen', bestimmen: 'rechnen', klassifizieren: 'ordnen', ordnen: 'ordnen' };
const OPH = {
  wieder: { tips: ['{Lies|Lesen Sie} den Text abschnittsweise und {notiere|notieren Sie} zu jedem Abschnitt ein Stichwort.', '{Beginne|Beginnen Sie} mit einem Einleitungssatz (Verfasser, Titel, Textsorte, Thema) und {gib|geben Sie} dann den Inhalt in eigenen Worten im Präsens wieder.', '{Bleibe|Bleiben Sie} sachlich: keine Zitate, keine Wertung, nur das Wichtigste in der Reihenfolge des Textes.'],
    steps: ['{Lies|Lesen Sie} den Text und {markiere|markieren Sie} die wichtigsten Aussagen.', '{Teile|Teilen Sie} den Text in Abschnitte ein und {notiere|notieren Sie} zu jedem ein Stichwort.', '{Schreibe|Schreiben Sie} einen Einleitungssatz: Verfasser, Titel, Textsorte, Thema.', '{Schreibe|Schreiben Sie} zu jedem Abschnitt ein bis zwei Sätze im Präsens.'],
    ph: ['Einleitung', 'Aussagen wiedergeben', 'Darstellung wiedergeben'], sh: 'Zusammenfassen', starts: ['In dem Text „…“ von … geht es um …', 'Zu Beginn …', 'Anschließend …', 'Abschließend …', 'Der Verfasser vertritt die Auffassung, dass …'] },
  nennen: { tips: ['{Suche|Suchen Sie} im Material die passenden Stellen und {markiere|markieren Sie} sie.', 'Stichworte genügen; eine Erklärung ist nicht verlangt.'],
    steps: ['{Unterstreiche|Unterstreichen Sie} in der Aufgabe, wonach gefragt ist.', '{Markiere|Markieren Sie} die passenden Stellen im Material.', '{Schreibe|Schreiben Sie} sie als Stichworte auf.'] },
  beschreib: { tips: ['{Schau|Schauen Sie} genau hin und {notiere|notieren Sie} in Stichworten, was auffällt.', '{Ordne|Ordnen Sie} die Stichworte sinnvoll, zum Beispiel in der Reihenfolge des Textes oder vom Allgemeinen zum Besonderen.', '{Schreibe|Schreiben Sie} sachlich im Präsens und mit Fachbegriffen; gedeutet wird noch nicht.'],
    steps: ['{Markiere|Markieren Sie} in der Aufgabe, worum es gehen soll.', '{Notiere|Notieren Sie} die wichtigsten Merkmale in Stichworten.', '{Bringe|Bringen Sie} die Stichworte in eine sinnvolle Reihenfolge.', '{Schreibe|Schreiben Sie} sachlich in ganzen Sätzen im Präsens.'],
    sh: 'Beschreiben', starts: ['Auffällig ist …', 'Der Text ist in … Abschnitte gegliedert.', 'Zu Beginn …, danach …', 'Es fällt auf, dass …'] },
  analyse: { tips: ['{Kläre|Klären Sie} zuerst, worum es geht und unter welchem Gesichtspunkt {du den Text untersuchen sollst|Sie den Text untersuchen sollen}.', '{Suche|Suchen Sie} drei bis vier auffällige Stellen und {notiere|notieren Sie} jeweils: Was steht da? Welches Mittel? Welche Wirkung?', '{Verbinde|Verbinden Sie} immer Beobachtung, Beleg und Deutung: „Durch … (Z. …) wird deutlich, dass …“'],
    steps: ['{Lies|Lesen Sie} den Text zweimal und {markiere|markieren Sie} auffällige Stellen.', '{Notiere|Notieren Sie} zu drei Stellen: Was steht da? Welches Mittel? Welche Wirkung?', '{Schreibe|Schreiben Sie} zu jeder Stelle einen Satz mit Beobachtung, Zeilenangabe und Deutung.', '{Halte|Halten Sie} am Ende in zwei Sätzen fest, was der Text insgesamt zeigt.'],
    ph: ['Sprachliche Mittel deuten', 'Zitieren und Belegen'] },
  analyse_lyrik: { name: 'Gedicht', tips: ['{Lies|Lesen Sie} das Gedicht zweimal, gern halblaut, und {halte|halten Sie} {deinen|Ihren} ersten Eindruck fest: Worum geht es, welche Stimmung entsteht?', '{Untersuche|Untersuchen Sie} die Form: Strophen, Verse, Reimschema, Metrum. {Frage dich|Fragen Sie sich}, ob die Form zum Inhalt passt.', '{Suche|Suchen Sie} sprachliche Bilder wie Metapher, Vergleich oder Personifikation und {deute|deuten Sie} sie mit Versangabe: „Die Metapher … (V. …) zeigt …“'],
    steps: ['{Lies|Lesen Sie} das Gedicht zweimal und {notiere|notieren Sie} {deinen|Ihren} ersten Eindruck in einem Satz.', '{Zähle|Zählen Sie} Strophen und Verse und {notiere|notieren Sie} das Reimschema.', '{Markiere|Markieren Sie} drei sprachliche Bilder und {schreibe|schreiben Sie} dazu, welches Stilmittel es ist.', '{Schreibe|Schreiben Sie} zu jedem Bild: Was steht da (V. …)? Was bedeutet es?', '{Halte|Halten Sie} in zwei Sätzen fest, was das Gedicht aussagt.'],
    ph: ['Einleitung', 'Sprachliche Mittel deuten', 'Zitieren und Belegen'] },
  analyse_drama: { name: 'Szene', tips: ['{Ordne|Ordnen Sie} die Szene ein: Was ist vorher passiert, was folgt danach?', '{Untersuche|Untersuchen Sie} das Gesprächsverhalten: Wer spricht wie viel, wer bestimmt das Thema, wie reagieren die Figuren aufeinander?', '{Achte|Achten Sie} auf Regieanweisungen, Satzbau und Wortwahl und {deute|deuten Sie} sie mit Zeilenangabe.'],
    steps: ['{Schreibe|Schreiben Sie} in zwei Sätzen auf, was vor der Szene geschieht.', '{Notiere|Notieren Sie} für jede Figur: Was will sie? Wie spricht sie?', '{Markiere|Markieren Sie} zwei Stellen, an denen sich das Gespräch wendet.', '{Schreibe|Schreiben Sie} mit Zeilenangaben auf, was diese Stellen über die Figuren zeigen.'],
    ph: ['Einleitung', 'Zitieren und Belegen'], sh: 'Gesprächsverhalten', starts: ['… ergreift zuerst das Wort und …', '… reagiert auf … mit …', 'Die Regieanweisung „…“ (Z. …) zeigt, dass …', 'Das Gespräch wendet sich, als …'] },
  analyse_epik: { name: 'Erzähltext', tips: ['{Kläre|Klären Sie} die Erzählsituation: Wer erzählt, aus welcher Sicht, wie viel weiß die Erzählinstanz?', '{Untersuche|Untersuchen Sie}, wie Zeit und Raum gestaltet sind und wie die Figuren dargestellt werden.', '{Belege|Belegen Sie} jede Beobachtung mit einer Textstelle und {erkläre|erklären Sie} ihre Funktion für die Aussage des Textes.'],
    steps: ['{Schreibe|Schreiben Sie} die Handlung in drei Sätzen auf.', '{Kläre|Klären Sie}, wer erzählt und aus welcher Sicht.', '{Markiere|Markieren Sie} drei Stellen, die eine Figur oder die Stimmung zeigen.', '{Schreibe|Schreiben Sie} zu jeder Stelle mit Zeilenangabe auf, was sie bewirkt.'],
    ph: ['Einleitung', 'Zitieren und Belegen'] },
  analyse_prag: { name: 'Sachtext', tips: ['{Bestimme|Bestimmen Sie} Thema, Textsorte und Adressaten: Wer schreibt für wen und mit welcher Absicht?', '{Gliedere|Gliedern Sie} die Argumentation: These, Argumente, Beispiele, Schluss, jeweils mit Zeilen.', '{Untersuche|Untersuchen Sie} sprachliche Mittel wie rhetorische Fragen, Wortwahl oder Anaphern und {erkläre|erklären Sie}, wie sie die Absicht stützen.'],
    steps: ['{Notiere|Notieren Sie} Verfasser, Textsorte, Thema und Adressaten.', '{Unterstreiche|Unterstreichen Sie} die Hauptthese und {nummeriere|nummerieren Sie} die Argumente.', '{Markiere|Markieren Sie} drei auffällige sprachliche Mittel.', '{Schreibe|Schreiben Sie} zu jedem Mittel mit Zeilenangabe auf, welche Wirkung es haben soll.'],
    ph: ['Einleitung', 'Argumentieren', 'Sprachliche Mittel deuten'] },
  interpret: { tips: ['{Formuliere|Formulieren Sie} nach dem ersten Lesen eine Deutungshypothese: Worum geht es eigentlich?', '{Prüfe|Prüfen Sie} die Hypothese am Text: Welche Stellen stützen sie, welche sprechen dagegen?', '{Beziehe|Beziehen Sie} Form, Sprache und Kontext (Epoche, Autor, Entstehungszeit) ein und {kehre|kehren Sie} am Schluss zur Hypothese zurück.'],
    steps: ['{Schreibe|Schreiben Sie} {deinen|Ihren} ersten Eindruck in einem Satz auf.', '{Mache|Machen Sie} daraus eine Deutungshypothese.', '{Suche|Suchen Sie} drei Textstellen, die die Hypothese stützen, und {schreibe|schreiben Sie} zu jeder einen Satz.', '{Schau|Schauen Sie} am Schluss, ob die Hypothese noch stimmt, und {ergänze|ergänzen Sie} sie, wenn nötig.'],
    ph: ['Zitieren und Belegen'], sh: 'Deuten', starts: ['Der Text lässt sich als … verstehen.', 'Meine Deutungshypothese lautet: …', 'Dafür spricht die Stelle „…“ (Z. …).', 'Gestützt wird diese Deutung durch …', 'Insgesamt bestätigt sich, dass …'] },
  charakter: { tips: ['{Sammle|Sammeln Sie} Informationen zur Figur: äußere Merkmale, Lebenssituation, Verhalten, Sprache.', '{Unterscheide|Unterscheiden Sie}, was direkt über die Figur gesagt wird und was ihr Verhalten indirekt zeigt.', '{Fasse|Fassen Sie} die Eigenschaften zu einem Gesamtbild zusammen und {belege|belegen Sie} jede mit einer Textstelle.'],
    steps: ['{Notiere|Notieren Sie} äußere Merkmale und die Lebenssituation der Figur.', '{Markiere|Markieren Sie} drei Stellen, an denen ihr Verhalten etwas über sie verrät.', '{Schreibe|Schreiben Sie} zu jeder Stelle eine Eigenschaft auf.', '{Schreibe|Schreiben Sie} ein Gesamtbild der Figur mit Zeilenangaben.'],
    sh: 'Charakterisieren', starts: ['… wird als … dargestellt.', 'Ihr Verhalten zeigt, dass …', 'An der Stelle „…“ (Z. …) wird deutlich, dass …', 'Insgesamt wirkt die Figur …'] },
  vergleich: { tips: ['{Lege|Legen Sie} Vergleichspunkte fest, zum Beispiel Thema, Haltung, Sprache oder Form.', '{Lege|Legen Sie} eine Tabelle an (Vergleichspunkt, Text 1, Text 2) und {trage|tragen Sie} Gemeinsamkeiten und Unterschiede ein.', '{Schreibe|Schreiben Sie} Punkt für Punkt, nicht erst alles zu einem Text, und {ziehe|ziehen Sie} am Ende ein Fazit.'],
    steps: ['{Lege|Legen Sie} drei Vergleichspunkte fest.', '{Trage|Tragen Sie} zu jedem Punkt in eine Tabelle ein, was in beiden Texten steht.', '{Markiere|Markieren Sie} Gemeinsamkeiten und Unterschiede farbig.', '{Schreibe|Schreiben Sie} zu jedem Punkt einen Absatz und {ziehe|ziehen Sie} ein Fazit.'],
    ph: ['Vergleichen'] },
  erlaeutern: { tips: ['{Kläre|Klären Sie}, was genau erläutert werden soll, und {notiere|notieren Sie} die Kernaussage in einem Satz.', '{Begründe|Begründen Sie} die Aussage: Warum ist das so? {Nutze|Nutzen Sie} {dein|Ihr} Wissen aus dem Unterricht.', '{Mache|Machen Sie} es an einem Beispiel oder einer Textstelle anschaulich: „Das zeigt sich etwa an …“'],
    steps: ['{Schreibe|Schreiben Sie} die Aussage, um die es geht, in einem Satz auf.', '{Schreibe|Schreiben Sie} auf, warum das so ist.', '{Füge|Fügen Sie} ein Beispiel oder eine Textstelle hinzu.', '{Schließe|Schließen Sie} mit einem Satz, der alles bündelt.'],
    sh: 'Erläutern', starts: ['Damit ist gemeint, dass …', 'Das lässt sich dadurch erklären, dass …', 'Ein Beispiel dafür ist …', 'Das zeigt sich etwa an …', 'Daraus folgt, dass …'] },
  eroertern: { tips: ['{Formuliere|Formulieren Sie} die Streitfrage als Frage und {sammle|sammeln Sie} in einer Tabelle Argumente dafür und dagegen.', '{Ordne|Ordnen Sie} die Argumente nach Gewicht, das stärkste zuletzt. Jedes Argument braucht Behauptung, Begründung und Beispiel.', '{Baue|Bauen Sie} den Text so auf: Einleitung mit Hinführung, Hauptteil (erst die Gegenseite, dann die eigene Seite), Schluss mit begründetem Urteil.'],
    steps: ['{Schreibe|Schreiben Sie} die Streitfrage als Frage auf.', '{Sammle|Sammeln Sie} in einer Tabelle je drei Argumente dafür und dagegen.', '{Ergänze|Ergänzen Sie} zu jedem Argument eine Begründung und ein Beispiel.', '{Entscheide dich|Entscheiden Sie sich} und {schreibe|schreiben Sie} im Schluss, warum.'],
    ph: ['Argumentieren', 'Urteilen und Schluss'] },
  urteil: { tips: ['{Kläre|Klären Sie} die Kriterien: Woran {misst du dein|messen Sie Ihr} Urteil, etwa Überzeugungskraft, Wirkung oder Angemessenheit?', '{Wäge|Wägen Sie} ab, was dafür und was dagegen spricht, und {belege|belegen Sie} beides.', '{Formuliere|Formulieren Sie} ein eigenes, begründetes Urteil: „Insgesamt überzeugt …, weil …“'],
    steps: ['{Lege|Legen Sie} fest, nach welchem Kriterium {du urteilst|Sie urteilen}.', '{Notiere|Notieren Sie}, was dafür und was dagegen spricht.', '{Schreibe|Schreiben Sie} {dein|Ihr} Urteil in einem Satz auf.', '{Stütze|Stützen Sie} es mit mindestens zwei Argumenten.'],
    ph: ['Urteilen und Schluss', 'Bewerten'], sh: 'Urteilen', starts: ['Meiner Ansicht nach …, weil …', 'Überzeugend ist …, da …', 'Weniger überzeugend ist …', 'Insgesamt komme ich zu dem Urteil, dass …'] },
  gestalt: { tips: ['{Kläre|Klären Sie} Textsorte, Situation und Perspektive: Wer schreibt an wen, wann und warum?', '{Sammle|Sammeln Sie} Anknüpfungspunkte im Ausgangstext: Was weiß die Figur, was fühlt sie, wie spricht sie?', '{Achte|Achten Sie} auf die Merkmale der Textsorte und {bleibe|bleiben Sie} nah am Ausgangstext.'],
    steps: ['{Kläre|Klären Sie}: Wer schreibt, an wen, in welcher Situation?', '{Notiere|Notieren Sie} drei Gedanken oder Gefühle der Figur mit passender Textstelle.', '{Schreibe|Schreiben Sie} in der passenden Form.', '{Lies|Lesen Sie} {deinen|Ihren} Text noch einmal: Passt er zur Figur und zur Situation?'] },
  gestalt_monolog: { name: 'innerer Monolog', tips: ['{Kläre|Klären Sie} die Situation: An welcher Stelle der Handlung denkt die Figur, und was ist gerade passiert?', '{Sammle|Sammeln Sie} im Text, was die Figur weiß, fühlt und befürchtet.', '{Schreibe|Schreiben Sie} in der Ich-Form und im Präsens, mit Fragen, Ausrufen und Gedankensprüngen, und {bleibe|bleiben Sie} nah am Text.'],
    steps: ['{Kläre|Klären Sie}, in welcher Situation die Figur gerade ist.', '{Notiere|Notieren Sie} drei Gedanken oder Gefühle der Figur mit Textstelle.', '{Schreibe|Schreiben Sie} in der Ich-Form und im Präsens.', '{Lies|Lesen Sie} noch einmal: Passt alles zu dem, was die Figur im Text weiß?'],
    sh: 'Innerer Monolog', starts: ['Ich kann nicht glauben, dass …', 'Warum nur …?', 'Eigentlich wollte ich …', 'Vielleicht sollte ich …', 'Was, wenn …?'] },
  gestalt_brief: { name: 'Brief', tips: ['{Kläre|Klären Sie}, wer an wen schreibt und aus welchem Anlass.', '{Sammle|Sammeln Sie} im Text, was die schreibende Figur weiß und was sie bewegt.', '{Achte|Achten Sie} auf die Briefform (Ort und Datum, Anrede, Schlussformel) und {wähle|wählen Sie} einen Ton, der zur Figur passt.'],
    steps: ['{Notiere|Notieren Sie}, wer an wen und warum schreibt.', '{Sammle|Sammeln Sie} drei Dinge, die die Figur sagen will, mit Textstelle.', '{Schreibe|Schreiben Sie} den Brief mit Ort, Datum, Anrede und Gruß.', '{Lies|Lesen Sie} den Brief noch einmal: Passt der Ton zur Figur?'],
    sh: 'Brief', starts: ['Liebe …, lieber …,', 'ich schreibe dir, weil …', 'Seit … geht mir nicht aus dem Kopf, dass …', 'Bitte versteh, dass …', 'Viele Grüße'] },
  argumente: { name: 'Argumente', tips: ['{Lies|Lesen Sie} das Material und {markiere|markieren Sie} Argumente dafür und dagegen in zwei Farben.', '{Notiere|Notieren Sie} jedes Argument in einem eigenen Satz mit Zeilenangabe.', '{Ordne|Ordnen Sie} die Argumente in einer Tabelle nach Pro und Contra und {achte|achten Sie} darauf, wer sie vertritt.'],
    steps: ['{Markiere|Markieren Sie} Argumente dafür grün und dagegen rot.', '{Schreibe|Schreiben Sie} jedes Argument in einem Satz mit Zeilenangabe auf.', '{Trage|Tragen Sie} sie in eine Tabelle mit Pro und Contra ein.'],
    ph: ['Argumentieren'] },
  einordnen_handlung: { name: 'Handlung', tips: ['{Rufe|Rufen Sie} {dir|sich} in Erinnerung, was unmittelbar vor der Stelle geschieht.', '{Überlege|Überlegen Sie}, was danach folgt und was sich durch die Stelle verändert.', '{Erläutere|Erläutern Sie} die Funktion der Stelle für den Fortgang der Handlung oder für die Figurenkonstellation.'],
    steps: ['{Schreibe|Schreiben Sie} in zwei Sätzen auf, was vorher geschieht.', '{Schreibe|Schreiben Sie} in einem Satz auf, was danach folgt.', '{Halte|Halten Sie} fest, was sich durch die Stelle ändert.'] },
  einordnen: { tips: ['{Rufe|Rufen Sie} {dir|sich} in Erinnerung, was {du|Sie} über Epoche, Autor oder Zusammenhang {weißt|wissen}.', '{Suche|Suchen Sie} im Text Merkmale, die dazu passen, und {notiere|notieren Sie} sie mit Zeilenangabe.', '{Stelle|Stellen Sie} den Zusammenhang her: „Typisch für … ist …; das zeigt sich hier in …“'],
    steps: ['{Notiere|Notieren Sie} drei Merkmale der Epoche oder des Zusammenhangs.', '{Suche|Suchen Sie} zu jedem Merkmal eine passende Textstelle.', '{Schreibe|Schreiben Sie} dazu, warum die Stelle typisch ist.'],
    ph: ['Historisch einordnen'], sh: 'Einordnen', starts: ['Der Text lässt sich … zuordnen, weil …', 'Typisch für … ist …', 'Das zeigt sich hier an …'] },
  // Geschichte und Politik
  gp_quelle: { name: 'Quelle', tips: ['{Kläre|Klären Sie} die formalen Merkmale: Verfasser, Entstehungszeit, Adressat, Quellengattung.', '{Gib|Geben Sie} den Inhalt gegliedert wieder und {arbeite|arbeiten Sie} die Position des Verfassers heraus.', '{Ordne|Ordnen Sie} die Quelle in den historischen Zusammenhang ein und {prüfe|prüfen Sie}, welche Absicht und Perspektive sie erkennen lässt.'],
    steps: ['{Notiere|Notieren Sie} Verfasser, Zeit, Adressat und Quellengattung.', '{Unterstreiche|Unterstreichen Sie} die wichtigsten Aussagen des Verfassers.', '{Schreibe|Schreiben Sie} sie in eigenen Worten mit Zeilenangaben auf.', '{Schreibe|Schreiben Sie} auf, was der Verfasser erreichen wollte.'],
    ph: ['Quelle einleiten', 'Aussagen wiedergeben', 'Historisch einordnen'] },
  gp_bild: { name: 'Bildquelle', tips: ['{Beschreibe|Beschreiben Sie} zuerst genau, was zu sehen ist: Personen, Gegenstände, Text, Bildaufbau.', '{Deute|Deuten Sie} die Bildelemente: Wofür stehen Personen, Symbole und Größenverhältnisse?', '{Ordne|Ordnen Sie} das Bild in den Zusammenhang ein und {formuliere|formulieren Sie} die Aussage des Zeichners oder der Zeichnerin.'],
    steps: ['{Notiere|Notieren Sie}, wer das Bild wann und wo veröffentlicht hat.', '{Schreibe|Schreiben Sie} auf, was im Vordergrund und im Hintergrund zu sehen ist.', '{Schreibe|Schreiben Sie} zu zwei Symbolen, wofür sie stehen.', '{Schreibe|Schreiben Sie} die Aussage des Bildes in einem Satz auf.'],
    ph: ['Karikatur beschreiben', 'Karikatur deuten'] },
  gp_stat: { name: 'Statistik', tips: ['{Kläre|Klären Sie} Thema, Quelle, Zeitraum und Einheiten der Darstellung.', '{Beschreibe|Beschreiben Sie} die wichtigsten Entwicklungen: Höchst- und Tiefstwerte, Trends, Brüche.', '{Erkläre|Erklären Sie} die Entwicklung mit {deinem|Ihrem} Wissen und {prüfe|prüfen Sie}, was die Darstellung nicht zeigt.'],
    steps: ['{Notiere|Notieren Sie} Thema, Zeitraum und Einheit.', '{Markiere|Markieren Sie} den höchsten und den niedrigsten Wert.', '{Schreibe|Schreiben Sie} die Entwicklung in drei Sätzen auf.', '{Schreibe|Schreiben Sie} eine mögliche Ursache dazu.'],
    ph: ['Statistik auswerten'] },
  gp_sach: { name: 'Sachurteil', tips: ['{Kläre|Klären Sie}, worum es im Urteil geht, und {lege|legen Sie} Kriterien fest, etwa Ziele, Mittel und Folgen.', '{Prüfe|Prüfen Sie} die Sache am Material und an {deinem|Ihrem} Wissen: Was spricht dafür, was dagegen?', '{Formuliere|Formulieren Sie} ein Sachurteil aus der damaligen Zeit heraus, ohne heutige Werte anzulegen.'],
    steps: ['{Lege|Legen Sie} ein Kriterium fest, etwa: Wurde das Ziel erreicht?', '{Notiere|Notieren Sie} aus dem Material, was dafür und was dagegen spricht.', '{Schreibe|Schreiben Sie} {dein|Ihr} Urteil in einem Satz auf.', '{Stütze|Stützen Sie} es mit zwei Argumenten aus dem Material.'],
    ph: ['Sach- und Werturteil'] },
  gp_wert: { name: 'Werturteil', tips: ['{Kläre|Klären Sie} zuerst die Sache: Was ist geschehen, wer war beteiligt, mit welchen Folgen?', '{Lege|Legen Sie} offen, welche Werte {du anlegst|Sie anlegen}, etwa Menschenwürde, Freiheit oder Gerechtigkeit.', '{Formuliere|Formulieren Sie} ein begründetes Werturteil aus heutiger Sicht und {nimm|nehmen Sie} eine Gegenposition auf.'],
    steps: ['{Schreibe|Schreiben Sie} in zwei Sätzen auf, worum es geht.', '{Schreibe|Schreiben Sie} auf, nach welchem Wert {du urteilst|Sie urteilen}.', '{Schreibe|Schreiben Sie} {dein|Ihr} Urteil auf und {stütze|stützen Sie} es mit Argumenten.', '{Greife|Greifen Sie} eine andere Sicht auf und {antworte|antworten Sie} darauf.'],
    ph: ['Sach- und Werturteil', 'Argumentieren'] },
  gp_einordnen: { name: 'historisch', tips: ['{Rufe|Rufen Sie} {dir|sich} den historischen Zusammenhang in Erinnerung: Was geschah vorher, was danach?', '{Verknüpfe|Verknüpfen Sie} Aussagen des Materials mit diesem Wissen.', '{Erkläre|Erklären Sie}, was das Material vor diesem Hintergrund verständlich macht.'],
    steps: ['{Schreibe|Schreiben Sie} auf, was {du|Sie} über die Zeit {weißt|wissen}.', '{Markiere|Markieren Sie} im Material Stellen, die dazu passen.', '{Schreibe|Schreiben Sie} auf, was das Material vor diesem Hintergrund verständlich macht.'],
    ph: ['Historisch einordnen'] },
  // Biologie
  bio_auswerten: { name: 'Daten und Versuch', tips: ['{Beschreibe|Beschreiben Sie} zuerst die Ergebnisse: Welche Werte, welche Tendenz?', '{Vergleiche|Vergleichen Sie} Versuchs- und Kontrollansatz oder die Messreihen miteinander.', '{Ziehe|Ziehen Sie} eine Schlussfolgerung und {prüfe|prüfen Sie}, ob sie die Hypothese bestätigt oder widerlegt.'],
    steps: ['{Schreibe|Schreiben Sie} die Ergebnisse mit Werten auf.', '{Lege|Legen Sie} die Werte neben die des Kontrollansatzes.', '{Schreibe|Schreiben Sie} auf, wie sich das Ergebnis biologisch erklären lässt.', '{Entscheide|Entscheiden Sie}, ob die Hypothese stimmt.'],
    ph: ['Diagramm beschreiben', 'Ergebnis und Fehlerbetrachtung'] },
  bio_diagramm: { name: 'Diagramm', tips: ['{Kläre|Klären Sie} zuerst, was auf den Achsen dargestellt ist und in welchen Einheiten.', '{Beschreibe|Beschreiben Sie} den Verlauf abschnittsweise mit Werten: Anstieg, Maximum, Abfall.', '{Bleibe|Bleiben Sie} bei dem, was das Diagramm zeigt; erklärt wird erst danach.'],
    steps: ['{Notiere|Notieren Sie}, was auf der x-Achse und auf der y-Achse steht.', '{Markiere|Markieren Sie} den höchsten und den niedrigsten Wert.', '{Schreibe|Schreiben Sie} den Verlauf in drei Sätzen mit Werten auf.'],
    ph: ['Diagramm beschreiben'] },
  bio_beobachten: { name: 'Beobachtung', tips: ['{Notiere|Notieren Sie} genau, was sich zeigt: Farbe, Form, Menge, Messwerte.', '{Trenne|Trennen Sie} Beobachtung und Deutung: erst beschreiben, dann erklären.', '{Vergleiche|Vergleichen Sie} mit dem Kontrollansatz.'],
    steps: ['{Schau|Schauen Sie} genau hin und {notiere|notieren Sie}, was sich verändert.', '{Halte|Halten Sie} Messwerte in einer Tabelle fest.', '{Schreibe|Schreiben Sie} nur auf, was zu sehen ist, noch ohne Erklärung.'],
    ph: ['Beobachtung beschreiben'] },
  bio_erklaeren: { tips: ['{Nenne|Nennen Sie} zuerst den Sachverhalt, der erklärt werden soll.', '{Führe|Führen Sie} ihn auf biologische Ursachen oder Prinzipien zurück, etwa Struktur und Funktion oder das Schlüssel-Schloss-Prinzip.', '{Verknüpfe|Verknüpfen Sie} Ursache und Wirkung in ganzen Sätzen: „…, weil …, sodass …“'],
    steps: ['{Schreibe|Schreiben Sie} auf, was erklärt werden soll.', '{Schreibe|Schreiben Sie} die biologische Ursache dazu.', '{Verbinde|Verbinden Sie} Ursache und Wirkung mit „weil“ oder „dadurch“.'],
    ph: ['Erklären (Ursache und Wirkung)'] },
  hypo: { tips: ['{Formuliere|Formulieren Sie} die Fragestellung: Was soll herausgefunden werden?', '{Stelle|Stellen Sie} eine begründete Vermutung auf: „Wenn …, dann …, weil …“', '{Überlege|Überlegen Sie}, mit welchem Versuch sich die Hypothese prüfen lässt.'],
    steps: ['{Schreibe|Schreiben Sie} die Frage auf, die geklärt werden soll.', '{Schreibe|Schreiben Sie} {deine|Ihre} Vermutung als Wenn-dann-Satz.', '{Ergänze|Ergänzen Sie} mit „weil …“, warum {du das vermutest|Sie das vermuten}.'],
    ph: ['Hypothese formulieren'] },
  planen: { tips: ['{Lege|Legen Sie} fest, welche Größe {du veränderst|Sie verändern} und was {du misst|Sie messen}.', '{Halte|Halten Sie} alle anderen Bedingungen gleich und {plane|planen Sie} einen Kontrollansatz.', '{Beschreibe|Beschreiben Sie} Material, Durchführung und erwartete Ergebnisse so, dass jemand anderes den Versuch nachmachen kann.'],
    steps: ['{Schreibe|Schreiben Sie} auf, was {du veränderst|Sie verändern} und was {du misst|Sie messen}.', '{Lege|Legen Sie} fest, was gleich bleiben muss.', '{Überlege dir|Überlegen Sie sich} einen Kontrollansatz.', '{Liste|Listen Sie} Material und Arbeitsschritte auf.'],
    ph: ['Hypothese formulieren'] },
  protokoll: { tips: ['{Gliedere|Gliedern Sie} das Protokoll: Frage, Hypothese, Material, Durchführung, Beobachtung, Auswertung.', '{Trenne|Trennen Sie} streng, was {du beobachtest|Sie beobachten}, von der Deutung.', '{Halte|Halten Sie} Messwerte in einer Tabelle fest und {schreibe|schreiben Sie} sachlich im Präsens.'],
    steps: ['{Schreibe|Schreiben Sie} Frage und Hypothese auf.', '{Liste|Listen Sie} Material und Durchführung auf.', '{Trage|Tragen Sie} die Messwerte in eine Tabelle ein.', '{Halte|Halten Sie} getrennt davon fest, wie {du die Ergebnisse deutest|Sie die Ergebnisse deuten}.'],
    ph: ['Beobachtung beschreiben', 'Ergebnis und Fehlerbetrachtung'] },
  zeichnen: { tips: ['{Zeichne|Zeichnen Sie} mit Bleistift, groß und ohne Schattierungen.', '{Beschrifte|Beschriften Sie} mit geraden Linien ohne Pfeilspitzen, die Begriffe waagerecht am Rand.', '{Ergänze|Ergänzen Sie} Überschrift und Vergrößerung oder Maßstab.'],
    steps: ['{Nimm|Nehmen Sie} einen spitzen Bleistift und {nutze|nutzen Sie} die ganze Fläche.', '{Ziehe|Ziehen Sie} klare Linien ohne Schattierungen.', '{Setze|Setzen Sie} die Begriffe waagerecht an den Rand und {verbinde|verbinden Sie} sie mit geraden Linien.', '{Ergänze|Ergänzen Sie} Überschrift und Vergrößerung.'] },
  bio_bewerten: { tips: ['{Stelle|Stellen Sie} die Sachinformationen zusammen: Was ist biologisch gesichert?', '{Benenne|Benennen Sie} die berührten Werte, etwa Gesundheit, Tierwohl oder Naturschutz, und die Sicht der Beteiligten.', '{Wäge|Wägen Sie} die Handlungsmöglichkeiten ab und {formuliere|formulieren Sie} ein begründetes Urteil.'],
    steps: ['{Schreibe|Schreiben Sie} die wichtigsten Fakten aus dem Material auf.', '{Notiere|Notieren Sie}, welche Werte berührt sind und wer betroffen ist.', '{Sammle|Sammeln Sie} Gründe für und gegen jede Handlungsmöglichkeit.', '{Entscheide dich|Entscheiden Sie sich} und {schreibe|schreiben Sie} auf, warum.'],
    ph: ['Bewerten'] },
  bio_vergleich: { tips: ['{Lege|Legen Sie} Vergleichskriterien fest, etwa Bau, Funktion oder Lebensraum.', '{Stelle|Stellen Sie} Gemeinsamkeiten und Unterschiede in einer Tabelle gegenüber.', '{Ziehe|Ziehen Sie} ein Fazit: Was folgt aus dem Vergleich?'],
    steps: ['{Lege|Legen Sie} drei Merkmale fest, auf die {du achtest|Sie achten}.', '{Trage|Tragen Sie} sie in eine Tabelle ein.', '{Markiere|Markieren Sie} Gemeinsamkeiten und Unterschiede.', '{Schreibe|Schreiben Sie} ein Fazit in einem Satz.'],
    ph: ['Vergleichen'] },
  ableiten: { tips: ['{Gehe|Gehen Sie} vom Material aus: Was ist gegeben?', '{Wende|Wenden Sie} eine bekannte Regel oder Gesetzmäßigkeit darauf an.', '{Formuliere|Formulieren Sie} die Schlussfolgerung: „Daraus folgt, dass …“'],
    steps: ['{Schreibe|Schreiben Sie} auf, was im Material gegeben ist.', '{Suche|Suchen Sie} eine passende Regel aus dem Unterricht.', '{Schreibe|Schreiben Sie} auf, was daraus folgt.'],
    ph: ['Erklären (Ursache und Wirkung)'] },
  rechnen: { tips: ['{Notiere|Notieren Sie} die gegebenen Größen mit Einheiten.', '{Wähle|Wählen Sie} den passenden Rechenweg oder die Formel.', '{Rechne|Rechnen Sie} mit Einheiten und {prüfe|prüfen Sie}, ob das Ergebnis plausibel ist.'],
    steps: ['{Schreibe|Schreiben Sie} die gegebenen Größen mit Einheiten auf.', '{Suche|Suchen Sie} die passende Formel.', '{Setze|Setzen Sie} die Werte mit Einheiten ein.', '{Schau|Schauen Sie}, ob das Ergebnis plausibel ist.'] },
  ordnen: { tips: ['{Lege|Legen Sie} das Ordnungskriterium fest.', '{Ordne|Ordnen Sie} jedes Element zu und {begründe|begründen Sie} kurz.'],
    steps: ['{Lege|Legen Sie} fest, wonach sortiert wird.', '{Gehe|Gehen Sie} die Elemente einzeln durch.', '{Schreibe|Schreiben Sie} zu jedem kurz, warum es dorthin gehört.'] } };
// Worauf sich die Aufgabe bezieht: genanntes Material (M1, Q2 …) oder das einzige Material des Blatts
function ophCtx(it) {
  const sh = state.sheet, tags = matTags(sh.blocks), txt = plainText(it.text || '');
  const byTag = Object.entries(tags).map(([id, t]) => [t, sh.blocks.find(x => x.id === id)]).filter(([, x]) => x);
  let refs = byTag.filter(([t]) => new RegExp('(^|[^\\p{L}\\d])' + escRe(t) + '(?!\\d)', 'u').test(txt)).map(([, x]) => x);
  if (!refs.length) { const mats = sh.blocks.filter(x => x.type === 'material'); refs = mats.length === 1 ? mats : []; refs = refs.concat(sh.blocks.filter(x => (x.type === 'image' || x.type === 'table') && !refs.includes(x))); }
  return refs.map(x => [x.type === 'image' ? 'bild' : '', x.form === 'gedicht' ? 'gedicht' : '', x.post ? 'beitrag' : '', x.mk === 'q' ? 'quelle' : x.mk === 'd' ? 'darstellung' : '', plainText(x.title || ''), plainText(x.caption || '')].join(' ')).join(' ');
}
function ophFor(it) {
  const ops = detectOps(it.text || ''); let op = ops.length ? ops[0].op : '';
  // Ohne erkannten Operator: typische Aufgaben trotzdem erkennen
  let lab = op;
  if (!op) { const p = plainText(it.text || '').toLowerCase(); [op, lab] = /deutungshypothese/.test(p) ? ['deuten', 'Deutungshypothese'] : /hypothese/.test(p) ? ['Hypothesen aufstellen', 'Hypothese'] : /stellung|meinung/.test(p) ? ['Stellung nehmen', 'Stellungnahme'] : ['', '']; }
  if (!op) return null; let fam = OPH_FAM[op]; if (!fam) return null;
  const fach = fachKey(); const t = (plainText(it.text || '') + ' ' + ophCtx(it)).toLowerCase();
  if (op === 'formulieren') fam = /hypothes|vermut/.test(t) ? 'hypo' : 'erlaeutern';
  let key = fam;
  if (fam === 'analyse') key = /gedicht|lyri|strophe|vers\b|verse/.test(t) ? 'analyse_lyrik' : /szene|drama|dramen|dialog|regieanweis/.test(t) ? 'analyse_drama'
    : /erzähl|roman|novelle|kurzgeschichte|parabel|fabel|märchen/.test(t) ? 'analyse_epik' : /sachtext|rede\b|kommentar|artikel|essay|beitrag|zeitung|glosse|interview|reportage|argumentation|these\b/.test(t) ? 'analyse_prag' : 'analyse';
  if (fam === 'einordnen' && /handlung|szene|figurenkonstellation|kapitel|akt\b/.test(t)) key = 'einordnen_handlung';
  if (op === 'darstellen' && /position|these|aussage|standpunkt/.test(t)) key = 'wieder';
  if (['analyse', 'beschreib', 'wieder'].includes(fam) && /\bargumente\b|pro und contra|für und gegen/.test(t)) key = 'argumente';
  if (fam === 'gestalt') key = /monolog|tagebuch|gedanken/.test(t) ? 'gestalt_monolog' : /brief/.test(t) ? 'gestalt_brief' : 'gestalt';
  if (fach === 'gp') {
    const gpKind = /karikatur|plakat|foto|gemälde|bildelement|bildquelle|zeichner/.test(t) ? 'gp_bild' : /statistik|diagramm|grafik|schaubild|entwicklung/.test(t) ? 'gp_stat' : /quelle|verfasser/.test(t) ? 'gp_quelle' : '';
    if ((fam === 'analyse' || fam === 'interpret') && key !== 'argumente') key = gpKind || 'gp_quelle';
    if ((fam === 'beschreib' || fam === 'wieder') && gpKind && key !== 'argumente') key = gpKind;
    if (fam === 'erlaeutern' && gpKind === 'gp_bild') key = gpKind;
    if (fam === 'urteil') key = ['beurteilen', 'überprüfen', 'prüfen'].includes(op) ? 'gp_sach' : 'gp_wert';
    if (fam === 'einordnen') key = 'gp_einordnen';
  }
  if (fach === 'bio') {
    if (['analyse', 'interpret', 'auswerten'].includes(fam)) key = 'bio_auswerten';
    if (fam === 'erlaeutern') key = 'bio_erklaeren';
    if ((fam === 'beschreib' || fam === 'wieder') && key !== 'argumente') key = /diagramm|grafik|kurve|messwert|tabelle/.test(t) ? 'bio_diagramm' : /versuch|beobacht|experiment/.test(t) ? 'bio_beobachten' : key;
    if (fam === 'urteil' || fam === 'eroertern') key = 'bio_bewerten';
    if (fam === 'vergleich') key = 'bio_vergleich';
  }
  const H = OPH[key] || OPH[fam]; return H ? { op: lab, key, H } : null;
}
function ophStarts(H) {
  const sets = phraseSets(); const found = (H.ph || []).map(h => sets.find(p => p.head === h)).filter(Boolean);
  if (found.length) return found.map(p => ({ head: p.head, text: p.lines.join('\n') }));
  return H.starts ? [{ head: H.sh || 'Satzanfänge', text: H.starts.join('\n') }] : [];
}
function ophBasis(it, H) {
  const du = state.sheet.meta.anrede === 'du';
  return String(it.text || '').trim() + '\n' + (du ? 'So gehst du vor:' : 'So gehen Sie vor:') + '\n' + (H.steps || H.tips).map((x, j) => `${j + 1}. ${duSie(x, du)}`).join('\n');
}
function ophBox(b, i, it, nT) {
  const S = ophFor(it); if (!S) return '';
  const du = state.sheet.meta.anrede === 'du'; const key = `oph:${b.id}:${i}`;
  const head = `<b>Hilfen zu „${esc(S.op)}“</b>${S.H.name ? `<span> · ${esc(S.H.name)}</span>` : ''}`;
  if (nT && !state.fmtOpen.has(key)) return `<div class="oph-mini">${head}<button class="link" type="button" data-act="oph-peek" data-i="${i}">Vorschlag ansehen</button></div>`;
  const hasSt = ophStarts(S.H).length > 0;
  return `<div class="oph"><div class="oph-h">${head}</div><ol>${S.H.tips.map(x => `<li>${esc(duSie(x, du))}</li>`).join('')}</ol>
    <div class="oph-a"><button class="btn sm primary" type="button" data-act="oph-tips" data-i="${i}">${nT ? 'Tipps ersetzen' : 'Als Tipps übernehmen'}</button>${hasSt ? `<button class="btn sm" type="button" data-act="oph-starts" data-i="${i}">Satzanfänge als Baustein</button>` : ''}${state.sheet.meta.levelsOn ? `<button class="btn sm" type="button" data-act="oph-basis" data-i="${i}">Basis-Fassung daraus</button>` : ''}</div></div>`;
}
function ophInsertStarts(bid, groups) {
  const blocks = state.sheet.blocks; const idx = blocks.findIndex(x => x.id === bid); if (idx < 0 || !groups.length) return 0;
  const nx = blocks[idx + 1]; let added = 0;
  if (nx && nx.type === 'phrases') {
    const gs = Array.isArray(nx.groups) ? nx.groups : (nx.groups = []);
    if (gs.length === 1 && !String(gs[0].head || '').trim() && !String(gs[0].text || '').trim()) gs.length = 0;
    groups.forEach(g => { if (!gs.some(x => x.head === g.head)) { gs.push(g); added++; } });
    return added;
  }
  const nb = newBlock('phrases'); nb.groups = groups; blocks.splice(idx + 1, 0, nb); return groups.length;
}

