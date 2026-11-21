/* ================= Zeilenangaben per Klick ================= */
const zl = { open: null };
const lastField = { bid: null, k: null, pos: null, end: null };
function fieldLabel(b, k) {
  const num = numbering(state.sheet); const m = k.match(/^items\.(\d+)\.(text|eh|tips|tag)(?:\.(\d+))?/);
  if (b.type === 'tasks' && m) { const n = itNos(b, num[b.id].from)[+m[1]]; return `${n ? 'Aufgabe ' + n : 'Auftrag (Folie)'}${m[2] === 'eh' ? ' · Erwartung' : m[2] === 'tips' ? ` · Tipp ${+m[3] + 1}` : ''}`; }
  return typeLabel(b);
}
function fieldTarget() {
  if (!lastField.bid) return null; const b = state.sheet.blocks.find(x => x.id === lastField.bid);
  if (!b || b.type === 'material') return null; return { ...lastField, label: fieldLabel(b, lastField.k) };
}
function zlFmt(bid, lo, hi, tag) {
  const many = state.sheet.blocks.filter(x => x.type === 'material').length > 1;
  const bl = state.sheet.blocks.find(x => x.id === bid); const zv = bl && bl.form === 'gedicht' ? 'V.' : 'Z.';
  return `(${many && tag ? `${/^\d+$/.test(String(tag)) ? 'M' + tag : tag}, ` : ''}${zv} ${lo === hi ? lo : lo + '–' + hi})`;
}
function zlText() { const o = zl.open; return zlFmt(o.bid, Math.min(o.a, o.b), Math.max(o.a, o.b), o.mNo); }
/* ---------- Zeilenangaben, die mitwandern ----------
   Eine eingefügte Angabe merkt sich die Wörter am Anfang und Ende der Stelle. Nach jedem Satz der Vorschau
   werden die Zeilen neu bestimmt und die Angabe im Aufgabentext angepasst, auch wenn sich Schrift, Papier oder Text ändern. */
const zlSnip = (W, i, dir, n = 8) => (dir > 0 ? W.slice(i, i + n) : W.slice(Math.max(0, i - n + 1), i + 1)).join(' ');
function zlFind(Z, i, snip, dir) {
  // Erst die ganze gemerkte Wortfolge (acht Wörter), dann kürzere Stücke davon; bei mehreren Treffern der nächste zur alten Stelle
  const W = Z.words; const sw = snip.split(' '); const tries = [[snip, sw.length]];
  [4, 2].forEach(n => { if (sw.length > n) tries.push([(dir > 0 ? sw.slice(0, n) : sw.slice(-n)).join(' '), n]); });
  for (const [sn, n] of tries) {
    if (i >= 0 && i < W.length && zlSnip(W, i, dir, n) === sn) return i;
    const key = dir > 0 ? sn.split(' ')[0] : sn.split(' ').pop(); let best = -1, bd = Infinity;
    for (let j = 0; j < W.length; j++) if (W[j] === key && zlSnip(W, j, dir, n) === sn && Math.abs(j - i) < bd) { best = j; bd = Math.abs(j - i); }
    if (best >= 0) return best;
  }
  return -1;
}
const zlGet = (o, k) => k.split('.').reduce((x, p) => (x == null ? x : x[p]), o);
function zlAnchor(o, f, lab, pos) {
  const Z = ZL_MAP[o.bid]; if (!Z) return; const lo = Math.min(o.a, o.b), hi = Math.max(o.a, o.b);
  const wa = Z.lineOf.indexOf(lo), wb = Z.lineOf.lastIndexOf(hi); if (wa < 0 || wb < 0 || wb < wa) return;
  const sh = state.sheet; if (!Array.isArray(sh.zrefs)) sh.zrefs = [];
  sh.zrefs.push({ id: uid(), mat: o.bid, wa, wb, ta: zlSnip(Z.words, wa, 1), tb: zlSnip(Z.words, wb, -1), f: f.bid, k: f.k, lab, pos });
}
function zlCloneFor(oldId, newId) { const sh = state.sheet; if (!Array.isArray(sh.zrefs)) return; sh.zrefs.filter(r => r.f === oldId).forEach(r => sh.zrefs.push({ ...r, id: uid(), f: newId })); }
function zlSync() {
  const sh = state.sheet; if (!Array.isArray(sh.zrefs) || !sh.zrefs.length || !fontsOK) return false;
  const v = sheetView(); if (state.out !== 'blatt' || v.grp !== 'all' || v.lvl !== 'all' || state.gapEdit) return false;
  const byField = new Map(); sh.zrefs.forEach(r => { const k = r.f + '|' + r.k; if (!byField.has(k)) byField.set(k, []); byField.get(k).push(r); });
  const fa = document.activeElement, drop = new Set(); let any = false;
  byField.forEach(list => {
    const r0 = list[0]; const blk = target(r0.f); let raw = blk ? zlGet(blk, r0.k) : null;
    if (typeof raw !== 'string') { list.forEach(r => drop.add(r)); return; }
    const fieldEl = document.querySelector(`#editor [data-bid="${r0.f}"] [data-k="${r0.k}"]`);
    if (fieldEl && fieldEl === fa) return; // beim Tippen nicht dazwischenfunken, nach dem Verlassen des Felds geht es weiter
    let mod = false;
    list.sort((a, b) => (a.pos || 0) - (b.pos || 0)).forEach(r => {
      const occ = []; for (let j = raw.indexOf(r.lab); j >= 0; j = raw.indexOf(r.lab, j + 1)) occ.push(j);
      if (!occ.length) { drop.add(r); return; } // Angabe gelöscht oder von Hand geändert: nicht mehr verfolgen
      const at = occ.reduce((a, x) => (Math.abs(x - (r.pos || 0)) < Math.abs(a - (r.pos || 0)) ? x : a), occ[0]); r.pos = at;
      if (!sh.blocks.some(x => x.id === r.mat && x.type === 'material')) { r.lost = 'gone'; return; }
      const Z = ZL_MAP[r.mat]; if (!Z || (v.lehrer && Z.gaps)) return;
      const wa = zlFind(Z, r.wa, r.ta, 1), wb = zlFind(Z, r.wb, r.tb, -1);
      if (wa < 0 || wb < 0 || wb < wa) { r.lost = 'text'; return; }
      delete r.lost; r.wa = wa; r.wb = wb; r.ta = zlSnip(Z.words, wa, 1); r.tb = zlSnip(Z.words, wb, -1);
      const lab = zlFmt(r.mat, Z.lineOf[wa], Z.lineOf[wb], Z.tag);
      if (lab !== r.lab) { raw = raw.slice(0, at) + lab + raw.slice(at + r.lab.length); const d = lab.length - r.lab.length; list.forEach(x => { if (x !== r && (x.pos || 0) > at) x.pos += d; }); r.lab = lab; mod = true; }
    });
    if (mod) { setPath(blk, r0.k, raw); any = true; if (fieldEl) { if (fieldEl.classList.contains('rtx')) { fieldEl.innerHTML = richHTML(raw, fieldEl.dataset.rt, fieldEl.dataset.hd); fieldEl.classList.toggle('is-empty', !raw.trim()); } else fieldEl.value = raw; } }
  });
  if (drop.size) sh.zrefs = sh.zrefs.filter(r => !drop.has(r));
  if (any) scheduleSave();
  return any;
}
function openZl(bid, n, mNo, rect) {
  if (zl.open && zl.open.bid === bid) { zl.open.b = n; zl.open.rect = rect; } else zl.open = { bid, a: n, b: n, mNo, rect };
  renderZl(); markZl();
}
function closeZl() { if (!zl.open) return; zl.open = null; renderZl(); markZl(); }
function markZl() {
  document.querySelectorAll('#pages .ln.zsel').forEach(n => n.classList.remove('zsel'));
  const o = zl.open; if (!o) return; const lo = Math.min(o.a, o.b), hi = Math.max(o.a, o.b);
  document.querySelectorAll(`#pages [data-bid="${o.bid}"] .ln-no`).forEach(n => { const k = +n.dataset.n; if (k >= lo && k <= hi) n.parentElement.classList.add('zsel'); });
}
function renderZl() {
  const r = $('#zl-root'); const o = zl.open; if (!o) { r.innerHTML = ''; return; }
  const tgt = fieldTarget();
  r.innerHTML = `<div class="gl-scrim" data-zl="close"></div><div class="gpop" id="zlpop" role="dialog" aria-labelledby="zl-h">
    <div class="gpop-h"><span id="zl-h">${(state.sheet.blocks.find(x => x.id === o.bid) || {}).form === 'gedicht' ? 'Versangabe' : 'Zeilenangabe'}</span><button class="ib" type="button" data-zl="close" title="Schließen">${I.x}</button></div>
    <div class="gl-term">${esc(zlText())}</div>
    <small class="zl-hint">Für einen Bereich die letzte Zeile anklicken.</small>
    <div class="zl-a">${tgt ? `<button class="btn primary" type="button" data-zl="ins">In „${esc(tgt.label)}“ einfügen</button>` : ''}<button class="btn" type="button" data-zl="copy">Kopieren</button></div>
    ${tgt ? '' : '<small class="zl-hint">Tipp: Erst in ein Aufgaben- oder Erwartungsfeld klicken, dann landet die Angabe direkt dort.</small>'}</div>`;
  placePop($('#zlpop'), o.rect);
}
function placePop(p, r) {
  if (!p) return; if (narrowGloss()) { p.style.left = ''; p.style.top = ''; return; }
  const w = p.offsetWidth, h = p.offsetHeight;
  const left = Math.min(Math.max(16, r.left + r.width / 2 - w / 2), window.innerWidth - w - 16);
  let top = r.bottom + 10; if (top + h > window.innerHeight - 16) top = Math.max(16, r.top - h - 10);
  p.style.left = left + 'px'; p.style.top = top + 'px';
}
function zlInsert() {
  const f = fieldTarget(); const txt = zlText(); if (!f) return zlCopy();
  state.closed.delete(f.bid); saveClosed();
  const mm = f.k.match(/^items\.(\d+)\.(eh|tips|tag)/); if (mm) state.taskOpen.add(taskKey(f.bid, +mm[1], mm[2]));
  renderEditor();
  const x = $(`#editor [data-bid="${f.bid}"] [data-k="${f.k}"]`); if (!x) return zlCopy();
  const isRt = x.classList.contains('rtx');
  const val = isRt ? rtSerialize(x).raw : x.value; const p = Math.min(f.pos == null ? val.length : f.pos, val.length); const e = Math.max(p, Math.min(f.end == null ? p : f.end, val.length));
  const before = val.slice(0, p), after = val.slice(e);
  const ins = (before && !/\s$/.test(before) ? ' ' : '') + txt + (after && !/^[\s.,;:)]/.test(after) ? ' ' : '');
  const np = (before + ins).length;
  if (zl.open) zlAnchor(zl.open, f, txt, before.length + (ins[0] === ' ' ? 1 : 0));
  if (isRt) { rtSetRaw(x, before + ins + after, np); x.dispatchEvent(new Event('input', { bubbles: true })); }
  else {
    x.value = before + ins + after;
    x.dispatchEvent(new Event('input', { bubbles: true }));
    try { x.focus({ preventScroll: true }); x.setSelectionRange(np, np); } catch {}
  }
  lastField.pos = lastField.end = np;
  closeZl(); toast(`${txt} eingefügt in ${f.label}. Die Angabe wandert mit, wenn sich die Zeilen verschieben.`);
}
// Neue Zwischenüberschrift vor der Zeile mit der Schreibmarke (sonst am Ende); der Platzhalter ist markiert, Tippen ersetzt ihn
function matHeadInsert(bid) {
  const x = $(`#editor [data-bid="${bid}"] [data-k="text"].rtx`); if (!x) return;
  const sel = getSelection(); let pos = null;
  if (sel && sel.rangeCount && x.contains(sel.anchorNode)) { try { pos = rtSerialize(x, { caret: sel.getRangeAt(0) }).start; } catch { pos = null; } }
  const val = rtSerialize(x).raw; const atEnd = pos == null || pos < 0 || pos >= val.length;
  const ls = atEnd ? val.length : val.lastIndexOf('\n', pos - 1) + 1;
  const before = val.slice(0, ls).replace(/\s+$/, ''), after = atEnd ? '' : val.slice(ls).replace(/^\n+/, '');
  const PH = 'Zwischenüberschrift'; const head = (before ? before + '\n\n' : '') + '## ';
  rtSetRaw(x, head + PH + '\n' + after, head.length);
  try { const s2 = getSelection(); const r = s2.getRangeAt(0); const n = r.startContainer; if (n.nodeType === 3 && n.nodeValue.slice(r.startOffset, r.startOffset + PH.length) === PH) { r.setEnd(n, r.startOffset + PH.length); s2.removeAllRanges(); s2.addRange(r); } } catch {}
  x.dispatchEvent(new Event('input', { bubbles: true }));
  toast('Zwischenüberschrift angelegt: gleich lostippen. Enter beginnt den Absatz darunter.');
}
function zlCopy() {
  const txt = zlText(); closeZl();
  const done = () => toast(`${txt} kopiert`);
  try { navigator.clipboard.writeText(txt).then(done, () => toast(`Kopieren nicht möglich. Die Angabe lautet ${txt}`)); } catch { toast(`Die Angabe lautet ${txt}`); }
}

