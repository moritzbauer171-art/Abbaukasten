/* ---------- Textfelder mit sichtbarer Formatierung (statt **Zeichen**) ---------- */
const GAP_IMG = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const GAP_ED = `<img class="gap" alt="Lücke" src="${GAP_IMG}">`;
const ED_MARK = 'rgb(255, 230, 128)';
const RT_HINT = 'Text markieren zum Formatieren · „- “ beginnt eine Liste · ___ wird eine Lücke';
function edTok(k) {
  if (k.sup) return '<sup>' + esc(k.t) + '</sup>';
  if (k.gap) return GAP_ED;
  let h = esc(k.t);
  if (k.m) h = `<span class="mk" style="background-color: ${ED_MARK};">${h}</span>`;
  if (k.u) h = '<u>' + h + '</u>';
  if (k.i) h = '<i>' + h + '</i>';
  if (k.b) h = '<b>' + h + '</b>';
  return h;
}
// Gespeicherter Text → Inhalt des Textfelds
function richHTML(raw, mode, hd) {
  const s = String(raw ?? ''); if (!s) return '';
  const inl = l => inlineTokens(l).map(edTok).join('');
  if (mode === 'line') return inl(s.replace(/\s*\n\s*/g, ' '));
  let h = '', list = null;
  const flushL = () => { if (list) h += `<${list.tag}>${list.items.join('')}</${list.tag}>`; list = null; };
  s.split('\n').forEach(l => {
    const m = mode === 'full' && l.match(LIST_LINE);
    if (m) { const tag = m[1] ? 'ul' : 'ol'; if (!list || list.tag !== tag) { flushL(); list = { tag, items: [] }; } list.items.push(`<li>${inl(m[3]) || '<br>'}</li>`); return; }
    flushL(); if (hd && MH_RE.test(l.trim())) { h += `<h3>${inl(l.trim().replace(MH_RE, '')) || '<br>'}</h3>`; return; } h += `<div>${inl(l) || '<br>'}</div>`;
  });
  flushL(); return h;
}
const rtEsc = t => t.replace(/[\\*+=_^]/g, c => '\\' + c);
// Inhalt des Textfelds → gespeicherter Text. Mit opt.caret (Range) auch die Position im gespeicherten Text.
function rtSerialize(root, opt = {}) {
  const mode = root.dataset.rt || 'full', plain = !!opt.plain, R = opt.caret || null;
  const S0 = '', S1 = '';
  const lines = [{ pre: '', runs: [] }]; let closed = false;
  const cur = () => lines[lines.length - 1];
  const push = (pre = '') => { lines.push({ pre, runs: [] }); closed = false; };
  const blockStart = pre => { const c = cur(); if (closed || c.runs.some(r => !r.s)) push(pre); else if (pre) c.pre = pre; closed = false; };
  const run = r => {
    if (closed) push(); const c = cur(); const last = c.runs[c.runs.length - 1];
    if (r.t != null && last && last.t != null && RT_FL.every(f => (last[f] || 0) === (r[f] || 0))) last.t += r.t; else c.runs.push(r);
  };
  const text = (t, fl) => { t = t.replace(/ /g, ' '); if (t) run({ t, ...fl }); };
  const sent = ch => cur().runs.push({ s: ch });
  const BLOCK = /^(DIV|P|LI|UL|OL|H[1-6]|BLOCKQUOTE|PRE|TABLE|TR|TD)$/;
  const flagsOf = (el, fl) => {
    const f = { ...fl }, tn = el.nodeName, st = el.style || {};
    if (tn === 'B' || tn === 'STRONG') f.b = 1;
    if (tn === 'I' || tn === 'EM') f.i = 1;
    if (tn === 'U' || tn === 'INS') f.u = 1;
    if (tn === 'MARK') f.m = 1;
    if (st.fontWeight) f.b = st.fontWeight === 'bold' || st.fontWeight === 'bolder' || +st.fontWeight >= 600 ? 1 : 0;
    if (st.fontStyle) f.i = st.fontStyle === 'italic' ? 1 : 0;
    const td = (tn === 'A' || (el.closest && el.closest('a[href]'))) ? '' : (st.textDecorationLine || st.textDecoration); if (td) f.u = /underline/.test(td) ? 1 : td === 'none' ? 0 : f.u;
    const bg = st.backgroundColor; if (bg) f.m = isHighlight(bg) ? 1 : /^(transparent|rgba\(0, 0, 0, 0\))$/.test(bg) ? 0 : f.m;
    return f;
  };
  const trailing = (n, blk) => { for (let x = n; x && x !== blk; x = x.parentNode) for (let y = x.nextSibling; y; y = y.nextSibling) if (y.nodeType === 1 || (y.nodeType === 3 && y.nodeValue)) return false; return true; };
  const blockOf = n => { let x = n.parentNode; while (x && x !== root && !BLOCK.test(x.nodeName)) x = x.parentNode; return x || root; };
  const walk = (node, fl, listTag) => {
    const kids = node.childNodes;
    for (let i = 0; i <= kids.length; i++) {
      if (R) { if (R.startContainer === node && R.startOffset === i) sent(S0); if (R.endContainer === node && R.endOffset === i) sent(S1); }
      if (i === kids.length) break;
      const n = kids[i];
      if (n.nodeType === 3) {
        const t = n.nodeValue;
        if (!t || (/^\s*$/.test(t) && /\n/.test(t) && (node === root || node.nodeName === 'UL' || node.nodeName === 'OL'))) continue;
        if (R && (R.startContainer === n || R.endContainer === n)) {
          const ms = []; if (R.startContainer === n) ms.push([R.startOffset, S0]); if (R.endContainer === n) ms.push([R.endOffset, S1]);
          let p = 0; for (const [o, ch] of ms) { if (o > p) text(t.slice(p, o), fl); sent(ch); p = Math.max(p, o); }
          if (p < t.length) text(t.slice(p), fl);
        } else text(t, fl);
        continue;
      }
      if (n.nodeType !== 1) continue;
      const tag = n.nodeName;
      if (tag === 'BR') { if (!trailing(n, blockOf(n))) push(); continue; }
      if (tag === 'IMG') { if (n.classList.contains('gap')) run({ gap: 1 }); else { const alt = emojiAlt(n); if (alt) text(alt, fl); } continue; }
      if (tag === 'SUP') { const t = n.textContent; if (/^(\d+|\*)$/.test(t)) run({ sup: t }); else text(t, fl); continue; }
      if (tag === 'UL' || tag === 'OL') { walk(n, fl, tag); closed = true; continue; }
      if (BLOCK.test(tag)) { blockStart(tag === 'LI' ? (listTag === 'OL' ? 'ol' : 'ul') : root.dataset.hd && /^H[1-6]$/.test(tag) ? 'h' : ''); walk(n, flagsOf(n, fl), listTag); closed = true; continue; }
      walk(n, flagsOf(n, fl), listTag);
    }
  };
  walk(root, { b: 0, i: 0, u: 0, m: 0 }, null);
  const out = emitLines(lines, mode, plain);
  let raw = out.join(mode === 'line' ? ' ' : '\n'), a = -1, b = -1;
  if (R) { a = raw.indexOf(S0); if (a >= 0) raw = raw.slice(0, a) + raw.slice(a + 1); b = raw.indexOf(S1); if (b >= 0) raw = raw.slice(0, b) + raw.slice(b + 1); }
  raw = raw.replace(/\n+$/, '');
  a = Math.min(a, raw.length); b = Math.min(b < 0 ? a : b, raw.length);
  return { raw, start: a, end: b };
}
// Zeilen [{ pre: 'ul'|'ol'|'', runs }] → gespeicherter Text (je Zeile ein Eintrag)
function emitLines(lines, mode, plain = false) {
  const out = []; let olN = 0, prev = '';
  for (const L of lines) {
    let t = '';
    if (plain) t = L.runs.map(r => r.s || (r.gap ? '___' : r.sup != null ? r.sup : r.t)).join('');
    else {
      const open = { b: 0, i: 0, u: 0, m: 0 };
      for (const r of L.runs) {
        if (r.s) { t += r.s; continue; }
        if (r.gap) { t += '___'; continue; }
        if (r.sup != null) { t += '^' + r.sup; continue; }
        for (const f of RT_FL) if ((r[f] || 0) !== open[f]) { t += RT_MK[f]; open[f] = r[f] || 0; }
        t += rtEsc(r.t);
      }
      for (const f of RT_FL) if (open[f]) t += RT_MK[f];
    }
    let pre = '';
    if (L.pre === 'h') { pre = '## '; t = t.replace(/^\*\*([\s\S]*)\*\*$/, '$1'); }
    else if (mode === 'full' && L.pre) { olN = L.pre === 'ol' ? (prev === 'ol' ? olN + 1 : 1) : 0; pre = L.pre === 'ol' ? olN + '. ' : '- '; }
    else if (mode === 'full' && !plain && LIST_LINE.test(t.replace(/[\uE0F0\uE0F1]/g, ''))) t = t.replace(/^([\uE0F0\uE0F1]*)([-•]|\d{1,2})/, (m0, sn, x) => /^\d/.test(x) ? sn + x + '\\' : sn + '\\' + x);
    prev = L.pre; out.push(pre + t);
  }
  return out;
}

