/* ---------- Leiste beim Markieren ---------- */
function rtFieldSel() { const s = getSelection(); if (!s || !s.rangeCount) return null; const n = s.anchorNode; const e = n && (n.nodeType === 1 ? n : n.parentElement); const f = e && e.closest('#editor .rtx'); return f && f.contains(s.focusNode) ? f : null; }
function rtMarked() {
  const s = getSelection(); const f = rtFieldSel(); if (!f || !s.rangeCount) return false;
  for (let n = s.getRangeAt(0).startContainer; n && n !== f; n = n.parentNode) {
    if (n.nodeType !== 1) continue; if (n.nodeName === 'MARK') return true;
    const bg = n.style && n.style.backgroundColor; if (bg && isHighlight(bg)) return true; if (bg && /^(transparent|rgba\(0, 0, 0, 0\))$/.test(bg)) return false;
  }
  return false;
}
function rtBar() {
  const bar = $('#rt-bar'); if (!bar) return;
  const f = rtFieldSel(); const s = getSelection();
  if (!f || s.isCollapsed || document.activeElement !== f || f.closest('.mw-word')) { bar.hidden = true; return; }
  bar.dataset.mode = f.dataset.rt; bar.dataset.hd = f.dataset.hd ? '1' : '';
  { let fb = ''; try { fb = document.queryCommandValue('formatBlock'); } catch {} const hb = bar.querySelector('[data-rt="h"]'); if (hb) hb.setAttribute('aria-pressed', /^h\d$/i.test(fb) ? 'true' : 'false'); }
  for (const [k, c] of Object.entries({ b: 'bold', i: 'italic', u: 'underline', ul: 'insertUnorderedList', ol: 'insertOrderedList' })) {
    let on = false; try { on = document.queryCommandState(c); } catch {}
    const b = bar.querySelector(`[data-rt="${k}"]`); if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  bar.querySelector('[data-rt="m"]').setAttribute('aria-pressed', rtMarked() ? 'true' : 'false');
  bar.hidden = false;
  const r0 = s.getRangeAt(0).getBoundingClientRect(); const r = r0.width || r0.height ? r0 : f.getBoundingClientRect();
  const w = bar.offsetWidth, h = bar.offsetHeight;
  let top = r.top - h - 8; if (top < 8) top = r.bottom + 8;
  bar.style.left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8) + 'px'; bar.style.top = top + 'px';
}
function rtCmd(k) {
  const f = rtFieldSel(); if (!f) return;
  const ex = (c, v = null) => { try { document.execCommand(c, false, v); } catch {} };
  const full = f.dataset.rt === 'full';
  switch (k) {
    case 'b': ex('bold'); break;
    case 'i': ex('italic'); break;
    case 'u': ex('underline'); break;
    case 'm': ex('hiliteColor', rtMarked() ? 'transparent' : ED_MARK); break;
    case 'ul': if (full) ex('insertUnorderedList'); break;
    case 'ol': if (full) ex('insertOrderedList'); break;
    case 'gap': if (full) ex('insertHTML', GAP_ED); break;
    case 'h': if (f.dataset.hd) { let fb = ''; try { fb = document.queryCommandValue('formatBlock'); } catch {} ex('formatBlock', /^h\d$/i.test(fb) ? 'div' : 'h3'); } break;
    case 'x': ex('removeFormat'); if (rtMarked()) ex('hiliteColor', 'transparent'); break;
  }
  rtBar();
}
// Beim Tippen: „- “ oder „1. “ am Zeilenanfang wird Liste, ___ wird Lücke (Strg+Z macht es rückgängig)
function rtAuto(e, el) {
  if ((el.dataset.rt !== 'full' && !el.dataset.hd) || e.inputType !== 'insertText' || (e.data !== ' ' && e.data !== '_')) return false;
  const s = getSelection(); if (!s.rangeCount || !s.isCollapsed) return false;
  const r = s.getRangeAt(0); const tn = r.startContainer; if (tn.nodeType !== 3) return false;
  let blk = tn.parentNode; while (blk !== el && !/^(DIV|P|LI|H[1-6])$/.test(blk.nodeName)) blk = blk.parentNode;
  if (e.data === ' ' && el.dataset.hd && !/^H\d$/.test(blk.nodeName)) {
    const pre = document.createRange(); pre.setStart(blk, 0); pre.setEnd(tn, r.startOffset);
    if (/^##[ \u00a0]$/.test(pre.toString())) { s.removeAllRanges(); s.addRange(pre); document.execCommand('delete'); document.execCommand('formatBlock', false, 'h3'); return true; }
  }
  if (el.dataset.rt !== 'full') return false;
  if (e.data === ' ' && blk.nodeName !== 'LI') {
    const pre = document.createRange(); pre.setStart(blk, 0); pre.setEnd(tn, r.startOffset);
    const m = pre.toString().replace(/ /g, ' ').match(/^(?:([-•*])|1[.)]) $/);
    if (m) { s.removeAllRanges(); s.addRange(pre); document.execCommand('delete'); document.execCommand(m[1] ? 'insertUnorderedList' : 'insertOrderedList'); return true; }
  }
  if (e.data === '_' && r.startOffset >= 3 && tn.nodeValue.slice(r.startOffset - 3, r.startOffset) === '___') {
    const g = document.createRange(); g.setStart(tn, r.startOffset - 3); g.setEnd(tn, r.startOffset);
    s.removeAllRanges(); s.addRange(g); document.execCommand('insertHTML', false, GAP_ED); return true;
  }
  return false;
}

