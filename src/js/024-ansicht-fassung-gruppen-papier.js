/* ================= Ansicht: Fassung, Gruppen, Papier ================= */
const GEO = { a4: { avail: 264 }, a4q: { avail: 177 }, a5: { avail: 182 } };
// Freiraum über der Fußzeile (mm): normal / mehr / viel
const BOT_GAP = { a4: { '': 9, m: 17, l: 27 }, a5: { '': 6, m: 11, l: 18 } };
function sheetView() { const m = state.sheet.meta; return { lehrer: state.fassung === 'lehrer', grp: m.groupsOn && grpList(m).some(g => g.k === state.grp) ? state.grp : 'all', lvl: state.sheet.meta.levelsOn ? (state.lvl || 'all') : 'all' }; }
const LV = { b: { name: 'Basis', sym: '★' }, s: { name: 'Standard', sym: '★★' }, e: { name: 'Experte', sym: '★★★' } };
