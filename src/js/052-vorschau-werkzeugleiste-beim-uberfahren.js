/* ================= Vorschau: Werkzeugleiste beim Überfahren und „+“ zwischen Bausteinen ================= */
const PVT = { bid: null, el: null, hide: 0, ins: null };
const PVT_IC = {
  up: '<path d="M8 12.5V3.5M4 7.5l4-4 4 4"/>', down: '<path d="M8 3.5v9M4 8.5l4 4 4-4"/>',
  dup: '<rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 3.5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v6.5a1 1 0 0 0 1 1h.5"/>',
  del: '<path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5"/>', edit: '<path d="M3 13l.7-3L10.8 2.9a1.4 1.4 0 0 1 2 2L5.8 12z"/>',
  fol: '<rect x="1.8" y="3" width="12.4" height="8.4" rx="1.2"/><path d="M8 11.4V14M5.5 14h5"/>', dz: '<path d="M9.6 2.6l3.8 3.8-5.6 5.6-3.8-3.8z"/><path d="M4 8.2c-1.6.3-2.3 1.4-2.3 3 0 .9-.3 1.6-.9 2.2 2.6.4 4.6-.4 5.4-1.6"/>', insA: '<path d="M2.5 2.5h11"/><path d="M8 6.5v7M4.5 10h7"/>', insB: '<path d="M2.5 13.5h11"/><path d="M8 2.5v7M4.5 6h7"/>', res: '<path d="M3 3.5h10v9H3z"/><path d="M5.5 6.5h5M5.5 9.5h3"/><path d="M11.5 1.5v3M4.5 1.5v3"/>'
};
const pvI = k => `<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PVT_IC[k]}</svg>`;
const pvOn = () => state.out === 'blatt' && !MAPPE_LOCK && !DG_VIEW && !state.gapEdit && !hmS.open && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
// Reihenfolge so, wie sie auf dem Blatt steht: nur Bausteine, die in der Vorschau vorkommen, und Seitenumbrüche
function pvOrder() { const on = new Set([...document.querySelectorAll('#pages [data-bid]')].map(n => n.dataset.bid)); return state.sheet.blocks.map((b, i) => [b, i]).filter(([b]) => on.has(b.id) || b.type === 'pagebreak'); }
function pvBlockEl(t) { const n = t && t.closest && t.closest('#pages [data-bid]'); if (!n) return null; const bid = n.dataset.bid; return state.sheet.blocks.some(b => b.id === bid) ? n : null; }
function pvHide() { const t = $('#pv-tools'), i = $('#pv-ins'); if (t) t.hidden = true; if (i) i.hidden = true; PVT.bid = null; PVT.el = null; }
// Schnellfeld beim Überfahren eines Materials: die häufigsten Entscheidungen auf einen Blick
function pvQuick(b) {
  if (!b || b.type !== 'material' || b.post) return '';
  const f = matFmt(b), poem = b.form === 'gedicht';
  const seg = (lab, q, opts, cur) => `<div class="pvq-r"><span>${lab}</span><div class="pvq-seg">${opts.map(([v, l]) => `<button type="button" data-pv="q" data-q="${q}" data-v="${v}" class="${String(cur) === v ? 'on' : ''}" aria-pressed="${String(cur) === v}">${l}</button>`).join('')}</div></div>`;
  const tg = (lab, q, on, dis, tip) => `<button type="button" class="pvq-t${on ? ' on' : ''}" data-pv="q" data-q="${q}" role="switch" aria-checked="${on}"${dis ? ` disabled title="${tip}"` : ''}><i></i>${lab}</button>`;
  let h = seg('Spalten', 'cols', [['1', 'eine'], ['2', 'zwei']], f.cols);
  if (!poem) h += seg('Satz', 'align', [['justify', 'Blocksatz'], ['left', 'linksbündig']], f.align);
  h += `<div class="pvq-tg">${tg('Rand für Notizen', 'margin', f.margin, f.cols === 2, 'Nur bei einer Spalte')}${tg(poem ? 'Verszählung' : 'Zeilennummern', 'ln', b.lineNumbers !== false)}${poem ? '' : tg('Silbentrennung', 'hy', mwHyOn(b), f.align === 'left' || !!f.silben, 'Nur im Blocksatz ohne Silbenhilfe')}${poem ? '' : tg('Einzug bei Absätzen', 'indent', f.indent)}${poem ? '' : tg('Vorschläge zum Glossieren', 'glsug', GLS.on)}</div>`;
  if (f.margin) h += seg('Randbreite', 'mrw', MAT_FMT.mrw.opts, f.mrw);
  if (!poem && matHasH(b.text)) h += seg('Zwischen\u00adüberschriften', 'gapHd', GAP_HD.map(([v, l]) => [v, ({ '': 'bleiben', weg: 'weg', luecke: 'Linie', kasten: 'Linie + Kasten' })[v] || l]), b.gapHd || '');
  h += `<div class="pvq-b"><button type="button" data-pv="q" data-q="gaps">Lücken setzen</button><button type="button" data-pv="dz">Mehr Gestaltung …</button></div>`;
  return `<div class="pvq">${h}</div>`;
}
function pvQAct(a) {
  const b = state.sheet.blocks.find(x => x.id === PVT.bid); if (!b) return; const q = a.dataset.q, v = a.dataset.v, f = matFmt(b);
  const F = (k, val) => { b.fmt = { ...(b.fmt || {}), [k]: val }; };
  if (q === 'cols') { F('cols', v); if (v === '2') F('margin', false); }
  else if (q === 'align') F('align', v);
  else if (q === 'margin') F('margin', !f.margin);
  else if (q === 'indent') F('indent', !f.indent);
  else if (q === 'mrw') F('mrw', v);
  else if (q === 'ln') b.lineNumbers = b.lineNumbers === false;
  else if (q === 'hy') b.hy = !mwHyOn(b);
  else if (q === 'gapHd') { if (v) b.gapHd = v; else delete b.gapHd; }
  else if (q === 'glsug') { glSugSet(!GLS.on); a.classList.toggle('on', GLS.on); a.setAttribute('aria-checked', GLS.on); return; }
  else if (q === 'gaps') { pvHide(); const fake = document.createElement('button'); fake.dataset.act = 'gap-edit'; const holder = document.createElement('div'); holder.dataset.bid = b.id; holder.append(fake); onClick({ target: fake, preventDefault() {}, stopPropagation() {} }); return; }
  const bid = PVT.bid; PVT.bid = null; PVT.follow = bid; changed(true);
}
function pvShow(n) {
  const t = $('#pv-tools'), ins = $('#pv-ins'); if (!t || !n || !n.isConnected) return pvHide();
  const bid = n.dataset.bid; const b = state.sheet.blocks.find(x => x.id === bid); if (!b) return pvHide();
  const ord = pvOrder(); const k = ord.findIndex(([x]) => x.id === bid);
  if (PVT.bid !== bid) {
    const dzB = DZ_TYPES.has(b.type) ? `<button type="button" data-pv="dz" class="${state.dz && state.dz.k === 'block' && state.dz.bid === bid ? 'on' : ''}" title="Gestaltung: ${b.type === 'material' ? 'Schrift, Größe, Zeilenabstand, Einzug, Rand' : 'Stil'}">${pvI('dz')}</button>` : '';
    const extra = dzB + (b.type === 'table' ? `<button type="button" data-pv="tbm" title="Tabelle groß bearbeiten (Doppelklick)"><svg viewBox="0 0 24 24" aria-hidden="true" style="fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg></button>` : '') + (PRES_OPT.has(b.type) ? `<button type="button" data-pv="pres-tg" class="${presOn(b) ? 'on' : ''}" aria-pressed="${presOn(b)}" title="${presOn(b) ? 'Steht auf einer Folie · klicken zum Entfernen' : 'Auf die Folie'}">${pvI('fol')}</button>` : '')
      + (b.type === 'tasks' ? `<button type="button" data-pv="res-tg" class="${isRes(b) ? 'on' : ''}" aria-pressed="${isRes(b)}" title="${isRes(b) ? 'Ist Reserve · klicken, um sie wieder normal zu zählen' : 'Als Reserve: auf den Folien, nicht in der Phasenleiste und nicht in der Stundenzeit'}">${pvI('res')}</button>` : '');
    if (PVT.qx == null) { try { PVT.qx = localStorage.getItem('abw.pvqx') === '1'; } catch { PVT.qx = false; } }
    const qOn = b.type === 'material' && !b.post && PVT.qx && innerWidth >= 1100 && innerHeight >= 700;
    t.classList.toggle('has-q', qOn);
    t.innerHTML = `<span class="pvt-l">${esc(typeLabel(b))}</span><button type="button" data-pv="edit" title="Links bearbeiten">${pvI('edit')}</button><button type="button" data-pv="up" title="Nach oben"${k <= 0 ? ' disabled' : ''}>${pvI('up')}</button><button type="button" data-pv="down" title="Nach unten"${k < 0 || k >= ord.length - 1 ? ' disabled' : ''}>${pvI('down')}</button>${extra}<button type="button" data-pv="dup" title="Verdoppeln">${pvI('dup')}</button><span class="pvt-sep" aria-hidden="true"></span><button type="button" data-pv-ins="a" title="Darüber einen Baustein einfügen">${pvI('insA')}</button><button type="button" data-pv-ins="b" title="Darunter einen Baustein einfügen">${pvI('insB')}</button><span class="pvt-sep" aria-hidden="true"></span><button type="button" data-pv="del" class="danger" title="Löschen">${pvI('del')}</button>`;
    if (b.type === 'material' && !b.post) { t.insertAdjacentHTML('beforeend', `<button type="button" data-pv="qx" class="pvq-x${qOn ? ' on' : ''}" aria-expanded="${qOn}" title="${qOn ? 'Schnelleinstellungen zuklappen' : 'Schnelleinstellungen: Spalten, Satz, Rand, Zeilennummern, Zwischenüberschriften'}">Aa</button>`); if (qOn) t.insertAdjacentHTML('beforeend', pvQuick(b)); }
  }
  PVT.bid = bid; PVT.el = n; t.hidden = false; ins.hidden = false;
  const r = n.getBoundingClientRect(), pr = (n.closest('.page, .pout') || n).getBoundingClientRect(), vr = $('#preview-scroll').getBoundingClientRect();
  const tw = t.offsetWidth, th = t.offsetHeight;
  let left = pr.right + 8; if (left + tw > vr.right - 4) left = Math.max(vr.left + 4, r.right - tw);
  let top = Math.max(vr.top + 4, Math.min(r.top, vr.bottom - th - 4)); if (left < pr.right) top = Math.max(vr.top + 4, r.top - th - 4);
  t.style.left = left + 'px'; t.style.top = top + 'px';
  ins.innerHTML = ''; ins.hidden = true;
}
function pvInsOpen(at, anchor) {
  const L = paletteFor(); const Q = (isGS() ? QUICK_GS : fachBase() === 'ma' ? QUICK_MA : QUICK).map(k => L.find(t => t.k === k)).filter(Boolean); const pbE = L.find(t => t.type === 'pagebreak');
  const pop = $('#pv-insp'); PVT.ins = at;
  pop.innerHTML = `<div class="pvp-h">Hier einfügen</div>${Q.map(t => `<button type="button" data-pvadd="${t.k}" data-type="${t.type}"><i>${typeIcon(t.ic)}</i><span>${esc(t.label)}</span></button>`).join('')}${pbE ? `<button type="button" data-pvadd="${pbE.k}" data-type="pagebreak"><i>${typeIcon(pbE.ic)}</i><span>Hier neue Seite beginnen</span></button>` : ''}<button type="button" data-pvadd="*" class="more"><span>Weitere Bausteine …</span></button>`;
  pop.hidden = false; const r = anchor.getBoundingClientRect();
  let left = r.left - pop.offsetWidth / 2, top = r.bottom + 6; left = Math.max(8, Math.min(left, innerWidth - pop.offsetWidth - 8)); if (top + pop.offsetHeight > innerHeight - 8) top = Math.max(8, r.top - pop.offsetHeight - 6);
  pop.style.left = left + 'px'; pop.style.top = top + 'px'; const f = pop.querySelector('button'); if (f) f.focus({ preventScroll: true });
}
const pvInsClose = () => { const p = $('#pv-insp'); if (p) { p.hidden = true; p.innerHTML = ''; } PVT.ins = null; document.querySelectorAll('#pv-tools [data-pv-ins].on').forEach(x => x.classList.remove('on')); };
function pvInsert(at, pk, type) {
  const blocks = state.sheet.blocks; const nb = paletteBlock(pk, type); at = Math.max(0, Math.min(blocks.length, at));
  blocks.splice(at, 0, nb); state.sel = nb.id; openOnly(nb.id); saveClosed(); changed(true);
  setTimeout(() => { const nc = $(`#editor [data-bid="${nb.id}"]`); if (nc) { nc.scrollIntoView({ block: 'start', behavior: 'smooth' }); const f = nc.querySelector('input[type=text],textarea,.rtx'); if (f) f.focus({ preventScroll: true }); } }, 60);
}
function pvAct(act) {
  const bid = PVT.bid; const blocks = state.sheet.blocks; const idx = blocks.findIndex(x => x.id === bid); const b = blocks[idx]; if (!b) return;
  if (act === 'tbm') { pvHide(); tbmOpen(bid); return; }
  if (act === 'dz') { const n = PVT.el; if (state.dz && state.dz.k === 'block' && state.dz.bid === bid) dzClose(); else { state.sel = bid; markSel(); dzOpen('block', bid, n && n.isConnected ? n.getBoundingClientRect() : null); const tr = $('#pv-tools').getBoundingClientRect(); state.dz.x = Math.round(tr.right - Math.min(360, innerWidth - 24)); state.dz.y = Math.round(tr.bottom + 6); dzRender(); } const t = $('#pv-tools [data-pv="dz"]'); if (t) t.classList.toggle('on', !!state.dz); return; }
  if (act === 'edit') { state.sel = bid; if (state.allOpen) state.closed.delete(bid); else openOnly(bid); saveClosed(); if (window.matchMedia('(max-width: 899px)').matches) setView('edit'); renderEditor(); const c = $(`#editor [data-bid="${bid}"]`); if (c) { c.scrollIntoView({ block: 'start', behavior: 'smooth' }); c.classList.add('flash'); setTimeout(() => c.classList.remove('flash'), 1200); } return; }
  if (act === 'up' || act === 'down') {
    const ord = pvOrder(); const k = ord.findIndex(([x]) => x.id === bid); const o = ord[act === 'up' ? k - 1 : k + 1]; if (!o) return;
    blocks.splice(idx, 1); const j = blocks.indexOf(o[0]); blocks.splice(act === 'up' ? j : j + 1, 0, b);
    state.sel = bid; PVT.follow = bid; PVT.bid = null; changed(true); return;
  }
  // die übrigen Handgriffe wie an der Karte
  const fake = document.createElement('button'); fake.dataset.act = act === 'pres-tg' || act === 'res-tg' ? act : act; const holder = document.createElement('div'); holder.dataset.bid = bid; holder.append(fake);
  PVT.bid = null; if (act !== 'del') PVT.follow = bid; onClick({ target: fake, preventDefault() {}, stopPropagation() {} });
}
function pvInit() {
  const pages = $('#pages'), sc = $('#preview-scroll'); if (!pages || !sc) return;
  ['pv-tools', 'pv-ins', 'pv-insp'].forEach(id => { const d = document.createElement('div'); d.id = id; d.hidden = true; if (id === 'pv-tools') { d.setAttribute('role', 'toolbar'); d.setAttribute('aria-label', 'Baustein bearbeiten'); } document.body.append(d); });
  const keep = () => clearTimeout(PVT.hide), later = () => { clearTimeout(PVT.hide); PVT.hide = setTimeout(() => { if (!PVT.ins) pvHide(); }, 380); };
  // Ausblenden nur, wenn die Maus wirklich woanders hin bewegt wird (nicht, wenn die Leiste dem Baustein nachrückt)
  document.addEventListener('mousemove', e => {
    const t = e.target; if (t.closest && t.closest('#pv-tools, #pv-insp, .pvi')) { keep(); return; }
    const n = t.closest && t.closest('#pages') ? pvBlockEl(t) : null;
    if (n) { if (!pvOn()) return pvHide(); keep(); if (n !== PVT.el) pvShow(n); } else if (PVT.bid || PVT.el) later();
  }, { passive: true });
  $('#pv-tools').addEventListener('click', e => { const ia = e.target.closest('[data-pv-ins]');
    if (ia) { e.stopPropagation(); keep(); const ord = pvOrder(), k = ord.findIndex(([x]) => x.id === PVT.bid); if (k < 0) return; if (PVT.ins != null && ia.classList.contains('on')) { pvInsClose(); return; } pvInsClose(); ia.classList.add('on'); pvInsOpen(ord[k][1] + (ia.dataset.pvIns === 'b' ? 1 : 0), ia); return; }
    const a = e.target.closest('[data-pv]'); if (a && !a.disabled) { e.stopPropagation(); if (a.dataset.pv === 'q') pvQAct(a); else if (a.dataset.pv === 'qx') { PVT.qx = !PVT.qx; try { localStorage.setItem('abw.pvqx', PVT.qx ? '1' : '0'); } catch {} const n = PVT.el; PVT.bid = null; pvShow(n); } else pvAct(a.dataset.pv); } });
  $('#pv-ins').addEventListener('click', e => { const a = e.target.closest('.pvi'); if (a) { e.stopPropagation(); keep(); pvInsOpen(+a.dataset.at, a); } });
  $('#pv-insp').addEventListener('click', e => { const a = e.target.closest('[data-pvadd]'); if (!a) return; const at = PVT.ins; pvInsClose(); pvHide();
    if (a.dataset.pvadd === '*') { state.insAt = at; if ((state.area || 'blatt') !== 'blatt') setArea('blatt'); bkOpen(); return; }
    pvInsert(at, a.dataset.pvadd, a.dataset.type); });
  document.addEventListener('mousedown', e => { if (PVT.ins != null && !e.target.closest('#pv-insp, #pv-ins, #pv-tools [data-pv-ins]')) { pvInsClose(); later(); } }, true);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && PVT.ins != null) { pvInsClose(); pvHide(); } });
  sc.addEventListener('scroll', () => { if (PVT.ins != null) pvInsClose(); const f = PVT.bid || PVT.follow; if (!f) return; const n = PVT.el && PVT.el.isConnected ? PVT.el : $(`#pages [data-bid="${f}"]`); if (n) { const keepB = PVT.el === n ? PVT.bid : null; PVT.bid = null; pvShow(n); if (keepB) PVT.bid = keepB; } else if (!PVT.follow) pvHide(); }, { passive: true });
  // Nach dem Neuzeichnen: Leiste beim selben Baustein halten (etwa nach „nach oben“)
  let mo = 0; new MutationObserver(() => { clearTimeout(mo); mo = setTimeout(() => { const f = PVT.follow || PVT.bid; if (!f) return; const el = PVT.el; if (el && el.isConnected && !PVT.follow) return; let tries = 0; const look = () => { const n = $(`#pages [data-bid="${f}"]`); if (n && pvOn()) { PVT.follow = null; PVT.bid = null; pvShow(n); return; } if (++tries < 12) { setTimeout(look, 90); return; } PVT.follow = null; pvHide(); }; look(); }, 60); }).observe(pages, { childList: true });
}

