/* ================= Suche in den Materialien (Vorschau): Treffer markieren, mit Material und Zeile ================= */
const MSR = { open: false, q: '', hits: [], cur: -1 };
const msrNorm = s => s.toLocaleLowerCase('de').replace(/ß/g, 'ss');
function msrClear() { document.querySelectorAll('#pages mark.msr-hit').forEach(m => { const p = m.parentNode; p.replaceChild(document.createTextNode(m.textContent), m); p.normalize(); }); }
function msrRun(keepCur) {
  msrClear(); MSR.hits = []; const q = msrNorm(MSR.q.trim()); const bar = $('#msr'); if (!bar) return;
  if (q.length >= 2) {
    // je Material (auch über Seiten verteilt) einen durchgehenden Text bauen; Trennstellen am Zeilenende zählen nicht
    const mats = new Map(); document.querySelectorAll('#pages .blk-mat').forEach(m => { const lab = ((m.querySelector('.mat-no') || {}).textContent || '').trim() || 'Material'; if (!mats.has(lab)) mats.set(lab, []); mats.get(lab).push(m); });
    mats.forEach((parts, lab) => {
      let txt = ''; const map = []; // je Zeichen: [Textknoten, Offset, Zeile]
      parts.forEach(m => m.querySelectorAll('.ln').forEach(ln => {
        const t = ln.querySelector('.ln-t'); if (!t) return; const n = +((ln.querySelector('.ln-no') || {}).dataset || {}).n || 0;
        const tw = document.createTreeWalker(t, NodeFilter.SHOW_TEXT, { acceptNode: x => (x.parentElement.closest('.hy, sup, .gl-no') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
        let nd; while ((nd = tw.nextNode())) { const v = nd.nodeValue; for (let i = 0; i < v.length; i++) { if (v[i] === '­') continue; txt += v[i]; map.push([nd, i, n]); } }
        if (!t.querySelector('.hy') && !/[-‐]$/.test(txt)) { txt += ' '; map.push(null); } else if (t.querySelector('.hy')) { /* getrenntes Wort läuft weiter */ } else { txt += ''; }
      }));
      const T = msrNorm(txt).replace(/\s+/g, ' '); let from = 0, k;
      // Länge bleibt gleich, weil msrNorm nur ß→ss ersetzt: dafür eigene Suche ohne Längenänderung
      const low = txt.toLocaleLowerCase('de'); const qq = MSR.q.trim().toLocaleLowerCase('de');
      while ((k = low.indexOf(qq, from)) >= 0 && MSR.hits.length < 300) { const seg = map.slice(k, k + qq.length).filter(Boolean); if (seg.length) MSR.hits.push({ lab, n: seg[0][2], seg, ctx: txt.slice(Math.max(0, k - 30), k + qq.length + 30).replace(/\s+/g, ' ') , k: k - Math.max(0, k - 30), len: qq.length }); from = k + Math.max(1, qq.length); }
      void T;
    });
    // markieren: Segmente je Textknoten zusammenfassen, von hinten nach vorn einwickeln
    const byNode = new Map(); MSR.hits.forEach((h, hi) => h.seg.forEach(([nd, i]) => { if (!byNode.has(nd)) byNode.set(nd, []); byNode.get(nd).push([i, hi]); }));
    byNode.forEach((L, nd) => { L.sort((a, b) => a[0] - b[0]); const runs = []; L.forEach(([i, hi]) => { const r = runs[runs.length - 1]; if (r && r.hi === hi && r.e === i) r.e = i + 1; else runs.push({ s: i, e: i + 1, hi }); });
      for (let r = runs.length - 1; r >= 0; r--) { const { s, e, hi } = runs[r]; const range = document.createRange(); try { range.setStart(nd, s); range.setEnd(nd, e); const mk = document.createElement('mark'); mk.className = 'msr-hit'; mk.dataset.h = hi; range.surroundContents(mk); } catch {} } });
  }
  if (!keepCur || MSR.cur >= MSR.hits.length) MSR.cur = MSR.hits.length ? 0 : -1;
  msrBar(); msrFocus(false);
}
function msrFocus(scroll) { document.querySelectorAll('#pages mark.msr-hit.cur').forEach(m => m.classList.remove('cur')); if (MSR.cur < 0) return; const ms = document.querySelectorAll(`#pages mark.msr-hit[data-h="${MSR.cur}"]`); ms.forEach(m => m.classList.add('cur')); if (scroll && ms[0]) ms[0].scrollIntoView({ block: 'center', behavior: 'smooth' }); const c = $('#msr .msr-n'); if (c) c.textContent = MSR.hits.length ? `${MSR.cur + 1} von ${MSR.hits.length}` : (MSR.q.trim().length >= 2 ? 'keine Treffer' : ''); $('#msr').querySelectorAll('.msr-li').forEach((li, i) => li.classList.toggle('on', i === MSR.cur)); }
function msrBar() {
  const L = $('#msr .msr-list'); if (!L) return;
  const groups = {}; MSR.hits.forEach(h => { (groups[h.lab] = groups[h.lab] || []).push(h); });
  L.innerHTML = MSR.hits.length ? MSR.hits.slice(0, 120).map((h, i) => `<button type="button" class="msr-li" data-msr="go" data-i="${i}"><b>${esc(h.lab)}${h.n ? ' · Z. ' + h.n : ''}</b><span>…${esc(h.ctx.slice(0, h.k))}<mark>${esc(h.ctx.slice(h.k, h.k + h.len))}</mark>${esc(h.ctx.slice(h.k + h.len))}…</span></button>`).join('') + (Object.keys(groups).length ? `<div class="msr-sum">${Object.entries(groups).map(([g, l]) => `${esc(g)}: Z. ${[...new Set(l.map(x => x.n).filter(Boolean))].join(', ') || '–'}`).join(' · ')}</div>` : '') : '';
  L.hidden = !MSR.hits.length;
}
function msrToggle(on) {
  MSR.open = on === undefined ? !MSR.open : on; let bar = $('#msr');
  if (!MSR.open) { if (bar) bar.remove(); msrClear(); MSR.hits = []; return; }
  if (!bar) { bar = el(`<div id="msr" role="search"><div class="msr-row"><svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M13 13l4.5 4.5"/></svg><input id="msr-q" type="search" placeholder="Wort in den Materialien suchen" aria-label="Wort in den Materialien suchen" autocomplete="off" spellcheck="false"><span class="msr-n" aria-live="polite"></span><button type="button" class="ib" data-msr="prev" title="Vorheriger Treffer (Umschalt+Enter)" aria-label="Vorheriger Treffer">‹</button><button type="button" class="ib" data-msr="next" title="Nächster Treffer (Enter)" aria-label="Nächster Treffer">›</button><button type="button" class="ib" data-msr="x" title="Suche schließen (Esc)" aria-label="Suche schließen">×</button></div><div class="msr-list" hidden></div></div>`);
    $('#preview-scroll').prepend(bar);
    const inp = bar.querySelector('input'); let t = 0;
    inp.addEventListener('input', () => { MSR.q = inp.value; clearTimeout(t); t = setTimeout(() => { msrRun(); msrFocus(true); }, 160); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); msrStep(e.shiftKey ? -1 : 1); } else if (e.key === 'Escape') { e.preventDefault(); msrToggle(false); } });
    bar.addEventListener('click', e => { const b = e.target.closest('[data-msr]'); if (!b) return; const a = b.dataset.msr; if (a === 'x') msrToggle(false); else if (a === 'next') msrStep(1); else if (a === 'prev') msrStep(-1); else if (a === 'go') { MSR.cur = +b.dataset.i; msrFocus(true); } });
    inp.value = MSR.q; }
  bar.querySelector('input').focus(); bar.querySelector('input').select(); if (MSR.q) msrRun();
}
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'F' || e.key === 'f') && state.out === 'blatt' && !state.dlg && !document.querySelector('.pr')) { e.preventDefault(); msrToggle(true); } });
function msrStep(d) { if (!MSR.hits.length) return; MSR.cur = (MSR.cur + d + MSR.hits.length) % MSR.hits.length; msrFocus(true); }
// Vorschläge zum Glossieren in der Vorschau markieren (nur am Bildschirm, nicht im Druck)
const GLS = { on: (() => { try { return localStorage.getItem('abw.glsug') === '1'; } catch { return false; } })() };
function glSugSet(on) { GLS.on = !!on; try { localStorage.setItem('abw.glsug', on ? '1' : '0'); } catch {} glSugMark(); if (on) toast('Orange unterstrichen: Vorschläge für Worterklärungen. Anklicken legt eine an.'); }
function glSugMark() {
  document.querySelectorAll('#pages .w.glsug').forEach(w => { w.classList.remove('glsug'); w.removeAttribute('title'); });
  if (!GLS.on || state.out !== 'blatt' || state.gapEdit) return;
  const nk = t => String(t || '').replace(/\u00AD/g, '').replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '').replace(/[’']s?$/, '').toLowerCase();
  state.sheet.blocks.filter(b => b.type === 'material' && b.form !== 'gedicht').forEach(b => {
    const r = readStats(b); if (!r || !r.sugg.length) return; const S = new Set(r.sugg.map(o => o.w.toLowerCase()));
    document.querySelectorAll(`#pages [data-bid="${b.id}"] .mat-body .w`).forEach(w => { if (!w.classList.contains('glw') && S.has(nk(w.dataset.t))) { w.classList.add('glsug'); w.title = 'Vorschlag: Worterklärung anlegen (klicken)'; } });
  });
}
function renderPreview() { const r = renderPreview0(); if (GLS.on) requestAnimationFrame(glSugMark); if (MSR.open && state.out === 'blatt') requestAnimationFrame(() => msrRun(true)); else if (MSR.open) msrToggle(false); return r; }
function renderPreview0() {
  if (MAPPE_LOCK || DG_VIEW) return;
  if (hmS.open && hmS.hold) { hmS.pend = true; return; }
  { const h = $('#pages'); if (h) h.lang = fachLang(); }
  if (state.out === 'vp' || state.out === 'pres') {
    const host = $('#pages'); host.style.removeProperty('zoom'); let n = 0;
    try { if (state.out === 'vp') renderVPPreview(host); else n = renderPresPreview(host); } catch (err) { console.error(err); host.innerHTML = '<div class="pv-empty">Die Vorschau ließ sich nicht anzeigen.</div>'; }
    $('#pagecount').textContent = state.out === 'vp' ? 'Verlaufsplan' : `${n} ${n === 1 ? 'Folie' : 'Folien'} · 16:9`;
    $('#pv-hint').hidden = true; renderOut(); return;
  }
  let out;
  try { out = state.out === 'tipps' ? layoutTipps() : state.out === 'karten' ? layoutKarten() : state.out === 'tafel' ? layoutTafel() : state.out === 'a3' || state.out === 'a4' ? layoutA3() : state.out === 'exit' ? layoutExit() : layout(); if (state.out === 'blatt' && zlSync()) out = layout(); } catch (err) { console.error(err); return; }
  // Neuaufbau ohne Springen: Höhe halten, solange die Seiten neu eingesetzt werden, danach die Scrollposition wiederherstellen
  const host = $('#pages'); const scP = $('#preview-scroll'); const top0 = scP ? scP.scrollTop : 0; host.style.minHeight = host.offsetHeight + 'px'; host.innerHTML = '';
  if (!out.length) host.appendChild(el(`<div class="pv-empty">${state.out === 'exit' ? 'Noch kein Exit-Ticket. Leg links unter „Exit-Tickets“ eines an und trag die Fragen ein.' : state.out === 'a3' ? 'Noch keine A3-Vorlage. Wähl links unter „A3-Vorlagen“ eine Vorlage, etwa Placemat oder Lernplakat.' : state.out === 'a4' ? 'Noch keine A4-Vorlage. Wähl links unter „A4-Vorlagen“ eine Vorlage, etwa Karten zum Ausschneiden.' : state.out === 'tafel' ? 'Noch kein Tafelbild. Füg links unten bei den Bausteinen „Tafelbild“ hinzu.' : state.out === 'tipps' ? 'Noch keine Tippkarten. Öffne unter einer Aufgabe „Tipps“ und trag bis zu drei gestufte Hilfen ein.' : 'Noch keine Tafelkarten. Leg links mit „+ Begriff“ die erste Karte an.'}</div>`));
  out.forEach(({ pg, over }) => {
    pg.classList.add('pout');
    const slot = document.createElement('div'); slot.className = 'slot'; slot.appendChild(pg);
    if (over) slot.appendChild(el('<div class="pg-warn">Ein Baustein ist länger als eine Seite</div>'));
    host.appendChild(slot);
  });
  const a5 = state.out === 'blatt' && state.sheet.meta.paper === 'a5x2';
  const buch = state.out === 'blatt' && state.sheet.meta.paper === 'buch';
  const kH = state.out === 'karten' && state.kkHalf;
  const [one, many, unit] = state.out === 'exit' ? ['Seite', 'Seiten', 'Exit-Tickets'] : state.out === 'a3' ? ['Seite', 'Seiten', state.a3p === 'a4x2' ? 'A4 zum Zusammenkleben' : 'A3'] : state.out === 'a4' ? ['Seite', 'Seiten', 'A4'] : state.out === 'blatt' && state.sheet.meta.paper === 'a4q' ? ['Seite', 'Seiten', 'A4 quer'] : state.out === 'tafel' ? ['Tafelbild', 'Tafelbilder', 'A4 quer'] : state.out === 'karten' ? ['Karte', 'Karten', kH ? 'A4' : 'A4 quer'] : a5 ? ['Bogen', 'Bögen', '2 × A5 auf A4 quer'] : ['Seite', 'Seiten', 'A4'];
  const cnt = state.out === 'karten' ? (state.kkCount || 0) : out.length;
  const nB = state.bookPages || 0;
  $('#pagecount').textContent = buch ? `${nB} ${nB === 1 ? 'Seite' : 'Seiten'} auf ${out.length} ${out.length === 1 ? 'Blatt' : 'Blättern'} · A5 als Buch auf A4 quer`
    : `${cnt} ${cnt === 1 ? one : many}${kH ? ` auf ${out.length} ${out.length === 1 ? 'Blatt' : 'Blättern'}` : ''} · ${unit}`;
  if (state.out === 'karten') { const ov = document.querySelector('#editor [data-kkover]'); if (ov) ov.innerHTML = state.kkOver ? `<small class="gl-warn">${state.kkOver} ${state.kkOver === 1 ? 'Karte ist' : 'Karten sind'} für die feste Größe zu voll und ${state.kkOver === 1 ? 'wird' : 'werden'} kleiner gesetzt.</small>` : ''; }
  $('#pv-hint').hidden = true;
  renderOut(); applyScale(); host.style.minHeight = ''; if (scP && Math.abs(scP.scrollTop - top0) > 1) scP.scrollTop = top0; markSel(); markZl(); lbArrows(host); chatLines(host);
}
function applyScale() {
  const pane = $('#preview-scroll'); const cs = getComputedStyle(pane);
  const w = pane.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 2;
  const slots = [...document.querySelectorAll('#pages .slot')];
  const dims = sl => [(+sl.firstChild.dataset.w || 210) * MMPX, (+sl.firstChild.dataset.h || 297) * MMPX];
  const maxW = Math.max(210 * MMPX, ...slots.map(sl => dims(sl)[0]));
  let sc = state.zoom === 'fit' ? Math.min(state.wide ? 1.6 : 1.1, w / maxW) : 1;
  if (!(sc > 0.2)) sc = 0.2;
  slots.forEach(sl => { const [pw, ph] = dims(sl); sl.style.width = pw * sc + 'px'; sl.style.height = ph * sc + 'px'; sl.firstChild.style.transform = `scale(${sc})`; });
  $('#btn-zoom').textContent = state.zoom === 'fit' ? '100 %' : 'Einpassen';
}
// Design-Popup: Aussehen der Seite (Knopf über der Vorschau) oder eines Bausteins (Klick in der Vorschau)
const DZ_TYPES = new Set(['material', 'info', 'text']);
function dzBodyHTML(z) {
  if (z.k === 'page') { const sc = seiteCard(); return sc.replace(/<div class="card-h"[\s\S]*?<\/div>\s*<div class="card-b">/, '<div class="card-b">').replace(' closed', '').replace('<div class="card', '<div data-bid="seite" class="card dz-card'); }
  const b = state.sheet.blocks.find(x => x.id === z.bid); if (!b) return '';
  let h = '';
  if (b.type === 'material') {
    const f = matFmt(b); const seg = key => { const d = MAT_FMT[key]; return `<div class="f"><span>${d.label}</span><div class="seg sm" role="group" aria-label="${d.label}">${d.opts.map(([v, t]) => `<button type="button" data-act="fmt" data-f="${key}" data-v="${v}" aria-pressed="${f[key] === v}">${t}</button>`).join('')}</div></div>`; };
    const isDef = JSON.stringify(f) === JSON.stringify(matFmt({})) && b.lineNumbers !== false; const nMat = state.sheet.blocks.filter(x => x.type === 'material').length;
    h = `${b.form === 'gedicht' ? '' : seg('align')}<div class="f"><span>Schrift</span>${fmtSel(b, 'font')}</div><div class="f"><span>Schriftgröße</span>${fmtSel(b, 'size')}</div>${seg('lh')}
      <div class="chks">${fCheck('lineNumbers', b.form === 'gedicht' ? 'Verszählung' : 'Zeilennummern', b.lineNumbers !== false)}${b.form === 'gedicht' ? '' : fCheck('fmt.indent', 'Einzug bei neuem Absatz', f.indent)}${f.cols === 2 ? '' : fCheck('fmt.margin', 'Rand für Notizen', f.margin)}</div>
      ${seg('silben')}${f.silben ? `<label class="f"><span>Eigene Trennungen (optional)</span><input type="text" data-k="fmt.silx" value="${esc(f.silx)}" placeholder="z. B. Haus-auf-ga-be, The-a-ter"><small class="hint">Die App trennt nach Regeln; zusammengesetzte Wörter hier richtigstellen.</small></label>` : ''}
      ${f.margin ? `<div class="mrand-ed">${seg('mrw')}<label class="f"><span>Überschrift im Rand</span><input type="text" data-k="fmt.mrh" value="${esc(f.mrh)}" placeholder="z. B. Notizen, Stilmittel, Fragen an den Text"></label></div>` : ''}
      <div class="row" style="gap:6px 18px">${isDef ? '' : '<button class="link" type="button" data-act="fmt-reset">Standard</button>'}${nMat > 1 ? '<button class="link" type="button" data-act="fmt-all">Für alle Materialien übernehmen</button>' : ''}</div>`;
  } else if (b.type === 'info') h = stilTiles(b, ST_INFO); else if (b.type === 'text') h = stilTiles(b, ST_TEXT);
  return `<div class="card dz-card" data-bid="${b.id}"><div class="card-b">${h}</div></div>`;
}
function dzRender() {
  const z = state.dz; let box = document.getElementById('dz');
  if (!z) { if (box) box.remove(); return; }
  if (!box) { box = document.createElement('div'); box.id = 'dz'; box.className = 'dzp'; box.setAttribute('role', 'dialog'); document.body.appendChild(box);
    box.addEventListener('input', onInput); box.addEventListener('change', onChange); box.addEventListener('click', e => { if (e.target.closest('[data-dz-x]')) { dzClose(); return; } onClick(e); }); }
  const b = z.k === 'block' && state.sheet.blocks.find(x => x.id === z.bid);
  box.setAttribute('aria-label', z.k === 'page' ? 'Aussehen der Seite' : 'Gestaltung');
  box.innerHTML = `<div class="dzp-h"><b>${z.k === 'page' ? 'Aussehen der Seite' : 'Gestaltung · ' + esc(b ? typeLabel(b) : '')}</b><button type="button" class="ib" data-dz-x title="Schließen (Esc)" aria-label="Schließen">${I.x}</button></div><div class="dzp-b">${dzBodyHTML(z)}</div>`;
  const W = Math.min(z.k === 'page' ? 470 : 360, innerWidth - 24); box.style.width = W + 'px';
  let x = z.x, y = z.y; const r = box.getBoundingClientRect(); if (x + W > innerWidth - 12) x = innerWidth - 12 - W; if (x < 12) x = 12; if (y + r.height > innerHeight - 12) y = Math.max(12, innerHeight - 12 - r.height);
  box.style.left = x + 'px'; box.style.top = y + 'px';
}
function dzOpen(k, bid, rect) {
  const R = rect || { left: innerWidth - 400, top: 120, right: innerWidth - 400, bottom: 120 };
  state.dz = { k, bid, x: Math.round(R.right + 12 > innerWidth - 372 ? R.left : R.right + 12), y: Math.round(Math.max(70, R.top)) }; dzRender();
}
function dzClose() { state.dz = null; dzRender(); }
function markSel() {
  document.querySelectorAll('#pages .is-sel').forEach(n => n.classList.remove('is-sel'));
  if (state.sel) document.querySelectorAll(`#pages [data-bid="${state.sel}"]`).forEach(n => n.classList.add('is-sel'));
}

