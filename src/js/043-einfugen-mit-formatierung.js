/* ---------- Einfügen mit Formatierung (Word, Google Docs, Webseiten, andere Textfelder) ---------- */
const HL_WORDS = /^(yellow|lime|aqua|cyan|fuchsia|magenta|pink|lightgreen|lightblue|lightyellow|gold|khaki|orange|greenyellow|lightpink)$/i;
function isHighlight(bg, styleAttr) {
  if (/mso-highlight/i.test(styleAttr || '')) return true;
  if (!bg || /^(transparent|initial|inherit|unset|none)$/.test(bg)) return false;
  if (HL_WORDS.test(bg)) return true;
  const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/); if (!m) return false;
  const r = +m[1], g = +m[2], b = +m[3], a = m[4] == null ? 1 : +m[4]; if (a < .3) return false;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mx > 170 && (mx - mn) / mx > .3; // helle, kräftige Farbe = Textmarker; Weiß, Grau und Dunkles nicht
}
function htmlToRaw(html, mode, opt = {}) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Emojis, die als Bild mit alt-Text kommen (X/Twitter, Facebook, WhatsApp Web …), werden zu Text; andere Bilder fallen weg
  doc.querySelectorAll('img').forEach(n => { const a = emojiAlt(n); if (a) n.replaceWith(doc.createTextNode(a)); });
  doc.querySelectorAll('script,style,head,title,meta,link,noscript,template,iframe,object,embed,svg,img,video,audio,canvas,button,input,select,textarea,rt,rp').forEach(n => n.remove());
  const LEAF = 'p,h1,h2,h3,h4,h5,h6,li';
  // Gedicht: Jeder Absatz ein Vers, wenn Strophen durch leere Absätze getrennt sind (so schreibt Word) oder es gar keine Zeilenumbrüche gibt
  let verseP = false;
  if (opt.poem) {
    const leaves = [...doc.body.querySelectorAll(LEAF + ',div')].filter(x => !x.querySelector(LEAF + ',div'));
    verseP = leaves.length > 1 && (leaves.some(x => !x.textContent.replace(/[\s\u00A0]/g, '')) || !doc.body.querySelector('br'));
  }
  const paras = []; let para = null, line = null, pend = null, brRun = 0, pendPre = '';
  const rank = { line: 1, para: 2 };
  const brk = k => { if (!pend || rank[k] > rank[pend]) pend = k; };
  const has = L => L.runs.some(r => r.gap || r.sup != null || (r.t && r.t.trim()));
  const nl = () => ({ pre: pendPre, runs: [] });
  const put = r => {
    if (r.t != null && !r.sup && !r.t.trim() && (!para || pend || !has(line))) return; // Leerraum zwischen Absätzen
    if (!para) { para = [line = nl()]; paras.push(para); }
    else if (pend === 'para' && para.some(has)) { para = [line = nl()]; paras.push(para); }
    else if (pend && has(line)) para.push(line = nl());
    else if (pendPre) line.pre = pendPre;
    pend = null; pendPre = ''; brRun = 0;
    if (r.t != null && !r.sup) {
      let t = r.t; const last = line.runs[line.runs.length - 1];
      if (!line.runs.length || (last && last.t != null && / $/.test(last.t))) t = t.replace(/^ +/, '');
      if (!t) return; r.t = t;
      if (last && last.t != null && !last.sup && RT_FL.every(f => (last[f] || 0) === (r[f] || 0))) { last.t += t; return; }
    }
    line.runs.push(r);
  };
  const flagsOf = (el, fl) => {
    const f = { ...fl }, tn = el.nodeName, st = el.style || {}, sa = el.getAttribute('style') || '';
    if (/^(B|STRONG|H[1-6]|TH|DT)$/.test(tn)) f.b = 1;
    if (/^(I|EM|CITE|DFN|VAR)$/.test(tn)) f.i = 1;
    if (tn === 'U' || tn === 'INS') f.u = 1;
    if (tn === 'MARK') f.m = 1;
    const fw = st.fontWeight; if (fw) f.b = fw === 'bold' || fw === 'bolder' || +fw >= 600 ? 1 : 0;
    if (st.fontStyle) f.i = /italic|oblique/.test(st.fontStyle) ? 1 : 0;
    const td = (tn === 'A' || (el.closest && el.closest('a[href]'))) ? '' : (st.textDecorationLine || st.textDecoration); if (td) f.u = /underline/.test(td) ? 1 : /none/.test(td) ? 0 : f.u;
    if (isHighlight(st.backgroundColor, sa)) f.m = 1;
    return f;
  };
  const walk = (node, fl, ctx) => {
    for (const n of node.childNodes) {
      if (n.nodeType === 3) {
        let t = n.nodeValue;
        if (ctx.pre) { t.replace(/\r/g, '').split('\n').forEach((part, i) => { if (i) brk('line'); if (part) put({ t: part.replace(/\t/g, '    '), ...fl }); }); continue; }
        t = t.replace(/[\s\u00A0]+/g, ' '); if (t) put({ t, ...fl });
        continue;
      }
      if (n.nodeType !== 1) continue;
      const tag = n.nodeName;
      if (tag === 'BR') { if (brRun >= 1 && pend === 'line') brk('para'); else brk('line'); brRun++; continue; }
      if (tag === 'SUP' && /^\s*(\d+|\*)\s*$/.test(n.textContent)) { put({ t: n.textContent.trim(), sup: n.textContent.trim() }); continue; }
      if (tag === 'IMG') { const alt = emojiAlt(n); if (alt) put({ t: alt, ...fl }); continue; }
      if (tag === 'UL' || tag === 'OL') { brk('para'); walk(n, fl, { ...ctx, list: tag, n: 0 }); brk('para'); continue; }
      if (tag === 'LI') {
        ctx.n = (ctx.n || 0) + 1;
        if (mode === 'full') { brk('line'); pendPre = ctx.list === 'OL' ? 'ol' : 'ul'; walk(n, flagsOf(n, fl), ctx); brk('line'); }
        else { brk(mode === 'inline' ? 'para' : 'line'); put({ t: ctx.list === 'OL' ? ctx.n + '. ' : '• ', ...fl }); walk(n, flagsOf(n, fl), ctx); brk(mode === 'inline' ? 'para' : 'line'); }
        continue;
      }
      if (tag === 'TD' || tag === 'TH') { walk(n, flagsOf(n, fl), ctx); put({ t: ' ', ...fl }); continue; }
      if (tag === 'TR') { brk(mode === 'full' ? 'line' : 'para'); walk(n, fl, ctx); brk(mode === 'full' ? 'line' : 'para'); continue; }
      if (/^(P|H[1-6]|BLOCKQUOTE|PRE|SECTION|ARTICLE|HEADER|FOOTER|ASIDE|NAV|MAIN|FIGURE|FIGCAPTION|ADDRESS|DL|DT|DD|TABLE|CENTER|FORM|FIELDSET)$/.test(tag)) {
        const empty = !n.textContent.replace(/[\s\u00A0]/g, '') && !n.querySelector('img');
        if (opt.hd && !verseP && /^H[1-6]$/.test(tag) && !empty) { brk('para'); pendPre = 'h'; walk(n, flagsOf(n, fl), ctx); brk('para'); continue; }
        if (empty && !verseP && para && para.some(has)) { para.extra = (para.extra || 0) + 1; brk('para'); continue; }
        if (verseP && /^(P|H[1-6])$/.test(tag)) { brk(empty ? 'para' : 'line'); if (!empty) walk(n, flagsOf(n, fl), ctx); brk('line'); continue; }
        brk('para'); walk(n, flagsOf(n, fl), tag === 'PRE' ? { ...ctx, pre: true } : ctx); brk('para'); continue;
      }
      if (tag === 'DIV') {
        // Wie in den Textfeldern: ein DIV ist eine Zeile, ein leeres DIV eine Leerzeile (= neuer Absatz)
        const empty = !n.textContent.replace(/[\s\u00A0]/g, '');
        if (empty && !n.querySelector('img')) { if (!opt.poem && para && para.some(has) && pend === 'para') para.extra = (para.extra || 0) + 1; brk('para'); continue; }
        brk('line'); walk(n, flagsOf(n, fl), ctx); brk('line'); continue;
      }
      walk(n, flagsOf(n, fl), ctx);
    }
  };
  walk(doc.body, { b: 0, i: 0, u: 0, m: 0 }, {});
  const lines = [];
  paras.forEach(p => {
    const ls = p.filter(has); if (!ls.length) return;
    if (lines.length) { lines.push({ pre: '', runs: [] }); for (let k = 0; k < (lines.extra || 0); k++) lines.push({ pre: '', runs: [] }); }
    lines.extra = p.extra || 0;
    ls.forEach(L => {
      const tx = L.runs.filter(r => r.t != null && !r.sup);
      if (tx.length) { tx[tx.length - 1].t = tx[tx.length - 1].t.replace(/\s+$/, ''); }
      L.runs = quoteToks(L.runs.filter(r => r.gap || r.sup != null || r.t));
      lines.push(L);
    });
  });
  const out = emitLines(lines, mode);
  return mode === 'line' ? out.filter(Boolean).join(' ') : out.join('\n').replace(/\n{6,}/g, '\n\n\n\n\n').trim();
}
// Gespeicherten Text an der Schreibmarke einsetzen (mit Rückgängig)
function rtInsertRaw(rt, raw) {
  const mode = rt.dataset.rt;
  if (mode === 'line' || !raw.includes('\n')) { document.execCommand('insertHTML', false, inlineTokens(raw.replace(/\s*\n\s*/g, ' ')).map(edTok).join('')); return; }
  document.execCommand('insertHTML', false, richHTML(raw, mode, rt.dataset.hd));
}
// Reiner Text ohne Leerzeilen, dessen Zeilen wie ganze Absätze aussehen (Word, Webseiten): Zeilen als Absätze
function guessParas(t) {
  if (/\n[ \t]*\n/.test(t)) return t;
  const L = t.split('\n').map(x => x.trim()).filter(Boolean); if (L.length < 2) return t;
  const ends = L.filter(x => /[.!?:;“"»«)…]$/.test(x)).length / L.length;
  const avg = L.reduce((a, x) => a + x.length, 0) / L.length;
  return ends >= .7 || avg >= 110 ? L.join('\n\n') : t;
}
let plainPasteUntil = 0;

function rtCaretEnd(el) { const rg = document.createRange(); rg.selectNodeContents(el); rg.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(rg); }
// Text setzen und die Schreibmarke an eine Stelle im gespeicherten Text legen
function rtSetRaw(el, raw, caret) {
  const C = '';
  el.innerHTML = richHTML(caret == null ? raw : raw.slice(0, caret) + C + raw.slice(caret), el.dataset.rt, el.dataset.hd);
  el.classList.toggle('is-empty', !String(raw).trim());
  el.focus({ preventScroll: true });
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
  while (caret != null && (n = w.nextNode())) {
    const i = n.nodeValue.indexOf(C); if (i < 0) continue;
    n.nodeValue = n.nodeValue.slice(0, i) + n.nodeValue.slice(i + 1);
    const rg = document.createRange(); rg.setStart(n, i); rg.collapse(true); const s = getSelection(); s.removeAllRanges(); s.addRange(rg); return;
  }
  rtCaretEnd(el);
}
function rtSelectText(el, str) {
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { const i = n.nodeValue.indexOf(str); if (i >= 0) { const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + str.length); const s = getSelection(); s.removeAllRanges(); s.addRange(rg); return true; } }
  return false;
}
const rtField = (k, v, o = {}) => { const mode = o.mode || 'full'; return `<div class="rtx rtx-${mode}${o.cls ? ' ' + o.cls : ''}${String(v ?? '').trim() ? '' : ' is-empty'}" contenteditable="true" role="textbox"${mode === 'line' ? '' : ' aria-multiline="true"'} aria-label="${esc(o.aria || '')}" spellcheck="true" data-k="${k}" data-rt="${mode}" data-ph="${esc(o.ph || '')}" ${o.hd ? ' data-hd="1"' : ''} style="--rows:${o.rows || (mode === 'line' ? 1 : 3)}">${richHTML(v, mode, o.hd)}</div>`; };
// Word-artiges Fenster: Kopfzeile, feste Leiste, weiße Seite auf grauem Grund, Wortzahl, Vergrößern
const MW_IC = {};
const mwIc = k => { if (!(k in MW_IC)) { const b = document.querySelector(`#rt-bar [data-rt="${k}"]`); MW_IC[k] = b ? b.innerHTML : k; } return MW_IC[k]; };
const mwWords = v => { const n = (plainText(tfStr(v)).match(/\S+/g) || []).length; return n === 1 ? '1 Wort' : n + ' Wörter'; };
const fmtSel = (b, key) => { const f = matFmt(b); const d = MAT_FMT[key]; return `<select class="mw-sel mw-sel-${key}" data-fmtsel="${key}" aria-label="${d.label}" title="${d.label} (gilt für den ganzen Text)">${d.opts.map(([v, t]) => `<option value="${v}"${f[key] === v ? ' selected' : ''}${key === 'font' ? ` style="font-family:${fmtFF(v).replace(/"/g, "'")}"` : ''}>${t}</option>`).join('')}</select>`; };
function fWord(k, label, v, o = {}) {
  const big = state.mwBig === o.bid; const ob = o.bid && state.sheet.blocks.find(x => x.id === o.bid); const fm = ob ? matFmt(ob) : null;
  const T = [['b', 'Fett (Strg+B)'], ['i', 'Kursiv (Strg+I)'], ['u', 'Unterstrichen (Strg+U)'], ['m', 'Textmarker (Strg+Umschalt+H)'], '|', ...(o.hd ? [['h', 'Zwischenüberschrift (oder „## “ am Zeilenanfang)'], '|'] : []), ['x', 'Formatierung entfernen'], '|', ...(o.gl ? [['gl', 'Markiertes Wort oder markierte Wortgruppe erklären (z. B. Übersetzung einer Wendung)', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V6a2 2 0 0 1 2-2h12v13H6a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12"/><path d="M9 8.5h5M9 12h3"/></svg><span class="mw-tl">Worterklärung</span>'], '|'] : []),
    ['undo', 'Rückgängig (Strg+Z)', '↶'], ['redo', 'Wiederholen (Strg+Y)', '↷']];
  const BIG = ['<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2h4v4M6 14H2v-4M14 2 9.5 6.5M2 14l4.5-4.5"/></svg>', '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 6.5h-4v-4M2.5 9.5h4v4M9.5 6.5 14 2M6.5 9.5 2 14"/></svg>'];
  return `<div class="f rt-f mw-f"><span>${label}</span><div class="mw-word${big ? ' mw-max' : ''}" data-mw="${esc(o.bid || '')}"${fm ? ` style="--mwff:${fmtFF(fm.font).replace(/"/g, "'")};--mwfs:${(FMT_SIZE[fm.size] / 10.5 * 15).toFixed(1)}px"` : ''}>
    <div class="mw-wh"><span>${esc(o.head || label)}</span><button type="button" class="mw-big" data-act="mw-big" aria-pressed="${big}" title="${big ? 'Fenster verkleinern (Esc)' : 'Fenster groß machen'}">${BIG[big ? 1 : 0]}<span>${big ? 'Verkleinern' : 'Vergrößern'}</span></button></div>
    <div class="mw-wt" role="toolbar" aria-label="Formatierung">${ob && ob.type === 'material' ? fmtSel(ob, 'font') + fmtSel(ob, 'size') + (ob.form !== 'gedicht' ? mwHyBtn(ob) : '') + '<span class="mw-sep"></span>' : ''}${T.map(x => x === '|' ? '<span class="mw-sep"></span>' : `<button type="button" data-mwc="${x[0]}" title="${x[1]}" aria-label="${x[1]}"${/^[biumh]$/.test(x[0]) ? ' aria-pressed="false"' : ''}>${x[2] || mwIc(x[0])}</button>`).join('')}</div>
    <div class="mw-wpg">${rtField(k, v, { aria: label, ...o, cls: ((o.cls || '') + ' mw-wp').trim() })}</div>
    <div class="mw-ws"><span class="mw-wc">${mwWords(v)}</span><span>wird automatisch gespeichert</span></div></div>${o.hint ? `<small class="fh">${o.hint}</small>` : ''}</div>`;
}
function mwBigSet(id) {
  state.mwBig = id || null; document.body.classList.toggle('mw-max-on', !!state.mwBig);
  document.querySelectorAll('#editor .mw-word').forEach(w => { const on = !!id && w.dataset.mw === id; w.classList.toggle('mw-max', on);
    const bt = w.querySelector('.mw-big'); if (bt) { bt.setAttribute('aria-pressed', on); bt.title = on ? 'Fenster verkleinern (Esc)' : 'Fenster groß machen'; bt.querySelector('span').textContent = on ? 'Verkleinern' : 'Vergrößern'; }
    if (on) { const f = w.querySelector('.rtx'); if (f) { f.focus(); rtCaretEnd(f); } } });
}
function mwState() {
  const f = rtFieldSel(); document.querySelectorAll('#editor .mw-wt [aria-pressed]').forEach(bt => {
    const inF = f && bt.closest('.mw-word').contains(f); let on = false;
    if (inF) { const c = bt.dataset.mwc; try { if (c === 'm') on = rtMarked(); else if (c === 'h') on = /^h\d$/i.test(document.queryCommandValue('formatBlock')); else on = document.queryCommandState({ b: 'bold', i: 'italic', u: 'underline' }[c]); } catch {} }
    bt.setAttribute('aria-pressed', on ? 'true' : 'false'); });
}
const mwHyOn = b => b.hy != null ? !!b.hy : !(state.sheet.meta || {}).noHy;
const mwHyBtn = b => { const on = mwHyOn(b); return `<button type="button" class="mw-hy" data-mwc="hy" role="switch" aria-checked="${on}" title="Silbentrennung in diesem Material ${on ? 'ausschalten' : 'einschalten'}"><span class="mw-tl" style="margin:0">Silben­trennung</span><i class="mw-sw"></i></button>`; };
function mwCmd(btn) {
  if (btn.dataset.mwc === 'hy') { const card = btn.closest('[data-bid]'); const b = card && target(card.dataset.bid); if (!b) return; const on = !mwHyOn(b); b.hy = on; btn.setAttribute('aria-checked', on); btn.title = `Silbentrennung in diesem Material ${on ? 'ausschalten' : 'einschalten'}`; changed(); toast(on ? 'Silbentrennung in diesem Material an' : 'Silbentrennung in diesem Material aus'); return; }
  const w = btn.closest('.mw-word'); const f = w && w.querySelector('.rtx'); if (!f) return; const c = btn.dataset.mwc;
  if (!f.contains(getSelection().anchorNode)) { f.focus(); rtCaretEnd(f); }
  if (c === 'gl') { const card = btn.closest('.card'); const b = card && target(card.dataset.bid); if (b) glossFromTextarea(card, b, btn); return; }
  if (c === 'undo' || c === 'redo') { try { document.execCommand(c); } catch {} } else rtCmd(c);
  mwState(); const wc = w.querySelector('.mw-wc'); if (wc) wc.textContent = mwWords(f.innerText);
}
const fRich = (k, label, v, o = {}) => `<div class="f rt-f"><span>${label}</span>${rtField(k, v, { aria: label, ...o })}${o.hint ? `<small class="fh">${o.hint}</small>` : ''}</div>`;

