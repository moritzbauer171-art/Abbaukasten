/* ================= Datenmodell ================= */
function defaultMeta(nr, klasse) {
  const k = KL(klasse);
  return { nr: nr || '', title: '', topic: '', course: k.course, school: k.school,
    fmtV: 2, showName: true, showDate: true, showAFB: false, opBold: true, accent: k.accent, lineStep: 5, anrede: k.anrede, design: k.stufe === 'gs' ? 'fibel' : 'klar', headGap: 'n', botGap: 'n',
    mode: 'blatt', exam: { label: 'Klausur', halbjahr: '', datum: '', zeit: '', hilfsmittel: 'Wörterbuch der deutschen Rechtschreibung' },
    levelsOn: false, lvTip: true, groupsOn: false, groups: [{ k: 'A', name: '', add: 'für Gruppe 1 und 3' }, { k: 'B', name: '', add: 'für Gruppe 2 und 4' }], paper: 'a4', cardsPer: 3, kk: { ...KK_DEF } };
}
// Quelle oder Darstellung als Text oder als Bild: derselbe Baustein wechselt die Form, Nummer und Angaben bleiben
const srcFormSeg = b => (b.mk === 'q' || b.mk === 'd') ? `<div class="f src-form"><span>${b.mk === 'q' ? 'Quelle als' : 'Darstellung als'}</span><div class="seg sm" role="group" aria-label="Form der Quelle"><button type="button" data-act="src-form" data-v="material" aria-pressed="${b.type === 'material'}">Text</button><button type="button" data-act="src-form" data-v="image" aria-pressed="${b.type === 'image'}">Bild</button></div></div>` : '';
function srcFormSet(b, to) {
  if (!b || b.type === to || !['material', 'image'].includes(to)) return;
  const d = newBlock(to); for (const k of Object.keys(d)) if (k !== 'id' && k !== 'type' && b[k] === undefined) b[k] = d[k];
  if (to === 'image' && !tfStr(b.caption).trim()) b.caption = b.title || '';
  if (to === 'material' && !tfStr(b.title).trim()) b.title = b.caption || '';
  b.type = to;
}
function newBlock(type) {
  const id = 'b' + uid();
  switch (type) {
    case 'heading': return { id, type, text: '' };
    case 'text': return { id, type, text: '' };
    case 'material': return { id, type, title: '', text: '', glossary: [], source: '', lineNumbers: true, fmt: {}, memo: '', nl: 1 };
    case 'tasks': return { id, type, title: '', restart: false, items: [{ text: '', tag: '' }] };
    case 'info': return { id, type, kind: 'Merke', title: '', text: '' };
    case 'chat': return { id, type, title: '', style: 'gruen', head: { name: 'Lerngruppe Deutsch', sub: '' }, people: [{ n: 'Ich' }, { n: 'Lea' }, { n: 'Tom' }],
      msgs: [{ p: 1, t: 'Habt ihr die Aufgabe für morgen schon?', z: '18:02' }, { p: 2, t: 'Welche Aufgabe?? 😅', z: '18:04' }, { p: 0, t: '', z: '18:05' }],
      opt: { time: true, names: true, read: true, frame: true, bar: true }, width: 72, fiktiv: true };
    case 'table': return { id, type, title: '', cols: ['', '', ''], rows: [['', '', ''], ['', '', ''], ['', '', '']], rowHeight: 'normal', firstBold: false };
    case 'lines': return { id, type, count: 8, style: 'linien' };
    case 'gsa': return { id, type, gk: 'kreuz', title: '', mode: '', items: [{ t: '', ok: true }, { t: '', ok: false }, { t: '', ok: true }], words: '', text: '', lin: '', mb: false, size: '10', dirs: 'hv', showList: true, count: true, per: '1', fh: '80', rows: 3, seed: 1 + Math.floor(Math.random() * 1e6), src: '', ex: '' };
    case 'quote': return { id, type, text: '', author: '' };
    case 'qr': return { id, type, url: '', title: '', note: '', size: 'M' };
    case 'match': { const du = state.sheet && state.sheet.meta && state.sheet.meta.anrede === 'du'; return { id, type, title: du ? 'Verbinde, was zusammengehört.' : 'Verbinden Sie, was zusammengehört.', mode: 'linien', seed: Math.floor(Math.random() * 1e9), pairs: Array.from({ length: 4 }, () => ({ a: '', b: '' })) }; }
    case 'image': return { id, type, src: '', w: 0, h: 0, caption: '', source: '', width: 80 };
    case 'poem': return { ...newBlock('material'), form: 'gedicht' };
    case 'phrases': return { id, type, title: 'Formulierungshilfen', cols: 2, groups: [{ head: '', text: '' }] };
    case 'step': return { id, type, tpl: '', title: '', ph: '', min: '', soz: '', fol: 'text', head: '', text: '', quote: '', author: '', src: '', cap: '', link: '', note: '', eh: '', media: '', exit: false, qs: '' };
    case 'a3': return a3Norm({ id, type, tpl: 'placemat', title: '', taskRef: '', task: '', mat: '', impulse: '', rules: A3_RULES(state.sheet && state.sheet.meta.anrede === 'du') });
    case 'tafel': return { id, type, tpl: 'gegen', title: '', onSheet: 'luecke', gapMode: 'eintrag', keepFirst: false, cols: ['', ''], rows: [['', ''], ['', ''], ['', '']], center: '', branches: [{ h: '', t: '' }, { h: '', t: '' }, { h: '', t: '' }, { h: '', t: '' }], steps: [{ h: '', t: '' }, { h: '', t: '' }, { h: '', t: '' }], poles: { l: '', r: '', m: '' }, scale: [{ t: '', p: 2 }, { t: '', p: 4 }], nodes: [{ n: '', d: '' }, { n: '', d: '' }, { n: '', d: '' }], rels: [{ a: 0, b: 1, t: '' }] };
    default: return { id, type: 'pagebreak' };
  }
}
function blankSheet(nr, klasse) {
  const m = newBlock('material'); const t = newBlock('tasks');
  return { id: 'ab-' + uid(), klasse: KL(klasse).id, example: false, updatedAt: Date.now(), meta: { ...defaultMeta(nr, klasse), title: 'Neues Arbeitsblatt' }, blocks: [m, t] };
}
/* ---------- Vorlagen für neue Blätter ---------- */
// Jede Vorlage bringt typische Bausteine mit; Aufgaben stehen je nach Klasse in der Sie- oder du-Form.
const TPL = [
  { k: 'leer', label: 'Leeres Blatt', d: 'Material und Aufgaben', ic: 'text' },
  { k: 'gedicht', label: 'Gedichtanalyse', d: 'Gedicht, Aufgaben, Tabelle für sprachliche Mittel, Formulierungshilfen', ic: 'poem' },
  { k: 'sachtext', label: 'Sachtextanalyse', d: 'Text, Argumentationsstruktur, Tabelle, Formulierungshilfen', ic: 'material' },
  { k: 'eroerterung', label: 'Erörterung', d: 'Aufbau, Pro-und-Contra-Tabelle, Schreibfläche', ic: 'table' },
  { k: 'szene', label: 'Szenenanalyse', d: 'Dramenszene, Gesprächsverhalten, Figurentabelle', ic: 'phrases' },
  { k: 'stationen', label: 'Stationenarbeit', d: 'Drei Stationen mit Material und Aufgaben, je eine Seite', ic: 'tasks' },
  { k: 'klausur', label: 'Klausur', d: 'Deckblatt, Material, zwei Aufgaben mit Gewichtung', ic: 'meta' }
];
const TPL_GP = [
  { k: 'leer', label: 'Leeres Blatt', d: 'Material und Aufgaben', ic: 'text' },
  { k: 'g-quelle', title: 'Quellenanalyse', label: 'Textquelle', d: 'Quelle mit Zeilen, Quellenanalyse in drei Schritten, Steckbrief, Formulierungshilfen', ic: 'quelle' },
  { k: 'g-bild', title: 'Karikaturanalyse', label: 'Karikatur, Bildquelle', d: 'Beschriftetes Bild, Beschreiben – Deuten – Beurteilen, Tabelle', ic: 'image' },
  { k: 'g-darst', title: 'Darstellung analysieren', label: 'Darstellung', d: 'Text aus der Forschung, These und Argumente, Überprüfung', ic: 'darstellung' },
  { k: 'g-stat', title: 'Statistik auswerten', label: 'Statistik, Schaubild', d: 'Schaubild, Auswertung in vier Schritten, Formulierungshilfen', ic: 'table' },
  { k: 'g-urteil', label: 'Urteilsbildung', d: 'Streitfrage, Pro und Contra, Sach- und Werturteil', ic: 'phrases' },
  { k: 'g-chronik', label: 'Zeitleiste', d: 'Darstellung, Ereignisse ordnen, Bedeutung erläutern', ic: 'zeitleiste' },
  { k: 'stationen', label: 'Stationenarbeit', d: 'Drei Stationen mit Material und Aufgaben, je eine Seite', ic: 'tasks' },
  { k: 'g-klausur', label: 'Klausur', d: 'Deckblatt, Quelle, drei Aufgaben (AFB I–III) mit Gewichtung', ic: 'meta' }
];
const TPL_BIO = [
  { k: 'leer', label: 'Leeres Blatt', d: 'Material und Aufgaben', ic: 'text' },
  { k: 'b-versuch', title: 'Versuchsprotokoll', label: 'Versuch', d: 'Erkenntnisweg, Protokoll von der Frage bis zur Auswertung, Fläche für den Aufbau', ic: 'protokoll' },
  { k: 'b-diagramm', title: 'Diagramm auswerten', label: 'Diagramm', d: 'Abbildung, Auswertung in Schritten, Formulierungshilfen', ic: 'image' },
  { k: 'b-zeichnen', title: 'Mikroskopieren und Zeichnen', label: 'Zeichnen', d: 'Regeln für biologische Zeichnungen, freie Zeichenfläche', ic: 'zeichnung' },
  { k: 'b-abb', title: 'Abbildung beschriften', label: 'Abbildung beschriften', d: 'Abbildung mit Nummern, Tabelle für Bezeichnung und Funktion', ic: 'image' },
  { k: 'b-text', title: 'Fachtext erschließen', label: 'Fachtext', d: 'Text mit Zeilen, Fachbegriffe, Fließdiagramm', ic: 'material' },
  { k: 'b-steckbrief', title: 'Steckbrief', label: 'Steckbrief', d: 'Lebewesen mit Bild, Merkmale und Angepasstheit', ic: 'tasks' },
  { k: 'b-bewerten', title: 'Bewerten', label: 'Bewerten', d: 'Streitfrage, Sachinformation, Werte, Pro und Contra', ic: 'phrases' },
  { k: 'stationen', label: 'Stationenarbeit', d: 'Drei Stationen mit Material und Aufgaben, je eine Seite', ic: 'tasks' },
  { k: 'b-klausur', label: 'Klausur', d: 'Deckblatt, Material und Abbildung, drei Aufgaben (AFB I–III)', ic: 'meta' }
];
const tplsFor = kl => ({ gp: TPL_GP, bio: TPL_BIO })[fachBase(kl)] || TPL;
const isKlausurTpl = k => k === 'klausur' || k === 'g-klausur' || k === 'b-klausur';
function tplSheet(key, kl) {
  const sh = blankSheet(nextNr(kl), kl); const du = sh.meta.anrede === 'du'; const T = (sie, d) => (du ? d : sie);
  const B = (type, o) => Object.assign(newBlock(type), o);
  const tasks = (list, o = {}) => B('tasks', { title: o.title || '', items: list.map(x => ({ text: Array.isArray(x) ? T(x[0], x[1]) : x.text, tag: '', ...(x.pts ? { pts: x.pts } : {}) })) });
  const PH = heads => B('phrases', { groups: heads.map(h => { const p = [...PHRASE_SETS_GP, ...PHRASE_SETS_BIO, ...PHRASE_SETS].find(x => x.head === h); return { head: p.head, text: p.lines.join('\n') }; }) });
  const rowsOf = (cols, first, h) => B('table', { cols, rows: first.map(f => [f, ...cols.slice(1).map(() => '')]), rowHeight: h || 'hoch', firstBold: true, cw: cols.length === 2 ? [32, 68] : cols.length === 3 ? [12, 38, 50] : undefined });
  const merke = (title, text) => B('info', { kind: 'Merke', title, text });
  const mat = (memo, o = {}) => B(o.poem ? 'poem' : 'material', { memo, ...o.extra });
  const tab = (cols, n, h) => B('table', { cols, rows: Array.from({ length: n }, () => cols.map(() => '')), rowHeight: h || 'hoch', firstBold: false });
  switch (key) {
    case 'gedicht':
      sh.meta.title = 'Gedichtanalyse';
      sh.blocks = [
        mat('Gedicht einfügen, Autor, Titel, Jahr und Quelle ergänzen.', { poem: true }),
        tasks([
          ['Formulieren Sie nach dem ersten Lesen eine Deutungshypothese.', 'Formuliere nach dem ersten Lesen eine Deutungshypothese.'],
          ['Analysieren Sie Inhalt, Aufbau und formale Gestaltung des Gedichts (Strophen, Metrum, Reim).', 'Analysiere Inhalt, Aufbau und formale Gestaltung des Gedichts (Strophen, Metrum, Reim).'],
          ['Untersuchen Sie die sprachlichen Mittel und erläutern Sie ihre Wirkung. Belegen Sie mit Versangaben.', 'Untersuche die sprachlichen Mittel und erläutere ihre Wirkung. Belege mit Versangaben.'],
          ['Interpretieren Sie das Gedicht, indem Sie Ihre Deutungshypothese überprüfen.', 'Interpretiere das Gedicht, indem du deine Deutungshypothese überprüfst.']
        ], { title: 'Arbeitsaufträge' }),
        tab(['Textstelle (V.)', 'Sprachliches Mittel', 'Wirkung und Deutung'], 4),
        merke('Aufbau einer Gedichtanalyse', '- Einleitung: Autor, Titel, Erscheinungsjahr, Thema, Deutungshypothese\n- Hauptteil: Inhalt, Aufbau und Form, sprachliche Mittel mit ihrer Wirkung, jeweils mit Versangaben\n- Schluss: Deutungshypothese überprüfen, Ergebnis zusammenfassen'),
        PH(['Einleitung', 'Sprachliche Mittel deuten', 'Zitieren und Belegen'])
      ]; break;
    case 'sachtext':
      sh.meta.title = 'Sachtextanalyse';
      sh.blocks = [
        mat('Sachtext einfügen und Quelle ergänzen.'),
        merke('Argumentationsstruktur', '- These: Behauptung, die begründet werden soll\n- Argument: Begründung der These\n- Beleg oder Beispiel: stützt das Argument, etwa mit Fakten, Zahlen, Expertenmeinungen oder Erfahrungen'),
        tasks([
          ['Fassen Sie die zentrale Position des Textes zusammen.', 'Fasse die zentrale Position des Textes zusammen.'],
          ['Analysieren Sie den Argumentationsgang und die sprachliche Gestaltung des Textes. Belegen Sie mit Zeilenangaben.', 'Analysiere den Argumentationsgang und die sprachliche Gestaltung des Textes. Belege mit Zeilenangaben.'],
          ['Beurteilen Sie die Überzeugungskraft der Argumentation.', 'Beurteile, wie überzeugend die Argumentation ist.']
        ], { title: 'Arbeitsaufträge' }),
        tab(['Abschnitt (Z.)', 'Inhalt', 'Funktion im Argumentationsgang'], 4),
        PH(['Einleitung', 'Zitieren und Belegen', 'Argumentieren'])
      ]; break;
    case 'eroerterung':
      sh.meta.title = 'Erörterung';
      sh.blocks = [
        merke('Aufbau einer Erörterung', '- Einleitung: Hinführung zum Thema und Fragestellung\n- Hauptteil: Argumente mit Beispielen, vom schwächeren zum stärkeren; bei der dialektischen Erörterung zuerst die Gegenseite\n- Schluss: begründetes eigenes Urteil'),
        mat('Optional: Text oder Schaubild als Grundlage einfügen, sonst diesen Baustein löschen.'),
        tasks([
          ['Erörtern Sie, ob … .', 'Erörtere, ob … .']
        ], { title: 'Arbeitsauftrag' }),
        tab(['Pro', 'Contra'], 4, 'sehrhoch'),
        PH(['Argumentieren', 'Urteilen und Schluss']),
        B('lines', { count: 12, style: 'linien' })
      ]; break;
    case 'szene':
      sh.meta.title = 'Szenenanalyse';
      sh.blocks = [
        mat('Szene mit Sprecherangaben einfügen, Drama, Akt und Szene sowie Quelle ergänzen.'),
        tasks([
          ['Ordnen Sie die Szene in den Handlungszusammenhang des Dramas ein.', 'Ordne die Szene in den Handlungszusammenhang des Dramas ein.'],
          ['Analysieren Sie das Gesprächsverhalten der Figuren und die sprachliche Gestaltung der Szene. Belegen Sie mit Zeilenangaben.', 'Analysiere das Gesprächsverhalten der Figuren und die sprachliche Gestaltung der Szene. Belege mit Zeilenangaben.'],
          ['Erläutern Sie die Bedeutung der Szene für die Figurenkonstellation und den weiteren Handlungsverlauf.', 'Erläutere die Bedeutung der Szene für die Figurenkonstellation und den weiteren Handlungsverlauf.']
        ], { title: 'Arbeitsaufträge' }),
        tab(['Figur', 'Redeanteil und Redeweise', 'Absicht und Wirkung'], 3),
        PH(['Einleitung', 'Zitieren und Belegen'])
      ]; break;
    case 'stationen': {
      sh.meta.title = 'Stationenarbeit';
      const st = n => [B('heading', { text: `Station ${n}: …` }), mat(`Material für Station ${n} einfügen.`), tasks([['…', '…']])];
      sh.blocks = [
        B('text', { text: T('Bearbeiten Sie die Stationen in beliebiger Reihenfolge. Haken Sie erledigte Stationen ab.', 'Bearbeite die Stationen in beliebiger Reihenfolge. Hake erledigte Stationen ab.') }),
        ...st(1), B('pagebreak'), ...st(2), B('pagebreak'), ...st(3)
      ]; break;
    }
    case 'klausur':
      sh.meta.title = du ? 'Klassenarbeit' : 'Klausur'; sh.meta.mode = 'klausur';
      sh.meta.exam = { ...sh.meta.exam, label: du ? 'Klassenarbeit' : 'Klausur' };
      sh.blocks = [
        mat('Text einfügen und Quelle ergänzen.'),
        tasks([
          { text: T('Analysieren Sie … . Belegen Sie mit Zeilenangaben.', 'Analysiere … . Belege mit Zeilenangaben.'), pts: '60 %' },
          { text: T('Erörtern Sie … .', 'Erörtere … .'), pts: '40 %' }
        ])
      ]; break;
    case 'g-quelle':
      sh.meta.title = 'Quellenanalyse';
      sh.blocks = [
        merke('Quellenanalyse in drei Schritten', '- Beschreiben: Quellengattung, Verfasser, Adressat, Zeit und Ort, Anlass, Thema\n- Analysieren: zentrale Aussagen, Absicht des Verfassers, Argumentation und Sprache\n- Einordnen und beurteilen: historischer Zusammenhang, Sachurteil aus damaliger Sicht, Werturteil aus heutiger Sicht'),
        mat('Quelle einfügen, Verfasser, Titel, Datum und Quellenangabe ergänzen.', { extra: { mk: 'q' } }),
        tasks([
          ['Beschreiben Sie die Quelle: Quellengattung, Verfasser, Adressat, Entstehungszeit und Anlass.', 'Beschreibe die Quelle: Quellengattung, Verfasser, Adressat, Entstehungszeit und Anlass.'],
          ['Arbeiten Sie die zentralen Aussagen und die Absicht des Verfassers heraus. Belegen Sie mit Zeilenangaben.', 'Arbeite die zentralen Aussagen und die Absicht des Verfassers heraus. Belege mit Zeilenangaben.'],
          ['Ordnen Sie die Quelle in den historischen Zusammenhang ein.', 'Ordne die Quelle in den historischen Zusammenhang ein.'],
          ['Beurteilen Sie die Position des Verfassers aus damaliger und aus heutiger Sicht.', 'Beurteile die Position des Verfassers aus damaliger und aus heutiger Sicht.']
        ], { title: 'Arbeitsaufträge' }),
        rowsOf(['Steckbrief der Quelle', 'Angaben'], ['Quellengattung', 'Verfasser', 'Adressat', 'Zeit und Ort', 'Anlass', 'Thema'], 'normal'),
        PH(['Quelle einleiten', 'Aussagen wiedergeben', 'Historisch einordnen', 'Sach- und Werturteil'])
      ]; break;
    case 'g-bild':
      sh.meta.title = 'Karikaturanalyse';
      sh.blocks = [
        B('image', { mk: 'q', caption: 'Karikatur von … (Jahr)' }),
        merke('Karikaturen und Bildquellen analysieren', '- Beschreiben: Zeichner, Entstehung, Personen, Gegenstände, Symbole, Text im Bild\n- Deuten: Bedeutung der Bildelemente und Symbole, Aussage und Absicht des Zeichners\n- Einordnen und beurteilen: historischer Zusammenhang, Wirkung, eigene Stellungnahme'),
        tasks([
          ['Beschreiben Sie die Karikatur: Zeichner, Entstehung, dargestellte Personen, Gegenstände und Symbole.', 'Beschreibe die Karikatur: Zeichner, Entstehung, dargestellte Personen, Gegenstände und Symbole.'],
          ['Erläutern Sie die Bedeutung der Bildelemente und die Aussage des Zeichners.', 'Erläutere die Bedeutung der Bildelemente und die Aussage des Zeichners.'],
          ['Ordnen Sie die Karikatur in den historischen Zusammenhang ein.', 'Ordne die Karikatur in den historischen Zusammenhang ein.'],
          ['Nehmen Sie Stellung zur Aussage der Karikatur.', 'Nimm Stellung zur Aussage der Karikatur.']
        ], { title: 'Arbeitsaufträge' }),
        tab(['Bildelement', 'Beschreibung', 'Bedeutung'], 4),
        PH(['Karikatur beschreiben', 'Karikatur deuten'])
      ]; break;
    case 'g-darst':
      sh.meta.title = 'Darstellung analysieren';
      sh.blocks = [
        mat('Darstellung einfügen, etwa aus einem Fachbuch; Autorin oder Autor und Quellenangabe ergänzen.', { extra: { mk: 'd' } }),
        tasks([
          ['Fassen Sie die Kernaussagen der Darstellung zusammen.', 'Fasse die Kernaussagen der Darstellung zusammen.'],
          ['Arbeiten Sie die These und die Argumente heraus. Belegen Sie mit Zeilenangaben.', 'Arbeite die These und die Argumente heraus. Belege mit Zeilenangaben.'],
          ['Überprüfen Sie die These anhand Ihrer Kenntnisse.', 'Überprüfe die These anhand deiner Kenntnisse.']
        ], { title: 'Arbeitsaufträge' }),
        tab(['These', 'Argumente', 'Belege (Z.)'], 3),
        PH(['Darstellung wiedergeben', 'Sach- und Werturteil'])
      ]; break;
    case 'g-stat':
      sh.meta.title = 'Statistik auswerten';
      sh.blocks = [
        B('image', { mk: 'm', caption: 'Statistik: … (Quelle, Jahr)' }),
        merke('Statistiken auswerten', '- Formale Angaben: Thema, Quelle, Zeitraum, Darstellungsform, Einheit (Prozent oder absolute Zahlen)\n- Beschreiben: wichtigste Werte, Entwicklungen, Auffälligkeiten\n- Erklären: Ursachen und Zusammenhänge\n- Beurteilen: Aussagekraft, fehlende Angaben, mögliche Absicht'),
        tasks([
          ['Beschreiben Sie Thema, Quelle, Zeitraum und Darstellungsform der Statistik.', 'Beschreibe Thema, Quelle, Zeitraum und Darstellungsform der Statistik.'],
          ['Arbeiten Sie die wichtigsten Entwicklungen und Auffälligkeiten heraus.', 'Arbeite die wichtigsten Entwicklungen und Auffälligkeiten heraus.'],
          ['Erklären Sie mögliche Ursachen für diese Entwicklungen.', 'Erkläre mögliche Ursachen für diese Entwicklungen.'],
          ['Beurteilen Sie die Aussagekraft der Statistik.', 'Beurteile die Aussagekraft der Statistik.']
        ], { title: 'Arbeitsaufträge' }),
        PH(['Statistik auswerten'])
      ]; break;
    case 'g-urteil':
      sh.meta.title = 'Urteilsbildung';
      sh.blocks = [
        B('heading', { text: 'Streitfrage: …?' }),
        mat('Material zur Streitfrage einfügen oder diesen Baustein löschen.'),
        merke('Sachurteil und Werturteil', '- Sachurteil: Wie lässt sich etwas aus den Bedingungen seiner Zeit erklären und einschätzen? Kriterien: Absichten, Handlungsmöglichkeiten, Folgen\n- Werturteil: Wie bewerte ich es heute? Kriterien: Menschenrechte, Demokratie, Freiheit, Gerechtigkeit\n- Ein gutes Urteil nennt seine Kriterien und begründet sie.'),
        tasks([
          ['Arbeiten Sie aus dem Material Argumente für und gegen … heraus.', 'Arbeite aus dem Material Argumente für und gegen … heraus.'],
          ['Wägen Sie die Argumente ab und nehmen Sie begründet Stellung zur Streitfrage.', 'Wäge die Argumente ab und nimm begründet Stellung zur Streitfrage.']
        ], { title: 'Arbeitsaufträge' }),
        tab(['Pro', 'Contra'], 4, 'sehrhoch'),
        PH(['Argumentieren', 'Sach- und Werturteil']),
        B('lines', { count: 10, style: 'linien' })
      ]; break;
    case 'g-chronik':
      sh.meta.title = 'Zeitleiste';
      sh.blocks = [
        mat('Darstellungstext mit den Ereignissen einfügen oder die Ereignisse als Liste vorgeben.', { extra: { mk: 'd' } }),
        tasks([
          ['Ordnen Sie die Ereignisse in zeitlicher Reihenfolge in die Tabelle ein.', 'Ordne die Ereignisse in zeitlicher Reihenfolge in die Tabelle ein.'],
          ['Erläutern Sie an zwei Ereignissen, welche Bedeutung sie für die weitere Entwicklung hatten.', 'Erläutere an zwei Ereignissen, welche Bedeutung sie für die weitere Entwicklung hatten.']
        ], { title: 'Arbeitsaufträge' }),
        Object.assign(tab(['Datum', 'Ereignis', 'Bedeutung'], 8, 'normal'), { cw: [16, 44, 40] })
      ]; break;
    case 'g-klausur':
      sh.meta.title = du ? 'Klassenarbeit' : 'Klausur'; sh.meta.mode = 'klausur';
      sh.meta.exam = { ...sh.meta.exam, label: du ? 'Klassenarbeit' : 'Klausur' };
      sh.blocks = [
        mat('Quelle einfügen, Verfasser, Datum und Quellenangabe ergänzen.', { extra: { mk: 'q' } }),
        tasks([
          { text: T('Fassen Sie die zentralen Aussagen der Quelle zusammen.', 'Fasse die zentralen Aussagen der Quelle zusammen.'), pts: '30 %' },
          { text: T('Ordnen Sie die Quelle in den historischen Zusammenhang ein.', 'Ordne die Quelle in den historischen Zusammenhang ein.'), pts: '40 %' },
          { text: T('Beurteilen Sie … .', 'Beurteile … .'), pts: '30 %' }
        ])
      ]; break;
    case 'b-versuch':
      sh.meta.title = 'Versuchsprotokoll';
      sh.blocks = [
        merke('Der naturwissenschaftliche Erkenntnisweg', '- Beobachtung und Fragestellung\n- Hypothese: begründete Vermutung, die sich überprüfen lässt\n- Experiment planen und durchführen, mit Kontrollansatz\n- Beobachtung festhalten und auswerten\n- Hypothese bestätigen oder verwerfen'),
        tasks([
          ['Stellen Sie eine Hypothese zur Fragestellung auf.', 'Stelle eine Hypothese zur Fragestellung auf.'],
          ['Protokollieren Sie den Versuch.', 'Protokolliere den Versuch.'],
          ['Werten Sie Ihre Beobachtungen aus und überprüfen Sie Ihre Hypothese.', 'Werte deine Beobachtungen aus und überprüfe deine Hypothese.']
        ], { title: 'Arbeitsaufträge' }),
        rowsOf(['Versuchsprotokoll', 'Notizen'], ['Fragestellung', 'Hypothese', 'Material', 'Durchführung', 'Beobachtung', 'Auswertung'], 'hoch'),
        B('heading', { text: 'Versuchsaufbau (Skizze)' }),
        B('lines', { count: 9, style: 'rahmen' }),
        PH(['Hypothese formulieren', 'Beobachtung beschreiben', 'Ergebnis und Fehlerbetrachtung'])
      ]; break;
    case 'b-diagramm':
      sh.meta.title = 'Diagramm auswerten';
      sh.blocks = [
        B('image', { mk: 'a', caption: 'Abbildung: … (Quelle)' }),
        merke('Diagramme auswerten', '- Thema: Was ist in Abhängigkeit wovon dargestellt?\n- Achsen: Größen und Einheiten auf der x- und y-Achse\n- Beschreiben: Verlauf, Maximum, Minimum, Wendepunkte\n- Erklären: Ursachen für den Verlauf mit Fachwissen\n- Ergebnis: eine Aussage in einem Satz'),
        tasks([
          ['Beschreiben Sie den Verlauf der Kurve.', 'Beschreibe den Verlauf der Kurve.'],
          ['Erklären Sie den Verlauf mithilfe Ihrer Kenntnisse.', 'Erkläre den Verlauf mithilfe deiner Kenntnisse.'],
          ['Leiten Sie aus dem Diagramm eine allgemeine Aussage ab.', 'Leite aus dem Diagramm eine allgemeine Aussage ab.']
        ], { title: 'Arbeitsaufträge' }),
        PH(['Diagramm beschreiben', 'Erklären (Ursache und Wirkung)'])
      ]; break;
    case 'b-zeichnen':
      sh.meta.title = 'Mikroskopieren und Zeichnen';
      sh.blocks = [
        merke('Regeln für biologische Zeichnungen', '- Mit spitzem Bleistift, ohne Farbe und Schattierung\n- Nur zeichnen, was zu sehen ist, und groß genug\n- Beschriftung mit Linealstrichen, die sich nicht kreuzen\n- Überschrift mit Objekt, Vergrößerung und Datum'),
        tasks([
          ['Zeichnen Sie einen Ausschnitt mit etwa fünf Zellen.', 'Zeichne einen Ausschnitt mit etwa fünf Zellen.'],
          ['Beschriften Sie die erkennbaren Zellbestandteile.', 'Beschrifte die erkennbaren Zellbestandteile.'],
          ['Vergleichen Sie Ihre Zeichnung mit der Abbildung im Buch.', 'Vergleiche deine Zeichnung mit der Abbildung im Buch.']
        ], { title: 'Arbeitsaufträge' }),
        B('text', { text: T('Objekt: ______________   Vergrößerung: ______   Datum: __________', 'Objekt: ______________   Vergrößerung: ______   Datum: __________') }),
        B('lines', { count: 13, style: 'rahmen' })
      ]; break;
    case 'b-abb':
      sh.meta.title = 'Abbildung beschriften';
      sh.blocks = [
        B('image', { mk: 'a', caption: 'Abbildung: … mit Ziffern 1 bis 6' }),
        tasks([
          ['Benennen Sie die mit Ziffern markierten Strukturen.', 'Benenne die mit Ziffern markierten Strukturen.'],
          ['Erläutern Sie die Funktion von drei Strukturen.', 'Erläutere die Funktion von drei Strukturen.']
        ], { title: 'Arbeitsaufträge' }),
        rowsOf(['Nr.', 'Bezeichnung', 'Funktion'], ['1', '2', '3', '4', '5', '6'], 'normal')
      ]; break;
    case 'b-text':
      sh.meta.title = 'Fachtext erschließen';
      sh.blocks = [
        mat('Fachtext einfügen und Quelle ergänzen. Schwierige Wörter in der Vorschau anklicken und erklären.'),
        tasks([
          ['Fassen Sie die wichtigsten Aussagen des Textes zusammen.', 'Fasse die wichtigsten Aussagen des Textes zusammen.'],
          ['Stellen Sie den beschriebenen Ablauf in einem Fließdiagramm dar.', 'Stelle den beschriebenen Ablauf in einem Fließdiagramm dar.'],
          ['Erklären Sie die Fachbegriffe in eigenen Worten.', 'Erkläre die Fachbegriffe in eigenen Worten.']
        ], { title: 'Arbeitsaufträge' }),
        tab(['Fachbegriff', 'Erklärung in eigenen Worten'], 5, 'normal'),
        B('lines', { count: 8, style: 'rahmen' }),
        PH(['Erklären (Ursache und Wirkung)'])
      ]; break;
    case 'b-steckbrief':
      sh.meta.title = 'Steckbrief';
      sh.blocks = [
        B('image', { mk: 'a', caption: 'Abbildung: …' }),
        rowsOf(['Steckbrief', 'Angaben'], ['Name', 'Klasse und Ordnung', 'Lebensraum', 'Nahrung', 'Fortpflanzung', 'Besonderheiten'], 'hoch'),
        tasks([
          ['Beschreiben Sie den Körperbau.', 'Beschreibe den Körperbau.'],
          ['Erläutern Sie an zwei Merkmalen, wie das Lebewesen an seinen Lebensraum angepasst ist.', 'Erläutere an zwei Merkmalen, wie das Lebewesen an seinen Lebensraum angepasst ist.']
        ], { title: 'Arbeitsaufträge' })
      ]; break;
    case 'b-bewerten':
      sh.meta.title = 'Bewerten';
      sh.blocks = [
        B('heading', { text: 'Streitfrage: …?' }),
        mat('Sachinformation zur Streitfrage einfügen.'),
        merke('Bewerten in der Biologie', '- Sachinformation: Was weiß man? Was ist unsicher?\n- Werte: Welche Werte sind betroffen (Gesundheit, Tierwohl, Naturschutz, Freiheit)?\n- Handlungsmöglichkeiten mit ihren Folgen gegenüberstellen\n- Begründet entscheiden und die eigenen Kriterien nennen'),
        tasks([
          ['Stellen Sie die Argumente aus dem Material dar.', 'Stelle die Argumente aus dem Material dar.'],
          ['Diskutieren Sie die Streitfrage.', 'Diskutiere die Streitfrage.'],
          ['Beurteilen Sie, welche Handlungsmöglichkeit Sie für vertretbar halten.', 'Beurteile, welche Handlungsmöglichkeit du für vertretbar hältst.']
        ], { title: 'Arbeitsaufträge' }),
        tab(['Pro', 'Contra'], 4, 'sehrhoch'),
        PH(['Bewerten'])
      ]; break;
    case 'b-klausur':
      sh.meta.title = du ? 'Klassenarbeit' : 'Klausur'; sh.meta.mode = 'klausur';
      sh.meta.exam = { ...sh.meta.exam, label: du ? 'Klassenarbeit' : 'Klausur' };
      sh.blocks = [
        mat('Material einfügen und Quelle ergänzen.'),
        B('image', { mk: 'a', caption: 'Abbildung: …' }),
        tasks([
          { text: T('Beschreiben Sie … .', 'Beschreibe … .'), pts: '30 %' },
          { text: T('Erklären Sie … .', 'Erkläre … .'), pts: '40 %' },
          { text: T('Beurteilen Sie … .', 'Beurteile … .'), pts: '30 %' }
        ])
      ]; break;
  }
  return sh;
}
// Neues Blatt: erst die wichtigsten Angaben (Klasse, Vorlage, Titel, Nummer, Thema, Papier, Ordner), dann direkt bearbeiten
function openNew() {
  closeGloss(); closeZl(); closeMenu();
  const kl = KL(state.klasse).id;
  state.dlg = { mode: 'new', kl, tpl: 'leer', title: '', titleSet: false, nr: nextNr(kl), nrSet: false, topic: '', paper: 'a4', folder: '', src: '' };
  renderDlg();
}
function newDlgHTML() {
  const d = state.dlg; const kl = KL(d.kl);
  const list = state.lib.filter(x => x.klasse === kl.id).sort((a, b) => b.updatedAt - a.updatedAt);
  const fs = libFolders(kl.id); const tpls = [...tplsFor(kl.id), ...(list.length ? [{ k: 'copy', label: 'Kopie eines Blatts', d: 'ein vorhandenes Blatt als Grundlage', ic: 'dup' }] : [])];
  const t = tpls.find(x => x.k === d.tpl) || tpls[0]; const isK = isKlausurTpl(d.tpl);
  const defTitle = d.tpl === 'leer' ? '' : d.tpl === 'copy' ? '' : (isK && kl.anrede === 'du' ? 'Klassenarbeit' : t.title || t.label);
  return `<h2 id="dlg-t">Neue Stunde</h2>
    <div class="nw-g">
      <div class="f"><span>Klasse</span><div class="nw-kl">${KLASSEN.filter(k => k.fach === kl.fach).map(k => `<button type="button" class="nw-k" data-act="nw-kl" data-v="${k.id}" aria-pressed="${k.id === kl.id}"><i style="background:${ACCENTS[k.accent].c}"></i>${esc(k.label)}</button>`).join('')}</div>
        <small>${esc(FAECHER[kl.fach].label)}${kl.course && kl.course !== FAECHER[kl.fach].label ? ' · ' + esc(kl.course) : ''}${kl.school ? ' · ' + esc(kl.school) : ''} · Aufgaben in der ${kl.anrede === 'du' ? 'du' : 'Sie'}-Form</small></div>
      <div class="f"><span>Vorlage</span><div class="tpl-grid nw-tpl">${tpls.map(x => `<button type="button" class="tpl" data-act="nw-tpl" data-k="${x.k}" aria-pressed="${x.k === d.tpl}" title="${esc(x.d)}"><i class="add-ic">${x.ic === 'dup' ? I.dup : typeIcon(x.ic)}</i><span><b>${x.label}</b><span>${x.d}</span></span></button>`).join('')}</div></div>
      ${d.tpl === 'copy' ? `<label class="f"><span>Grundlage</span><select id="nw-src">${list.map(x => `<option value="${esc(x.id)}"${x.id === d.src ? ' selected' : ''}>${x.nr ? 'AB ' + esc(x.nr) + ' · ' : ''}${esc(x.title)}</option>`).join('')}</select></label>` : ''}
      <div class="row"><label class="f narrow"><span>${isK ? 'Nr.' : 'AB-Nr.'}</span><input class="inp" id="nw-nr" value="${esc(d.nr)}" placeholder="7"></label>
        <label class="f" style="flex:1"><span>Titel</span><input class="inp" id="nw-title" value="${esc(d.titleSet ? d.title : defTitle)}" placeholder="${d.tpl === 'copy' ? 'leer = Titel der Grundlage' : 'Worum geht es?'}" maxlength="140"></label></div>
      ${isK ? '' : `<label class="f"><span>Thema / Unterzeile <em class="opt">optional</em></span><input class="inp" id="nw-topic" value="${esc(d.topic)}" placeholder="${({ gp: 'z. B. Die Weimarer Republik zwischen Krise und Stabilität', bio: 'z. B. Fotosynthese: Licht als Energiequelle' })[kl.fach] || 'z. B. Sprache der Distanz im literarischen Text'}" maxlength="200"></label>`}
      <div class="row nw-row"><div class="f"><span>Papier</span><div class="seg sm" role="group">${[['a4', 'A4'], ['a4q', 'A4 quer'], ['buch', 'A5 als Buch'], ['a5x2', 'A5 doppelt']].map(([v, l]) => `<button type="button" data-act="nw-paper" data-v="${v}" aria-pressed="${d.paper === v}">${l}</button>`).join('')}</div></div>
        ${fs.length ? `<label class="f" style="flex:1"><span>Ordner</span><select id="nw-f"><option value="">Ohne Ordner</option>${fs.map(f => `<option value="${esc(f.id)}"${f.id === d.folder ? ' selected' : ''}>${esc(f.name)}</option>`).join('')}</select></label>` : ''}</div>
    </div>
    <div class="row"><button class="btn primary" type="button" data-act="nw-go">Blatt anlegen und bearbeiten</button><button class="btn" type="button" data-act="dlg-close">Abbrechen</button></div>`;
}
function newDlgRead() {
  const d = state.dlg; if (!d) return;
  const v = id => { const n = $(id); return n ? n.value : null; };
  const t = v('#nw-title'); if (t != null && (d.titleSet || t !== (newDlgDefTitle()))) { d.title = t; d.titleSet = true; }
  const nr = v('#nw-nr'); if (nr != null && nr !== d.nr) { d.nr = nr; d.nrSet = true; }
  const tp = v('#nw-topic'); if (tp != null) d.topic = tp;
  const f = v('#nw-f'); if (f != null) d.folder = f;
  const sr = v('#nw-src'); if (sr != null) d.src = sr;
}
function newDlgDefTitle() { const d = state.dlg; const kl = KL(d.kl); const t = tplsFor(d.kl).find(x => x.k === d.tpl); if (!t || d.tpl === 'leer') return ''; return isKlausurTpl(d.tpl) && kl.anrede === 'du' ? 'Klassenarbeit' : t.title || t.label; }
async function newGo() {
  newDlgRead(); const d = state.dlg; const kl = d.kl; let sh;
  if (d.tpl === 'copy') {
    const id = d.src || ($('#nw-src') || {}).value; if (!id) return;
    try { const src = await backend.load(id); if (!src) throw new Error('fehlt'); sh = normalizeSheet(src); sh.id = 'ab-' + uid(); sh.example = false; sh.updatedAt = Date.now(); if (!d.titleSet || !d.title.trim()) sh.meta.title = (sh.meta.title || 'Ohne Titel') + ' (Kopie)'; }
    catch { dlgMsg('Die Grundlage konnte nicht geladen werden. Bitte erneut versuchen.'); return; }
  } else sh = d.tpl === 'leer' ? blankSheet(d.nr, kl) : tplSheet(d.tpl, kl);
  const title = (d.titleSet ? d.title : newDlgDefTitle()).trim();
  if (title) sh.meta.title = title; else if (d.tpl === 'leer') sh.meta.title = 'Neues Arbeitsblatt';
  sh.meta.nr = String(d.nr || '').trim(); if (d.topic.trim() && sh.meta.mode !== 'klausur') sh.meta.topic = d.topic.trim();
  sh.meta.paper = d.paper;
  state.dlg = null; renderDlg(); state.libOpen = false; state.confirmDel = null; renderLib();
  openSheet(sh, { edit: true }); state.openSnap = null; saveNow();
  if (d.folder) { setPlace(sh.id, d.folder); savePrefs(); }
  // direkt bearbeiten: die erste inhaltliche Karte öffnen und hineinspringen
  const first = sh.blocks.find(b => b.type === 'material' || b.type === 'poem' || (b.type === 'image' && b.mk)) || sh.blocks.find(b => b.type !== 'pagebreak');
  setView('edit');
  if (first) { state.sel = first.id; openOnly(first.id); renderEditor(); const c = $(`#editor [data-bid="${first.id}"]`); if (c) { c.scrollIntoView({ block: 'start' }); const f = c.querySelector('.rtx,textarea,input[type=text]'); if (f) f.focus({ preventScroll: true }); } }
  toast(d.tpl === 'leer' ? 'Neue Stunde angelegt' : d.tpl === 'copy' ? 'Kopie angelegt' : `Vorlage „${(tplsFor(d.kl).find(x => x.k === d.tpl) || {}).label}“ angelegt`);
}
function exampleSheet() {
  const b = (type, o) => Object.assign(newBlock(type), o);
  return {
    id: 'ab-' + uid(), klasse: 'gk', example: true, sample: true, updatedAt: Date.now(),
    meta: { ...defaultMeta('7', 'gk'), title: 'Sprache der Distanz im literarischen Text',
      topic: 'Mediale und konzeptionelle Mündlichkeit und Schriftlichkeit (nach P. Koch/W. Oesterreicher)' },
    blocks: [
      b('info', { kind: 'Merke', title: 'Sprache der Distanz (konzeptionelle Schriftlichkeit)',
        text: 'Merkmale nach Koch/Oesterreicher: raumzeitliche Distanz, Fremdheit, Themenfixierung, Situationsentbindung, Planung, Endgültigkeit bzw. Fixierung, Sachlichkeit, Monolog, Öffentlichkeit.\nTypische Versprachlichung: Hypotaxe, höhere Komplexität, textverknüpfende Mittel.' }),
      b('material', { title: 'Theodor Storm: Der Schimmelreiter (1888), Beginn der Rahmenerzählung',
        text: 'Was ich zu berichten beabsichtige, ist mir vor reichlich einem halben Jahrhundert im Hause meiner Urgroßmutter, der alten Frau Senator Feddersen, kundgeworden, während ich, an ihrem Lehnstuhl sitzend, mich mit dem Lesen eines in blaue Pappe eingebundenen Zeitschriftenheftes beschäftigte; ich vermag mich nicht mehr zu entsinnen, ob von den »Leipziger« oder von »Pappes Hamburger Lesefrüchten«. Noch fühl ich es gleich einem Schauer, wie dabei die linde Hand der über Achtzigjährigen mitunter liebkosend über das Haupthaar ihres Urenkels hinglitt. Sie selbst und jene Zeit sind längst begraben; vergebens habe ich seitdem jenen Blättern nachgeforscht, und ich kann daher um so weniger weder die Wahrheit der Tatsachen verbürgen, als, wenn jemand sie bestreiten wollte, dafür aufstehen; nur so viel kann ich versichern, daß ich sie seit jener Zeit, obgleich sie durch keinen äußeren Anlaß in mir aufs neue belebt wurden, niemals aus dem Gedächtnis verloren habe.',
        glossary: [{ term: 'kundgeworden', n: 0, text: 'bekannt geworden' }, { term: 'linde', n: 0, text: 'sanft, zart' }, { term: 'verbürgen', n: 0, text: 'für die Richtigkeit einstehen' }],
        source: 'Theodor Storm: Der Schimmelreiter. Novelle (1888). Textgrundlage: Projekt Gutenberg-DE.',
        memo: 'Beispieltext: Wortlaut vor dem Einsatz mit deiner Textausgabe abgleichen.' }),
      b('tasks', { title: 'Arbeitsaufträge', items: [
        { text: 'Fassen Sie zusammen, was der Erzähler über die Herkunft seiner Geschichte mitteilt.', tag: '' },
        { text: 'Analysieren Sie den Auszug mithilfe der Merkmale der Sprache der Distanz und halten Sie Ihre Ergebnisse in der Tabelle fest. Belegen Sie mit Zeilenangaben.', tag: '' }] }),
      b('table', { cols: ['Merkmal der Distanz', 'Textbeleg (Z.)', 'Wirkung'],
        rows: [['raumzeitliche Distanz', '', ''], ['Monolog', '', ''], ['Sachlichkeit', '', ''], ['Planung, komplexer Satzbau', '', '']],
        rowHeight: 'hoch', firstBold: true }),
      b('tasks', { items: [{ text: 'Beurteilen Sie, welche Funktion der distanzierte Stil für den Beginn der Novelle hat.', tag: '' }] }),
      b('lines', { count: 9, style: 'linien' })
    ]
  };
}

// Unbearbeiteter Entwurf je Reiter: im Grundkurs das Beispielblatt, sonst ein leeres Blatt
function draftFor(k) { return k === 'gk' ? exampleSheet() : Object.assign(blankSheet(nextNr(k), k), { example: true }); }
// Ältere Blätter (vor den Reitern) gehören zum Grundkurs
function normalizeSheet(sh) {
  sh.klasse = KL(sh.klasse).id;
  const schoolOld = !(sh.meta && sh.meta.schoolV); const fmtOld = !(sh.meta && sh.meta.fmtV); const hadG = !!(sh.meta && Array.isArray(sh.meta.groups) && sh.meta.groups.length >= 2);
  sh.meta = { ...defaultMeta('', sh.klasse), anrede: 'sie', ...sh.meta }; grpNorm(sh.meta, hadG);
  if (schoolOld) { if (sh.meta.school === 'Georg-Herwegh-Gymnasium' && KL(sh.klasse).school) sh.meta.school = KL(sh.klasse).school; sh.meta.schoolV = 1; }
  if (!Array.isArray(sh.blocks)) sh.blocks = [];
  sh.blocks.forEach(b => { if (b && b.type === 'material') { migrateGlossary(b); migrateMatNl(b); } });
  // Materialtexte einmalig auf Blocksatz ohne Einzug zurücksetzen (Standard); danach bleibt jede eigene Wahl erhalten
  if (fmtOld) [sh.blocks, ...(Array.isArray(sh.abs) ? sh.abs.map(x => (x && Array.isArray(x.blocks) ? x.blocks : [])) : [])].forEach(L => L.forEach(b => { if (b && b.type === 'material' && b.fmt) { b.fmt = { ...b.fmt }; delete b.fmt.align; delete b.fmt.indent; } }));
  if (!Array.isArray(sh.cards)) sh.cards = [];
  sh.meta.exam = { ...defaultMeta('', sh.klasse).exam, ...(sh.meta.exam || {}) };
  sh.meta.kk = kkOf(sh.meta);
  abNorm(sh);
  minMigrate(sh.blocks); (sh.abs || []).forEach(a => { if (a && Array.isArray(a.blocks)) minMigrate(a.blocks); });
  return sh;
}

