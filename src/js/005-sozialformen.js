/* ================= Sozialformen ================= */
const SOZ = {
  ea: { label: 'Einzelarbeit', short: 'EA' },
  pa: { label: 'Partnerarbeit', short: 'PA' },
  ga: { label: 'Gruppenarbeit', short: 'GA' },
  tps: { label: 'Think-Pair-Share', short: 'TPS' },
  pl: { label: 'Plenum', short: 'Plenum' }
};
/* Tabellen: Hintergrundfarben für Felder, um Abschnitte sichtbar zu machen (druckfreundliche Pastelltöne) */
const TBL_BG = { gelb: { l: 'Gelb', c: '#FFF1A8' }, orange: { l: 'Orange', c: '#FFDDB8' }, rosa: { l: 'Rosa', c: '#FAD4DA' }, lila: { l: 'Lila', c: '#E4D9F5' }, blau: { l: 'Blau', c: '#D3E6FA' }, gruen: { l: 'Grün', c: '#D5F0CC' }, grau: { l: 'Grau', c: '#E7E9ED' } };
const tbBg = (b, r, c) => { const k = b && b.bg && b.bg[r + '.' + c]; return TBL_BG[k] ? TBL_BG[k].c : ''; };
// Tabelle umbauen: ord = alte Indizes in neuer Reihenfolge, -1 = neue leere Zeile/Spalte; Erwartungen, Höhen, Farben, Breiten wandern mit
function tbReRows(b, ord) {
  const n = b.cols.length, inv = {}; ord.forEach((o, k) => { if (o >= 0) inv[o] = k; });
  b.rows = ord.map(o => (o < 0 ? Array(n).fill('') : b.rows[o]));
  if (Array.isArray(b.eh)) b.eh = ord.map(o => (o < 0 || !b.eh[o] ? Array(n).fill('') : b.eh[o]));
  if (Array.isArray(b.rowH)) b.rowH = ord.map(o => (o < 0 ? '' : b.rowH[o] || ''));
  if (b.bg) { const nb = {}; Object.entries(b.bg).forEach(([k, v]) => { const [r, c] = k.split('.'); if (r === 'h') nb[k] = v; else if (inv[+r] != null) nb[inv[+r] + '.' + c] = v; }); b.bg = nb; if (!Object.keys(nb).length) delete b.bg; }
}
function tbReCols(b, ord) {
  const inv = {}; ord.forEach((o, k) => { if (o >= 0) inv[o] = k; }); const pick = (arr, fill) => ord.map(o => (o < 0 ? fill : arr[o] ?? fill));
  const w = Array.isArray(b.cw) && b.cw.length === b.cols.length ? tbWidths(b) : null;
  b.cols = pick(b.cols, ''); b.rows = b.rows.map(r => pick(r, ''));
  if (Array.isArray(b.eh)) b.eh = b.eh.map(r => pick(r || [], ''));
  if (Array.isArray(b.ck)) { b.ck = pick(b.ck, false); if (!b.ck.some(Boolean)) delete b.ck; }
  if (w) { const avg = 100 / ord.length; const nw = ord.map(o => (o < 0 ? avg : w[o])); const sm = nw.reduce((x, y) => x + y, 0); b.cw = nw.map(x => Math.round(x * 1000 / sm) / 10); } else delete b.cw;
  if (b.bg) { const nb = {}; Object.entries(b.bg).forEach(([k, v]) => { const [r, c] = k.split('.'); if (inv[+c] != null) nb[r + '.' + inv[+c]] = v; }); b.bg = nb; if (!Object.keys(nb).length) delete b.bg; }
}
/* Raketenaufgabe: Zusatzaufgabe für alle, die schon fertig sind */
const RK_SVG = '<svg class="rk-i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8c3.2 2.2 4.6 5.6 4.6 9.6l-1.9 3.1H9.3l-1.9-3.1c0-4 1.4-7.4 4.6-9.6z"/><circle cx="12" cy="9.4" r="1.7"/><path d="M7.4 12.4 4.6 15.6l3 1.1M16.6 12.4l2.8 3.2-3 1.1M10.3 18.2 12 21.5l1.7-3.3"/></svg>';
// Darstellung: 'nr' = kleine Rakete an der Nummer (Standard), 'abschnitt' = eigener Abschnitt am Ende des Aufgabenbausteins
const rkStyle = m => (m && m.rkStyle === 'abschnitt' ? 'abschnitt' : 'nr');
const rkHead = m => String((m && m.rkHead) || '').trim() || 'Für alle, die schon fertig sind';
// Im Abschnitt-Modus stehen Raketenaufgaben am Ende ihres Bausteins (in den Daten selbst, damit Blatt, Folie und Word übereinstimmen)
function rkSort(b) { if (!b || b.type !== 'tasks' || !Array.isArray(b.items)) return; const a = b.items.filter(x => !x.rk), r = b.items.filter(x => x.rk); if (r.length && a.length) b.items = [...a, ...r]; }
/* Arbeitsformen: Piktogramme neben der Sozialform, mehrere je Aufgabe möglich */
const ARB = {
  lesen: { label: 'Lesen', g: '<path d="M2.5 5.6c3.2-1.3 6.4-1.1 9.5 1 3.1-2.1 6.3-2.3 9.5-1v13.2c-3.2-1.3-6.4-1.1-9.5 1-3.1-2.1-6.3-2.3-9.5-1z"/><path d="M12 6.6v13.2"/>' },
  schreiben: { label: 'Schreiben', g: '<path d="M4.5 19.5l1-4.6L16.3 4.1a2.2 2.2 0 0 1 3.1 3.1L8.6 18z"/><path d="M14.4 6l3.1 3.1"/><path d="M12.5 21h8"/>' },
  hoeren: { label: 'Hören', g: '<path d="M4 15.5V12a8 8 0 0 1 16 0v3.5"/><rect x="2.8" y="13.6" width="4.6" height="7" rx="1.6" class="f"/><rect x="16.6" y="13.6" width="4.6" height="7" rx="1.6" class="f"/>' },
  sprechen: { label: 'Sprechen', g: '<path d="M2.8 5.2a2 2 0 0 1 2-2h8.4a2 2 0 0 1 2 2v5.2a2 2 0 0 1-2 2H8.6l-3.3 2.7v-2.7h-.5a2 2 0 0 1-2-2z"/><path d="M17.6 8.6h1.6a2 2 0 0 1 2 2v5.2a2 2 0 0 1-2 2h-.5v2.7l-3.3-2.7h-3.8a2 2 0 0 1-2-2v-.9"/>' },
  markieren: { label: 'Markieren', g: '<path d="M3 21h18" style="stroke-width:3.2;opacity:.4"/><path d="M8.4 14.6l7.8-10.4 4.6 4.6-10.4 7.8z"/><path d="M8.4 14.6l-2.6 3.1h3.6l1-1.1"/>' },
  recherche: { label: 'Recherchieren', g: '<circle cx="10.4" cy="10.4" r="6.6"/><path d="M15.4 15.4L21 21"/>' },
  sehen: { label: 'Video sehen', g: '<rect x="2.5" y="4" width="19" height="13.5" rx="2"/><path d="M10 7.9v5.7l4.9-2.85z" class="f"/><path d="M8 21h8"/>' },
  zeichnen: { label: 'Zeichnen', g: '<path d="M12 3a9 9 0 1 0 0 18c1.3 0 1.9-.8 1.9-1.8 0-1.4-1.3-1.7-1.3-3 0-1 .8-1.7 1.9-1.7h2.3A4.2 4.2 0 0 0 21 10.3C21 6.2 17 3 12 3z"/><circle cx="7.6" cy="11" r="1.2" class="f"/><circle cx="10.4" cy="7.2" r="1.2" class="f"/><circle cx="15" cy="7.4" r="1.2" class="f"/>' }
};
// Moderationskarten: Ergebnisse auf Karten notieren und im Plenum präsentieren – mit festem Hinweis unter der Aufgabe
Object.assign(ARB, {
  karten: { label: 'Moderationskarten', hint: 'Notieren Sie Ihre Ergebnisse gut leserlich auf Moderationskarten. Präsentieren Sie Ihre Ergebnisse im Plenum.',
    g: '<path d="M7.5 6.6V4.3a1.2 1.2 0 0 1 1.2-1.2h11.1a1.2 1.2 0 0 1 1.2 1.2v8.4a1.2 1.2 0 0 1-1.2 1.2h-1.6"/><rect x="3" y="7.4" width="14.6" height="10.6" rx="1.2"/><path d="M6 11.3h8.6M6 14.6h5.6"/><path d="M10.3 18v3.2M7.6 21.2h5.4"/>' }
});
const arbHints = it => arbOf(it).map(k => ARB[k].hint).filter(Boolean);
Object.assign(ARB, {
  kreuz: { label: 'Ankreuzen', gs: 1, g: '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M8 8l8 8M16 8l-8 8"/>' },
  einkreisen: { label: 'Einkreisen', gs: 1, g: '<ellipse cx="12" cy="12" rx="9.5" ry="6.5"/><path d="M8 12h8"/>' },
  ausmalen: { label: 'Ausmalen', gs: 1, g: '<path d="M14.5 3.5l6 6-8.5 8.5-6-6z"/><path d="M6 12l-2.5 6.5L10 16" class="f"/>' },
  ausschneiden: { label: 'Ausschneiden', gs: 1, g: '<circle cx="6" cy="17" r="2.8"/><circle cx="6" cy="7" r="2.8"/><path d="M8.3 8.6 20 17M8.3 15.4 20 7"/>' },
  kleben: { label: 'Kleben', gs: 1, g: '<rect x="7" y="9" width="10" height="12" rx="2"/><path d="M9 9V5.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5.5V9"/><path d="M9.5 14h5"/>' },
  verbinden: { label: 'Verbinden', gs: 1, g: '<circle cx="5" cy="6" r="2" class="f"/><circle cx="19" cy="18" r="2" class="f"/><path d="M6.6 7.3 17.4 16.7"/><circle cx="5" cy="18" r="2" class="f"/><circle cx="19" cy="6" r="2" class="f"/><path d="M6.8 17 17.2 7"/>' }
});
const arbOf = it => (it && Array.isArray(it.arb) ? it.arb.filter(k => ARB[k]) : []);
const arbSVG = (k, c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><style>.f{fill:${c}}</style><g style="fill:none;stroke:${c};stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round">${(ARB[k] || {}).g || ''}</g></svg>`;
const arbURI = (k, c) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(arbSVG(k, c));
