/* ================= Rahmenlehrplan Deutsch, gymnasiale Oberstufe (Teil C) =================
   q = abschlussorientierte Standards (3.2), e = Eingangsvoraussetzungen (3.1). lk0: ab dieser Nummer nur Leistungskurs. */
const RLP_DE = {
  q: { name: 'Qualifikationsphase', full: 'Abschlussorientierte Standards', groups: [
    { k: 'SZ', code: 'SZ', name: 'Sprechen und Zuhören', items: [
      'in ihren Gesprächen auf Verständigung zielen und respektvolles Gesprächsverhalten zeigen',
      'in verschiedenen Gesprächsformen und in unterschiedlichen Rollen kommunikativ handeln und dabei nonverbale sowie stimmliche Mittel bewusst nutzen',
      'zur Analyse mündlicher Kommunikationssituationen exemplarisch auditive und audiovisuelle Aufzeichnungen sowie Mitschriften nutzen',
      'den Verlauf fachlich anspruchsvoller monologischer und dialogischer Gesprächsformen konzentriert verfolgen, um Argumentation und Intention der Gesprächspartner wiederzugeben bzw. zusammenzufassen sowie ihr Verständnis durch Mitschriften und Notizen zu sichern'] },
    { k: 'SZd', code: 'SZ-d', name: 'Mit anderen sprechen (dialogisch)', items: [
      'während des Zuhörens parallel eigene Äußerungen planen und diese in ihrer Wirkung einschätzen',
      'sich in eigenen Gesprächsbeiträgen explizit und zielführend auf andere beziehen',
      'in Kontroversen Strittiges identifizieren und eigene Positionen vertreten',
      'auf konstruktive Weise eigenes und fremdes Gesprächsverhalten beobachten, reflektieren und besprechen',
      'nach Geboten der Fairness kommunizieren und Strategien unfairer Kommunikation erkennen',
      'Diskussionen, Debatten und Präsentationen selbstständig moderieren',
      'in Simulationen von Prüfungs- und Bewerbungsgesprächen angemessen verbal und nonverbal handeln'] },
    { k: 'SZm', code: 'SZ-m', name: 'Vor anderen sprechen (monologisch)', items: [
      'anspruchsvolle Fachinhalte Verständnis fördernd referieren, auch unter Verwendung selbst verfasster stützender Texte',
      'literarische und pragmatische Texte sinngebend und der Form entsprechend vortragen',
      'einzeln und gemeinsam mit anderen argumentierende und erklärende Beiträge präsentieren',
      'kontextangemessen, funktional, kreativ verschiedene Medien und Präsentationstechniken einsetzen und das eigene Vorgehen erläutern',
      'umfangreiche Redebeiträge zu komplexen Sachverhalten selbstständig und adressatengerecht präsentieren'] },
    { k: 'Sstr', code: 'S-str', name: 'Schreibstrategien anwenden', items: [
      'Texte orthografisch und grammatisch korrekt sowie fachsprachlich präzise, prägnant und stilistisch angemessen verfassen',
      'anspruchsvolle Aufgabenstellungen in konkrete Schreibziele und Schreibpläne überführen und komplexe Texte unter Beachtung von Textkonventionen eigenständig oder kooperativ strukturieren und dabei auch digitale Werkzeuge einsetzen',
      'aus selbst recherchierten Informationsquellen Relevantes für die eigene Textproduktion auswählen und in geeigneter Form aufbereiten',
      'Textbelege und andere Quellen korrekt zitieren bzw. paraphrasieren',
      'Texte hinsichtlich inhaltlicher, funktionaler und stilistischer Kriterien ergebnisorientiert und im Hinblick auf die Geschlossenheit der Darstellung überarbeiten',
      'die Stadien ihrer Schreibprozesse und Kompetenzentwicklung dokumentieren und reflektieren'] },
    { k: 'Sinf', code: 'S-inf', name: 'Informierend schreiben', items: [
      'eigenes Wissen über literarische, sprachliche und andere Sachverhalte geordnet und differenziert darstellen',
      'Aufbau, inhaltlichen Zusammenhang und sprachlich-stilistische Merkmale eines Textes selbstständig fachgerecht beschreiben',
      'Inhalte und Argumentationen komplexer Texte zusammenfassen, exzerpieren und referieren'] },
    { k: 'Sarg', code: 'S-arg', name: 'Erklärend und argumentierend schreiben', items: [
      'zu einem gegebenen komplexen Sachverhalt eine Untersuchungsfrage formulieren, die Auswahl der Untersuchungsaspekte begründen und den Untersuchungsgang skizzieren',
      'Schlussfolgerungen aus ihren Analysen, Vergleichen oder Diskussionen von Sachverhalten und Texten ziehen und die Ergebnisse in kohärenter Weise darstellen',
      'eigene Interpretationsansätze zu literarischen Texten entwickeln und diese argumentativ-erklärend darstellen, auch unter Berücksichtigung von Ideengehalt, gattungs- und epochenspezifischen Merkmalen sowie literaturtheoretischen Ansätzen',
      'bei der Auseinandersetzung mit Texten deren historische, kulturelle, philosophische, politische oder weltanschauliche Bezüge, auch in ihrer Relevanz für die Arbeitswelt, verdeutlichen',
      'zu fachlich strittigen Sachverhalten und Texten differenzierte Argumentationen entwerfen, diese strukturiert entfalten und die Prämissen ihrer Argumentationen reflektieren',
      'in Anlehnung an journalistische, populärwissenschaftliche oder medienspezifische Textformen eigene Texte schreiben',
      'wissenschaftspropädeutische Texte, zum Beispiel Fach- oder Seminararbeiten, planen, strukturieren, verfassen und überarbeiten'] },
    { k: 'Sgest', code: 'S-gest', name: 'Gestaltend schreiben', items: [
      'nach literarischen oder nicht-literarischen Vorlagen Texte neu, um- oder weiterschreiben, die Korrespondenz von Vorlage und eigenem Text beachten und dabei ein ästhetisches Ausdrucksvermögen entfalten',
      'ästhetische, epistemische, reflexive Textformen wie Essay, Tagebuch, Gedicht, Brief zur Selbstreflexion, Wissensbildung und Entfaltung des ästhetischen Ausdrucksvermögens in literarischen oder pragmatischen Zusammenhängen verwenden',
      'Texte für unterschiedliche Medien gestaltend schreiben'] },
    { k: 'L', code: 'L', name: 'Lesen', items: [
      'den komplexen Zusammenhang zwischen Teilaspekten und dem Textganzen erschließen',
      'aus anspruchsvollen Aufgabenstellungen angemessene Leseziele ableiten und diese für die Textrezeption nutzen',
      'im Leseprozess ihre auf unterschiedlichen Interpretations- und Analyseverfahren beruhenden Verstehensentwürfe überprüfen',
      'die Einsicht in die Vorläufigkeit ihrer Verstehensentwürfe zur kontinuierlichen Überarbeitung ihrer Hypothesen nutzen',
      'Verstehensbarrieren identifizieren und sie zum Anlass eines textnahen Lesens nehmen',
      'Kontextwissen heranziehen, um Verstehensbarrieren zu überwinden',
      'Rückschlüsse aus der medialen Präsentation und Verbreitungsform eines Textes ziehen',
      'Geltungsansprüche von Texten reflektieren und das Ergebnis in das Textverstehen einbeziehen',
      'die Qualität von Textinformationen vor dem Hintergrund ihres fachlichen Wissens prüfen und beurteilen',
      'ihr Fach- und Weltwissen flexibel einsetzen, um das Textverständnis zu vertiefen und die Relevanz des Gelesenen einzuschätzen',
      'sich in der Anschlusskommunikation über eigene und fremde Verstehensvoraussetzungen verständigen',
      'im Leseprozess ihr fachliches Wissen selbstständig zur Erschließung und Nutzung voraussetzungsreicher Texte heranziehen'] },
    { k: 'Tlit', code: 'T-lit', name: 'Sich mit literarischen Texten auseinandersetzen', lk0: 12, items: [
      'Inhalt, Aufbau und sprachliche Gestaltung literarischer Texte analysieren, Sinnzusammenhänge zwischen einzelnen Einheiten dieser Texte herstellen und sie als Geflechte innerer Bezüge und Abhängigkeiten erfassen',
      'eigenständig ein Textverständnis formulieren, in das sie persönliche Leseerfahrungen und alternative Lesarten des Textes einbeziehen, und auf der Basis eigener Analyseergebnisse begründen',
      'ihr Textverständnis argumentativ durch gattungspoetologische und literaturgeschichtliche Kenntnisse über die Literaturepochen von der Aufklärung bis zur Gegenwart stützen',
      'relevante Motive, Themen und Strukturen literarischer Schriften, die auch über Barock und Mittelalter bis in die Antike zurückreichen können, vergleichen und in ihre Texterschließung einbeziehen',
      'Mehrdeutigkeit als konstitutives Merkmal literarischer Texte nachweisen',
      'literarische Texte aller Gattungen als Produkte künstlerischer Gestaltung erschließen',
      'die besondere ästhetische Qualität eines literarischen Produktes aufgrund eines breit angelegten literarischen Vorwissens erfassen und ihre Befunde in das Textverständnis einbeziehen',
      'diachrone und synchrone Zusammenhänge zwischen literarischen Texten ermitteln und Bezüge zu weiteren Kontexten herstellen',
      'die in literarischen Werken enthaltenen Herausforderungen und Fremdheitserfahrungen kritisch zu eigenen Wertvorstellungen, Welt- und Selbstkonzepten in Beziehung setzen',
      'literarische Texte auf der Basis von nachvollziehbaren, sachlich fundierten Kriterien bewerten und dabei auch textexterne Bezüge wie Produktions-, Rezeptions- und Wirkungsbedingungen berücksichtigen',
      'kreativ Texte im Sinne literarischen Probehandelns gestalten',
      'den besonderen poetischen Anspruch und die ästhetische Qualität literarischer Texte vor dem Hintergrund ihrer Kenntnisse in den Bereichen Poetologie und Ästhetik erläutern',
      'Kenntnisse wissenschaftlicher Sekundärtexte, philosophischer Schriften und historischer Abhandlungen in die Kontextualisierung literarischer Werke einbeziehen',
      'in ihre Erörterung der in literarischen Werken enthaltenen Herausforderungen und Fremdheitserfahrungen geistes-, kultur- und sozialgeschichtliche Entwicklungen einbeziehen',
      'ihre literarischen Wertungen differenziert begründen und dabei auf ihr größeres und komplexeres Kontextwissen zurückgreifen'] },
    { k: 'Tprag', code: 'T-prag', name: 'Sich mit pragmatischen Texten auseinandersetzen', lk0: 10, items: [
      'den inhaltlichen Zusammenhang voraussetzungsreicher Texte sichern und diese Texte terminologisch präzise und sachgerecht zusammenfassen',
      'ein umfassendes, Textfunktionen, Situationen und Adressaten beachtendes Textverständnis formulieren',
      'die in pragmatischen Texten enthaltenen sprachlichen Handlungen ermitteln',
      'die Funktionen eines pragmatischen Textes bestimmen und dessen mögliche Wirkungsabsichten beurteilen',
      'die sprachlich-stilistische Gestaltung eines pragmatischen Textes fachgerecht beschreiben und deren Wirkungsweise erläutern',
      'Elemente der Textgestaltung einschließlich nichtsprachlicher Bestandteile in ihrer Funktion analysieren',
      'zielgerichtet Zusammenhänge zu weiteren ihnen bekannten Texten herstellen und hierfür passende Wissensbestände aktivieren',
      'themengleiche Texte methodisch fachgerecht vergleichen',
      'sich mittels pragmatischer Texte mit den eigenen Welt- und Wertvorstellungen, auch in einer interkulturellen Perspektive, auseinandersetzen',
      'die Zuordnung von Texten zu Textformen und Textsorten reflektieren',
      'die in argumentativen Texten enthaltenen Argumentationsstrukturen theoriegestützt analysieren',
      'die Beziehung zwischen pragmatischen Texten und ihren Produktionsbedingungen ermitteln'] },
    { k: 'Tmed', code: 'T-med', name: 'Texte unterschiedlicher medialer Form und Theaterinszenierungen', lk0: 5, items: [
      'Theaterinszenierungen und Literaturverfilmungen als Textinterpretationen erfassen und beurteilen',
      'Theaterinszenierungen, Hörtexte und Filme sachgerecht analysieren',
      'eigene Hörtexte, Filme oder andere audiovisuelle Präsentationsformen erstellen bzw. Textvorlagen szenisch umsetzen',
      'sich bei der Rezeption oder Produktion von Hörtexten und Filmen und bei der Rezeption von Theaterinszenierungen mit den eigenen Welt- und Wertvorstellungen, auch in einer interkulturellen Perspektive, auseinandersetzen',
      'die ästhetische Qualität von Theaterinszenierungen, Hörtexten oder Filmen beurteilen, auch vor dem Hintergrund ihrer kulturellen und historischen Dimension',
      'sich mit Filmkritik und Aspekten der Filmtheorie auseinandersetzen'] },
    { k: 'Spr', code: 'Spr', name: 'Sprache und Sprachgebrauch reflektieren', lk0: 12, items: [
      'ein grundlegendes Verständnis der kognitiven und kommunikativen Funktion von Sprache formulieren',
      'sprachliche Äußerungen kriterienorientiert analysieren und ihre Einsichten in der Auseinandersetzung mit Texten und Sachverhalten dokumentieren',
      'sprachliche Strukturen und Bedeutungen auf der Basis eines gesicherten Grammatikwissens und semantischer Kategorien erläutern',
      'Strukturen und Funktionen von Sprachvarietäten beschreiben',
      'Bedingungen gelingender Kommunikation analysieren, auch auf der Basis theoretischer Modelle',
      'verbale, paraverbale und nonverbale Gestaltungsmittel in unterschiedlichen kommunikativen Zusammenhängen analysieren, ihre Funktion beschreiben und ihre Angemessenheit bewerten',
      'verbale, paraverbale und nonverbale Signale für Macht- und Dominanzverhältnisse identifizieren',
      'sprachliche Handlungen kriterienorientiert in authentischen und fiktiven Kommunikationssituationen bewerten',
      'Auswirkungen der Sprachenvielfalt und der Mehrsprachigkeit analysieren',
      'auf der Grundlage sprachkritischer Texte Entwicklungstendenzen der Gegenwartssprache beschreiben und bewerten',
      'persuasive und manipulative Strategien in öffentlichen Bereichen analysieren und sie kritisch bewerten',
      'sprachphilosophische Positionen zur Analyse von Sprache und Kommunikation heranziehen',
      'sprachliche Handlungen in authentischen und fiktiven Kommunikationssituationen theoriegestützt beschreiben',
      'Phänomene des Sprachwandels und des Spracherwerbs theoriegestützt beschreiben',
      'in geeigneten Nutzungszusammenhängen mit grammatischen und semantischen Kategorien argumentieren'] }] },
  e: { name: 'Einführungsphase', full: 'Eingangsvoraussetzungen', groups: [
    { k: 'SZ', code: 'SZ', name: 'Sprechen und Zuhören', items: [
      'verschiedene Formen der sprachlichen Darstellung unterscheiden',
      'sich artikuliert, sach- und situationsangemessen äußern',
      'Vorträgen und Gesprächsbeiträgen wesentliche Informationen entnehmen und diese wiedergeben'] },
    { k: 'SZd', code: 'SZ-d', name: 'Mit anderen sprechen (dialogisch)', items: [
      'Gespräche und Diskussionen leiten, moderieren und reflektieren',
      'Grundfaktoren sprachlicher Kommunikation beachten',
      'sich konstruktiv an Gesprächen beteiligen, eigene Meinungen begründet und nachvollziehbar vertreten',
      'eigenes und fremdes Gesprächsverhalten reflektieren und bewerten'] },
    { k: 'SZm', code: 'SZ-m', name: 'Vor anderen sprechen (monologisch)', items: [
      'literarische und pragmatische Texte sinngebend und hörerwirksam vortragen, szenisch lesen und gestalten',
      'verschiedene Rede- und Vortragsformen sachgerecht vorbereiten und unterschiedliche Präsentationsformen adressatengerecht nutzen'] },
    { k: 'Sstr', code: 'S-str', name: 'Schreibstrategien anwenden', items: [
      'die Grundregeln der Rechtschreibung und Zeichensetzung sicher anwenden und eigene Fehlerschwerpunkte identifizieren',
      'zielgerichtet und adressatenbezogen eigene Schreibprozesse planen',
      'unterschiedliche Methoden und Materialien der Informationsbeschaffung und -darstellung nutzen',
      'ausgewählte Methoden zur Präsentation linearer und nichtlinearer Texte nutzen',
      'Formen prozessorientierter Leistungsdokumentation (z. B. Portfolio, Arbeitsjournal) anwenden',
      'Arbeitsformen des kooperativen Schreibens zur Planung, Gestaltung und Überarbeitung von Texten einsetzen',
      'eigene und fremde Texte selbstständig gestalten und überarbeiten und deren sprachliche Richtigkeit und Angemessenheit anhand transparenter Kriterien prüfen'] },
    { k: 'Stf', code: 'S-tf', name: 'In unterschiedlichen Textformen schreiben', items: [
      'Schreibstrategien für die Produktion informierender, erklärender und argumentierender sowie gestaltender Textformen aufgabenbezogen anwenden'] },
    { k: 'L', code: 'L', name: 'Lesen', items: [
      'den inhaltlichen Zusammenhang von Teilaspekten und dem Textganzen erschließen',
      'in Texten zwischen Information und Wertung unterscheiden',
      'Verstehensbarrieren identifizieren',
      'Strategien zum Textverstehen vor dem Lesen, während des Lesens und nach dem Lesen zielgerichtet und selbstständig anwenden',
      'verschiedene Lesetechniken zielgerichtet einsetzen'] },
    { k: 'T', code: 'T', name: 'Sich mit Texten und Medien auseinandersetzen', items: [
      'literarische und pragmatische Texte unterschiedlicher medialer Form analysieren',
      'die mögliche Wirkung ausgewählter Gestaltungsmittel erklären',
      'selbstständig ein Textverständnis entwickeln und ihre Deutungen belegen',
      'Positionen zu Deutungsangeboten literarischer und pragmatischer Texte entwickeln'] },
    { k: 'Spr', code: 'Spr', name: 'Sprache und Sprachgebrauch reflektieren', items: [
      'ausgewählte Sprachvarietäten (z. B. Dialekte, Soziolekte, Fachsprache) unterscheiden',
      'ausgewählte Erscheinungsformen des Sprachwandels (z. B. Bedeutungswandel, fremdsprachliche Einflüsse) reflektieren',
      'orthographische und grammatische Phänomene (z. B. Wortarten und Satzstrukturen) identifizieren und erklären'] }] } };
const RLP_BY = { deutsch: RLP_DE };
// Suchwörter je Bereich, damit „Lyrik“ oder „Erörterung“ die passenden Standards findet
const RLP_KW = { SZ: 'gespräch zuhören mündlich', SZd: 'diskussion debatte gespräch moderation streitgespräch', SZm: 'referat präsentation vortrag rede vortragen', Sstr: 'schreibprozess zitieren überarbeiten recherche rechtschreibung',
  Sinf: 'zusammenfassung inhaltsangabe beschreibung', Sarg: 'erörterung argumentation interpretation stellungnahme essay', Sgest: 'kreativ produktiv tagebuch brief innerer monolog umschreiben',
  L: 'lesestrategie textverständnis', Tlit: 'lyrik gedicht epik roman novelle erzählung kurzgeschichte drama dramatik szene literatur epoche', Tprag: 'sachtext rede kommentar essay zeitung argumentation rhetorik',
  Tmed: 'film theater hörspiel podcast medien inszenierung', Spr: 'grammatik kommunikation sprachwandel rhetorik varietät', T: 'lyrik epik drama sachtext analyse', Stf: 'erörterung kreativ schreiben' };
const RLP_PH = [['q', 'Qualifikationsphase'], ['e', 'Einführungsphase'], ['own', 'Nur eigene']];
const LS_RLPPH = 'abw.rlpph';
let RLP_MAP = null;
function rlpMap() {
  if (RLP_MAP) return RLP_MAP; RLP_MAP = {}; let o = 0;
  Object.entries(RLP_BY).forEach(([fach, cat]) => Object.entries(cat).forEach(([ph, P]) => P.groups.forEach(g => g.items.forEach((t, j) => {
    const n = j + 1, id = `${ph}:${g.k}${n}`;
    RLP_MAP[id] = { id, ph, g, n, o: o++, fach, t, code: (ph === 'e' ? 'E-' : '') + g.code + ' ' + n, lk: !!g.lk0 && n >= g.lk0 };
  }))));
  return RLP_MAP;
}
const rlpOf = it => Array.isArray(it && it.rlp) ? it.rlp.filter(x => typeof x === 'string' && x.trim()) : [];
function rlpInfo(id) {
  if (id[0] === '~') return { id, own: true, code: 'eigen', t: id.slice(1).trim(), o: 1e6 };
  return rlpMap()[id] || { id, unk: true, code: id, t: 'Standard nicht im Katalog', o: 2e6 };
}
const rlpCmp = (a, b) => { const x = rlpInfo(a), y = rlpInfo(b); return x.o - y.o || (x.t < y.t ? -1 : x.t > y.t ? 1 : 0); };
const rlpShort = (t, n = 64) => { t = String(t || ''); if (t.length <= n) return t; const c = t.lastIndexOf(' ', n); return t.slice(0, c > n * .6 ? c : n).replace(/[,;:]$/, '') + ' …'; };
const rlpOwnList = fach => ((state.prefs && state.prefs.rlpOwn) || {})[fach] || [];
const rlpClean = t => String(t || '').replace(/^\s*(?:[−–•*·-]|\d+[.)])\s*/, '').replace(/\s+/g, ' ').trim().slice(0, 300);
function rlpPhase(kl) { kl = KL(kl || state.sheet.klasse).id; const cat = RLP_BY[fachKey(kl)]; const v = (lsGet(LS_RLPPH) || {})[kl]; return !cat ? 'own' : v === 'e' || v === 'own' ? v : 'q'; }
function rlpPhaseSet(kl, v) { const o = lsGet(LS_RLPPH) || {}; o[KL(kl).id] = v; lsSet(LS_RLPPH, o); }
function rlpSheetIds(sh) { const S = new Set(); (sh.blocks || []).forEach(b => { if (b.type === 'tasks') b.items.forEach(it => rlpOf(it).forEach(id => S.add(id))); }); return [...S].sort(rlpCmp); }
// Vorschläge aus dem Aufgabentext: [Muster, zusätzliches Muster, Standard Q-Phase, Standard E-Phase]
const RLP_SUGG = [
  [/(gedicht|lyri|roman|novelle|erzählung|drama|dramen|szene|kurzgeschichte|parabel|ballade|fabel|märchen|figur|erzähler|literarisch|strophe)/, /(analys|untersuch|erschließ|charakterisier)/, 'q:Tlit1', 'e:T1'],
  [/(interpret|deuten sie|deute |deutung)/, null, 'q:Tlit2', 'e:T3'],
  [/(epoche|aufklärung|sturm und drang|klassik|romantik|biedermeier|vormärz|realismus|naturalismus|expressionismus|neue sachlichkeit|exilliteratur|nachkriegsliteratur)/, null, 'q:Tlit3', null],
  [/vergleich/, /(gedicht|roman|novelle|erzählung|drama|szene|figur|literarisch)/, 'q:Tlit8', null],
  [/(sachtext|rede\b|kommentar|essay|artikel|zeitung|glosse|leitartikel|reportage|interview|pragmatisch|rezension|blog|beitrag)/, /(analys|untersuch)/, 'q:Tprag5', 'e:T1'],
  [/(absicht|intention|funktion des textes)/, null, 'q:Tprag4', 'e:T2'],
  [/wirkung/, /(gestaltungsmittel|stilmittel|sprachliche mittel|rhetorische mittel|bildsprache)/, 'q:Tprag5', 'e:T2'],
  [/vergleich/, /(sachtext|rede\b|kommentar|artikel|position|texte)/, 'q:Tprag8', null],
  [/(argumentationsstruktur|argumentationsweise|argumentationsgang)/, null, 'q:Tprag11', null],
  [/(erörter|stellung|beurteil|bewert|setz\w* sich .*auseinander|setz\w* dich .*auseinander)/, null, 'q:Sarg5', 'e:Stf1'],
  [/(zusammenfass|fass\w* .*zusammen|gib .*wieder|geben sie .*wieder|wiedergeb|exzerpier)/, null, 'q:Sinf3', 'e:L1'],
  [/(inneren? monolog|tagebuch|brief|umschreib|weiterschreib|fortsetzung|paralleltext|perspektivwechsel|gestalte\b|gestalten sie|verfass\w* (sie )?(einen|eine|ein) )/, null, 'q:Sgest1', 'e:Stf1'],
  [/(film|verfilmung|inszenierung|hörspiel|hörtext|theater|podcast)/, null, 'q:Tmed2', 'e:T1'],
  [/(sprachwandel|anglizism|jugendsprache|sprachkriti)/, null, 'q:Spr10', 'e:Spr2'],
  [/(varietät|dialekt|soziolekt|fachsprache|ethnolekt)/, null, 'q:Spr4', 'e:Spr1'],
  [/(mehrsprachig|sprachenvielfalt)/, null, 'q:Spr9', null],
  [/(kommunikationsmodell|schulz von thun|watzlawick|gesprächsanalyse|kommunikationssituation)/, null, 'q:Spr5', 'e:SZd2'],
  [/(manipul|persuasi|werbung|propaganda|rhetori)/, null, 'q:Spr11', null],
  [/(diskutier|diskussion|debatt|streitgespräch|fishbowl)/, null, 'q:SZd3', 'e:SZd3'],
  [/(referat|präsentier|präsentation|vortrag|kurzvortrag)/, null, 'q:SZm3', 'e:SZm2'],
  [/(zitier|textbeleg|belegen sie|belege )/, null, 'q:Sstr4', 'e:T3'],
  [/überarbeit/, null, 'q:Sstr5', 'e:Sstr7'],
  [/recherch/, null, 'q:Sstr3', 'e:Sstr3'],
  [/beschreib/, /(aufbau|struktur|merkmal)/, 'q:Sinf2', null]];
function rlpSuggest(it, ph) {
  if (ph === 'own') return [];
  const t = plainText(it.text || '').toLowerCase(); if (!t.trim()) return [];
  const have = new Set(rlpOf(it)); const out = [];
  RLP_SUGG.forEach(([a, b2, q, e]) => { const id = ph === 'e' ? e : q; if (!id || have.has(id) || out.includes(id)) return; if (a.test(t) && (!b2 || b2.test(t))) out.push(id); });
  return out.slice(0, 3);
}
const rlpHit = (q, s) => !q || q.split(/\s+/).every(w => s.includes(w));
function rlpPanel(b, i, it) {
  const kl = state.sheet.klasse, fach = fachKey(kl), cat = RLP_BY[fach], ph = rlpPhase(kl);
  const cur = rlpOf(it), has = new Set(cur), q = String(state.rlpQ || '').trim().toLowerCase();
  const chip = id => { const x = rlpInfo(id); return `<span class="rlp-chip${x.own ? ' own' : ''}" title="${esc(x.t)}"><code>${esc(x.code)}</code><span>${esc(x.t)}</span><button type="button" class="x" data-act="rlp-tog" data-i="${i}" data-v="${esc(id)}" aria-label="Standard entfernen" title="Entfernen">×</button></span>`; };
  const rs = x => (x.code + ' ' + x.t).toLowerCase(); let direct = false;
  const ok = (x, gq) => !q || (direct ? rlpHit(q, rs(x)) : rlpHit(q, rs(x) + ' ' + gq));
  const row = (id, x, gq, del) => `<div class="rlp-row"${ok(x, gq) ? '' : ' hidden'}><button type="button" class="rlp-it" data-act="rlp-tog" data-i="${i}" data-v="${esc(id)}" aria-pressed="${has.has(id)}" data-q="${esc((x.code + ' ' + x.t).toLowerCase())}"><span class="cbx" aria-hidden="true"></span><code>${esc(x.own ? '' : x.code)}</code><span class="t">${esc(x.t)}</span>${x.lk ? '<em title="nur Leistungskurs">LK</em>' : ''}</button>${del ? `<button type="button" class="ib" data-act="rlp-own-del" data-i="${i}" data-v="${esc(x.t)}" title="Aus der Liste entfernen" aria-label="Aus der Liste entfernen">${I.x}</button>` : ''}</div>`;
  const grp = ({ head, rows, kw }) => { const gq = (head + ' ' + (kw || '')).toLowerCase(); const html = rows.map(([id, x, del]) => row(id, x, gq, del)).join(''); const any = rows.some(([, x]) => ok(x, gq)); return `<div class="rlp-g" data-q="${esc(gq)}"${any ? '' : ' hidden'}><div class="rlp-gh">${esc(head)}</div>${html}</div>`; };
  const GR = [];
  if (cat && ph !== 'own') { const M = rlpMap(); cat[ph].groups.forEach(g => GR.push({ head: `${g.code} · ${g.name}`, kw: RLP_KW[g.k], rows: g.items.map((_, j) => { const id = `${ph}:${g.k}${j + 1}`; return [id, M[id], false]; }) })); }
  const own = rlpOwnList(fach); if (own.length) GR.push({ head: 'Eigene Standards', rows: own.map(t => ['~' + t, rlpInfo('~' + t), true]) });
  direct = !!q && GR.some(g => g.rows.some(([, x]) => rlpHit(q, rs(x))));
  let list = GR.map(grp).join('');
  list += own.length ? '' : (cat && ph !== 'own' ? '' : '<div class="rlp-none">Noch keine eigenen Standards. Trag unten welche ein, zum Beispiel aus deinem Fachlehrplan. Mehrere auf einmal: einen pro Zeile.</div>');
  const sugg = rlpSuggest(it, ph);
  return `<div class="f tx-f rlp-f"><span>Standards${cat ? ' aus dem Rahmenlehrplan' : ''}</span>
    ${cur.length ? `<div class="rlp-chosen">${cur.map(chip).join('')}</div>` : ''}
    ${sugg.length ? `<div class="rlp-sugg"><span>Passt vielleicht:</span>${sugg.map(id => { const x = rlpInfo(id); return `<button type="button" data-act="rlp-tog" data-i="${i}" data-v="${esc(id)}" title="${esc(x.t)}"><b>+ ${esc(x.code)}</b><span>${esc(rlpShort(x.t, 46))}</span></button>`; }).join('')}</div>` : ''}
    <div class="rlp-tools"><input class="inp" type="search" data-rlpq="${i}" value="${esc(state.rlpQ || '')}" placeholder="Suchen, z. B. Lyrik, zitieren, T-lit" aria-label="Standards durchsuchen">${cat ? `<div class="seg sm" role="group" aria-label="Katalog">${RLP_PH.map(([v, t]) => `<button type="button" data-act="rlp-ph" data-i="${i}" data-v="${v}" aria-pressed="${ph === v}">${t}</button>`).join('')}</div>` : ''}</div>
    <div class="rlp-list" data-i="${i}">${list}<div class="rlp-add"><textarea class="inp" rows="1" data-rlpnew="${i}" placeholder="Eigener Standard, z. B. aus dem schulinternen Curriculum" aria-label="Eigenen Standard eintragen"></textarea><button type="button" class="btn sm" data-act="rlp-own-add" data-i="${i}">Anlegen</button></div></div>
    ${cat ? '' : `<small class="hint">Für ${esc(FAECHER[fach].label)} ist kein Rahmenlehrplan hinterlegt. Eigene Standards gelten für alle Klassen dieses Fachs.</small>`}</div>`;
}
function rlpFilter(root) {
  if (!root) return; const q = String(state.rlpQ || '').trim().toLowerCase();
  const direct = !!q && [...root.querySelectorAll('.rlp-it')].some(it => rlpHit(q, it.dataset.q || ''));
  root.querySelectorAll('.rlp-g').forEach(g => { let any = false; g.querySelectorAll('.rlp-row').forEach(r => { const it = r.querySelector('.rlp-it'); const ok = !q || rlpHit(q, (it.dataset.q || '') + (direct ? '' : ' ' + (g.dataset.q || ''))); r.hidden = !ok; any = any || ok; }); g.hidden = !any; });
}
function rlpKeep(bid, i, fn, toEnd) {
  const sel = `#editor [data-bid="${bid}"] .rlp-list[data-i="${i}"]`; const l = $(sel); const st = l ? l.scrollTop : 0;
  fn(); const n = $(sel); if (n) n.scrollTop = toEnd ? n.scrollHeight : st;
}
const lvOk = (x, v) => !v || !v.lvl || v.lvl === 'all' || !Array.isArray(x.lv) || x.lv.includes(v.lvl);
// Aufgaben mit „Nur auf der Folie“ (it.fo) erscheinen in Präsentation, PowerPoint und Verlaufsplan (Ansicht mit pres), nicht auf dem Blatt
const itFo = it => !!(it && it.fo);
const foOnly = b => !!b && b.type === 'tasks' && Array.isArray(b.items) && b.items.length > 0 && b.items.every(itFo);
const rst = b => !!b.restart && !foOnly(b);
// Arbeitsteiliger Aufgabenbaustein (b.par): läuft parallel zum Aufgabenbaustein davor, beginnt mit derselben Nummer;
// der nächste normale Baustein zählt hinter der höchsten Nummer weiter. TN = Zähler-Gedächtnis je Durchlauf.
const parB = b => !!(b && b.type === 'tasks' && b.par);
function tnAt(b, t, TN) {
  if (rst(b)) { t = 0; TN.s = null; TN.hi = null; }
  if (parB(b) && TN.s != null) { TN.hi = Math.max(TN.hi || 0, t); return TN.s; }
  if (TN.hi != null) { t = Math.max(t, TN.hi); TN.hi = null; }
  TN.s = t; return t;
}
const itNos = (b, from) => { let c = from; return (b.items || []).map(it => (itFo(it) || itRkN(it) ? 0 : c++)); };
const blockVisible = (b, v) => (!v || v.grp === 'all' || !b.group || b.group === v.grp) && lvOk(b, v) && !(v && !v.pres && foOnly(b));
// Aufgaben der gewählten Stufe: nur die Aufgaben dieser Stufe, mit dem Text für Basis oder Experte, wenn einer eingetragen ist
const grpOk = (x, v) => !v || !v.grp || v.grp === 'all' || !x.grp || x.grp === v.grp;
const itOk = (it, v) => lvOk(it, v) && grpOk(it, v) && (!itFo(it) || !!(v && v.pres));
const itemsFor = (b, v) => { const l = v && v.lvl; const its = b.items.filter(it => itOk(it, v)); if (!l || l === 'all') return its; return its.map(it => { const t = l === 'b' ? it.lvb : l === 'e' ? it.lve : ''; return String(t || '').trim() ? { ...it, text: t } : it; }); };
const lvTipOf = (it, v, meta) => v && v.lvl === 'b' && meta.lvTip !== false ? (tipsOf(it)[0] || '') : '';
var tipsOf = it => (Array.isArray(it.tips) ? it.tips : (it.tips && typeof it.tips === 'object' ? [0, 1, 2].map(j => it.tips[j]) : [])).map(s => String(s || '').trim()).filter(Boolean);
const ehLines = it => String(it.eh || '').split('\n').map(s => s.trim().replace(/^[-–•]\s*/, '')).filter(Boolean);
function taskRight(it, r, meta, v, bi) {
  const out = []; const isK = meta.mode === 'klausur';
  if (isK && String(it.pts || '').trim()) out.push(`<b>${esc(it.pts)}</b>`);
  if ((meta.showAFB || (v && v.lehrer)) && r) out.push('AFB ' + afbLabel(r));
  const n = tipsOf(it).length; if (n && !isK) out.push(`Tipps: ${n}`);
  const ph = itPh(it); const tm = bi && bi.min ? `${bi.min} Min.${bi.n > 1 ? `<br><small>für ${bi.from}–${bi.to}</small>` : ''}` : '';
  if (v && v.lehrer && (ph || tm)) out.push(`<span class="t-ph">${ph ? PHASEN[ph].label : ''}${ph && tm ? '<br>' : ''}${tm}</span>`);
  else if (meta.showMin && tm) out.push(`<span class="t-min">ca. ${tm}</span>`);
  return out.join('<br>');
}
function taskEH(it, v) {
  if (!v || !v.lehrer) return ''; const lines = ehLines(it), rl = rlpOf(it); if (!lines.length && !rl.length) return '';
  return `<div class="task-eh">${lines.length ? `<span>Erwartung</span><ul>${lines.map(s => `<li>${inlineHTML(s)}</li>`).join('')}</ul>` : ''}${rl.length ? `<span>Standards</span><ul class="eh-rlp">${rl.map(id => { const x = rlpInfo(id); return `<li>${x.own ? '' : `<b>${esc(x.code)}</b>`}${esc(rlpShort(x.t, 120))}</li>`; }).join('')}</ul>` : ''}</div>`;
}
function buildCover(meta, sh, v, body) {
  const ex = meta.exam || {};
  const vis = sh.blocks.filter(b => blockVisible(b, v)); const mtags = matTags(vis); const mats = vis.filter(b => mtags[b.id]);
  const tasks = []; let t = 0; const TN = {};
  sh.blocks.forEach(b => { if (b.type !== 'tasks' || !blockVisible(b, v)) return; t = tnAt(b, t, TN); itemsFor(b, v).forEach(it => { t++; tasks.push({ no: t, pts: it.pts || '' }); }); });
  const sub = [meta.course, ex.halbjahr].filter(Boolean).map(esc).join(' · ');
  const node = el(`<div class="blk blk-cover" data-bid="meta">
    <div class="cv-top"><span>${esc(meta.school || '')}</span><span>${esc(meta.course || '')}</span></div>
    <div class="cv-title">${esc(ex.label || 'Klausur')}</div>${sub ? `<div class="cv-sub">${sub}</div>` : ''}
    <table class="cv-grid"><tr><th>Name</th><td></td></tr><tr><th>Datum</th><td>${esc(ex.datum || '')}</td></tr>${ex.zeit ? `<tr><th>Bearbeitungszeit</th><td>${esc(ex.zeit)}</td></tr>` : ''}${ex.hilfsmittel ? `<tr><th>Hilfsmittel</th><td>${esc(ex.hilfsmittel)}</td></tr>` : ''}</table>
    ${mats.length ? `<div class="cv-h">Materialgrundlage</div><ul class="cv-list">${mats.map(b => `<li><b>${mtags[b.id]}</b><span>${inlineHTML(matTitle(b)) || 'ohne Titel'}</span></li>`).join('')}</ul>` : ''}
    ${tasks.length ? `<div class="cv-h">Aufgaben</div><table class="cv-tasks"><tr><td>Aufgabe</td><td>Gewichtung</td></tr>${tasks.map(x => `<tr><td>${x.no}</td><td>${esc(x.pts) || '&nbsp;'}</td></tr>`).join('')}</table>` : ''}
  </div>`);
  body.appendChild(node); return { type: 'cover', el: node };
}
function buildRunHead(meta, body) {
  const ex = meta.exam || {};
  const node = el(`<div class="blk run-head" data-bid="meta"><span>${[ex.label || 'Klausur', meta.course].filter(Boolean).map(esc).join(' · ')}</span><span>Name <i></i></span></div>`);
  headSp(node, meta);
  body.appendChild(node); return { type: 'head', el: node };
}
function buildGroupBadge(meta, g, body) {
  const node = el(`<div class="blk grp-badge" data-bid="meta"><b>${esc(grpName(meta, g))}</b><span>${esc(grpAdd(meta, g))}</span></div>`);
  body.appendChild(node); return { type: 'badge', el: node };
}
// Passt Text in feste Kästen ein (Tippkarten verkleinern, Tafelkarten vergrößern)
function fitDown(n, max = 12, min = 7.5) { let s = max; n.style.fontSize = s + 'pt'; while (n.scrollHeight > n.clientHeight + 1 && s > min) { s -= .5; n.style.fontSize = s + 'pt'; } }
function fitUp(inner, frame, maxPx) {
  const cs = getComputedStyle(frame);
  const H = frame.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const ok = px => { inner.style.fontSize = px + 'px'; return inner.offsetHeight <= H + .5 && inner.scrollWidth <= inner.clientWidth + .5; };
  let lo = 8, hi = maxPx;
  if (ok(hi)) lo = hi; else for (let k = 0; k < 18; k++) { const mid = (lo + hi) / 2; if (ok(mid)) lo = mid; else hi = mid; }
  inner.style.fontSize = Math.floor(lo) + 'px';
  return Math.floor(lo);
}

