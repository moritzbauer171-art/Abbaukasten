/* ---------- Verlauf: Rückgängig und Wiederholen für das ganze Blatt ---------- */
// Tippen wird zu einem Schritt zusammengefasst (kurze Pause), Bausteinänderungen sind sofort ein eigener Schritt.
const hist = { past: [], future: [], last: null, timer: null, id: null };
const histSig = sh => JSON.stringify({ ...sh, updatedAt: 0 });
function histReset() { clearTimeout(hist.timer); hist.timer = null; hist.past = []; hist.future = []; hist.last = state.sheet ? histSig(state.sheet) : null; hist.id = state.sheet && state.sheet.id; histUI(); }
function histCommit() {
  clearTimeout(hist.timer); hist.timer = null;
  if (!state.sheet) return; if (hist.id !== state.sheet.id) { histReset(); return; }
  const cur = histSig(state.sheet); if (cur === hist.last) return;
  hist.past.push(hist.last); const lim = cur.length > 1500000 ? 12 : 60; while (hist.past.length > lim) hist.past.shift();
  hist.future = []; hist.last = cur; histUI();
}
function histNote(structural) { if (structural) histCommit(); else { clearTimeout(hist.timer); hist.timer = setTimeout(histCommit, 700); } }
function histApply() {
  const sh = JSON.parse(hist.last); sh.updatedAt = Date.now(); state.sheet = sh;
  if (state.sel && state.sel !== 'meta' && state.sel !== 'seite' && !sh.blocks.some(b => b.id === state.sel)) state.sel = null;
  state.touched = true; closeGloss(); closeZl(); closeMenu();
  renderEditor(); renderTabs(); scheduleRender(30); scheduleSave(); histUI();
}
function histUndo() { if (hist.timer) histCommit(); if (!hist.past.length) { toast('Es gibt nichts mehr rückgängig zu machen.'); return; } hist.future.push(hist.last); hist.last = hist.past.pop(); histApply(); }
function histRedo() { if (hist.timer) histCommit(); if (!hist.future.length) return; hist.past.push(hist.last); hist.last = hist.future.pop(); histApply(); }
function histUI() {
  document.querySelectorAll('#editor [data-act="undo"], .bar [data-act="undo"]').forEach(u => { u.disabled = !hist.past.length && !hist.timer; });
  document.querySelectorAll('#editor [data-act="redo"], .bar [data-act="redo"]').forEach(r => { r.disabled = !hist.future.length; });
}
function changed(structural) {
  if (state.sheet.example) state.sheet.example = false;
  state.touched = true; histNote(structural); if (!structural) histUI();
  if (structural) renderEditor(); else refreshSummaries();
  scheduleRender(); scheduleSave();
}
let undoSnap = null;
function snapshot() { undoSnap = clone(state.sheet); }

function onInput(e) {
  const t = e.target; const isRt = !!(t.classList && t.classList.contains('rtx'));
  if (t.dataset && t.dataset.zt != null) { const [sch, i, f] = t.dataset.zt.split('|'); const L = zeitenOf(sch).map(z => ({ ...z })); if (!L[+i]) return; L[+i][f] = f === 'l' ? t.value : hmOk(t.value) || t.value; zeitenSet(sch, L); const d = t.closest('.zt-row') && t.closest('.zt-row').querySelector('.zt-d'); if (d) { const n = hm(L[+i].e) - hm(L[+i].s); d.textContent = n > 0 ? n + ' Min.' : ''; } return; }
  if (t.dataset && t.dataset.bkq != null) { state.bkQ = t.value; const l = $('#bk-list'); if (l) l.innerHTML = bkList(); return; }
  if (t.dataset && t.dataset.sf != null) { state.sheet.meta.frage = t.value; changed(false); return; }
  if (t.dataset && t.dataset.rkh != null) { state.sheet.meta.rkHead = t.value; changed(false); return; }
  if (t.dataset && t.dataset.st === 'title') { if (!state.sheet.stunde) state.sheet.stunde = {}; state.sheet.stunde.title = t.value; changed(false); return; }
  if (t.dataset && t.dataset.rlpq != null) { state.rlpQ = t.value; rlpFilter(t.closest('.rlp-f')); return; }
  if (isRt && rtAuto(e, t)) return;
  const k = t.dataset.k; if (!k) return;
  if (t.type === 'checkbox' || t.tagName === 'SELECT' || t.type === 'file') return;
  const card = t.closest('[data-bid]'); if (!card) return;
  let v = isRt ? rtSerialize(t).raw : t.value; if (isRt) t.classList.toggle('is-empty', !v.trim());
  if (t.type === 'number') { if (/^rowH\.\d+$/.test(k) && !String(t.value).trim()) v = ''; else { const lo = Number(t.min) || 1, hi = Number(t.max) || 40; v = Math.max(lo, Math.min(hi, parseInt(v, 10) || lo)); } }
  setPath(target(card.dataset.bid), k, v);
  const m = k.match(/^items\.(\d+)\.text$/);
  if (m) { const c = card.querySelector(`[data-chips="${m[1]}"]`); if (c) c.innerHTML = chipsHTML(v); }
  if (k === 'text') { const blk = target(card.dataset.bid); const box = card.querySelector('[data-gl]'); if (blk && blk.type === 'material' && box) box.outerHTML = glossRows(blk); const rd = card.querySelector('[data-rd]'); if (blk && blk.type === 'material' && rd) { clearTimeout(rd._t); const fresh = readEditor(blk); if (fresh) rd.outerHTML = fresh; } }
  const gn = document.querySelector(`#editor [data-gn="${card.dataset.bid}"]`); if (gn) gn.outerHTML = gNote(card.dataset.bid);
  const mc = k.match(/^cats\.(\d+)\.t$/); if (mc) { const blk = target(card.dataset.bid); const c = blk && blk.cats && blk.cats[+mc[1]]; if (c) card.querySelectorAll(`select option[value="${c.id}"]`).forEach(o => { o.textContent = `${+mc[1] + 1} · ${plainText(v).trim() || 'Oberbegriff ' + (+mc[1] + 1)}`; }); }
  const kw = k.match(/^cards\.(\d+)\.(points|term)$/); if (kw) { const box = document.querySelector(`#editor [data-kw="${kw[1]}"]`); if (box) box.innerHTML = kkWarn(state.sheet.cards[+kw[1]], kkOf(state.sheet.meta), +kw[1]); }
  if (k === 'url') { const qw = card.querySelector('[data-qrw]'); if (qw) qw.innerHTML = qrWarn(target(card.dataset.bid)); }
  changed(false);
}
function onChange(e) {
  const t = e.target; if (hist.timer) histCommit();
  if (presPickChange(t)) return;
  if (t.dataset.uhr != null) { state.prefs.uhr = !!t.checked; savePrefs(); return; }
  if (t.dataset.pref) { state.prefs[t.dataset.pref] = !!t.checked; savePrefs(); scheduleRender(); return; }
  if (t.dataset.fmtsel) { const c = t.closest('[data-bid]'); const bb = c && target(c.dataset.bid); if (bb) { snapshot(); bb.fmt = { ...(bb.fmt || {}), [t.dataset.fmtsel]: t.value }; changed(true); } return; }
  if (t.dataset.phall != null) { const c = t.closest('[data-bid]'); const bb = c && target(c.dataset.bid); if (bb && t.value !== '__mix') { snapshot(); (bb.items || []).forEach(it => { if (t.value) it.ph = t.value; else delete it.ph; }); changed(true); } return; }
  if (t.dataset.k === 'vp.slot') { const vp = vpOf(); const z = zeitenOf(state.sheet.meta.school).find(x => x.id === t.value); if (z) { vp.slot = z.id; vp.start = z.s; const d = hm(z.e) - hm(z.s); if (d > 0) state.sheet.meta.lesson = String(d); } else delete vp.slot; timeSync(null); changed(true); return; }
  if (t.dataset.k === 'lesson' || t.dataset.k === 'vp.start') delete vpOf().slot;
  if (t.dataset.act === 'op') {
    const card = t.closest('[data-bid]'); const b = target(card.dataset.bid); const i = +t.dataset.i;
    const o = curOps().find(x => x.op === t.value); if (!o) return;
    const it = b.items[i];
    it.text = applyOperator(it.text, o, state.sheet.meta.anrede);
    changed(true);
    const ta = $(`#editor [data-bid="${b.id}"] [data-k="items.${i}.text"]`);
    if (ta && ta.classList.contains('rtx')) { ta.focus(); if (!rtSelectText(ta, '…')) rtCaretEnd(ta); }
    else if (ta) { ta.focus(); const p = ta.value.indexOf('…'); if (p >= 0) ta.setSelectionRange(p, p + 1); }
    return;
  }
  if (t.dataset.act === 'phr-set') {
    const card = t.closest('[data-bid]'); const b = card && target(card.dataset.bid); const set = phraseSets()[+t.value]; if (!b || !set || t.value === '') return;
    const gs = Array.isArray(b.groups) ? b.groups : (b.groups = []); const g = { head: set.head, text: set.lines.join('\n') };
    if (gs.length === 1 && !String(gs[0].head || '').trim() && !String(gs[0].text || '').trim()) gs[0] = g; else gs.push(g);
    changed(true); toast(`Vorlage „${set.head}“ eingefügt`); return;
  }
  if (t.dataset.act === 'fp-add') { const card = t.closest('[data-bid]'); const b = card && target(card.dataset.bid); if (b && t.files && t.files.length) { const fs = [...t.files]; t.value = ''; (async () => { for (const f of fs) { const o = { id: uid(), n: 1, cap: '' }; b.photos.push(o); await handleImage(f, o); if (!o.src) b.photos.splice(b.photos.indexOf(o), 1); } renderEditor(); changed(true); })(); } return; }
  if (t.dataset.act === 'img') { const card = t.closest('[data-bid]'); if (t.files && t.files[0]) handleImage(t.files[0], target(card.dataset.bid)); return; }
  const k = t.dataset.k; if (!k) return;
  const card = t.closest('[data-bid]'); if (!card) return;
  if (k === 'klasse') { moveKlasse(t.value); return; }
  let v = t.type === 'checkbox' ? t.checked : t.value;
  if (k === 'width' || k === 'lineStep') v = Number(v);
  if (/^items\.\d+\.min$/.test(k) || k === 'min') { const n = parseInt(String(v).replace(/\D/g, ''), 10); v = n > 0 ? String(Math.min(n, 999)) : ''; t.value = v; }
  if (k === 'vp.start') { setPath(target(card.dataset.bid), k, v); timeSync(null); changed(true); return; }
  if (k === 'until') { v = hmOk(v); if (!v) { const bb = target(card.dataset.bid); if (bb) { delete bb.until; delete bb.untilAuto; delete bb.minAuto; } changed(true); return; } }
  setPath(target(card.dataset.bid), k, v); linRemember(target(card.dataset.bid), k);
  if (k === 'until' || k === 'min') { const bb = target(card.dataset.bid); if (bb && (bb.type === 'tasks' || bb.type === 'step')) { const ok = timeSync(bb, k); if (!ok && k === 'until') toast('Für die Dauer aus der Uhrzeit braucht die Stunde einen Beginn (Bereich „Stunde“).'); } changed(true); return; }
  if (/^words\.\d+\.c$/.test(k)) { const r = t.closest('.mt-ed-w'); if (r) r.classList.toggle('dist', !v); }
  if (k === 'groupsOn' && !v) state.grp = 'all';
  if (/^items\.\d+\.grp$/.test(k) && !v) { const it = target(card.dataset.bid).items[+k.split('.')[1]]; if (it) delete it.grp; }
  if (k === 'levelsOn' && !v) state.lvl = 'all';
  if (k === 'wahl' && v) { const bb = target(card.dataset.bid); const C = (bb.items || []).filter(x => itCnt0(x)); if (!C.some(x => x.wl)) C.forEach((x, i) => { x.wl = ['b', 's', 'e'][Math.min(i, 2)]; }); }
  changed((t.type === 'checkbox' && (k === 'restart' || k === 'par' || k === 'wahl' || k === 'rowEach' || k === 'lineNumbers' || k.startsWith('fmt.') || k === 'groupsOn' || k === 'gapBank' || k === 'post.fiktiv' || k === 'levelsOn' || k === 'lvTip' || k === 'showName' || k === 'showDate')) || k === 'anrede' || k === 'lesson' || k === 'taskRef' || k === 'yt' || k === 'ytS' || k === 'ytE' || /^items\.\d+\.(ph|min|grp)$/.test(k) || ((k === 'ph' || k === 'soz' || k === 'exit' || k === 'min') && target(card.dataset.bid) && (target(card.dataset.bid).type === 'step' || (k === 'min' && target(card.dataset.bid).type === 'tasks'))));
}
/* Karten ziehen: an der Kopfzeile greifen, zwischen andere Karten fallen lassen */
let edDrag = null;
function edClearDrop() { document.querySelectorAll('#editor .drop-before,#editor .drop-after').forEach(n => n.classList.remove('drop-before', 'drop-after')); }
function edTarget(e) {
  if (!edDrag) return null;
  const c = e.target.closest && e.target.closest('#editor .card[data-bid]');
  if (c && c.dataset.bid !== 'meta' && c.dataset.bid !== 'seite') {
    if (c.dataset.bid === edDrag) return null;
    const r = c.getBoundingClientRect(); const before = e.clientY < r.top + Math.min(r.height / 2, 60);
    return { el: c, cls: before ? 'drop-before' : 'drop-after', ref: c.dataset.bid, before };
  }
  const ad = e.target.closest && e.target.closest('#editor .adder'); if (ad) { const last = state.sheet.blocks[state.sheet.blocks.length - 1]; if (last && last.id !== edDrag) { const el = $(`#editor .card[data-bid="${last.id}"]`); return el ? { el, cls: 'drop-after', ref: last.id, before: false } : null; } }
  const top = e.target.closest && e.target.closest('#editor .card[data-bid="seite"],#editor .card[data-bid="meta"]'); if (top) { const first = state.sheet.blocks[0]; if (first && first.id !== edDrag) { const el = $(`#editor .card[data-bid="${first.id}"]`); return el ? { el, cls: 'drop-before', ref: first.id, before: true } : null; } }
  return null;
}
function edDrop(id, ref, before) {
  const bl = state.sheet.blocks; const i = bl.findIndex(b => b.id === id); if (i < 0) return;
  if (hist.timer) histCommit();
  const [b] = bl.splice(i, 1); let j = bl.findIndex(x => x.id === ref); if (j < 0) j = bl.length; else if (!before) j++;
  bl.splice(j, 0, b); state.sel = id; changed(true);
}
function onClick(e) {
  const a = e.target.closest('[data-act]'); if (!a || a.disabled) return;
  if (hist.timer && !/^(toggle|undo|redo|ins-open|ins-close|sub-toggle|fmt-toggle)$/.test(a.dataset.act)) histCommit();
  const act = a.dataset.act; if (act.startsWith('abx-')) { abAct(act, a); return; }
  if (act.startsWith('pp-')) { ppAct(act, a); return; }
  if (act === 'bk-open') { bkOpen(); return; }
  if (act === 'ol-go') { olGo(a.dataset.ob); return; }
  if (act === 'bk-close') { state.insAt = null; bkClose(); return; }
  if (a.dataset.bkArea) { state.bkOpen = false; state.bkQ = ''; const ar = a.dataset.bkArea; if (ar !== (state.area || 'blatt')) { state.area = ar; state.out = areaOutFor(ar); if (ar === 'extras' && a.dataset.act === 'st-new') state.out = 'exit'; } }
  const card = a.closest('[data-bid]'); const bid = card && card.dataset.bid;
  const blocks = state.sheet.blocks; const idx = blocks.findIndex(b => b.id === bid); const b = blocks[idx];
  switch (act) {
    case 'area-set': setArea(a.dataset.v); return;
    case 'settings': openSettings(a.dataset.tab); return;
    case 'pr-trans': if (PR_VT[a.dataset.v] && ADM.is) { state.prefs.trans = a.dataset.v; savePrefs(); renderEditor(); } return;
    case 'tm-show': if (TM_SHOW[a.dataset.v]) { state.prefs.tmShow = a.dataset.v; savePrefs(); renderEditor(); } return;
    case 'tm-size': if (TM_SIZES[a.dataset.v]) { state.prefs.tmSize = a.dataset.v; savePrefs(); tmApply(); renderEditor(); } return;
    case 'sich-fill': if (!sichFill()) toast('Nach jeder Erarbeitung, Vertiefung und jedem Transfer folgt schon eine Sicherung. (Gezählt werden Bausteine mit eingetragener Phase.)'); return;
    case 'zt-add': { const sch = a.dataset.sch; zeitenSet(sch, [...zeitenOf(sch), { id: 'z' + uid(), l: '', s: '', e: '' }]); renderEditor(); const r = [...document.querySelectorAll('#editor .zt-row input[data-zt$="|l"]')].filter(x => x.dataset.zt.startsWith(sch + '|')).pop(); if (r) r.focus(); return; }
    case 'zt-del': { const sch = a.dataset.sch; zeitenSet(sch, zeitenOf(sch).filter((_, i) => i !== +a.dataset.i)); renderEditor(); return; }
    case 'settings-back': setArea(isBasis() ? 'blatt' : state.prevArea && state.prevArea !== 'einst' ? state.prevArea : 'blatt'); return;
    case 'set-tab': state.setTab = a.dataset.v; renderEditor(); return;
    case 'umfang': setUmfang(a.dataset.v); return;
    case 'home-pref': homeModeSet(a.dataset.v); renderEditor(); return;
    case 'theme-set': try { localStorage.setItem(LS_THEME, JSON.stringify(a.dataset.v)); } catch {} themeApply(); renderEditor(); renderPreview(); return;
    case 'area-more': state.areaMore = !state.areaMore; renderEditor(); return;
    case 'zw-ins': state.zwAt = +a.dataset.at; renderEditor(); return;
    case 'zw-close': state.zwAt = null; renderEditor(); return;
    case 'zw-add': zwNew(a.dataset.k, a.dataset.at); return;
    case 'zw-open': state.zwOpen = state.zwOpen === b.id ? null : b.id; renderEditor(); return;
    case 'start-pref': lsSet(LS_START, String(lsGet(LS_START)) === '0' ? '1' : '0'); renderEditor(); return;
    case 'login': openDlg('login'); return;
    case 'help': state.dlg = { mode: 'help' }; renderDlg(); return;
    case 'rlp-view': rlpOpen(); return;
    case 'out-open': openOut(); return;
    case 'sv-ab': { const k = +a.dataset.abk; if (state.sheet.abs && k !== state.sheet.abActive) { abSwitch(k); state.sel = null; state.closed = defaultClosed(); state.taskOpen = new Set(); } setArea('blatt'); return; }
    case 'pres-tg': if (b && PRES_OPT.has(b.type)) { if (presOn(b)) delete b.pres; else b.pres = true; const off = new Set(state.sheet.meta.presOff || []); off.delete(b.id); state.sheet.meta.presOff = [...off]; changed(true); toast(presOn(b) ? `„${plainText(summary(b, numbering(state.sheet)) || typeLabel(b)).slice(0, 40)}“ steht jetzt auf einer Folie` : 'Nicht mehr auf den Folien'); } return;
    case 'more': { const k = 'more:' + a.dataset.key; if (state.fmtOpen.has(k)) state.fmtOpen.delete(k); else state.fmtOpen.add(k); renderEditor(); return; }
    case 'more-all': lsSet(LS_MORE, moreAll() ? '0' : '1'); renderEditor(); return;
    case 'area-go': areaGo(a.dataset.area, a.dataset.bid, a.dataset.abk != null ? +a.dataset.abk : NaN); return;
    case 'st-new': stepNew(a.dataset.v); return;
    case 'a4-new': case 'tpl-new': { const nb = paletteBlock('a3', 'a3'); nb.tpl = A3_TPL[a.dataset.v] ? a.dataset.v : 'karten'; a3Norm(nb); snapshot(); state.sheet.blocks.push(nb); state.sel = nb.id; if (oneCard()) state.closed = new Set(cardIds().filter(i => i !== nb.id)); else state.closed.delete(nb.id);
      if (state.area !== 'extras') state.area = 'extras'; state.out = a3Fmt(nb); state.areaOut.extras = state.out; changed(true); renderPreview();
      const nc = $(`#editor [data-bid="${nb.id}"]`); if (nc) nc.scrollIntoView({ block: 'start', behavior: 'smooth' }); return; }
    case 'xs-show': if (state.out !== a.dataset.v) setOut(a.dataset.v); return;
    case 'pres-go': openPres(0); return;
    case 'fotos': fotoManager(); return;
    case 'pres-mode': setPresMode(a.dataset.v); renderEditor(); return;
    case 'pres-pptx': exportPPTX(); return;
    case 'vp-docx-ed': exportVP(); return;
    case 'pr-pick': presPickSet(a.dataset.v); return;
    case 'ph-size': phSizeSet(a.dataset.v); return;
    case 'toggle': {
      if (e.target.closest('.ib')) return;
      const opening = state.closed.has(bid);
      if (opening && !state.allOpen && oneCard()) state.closed = new Set(cardIds().filter(x => x !== bid));
      else if (opening) state.closed.delete(bid); else state.closed.add(bid);
      state.sel = bid; saveClosed();
      document.querySelectorAll('#editor .card[data-bid]').forEach(c => { const zu = state.closed.has(c.dataset.bid); c.classList.toggle('closed', zu); const ch = c.querySelector('.chev'); if (ch) { ch.setAttribute('aria-expanded', String(!zu)); ch.title = zu ? 'Aufklappen' : 'Zuklappen'; } });
      document.querySelectorAll('#editor .card.sel').forEach(c => c.classList.remove('sel')); card.classList.add('sel'); markSel(); olSync();
      if (opening) { const r = card.getBoundingClientRect(), er = $('#editor').getBoundingClientRect(); if (r.top < er.top || r.top > er.top + er.height * .6) card.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
      if (opening && state.area === 'extras' && b) { const f = b.type === 'a3' ? a3Fmt(b) : 'exit'; if (state.out !== f) { state.out = f; state.areaOut.extras = f; renderOut(); clearTimeout(renderTimer); renderPreview(); document.querySelectorAll('#editor .xs').forEach(x => { const on = x.classList.contains('xs-' + f); x.classList.toggle('on', on); const e = x.querySelector('.xs-eye'); if (e) e.textContent = on ? 'in der Vorschau' : 'Vorschau ›'; }); } }
      return;
    }
    case 'up': case 'down': { const j = act === 'up' ? idx - 1 : idx + 1; if (j < 0 || j >= blocks.length) return; [blocks[idx], blocks[j]] = [blocks[j], blocks[idx]]; state.sel = bid; changed(true); return; }
    case 'dup': { const c = clone(b); c.id = 'b' + uid(); zlCloneFor(b.id, c.id); blocks.splice(idx + 1, 0, c); state.sel = c.id; openOnly(c.id); changed(true); return; }
    case 'del': { snapshot(); blocks.splice(idx, 1); state.sel = null; changed(true); toast(`${typeLabel(b)} gelöscht`, 'Rückgängig', histUndo); return; }
    case 'ins-open': state.insAt = +a.dataset.at; renderEditor(); { const p = $('#editor .ins-pal'); if (p) p.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } return;
    case 'ins-close': state.insAt = null; renderEditor(); return;
    case 'ins-add': {
      const nb = paletteBlock(a.dataset.pk, a.dataset.type); const at = Math.max(0, Math.min(blocks.length, +a.dataset.at));
      blocks.splice(at, 0, nb); state.sel = nb.id; state.insAt = null; openOnly(nb.id); changed(true);
      const nc = $(`#editor [data-bid="${nb.id}"]`); if (nc) { nc.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); const f = nc.querySelector('input[type=text],textarea,.rtx'); if (f) f.focus({ preventScroll: true }); }
      return;
    }
    case 'add': {
      const nb = paletteBlock(a.dataset.pk, a.dataset.type);
      if (state.insAt != null) { const at = Math.max(0, Math.min(blocks.length, state.insAt)); state.insAt = null; blocks.splice(at, 0, nb); state.sel = nb.id; openOnly(nb.id); changed(true); const nc = $(`#editor [data-bid="${nb.id}"]`); if (nc) { nc.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); const f = nc.querySelector('input[type=text],textarea,.rtx'); if (f) f.focus({ preventScroll: true }); } return; }
      const A = state.area || 'blatt'; const si = state.sel && state.sel !== 'meta' ? blocks.findIndex(x => x.id === state.sel) : -1;
      let at = si >= 0 && inArea(blocks[si], A) ? si + 1 : -1;
      if (at < 0) { let li = -1; blocks.forEach((x, j) => { if (inArea(x, A) || (A === 'blatt' && x.type === 'pagebreak')) li = j; });
        if (li >= 0) at = li + 1;
        else if (A === 'tafel') { let lt = -1; blocks.forEach((x, j) => { if (x.type === 'tasks') lt = j; }); at = lt >= 0 ? lt + 1 : blocks.length; }
        else if (A === 'blatt') { at = 0; while (at < blocks.length && blocks[at].type === 'step') at++; }
        else at = blocks.length; }
      blocks.splice(at > 0 ? at : blocks.length, 0, nb); state.sel = nb.id; openOnly(nb.id); changed(true);
      const nc = $(`#editor [data-bid="${nb.id}"]`); if (nc) { nc.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); const f = nc.querySelector('input[type=text],textarea,.rtx'); if (f) f.focus({ preventScroll: true }); }
      return;
    }
    case 'task-add': b.items.push({ text: '', tag: '' }); changed(true); { const f = $(`#editor [data-bid="${bid}"] [data-k="items.${b.items.length - 1}.text"]`); if (f) f.focus(); } return;
    case 'task-del': { const i = +a.dataset.i; snapshot(); b.items.splice(i, 1); changed(true); toast('Aufgabe entfernt', 'Rückgängig', histUndo); return; }
    case 'task-up': { const i = +a.dataset.i; if (i > 0) { [b.items[i - 1], b.items[i]] = [b.items[i], b.items[i - 1]]; changed(true); } return; }
    case 'it-rk': { const it = (b.items || [])[+a.dataset.i]; if (!it) return; snapshot(); if (it.rk) delete it.rk; else it.rk = true; if (rkStyle(state.sheet.meta) === 'abschnitt') rkSort(b); changed(true); renderEditor(); return; }
    case 'rk-style': snapshot(); if (a.dataset.v === 'abschnitt') { state.sheet.meta.rkStyle = 'abschnitt'; state.sheet.blocks.forEach(rkSort); } else delete state.sheet.meta.rkStyle; changed(true); renderEditor(); return;
    case 'chat-dev': b.opt = b.opt || {}; if (a.dataset.v) b.opt.dev = a.dataset.v; else delete b.opt.dev; changed(true); renderEditor(); return;
    case 'chat-st': b.style = a.dataset.v; changed(true); renderEditor(); return;
    case 'chat-p': { const m = (b.msgs || [])[+a.dataset.i]; if (!m) return; m.p = +a.dataset.v; changed(true); renderEditor(); return; }
    case 'chat-add': case 'chat-sys': { snapshot(); const M = b.msgs || (b.msgs = []); const P = chatPeople(b); const lastP = [...M].reverse().find(m => !m.sys);
      if (act === 'chat-sys') M.push({ sys: true, t: '' }); else { const np = lastP ? ((+lastP.p || 0) + 1) % P.length : 1; const z = lastP && /^\d{1,2}:\d{2}$/.test(lastP.z || '') ? (() => { const [h, mi] = lastP.z.split(':').map(Number); const t = h * 60 + mi + 1; return String(Math.floor(t / 60) % 24).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); })() : ''; M.push({ p: np, t: '', z }); }
      changed(true); renderEditor(); setTimeout(() => { const f = $(`#editor [data-bid="${bid}"] [data-k="msgs.${M.length - 1}.t"]`); if (f) f.focus(); }, 30); return; }
    case 'chat-del': snapshot(); b.msgs.splice(+a.dataset.i, 1); changed(true); renderEditor(); return;
    case 'chat-mv': { const i = +a.dataset.i, j = i + (+a.dataset.d); if (j < 0 || j >= b.msgs.length) return; snapshot(); [b.msgs[i], b.msgs[j]] = [b.msgs[j], b.msgs[i]]; changed(true); renderEditor(); return; }
    case 'chat-padd': snapshot(); (b.people = chatPeople(b)).push({ n: '' }); changed(true); renderEditor(); return;
    case 'chat-pdel': { const k = +a.dataset.i; snapshot(); b.people = chatPeople(b); b.people.splice(k, 1); (b.msgs || []).forEach(m => { if (m.sys) return; if (+m.p === k) m.p = 1; else if (+m.p > k) m.p = +m.p - 1; }); changed(true); renderEditor(); return; }
    case 'tbm-open': tbmOpen(bid); return;
    case 'tbx-row-ins': case 'tbx-row-mv': case 'tbx-row-del': case 'tbx-col-ins': case 'tbx-col-mv': case 'tbx-col-del': {
      snapshot(); const R = b.rows.length, C = b.cols.length, rng = n => Array.from({ length: n }, (_, i) => i);
      let ord = null, isCol = act.startsWith('tbx-col');
      const i = +(isCol ? a.dataset.ci : a.dataset.ri), N = isCol ? C : R; ord = rng(N);
      if (act.endsWith('-ins')) { if (isCol && C >= 6) return; ord.splice(i + (+a.dataset.pos ? 1 : 0), 0, -1); }
      else if (act.endsWith('-mv')) { const j = i + (+a.dataset.d); if (j < 0 || j >= N) return; [ord[i], ord[j]] = [ord[j], ord[i]]; }
      else { if (N < 2) return; ord.splice(i, 1); }
      if (isCol) tbReCols(b, ord); else tbReRows(b, ord); changed(true); return; }
    case 'tb-brush': if (!state.tbPaint) state.tbPaint = {}; state.tbPaint[bid] = a.dataset.v; renderEditor(); return;
    case 'tb-paint': case 'tb-paint-row': case 'tb-paint-col': { const br = (state.tbPaint || {})[bid] || 'gelb'; snapshot(); if (!b.bg || typeof b.bg !== 'object') b.bg = {};
      const keys = act === 'tb-paint' ? [a.dataset.c] : act === 'tb-paint-row' ? b.cols.map((_, ci) => a.dataset.ri + '.' + ci) : ['h.' + a.dataset.ci, ...b.rows.map((_, ri) => ri + '.' + a.dataset.ci)].filter(k => k[0] !== 'h' || b.cols.some(c => String(c).trim()));
      const set = act !== 'tb-paint' && keys.every(k => b.bg[k] === br) ? 'weg' : br; // ganze Zeile/Spalte nochmal: Farbe wieder weg
      keys.forEach(k => { if (set === 'weg') delete b.bg[k]; else b.bg[k] = set; }); if (!Object.keys(b.bg).length) delete b.bg; changed(true); renderEditor(); return; }
    case 'tb-bg-clear': snapshot(); delete b.bg; changed(true); renderEditor(); return;
    case 'row-add': b.rows.push(Array(b.cols.length).fill('')); changed(true); return;
    case 'row-del': if (b.rows.length > 1) { b.rows.pop(); if (Array.isArray(b.rowH)) b.rowH.length = Math.min(b.rowH.length, b.rows.length); if (Array.isArray(b.eh)) b.eh.length = Math.min(b.eh.length, b.rows.length); changed(true); } return;
    case 'col-add': if (b.cols.length < 6) { const n = b.cols.length; if (Array.isArray(b.cw) && b.cw.length === n) b.cw = [...tbWidths(b).map(x => x * n / (n + 1)), 100 / (n + 1)].map(x => Math.round(x * 10) / 10); if (Array.isArray(b.ck)) b.ck.push(false); b.cols.push(''); b.rows.forEach(r => r.push('')); changed(true); } return;
    case 'cw-reset': delete b.cw; changed(true); return;
    case 'ocr-open': openOcr(bid); return;
    case 'oph-peek': state.fmtOpen.add(`oph:${bid}:${a.dataset.i}`); renderEditor(); return;
    case 'oph-tips': { const i = +a.dataset.i; const it = b && b.items[i]; const S = it && ophFor(it); if (!S) return; const du = state.sheet.meta.anrede === 'du';
      const had = tipsOf(it).length; it.tips = S.H.tips.slice(0, 3).map(x => duSie(x, du)).concat(['', '', '']).slice(0, 3); state.fmtOpen.delete(`oph:${bid}:${i}`);
      changed(true); toast(had ? 'Tipps ersetzt' : 'Tipps eingesetzt: Sie lassen sich frei bearbeiten', 'Rückgängig', histUndo); return; }
    case 'oph-starts': { const i = +a.dataset.i; const it = b && b.items[i]; const S = it && ophFor(it); if (!S) return;
      const n = ophInsertStarts(bid, ophStarts(S.H)); if (!n) { toast('Diese Satzanfänge stehen schon im Baustein darunter.'); return; }
      changed(true); toast(`Formulierungshilfen unter die Aufgaben gesetzt (${n} ${n === 1 ? 'Gruppe' : 'Gruppen'})`, 'Rückgängig', histUndo); return; }
    case 'oph-basis': { const i = +a.dataset.i; const it = b && b.items[i]; const S = it && ophFor(it); if (!S) return;
      if (!state.sheet.meta.levelsOn) state.sheet.meta.levelsOn = true;
      const had = String(it.lvb || '').trim(); it.lvb = ophBasis(it, S.H); state.taskOpen.add(taskKey(bid, i, 'lv'));
      changed(true); toast(had ? 'Basis-Fassung ersetzt' : 'Basis-Fassung mit Schritten angelegt', 'Rückgängig', histUndo); return; }
    case 'rlp-tog': { const i = +a.dataset.i; const it = b && b.items[i]; if (!it) return; const v = a.dataset.v; const cur = rlpOf(it);
      it.rlp = cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v].sort(rlpCmp); if (!it.rlp.length) delete it.rlp;
      rlpKeep(bid, i, () => changed(true)); return; }
    case 'rlp-ph': { const i = +a.dataset.i; rlpPhaseSet(state.sheet.klasse, a.dataset.v); rlpKeep(bid, i, () => renderEditor()); const n = $(`#editor [data-bid="${bid}"] .rlp-list[data-i="${i}"]`); if (n) n.scrollTop = 0; return; }
    case 'rlp-own-add': { const i = +a.dataset.i; const it = b && b.items[i]; const inp = a.parentNode.querySelector('[data-rlpnew]');
      const ls = [...new Set(String(inp ? inp.value : '').split('\n').map(rlpClean).filter(Boolean))]; if (!ls.length) { if (inp) inp.focus(); return; }
      const fach = fachKey(state.sheet.klasse); if (!state.prefs.rlpOwn) state.prefs.rlpOwn = {}; const L = state.prefs.rlpOwn[fach] || (state.prefs.rlpOwn[fach] = []);
      ls.forEach(t => { if (!L.includes(t)) L.push(t); }); savePrefs();
      if (ls.length === 1 && it) { const id = '~' + ls[0]; const cur = rlpOf(it); if (!cur.includes(id)) it.rlp = [...cur, id]; }
      state.rlpQ = ''; rlpKeep(bid, i, () => changed(true), true);
      toast(ls.length === 1 ? 'Eigener Standard angelegt und zugeordnet' : `${ls.length} eigene Standards in deine Liste übernommen`); return; }
    case 'rlp-own-del': { const i = +a.dataset.i; const fach = fachKey(state.sheet.klasse); const L = rlpOwnList(fach); const t = a.dataset.v; const j = L.indexOf(t); if (j < 0) return;
      L.splice(j, 1); savePrefs(); rlpKeep(bid, i, () => renderEditor());
      toast('Aus deiner Liste entfernt. Zugeordnete Aufgaben behalten den Standard.', 'Rückgängig', () => { L.splice(j, 0, t); savePrefs(); renderEditor(); }); return; }
    case 'rlp-sheet': openRlpDlg('sheet'); return;
    case 'pc-size': if (b) { b.pcW = +a.dataset.w; b.pcH = +a.dataset.h; changed(true); } return;
    case 'pc-fit': if (b) { b.pcFit = a.dataset.v; changed(true); } return;
    case 'gs-set': if (b && b.type === 'gsa') { const k = a.dataset.k; b[k] = a.dataset.v; if (k === 'gk' && !Array.isArray(b.items)) b.items = [{ t: '' }]; changed(true); } return;
    case 'gs-add': if (b && b.type === 'gsa') { (b.items = b.items || []).push({ t: '', ok: true }); changed(true); const f = [...document.querySelectorAll(`#editor [data-bid="${b.id}"] .gs-it .inp`)].pop(); if (f) f.focus(); } return;
    case 'gs-del': if (b && b.type === 'gsa' && b.items && b.items.length > 1) { b.items.splice(+a.dataset.i, 1); changed(true); } return;
    case 'gs-seed': if (b && b.type === 'gsa') { b.seed = 1 + Math.floor(Math.random() * 1e6); changed(true); } return;
    case 'fp-fill': if (b && b.photos && b.photos[+a.dataset.i]) { const N = +b.fpN || 4; const used = b.photos.reduce((x, o, j) => x + (j === +a.dataset.i || !o.src ? 0 : Math.max(1, Math.round(+o.n || 1))), 0); b.photos[+a.dataset.i].n = String(Math.max(1, Math.ceil((used + 1) / N) * N - used)); changed(true); renderEditor(); } return;
    case 'pc-set': if (b) { const k = a.dataset.k; if (k === 'pcHoch' || k === 'a3Flip') b[k] = !!a.dataset.v; else b[k] = a.dataset.v; if (k === 'pcRule') b.pcLines = a.dataset.v !== 'none'; changed(true); } return;
    case 'a3-tpl': { if (!A3_TPL[a.dataset.v]) return; b.tpl = a.dataset.v; a3Norm(b); changed(true); return; }
    case 'a3-n': b.n = +a.dataset.v; changed(true); return;
    case 'a3-show': setOut(a3Fmt(b)); return;
    case 'vp-open': openVP(); return;
    case 'st-tpl': stepTpl(b, a.dataset.v, idx); return;
    case 'st-fol': if (b) { b.fol = a.dataset.v; if (b.fol === 'quiz') qzNorm(b); changed(true); } return;
    case 'qz-t': { const x = qzNorm(b)[+a.dataset.i]; if (x) { x.t = a.dataset.v === 'open' ? 'open' : 'mc'; changed(true); } return; }
    case 'qz-ok': { const x = qzNorm(b)[+a.dataset.i]; if (x) { x.ok = +a.dataset.v; changed(true); } return; }
    case 'qz-add': { const Q = qzNorm(b); const last = Q[Q.length - 1]; Q.push(qzNew(last ? last.t : 'mc')); changed(true); const f = $(`#editor [data-bid="${bid}"] [data-k="qz.${Q.length - 1}.q"]`); if (f) f.focus(); return; }
    case 'qz-del': { const Q = qzNorm(b); if (Q.length > 1) { snapshot(); Q.splice(+a.dataset.i, 1); changed(true); toast('Frage entfernt', 'Rückgängig', histUndo); } return; }
    case 'qz-up': { const Q = qzNorm(b); const i = +a.dataset.i; if (i > 0) { [Q[i - 1], Q[i]] = [Q[i], Q[i - 1]]; changed(true); } return; }
    case 'st-img-del': if (b) { b.src = ''; delete b.w; delete b.h; delete b.assetId; changed(true); } return;
    case 'st-exit-show': setOut('exit'); return;
    case 'res-tg': if (b && (b.type === 'tasks' || b.type === 'step')) { if (isRes(b)) delete b.res; else { b.res = true; delete b.until; delete b.untilAuto; delete b.minAuto; } timeSync(null); changed(true); toast(isRes(b) ? 'Als Reserve markiert: auf den Folien, nicht in der Phasenleiste und nicht in der Stundenzeit' : 'Keine Reserve mehr'); } return;
    case 'mw-big': mwBigSet(state.mwBig === a.closest('.mw-word').dataset.mw ? null : a.closest('.mw-word').dataset.mw); return;
    case 'tm-set': if (b) { b.timer = a.dataset.v || ''; if (!b.timer) delete b.timer; changed(true); } return;
    case 'grp-add': { const m = state.sheet.meta; const L = grpList(m); if (L.length >= GRP_KEYS.length) return; m.groups = L.concat([{ k: GRP_KEYS[L.length], name: '', add: '' }]); changed(true); const inp = $(`#editor [data-k="groups.${L.length}.name"]`); if (inp) inp.focus(); return; }
    case 'grp-del': grpRemove(+a.dataset.i); return;
    case 'a3-add': { a3Norm(b); const w = a.dataset.w; const lim = { sections: 6, cols: 4, aspects: 10, experts: 6, cards: 60, pairs: 60, tq: 20 }[w] || 8; const proto = { cards: { h: '', t: '' }, pairs: { f: '', r: '' }, tq: { q: '', a: '' } }[w]; if (Array.isArray(b[w]) && b[w].length < lim) b[w].push(proto ? { ...proto } : ''); changed(true); return; }
    case 'a4-grid': if (A4_GRID[a.dataset.v]) { b.grid = a.dataset.v; changed(true); } return;
    case 'a4-remix': b.seed = ((b.seed || 1) % 997) + 1; changed(true); return;
    case 'a4-fill': { a3Norm(b); const msg = a4Fill(b, a.dataset.v); changed(true); if (msg) toast(msg); return; }
    case 'a3-del': { a3Norm(b); const w = a.dataset.w; if (Array.isArray(b[w])) b[w].splice(+a.dataset.i, 1); a3Norm(b); changed(true); return; }
    case 'tf-tpl': { const nx = a.dataset.v; if (!TF_TPL[nx] || nx === tfTpl(b)) return; tfConvert(b, nx); b.tpl = nx; changed(true); return; }
    case 'tf-on': b.onSheet = a.dataset.v; changed(true); return;
    case 'tf-gm': b.gapMode = a.dataset.v; changed(true); return;
    case 'tf-add': { tfNorm(b); const w = a.dataset.w;
      if (w === 'rows') b.rows.push(b.cols.map(() => ''));
      else if (w === 'cols') { if (b.cols.length < 4) { b.cols.push(''); b.rows.forEach(r => { while (r.length < b.cols.length) r.push(''); }); } }
      else if (w === 'branches' || w === 'steps') b[w].push({ h: '', t: '' });
      else if (w === 'scale') b.scale.push({ t: '', p: 3 });
      else if (w === 'nodes') b.nodes.push({ n: '', d: '' });
      else if (w === 'rels') b.rels.push({ a: 0, b: Math.min(1, b.nodes.length - 1), t: '' });
      changed(true); return; }
    case 'tf-del': { tfNorm(b); const w = a.dataset.w, i = +a.dataset.i;
      if (w === 'cols') { if (b.cols.length > 2) { b.cols.splice(i, 1); b.rows.forEach(r => r.splice(i, 1)); } }
      else if (w === 'nodes') { b.nodes.splice(i, 1); b.rels = b.rels.filter(r => +r.a !== i && +r.b !== i).map(r => ({ ...r, a: +r.a > i ? +r.a - 1 : +r.a, b: +r.b > i ? +r.b - 1 : +r.b })); }
      else if (Array.isArray(b[w])) b[w].splice(i, 1);
      changed(true); return; }
    case 'tf-sugg': { const n = tfSuggest(b); if (n < 0) return; changed(true); toast(`Tafelbild aus ${n} ${n === 1 ? 'Erwartung' : 'Erwartungen'} vorgeschlagen. Bitte kürzen und anpassen.`, 'Rückgängig', histUndo); return; }
    case 'tf-beam': tfBeamer(b.id); return;
    case 'mat-h': matHeadInsert(b.id); return;
    case 'it-dg': { const it = b.items[+a.dataset.i]; if (!it) return; if (it.noDg) delete it.noDg; else it.noDg = true; changed(true); return; }
    case 'it-fo': { const it = b.items[+a.dataset.i]; if (!it) return; if (it.fo) delete it.fo; else it.fo = true; changed(true); toast(it.fo ? 'Steht jetzt nur auf der Folie. Die Aufgaben auf dem Blatt werden ohne sie nummeriert.' : 'Steht wieder auf dem Arbeitsblatt.'); return; }
    case 'it-lv': { const it = b.items[+a.dataset.i]; if (!it) return; const k = a.dataset.v; const cur = Array.isArray(it.lv) ? it.lv : Object.keys(LV); const nx = cur.includes(k) ? cur.filter(x => x !== k) : [...cur, k]; if (!nx.length) { toast('Eine Aufgabe braucht mindestens eine Stufe.'); return; } if (nx.length === 3) delete it.lv; else it.lv = Object.keys(LV).filter(x => nx.includes(x)); changed(true); return; }
    case 'mt-mode': { const du = state.sheet.meta.anrede === 'du';
      if (mtIsDef(b.title)) b.title = MT_DEF(!!b.sort, a.dataset.v, du); b.mode = a.dataset.v; changed(true); return; }
    case 'mt-sort': { const on = a.dataset.v === '1'; if (!!b.sort === on) return; const du = state.sheet.meta.anrede === 'du';
      if (on) { mtToSort(b); b.sort = true; } else { delete b.sort; if (!(b.pairs || []).some(p => String(p.a || '').trim() || String(p.b || '').trim())) { const P = []; (b.cats || []).forEach(c => { const ws = (b.words || []).filter(w => w.c === c.id); P.push({ a: c.t, b: ws.length ? ws[0].t : '' }); }); (b.words || []).forEach(w => { if (!P.some(p => p.b === w.t)) P.push({ a: '', b: w.t }); }); if (P.length) b.pairs = P; } }
      if (mtIsDef(b.title)) b.title = MT_DEF(on, b.mode, du); changed(true); return; }
    case 'mt-cadd': { const id = mtCid(); b.cats.push({ id, t: '' }); changed(true); const f = $(`#editor [data-bid="${bid}"] [data-k="cats.${b.cats.length - 1}.t"]`); if (f) f.focus(); return; }
    case 'mt-cdel': { const i = +a.dataset.i; const c = b.cats[i]; if (!c || b.cats.length < 2) return; snapshot(); b.cats.splice(i, 1); (b.words || []).forEach(w => { if (w.c === c.id) w.c = ''; }); changed(true); toast('Oberbegriff entfernt; seine Wörter sind jetzt Ablenker.', 'Rückgängig', histUndo); return; }
    case 'mt-wadd': { const last = b.words[b.words.length - 1]; b.words.push({ t: '', c: last ? last.c : (b.cats[0] || {}).id || '' }); changed(true); const f = $(`#editor [data-bid="${bid}"] [data-k="words.${b.words.length - 1}.t"]`); if (f) f.focus(); return; }
    case 'mt-wdel': { const i = +a.dataset.i; if (b.words.length < 2) return; snapshot(); b.words.splice(i, 1); changed(true); toast('Wort entfernt', 'Rückgängig', histUndo); return; }
    case 'mt-bulk': { const k = 'mtbulk:' + bid; if (state.fmtOpen.has(k)) state.fmtOpen.delete(k); else state.fmtOpen.add(k); renderEditor(); const t = $(`#editor [data-bid="${bid}"] [data-mtbulk]`); if (t) t.focus(); return; }
    case 'mt-bulkgo': { const card2 = a.closest('[data-bid]'); const t = card2.querySelector('[data-mtbulk]'), c = card2.querySelector('[data-mtbulkc]');
      const ws = String(t ? t.value : '').split(/\n|[,;]/).map(x => x.trim()).filter(Boolean); if (!ws.length) { if (t) t.focus(); return; }
      b.words = (b.words || []).filter(w => String(w.t || '').trim()); ws.forEach(x => b.words.push({ t: x, c: c ? c.value : '' })); changed(true);
      toast(`${ws.length} ${ws.length === 1 ? 'Wort' : 'Wörter'} hinzugefügt`); const t2 = $(`#editor [data-bid="${bid}"] [data-mtbulk]`); if (t2) t2.focus(); return; }
    case 'mt-add': b.pairs.push({ a: '', b: '' }); changed(true); { const f = $(`#editor [data-bid="${bid}"] [data-k="pairs.${b.pairs.length - 1}.a"]`); if (f) f.focus(); } return;
    case 'mt-extra': b.pairs.push({ a: '', b: '' }); changed(true); { const f = $(`#editor [data-bid="${bid}"] [data-k="pairs.${b.pairs.length - 1}.b"]`); if (f) f.focus(); } return;
    case 'mt-del': { const i = +a.dataset.i; snapshot(); b.pairs.splice(i, 1); if (!b.pairs.length) b.pairs.push({ a: '', b: '' }); changed(true); toast('Zeile entfernt', 'Rückgängig', histUndo); return; }
    case 'mt-shuffle': b.seed = Math.floor(Math.random() * 1e9); changed(true); return;
    case 'tb-ck': { const i = +a.dataset.i; b.ck = b.cols.map((_, j) => j === i ? !tbCk(b, j) : tbCk(b, j)); if (!b.ck.some(Boolean)) delete b.ck; changed(true); return; }
    case 'col-del': if (b.cols.length > 1) { if (Array.isArray(b.cw) && b.cw.length === b.cols.length) { const w = tbWidths(b); w.pop(); const sm = w.reduce((x, y) => x + y, 0); b.cw = w.map(x => Math.round(x * 1000 / sm) / 10); } if (Array.isArray(b.ck)) { b.ck.length = b.cols.length - 1; if (!b.ck.some(Boolean)) delete b.ck; } b.cols.pop(); b.rows.forEach(r => r.pop()); if (Array.isArray(b.eh)) b.eh.forEach(r => { if (Array.isArray(r) && r.length > b.cols.length) r.length = b.cols.length; }); changed(true); } return;
    case 'accent': state.sheet.meta.accent = a.dataset.v; changed(true); return;
    case 'paper': state.sheet.meta.paper = a.dataset.v; changed(true); renderOut(); return;
    case 'design': state.sheet.meta.design = a.dataset.v; loadDesignFonts(a.dataset.v); changed(true); return;
    case 'dz-more': state.dzMore = !(state.dzMore || !!DESIGNS[designOf(state.sheet.meta)].more); renderEditor(); return;
    case 'blk-stil': b.stil = a.dataset.v; changed(true); return;
    case 'meta-set': { const mm = state.sheet.meta; const f = a.dataset.f; if (f === 'headGap' || f === 'botGap') { mm[f] = a.dataset.v || 'n'; changed(true); } return; }
    case 'tb-mode': if (!state.tbPaint) state.tbPaint = {};
      if (a.dataset.v === 'farbe') { state.tbPaint[bid] = state.tbPaint[bid] || 'gelb'; state.tbEh.delete(bid); renderEditor(); return; }
      delete state.tbPaint[bid]; if (a.dataset.v) { state.tbEh.add(bid); if (state.fassung !== 'lehrer') { state.fassung = 'lehrer'; renderOut(); toast('Vorschau zeigt jetzt die Lehrerfassung'); } } else state.tbEh.delete(bid); renderEditor(); scheduleRender(); return;
    case 'tb-h': b.rowHeight = a.dataset.v; if (a.dataset.v === 'eigen' && !b.rowMM) b.rowMM = 50; changed(true); return;
    case 'blk-set': if (['padTop', 'padBot'].includes(a.dataset.f)) { if (a.dataset.v) b[a.dataset.f] = a.dataset.v; else delete b[a.dataset.f]; changed(true); } return;
    case 'mat-form': if (a.dataset.v) b.form = a.dataset.v; else delete b.form; changed(true); return;
    case 'src-form': srcFormSet(b, a.dataset.v); changed(true); renderEditor(); return;
    case 'lb-arr': if (a.dataset.v) b.lbArr = a.dataset.v; else delete b.lbArr; changed(true); renderEditor(); return;
    case 'lb-mode': if (a.dataset.v) b.lbMode = a.dataset.v; else delete b.lbMode; changed(true); renderEditor(); return;
    case 'lb-side': case 'lb-at': { const x = (b.lb || [])[+a.dataset.i]; if (!x) return; x[act === 'lb-side' ? 's' : 'at'] = a.dataset.v; changed(true); renderEditor(); return; }
    case 'lb-free': { const x = (b.lb || [])[+a.dataset.i]; if (!x) return; snapshot(); const sd = x.s || 'l'; x.tx = sd === 'l' ? 25 : sd === 'r' ? 75 : 50; x.ty = sd === 'o' ? 25 : sd === 'u' ? 75 : 50; changed(true); renderEditor(); return; }
    case 'lb-auto': { const x = (b.lb || [])[+a.dataset.i]; if (!x) return; snapshot(); delete x.tx; delete x.ty; changed(true); renderEditor(); return; }
    case 'lb-add': { snapshot(); const L = b.lb || (b.lb = []); const nl = L.filter(x => x.s !== 'r').length, nr = L.length - nl; L.push({ h: '', t: '', s: nl > nr ? 'r' : 'l', at: 'm' }); changed(true); renderEditor(); return; }
    case 'lb-del': { snapshot(); b.lb.splice(+a.dataset.i, 1); changed(true); renderEditor(); return; }
    case 'mat-kind': case 'img-kind': if (a.dataset.v) b.mk = a.dataset.v; else delete b.mk; changed(true); renderEditor(); return;
    case 'phr-cols': b.cols = +a.dataset.v || 2; changed(true); return;
    case 'phr-add': (b.groups = b.groups || []).push({ head: '', text: '' }); changed(true); return;
    case 'phr-del': { const g = b.groups || []; g.splice(+a.dataset.i, 1); if (!g.length) g.push({ head: '', text: '' }); changed(true); return; }
    case 'phr-up': { const g = b.groups || [], i = +a.dataset.i; if (i > 0) [g[i - 1], g[i]] = [g[i], g[i - 1]]; changed(true); return; }
    case 'onecard': lsSet(LS_ONECARD, oneCard() ? 0 : 1); state.allOpen = false; if (oneCard()) enforceOne(); saveClosed(); renderEditor(); toast(oneCard() ? 'Beim Öffnen einer Karte schließen sich die anderen.' : 'Karten bleiben offen, bis du sie schließt.'); return;
    case 'undo': histUndo(); return;
    case 'redo': histRedo(); return;
    case 'fold-all': state.allOpen = false; state.closed = new Set(['meta', 'seite', ...blocks.filter(x => x.type !== 'pagebreak').map(x => x.id)]); saveClosed(); renderEditor(); return;
    case 'unfold-all': state.allOpen = true; state.closed = new Set(); saveClosed(); renderEditor(); return;
    case 'wl': { const it = b.items[+a.dataset.i]; if (it) { it.wl = it.wl === a.dataset.v ? '' : a.dataset.v; changed(true); } return; }
    case 'mat-noul': { const n = ulCount(b.text); b.text = ulStrip(b.text); changed(true); toast(n === 1 ? '1 Unterstreichung entfernt' : n + ' Unterstreichungen entfernt', 'Rückgängig', histUndo); return; }
    case 'bub-add': { if (!Array.isArray(b.bub)) b.bub = []; if (!b.bub.length && (+b.width || 80) > 50) b.width = 50; b.bub.push(bubNew(b, BUB_K[a.dataset.v] ? a.dataset.v : 'sprech')); changed(true); return; }
    case 'bub-k': { const o = (b.bub || [])[+a.dataset.i]; if (o) { o.k = a.dataset.v; changed(true); } return; }
    case 'bub-del': { (b.bub || []).splice(+a.dataset.i, 1); changed(true); return; }
    case 'tfs-all': { state.sheet.blocks.forEach(x => { if (x.type === 'tasks') { if (b.fs) x.fs = b.fs; else delete x.fs; } }); changed(true); toast('Schriftgröße für alle Aufgaben übernommen', 'Rückgängig', histUndo); return; }
    case 'soz': { const it = b.items[+a.dataset.i]; if (it) { it.soz = it.soz === a.dataset.v ? '' : a.dataset.v; changed(true); } return; }
    case 'arb': { const it = b.items[+a.dataset.i]; if (it) { const k = a.dataset.v, L = arbOf(it); it.arb = L.includes(k) ? L.filter(x => x !== k) : [...L, k]; if (!it.arb.length) delete it.arb; changed(true); } return; }
    case 'fmt': b.fmt = { ...(b.fmt || {}), [a.dataset.f]: a.dataset.v }; changed(true); return;
    case 'rd-show': { const r = readStats(b); const o = r && r.long[+a.dataset.i]; const f = $(`#editor [data-bid="${bid}"] .rtx[data-k="text"]`); if (o && f) { f.focus({ preventScroll: true }); if (!rtSelectPlain(f, o.x)) toast('Die Stelle wurde nicht gefunden.'); } return; }
    case 'rd-gl': openGlossFor(b, a.dataset.t, 0, rectOf(a)); return;
    case 'gap-edit': state.gapEdit = state.gapEdit === bid ? null : bid; if (state.gapEdit) state.fmtOpen.add('gap:' + bid); renderEditor(); clearTimeout(renderTimer); renderPreview(); if (state.gapEdit) toast('Wörter in der Vorschau anklicken, um Lücken zu setzen.'); return;
    case 'gap-del': { const i = +a.dataset.i; if (Array.isArray(b.gaps) && b.gaps[i]) { b.gaps.splice(i, 1); if (!b.gaps.length) delete b.gaps; changed(true); } return; }
    case 'gap-clear': snapshot(); delete b.gaps; changed(true); toast('Alle Lücken entfernt', 'Rückgängig', histUndo); return;
    case 'post-off': delete b.post; changed(true); return;
    case 'gap-w': if (a.dataset.v) b.gapW = a.dataset.v; else delete b.gapW; changed(true); return;
    case 'gap-hd': if (a.dataset.v) b.gapHd = a.dataset.v; else delete b.gapHd; changed(true); return;
    case 'fmt-toggle': if (state.fmtOpen.has(bid)) state.fmtOpen.delete(bid); else state.fmtOpen.add(bid); renderEditor(); return;
    case 'fmt-reset': b.fmt = {}; b.lineNumbers = true; changed(true); return;
    case 'fmt-all': {
      let n = 0; blocks.forEach(x => { if (x.type === 'material' && x !== b) { x.fmt = clone(b.fmt || {}); x.lineNumbers = b.lineNumbers !== false; n++; } });
      changed(true); toast(`Formatierung für ${n} ${n === 1 ? 'weiteres Material' : 'weitere Materialien'} übernommen`); return;
    }
    case 'menu': openMenu(bid, a); return;
    case 'mode': state.sheet.meta.mode = a.dataset.v; changed(true); return;
    case 'sub-toggle': { const key = a.dataset.key; if (state.fmtOpen.has(key)) state.fmtOpen.delete(key); else state.fmtOpen.add(key); renderEditor(); return; }
    case 'tx': {
      const i = +a.dataset.i, w = a.dataset.w, key = taskKey(bid, i, w);
      if (state.taskOpen.has(key)) state.taskOpen.delete(key);
      else { state.taskOpen.add(key); const it = b.items[i]; if (w === 'rlp') state.rlpQ = ''; if (w === 'tips' && !Array.isArray(it.tips)) it.tips = tipsOf(it).concat(['', '', '']).slice(0, 3); }
      renderEditor();
      if (state.taskOpen.has(key)) { const f = $(`#editor [data-bid="${bid}"] [data-k="items.${i}.${w === 'tips' ? 'tips.0' : w}"]`); if (f) f.focus({ preventScroll: true }); }
      return;
    }
    case 'snip-add': {
      const nb = snipBlock(a.dataset.id); if (!nb) return;
      const at = state.sel && state.sel !== 'meta' ? blocks.findIndex(x => x.id === state.sel) + 1 : blocks.length;
      blocks.splice(at > 0 ? at : blocks.length, 0, nb); state.sel = nb.id; openOnly(nb.id); changed(true);
      const nc = $(`#editor [data-bid="${nb.id}"]`); if (nc) nc.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    case 'snip-del': lsSet(LS_SNIP, userSnips().filter(x => x.id !== a.dataset.id)); renderEditor(); toast('Aus der Sammlung entfernt'); return;
    case 'gfix': gFix(bid, a.dataset.m, a.dataset.r); return;
    case 'kk-add': {
      const cs = state.sheet.cards || (state.sheet.cards = []); const used = cs.map(c => c.color);
      cs.push({ id: 'k' + uid(), term: '', color: TK_COLORS.find(c => !used.includes(c)) || TK_COLORS[cs.length % TK_COLORS.length], points: '' });
      changed(true); const f = $(`#editor [data-k="cards.${cs.length - 1}.term"]`); if (f) { f.scrollIntoView({ block: 'nearest' }); f.focus({ preventScroll: true }); }
      return;
    }
    case 'kk-del': { const i = +a.dataset.i; snapshot(); const c = state.sheet.cards.splice(i, 1)[0]; changed(true); toast(`Begriff „${c.term || 'ohne Begriff'}“ gelöscht`, 'Rückgängig', histUndo); return; }
    case 'kk-up': case 'kk-down': { const cs = state.sheet.cards; const i = +a.dataset.i, j = act === 'kk-up' ? i - 1 : i + 1; if (j < 0 || j >= cs.length) return; [cs[i], cs[j]] = [cs[j], cs[i]]; changed(true); return; }
    case 'kk-color': state.sheet.cards[+a.dataset.i].color = a.dataset.v; changed(true); return;
    case 'kk-size': state.sheet.cards[+a.dataset.i].size = a.dataset.v; changed(true); return;
    case 'kk-set': { const m = state.sheet.meta; const f = a.dataset.f; m.kk = { ...kkOf(m), [f]: ['per', 'words', 'warn'].includes(f) ? +a.dataset.v : a.dataset.v }; changed(true); return; }
    case 'gl-add': glossFromTextarea(card, b, a); return;
    case 'gl-edit': { const i = +a.dataset.i; const g = b.glossary && b.glossary[i]; if (g) openGloss({ bid, term: normTerm(g.term), n: g.n || 0, count: occurrences(b.text, g.term).length, idx: i, rect: rectOf(a) }); return; }
    case 'gl-remove': removeGloss(b, +a.dataset.i); return;
  }
}

