/* ================= Präsentation: Folien aus dem Arbeitsblatt (im Browser und als PowerPoint) =================
   Material mit denselben Zeilen und Zeilennummern wie auf dem Blatt, je Aufgabe eine Folie, Erwartung und Tipps für die Lehrkraft. */
const PR_MAX = { tasks: 60, step: 60, mat: 40, tafel: 36, info: 46, quote: 60, table: 32, phr: 34, match: 40 };
function presCollect(quiet) {
  const keep = { fassung: state.fassung, out: state.out, gapEdit: state.gapEdit, bookPages: state.bookPages, grp: state.grp };
  const mats = {}; let pages = [];
  MAPPE_LOCK = true; clearTimeout(renderTimer);
  try {
    state.out = 'blatt'; state.fassung = 'schueler'; state.gapEdit = null; state.grp = 'all'; pages = layout().map(o => o.pg);
    Object.entries(ZL_MAP).forEach(([bid, z]) => { mats[bid] = { tag: z.tag, lines: [] }; });
  } finally { Object.assign(state, keep); MAPPE_LOCK = false; }
  pages.forEach(pg => pg.querySelectorAll('.blk-mat[data-bid]').forEach(el => {
    const M = mats[el.dataset.bid] || (mats[el.dataset.bid] = { tag: '', lines: [] });
    el.querySelectorAll('.ln').forEach(ln => {
      const t = ln.querySelector('.ln-t'); if (!t) return; const c = t.cloneNode(true);
      c.querySelectorAll('sup').forEach(x => x.remove()); c.querySelectorAll('.gapb,.gap').forEach(x => x.replaceWith(document.createTextNode(' _______ ')));
      const no = ln.querySelector('.ln-no');
      M.lines.push({ num: no && no.style.visibility !== 'hidden' ? no.textContent.trim() : '', t: c.textContent.replace(/\s+/g, ' ').trim(), st: ln.classList.contains('st'), h: ln.classList.contains('mh') });
    });
  }));
  if (!quiet) renderPreview();
  return mats;
}
function presChunks(L, poem) {
  const max = poem ? 18 : 16; if (L.length <= max) return [L];
  if (poem) {
    const st = []; L.forEach((l, i) => { if (!i || l.st) st.push([]); st[st.length - 1].push(l); });
    const out = []; let cur = [];
    st.forEach(z => { if (cur.length && cur.length + z.length > max) { out.push(cur); cur = []; } for (let i = 0; i < z.length; i += max) { const part = z.slice(i, i + max); if (cur.length && cur.length + part.length > max) { out.push(cur); cur = []; } cur = cur.concat(part); } });
    if (cur.length) out.push(cur); return out;
  }
  const k = Math.ceil(L.length / max), per = Math.ceil(L.length / k); const out = [];
  for (let i = 0; i < L.length; i += per) out.push(L.slice(i, i + per));
  return out;
}
function presSlides(quiet) {
  const P = state.sheet; const off = new Set(Array.isArray(P.meta.presOff) ? P.meta.presOff : []); const multi = !!P.abs;
  const S = off.has('title') ? [] : [{ k: 'title' }];
  const G = [];
  stABs().forEach(A => withAB(A.k, () => { const m = state.sheet.meta; const lab = abLabel(m, A.k); const L = [];
    if (multi && !off.has('ab:' + A.id)) L.push({ k: 'abhead', lab, title: m.title || '', topic: m.topic || '', ab: lab });
    presSlidesAB(off, multi ? lab : '', multi ? A.id : '').forEach(x => L.push(x)); G.push({ lab, title: plainText(m.title || ''), par: multi && !!m.par, L }); }));
  // Arbeitsteilige ABs (nebeneinander, mit Haken) laufen parallel: eine Zwischenfolie, eine Aufgabenfolie mit je einer Spalte pro AB
  for (let i = 0; i < G.length;) {
    let j = i; if (G[i].par) while (j + 1 < G.length && G[j + 1].par) j++;
    if (j > i) { presParallel(G.slice(i, j + 1), off).forEach(x => S.push(x)); i = j + 1; continue; }
    G[i].L.forEach(x => S.push(x)); i++;
  }
  presPhases(S);
  if (!quiet) renderPreview();
  return S;
}
// Arbeitsteilige ABs: der n-te Aufgabenbaustein jedes ABs kommt mit den n-ten der anderen auf eine Folie (je AB eine Spalte);
// andere Folien bleiben an ihrem Platz zwischen den Aufgabenfolien
function presParallel(G, off) {
  const labs = G.map(g => g.lab).join(' · '), out = [];
  const P = G.map(g => { const segs = [[]], T = []; g.L.forEach(x => { if (x.k === 'abhead') return; if (x.k === 'tasks') { T.push(x); segs.push([]); } else segs[segs.length - 1].push(x); }); return { g, segs, T }; });
  if (G.some(g => g.L.some(x => x.k === 'abhead'))) out.push({ k: 'abhead', lab: labs, title: 'Arbeitsteilige Phase', topic: '', par: G.map(g => ({ lab: g.lab, title: g.title })), ab: labs });
  const N = Math.max(0, ...P.map(p => p.T.length));
  for (let n = 0; n <= N; n++) {
    P.forEach(p => (p.segs[n] || []).forEach(x => out.push(x)));
    if (n === N) break;
    const here = P.filter(p => p.T[n]);
    if (here.length > 1) { const cols = here.map(p => ({ g: '', name: p.g.lab, sub: p.g.title, items: p.T[n].items.map(it => ({ ...it, abl: p.g.lab })) })); const items = cols.flatMap(c => c.items); out.push({ k: 'tasks', bid: items[0].bid, items, segs: [{ t: 'cols', cols }], abpar: true }); }
    else here.forEach(p => out.push(p.T[n]));
  }
  out.forEach(x => { x.ab = labs; }); return out;
}
// Phase je Folie: Aufgaben haben ihre eigene, Zitat oder Bild vor der ersten Aufgabe gelten als Einstieg, das Tafelbild als Sicherung (wie im Verlaufsplan),
// alle anderen Folien übernehmen die Phase der nächsten Aufgabe. S.bar = Phasen der Stunde für die Leiste unten.
function presPhases(S) {
  const m = state.sheet.meta; const have = new Set();
  stBlocks().forEach(b => { if (b.type === 'tasks') (b.items || []).forEach(it => { const p = itPh(it); if (p) have.add(p); }); else if (b.type === 'step' && itPh(b)) have.add(itPh(b)); });
  const isT = s => (s.k === 'tasks' || s.k === 'step') && !s.res;
  const SB = stBlocks(); S.forEach(s => { if (s.k === 'step') s.res = isRes(s.b); else if (s.k === 'tasks') s.res = isRes(SB.find(x => x.id === s.bid)); });
  S.forEach(s => { if (s.k === 'step') s.ph = itPh(s.b); else if (s.k === 'tasks') { s.phs = [...new Set(s.items.map(x => itPh(x.it)).filter(Boolean))]; s.ph = s.phs[0] || ''; } });
  S.forEach(s => { if (s.k !== 'step' && s.k !== 'tasks' && s.b && itPh(s.b)) { s.ph = itPh(s.b); have.add(s.ph); } });
  const first = S.findIndex(isT); const autoEin = !have.has('ein'); let usedEin = false, usedSich = false;
  S.forEach((s, i) => {
    if (isT(s) || s.res || s.k === 'title' || s.ph) return;
    if ((s.k === 'quote' || s.k === 'image') && autoEin && (first < 0 || i < first)) { s.ph = 'ein'; usedEin = true; }
    else if (s.k === 'tafel') { s.ph = 'sich'; usedSich = true; }
  });
  if (usedEin) have.add('ein'); if (usedSich) have.add('sich');
  S.forEach((s, i) => {
    if (s.ph != null || s.k === 'title') return; let p = null;
    for (let j = i + 1; j < S.length && (S[j].ab || '') === (s.ab || ''); j++) if (isT(S[j])) { p = S[j].ph; break; }
    if (!p) for (let j = i - 1; j >= 0; j--) if (S[j].ph) { p = S[j].ph; break; }
    s.ph = p || '';
  });
  // Die Leiste zeigt nur Phasen, die auf einer Folie vorkommen; Phasen ohne Folie (abgewählt, „keine Folie“, leer) würden nie hervorgehoben
  // Leiste in der Reihenfolge der Folien (= Reihenfolge der Bausteine): aufeinanderfolgende gleiche Phasen bilden einen Abschnitt,
  // kehrt eine Phase später wieder, bekommt sie einen neuen Abschnitt. s.bi = Abschnitte, die auf der Folie hervorgehoben werden.
  let bar = [];
  S.forEach(s => {
    s.bi = []; if (s.k === 'title' || s.res) return;
    const L = s.phs && s.phs.length ? s.phs : s.ph ? [s.ph] : [];
    L.forEach(k => { if (bar[bar.length - 1] !== k) bar.push(k); if (!s.bi.includes(bar.length - 1)) s.bi.push(bar.length - 1); });
  });
  // Nur die letzte Sicherung bekommt einen Abschnitt; Folien früherer Sicherungen heben den Abschnitt davor hervor
  if (sichLastOn() && bar.filter(k => k === 'sich').length > 1) {
    const last = bar.lastIndexOf('sich'); const nb = [], map = [];
    bar.forEach((k, i) => { if (k === 'sich' && i !== last) { map[i] = nb.length - 1; return; } if (nb[nb.length - 1] === k) { map[i] = nb.length - 1; return; } nb.push(k); map[i] = nb.length - 1; });
    S.forEach(s => { s.bi = [...new Set((s.bi || []).map(i => map[i]).filter(i => i >= 0))]; }); bar = nb;
  }
  S.bar = m.presPhase !== false && bar.length >= 2 ? bar : [];
  return S;
}
// Alle Aufgaben eines Bausteins stehen auf einer Folie. Aufeinanderfolgende Aufgaben verschiedener Gruppen werden darin Spalten,
// die übrigen Aufgaben stehen als nummerierte Zeilen davor oder danach.
function presTaskSlide(L, bid, m) {
  const order = grpList(m).map(x => x.k); const segs = [];
  for (let i = 0; i < L.length;) {
    if (L[i].g) {
      let j = i; const run = []; while (j < L.length && L[j].g) run.push(L[j++]);
      const by = {}; run.forEach(x => (by[x.g] = by[x.g] || []).push(x));
      const keys = order.filter(k => by[k]).concat(Object.keys(by).filter(k => !order.includes(k)));
      if (keys.length > 1) { segs.push({ t: 'cols', cols: keys.map(g => ({ g, name: grpName(m, g), sub: tfStr(by[g][0].it.tag).trim() || grpAdd(m, g), items: by[g] })) }); i = j; continue; }
    }
    const last = segs[segs.length - 1]; if (last && last.t === 'rows') last.items.push(L[i]); else segs.push({ t: 'rows', items: [L[i]] }); i++;
  }
  return { k: 'tasks', bid, items: L, segs };
}
// Bausteine, die nur Aufgaben je einer anderen Gruppe enthalten (z. B. über ⋯ zugeordnet), laufen parallel und kommen auf eine Folie
function presMerge(S, m) {
  const R = [];
  S.forEach(s => {
    const prev = R[R.length - 1];
    if (s.k === 'tasks' && prev && prev.k === 'tasks' && s.items.every(x => x.g) && prev.items.every(x => x.g) && !s.items.some(x => prev.items.some(y => y.g === x.g))) { R[R.length - 1] = presTaskSlide(prev.items.concat(s.items), prev.bid, m); return; }
    R.push(s);
  });
  return R;
}
const PRES_OPT = new Set(['material', 'tafel', 'info', 'quote', 'image', 'table', 'phrases', 'match']);
const presOn = b => b.pres === true;
const presBtn = b => PRES_OPT.has(b.type) ? `<button type="button" class="pres-tg${presOn(b) ? ' on' : ''}" data-act="pres-tg" aria-pressed="${presOn(b)}" title="${presOn(b) ? 'Steht in der Präsentation auf einer eigenen Folie · klicken zum Entfernen' : 'Steht nicht in der Präsentation · klicken, um ihn auf eine Folie zu bringen'}"><svg viewBox="0 0 20 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="1.5" width="17" height="10" rx="1.2"/><path d="M10 11.5v3M7 14.5h6"/>${presOn(b) ? '<path d="m7 6.5 2 2 4-4"/>' : ''}</svg><span>${presOn(b) ? 'Auf der Folie' : 'Auf die Folie'}</span></button>` : '';
function presSlidesAB(off, lab, abId) {
  const sh = state.sheet, m = sh.meta; const v = { ...sheetView(), lehrer: false, grp: 'all', pres: true };
  const mats = presCollect(true); const S = []; let t = 0;
  sh.blocks.forEach(b => {
    if (!blockVisible(b, v)) return;
    if (b.type === 'tasks') { if (rst(b)) t = 0; const its = itemsFor(b, v); const idx = b.items.map((it, i) => (itOk(it, v) ? i : -1)).filter(i => i >= 0); const L = []; its.forEach((it, k) => { const fo = itFo(it); if (!fo) t++; if (tfStr(it.text).trim() && !off.has(b.id + ':' + idx[k])) L.push({ no: fo ? 0 : t, fo, it, g: itGrp(b, it, m), bid: b.id, bmin: itMin(b), btimer: b.timer || '' }); }); if (L.length) S.push(presTaskSlide(L, b.id, m)); return; }
    if (off.has(b.id)) return;
    if (PRES_OPT.has(b.type) && !presOn(b)) return;
    if (b.type === 'step') { const f = stepSlideFol(b) || (PP.edit && b.pp && stepFol(b) !== 'aus' ? 'text' : ''); if (f === 'quiz') { const Q = qzList(b); Q.forEach((x, i) => S.push({ k: 'step', b, fol: f, qz: x, qi: i, qn: Q.length })); } else if (f) S.push({ k: 'step', b, fol: f }); return; }
    const M = mats[b.id];
    if (M && M.lines.length) { const poem = b.form === 'gedicht'; const parts = presChunks(M.lines, poem); parts.forEach((p, i) => S.push({ k: 'mat', b, tag: M.tag || 'M', lines: p, part: i + 1, of: parts.length, poem })); return; }
    if (b.type === 'tafel') { tfNorm(b); if (tfHas(b, tfTpl(b))) S.push({ k: 'tafel', b }); return; }
    if (b.type === 'info' && (plainText(b.text || '').trim() || tfStr(b.title).trim())) S.push({ k: 'info', b });
    else if (b.type === 'quote' && plainText(b.text || '').trim()) S.push({ k: 'quote', b });
    else if (b.type === 'image' && b.src) S.push({ k: 'image', b });
    else if (b.type === 'table' && Array.isArray(b.cols) && b.cols.length) S.push({ k: 'table', b });
    else if (b.type === 'phrases' && phrGroups(b).length) S.push({ k: 'phr', b });
    else if (b.type === 'match') { const ML = mtLayout(b); if (ML.left.length || ML.right.length) S.push({ k: 'match', b, M: ML }); }
  });
  const R = m.groupsOn ? presMerge(S, m) : S;
  const qk = abId ? 'qr:' + abId : 'qr';
  if (m.dg && m.dg.id && !off.has(qk)) R.push({ k: 'qr', link: dgLink(m.dg.id) });
  if (lab) R.forEach(x => { x.ab = lab; });
  return R;
}
// Auswahlliste für „Ausgeben → PowerPoint“: eine Zeile je Baustein bzw. je Aufgabe
function presPick() {
  const P = state.sheet; const multi = !!P.abs; const L = [{ key: 'title', label: 'Titelfolie' }];
  const short = (x, n) => { const p = plainText(x || '').replace(/\s+/g, ' ').trim(); return p.length > n ? p.slice(0, n - 1).replace(/\s+\S*$/, '') + ' …' : p; };
  stABs().forEach(A => {
    const m = A.meta; const num = numbering({ ...P, meta: m, blocks: A.blocks }); let t = 0;
    if (multi) L.push({ key: 'ab:' + A.id, label: `${abLabel(m, A.k)} · ${short(m.title, 50) || 'ohne Titel'} (Zwischenfolie)`, head: true });
    A.blocks.forEach(b => {
      if (b.type === 'material') { const z = num[b.id] || {}; L.push({ key: b.id, opt: b, label: `${z.tag || 'M' + (z.m || '')} · ${short(b.title, 60) || (b.post ? 'Post' : 'ohne Titel')}` }); }
      else if (b.type === 'tasks') { if (rst(b)) t = 0; b.items.forEach((it, i) => { if (!itFo(it)) t++; const g = itGrp(b, it, P.meta); if (tfStr(it.text).trim()) L.push({ key: b.id + ':' + i, label: `${itPh(it) === 'ha' ? 'Hausaufgabe' : itFo(it) ? 'Auftrag (nur Folie)' : 'Aufgabe ' + t}${g ? ' · ' + grpName(P.meta, g) : ''} · ${short(it.text, 64)}`, task: true }); }); }
      else if (b.type === 'tafel') L.push({ key: b.id, opt: b, label: 'Tafelbild · ' + (tfStrip(b.title || '').trim() || TF_TPL[tfTpl(b)].label) });
      else if (b.type === 'step') { if (stepSlideFol(b)) L.push({ key: b.id, label: `${itPh(b) ? PHASEN[itPh(b)].label : 'Schritt'} · ${stepLabel(b)}`, task: true }); }
      else if (b.type === 'info') L.push({ key: b.id, opt: b, label: (b.kind || 'Info') + (b.title ? ' · ' + short(b.title, 50) : '') });
      else if (b.type === 'quote') L.push({ key: b.id, opt: b, label: 'Zitat · ' + short(b.text, 50) });
      else if (b.type === 'image' && b.src) L.push({ key: b.id, opt: b, label: 'Bild' + (b.caption ? ' · ' + short(b.caption, 50) : '') });
      else if (b.type === 'table') L.push({ key: b.id, opt: b, label: 'Tabelle' + (b.title ? ' · ' + short(b.title, 50) : '') });
      else if (b.type === 'phrases') L.push({ key: b.id, opt: b, label: short(b.title || 'Formulierungshilfen', 60) });
      else if (b.type === 'match') L.push({ key: b.id, opt: b, label: (b.sort ? 'Sortieren' : 'Zuordnen') + (b.title ? ' · ' + short(b.title, 50) : '') });
    });
    if (m.dg && m.dg.id) L.push({ key: multi ? 'qr:' + A.id : 'qr', label: 'QR-Code zur digitalen Fassung' });
  });
  return L;
}
function presPickHTML() {
  const L = presPick(); const off = new Set(state.sheet.meta.presOff || []); const isOn = x => (x.opt ? presOn(x.opt) && !off.has(x.key) : !off.has(x.key)); const on = L.filter(isOn).length;
  return `<div class="f pr-pick-f"><span>Folien <small id="pr-pick-n">${on} von ${L.length} ausgewählt</small></span>
    <small class="hint">Titelfolie, Aufgaben und Unterrichtsschritte stehen von selbst auf den Folien. Material, Tafelbild, Bilder, Zitate und andere Bausteine kommen nur auf eine Folie, wenn du sie hier oder mit „Auf die Folie“ an der Karte auswählen.</small>
    <div class="pr-pick">${L.map(x => `<label class="chk${x.task ? ' pk-sub' : ''}${x.head ? ' pk-head' : ''}${x.opt ? ' pk-opt' : ''}"><input type="checkbox" data-prk="${esc(x.key)}"${x.opt ? ` data-prb="${esc(x.opt.id)}"` : ''}${isOn(x) ? ' checked' : ''}><span>${esc(x.label)}</span></label>`).join('')}</div>
    <div class="pr-pick-a"><button class="link" type="button" data-act="pr-pick" data-v="all">Alle</button><button class="link" type="button" data-act="pr-pick" data-v="tasks">Nur Aufgaben</button><button class="link" type="button" data-act="pr-pick" data-v="none">Keine</button></div>
    <small class="hint pr-ph-note">Phasenleiste: ${state.sheet.meta.presPhase === false ? 'aus' : 'an, Schrift ' + (PH_SIZES[state.sheet.meta.presPhSize] || PH_SIZES.m).label} · ändern unter <button class="link" type="button" data-act="settings" data-tab="pres">Einstellungen</button></small>
    <small class="hint">Die Auswahl wird im Blatt gespeichert und gilt auch für „Präsentieren“.</small></div>`;
}
function phSizeSet(v) {
  if (!PH_SIZES[v]) return; state.sheet.meta.presPhSize = v;
  document.querySelectorAll('[data-act="ph-size"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v))); changed(false);
}
function presPickSet(v) {
  const m = state.sheet.meta; const L = presPick();
  L.forEach(x => { if (x.opt) { if (v === 'all') x.opt.pres = true; else delete x.opt.pres; } });
  m.presOff = v === 'all' ? [] : v === 'none' ? L.filter(x => !x.opt).map(x => x.key) : L.filter(x => !x.task && !x.opt && x.key !== 'title').map(x => x.key);
  changed(false); if (state.dlg) renderDlg(); if (state.area === 'pres') renderEditor();
}

