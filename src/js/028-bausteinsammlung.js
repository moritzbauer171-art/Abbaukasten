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


/* ================= Chat ================= */
// Gestaltung angelehnt an bekannte Messenger – ohne Logos und Markennamen auf dem Blatt
const CHAT_ST = {
  gruen: { l: 'Grün', hint: 'wie WhatsApp' }, blau: { l: 'Blau', hint: 'wie iMessage' }, verlauf: { l: 'Verlauf', hint: 'wie Instagram' },
  hell: { l: 'Hellblau', hint: 'wie Telegram' }, dunkel: { l: 'Dunkel', hint: 'wie Discord' }, sms: { l: 'Schlicht', hint: 'SMS, gut zum Drucken' }, ki: { l: 'KI-Chat', hint: 'wie ein Chatbot' }
};
const CHAT_PC = ['#1F7A8C', '#C2410C', '#7C3AED', '#15803D', '#B91C1C', '#0369A1', '#A16207', '#BE185D'];
const chatSt = b => (CHAT_ST[b.style] ? b.style : 'gruen');
const chatPeople = b => (Array.isArray(b.people) && b.people.length ? b.people : [{ n: 'Ich' }, { n: 'Person' }]);
const chatIni = n => postIni(n);
const CHAT_IC = { back: '<path d="M14.5 5.5 8 12l6.5 6.5"/>', call: '<path d="M6.6 3.8 9 4.2l1.3 3.6-1.8 1.4a12 12 0 0 0 6.3 6.3l1.4-1.8 3.6 1.3.4 2.4a2 2 0 0 1-2 2.1A16.5 16.5 0 0 1 4.5 5.8a2 2 0 0 1 2.1-2z"/>', vid: '<rect x="3" y="6.5" width="12.5" height="11" rx="2.2"/><path d="m15.5 10.5 5-3v9l-5-3z"/>', more: '<circle cx="12" cy="5.5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="18.5" r="1.2"/>', send: '<path d="M4 12 20 4l-4 16-4-6.5z"/>', mic: '<rect x="9" y="3.5" width="6" height="10.5" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v3.5"/>', plus: '<path d="M12 5v14M5 12h14"/>', ticks: '<path d="m2.5 12.5 4 4 8-9M9.5 16.5l1 0 8-9"/>' };
const chatI = (k, c = '') => `<svg class="ch-i${c ? ' ' + c : ''}" viewBox="0 0 24 24" aria-hidden="true">${CHAT_IC[k]}</svg>`;
function chatHTML(b, tag) {
  const st = chatSt(b), P = chatPeople(b), o = b.opt || {}, M = Array.isArray(b.msgs) ? b.msgs : [], h = b.head || {};
  const group = P.length > 2, ki = st === 'ki', dark = st === 'dunkel';
  const name = String(h.name || '').trim() || (group ? 'Gruppe' : (P[1] && P[1].n) || 'Chat');
  const lines = n => '<span class="ch-wl"></span>'.repeat(n);
  let prev = null;
  const body = M.map((m, i) => {
    if (m.sys) { prev = null; return `<div class="ch-sys"><span>${inlineHTML(m.t || '') || '&nbsp;'}</span></div>`; }
    const pi = Math.max(0, Math.min(P.length - 1, +m.p || 0)), me = pi === 0, who = P[pi] || {}, col = CHAT_PC[(pi - 1 + CHAT_PC.length) % CHAT_PC.length];
    const first = prev !== pi, nx = M[i + 1], last = !nx || nx.sys || (+nx.p || 0) !== pi; prev = pi;
    const txt = String(m.t || '').trim();
    const inner = txt ? inlineHTML(txt).replace(/\n/g, '<br>') : lines(Math.max(1, Math.min(6, +m.ln || 2)));
    const showName = first && (dark || (!me && !ki && group && o.names !== false));
    const meta = (o.time !== false && m.z && !ki ? `<span class="ch-z">${esc(m.z)}${me && o.read !== false && !ki && !dark ? chatI('ticks', 'ch-tk') : ''}</span>` : '');
    const av = (dark || (!me && (ki || (group && st !== 'blau' && st !== 'sms')))) ? `<span class="ch-av sm" style="--pc:${col}">${ki ? 'KI' : esc(chatIni(who.n))}</span>` : '';
    return `<div data-mi="${i}" class="ch-m ${me ? 'me' : 'ot'}${first ? ' first' : ''}${last ? ' last' : ''}${txt ? '' : ' leer'}" style="--pc:${col}">${av ? (first ? av : '<span class="ch-av sm ph"></span>') : ''}<div class="ch-bub">${showName ? `<b class="ch-n">${esc(String(who.n || '').trim() || 'Person')}${dark && m.z && o.time !== false ? `<span class="ch-z">${esc(m.z)}</span>` : ''}</b>` : ''}<div class="ch-t">${inner}</div>${dark ? '' : meta}</div></div>`;
  }).join('');
  const head = ki ? `<div class="ch-h"><span class="ch-hn"><b>${esc(name)}</b>${h.sub ? `<small>${esc(h.sub)}</small>` : ''}</span></div>`
    : `<div class="ch-h">${dark ? '<span class="ch-hash">#</span>' : chatI('back', 'ch-bk')}${dark ? '' : `<span class="ch-av">${esc(chatIni(name))}</span>`}<span class="ch-hn"><b>${esc(name)}</b>${h.sub ? `<small>${esc(h.sub)}</small>` : group && st !== 'dunkel' ? `<small>${esc(P.map(x => String(x.n || '').trim()).filter(Boolean).join(', '))}</small>` : ''}</span>${dark ? '' : `<span class="ch-hi">${st === 'blau' ? chatI('vid') : chatI('vid') + chatI('call')}${st === 'gruen' ? chatI('more') : ''}</span>`}</div>`;
  const bar = o.bar !== false ? `<div class="ch-in">${ki || dark ? '' : chatI('plus', 'ch-pl')}<span class="ch-inp">${ki ? 'Nachricht an die KI …' : dark ? 'Nachricht an #' + esc(name) : 'Nachricht'}</span>${chatI(ki || st === 'blau' || st === 'verlauf' ? 'send' : 'mic', 'ch-snd')}</div>` : '';
  const w = Math.max(40, Math.min(100, +b.width || 72));
  return `<div class="blk blk-chat cs-${st}${o.frame !== false ? ' frm' : ''}${o.ln ? ' ch-ln' : ''}" data-step="${Math.max(1, +(state.sheet && state.sheet.meta && state.sheet.meta.lineStep) || 5)}" style="--chw:${w}%">${tag || b.title ? `<div class="mat-head">${tag ? `<span class="mat-no">${tag}</span>` : ''}<span class="mat-title">${inlineHTML(b.title || '') || '&nbsp;'}</span></div>` : ''}<div class="ch-ph">${head}<div class="ch-b">${body || '<div class="ch-sys"><span>Noch keine Nachrichten</span></div>'}</div>${bar}</div>${b.fiktiv !== false ? '<div class="ch-fk">Fiktiver Chatverlauf</div>' : ''}</div>`;
}

// Zeilenangaben im Chat: nach dem Setzen die gedruckten Zeilen in den Blasen zählen, jede 5. am Rand vermerken.
// Die Zeilen je Nachricht merkt sich CHAT_LN (für den Word-Export: „Z. 7–8“).
const CHAT_LN = {};
function chatLines(root = document.getElementById('pages')) {
  if (!root) return;
  root.querySelectorAll('.blk-chat').forEach(c => {
    c.querySelectorAll(':scope > .ch-lnn').forEach(x => x.remove());
    const bid = (c.closest('[data-bid]') || c).dataset.bid; if (!c.classList.contains('ch-ln')) { if (bid) delete CHAT_LN[bid]; return; }
    const ph = c.querySelector('.ch-ph'), page = c.closest('.page'); if (!ph || !page) return;
    const C = c.getBoundingClientRect(), PH = ph.getBoundingClientRect(); if (!C.width) return;
    const mmPx = page.getBoundingClientRect().width / (+page.dataset.w || 210), step = +c.dataset.step || 5;
    let n = 0; const map = {}, out = [];
    c.querySelectorAll('.ch-m[data-mi]').forEach(m => {
      const t = m.querySelector('.ch-t'); if (!t || m.classList.contains('leer') || !t.textContent.trim()) return;
      const r = document.createRange(); r.selectNodeContents(t);
      const tops = []; [...r.getClientRects()].filter(x => x.width > .5 && x.height > .5).forEach(x => { const y = x.top + x.height / 2; if (!tops.some(v => Math.abs(v.y - y) < x.height * .45)) tops.push({ y, h: x.height }); });
      tops.sort((a, b) => a.y - b.y); const s0 = n + 1;
      tops.forEach(v => { n++; if (n % step === 0) out.push(`<span class="ch-lnn" style="top:${((v.y - C.top) / mmPx).toFixed(2)}mm;left:${((PH.left - C.left) / mmPx - 8).toFixed(2)}mm">${n}</span>`); });
      if (tops.length) map[m.dataset.mi] = [s0, n];
    });
    if (bid) CHAT_LN[bid] = map; if (out.length) c.insertAdjacentHTML('beforeend', out.join(''));
  });
}
