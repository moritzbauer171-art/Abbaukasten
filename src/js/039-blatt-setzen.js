/* ================= Blatt setzen (Messen + Umbrechen) ================= */
const MK_LETTER = { m: 'M', q: 'Q', d: 'D', a: 'Abb.' };
const matLetter = b => b.type === 'chat' ? 'M' : b.type === 'material' ? (MK_LETTER[b.mk] || 'M') : (b.type === 'image' && MK_LETTER[b.mk] ? MK_LETTER[b.mk] : '');
// Nummern je Art: M1, M2 …, Q1, Q2 …, D1 … in der Reihenfolge auf dem Blatt
function matTags(blocks) { const c = {}, map = {}; for (const b of blocks) { const L = matLetter(b); if (!L) continue; c[L] = (c[L] || 0) + 1; map[b.id] = L + (L.endsWith('.') ? ' ' : '') + c[L]; } return map; }
const matTitle = b => b.type === 'image' ? b.caption : b.type === 'chat' ? (b.title || 'Chat' + (b.head && b.head.name ? ': ' + b.head.name : '')) : b.title;
function numbering(sheet) {
  const map = {}; let m = 0, t = 0; const TN = {}; const tags = matTags(sheet.blocks);
  for (const b of sheet.blocks) {
    if (b.type === 'material') map[b.id] = { m: ++m, tag: tags[b.id] };
    if (b.type === 'image' && tags[b.id]) map[b.id] = { tag: tags[b.id] };
    if (b.type === 'tasks') { t = tnAt(b, t, TN); const from = t + 1; t += b.items.filter(it => itCnt(b, it)).length; map[b.id] = { from, to: t, nFo: b.items.filter(itFo).length }; }
  }
  return map;
}
function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; }

function buildHead(meta, body) {
  const node = el(headHTML(meta)); headSp(node, meta);
  body.appendChild(node);
  return { type: 'head', el: node };
}

function buildBlock(b, ctx) {
  const body = ctx.body, meta = ctx.meta;
  const put = html => { const n = el(html); n.dataset.bid = b.id; const tg = [ctx.view && ctx.view.grp === 'all' && meta.groupsOn && b.group ? grpName(meta, b.group) : '', ctx.view && ctx.view.lvl === 'all' && meta.levelsOn && Array.isArray(b.lv) ? b.lv.map(x => LV[x].sym).join(' · ') : ''].filter(Boolean).join(' · '); if (tg) n.dataset.grp = tg; body.appendChild(n); return n; };
  switch (b.type) {
    case 'pagebreak': return { type: 'pagebreak' };
    case 'tafel': {
      const lehrer = !!(ctx.view && ctx.view.lehrer); const on = b.onSheet || 'luecke';
      const n = put(`<div class="blk blk-tafel">${tafelHTML(b, { gaps: !lehrer && on === 'luecke', sol: lehrer && on === 'luecke' })}</div>`);
      tfDraw(n); return { type: 'tafel', el: n };
    }
    case 'heading': return { type: 'heading', el: put(`<div class="blk blk-h" style="${H_SP.top[b.padTop] ? `padding-top:${H_SP.top[b.padTop]}mm;` : ''}${H_SP.bot[b.padBot] ? `padding-bottom:${H_SP.bot[b.padBot]}mm;` : ''}"><h2>${inlineHTML(b.text || 'Überschrift')}</h2></div>`) };
    case 'text': {
      const n = put(`<div class="blk blk-text${b.stil ? ' st-' + b.stil : ''}">${parasHTML(b.text) || '<p style="color:var(--paper-hair)">Absatz</p>'}</div>`);
      const atoms = splitParas(n);
      return { type: 'text', el: n, atoms: atoms.length > 1 ? atoms : null, keepFirst: 1, keepLast: 1, contPre: () => parseFloat(getComputedStyle(n).paddingTop) || 0 };
    }
    case 'phrases': {
      const gs = phrGroups(b); const cols = (+b.cols || 2) === 1 ? 1 : 2;
      return { type: 'phrases', el: put(`<div class="blk blk-phr c${cols}"><div class="phr-h">${PHR_ICON}<span>${inlineHTML(b.title || 'Formulierungshilfen')}</span></div><div class="phr-grid">${(gs.length ? gs : [{ head: '', lines: ['Formulierung …'] }]).map(g => `<div class="phr-g${g.lines.length > 3 ? ' long' : ''}">${g.head ? `<div class="phr-gh">${inlineHTML(g.head)}</div>` : ''}<ul>${g.lines.map(l => `<li>${inlineHTML(l)}</li>`).join('')}</ul></div>`).join('')}</div></div>`) };
    }
    case 'info': {
      const n = put(`<div class="blk blk-info${b.stil ? ' st-' + b.stil : ''}"><div class="info-kind">${esc(b.kind || 'Info')}</div>${b.title ? `<div class="info-title">${inlineHTML(b.title)}</div>` : ''}<div class="info-text">${parasHTML(b.text)}</div></div>`);
      const body = n.querySelector('.info-text'); const heads = [...n.children].filter(x => x !== body); const parts = splitParas(body);
      if (parts.length < 2) return { type: 'info', el: n };
      const atoms = [...heads, ...parts];
      return { type: 'info', el: n, atoms, keepFirst: heads.length + 1, keepLast: 1, assemble: nestedAssemble(n, heads, body, atoms),
        contPre: () => parseFloat(getComputedStyle(n).paddingTop) + parseFloat(getComputedStyle(body).marginTop) };
    }
    case 'quote': {
      const n = put(`<div class="blk blk-quote"><span class="q-mark">„</span><div class="q-text">${parasHTML(b.text) || 'Zitat'}</div>${b.author ? `<div class="q-author">${inlineHTML(b.author)}</div>` : ''}</div>`);
      const body = n.querySelector('.q-text'); const mark = n.querySelector('.q-mark'); const auth = n.querySelector('.q-author');
      const parts = body.children.length ? splitParas(body) : [];
      if (parts.length < 2) return { type: 'quote', el: n };
      const atoms = [...parts, ...(auth ? [auth] : [])];
      return { type: 'quote', el: n, atoms, keepFirst: 1, keepLast: 1, assemble: nestedAssemble(n, [], body, atoms, mark),
        contPre: () => parseFloat(getComputedStyle(n).paddingTop) };
    }
    case 'match': {
      const L = mtLayout(b); const lin = b.mode !== 'buchstaben'; const teach = !!(ctx.view && ctx.view.lehrer);
      if (L.sort) {
        let grid = L.left.map((x, i) => `<div class="mt-i mt-l mt-cat" style="grid-column:1;grid-row:${L.span[i][0] + 1} / ${L.span[i][1] + 1}">${lin ? '' : `<span class="mt-n">${i + 1}</span>`}<span class="mt-t">${inlineHTML(x.a)}</span>${lin ? '<i class="mt-dot"></i>' : ''}</div>`).join('')
          + L.right.map((x, k) => { const so = L.sol.find(z => z.rk === k); return `<div class="mt-i mt-r" style="grid-column:3;grid-row:${k + 1}">${lin ? '<i class="mt-dot"></i>' : `<span class="mt-box">${teach && so ? so.L : ''}</span>`}<span class="mt-t">${inlineHTML(x.b)}</span></div>`; }).join('');
        if (!L.rows) grid = `<div class="mt-i mt-l"><span class="mt-t" style="color:var(--paper-hair)">Oberbegriff</span><i class="mt-dot"></i></div><div class="mt-g"></div><div class="mt-i mt-r"><span class="mt-t" style="color:var(--paper-hair)">Wort</span><i class="mt-dot"></i></div>`;
        const n = put(`<div class="blk blk-match ${lin ? 'm-lin' : 'm-abc'} m-sort">${b.title ? `<div class="mt-h">${inlineHTML(b.title)}</div>` : ''}<div class="mt-grid">${grid}</div></div>`);
        if (lin && teach && L.sol.length) {
          const r0 = n.getBoundingClientRect(); const ls = [...n.querySelectorAll('.mt-l .mt-dot')], rs = [...n.querySelectorAll('.mt-r .mt-dot')];
          const c = d => { const r = d.getBoundingClientRect(); return [r.left + r.width / 2 - r0.left, r.top + r.height / 2 - r0.top]; };
          const lines = L.sol.filter(x => ls[x.li] && rs[x.rk]).map(x => { const [x1, y1] = c(ls[x.li]), [x2, y2] = c(rs[x.rk]); return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`; }).join('');
          n.insertAdjacentHTML('beforeend', `<svg class="mt-sol" width="${r0.width.toFixed(1)}" height="${r0.height.toFixed(1)}" viewBox="0 0 ${r0.width.toFixed(1)} ${r0.height.toFixed(1)}" aria-hidden="true" stroke="${ctx.acc}" stroke-width="1.8" stroke-linecap="round">${lines}</svg>`);
        }
        return { type: 'match', el: n };
      }
      const cell = (x, side, k) => {
        if (!x) return '<div class="mt-e"></div>';
        if (lin) return `<div class="mt-i mt-${side}"><span class="mt-t">${inlineHTML(x[side === 'l' ? 'a' : 'b'])}</span><i class="mt-dot"></i></div>`;
        if (side === 'l') { const so = L.sol[k]; return `<div class="mt-i mt-l"><span class="mt-n">${k + 1}</span><span class="mt-t">${inlineHTML(x.a)}</span><span class="mt-box">${teach && so && so.R ? so.R : ''}</span></div>`; }
        return `<div class="mt-i mt-r"><span class="mt-n">${L.letter(k)}</span><span class="mt-t">${inlineHTML(x.b)}</span></div>`;
      };
      let grid = ''; for (let k = 0; k < Math.max(1, L.rows); k++) grid += cell(L.left[k], 'l', k) + '<div class="mt-g"></div>' + cell(L.right[k], 'r', k);
      if (!L.rows) grid = '<div class="mt-i mt-l"><span class="mt-t" style="color:var(--paper-hair)">Begriff</span><i class="mt-dot"></i></div><div class="mt-g"></div><div class="mt-i mt-r"><span class="mt-t" style="color:var(--paper-hair)">passt zu …</span><i class="mt-dot"></i></div>';
      const n = put(`<div class="blk blk-match ${lin ? 'm-lin' : 'm-abc'}">${b.title ? `<div class="mt-h">${inlineHTML(b.title)}</div>` : ''}<div class="mt-grid">${grid}</div></div>`);
      if (lin && teach && L.sol.length) {
        const r0 = n.getBoundingClientRect(); const ls = [...n.querySelectorAll('.mt-l .mt-dot')], rs = [...n.querySelectorAll('.mt-r .mt-dot')];
        const c = d => { const r = d.getBoundingClientRect(); return [r.left + r.width / 2 - r0.left, r.top + r.height / 2 - r0.top]; };
        const lines = L.sol.filter(x => x.rk >= 0 && ls[x.li] && rs[x.rk]).map(x => { const [x1, y1] = c(ls[x.li]), [x2, y2] = c(rs[x.rk]); return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`; }).join('');
        n.insertAdjacentHTML('beforeend', `<svg class="mt-sol" width="${r0.width.toFixed(1)}" height="${r0.height.toFixed(1)}" viewBox="0 0 ${r0.width.toFixed(1)} ${r0.height.toFixed(1)}" aria-hidden="true" stroke="${ctx.acc}" stroke-width="1.8" stroke-linecap="round">${lines}</svg>`);
      }
      return { type: 'match', el: n };
    }
    case 'qr': {
      const sz = { S: 22, M: 30, L: 40 }[b.size] || 30; const url = String(b.url || '').trim(); const src = url ? QR.dataURL(url) : '';
      const pic = src ? `<img src="${src}" alt="QR-Code" style="width:${sz}mm;height:${sz}mm">` : `<div class="qr-empty" style="width:${sz}mm;height:${sz}mm">${url ? 'Link zu lang' : 'QR-Code'}</div>`;
      return { type: 'qr', el: put(`<div class="blk blk-qr">${pic}<div class="qr-t">${b.title ? `<b>${inlineHTML(b.title)}</b>` : ''}<span class="qr-url">${url ? esc(url) : 'Link eintragen'}</span>${b.note ? `<span class="qr-note">${inlineHTML(b.note)}</span>` : ''}</div></div>`) };
    }
    case 'chat': return { type: 'chat', el: put(chatHTML(b, ctx.mt && ctx.mt[b.id])) };
    case 'image': {
      if (Array.isArray(b.lb)) return { type: 'image', el: put(lbHTML(b, ctx)) };
      const img = b.src ? `<img src="${esc(b.src)}" alt="" style="width:${b.width || 80}%">` : '<div class="img-empty">Bild hinzufügen</div>';
      const tag = ctx.mt && ctx.mt[b.id];
      if (tag) return { type: 'image', el: put(`<div class="blk blk-img lab"><div class="mat-head"><span class="mat-no">${designOf(meta) === 'akte' ? 'Anlage ' : ''}${tag}</span><span class="mat-title">${inlineHTML(b.caption) || '&nbsp;'}</span></div><div class="img-c">${img}</div>${b.source ? `<div class="img-src">${inlineHTML(b.source)}</div>` : ''}</div>`) };
      return { type: 'image', el: put(`<div class="blk blk-img">${img}${b.caption ? `<div class="img-cap">${inlineHTML(b.caption)}</div>` : ''}${b.source ? `<div class="img-src">${inlineHTML(b.source)}</div>` : ''}</div>`) };
    }
    case 'gsa': {
      const node = put(gsaHTML(b, ctx)); if (gsaK(b) === 'suchsel') return { type: 'gsa', el: node };
      return { type: 'gsa', el: node, atoms: [...node.children], keepFirst: 2, keepLast: 1 };
    }
    case 'lines': {
      const n = Math.max(1, Math.min(40, Number(b.count) || 1));
      if (b.style === 'rahmen') return { type: 'lines', el: put(`<div class="blk blk-lines"><div class="frame-area" style="height:${Math.min(n, 26) * 9}mm"></div></div>`) };
      if (b.style === 'kaestchen') {
        const h = Math.round(n * 9 / 5) * 5;
        return { type: 'lines', el: put(`<div class="blk blk-lines"><div class="grid-area" style="height:${h}mm;background-image:url(${gridTile()})"></div></div>`) };
      }
      if (LIN[b.style]) { const node = put(`<div class="blk blk-lines">${linRow(b.style, b.mb, b).repeat(n)}</div>`); return { type: 'lines', el: node, atoms: [...node.children], keepFirst: 2, keepLast: 1 }; }
      const node = put(`<div class="blk blk-lines">${'<div class="wl"></div>'.repeat(n)}</div>`);
      return { type: 'lines', el: node, atoms: [...node.children], keepFirst: 2, keepLast: 1 };
    }
    case 'tasks': {
      const show = meta.showAFB && !isGS(); const ITS = itemsFor(b, ctx.view); const anySoz = ITS.some(it => SOZ[it.soz]); const nArb = Math.max(0, ...ITS.map(it => arbOf(it).length)); const hasSoz = anySoz || nArb > 0;
      const picW = (anySoz ? 8 : 0) + nArb * 6.2 + (anySoz && nArb ? 1 : 0);
      let tc = 0;
      const items = ITS.map((it, i) => {
        const r = opsRange(detectOps(it.text));
        const soz = hasSoz ? `<span class="task-soz">${anySoz ? (SOZ[it.soz] ? `<img src="${sozURI(it.soz, ctx.acc, ctx.bg)}" alt="${SOZ[it.soz].label}" title="${SOZ[it.soz].label}">` : '<i class="soz-gap"></i>') : ''}${arbOf(it).map(k => `<img class="arb" src="${arbURI(k, ctx.acc)}" alt="${ARB[k].label}" title="${ARB[k].label}">`).join('')}</span>` : '';
        const rkS = it.rk && rkStyle(meta) === 'abschnitt' && !(ITS[i - 1] && ITS[i - 1].rk) ? `<div class="task-rksec">${RK_SVG}<span>${esc(rkHead(meta))}</span><i></i></div>` : '';
        const rkn = itRkN(it, meta); const wx = wxLet(b, it, meta, ITS); if (itCnt(b, it, meta, ITS)) tc++; const wl = wlTag(b, it);
        const wh = wx === 'a' ? `<div class="task wx-h"><span class="task-no">${ctx.t + tc}</span>${hasSoz ? '<span class="task-soz"></span>' : ''}<div class="task-body"><b>Wahlaufgabe:</b> ${esc(wahlIntro(b, meta))}</div></div>` : '';
        return `${rkS}${wh}<div class="task${it.rk ? ' rk' : ''}${wx ? ' wx' : ''}"><span class="task-no${rkn ? ' rk' : ''}${wx ? ' wx' : ''}"${rkn ? ' title="Raketenaufgabe"' : ''}>${rkn ? RK_SVG : wx ? wx + ')' : ctx.t + tc}</span>${soz}<div class="task-body">${wl ? `<span class="task-wl" title="Schwierigkeit: ${wl.n}">${wl.s}</span>` : ''}${ctx.view && ctx.view.grp === 'all' && meta.groupsOn && it.grp ? `<span class="task-tag grp">${esc(grpName(meta, it.grp))}</span>` : ''}${it.tag ? `<span class="task-tag">${esc(it.tag)}</span>` : ''}${(() => { const tt = taskText(it, meta); return (/\n/.test(tt.trim()) ? parasHTML(tt) : inlineHTML(tt)) || '<span style="color:var(--paper-hair)">Aufgabentext</span>'; })()}${(() => { const tp = lvTipOf(it, ctx.view, meta); return tp ? `<div class="task-tip"><b>Tipp:</b> ${inlineHTML(tp)}</div>` : ''; })()}${arbHints(it).map(h => `<div class="task-hint">${esc(h)}</div>`).join('')}${ctx.view && ctx.view.lvl === 'all' && meta.levelsOn && Array.isArray(it.lv) ? `<span class="lv-tag">${it.lv.map(x => LV[x].sym).join(' · ')}</span>` : ''}</div><span class="task-afb">${taskRight(it, r, meta, ctx.view, i === 0 && itMin(b) ? { min: itMin(b), n: ITS.length, from: ctx.t + 1, to: ctx.t + ITS.length } : null)}</span>${taskEH(it, ctx.view)}</div>`;
      }).join('');
      ctx.t += tc;
      const n = put(`<div class="blk blk-tasks${hasSoz ? ' has-soz' : ''}"${hasSoz ? ` style="--picw:${picW}mm"` : ''}>${b.title ? `<div class="tasks-title">${esc(b.title)}</div>` : ''}${items}</div>`);
      return { type: 'tasks', el: n, atoms: [...n.children], keepFirst: b.title ? 2 : 1, keepLast: 1 };
    }
    case 'table': {
      const cols = b.cols.length;
      const head = b.cols.some(c => c.trim()) ? `<thead><tr>${b.cols.map((c, i) => `<th${tbCk(b, i) ? ' class="ckc"' : ''}${tbBg(b, 'h', i) ? ` style="background:${tbBg(b, 'h', i)}"` : ''}>${ckCellHTML(c)}</th>`).join('')}</tr></thead>` : '';
      const colg = `<colgroup>${tbWidths(b).map(p => `<col style="width:${p.toFixed(2)}%">`).join('')}</colgroup>`;
      const rows = b.rows.map((r, ri) => { const h = tbRowMM(b, ri), N = tbLines(h); return `<tr>${Array.from({ length: cols }, (_, i) => {
        const c = r[i] || ''; const eh = ctx.view && ctx.view.lehrer ? tbEh(b, ri, i) : [];
        const ehH = eh.length ? `<div class="tb-eh">${eh.length > 1 ? `<ul>${eh.map(x => `<li>${inlineHTML(x)}</li>`).join('')}</ul>` : inlineHTML(eh[0])}</div>` : '';
        const ckc = tbCk(b, i), bgc = tbBg(b, ri, i) ? `;background:${tbBg(b, ri, i)}` : ''; if (ckc && !eh.length && !String(c).trim()) return `<td class="ckc" style="height:${h}mm${bgc}">${CK_SVG(false)}</td>`;
        const ln = !ckc && !eh.length && b.cellLines && !String(c).trim() && N > 1 ? Array.from({ length: N - 1 }, (_, j) => `<i class="cl" style="top:${((j + 1) * h / N).toFixed(2)}mm"></i>`).join('') : '';
        return `<td style="height:${h}mm${bgc}"${ln ? ' class="lc"' : ckc ? ' class="ckc"' : ''}>${ckCellHTML(c)}${ehH}${ln}</td>`; }).join('')}</tr>`; }).join('');
      const n = put(`<div class="blk blk-table">${b.title ? `<div class="tb-title">${inlineHTML(b.title)}</div>` : ''}<table class="tb${b.firstBold ? ' fb' : ''}">${colg}${head}<tbody>${rows}</tbody></table></div>`);
      const atoms = [...n.querySelectorAll('tbody tr')];
      return {
        type: 'table', el: n, atoms, keepFirst: 2, keepLast: 1,
        contPre: () => { const th = n.querySelector('thead'); return th ? th.getBoundingClientRect().height : 0; },
        assemble(s, e) {
          const w = n.cloneNode(false);
          if (s === 0 && n.querySelector('.tb-title')) w.appendChild(n.querySelector('.tb-title').cloneNode(true));
          const t = n.querySelector('table').cloneNode(false);
          const cg = n.querySelector('colgroup'); if (cg) t.appendChild(cg.cloneNode(true));
          const th = n.querySelector('thead'); if (th) t.appendChild(th.cloneNode(true));
          const tb = document.createElement('tbody'); atoms.slice(s, e).forEach(a => tb.appendChild(a.cloneNode(true)));
          t.appendChild(tb); w.appendChild(t); return w;
        }
      };
    }
    case 'material': {
      const matHySplit = (w, top0, lh) => {
        const tw = document.createTreeWalker(w, NodeFilter.SHOW_TEXT); let node, at = null; const r = document.createRange();
        while ((node = tw.nextNode()) && !at) for (let i = 0; i < node.length; i++) { r.setStart(node, i); r.setEnd(node, i + 1); const rr = r.getClientRects(); const b2 = rr[rr.length - 1]; if (b2 && b2.width && b2.top > top0 + lh * .5) { at = [node, i]; break; } }
        if (!at) return null;
        const r1 = document.createRange(); r1.setStart(w, 0); r1.setEnd(at[0], at[1]); const r2 = document.createRange(); r2.setStart(at[0], at[1]); r2.setEnd(w, w.childNodes.length);
        const head = r1.cloneContents(), tail = r2.cloneContents(); const ht = head.textContent || ''; if (!ht.trim() || !(tail.textContent || '').trim()) return null;
        const a = w.cloneNode(false), c = w.cloneNode(false); a.appendChild(head); c.appendChild(tail); c.classList.add('w2');
        if (!/[-‐–]$/.test(ht)) a.insertAdjacentHTML('beforeend', '<span class="hy" aria-hidden="true">-</span>');
        return [a.outerHTML, c.outerHTML];
      };
      const no = ++ctx.m; const step = Number(meta.lineStep) || 5; const matLab = (designOf(meta) === 'akte' ? 'Anlage ' : '') + ((ctx.mt && ctx.mt[b.id]) || 'M' + no);
      const gm = glossMarks(b, { gaps: true, phrase: true }); const fm = matFmt(b); const notes = gm.list;
      const gapShow = !!(ctx.view && ctx.view.lehrer) || state.gapEdit === b.id; const gaps = gapList(b);
      const hdK = gapHdOn(b) && b.gapHd === 'kasten' && !(ctx.view && ctx.view.lehrer) ? matHeads(b).sort((a, c) => a.localeCompare(c, 'de', { sensitivity: 'base' })) : [];
      const bankH = (gaps.length && b.gapBank !== false ? `<div class="gap-bank"><b>Wortspeicher</b><span>${[...new Set(gaps.map(x => normTerm(x.w)))].sort((a, c) => a.localeCompare(c, 'de', { sensitivity: 'base' })).map(w => esc(w)).join('<i>·</i>')}</span></div>` : '')
        + (hdK.length ? `<div class="gap-bank hd-bank"><b>Zwischenüberschriften</b><span>${hdK.map(h => `<em>${inlineHTML(h)}</em>`).join('')}</span></div>` : '');
      const tailFor = (list, src, bank) => (list.length || src || (bank && bankH)) ? `<div class="mat-tail">${bank ? bankH : ''}${list.length ? `<div class="notes">${list.map(x => `<div><sup>${x.no}</sup> ${esc(normTerm(x.g.term))}: ${inlineHTML(x.g.text)}</div>`).join('')}</div>` : ''}${src ? `<div class="src">${inlineHTML(b.source)}</div>` : ''}</div>` : '';
      const tail = tailFor(notes, !!b.source, true);
      const poem = b.form === 'gedicht'; const paras = poem ? [] : hdGapParas(matParas(gm.text), b, !!(ctx.view && ctx.view.lehrer) || state.gapEdit === b.id); const verses = poem ? poemVerses(gm.text) : null;
      const noHyB = b.hy != null ? !b.hy : !!meta.noHy;
      const fcls = (noHyB ? ' nohy' : '') + (poem ? ' gedicht al-left noind' + (fm.margin ? ' rand' : '') : (fm.align === 'left' ? ' al-left' : '') + (fm.indent ? '' : ' noind') + (fm.margin ? ' rand' : '')) + (fm.silben === 'boegen' ? ' sil-b' : fm.silben === 'farbe' ? ' sil-f' : '');
      const silX = fm.silben ? silEx(fm.silx) : null; const wH = w => silX ? silHTML(w.h, silX) : w.h;
      const fsty = `--mfs:${FMT_SIZE[fm.size]}pt;--mlh:${FMT_LH[fm.lh]};--mff:${fmtFF(fm.font)}${fm.margin ? `;--mrw:${fm.mrw}mm` : ''}`;
      const isPost = !!b.post && !poem; const two = fm.cols === 2 && !isPost;
      const n = put(`<div class="blk blk-mat${fcls}${two ? ' mc2 mc-m' : ''}${isPost ? ' post' : ''}${state.gapEdit === b.id ? ' gap-edit' : ''}" style="${fsty}"><div class="mat-head"><span class="mat-no">${matLab}</span><span class="mat-title">${inlineHTML(b.title) || (isPost ? `Beitrag von ${esc(String(b.post.name || '').trim() || '…')} (${esc(POST_PF[b.post.pf] || POST_PF[''])}${b.post.date ? ', ' + esc(b.post.date) : ''})` : '') || '&nbsp;'}</span></div><div class="mat-body" lang="de"${fm.margin && fm.mrh.trim() ? ` data-rh="${esc(fm.mrh.trim())}"` : ''}>${poem ? (verses.length ? verses : [{ t: 'Gedichttext' }]).map(v => `<p class="vs${v.st ? ' st' : ''}">${toWordsM(v.t, gapShow, b.gapW).map(w => `<span class="w${w.gl ? ' glw' : ''}${w.gp ? ' gapw' : ''}" data-t="${esc(w.t)}">${wH(w)}</span>`).join(' ')}</p>`).join('') : matParasHTML(paras.length ? paras : [['Materialtext']], seg => toWordsM(seg, gapShow, b.gapW).map(w => `<span class="w${w.gl ? ' glw' : ''}${w.gp ? ' gapw' : ''}" data-t="${esc(w.t)}">${wH(w)}</span>`).join(' '))}</div>${tail}</div>`);
      // Zeilen ermitteln
      const bodyEl = n.querySelector('.mat-body');
      if (HY.fn && !poem && fm.align !== 'left' && !fm.silben && !noHyB) hyWords(bodyEl);
      const lh = parseFloat(getComputedStyle(bodyEl).lineHeight) || 21;
      const lines = []; const zw = [], zn = [];
      [...bodyEl.querySelectorAll('p')].forEach((p, pi) => {
        if (p.classList.contains('bl')) { lines.push({ html: '&nbsp;', bl: 1, v: pi + 1 }); return; }
        let top = null, cur = [], first = true;
        const flush = last => { if (cur.length) { lines.push({ html: cur.join(' '), pf: first && pi > 0 && !p.classList.contains('br') && !p.classList.contains('ah') && !p.classList.contains('mh'), pl: last, v: pi + 1, cont: !first, st: first && p.classList.contains('st'), h: p.classList.contains('mh'), hg: p.classList.contains('hg'), hs: p.classList.contains('hs') }); first = false; cur = []; } };
        [...p.querySelectorAll('.w')].forEach(w => {
          const rs = [...w.getClientRects()].filter(r => r.width > 0); const t = rs.length ? rs[0].top : w.getBoundingClientRect().top;
          if (top === null || t > top + lh * .5) { flush(false); top = t; }
          zw.push(w.dataset.t || ''); zn.push(poem ? pi + 1 : lines.length + 1);
          // Silbentrennung des Browsers: ein Wort über zwei Zeilen wird an der Trennstelle aufgeteilt
          const sp = !poem && rs.length > 1 && rs[rs.length - 1].top > rs[0].top + lh * .5 ? matHySplit(w, rs[0].top, lh) : null;
          if (sp) { cur.push(sp[0]); flush(false); top = rs[rs.length - 1].top; cur.push(sp[1]); } else cur.push(w.outerHTML);
        });
        flush(true);
      });
      // Zeilennummern: Zwischenüberschriften zählen nur mit, wenn so eingestellt; Wörter darin verweisen auf die nächste Zeile
      if (!poem) {
        let k = 0; lines.forEach(L => { L.n = L.bl || (L.h && !b.hdCount) ? 0 : ++k; });
        const nAt = ix => { for (let j = ix - 1; j < lines.length; j++) if (lines[j].n) return lines[j].n; for (let j = ix - 2; j >= 0; j--) if (lines[j].n) return lines[j].n; return ix; };
        for (let q = 0; q < zn.length; q++) zn[q] = nAt(zn[q]);
      }
      ZL_MAP[b.id] = { words: zw, lineOf: zn, tag: (ctx.mt && ctx.mt[b.id]) || 'M' + no, gaps: gaps.length > 0 };
      bodyEl.innerHTML = poem
        ? lines.map(L => `<div class="ln vs${L.st ? ' st' : ''}${L.cont ? ' vc' : ''}"><span class="ln-no" data-n="${L.v}">${b.lineNumbers !== false && !L.cont && L.v % step === 0 ? L.v : ''}</span><span class="ln-t">${L.html}</span></div>`).join('')
        : lines.map(L => `<div class="ln${L.pf ? ' pf' : ''}${L.pl ? ' pl' : ''}${L.h ? ' mh' : ''}${L.hg ? ' hg' : ''}${L.hs ? ' hs' : ''}${L.bl ? ' bl' : ''}"><span class="ln-no" data-n="${L.n || ''}">${b.lineNumbers !== false && L.n && L.n % step === 0 ? L.n : ''}</span><span class="ln-t">${L.html}</span></div>`).join('');
      if (b.lineNumbers === false) bodyEl.querySelectorAll('.ln-no').forEach(x => x.style.visibility = 'hidden');
      const head = n.querySelector('.mat-head'), tailEl = n.querySelector('.mat-tail');
      const lineEls = [...bodyEl.children];
      let postEls = [];
      if (isPost) { bodyEl.insertAdjacentHTML('afterbegin', postHeadHTML(b)); bodyEl.insertAdjacentHTML('beforeend', postFootHTML(b)); postEls = [bodyEl.firstElementChild, bodyEl.lastElementChild]; }
      const atoms = [head, ...(isPost ? [postEls[0]] : []), ...lineEls, ...(isPost ? [postEls[1]] : []), ...(tailEl ? [tailEl] : [])];
      // Worterklärungen stehen auf der Seite, auf der das Wort steht: jeder Teil eines langen Materials bekommt die Erklärungen seiner Zeilen, der letzte dazu die Quelle
      const lineNos = new Map(lineEls.map(l => [l, [...l.querySelectorAll('sup.gl')].map(x => +x.textContent)]));
      const tailOf = (ls, last) => { const nos = new Set(ls.flatMap(a => lineNos.get(a) || [])); const h = tailFor(notes.filter(x => nos.has(x.no)), last && !!b.source, last); return h ? el(h) : null; };
      if (two) return matTwoCols({ n, b, ctx, head, tailEl, bodyEl, lineEls, atoms, matLab, poem, tailOf });
      const assemble = (s, e) => {
        const w = n.cloneNode(false);
        if (s > 0) w.appendChild(el(`<div class="mat-cont">${matLab} · Fortsetzung</div>`));
        let bodyClone = null; const sel = atoms.slice(s, e);
        sel.forEach(a => {
          if (a === tailEl) return;
          if (a === head) w.appendChild(a.cloneNode(true));
          else { if (!bodyClone) { bodyClone = bodyEl.cloneNode(false); w.appendChild(bodyClone); } bodyClone.appendChild(a.cloneNode(true)); }
        });
        const t = tailOf(sel, !!tailEl && sel.includes(tailEl)); if (t) w.appendChild(t);
        return w;
      };
      const item = { type: 'material', el: n, atoms, keepFirst: isPost ? 4 : 3, keepLast: (tailEl ? 3 : 2) + (isPost ? 1 : 0), contPre: () => 5.2 * MMPX, assemble, keepNext: i => [atoms[i], atoms[i - 1], atoms[i - 2]].some(a => !!(a && a.classList && a.classList.contains('mh'))) };
      // Mit Worterklärungen hängt die Höhe eines Teils davon ab, welche Erklärungen mitwandern: dann den Teil selbst messen
      if (notes.length) { const memo = new Map(); item.partH = (s, e) => { const key = s + ':' + e; if (!memo.has(key)) { const w = assemble(s, e); ctx.body.appendChild(w); memo.set(key, w.getBoundingClientRect().height); w.remove(); } return memo.get(key); }; }
      return item;
    }
  }
  return { type: 'unknown' };
}

let tileURL = null;
function gridTile() {
  if (tileURL) return tileURL;
  const c = document.createElement('canvas'); c.width = c.height = 60;
  const x = c.getContext('2d'); x.fillStyle = '#ffffff'; x.fillRect(0, 0, 60, 60);
  x.fillStyle = '#C6CBD5'; x.fillRect(0, 0, 60, 2); x.fillRect(0, 0, 2, 60);
  try { tileURL = c.toDataURL('image/png'); } catch { tileURL = ''; }
  return tileURL;
}

/* ---------- Lange Absätze über Seiten verteilen ---------- */
// Teilt einen Absatz (p oder li) an Zeilengrenzen in Stücke; die Formatierung bleibt erhalten (Range.cloneContents).
// Die ersten und die letzten zwei Zeilen bleiben zusammen, damit nie eine einzelne Zeile oben oder unten auf einer Seite steht.
function lineFrags(el) {
  const cs = getComputedStyle(el); const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4 || 16;
  if (el.getBoundingClientRect().height < lh * 5.5) return [el];
  const starts = []; let lastTop = null; const rg = document.createRange();
  const mark = (t, node, off) => { if (lastTop === null) { lastTop = t; return; } if (t > lastTop + lh * .5) { starts.push({ node, off }); lastTop = t; } };
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT); let n;
  while ((n = w.nextNode())) {
    if (n.nodeType === 1) { if (n.matches('.gap, img')) { const p = n.parentNode; mark(n.getBoundingClientRect().top, p, [...p.childNodes].indexOf(n)); } continue; }
    const t = n.nodeValue; const re = /\S+/g; let m;
    while ((m = re.exec(t))) { rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length); const rs = rg.getClientRects(); if (rs.length) mark(rs[0].top, n, m.index); }
  }
  if (starts.length < 5) return [el];
  const pts = [null, ...starts.slice(1, starts.length - 1), null];
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const r = document.createRange();
    if (pts[i]) r.setStart(pts[i].node, pts[i].off); else r.setStart(el, 0);
    if (pts[i + 1]) r.setEnd(pts[i + 1].node, pts[i + 1].off); else r.setEnd(el, el.childNodes.length);
    const f = el.cloneNode(false); f.appendChild(r.cloneContents()); f.classList.add('lf'); if (i) f.classList.add('lf-c');
    out.push(f);
  }
  return out;
}
// Macht den Inhalt eines Textbereichs umbrechbar: Listen werden zu einzelnen Punkten, lange Absätze zu Zeilenstücken
function splitParas(box) {
  [...box.children].forEach(c => {
    if (!/^(UL|OL)$/.test(c.nodeName)) return;
    let k = Number(c.getAttribute('start')) || 1;
    [...c.children].forEach(li => { const w = c.cloneNode(false); if (c.nodeName === 'OL') w.setAttribute('start', k++); w.classList.add('lw'); w.appendChild(li); box.insertBefore(w, c); });
    c.remove();
  });
  [...box.children].forEach(c => {
    if (c.nodeName === 'P') { const fr = lineFrags(c); if (fr.length > 1) { fr.forEach(f => box.insertBefore(f, c)); c.remove(); } }
    else if (c.classList.contains('lw') && c.firstElementChild) {
      const fr = lineFrags(c.firstElementChild);
      if (fr.length > 1) { fr.forEach(f => { const w = c.cloneNode(false); w.appendChild(f); box.insertBefore(w, c); }); c.remove(); }
    }
  });
  return [...box.children];
}
// Zusammensetzen eines geteilten Kastens: Kopfteile direkt, Absätze wieder im Textbereich
function nestedAssemble(n, heads, body, atoms, extra) {
  return (s, e) => {
    const w = n.cloneNode(false); let bc = null;
    if (s === 0 && extra) w.appendChild(extra.cloneNode(true));
    atoms.slice(s, e).forEach(a => {
      if (a.parentNode === body) { if (!bc) { bc = body.cloneNode(false); w.appendChild(bc); } bc.appendChild(a.cloneNode(true)); }
      else w.appendChild(a.cloneNode(true));
    });
    return w;
  };
}

function measure(it) {
  const r0 = it.el.getBoundingClientRect();
  it.h = r0.height + (it.type === 'head' ? (parseFloat(it.el.style.marginBottom) || 0) : 0);
  if (!it.atoms || !it.atoms.length) { it.atoms = null; return; }
  const rs = it.atoms.map(a => a.getBoundingClientRect());
  const tops = rs.map(r => r.top - r0.top);
  it.pre = tops[0];
  it.post = Math.max(0, r0.height - (rs[rs.length - 1].bottom - r0.top));
  it.ah = rs.map((r, i) => (i < rs.length - 1 ? tops[i + 1] : r.bottom - r0.top) - tops[i]);
  it.cpre = it.contPre ? it.contPre() : 0;
  if (!it.assemble) it.assemble = (s, e) => { const w = it.el.cloneNode(false); it.atoms.slice(s, e).forEach(a => w.appendChild(a.cloneNode(true))); return w; };
}
const sum = (a, s, e) => { let t = 0; for (let i = s; i < e; i++) t += a[i]; return t; };
/* Material in zwei Spalten: Zeilen in Spaltenbreite ermittelt, je Seite links und rechts verteilt */
function matTwoCols({ n, ctx, head, tailEl, bodyEl, lineEls, atoms, matLab, poem, tailOf }) {
  const H = new Map(lineEls.map(l => [l, l.getBoundingClientRect().height]));
  const hs = [...H.values()].sort((a, c) => a - c); const lh = hs[Math.floor(hs.length / 2)] || 20;
  const stPad = poem && lineEls[0] ? parseFloat(getComputedStyle(lineEls.find(l => l.classList.contains('st')) || lineEls[0]).paddingTop) || 0 : 0;
  // Teilungsstelle: beide Spalten möglichst gleich hoch; Gedichte lieber zwischen Strophen, nie mitten in einem umbrochenen Vers
  const split = ls => {
    const m = ls.length; if (m < 2) return m;
    const tot = ls.reduce((a, l) => a + H.get(l), 0); let best = m, cost = Infinity, left = 0;
    for (let k = 1; k < m; k++) {
      left += H.get(ls[k - 1]); const c = ls[k].classList;
      const right = tot - left - (c.contains('st') ? stPad : 0);
      let x = Math.max(left, right);
      if (poem) { if (!c.contains('st')) x += lh * 2; if (c.contains('vc')) x += lh * 6; }
      else { if (c.contains('pl')) x += lh * .6; if (ls[k - 1].classList.contains('pf')) x += lh * .6;
        // Zwischenüberschrift mit weniger als drei Zeilen darunter unten in der Spalte: lieber oben in der nächsten Spalte beginnen
        for (let j = 1; j <= 3 && k - j >= 0; j++) if (ls[k - j].classList.contains('mh')) { x += lh * 8; break; }
        if (c.contains('mh')) x -= lh * .3; }
      if (x < cost - .01 || (Math.abs(x - cost) < .01 && left >= right)) { cost = x; best = k; }
    }
    return best;
  };
  const assemble = (s, e) => {
    const w = n.cloneNode(false); w.classList.remove('mc-m');
    if (s > 0) w.appendChild(el(`<div class="mat-cont">${matLab} · Fortsetzung</div>`));
    const sel = atoms.slice(s, e);
    if (sel[0] === head) w.appendChild(head.cloneNode(true));
    const ls = sel.filter(a => a !== head && a !== tailEl);
    if (ls.length) {
      const bc = bodyEl.cloneNode(false); bc.classList.add('mc-cols'); const k = split(ls);
      [ls.slice(0, k), ls.slice(k)].forEach(part => { const c = document.createElement('div'); c.className = 'mcol'; part.forEach(l => c.appendChild(l.cloneNode(true))); bc.appendChild(c); });
      w.appendChild(bc);
    }
    const t = tailOf(ls, !!tailEl && sel.includes(tailEl)); if (t) w.appendChild(t);
    return w;
  };
  const full = assemble(0, atoms.length); n.replaceWith(full);
  const memo = new Map();
  const partH = (s, e) => { const key = s + ':' + e; if (!memo.has(key)) { const w = assemble(s, e); ctx.body.appendChild(w); memo.set(key, w.getBoundingClientRect().height); w.remove(); } return memo.get(key); };
  return { type: 'material', el: full, atoms, keepFirst: 3, keepLast: tailEl ? 3 : 2, contPre: () => 5.2 * MMPX, assemble, partH, keepNext: i => [atoms[i], atoms[i - 1], atoms[i - 2]].some(a => !!(a && a.classList && a.classList.contains('mh'))) };
}
function minStart(it) { if (!it || !it.el) return 0; if (!it.atoms) return Math.min(it.h, AVAIL); if (it.partH) return it.partH(0, Math.min(it.keepFirst, it.atoms.length)); return it.pre + sum(it.ah, 0, Math.min(it.keepFirst, it.atoms.length)); }

function paginate(items) {
  const pages = [{ list: [], used: 0 }];
  const cur = () => pages[pages.length - 1];
  const fresh = () => { pages.push({ list: [], used: 0 }); };
  for (let k = 0; k < items.length; k++) {
    const it = items[k];
    if (it.type === 'pagebreak') { if (cur().list.length) fresh(); continue; }
    if (!it.el) continue;
    let gap = cur().list.length ? GAP : 0;
    if (it.type === 'heading' && cur().list.length) {
      const need = it.h + GAP + minStart(items[k + 1]);
      if (cur().used + gap + need > AVAIL) { fresh(); gap = 0; }
    }
    if (cur().used + gap + it.h <= AVAIL) { cur().list.push({ it, whole: true }); cur().used += gap + it.h; continue; }
    if (!it.atoms) {
      if (cur().list.length) { fresh(); }
      cur().list.push({ it, whole: true }); cur().used += it.h; if (cur().used > AVAIL) cur().over = true; continue;
    }
    const n = it.atoms.length; let s = 0, guard = 0;
    while (s < n && guard++ < 500) {
      gap = cur().list.length ? GAP : 0;
      const room = AVAIL - cur().used - gap;
      const pre = s === 0 ? it.pre : it.cpre;
      let e = s, h = pre + it.post;
      if (it.partH) { while (e < n && it.partH(s, e + 1) <= room) e++; h = e > s ? it.partH(s, e) : 0; }
      else while (e < n && h + it.ah[e] <= room) { h += it.ah[e]; e++; }
      if (e === n) { cur().list.push({ it, s, e }); cur().used += gap + h; break; }
      const needFirst = s === 0 ? Math.min(it.keepFirst, n) : 1;
      if (e - s < needFirst) { if (cur().list.length) { fresh(); continue; } e = Math.max(e, s + 1); }
      if (it.keepNext) { let e3 = e; while (e3 - 1 > s && it.keepNext(e3 - 1)) e3--; if (e3 < e && e3 - s >= (s === 0 ? Math.min(it.keepFirst, n) : 1)) e = e3; }
      if (n - e < it.keepLast) { const e2 = n - it.keepLast; if (e2 - s >= needFirst) e = e2; else if (cur().list.length && s === 0) { fresh(); continue; } }
      const ph = it.partH ? it.partH(s, e) : pre + sum(it.ah, s, e) + (e === n ? it.post : 0);
      cur().list.push({ it, s, e }); cur().used += gap + ph;
      if (cur().used > AVAIL + 1) cur().over = true;
      fresh(); s = e;
    }
  }
  if (pages.length > 1 && !cur().list.length) pages.pop();
  return pages;
}

// Helle Version der Blattfarbe für den Textmarker (ohne color-mix, damit html2canvas sie kennt)
const mixHex = (hex, w) => '#' + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - w) + 255 * w).toString(16).padStart(2, '0')).join('').toUpperCase();
const markColor = meta => mixHex(pageAcc(meta).c, .74);
function setAccent(node, meta) {
  const d = designOf(meta); const a = pageAcc(meta); const ps = phSize(meta);
  node.style.setProperty('--phf', ps.px + 'px'); node.style.setProperty('--phh', ps.h + 'px');
  node.style.setProperty('--acc', a.c); node.style.setProperty('--acc-tint', a.t); node.style.setProperty('--acc-mark', markColor(meta));
  Object.keys(DESIGNS).forEach(k => node.classList.toggle('d-' + k, k === d));
  node.classList.toggle('tone', d === 'akte' && meta.tone !== false);
}

// Bild mit Beschriftungen: Bild in der Mitte, Kästen links, rechts, oben oder unten. Die Pfeile zeichnet lbArrows() nach dem Setzen.
const lbSide = x => (['l', 'r', 'o', 'u'].includes(x.s) ? x.s : 'l');
function lbHTML(b, ctx) {
  const L = (b.lb || []).filter(Boolean), mode = b.lbMode || '', tag = ctx.mt && ctx.mt[b.id];
  const nl = Math.max(2, Math.min(6, +(b.lbLines || 3)));
  const card = (x, i) => { const head = mode === 'ganz' ? '' : inlineHTML(x.h || ''); const txt = mode ? '' : inlineHTML(x.t || '').replace(/\n/g, '<br>');
    const ft = x.tx != null && x.ty != null ? ` data-tx="${Math.max(-15, Math.min(115, +x.tx))}" data-ty="${Math.max(-15, Math.min(115, +x.ty))}"` : '';
    return `<div class="lb-c lb-${lbSide(x)}" data-lbi="${i}" data-at="${x.at || 'm'}"${ft}>${head ? `<b class="lb-h">${head}</b>` : mode === 'ganz' ? '' : '<b class="lb-h">&nbsp;</b>'}${txt ? `<div class="lb-t">${txt}</div>` : ''}${mode ? '<div class="lb-wl"></div>'.repeat(nl) : ''}</div>`; };
  const pick = s => L.map((x, i) => lbSide(x) === s ? card(x, i) : '').join('');
  const img = b.src ? `<img src="${esc(b.src)}" alt="">` : '<div class="img-empty">Bild hinzufügen</div>';
  const mid = Math.max(25, Math.min(70, +b.width || 42)), top = pick('o'), bot = pick('u');
  return `<div class="blk blk-img blk-lb${mode ? ' lb-leer' : ''}" data-arr="${['gerade', 'strich', 'kraeftig', 'punkt'].includes(b.lbArr) ? b.lbArr : 'bogen'}">${tag || b.caption ? `<div class="mat-head">${tag ? `<span class="mat-no">${tag}</span>` : ''}<span class="mat-title">${inlineHTML(b.caption || '') || '&nbsp;'}</span></div>` : ''}<div class="lb-g" style="--lbm:${mid}%">${top ? `<div class="lb-row o">${top}</div>` : ''}<div class="lb-mrow"><div class="lb-col l">${pick('l')}</div><div class="lb-mid">${img}</div><div class="lb-col r">${pick('r')}</div></div>${bot ? `<div class="lb-row u">${bot}</div>` : ''}</div>${b.source ? `<div class="img-src">${inlineHTML(b.source)}</div>` : ''}</div>`;
}
// Pfeile als Ebene über dem Baustein: vom Kasten zum gewählten Punkt im Bild (oder automatisch zum Bildrand)
function lbArrows(root = document.getElementById('pages')) {
  if (!root) return;
  root.querySelectorAll('.blk-lb .lb-g').forEach(g => {
    const old = g.querySelector(':scope > svg.lb-ov'); if (old) old.remove();
    const im = g.querySelector('.lb-mid img, .lb-mid .img-empty'); if (!im) return;
    if (im.tagName === 'IMG' && !im.complete) { im.addEventListener('load', () => lbArrows(root), { once: true }); }
    const page = g.closest('.page'); const G = g.getBoundingClientRect(); if (!G.width) return;
    const pw = page ? +page.dataset.w || 210 : 210, mmPx = page ? page.getBoundingClientRect().width / pw : G.width / 180;
    const u = v => v / mmPx; // Bildschirmpixel → mm; das SVG rechnet in mm
    const I = im.getBoundingClientRect(), ix = u(I.left - G.left), iy = u(I.top - G.top), iw = u(I.width), ih = u(I.height);
    const W = u(G.width), H = u(G.height), gap = 1.6, cl = (v, a, z) => Math.max(a, Math.min(z, v));
    const sty = (g.closest('.blk-lb') || {}).dataset ? g.closest('.blk-lb').dataset.arr || 'bogen' : 'bogen', curve = sty !== 'gerade';
    let d = '';
    g.querySelectorAll('.lb-c').forEach(c => {
      const C = c.getBoundingClientRect(), cx = u(C.left - G.left), cy = u(C.top - G.top), cw = u(C.width), ch = u(C.height);
      const s = c.classList.contains('lb-r') ? 'r' : c.classList.contains('lb-o') ? 'o' : c.classList.contains('lb-u') ? 'u' : 'l';
      const sh = { o: -0.22, m: 0, u: 0.22 }[c.dataset.at] || 0, free = c.dataset.tx != null;
      let x0, y0, x1, y1;
      if (s === 'l') { x0 = cx + cw + 1; y0 = cy + ch / 2; }
      else if (s === 'r') { x0 = cx - 1; y0 = cy + ch / 2; }
      else if (s === 'o') { x0 = cx + cw / 2; y0 = cy + ch + 1; }
      else { x0 = cx + cw / 2; y0 = cy - 1; }
      if (free) { x1 = ix + iw * c.dataset.tx / 100; y1 = iy + ih * c.dataset.ty / 100; }
      else if (s === 'l' || s === 'r') { x1 = s === 'l' ? ix - gap : ix + iw + gap; y1 = cl(y0 + sh * ih, iy + 4, iy + ih - 4); }
      else { x1 = cl(x0, ix + 4, ix + iw - 4); y1 = s === 'o' ? iy - gap : iy + ih + gap; }
      const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy); if (len < 3) return;
      // leichte Biegung wie gezeichnet: Kontrollpunkt seitlich der Mitte
      const bend = (curve ? 1 : 0) * Math.min(0.22 * len, 9) * (s === 'r' || s === 'u' ? -1 : 1) * (dy >= 0 ? 1 : -1) * (s === 'o' || s === 'u' ? -1 : 1);
      const qx = (x0 + x1) / 2 - dy / len * bend, qy = (y0 + y1) / 2 + dx / len * bend;
      const tx = x1 - qx, ty = y1 - qy, tl = Math.hypot(tx, ty) || 1, ux = tx / tl, uy = ty / tl, hl = 2.4, a = 0.5;
      const hx = (cs, sn) => `${(x1 - hl * (ux * Math.cos(a) * cs - uy * Math.sin(a) * sn)).toFixed(2)} ${(y1 - hl * (uy * Math.cos(a) * cs + ux * Math.sin(a) * sn)).toFixed(2)}`;
      const f2 = v => v.toFixed(2);
      d += `<path class="lb-a" d="M${f2(x0)} ${f2(y0)} Q${f2(qx)} ${f2(qy)} ${f2(x1)} ${f2(y1)}"/>` + (sty === 'punkt' ? `<circle class="lb-a lb-hd lb-pt" cx="${f2(x1)}" cy="${f2(y1)}" r="1.1"/>` : `<path class="lb-a lb-hd" d="M${hx(1, 1)} L${f2(x1)} ${f2(y1)} L${hx(1, -1)}"/>`)
        + `<circle class="lb-tip" data-lbi="${c.dataset.lbi}" cx="${f2(x1)}" cy="${f2(y1)}" r="2.6"><title>Pfeilspitze verschieben</title></circle>`;
    });
    if (d) g.insertAdjacentHTML('beforeend', `<svg class="lb-ov s-${sty}" viewBox="0 0 ${W.toFixed(2)} ${H.toFixed(2)}" preserveAspectRatio="none" aria-hidden="true">${d}</svg>`);
  });
}

// Zielpunkte im Editor ziehen: Pfeile in der Vorschau folgen sofort, gespeichert wird beim Loslassen
document.addEventListener('pointerdown', e => {
  const dot = e.target.closest && e.target.closest('#editor .lb-dot'); if (!dot) return;
  const box = dot.closest('[data-lbpick]'), card = dot.closest('[data-bid]'); if (!box || !card) return;
  const b = target(card.dataset.bid), i = +dot.dataset.lbdot, x = b && b.lb && b.lb[i]; if (!x) return;
  e.preventDefault(); snapshot(); try { dot.setPointerCapture(e.pointerId); } catch { }
  const pv = () => document.querySelectorAll(`#pages [data-bid="${card.dataset.bid}"] .lb-c[data-lbi="${i}"]`);
  const move = ev => { const r = box.querySelector('img').getBoundingClientRect();
    x.tx = Math.round(Math.max(0, Math.min(100, (ev.clientX - r.left) / r.width * 100)) * 10) / 10; x.ty = Math.round(Math.max(0, Math.min(100, (ev.clientY - r.top) / r.height * 100)) * 10) / 10;
    dot.style.left = x.tx + '%'; dot.style.top = x.ty + '%';
    const cs = [...pv()]; if (cs.length) { cs.forEach(c => { c.dataset.tx = x.tx; c.dataset.ty = x.ty; }); lbArrows(); } };
  const up = () => { dot.removeEventListener('pointermove', move); dot.removeEventListener('pointerup', up); dot.removeEventListener('pointercancel', up); changed(true); };
  dot.addEventListener('pointermove', move); dot.addEventListener('pointerup', up); dot.addEventListener('pointercancel', up);
});

// Pfeilspitze direkt im Blatt ziehen: der Pfeil zeigt danach frei auf diese Stelle
document.addEventListener('pointerdown', e => {
  const tip = e.target.closest && e.target.closest('#pages .lb-tip'); if (!tip) return;
  const blk = tip.closest('.blk-lb[data-bid]'), b = blk && target(blk.dataset.bid), i = +tip.dataset.lbi, x = b && b.lb && b.lb[i]; if (!x) return;
  const im = blk.querySelector('.lb-mid img, .lb-mid .img-empty'), c = blk.querySelector(`.lb-c[data-lbi="${i}"]`); if (!im || !c) return;
  e.preventDefault(); e.stopPropagation(); snapshot(); let moved = false;
  const move = ev => { const r = im.getBoundingClientRect(); moved = true;
    x.tx = Math.round(Math.max(-15, Math.min(115, (ev.clientX - r.left) / r.width * 100)) * 10) / 10; x.ty = Math.round(Math.max(-15, Math.min(115, (ev.clientY - r.top) / r.height * 100)) * 10) / 10;
    c.dataset.tx = x.tx; c.dataset.ty = x.ty; lbArrows(); };
  const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up);
    const eat = ev => { ev.stopPropagation(); ev.preventDefault(); }; window.addEventListener('click', eat, { capture: true, once: true }); setTimeout(() => window.removeEventListener('click', eat, { capture: true }), 350);
    if (moved) { changed(true); renderEditor(); } };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
}, true);

let fontsOK = false;
function layout() {
  const sh = state.sheet, meta = sh.meta; const v = sheetView();
  const buch = meta.paper === 'buch'; const a5 = meta.paper === 'a5x2' || buch; const q = meta.paper === 'a4q'; AVAIL = (GEO[a5 ? 'a5' : q ? 'a4q' : 'a4'].avail - (BOT_GAP[a5 ? 'a5' : 'a4'][meta.botGap] ?? BOT_GAP[a5 ? 'a5' : 'a4'][''])) * MMPX;
  const mp = $('#measure'); setAccent(mp, meta); mp.classList.toggle('a5', a5); mp.classList.toggle('a4q', q); ZL_MAP = {};
  const body = mp.querySelector('.pg-body'); body.innerHTML = '';
  const ctx = { m: 0, t: 0, meta, body, acc: pageAcc(meta).c, bg: pageBg(meta), view: v, mt: matTags(sh.blocks.filter(b => blockVisible(b, v))) };
  const items = [];
  if (meta.mode === 'klausur') items.push(buildCover(meta, sh, v, body), { type: 'pagebreak' }, buildRunHead(meta, body));
  else { items.push(buildHead(meta, body)); if (v.lvl !== 'all') { const hd = items[items.length - 1].el; if (hd) hd.insertAdjacentHTML('beforeend', `<span class="lv-mark" title="Niveau ${LV[v.lvl].name}">${LV[v.lvl].sym}</span>`); } }
  if (v.grp !== 'all') items.push(buildGroupBadge(meta, v.grp, body));
  for (const b of sh.blocks) { if (!blockVisible(b, v)) continue; if (b.type === 'tafel' && b.onSheet === 'aus') continue; if (b.type === 'a3' || b.type === 'step') continue; if (b.type === 'tasks') ctx.t = tnAt(b, ctx.t, ctx.tn || (ctx.tn = {})); items.push(buildBlock(b, ctx)); }
  items.forEach(it => { if (it.el) measure(it); });
  // Bild mit Beschriftungen soll mit dem Kopf auf eine Seite passen: Bild schrittweise verkleinern (nicht unter 40 mm)
  { const hd = items.find(it => it.type === 'head' && it.el); const lim = AVAIL - (hd ? hd.h + GAP : 0);
    items.forEach(it => { if (!it.el || !it.el.classList.contains('blk-lb')) return; const im = it.el.querySelector('.lb-mid img'); if (!im || it.h <= lim) return;
      let mx = parseFloat(getComputedStyle(im).maxHeight) / MMPX || 120;
      while (it.h > lim && mx > 40) { mx -= 6; im.style.maxHeight = mx + 'mm'; measure(it); } }); }
  // Chat im iPhone-Format genauso: als Ganzes verkleinern, bis es mit dem Kopf auf eine Seite passt
  { const hd = items.find(it => it.type === 'head' && it.el); const lim = AVAIL - (hd ? hd.h + GAP : 0);
    items.forEach(it => { if (!it.el || !it.el.classList.contains('ch-ip') || it.h <= lim) return;
      let f = parseFloat(getComputedStyle(it.el).fontSize) || 13; const f0 = f; while (it.h > lim && f > f0 * 0.5) { f *= 0.93; it.el.style.fontSize = f.toFixed(2) + 'px'; measure(it); } }); }
  const pages = paginate(items);
  SPLIT_MATS = new Set(); pages.forEach(p => p.list.forEach(pl => { if (!pl.whole && pl.it.type === 'material' && !(pl.s === 0 && pl.e === pl.it.atoms.length)) SPLIT_MATS.add(pl.it.el.dataset.bid); }));
  const tag = [v.lehrer ? 'Lehrerfassung' : '', v.grp !== 'all' ? grpName(meta, v.grp) : '', v.lvl !== 'all' ? LV[v.lvl].sym : ''].filter(Boolean).join(' · ');
  const out = pages.map((p, i) => {
    const pg = document.createElement('div'); pg.className = 'page'; setAccent(pg, meta); pg.classList.toggle('a5', a5);
    if (isGS()) { const jg = gsJg(); pg.classList.add('gs'); pg.style.setProperty('--gsfs', (jg <= 2 ? 15 : jg <= 4 ? 13 : 12) + 'pt'); }
    if (q) { pg.classList.add('a4q'); pg.dataset.w = 297; pg.dataset.h = 210; } else { pg.dataset.w = 210; pg.dataset.h = 297; }
    const pb = document.createElement('div'); pb.className = 'pg-body'; pg.appendChild(pb);
    p.list.forEach(pl => pb.appendChild(pl.whole ? pl.it.el.cloneNode(true) : pl.it.assemble(pl.s, pl.e)));
    const left = [meta.school, meta.course].filter(Boolean).map(esc).join(' · ');
    const right = [tag, meta.mode !== 'klausur' && meta.nr ? 'AB ' + esc(meta.nr) : '', pages.length > 1 ? `<span class="pg-no">${designOf(meta) === 'akte' ? 'Blatt' : 'Seite'} ${i + 1} von ${pages.length}</span>` : ''].filter(Boolean).join(' · ');
    pg.appendChild(el(`<div class="pg-foot"><span>${left}</span><span>${right}</span></div>`));
    if (v.lehrer) pg.appendChild(el('<div class="pg-badge">Lehrerfassung</div>'));
    return { pg, over: !!p.over };
  });
  body.innerHTML = '';
  if (!a5) return out;
  if (buch) {
    // Wie ein aufgeschlagenes Buch: Seite 1 links, Seite 2 rechts, dann 3 und 4 usw.
    const sheets = [];
    for (let i = 0; i < out.length; i += 2) {
      const bg = document.createElement('div'); bg.className = 'bogen buch'; bg.dataset.w = 297; bg.dataset.h = 210;
      const r = out[i + 1]; bg.append(out[i].pg, r ? r.pg : el('<div class="leer"></div>'));
      sheets.push({ pg: bg, over: out[i].over || !!(r && r.over) });
    }
    state.bookPages = out.length; return sheets;
  }
  return out.map(o => { const bg = document.createElement('div'); bg.className = 'bogen'; bg.dataset.w = 297; bg.dataset.h = 210; bg.append(o.pg, o.pg.cloneNode(true), cutEl()); return { pg: bg, over: o.over }; });
}

let renderTimer = null;
/* Silbentrennung ohne Wörterbuch des Browsers (Windows-App/Electron hat keins): weiche Trennstriche nach deutschen Trennmustern einsetzen */
const HY = { need: null, fn: null, busy: false };
function hyNeed() {
  if (HY.need !== null) return HY.need;
  try { const d = document.createElement('div'); d.lang = 'de'; d.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;width:48px;font:16px/20px serif;-webkit-hyphens:auto;hyphens:auto;overflow-wrap:normal;word-break:normal'; d.textContent = 'Donaudampfschifffahrtsgesellschaft'; document.body.appendChild(d);
    const h1 = d.getBoundingClientRect().height; d.style.webkitHyphens = 'manual'; d.style.hyphens = 'manual'; const h2 = d.getBoundingClientRect().height; d.remove(); HY.need = !(h1 > h2 * 1.5); } catch { HY.need = false; }
  return HY.need;
}
function hyInit() {
  if (HY.fn || HY.busy || !hyNeed()) return; HY.busy = true;
  Promise.all([loadScript('lib/hyphen.js'), loadScript('lib/hyphen-de.js')]).then(() => { if (window.createHyphenator && window.hyphenationPatternsDe1996) { const f = window.createHyphenator(window.hyphenationPatternsDe1996, { html: false }); HY.fn = t => hyMin(f(t)); scheduleRender(0); } }).catch(err => console.warn('Silbentrennung nicht geladen', err)).finally(() => { HY.busy = false; });
}
// wie im Browser: mindestens 3 Buchstaben vor und nach der Trennstelle, Wörter ab 6 Buchstaben
const hyMin = t => t.replace(/[^\s­]+(?:­[^\s­]+)+/g, w => { const parts = w.split('­'), L = w.replace(/­/g, '').length; if (L < 6) return parts.join(''); let pos = 0, out = parts[0]; pos = parts[0].length; for (let i = 1; i < parts.length; i++) { const left = pos, right = L - pos; out += (left >= 3 && right >= 3 ? '­' : '') + parts[i]; pos += parts[i].length; } return out; });
function hyWords(root) {
  if (!HY.fn) return; const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => (n.parentElement && n.parentElement.closest('.gap, sup, .hy') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
  const L = []; let n; while ((n = tw.nextNode())) L.push(n); L.forEach(t => { if (/[A-Za-zÄÖÜäöüß]{6}/.test(t.nodeValue)) t.nodeValue = HY.fn(t.nodeValue); });
}
function scheduleRender(ms = 220) { clearTimeout(renderTimer); renderTimer = setTimeout(renderPreview, ms); }
let MAPPE_LOCK = false, EXTRA_FONTS = [];
