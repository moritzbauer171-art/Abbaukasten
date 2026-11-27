/* ================= Genderzeichen (Schulvorgabe: ausschreiben) ================= */
const GENDER_RE = /([A-Za-zÄÖÜäöüß]+)(?:\\?\*|:|\\?_|·)(innen|in)(?![a-zäöüß])|([a-zäöüß]+)(Innen)(?![a-zäöüß])/g;
function genderRepl(stem, plural) {
  if (!plural) return `${stem}in oder ${stem}`;
  const masc = /(er|el|en)$/.test(stem) ? stem : /(or|ent|ant|ist|at|og|eg|graf|oph|ent)$/.test(stem) ? stem + 'en' : /e$/.test(stem) ? stem + 'n' : stem + 'e';
  return `${stem}innen und ${masc}`;
}
function genderHits(texts) {
  const out = new Map();
  texts.forEach(t => String(t == null ? '' : t).replace(GENDER_RE, (m, s1, suf1, s2) => { if (!out.has(m)) out.set(m, genderRepl(s1 || s2, (suf1 || 'innen').toLowerCase() === 'innen')); return m; }));
  return [...out].map(([m, r]) => ({ m, r }));
}
function gTargets(bid) {
  const sh = state.sheet;
  if (bid === 'meta') { const m = sh.meta; if (!m.exam) m.exam = {}; return [[m, 'title'], [m, 'topic'], [m.exam, 'label'], [m.exam, 'hilfsmittel'], ...(Array.isArray(m.groups) ? m.groups.flatMap(g => [[g, 'name'], [g, 'add']]) : [])]; }
  if (bid === 'karten') return (sh.cards || []).flatMap(c => [[c, 'term'], [c, 'points']]);
  const b = sh.blocks.find(x => x.id === bid); if (!b) return [];
  switch (b.type) {
    case 'tasks': return [[b, 'title'], ...b.items.flatMap(it => [[it, 'text'], [it, 'eh'], [it, 'tag'], ...(Array.isArray(it.tips) ? it.tips.map((_, j) => [it.tips, j]) : [])])];
    case 'info': return [[b, 'title'], [b, 'text']];
    case 'chat': return [[b, 'title'], [b, 'source'], ...(b.msgs || []).map(m => [m, 't'])];
    case 'phrases': return [[b, 'title'], ...(b.groups || []).flatMap(g => [[g, 'head'], [g, 'text']])];
    case 'step': return ['title', 'head', 'text', 'quote', 'author', 'cap', 'note', 'eh', 'media', 'qs'].map(k => [b, k]);
    case 'a3': a3Norm(b); return [[b, 'title'], [b, 'task'], [b, 'impulse'], [b, 'rules'], ...['legend', 'sections', 'cols', 'aspects', 'experts'].flatMap(k => b[k].map((_, i) => [b[k], i]))];
    case 'tafel': tfNorm(b); return [[b, 'title'], [b, 'center'], ...b.cols.map((_, i) => [b.cols, i]), ...b.rows.flatMap(r => r.map((_, i) => [r, i])), ...b.branches.flatMap(x => [[x, 'h'], [x, 't']]), ...b.steps.flatMap(x => [[x, 'h'], [x, 't']]), [b.poles, 'l'], [b.poles, 'm'], [b.poles, 'r'], ...b.scale.map(x => [x, 't']), ...b.nodes.flatMap(x => [[x, 'n'], [x, 'd']]), ...b.rels.map(x => [x, 't'])];
    case 'heading': case 'text': return [[b, 'text']];
    case 'gsa': return [[b, 'title'], [b, 'words'], [b, 'text'], ...(b.items || []).map(x => [x, 't'])];
    case 'table': return [[b, 'title'], ...b.cols.map((_, j) => [b.cols, j]), ...b.rows.flatMap(r => r.map((_, j) => [r, j]))];
    case 'qr': return [[b, 'title'], [b, 'note']];
    case 'match': return [[b, 'title'], ...(b.sort ? [...(b.cats || []).map(c => [c, 't']), ...(b.words || []).map(w => [w, 't'])] : (b.pairs || []).flatMap(p => [[p, 'a'], [p, 'b']]))];
    case 'image': return [[b, 'caption'], ...(b.lb || []).flatMap(x => [[x, 'h'], [x, 't']])];
    default: return [];
  }
}
function gNote(bid) {
  const hits = genderHits(gTargets(bid).map(([o, k]) => o[k]));
  if (!hits.length) return `<div data-gn="${bid}" hidden></div>`;
  return `<div class="gnote" data-gn="${bid}"><b>Genderzeichen</b><span>Laut Schulvorgabe ausschreiben:</span>${hits.map(h => `<span class="gn-hit">„${esc(h.m.replace(/\\/g, ''))}“ <button type="button" class="link" data-act="gfix" data-m="${esc(h.m)}" data-r="${esc(h.r)}">→ ${esc(h.r)}</button></span>`).join('')}</div>`;
}
function gFix(bid, m, r) { gTargets(bid).forEach(([o, k]) => { if (typeof o[k] === 'string') o[k] = o[k].split(m).join(r); }); changed(true); toast(`„${m.replace(/\\/g, '')}“ ersetzt`); }

