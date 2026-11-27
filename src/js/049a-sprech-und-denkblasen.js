/* ================= Sprech- und Denkblasen auf Bildern (handlungsorientiert, z. B. Geschichte) =================
   b.bub = [{ k: 'sprech'|'denk', x, y, w, tx, ty, text, n }]
   Koordinaten in Prozent der „Bühne“: volle Breite des Bausteins × Höhe des Bildes. So können die Blasen links und rechts
   neben dem Foto im freien Platz stehen und mit dem Schwanz auf eine Person zeigen. Leerer Text = Linien zum Ausfüllen. */
const BUB_K = { sprech: 'Sprechen', denk: 'Denken', ruf: 'Rufen', fluester: 'Flüstern' };
const bubList = b => (Array.isArray(b && b.bub) ? b.bub : []);
const bubOn = b => !!(b && b.type === 'image' && !Array.isArray(b.lb) && b.src && bubList(b).length);
const bubImgW = b => Math.max(20, Math.min(100, +b.width || 80));
// Höhe der Bühne im Verhältnis zur Breite
const BUB_BAND = 5; // freier Streifen oben und unten (Prozent der Breite)
const bubImgR = b => bubImgW(b) / 100 * ((b.h || 3) / (b.w || 4));
const bubRatio = b => bubImgR(b) + 2 * BUB_BAND / 100;
const bubKind = o => (BUB_K[o && o.k] ? o.k : 'sprech');
const bubClampX = (x, w) => Math.max(w / 2 + 4, Math.min(100 - w / 2 - 4, x));
function bubNew(b, k) {
  const L = bubList(b); const left = L.length % 2 === 0; const W = bubImgW(b);
  // in die Mitte des freien Rands links bzw. rechts, so breit wie der Rand
  const side = Math.max(9, (100 - W) / 4);
  const x = left ? side : 100 - side;
  const w = Math.round(Math.max(14, Math.min(28, (100 - W) / 2 - 6)));
  return { k, x: Math.round(bubClampX(x, w) * 10) / 10, y: 24 + (Math.floor(L.length / 2) * 34) % 70, w, tx: left ? 50 - W / 4 : 50 + W / 4, ty: 38, text: '', n: 3 };
}
/* Formen im Comic-Stil, in Pixeln der Bühne. Körper = Ellipse um das Textfeld (Wolke, Zacken), Schwanz gebogen.
   Gezeichnet wird erst die doppelt breite Kontur, dann die Füllung darüber: so verschmelzen Körper und Schwanz ohne Naht. */
function bubPaths(k, cx, cy, w, h, tx, ty) {
  const rx = w / 2 + h * .16, ry = Math.max(h * .78, w * .22); const P = (a, f = 1) => [cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f];
  const f2 = n => n.toFixed(1); let body = '';
  if (k === 'denk') {
    const per = Math.PI * Math.sqrt((rx * rx + ry * ry) / 2) * 2; const N = Math.max(9, Math.min(22, Math.round(per / Math.max(22, Math.min(rx, ry) * .62))));
    const d = Math.PI * 2 / N; let a0 = -Math.PI / 2; const p0 = P(a0, .96); body = `M${f2(p0[0])} ${f2(p0[1])}`;
    for (let i = 0; i < N; i++) { const a = a0 + i * d; const c1 = P(a + d * .18, 1.2), c2 = P(a + d * .82, 1.2), e = P(a + d, .96); body += `C${f2(c1[0])} ${f2(c1[1])} ${f2(c2[0])} ${f2(c2[1])} ${f2(e[0])} ${f2(e[1])}`; }
    body += 'Z';
  } else if (k === 'ruf') {
    const N = 15; let first = true;
    for (let i = 0; i < N * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / N; const r = i % 2 ? .9 : 1.24 + .07 * Math.sin(i * 2.7); const p = P(a, r); body += `${first ? 'M' : 'L'}${f2(p[0])} ${f2(p[1])}`; first = false; }
    body += 'Z';
  } else {
    body = `M${f2(cx - rx)} ${f2(cy)}A${f2(rx)} ${f2(ry)} 0 1 0 ${f2(cx + rx)} ${f2(cy)}A${f2(rx)} ${f2(ry)} 0 1 0 ${f2(cx - rx)} ${f2(cy)}Z`;
  }
  // Richtung zum Ziel im Raum der Ellipse; liegt das Ziel in der Blase, gibt es keinen Schwanz
  const nx = (tx - cx) / rx, ny = (ty - cy) / ry, inside = nx * nx + ny * ny < 1.4; const phi = Math.atan2(ny, nx);
  let tail = '', dots = [];
  if (!inside && k === 'denk') {
    const E = P(phi, 1.16); const m = Math.min(rx, ry); let r = Math.max(4, m * .2);
    [.12, .45, .78].forEach(t => { dots.push({ x: E[0] + (tx - E[0]) * t, y: E[1] + (ty - E[1]) * t, rx: r * 1.15, ry: r }); r *= .66; });
  } else if (!inside) {
    // Ansatz: fester Anteil der Blasenhöhe, quer zur Richtung, im Körper versteckt
    const C = P(phi, .55), dx = tx - C[0], dy = ty - C[1], L0 = Math.hypot(dx, dy) || 1, hw = Math.min(rx, ry) * (k === 'ruf' ? .3 : .38);
    const b1 = [C[0] - dy / L0 * hw, C[1] + dx / L0 * hw], b2 = [C[0] + dy / L0 * hw, C[1] - dx / L0 * hw];
    const bend = (q, z, sgn) => { const mx = (q[0] + z[0]) / 2, my = (q[1] + z[1]) / 2, L = Math.hypot(z[0] - q[0], z[1] - q[1]) || 1; return [mx + (-(z[1] - q[1]) / L) * L * .07 * sgn, my + ((z[0] - q[0]) / L) * L * .07 * sgn]; };
    if (k === 'ruf') tail = `M${f2(b1[0])} ${f2(b1[1])}L${f2(tx)} ${f2(ty)}L${f2(b2[0])} ${f2(b2[1])}Z`;
    else { const T = [tx, ty]; const c1 = bend(b1, T, 1), c2 = bend(T, b2, 1); tail = `M${f2(b1[0])} ${f2(b1[1])}Q${f2(c1[0])} ${f2(c1[1])} ${f2(tx)} ${f2(ty)}Q${f2(c2[0])} ${f2(c2[1])} ${f2(b2[0])} ${f2(b2[1])}Z`; }
  }
  return { d: body + tail, body, tail, dots, dash: k === 'fluester' };
}
const bubSW = W => Math.max(1.3, W * .0028);
// Zeichnet die Formen passend zu den Textfeldern (nach jedem Neuaufbau und beim Ziehen)
function bubDraw(st) {
  const W = st.offsetWidth, H = st.offsetHeight; if (!W || !H) return; const sw = bubSW(W);
  let g1 = '', g2 = '';
  st.querySelectorAll('.bub[data-bi]').forEach(bx => {
    const k = bx.dataset.k || 'sprech', cx = bx.offsetLeft, cy = bx.offsetTop, w = bx.offsetWidth, h = bx.offsetHeight;
    const tx = +bx.dataset.tx / 100 * W, ty = +bx.dataset.ty / 100 * H; const s = bubPaths(k, cx, cy, w, h, tx, ty);
    const dash = s.dash ? ` stroke-dasharray="${(sw * 3.2).toFixed(1)} ${(sw * 2.4).toFixed(1)}"` : '';
    g1 += `<g><path d="${s.d}" fill="#fff" stroke="#1C1F27" stroke-width="${(sw * 2).toFixed(2)}" stroke-linejoin="round"${dash}/><path d="${s.body}" fill="#fff"/>${s.tail ? `<path d="${s.tail}" fill="#fff"/>` : ''}</g>`;
    s.dots.forEach(o => { g2 += `<ellipse cx="${o.x.toFixed(1)}" cy="${o.y.toFixed(1)}" rx="${o.rx.toFixed(1)}" ry="${o.ry.toFixed(1)}" fill="#fff" stroke="#1C1F27" stroke-width="${sw.toFixed(2)}"/>`; });
  });
  let svg = st.querySelector('.bub-svg'); if (!svg) { st.insertAdjacentHTML('beforeend', '<svg class="bub-svg" aria-hidden="true"></svg>'); svg = st.querySelector('.bub-svg'); }
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.innerHTML = g1 + g2;
}
function bubScan(root = document) { if (!root || !root.querySelectorAll) return; root.querySelectorAll('.bub-st').forEach(st => { if (BUB_RO && !st.__bro) { BUB_RO.observe(st); st.__bro = 1; } bubDraw(st); }); }
const BUB_RO = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(es => es.forEach(e => bubDraw(e.target))) : null;
// Auffangnetz: neu eingefügte Bühnen (Mappe, Fenster, Kopien) werden gezeichnet
try { new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && (n.classList.contains('bub-st') || n.querySelector('.bub-st'))) { requestAnimationFrame(() => bubScan(document)); return; } }).observe(document.documentElement, { childList: true, subtree: true }); } catch { }
function bubBoxes(b) {
  return bubList(b).map((o, i) => {
    const txt = String(o.text || '').trim(); const n = Math.max(1, Math.min(6, +o.n || 3)); const w = +o.w || 24; const k = bubKind(o);
    const inner = txt ? `<span class="bub-tx">${inlineHTML(txt)}</span>` : '<i class="bub-l"></i>'.repeat(n);
    return `<div class="bub k-${k}${txt ? '' : ' leer'}" data-bi="${i}" data-k="${k}" data-tx="${+o.tx}" data-ty="${+o.ty}" style="left:${+o.x}%;top:${+o.y}%;width:${w}%;padding:${k === 'denk' ? 1.1 : .7}cqw ${(w * .1).toFixed(2)}cqw">${inner}</div>`;
  }).join('');
}
// Bühne: Bild in der Mitte, Formen (SVG) dazwischen, Text darüber
function bubStage(b, cls = '') {
  return `<div class="bub-st${cls ? ' ' + cls : ''}" style="aspect-ratio:${(1 / bubRatio(b)).toFixed(4)};--ar:${(1 / bubRatio(b)).toFixed(4)}"><img src="${esc(b.src)}" alt="" style="width:${bubImgW(b)}%;margin-top:${BUB_BAND}cqw" draggable="false"><svg class="bub-svg" aria-hidden="true"></svg>${bubBoxes(b)}</div>`;
}
// Editor
function bubEdHTML(b) {
  const L = bubList(b);
  const add = `<div class="bub-add"><button class="btn sm" type="button" data-act="bub-add" data-v="sprech">${BUB_IC.sprech}+ Sprechblase</button><button class="btn sm" type="button" data-act="bub-add" data-v="denk">${BUB_IC.denk}+ Denkblase</button><button class="btn sm" type="button" data-act="bub-add" data-v="ruf">${BUB_IC.ruf}+ Rufblase</button><button class="btn sm" type="button" data-act="bub-add" data-v="fluester">${BUB_IC.fluester}+ Flüsterblase</button></div>`;
  if (!b.src) return '';
  if (!L.length) return `<div class="f bub-ed"><span>Sprech- und Denkblasen</span>${add}<small class="hint">Zum Beispiel links und rechts neben dem Foto – die Schüler:innen schreiben hinein, was die Personen sagen oder denken.</small></div>`;
  const handles = L.map((o, i) => `<span class="bub-h" data-bubh="${i}" data-p="b" style="left:${+o.x}%;top:${+o.y}%" title="Blase ${i + 1} verschieben">${i + 1}</span><span class="bub-h tip" data-bubh="${i}" data-p="t" style="left:${+o.tx}%;top:${+o.ty}%" title="Blase ${i + 1} zeigt hierhin – ziehen"></span>`).join('');
  const rows = L.map((o, i) => `<div class="bub-row">
      <div class="bub-row-h"><b>${i + 1}</b><div class="seg sm" role="group" aria-label="Art">${Object.entries(BUB_K).map(([k, t]) => `<button type="button" data-act="bub-k" data-i="${i}" data-v="${k}" aria-pressed="${bubKind(o) === k}">${t}</button>`).join('')}</div><button class="ib" type="button" data-act="bub-del" data-i="${i}" title="Blase entfernen">${I.x}</button></div>
      <label class="f"><span>Text (leer lassen = Linien zum Ausfüllen)</span><input type="text" data-k="bub.${i}.text" value="${esc(o.text || '')}" placeholder="z. B. „Ein Radio für jeden Haushalt!“"></label>
      <div class="row">${String(o.text || '').trim() ? '' : `<label class="f"><span>Linien</span><select data-k="bub.${i}.n" data-num="1">${[1, 2, 3, 4, 5, 6].map(n => `<option value="${n}"${(+o.n || 3) === n ? ' selected' : ''}>${n}</option>`).join('')}</select></label>`}
        <label class="f"><span>Breite: ${Math.round(+o.w || 24)} %</span><input type="range" min="10" max="50" step="1" value="${+o.w || 24}" data-k="bub.${i}.w" data-num="1"></label></div>
    </div>`).join('');
  return `<div class="f bub-ed"><span>Sprech- und Denkblasen</span>
    <div class="bub-pick" data-bubpick>${bubStage(b, 'ed')}${handles}</div>
    <small class="hint">Nummer ziehen = Blase verschieben, kleiner Punkt = wohin sie zeigt. Die Fläche ist so breit wie das Blatt – links und rechts vom Bild ist Platz.</small>
    ${rows}${add}</div>`;
}
const BUB_IC = {
  sprech: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v10H10l-4 4v-4H4z"/></svg>',
  denk: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><ellipse cx="13" cy="9" rx="8" ry="5.5"/><circle cx="6.5" cy="17" r="1.8"/><circle cx="3.5" cy="20.5" r="1"/></svg>',
  ruf: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l2 4 4-2-1 4 5 1-4 3 3 4-5-1-1 5-3-4-3 4-1-5-5 1 3-4-4-3 5-1-1-4 4 2z"/></svg>',
  fluester: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-dasharray="2.5 2" aria-hidden="true"><ellipse cx="12" cy="10" rx="9" ry="6"/><path d="M8 15.5 5 21l6-4.6"/></svg>'
};
// Ziehen im Editor: Griff folgt sofort, die Vorschau beim Loslassen
document.addEventListener('pointerdown', e => {
  const h = e.target.closest && e.target.closest('#editor .bub-h'); if (!h) return;
  const box = h.closest('[data-bubpick]'), card = h.closest('[data-bid]'); if (!box || !card) return;
  const b = target(card.dataset.bid), i = +h.dataset.bubh, o = b && bubList(b)[i]; if (!o) return;
  e.preventDefault(); snapshot(); try { h.setPointerCapture(e.pointerId); } catch { }
  const st = box.querySelector('.bub-st'); const tip = h.dataset.p === 't';
  const move = ev => { const r = st.getBoundingClientRect();
    const x = Math.round(Math.max(0, Math.min(100, (ev.clientX - r.left) / r.width * 100)) * 10) / 10, y = Math.round(Math.max(-30, Math.min(130, (ev.clientY - r.top) / r.height * 100)) * 10) / 10;
    if (tip) { o.tx = x; o.ty = y; } else { o.x = Math.round(bubClampX(x, +o.w || 24) * 10) / 10; o.y = y; }
    h.style.left = (tip ? x : o.x) + '%'; h.style.top = y + '%';
    const bx = st.querySelector(`.bub[data-bi="${i}"]`); if (bx) { if (tip) { bx.dataset.tx = x; bx.dataset.ty = y; } else { bx.style.left = o.x + '%'; bx.style.top = y + '%'; } } bubDraw(st); };
  const up = () => { h.removeEventListener('pointermove', move); h.removeEventListener('pointerup', up); h.removeEventListener('pointercancel', up); changed(true); };
  h.addEventListener('pointermove', move); h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
});
// Blasen direkt im Blatt verschieben
document.addEventListener('pointerdown', e => {
  const bx = e.target.closest && e.target.closest('#pages .bub[data-bi]'); if (!bx) return;
  const blk = bx.closest('[data-bid]'), b = blk && target(blk.dataset.bid), i = +bx.dataset.bi, o = b && bubList(b)[i]; if (!o) return;
  const st = bx.closest('.bub-st'); const r0 = st.getBoundingClientRect(); const sx = e.clientX, sy = e.clientY, ox = +o.x, oy = +o.y; let moved = false;
  e.preventDefault(); e.stopPropagation(); snapshot();
  const move = ev => { const dx = (ev.clientX - sx) / r0.width * 100, dy = (ev.clientY - sy) / r0.height * 100; if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 3) return; moved = true;
    o.x = Math.round(bubClampX(ox + dx, +o.w || 24) * 10) / 10; o.y = Math.round(Math.max(-30, Math.min(130, oy + dy)) * 10) / 10;
    bx.style.left = o.x + '%'; bx.style.top = o.y + '%'; bubDraw(st); };
  const up = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up); document.removeEventListener('pointercancel', up); if (moved) changed(true); };
  document.addEventListener('pointermove', move); document.addEventListener('pointerup', up); document.addEventListener('pointercancel', up);
}, true);

// Für Word und PowerPoint: Bild mit Blasen als ein Bild zusammensetzen (dieselben Formen wie im Blatt)
async function bubCanvas(b) {
  const img = await loadImg(b.src); const W = 1800, H = Math.round(W * bubRatio(b)); const u = W / 100;
  try { await document.fonts.load(`700 ${Math.round(u * 1.85)}px "Comic Neue"`); } catch { }
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); const iw = W * bubImgW(b) / 100; g.drawImage(img, (W - iw) / 2, BUB_BAND * u, iw, iw * (b.h || 3) / (b.w || 4));
  const sw = bubSW(W), fs = u * 1.85, lh = fs * 1.15; g.font = `700 ${fs}px "Comic Neue", Caveat, "Comic Sans MS", cursive`;
  const wrap = (t, mw) => { const out = []; let line = ''; String(t).split(/\s+/).forEach(w => { const tt = line ? line + ' ' + w : w; if (g.measureText(tt).width > mw && line) { out.push(line); line = w; } else line = tt; }); if (line) out.push(line); return out; };
  bubList(b).forEach(o => {
    const k = bubKind(o), w = (+o.w || 24) * u, px = w * .1, pv = (k === 'denk' ? 1.1 : .7) * u; const txt = plainText(String(o.text || '')).trim();
    const lines = txt ? wrap(txt, w - 2 * px) : []; const n = Math.max(1, Math.min(6, +o.n || 3));
    const h = (txt ? lines.length * lh : n * u * 3.6) + 2 * pv; const cx = +o.x * u, cy = +o.y / 100 * H;
    const s = bubPaths(k, cx, cy, w, h, +o.tx * u, +o.ty / 100 * H); const p = new Path2D(s.d);
    g.save(); g.lineJoin = 'round'; g.strokeStyle = '#1C1F27'; g.lineWidth = sw * 2; if (s.dash) g.setLineDash([sw * 3.2, sw * 2.4]); g.stroke(p); g.restore();
    g.fillStyle = '#fff'; g.fill(new Path2D(s.body)); if (s.tail) g.fill(new Path2D(s.tail));
    s.dots.forEach(d => { g.beginPath(); g.ellipse(d.x, d.y, d.rx, d.ry, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = sw; g.strokeStyle = '#1C1F27'; g.stroke(); });
    const y0 = cy - h / 2 + pv;
    if (lines.length) { g.fillStyle = '#1C1F27'; g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach((t, i) => g.fillText(t, cx, y0 + lh * (i + .5))); }
    else { g.save(); g.strokeStyle = '#8A91A0'; g.lineWidth = Math.max(1, u * .14); g.setLineDash([u * .3, u * .35]); const ins = k === 'denk' ? w * .07 : 0;
      for (let i = 1; i <= n; i++) { const yy = y0 + i * u * 3.6 - u * .3; g.beginPath(); g.moveTo(cx - w / 2 + px + ins, yy); g.lineTo(cx + w / 2 - px - ins, yy); g.stroke(); } g.restore(); }
  });
  return c;
}
async function bubComposite(b) { const c = await bubCanvas(b); const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .9)); return new Uint8Array(await blob.arrayBuffer()); }
async function bubCompositeURL(b) { return (await bubCanvas(b)).toDataURL('image/jpeg', .9); }
