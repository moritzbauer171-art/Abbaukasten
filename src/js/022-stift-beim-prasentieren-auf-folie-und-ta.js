/* ================= Stift beim Präsentieren: auf Folie und Tafel schreiben, Textmarker, Formen, Laserpointer, leere Tafelseiten ================= */
const INK_COLS = ['#1C1F27', '#E5484D', '#2F6FDB', '#1E9E5A', '#FFC21A', '#FFFFFF'];
const INK_W = { s: 3, m: 6, l: 12 };
const INK_TOOLS = {
  pen: { l: 'Stift', g: '<path d="M4 20l1.2-4.6L15.6 5a2.1 2.1 0 0 1 3 3L8.2 18.4z"/><path d="M13.8 6.8l3 3"/>' },
  hl: { l: 'Textmarker', g: '<path d="M8.5 14.5l7.6-9.6 4 4-9.6 7.6z"/><path d="M8.5 14.5L6 17.4h3.6l.9-1.3"/><path d="M3 21h18" style="stroke-width:3.4;opacity:.45"/>' },
  line: { l: 'Linie', g: '<path d="M5 19L19 5"/>' },
  arrow: { l: 'Pfeil', g: '<path d="M5 19L19 5"/><path d="M10 5h9v9"/>' },
  rect: { l: 'Rechteck', g: '<rect x="4" y="6" width="16" height="12" rx="1"/>' },
  circ: { l: 'Kreis', g: '<ellipse cx="12" cy="12" rx="8.5" ry="7"/>' },
  er: { l: 'Radierer', g: '<path d="M8.5 19.5h11"/><path d="M4.6 14.8l8.9-8.9a2 2 0 0 1 2.8 0l2.8 2.8a2 2 0 0 1 0 2.8l-7.3 7.3a2 2 0 0 1-1.4.6H9.3a2 2 0 0 1-1.4-.6l-3.3-3.3a1.9 1.9 0 0 1 0-.7z"/><path d="M9.2 10.2l5.6 5.6"/>' }
};
const TAFEL_IC = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="3.5" width="19" height="13" rx="1.5"/><path d="M8 21l2-4.5M16 21l-2-4.5"/><path d="M6.5 12.5c1.6-2.6 3-3.6 4.2-2.4 1 1 2 .9 3.3-.6"/></svg>';
// Hintergrund einer Tafelseite mitscrollen (die Seite kann nach unten erweitert werden)
const inkBgPos = s => (s.pat === 'noten' || s.pat === 'gsl' ? `0 ${-(s.sy || 0)}px` : inkPatBase(s.pat) === 'kariert' ? `-1px ${-1 - (s.sy || 0)}px` : s.pat === 'liniert' ? `0 ${20 - (s.sy || 0)}px` : '');
// Entweder-oder-Fragen: die beiden Möglichkeiten als Spaltentitel („… ein Diktatfrieden oder ein Verhandlungsfrieden?“)
function pkAuto(q) {
  const t = String(q || '').replace(/\s+/g, ' ').trim().replace(/[?!.…]+$/, '').trim(); let a, b;
  const m = t.match(/\bentweder\s+(.+?)\s+oder\s+(.+)$/i);
  if (m) { a = m[1]; b = m[2]; }
  else {
    const i = t.toLowerCase().lastIndexOf(' oder '); if (i < 0) return null;
    let r = t.slice(i + 6).trim().replace(/^(doch|eher|vielmehr|nicht vielmehr|nicht eher|aber|etwa)\s+/i, ''); r = r.split(/[,;:–—]| - /)[0].trim();
    const rw = r.split(' '); if (!r || rw.length > 5) return null;
    a = t.slice(0, i).split(/[,;:–—]| - /).pop().trim().split(' ').slice(-rw.length).join(' '); b = r;
  }
  const clean = x => { x = String(x).replace(/^(ein|eine|einer|eines|einen|der|die|das|den|dem|des|eher|nur|bloß|doch|mehr)\s+/i, '').trim(); return x ? x[0].toUpperCase() + x.slice(1) : x; };
  a = clean(a); b = clean(b); if (!a || !b || a.length > 40 || b.length > 40 || a.toLowerCase() === b.toLowerCase()) return null; return [a, b];
}
const INK_PATS = { kariert: 'Kariert', liniert: 'Liniert', weiss: 'Weiß' };
// Leere Vorlagen für die beschreibbare Tafel (hinter „Mehr“): b = Grundmuster, svg = Linien auf der ersten Tafelseite
const INK_TPLS = {
  cluster: { l: 'Cluster', b: 'weiss' }, mindmap: { l: 'Mindmap', b: 'weiss' }, sp2: { l: 'Zwei Spalten', b: 'weiss' }, sp3: { l: 'Drei Spalten', b: 'weiss' },
  zeit: { l: 'Zeitstrahl', b: 'weiss' }, skala: { l: 'Skala zwischen zwei Polen', b: 'weiss' }, koord: { l: 'Koordinatenkreuz', b: 'kariert' },
  noten: { l: 'Notenlinien', b: 'noten' }, gsl: { l: 'Grundschul-Lineatur', b: 'gsl' }
};
const inkPatOk = p => !!(INK_PATS[p] || INK_TPLS[p]);
const inkPatBase = p => (INK_TPLS[p] ? INK_TPLS[p].b : INK_PATS[p] ? p : 'weiss');
function inkTplSvg(p) {
  const C = '#93A3C0', st = `fill="none" stroke="${C}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`, arr = (x, y, a) => { const L = 22, r = a * Math.PI / 180; return `<path d="M${x - L * Math.cos(r - .45)} ${y - L * Math.sin(r - .45)}L${x} ${y}L${x - L * Math.cos(r + .45)} ${y - L * Math.sin(r + .45)}" ${st}/>`; };
  let g = '';
  if (p === 'cluster') { g = `<ellipse cx="800" cy="450" rx="175" ry="82" ${st}/>`; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8, x1 = 800 + Math.cos(a) * 200, y1 = 450 + Math.sin(a) * 100, x2 = 800 + Math.cos(a) * 520, y2 = 450 + Math.sin(a) * 300; g += `<path d="M${x1.toFixed(0)} ${y1.toFixed(0)}L${x2.toFixed(0)} ${y2.toFixed(0)}" ${st} stroke-dasharray="2 12"/><circle cx="${(800 + Math.cos(a) * 590).toFixed(0)}" cy="${(450 + Math.sin(a) * 345).toFixed(0)}" r="62" ${st}/>`; } }
  else if (p === 'mindmap') { g = `<rect x="640" y="395" width="320" height="110" rx="55" ${st}/>`; [[640, 430, 360, 230, 90], [640, 470, 360, 670, 90], [960, 430, 1240, 230, 1510], [960, 470, 1240, 670, 1510]].forEach(([x0, y0, x1, y1, x2]) => { g += `<path d="M${x0} ${y0}C${(x0 + x1) / 2} ${y0} ${(x0 + x1) / 2} ${y1} ${x1} ${y1}L${x2} ${y1}" ${st}/><path d="M${x1 + (x2 - x1) * .3} ${y1}l${(x2 - x1) * .12} ${y1 < 450 ? -70 : 70}l${(x2 - x1) * .3} 0" ${st} opacity=".6"/>`; }); }
  else if (p === 'sp2' || p === 'sp3') { const n = p === 'sp2' ? 2 : 3; g = `<path d="M70 120H1530" ${st}/>`; for (let i = 1; i < n; i++) { const x = 70 + 1460 * i / n; g += `<path d="M${x} 40V860" ${st}/>`; } }
  else if (p === 'zeit') { g = `<path d="M80 450H1520" ${st}/>${arr(1520, 450, 0)}`; for (let x = 160; x <= 1440; x += 160) g += `<path d="M${x} 432V468" ${st}/>`; }
  else if (p === 'skala') { g = `<path d="M170 470H1430" ${st}/>${arr(1430, 470, 0)}${arr(170, 470, 180)}`; [300, 550, 800, 1050, 1300].forEach((x, i) => { g += i === 2 ? `<path d="M${x} 440V500" ${st}/>` : `<circle cx="${x}" cy="470" r="9" fill="${C}"/>`; }); g += `<rect x="40" y="380" width="110" height="180" rx="14" ${st} stroke-dasharray="4 10"/><rect x="1450" y="380" width="110" height="180" rx="14" ${st} stroke-dasharray="4 10"/>`; }
  else if (p === 'koord') { const S = 'fill="none" stroke="#5E6C88" stroke-width="3.5" stroke-linecap="round"'; g = `<path d="M100 480H1500M800 860V60" ${S}/>${arr(1500, 480, 0).replace(st, S)}${arr(800, 60, -90).replace(st, S)}`; for (let x = 120; x <= 1480; x += 40) if (x !== 800) g += `<path d="M${x} 472V488" stroke="#5E6C88" stroke-width="2"/>`; for (let y = 80; y <= 840; y += 40) if (y !== 480) g += `<path d="M792 ${y}H808" stroke="#5E6C88" stroke-width="2"/>`; g += `<text x="1490" y="520" font-size="30" fill="#5E6C88" font-family="sans-serif">x</text><text x="820" y="80" font-size="30" fill="#5E6C88" font-family="sans-serif">y</text>`; }
  return g ? `<svg class="pr-tpl" viewBox="0 0 1600 900" width="1600" height="900" aria-hidden="true">${g}</svg>` : '';
}
const inkKey = s => (!s ? '' : s.k === 'blank' ? s.id : `${s.k}:${s.b ? s.b.id : s.bid || ''}:${s.part || s.qi || 0}`);
const inkSvg = g => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${g}</svg>`;
function inkDraw(g, s) {
  const pts = s.p; if (!pts || pts.length < 2) return;
  g.save(); g.lineCap = g.lineJoin = 'round'; g.strokeStyle = g.fillStyle = s.c;
  if (s.t === 'hl') { g.globalAlpha = 0.38; g.lineWidth = s.w * 4 + 8; }
  else g.lineWidth = s.w;
  const st = s.pr ? 3 : 2;
  if (s.t === 'pen' || s.t === 'hl') {
    if (pts.length <= st) { g.beginPath(); g.arc(pts[0], pts[1], g.lineWidth / 2, 0, 7); g.fill(); g.restore(); return; }
    if (s.pr && s.t === 'pen') { for (let i = st; i < pts.length; i += st) { g.beginPath(); g.lineWidth = s.w * (0.35 + (pts[i + 2] || 50) / 80); g.moveTo(pts[i - st], pts[i - st + 1]); g.lineTo(pts[i], pts[i + 1]); g.stroke(); } }
    else { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = st; i < pts.length; i += st) g.lineTo(pts[i], pts[i + 1]); g.stroke(); }
  } else {
    const [x0, y0, x1, y1] = pts; g.beginPath();
    if (s.t === 'line' || s.t === 'arrow') { g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      if (s.t === 'arrow') { const a = Math.atan2(y1 - y0, x1 - x0), L = 14 + s.w * 3; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - L * Math.cos(a - 0.45), y1 - L * Math.sin(a - 0.45)); g.moveTo(x1, y1); g.lineTo(x1 - L * Math.cos(a + 0.45), y1 - L * Math.sin(a + 0.45)); g.stroke(); } }
    else if (s.t === 'rect') { g.strokeRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0)); }
    else if (s.t === 'circ') { g.ellipse((x0 + x1) / 2, (y0 + y1) / 2, Math.abs(x1 - x0) / 2 || 1, Math.abs(y1 - y0) / 2 || 1, 0, 0, 7); g.stroke(); }
  }
  g.restore();
}
// Abstand Punkt–Strich (für den Radierer, Strich-weise)
function inkHit(s, x, y, r) {
  const p = s.p, st = s.pr ? 3 : 2; const seg = (ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1; const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2)); return Math.hypot(x - ax - t * dx, y - ay - t * dy); };
  const rr = r + (s.t === 'hl' ? s.w * 2 + 4 : s.w / 2);
  if (s.t === 'pen' || s.t === 'hl') { if (p.length <= st) return Math.hypot(x - p[0], y - p[1]) < rr; for (let i = st; i < p.length; i += st) if (seg(p[i - st], p[i - st + 1], p[i], p[i + 1]) < rr) return true; return false; }
  const [x0, y0, x1, y1] = p;
  if (s.t === 'line' || s.t === 'arrow') return seg(x0, y0, x1, y1) < rr;
  if (s.t === 'rect') return [[x0, y0, x1, y0], [x1, y0, x1, y1], [x1, y1, x0, y1], [x0, y1, x0, y0]].some(q => seg(...q) < rr);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = Math.abs(x1 - x0) / 2 || 1, ry = Math.abs(y1 - y0) / 2 || 1; const d = Math.hypot((x - cx) / rx, (y - cy) / ry); return Math.abs(d - 1) * Math.min(rx, ry) < rr;
}
function inkLayer(X) {
  const RS = 1.5; // Auflösung der Zeichenfläche
  const store = X.store; const hist = {};
  const st = { on: false, laser: false, tool: 'pen', col: { pen: INK_COLS[0], hl: INK_COLS[4], line: INK_COLS[1], arrow: INK_COLS[1], rect: INK_COLS[1], circ: INK_COLS[1] }, w: 'm', key: '', cur: null, lz: [], raf: 0, clrAll: 0 };
  const cv = el(`<canvas class="pr-ink" width="${1600 * RS}" height="${900 * RS}" aria-hidden="true"></canvas>`); X.stage.appendChild(cv);
  const g = cv.getContext('2d');
  const colOf = t => st.col[t] || INK_COLS[0];
  const bar = el(`<div class="pr-pen" role="toolbar" aria-label="Stift und Formen" hidden>
    <div class="pp-g">${Object.entries(INK_TOOLS).map(([k, x]) => `<button type="button" data-ink="tool" data-v="${k}" title="${x.l}" aria-label="${x.l}">${inkSvg(x.g)}</button>`).join('')}</div>
    <div class="pp-g pp-cols">${INK_COLS.map(c => `<button type="button" data-ink="col" data-v="${c}" style="--pc:${c}" title="Farbe" aria-label="Farbe ${c}"><i></i></button>`).join('')}</div>
    <div class="pp-g pp-w">${Object.entries(INK_W).map(([k, w]) => `<button type="button" data-ink="w" data-v="${k}" title="Stärke ${k === 's' ? 'dünn' : k === 'm' ? 'mittel' : 'dick'}" aria-label="Stärke"><i style="width:${w + 3}px;height:${w + 3}px"></i></button>`).join('')}</div>
    <div class="pp-g"><button type="button" data-ink="undo" title="Rückgängig (Strg+Z)" aria-label="Rückgängig">${inkSvg('<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>')}</button><button type="button" data-ink="clr" title="Diese Folie leeren" aria-label="Diese Folie leeren">${inkSvg('<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/>')}</button><button type="button" data-ink="clrall" class="pp-txt" title="Notizen auf allen Folien löschen">alle</button></div>
    <div class="pp-g pp-pg"><small>Hintergrund</small>${Object.entries(INK_PATS).map(([k, l]) => `<button type="button" data-ink="pat" data-v="${k}" class="pp-pat pat-${k}" title="${l}" aria-label="Hintergrund ${l}"></button>`).join('')}<button type="button" data-ink="tplm" class="pp-txt pp-more" aria-expanded="false" title="Vorlagen: Cluster, Mindmap, Spalten, Zeitstrahl, Skala, Koordinatenkreuz, Notenlinien, Lineatur">Mehr</button>${X.addPage ? '<button type="button" data-ink="page" class="pp-txt" title="Neue leere Seite nach dieser">+ Seite</button>' : ''}</div>
    ${X.close ? `<div class="pp-g"><button type="button" data-ink="off" class="pp-txt pp-back" title="Tafel schließen, zurück zur Folie (Esc oder B)">${inkSvg('<path d="M15 18l-6-6 6-6"/>')}Folie</button></div>` : ''}</div>`);
  X.ov.appendChild(bar);
  // Vorlagen als Aufklappliste neben der Stiftleiste
  const tplPop = el(`<div class="pp-tpls" hidden role="menu" aria-label="Vorlagen">${Object.entries(INK_TPLS).map(([k, t]) => `<button type="button" data-ink="pat" data-v="${k}" class="pp-tplb" role="menuitem">${t.l}</button>`).join('')}</div>`); X.ov.appendChild(tplPop);
  const tplShow = on => { tplPop.hidden = !on; const mb = bar.querySelector('[data-ink="tplm"]'); if (mb) mb.setAttribute('aria-expanded', String(on)); if (!on || !mb) return; const r = mb.getBoundingClientRect(), o = X.ov.getBoundingClientRect(); tplPop.style.left = (r.right - o.left + 10) + 'px'; tplPop.style.top = Math.max(8, Math.min(o.height - tplPop.offsetHeight - 8, r.top - o.top - 40)) + 'px'; };
  tplPop.addEventListener('click', e => { const b = e.target.closest('[data-ink="pat"]'); if (!b) return; e.stopPropagation(); X.setPat(b.dataset.v); tplShow(false); });
  const M = () => (X.tafel() ? { s: 0.74, x: 24, y: 24 } : { s: 1, x: 0, y: 0 });
  const list = () => (store[st.key] = store[st.key] || []);
  const H = () => (hist[st.key] = hist[st.key] || []);
  const renderTo = (gg, w) => {
    gg.setTransform(1, 0, 0, 1, 0, 0); gg.clearRect(0, 0, w.width, w.height); const m = M(); const f = w.width / 1600;
    gg.setTransform(f * m.s, 0, 0, f * m.s, f * m.x, f * m.y); gg.translate(0, -(X.off ? X.off() : 0));
    (store[st.key] || []).forEach(s => inkDraw(gg, s)); if (st.cur) inkDraw(gg, st.cur); if (st.rl) Object.values(st.rl).forEach(r => { if (r.key === st.key && r.s) inkDraw(gg, r.s); });
    if (st.lz.length) { const now = performance.now(); const L = st.lz.filter(p => now - p.t < 650);
      gg.save(); gg.lineCap = gg.lineJoin = 'round'; for (let i = 1; i < L.length; i++) { const a = 1 - (now - L[i].t) / 650; gg.strokeStyle = `rgba(255,40,40,${(a * 0.85).toFixed(3)})`; gg.lineWidth = 4 + 8 * a; gg.beginPath(); gg.moveTo(L[i - 1].x, L[i - 1].y); gg.lineTo(L[i].x, L[i].y); gg.stroke(); }
      const p = L[L.length - 1]; if (p) { gg.shadowColor = 'rgba(255,0,0,.9)'; gg.shadowBlur = 18; gg.fillStyle = '#FF2A2A'; gg.beginPath(); gg.arc(p.x, p.y, 9, 0, 7); gg.fill(); } gg.restore(); }
  };
  const awCv = () => { if (!X.awOk()) return null; const d = X.aw().document, stg = d.querySelector('.pr-stage'); if (!stg) return null; let c = stg.querySelector(':scope > .pr-ink');
    if (!c) { c = d.createElement('canvas'); c.className = 'pr-ink'; c.width = 1600 * RS; c.height = 900 * RS; stg.appendChild(c); placeAw(d, Math.min(stg.clientWidth / 1600, stg.clientHeight / 900)); } return c; };
  const draw = () => { renderTo(g, cv); const c = awCv(); if (c) renderTo(c.getContext('2d'), c); };
  const placeAw = (d, k) => { const c = d.querySelector('.pr-stage > .pr-ink'); if (c) c.style.transform = `translate(-50%,-50%) scale(${k})`; };
  const laserLoop = () => { st.raf = 0; draw(); if (st.lz.length && performance.now() - st.lz[st.lz.length - 1].t < 700) st.raf = requestAnimationFrame(laserLoop); else st.lz = []; };
  const sync = () => {
    X.ov.classList.toggle('pr-inking', st.on || st.laser); cv.classList.toggle('on', st.on || st.laser); cv.classList.toggle('laser', st.laser); bar.hidden = !st.on;
    const b1 = X.ov.querySelector('[data-p="ink"]'), b2 = X.ov.querySelector('[data-p="laser"]'); if (b1) b1.setAttribute('aria-pressed', String(st.on)); if (b2) b2.setAttribute('aria-pressed', String(st.laser));
    bar.querySelectorAll('[data-ink="tool"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === st.tool)));
    bar.querySelectorAll('[data-ink="col"]').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.v === colOf(st.tool))); b.disabled = st.tool === 'er'; });
    bar.querySelectorAll('[data-ink="w"]').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.v === st.w)); b.disabled = st.tool === 'er'; });
    [...bar.querySelectorAll('[data-ink="pat"]'), ...tplPop.querySelectorAll('[data-ink="pat"]')].forEach(b => b.setAttribute('aria-pressed', String(!!X.curPat && b.dataset.v === X.curPat()))); if (!st.on) tplShow(false);
    { const mb = bar.querySelector('[data-ink="tplm"]'); if (mb) mb.classList.toggle('on', !!X.curPat && !!INK_TPLS[X.curPat()]); }
    bar.querySelector('[data-ink="undo"]').disabled = !H().length; bar.querySelector('[data-ink="clr"]').disabled = !list().length;
    const ca = bar.querySelector('[data-ink="clrall"]'); ca.textContent = st.clrAll > Date.now() ? 'wirklich alle?' : 'alle'; ca.disabled = !Object.values(store).some(l => l && l.length);
  };
  const changed = () => { draw(); sync(); X.saved(); };
  const toSlide = e => { const r = cv.getBoundingClientRect(); const bx = (e.clientX - r.left) / r.width * 1600, by = (e.clientY - r.top) / r.height * 900; const m = M(); return [(bx - m.x) / m.s, (by - m.y) / m.s + (X.off ? X.off() : 0)]; };
  const r1 = v => Math.round(v * 10) / 10;
  let erased = null;
  cv.addEventListener('pointerdown', e => {
    if (!(st.on || st.laser)) return; e.preventDefault(); e.stopPropagation(); try { cv.setPointerCapture(e.pointerId); } catch {}
    const [x, y] = toSlide(e);
    if (st.laser) { st.lz.push({ x, y, t: performance.now() }); st.down = true; if (!st.raf) st.raf = requestAnimationFrame(laserLoop); return; }
    if (st.tool === 'er') { erased = []; eraseAt(x, y); return; }
    const pr = e.pointerType === 'pen' && e.pressure > 0; const t = st.tool;
    st.cur = { t, c: colOf(t), w: INK_W[st.w], p: t === 'pen' || t === 'hl' ? (pr && t === 'pen' ? [r1(x), r1(y), Math.round(e.pressure * 100)] : [r1(x), r1(y)]) : [r1(x), r1(y), r1(x), r1(y)], ...(pr && t === 'pen' ? { pr: 1 } : {}) };
    draw();
  });
  const eraseAt = (x, y) => { const L = list(); const m = M(); for (let i = L.length - 1; i >= 0; i--) if (inkHit(L[i], x, y, 12 / m.s)) { erased.push({ s: L[i], i }); L.splice(i, 1); } draw(); };
  cv.addEventListener('pointermove', e => {
    if (st.laser) { if (e.pointerType === 'mouse' || st.down) { const [x, y] = toSlide(e); st.lz.push({ x, y, t: performance.now() }); if (st.lz.length > 80) st.lz.splice(0, st.lz.length - 80); if (!st.raf) st.raf = requestAnimationFrame(laserLoop); } return; }
    if (erased) { const [x, y] = toSlide(e); eraseAt(x, y); return; }
    if (!st.cur) return; const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; const s = st.cur;
    (evs.length ? evs : [e]).forEach(ev => { const [x, y] = toSlide(ev);
      if (s.t === 'pen' || s.t === 'hl') { const st2 = s.pr ? 3 : 2; const lx = s.p[s.p.length - st2], ly = s.p[s.p.length - st2 + 1]; if (Math.hypot(x - lx, y - ly) < 1.5) return; s.p.push(r1(x), r1(y)); if (s.pr) s.p.push(Math.round((ev.pressure || 0.5) * 100)); }
      else { let x1 = x, y1 = y; if (ev.shiftKey && (s.t === 'rect' || s.t === 'circ')) { const d = Math.max(Math.abs(x - s.p[0]), Math.abs(y - s.p[1])); x1 = s.p[0] + Math.sign(x - s.p[0]) * d; y1 = s.p[1] + Math.sign(y - s.p[1]) * d; } s.p[2] = r1(x1); s.p[3] = r1(y1); } });
    draw();
  });
  const up = () => {
    st.down = false;
    if (erased) { if (erased.length) H().push({ t: 'del', L: erased }); erased = null; changed(); return; }
    const s = st.cur; if (!s) return; st.cur = null;
    if (!(s.t !== 'pen' && s.t !== 'hl' && Math.hypot(s.p[2] - s.p[0], s.p[3] - s.p[1]) < 4)) { s.k = Math.random().toString(36).slice(2, 9); list().push(s); H().push({ t: 'add', s }); }
    changed();
  };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('pointerleave', () => { if (st.laser && !st.down) { /* Spur verblasst von selbst */ } });
  const undo = () => { const h = H().pop(); if (!h) return; const L = list();
    if (h.t === 'add') { const i = L.lastIndexOf(h.s); if (i >= 0) L.splice(i, 1); }
    else if (h.t === 'del') h.L.slice().reverse().forEach(x => L.splice(Math.min(x.i, L.length), 0, x.s));
    else if (h.t === 'clr') store[st.key] = h.L.slice();
    changed(); };
  const setOn = on => { st.on = on; if (on) st.laser = false; sync(); draw(); };
  const setLaser = on => { st.laser = on; if (on) st.on = false; st.lz = []; sync(); draw(); };
  bar.addEventListener('click', e => {
    const b = e.target.closest('[data-ink]'); if (!b) return; e.stopPropagation(); const a = b.dataset.ink, v = b.dataset.v;
    if (a === 'tool') st.tool = v;
    else if (a === 'col') st.col[st.tool] = v;
    else if (a === 'w') st.w = v;
    else if (a === 'undo') { undo(); return; }
    else if (a === 'clr') { const L = list(); if (L.length) { H().push({ t: 'clr', L: L.slice() }); store[st.key] = []; changed(); } return; }
    else if (a === 'clrall') { if (st.clrAll > Date.now()) { Object.keys(store).forEach(k => delete store[k]); Object.keys(hist).forEach(k => delete hist[k]); st.clrAll = 0; changed(); toast('Alle Notizen dieser Präsentation gelöscht'); } else { st.clrAll = Date.now() + 3000; sync(); setTimeout(sync, 3100); } return; }
    else if (a === 'page') { X.addPage(); return; }
    else if (a === 'pat') { X.setPat(v); return; }
    else if (a === 'tplm') { tplShow(tplPop.hidden); return; }
    else if (a === 'off') { X.close(); return; }
    sync();
  });
  return {
    place: k => { cv.style.transform = `translate(-50%,-50%) scale(${k})`; }, placeAw, draw,
    slide: s => { st.key = inkKey(s); st.cur = null; erased = null; draw(); sync(); },
    toggle: () => setOn(!st.on), laser: () => setLaser(!st.laser), on: setOn, undo,
    active: () => st.on || st.laser,
    // Striche vom Companion (iPad): hinzufügen, entfernen, leeren, laufender Strich, Laser
    remote: {
      keyed: k => { const L = store[k] || []; L.forEach(x => { if (!x.k) x.k = Math.random().toString(36).slice(2, 9); }); return L; },
      op: (k, m) => { const L = (store[k] = store[k] || []);
        const dv = String(m.d || '-'); st.rl = st.rl || {}; if (m.op === 'live') { if (m.s && Array.isArray(m.s.p)) st.rl[dv] = { key: k, s: m.s }; else delete st.rl[dv]; draw(); return; }
        if (m.op === 'add' && m.s && Array.isArray(m.s.p) && m.s.p.length < 20000) { if (!L.some(x => x.k && x.k === m.s.k)) L.push(m.s); delete st.rl[dv]; }
        else if (m.op === 'rm') { const ks = new Set(m.ks || []); store[k] = L.filter(x => !ks.has(x.k)); }
        else if (m.op === 'clr') { if (L.length) H().push({ t: 'clr', L: L.slice() }); store[k] = []; }
        draw(); sync(); X.saved(true); },
      laser: (k, x, y) => { if (k !== st.key) return; st.lz.push({ x, y, t: performance.now() }); if (st.lz.length > 80) st.lz.splice(0, st.lz.length - 80); if (!st.raf) st.raf = requestAnimationFrame(laserLoop); }
    },
    eats: e => !!((st.on || st.laser) && e.target.closest('.pr-ink, .pr-pen')) || !!e.target.closest('.pr-pen'),
    destroy: () => { cancelAnimationFrame(st.raf); }
  };
}
function openPres(start, opts = {}) {
  let S; if (opts.board) { S = [{ k: 'blank', pat: 'kariert', id: 'bl-' + uid() }]; S.bar = []; } else try { S = presSlides(); } catch (err) { console.error(err); toast('Die Präsentation ließ sich nicht erstellen.'); return; }
  if (!S.length) { toast('Es ist keine Folie ausgewählt. Im Bereich „Präsentation“ lassen sich Folien wählen.'); return; }
  const m = state.sheet.meta; const foot = opts.board ? '' : esc(state.sheet.abs ? stTitle(state.sheet) : [m.nr ? 'AB ' + m.nr : '', plainText(m.title || '')].filter(Boolean).join(' · '));
  const ov = el(`<div class="pr" role="dialog" aria-label="Präsentation" tabindex="-1"><div class="pr-stage"><div class="pr-slide"></div></div>
    <div class="pr-bar"><button type="button" data-p="prev" aria-label="Zurück" title="Zurück (Pfeil links)">‹</button><span class="pr-n" aria-live="polite"></span><button type="button" data-p="next" aria-label="Weiter" title="Weiter (Pfeil rechts oder Leertaste)">›</button><span class="sep"></span>
    <button type="button" data-p="tip" title="Nächsten Tipp zeigen (H)">Tipp</button><button type="button" data-p="eh" aria-pressed="false" title="Erwartung zeigen oder verbergen (E)">Erwartung</button>
    <span class="pr-clock" title="Uhrzeit und Stundenende"></span><span class="pr-tm"><button type="button" data-p="timer" title="Timer starten oder anhalten (T)">Timer starten</button><button type="button" data-p="tminus" title="Eine Minute weniger (−)" aria-label="Eine Minute weniger">−1</button><button type="button" data-p="tplus" title="Eine Minute mehr (+)" aria-label="Eine Minute mehr">+1</button><button type="button" data-p="treset" title="Timer zurücksetzen" aria-label="Timer zurücksetzen">↺</button><button type="button" data-p="tmshow" class="pr-tmshow" title="Anzeige wechseln: Restminuten, Endzeit oder beides · gilt für alle Stunden">${TM_SHOW[tmMode()].label}</button><span class="pr-tl"></span></span><span class="sep"></span>
    ${!opts.board && fotoOK() && state.sheet && state.sheet.id ? '<button type="button" data-p="fotos" class="pr-fotos" aria-expanded="false" title="Fotos vom iPad oder Handy: QR-Code, Vorschau und Sicherungsfolie (F)">📷 Fotos<i class="pr-fobadge" hidden></i></button>' : ''}<span class="pr-ytb" hidden><button type="button" data-p="ytbig" aria-pressed="false" title="Video bildschirmfüllend (V)">Video groß</button><button type="button" data-p="ytauf" aria-pressed="false" title="Beobachtungsauftrag über dem Video ein- oder ausblenden (A)">Auftrag</button></span><button type="button" data-p="laser" aria-pressed="false" title="Laserpointer (L)">Laser</button><button type="button" data-p="black" aria-pressed="false" title="Bildschirm bzw. Beamer schwarz (Punkt) oder weiß (Komma); die Referentenansicht bleibt sichtbar">Schwarz</button>${window.abDesktop && window.abDesktop.audSwap ? '<button type="button" data-p="swap" class="pr-swap" title="Beamerfenster und Referentenansicht auf die jeweils anderen Bildschirme tauschen">Bildschirme tauschen</button>' : ''}<button type="button" data-p="mode">Tafelansicht</button><button type="button" data-p="tools" aria-expanded="false" title="Timer, Ampel, Arbeitsform, Lautstärke, Würfel, Namen, Gruppen, Uhr, Zeichnen, Notiz, QR-Code und Hintergrund">Werkzeuge</button><button type="button" data-p="notime" aria-pressed="false" title="Zeiten, Timer und Uhr auf den Folien aus- oder einblenden (Z) · wird je Klasse gemerkt">Zeit ausblenden</button><button type="button" data-p="ref" aria-pressed="false" title="Zweiter Bildschirm: Folien auf dem Beamer, hier die Referentenansicht mit nächster Folie, Notizen und Uhr">Referentenansicht</button><button type="button" data-p="full">Vollbild</button><button type="button" data-p="close">Schließen</button></div><aside class="pr-side" aria-label="Referentenansicht"></aside></div>`);
  setAccent(ov, m);
  // Zeit ausblenden (für Klassen, die Zeitdruck stresst): Timer laufen weiter, sind aber unsichtbar; gemerkt je Klasse
  const ntKey = KL(state.sheet.klasse).id;
  const ntSet = on => { ov.classList.toggle('pr-notime', on); const bt = ov.querySelector('[data-p="notime"]'); bt.setAttribute('aria-pressed', String(on)); bt.textContent = on ? 'Zeit einblenden' : 'Zeit ausblenden'; };
  const ntToggle = () => { const on = !ov.classList.contains('pr-notime'); ntSet(on); mirror(); if (!state.prefs.noTime) state.prefs.noTime = {}; if (on) state.prefs.noTime[ntKey] = true; else delete state.prefs.noTime[ntKey]; savePrefs(); };
  ntSet(!!(state.prefs && state.prefs.noTime && state.prefs.noTime[ntKey])); document.body.appendChild(ov);
  const stage = ov.querySelector('.pr-stage'), slide = ov.querySelector('.pr-slide'), $p = q => ov.querySelector(q);
  const P = { i: Math.min(Math.max(0, +start || 0), S.length - 1), cur: 0, max: 0 };
  const TBo = tafelBoard({ ov, stage, slide, S, meta: m, klId: ntKey, gs: KL(state.sheet.klasse).stufe === 'gs', on: presModeOf(state.sheet.klasse) === 'tafel', idx: () => P.i, go: i => { P.i = i; show(); }, awOk: () => awOk(), aw: () => AW, rescale: () => { scale(); awScale(); INK.draw(); }, onSync: () => lfcTfl() });
  // Stift: Notizen je Folie, mit der Stunde gespeichert (leere Tafelseiten und die freie Tafel nur für diese Präsentation)
  // Tafel über der Präsentation: eigene leere Seite, die beim Schließen bis zum Ende der Präsentation erhalten bleibt
  const BOARD = { open: false, kind: 'tafel', s: { k: 'blank', pat: 'kariert', id: 'bl-tafel' } };
  // Geschichte: Pro-und-Contra-Tafel zur Stundenfrage, mit der Stunde gespeichert
  const pkOn = !opts.board && KL(state.sheet.klasse).fach === 'gp';
  const pkSaved = state.sheet.pk && typeof state.sheet.pk === 'object' ? state.sheet.pk : {};
  BOARD.pk = { k: 'blank', pk: true, pat: 'weiss', id: 'pk', q: tfStr(m.frage).trim(), h: Math.max(900, Math.min(9000, +pkSaved.h || 900)), sy: 0, own: Array.isArray(pkSaved.lab) && pkSaved.lab.length === 2 ? pkSaved.lab.map(x => String(x || '').slice(0, 40)) : null };
  const pkLab = () => { const pk = BOARD.pk; const auto = pkAuto(pk.q); pk.lab = pk.own || auto || ['Pro', 'Contra']; pk.either = !!(pk.own ? !(pk.own[0] === 'Pro' && pk.own[1] === 'Contra') : auto); pk.auto = auto; };
  pkLab();
  const curSl = () => (BOARD.open ? (BOARD.kind === 'pk' ? BOARD.pk : BOARD.kind === 'foto' ? BOARD.foto : BOARD.s) : S[P.i]);
  // Fotos vom iPad/Handy: erst nur hier in der Vorschau; „Zeigen“ (hier oder am Gerät) legt sie als Sicherungsfolie auf den Beamer
  const foOn = !opts.board && fotoOK() && !!(state.sheet && state.sheet.id);
  const FO = { list: [], loaded: false };
  BOARD.foto = { k: 'foto', id: 'foto', items: [], view: { s: 1, cx: .5, cy: .5 }, live: null, las: null };
  const boarding = () => BOARD.open || !!opts.board;
  // Tafel immer bildschirmfüllend: ohne Tafelansicht-Rahmen und, ohne Beamerfenster, im Vollbild des Browsers
  const boardFull = on => { try { if (on && !awOk() && !document.fullscreenElement && ov.requestFullscreen) { BOARD.fs = true; ov.requestFullscreen().catch(() => { BOARD.fs = false; }); } else if (!on && BOARD.fs) { BOARD.fs = false; if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); } } catch {} };
  const boardSet = (on, kind) => { if (opts.board) return; if (kind) BOARD.kind = kind; const was = BOARD.open; BOARD.open = on; ov.classList.toggle('pr-boarding', on); if (on !== was) boardFull(on); scale(); awScale();
    ov.querySelectorAll('.pr-tafelbtn').forEach(b => { const mine = on && BOARD.kind === b.dataset.kind; b.setAttribute('aria-pressed', String(mine)); b.querySelector('span').textContent = mine ? 'Zurück zur Folie' : b.dataset.label; }); show(); ov.focus(); };
  const boardT = kind => (BOARD.open && BOARD.kind === kind ? boardSet(false) : boardSet(true, kind));
  const pkSave = () => { if (!pkOn) return; const L = inkStore.pk || []; if (!L.length && BOARD.pk.h <= 900 && !BOARD.pk.own) delete state.sheet.pk; else state.sheet.pk = { ink: L, h: BOARD.pk.h, ...(BOARD.pk.own ? { lab: BOARD.pk.own } : {}) }; if (state.sheet.example) state.sheet.example = false; state.touched = true; scheduleSave(); };
  const inkStore = { ...(pkOn && Array.isArray(pkSaved.ink) ? { pk: pkSaved.ink.filter(x => x && Array.isArray(x.p)).slice(0, 3000) } : {}) };
  const INK = inkLayer({ ov, stage, store: inkStore, tafel: () => TBo.isOn() && !boarding(), awOk: () => awOk(), aw: () => AW, saved: remote => { if (curSl().id === 'pk') pkSave(); if (!remote || (LFC && Object.values(LFC.devs || {}).filter(t => Date.now() - t < 90000).length > 1)) lfcPushSoon(); },
    addPage: opts.board ? () => { S.splice(P.i + 1, 0, { k: 'blank', pat: S[P.i].pat || 'kariert', id: 'bl-' + uid() }); P.i++; show(); } : null,
    off: () => { const b2 = curSl(); return b2 && b2.k === 'blank' ? b2.sy || 0 : 0; },
    setPat: v => { curSl().pat = v; show(); }, curPat: () => (curSl() || {}).pat || 'weiss', close: opts.board ? null : () => boardSet(false) });
  const T = { left: 0, full: 0, run: false, end: 0, id: 0, slide: -1, cid: 0 };
  // Uhrzeit-Plan der Stunde; gilt nur, solange die Uhr in der Stundenzeit liegt (sonst wie bisher Minuten herunterzählen)
  const PLAN = uhrOn() ? stPlan() : null;
  const slideBid = sl => (sl.k === 'step' ? sl.b && sl.b.id : sl.k === 'tasks' ? ((sl.items || []).find(x => (x.bmin || 0) === tsMin(sl)) || {}).bid : null);
  const clockEnd = sl => { if (!PLAN) return null; const n = nowMin(); if (n < PLAN.s0 - 10 || n > PLAN.end) return null; const r = planEnd(PLAN, slideBid(sl), n); if (!r) return null; return Date.now() + Math.max(1, r.end - n) * 60000; };
  const hhmm = ms => { const d = new Date(ms); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const fmt = sec => (sec > 0 ? Math.ceil(sec / 60) + ' Min.' : '0 Min.');
  // Warnung, bevor ein laufender Timer vorzeitig endet (Zurücksetzen, Beenden, anderer Timer); Blättern hält ihn nicht an
  let W = null;
  const warnClose = () => { if (!W) return; W.el.remove(); W = null; ov.focus(); };
  const tmWarn = (msg, okLabel, onOk) => {
    if (!T.run || T.left <= 0) { onOk(); return; }
    warnClose();
    const other = T.slide !== P.i ? ` auf Folie ${T.slide + 1}` : '';
    const w = el(`<div class="pr-warn" role="alertdialog" aria-modal="true" aria-labelledby="pr-warn-t" aria-describedby="pr-warn-d"><div class="pr-warn-c"><b id="pr-warn-t">Der Timer${other} läuft noch</b><p id="pr-warn-d">Noch <span class="pr-warn-l">${fmt(T.left)}</span> ${msg}</p><div class="pr-warn-a"><button type="button" data-w="ok">${okLabel}</button><button type="button" data-w="keep">Weiterlaufen lassen</button></div></div></div>`);
    ov.appendChild(w); W = { el: w, ok: onOk }; w.querySelector('[data-w="keep"]').focus();
  };
  const scale = () => { const k = Math.min(stage.clientWidth / 1600, stage.clientHeight / 900); slide.style.transform = boarding() ? `translate(-50%,-50%) scale(${k})` : TBo.slideTf(k); TBo.place(k); INK.place(k); };
  const apply = () => {
    slide.querySelectorAll('[data-st]').forEach(e => e.classList.toggle('tf-hid', +e.dataset.st > P.cur));
    $p('.pr-n').textContent = `${P.i + 1} / ${S.length}` + (P.max ? ` · Schritt ${P.cur} von ${P.max}` : '');
    $p('[data-p="prev"]').disabled = !P.i && !P.cur; $p('[data-p="next"]').disabled = P.i >= S.length - 1 && P.cur >= P.max;
    const tips = slide.querySelector('.pr-tips'); $p('[data-p="tip"]').hidden = !tips; if (tips) $p('[data-p="tip"]').disabled = !tips.querySelector('[hidden]');
    const eh = slide.querySelector('.pr-eh'); $p('[data-p="eh"]').hidden = !eh; if (eh) $p('[data-p="eh"]').setAttribute('aria-pressed', String(!eh.hidden));
    tmShow(); mirror(); refSide(); lfcHb();
  };
  const tmShow = () => {
    const el2 = slide.querySelector('.pr-timer'); const mine = T.slide === P.i;
    const low = mine && T.full > 0 && T.left > 0 && T.left <= T.full * 0.3;
    if (el2) { let sec = mine ? T.left : +el2.dataset.min * 60; let bis = '';
      if (mine && T.run) bis = hhmm(T.end); else if (!mine || (T.left <= 0 && !T.full)) { const ce = clockEnd(S[P.i]); if (ce) { sec = Math.round((ce - Date.now()) / 1000); bis = hhmm(ce); } }
      const over = mine && T.full > 0 && T.left <= 0 && !T.run, md = tmMode(); let main = over ? 'Zeit um' : fmt(sec), sub = bis ? 'bis ' + bis : '';
      if (!over && md === 'ende' && bis) { main = 'bis ' + bis; sub = ''; } else if (md === 'timer' || md === 'ende') sub = '';
      el2.innerHTML = `<b>${main}</b>${sub ? `<small>${sub}</small>` : ''}`; el2.classList.toggle('pr-tm-ende', !over && md === 'ende' && !!bis); el2.classList.toggle('end', mine && T.left <= 0 && !T.run && T.full > 0); el2.classList.toggle('run', mine && T.run); el2.classList.toggle('low', low); }
    const tb = slide.querySelector('.pr-tbar'); if (tb) { const f = mine && T.full ? T.left / T.full : 1; tb.firstChild.style.width = (f * 100).toFixed(2) + '%'; tb.classList.toggle('end', mine && T.left <= 0 && T.full > 0); tb.classList.toggle('run', mine && T.run); tb.classList.toggle('low', low); }
    slide.classList.toggle('t-low', low && T.run);
    { const c = $p('.pr-clock'); if (c) c.textContent = PLAN ? `${hmFmt(nowMin())} · Ende ${hmFmt(PLAN.end)}` : ''; }
    $p('.pr-tm').hidden = !el2 && !T.run;
    $p('[data-p="timer"]').textContent = T.run ? 'Timer anhalten' : (mine && T.left > 0 && T.left < T.full ? 'Timer fortsetzen' : 'Timer starten');
    $p('[data-p="timer"]').disabled = !el2 && !T.run;
    $p('.pr-tl').textContent = T.run && !mine ? '⏱ ' + (tmMode() === 'ende' ? 'bis ' + hhmm(T.end) : tmMode() === 'timer' ? fmt(T.left) : fmt(T.left) + ' · bis ' + hhmm(T.end)) : ''; $p('.pr-tl').classList.toggle('low', T.run && !mine && T.left <= T.full * 0.3);
    if (W) { const l = W.el.querySelector('.pr-warn-l'); if (l) l.textContent = fmt(T.left); }
    mirrorT();
  };
  /* ---------- Zweiter Bildschirm: Beamerfenster zeigt die Folie, dieses Fenster die Referentenansicht ---------- */
  let AW = null, awPoll = 0, awWake = null, sideKey = '';
  const awOk = () => !!(AW && !AW.closed && AW.document && AW.document.querySelector('.pr-slide'));
  let AWnative = false, BL = '';
  const awScale = () => { if (!awOk()) return; const d = AW.document, st = d.querySelector('.pr-stage'), sl = d.querySelector('.pr-slide'); const k = Math.min(st.clientWidth / 1600, st.clientHeight / 900); sl.style.transform = boarding() ? `translate(-50%,-50%) scale(${k})` : TBo.slideTf(k); TBo.placeAw(d, k); INK.placeAw(d, k); d.querySelector('.pr').classList.toggle('pr-boarding', boarding()); };
  const mirror = () => { if (!awOk()) return; TBo.mirror(); AW.document.querySelector('.pr').classList.toggle('pr-boarding', boarding()); INK.draw(); const d = AW.document, sl = d.querySelector('.pr-slide'); if (ytOn === P.i && sl.querySelector('.pr-yt.on iframe')) { awScale(); return; } sl.className = slide.className; sl.innerHTML = slide.innerHTML; d.querySelector('.pr').classList.toggle('pr-notime', ov.classList.contains('pr-notime')); awScale(); };
  // Think-Pair-Share: aktiven Schritt markieren (auch im Beamerfenster)
  const tpsSet = i => { const L = slide.querySelector('.pr-tps'); if (!L) return false; const cur = +(L.dataset.on ?? -1); const v = cur === i ? -1 : i;
    const apply = el => { if (!el) return; el.dataset.on = v; el.classList.toggle('act', v >= 0); el.querySelectorAll('.pr-tps-s').forEach(x => x.classList.toggle('on', +x.dataset.tps === v)); };
    apply(L); if (awOk()) apply(AW.document.querySelector('.pr-slide .pr-tps')); return true; };
  const mirrorT = () => { if (!awOk()) return; const d = AW.document; ['.pr-timer', '.pr-tbar'].forEach(q => { const a = slide.querySelector(q), b = d.querySelector('.pr-slide ' + q); if (a && b) { b.className = a.className; b.innerHTML = a.innerHTML; } }); d.querySelector('.pr-slide').className = slide.className; };
  const refSide = () => {
    if (!ov.classList.contains('pr-ref')) return; const sd = $p('.pr-side'); const nx = S[P.i + 1];
    const notes = []; const eh = slide.querySelector('.pr-eh'), tp = slide.querySelector('.pr-tips');
    [tp, eh].forEach(n => { if (!n) return; const c = n.cloneNode(true); c.hidden = false; c.classList.remove('pr-pop'); c.querySelectorAll('[hidden]').forEach(x => { x.hidden = false; x.classList.add('prs-later'); }); notes.push(c.outerHTML); });
    const key = P.i + '|' + P.cur + '|' + S.length + '|' + sd.clientWidth;
    if (key !== sideKey) {
      sideKey = key; const w = Math.max(160, sd.clientWidth - 32); const bar = S.bar || [];
      const nxt = P.cur < P.max ? `<div class="prs-step">Noch ${P.max - P.cur} ${P.max - P.cur === 1 ? 'Schritt' : 'Schritte'} auf dieser Folie</div>` : '';
      sd.innerHTML = `<div class="prs-top"><b class="prs-clock"></b><span>Folie ${P.i + 1} von ${S.length}</span></div><div class="prs-tm"></div>
        ${foOn ? (() => { const nn = FO.list.filter(f => f._new).length, L = FO.list.slice(-3).reverse(); return `<div class="prs-fo${nn ? ' new' : ''}"><button type="button" class="prs-fob" data-p="fotos">${'<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 8.5A1.5 1.5 0 0 1 4.5 7h2.7l1.6-2.2h6.4L16.8 7h2.7A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z\"/><circle cx=\"12\" cy=\"13\" r=\"3.6\"/></svg>'.replace(/20/g, '24')}<span><b>Fotos vom iPad / Handy</b><small>${FO.list.length ? (nn ? nn + ' neu · ' : '') + FO.list.length + ' zu dieser Stunde' : 'QR-Code scannen und loslegen'}</small></span>${nn ? `<i>${nn}</i>` : ''}</button>${L.length ? `<div class="prs-fol">${L.map(f => `<button type="button" class="prs-fot${f._new ? ' new' : ''}" data-foshow="${f.id}" title="Als Sicherungsfolie auf den Beamer"><img alt="" data-p="${esc(f.path)}"><span>Zeigen</span></button>`).join('')}</div>` : ''}</div>`; })() : ''}
        <div class="prs-h">Als Nächstes</div>${nxt}${nx ? `<div class="pr-thumb prs-next" style="--tw:${w}px;--k:${(w / 1600).toFixed(4)}"><div class="pr-slide pr-k-${nx.k}${bar.length ? ' has-bar' : ''}"><div class="pr-accent"></div>${presSlideHTML(nx, bar)}${presBarHTML(bar, nx.bi)}<div class="pr-foot"><span></span><span>${P.i + 2}</span></div></div></div>` : '<div class="prs-end">Das ist die letzte Folie.</div>'}
        <div class="prs-h">Notizen <small>nur hier sichtbar</small></div><div class="prs-notes">${notes.join('') || '<p class="prs-none">Zu dieser Folie gibt es keine Tipps oder Erwartungen.</p>'}</div>
        <div class="prs-h">Beamer</div><div class="prs-aw">${awOk() ? 'Die Folie läuft im Beamerfenster. Dort einmal klicken für Vollbild. Tasten und Presenter funktionieren in beiden Fenstern.' : 'Das Beamerfenster ist zu.'}</div>`;
      if (foOn) fotoThumbs(sd);
      const ns = sd.querySelector('.prs-next .pr-slide'); if (ns) { const f = ns.querySelector('.pr-fit'), body = ns.querySelector('.pr-body'); try { if (f && body && PR_MAX[nx.k]) fitUp(f, body, PR_MAX[nx.k]); tfDraw(ns); phbFit(ns); } catch {} }
    }
    refClock();
  };
  const refClock = () => {
    if (!ov.classList.contains('pr-ref')) return; const c = $p('.prs-clock'); if (c) c.textContent = hhmm(Date.now()) + ' Uhr';
    const t = $p('.prs-tm'); if (t) { t.textContent = T.run || (T.slide >= 0 && T.full && T.left < T.full) ? `Timer${T.slide !== P.i ? ' (Folie ' + (T.slide + 1) + ')' : ''}: ${fmt(T.left)}${T.run ? ' · bis ' + hhmm(T.end) : ' · angehalten'}` : (PLAN ? 'Stundenende ' + hmFmt(PLAN.end) + ' Uhr' : ''); t.classList.toggle('low', T.run && T.full > 0 && T.left <= T.full * 0.3); }
  };
  const refUi = on => { ov.classList.toggle('pr-ref', on); const b = $p('[data-p="ref"]'); b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'Beamerfenster schließen' : 'Referentenansicht'; sideKey = ''; scale(); if (on) refSide(); };
  const refClose = () => { AWnative = false; if (window.abDesktop && window.abDesktop.restore) window.abDesktop.restore().catch(() => {}); clearInterval(awPoll); awPoll = 0; if (awWake) { awWake(); awWake = null; } try { if (AW && !AW.closed) AW.close(); } catch {} AW = null; refUi(false); ov.focus(); };
  const awBuild = (hint) => {
    const d = AW.document; d.open(); d.write('<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LehrWerk · Beamer</title></head><body></body></html>'); d.close();
    [...document.documentElement.attributes].forEach(a => { if (a.name !== 'style') d.documentElement.setAttribute(a.name, a.value); });
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach(n => d.head.appendChild(d.importNode(n, true)));
    d.body.style.cssText = 'margin:0;background:#000;overflow:hidden';
    d.body.innerHTML = `<div class="pr pr-aud" style="${esc(ov.style.cssText)}"><div class="pr-stage"><div class="pr-slide"></div></div><div class="pr-aud-hint"><b>Beamerfenster</b><span>${hint}</span></div></div>`;
    const hd = () => { const h = d.querySelector('.pr-aud-hint'); if (h) h.hidden = !!d.fullscreenElement; awScale(); };
    d.addEventListener('fullscreenchange', hd);
    d.addEventListener('click', e => { if (e.target.closest('.pr-yt-go')) { ytPlay(); return; } if (e.target.closest('.pr-yt.on')) return; if (!AWnative && !d.fullscreenElement && d.documentElement.requestFullscreen) { d.documentElement.requestFullscreen().catch(() => {}); return; } next(); });
    AW.addEventListener('blur', () => setTimeout(() => { try { const a = AW.document.activeElement; if (a && a.tagName === 'IFRAME') a.blur(); } catch {} }, 60));
    d.addEventListener('keydown', e => { if (e.key === 'Escape' && d.fullscreenElement) return; key(e); });
    AW.addEventListener('resize', awScale);
    AW.addEventListener('pagehide', () => setTimeout(() => { if (!AW || AW.closed) refClose(); }, 300));
    mirror(); setTimeout(awScale, 60);
    awWake = keepAwake(AW, true);
  };
  const refOpen = async () => {
    if (AW && !AW.closed) { refClose(); return; }
    let other = null, many = null, perm = null;
    try { if ('getScreenDetails' in window && navigator.permissions) { perm = (await navigator.permissions.query({ name: 'window-management' })).state; if (perm === 'granted') { const sd = await window.getScreenDetails(); many = sd.screens.length; other = sd.screens.find(x => x !== sd.currentScreen) || null; } } } catch {}
    const feat = other ? `popup,left=${other.availLeft},top=${other.availTop},width=${other.availWidth},height=${other.availHeight},fullscreen` : `popup,width=${Math.min(1280, screen.availWidth)},height=${Math.min(760, screen.availHeight)}`;
    AW = window.open('', 'abomat-beamer', feat);
    if (!AW) { toast('Das Beamerfenster wurde blockiert. Bitte Pop-ups für diese Seite erlauben und erneut versuchen.'); return; }
    const api = 'getScreenDetails' in window;
    awBuild(other ? 'Einmal klicken: Vollbild.' : api ? 'Einmal klicken: Vollbild. Steht dieses Fenster nicht auf dem Beamer, zuerst hinüberziehen.' : 'Dieses Fenster auf den Beamer ziehen und dort einmal klicken: Vollbild.');
    refUi(true);
    awPoll = setInterval(() => { if (!AW || AW.closed) refClose(); else refClock(); }, 1000);
    if (api && !other && perm !== 'denied') {
      try { const sd = await window.getScreenDetails(); many = sd.screens.length; other = sd.screens.find(x => x !== sd.currentScreen) || null;
        if (other && AW && !AW.closed) { AW.moveTo(other.availLeft, other.availTop); AW.resizeTo(other.availWidth, other.availHeight); const h = AW.document.querySelector('.pr-aud-hint span'); if (h) h.textContent = 'Einmal klicken: Vollbild.'; } } catch {}
    }
    const D = window.abDesktop;
    if (D && D.audPlace) { try { const r = await D.audPlace(); if (r && r.ok && AW && !AW.closed) { AWnative = true; many = r.n; const h = AW.document.querySelector('.pr-aud-hint'); if (h) h.hidden = true; setTimeout(awScale, 120); } else if (r) many = r.n; } catch {} }
    if (many === 1) {
      if (D && D.extend && D.win32) toast('Nur ein Bildschirm erkannt. Steht Windows auf „Duplizieren“?', 'Auf „Erweitern“ umschalten', async () => { toast('Bildschirme werden umgeschaltet …'); const r = await D.extend(); if (r && r.ok) { if (AW && !AW.closed) { const q = await D.audPlace(); if (q && q.ok) { AWnative = true; const h = AW.document.querySelector('.pr-aud-hint'); if (h) h.hidden = true; setTimeout(awScale, 120); } } toast('Beamer auf „Erweitern“ gestellt. Nach der Präsentation stellt LehrWerk wieder um.'); } else toast('Kein zweiter Bildschirm gefunden. Ist der Beamer angeschlossen und eingeschaltet?'); });
      else toast('Es ist nur ein Bildschirm angeschlossen. Am Beamer unter Windows mit Win+P „Erweitern“ wählen, am Mac in den Displays „Spiegeln“ ausschalten.');
    }
    sideKey = ''; refSide();
  };
  window.addEventListener('pagehide', () => { try { if (AW && !AW.closed) AW.close(); } catch {} });
  if (PLAN) T.cid = setInterval(() => { if (!T.run) tmShow(); }, 15000);
  const tick = () => { T.left = Math.max(0, Math.round((T.end - Date.now()) / 1000));
    if (T.full >= 60 && T.left > 0 && T.left <= T.full * 0.3) { if (!T.lowRung && !ov.classList.contains('pr-notime')) tbSoft(); T.lowRung = true; } else if (T.left > T.full * 0.3) T.lowRung = false; if (T.left <= 0) { T.run = false; clearInterval(T.id); } tmShow(); };
  const tmToggle = () => {
    if (T.run && T.slide !== P.i && slide.querySelector('.pr-timer')) { tmWarn('Der Timer dieser Folie ersetzt ihn.', 'Neuen Timer starten', tmStart); return; }
    if (T.run) { clearInterval(T.id); T.run = false; tick(); T.run = false; tmShow(); return; }
    tmStart();
  };
  const tmStart = () => {
    const el2 = slide.querySelector('.pr-timer'); if (!el2) return;
    if (T.slide !== P.i || T.left <= 0) { T.slide = P.i; const ce = clockEnd(S[P.i]); T.full = T.left = ce ? Math.max(60, Math.round((ce - Date.now()) / 1000)) : +el2.dataset.min * 60;
      if (ce) { const plan = +el2.dataset.min; const got = Math.round(T.left / 60); if (got < plan) toast(`Nach der Uhr bleiben ${got} statt ${plan} Min. · fertig um ${hhmm(Date.now() + T.left * 1000)}`); } }
    T.end = Date.now() + T.left * 1000; T.run = true; clearInterval(T.id); T.id = setInterval(tick, 250); tmShow();
  };
  // ±1 Minute: läuft der Timer, verschiebt sich das Ende; sonst ändert sich die Startzeit dieser Folie (nur für diese Präsentation)
  const tmAdj = d => {
    const el2 = slide.querySelector('.pr-timer');
    if (!T.run && (T.slide !== P.i || T.left <= 0)) { if (!el2) return; T.slide = P.i; T.full = T.left = +el2.dataset.min * 60; }
    if (!T.run && T.slide !== P.i) return;
    const dd = Math.max(-T.left + (T.run ? 1 : 60), d * 60); if (!dd) return;
    T.left += dd; T.full = Math.max(T.left, T.full + dd); if (T.run) T.end += dd * 1000;
    tmShow(); toast((dd > 0 ? '+' : '−') + Math.abs(Math.round(dd / 60)) + ' Min. · noch ' + fmt(T.left));
  };
  const tmReset = () => tmWarn('Zurücksetzen bricht ihn ab.', 'Zurücksetzen', tmResetNow);
  const tmResetNow = () => { clearInterval(T.id); T.run = false; const el2 = slide.querySelector('.pr-timer'); T.slide = el2 ? P.i : -1; T.full = T.left = el2 ? +el2.dataset.min * 60 : 0; tmShow(); };
  const fit = () => { const f = slide.querySelector('.pr-fit'), body = slide.querySelector('.pr-body'); slide.querySelectorAll('.tf-hid').forEach(e => e.classList.remove('tf-hid')); if (f && body && PR_MAX[S[P.i].k]) fitUp(f, body, PR_MAX[S[P.i].k]); tfDraw(slide); phbFit(slide); apply(); };
  const show = () => {
    if (ytOn !== P.i) { ytOn = -1; if (typeof ytBig !== 'undefined' && ytBig) ytBigSet(false); }
    const sl = curSl(); const bar = S.bar || []; slide.className = 'pr-slide pr-k-' + sl.k + (prMin(sl) ? ' has-timer' : '') + (bar.length ? ' has-bar' : '');
    slide.innerHTML = '<div class="pr-accent"></div>' + presSlideHTML(sl, bar) + presBarHTML(bar, sl.bi) + `<div class="pr-foot"><span>${foot}${sl.ab && sl.k !== 'abhead' ? ' · ' + esc(sl.ab) : ''}</span><span>${P.i + 1}</span></div>`;
    P.max = Math.max(0, ...[...slide.querySelectorAll('[data-st]')].map(e => +e.dataset.st)); P.cur = 0;
    if (slide.querySelector('.pr-timer')) slide.insertAdjacentHTML('afterbegin', '<div class="pr-tbar" aria-hidden="true"><i></i></div>');
    const im = slide.querySelector('img.pr-img'); if (im && !im.complete) im.onload = fit;
    fit(); bubScan(slide); TBo.slide(P.i); INK.slide(sl); INK.on(sl.k === 'blank'); try { if (sl.k !== 'blank' && !BOARD.open && foOn && LFC) { clearTimeout(LFC.st); LFC.st = setTimeout(() => lfcFull('sl'), 160); } } catch {} ov.classList.toggle('pr-blankcur', sl.k === 'blank'); ov.classList.toggle('pr-pkcur', !!sl.pk); hsSync();
    warnClose();
    if (slide.querySelector('.pr-timer[data-auto]') && T.slide !== P.i) tmWarn('Diese Folie startet ihren eigenen Timer und ersetzt ihn.', 'Neuen Timer starten', tmStart);
    lfcHb();
  };
  // Tafel nach unten erweitern; rechts erscheint eine Scrollleiste
  const bl = () => { const b2 = curSl(); return b2 && b2.k === 'blank' ? b2 : null; };
  const hsSync = () => { const hs = $p('.pr-vscroll'); if (!hs) return; const b2 = bl(); const H = b2 ? b2.h || 900 : 900; hs.hidden = !b2 || H <= 900; if (hs.hidden) return; const th = hs.firstElementChild; th.style.height = (900 / H * 100).toFixed(3) + '%'; th.style.top = ((b2.sy || 0) / H * 100).toFixed(3) + '%'; };
  const blankScroll = y => { const b2 = bl(); if (!b2) return; b2.sy = Math.round(Math.max(0, Math.min((b2.h || 900) - 900, y))); const d = slide.querySelector('.pr-blank'); if (d) d.style.backgroundPosition = inkBgPos(b2) || '0 0';
    if (awOk()) { const ad = AW.document.querySelector('.pr-slide .pr-blank'); if (ad) ad.style.backgroundPosition = inkBgPos(b2) || '0 0'; }
    [slide, awOk() ? AW.document.querySelector('.pr-slide') : null].forEach(r => { const q = r && r.querySelector('.pr-pk-in'); if (q) q.style.transform = `translateY(${-b2.sy}px)`; const tp = r && r.querySelector('.pr-tpl'); if (tp) tp.style.transform = `translateY(${-b2.sy}px)`; }); hsSync(); INK.draw(); lfcHb(); };
  const blankMore = () => { const b2 = bl(); if (!b2) return; b2.h = (b2.h || 900) + 900; if (b2.id === 'pk') { const q = slide.querySelector('.pr-pk-in'); if (q) q.style.height = b2.h + 'px'; pkSave(); } const from = b2.sy || 0, to = Math.min(b2.h - 900, from + 680), t0 = performance.now();
    const step = t => { const f = Math.min(1, (t - t0) / 350); blankScroll(from + (to - from) * (1 - Math.pow(1 - f, 3))); if (f < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); };
  stage.addEventListener('wheel', e => { const b2 = bl(); if (!b2 || (b2.h || 900) <= 900) return; e.preventDefault(); const k = slide.getBoundingClientRect().height / 900 || 1; blankScroll((b2.sy || 0) + e.deltaY / k); }, { passive: false });
  // Laser an/aus; auf einer Tafelseite ist danach wieder der Stift aktiv
  const laserT = () => { INK.laser(); if (curSl().k === 'blank' && !INK.active()) INK.on(true); };
  const blank = mode => {
    BL = BL === mode ? '' : mode; const tgt = awOk() ? AW.document.querySelector('.pr-stage') : stage;
    [stage, awOk() ? AW.document.querySelector('.pr-stage') : null].forEach(st => { const o = st && st.querySelector(':scope > .pr-blackout'); if (o) o.remove(); });
    if (BL && tgt) tgt.insertAdjacentHTML('beforeend', `<div class="pr-blackout ${BL}"></div>`);
    ov.querySelectorAll('[data-p="black"]').forEach(b => { b.setAttribute('aria-pressed', String(!!BL)); b.textContent = BL === 'w' ? 'Weiß ✓' : BL ? 'Schwarz ✓' : 'Schwarz'; });
    lfcHb(); if (BL && tgt !== stage) toast(BL === 'w' ? 'Beamer weiß – deine Ansicht bleibt. Komma oder der Knopf hebt es auf.' : 'Beamer schwarz – deine Ansicht bleibt. Punkt oder der Knopf hebt es auf.');
  };
  // Übergang zwischen zwei Folien: erst das Beamerfenster, dann diese Ansicht festhalten, dann wechseln
  const vtGo = (dir, fn) => {
    const t = presVT(); if (!t || BOARD.open) { fn(); return; }
    const docs = [document, awOk() ? AW.document : null].filter(Boolean); docs.forEach(d => { d.documentElement.setAttribute('data-prvt', t); d.documentElement.setAttribute('data-prvd', dir); });
    try { if (awOk() && AW.document.startViewTransition) AW.document.startViewTransition(() => new Promise(res => { try { const v = document.startViewTransition(fn); v.updateCallbackDone.then(res, res); } catch { fn(); res(); } }));
      else document.startViewTransition(fn); } catch { fn(); }
  };
  const next = () => { if (BL) { blank(BL); return; } if (BOARD.open) { boardSet(false); return; } if (P.cur < P.max) { P.cur++; apply(); } else if (P.i < S.length - 1) vtGo('fwd', () => { P.i++; show(); }); };
  const prev = () => { if (BL) { blank(BL); return; } if (BOARD.open) { boardSet(false); return; } if (P.cur > 0) { P.cur--; apply(); } else if (P.i > 0) vtGo('back', () => { P.i--; show(); P.cur = P.max; apply(); }); };
  const tip = () => { const tp = slide.querySelector('.pr-tips'); if (!tp) return; const h = tp.querySelector('[hidden]'); tp.hidden = false; if (h) h.hidden = false; apply(); };
  const ehT = () => { const e2 = slide.querySelector('.pr-eh'); if (!e2) return; e2.hidden = !e2.hidden; apply(); };
  const close = () => tmWarn('Beim Beenden der Präsentation wird er abgebrochen.', 'Präsentation beenden', closeNow);
  const wake = keepAwake();
  const closeNow = () => { ov.dispatchEvent(new Event('lw-close')); TBo.destroy(); INK.destroy(); wake(); refClose(); clearInterval(T.id); clearInterval(T.cid); document.removeEventListener('keydown', key, true); window.removeEventListener('resize', scale); try { if (document.fullscreenElement) document.exitFullscreen(); } catch {} ov.remove(); };
  const key = e => {
    if (e.target && e.target.closest && e.target.closest('.pr-pkdlg')) return;
    if (TBo.keyIgnore(e)) return;
    if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'z' || e.key === 'Z') && INK.active()) { e.preventDefault(); e.stopPropagation(); INK.undo(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if ((e.key === ' ' || e.key === 'Enter') && e.target.closest && e.target.closest('.pr-bar button')) return;
    const k = e.key; const stop = () => { e.preventDefault(); e.stopPropagation(); };
    if (W) {
      if ((k === ' ' || k === 'Enter') && e.target.closest && e.target.closest('.pr-warn button')) return;
      if (k === 'Tab') return;
      if (k === 'Escape') { stop(); warnClose(); return; }
      warnClose();
    }
    if (foOn && k === 'Escape' && !foPan().hidden) { stop(); foPanT(false); return; }
    if (foOn && (k === 'f' || k === 'F')) { stop(); foPanT(); return; }
    if (k === 'ArrowRight' || k === ' ' || k === 'PageDown' || k === 'Enter') { stop(); next(); }
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { stop(); prev(); }
    else if (k === 'Home') { stop(); P.i = 0; show(); } else if (k === 'End') { stop(); P.i = S.length - 1; show(); }
    else if (k === 't' || k === 'T') { stop(); tmToggle(); } else if (k === '+' || k === '=') { stop(); tmAdj(1); } else if (k === '-' || k === '_') { stop(); tmAdj(-1); } else if (k === 'e' || k === 'E') { stop(); ehT(); } else if (k === 'z' || k === 'Z') { stop(); ntToggle(); } else if (k === 'h' || k === 'H') { stop(); tip(); }
    else if ((k === 'v' || k === 'V') && ytOn === P.i) { stop(); ytBigSet(!ytBig); } else if ((k === 'a' || k === 'A') && ytOn === P.i) { stop(); ytAufSet(); }
    else if (k === 'b' || k === 'B') { stop(); boardT('tafel'); } else if (k === '.') { stop(); blank('s'); } else if (k === ',') { stop(); blank('w'); } else if ((k === 'k' || k === 'K') && pkOn) { stop(); boardT('pk'); } else if (k === 'l' || k === 'L') { stop(); laserT(); }
    else if (k === 'Escape') { stop(); if (ov.querySelector('[data-p="laser"][aria-pressed="true"]')) { laserT(); return; } if (BOARD.open) { boardSet(false); return; } if (!document.fullscreenElement) close(); }
  };
  /* Video: auf der Folie abspielen; mit Beamerfenster nur dort, hier bleibt die Steuerung */
  let ytOn = -1;
  const ytCmd = (doc, func) => { const f = doc && doc.querySelector('.pr-slide .pr-yt iframe'); if (f && f.contentWindow) f.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*'); };
  const ytPlay = () => {
    const box = slide.querySelector('.pr-yt'); if (!box) return; ytOn = P.i;
    const ard = box.dataset.kind === 'ard';
    const ifr = `<iframe src="${esc(box.dataset.src)}" title="${ard ? 'Video aus der ARD Mediathek' : 'YouTube-Video'}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    if (awOk()) { const ab = AW.document.querySelector('.pr-slide .pr-yt'); if (ab) { ab.classList.add('on'); ab.innerHTML = ifr; }
      box.classList.add('remote'); box.querySelector('.pr-yt-ph').innerHTML = `<span class="pr-yt-t">Läuft im Beamerfenster</span><span class="pr-yt-ctl">${ard ? '' : '<button type="button" class="btn" data-yt="pause">Pause</button><button type="button" class="btn" data-yt="play">Weiter</button>'}<button type="button" class="btn" data-yt="stop">Video schließen</button></span>${ard ? '<span class="pr-yt-s">Pause und Vorspulen direkt im Player auf dem Beamer</span>' : ''}`; }
    else { box.classList.add('on'); box.innerHTML = ifr + '<button type="button" class="pr-yt-x" data-yt="stop" title="Video schließen">×</button>'; }
    setTimeout(() => ov.focus(), 400); try { ytCls(); } catch {} lfcHb();
  };
  let ytBig = false;
  let ytAuf = false;
  const ytCls = () => { const hasA = !!(slide && slide.querySelector('.pr-yt-auf'));
    [ov, awOk() ? AW.document.querySelector('.pr') : null].forEach(r => { if (!r) return; r.classList.toggle('pr-ytbig', ytBig); r.classList.toggle('pr-ytauf', ytBig && ytAuf && hasA); });
    const g = ov.querySelector('.pr-ytb'); if (g) { g.hidden = ytOn !== P.i; const a = g.querySelector('[data-p="ytauf"]'); a.hidden = !hasA; a.setAttribute('aria-pressed', String(ytAuf)); g.querySelector('[data-p="ytbig"]').setAttribute('aria-pressed', String(ytBig)); } };
  const ytBigSet = on => { ytBig = !!on; try { ytCls(); } catch {} lfcHb(); };
  const ytAufSet = on => { ytAuf = on == null ? !ytAuf : !!on; if (ytAuf && !ytBig) ytBig = true; try { ytCls(); } catch {} lfcHb(); };
  const ytStop = () => { ytOn = -1; if (ytBig) ytBigSet(false); show(); if (awOk()) mirror(); try { ytCls(); } catch {} };
  // Klick in den Player zieht den Fokus ins Video: zurückholen, damit Presenter und Pfeiltasten weiter schalten
  window.addEventListener('blur', () => setTimeout(() => { if (document.body.contains(ov) && document.activeElement && document.activeElement.tagName === 'IFRAME') ov.focus(); }, 60));
  ov.addEventListener('click', e => {
    const yb = e.target.closest('.pr-yt-go, [data-yt]');
    if (yb) { e.stopPropagation(); const a = yb.dataset.yt; if (!a) ytPlay(); else if (a === 'stop') ytStop(); else ytCmd(awOk() ? AW.document : document, a === 'pause' ? 'pauseVideo' : 'playVideo'); return; }
    if (e.target.closest('.pr-slide .pr-yt.on, .pr-slide .pr-yt.remote')) return;
    if (W) { const wb = e.target.closest('[data-w]'); if (wb) { const f = W.ok, ok = wb.dataset.w === 'ok'; warnClose(); if (ok) f(); } else if (!e.target.closest('.pr-warn-c')) warnClose(); return; }
    if (e.target.closest('.pr-slide .pr-timer')) { tmToggle(); return; }
    { const tp = e.target.closest('.pr-slide .pr-tps-s'); if (tp) { tpsSet(+tp.dataset.tps); return; } }
    if (e.target.closest('.pr-more')) { blankMore(); return; }
    if (e.target.closest('.pr-vscroll')) return;
    if (foOn && e.target.closest('.lf-pan')) { if (e.target.closest('[data-lf="x"]')) foPanT(false); else fotoPanelAct(e, foPan(), state.sheet.id, FO.list, foRender, items => foShow(items)); return; }
    if (e.target.closest('.pr-slide .lf-slide')) return;
    { const fs = e.target.closest('[data-foshow]'); if (fs && foOn) { const f = FO.list.find(x => x.id === fs.dataset.foshow); if (f) { f._new = false; foBadge(); foShow([f]); } return; } }
    if (INK.eats(e)) return;
    if (TBo.click(e)) return;
    const b = e.target.closest('[data-p]'); if (!b) { if (e.target.closest('.pr-stage') && !e.target.closest('.pr-pop')) next(); return; }
    const k = b.dataset.p;
    if (k === 'next') next(); else if (k === 'prev') prev(); else if (k === 'close') close(); else if (k === 'tip') tip(); else if (k === 'eh') ehT();
    else if (k === 'ref') refOpen(); else if (k === 'black') blank(BL || 's'); else if (k === 'swap') { if (window.abDesktop && window.abDesktop.audSwap) window.abDesktop.audSwap().then(r => { if (r && r.ok) setTimeout(() => { scale(); awScale(); }, 200); else toast('Zum Tauschen braucht es zwei Bildschirme.'); }); } else if (k === 'board') boardT(b.dataset.kind || 'tafel'); else if (k === 'laser') laserT();
    else if (k === 'fotos') foPanT();
    else if (k === 'ytbig') ytBigSet(!ytBig);
    else if (k === 'ytauf') ytAufSet();
    else if (k === 'notime') ntToggle(); else if (k === 'timer') tmToggle(); else if (k === 'treset') tmReset(); else if (k === 'tmshow') { const ks = Object.keys(TM_SHOW); state.prefs.tmShow = ks[(ks.indexOf(tmMode()) + 1) % ks.length]; savePrefs(); b.textContent = TM_SHOW[tmMode()].label; tmShow(); } else if (k === 'tplus') tmAdj(1); else if (k === 'tminus') tmAdj(-1);
    else if (k === 'full') { try { if (document.fullscreenElement) document.exitFullscreen(); else if (ov.requestFullscreen) ov.requestFullscreen().catch(() => toast('Vollbild ist hier nicht möglich. Im Browser geht es mit F11.')); } catch { toast('Vollbild ist hier nicht möglich. Im Browser geht es mit F11.'); } }
  });
  document.addEventListener('keydown', key, true); window.addEventListener('resize', () => { scale(); sideKey = ''; refSide(); });
  if (opts.board) { ov.classList.add('pr-boarding'); boardFull(true); }
  stage.insertAdjacentHTML('beforeend', '<button type="button" class="pr-more" title="Tafel nach unten erweitern" aria-label="Mehr Platz unten"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span>Platz</span></button><div class="pr-vscroll" hidden role="scrollbar" aria-label="Tafel verschieben" aria-orientation="vertical"><i></i></div>');
  { const hs = $p('.pr-vscroll'); let dr = null;
    hs.addEventListener('pointerdown', e => { const b2 = bl(); if (!b2) return; e.preventDefault(); e.stopPropagation(); const r = hs.getBoundingClientRect(), H = b2.h || 900;
      if (e.target === hs) blankScroll((e.clientY - r.top) / r.height * H - 450);
      try { hs.setPointerCapture(e.pointerId); } catch {} dr = { y: e.clientY, sy: b2.sy || 0, k: H / r.height }; });
    hs.addEventListener('pointermove', e => { if (dr) blankScroll(dr.sy + (e.clientY - dr.y) * dr.k); });
    const end = () => { dr = null; }; hs.addEventListener('pointerup', end); hs.addEventListener('pointercancel', end); }
  if (pkOn) {
    stage.insertAdjacentHTML('beforeend', `<button type="button" class="pr-pklab" title="Spaltentitel ändern">Spalten: <b></b></button><div class="pr-pkdlg" hidden role="dialog" aria-label="Spaltentitel"><label>Links <input data-pk="0" maxlength="40"></label><label>Rechts <input data-pk="1" maxlength="40"></label><div class="pr-pkdlg-b"><button type="button" data-pk="ok" class="ok">Übernehmen</button><button type="button" data-pk="pc">Pro / Contra</button><button type="button" data-pk="auto">Aus der Frage</button></div><small></small></div>`);
    const lb = $p('.pr-pklab'), dl = $p('.pr-pkdlg'); const inp = [...dl.querySelectorAll('input')];
    const lbSync = () => { lb.querySelector('b').textContent = BOARD.pk.lab.join(' / '); };
    const apply2 = own => { BOARD.pk.own = own; pkLab(); lbSync(); dl.hidden = true; pkSave(); if (BOARD.open && BOARD.kind === 'pk') show(); ov.focus(); };
    lb.addEventListener('click', e => { e.stopPropagation(); dl.hidden = !dl.hidden; if (!dl.hidden) { inp.forEach((x, i) => { x.value = BOARD.pk.lab[i]; }); dl.querySelector('small').textContent = BOARD.pk.auto ? 'Aus der Frage erkannt: ' + BOARD.pk.auto.join(' / ') : 'In der Stundenfrage steht keine Entweder-oder-Frage.'; dl.querySelector('[data-pk="auto"]').disabled = !BOARD.pk.auto; inp[0].focus(); inp[0].select(); } });
    dl.addEventListener('click', e => { e.stopPropagation(); const b = e.target.closest('button[data-pk]'); if (!b) return; const k = b.dataset.pk;
      if (k === 'ok') { const v = inp.map(x => x.value.trim()); apply2(v[0] && v[1] ? v : null); } else if (k === 'pc') apply2(['Pro', 'Contra']); else if (k === 'auto') apply2(null); });
    dl.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); dl.querySelector('[data-pk="ok"]').click(); } else if (e.key === 'Escape') { e.preventDefault(); dl.hidden = true; ov.focus(); } });
    lbSync();
  }
  if (foOn) {
    ov.insertAdjacentHTML('beforeend', '<div class="lf-pan" hidden role="dialog" aria-label="Fotos dieser Stunde"><div class="lf-ph"><b>📷 Fotos dieser Stunde</b><button type="button" data-lf="x" aria-label="Schließen">×</button></div><div class="lf-body"></div></div>');
  }
  function foPan() { return $p('.lf-pan'); }
  // Zustand für das Companion-Gerät
  var LFC = LFC || { sid: Math.random().toString(36).slice(2, 10), t: 0, pt: 0 };
  function lfcState() { const pk = BOARD.pk; return { t: 'pres', v: LW_BUILD, sid: LFC.sid, sheet: state.sheet.id, title: plainText(state.sheet.meta.title || '') || 'Stunde', gp: !!pkOn, i: P.i, n: S.length, lab: S[P.i] ? tbStripLab(S[P.i]) : '', nx: S[P.i + 1] ? tbStripLab(S[P.i + 1]) : '', yt: slide && slide.querySelector('.pr-yt') && !BOARD.open ? (ytOn === P.i ? 'on' : 'ready') : '', ytbig: ytBig, ytauf: ytAuf, ythas: !!(slide && slide.querySelector('.pr-yt-auf')), tm: !!TBo.isOn(), cur: P.cur, max: P.max, up: +state.sheet.updatedAt || 0, board: BOARD.open ? BOARD.kind : '', bl: BL, tafel: { h: BOARD.s.h || 900, sy: BOARD.s.sy || 0, pat: BOARD.s.pat || 'kariert' }, pk: pkOn ? { q: pk.q, lab: pk.lab, either: !!pk.either, h: pk.h || 900, sy: pk.sy || 0 } : null }; }
  function lfcHb() { if (!foOn || !LFC) return; clearTimeout(LFC.t); LFC.t = setTimeout(() => { if (document.body.contains(ov)) { fotoSend(lfcState()); lfcTfl(); } }, 120); }
  function lfcFull(key) { if (!foOn) return; if (key === 'sl') { const sl0 = S[P.i]; if (sl0) fotoSend({ t: 'bfull', key, i: P.i, ink: INK.remote.keyed(inkKey(sl0)) }); return; } fotoSend({ t: 'bfull', key, ink: INK.remote.keyed(key === 'pk' ? 'pk' : BOARD.s.id) }); }
  function lfcTfl(force) { if (!foOn || !LFC || !LFC.peer || Date.now() - LFC.peer > 600000) return; const now = Date.now(); if (!force && now - (LFC.tt || 0) < 1500) { clearTimeout(LFC.tq); LFC.tq = setTimeout(() => lfcTfl(), 1500 - (now - (LFC.tt || 0)) + 20); return; }
    LFC.tt = now; const sn = TBo.snap(); const key = sn ? sn.cls + sn.bg + sn.html : ''; if (key === LFC.tk && !force) return; LFC.tk = key; fotoSend(sn ? { t: 'tfl', ...sn } : { t: 'tfl', off: 1 }); }
  function lfcPushSoon() { if (!foOn || !LFC || (BOARD.open && BOARD.kind === 'foto')) return; const k = BOARD.open ? BOARD.kind : 'sl'; clearTimeout(LFC.pt); LFC.pt = setTimeout(() => lfcFull(k), 300); }
  function foBadge() { const n = FO.list.filter(f => f._new).length; ov.querySelectorAll('.pr-fobadge').forEach(i => { i.hidden = !n; i.textContent = n; }); ov.querySelectorAll('.pr-fobtn').forEach(b => b.classList.toggle('has-new', !!n)); sideKey = ''; refSide(); }
  function foRender() { const p = foPan(); if (!p || p.hidden) return; const bd = p.querySelector('.lf-body'); bd.innerHTML = fotoPanelHTML(state.sheet.id, FO.list, 'pres'); fotoThumbs(bd); }
  async function foLoad() { try { const L = await fotoList(state.sheet.id); const old = new Map(FO.list.map(f => [f.id, f])); FO.list = L.map(f => ({ ...f, _new: old.has(f.id) ? !!old.get(f.id)._new : FO.loaded })); FO.loaded = true; } catch (err) { console.error(err); } foBadge(); foRender(); }
  function foPanT(on) { const p = foPan(); if (!p) return; on = on === undefined ? p.hidden : on; p.hidden = !on; ov.querySelectorAll('[data-p="fotos"]').forEach(b => b.setAttribute('aria-expanded', String(on))); if (on) { foRender(); setTimeout(() => { FO.list.forEach(f => { f._new = false; }); foBadge(); }, 2500); } else ov.focus(); }
  async function foShow(items, v) { items = (items || []).filter(Boolean).slice(0, 6); if (!items.length) return; await Promise.all(items.map(async f => { try { f.u = await fotoUrl(f.path); } catch { f.u = ''; } })); Object.assign(BOARD.foto, { items, view: v || { s: 1, cx: .5, cy: .5 }, live: null, las: null }); if (foPan()) foPan().hidden = true; boardSet(true, 'foto'); }
  const foSingle = id => (BOARD.open && BOARD.kind === 'foto' && BOARD.foto.items.length === 1 && BOARD.foto.items[0].id === id ? BOARD.foto.items[0] : null);
  // Live vom Gerät: nur den Fotobereich neu zeichnen, damit nichts flackert
  const foUpd = () => { const h = fotoSlideHTML(BOARD.foto); const tmp = document.createElement('div'); tmp.innerHTML = h; const nw = tmp.querySelector('.lf-sw'); if (!nw) return;
    [slide, awOk() ? AW.document.querySelector('.pr-slide') : null].forEach(r => { const w = r && r.querySelector('.lf-sw'); if (!w) return; w.style.transform = nw.style.transform; const a = w.querySelector('.lf-ink'), b = nw.querySelector('.lf-ink'); if (a && b) a.replaceWith(b.cloneNode(true)); const l1 = w.querySelector('.lf-las'), l2 = nw.querySelector('.lf-las'); if (l1) l1.remove(); if (l2) w.appendChild(l2.cloneNode(true)); }); };
  if (foOn) {
    foLoad();
    const off = fotoListen(m => {
      if (!document.body.contains(ov)) return; const sid = state.sheet && state.sheet.id;
      if (m.t === 'new' && m.sheet === sid) foLoad().then(() => toast('Neues Foto vom Zweitgerät – erst einmal nur hier.', 'Zeigen', () => { const f = FO.list.find(x => x.id === m.id); if (f) foShow([f]); }));
      else if (m.t === 'show' && m.sheet === sid) (async () => { let f = FO.list.find(x => x.id === m.id); if (!f) { await foLoad(); f = FO.list.find(x => x.id === m.id); } if (f) { if (Array.isArray(m.ink)) f.ink = m.ink; f._new = false; foBadge(); foShow([f], m.v); } })();
      else if (m.t === 'view') { if (foSingle(m.id) && m.v) { BOARD.foto.view = m.v; foUpd(); } }
      else if (m.t === 'stk') { const g = foSingle(m.id); if (g && m.s && Array.isArray(m.s.p) && !(g.ink || []).some(x => x.k && x.k === m.s.k)) { BOARD.foto.live = m.s; foUpd(); } }
      else if (m.t === 'ink') { const f = FO.list.find(x => x.id === m.id); if (f && Array.isArray(m.ink)) f.ink = m.ink; const g = foSingle(m.id); if (g && Array.isArray(m.ink)) { g.ink = m.ink; BOARD.foto.live = null; foUpd(); } }
      else if (m.t === 'las') { if (foSingle(m.id)) { BOARD.foto.las = m.off ? null : [+m.x || 0, +m.y || 0]; foUpd(); } }
      else if (m.t === 'hide') { if (BOARD.open && BOARD.kind === 'foto') boardSet(false); }
      else if (m.t === 'upd') { const set = x => { if (x && x.id === m.id && x !== m) Object.assign(x, { path: m.path, w: m.w, h: m.h, ink: Array.isArray(m.ink) ? m.ink : x.ink }); }; FO.list.forEach(set); const bi = BOARD.foto.items.find(x => x.id === m.id); set(bi);
        if (bi && BOARD.open && BOARD.kind === 'foto') fotoUrl(bi.path).then(u => { bi.u = u; BOARD.foto.live = null; if (BOARD.open && BOARD.kind === 'foto') show(); }).catch(() => {}); foRender(); sideKey = ''; refSide(); }
    });
    ov.addEventListener('lw-close', () => off(), { once: true });
    // Companion (iPad/Handy mit demselben Konto): Lebenszeichen der Präsentation, Tafel-Striche, Fernbedienung
    const offL = fotoListen(m => {
      if (!document.body.contains(ov)) return;
      if (['hi', 'ping', 'board', 'bop', 'blas', 'bsy', 'bmore', 'bpat', 'nav'].includes(m.t)) { LFC.peer = Date.now(); if (m.d) (LFC.devs = LFC.devs || {})[m.d] = Date.now(); }
      const slk = m.key === 'sl'; const key = m.key === 'pk' && pkOn ? 'pk' : 'tafel', bk = key === 'pk' ? BOARD.pk : BOARD.s, ik = slk ? inkKey(S[P.i]) : key === 'pk' ? 'pk' : BOARD.s.id, cur = BOARD.open && BOARD.kind === key;
      if (slk && (m.t === 'bsy' || m.t === 'bmore')) return;
      if (m.t === 'hi') { fotoSend(lfcState()); lfcFull('tafel'); lfcFull('sl'); if (pkOn) lfcFull('pk'); LFC.tk = ''; lfcTfl(true); }
      else if (m.t === 'board') { if (m.kind === 'pk' && !pkOn) return; const k2 = m.kind === 'pk' ? 'pk' : 'tafel'; if (m.on && !(BOARD.open && BOARD.kind === k2)) boardSet(true, k2); else if (!m.on && BOARD.open && BOARD.kind === k2) boardSet(false); else lfcHb(); }
      else if (m.t === 'bop') { INK.remote.op(ik, m); if (!slk && key === 'pk' && m.op !== 'live') pkSave(); }
      else if (m.t === 'blas') INK.remote.laser(ik, +m.x || 0, +m.y || 0);
      else if (m.t === 'bsy') { const y = Math.round(Math.max(0, Math.min((bk.h || 900) - 900, +m.sy || 0))); if (cur) blankScroll(y); else { bk.sy = y; lfcHb(); } }
      else if (m.t === 'bmore') { if (cur) blankMore(); else { bk.h = (bk.h || 900) + 900; if (key === 'pk') pkSave(); lfcHb(); } }
      else if (m.t === 'tfc' || m.t === 'tfv' || m.t === 'tfd') { LFC.peer = Date.now(); if (TBo.remote(m)) setTimeout(() => lfcTfl(true), 60); }
      else if (m.t === 'bpat') { if (inkPatOk(m.pat)) { BOARD.s.pat = m.pat; if (BOARD.open && BOARD.kind === 'tafel') show(); else lfcHb(); } }
      else if (m.t === 'nav') { if (m.a === 'slide') { if (BOARD.open) boardSet(false); if (BL) blank(BL); show(); lfcHb(); return; } if (m.a === 'goto') { const j = Math.max(0, Math.min(S.length - 1, +m.i || 0)); if (BOARD.open) boardSet(false); P.i = j; show(); lfcHb(); } else if (m.a === 'next') next(); else if (m.a === 'prev') prev(); else if (m.a === 'black') blank(BL || 's'); else if (m.a === 'ytplay') { if (ytOn !== P.i) ytPlay(); else ytCmd(awOk() ? AW.document : document, 'playVideo'); } else if (m.a === 'ytpause') ytCmd(awOk() ? AW.document : document, 'pauseVideo'); else if (m.a === 'ytstop') { if (ytOn === P.i) ytStop(); } else if (m.a === 'ytbig') { if (ytOn === P.i) ytBigSet(!ytBig); } else if (m.a === 'ytauf') { if (ytOn === P.i) ytAufSet(); } else if (m.a === 'mode') { const mb = $p('[data-p="mode"]'); if (mb) mb.click(); setTimeout(() => { lfcHb(); lfcTfl(true); }, 60); } }
    });
    const fbB = () => { let x = ov.querySelector('.pr-fbst'); if (FB.on && !x) { ov.insertAdjacentHTML('beforeend', '<span class="pr-fbst" title="Dieses Netz sperrt den Live-Kanal. iPad und Laptop tauschen sich über normale Web-Anfragen aus – mit etwas Verzögerung.">Ersatzverbindung</span>'); } else if (!FB.on && x) x.remove(); };
    const fbH = () => fbB(); FB.h.add(fbH); fbB();
    const hbI = setInterval(() => { fotoSend(lfcState()); fbB(); }, 4000);
    ov.addEventListener('lw-close', () => { offL(); clearInterval(hbI); FB.h.delete(fbH); fotoSend({ t: 'presend', sid: LFC.sid }); }, { once: true });
    // Mausrad zoomt ein einzelnes Foto auch hier
    stage.addEventListener('wheel', e => { if (!(BOARD.open && BOARD.kind === 'foto' && BOARD.foto.items.length === 1)) return; e.preventDefault(); const v = BOARD.foto.view; BOARD.foto.view = { cx: v.cx, cy: v.cy, s: Math.max(1, Math.min(8, (v.s || 1) * (e.deltaY < 0 ? 1.15 : 1 / 1.15))) }; foUpd(); }, { passive: false });
  }
  if (!opts.board) stage.insertAdjacentHTML('beforeend', `<div class="pr-fbtns">${foOn ? '<button type="button" class="pr-tafelbtn pr-fobtn" data-p="fotos" data-label="Fotos" aria-expanded="false" title="Fotos vom iPad oder Handy: QR-Code, neue Fotos, Sicherungsfolie (F)"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.7l1.6-2.2h6.4L16.8 7h2.7A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/><circle cx="12" cy="13" r="3.6"/></svg><span>Fotos</span><i class="pr-fobadge" hidden></i></button>' : ''}<button type="button" class="pr-tafelbtn" data-p="board" data-kind="tafel" data-label="Tafel" aria-pressed="false" title="Leere Tafel öffnen und wieder schließen (B)">${TAFEL_IC}<span>Tafel</span></button>${pkOn ? `<button type="button" class="pr-tafelbtn pr-pkbtn" data-p="board" data-kind="pk" data-label="Pro / Contra" aria-pressed="false" title="Pro-und-Contra-Tafel zur Stundenfrage: wird mit der Stunde gespeichert (K)"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="2.5" y="3.5" width="19" height="17" rx="1.5"/><path d="M12 8v12.5M2.5 8h19M6 13.5h3M7.5 12v3M15 13.5h3"/></svg><span>Pro / Contra</span></button>` : ''}</div>`);
  scale(); show(); ov.focus();
  const D = window.abDesktop;
  if (D && D.displays && !opts.board) {
    D.displays().then(r => { if (r && r.n > 1 && !awOk() && document.body.contains(ov)) { refOpen(); toast('Zweiter Bildschirm erkannt: Folien auf dem Beamer, Referentenansicht hier.'); } }).catch(() => {});
    const off = D.onDisplays && D.onDisplays(n => {
      if (!document.body.contains(ov)) { off && off(); return; }
      if (n < 2 && AW && !AW.closed) { refClose(); if (D.fullscreen) D.fullscreen(true); toast('Beamer getrennt – die Präsentation läuft hier weiter.'); }
      else if (n > 1 && !(AW && !AW.closed)) { refOpen(); toast('Beamer erkannt: Folien laufen jetzt dort.'); }
    });
    ov.addEventListener('lw-close', () => { off && off(); }, { once: true });
  }
}

/* PowerPoint: dieselben Folien als bearbeitbare Textfelder und Tabellen (PptxGenJS); Erwartung und Tipps stehen in den Notizen */
function htmlRuns(html, base = {}, hl = {}) {
  const body = new DOMParser().parseFromString('<body>' + html + '</body>', 'text/html').body; const out = [];
  const brk = () => { if (out.length) out[out.length - 1].options.breakLine = true; };
  const walk = (n, st) => n.childNodes.forEach(c => {
    if (c.nodeType === 3) { const t = c.nodeValue.replace(/[^\S\u00a0]+/g, ' '); if (t.trim() || (t && out.length && !out[out.length - 1].options.breakLine)) out.push({ text: t, options: { ...base, ...(st.b ? { bold: true, ...(hl.b ? { color: hl.b } : {}) } : {}), ...(st.i ? { italic: true } : {}), ...(st.u ? { underline: { style: 'sng' } } : {}), ...(st.r && hl.ref ? { bold: true, color: hl.ref } : {}) } }); return; }
    if (c.nodeType !== 1) return; const tg = c.tagName;
    if (tg === 'BR') { brk(); return; } if (tg === 'SUP' || tg === 'SCRIPT' || tg === 'STYLE') return;
    walk(c, { b: st.b || tg === 'B' || tg === 'STRONG', i: st.i || tg === 'I' || tg === 'EM', u: st.u || tg === 'U', r: st.r || (c.classList && c.classList.contains('pr-ref')) });
    if (/^(P|DIV|LI|H\d)$/.test(tg)) brk();
  });
  walk(body, {});
  if (out.length) { delete out[out.length - 1].options.breakLine; out[0].text = out[0].text.replace(/^\s+/, ''); }
  return out.length ? out : [{ text: ' ', options: base }];
}
const imgSize = src => new Promise(res => { const im = new Image(); im.onload = () => res([im.naturalWidth || 4, im.naturalHeight || 3]); im.onerror = () => res([4, 3]); im.src = src; });
async function tfImage(b) {
  await loadScript(LIBS.h2c);
  const bb = tfTpl(b) === 'cluster' && !tfStr(b.center).trim() ? b : { ...b, title: '' };
  const box = el(`<div class="tf-cap" style="position:fixed;left:-20000px;top:0;width:1300px;padding:24px;background:#fff">${tafelHTML(bb, { gaps: false })}</div>`);
  setAccent(box, state.sheet.meta); document.body.appendChild(box);
  try {
    box.querySelector('.tf').style.fontSize = '26px'; if (document.fonts && document.fonts.ready) await document.fonts.ready; tfDraw(box);
    const c = await window.html2canvas(box, { scale: 2, backgroundColor: '#ffffff', logging: false });
    return { data: c.toDataURL('image/png'), w: c.width, h: c.height };
  } finally { box.remove(); }
}
// PowerPoint-Timer ohne Makros: Animationen (Microsoft-Methode „Bildschirm-Timer“). Der Balken trägt Modus und Minuten im Namen.
// Platzhalter mit eigener Lage: PptxGenJS übernimmt immer die Lage aus der Masterfolie; „abwPos|x|y|w|h“ im Namen setzt sie hier (Zoll)
function pptxPos(xml) {
  return xml.replace(/<p:sp>(?:(?!<\/p:sp>)[\s\S])*?name="abwPos\|([\d.]+)\|([\d.]+)\|([\d.]+)\|([\d.]+)"[\s\S]*?<\/p:sp>/g, (sp, x, y, w, h) => {
    const E = v => Math.round(parseFloat(v) * 914400);
    return sp.replace(/name="abwPos[^"]*"/, 'name="Platzhalter"').replace(/<a:off x="\d+" y="\d+"\/>/, `<a:off x="${E(x)}" y="${E(y)}"/>`).replace(/<a:ext cx="\d+" cy="\d+"\/>/, `<a:ext cx="${E(w)}" cy="${E(h)}"/>`);
  });
}
function pptxTiming(xml) {
  const bar = /<p:cNvPr id="(\d+)" name="abwTimerBar-(klick|auto)-(\d+)"/.exec(xml); if (!bar || /<p:timing>/.test(xml)) return xml;
  const barId = bar[1], auto = bar[2] === 'auto', N = +bar[3], ms = N * 60000; const ids = {};
  xml.replace(/<p:cNvPr id="(\d+)" name="abwTimerM(\d+)"/g, (a, id, k) => { ids[k] = id; return a; });
  let n = 4; const nid = () => ++n;
  const hide = (spid, delay) => `<p:set><p:cBhvr><p:cTn id="${nid()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="${delay}"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="hidden"/></p:to></p:set>`;
  const e1 = nid(), e1a = nid();
  let eff = `<p:par><p:cTn id="${e1}" presetID="22" presetClass="exit" presetSubtype="2" fill="hold" grpId="0" nodeType="${auto ? 'withEffect' : 'clickEffect'}"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:animEffect transition="out" filter="wipe(left)"><p:cBhvr><p:cTn id="${e1a}" dur="${ms}"/><p:tgtEl><p:spTgt spid="${barId}"/></p:tgtEl></p:cBhvr></p:animEffect>${hide(barId, ms - 1)}</p:childTnLst></p:cTn></p:par>`;
  for (let k = N; k >= 1; k--) { if (!ids[k]) continue; const a = nid(); eff += `<p:par><p:cTn id="${a}" presetID="1" presetClass="exit" presetSubtype="0" fill="hold" grpId="0" nodeType="withEffect"><p:stCondLst><p:cond delay="${(N - k + 1) * 60000}"/></p:stCondLst><p:childTnLst>${hide(ids[k], 0)}</p:childTnLst></p:cTn></p:par>`; }
  const start = auto ? '<p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond>' : '<p:cond delay="indefinite"/>';
  const bld = [barId, ...Object.values(ids)].map(i => `<p:bldP spid="${i}" grpId="0" animBg="1"/>`).join('');
  const timing = `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst><p:par><p:cTn id="3" fill="hold"><p:stCondLst>${start}</p:stCondLst><p:childTnLst><p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${eff}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq></p:childTnLst></p:cTn></p:par></p:tnLst><p:bldLst>${bld}</p:bldLst></p:timing>`;
  return /<\/p:clrMapOvr>/.test(xml) ? xml.replace('</p:clrMapOvr>', '</p:clrMapOvr>' + timing) : xml.replace('</p:cSld>', '</p:cSld>' + timing);
}
async function exportPPTX() {
  if (busy) return; busy = true; overlay('PowerPoint wird erstellt …');
  try {
    const S = presSlides(); if (!S.length) { overlay(''); toast('Es ist keine Folie ausgewählt.'); return; }
    await loadScript(LIBS.pptx); if (!window.PptxGenJS) throw new Error('PptxGenJS fehlt'); const m = state.sheet.meta; const A = pageAcc(m);
    const hex = (x, d) => (/^#[0-9a-f]{6}$/i.test(x || '') ? x.slice(1).toUpperCase() : d);
    const ACC = hex(A.c, '1F4FA0'), TINT = hex(A.t, 'E9EEF8'), INK = '1C1F27', GREY = '5A606E', LIGHT = '8A909C', F = 'Calibri', FT = 'Georgia';
    const pptx = new window.PptxGenJS(); pptx.layout = 'LAYOUT_WIDE';
    pptx.title = plainText(state.sheet.abs ? stTitle(state.sheet) : m.title || 'Arbeitsblatt'); pptx.subject = plainText(m.topic || ''); pptx.company = m.school || ''; pptx.author = m.course || '';
    // Maße wie die Folie im Browser (1600 × 900 Pixel = 13,33 × 7,5 Zoll)
    const W = 13.333, X = 0.87, RM = 0.7, CW = W - X - RM, Y0 = 1.62; const bar = S.bar || []; const PS = phSize(m); const BOT = bar.length ? 7.12 - PS.ih - 0.25 : 6.9; const BH = BOT - Y0;
    const multi = !!state.sheet.abs; const foot = multi ? stTitle(state.sheet) : [m.nr ? 'AB ' + m.nr : '', plainText(m.title || '')].filter(Boolean).join(' · ');
    const footer = { text: { text: foot, options: { x: X, y: 7.12, w: 9, h: 0.26, fontFace: F, fontSize: 9, color: LIGHT, margin: 0, valign: 'middle' } } };
    const num = { x: W - RM - 0.6, y: 7.12, w: 0.6, h: 0.26, fontFace: F, fontSize: 9, color: LIGHT, align: 'right' };
    // Masterfolien im Design des Blatts: Titel, Abschnitt, Inhalt, Zwei Inhalte, Nur Titel, Leer. Titel und Text stehen in Platzhaltern,
    // so passen neue Folien in PowerPoint (Start → Neue Folie) zum Rest; Schriften kommen aus dem Design (Theme).
    pptx.theme = { headFontFace: F, bodyFontFace: F };
    const bar0 = { rect: { x: 0, y: 0, w: 0.13, h: 7.5, fill: { color: ACC } } }, barT = { rect: { x: 0, y: 0, w: 0.33, h: 7.5, fill: { color: ACC } } };
    const hdLine = { line: { x: X, y: 1.4, w: CW, h: 0, line: { color: TINT, width: 2.5 } } };
    const PH = { title: { fontFace: F, fontSize: 29, bold: true, color: INK, valign: 'middle', margin: 0 }, body: { fontFace: F, fontSize: 24, color: INK, valign: 'top', margin: 0 } };
    // Achtung: PptxGenJS verändert die Platzhalter-Objekte, daher für jede Masterfolie neu anlegen
    const phT = () => ({ placeholder: { options: { name: 'title', type: 'title', align: 'left', x: X, y: 0.74, w: CW, h: 0.56, ...PH.title }, text: 'Titel hinzufügen' } });
    const phB = (name, x, w) => ({ placeholder: { options: { name, type: 'body', align: 'left', x, y: Y0, w, h: BH, ...PH.body }, text: 'Text hinzufügen' } });
    const half = (CW - 0.5) / 2;
    pptx.defineSlideMaster({ title: 'AB Inhalt', background: { color: 'FFFFFF' }, objects: [bar0, hdLine, footer, phT(), phB('body', X, CW)], slideNumber: num });
    pptx.defineSlideMaster({ title: 'AB Zwei Inhalte', background: { color: 'FFFFFF' }, objects: [bar0, hdLine, footer, phT(), phB('links', X, half), phB('rechts', X + half + 0.5, half)], slideNumber: num });
    pptx.defineSlideMaster({ title: 'AB Nur Titel', background: { color: 'FFFFFF' }, objects: [bar0, hdLine, footer, phT()], slideNumber: num });
    pptx.defineSlideMaster({ title: 'AB Leer', background: { color: 'FFFFFF' }, objects: [bar0, footer], slideNumber: num });
    pptx.defineSlideMaster({ title: 'AB Titel', background: { color: TINT }, objects: [barT, footer, { placeholder: { options: { name: 'title', type: 'title', align: 'left', x: 1.0, y: 1.8, w: W - 1.0 - RM, h: 1.5, fontFace: F, fontSize: 44, bold: true, color: INK, valign: 'middle', margin: 0 }, text: 'Titel hinzufügen' } }, { placeholder: { options: { name: 'body', type: 'body', align: 'left', x: 1.0, y: 3.35, w: W - 1.0 - RM, h: 0.8, fontFace: F, fontSize: 24, color: GREY, valign: 'top', margin: 0 }, text: 'Untertitel hinzufügen' } }], slideNumber: num });
    pptx.defineSlideMaster({ title: 'AB Abschnitt', background: { color: TINT }, objects: [barT, footer, { placeholder: { options: { name: 'title', type: 'title', align: 'left', x: 1.0, y: 3.1, w: W - 1.0 - RM, h: 1.2, fontFace: F, fontSize: 40, bold: true, color: INK, valign: 'top', margin: 0 }, text: 'Abschnitt' } }, { placeholder: { options: { name: 'body', type: 'body', align: 'left', x: 1.0, y: 4.3, w: W - 1.0 - RM, h: 0.7, fontFace: F, fontSize: 22, color: GREY, valign: 'top', margin: 0 }, text: 'Thema' } }], slideNumber: num });
    const phPos = (sl, x, y, w, h) => { const o = sl._slideObjects[sl._slideObjects.length - 1]; if (o && o.options) o.options.objectName = `abwPos|${(+x).toFixed(3)}|${(+y).toFixed(3)}|${(+w).toFixed(3)}|${(+h).toFixed(3)}`; };
    const hasHead = s => !(s.k === 'quote' || (s.k === 'step' && (s.fol === 'zitat' || (s.fol === 'bild' && !s.b.cap))) || (s.k === 'image' && !s.b.caption));
    // Phasenleiste: Phasen der Stunde, die aktuelle farbig
    const barAdd = (sl, cur, light) => {
      if (!bar.length) return; const n = bar.length, ov = 0.12, h = PS.ih, y = 7.12 - h; const w = (CW + (n - 1) * ov) / n;
      // Schriftgröße wie eingestellt, aber so, dass die längste Bezeichnung in ein Feld passt
      const lmax = Math.max(...bar.map(k => PHASEN[k].label.length)); let fs = n > 8 ? Math.round(PS.pt * 0.77) : PS.pt;
      while (fs > 8 && lmax * fs * 0.55 / 72 > w - 0.42) fs--;
      bar.forEach((k, i) => { const on = !!(cur && cur.includes(i)), c = PHASEN[k].c.slice(1).toUpperCase(); sl.addText(PHASEN[k].label, { shape: i ? 'chevron' : 'homePlate', x: X + i * (w - ov), y, w, h, fill: { color: on ? c : light ? 'FFFFFF' : 'EDEFF3' }, fontFace: F, fontSize: fs, bold: true, color: on ? 'FFFFFF' : '6B7280', align: 'center', valign: 'middle', margin: 0, fit: 'shrink' }); });
    };
    const pills = (sl, chips) => {
      let x = W - RM;
      [...chips].reverse().forEach(c => {
        // Timer groß: 22 pt statt 13 pt, unten bündig mit den übrigen Pillen
        const big = !!c.timer; const TS = TM_SIZES[tmSize()]; const ph = big ? TS.h : 0.38;
        const pill = (t, o = {}) => ({ shape: 'roundRect', rectRadius: ph / 2, x, y: 1.24 - ph, w, h: ph, fill: { color: c.fill || TINT }, fontFace: F, fontSize: big ? TS.pt : 13, bold: true, color: c.color || ACC, align: 'center', valign: 'middle', margin: 0, ...o });
        const w = big ? ('noch ' + c.timer + ' Min.').length * 0.0079 * TS.pt + 0.5 : c.t.length * 0.105 + 0.46; x -= w;
        if (c.timer) {
          // Stapel: unten „Zeit um“, darüber noch 1 … n Min.; jede Minute verschwindet die oberste Angabe (Animation, siehe pptxTiming)
          sl.addText('Zeit um', pill('Zeit um', { fill: { color: 'B3261E' }, color: 'FFFFFF', objectName: 'abwTimerEnd' }));
          for (let k = 1; k <= c.timer; k++) sl.addText(`noch ${k} Min.`, pill('', { objectName: 'abwTimerM' + k }));
          sl.addShape('rect', { x: 0.13, y: 0, w: W - 0.13, h: 0.085, fill: { color: TINT }, line: { color: TINT, width: 0 } });
          sl.addShape('rect', { x: 0.13, y: 0, w: W - 0.13, h: 0.085, fill: { color: ACC }, line: { color: ACC, width: 0 }, objectName: `abwTimerBar-${c.mode === 'auto' ? 'auto' : 'klick'}-${c.timer}` });
        } else sl.addText(c.t, pill(c.t));
        x -= 0.12;
      });
      return W - RM - x;
    };
    const head = (sl, kick, title, chips = []) => {
      if (!title) { title = kick; kick = ''; }
      const cw = chips.length ? pills(sl, chips) + 0.2 : 0;
      if (kick) sl.addText(String(kick).toUpperCase(), { x: X, y: 0.42, w: CW - cw, h: 0.3, fontFace: F, fontSize: 13, bold: true, color: ACC, charSpacing: 1.5, valign: 'bottom', margin: 0 });
      if (title) sl.addText(String(title), { placeholder: 'title', align: 'left', x: X, y: 0.74, w: CW - cw, h: 0.56, ...PH.title, fit: 'shrink' }); if (cw) phPos(sl, X, 0.74, CW - cw, 0.56);
    };
    const chipsOf = (it, ph, mn, mode) => [it && SOZ[it.soz] ? { t: SOZ[it.soz].label } : null, ...arbOf(it).map(k => ({ t: ARB[k].label })), ph && !bar.length ? { t: PHASEN[ph].label, fill: PHASEN[ph].c.slice(1).toUpperCase(), color: 'FFFFFF' } : null, mn ? { t: mn + ' Min.', ...(mode && mn <= 180 ? { timer: mn, mode } : {}) } : null].filter(Boolean);
    // Arbeitsauftrag wie auf dem Arbeitsblatt (keine Aufteilung in Sätze), Operator und Anrede fett in der Akzentfarbe, Material- und Zeilenangaben hervorgehoben
    const HL = { b: ACC, ref: ACC };
    const stepPlain = it => prLinesRaw(it, m).map(x => plainText(x).length);
    const needH = (paras, w, fs) => { const cpl = Math.max(6, w * 72 / (fs * 0.48)); const lines = paras.reduce((a, p) => a + Math.max(1, Math.ceil(p / cpl)), 0); return lines * fs * 1.27 / 72 + (paras.length - 1) * fs * 0.45 / 72 + 0.08; };
    const fitFs = (paras, w, h, list) => list.find(fs => needH(paras, w, fs) <= h) || list[list.length - 1];
    const stepRuns = (its, fs) => {
      const out = [];
      its.forEach((it, ii) => { const st = prLinesOf(it, m); const many = false; st.forEach((x, i) => {
        const r = htmlRuns(x, {}, HL); r.forEach((z, zi) => { if (many && !zi) z.options.bullet = { code: '25A0', indent: Math.round(fs * 1.05) }; z.options.paraSpaceAfter = Math.round(fs * 0.45); });
        out.push(...r); if (i < st.length - 1 || ii < its.length - 1) out[out.length - 1].options.breakLine = true;
      }); });
      return out.length ? out : [{ text: ' ', options: {} }];
    };
    const notesOf = list => list.map(([g, it]) => { const eh = ehLines(it), tips = tipsOf(it), rl = rlpOf(it); const pre = g ? ` (${g})` : '';
      return [eh.length ? `Erwartung${pre}:\n` + eh.map(x => '– ' + plainText(x)).join('\n') : '', tips.length ? `Gestufte Hilfen${pre}:\n` + tips.map((x, j) => `${j + 1}. ${plainText(x)}`).join('\n') : '', rl.length ? `Standards${pre}: ` + rl.map(id => { const x = rlpInfo(id); return x.own ? x.t : x.code; }).join(', ') : ''].filter(Boolean).join('\n\n'); }).filter(Boolean);
    const imgIn = async (sl, data, path, bx, by, bw, bh) => { const [iw, ih] = await imgSize(data || path); const k = Math.min(bw / iw, bh / ih); const w = iw * k, h = ih * k; sl.addImage({ ...(data ? { data } : { path }), x: bx + (bw - w) / 2, y: by + (bh - h) / 2, w, h }); };
    for (const s of S) {
      const big = s.k === 'title' || s.k === 'abhead'; const sl = pptx.addSlide({ masterName: s.k === 'abhead' ? 'AB Abschnitt' : big ? 'AB Titel' : hasHead(s) ? 'AB Nur Titel' : 'AB Leer' }); const TX = 1.0, TW2 = W - TX - RM;
      if (s.k === 'abhead') {
        sl.addText(s.lab, { shape: 'roundRect', rectRadius: 0.08, x: TX, y: 2.1, w: Math.max(1.6, s.lab.length * 0.2 + 0.6), h: 0.8, fontFace: F, fontSize: 28, bold: true, color: 'FFFFFF', fill: { color: ACC }, align: 'center', valign: 'middle', margin: 0 });
        sl.addText(plainText(s.title || ''), { placeholder: 'title', align: 'left', x: TX, y: 3.1, w: TW2, h: 1.2, fontFace: F, fontSize: 40, bold: true, color: INK, valign: 'top', margin: 0, fit: 'shrink' });
        sl.addText(s.topic ? plainText(deQuoteStr(s.topic)) : ' ', { placeholder: 'body', align: 'left', x: TX, y: 4.3, w: TW2, h: 0.7, fontFace: F, fontSize: 22, color: GREY, margin: 0 });
      } else if (s.k === 'title' && multi) {
        sl.addText(stTitle(state.sheet), { placeholder: 'title', align: 'left', x: TX, y: 1.7, w: TW2, h: 1.4, fontFace: F, fontSize: 44, bold: true, color: INK, valign: 'middle', margin: 0, fit: 'shrink' });
        sl.addText(stABs().map((x, i, a) => ({ text: abLabel(x.meta, x.k) + ': ' + plainText(x.meta.title || ''), options: { breakLine: i < a.length - 1 } })), { placeholder: 'body', align: 'left', x: TX, y: 3.25, w: TW2, h: 1.8, fontFace: F, fontSize: 22, color: GREY, valign: 'top', margin: 0 });
        const c = [m.course, m.school].filter(Boolean).join(' · '); if (c) sl.addText(c, { x: TX, y: 5.35, w: TW2, h: 0.5, fontFace: F, fontSize: 16, color: LIGHT, margin: 0 });
      } else if (s.k === 'title') {
        let x = TX; if (m.nr) { sl.addText([{ text: 'AB', options: { fontSize: 13, breakLine: true } }, { text: String(m.nr), options: { fontSize: 34, bold: true } }], { shape: 'roundRect', rectRadius: 0.1, x, y: 1.95, w: 1.2, h: 1.2, fontFace: F, color: 'FFFFFF', fill: { color: ACC }, align: 'center', valign: 'middle', margin: 0 }); x += 1.55; }
        sl.addText(plainText(m.title || 'Arbeitsblatt'), { placeholder: 'title', align: 'left', x, y: 1.8, w: W - RM - x, h: 1.5, fontFace: F, fontSize: 44, bold: true, color: INK, valign: 'middle', margin: 0, fit: 'shrink' }); phPos(sl, x, 1.8, W - RM - x, 1.5);
        sl.addText(m.topic ? plainText(deQuoteStr(m.topic)) : ' ', { placeholder: 'body', align: 'left', x, y: 3.35, w: W - RM - x, h: 0.8, fontFace: F, fontSize: 24, color: GREY, valign: 'top', margin: 0 }); phPos(sl, x, 3.35, W - RM - x, 0.8);
        const c = [m.course, m.school].filter(Boolean).join(' · '); if (c) sl.addText(c, { x, y: 5.35, w: W - RM - x, h: 0.5, fontFace: F, fontSize: 16, color: LIGHT, margin: 0 });
      } else if (s.k === 'mat') {
        head(sl, s.tag, plainText(matTitle(s.b) || '') + (s.of > 1 ? `  (${s.part}/${s.of})` : ''));
        const src = s.part === s.of && s.b.source; const bh = BH - (src ? 0.4 : 0);
        const L = []; s.lines.forEach((l, i) => { if (i && (l.st || (l.h && !s.lines[i - 1].h))) L.push({ num: '', t: '' }); L.push(l); });
        const n = L.length, maxC = Math.max(12, ...L.map(l => l.t.length));
        const fs = Math.max(11, Math.min(26, Math.floor(Math.min((bh - 0.2) * 72 / (n * 1.42), (CW - 0.95) * 72 / (maxC * 0.57)))));
        const ls = Math.round(fs * 1.42), h = Math.min(bh, n * ls / 72 + 0.15);
        const opt = { y: Y0 + 0.05, h, valign: 'top', margin: 0, lineSpacing: ls, paraSpaceBefore: 0, paraSpaceAfter: 0 };
        sl.addText(L.map((l, i) => ({ text: l.num || ' ', options: { breakLine: i < n - 1 } })), { ...opt, x: X, w: 0.62, fontFace: F, fontSize: Math.max(9, Math.round(fs * .72)), color: '9AA0AA', align: 'right' });
        sl.addText(L.map((l, i) => ({ text: l.t || ' ', options: { breakLine: i < n - 1, ...(l.h ? { bold: true } : {}) } })), { ...opt, x: X + 0.85, w: CW - 0.85, fontFace: FT, fontSize: fs, color: INK, wrap: false });
        if (src) sl.addText(plainText(s.b.source), { x: X + 0.85, y: BOT - 0.3, w: CW - 0.85, h: 0.3, fontFace: F, fontSize: 11, color: LIGHT, margin: 0 });
      } else if (s.k === 'tasks') {
        const multi = s.items.length > 1; const mn = tsMin(s); const sz = tsSoz(s); const BW = multi ? 0.62 : 0, gapR = 0.22, gapS = 0.32, gapC = 0.5, rg = 0.3, HH = 0.68;
        head(sl, tsKick(s, m), tsHead(s), chipsOf({ soz: sz, arb: tsArb(s) }, s.ph, mn, tsTimer(s)));
        const metaFs = fs => Math.max(11, Math.round(fs * 0.62));
        const itemH = (x, w, fs, col) => { const pl = stepPlain(x.it); return needH(pl, w - BW - (pl.length > 1 ? 0.45 : 0), fs) + (tsMeta(x, s, m, col) ? metaFs(fs) * 1.35 / 72 + 0.06 : 0); };
        const listH = (L, w, fs, col) => L.reduce((a, x) => a + itemH(x, w, fs, col), 0) + Math.max(0, L.length - 1) * gapR;
        const grid = g => { const n = g.cols.length, nc = n <= 3 ? n : n === 4 ? 2 : 3; return { nc, nr: Math.ceil(n / nc), cw: (CW - (nc - 1) * gapC) / nc }; };
        const segH = (g, fs) => { if (g.t === 'rows') return listH(g.items, CW, fs); const G = grid(g); let h = 0; for (let r = 0; r < G.nr; r++) h += HH + Math.max(...g.cols.slice(r * G.nc, r * G.nc + G.nc).map(c => listH(c.items, G.cw, fs, c))); return h + (G.nr - 1) * rg; };
        const total = fs => s.segs.reduce((a, g) => a + segH(g, fs), 0) + (s.segs.length - 1) * gapS;
        const fs = [36, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14].find(f => total(f) <= BH - 0.1) || 14;
        const put = (x, ix, iy, w, col) => {
          const meta = tsMeta(x, s, m, col); const h = itemH(x, w, fs, col);
          if (multi) sl.addText(itPh(x.it) === 'ha' ? 'HA' : x.no ? String(x.no) + (x.wx || '') : '•', { shape: 'roundRect', rectRadius: 0.06, x: ix, y: iy + fs * 0.08 / 72, w: 0.4, h: 0.4, fill: { color: ACC }, fontFace: F, fontSize: itPh(x.it) === 'ha' ? 11 : 15, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0 });
          const runs = stepRuns([x.it], fs); if (meta) { runs[runs.length - 1].options.breakLine = true; runs.push({ text: meta, options: { fontSize: metaFs(fs), color: '6B7280', bold: true, paraSpaceBefore: 2 } }); }
          sl.addText(runs, { x: ix + BW, y: iy, w: w - BW, h, fontFace: F, fontSize: fs, color: INK, valign: 'top', margin: 0, lineSpacingMultiple: 1.1 });
          return h;
        };
        let y = Y0 + Math.max(0.05, (BH - total(fs)) / 2);
        s.segs.forEach((g, gi) => {
          if (gi) y += gapS;
          if (g.t === 'rows') { g.items.forEach((x, i) => { if (i) y += gapR; y += put(x, X, y, CW); }); return; }
          const G = grid(g);
          for (let r = 0; r < G.nr; r++) {
            const row = g.cols.slice(r * G.nc, r * G.nc + G.nc); const rh = HH + Math.max(...row.map(c => listH(c.items, G.cw, fs, c)));
            row.forEach((c, i) => {
              const cx = X + i * (G.cw + gapC);
              if (i) sl.addShape('line', { x: cx - gapC / 2, y, w: 0, h: rh, line: { color: 'C9CED8', width: 2 } });
              sl.addText([{ text: c.name, options: { bold: true, color: ACC } }, ...(c.sub ? [{ text: '  –  ' + c.sub, options: { color: GREY } }] : [])], { x: cx, y, w: G.cw, h: 0.44, fontFace: F, fontSize: Math.min(20, Math.max(14, fs - 4)), valign: 'bottom', margin: 0, fit: 'shrink' });
              sl.addShape('line', { x: cx, y: y + 0.52, w: G.cw, h: 0, line: { color: TINT, width: 2.5 } });
              let iy = y + HH; c.items.forEach((x, j) => { if (j) iy += gapR; iy += put(x, cx, iy, G.cw, c); });
            });
            y += rh + (r < G.nr - 1 ? rg : 0);
          }
        });
        const nt = notesOf(s.items.map(x => [tsLab(x, s, m), x.it])); const phs = s.phs || []; if (phs.length || mn) nt.push([phs.length ? 'Phase: ' + phs.map(k => PHASEN[k].label).join(', ') : '', mn ? 'Zeit: ' + mn + ' Min.' + (tsCols(s) ? ' (Gruppen parallel)' : '') : ''].filter(Boolean).join(' · '));
        if (nt.length) sl.addNotes(nt.join('\n\n'));
      } else if (s.k === 'step') {
        const b = s.b, ph = itPh(b), mn = itMin(b); const yv = s.fol === 'video' ? ytInfo(b) : null; const link = yv ? yv.watch : tfStr(b.link).trim(); const qrW = link ? 3.0 : 0; const tw = CW - (qrW ? qrW + 0.4 : 0);
        const addQR = (y0, h0) => { if (!link) return; const sz = Math.min(2.7, h0 - 0.6); const qy = y0 + (h0 - sz - 0.45) / 2; sl.addImage({ data: QR.dataURL(link, 8), x: X + CW - qrW + (qrW - sz) / 2, y: qy, w: sz, h: sz }); sl.addText([{ text: linkShort(link), options: { hyperlink: { url: link } } }], { x: X + CW - qrW, y: qy + sz + 0.08, w: qrW, h: 0.32, fontFace: F, fontSize: 11, color: ACC, align: 'center', margin: 0, fit: 'shrink' }); };
        const head1 = tfStr(b.head).trim() ? plainText(b.head) : stepHeadDef(b);
        if (s.fol === 'video' && yv) {
          head(sl, '', b.cap ? plainText(b.cap) : 'Video', chipsOf(b, ph, mn, b.timer));
          sl.addText([{ text: yv.kind === 'ard' ? '▶  Video in der ARD Mediathek öffnen' : '▶  Video auf YouTube öffnen', options: { hyperlink: { url: link }, bold: true, color: ACC } }, { text: (yv.st || yv.en ? `Ausschnitt ${yv.st ? ytFmt(yv.st) : '0:00'}${yv.en ? '–' + ytFmt(yv.en) : ''}` : ''), options: { breakLine: false, color: GREY, fontSize: 18 } }], { x: X, y: Y0 + 0.4, w: tw, h: 1.4, fontFace: F, fontSize: 28, valign: 'middle', margin: 0 });
          addQR(Y0, BOT - Y0);
        } else if (s.fol === 'quiz') {
          const x = s.qz; const open = x.t === 'open'; const O = x.o.map((o, j) => [plainText(o).trim(), j]).filter(([o]) => o);
          const draw = (z, sol) => { head(z, `Frage ${s.qi + 1} von ${s.qn}${sol ? ' · Lösung' : ''}`, head1, s.qi || sol ? [] : chipsOf(b, ph, mn, b.timer));
            const q = plainText(x.q).trim(); const fq = q.length < 70 ? 34 : q.length < 140 ? 28 : 24; const hq = Math.min(2.2, needH([q.length], tw, fq) + 0.25);
            z.addText(q, { x: X, y: Y0 + 0.05, w: tw, h: hq, fontFace: F, fontSize: fq, bold: true, color: INK, valign: 'top', margin: 0 });
            const y0 = Y0 + hq + 0.3, hh = BOT - y0;
            if (open) { if (sol && tfStr(x.a).trim()) { z.addText(plainText(x.a).trim(), { x: X, y: y0, w: tw, h: Math.min(hh, 2.6), fontFace: F, fontSize: 26, color: INK, fill: { color: TINT }, valign: 'middle', margin: 16, fit: 'shrink' }); z.addShape('rect', { x: X, y: y0, w: 0.12, h: Math.min(hh, 2.6), fill: { color: ACC } }); } return; }
            const two = O.length > 2; const cols = two ? 2 : 1, rows = Math.ceil(O.length / cols); const gw = 0.35, gh = 0.25; const cw = (tw - gw * (cols - 1)) / cols, ch = Math.min(1.5, (hh - gh * (rows - 1)) / rows);
            O.forEach(([o, j], k) => { const cx = X + (k % cols) * (cw + gw), cy = y0 + Math.floor(k / cols) * (ch + gh); const good = sol && j === x.ok, dim = sol && j !== x.ok;
              z.addShape('roundRect', { x: cx, y: cy, w: cw, h: ch, rectRadius: 0.12, fill: { color: good ? 'E3F4EA' : 'FFFFFF' }, line: { color: good ? '2E7D4F' : 'D4D9E3', width: good ? 2.5 : 1.25 } });
              z.addText(QZ_L[j], { x: cx + 0.2, y: cy + (ch - 0.62) / 2, w: 0.62, h: 0.62, fontFace: F, fontSize: 22, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0, fill: { color: good ? '2E7D4F' : dim ? 'B7BCC6' : ACC } });
              z.addText(o + (good ? '  ✓' : ''), { x: cx + 1.0, y: cy, w: cw - 1.2, h: ch, fontFace: F, fontSize: 22, color: dim ? '9AA0AA' : INK, bold: good, valign: 'middle', margin: 0, fit: 'shrink' }); }); };
          draw(sl, false);
          const sol = qzSol(x); if (sol) { const s2 = pptx.addSlide({ masterName: 'AB Nur Titel' }); draw(s2, true); s2.addNotes('Lösung: ' + sol); barAdd(s2, s.bi, false); }
          addQR(Y0, BH);
        } else if (s.fol === 'titel') {
          const ht = plainText(b.head || '').trim() || stepHeadDef(b); const tx = plainText(b.text || '').trim();
          sl.addText(ht, { x: X, y: tx ? 1.6 : 2.0, w: tw, h: 1.8, fontFace: F, fontSize: 60, bold: true, color: ACC, align: 'center', valign: 'middle', margin: 0, fit: 'shrink' });
          if (tx) sl.addText(tx, { x: X + 0.4, y: 3.5, w: tw - 0.8, h: 1.2, fontFace: F, fontSize: 24, color: INK, align: 'center', valign: 'top', margin: 0, fit: 'shrink' });
        } else if (s.fol === 'zitat') {
          sl.addText(htmlRuns(parasHTML(b.quote || ''), { italic: true }), { x: X + 0.4, y: 1.1, w: tw - 0.8, h: BOT - 1.1 - 0.9, fontFace: FT, fontSize: 32, color: INK, valign: 'middle', align: 'center', margin: 0, fit: 'shrink' });
          if (b.author) sl.addText(plainText(b.author), { x: X + 0.4, y: BOT - 0.75, w: tw - 0.8, h: 0.5, fontFace: F, fontSize: 20, color: GREY, align: 'right', margin: 0 });
          addQR(1.1, BOT - 1.1);
        } else if (s.fol === 'bild') {
          const y = b.cap ? Y0 : 0.5; if (b.cap) head(sl, '', plainText(b.cap), chipsOf(b, ph, mn, b.timer));
          await imgIn(sl, /^data:/.test(b.src) ? b.src : null, /^data:/.test(b.src) ? null : b.src, X, y, tw, BOT - y); addQR(y, BOT - y);
        } else if (s.fol === 'frage') {
          head(sl, '', head1, chipsOf(b, ph, mn, b.timer)); const q = plainText(m.frage || '').trim(); const qt = q || 'Stundenfrage noch nicht eingetragen';
          const fs = qt.length < 60 ? 36 : qt.length < 120 ? 30 : 26; const hq = Math.min(3.2, needH([qt.length], tw - 0.7, fs) + 0.45); const y1 = tfStr(b.text).trim() ? Y0 + 0.15 : Y0 + Math.max(0.15, (BH - hq) / 2);
          sl.addText(qt, { x: X, y: y1, w: tw, h: hq, fontFace: F, fontSize: fs, bold: true, color: q ? INK : LIGHT, fill: { color: TINT }, valign: 'middle', margin: 18 });
          sl.addShape('rect', { x: X, y: y1, w: 0.12, h: hq, fill: { color: ACC } });
          if (tfStr(b.text).trim()) { const y2 = y1 + hq + 0.35; const pl = stepPlain(b); const fs2 = fitFs(pl, tw - 0.5, BOT - y2, [26, 24, 22, 20, 18]); sl.addText(stepRuns([b], fs2), { x: X, y: y2, w: tw, h: BOT - y2, fontFace: F, fontSize: fs2, color: INK, valign: 'top', margin: 0, lineSpacingMultiple: 1.1 }); }
          addQR(Y0, BH);
        } else {
          head(sl, '', head1, chipsOf(b, ph, mn, b.timer)); const xq = b.exit ? stepQs(b) : []; const pl = stepPlain(b).concat(xq.map(q => q.length * 0.8)); const fs = fitFs(pl, tw - (pl.length > 1 ? 0.5 : 0), BH - 0.25, [36, 32, 30, 28, 26, 24, 22, 20, 18]);
          const runs = stepRuns([b], fs); if (xq.length) { runs[runs.length - 1].options.breakLine = true; xq.forEach((q, i) => runs.push({ text: plainText(q), options: { bullet: { type: 'number', indent: Math.round(fs * 1.1) }, fontSize: Math.round(fs * 0.8), color: GREY, paraSpaceBefore: i ? 0 : Math.round(fs * 0.5), paraSpaceAfter: Math.round(fs * 0.25), ...(i < xq.length - 1 ? { breakLine: true } : {}) } })); }
          sl.addText(runs, { x: X, y: Y0 + 0.05, w: tw, h: BH - 0.15, fontFace: F, fontSize: fs, color: INK, valign: 'middle', margin: 0, lineSpacingMultiple: 1.12 }); addQR(Y0, BH);
        }
        const nt = s.fol === 'quiz' && s.qi ? [] : notesOf([['', b]]); if (s.fol === 'quiz' && qzSol(s.qz)) nt.push('Lösung: ' + qzSol(s.qz)); if (tfStr(b.note).trim() && !(s.fol === 'quiz' && s.qi)) nt.unshift('Was ich tue: ' + plainText(b.note)); if (ph || mn) nt.push([ph ? 'Phase: ' + PHASEN[ph].label : '', mn ? 'Zeit: ' + mn + ' Min.' : ''].filter(Boolean).join(' · '));
        if (nt.length) sl.addNotes(nt.join('\n\n'));
      } else if (s.k === 'tafel') {
        const b = s.b; const cl = tfTpl(b) === 'cluster' && !tfStr(b.center).trim(); head(sl, 'Tafelbild', cl ? '' : plainText(tfStrip(b.title || '')));
        if (tfRaster(b)) {
          const rows = b.rows.filter(r => r.some(x => tfStr(x).trim())); const fs = rows.length <= 4 ? 22 : rows.length <= 7 ? 18 : 15;
          sl.addTable([b.cols.map(c => ({ text: tfStrip(c), options: { bold: true, color: ACC, fill: { color: TINT }, align: 'center' } })), ...rows.map(r => b.cols.map((_, i) => ({ text: tfStrip(r[i] || '') })))], { x: X, y: Y0 + 0.1, w: CW, fontFace: F, fontSize: fs, color: INK, border: { type: 'solid', pt: 1, color: ACC }, valign: 'middle', margin: 0.08, autoPage: false });
        } else { const im = await tfImage(b); await imgIn(sl, im.data, null, X, Y0, CW, BH); }
        if ((b.onSheet || 'luecke') === 'luecke') sl.addNotes('Auf dem Arbeitsblatt steht dieses Tafelbild als Lückentafelbild.');
      } else if (s.k === 'info') {
        head(sl, s.b.kind || 'Info', plainText(s.b.title || ''));
        const ilen = plainText(s.b.text || '').length, ipar = String(s.b.text || '').split(/\n\s*\n/).length;
        sl.addText(htmlRuns(parasHTML(s.b.text || ''), {}, { b: ACC }), { x: X, y: Y0 + 0.1, w: CW, h: Math.min(BH - 0.3, 0.55 + Math.ceil(ilen / 78) * 0.46 + ipar * 0.18), fontFace: F, fontSize: 24, color: INK, fill: { color: TINT }, valign: 'top', margin: 14, paraSpaceAfter: 8 });
        sl.addShape('rect', { x: X, y: Y0 + 0.1, w: 0.1, h: Math.min(BH - 0.3, 0.55 + Math.ceil(ilen / 78) * 0.46 + ipar * 0.18), fill: { color: ACC } });
      } else if (s.k === 'quote') {
        sl.addText(htmlRuns(parasHTML(s.b.text || ''), { italic: true }), { x: X + 0.6, y: 1.1, w: CW - 1.2, h: BOT - 1.1 - 0.9, fontFace: FT, fontSize: 32, color: INK, valign: 'middle', align: 'center', margin: 0, fit: 'shrink' });
        if (s.b.author) sl.addText(plainText(s.b.author), { x: X + 0.6, y: BOT - 0.75, w: CW - 1.2, h: 0.5, fontFace: F, fontSize: 20, color: GREY, align: 'right', margin: 0 });
      } else if (s.k === 'image') {
        const y = s.b.caption ? Y0 : 0.5; if (s.b.caption) head(sl, '', plainText(s.b.caption));
        const src = bubOn(s.b) ? await bubCompositeURL(s.b) : s.b.src; await imgIn(sl, /^data:/.test(src) ? src : null, /^data:/.test(src) ? null : src, X, y, CW, BOT - y - (s.b.source ? 0.4 : 0));
        if (s.b.source) sl.addText(plainText(s.b.source), { x: X, y: BOT - 0.3, w: CW, h: 0.3, fontFace: F, fontSize: 11, color: LIGHT, margin: 0 });
      } else if (s.k === 'table') {
        const b = s.b; head(sl, 'Tabelle', plainText(b.title || ''));
        const hasH = b.cols.some(c => String(c).trim()); const R = (b.rows || []).length; const fs = R <= 5 ? 18 : R <= 9 ? 15 : 12;
        const data = [...(hasH ? [b.cols.map(c => ({ text: plainText(prCk(c)), options: { bold: true, color: ACC, fill: { color: TINT } } }))] : []), ...(b.rows || []).map(r => b.cols.map((_, i) => ({ text: plainText(prCk(r[i])) })))];
        sl.addTable(data, { x: X, y: Y0 + 0.1, w: CW, fontFace: F, fontSize: fs, color: INK, border: { type: 'solid', pt: 1, color: 'B7BCC6' }, valign: 'middle', margin: 0.08, rowH: Math.min(0.9, (BH - 0.3) / Math.max(1, data.length)), autoPage: false });
      } else if (s.k === 'phr') {
        head(sl, '', plainText(s.b.title || 'Formulierungshilfen'));
        const gs = phrGroups(s.b); const cols = gs.length > 1 ? 2 : 1; const w = (CW - (cols - 1) * 0.4) / cols; const per = Math.ceil(gs.length / cols);
        for (let c = 0; c < cols; c++) { const part = gs.slice(c * per, c * per + per); const runs = []; part.forEach(g => { if (g.head) runs.push({ text: plainText(g.head), options: { bold: true, color: ACC, breakLine: true } }); g.lines.forEach(l => runs.push({ text: plainText(l), options: { bullet: true, breakLine: true } })); }); if (runs.length) { delete runs[runs.length - 1].options.breakLine; sl.addText(runs, { x: X + c * (w + 0.4), y: Y0 + 0.1, w, h: BH - 0.2, fontFace: F, fontSize: 18, color: INK, valign: 'top', margin: 0, paraSpaceAfter: 4, fit: 'shrink' }); } }
      } else if (s.k === 'match') {
        const M = s.M; head(sl, s.b.sort ? 'Sortieren' : 'Zuordnen', plainText(s.b.title || ''));
        const list = (arr, lab, key) => arr.map((x, i) => [{ text: lab(i) + '   ', options: { bold: true, color: ACC } }, { text: plainText(x[key]), options: { breakLine: i < arr.length - 1 } }]).flat();
        const fs = Math.max(14, Math.min(24, Math.floor((BH - 0.3) * 72 / (Math.max(M.left.length, M.right.length, 1) * 1.6))));
        if (M.left.length) sl.addText(list(M.left, i => String(i + 1), 'a'), { x: X, y: Y0 + 0.1, w: CW / 2 - 0.3, h: BH - 0.2, fontFace: F, fontSize: fs, color: INK, valign: 'top', margin: 0, paraSpaceAfter: 8 });
        if (M.right.length) sl.addText(list(M.right, i => String.fromCharCode(65 + i), 'b'), { x: X + CW / 2 + 0.3, y: Y0 + 0.1, w: CW / 2 - 0.3, h: BH - 0.2, fontFace: F, fontSize: fs, color: INK, valign: 'top', margin: 0, paraSpaceAfter: 8 });
      } else if (s.k === 'qr') {
        head(sl, '', 'Digitale Fassung');
        sl.addImage({ data: QR.dataURL(s.link, 10), x: (W - 3.5) / 2, y: 1.65, w: 3.5, h: 3.5 });
        sl.addText([{ text: s.link, options: { hyperlink: { url: s.link } } }], { x: X, y: 5.3, w: CW, h: 0.45, fontFace: F, fontSize: 16, color: ACC, align: 'center', margin: 0 });
      }
      barAdd(sl, s.bi, big);
    }
    // PptxGenJS schreibt bei Absätzen mit mehreren Läufen weitere <a:pPr> hinter die Läufe; PowerPoint verlangt sie nur am Absatzanfang
    let blob = await pptx.write({ outputType: 'blob' });
    try {
      await loadScript(LIBS.zip); const z = await window.JSZip.loadAsync(blob); let fixed = 0;
      for (const n of Object.keys(z.files).filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))) { const x = await z.file(n).async('string'); const y = pptxPos(pptxTiming(x.replace(/(<\/a:r>)<a:pPr\b[^>]*?(?:\/>|>[\s\S]*?<\/a:pPr>)/g, '$1'))); if (y !== x) { z.file(n, y); fixed++; } }
      if (fixed) blob = await z.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', compression: 'DEFLATE' });
    } catch (err) { console.warn('PowerPoint-Nachbearbeitung übersprungen', err); }
    overlay(''); await deliver((state.sheet.abs ? 'Stunde_' + slug(stTitle(state.sheet)) : fileBase()) + '_Praesentation.pptx', blob);
  } catch (err) {
    console.error(err); overlay('');
    toast('Die PowerPoint-Datei ließ sich nicht erstellen. Dafür braucht es eine Internetverbindung; „Präsentieren“ geht auch ohne.');
  } finally { busy = false; overlay(''); }
}
// Piktogramm als SVG (32 × 24); c = Farbe, bg = Papierfarbe für die Trennkante
function sozSVG(kind, c, bg) {
  const P = (x, hy, r, by, w, h, halo) => `<circle cx="${x}" cy="${hy}" r="${r}"${halo}/><path d="M${x - w} ${by} a${w} ${h} 0 0 1 ${2 * w} 0 z"${halo}/>`;
  const halo = ` style="stroke:${bg};stroke-width:1.6;paint-order:stroke"`;
  let g = '';
  if (kind === 'ea') g = P(16, 6.2, 4.4, 23.5, 7.6, 9.6, '');
  if (kind === 'pa') g = P(9.3, 6.8, 3.8, 23.5, 6.2, 8.6, '') + P(22.7, 6.8, 3.8, 23.5, 6.2, 8.6, '');
  if (kind === 'ga') g = P(7, 5.8, 3.3, 21.5, 5.6, 7.8, '') + P(25, 5.8, 3.3, 21.5, 5.6, 7.8, '') + P(16, 8.6, 3.7, 23.6, 6.4, 8.6, halo);
  // Think-Pair-Share: allein → zu zweit → teilen (Sprechblase)
  // Think-Pair-Share als Dreischritt: eine Person › zwei Personen › Sprechblase (teilen)
  if (kind === 'tps') { const ar = x => `<path d="M${x} 15.6l1.5 1.6-1.5 1.6" style="fill:none;stroke:${c};stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round"/>`;
    g = P(3.6, 13.4, 2.3, 23.5, 3.5, 5.6, '') + ar(7.4) + P(12.4, 13.4, 2.3, 23.5, 3.4, 5.6, '') + P(17.8, 13.4, 2.3, 23.5, 3.4, 5.6, halo) + ar(22.2)
      + `<path d="M25.4 9.6h5a1.4 1.4 0 0 1 1.4 1.4v5.4a1.4 1.4 0 0 1-1.4 1.4h-2.2l-2.2 2.4v-2.4h-.6a1.4 1.4 0 0 1-1.4-1.4V11a1.4 1.4 0 0 1 1.4-1.4z"/>` + [26.6, 28.2, 29.8].map(x => `<circle cx="${x}" cy="13.7" r=".75" style="fill:${bg}"/>`).join(''); }
  if (kind === 'pl') g = `<path d="M10.5 1h11a3 3 0 0 1 3 3v3.6a3 3 0 0 1-3 3h-3.4L16 13.4l-2.1-2.8h-3.4a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3z"/>`
    + [12.6, 16, 19.4].map(x => `<circle cx="${x}" cy="5.8" r="1.05" style="fill:${bg}"/>`).join('')
    + [4, 11.5, 20.5, 28].map(x => P(x, 16.4, 2.25, 24, 3.6, 4.7, '')).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 24" width="32" height="24"><g style="fill:${c}">${g}</g></svg>`;
}
const sozURI = (kind, c, bg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sozSVG(kind, c, bg));
async function arbPNG(k, color) {
  const img = await loadImg(arbURI(k, color));
  const cv = document.createElement('canvas'); cv.width = 192; cv.height = 192;
  cv.getContext('2d').drawImage(img, 0, 0, 192, 192);
  return imageBytes(cv.toDataURL('image/png'));
}
async function sozPNG(kind, color) {
  const img = await loadImg(sozURI(kind, color, '#FFFFFF'));
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 192;
  cv.getContext('2d').drawImage(img, 0, 0, 256, 192);
  return imageBytes(cv.toDataURL('image/png'));
}

