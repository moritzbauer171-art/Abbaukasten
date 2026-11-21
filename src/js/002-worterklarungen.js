/* ================= Worterklärungen (Glossar) ================= */
/* Jede Erklärung hängt an einem Wort (oder einer Wortgruppe) und seiner Stelle im Text:
   { term, n, text } = n-tes Vorkommen von term. Nummern und Fußnoten entstehen beim Setzen. */
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normTerm = s => String(s || '').replace(/\*/g, '').replace(/\s+/g, ' ').trim();
const isWordChar = c => /[\p{L}\p{N}]/u.test(c || '');
function termRe(term) { return new RegExp('(?<![\\p{L}\\p{N}])' + normTerm(term).split(' ').map(escRe).join('[\\s*]+') + '(?![\\p{L}\\p{N}])', 'gu'); }
function occurrences(text, term) {
  const t = normTerm(term); if (!t) return [];
  const re = termRe(t); const src = String(text || ''); const out = []; let m;
  while ((m = re.exec(src))) { out.push({ start: m.index, end: m.index + m[0].length }); if (!m[0].length) re.lastIndex++; }
  return out;
}
/* Emojis: Erkennung für Word (eigene Schrift) und für Bild-Emojis beim Einfügen */
const EMO_SRC = '(?:\\p{Regional_Indicator}{2}|(?:\\p{Emoji_Presentation}|\\p{Extended_Pictographic}\\uFE0F)(?:\\p{Emoji_Modifier}|\\uFE0F|\\u20E3|\\u200D(?:\\p{Emoji_Presentation}|\\p{Extended_Pictographic})\\uFE0F?)*)+';
const EMO_TEST = new RegExp(EMO_SRC, 'u'); const EMO_SPLIT = new RegExp('(' + EMO_SRC + ')', 'u');
const emojiAlt = img => { const a = String(img.getAttribute('alt') || '').trim(); return a && a.length <= 24 && /\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(a) ? a : ''; };
const GM_RE = /(\d+)/g;
// Setzt unsichtbare Marken hinter die erklärten Wörter und nummeriert in Textreihenfolge
function gapList(b) {
  const text = String(b.text || ''); const out = [];
  (b.gaps || []).forEach(g => { const o = occurrences(text, g.term)[g.n || 0]; if (o && !out.some(x => x.start < o.end && o.start < x.end)) out.push({ g, start: o.start, end: o.end, w: text.slice(o.start, o.end) }); });
  return out.sort((a, c) => a.start - c.start);
}
function glossMarks(b, opt) {
  const text = String(b.text || ''); const list = []; const missing = [];
  (b.glossary || []).forEach(g => {
    const o = occurrences(text, g.term)[g.n || 0];
    if (o && !list.some(x => x.start === o.start && x.end === o.end)) list.push({ g, start: o.start, end: o.end });
    else missing.push(g);
  });
  list.sort((a, c) => a.start - c.start || a.end - c.end);
  list.forEach((x, i) => { x.no = i + 1; });
  let out = text;
  const ins = list.map(x => ({ pos: x.end, s: '' + x.no + '', pri: 0 }));
  // Wortgruppen: Anfangszeichen, damit in der Vorschau die ganze Gruppe unterstrichen wird
  if (opt && opt.phrase) list.forEach(x => { if (/\s/.test(text.slice(x.start, x.end))) ins.push({ pos: x.start, s: '\ue004', pri: 3 }); });
  if (opt && opt.gaps) gapList(b).forEach(x => { ins.push({ pos: x.end, s: '', pri: 1 }, { pos: x.start, s: '', pri: 2 }); });
  ins.sort((a, c) => c.pos - a.pos || a.pri - c.pri).forEach(x => { out = out.slice(0, x.pos) + x.s + out.slice(x.pos); });
  return { text: out, list, missing };
}
// Wörter für das Setzen: HTML mit Fußnotenzahl + reiner Text (für die Klick-Zuordnung)
function toWordsM(text, gapShow, gapW) {
  const words = []; let h = '', t = '', gl = false, gp = false, glOpen = false;
  const push = () => { if (h) words.push({ h, t, gl: gl || glOpen && !!t, gp }); h = ''; t = ''; gl = false; gp = false; };
  for (const k of inlineTokens(text)) {
    if (k.sup || k.gap) { h += tokHTML(k); continue; }
    for (let p of k.t.split(/(\s+)/)) {
      if (!p) continue;
      if (/^\s+$/.test(p)) { push(); continue; }
      if (p.includes('\ue004')) { glOpen = true; p = p.replace(/\ue004/g, ''); if (!p) continue; }
      if (glOpen && GM_RE.test(p)) { GM_RE.lastIndex = 0; gl = true; glOpen = false; }
      if (/\d+/.test(p)) gl = true;
      if (//.test(p) || //.test(p)) {
        gp = true;
        p.split(/([^]*)/).forEach(q => { if (!q) return;
          const m = q.match(/^([^]*)$/);
          if (m) { h += gapShow ? `<span class="gapl">${tokHTML({ ...k, t: m[1] })}</span>` : `<span class="gapb"${gapW === 'wort' ? ` style="width:${Math.max(10, m[1].length * 2.6).toFixed(1)}mm"` : ''}></span>`; t += m[1]; }
          else { const qq = q.replace(/[]/g, ''); h += tokHTML({ ...k, t: qq }).replace(GM_RE, '<sup class="gl">$1</sup>'); t += qq.replace(GM_RE, ''); } });
        continue;
      }
      h += tokHTML({ ...k, t: p }).replace(GM_RE, '<sup class="gl">$1</sup>');
      t += p.replace(GM_RE, '');
    }
  }
  push(); return words;
}
// Ältere Blätter: ^1-Zeichen im Text + Erklärungen zeilenweise → Glossar
function migrateGlossary(b) {
  if (Array.isArray(b.glossary)) { delete b.notes; return; }
  const notes = parseNotes(b.notes); const raw = String(b.text || '');
  const re = /([\p{L}\p{N}][\p{L}\p{N}-]*)\^(\d+)/gu;
  let out = '', last = 0, m; const marks = [];
  while ((m = re.exec(raw))) { out += raw.slice(last, m.index) + m[1]; marks.push({ term: m[1], start: out.length - m[1].length, num: m[2] }); last = m.index + m[0].length; }
  out += raw.slice(last);
  const gloss = [], used = new Set();
  const split = (s, term) => { const p = s.match(/^([^:]{1,80}):\s*(.*)$/); return p && (!term || normTerm(p[1]).toLowerCase() === term.toLowerCase()) ? [normTerm(p[1]), p[2]] : null; };
  for (const mk of marks) {
    const occ = occurrences(out, mk.term); let n = occ.findIndex(o => o.start === mk.start); if (n < 0) n = 0;
    const note = notes.find(x => x.n === mk.num); if (note) used.add(note);
    const sp = note ? split(note.text, mk.term) : null;
    gloss.push({ term: mk.term, n, text: sp ? sp[1] : (note ? note.text : '') });
  }
  notes.forEach(note => { if (used.has(note)) return; const sp = split(note.text); gloss.push({ term: sp ? sp[0] : '', n: 0, text: sp ? sp[1] : note.text }); });
  b.text = out; b.glossary = gloss; delete b.notes;
}

/* ---------- Bearbeiten: Fenster am Wort ---------- */
const gl = { open: null };
const rectOf = n => { const r = n.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
const narrowGloss = () => window.matchMedia('(max-width: 599px)').matches;
function glossRows(b) {
  const gm = glossMarks(b); const G = b.glossary || [];
  const rows = gm.list.map(x => { const i = G.indexOf(x.g); return `<div class="gl-row"><span class="gl-no">${x.no}</span><button type="button" class="gl-w" data-act="gl-edit" data-i="${i}" title="Bearbeiten">${esc(normTerm(x.g.term))}</button><input type="text" data-k="glossary.${i}.text" value="${esc(x.g.text)}" placeholder="Erklärung" aria-label="Erklärung zu ${esc(normTerm(x.g.term))}"><button class="ib" type="button" data-act="gl-remove" data-i="${i}" title="Worterklärung entfernen">${I.x}</button></div>`; }).join('')
    + gm.missing.map(g => { const i = G.indexOf(g); return `<div class="gl-row miss"><span class="gl-no">!</span><span class="gl-w">${esc(normTerm(g.term) || 'ohne Wort')}</span><span class="gl-miss">steht nicht mehr im Text</span><button class="ib" type="button" data-act="gl-remove" data-i="${i}" title="Entfernen">${I.x}</button></div>`; }).join('');
  return `<div class="f gl-box" data-gl="${b.id}"><span>Worterklärungen</span>${rows ? `<div class="gl-list">${rows}</div>` : ''}
    <div class="gl-add"><button class="btn" type="button" data-act="gl-add">+ Worterklärung</button><small>Wort im Text markieren oder in der Vorschau anklicken</small></div></div>`;
}
function openGloss(o) { o.sc = { p: $('#preview-scroll').scrollTop, e: $('#editor').scrollTop }; o.t0 = Date.now(); gl.open = o; renderGloss(); }
function closeGloss() { if (!gl.open) return; gl.open = null; renderGloss(); }
function openGlossFor(b, term, n, rect) {
  const count = occurrences(b.text, term).length;
  if (!count) { toast('Dieses Wort steht so nicht im Text.'); return; }
  const idx = (b.glossary || []).findIndex(g => normTerm(g.term) === term && (g.n || 0) === n);
  openGloss({ bid: b.id, term, n, count, idx, rect });
}
// Aus der Markierung im Textfeld des Editors
function termFromRaw(raw, s, e) {
  while (s < e && !isWordChar(raw[s])) s++;
  while (e > s && !isWordChar(raw[e - 1])) e--;
  if (e <= s) return null;
  while (s > 0 && isWordChar(raw[s - 1])) s--;
  while (e < raw.length && isWordChar(raw[e])) e++;
  const term = normTerm(raw.slice(s, e));
  const occ = occurrences(raw, term); let n = occ.findIndex(o => o.start === s); if (n < 0) n = occ.filter(o => o.start < s).length;
  return { term, n };
}
function glossFromTextarea(card, b, anchor) {
  const ta = card.querySelector('[data-k="text"]'); const rect = rectOf(anchor);
  const sel = getSelection();
  if (ta && ta.classList.contains('rtx') && sel.rangeCount && !sel.isCollapsed && ta.contains(sel.anchorNode)) {
    const r = rtSerialize(ta, { caret: sel.getRangeAt(0), plain: true }); const t = r.end > r.start ? termFromRaw(r.raw, r.start, r.end) : null;
    if (t) return openGlossFor(b, t.term, t.n, rect);
  }
  if (ta && ta.tagName === 'TEXTAREA' && ta.selectionEnd > ta.selectionStart) { const r = termFromRaw(ta.value, ta.selectionStart, ta.selectionEnd); if (r) return openGlossFor(b, r.term, r.n, rect); }
  openGloss({ bid: b.id, free: true, term: '', n: 0, count: 0, idx: -1, rect });
}
// Aus einem Klick (ein Wort) oder einer Markierung (mehrere Wörter) in der Vorschau
function gapToggle(bid, w) {
  const b = target(bid); if (!b || b.type !== 'material') return;
  const spans = [...document.querySelectorAll(`#pages [data-bid="${bid}"] .mat-body .w`)];
  const words = spans.map(s => s.dataset.t || ''); const offs = []; let off = 0; words.forEach(x => { offs.push(off); off += x.length + 1; });
  const plain = words.join(' '); const i0 = spans.indexOf(w); if (i0 < 0) return;
  let s = offs[i0], e = s + words[i0].length; while (s < e && !isWordChar(plain[s])) s++; while (e > s && !isWordChar(plain[e - 1])) e--; if (e <= s) return;
  const term = normTerm(plain.slice(s, e)); const occ = occurrences(plain, term); let n = occ.findIndex(o => o.start === s); if (n < 0) n = occ.filter(o => o.start < s).length;
  if (!occurrences(b.text, term)[n]) { toast('Dieses Wort lässt sich hier nicht als Lücke setzen.'); return; }
  const gs = Array.isArray(b.gaps) ? b.gaps : (b.gaps = []); const j = gs.findIndex(g => normTerm(g.term) === term && (g.n || 0) === n);
  if (j >= 0) gs.splice(j, 1); else gs.push({ term, n }); if (!gs.length) delete b.gaps;
  changed(true);
}
function glossFromSpans(bid, picked, rect) {
  const b = target(bid); if (!b || b.type !== 'material' || !String(b.text || '').trim()) return;
  if (picked.length === 1) {
    const sup = picked[0].querySelector('sup.gl');
    const x = sup && glossMarks(b).list[+sup.textContent - 1];
    if (x) return openGloss({ bid, term: normTerm(x.g.term), n: x.g.n || 0, count: occurrences(b.text, x.g.term).length, idx: b.glossary.indexOf(x.g), rect });
  }
  const spans = [...document.querySelectorAll(`#pages [data-bid="${bid}"] .mat-body .w`)];
  const words = spans.map(s => s.dataset.t || ''); const offs = []; let off = 0;
  words.forEach(w => { offs.push(off); off += w.length + 1; });
  const plain = words.join(' ');
  const i0 = spans.indexOf(picked[0]), i1 = spans.indexOf(picked[picked.length - 1]); if (i0 < 0 || i1 < 0) return;
  let s = offs[i0], e = offs[i1] + words[i1].length;
  while (s < e && !isWordChar(plain[s])) s++;
  while (e > s && !isWordChar(plain[e - 1])) e--;
  if (e <= s) return;
  const term = normTerm(plain.slice(s, e));
  const occ = occurrences(plain, term); let n = occ.findIndex(o => o.start === s); if (n < 0) n = occ.filter(o => o.start < s).length;
  openGlossFor(b, term, n, rect);
}
