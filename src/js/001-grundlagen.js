/* ================= Grundlagen ================= */
const MMPX = 96 / 25.4;
// Digitale Fassung per Link (…/#d=ID): Die Seite zeigt nur das Blatt für Schülerinnen und Schüler
const DG_VIEW = ((typeof location !== 'undefined' && location.hash.match(/^#d=([A-Za-z0-9]{8,24})$/)) || [])[1] || '';
let ZL_MAP = {};                 // je Material: Wörter und ihre Zeilen- bzw. Versnummer aus dem letzten Satz
let SPLIT_MATS = new Set();      // Materialien, die in der Vorschau über mehrere Seiten laufen (für die Fußnoten in Word)
let AVAIL = 264 * MMPX;          // nutzbare Höhe je Seite (mm → px)
const GAP = 5 * MMPX;              // Abstand zwischen Bausteinen
const LIBS = {
  h2c: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  pdf: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  zip: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  pptx: 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js',
  supa: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4'
};
const FONT_SPECS = ['400 11pt "Atkinson Hyperlegible"','700 11pt "Atkinson Hyperlegible"','italic 400 11pt "Atkinson Hyperlegible"',
  '400 11pt Literata','600 11pt Literata','700 11pt Literata','italic 400 11pt Literata'];
const ACCENTS = {
  tinte:   { name:'Tinte',   c:'#1F4FA0', t:'#E9EEF8' },
  petrol:  { name:'Petrol',  c:'#0D6767', t:'#E3F0EF' },
  wein:    { name:'Weinrot', c:'#8A2A3E', t:'#F5E9EC' },
  graphit: { name:'Graphit', c:'#383C44', t:'#ECEDF0' }
};
/* Reiter: eine Ablage je Klasse. Neue Blätter übernehmen Kurs, Farbe und Anrede der Klasse. */
const DEFAULT_KLASSEN = [
  { id: 'gk',   label: 'Grundkurs',   course: 'Grundkurs Deutsch',   school: 'Georg-Herwegh-Gymnasium', accent: 'tinte',  anrede: 'sie' },
  { id: 'k10',  label: 'Klasse 10',   course: 'Deutsch Klasse 10',   school: 'Waldseeschule',           accent: 'petrol', anrede: 'du' },
  { id: 'k910', label: 'Klasse 9/10', course: 'Deutsch Klasse 9/10', school: 'Waldseeschule',           accent: 'wein',   anrede: 'du' }
];
// Die Klassen gehören zum Konto (Einstellungen der Ablage). DEFAULT_KLASSEN sind die ursprünglichen drei Reiter.
const LEGACY_IDS = ['gk', 'k10', 'k910'];
const LS_KLCACHE = 'abw.klassen';
const normKlasse = (k, i) => ({ id: String(k && k.id || 'k' + (i + 1)), label: String(k && k.label || '').trim().slice(0, 40) || `Klasse ${i + 1}`, course: String(k && k.course || '').trim().slice(0, 80), school: String(k && k.school || '').trim().slice(0, 80), accent: ACCENTS[k && k.accent] ? k.accent : Object.keys(ACCENTS)[i % 3], anrede: k && k.anrede === 'du' ? 'du' : 'sie', fach: k && FAECHER[k.fach] ? k.fach : 'deutsch', stufe: k && k.stufe === 'gs' ? 'gs' : 'os', jg: k && k.stufe === 'gs' ? Math.max(1, Math.min(6, +k.jg || jgGuess(k.label) || 3)) : 0 });
/* Fächer: bestimmen Operatoren, Vorlagen, Formulierungshilfen und Materialarten */
const FAECHER = { deutsch: { label: 'Deutsch', course: 'Deutsch', ops: 'IQB-Grundstock Deutsch', opsShort: 'IQB-Grundstock' }, gp: { label: 'Geschichte/Politik', course: 'Geschichte', ops: 'KMK-Operatoren Geschichte', opsShort: 'KMK-Liste Geschichte' }, bio: { label: 'Biologie', course: 'Biologie', ops: 'KMK-Operatoren Naturwissenschaften', opsShort: 'KMK-Liste Naturwissenschaften' },
  en: { label: 'Englisch', course: 'Englisch', ops: 'Operatoren Englisch (KMK, Abitur)', opsShort: 'Operatoren Englisch', lang: 'en' },
  es: { label: 'Spanisch', course: 'Spanisch', ops: 'Operatoren Spanisch (KMK, Abitur)', opsShort: 'Operatoren Spanisch', lang: 'es' },
  fr: { label: 'Französisch', course: 'Französisch', base: 'fr', ops: 'Opérateurs Französisch (KMK, Abitur)', opsShort: 'Operatoren Französisch', lang: 'fr' },
  la: { label: 'Latein', course: 'Latein', base: 'deutsch', ops: 'Operatoren Latein', opsShort: 'Operatoren Latein' },
  ma: { label: 'Mathematik', course: 'Mathematik', base: 'ma', ops: 'KMK-Operatoren Mathematik', opsShort: 'KMK-Liste Mathematik' },
  inf: { label: 'Informatik', course: 'Informatik', base: 'ma', ops: 'KMK-Operatoren Informatik', opsShort: 'KMK-Liste Informatik' },
  ph: { label: 'Physik', course: 'Physik', base: 'bio', ops: 'KMK-Operatoren Naturwissenschaften', opsShort: 'KMK-Liste Naturwissenschaften' },
  ch: { label: 'Chemie', course: 'Chemie', base: 'bio', ops: 'KMK-Operatoren Naturwissenschaften', opsShort: 'KMK-Liste Naturwissenschaften' },
  nawi: { label: 'Naturwissenschaften', course: 'Naturwissenschaften', base: 'bio', ops: 'KMK-Operatoren Naturwissenschaften', opsShort: 'KMK-Liste Naturwissenschaften' },
  su: { label: 'Sachunterricht', course: 'Sachunterricht', base: 'bio', ops: 'Operatoren Sachunterricht', opsShort: 'Operatoren Sachunterricht' },
  geo: { label: 'Geografie', course: 'Geografie', base: 'gp', ops: 'KMK-Operatoren Geografie', opsShort: 'KMK-Liste Geografie' },
  pb: { label: 'Politische Bildung', course: 'Politische Bildung', base: 'gp', ops: 'KMK-Operatoren Politische Bildung', opsShort: 'KMK-Liste Politik' },
  gewi: { label: 'Gesellschaftswissenschaften', course: 'Gesellschaftswissenschaften', base: 'gp', ops: 'KMK-Operatoren Gesellschaftswissenschaften', opsShort: 'KMK-Liste Gewi' },
  wat: { label: 'Wirtschaft-Arbeit-Technik', course: 'WAT', base: 'gp', ops: 'Operatoren WAT', opsShort: 'Operatoren WAT' },
  eth: { label: 'Ethik', course: 'Ethik', base: 'deutsch', ops: 'Operatoren Ethik/Philosophie', opsShort: 'Operatoren Ethik' },
  phil: { label: 'Philosophie', course: 'Philosophie', base: 'deutsch', ops: 'Operatoren Philosophie (KMK)', opsShort: 'Operatoren Philosophie' },
  reli: { label: 'Religion', course: 'Religion', base: 'deutsch', ops: 'Operatoren Religion', opsShort: 'Operatoren Religion' },
  ku: { label: 'Kunst', course: 'Kunst', base: 'deutsch', ops: 'Operatoren Kunst', opsShort: 'Operatoren Kunst' },
  mu: { label: 'Musik', course: 'Musik', base: 'deutsch', ops: 'Operatoren Musik', opsShort: 'Operatoren Musik' },
  sp: { label: 'Sport', course: 'Sport', base: 'deutsch', ops: 'Operatoren Sport', opsShort: 'Operatoren Sport' },
  th: { label: 'Theater / Darstellendes Spiel', course: 'Darstellendes Spiel', base: 'deutsch', ops: 'Operatoren Darstellendes Spiel', opsShort: 'Operatoren DS' } };
// Fächer mit gleicher Arbeitsweise teilen Bausteine, Vorlagen, Formulierungshilfen und (wo es passt) Operatoren
const fachBase = kl => { const k = fachKey(kl); return (FAECHER[k] || {}).base || k; };
const fachLang = kl => (FAECHER[fachKey(kl)] || {}).lang || 'de';
const fachKey = kl => KL(kl || (state.sheet ? state.sheet.klasse : state.klasse)).fach || 'deutsch';
const fachInfo = kl => FAECHER[fachKey(kl)] || FAECHER.deutsch;
let KLASSEN = (() => { try { const c = JSON.parse(localStorage.getItem(LS_KLCACHE) || 'null'); if (Array.isArray(c) && c.length) return c.map(normKlasse); } catch {} return DEFAULT_KLASSEN.map((k, i) => normKlasse(k, i)); })();
const KL = id => KLASSEN.find(k => k.id === id) || KLASSEN[0];
/* Online-Ablage über Supabase (Projekt in der Organisation EduFire, Tabelle ab_arbeitsblaetter).
   Der Publishable key ist für öffentliche Seiten gedacht; geschützt wird über Anmeldung und Zugriffsregeln (RLS).
   url oder key leer = ausgeschaltet: Blätter bleiben im Browser. */
const SUPABASE = { url: 'https://beggvunasgsckybbsbnc.supabase.co', key: 'sb_publishable_xf8Ep709gm3S3YLVXXsv_w_tIY1_hTb', table: 'ab_arbeitsblaetter' };
const INFO_KINDS = ['Info','Merke','Tipp','Hinweis','Methode','Definition'];
// Zusätzlicher Abstand bei Überschriften (mm): mehr / viel
const H_SP = { top: { m: 4, l: 9 }, bot: { m: 3, l: 7 } };
// Piktogramme der Bausteine (24er-Raster, Strich in Textfarbe)
const TYPE_ICON = {
  meta: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 8.5h16M7 5.8h5M7.5 12.5h9M7.5 16h6"/>',
  seite: '<rect x="5" y="2.5" width="14" height="19" rx="1.5"/><path d="M8 6.5h8M8 17.5h8" stroke-dasharray="1.6 1.6"/><path d="M2.5 6v12M21.5 6v12" opacity=".5"/>',
  material: '<rect x="5.5" y="3" width="14" height="18" rx="2"/><path d="M9.5 7.5h7M9.5 11h7M9.5 14.5h7M9.5 18h4.5"/><path d="M2.8 7.5h.6M2.8 14.5h.6" stroke-width="2.2"/>',
  poem: '<path d="M20 4C13.2 4.4 8.7 9 8.1 15.8L6.6 20"/><path d="M8.4 14.1c4.7-.4 8.9-3.7 11.6-10.1"/><path d="M11 10.8h4.4"/><path d="M3.5 20.5h6"/>',
  tasks: '<rect x="3.5" y="4" width="6.5" height="6.5" rx="1.5"/><path d="m5.2 7.3 1.3 1.3 2-2.3"/><path d="M13 7.2h7.5"/><rect x="3.5" y="13.5" width="6.5" height="6.5" rx="1.5"/><path d="M13 16.8h7.5"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><path d="M12 7.7v.2" stroke-width="2.6"/>',
  phrases: '<path d="M4 5h16v10.5H10.5L6 19v-3.5H4z"/><path d="M8 9h8M8 12h5"/>',
  step: '<path d="M6 21V3.5"/><path d="M6 4h12l-2.6 3.6L18 11.2H6"/>',
  a3: '<rect x="2.5" y="4.5" width="19" height="15" rx="1.5"/><path d="M7 15.5l2.2-6 2.2 6M7.8 13.5h2.8M14 9.5h2.4a1.4 1.4 0 0 1 0 2.8H15m0 0h1.6a1.6 1.6 0 0 1 0 3.2H14"/>',
  tafel: '<rect x="3" y="3.5" width="18" height="12.5" rx="1.2"/><path d="M8 20.5l2-4.5M16 20.5l-2-4.5M6.5 7.5h4.5M6.5 10.5h7M14.5 7.5h3"/>',
  table: '<rect x="3.5" y="5" width="17" height="14" rx="1.5"/><path d="M3.5 10h17M3.5 14.5h17M9.5 5v14M15 5v14"/>',
  lines: '<path d="M3.5 9.5h9M3.5 14h17M3.5 18.5h17"/><path d="m14.5 10.3 5.2-5.2 1.9 1.9-5.2 5.2-2.6.7z"/>',
  heading: '<path d="M6 5v14M15 5v14M6 12h9"/><path d="M18.5 19h2.5"/>',
  text: '<path d="M4 6h16M4 10h16M4 14h16M4 18h10"/>',
  quote: '<path d="M10.5 6.5C7 7.6 5 10.2 5 13.6V18h5v-5H7.3c.2-2 1.4-3.6 3.6-4.6zM19.5 6.5c-3.5 1.1-5.5 3.7-5.5 7.1V18h5v-5h-2.7c.2-2 1.4-3.6 3.6-4.6z" fill="currentColor" stroke="none"/>',
  qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5z"/>',
  image: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17.5 5-4.5 3.5 3 3-2.5 4.5 4"/>',
  post: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="8" cy="8.5" r="2"/><path d="M11.5 7.6h5.5M11.5 10h3.5M7 13.8h10M7 16.8h7"/>',
  match: '<circle cx="5.5" cy="6" r="1.7"/><circle cx="5.5" cy="12" r="1.7"/><circle cx="5.5" cy="18" r="1.7"/><circle cx="18.5" cy="6" r="1.7"/><circle cx="18.5" cy="12" r="1.7"/><circle cx="18.5" cy="18" r="1.7"/><path d="M7.4 6.4 16.6 17.6M7.4 12l9.2-5.6M7.4 18l9.2-5.6"/>',
  quelle: '<path d="M8 4h9.5A2.5 2.5 0 0 1 20 6.5V18a2 2 0 0 1-2 2H9"/><path d="M8 4a2.5 2.5 0 0 0-2.5 2.5V9H9"/><path d="M9 20a2 2 0 0 1-2-2V6.5"/><path d="M11.5 9h5M11.5 12.5h5M11.5 16h3"/>',
  darstellung: '<path d="M3.5 5.5A1.5 1.5 0 0 1 5 4h5.5A1.5 1.5 0 0 1 12 5.5V20a2 2 0 0 0-2-2H3.5z"/><path d="M20.5 5.5A1.5 1.5 0 0 0 19 4h-5.5A1.5 1.5 0 0 0 12 5.5V20a2 2 0 0 1 2-2h6.5z"/>',
  zeitleiste: '<path d="M3 12h18"/><path d="M6.5 8.5v7M12 6.5v11M17.5 8.5v7"/>',
  protokoll: '<path d="M9 3.5h6M10 3.5v6l-5 8.6A1.9 1.9 0 0 0 6.6 21h10.8a1.9 1.9 0 0 0 1.6-2.9L14 9.5v-6"/><path d="M7.4 15.5h9.2"/>',
  zeichnung: '<rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><path d="m8 16 1-3.2 6.2-6.2 2.2 2.2-6.2 6.2z"/>',
  pagebreak: '<path d="M5 3v5.5h14V3M5 21v-5.5h14V21"/><path d="M3 12h2.5M8.2 12h2.5M13.3 12h2.5M18.5 12H21"/>'
};
Object.keys({ kreuz: 1, ordnen: 1, suchsel: 1, silben: 1, abschreib: 1, bildschreib: 1, selbst: 1 }).forEach(k => { TYPE_ICON['gs-' + k] = () => GSA[k].ic; });
const typeIcon = (k, cls = 'ty-i') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${typeof TYPE_ICON[k] === 'function' ? TYPE_ICON[k]() : TYPE_ICON[k] || TYPE_ICON.text}</svg>`;
const iconKey = b => b.type === 'material' && b.post ? 'post' : b.type === 'material' && b.mk === 'q' ? 'quelle' : b.type === 'material' && b.mk === 'd' ? 'darstellung' : b.type === 'material' && b.form === 'gedicht' ? 'poem' : b.type === 'lines' && b.style === 'rahmen' ? 'zeichnung' : b.type === 'gsa' ? 'gs-' + gsaK(b) : b.type;
// Tabellen: Höhe einer Zeile in mm (Voreinstellung, eigene Höhe oder Höhe dieser Zeile)
const TB_H = { normal: 8, hoch: 16, sehrhoch: 28, gross: 40 };
const tbBaseMM = b => b.rowHeight === 'eigen' ? Math.max(5, Math.min(250, Number(b.rowMM) || 50)) : TB_H[b.rowHeight] || 8;
const tbRowMM = (b, ri) => { const own = b.rowEach && Array.isArray(b.rowH) ? Number(b.rowH[ri]) : 0; return own >= 5 ? Math.min(250, own) : tbBaseMM(b); };
// Schreiblinien in einer leeren Zelle: etwa alle 9 mm, die untere Zellkante ist die letzte Linie
// Erwartung einer Tabellenzelle (nur Lehrerfassung); eine Zeile = ein Punkt
const tbEh = (b, ri, ci) => String((b.eh && b.eh[ri] && b.eh[ri][ci]) || '').split('\n').map(x => x.trim().replace(/^[-–•]\s*/, '')).filter(Boolean);
const tbEhCount = b => b.rows.reduce((n, r, ri) => n + r.reduce((k, _, ci) => k + (tbEh(b, ri, ci).length ? 1 : 0), 0), 0);
const tbLines = h => Math.max(1, Math.round(h / 9));
const typeLabel = b => b.type === 'gsa' ? GSA[gsaK(b)].label : b.type === 'a3' ? (a3Fmt(b) === 'a4' ? 'A4-Vorlage' : 'A3-Vorlage') : b.type === 'material' && b.post ? 'Post' : b.type === 'image' && b.mk === 'q' ? 'Bildquelle' : b.type === 'image' && b.mk === 'a' ? 'Abbildung' : b.type === 'lines' && b.style === 'rahmen' ? 'Zeichenfläche' : b.type === 'material' && b.mk === 'q' ? 'Quelle' : b.type === 'material' && b.mk === 'd' ? 'Darstellung' : b.type === 'material' && b.form === 'gedicht' ? 'Gedicht' : (TYPES[b.type] || {}).label || '';
const TYPES = {
  material: { label:'Material',      desc:'Text mit Zeilennummern' },
  poem:     { label:'Gedicht',       desc:'Verse und Strophen' },
  tasks:    { label:'Aufgaben',      desc:'mit Operator-Check' },
  match:    { label:'Zuordnen',      desc:'Wörter oder Sätze verbinden' },
  info:     { label:'Infokasten',    desc:'Merke, Tipp, Definition' },
  phrases:  { label:'Formulierungshilfen', desc:'Satzanfänge, Wendungen' },
  tafel:    { label:'Tafelbild',     desc:'Sicherung, auch als Lückentafelbild und am Beamer' },
  a3:       { label:'Druckvorlage',  desc:'A3: Placemat, Lernplakat … · A4: Karten, Lernkarten, Satzstreifen, Tandem' },
  step:     { label:'Unterrichtsschritt', desc:'Zwischenfolie: Einstieg, Sicherung, Stundenfrage, Abschluss, nur in der Präsentation' },
  table:    { label:'Tabelle',       desc:'zum Ausfüllen' },
  lines:    { label:'Schreibfläche', desc:'Linien oder Kästchen' },
  heading:  { label:'Überschrift',   desc:'Zwischentitel' },
  text:     { label:'Absatz',        desc:'Einleitung, Hinweis' },
  quote:    { label:'Zitat',         desc:'Impuls zum Einstieg' },
  qr:       { label:'QR-Code',       desc:'Link zu Video, Quelle' },
  image:    { label:'Bild',          desc:'Grafik, Schaubild' },
  pagebreak:{ label:'Seitenumbruch', desc:'Rest auf neue Seite' },
  gsa:      { label:'Grundschul-Aufgabe', desc:'Ankreuzen, Reihenfolge, Suchsel, Silben, Abschreiben, Bild und Schreiben, Selbsteinschätzung' }
};

/* Bausteinliste je Fach. Ein Eintrag ist eine Bausteinart mit Voreinstellungen (pre). Gedichte gibt es nur in Deutsch. */
const PAL_POST = () => PAL('material', { k: 'post', label: 'Post', desc: 'Beitrag aus sozialen Netzwerken, mit Zeilennummern', ic: 'post', pre: { post: { pf: 'x', name: '', handle: '', date: '', re: '', rp: '', li: '', fiktiv: true }, fmt: { font: 'sans', align: 'left', indent: false } } });
const PAL = (type, o = {}) => ({ k: o.k || type, type, label: o.label || TYPES[type].label, desc: o.desc || TYPES[type].desc, ic: o.ic || type, pre: o.pre || null });
const PAL_SORT = () => PAL('match', { k: 'sortieren', label: 'Sortieren', desc: 'Wörter Oberbegriffen zuordnen, mehrere je Begriff', pre: { sort: true, cats: [{ id: 'c1', t: '' }, { id: 'c2', t: '' }], words: [{ t: '', c: 'c1' }, { t: '', c: 'c1' }, { t: '', c: 'c2' }, { t: '', c: 'c2' }] } });
const PALETTE = {
  get deutsch() { const v = ['material', 'poem', 'post', 'tasks', 'match', 'sort', 'info', 'phrases', 'tafel', 'a3', 'step', 'table', 'lines', 'heading', 'text', 'quote', 'qr', 'image', 'pagebreak'].map(t => t === 'post' ? PAL_POST() : t === 'sort' ? PAL_SORT() : PAL(t)).concat(PAL_GSA()); Object.defineProperty(this, 'deutsch', { value: v }); return v; },
  get en() { return this.deutsch; }, get es() { return this.deutsch; }, get fr() { return this.deutsch; },
  ma: [
    PAL('tasks', { desc: 'mit Operator-Check (KMK Mathematik)' }), PAL('lines', { k: 'rechen', label: 'Rechenkästchen', desc: 'Kariertes Feld zum Rechnen', pre: { style: 'kaestchen', count: 8 } }),
    PAL('table', { k: 'wertetabelle', label: 'Wertetabelle', desc: 'x und y zum Ausfüllen', pre: { cols: ['x', '', '', '', '', '', ''], rows: [['y', '', '', '', '', '', '']], rowHeight: 'normal', firstBold: true } }),
    PAL('info', { desc: 'Merke, Satz, Definition, Beispiel' }), PAL('image', { k: 'abbildung', label: 'Abbildung', desc: 'Skizze, Graph, Diagramm (Abb. 1)', pre: { mk: 'a' } }),
    PAL('material', { label: 'Sachtext', desc: 'Text zur Sachaufgabe (M1)' }), PAL('match'), PAL_SORT(), PAL('phrases'), PAL('tafel'), PAL('a3'), PAL('step'), PAL('table'),
    PAL('lines'), PAL('heading'), PAL('text'), PAL('quote'), PAL('qr'), PAL('pagebreak')
  ],
  gp: [
    PAL('material', { k: 'quelle', label: 'Quelle', desc: 'Text- oder Bildquelle (Q1), im Baustein umschaltbar', ic: 'quelle', pre: { mk: 'q' } }),
    PAL('material', { k: 'darstellung', label: 'Darstellung', desc: 'Text aus Forschung oder Schulbuch (D1)', ic: 'darstellung', pre: { mk: 'd' } }),
    PAL('material', { desc: 'Zeitungsartikel, Rede, Gesetzestext (M1)' }), PAL_POST(),
    PAL('image', { k: 'bildquelle', label: 'Bildquelle', desc: 'Karikatur, Foto, Plakat (Q)', pre: { mk: 'q', caption: '' } }),
    PAL('tasks'), PAL('match'), PAL_SORT(), PAL('info'), PAL('phrases'), PAL('tafel'), PAL('a3'), PAL('step'), PAL('table'),
    PAL('table', { k: 'zeitleiste', label: 'Zeitleiste', desc: 'Datum, Ereignis, Bedeutung', ic: 'zeitleiste', pre: { cols: ['Datum', 'Ereignis', 'Bedeutung'], rows: Array.from({ length: 6 }, () => ['', '', '']), rowHeight: 'normal', cw: [16, 44, 40] } }),
    PAL('lines'), PAL('heading'), PAL('text'), PAL('quote'), PAL('qr'), PAL('image', { desc: 'Grafik, Schaubild, Karte' }), PAL('pagebreak')
  ],
  bio: [
    PAL('material', { desc: 'Fachtext mit Zeilennummern (M1)' }),
    PAL('image', { k: 'abbildung', label: 'Abbildung', desc: 'Foto, Schema, Diagramm (Abb. 1)', pre: { mk: 'a' } }),
    PAL('tasks'), PAL('match', { desc: 'Begriffe und Erklärungen verbinden' }), PAL_SORT(), PAL('info'), PAL('phrases'), PAL('tafel'), PAL('a3'), PAL('step'), PAL('table'),
    PAL('table', { k: 'protokoll', label: 'Versuchsprotokoll', desc: 'Frage, Hypothese, Durchführung, Auswertung', ic: 'protokoll', pre: { cols: ['Versuchsprotokoll', 'Notizen'], rows: ['Fragestellung', 'Hypothese', 'Material', 'Durchführung', 'Beobachtung', 'Auswertung'].map(x => [x, '']), rowHeight: 'hoch', firstBold: true, cw: [28, 72] } }),
    PAL('lines', { k: 'zeichnung', label: 'Zeichenfläche', desc: 'Rahmen für Zeichnung oder Skizze', ic: 'zeichnung', pre: { style: 'rahmen', count: 12 } }),
    PAL('lines', { desc: 'Linien oder Kästchen' }), PAL('heading'), PAL('text'), PAL('qr'), PAL('pagebreak')
  ]
};
const PAL_GSA = () => Object.entries(GSA).map(([k, x]) => PAL('gsa', { k: 'gs-' + k, label: x.label, desc: x.desc, ic: 'gs-' + k, pre: { gk: k, ...(k === 'ordnen' ? { items: [{ t: '' }, { t: '' }, { t: '' }, { t: '' }] } : k === 'selbst' ? { items: [{ t: 'Ich kann …' }, { t: 'Ich kann …' }, { t: 'Ich kann …' }] } : {}) } }));
const PALETTE_GS = () => [PAL('material', { label: 'Lesetext', desc: 'Text zum Lesen, große Schrift, auf Wunsch mit Silben' }), PAL('poem'), PAL('tasks', { desc: 'Arbeitsaufträge mit Handlungsverben' }), ...PAL_GSA(),
  PAL('match', { label: 'Verbinden', desc: 'Wörter, Sätze oder Bilder mit Linien verbinden' }), PAL_SORT(), PAL('lines', { k: 'lineatur', label: 'Lineatur', desc: 'Schreiblinien passend zur Klassenstufe', pre: { count: 4 } }), PAL('lines', { k: 'malfeld', label: 'Malfeld', desc: 'Freie Fläche zum Malen', ic: 'zeichnung', pre: { style: 'rahmen', count: 9 } }),
  PAL('image'), PAL('info', { desc: 'Merke, Tipp' }), PAL('table'), PAL('tafel'), PAL('a3'), PAL('step'), PAL('heading'), PAL('text'), PAL('quote'), PAL('qr'), PAL('pagebreak')];
let PAL_GS_CACHE = null;
const paletteFor = () => isGS() ? (PAL_GS_CACHE = PAL_GS_CACHE || PALETTE_GS()) : PALETTE[fachKey()] || PALETTE[fachBase()] || PALETTE.deutsch;
function paletteBlock(k, type) {
  const e = paletteFor().find(x => x.k === k) || Object.values(PALETTE).flat().find(x => x.k === k);
  const nb = newBlock(e ? e.type : type);
  if (e && e.pre) Object.assign(nb, JSON.parse(JSON.stringify(e.pre)));
  // Grundschule: große Schrift, Flattersatz und Lineatur passend zur Klassenstufe
  if (isGS()) { const jg = gsJg();
    if (nb.type === 'material' && !(e && e.pre && e.pre.fmt)) nb.fmt = { ...(nb.fmt || {}), font: 'sans', size: jg <= 2 ? 'G20' : jg <= 4 ? 'G16' : 'XXL', lh: 'weit', align: 'left' };
    if (nb.type === 'lines' && !(e && e.pre && e.pre.style)) nb.style = linForJg(jg); }
  { const lm = linMem(); if (lm) {
    if (nb.type === 'lines' && !(e && e.pre && e.pre.style) && (isGS() || (e && e.k === 'lineatur')) && LIN[lm.style]) nb.style = lm.style;
    if (nb.type === 'gsa' && (lm.style === '' || lm.style === 'linien' || LIN[lm.style])) nb.lin = lm.style;
    if ((nb.type === 'lines' && LIN[nb.style]) || nb.type === 'gsa') { nb.mb = !!lm.mb; nb.heft = lm.heft !== false; nb.haus = !!lm.haus; } } }
  if (nb.type === 'match' && nb.sort) { nb.title = MT_DEF(true, nb.mode, state.sheet && state.sheet.meta && state.sheet.meta.anrede === 'du'); nb.cats.forEach(c => { const o = c.id; c.id = mtCid(); nb.words.forEach(w => { if (w.c === o) w.c = c.id; }); }); }
  return nb;
}
/* Infokasten-Arten je Fach */
const INFO_KINDS_BY = { deutsch: INFO_KINDS, gp: ['Info', 'Merke', 'Hintergrund', 'Methode', 'Definition', 'Tipp', 'Hinweis'], bio: ['Info', 'Merke', 'Definition', 'Methode', 'Sicherheit', 'Tipp', 'Hinweis'] };

/* Operatoren: IQB-Grundstock Deutsch (gemeinsamer Abituraufgabenpool) + gebräuchliche Ergänzungen */
const OPS = [
  { op:'analysieren', afb:[1,3], iqb:1 }, { op:'beschreiben', afb:[1,2], iqb:1 },
  { op:'beurteilen', afb:[2,3], iqb:1 }, { op:'charakterisieren', afb:[2,3], iqb:1 },
  { op:'darstellen', afb:[1,2], iqb:1, verb:'stellen', part:'dar', tpl:'Stellen Sie … dar.' },
  { op:'einordnen', afb:[1,2], iqb:1, verb:'ordnen', part:'ein', tpl:'Ordnen Sie … ein.' },
  { op:'erläutern', afb:[2,3], iqb:1 }, { op:'erörtern', afb:[1,3], iqb:1 },
  { op:'in Beziehung setzen', afb:[2,3], iqb:1, verb:'setzen', part:'beziehung', tpl:'Setzen Sie … in Beziehung.' },
  { op:'interpretieren', afb:[1,3], iqb:1 },
  { op:'sich auseinandersetzen', afb:[2,3], iqb:1, verb:'setzen', part:'auseinander', tpl:'Setzen Sie sich mit … auseinander.' },
  { op:'Stellung nehmen', afb:[2,3], iqb:1, verb:'nehmen', part:'stellung', tpl:'Nehmen Sie Stellung zu …' },
  { op:'überprüfen', afb:[2,3], iqb:1 }, { op:'verfassen', afb:[1,3], iqb:1 },
  { op:'vergleichen', afb:[2,3], iqb:1 },
  { op:'zusammenfassen', afb:[1,2], iqb:1, verb:'fassen', part:'zusammen', tpl:'Fassen Sie … zusammen.' },
  { op:'nennen', afb:[1,1] }, { op:'wiedergeben', afb:[1,1], verb:'geben', part:'wieder', tpl:'Geben Sie … wieder.' },
  { op:'skizzieren', afb:[1,2] }, { op:'erklären', afb:[2,2] },
  { op:'herausarbeiten', afb:[2,2], verb:'arbeiten', part:'heraus', tpl:'Arbeiten Sie … heraus.' },
  { op:'untersuchen', afb:[2,2] }, { op:'belegen', afb:[2,2] }, { op:'begründen', afb:[2,3] },
  { op:'prüfen', afb:[2,3] }, { op:'bewerten', afb:[3,3] }, { op:'deuten', afb:[3,3] },
  { op:'diskutieren', afb:[3,3] }, { op:'entwerfen', afb:[3,3] }, { op:'gestalten', afb:[3,3] }
];
/* Operatoren Geschichte/Politik: KMK, Deutsche Schulen im Ausland, Geschichte Klasse 10 (2012), mit den Anforderungsbereichen dort.
   Erörtern und interpretieren sind übergreifend (I–III). end: das abgetrennte Teil steht am Satz- oder Teilsatzende (zu, auf, ab, nach). */
const OPS_GP = [
  { op:'beschreiben', afb:[1,1], iqb:1 }, { op:'aufzeigen', afb:[1,1], iqb:1, verb:'zeigen', part:'auf', end:1, tpl:'Zeigen Sie … auf.' },
  { op:'zusammenfassen', afb:[1,1], iqb:1, verb:'fassen', part:'zusammen', tpl:'Fassen Sie … zusammen.' },
  { op:'wiedergeben', afb:[1,1], iqb:1, verb:'geben', part:'wieder', tpl:'Geben Sie … wieder.' },
  { op:'nennen', afb:[1,1], iqb:1 }, { op:'skizzieren', afb:[1,1], iqb:1 },
  { op:'analysieren', afb:[2,2], iqb:1 }, { op:'untersuchen', afb:[2,2], iqb:1 },
  { op:'begründen', afb:[2,2], iqb:1 }, { op:'nachweisen', afb:[2,2], iqb:1, verb:'weisen', part:'nach', end:1, tpl:'Weisen Sie … nach.' },
  { op:'charakterisieren', afb:[2,2], iqb:1 },
  { op:'einordnen', afb:[2,2], iqb:1, verb:'ordnen', part:'ein', tpl:'Ordnen Sie … ein.' },
  { op:'zuordnen', afb:[2,2], iqb:1, verb:'ordnen', part:'zu', end:1, tpl:'Ordnen Sie … zu.' },
  { op:'in Beziehung setzen', afb:[2,2], iqb:1, verb:'setzen', part:'beziehung', tpl:'Setzen Sie … in Beziehung.' },
  { op:'erläutern', afb:[2,2], iqb:1 }, { op:'erklären', afb:[2,2], iqb:1 },
  { op:'darstellen', afb:[2,2], iqb:1, verb:'stellen', part:'dar', tpl:'Stellen Sie … dar.' },
  { op:'erschließen', afb:[2,2], iqb:1 },
  { op:'herausarbeiten', afb:[2,2], iqb:1, verb:'arbeiten', part:'heraus', tpl:'Arbeiten Sie … heraus.' },
  { op:'beurteilen', afb:[3,3], iqb:1 }, { op:'bewerten', afb:[3,3], iqb:1 },
  { op:'Stellung nehmen', afb:[3,3], iqb:1, verb:'nehmen', part:'stellung', tpl:'Nehmen Sie Stellung zu …' },
  { op:'vergleichen', afb:[3,3], iqb:1 },
  { op:'gegenüberstellen', afb:[3,3], iqb:1, verb:'stellen', part:'gegenüber', tpl:'Stellen Sie … gegenüber.' },
  { op:'diskutieren', afb:[3,3], iqb:1 },
  { op:'abwägen', afb:[3,3], iqb:1, verb:'wägen', part:'ab', end:1, tpl:'Wägen Sie … ab.' },
  { op:'prüfen', afb:[3,3], iqb:1 }, { op:'überprüfen', afb:[3,3], iqb:1 },
  { op:'erörtern', afb:[1,3], iqb:1 }, { op:'interpretieren', afb:[1,3], iqb:1 },
  { op:'belegen', afb:[2,2] }, { op:'entwickeln', afb:[3,3] }, { op:'entwerfen', afb:[3,3] }, { op:'gestalten', afb:[3,3] }
];
// Übersicht für die Schülerinnen und Schüler (Baustein „Operatorenübersicht“), Erläuterungen in eigenen Worten nach der KMK-Liste
const OPS_GP_TABLE = [
  ['beschreiben, aufzeigen, zusammenfassen, wiedergeben', 'I', 'Sachverhalte aus dem Material oder dem Unterricht geordnet und auf das Wesentliche beschränkt in eigenen Worten darlegen'],
  ['nennen', 'I', 'Informationen oder Begriffe ohne weitere Erläuterung aufführen'],
  ['skizzieren', 'I', 'Sachverhalte, Probleme oder Entwicklungen in groben Zügen darstellen'],
  ['analysieren, untersuchen', 'II', 'Material oder Sachverhalte nach Gesichtspunkten erschließen und die Ergebnisse im Zusammenhang darstellen'],
  ['begründen, nachweisen', 'II', 'Aussagen oder Urteile mit Argumenten stützen, die auf historischem Wissen und Belegen beruhen'],
  ['charakterisieren', 'II', 'Sachverhalte, Entwicklungen oder Personen mit ihren typischen Merkmalen kennzeichnen'],
  ['einordnen, zuordnen, in Beziehung setzen', 'II', 'einen oder mehrere Sachverhalte begründet in einen größeren Zusammenhang stellen'],
  ['erläutern, erklären, darstellen', 'II', 'Sachverhalte in Zusammenhänge einordnen und mit zusätzlichen Informationen und Beispielen verständlich machen'],
  ['erschließen, herausarbeiten', 'II', 'aus Materialien bestimmte Sachverhalte gewinnen, auch solche, die dort nicht ausdrücklich stehen'],
  ['beurteilen, bewerten, Stellung nehmen', 'III', 'die Bedeutung eines Sachverhalts im Zusammenhang bestimmen und nach offengelegten Kriterien zu einem begründeten Urteil kommen'],
  ['vergleichen, gegenüberstellen', 'III', 'Gemeinsamkeiten, Unterschiede und Entwicklungen nach Gesichtspunkten ermitteln und darstellen'],
  ['diskutieren, abwägen', 'III', 'zu einem Problem oder einer These Argumente dafür und dagegen entwickeln und zu einer begründeten Bewertung kommen'],
  ['prüfen, überprüfen', 'III', 'Aussagen oder Urteile an Sachverhalten messen und begründet bestätigen oder widerlegen'],
  ['erörtern', 'I–III', 'eine These oder ein Problem durch Abwägen von Argumenten prüfen und mit einem begründeten eigenen Urteil abschließen'],
  ['interpretieren', 'I–III', 'den Sinn von Quellen erschließen und eine begründete Deutung entwickeln']
];
/* Operatoren Biologie: KMK, Deutsche Schulen im Ausland, naturwissenschaftliche Fächer (2013), Angaben für Biologie mit dem dort genannten AFB.
   Prüfen/überprüfen gilt dort nur für Chemie und steht hier bei den Ergänzungen, ebenso beschriften und erstellen. */
const OPS_BIO = [
  { op:'benennen', afb:[1,1], iqb:1 }, { op:'darstellen', afb:[1,1], iqb:1, verb:'stellen', part:'dar', tpl:'Stellen Sie … dar.' },
  { op:'dokumentieren', afb:[1,1], iqb:1 }, { op:'nennen', afb:[1,1], iqb:1 }, { op:'protokollieren', afb:[1,1], iqb:1 },
  { op:'skizzieren', afb:[1,1], iqb:1 }, { op:'zeichnen', afb:[1,1], iqb:1 },
  { op:'ableiten', afb:[2,2], iqb:1, verb:'leiten', part:'ab', end:1, tpl:'Leiten Sie … ab.' },
  { op:'abschätzen', afb:[2,2], iqb:1, verb:'schätzen', part:'ab', end:1, tpl:'Schätzen Sie … ab.' },
  { op:'analysieren', afb:[2,2], iqb:1 }, { op:'anwenden', afb:[2,2], iqb:1, verb:'wenden', part:'an', end:1, tpl:'Wenden Sie … an.' },
  { op:'berechnen', afb:[2,2], iqb:1 }, { op:'beschreiben', afb:[2,2], iqb:1 }, { op:'bestimmen', afb:[2,2], iqb:1 },
  { op:'erklären', afb:[2,2], iqb:1 }, { op:'erläutern', afb:[2,2], iqb:1 }, { op:'formulieren', afb:[2,2], iqb:1 },
  { op:'herleiten', afb:[2,2], iqb:1, verb:'leiten', part:'her', end:1, tpl:'Leiten Sie … her.' },
  { op:'klassifizieren', afb:[2,2], iqb:1 }, { op:'ordnen', afb:[2,2], iqb:1 }, { op:'untersuchen', afb:[2,2], iqb:1 },
  { op:'verallgemeinern', afb:[2,2], iqb:1 }, { op:'vergleichen', afb:[2,2], iqb:1 },
  { op:'zusammenfassen', afb:[2,2], iqb:1, verb:'fassen', part:'zusammen', tpl:'Fassen Sie … zusammen.' },
  { op:'Hypothesen aufstellen', afb:[3,3], iqb:1, verb:'stellen', part:'auf', end:1, tpl:'Stellen Sie eine Hypothese zu … auf.' },
  { op:'auswerten', afb:[3,3], iqb:1, verb:'werten', part:'aus', end:1, tpl:'Werten Sie … aus.' },
  { op:'begründen', afb:[3,3], iqb:1 }, { op:'beurteilen', afb:[3,3], iqb:1 }, { op:'bewerten', afb:[3,3], iqb:1 },
  { op:'beweisen', afb:[3,3], iqb:1 }, { op:'diskutieren', afb:[3,3], iqb:1 }, { op:'interpretieren', afb:[3,3], iqb:1 },
  { op:'deuten', afb:[3,3], iqb:1 }, { op:'planen', afb:[3,3], iqb:1 },
  { op:'beschriften', afb:[1,1] }, { op:'erstellen', afb:[2,2] }, { op:'prüfen', afb:[2,2] }, { op:'überprüfen', afb:[2,2] }
];
const OPS_BIO_TABLE = [
  ['benennen, nennen', 'I', 'Begriffe, Strukturen oder Fakten ohne Erläuterung angeben oder zuordnen'],
  ['darstellen, skizzieren', 'I', 'Sachverhalte, Methoden oder Ergebnisse strukturiert und auf das Wesentliche reduziert wiedergeben, auch als Skizze'],
  ['dokumentieren, protokollieren', 'I', 'Ablauf, Beobachtungen und Ergebnisse eines Versuchs fachgerecht festhalten'],
  ['zeichnen', 'I', 'beobachtbare oder gegebene Strukturen genau darstellen'],
  ['beschreiben', 'II', 'Sachverhalte oder Abläufe geordnet und in Fachsprache wiedergeben'],
  ['analysieren, untersuchen', 'II', 'Bestandteile, Merkmale und Beziehungen systematisch erfassen und darstellen'],
  ['ableiten, herleiten', 'II', 'aus Erkenntnissen oder Gleichungen begründet Schlüsse ziehen'],
  ['anwenden', 'II', 'einen bekannten Zusammenhang oder eine Methode auf einen neuen Sachverhalt übertragen'],
  ['berechnen, bestimmen, abschätzen', 'II', 'Ergebnisse aus gegebenen Werten ermitteln oder Größenordnungen begründet angeben'],
  ['erklären', 'II', 'Zusammenhänge auf Regeln, Gesetze oder Ursachen zurückführen'],
  ['erläutern', 'II', 'Sachverhalte mit Beispielen oder zusätzlichen Informationen verständlich machen'],
  ['klassifizieren, ordnen', 'II', 'Begriffe oder Lebewesen nach Merkmalen systematisch einteilen'],
  ['vergleichen', 'II', 'Gemeinsamkeiten und Unterschiede ermitteln'],
  ['zusammenfassen, verallgemeinern', 'II', 'das Wesentliche knapp wiedergeben oder daraus eine allgemeinere Aussage gewinnen'],
  ['Hypothesen aufstellen', 'III', 'eine begründete Vermutung formulieren, die sich überprüfen lässt'],
  ['auswerten', 'III', 'Daten oder Beobachtungen verknüpfen, zu einer Aussage bündeln und Schlüsse ziehen'],
  ['begründen, beweisen', 'III', 'Aussagen mit fachlichen Argumenten stützen oder widerlegen'],
  ['beurteilen, bewerten', 'III', 'zu einem Sachverhalt eine fachlich begründete eigene Einschätzung abgeben'],
  ['diskutieren', 'III', 'Argumente dafür und dagegen gegenüberstellen und abwägen'],
  ['interpretieren, deuten', 'III', 'Ergebnisse oder Sachverhalte im Hinblick auf mögliche Erklärungen untersuchen'],
  ['planen', 'III', 'zu einer Frage einen Versuch entwerfen und eine Anleitung erstellen']
];
// Fremdsprachen: Imperativ steht vorn; Englisch hat eine Form, Spanisch tú (du) und usted (Sie)
const opE = (op, a, b, tpl) => ({ op, afb: [a, b], iqb: 1, fl: 1, imp: op.split(' ')[0], tpl: tpl || cap0(op) + ' …', tplDu: tpl || cap0(op) + ' …' });
const opS = (op, tu, ud, a, b, rest = ' …') => ({ op, afb: [a, b], iqb: 1, fl: 1, imp: tu, imp2: ud, tpl: cap0(ud) + rest, tplDu: cap0(tu) + rest });
function cap0(x) { return x.charAt(0).toUpperCase() + x.slice(1); }
const OPS_FR = [
  opS('décrire', 'décris', 'décrivez', 1, 1), opS('résumer', 'résume', 'résumez', 1, 1), opS('présenter', 'présente', 'présentez', 1, 1), opS('relever', 'relève', 'relevez', 1, 1), opS('nommer', 'nomme', 'nommez', 1, 1), opS('indiquer', 'indique', 'indiquez', 1, 1),
  opS('analyser', 'analyse', 'analysez', 2, 2), opS('caractériser', 'caractérise', 'caractérisez', 2, 2), opS('comparer', 'compare', 'comparez', 2, 2), opS('expliquer', 'explique', 'expliquez', 2, 2), opS('examiner', 'examine', 'examinez', 2, 2), opS('interpréter', 'interprète', 'interprétez', 2, 3),
  opS('commenter', 'commente', 'commentez', 3, 3), opS('discuter', 'discute', 'discutez', 3, 3), opS('évaluer', 'évalue', 'évaluez', 3, 3), opS('justifier', 'justifie', 'justifiez', 3, 3), opS('juger', 'juge', 'jugez', 3, 3),
  opS('rédiger', 'rédige', 'rédigez', 3, 3), opS('écrire', 'écris', 'écrivez', 3, 3), opS('imaginer', 'imagine', 'imaginez', 3, 3), opS('développer', 'développe', 'développez', 3, 3)
];
const OPS_FR_TABLE = [
  ['décrire, présenter, résumer', 'I', 'présenter de façon claire et structurée l’essentiel d’un texte ou d’un document'], ['relever, nommer, indiquer', 'I', 'repérer des éléments précis dans un texte'],
  ['analyser, examiner', 'II', 'étudier le contenu, la structure et la langue d’un texte et expliquer leurs effets'], ['caractériser', 'II', 'décrire et analyser les traits d’un personnage'], ['comparer', 'II', 'dégager des ressemblances et des différences'], ['expliquer', 'II', 'rendre compréhensible en donnant des raisons'],
  ['commenter, discuter', 'III', 'exprimer et justifier un avis, peser le pour et le contre'], ['évaluer, juger', 'III', 'porter un jugement argumenté'], ['rédiger, écrire, imaginer', 'III', 'produire un texte d’un type donné']
];
const OPS_EN = [
  opE('describe', 1, 1), opE('outline', 1, 1), opE('point out', 1, 1), opE('state', 1, 1), opE('summarize', 1, 1), opE('present', 1, 2),
  opE('analyse', 2, 2), opE('analyze', 2, 2), opE('characterize', 2, 2), opE('compare', 2, 2), opE('contrast', 2, 2), opE('examine', 2, 2), opE('explain', 2, 2), opE('illustrate', 2, 2), opE('interpret', 2, 3), opE('show', 2, 2),
  opE('assess', 3, 3), opE('comment', 3, 3, 'Comment on …'), opE('discuss', 3, 3), opE('evaluate', 3, 3), opE('justify', 3, 3), opE('write', 3, 3), opE('create', 3, 3), opE('design', 3, 3), opE('imagine', 3, 3), opE('compose', 3, 3)
];
const OPS_ES = [
  opS('describir', 'describe', 'describa', 1, 1), opS('resumir', 'resume', 'resuma', 1, 1), opS('presentar', 'presenta', 'presente', 1, 1), opS('indicar', 'indica', 'indique', 1, 1), opS('nombrar', 'nombra', 'nombre', 1, 1), opS('enumerar', 'enumera', 'enumere', 1, 1),
  opS('analizar', 'analiza', 'analice', 2, 2), opS('caracterizar', 'caracteriza', 'caracterice', 2, 2), opS('comparar', 'compara', 'compare', 2, 2), opS('examinar', 'examina', 'examine', 2, 2), opS('explicar', 'explica', 'explique', 2, 2), opS('situar', 'sitúa', 'sitúe', 2, 2), opS('interpretar', 'interpreta', 'interprete', 2, 3),
  opS('comentar', 'comenta', 'comente', 3, 3), opS('discutir', 'discute', 'discuta', 3, 3), opS('evaluar', 'evalúa', 'evalúe', 3, 3), opS('valorar', 'valora', 'valore', 3, 3), opS('justificar', 'justifica', 'justifique', 3, 3), opS('escribir', 'escribe', 'escriba', 3, 3), opS('redactar', 'redacta', 'redacte', 3, 3), opS('crear', 'crea', 'cree', 3, 3), opS('imaginar', 'imagina', 'imagine', 3, 3)
];
const OPS_EN_TABLE = [
  ['describe', 'I', 'give a detailed account of something'], ['outline', 'I', 'give the main features or general principles, leaving out details'], ['point out', 'I', 'find and explain certain aspects'], ['state', 'I', 'specify clearly'], ['summarize', 'I', 'give a concise account of the main points'],
  ['analyse', 'II', 'describe and explain in detail certain aspects and/or features of the text'], ['characterize', 'II', 'describe and analyse the character of a person'], ['compare', 'II', 'point out similarities and differences'], ['examine', 'II', 'investigate in detail'], ['explain', 'II', 'describe and define in detail'], ['interpret', 'II–III', 'make clear the meaning of something and give your own views on it'],
  ['assess, evaluate', 'III', 'consider in a balanced way the points for and against something and come to a conclusion'], ['comment on', 'III', 'state clearly your opinion on the topic in question and support it with evidence'], ['discuss', 'III', 'give arguments for and against and come to a conclusion'], ['justify', 'III', 'show adequate grounds for decisions or conclusions'], ['write, create', 'III', 'produce a text with specific features']
];
const OPS_ES_TABLE = [
  ['describir', 'I', 'exponer de forma detallada las características de algo'], ['resumir', 'I', 'presentar de forma breve y estructurada lo esencial de un texto'], ['presentar, indicar', 'I', 'exponer de forma clara determinados aspectos'], ['nombrar, enumerar', 'I', 'mencionar datos o aspectos sin explicarlos'],
  ['analizar', 'II', 'examinar y explicar con detalle aspectos del contenido, de la estructura y del lenguaje'], ['caracterizar', 'II', 'describir y analizar los rasgos de un personaje'], ['comparar', 'II', 'señalar semejanzas y diferencias'], ['explicar', 'II', 'exponer de forma razonada causas y relaciones'], ['situar', 'II', 'colocar un texto o un hecho en su contexto'], ['interpretar', 'II–III', 'aclarar el sentido de un texto y fundamentar la propia opinión'],
  ['comentar', 'III', 'expresar y fundamentar una opinión propia sobre un tema'], ['discutir', 'III', 'presentar argumentos a favor y en contra y llegar a una conclusión'], ['evaluar, valorar', 'III', 'emitir un juicio razonado considerando distintos aspectos'], ['justificar', 'III', 'fundamentar una decisión o una conclusión'], ['escribir, redactar, crear', 'III', 'producir un texto con determinadas características']
];
const OPS_MA = [
  { op:'angeben', afb:[1,1], iqb:1, verb:'geben', part:'an', end:1, tpl:'Geben Sie … an.' }, { op:'nennen', afb:[1,1], iqb:1 }, { op:'skizzieren', afb:[1,2], iqb:1 }, { op:'zeichnen', afb:[1,2], iqb:1 },
  { op:'berechnen', afb:[1,2], iqb:1 }, { op:'bestimmen', afb:[1,2], iqb:1 }, { op:'ermitteln', afb:[1,2], iqb:1 }, { op:'lösen', afb:[1,2], iqb:1 }, { op:'beschreiben', afb:[1,2], iqb:1 },
  { op:'darstellen', afb:[1,2], iqb:1, verb:'stellen', part:'dar', end:1, tpl:'Stellen Sie … dar.' }, { op:'abschätzen', afb:[2,2], iqb:1, verb:'schätzen', part:'ab', end:1, tpl:'Schätzen Sie … ab.' },
  { op:'erklären', afb:[2,2], iqb:1 }, { op:'erläutern', afb:[2,2], iqb:1 }, { op:'untersuchen', afb:[2,3], iqb:1 }, { op:'vergleichen', afb:[2,2], iqb:1 }, { op:'zuordnen', afb:[1,2], iqb:1, verb:'ordnen', part:'zu', end:1, tpl:'Ordnen Sie … zu.' },
  { op:'herleiten', afb:[2,3], iqb:1, verb:'leiten', part:'her', end:1, tpl:'Leiten Sie … her.' }, { op:'interpretieren', afb:[2,3], iqb:1 }, { op:'begründen', afb:[2,3], iqb:1 }, { op:'beweisen', afb:[3,3], iqb:1 },
  { op:'widerlegen', afb:[3,3], iqb:1 }, { op:'zeigen', afb:[2,3], iqb:1 }, { op:'beurteilen', afb:[3,3], iqb:1 }, { op:'bewerten', afb:[3,3], iqb:1 }, { op:'entscheiden', afb:[2,3], iqb:1 },
  { op:'prüfen', afb:[2,3], iqb:1 }, { op:'überprüfen', afb:[2,3], iqb:1 }, { op:'entwickeln', afb:[3,3], iqb:1 }, { op:'modellieren', afb:[3,3], iqb:1 }, { op:'implementieren', afb:[2,3] }, { op:'testen', afb:[2,2] }
];
const OPS_MA_TABLE = [
  ['angeben, nennen', 'I', 'Ergebnisse, Begriffe oder Eigenschaften ohne Begründung aufschreiben'], ['skizzieren, zeichnen', 'I–II', 'Wesentliches grafisch darstellen, bei „zeichnen“ möglichst genau'],
  ['berechnen, bestimmen, ermitteln', 'I–II', 'Ergebnisse mit Rechenweg gewinnen, bei „bestimmen“ auch ohne festgelegtes Verfahren'], ['beschreiben', 'I–II', 'Sachverhalt oder Vorgehen in eigenen Worten wiedergeben'],
  ['erklären, erläutern', 'II', 'Sachverhalt nachvollziehbar machen, bei „erläutern“ mit Beispielen'], ['untersuchen', 'II–III', 'Eigenschaften oder Zusammenhänge herausfinden und darstellen'],
  ['interpretieren', 'II–III', 'Ergebnisse auf die Ausgangssituation beziehen und deuten'], ['begründen, zeigen', 'II–III', 'Aussage durch Argumente oder Rechnung absichern'],
  ['beweisen, widerlegen', 'III', 'mit mathematischen Mitteln lückenlos zeigen, dass eine Aussage gilt oder nicht gilt'], ['beurteilen, bewerten', 'III', 'zu einem begründeten Urteil kommen']
];
const OPS_LA = [...OPS.map(o => ({ ...o })), { op:'übersetzen', afb:[1,3], iqb:1 }, { op:'belegen', afb:[1,2], iqb:1 }, { op:'gliedern', afb:[1,2], iqb:1 }, { op:'bestimmen', afb:[1,1], iqb:1 }, { op:'paraphrasieren', afb:[1,2], iqb:1 }];
const IRREG = { nehmen: 'nimm', geben: 'gib', entwerfen: 'entwirf', entwickeln: 'entwickle' };
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
[OPS, OPS_GP, OPS_BIO, OPS_MA, OPS_LA].forEach(L => L.forEach(o => {
  if (!o.tpl) o.tpl = cap(o.op) + ' Sie …';
  const base = o.verb || o.op;
  o.imp = IRREG[base] || (base.endsWith('ern') ? base.slice(0, -1) + 'e' : base.slice(0, -2) + 'e');
  o.tplDu = cap(o.imp) + o.tpl.replace(/^\S+ Sie/, '').replace(/^ sich /, ' dich ');
}));
const curOps = () => (isGS() ? OPS_GS : ({ en: OPS_EN, es: OPS_ES, fr: OPS_FR, la: OPS_LA })[fachKey()] || ({ gp: OPS_GP, bio: OPS_BIO, ma: OPS_MA })[fachBase()] || OPS);
const impHit = (o, w) => o.imp === w || (!!o.imp2 && o.imp2 === w);
// Abgetrenntes Teil am Ende eines (Teil-)Satzes, damit „zu“, „auf“, „ab“, „nach“ nicht überall zählen
const partAtEnd = (s, p) => new RegExp('(^|[\\s(„])' + p + '(?=\\s*([,.;:!?)“”–—]|$|(und|oder|sowie|aber|denn)\\s))', 'i').test(s);
const ROMAN = ['', 'I', 'II', 'III'];
const afbLabel = r => r[0] === r[1] ? ROMAN[r[0]] : ROMAN[r[0]] + '–' + ROMAN[r[1]];

const $ = (s, r = document) => r.querySelector(s);
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const wait = ms => new Promise(r => setTimeout(r, ms));
const slug = s => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss')
  .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'Arbeitsblatt';
const lsGet = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };

/* ---------- Inline-Auszeichnung: **fett**, *kursiv*, ^1 hochgestellt ---------- */
/* Text mit leichter Auszeichnung. Gespeichert wird weiterhin als Text:
   **fett**  *kursiv*  ++unterstrichen++  ==Marker==  ___ (Lücke)  ^1 (Hochzahl)
   Zeilen mit „- “ oder „1. “ sind Listenpunkte. Ein \ vor einem Sonderzeichen macht es zu normalem Text.
   Die Textfelder zeigen das formatiert an; die Zeichen sieht man beim Schreiben nicht. */
const RT_ESC = '\\*+=_^-.)•';
const RT_MK = { b: '**', i: '*', u: '++', m: '==' };
const RT_FL = ['b', 'i', 'u', 'm'];
const LIST_LINE = /^(?:([-•])|(\d{1,2})[.)])\s+(.*)$/;
function inlineTokens(str) {
  str = String(str ?? '');
  const lex = []; let buf = '', bs = 0, i = 0;
  const flush = () => { if (buf) lex.push({ k: 't', t: buf, rs: bs, re: i }); buf = ''; };
  const add = (ch, from) => { if (!buf) bs = from; buf += ch; };
  while (i < str.length) {
    const c = str[i], n = str[i + 1];
    if (c === '\\' && n && RT_ESC.includes(n)) { add(n, i); i += 2; continue; }
    if (c === '_' && n === '_' && str[i + 2] === '_') { flush(); let j = i; while (str[j] === '_') j++; lex.push({ k: 'gap', rs: i, re: j }); i = j; continue; }
    if (c === '^' && n && /[0-9*]/.test(n)) { flush(); const t = str.slice(i + 1).match(/^(\d+|\*)/)[1]; lex.push({ k: 'sup', t, rs: i, re: i + 1 + t.length }); i += 1 + t.length; continue; }
    const f = c === '*' ? (n === '*' ? 'b' : 'i') : c === '+' && n === '+' ? 'u' : c === '=' && n === '=' ? 'm' : null;
    if (f) { flush(); const len = RT_MK[f].length; lex.push({ k: 'mk', f, t: str.slice(i, i + len), rs: i, re: i + len }); i += len; continue; }
    add(c, i); i++;
  }
  flush();
  // Je Art paarweise; ein übriges Zeichen bleibt normaler Text
  for (const f of RT_FL) { const ms = lex.filter(x => x.k === 'mk' && x.f === f); if (ms.length % 2) ms[ms.length - 1].k = 't'; }
  const out = []; const fl = { b: 0, i: 0, u: 0, m: 0 };
  for (const x of lex) {
    if (x.k === 'mk') { fl[x.f] ^= 1; continue; }
    if (x.k === 'gap') { out.push({ t: '', gap: 1, rs: x.rs, re: x.re }); continue; }
    if (x.k === 'sup') { out.push({ t: x.t, sup: 1, rs: x.rs, re: x.re }); continue; }
    const p = out[out.length - 1];
    if (p && !p.gap && !p.sup && p.re === x.rs && RT_FL.every(f => p[f] === fl[f])) { p.t += x.t; p.re = x.re; }
    else out.push({ t: x.t, b: fl.b, i: fl.i, u: fl.u, m: fl.m, rs: x.rs, re: x.re });
  }
  return quoteToks(out);
}
function tokHTML(k) {
  if (k.sup) return '<sup>' + esc(k.t) + '</sup>';
  if (k.gap) return '<span class="gap"></span>';
  let h = esc(k.t);
  const ws = !String(k.t).trim(); // reine Leerzeichen nicht hinterlegen oder unterstreichen
  if (k.m && !ws) h = '<mark>' + h + '</mark>';
  if (k.u && !ws) h = '<u>' + h + '</u>';
  if (k.i) h = '<i>' + h + '</i>';
  if (k.b) h = '<b>' + h + '</b>';
  return h;
}
const plainText = s => inlineTokens(s).map(k => k.gap ? '___' : k.t).join('');
/* Deutsche Anführungszeichen: „…“ am Wortanfang unten, am Wortende oben.
   Einfache nur, wenn sie paarweise stehen (‚…‘); Apostrophe (geht's) bleiben. Guillemets »…« bleiben. */
const Q_OPEN_BEFORE = /[\s([{–—\-\/>„‚«»]/;
function deQuoteStr(str) {
  const s = String(str ?? ''); if (!/["“”„'‘’‚]/.test(s)) return s;
  const a = s.split('');
  const opener = i => i === 0 || Q_OPEN_BEFORE.test(a[i - 1]);
  const word = c => !!c && /[\p{L}\p{N}]/u.test(c);
  for (let i = 0; i < a.length; i++) {
    if (!'"“”„'.includes(a[i])) continue;
    if (opener(i) && i + 1 < a.length && !/\s/.test(a[i + 1])) a[i] = '„';
    else if (i > 0 && !/\s/.test(a[i - 1])) a[i] = '“';
  }
  for (let i = 0; i < a.length; i++) {
    if (!"'‘’‚".includes(a[i]) || !opener(i) || !word(a[i + 1])) continue;
    for (let j = i + 1; j < a.length && a[j] !== '\n'; j++) {
      if (!"'‘’".includes(a[j]) || word(a[j + 1]) || !a[j - 1] || /\s/.test(a[j - 1])) continue;
      a[i] = '‚'; a[j] = '‘'; i = j; break;
    }
  }
  return a.join('');
}
// In den Textstücken einer Zeile (Formatierung bleibt erhalten, Längen bleiben gleich)
function quoteToks(toks) {
  const flat = toks.map(t => t.gap ? 'x' : t.t).join('');
  if (!/["“”„'‘’‚]/.test(flat)) return toks;
  const f = deQuoteStr(flat); let p = 0;
  for (const t of toks) { const n = t.gap ? 1 : t.t.length; if (!t.gap && !t.sup) t.t = f.slice(p, p + n); p += n; }
  return toks;
}
const inlineHTML = s => inlineTokens(s).map(tokHTML).join('');
// Absätze durch Leerzeile; einfache Umbrüche (z. B. aus PDFs kopiert) werden zu Leerzeichen
// Gedicht: Verse (eine Zeile = ein Vers), Strophen durch Leerzeilen
function poemVerses(text) {
  const out = [];
  String(text || '').replace(/\r/g, '').split(/\n[ \t]*\n/).map(st => st.split('\n').map(v => v.trim()).filter(Boolean)).filter(st => st.length)
    .forEach((st, si) => st.forEach((v, vi) => out.push({ t: v, st: si > 0 && vi === 0 })));
  return out;
}
// Material (Prosa): Leerzeile = neuer Absatz, einfacher Umbruch = neue Zeile im selben Absatz
const MAT_BL = '\u2063';
const matParas = t => {
  // Eine Leerzeile = neuer Absatz; jede weitere Leerzeile bleibt als sichtbare Leerzeile stehen
  const out = []; let cur = [], blank = 0;
  String(t || '').replace(/\r/g, '').split('\n').forEach(l => {
    l = l.trim();
    if (!l) { if (cur.length) { out.push(cur); cur = []; } blank++; return; }
    if (out.length && !cur.length) for (let k = 1; k < blank; k++) out.push([MAT_BL]);
    blank = 0; cur.push(l);
  });
  if (cur.length) out.push(cur);
  return out;
};
// Zwischenüberschrift im Material: Zeile mit „## “ am Anfang (im Textfeld fett als eigene Zeile)
const MH_RE = /^##(?:[ \t\u00a0]+|$)/;
const matHasH = t => String(t || '').split('\n').some(l => MH_RE.test(l.trim()) && l.trim().replace(MH_RE, '').trim());
// Zwischenüberschriften als Lücke (5-Schritt-Lesemethode): weg | luecke (Schreiblinie) | kasten (Schreiblinie + Überschriften gemischt im Kasten)
const MAT_HG = '\ue011', MAT_HS = '\ue012';
const GAP_HD = [['', 'bleiben'], ['weg', 'weglassen'], ['luecke', 'als Schreiblinie'], ['kasten', 'Schreiblinie + Kasten']];
const gapHdOn = b => !!(b && b.gapHd && b.form !== 'gedicht' && GAP_HD.some(x => x[0] === b.gapHd));
function hdGapParas(paras, b, show) {
  if (!gapHdOn(b)) return paras;
  return paras.map(p => p.map(seg => {
    if (seg === MAT_BL || !MH_RE.test(seg) || !seg.replace(MH_RE, '').trim()) return seg;
    if (show) return '## ' + MAT_HS + seg.replace(MH_RE, '');
    return b.gapHd === 'weg' ? null : '## ' + MAT_HG;
  }).filter(x => x !== null)).filter(p => p.length);
}
const matHeads = b => String(b.text || '').split('\n').map(l => l.trim()).filter(l => MH_RE.test(l)).map(l => l.replace(MH_RE, '').trim()).filter(Boolean);
// Absätze des Materials als <p>: Überschriften „mh“, die Zeile danach ohne Einzug („ah“)
function matParasHTML(paras, words) {
  let prevH = false, out = '';
  paras.forEach((p, i) => p.forEach((seg, j) => {
    if (seg === MAT_BL) { out += '<p class="bl"></p>'; prevH = true; return; }
    const hd = MH_RE.test(seg); let t = hd ? seg.replace(MH_RE, '') : seg; if (hd && !t.trim()) return;
    if (hd && t === MAT_HG) { out += '<p class="mh hg"><span class="w" data-t=""><span class="hgl">Zwischenüberschrift</span><span class="gapb hgb"></span></span></p>'; prevH = true; return; }
    const hs = hd && t.startsWith(MAT_HS); if (hs) t = t.slice(1);
    const cls = hd ? 'mh' + (hs ? ' hs' : '') : prevH ? 'ah' : `${i && !j ? 'ind' : ''}${j ? ' br' : ''}`.trim();
    out += `<p class="${cls}">${words(t)}</p>`; prevH = hd;
  }));
  return out;
}
// Text aus PDFs: Umbrüche innerhalb eines Absatzes werden zu Leerzeichen (beim Einfügen)
const joinLines = t => String(t || '').split(/\n[ \t]*\n/).map(p => p.replace(/[ \t]*\n[ \t]*/g, ' ')).join('\n\n');
// Ältere Blätter: einfache Umbrüche im Material wurden früher zusammengezogen. Einmalig so speichern, wie es auf dem Blatt stand.
function migrateMatNl(b) {
  if (!b || b.type !== 'material' || b.nl) return;
  if (b.form !== 'gedicht') b.text = String(b.text || '').replace(/\r/g, '').split(/\n\s*\n/).map(p => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean).join('\n\n');
  b.nl = 1;
}
const flowParas = t => String(t || '').replace(/\r/g, '').split(/\n\s*\n/).map(p => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
// Absätze durch Leerzeile; einfache Umbrüche bleiben Zeilenumbrüche
const lineParas = t => String(t || '').replace(/\r/g, '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
// Absätze, darin Zeilen; Zeilen mit „- “ / „1. “ werden Listen
const parasHTML = t => lineParas(t).map(p => {
  let h = '', buf = [], list = null;
  const flushP = () => { if (buf.length) h += '<p>' + buf.map(inlineHTML).join('<br>') + '</p>'; buf = []; };
  const flushL = () => { if (list) h += `<${list.tag} class="rl">${list.items.map(x => `<li>${inlineHTML(x)}</li>`).join('')}</${list.tag}>`; list = null; };
  p.split('\n').forEach(l => {
    const m = l.match(LIST_LINE);
    if (!m) { flushL(); buf.push(l); return; }
    const tag = m[1] ? 'ul' : 'ol'; flushP();
    if (!list || list.tag !== tag) { flushL(); list = { tag, items: [] }; }
    list.items.push(m[3]);
  });
  flushP(); flushL(); return h;
}).join('');
function toWords(text) {
  const words = []; let cur = '';
  for (const k of inlineTokens(text)) {
    if (k.sup || k.gap) { cur += tokHTML(k); continue; }
    for (const p of k.t.split(/(\s+)/)) {
      if (!p) continue;
      if (/^\s+$/.test(p)) { if (cur) { words.push(cur); cur = ''; } }
      else cur += tokHTML({ ...k, t: p });
    }
  }
  if (cur) words.push(cur);
  return words;
}
function parseNotes(t) {
  return String(t || '').split('\n').map(s => s.trim()).filter(Boolean).map((s, i) => {
    const m = s.match(/^(\d+|\*)[).:]?\s+(.*)$/);
    return m ? { n: m[1], text: m[2] } : { n: String(i + 1), text: s };
  });
}

/* ---------- Operator-Erkennung ---------- */
const DU_LEAD = new Set(['et', 'puis', 'ensuite', 'enfin', 'maintenant', 'd’abord', 'und', 'oder', 'dann', 'danach', 'anschließend', 'abschließend', 'zunächst', 'außerdem', 'schließlich', 'nun', 'bitte',
  'then', 'and', 'or', 'now', 'next', 'finally', 'afterwards', 'also', 'first', 'please', 'y', 'o', 'luego', 'después', 'finalmente', 'además', 'primero', 'ahora', 'por', 'favor']);
function detectOps(text) {
  const found = [];
  const sentences = plainText(text).split(/(?<=[.!?;:])\s+/);
  for (const s of sentences) {
    const w = s.toLowerCase().replace(/[.,;:!?()„“”"«»‚‘’…–—]/g, ' ').split(/\s+/).filter(Boolean);
    for (let i = 0; i < w.length; i++) {
      const sie = w[i + 1] === 'sie';
      const du = !sie && (i === 0 || DU_LEAD.has(w[i - 1]));
      if (!sie && !du) continue;
      for (const o of curOps()) {
        const hit = sie
          ? (o.verb ? o.verb === w[i] && w.slice(i + 2).includes(o.part) && (!o.end || partAtEnd(s, o.part)) : o.op === w[i])
          : (impHit(o, w[i]) && (!o.part || (w.slice(i + 1).includes(o.part) && (!o.end || partAtEnd(s, o.part)))));
        if (hit && !found.includes(o)) found.push(o);
      }
    }
  }
  return found;
}
// Operatoren fett, nur in der Ausgabe. Der eingegebene Text bleibt, wie er ist.
// Gleiche Erkennung wie detectOps; bei trennbaren Verben auch der zweite Teil (**Stellen** Sie … **dar**).
function opBold(text) {
  const src = String(text || ''); if (!src) return src;
  const toks = [...src.matchAll(/\p{L}+/gu)].map(m => ({ s: m.index, e: m.index + m[0].length, w: m[0].toLowerCase() }));
  const sents = []; let cur = [];
  toks.forEach((t, k) => { if (k && /[.!?;:]\s/.test(src.slice(toks[k - 1].e, t.s))) { sents.push(cur); cur = []; } cur.push(t); });
  if (cur.length) sents.push(cur);
  const mark = new Set();
  for (const S of sents) {
    const w = S.map(t => t.w);
    for (let i = 0; i < w.length; i++) {
      const sie = w[i + 1] === 'sie';
      const du = !sie && (i === 0 || DU_LEAD.has(w[i - 1]));
      if (!sie && !du) continue;
      for (const o of curOps()) {
        const okJ = j => j > i && w[j] === o.part && (!o.end || /^\s*([,.;:!?)“”–—]|$|(und|oder|sowie|aber|denn)\s)/i.test(src.slice(S[j].e, S[j].e + 8)));
        const hasPart = from => w.some((x, j) => j >= from && okJ(j));
        const hit = sie ? (o.verb ? o.verb === w[i] && hasPart(i + 2) : o.op === w[i])
          : (impHit(o, w[i]) && (!o.part || hasPart(i + 1)));
        if (!hit) continue;
        mark.add(S[i]);
        if (o.part) { const j = w.findIndex((x, k) => okJ(k)); if (j > 0) { mark.add(S[j]); if (o.part === 'beziehung' && w[j - 1] === 'in') mark.add(S[j - 1]); } }
        break;
      }
    }
  }
  if (!mark.size) return src;
  // Schon formatierte Stellen (**fett**, *kursiv*) bleiben unberührt
  const fmt = inlineTokens(src).filter(t => t.b).map(t => [t.rs, t.re]);
  const runs = [];
  toks.forEach(t => {
    if (!mark.has(t) || fmt.some(([a, b]) => t.s < b && t.e > a)) return;
    const last = runs[runs.length - 1];
    if (last && /^\s+$/.test(src.slice(last.e, t.s))) last.e = t.e; else runs.push({ s: t.s, e: t.e });
  });
  let out = '', p = 0;
  runs.forEach(r => { out += src.slice(p, r.s) + '**' + src.slice(r.s, r.e) + '**'; p = r.e; });
  return out + src.slice(p);
}
const taskText = (it, meta) => meta && meta.opBold === false ? (it.text || '') : opBold(it.text);
// Setzt einen Operator an den Anfang des ersten Satzes (Sie- oder du-Form); ein Operator dort wird ersetzt.
function applyOperator(text, o, anrede) {
  const tpl = anrede === 'du' ? o.tplDu : o.tpl;
  const cur = String(text || '').trim();
  if (!cur) return tpl;
  const mm = cur.match(/^([^.!?]*[.!?])(\s[\s\S]*)?$/);
  let first = mm ? mm[1] : cur; const rest = mm && mm[2] ? mm[2] : '';
  first = first.replace(/[.!?]$/, '');
  const lead = first.match(/^([^\s,]+)(?:\s+(Sie))?(?=[\s,]|$)\s*/);
  const w = lead ? lead[1].toLowerCase() : '';
  const cands = lead ? curOps().filter(x => lead[2] ? (x.verb || x.op) === w : impHit(x, w)) : [];
  if (cands.length) {
    first = first.slice(lead[0].length);
    const old = cands.find(x => !x.part || new RegExp('(^|\\s)' + x.part + '(?=$|[\\s,;:.])', 'i').test(first)) || cands[0];
    if (old.part === 'stellung') first = first.replace(/^Stellung(\s+zu)?(?=$|[\s,;:])/i, '');
    else if (old.part === 'auseinander') first = first.replace(/^(sich|dich)\s+mit\s+/i, '').replace(/(^|\s)auseinander(?=$|[\s,;:])/i, '$1');
    else if (old.part === 'beziehung') first = first.replace(/(^|\s)in\s+Beziehung(?=$|[\s,;:])/i, '$1');
    else if (old.part) first = first.replace(new RegExp('(^|\\s)' + old.part + '(?=$|[\\s,;:])', 'i'), '$1');
    first = first.replace(/\s{2,}/g, ' ').trim();
  } else {
    const fw = (first.match(/^\S+/) || [''])[0];
    if (/^(wie|was|ob|warum|weshalb|inwiefern|inwieweit|welche[nmrs]?|wodurch|wozu)$/i.test(fw)) first = ', ' + fw.toLowerCase() + first.slice(fw.length);
    else if (/^(der|die|das|den|dem|des|ein|eine|einen|einem|eines|ihre[nmrs]?|ihr|deine[nmrs]?|dein|mithilfe|anhand|zentrale|wesentliche)$/i.test(fw)) first = fw.toLowerCase() + first.slice(fw.length);
  }
  if (!first) return tpl + rest;
  let out = first.startsWith(',')
    ? tpl.replace(/\s*(zu |mit )?…/, '').replace(/\.$/, '') + first
    : (tpl.includes('…') ? tpl.replace('…', first) : tpl + ' ' + first);
  if (!/[.!?]$/.test(out)) out += '.';
  return out + rest;
}
const opsRange = ops =>ops.length ? [Math.min(...ops.map(o => o.afb[0])), Math.max(...ops.map(o => o.afb[1]))] : null;

