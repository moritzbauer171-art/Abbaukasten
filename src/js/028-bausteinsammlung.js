/* ================= Bausteinsammlung ================= */
const LS_SNIP = 'abw.snips';
const userSnips = () => { const s = lsGet(LS_SNIP); return Array.isArray(s) ? s.filter(x => x && x.block && TYPES[x.block.type]) : []; };
function opsTableBlock() {
  const F = fachInfo();
  if (fachBase() === 'ma') return { ...newBlock('table'), title: F.ops, cols: ['Operator · Anforderungsbereich', 'Das heißt …'], rows: OPS_MA_TABLE.map(([o, a, d]) => [o + ' · AFB ' + a, d]), rowHeight: 'normal', firstBold: true, cw: [40, 60] };
  if (fachKey() === 'fr') return { ...newBlock('table'), title: 'Opérateurs', cols: ['Opérateur · AFB', 'Ce qu’il faut faire'], rows: OPS_FR_TABLE.map(([o, a, d]) => [o + ' · ' + a, d]), rowHeight: 'normal', firstBold: true };
  if (fachBase() === 'bio') return { ...newBlock('table'), title: fachKey() === 'bio' ? 'Operatoren Biologie (KMK)' : F.ops, cols: ['Operator · Anforderungsbereich', 'Das heißt …'], rows: OPS_BIO_TABLE.map(([o, a, d]) => [o + ' · AFB ' + a, d]), rowHeight: 'normal', firstBold: true, cw: [40, 60] };
  if (fachKey() === 'en' || fachKey() === 'es') { const en = fachKey() === 'en'; return { ...newBlock('table'), title: en ? 'Operators' : 'Operadores', cols: [en ? 'Operator · AFB' : 'Operador · AFB', en ? 'What you do' : 'Qué hay que hacer'], rows: (en ? OPS_EN_TABLE : OPS_ES_TABLE).map(([o, a, d]) => [o + ' · ' + a, d]), rowHeight: 'normal', firstBold: true }; }
  if (fachBase() === 'gp') return { ...newBlock('table'), title: fachKey() === 'gp' ? 'Operatoren Geschichte (KMK)' : F.ops, cols: ['Operator · Anforderungsbereich', 'Das heißt …'], rows: OPS_GP_TABLE.map(([o, a, d]) => [o + ' · AFB ' + a, d]), rowHeight: 'normal', firstBold: true, cw: [40, 60] };
  return { ...newBlock('table'), title: 'Operatoren (IQB-Grundstock Deutsch)', cols: ['Operator', 'Anforderungsbereich'], rows: OPS.filter(o => o.iqb).map(o => [o.op, 'AFB ' + afbLabel(o.afb)]), rowHeight: 'normal', firstBold: true };
}
function allSnips() { return [{ id: 'builtin-self', name: 'Selbsteinschätzung zum Ankreuzen', type: 'table', builtin: true }, { id: 'builtin-ops', name: fachKey() === 'deutsch' ? 'Operatorenübersicht (IQB-Grundstock)' : 'Operatorenübersicht (' + fachInfo().opsShort + ')', type: 'table', builtin: true }, ...userSnips().map(s => ({ ...s, type: s.block.type }))]; }
/* Tabellen: Spaltenbreiten in Prozent (b.cw), Ankreuzspalten (b.ck), Kästchen [ ] und [x] in Zellen */
const CW_MIN = 6;
function tbWidths(b) {
  const n = b.cols.length; const ok = Array.isArray(b.cw) && b.cw.length === n && b.cw.every(x => +x > 0);
  const a = ok ? b.cw.map(Number) : Array(n).fill(100 / n); const sum = a.reduce((x, y) => x + y, 0) || 1;
  return a.map(x => x * 100 / sum);
}
function cwSet(b, i, pos) {
  const w = tbWidths(b); const left = w.slice(0, i).reduce((a, x) => a + x, 0); const right = left + w[i] + w[i + 1];
  const p = Math.round(Math.max(left + CW_MIN, Math.min(right - CW_MIN, pos)));
  w[i] = p - left; w[i + 1] = right - p; b.cw = w.map(x => Math.round(x * 10) / 10);
}
// Editor: jede Spalte mindestens 80 px breit, sonst waagerecht scrollen (Verhältnis bleibt wie auf dem Blatt)
const tbEdMin = (b, each) => Math.round(Math.max(...tbWidths(b).map(p => 80 * 100 / p)) * (each ? 1 : 1)) + (each ? 72 : 0);
const tbCk = (b, i) => !!(Array.isArray(b.ck) && b.ck[i]);
const CK_SVG = x => `<svg class="ck${x ? ' x' : ''}" viewBox="0 0 12 12" aria-hidden="true"><rect x=".7" y=".7" width="10.6" height="10.6" rx="1.2" fill="none" stroke="#1C1F27" stroke-width="1"/>${x ? '<path d="M3 3l6 6M9 3l-6 6" stroke="#1C1F27" stroke-width="1.2" stroke-linecap="round"/>' : ''}</svg>`;
const ckCellHTML = c => inlineHTML(c).replace(/\[ ?\]/g, CK_SVG(false)).replace(/\[[xX]\]/g, CK_SVG(true));
const ckCellWord = c => String(c || '').replace(/\[ ?\]/g, '☐').replace(/\[[xX]\]/g, '☒');
function cwBarHTML(b) {
  const w = tbWidths(b); let cum = 0;
  const lab = (c, i) => plainText(c || '').trim().slice(0, 24) || `Spalte ${i + 1}`;
  const segs = w.map((p, i) => `<div class="cw-seg${i === w.length - 1 ? ' last' : ''}" style="width:${p}%"><b>${esc(lab(b.cols[i], i))}</b><small>${Math.round(p)} %</small></div>`).join('');
  const hs = w.slice(0, -1).map((p, i) => { cum += p; return `<button type="button" class="cw-h" role="slider" data-i="${i}" style="left:${cum}%" aria-label="Grenze zwischen Spalte ${i + 1} und ${i + 2}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(cum)}" aria-valuetext="Spalte ${i + 1}: ${Math.round(p)} %, Spalte ${i + 2}: ${Math.round(w[i + 1])} %" title="Ziehen oder Pfeiltasten"></button>`; }).join('');
  return `<div class="f cw-f"><span>Spaltenbreite <button class="link" type="button" data-act="cw-reset"${Array.isArray(b.cw) ? '' : ' disabled'}>gleich breit</button></span><div class="cw-bar" data-cwbar>${segs}${hs}</div></div>`;
}
function cwPaint(card, b) {
  const w = tbWidths(b); const bar = card.querySelector('[data-cwbar]'); if (!bar) return; let cum = 0;
  bar.querySelectorAll('.cw-seg').forEach((sg, i) => { sg.style.width = w[i] + '%'; const sm = sg.querySelector('small'); if (sm) sm.textContent = Math.round(w[i]) + ' %'; });
  bar.querySelectorAll('.cw-h').forEach((h, i) => { cum += w[i]; h.style.left = cum + '%'; h.setAttribute('aria-valuenow', Math.round(cum)); h.setAttribute('aria-valuetext', `Spalte ${i + 1}: ${Math.round(w[i])} %, Spalte ${i + 2}: ${Math.round(w[i + 1])} %`); });
  card.querySelectorAll('.tbl-ed col[data-ci]').forEach(c => { c.style.width = w[+c.dataset.ci] + '%'; });
  const et = card.querySelector('.tbl-ed table'); if (et) et.style.minWidth = tbEdMin(b, !!b.rowEach) + 'px';
  const rs = card.querySelector('[data-act="cw-reset"]'); if (rs) rs.disabled = false;
}
function ckRowHTML(b) {
  return `<div class="f ck-f"><span>Ankreuzfelder</span><div class="ck-chips">${b.cols.map((c, i) => `<button type="button" class="ck-chip" data-act="tb-ck" data-i="${i}" aria-pressed="${tbCk(b, i)}" title="Leere Zellen dieser Spalte bekommen ein Kästchen"><span class="cbx" aria-hidden="true"></span>${esc(plainText(c || '').trim().slice(0, 20) || 'Spalte ' + (i + 1))}</button>`).join('')}</div><small>Leere Zellen der gewählten Spalten bekommen ein Kästchen zum Ankreuzen. Einzelne Kästchen: in eine Zelle <b>[ ]</b> schreiben, angekreuzt <b>[x]</b>.</small></div>`;
}
const selfCheckBlock = () => ({ ...newBlock('table'), title: 'Selbsteinschätzung', cols: ['Ich kann …', 'sicher', 'teilweise', 'noch nicht'], rows: Array.from({ length: 4 }, () => ['…', '', '', '']), ck: [false, true, true, true], cw: [58, 14, 14, 14], rowHeight: 'normal', firstBold: false });
/* Post: Plattformen und Kopf/Fuß des Beitrags */
const POST_PF = { x: 'X', insta: 'Instagram', fb: 'Facebook', tiktok: 'TikTok', threads: 'Threads', bsky: 'Bluesky', masto: 'Mastodon', tg: 'Telegram', yt: 'YouTube', '': 'Soziales Netzwerk' };
const POST_IC = {
  re: '<path d="M4 5.5h16v10H11l-4.5 3.5V15.5H4z"/>',
  rp: '<path d="M6 9V7.5a2 2 0 0 1 2-2h10l-2.5-2.5M18 15v1.5a2 2 0 0 1-2 2H6l2.5 2.5"/>',
  li: '<path d="M12 19.5s-7-4.4-7-9.3A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.2c0 4.9-7 9.3-7 9.3z"/>'
};
const postIni = n => (String(n || '').trim().split(/\s+/).map(x => x.replace(/^@/, '')[0] || '').join('').slice(0, 2) || '?').toUpperCase();
function postHeadHTML(b) { const p = b.post || {}; const who = esc(String(p.name || '').trim() || 'Name'); const h = String(p.handle || '').trim(); return `<div class="post-h"><span class="post-av">${esc(postIni(p.name || p.handle))}</span><span class="post-n"><b>${who}</b><span>${h ? esc(h.startsWith('@') ? h : '@' + h) : ''}${h && p.date ? ' · ' : ''}${esc(p.date || '')}</span></span><span class="post-pf">${esc(POST_PF[p.pf] || POST_PF[''])}</span></div>`; }
function postFootHTML(b) { const p = b.post || {}; const it = k => String(p[k] || '').trim() ? `<span><svg viewBox="0 0 24 24" aria-hidden="true">${POST_IC[k]}</svg>${esc(p[k])}</span>` : ''; const r = it('re') + it('rp') + it('li'); return `<div class="post-f">${r || '<span></span>'}${p.fiktiv !== false ? '<em>fiktiver Beitrag</em>' : ''}</div>`; }
/* Zuordnen: links in eingegebener Reihenfolge, rechts gemischt (fest über seed, damit Vorschau, PDF und Word gleich sind) */
function mtRand(seed) { let a = (seed >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const MT_DEF = (sort, mode, du) => sort
  ? (mode === 'buchstaben' ? (du ? 'Trage bei jedem Wort die Nummer des passenden Oberbegriffs ein.' : 'Tragen Sie bei jedem Wort die Nummer des passenden Oberbegriffs ein.') : (du ? 'Verbinde jedes Wort mit dem passenden Oberbegriff.' : 'Verbinden Sie jedes Wort mit dem passenden Oberbegriff.'))
  : (mode === 'buchstaben' ? (du ? 'Ordne zu: Trage den passenden Buchstaben in das Kästchen ein.' : 'Ordnen Sie zu: Tragen Sie den passenden Buchstaben in das Kästchen ein.') : (du ? 'Verbinde, was zusammengehört.' : 'Verbinden Sie, was zusammengehört.'));
const mtIsDef = t => !String(t || '').trim() || [true, false].some(so => ['linien', 'buchstaben'].some(md => [true, false].some(du => MT_DEF(so, md, du) === t)));
const mtCid = () => 'c' + Math.random().toString(36).slice(2, 8);
// Beim ersten Umschalten aufs Sortieren: Paare werden zu Oberbegriffen und Wörtern
function mtToSort(b) {
  if (Array.isArray(b.cats) && b.cats.length) return;
  const P = (b.pairs || []).filter(p => String(p.a || '').trim() || String(p.b || '').trim());
  b.cats = []; b.words = [];
  P.forEach(p => { let id = ''; if (String(p.a || '').trim()) { id = mtCid(); b.cats.push({ id, t: p.a }); } if (String(p.b || '').trim()) b.words.push({ t: p.b, c: id }); });
  if (!b.cats.length) b.cats = [{ id: mtCid(), t: '' }, { id: mtCid(), t: '' }];
  if (!b.words.length) b.words = [{ t: '', c: b.cats[0].id }, { t: '', c: b.cats[0].id }, { t: '', c: (b.cats[1] || b.cats[0]).id }];
}
function mtLayout(b) {
  if (b.sort) {
    const cats = (b.cats || []).map((c, i) => ({ i, id: c.id, a: String(c.t || '').trim() })).filter(c => c.a);
    const W = (b.words || []).map((w, i) => ({ i, b: String(w.t || '').trim(), c: w.c || '' })).filter(w => w.b);
    const r = mtRand(b.seed || 7); const o = W.map((_, i) => i); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
    const right = o.map(k => W[k]); const letter = k => String.fromCharCode(65 + k);
    const sol = []; right.forEach((w, rk) => { const li = cats.findIndex(c => c.id === w.c); if (li >= 0) sol.push({ li, rk, L: String(li + 1), R: letter(rk) }); });
    const rows = Math.max(cats.length, right.length);
    const span = cats.map((_, i) => [Math.floor(i * rows / cats.length), Math.max(Math.floor(i * rows / cats.length) + 1, Math.floor((i + 1) * rows / cats.length))]);
    return { sort: true, left: cats, right, letter, sol, rows, span };
  }
  const P = (b.pairs || []).map((p, i) => ({ i, a: String(p.a || '').trim(), b: String(p.b || '').trim() }));
  const left = P.filter(p => p.a), right = P.filter(p => p.b);
  // Mischen ohne waagerechte Treffer: möglichst kein Partner in derselben Zeile wie sein Begriff
  const r = mtRand(b.seed || 7); const leftPos = new Map(left.map((l, k) => [l.i, k]));
  const fixed = o => o.reduce((n, x, k) => n + (leftPos.get(right[x].i) === k ? 1 : 0), 0);
  let order = right.map((_, i) => i), best = null;
  for (let tries = 0; tries < 40; tries++) {
    const o = right.map((_, i) => i); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
    const f = fixed(o); if (!best || f < best.f) best = { o, f }; if (!f) break;
  }
  if (best) order = best.o;
  const rightS = order.map(k => right[k]);
  const letter = k => String.fromCharCode(65 + k);
  const sol = left.map((l, li) => { const k = rightS.findIndex(x => x.i === l.i); return { li, rk: k, L: String(li + 1), R: k >= 0 ? letter(k) : '' }; });
  return { left, right: rightS, letter, sol, rows: Math.max(left.length, rightS.length) };
}
function snipBlock(id) {
  if (id === 'builtin-ops') return opsTableBlock();
  if (id === 'builtin-self') return selfCheckBlock();
  const s = userSnips().find(x => x.id === id); if (!s) return null;
  const b = clone(s.block); b.id = 'b' + uid(); delete b.group; migrateMatNl(b); return b;
}
function saveSnip(b) {
  const list = userSnips(); const c = clone(b); delete c.group;
  const name = (typeLabel(b) + ': ' + summary(b, numbering(state.sheet))).slice(0, 70);
  list.unshift({ id: 's' + uid(), name, block: c }); lsSet(LS_SNIP, list.slice(0, 60));
  state.fmtOpen.add('snips'); toast('In der Sammlung gespeichert · unter „+ Baustein hinzufügen“ (Strg+K)');
}
// Einfügen an Ort und Stelle: ein „+“ zwischen den Karten öffnet die Bausteinauswahl genau dort
function insRow(i) {
  if (state.insAt === i) return `<div class="ins-pal" data-at="${i}"><div class="ins-pal-h"><span>Baustein hier einfügen</span><button type="button" class="ib" data-act="ins-close" title="Schließen">${I.x}</button></div><div class="ins-grid">${areaPalette(state.area || 'blatt').map(t => `<button type="button" class="ins-b" data-act="ins-add" data-type="${t.type}" data-pk="${t.k}" data-at="${i}" title="${esc(t.desc)}"><i class="add-ic">${typeIcon(t.ic)}</i><b>${t.label}</b></button>`).join('')}</div></div>`;
  return `<div class="ins-row" data-act="ins-open" data-at="${i}"><button type="button" class="ins-btn" data-act="ins-open" data-at="${i}" title="Baustein hier einfügen" aria-label="Baustein hier einfügen">+</button></div>`;
}
function adderHTML(A = 'blatt') {
  const tile = t => `<button type="button" class="add-b" data-act="add" data-type="${t.type}" data-pk="${t.k}" title="${esc(t.label + ': ' + t.desc)}"><i class="add-ic">${typeIcon(t.ic)}</i><span class="add-tx"><b>${t.label}</b></span></button>`;
  const L = areaPalette(A);
  if (A !== 'blatt') return `<div class="adder"><span class="lbl">Hinzufügen</span><div class="adder-grid">${L.map(tile).join('')}${A === 'extras' ? `<button type="button" class="add-b" data-act="a4-new" data-v="karten" title="Eigene Texte als Kärtchen mit Schnittlinien"><i class="add-ic">${typeIcon('a3')}</i><span class="add-tx"><b>Karten zum Ausschneiden</b></span></button><button type="button" class="add-b" data-act="st-new" data-v="exit" title="Exit-Ticket: Unterrichtsschritt am Ende der Stunde mit Fragen zum Ausdrucken"><i class="add-ic">${typeIcon('step')}</i><span class="add-tx"><b>Exit-Ticket</b></span></button>` : ''}</div></div>`;
  return `<div class="adder"><span class="lbl">Baustein hinzufügen</span>${['Material', 'Aufgaben und Übungen', 'Gestaltung'].map((g, gi) => { const T = L.filter(t => PAL_GRP(t) === gi); return T.length ? `<div class="adder-g"><small>${g}</small><div class="adder-grid">${T.map(tile).join('')}</div></div>` : ''; }).join('')}
    ${(() => { const open = state.fmtOpen.has('snips'); const n = allSnips().length; return `<button type="button" class="link snips-h" data-act="sub-toggle" data-key="snips" aria-expanded="${open}">${open ? '▾' : '▸'} Aus der Sammlung · ${n}</button>`; })()}
    <div class="snips"${state.fmtOpen.has('snips') ? '' : ' hidden'}>${allSnips().map(s => `<div class="snip"><button type="button" class="snip-add" data-act="snip-add" data-id="${esc(s.id)}"><b>${esc(s.name)}</b><span>${s.builtin ? 'vorbereitet' : esc((TYPES[s.type] || {}).label || '')}</span></button>${s.builtin ? '' : `<button class="ib" type="button" data-act="snip-del" data-id="${esc(s.id)}" title="Aus der Sammlung entfernen">${I.x}</button>`}</div>`).join('')}
      <small class="hint">Eigene Bausteine speicherst du über ⋯ an der jeweiligen Karte.</small></div></div>`;
}

