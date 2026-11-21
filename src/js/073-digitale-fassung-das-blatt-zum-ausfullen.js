/* ================= Digitale Fassung: das Blatt zum Ausfüllen am Tablet =================
   Die Seiten werden genau wie beim Drucken gesetzt (gleiche Zeilennummern) und als eigenständige Seite ausgegeben.
   Lücken, Zuordnen, Ankreuzfelder, Tabellenzellen und Schreibflächen werden darin ausfüllbar; „Prüfen“ vergleicht mit den Lösungen.
   Online: Tabelle ab_digital, Schüler lesen nur über ab_digital_get mit der ID aus dem Link. */
const DG_BASE = 'https://moritzbauer171-art.github.io/Abbaukasten/';
const DG_FONTS = 'https://' + 'fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;0,7..72,700;1,7..72,400;1,7..72,600&family=Special+Elite&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,700;0,800;1,600&family=UnifrakturMaguntia&family=Caveat:wght@500;700&family=Andika:wght@400;700&family=Fredoka:wght@500;600;700&family=Archivo+Black&display=swap';
const LS_DGOPT = 'abw.dgopt';
const dgLink = id => DG_BASE + '#d=' + id;
const dgOnline = () => !!(backend && backend.kind === 'supabase' && store.sb);
function dgId() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'; const r = new Uint8Array(12); crypto.getRandomValues(r); return [...r].map(x => A[x % A.length]).join(''); }
// Läuft in der digitalen Fassung selbst (als Text eingebettet), darf also nichts aus dem Programm verwenden
function dgRuntime(K) {
  const $ = (q, r) => (r || document).querySelector(q), $$ = (q, r) => [...(r || document).querySelectorAll(q)];
  const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const LSK = 'abw-digital:' + K.id; let S = {};
  try { S = JSON.parse(localStorage.getItem(LSK) || '{}') || {}; } catch (e) { S = {}; }
  let tS = 0; const save = () => { clearTimeout(tS); tS = setTimeout(() => { try { localStorage.setItem(LSK, JSON.stringify(S)); } catch (e) {} }, 200); };
  const root = $('#printroot'), res = $('#dg-res'), panel = $('#dg-panel');
  let lv = S.lv && K.vars[S.lv] ? S.lv : K.def, showSol = false;
  const D = () => (S[lv] = S[lv] || { g: {}, f: {}, m: {}, a: {}, c: {}, w: {}, t: {}, ans: {}, tip: {} });
  const norm = t => String(t || '').toLowerCase().replace(/[„“”"‚‘’'«»().,;:!?…–—-]/g, '').replace(/\s+/g, ' ').trim();
  const mk = (tag, cls) => { const e = document.createElement(tag); e.className = cls; if (tag === 'input') { e.type = 'text'; e.autocomplete = 'off'; e.spellcheck = false; e.setAttribute('autocapitalize', 'off'); e.setAttribute('autocorrect', 'off'); } return e; };
  const XP = '<path d="M3 3l6 6M9 3l-6 6" stroke="#1C1F27" stroke-width="1.2" stroke-linecap="round"/>';
  // Antworten mit Formatierung: nur einfache, sichere Auszeichnungen bleiben erhalten
  const TAGS = { B: 'b', STRONG: 'b', I: 'i', EM: 'i', U: 'u', S: 's', STRIKE: 's', DEL: 's', UL: 'ul', OL: 'ol', LI: 'li', BR: 'br', P: 'p', DIV: 'div', BLOCKQUOTE: 'blockquote', MARK: 'mark' };
  function clean(html) {
    // DOMParser: fremdes HTML wird nur gelesen, nie ausgeführt oder geladen
    const box = new DOMParser().parseFromString('<body>' + (html || '') + '</body>', 'text/html').body;
    const walk = n => [...n.childNodes].map(c => {
      if (c.nodeType === 3) return esc(c.nodeValue); if (c.nodeType !== 1) return '';
      const t = c.tagName; if (/^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT|IFRAME|OBJECT|EMBED|SVG|MATH|HEAD|TITLE|META|LINK|XML)$/.test(t)) return ''; const inner = walk(c);
      if (t === 'SPAN' || t === 'FONT') { const st = c.getAttribute('style') || ''; let h = inner;
        if (/background(-color)?\s*:\s*(?!transparent|rgba\(0,\s*0,\s*0,\s*0\)|initial|inherit)[^;]+/i.test(st)) h = `<mark>${h}</mark>`;
        if (/font-weight\s*:\s*(bold|[6-9]00)/i.test(st)) h = `<b>${h}</b>`; if (/font-style\s*:\s*italic/i.test(st)) h = `<i>${h}</i>`;
        if (/text-decoration[^;]*underline/i.test(st)) h = `<u>${h}</u>`; if (/text-decoration[^;]*line-through/i.test(st)) h = `<s>${h}</s>`; return h; }
      const m = TAGS[t]; if (!m) return inner; return m === 'br' ? '<br>' : `<${m}>${inner}</${m}>`;
    }).join('');
    return walk(box).replace(/(<br>)+$/, '');
  }
  const ansHTML = v => /<(b|i|u|s|br|div|p|ul|ol|li|mark|blockquote)\b/i.test(v || '') ? clean(v) : esc(v || '').replace(/\n/g, '<br>');
  const textOf = v => { const x = document.createElement('div'); x.innerHTML = ansHTML(v); return (x.textContent || '').trim(); };
  const WT = [['bold', '<b>F</b>', 'Fett (Strg+B)'], ['italic', '<i>K</i>', 'Kursiv (Strg+I)'], ['underline', '<u>U</u>', 'Unterstrichen (Strg+U)'], ['strikeThrough', '<s>S</s>', 'Durchgestrichen'], '|',
    ['insertUnorderedList', '•&#8202;≡', 'Aufzählung'], ['insertOrderedList', '1.≡', 'Nummerierung'], ['outdent', '⇤', 'Einzug verkleinern'], ['indent', '⇥', 'Einzug vergrößern'], '|',
    ['hilite', '<span class="dg-mk">ab</span>', 'Textmarker'], ['removeFormat', 'A<sub>×</sub>', 'Formatierung entfernen'], '|', ['undo', '↶', 'Rückgängig (Strg+Z)'], ['redo', '↷', 'Wiederholen (Strg+Y)']];
  const BIG_SVG = ['<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2h4v4M6 14H2v-4M14 2 9.5 6.5M2 14l4.5-4.5"/></svg>', '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 6.5h-4v-4M2.5 9.5h4v4M9.5 6.5 14 2M6.5 9.5 2 14"/></svg>'];
  const bigBtn = () => `<button type="button" class="dg-wbig" data-a="big" aria-pressed="${!!S.wbig}" title="${S.wbig ? 'Antwortfeld verkleinern (Esc)' : 'Antwortfeld groß machen'}">${BIG_SVG[S.wbig ? 1 : 0]}<span>${S.wbig ? 'Verkleinern' : 'Vergrößern'}</span></button>`;
  function setBig(on) {
    S.wbig = !!on; save(); panel.classList.toggle('dg-wmax', S.wbig); document.body.classList.toggle('dg-wmax-on', S.wbig && !panel.hidden);
    const ed = $('.dg-wp', panel); const had = ed && document.activeElement === ed;
    const b = $('.dg-wbig', panel); if (b) b.outerHTML = bigBtn();
    if (had) ed.focus({ preventScroll: true });
  }
  const wordHTML = () => `<div class="dg-word"><div class="dg-wh"><span>${K.du ? 'Deine Antwort' : 'Ihre Antwort'}</span>${bigBtn()}</div><div class="dg-wt" role="toolbar" aria-label="Formatierung">${WT.map(x => x === '|' ? '<span class="dg-sep"></span>' : `<button type="button" data-c="${x[0]}" title="${x[2]}" aria-label="${x[2]}"${/^(bold|italic|underline|strikeThrough|insert)/.test(x[0]) ? ' aria-pressed="false"' : ''}>${x[1]}</button>`).join('')}</div>
    <div class="dg-wpg"><div class="dg-wp" contenteditable="true" role="textbox" aria-multiline="true" aria-label="${K.du ? 'Deine Antwort' : 'Ihre Antwort'}" data-ph="${K.du ? 'Hier schreiben …' : 'Hier schreiben …'}" spellcheck="true" lang="de"></div></div>
    <div class="dg-ws"><span class="dg-wc">0 Wörter</span><span>wird automatisch gespeichert</span></div></div>`;
  function wState() { const ed = $('.dg-wp', panel); if (!ed) return; const sel = getSelection(); const inside = sel && sel.rangeCount && ed.contains(sel.anchorNode);
    $$('.dg-wt [aria-pressed]', panel).forEach(bt => { let on = false; try { on = !!(inside && document.queryCommandState(bt.dataset.c)); } catch (e) {} bt.setAttribute('aria-pressed', String(on)); }); }
  function wSave() { const ed = $('.dg-wp', panel); if (!ed) return; const k = panel.dataset.k; const v = clean(ed.innerHTML); const txt = (ed.innerText || '').trim(); D().ans[k] = txt ? v : ''; save();
    const wc = $('.dg-wc', panel); if (wc) { const n = (txt.match(/\S+/g) || []).length; wc.textContent = n === 1 ? '1 Wort' : n + ' Wörter'; }
    const ic = $(`.task[data-k="${k}"] .dg-ic[data-a="ans"]`, root); if (ic) ic.classList.toggle('on', !!txt); }
  function wCmd(c) { const ed = $('.dg-wp', panel); if (!ed) return; ed.focus();
    try { if (c === 'hilite') { document.execCommand('styleWithCSS', false, true); const on = document.queryCommandValue('hiliteColor'); const has = on && !/transparent|rgba\(0, 0, 0, 0\)|^$/.test(on); document.execCommand('hiliteColor', false, has ? 'transparent' : '#FFF0A0'); document.execCommand('styleWithCSS', false, false); }
      else { document.execCommand('styleWithCSS', false, false); document.execCommand(c, false, null); } } catch (e) {}
    wSave(); wState(); }
  function setCk(sv, on) { sv.classList.toggle('x', on); const p = sv.querySelector('path'); if (on && !p) sv.insertAdjacentHTML('beforeend', XP); if (!on && p) p.remove(); sv.setAttribute('aria-checked', String(on)); }
  function fit() {
    const ps = $$('.pout', root); if (!ps.length) return;
    const w = Math.max(...ps.map(p => p.offsetWidth)); const z = Math.max(.3, Math.min(1.4, (document.documentElement.clientWidth - 16) / w));
    root.style.zoom = String(z); $$('.blk-match.dg-lin', root).forEach(draw);
  }
  function nameFill() { $$('.hd-fields span', root).forEach(sp => { if (/^\s*Name/.test(sp.textContent)) { const i = sp.querySelector('i'); if (i) { i.textContent = S.name || ''; i.classList.add('dg-nm-i'); } } }); }
  function mount() {
    root.innerHTML = K.vars[lv]; const d = D(); const ci = {}, ti = {}; let fi = 0, ck = 0, wi = 0, ai = 0, ei = 0;
    $$('.blk-mat', root).forEach(m => { const bid = m.dataset.bid; $$('.gapb', m).forEach(g => { const n = ci[bid] || 0; ci[bid] = n + 1; const k = bid + ':' + n; const inp = mk('input', 'gapb dg-gap'); inp.style.cssText = g.style.cssText; inp.dataset.k = k; inp.value = d.g[k] || ''; inp.setAttribute('aria-label', 'Lücke ' + (n + 1)); g.replaceWith(inp); }); });
    $$('.gap', root).forEach(g => { const k = 'f' + (fi++); const inp = mk('input', 'gap dg-free'); inp.dataset.k = k; inp.value = d.f[k] || ''; if (g.style.width) inp.style.width = g.style.width; g.replaceWith(inp); });
    $$('.tf-ge', root).forEach(g => { const k = 'e' + (ei++); const e = mk('div', 'dg-cell dg-tfe'); e.contentEditable = 'true'; e.dataset.k = k; e.textContent = d.w[k] || ''; e.setAttribute('style', g.getAttribute('style') || ''); e.setAttribute('aria-label', 'Eintrag im Tafelbild'); g.replaceWith(e); });
    $$('.blk-match', root).forEach(b => {
      const bid = b.dataset.bid, M = K.match[bid]; if (!M) return;
      if (M.mode === 'abc') { $$('.mt-box', b).forEach((bx, k) => { const inp = mk('input', 'dg-abc'); inp.maxLength = 2; inp.dataset.k = bid + ':' + k; inp.value = d.a[inp.dataset.k] || ''; inp.setAttribute('autocapitalize', 'characters'); inp.setAttribute('aria-label', 'Buchstabe zu ' + (k + 1)); bx.textContent = ''; bx.appendChild(inp); }); return; }
      b.classList.add('dg-lin'); b.insertAdjacentHTML('beforeend', '<svg class="dg-lines" aria-hidden="true"></svg>');
      $$('.mt-l', b).forEach((el, i) => { el.dataset.i = i; el.tabIndex = 0; el.setAttribute('role', 'button'); });
      $$('.mt-r', b).forEach((el, i) => { el.dataset.i = i; el.tabIndex = 0; el.setAttribute('role', 'button'); });
    });
    $$('svg.ck', root).forEach(sv => { const k = 'c' + (ck++); sv.dataset.k = k; sv.setAttribute('role', 'checkbox'); sv.setAttribute('tabindex', '0'); if (k in d.c) setCk(sv, !!d.c[k]); else sv.setAttribute('aria-checked', String(sv.classList.contains('x'))); });
    $$('.tb td', root).forEach(td => { if (td.classList.contains('ckc') || td.textContent.trim() || td.querySelector('img,svg,input')) return; const k = 'w' + (wi++); const e = mk('div', 'dg-cell'); e.contentEditable = 'true'; e.dataset.k = k; e.textContent = d.w[k] || ''; td.classList.add('dg-td'); td.appendChild(e); });
    $$('.blk-lines', root).forEach(bl => { const k = 'a' + (ai++); const ta = mk('textarea', 'dg-area'); ta.dataset.k = k; ta.value = d.t[k] || ''; ta.setAttribute('aria-label', 'Schreibfläche'); if (bl.querySelector('.grid-area')) ta.classList.add('grid'); bl.appendChild(ta); });
    $$('.blk-tasks', root).forEach(b => { const bid = b.dataset.bid; $$('.task', b).forEach(t => {
      const n = ti[bid] || 0; ti[bid] = n + 1; const k = bid + ':' + n; t.dataset.k = k;
      const tips = K.tipsOn ? (K.tips[lv + '|' + k] || []) : []; let h = '';
      if (tips.length) h += `<button type="button" class="dg-ic" data-a="tip" title="Tipp" aria-label="Tipp">?</button>`;
      if (ansOn(k)) h += `<button type="button" class="dg-ic${textOf(d.ans[k]) ? ' on' : ''}" data-a="ans" title="Antwort schreiben" aria-label="Antwort schreiben">✎</button>`;
      if (h) t.insertAdjacentHTML('beforeend', `<span class="dg-tt">${h}</span>`);
    }); });
    nameFill(); showSol = false; const sb = $('#dg-sol'); if (sb) { sb.textContent = 'Lösung'; sb.setAttribute('aria-pressed', 'false'); }
    res.hidden = true; $$('[data-lv]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.lv === lv)));
    fit();
  }
  function dotXY(b, el) { const br = b.getBoundingClientRect(), r = el.querySelector('.mt-dot').getBoundingClientRect(); const s = b.offsetWidth / (br.width || 1); return [(r.left + r.width / 2 - br.left) * s, (r.top + r.height / 2 - br.top) * s]; }
  function draw(b) {
    const sv = $('.dg-lines', b); if (!sv) return; const bid = b.dataset.bid, M = K.match[bid], map = D().m[bid] || {};
    const L = $$('.mt-l', b), R = $$('.mt-r', b); sv.setAttribute('viewBox', `0 0 ${b.offsetWidth} ${b.offsetHeight}`); sv.setAttribute('width', b.offsetWidth); sv.setAttribute('height', b.offsetHeight);
    const line = (li, rk, cls) => { if (!L[li] || !R[rk]) return ''; const [x1, y1] = dotXY(b, L[li]), [x2, y2] = dotXY(b, R[rk]); return `<line class="${cls}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`; };
    const flip = e => e.map(([x, y]) => [y, x]);
    const pairs = b.dataset.show === '1' ? (M.many ? flip(Object.entries(M.sol)) : Object.entries(M.sol)) : (M.many ? flip(Object.entries(map)) : Object.entries(map));
    const good = (li, rk) => M.many ? M.sol[rk] != null && +M.sol[rk] === +li : M.sol[li] != null && +M.sol[li] === +rk;
    sv.innerHTML = pairs.map(([li, rk]) => line(+li, +rk, b.dataset.show === '1' ? 'sol' : b.dataset.chk === '1' ? (good(li, rk) ? 'ok' : 'no') : '')).join('');
    const on = new Set(pairs.map(([li]) => 'l' + li).concat(pairs.map(([, rk]) => 'r' + rk)));
    L.forEach((el, i) => el.classList.toggle('dg-con', on.has('l' + i))); R.forEach((el, i) => el.classList.toggle('dg-con', on.has('r' + i)));
  }
  function pick(it) {
    const b = it.closest('.blk-match'), bid = b.dataset.bid, side = it.classList.contains('mt-l') ? 'l' : 'r', i = +it.dataset.i; const d = D(); const map = d.m[bid] = d.m[bid] || {};
    delete b.dataset.chk; const sel = b.dataset.sel || ''; const clear = () => { delete b.dataset.sel; $$('.dg-sel', b).forEach(x => x.classList.remove('dg-sel')); };
    if (!sel) { b.dataset.sel = side + ':' + i; it.classList.add('dg-sel'); return; }
    const [ss, si] = sel.split(':'); clear();
    const many = !!(K.match[bid] && K.match[bid].many);
    if (ss === side) { if (+si === i) { const own = many ? side === 'r' : side === 'l'; if (own) delete map[i]; else Object.keys(map).forEach(k => { if (+map[k] === i) delete map[k]; }); } else { b.dataset.sel = side + ':' + i; it.classList.add('dg-sel'); return; } }
    else { const li = side === 'l' ? i : +si, rk = side === 'r' ? i : +si; if (many) map[rk] = li; else { Object.keys(map).forEach(k => { if (+map[k] === rk) delete map[k]; }); map[li] = rk; } }
    draw(b); save();
  }
  function check() {
    const d = D(); let ok = 0, all = 0;
    $$('.dg-gap', root).forEach(inp => { const [bid, i] = inp.dataset.k.split(':'); const so = (K.gaps[bid] || [])[+i]; if (so == null) return; all++; const g = norm(inp.value) === norm(so); if (g) ok++; inp.classList.toggle('ok', g); inp.classList.toggle('no', !g); });
    $$('.blk-match', root).forEach(b => { const M = K.match[b.dataset.bid]; if (!M) return;
      if (M.mode === 'abc') { $$('.dg-abc', b).forEach(inp => { const so = M.sol[+inp.dataset.k.split(':')[1]]; if (!so) return; all++; const g = inp.value.trim().toUpperCase() === String(so).toUpperCase(); if (g) ok++; inp.classList.toggle('ok', g); inp.classList.toggle('no', !g); }); }
      else { const map = d.m[b.dataset.bid] || {}; Object.keys(M.sol).forEach(k => { all++; if (map[k] != null && +map[k] === +M.sol[k]) ok++; }); b.dataset.chk = '1'; draw(b); } });
    res.hidden = false; res.classList.toggle('full', all > 0 && ok === all);
    res.textContent = all ? `${ok} von ${all} richtig${ok === all ? ' · alles richtig' : ''}` : 'Auf diesem Blatt gibt es nichts, was sich automatisch prüfen lässt.';
  }
  function sol(on) {
    showSol = on; const d = D(); res.hidden = true;
    $$('.dg-gap', root).forEach(inp => { const [bid, i] = inp.dataset.k.split(':'); const so = (K.gaps[bid] || [])[+i]; if (so == null) return; inp.readOnly = on; inp.value = on ? so : (d.g[inp.dataset.k] || ''); inp.classList.remove('ok', 'no'); inp.classList.toggle('dg-sv', on); });
    $$('.blk-match', root).forEach(b => { const M = K.match[b.dataset.bid]; if (!M) return;
      if (M.mode === 'abc') $$('.dg-abc', b).forEach(inp => { const k = +inp.dataset.k.split(':')[1]; inp.readOnly = on; inp.value = on ? (M.sol[k] || '') : (d.a[inp.dataset.k] || ''); inp.classList.remove('ok', 'no'); inp.classList.toggle('dg-sv', on); });
      else { if (on) b.dataset.show = '1'; else delete b.dataset.show; delete b.dataset.chk; draw(b); } });
    const sb = $('#dg-sol'); if (sb) { sb.textContent = on ? (K.du ? 'Meine Antworten' : 'Eigene Antworten') : 'Lösung'; sb.setAttribute('aria-pressed', String(on)); }
  }
  function ansOn(k) { return !!K.ans && !(K.off && K.off[lv + '|' + k]); }
  function openTask(t, mode) {
    const k = t.dataset.k, d = D(); const tips = K.tipsOn ? (K.tips[lv + '|' + k] || []) : []; const no = (t.querySelector('.task-no') || {}).textContent || '';
    let shown = d.tip[k] || 0; if (mode === 'tip' && !shown && tips.length) { shown = d.tip[k] = 1; save(); }
    const body = t.querySelector('.task-body').cloneNode(true); body.querySelectorAll('.dg-tt').forEach(x => x.remove());
    panel.innerHTML = `<div class="dg-ph"><b>Aufgabe ${esc(no)}</b><button type="button" class="dg-x" data-a="close" aria-label="Schließen">×</button></div><div class="dg-pt"></div>`
      + (tips.length ? `<div class="dg-tips">${tips.slice(0, shown).map((h, i) => `<div class="dg-tipc"><b>Tipp ${i + 1}:</b> ${h}</div>`).join('')}${shown < tips.length ? `<button type="button" class="dg-btn" data-a="more">${shown ? 'Noch ein Tipp' : 'Tipp anzeigen'}</button>` : ''}</div>` : '')
      + (ansOn(k) ? wordHTML() : '');
    panel.querySelector('.dg-pt').appendChild(body); const ta = panel.querySelector('.dg-wp'); if (ta) { ta.innerHTML = ansHTML(d.ans[k]); const n = ((ta.innerText || '').match(/\S+/g) || []).length; const wc = $('.dg-wc', panel); if (wc) wc.textContent = n === 1 ? '1 Wort' : n + ' Wörter'; }
    panel.dataset.k = k; panel.hidden = false; document.body.classList.add('dg-open');
    const big = !!S.wbig && !!ta; panel.classList.toggle('dg-wmax', big); document.body.classList.toggle('dg-wmax-on', big);
    if (ta && mode === 'ans') { ta.focus(); try { const r = document.createRange(); r.selectNodeContents(ta); r.collapse(false); const sl = getSelection(); sl.removeAllRanges(); sl.addRange(r); } catch (e) {} }
  }
  function closePanel() { panel.hidden = true; panel.classList.remove('dg-wmax'); document.body.classList.remove('dg-open', 'dg-wmax-on'); }
  function ansPage() {
    const d = D(); const ts = $$('.task', root).filter(t => ansOn(t.dataset.k) && textOf(d.ans[t.dataset.k])); if (!ts.length) return null;
    const pg = document.createElement('div'); pg.className = 'pout dg-anspage';
    pg.innerHTML = `<h2>${K.du ? 'Meine Antworten' : 'Antworten'}</h2><p class="dg-ap">${esc(K.title)}${S.name ? ' · ' + esc(S.name) : ''}</p>` + ts.map(t => `<section><b>Aufgabe ${esc((t.querySelector('.task-no') || {}).textContent || '')}</b><div class="dg-at">${ansHTML(d.ans[t.dataset.k])}</div></section>`).join('');
    root.appendChild(pg); return pg;
  }
  root.addEventListener('input', e => {
    const t = e.target, k = t.dataset && t.dataset.k; if (!k || showSol) return; const d = D();
    if (t.classList.contains('dg-gap')) d.g[k] = t.value; else if (t.classList.contains('dg-free')) d.f[k] = t.value; else if (t.classList.contains('dg-abc')) { t.value = t.value.toUpperCase(); d.a[k] = t.value; }
    else if (t.classList.contains('dg-cell')) d.w[k] = t.innerText; else if (t.classList.contains('dg-area')) d.t[k] = t.value;
    t.classList.remove('ok', 'no'); save();
  });
  root.addEventListener('click', e => {
    const t = e.target; const ic = t.closest('.dg-ic'); if (ic) { openTask(ic.closest('.task'), ic.dataset.a); return; }
    const sv = t.closest('svg.ck'); if (sv) { const on = !sv.classList.contains('x'); setCk(sv, on); D().c[sv.dataset.k] = on; save(); return; }
    const it = t.closest('.dg-lin .mt-l, .dg-lin .mt-r'); if (it && !showSol) pick(it);
  });
  root.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('svg.ck, .dg-lin .mt-l, .dg-lin .mt-r')) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
  panel.addEventListener('click', e => { const a = e.target.closest('[data-a]'); if (!a) return; if (a.dataset.a === 'close') closePanel(); if (a.dataset.a === 'big') setBig(!S.wbig); if (a.dataset.a === 'more') { const k = panel.dataset.k; const d = D(); d.tip[k] = (d.tip[k] || 0) + 1; save(); openTask($(`.task[data-k="${k}"]`, root), 'x'); } });
  panel.addEventListener('input', e => { if (e.target.closest && e.target.closest('.dg-wp')) wSave(); });
  panel.addEventListener('mousedown', e => { if (e.target.closest('.dg-wt button, .dg-wbig')) e.preventDefault(); });
  panel.addEventListener('click', e => { const c = e.target.closest('.dg-wt [data-c]'); if (c) wCmd(c.dataset.c); });
  panel.addEventListener('paste', e => { const ed = e.target.closest && e.target.closest('.dg-wp'); if (!ed) return; e.preventDefault(); const cd = e.clipboardData; const h = cd && cd.getData('text/html'); const t = cd ? cd.getData('text/plain') : '';
    try { if (h) document.execCommand('insertHTML', false, clean(h)); else document.execCommand('insertText', false, t); } catch (er) {} wSave(); });
  panel.addEventListener('keydown', e => { if (!(e.target.closest && e.target.closest('.dg-wp'))) return; if (e.key === 'Tab') { e.preventDefault(); wCmd(e.shiftKey ? 'outdent' : 'indent'); } });
  document.addEventListener('selectionchange', () => { if (!panel.hidden) wState(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { if (panel.classList.contains('dg-wmax')) setBig(false); else closePanel(); } });
  const nm = $('#dg-name'); if (nm) { nm.value = S.name || ''; nm.addEventListener('input', () => { S.name = nm.value; save(); nameFill(); }); }
  const on = (id, fn) => { const x = $('#' + id); if (x) x.addEventListener('click', fn); };
  on('dg-check', () => { if (showSol) sol(false); check(); });
  on('dg-sol', () => sol(!showSol));
  on('dg-reset', () => { if (!confirm(K.du ? 'Alle deine Eingaben auf diesem Blatt löschen?' : 'Alle Eingaben auf diesem Blatt löschen?')) return; S[lv] = undefined; save(); mount(); });
  // PDF zum Herunterladen: jede Seite als Bild (wie beim Drucken), Eingaben werden dafür in Text verwandelt
  const LIB = { h2c: 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js', pdf: 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js' };
  const loadS = (src, ok) => new Promise((res, rej) => { if (ok()) return res(); const sc = document.createElement('script'); sc.src = src; sc.onload = () => res(); sc.onerror = () => rej(new Error('Bibliothek fehlt')); document.head.appendChild(sc); });
  const fileName = () => ((K.title || 'Arbeitsblatt') + (S.name ? ' ' + S.name : '')).normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80) + '.pdf';
  async function savePdf() {
    const btn = $('#dg-pdf'); if (!btn || btn.disabled) return; const label = btn.textContent; btn.disabled = true; btn.textContent = 'PDF wird erstellt …';
    if (showSol) sol(false); closePanel(); const ap = ansPage(); const z = root.style.zoom; root.style.zoom = '1';
    try {
      await Promise.all([loadS(LIB.h2c, () => !!window.html2canvas), loadS(LIB.pdf, () => !!(window.jspdf && window.jspdf.jsPDF))]);
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
      const pages = $$('#printroot > .pout'); let doc = null;
      for (let i = 0; i < pages.length; i++) {
        btn.textContent = `PDF … ${i + 1} von ${pages.length}`;
        const pg = pages[i]; const PX = 96 / 25.4; const wmm = +pg.dataset.w || 210; const hmm = +pg.dataset.h || Math.max(297, Math.round(pg.offsetHeight / PX));
        const ins = $$('input, textarea', pg);
        pg.setAttribute('data-snap', '1');
        let c;
        try {
          c = await window.html2canvas(pg, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: Math.max(1200, pg.offsetWidth + 40),
            onclone: d => {
              const e = d.querySelector('[data-snap="1"]'); if (!e) return;
              d.querySelectorAll('.dg-tt,.dg-bar,.dg-res,.dg-panel').forEach(x => x.remove());
              const r2 = d.getElementById('printroot'); if (r2) r2.style.zoom = '1';
              [...e.querySelectorAll('input, textarea')].forEach((x, k) => { const o = ins[k]; const sp = d.createElement(x.tagName === 'TEXTAREA' ? 'div' : 'span'); sp.className = x.className + ' dg-snap'; sp.style.cssText = x.style.cssText; sp.textContent = o ? o.value : x.value; x.replaceWith(sp); });
            } });
        } finally { pg.removeAttribute('data-snap'); }
        const ori = wmm > hmm ? 'landscape' : 'portrait';
        if (!doc) doc = new window.jspdf.jsPDF({ unit: 'mm', format: hmm > 297 ? [210, hmm] : 'a4', orientation: ori, compress: true }); else doc.addPage(hmm > 297 && wmm <= 210 ? [210, hmm] : 'a4', ori);
        doc.addImage(c.toDataURL('image/jpeg', .9), 'JPEG', 0, 0, wmm, hmm, undefined, 'FAST');
      }
      doc.setProperties({ title: K.title || 'Arbeitsblatt', author: S.name || '', creator: 'LehrWerk' });
      const blob = doc.output('blob'); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fileName();
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 5000);
      res.hidden = false; res.classList.add('full'); res.textContent = 'PDF gespeichert: ' + a.download;
    } catch (err) {
      console.error(err); res.hidden = false; res.classList.remove('full');
      res.textContent = 'Das PDF ließ sich nicht erstellen. Dafür braucht es eine Internetverbindung. Alternativ „Drucken“ wählen und dort „Als PDF sichern“.';
    } finally { root.style.zoom = z; if (ap) ap.remove(); btn.disabled = false; btn.textContent = label; }
  }
  on('dg-pdf', savePdf);
  let prPg = null, prZ = '';
  const prOn = () => { if (prPg !== null) return; if (showSol) sol(false); closePanel(); prPg = ansPage() || false; prZ = root.style.zoom; root.style.zoom = '1'; };
  const prOff = () => { if (prPg === null) return; root.style.zoom = prZ; if (prPg) prPg.remove(); prPg = null; };
  window.addEventListener('beforeprint', prOn); window.addEventListener('afterprint', prOff);
  on('dg-print', () => { prOn(); setTimeout(() => { try { window.print(); } catch (e) { console.error(e); } setTimeout(() => document.addEventListener('pointerdown', prOff, { once: true }), 300); }, 50); });
  $$('[data-lv]').forEach(x => x.addEventListener('click', () => { lv = x.dataset.lv; S.lv = lv; save(); closePanel(); mount(); }));
  window.addEventListener('resize', () => { clearTimeout(window.__dgFit); window.__dgFit = setTimeout(fit, 120); });
  mount(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
}
const DG_CSS = `
:root{color-scheme:light}
body.dg{background:#E9ECF2;margin:0;padding:0;border:0;height:auto;min-height:100%;font-family:"Atkinson Hyperlegible","Segoe UI",system-ui,sans-serif;color:#1C1F27}
.dg-bar{position:sticky;top:0;z-index:20;display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:10px 14px;background:#fff;border-bottom:1px solid #D5DAE3;box-shadow:0 2px 8px rgba(20,30,50,.06)}
.dg-t{font-weight:700;font-size:15px;flex:1 1 220px;min-width:0}
.dg-nm{display:flex;align-items:center;gap:6px;font-size:13px;color:#5A606E}
.dg-nm input{width:150px;font:inherit;font-size:14px;color:#1C1F27;border:1px solid #C8CCD5;border-radius:8px;padding:6px 9px;background:#fff}
.dg-acts{display:flex;flex-wrap:wrap;gap:6px}
.dg-btn{font:inherit;font-size:13.5px;font-weight:700;border:1.5px solid #C8CCD5;background:#fff;color:#1C1F27;border-radius:9px;padding:7px 12px;cursor:pointer}
.dg-btn.pri{background:#2741B5;border-color:#2741B5;color:#fff}
.dg-btn[aria-pressed="true"]{background:#E6EBFA;border-color:#2741B5}
.dg-seg{display:flex;border:1.5px solid #C8CCD5;border-radius:9px;overflow:hidden}
.dg-seg button{font:inherit;font-size:13px;border:0;background:#fff;padding:6px 10px;cursor:pointer;color:#1C1F27}
.dg-seg button+button{border-left:1px solid #C8CCD5}
.dg-seg button[aria-pressed="true"]{background:#2741B5;color:#fff;font-weight:700}
.dg-res{position:sticky;top:58px;z-index:19;margin:10px auto 0;width:max-content;max-width:calc(100% - 24px);padding:8px 16px;border-radius:999px;background:#FFF4E5;color:#7A3E00;font-weight:700;font-size:14px;box-shadow:0 2px 8px rgba(20,30,50,.12)}
.dg-res.full{background:#E3F4E8;color:#1E6B34}
.dg-main{padding:12px 8px 60px}
#printroot{display:block!important;margin:0 auto;width:max-content}
#printroot>.pout{margin:0 auto 14px;box-shadow:0 1px 3px rgba(20,30,50,.18),0 8px 24px rgba(20,30,50,.08)}
.dg .page .task{position:relative}
.dg-tt{position:absolute;top:-.6mm;right:-16.6mm;display:flex;gap:1mm}
.page.a5 .dg-tt{right:-10.4mm;flex-direction:column;gap:.8mm}
.dg-ic{width:6.4mm;height:6.4mm;border-radius:50%;border:.35mm solid var(--acc,#2741B5);background:#fff;color:var(--acc,#2741B5);font:700 9.5pt/1 "Atkinson Hyperlegible",system-ui,sans-serif;cursor:pointer;display:grid;place-items:center;padding:0}
.page.a5 .dg-ic{width:5.6mm;height:5.6mm;font-size:8.5pt}
.dg-ic.on{background:var(--acc,#2741B5);color:#fff}
input.gapb,input.gap{border:0;border-bottom:.3mm solid var(--paper-ink);background:rgba(39,65,181,.06);font:inherit;color:var(--acc,#2741B5);font-weight:600;padding:0 .8mm;height:1.25em;line-height:1.2;vertical-align:-.2em;border-radius:.6mm .6mm 0 0;outline:none;text-align:center}
input.gap{width:30mm;margin:0 .8mm}
input.gapb:focus,input.gap:focus{background:rgba(39,65,181,.14)}
input.ok{background:#E3F4E8!important;border-bottom-color:#1E8A43!important;color:#1E6B34!important}
input.no{background:#FDE8E4!important;border-bottom-color:#C2410C!important;color:#9A2F08!important}
input.dg-sv{background:#E3F4E8!important;color:#1E6B34!important;font-style:italic}
.dg-abc{width:100%;height:100%;border:0;background:transparent;text-align:center;font:700 11pt/1 inherit;color:var(--acc,#2741B5);text-transform:uppercase;outline:none;padding:0}
.mt-box:has(.dg-abc:focus){box-shadow:0 0 0 .5mm rgba(39,65,181,.35)}
.dg-lin .mt-l,.dg-lin .mt-r{cursor:pointer;user-select:none;-webkit-user-select:none}
.dg-lin .mt-i:hover{background:#F2F5FD}
.dg-lin .mt-i.dg-sel{background:#E6EBFA;box-shadow:0 0 0 .6mm var(--acc,#2741B5)}
.dg-lin .mt-i.dg-con .mt-dot{background:var(--acc,#2741B5)}
.dg-lines{position:absolute;left:0;top:0;pointer-events:none;overflow:visible}
.dg-lines line{stroke:var(--acc,#2741B5);stroke-width:1.9;stroke-linecap:round}
.dg-lines line.ok,.dg-lines line.sol{stroke:#1E8A43}
.dg-lines line.sol{stroke-dasharray:4 3}
.dg-lines line.no{stroke:#C2410C}
svg.ck{cursor:pointer}
.tb td.dg-td{position:relative}
.dg-cell{min-height:100%;position:absolute;inset:0;padding:1.6mm 2mm;outline:none;color:var(--acc,#2741B5);font-weight:600;white-space:pre-wrap;overflow:hidden}
.dg-cell:focus{background:rgba(39,65,181,.06)}
.dg-cell.dg-tfe{position:static;inset:auto;display:block;min-height:calc(var(--l,1) * 1.45em);padding:.05em .25em;border-bottom:.25mm solid var(--paper-ink,#1C1F27);background:rgba(39,65,181,.05);overflow:visible}
.blk-lines{position:relative}
.dg-area{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;resize:none;outline:none;font:600 12pt/9mm "Atkinson Hyperlegible",system-ui,sans-serif;color:var(--acc,#2741B5);padding:1.6mm 2mm 0;overflow:hidden}
.dg-area.grid{line-height:5mm;padding-top:.6mm}
.dg-area:focus{background:rgba(39,65,181,.04)}
.dg-nm-i{font-family:"Atkinson Hyperlegible",system-ui,sans-serif;font-style:normal;color:var(--acc,#2741B5);font-weight:700;font-size:9pt;line-height:1;display:flex;align-items:flex-end;padding-left:1mm;white-space:nowrap;overflow:hidden}
.dg-panel{position:fixed;left:50%;bottom:0;transform:translateX(-50%);width:min(720px,100%);max-height:72vh;overflow:auto;z-index:30;background:#fff;border-radius:16px 16px 0 0;box-shadow:0 -8px 30px rgba(20,30,50,.22);padding:14px 18px 20px;font-size:15px;line-height:1.45}
.dg-ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
.dg-x{font-size:26px;line-height:1;border:0;background:none;cursor:pointer;color:#5A606E;padding:0 4px}
.dg-pt{padding:8px 10px;border-left:3px solid #2741B5;background:#F4F6FB;border-radius:0 8px 8px 0;margin-bottom:10px}
.dg-pt p{margin:0}.dg-pt .task-tag{display:none}
.dg-tips{display:flex;flex-direction:column;gap:6px;margin-bottom:10px;align-items:flex-start}
.dg-tipc{background:#FFF8E1;border-radius:8px;padding:7px 10px;width:100%}
.dg-word{border:1px solid #C8CCD5;border-radius:10px;overflow:hidden;background:#F3F4F7;box-shadow:0 1px 3px rgba(20,30,50,.08)}
.dg-wh{background:#2741B5;color:#fff;font-size:12.5px;font-weight:700;padding:3px 6px 3px 12px;letter-spacing:.02em;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:30px}
.dg-wbig{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,.55);background:transparent;color:#fff;border-radius:6px;padding:3px 9px;font:700 12px/1.2 "Atkinson Hyperlegible",system-ui,sans-serif;cursor:pointer}
.dg-wbig:hover,.dg-wbig:focus-visible{background:rgba(255,255,255,.16);outline:none}
.dg-panel.dg-wmax{left:0;top:0;bottom:0;right:0;transform:none;width:auto;max-height:none;border-radius:0;display:flex;flex-direction:column;padding:12px max(16px,calc((100vw - 980px)/2)) 14px;z-index:40}
.dg-panel.dg-wmax .dg-pt{max-height:22vh;overflow:auto;flex:0 0 auto}
.dg-panel.dg-wmax .dg-tips{max-height:18vh;overflow:auto;flex:0 0 auto}
.dg-panel.dg-wmax .dg-word{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}
.dg-panel.dg-wmax .dg-wpg{flex:1 1 auto;min-height:0;display:flex;padding:16px}
.dg-panel.dg-wmax .dg-wp{flex:1 1 auto;max-height:none;min-height:0;width:100%;max-width:820px;margin:0 auto;padding:24px 28px;font-size:16px}
body.dg-wmax-on{overflow:hidden}
.dg-wt{display:flex;flex-wrap:wrap;align-items:center;gap:2px;padding:5px 6px;background:#F7F8FA;border-bottom:1px solid #DDE1E8}
.dg-wt button{min-width:32px;height:32px;border:1px solid transparent;border-radius:6px;background:transparent;font:600 14px/1 "Segoe UI",system-ui,sans-serif;color:#1C1F27;cursor:pointer;padding:0 7px;display:inline-grid;place-items:center}
.dg-wt button:hover{background:#E6EAF2}
.dg-wt button[aria-pressed="true"]{background:#DCE3F7;border-color:#9DB0E8}
.dg-wt b,.dg-wt i,.dg-wt u,.dg-wt s{font-family:Georgia,serif;font-size:15px}
.dg-wt sub{font-size:9px;color:#C2410C;margin-left:1px}
.dg-mk{background:#FFF0A0;padding:0 3px;border-bottom:3px solid #F2C200;font-size:13px}
.dg-sep{width:1px;height:22px;background:#D5DAE3;margin:0 4px}
.dg-wpg{background:#E9ECF1;padding:12px}
.dg-wp{min-height:170px;max-height:42vh;overflow:auto;background:#fff;padding:16px 18px;border:1px solid #DDE1E8;box-shadow:0 1px 4px rgba(20,30,50,.10);font:15px/1.55 Aptos,Calibri,"Segoe UI","Atkinson Hyperlegible",system-ui,sans-serif;color:#1C1F27;outline:none;word-wrap:break-word}
.dg-wp:focus{border-color:#9DB0E8}
.dg-wp:empty::before{content:attr(data-ph);color:#9AA0AA}
.dg-wp ul,.dg-wp ol,.dg-at ul,.dg-at ol{margin:.3em 0;padding-left:1.7em}
.dg-wp blockquote,.dg-at blockquote{margin:0 0 0 1.7em}
.dg-wp p,.dg-wp div{margin:0}
.dg-wp mark,.dg-at mark{background:#FFF0A0;color:inherit}
.dg-ws{display:flex;justify-content:space-between;gap:10px;padding:5px 12px 6px;font-size:12px;color:#5A606E;background:#F7F8FA;border-top:1px solid #DDE1E8}
.dg-at{margin-top:1mm}.dg-at p,.dg-at div{margin:0}
body.dg-open .dg-main{padding-bottom:62vh}
.dg-btn:disabled{opacity:.6;cursor:progress}
.dg-snap{color:var(--acc,#2741B5);font-weight:600;text-align:center;white-space:nowrap;overflow:hidden;line-height:1.05}
.dg-snap.dg-area{white-space:pre-wrap;text-align:left;line-height:9mm;overflow:hidden}
.dg-snap.dg-area.grid{line-height:5mm}
.dg-snap.ok{color:#1E6B34}.dg-snap.no{color:#9A2F08}
.dg-anspage{width:210mm;min-height:297mm;background:#fff;padding:18mm;font:11pt/1.5 "Atkinson Hyperlegible",sans-serif}
.dg-anspage h2{margin:0 0 2mm;font-size:16pt}.dg-ap{color:#5A606E;margin:0 0 6mm}
.dg-anspage section{margin-bottom:5mm}
@media print{
  body.dg{background:#fff}
  .dg-bar,.dg-res,.dg-panel,.dg-tt{display:none!important}
  body.dg>main.dg-main:not(#dg-x){display:block!important;padding:0}
  #printroot{zoom:1!important;width:auto}
  #printroot>.pout{margin:0;box-shadow:none}
  input.gapb,input.gap,input.ok,input.no{background:transparent!important}
  @page quer{size:297mm 210mm;margin:0}
  @page hoch{size:210mm 297mm;margin:0}
}`;
// Seiten der Schülerfassung setzen und alles einsammeln, was die digitale Fassung braucht
async function dgBuild(opt) {
  const sh = state.sheet, m = sh.meta;
  const keep = { fassung: state.fassung, grp: state.grp, lvl: state.lvl, out: state.out, bookPages: state.bookPages, gapEdit: state.gapEdit };
  const lvs = m.levelsOn ? (opt.lvl === 'wahl' ? ['b', 's', 'e'] : [LV[opt.lvl] ? opt.lvl : 's']) : ['all'];
  try { await fontsIn(document); } catch {}
  const K = { id: opt.id, title: (m.mode === 'klausur' ? ((m.exam && m.exam.label) || 'Klausur') + ' · ' : m.nr ? 'AB ' + m.nr + ' · ' : '') + (m.title || 'Arbeitsblatt'), du: m.anrede === 'du',
    ans: !!opt.ans, tipsOn: !!opt.tips, sol: !!opt.sol, vars: {}, def: lvs.length > 1 ? 's' : lvs[0], lvs: lvs.length > 1 ? lvs.map(k => [k, LV[k].sym + ' ' + LV[k].name]) : [], gaps: {}, match: {}, tips: {}, off: {} };
  MAPPE_LOCK = true; clearTimeout(renderTimer);
  try {
    state.out = 'blatt'; state.grp = 'all'; state.gapEdit = null;
    for (const lv of lvs) {
      state.lvl = lv;
      state.fassung = 'lehrer'; const box = document.createElement('div'); layout().forEach(o => box.appendChild(o.pg));
      const tmp = {}; box.querySelectorAll('.blk-mat[data-bid]').forEach(el => el.querySelectorAll('.gapl').forEach(g => (tmp[el.dataset.bid] = tmp[el.dataset.bid] || []).push(g.textContent.trim())));
      Object.entries(tmp).forEach(([bid, L]) => { if (!K.gaps[bid]) K.gaps[bid] = L; });
      state.fassung = 'schueler'; const v = sheetView(); const pages = layout().map(o => o.pg);
      sh.blocks.forEach(b => { if (b.type !== 'tasks' || !blockVisible(b, v)) return; itemsFor(b, v).forEach((it, k) => { const t = tipsOf(it); if (t.length) K.tips[lv + '|' + b.id + ':' + k] = t.map(x => inlineHTML(x)); if (it.noDg) K.off[lv + '|' + b.id + ':' + k] = 1; }); });
      K.vars[lv] = pages.map(p => { p.classList.add('pout'); p.style.setProperty('page', +p.dataset.w > +p.dataset.h ? 'quer' : 'hoch'); return p.outerHTML; }).join('');
    }
  } finally { Object.assign(state, keep); MAPPE_LOCK = false; renderPreview(); }
  sh.blocks.forEach(b => { if (b.type !== 'match') return; const L = mtLayout(b);
    K.match[b.id] = L.sort
      ? (b.mode === 'buchstaben' ? { mode: 'abc', sol: L.right.map((_, rk) => { const z = L.sol.find(x => x.rk === rk); return z ? z.L : ''; }) } : { mode: 'lin', many: true, sol: Object.fromEntries(L.sol.map(x => [x.rk, x.li])) })
      : (b.mode === 'buchstaben' ? { mode: 'abc', sol: L.sol.map(x => (x && x.R) || '') } : { mode: 'lin', sol: Object.fromEntries(L.sol.filter(x => x && x.rk >= 0).map(x => [x.li, x.rk])) }); });
  K.hasCheck = Object.values(K.gaps).some(L => L.length) || Object.keys(K.match).length > 0;
  if (!K.hasCheck) K.sol = false;
  return K;
}
function dgDoc(K) {
  const css = [...document.querySelectorAll('style')].map(x => x.textContent).find(t => t.includes('.page{width:210mm')) || '';
  const fl = document.querySelector('link[href*="googleapis.com/css2"]'); const fonts = fl ? fl.href : DG_FONTS;
  const lvB = K.lvs.length ? `<div class="dg-seg" role="group" aria-label="Niveau">${K.lvs.map(([k, l]) => `<button type="button" data-lv="${k}">${esc(l)}</button>`).join('')}</div>` : '';
  const data = JSON.stringify(K).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return '<!doctype html><html lang="de" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + `<title>${esc(K.title)}</title><link rel="preconnect" href="${'https://' + 'fonts.gstatic.com'}" crossorigin><link rel="stylesheet" href="${esc(fonts)}"><style>${css}</style><style>${DG_CSS}</style></head>`
    + `<body class="dg"><header class="dg-bar"><div class="dg-t">${esc(K.title)}</div><label class="dg-nm"><span>Name</span><input id="dg-name" type="text" autocomplete="off" placeholder="${K.du ? 'Dein Name' : 'Ihr Name'}"></label>${lvB}`
    + `<div class="dg-acts">${K.hasCheck ? `<button type="button" class="dg-btn pri" id="dg-check">Prüfen</button>${K.sol ? '<button type="button" class="dg-btn" id="dg-sol" aria-pressed="false">Lösung</button>' : ''}` : ''}<button type="button" class="dg-btn" id="dg-reset">Leeren</button><button type="button" class="dg-btn" id="dg-print">Drucken</button><button type="button" class="dg-btn" id="dg-pdf">PDF speichern</button></div></header>`
    + `<div id="dg-res" class="dg-res" role="status" hidden></div><main class="dg-main"><div id="printroot"></div></main><aside id="dg-panel" class="dg-panel" hidden></aside>`
    + `<script>(${dgRuntime.toString()})(${data});<\/script></body></html>`;
}
function dgOpts() { const o = lsGet(LS_DGOPT) || {}; return { lvl: o.lvl || 'wahl', sol: o.sol !== false, ans: o.ans !== false, tips: o.tips !== false }; }
function openDg() { closeGloss(); closeZl(); state.dlg = { mode: 'dg', step: 'opt', ...dgOpts(), err: '' }; renderDlg(); }
function dgRead() {
  const d = state.dlg; if (!d || d.mode !== 'dg') return; ['sol', 'ans', 'tips'].forEach(k => { const x = $('#dg-' + k); if (x) d[k] = x.checked; });
  lsSet(LS_DGOPT, { lvl: d.lvl, sol: d.sol, ans: d.ans, tips: d.tips });
}
function dgHTML() {
  const d = state.dlg, m = state.sheet.meta; const pub = m.dg && m.dg.id; const on = dgOnline();
  if (d.step === 'qr' && pub) { const link = dgLink(pub);
    return `<h2 id="dlg-t">Die digitale Fassung ist online</h2><div class="dg-qr"><img src="${QR.dataURL(link, 8)}" alt="QR-Code zur digitalen Fassung"><div><p>Mit der Kamera scannen oder den Link teilen. Antworten bleiben auf dem jeweiligen Gerät; nach Änderungen am Blatt einfach „Online aktualisieren“, Link und QR-Code bleiben gleich.</p><input class="inp" id="dg-link" readonly value="${esc(link)}"><div class="row"><button class="btn" type="button" data-act="dg-copy">Link kopieren</button><button class="btn" type="button" data-act="dg-qrblk">QR-Code aufs Blatt</button><button class="btn" type="button" data-act="dg-qrsave">QR als Bild</button></div></div></div>
      <div class="row"><button class="btn primary" type="button" data-act="dlg-close">Fertig</button><button class="btn" type="button" data-act="dg-big">Groß zeigen (Beamer)</button><button class="link danger" type="button" data-act="dg-off">Offline nehmen</button></div>`; }
  const nOff = state.sheet.blocks.reduce((a, b) => a + (b.type === 'tasks' && Array.isArray(b.items) ? b.items.filter(it => it && it.noDg).length : 0), 0);
  const seg = (f, opts, cur) => `<div class="seg sm" role="group">${opts.map(([v, t]) => `<button type="button" data-act="dg-set" data-f="${f}" data-v="${v}" aria-pressed="${cur === v}">${t}</button>`).join('')}</div>`;
  return `<h2 id="dlg-t">Digitale Fassung</h2>
    <p class="rlp-stat">Zum Ausfüllen am Tablet oder Laptop: Lücken, Zuordnen, Ankreuzfelder, Tabellen und Schreibflächen direkt auf dem Blatt, „Prüfen“ zeigt, was stimmt. Die Zeilennummern sind dieselben wie auf dem Papier.</p>
    ${m.levelsOn ? `<div class="f"><span>Niveau</span>${seg('lvl', [['wahl', 'Schüler wählen'], ['b', '★ Basis'], ['s', '★★ Standard'], ['e', '★★★ Experte']], d.lvl)}</div>` : ''}
    <div class="f"><div class="chks"><label class="chk"><input type="checkbox" id="dg-sol"${d.sol ? ' checked' : ''}>Lösung abrufbar</label><label class="chk"><input type="checkbox" id="dg-tips"${d.tips ? ' checked' : ''}>Tipps abrufbar</label><label class="chk"><input type="checkbox" id="dg-ans"${d.ans ? ' checked' : ''}>${nOff ? `Antwortfeld zu den Aufgaben (außer ${nOff} abgewählten)` : 'Antwortfeld zu jeder Aufgabe'}</label></div></div>
    ${pub ? `<div class="dg-on"><span>Dieses Blatt ist online${m.dg.at ? ' seit ' + new Date(m.dg.at).toLocaleDateString('de-DE') : ''}.</span><button class="link" type="button" data-act="dg-showqr">Link und QR-Code zeigen</button></div>` : ''}
    ${on ? '' : '<p class="hint">Zum Online-Stellen mit QR-Code bitte anmelden („Meine Stunden“ → Anmelden). Als Datei geht es auch so.</p>'}
    ${d.busy ? '<p class="hint">Wird vorbereitet …</p>' : ''}<div class="err" role="alert">${esc(d.err || '')}</div>
    <div class="row"><button class="btn primary" type="button" data-act="dg-pub"${on && !d.busy ? '' : ' disabled'}>${pub ? 'Online aktualisieren' : 'Online stellen mit QR-Code'}</button><button class="btn" type="button" data-act="dg-file"${d.busy ? ' disabled' : ''}>Als Datei (.html)</button><button class="btn" type="button" data-act="dg-try"${d.busy ? ' disabled' : ''}>Ausprobieren</button><button class="btn" type="button" data-act="dlg-close">Abbrechen</button></div>`;
}
async function dgMake(id) { const d = state.dlg; return dgDoc(await dgBuild({ id, lvl: d.lvl, sol: d.sol, ans: d.ans, tips: d.tips })); }
async function dgPublish() {
  dgRead(); const d = state.dlg; const m = state.sheet.meta; if (!dgOnline() || d.busy) return;
  d.busy = true; d.err = ''; renderDlg();
  try {
    const id = (m.dg && m.dg.id) || dgId(); const html = await dgMake(id);
    const { data: ses } = await store.sb.auth.getSession(); const u = ses && ses.session && ses.session.user; if (!u) throw new Error('nicht angemeldet');
    const { error } = await store.sb.from('ab_digital').upsert({ id, user_id: u.id, sheet_id: state.sheet.id, title: (m.nr ? 'AB ' + m.nr + ' · ' : '') + (m.title || ''), html, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    if (error) throw error;
    m.dg = { id, at: (m.dg && m.dg.id === id && m.dg.at) || Date.now() }; changed();
    if (state.dlg === d) { d.busy = false; d.step = 'qr'; renderDlg(); }
    toast('Online gestellt');
  } catch (err) {
    console.error(err); if (state.dlg !== d) return; d.busy = false;
    d.err = /relation|does not exist|schema cache|ab_digital/i.test(String(err && (err.message || err.details || err))) ? 'Die Online-Ablage für digitale Fassungen ist noch nicht eingerichtet. Als Datei geht es schon.' : 'Das Online-Stellen hat nicht geklappt. Bitte Internetverbindung prüfen und erneut versuchen.';
    renderDlg();
  }
}
async function dgOff() {
  const m = state.sheet.meta; const id = m.dg && m.dg.id; if (!id) return;
  try { if (dgOnline()) { const { error } = await store.sb.from('ab_digital').delete().eq('id', id); if (error) throw error; } }
  catch (err) { console.error(err); toast('Offline nehmen hat nicht geklappt. Bitte erneut versuchen.'); return; }
  delete m.dg; changed(); closeDlg(); toast('Offline genommen. Der Link und der QR-Code funktionieren nicht mehr.');
}
async function dgViewer(id) {
  const msg = t => { document.body.innerHTML = `<p style="font:16px/1.5 system-ui,sans-serif;max-width:520px;margin:12vh auto;padding:0 20px;color:#1C1F27">${t}</p>`; };
  document.title = 'Arbeitsblatt'; msg('Das Arbeitsblatt wird geladen …');
  try {
    const r = await fetch(`${SUPABASE.url}/rest/v1/rpc/ab_digital_get`, { method: 'POST', headers: { apikey: SUPABASE.key, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_id: id }) });
    const html = r.ok ? await r.json() : null;
    if (!html || typeof html !== 'string') { msg('Dieses Arbeitsblatt ist nicht (mehr) online. Bitte bei der Lehrkraft nachfragen.'); return; }
    document.open(); document.write(html); document.close();
  } catch (err) { console.error(err); msg('Das Arbeitsblatt ließ sich nicht laden. Bitte Internetverbindung prüfen und die Seite neu laden.'); }
}

