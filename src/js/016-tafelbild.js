/* ================= Tafelbild =================
   Ein Baustein, drei Wege: auf dem Arbeitsblatt (vollständig oder als Lückentafelbild), als Ausgabe A4 quer, am Beamer zum Aufdecken.
   [eckige Klammern] markieren Wörter, die in der Lückenfassung fehlen. */
const TF_TPL = {
  gegen: { label: 'Gegenüberstellung', d: 'Zwei bis vier Spalten, z. B. Pro und Contra oder Text A und Text B', ic: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M12 4v16M3 8.5h18"/>' },
  drei: { label: 'These – Argument – Beleg', d: 'Eine Zeile je Gedanke', ic: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M9 4v16M15 4v16M3 8.5h18M3 14h18"/>' },
  cluster: { label: 'Cluster', d: 'Begriff in der Mitte, Zweige ringsum', ic: '<rect x="8.5" y="10" width="7" height="4" rx="1"/><rect x="2" y="3" width="6" height="4" rx="1"/><rect x="16" y="3" width="6" height="4" rx="1"/><rect x="2" y="17" width="6" height="4" rx="1"/><rect x="16" y="17" width="6" height="4" rx="1"/><path d="M8 7l1.5 3M16 7l-1.5 3M8 17l1.5-3M16 17l-1.5-3"/>' },
  ablauf: { label: 'Ablauf', d: 'Schritte mit Pfeilen, z. B. Handlung oder Argumentationsgang', ic: '<rect x="2" y="9" width="5" height="6" rx="1"/><rect x="9.5" y="9" width="5" height="6" rx="1"/><rect x="17" y="9" width="5" height="6" rx="1"/><path d="M7 12h2.5M14.5 12H17"/>' },
  skala: { label: 'Skala', d: 'Einordnen zwischen zwei Polen, z. B. Nähe und Distanz', ic: '<path d="M3 17h18M3 17l2.5-2M3 17l2.5 2M21 17l-2.5-2M21 17l-2.5 2"/><rect x="4" y="7" width="6" height="4" rx="1"/><rect x="13" y="4" width="7" height="4" rx="1"/>' },
  figuren: { label: 'Figurenkonstellation', d: 'Figuren und ihre Beziehungen', ic: '<circle cx="12" cy="12" r="3"/><circle cx="4.5" cy="5" r="2.2"/><circle cx="19.5" cy="5" r="2.2"/><circle cx="12" cy="20.5" r="2"/><path d="M6.2 6.6l3.6 3.4M17.8 6.6l-3.6 3.4M12 15v3.5"/>' }
};
const TF_POS = ['ganz links', 'eher links', 'Mitte', 'eher rechts', 'ganz rechts'];
const TF_DREI = ['These', 'Argument', 'Beleg (Z.)'];
const tfTpl = b => (TF_TPL[b && b.tpl] ? b.tpl : 'gegen');
const tfRaster = b => tfTpl(b) === 'gegen' || tfTpl(b) === 'drei';
const tfStr = x => String(x == null ? '' : x);
const tfStrip = x => tfStr(x).replace(/\[([^\[\]]*)\]/g, '$1');
const tfLines = x => tfStr(x).split('\n').map(z => z.trim()).filter(Boolean);
function tfNorm(b) {
  if (!Array.isArray(b.cols) || b.cols.length < 1) b.cols = ['', ''];
  if (!Array.isArray(b.rows)) b.rows = [];
  b.rows = b.rows.map(r => (Array.isArray(r) ? r : []));
  ['branches', 'steps', 'scale', 'nodes', 'rels'].forEach(k => { if (!Array.isArray(b[k])) b[k] = []; });
  if (!b.poles || typeof b.poles !== 'object') b.poles = { l: '', r: '', m: '' };
  return b;
}
// Eintrag: o.gaps = Lückenfassung, o.sol = Lösungsstellen farbig (Lehrerfassung), ex = bleibt als Beispiel stehen
function tfEntry(x, o, ex) {
  const t = tfStr(x); if (!t.trim()) return '';
  const word = o.mode === 'wort';
  if (o.gaps && !ex) {
    if (!word) { const nl = Math.min(4, Math.max(1, Math.ceil(tfStrip(t).length / 34))); return `<span class="tf-ge" style="--l:${nl}">${'<i></i>'.repeat(nl)}</span>`; }
    return t.split(/(\[[^\[\]]*\])/).map(p => /^\[[^\[\]]*\]$/.test(p) ? `<span class="gap tf-gw" style="width:${Math.max(3, Math.min(14, (p.length - 2) * .58 + 1.6)).toFixed(1)}em"></span>` : inlineHTML(p)).join('');
  }
  if (o.sol && !ex) return word ? t.split(/(\[[^\[\]]*\])/).map(p => /^\[[^\[\]]*\]$/.test(p) ? `<span class="tf-sol">${inlineHTML(p.slice(1, -1))}</span>` : inlineHTML(p)).join('') : `<span class="tf-sol">${inlineHTML(tfStrip(t))}</span>`;
  return inlineHTML(tfStrip(t));
}
const tfHead = (x, o) => (o.mode === 'wort' ? tfEntry(x, o, false) : inlineHTML(tfStrip(x)));
// Lage der Figuren in % (x der Breite, y der Höhe)
function tfFigPos(ns) {
  const N = ns.length, pos = {};
  if (N <= 3) ns.forEach((x, k) => (pos[x.i] = N === 1 ? [50, 50] : N === 2 ? [k ? 78 : 22, 50] : [[50, 17], [17, 80], [83, 80]][k]));
  else { pos[ns[0].i] = [50, 50]; const R = ns.slice(1); R.forEach((x, k) => { const a = -Math.PI / 2 + k * 2 * Math.PI / R.length + (R.length % 2 ? 0 : Math.PI / R.length); pos[x.i] = [50 + 37 * Math.cos(a), 50 + 35 * Math.sin(a)]; }); }
  // senkrecht auf die ganze Höhe verteilen
  const ys = Object.values(pos).map(p => p[1]); const lo = Math.min(...ys), hi = Math.max(...ys);
  if (N > 3 && hi - lo > 1) Object.values(pos).forEach(p => { p[1] = 13 + (p[1] - lo) / (hi - lo) * 74; });
  return pos;
}
function tafelHTML(b, o = {}) {
  tfNorm(b); const tpl = tfTpl(b); const mode = b.gapMode === 'wort' ? 'wort' : 'eintrag'; o = { ...o, mode };
  const kf = !!b.keepFirst && mode === 'eintrag'; const st = n => (o.steps ? ` data-st="${n}"` : '');
  const T = tfStr(b.title).trim(); let h = '', showT = !!T;
  if (tfRaster(b)) {
    const C = Math.max(1, Math.min(4, b.cols.length));
    const rows = b.rows.filter(r => r.slice(0, C).some(c => tfStr(c).trim()));
    h = `<div class="tf-grid" style="--n:${C}">${b.cols.slice(0, C).map((c, i) => `<div class="tf-h k${i}">${tfHead(c, o) || '&nbsp;'}</div>`).join('')}`
      + rows.map((r, ri) => Array.from({ length: C }, (_, ci) => `<div class="tf-c k${ci}${ri ? '' : ' r0'}"${st(ri + 1)}>${tfEntry(r[ci], o, kf && ri === 0)}</div>`).join('')).join('') + '</div>';
  } else if (tpl === 'cluster') {
    const brs = b.branches.filter(x => tfStr(x.h).trim() || tfStr(x.t).trim());
    const br = (x, i) => { const L = tfLines(x.t); return `<div class="tf-br"${st(i + 1)}>${tfStr(x.h).trim() ? `<div class="tf-bh">${tfHead(x.h, o)}</div>` : ''}${L.length ? `<ul class="tf-bl">${L.map((z, j) => `<li>${tfEntry(z, o, kf && j === 0)}</li>`).join('')}</ul>` : ''}</div>`; };
    const left = [], right = []; brs.forEach((x, i) => (i % 2 ? right : left).push(br(x, i)));
    const cc = tfStr(b.center).trim() ? tfHead(b.center, o) : T ? inlineHTML(tfStrip(T)) : '&nbsp;'; if (!tfStr(b.center).trim()) showT = false;
    h = `<div class="tf-cl"><svg class="tf-svg" aria-hidden="true"></svg><div class="tf-side l">${left.join('')}</div><div class="tf-mid"><div class="tf-cc">${cc}</div></div><div class="tf-side r">${right.join('')}</div></div>`;
  } else if (tpl === 'ablauf') {
    const sts = b.steps.filter(x => tfStr(x.h).trim() || tfStr(x.t).trim());
    h = `<div class="tf-ab">${sts.map((x, i) => `${i ? `<span class="tf-ar"${st(i + 1)} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 12h16M13 6l6 6-6 6"/></svg></span>` : ''}<div class="tf-st"${st(i + 1)}><span class="tf-sn">${i + 1}</span>${tfStr(x.h).trim() ? `<div class="tf-sh">${tfHead(x.h, o)}</div>` : ''}${tfStr(x.t).trim() ? `<div class="tf-sx">${tfEntry(x.t, o, kf && i === 0)}</div>` : ''}</div>`).join('')}</div>`;
  } else if (tpl === 'skala') {
    const its = b.scale.map((x, i) => ({ x, i })).filter(z => tfStr(z.x.t).trim());
    const col = p => its.filter(z => Math.min(5, Math.max(1, +z.x.p || 3)) === p);
    h = `<div class="tf-sk"><div class="tf-sk-cols">${[1, 2, 3, 4, 5].map(p => `<div class="tf-sk-col">${col(p).map((z, k) => `<div class="tf-si"${st(its.indexOf(z) + 1)}>${tfEntry(z.x.t, o, kf && its.indexOf(z) === 0)}</div>`).join('')}</div>`).join('')}</div>
      <div class="tf-sk-line"></div><div class="tf-sk-poles"><span>${tfHead(b.poles.l, o)}</span>${tfStr(b.poles.m).trim() ? `<span class="m">${tfHead(b.poles.m, o)}</span>` : ''}<span class="r">${tfHead(b.poles.r, o)}</span></div></div>`;
  } else if (tpl === 'figuren') {
    const ns = b.nodes.map((x, i) => ({ ...x, i })).filter(x => tfStr(x.n).trim());
    const pos = tfFigPos(ns); const seen = {};
    const rels = b.rels.filter(r => pos[+r.a] && pos[+r.b] && +r.a !== +r.b);
    const lines = rels.map((r, j) => { const [x1, y1] = pos[+r.a], [x2, y2] = pos[+r.b]; return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${st(j + 1)}/>`; }).join('');
    const labs = rels.map((r, j) => { if (!tfStr(r.t).trim()) return ''; const [x1, y1] = pos[+r.a], [x2, y2] = pos[+r.b]; const key = [+r.a, +r.b].sort().join('-'); const n = seen[key] = (seen[key] || 0) + 1; const off = n > 1 ? 7 : 0;
      return `<span class="tf-rl"${st(j + 1)} style="left:${((x1 + x2) / 2).toFixed(2)}%;top:${((y1 + y2) / 2 + off).toFixed(2)}%">${tfEntry(r.t, o, kf && j === 0)}</span>`; }).join('');
    h = `<div class="tf-fg"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${labs}${ns.map((x, k) => `<div class="tf-nd${ns.length > 3 && !k ? ' c' : ''}" style="left:${pos[x.i][0].toFixed(2)}%;top:${pos[x.i][1].toFixed(2)}%"><div class="tf-nn">${tfHead(x.n, o)}</div>${tfStr(x.d).trim() ? `<div class="tf-nx">${tfEntry(x.d, o, false)}</div>` : ''}</div>`).join('')}</div>`;
  }
  return `<div class="tf tf-${tpl}${tfRaster(b) ? ' tf-raster' : ''}">${showT ? `<div class="tf-t">${inlineHTML(tfStrip(T))}</div>` : ''}${h}</div>`;
}
// Verbindungslinien im Cluster: erst messbar, wenn das Tafelbild im Dokument steht
function tfDraw(root) {
  if (!root) return;
  const cls = root.classList && root.classList.contains('tf-cl') ? [root] : [...root.querySelectorAll('.tf-cl')];
  cls.forEach(cl => {
    const svg = cl.querySelector('.tf-svg'), cc = cl.querySelector('.tf-cc'); if (!svg || !cc) return;
    const W = cl.offsetWidth, H = cl.offsetHeight; if (!W || !H) return;
    const box = e => { let x = 0, y = 0, n = e; while (n && n !== cl) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return { x, y, w: e.offsetWidth, h: e.offsetHeight }; };
    const c = box(cc); const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = [...cl.querySelectorAll('.tf-br')].map(br => { const r = box(br); const left = r.x + r.w / 2 < cx; const x = left ? r.x + r.w : r.x, y = r.y + r.h / 2; const sx = left ? c.x : c.x + c.w; const mx = (sx + x) / 2;
      return `<path d="M${sx.toFixed(1)} ${cy.toFixed(1)} C${mx.toFixed(1)} ${cy.toFixed(1)} ${mx.toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}"${br.dataset.st ? ` data-st="${br.dataset.st}"` : ''}/>`; }).join('');
  });
  tfBake(root);
}
function tfBake(root) {
  if (!root || !root.querySelectorAll) return;
  root.querySelectorAll('.tf svg path, .tf svg line').forEach(p => { const cs = getComputedStyle(p); ['stroke', 'fill', 'stroke-width', 'opacity', 'stroke-linecap', 'stroke-linejoin', 'vector-effect'].forEach(k => { const v = cs.getPropertyValue(k); if (v && v !== 'normal') p.setAttribute(k, v); }); });
}
// Inhalt als Gruppen (Überschrift + Einträge), zum Umwandeln zwischen Vorlagen
function tfGroups(b) {
  const tpl = tfTpl(b);
  if (tfRaster(b)) return b.cols.map((h, ci) => ({ h: tfStr(h), items: b.rows.map(r => tfStr(r[ci])).filter(x => x.trim()) }));
  if (tpl === 'cluster') return b.branches.map(x => ({ h: tfStr(x.h), items: tfLines(x.t) }));
  if (tpl === 'ablauf') return b.steps.map(x => ({ h: tfStr(x.h), items: tfStr(x.t).trim() ? [tfStr(x.t)] : [] }));
  if (tpl === 'skala') return [{ h: '', items: b.scale.map(x => tfStr(x.t)).filter(x => x.trim()) }];
  return b.nodes.map(x => ({ h: tfStr(x.n), items: tfStr(x.d).trim() ? [tfStr(x.d)] : [] }));
}
function tfHas(b, tpl) {
  const any = a => a.some(x => tfStr(x).trim());
  if (tpl === 'gegen' || tpl === 'drei') return b.rows.some(r => any(r)) || (tpl === 'gegen' && any(b.cols));
  if (tpl === 'cluster') return any([b.center]) || b.branches.some(x => any([x.h, x.t]));
  if (tpl === 'ablauf') return b.steps.some(x => any([x.h, x.t]));
  if (tpl === 'skala') return any([b.poles.l, b.poles.r]) || b.scale.some(x => any([x.t]));
  return b.nodes.some(x => any([x.n, x.d]));
}
const tfSplit3 = line => { const p = tfStr(line).split(/\s+[–—]\s+|\s+-\s+|;\s+/).map(x => x.trim()).filter(Boolean); return p.length > 3 ? [p[0], p[1], p.slice(2).join('; ')] : [p[0] || '', p[1] || '', p[2] || '']; };
function tfFill(b, tpl, gs) {
  gs = gs.filter(g => tfStr(g.h).trim() || g.items.length);
  if (tpl === 'gegen') {
    const C = Math.min(4, Math.max(2, gs.length)); b.cols = Array.from({ length: C }, (_, i) => (gs[i] ? gs[i].h : ''));
    const R = Math.max(2, ...gs.slice(0, C).map(g => g.items.length)); b.rows = Array.from({ length: R }, (_, r) => Array.from({ length: C }, (_, c) => (gs[c] && gs[c].items[r]) || ''));
  } else if (tpl === 'drei') {
    if (!b.cols.some(x => tfStr(x).trim()) || b.cols.length !== 3) b.cols = TF_DREI.slice();
    const lines = gs.flatMap(g => g.items); b.rows = (lines.length ? lines : gs.map(g => g.h)).map(tfSplit3); if (!b.rows.length) b.rows = [['', '', '']];
  } else if (tpl === 'cluster') b.branches = gs.length ? gs.slice(0, 8).map(g => ({ h: g.h, t: g.items.join('\n') })) : [{ h: '', t: '' }];
  else if (tpl === 'ablauf') b.steps = (gs.length === 1 && gs[0].items.length > 1 ? gs[0].items.map(t => ({ h: '', t })) : gs.map(g => ({ h: g.h, t: g.items.join('; ') }))).slice(0, 8);
  else if (tpl === 'skala') b.scale = gs.flatMap(g => g.items).slice(0, 16).map(t => ({ t, p: 3 }));
  else if (tpl === 'figuren') b.nodes = gs.slice(0, 8).map(g => ({ n: g.h, d: g.items[0] || '' }));
}
function tfConvert(b, nx) {
  tfNorm(b); const cur = tfTpl(b);
  if (nx === 'drei' && cur === 'gegen' && !b.rows.some(r => r.some(x => tfStr(x).trim()))) { b.cols = TF_DREI.slice(); b.rows = b.rows.map(r => [r[0] || '', r[1] || '', r[2] || '']); return; }
  if ((nx === 'gegen' || nx === 'drei') && (cur === 'gegen' || cur === 'drei')) { if (nx === 'drei' && b.cols.length !== 3) { b.cols = TF_DREI.slice(); b.rows = b.rows.map(r => [r[0] || '', r[1] || '', r[2] || '']); } return; }
  if (!tfHas(b, nx) && tfHas(b, cur)) tfFill(b, nx, tfGroups(b));
  if (nx === 'drei' && b.cols.length !== 3) { b.cols = TF_DREI.slice(); b.rows = b.rows.map(r => [r[0] || '', r[1] || '', r[2] || '']); }
}
// Kurzname einer Aufgabe: „Analysieren Sie den Anfang der Erzählung.“ → „Den Anfang der Erzählung“
function tfLabel(it) {
  const ops = detectOps(it.text || ''); const w = plainText(it.text || '').split('\n')[0].trim().split(/\s+/);
  if (w.length && ops.some(o => w[0].toLowerCase().startsWith(String(o.op).slice(0, 4).toLowerCase()))) w.shift();
  if (/^(sie|du|ihr)[,:]?$/i.test(w[0] || '')) w.shift();
  let t = w.join(' ').replace(/\s*\([^)]*\)/g, '').replace(/[.!?:;,]+$/, '').trim();
  if (t.length > 46) t = t.slice(0, 46).replace(/\s+\S*$/, '') + ' …';
  return t ? t[0].toUpperCase() + t.slice(1) : 'Aufgabe';
}
function tfSuggest(b) {
  tfNorm(b); const tpl = tfTpl(b); const sh = state.sheet, v = sheetView();
  if (tpl === 'figuren') { toast('Für die Figurenkonstellation gibt es keinen automatischen Vorschlag. Trag die Figuren und Beziehungen ein.'); return -1; }
  const gs = []; sh.blocks.forEach(x => { if (x.type !== 'tasks' || !blockVisible(x, v)) return; itemsFor(x, v).forEach(it => { const eh = ehLines(it); if (eh.length) gs.push({ h: tfLabel(it), items: eh.map(z => tfStr(z).trim()).filter(Boolean) }); }); });
  if (!gs.length) { toast('Es gibt noch keine Erwartungen. Trag unter den Aufgaben bei „Erwartung“ die erwarteten Ergebnisse ein, dann entsteht daraus der Vorschlag.'); return -1; }
  if (tpl === 'gegen') { b.cols = ['', '']; b.rows = []; } else if (tpl === 'drei') b.rows = []; else if (tpl === 'cluster') b.branches = []; else if (tpl === 'ablauf') b.steps = []; else if (tpl === 'skala') b.scale = [];
  tfFill(b, tpl, gs);
  if (!tfStr(b.title).trim()) b.title = tfStr(sh.meta.title).trim();
  return gs.length;
}

/* Ausgabe „Tafelbild“: je Baustein eine Seite A4 quer, vollständig (Lehrerfassung) oder als Lückenfassung */
function layoutTafel() {
  const sh = state.sheet, m = sh.meta; const v = sheetView(); const host = $('#fit-host'); const full = state.fassung === 'lehrer'; const out = [];
  const tbs = stBlocks().filter(b => b.type === 'tafel' && blockVisible(b, v));
  tbs.forEach((b, i) => {
    const pg = el(`<div class="page tf-page" data-w="297" data-h="210"><div class="tf-frame">${tafelHTML(b, { gaps: !full })}</div><div class="tf-foot"><span>${esc([m.nr ? 'AB ' + m.nr : '', tfStrip(m.title)].filter(Boolean).join(' · '))}</span><span>${full ? 'Tafelbild' : 'Tafelbild · Lückenfassung'}${tbs.length > 1 ? ` · ${i + 1}/${tbs.length}` : ''}</span></div></div>`);
    setAccent(pg, m); host.appendChild(pg);
    const tf = pg.querySelector('.tf'); fitUp(tf, pg.querySelector('.tf-frame'), 44); tfDraw(pg);
    host.removeChild(pg); out.push({ pg, over: false });
  });
  return out;
}

/* Beamer: Tafelbild bildschirmfüllend, Schritt für Schritt aufdecken */
function tfBeamer(bid) {
  const v = sheetView(); const list = stBlocks().filter(x => x.type === 'tafel' && blockVisible(x, v));
  if (!list.length) { toast('Es gibt noch kein Tafelbild. Füg unten bei den Bausteinen „Tafelbild“ hinzu.'); return; }
  const S = { k: Math.max(0, list.findIndex(x => x.id === bid)), cur: 0, max: 0, gaps: false, board: false };
  try { S.board = localStorage.getItem('abw.tfboard') === '1'; } catch {}
  const ov = el(`<div class="tf-beam${S.board ? ' board' : ''}" role="dialog" aria-label="Tafelbild am Beamer" tabindex="-1"><div class="tf-bm-stage"></div>
    <div class="tf-bm-bar"><button type="button" data-b="prev" title="Zurück (Pfeil links)" aria-label="Zurück">‹</button><span class="tf-bm-n" aria-live="polite"></span><button type="button" data-b="next" title="Weiter (Pfeil rechts oder Leertaste)" aria-label="Weiter">›</button><span class="sep"></span>
    <button type="button" data-b="all">Alles zeigen</button><button type="button" data-b="gaps" aria-pressed="false">Lückenfassung</button><button type="button" data-b="board" aria-pressed="${S.board}">Tafelgrün</button><button type="button" data-b="full">Vollbild</button><button type="button" data-b="close">Schließen</button></div></div>`);
  setAccent(ov, state.sheet.meta); document.body.appendChild(ov);
  const stage = ov.querySelector('.tf-bm-stage');
  const apply = () => {
    stage.querySelectorAll('[data-st]').forEach(e => e.classList.toggle('tf-hid', +e.dataset.st > S.cur));
    const n = ov.querySelector('.tf-bm-n'); n.textContent = (list.length > 1 ? `Tafelbild ${S.k + 1} von ${list.length}` : '') + (list.length > 1 && S.max ? ' · ' : '') + (S.max ? `Schritt ${S.cur} von ${S.max}` : '');
    ov.querySelector('[data-b="prev"]').disabled = !S.cur && !S.k; ov.querySelector('[data-b="next"]').disabled = S.cur >= S.max && S.k >= list.length - 1;
    ov.querySelector('[data-b="all"]').disabled = S.cur >= S.max;
  };
  const fit = () => { const tf = stage.querySelector('.tf'); if (!tf) return; stage.querySelectorAll('.tf-hid').forEach(e => e.classList.remove('tf-hid')); fitUp(tf, stage, Math.max(18, Math.round(stage.clientHeight / 9))); tfDraw(stage); apply(); };
  const show = () => { stage.innerHTML = tafelHTML(list[S.k], { gaps: S.gaps, steps: true }); const tf = stage.querySelector('.tf'); S.max = Math.max(0, ...[...tf.querySelectorAll('[data-st]')].map(e => +e.dataset.st)); fit(); };
  const next = () => { if (S.cur < S.max) { S.cur++; apply(); } else if (S.k < list.length - 1) { S.k++; S.cur = 0; show(); } };
  const prev = () => { if (S.cur > 0) { S.cur--; apply(); } else if (S.k > 0) { S.k--; show(); S.cur = S.max; apply(); } };
  const wake = keepAwake();
  const close = () => { wake(); document.removeEventListener('keydown', key, true); window.removeEventListener('resize', onRs); try { if (document.fullscreenElement) document.exitFullscreen(); } catch {} ov.remove(); };
  const key = e => {
    if ((e.key === ' ' || e.key === 'Enter') && e.target.closest && e.target.closest('.tf-bm-bar button')) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') { e.preventDefault(); e.stopPropagation(); prev(); }
    else if (e.key === 'Home') { e.preventDefault(); S.cur = 0; apply(); } else if (e.key === 'End') { e.preventDefault(); S.cur = S.max; apply(); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (!document.fullscreenElement) close(); }
  };
  let rt = 0; const onRs = () => { clearTimeout(rt); rt = setTimeout(fit, 120); };
  ov.addEventListener('click', e => {
    const bt = e.target.closest('[data-b]'); if (!bt) { if (e.target.closest('.tf-bm-stage')) next(); return; }
    const k = bt.dataset.b;
    if (k === 'next') next(); else if (k === 'prev') prev(); else if (k === 'all') { S.cur = S.max; apply(); } else if (k === 'close') close();
    else if (k === 'gaps') { S.gaps = !S.gaps; bt.setAttribute('aria-pressed', String(S.gaps)); const c = S.cur; show(); S.cur = Math.min(c, S.max); apply(); }
    else if (k === 'board') { S.board = !S.board; ov.classList.toggle('board', S.board); bt.setAttribute('aria-pressed', String(S.board)); try { localStorage.setItem('abw.tfboard', S.board ? '1' : '0'); } catch {} }
    else if (k === 'full') { try { if (document.fullscreenElement) document.exitFullscreen(); else if (ov.requestFullscreen) ov.requestFullscreen().catch(() => toast('Vollbild ist hier nicht möglich. Im Browser geht es mit F11.')); } catch { toast('Vollbild ist hier nicht möglich. Im Browser geht es mit F11.'); } }
  });
  document.addEventListener('keydown', key, true); window.addEventListener('resize', onRs);
  show(); ov.focus();
}

/* Editor des Bausteins */
function tafelEditor(b) {
  tfNorm(b); const tpl = tfTpl(b); const on = b.onSheet || 'luecke'; const gm = b.gapMode === 'wort' ? 'wort' : 'eintrag';
  const inp = (k, v, ph, cls) => `<input type="text"${cls ? ` class="${cls}"` : ''} data-k="${k}" value="${esc(tfStr(v))}" placeholder="${esc(ph || '')}">`;
  const del = (w, i, dis) => `<button class="ib" type="button" data-act="tf-del" data-w="${w}" data-i="${i}" title="Entfernen" aria-label="Entfernen"${dis ? ' disabled' : ''}>${I.x}</button>`;
  const add = (w, l, dis) => `<button class="link" type="button" data-act="tf-add" data-w="${w}"${dis ? ' disabled' : ''}>+ ${l}</button>`;
  let c = '';
  if (tfRaster(b)) {
    const C = b.cols.length;
    c = `<div class="tf-ed-grid" style="--n:${C}">${b.cols.map((h, i) => inp(`cols.${i}`, h, tpl === 'drei' ? (TF_DREI[i] || 'Spalte') : ['Spalte 1, z. B. Pro', 'Spalte 2, z. B. Contra', 'Spalte 3', 'Spalte 4'][i], 'tf-hd')).join('')}<span></span>
      ${b.rows.map((r, ri) => b.cols.map((_, ci) => inp(`rows.${ri}.${ci}`, r[ci], ri ? '' : 'Eintrag')).join('') + del('rows', ri, b.rows.length < 2)).join('')}</div>
      <div class="tf-ed-acts">${add('rows', 'Zeile', b.rows.length >= 14)}${add('cols', 'Spalte', C >= 4)}${C > 2 ? `<button class="link" type="button" data-act="tf-del" data-w="cols" data-i="${C - 1}">− Spalte</button>` : ''}</div>`;
  } else if (tpl === 'cluster') {
    c = `${fText('center', 'Begriff in der Mitte', b.center, tfStr(b.title).trim() ? 'leer = Überschrift' : 'z. B. Nähe als Strategie')}
      <div class="tf-ed-list">${b.branches.map((x, i) => `<div class="tf-ed-br"><div class="tf-ed-row two">${inp(`branches.${i}.h`, x.h, `Zweig ${i + 1}`, 'tf-hd')}${del('branches', i, b.branches.length < 2)}</div><textarea data-k="branches.${i}.t" rows="${Math.max(2, Math.min(6, tfLines(x.t).length + 1))}" placeholder="Einträge, einer je Zeile">${esc(tfStr(x.t))}</textarea></div>`).join('')}</div>
      <div class="tf-ed-acts">${add('branches', 'Zweig', b.branches.length >= 8)}</div>`;
  } else if (tpl === 'ablauf') {
    c = `<div class="tf-ed-list">${b.steps.map((x, i) => `<div class="tf-ed-row ab"><span class="tf-ed-n">${i + 1}</span>${inp(`steps.${i}.h`, x.h, i ? 'Überschrift' : 'Überschrift, z. B. Ausgangslage', 'tf-hd')}${inp(`steps.${i}.t`, x.t, 'Inhalt')}${del('steps', i, b.steps.length < 2)}</div>`).join('')}</div>
      <div class="tf-ed-acts">${add('steps', 'Schritt', b.steps.length >= 8)}</div>`;
  } else if (tpl === 'skala') {
    c = `<div class="row">${fText('poles.l', 'Pol links', b.poles.l, 'z. B. Nähe')}${fText('poles.m', 'Mitte (optional)', b.poles.m, '')}${fText('poles.r', 'Pol rechts', b.poles.r, 'z. B. Distanz')}</div>
      <div class="tf-ed-list">${b.scale.map((x, i) => `<div class="tf-ed-row sk">${inp(`scale.${i}.t`, x.t, 'Eintrag, z. B. duzt die Follower')}<select data-k="scale.${i}.p" aria-label="Position auf der Skala">${TF_POS.map((l, k) => `<option value="${k + 1}"${(+x.p || 3) === k + 1 ? ' selected' : ''}>${l}</option>`).join('')}</select>${del('scale', i, b.scale.length < 2)}</div>`).join('')}</div>
      <div class="tf-ed-acts">${add('scale', 'Eintrag', b.scale.length >= 16)}</div>`;
  } else {
    const nodeSel = (k, val) => `<select data-k="${k}" aria-label="Figur">${b.nodes.map((x, i) => `<option value="${i}"${+val === i ? ' selected' : ''}>${esc(tfStrip(x.n).trim() || 'Figur ' + (i + 1))}</option>`).join('')}</select>`;
    c = `<div class="f"><span>Figuren (die erste steht in der Mitte)</span><div class="tf-ed-list">${b.nodes.map((x, i) => `<div class="tf-ed-row ab"><span class="tf-ed-n">${i + 1}</span>${inp(`nodes.${i}.n`, x.n, i ? 'Name' : 'Hauptfigur', 'tf-hd')}${inp(`nodes.${i}.d`, x.d, 'kurz: Rolle, Merkmal (optional)')}${del('nodes', i, b.nodes.length < 2)}</div>`).join('')}</div>
      <div class="tf-ed-acts">${add('nodes', 'Figur', b.nodes.length >= 8)}</div></div>
      <div class="f"><span>Beziehungen</span><div class="tf-ed-list">${b.rels.map((r, j) => `<div class="tf-ed-row rel">${nodeSel(`rels.${j}.a`, r.a)}${inp(`rels.${j}.t`, r.t, 'z. B. Vater von, liebt')}${nodeSel(`rels.${j}.b`, r.b)}${del('rels', j, false)}</div>`).join('')}</div>
      <div class="tf-ed-acts">${add('rels', 'Beziehung', b.rels.length >= 16 || b.nodes.length < 2)}</div></div>`;
  }
  return `<div class="f"><span>Vorlage</span><div class="tf-tpls" role="group" aria-label="Vorlage">${Object.entries(TF_TPL).map(([k, x]) => `<button type="button" class="tf-tp" data-act="tf-tpl" data-v="${k}" aria-pressed="${tpl === k}" title="${esc(x.d)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${x.ic}</svg><span>${x.label}</span></button>`).join('')}</div></div>
    ${fText('title', 'Überschrift', b.title, 'z. B. Nähe als Strategie')}
    <div class="tf-ed">${c}</div>
    <div class="tf-ed-acts main"><button class="btn sm" type="button" data-act="tf-sugg"${tpl === 'figuren' ? ' disabled title="Für die Figurenkonstellation gibt es keinen Vorschlag"' : ''}>Aus dem Erwartungshorizont vorschlagen</button><button class="btn sm" type="button" data-act="tf-beam">Am Beamer zeigen</button></div>
    <div class="f"><span>Auf dem Arbeitsblatt</span><div class="seg sm" role="group" aria-label="Auf dem Arbeitsblatt">${[['luecke', 'Lückentafelbild'], ['voll', 'Vollständig'], ['aus', 'Nur Tafel und Beamer']].map(([v, l]) => `<button type="button" data-act="tf-on" data-v="${v}" aria-pressed="${on === v}">${l}</button>`).join('')}</div></div>
    ${on === 'luecke' ? `<div class="f"><span>Lücken</span><div class="seg sm" role="group" aria-label="Lücken">${[['eintrag', 'Ganze Einträge'], ['wort', 'Nur markierte Wörter']].map(([v, l]) => `<button type="button" data-act="tf-gm" data-v="${v}" aria-pressed="${gm === v}">${l}</button>`).join('')}</div></div>
      ${gm === 'eintrag' ? `<div class="chks">${fCheck('keepFirst', 'Erster Eintrag bleibt als Beispiel stehen', b.keepFirst)}</div>` : ''}
      <small class="hint">${gm === 'wort' ? 'Setz die Wörter, die zur Lücke werden, in eckige Klammern, etwa: Der Politiker [duzt] seine Follower.' : 'Überschriften und Begriffe bleiben stehen, die Einträge werden zu Schreibzeilen.'} In der Lehrerfassung stehen die Lösungen farbig.</small>` : ''}`;
}

