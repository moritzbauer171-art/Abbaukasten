/* ================= Menü an der Karte (⋯) ================= */
const menu = { open: null };
function openMenu(bid, anchor) { menu.open = { bid, rect: rectOf(anchor) }; renderMenu(); }
function closeMenu() { if (!menu.open) return; menu.open = null; renderMenu(); }
function renderMenu() {
  const root = $('#menu-root'); const o = menu.open;
  if (!o) { root.innerHTML = ''; return; }
  const b = target(o.bid); if (!b) { menu.open = null; root.innerHTML = ''; return; }
  const gOn = state.sheet.meta.groupsOn; const g = b.group || '';
  root.innerHTML = `<div class="mn" id="mn" role="menu">
    ${(() => { const L = state.sheet.blocks; const i = L.findIndex(x => x.id === o.bid); return i < 0 ? '' : `<button type="button" role="menuitem" data-mn="up"${i === 0 ? ' disabled' : ''}>Nach oben</button><button type="button" role="menuitem" data-mn="down"${i === L.length - 1 ? ' disabled' : ''}>Nach unten</button><hr>`; })()}
    <button type="button" role="menuitem" data-mn="dup">Duplizieren</button>
    ${PHT_NO.has(b.type) ? '' : `<button type="button" role="menuitem" data-mn="pht">${itPh(b) || itMin(b) ? 'Phase und Zeit ändern' : 'Phase und Zeit festlegen'}</button>`}
    ${b.type === 'tasks' ? '<button type="button" role="menuitem" data-mn="oph-all">Tipps zu allen Aufgaben vorschlagen</button>' : ''}
    ${b.type === 'pagebreak' ? '' : '<button type="button" role="menuitem" data-mn="snip">In der Sammlung speichern</button>'}
    ${state.sheet.meta.levelsOn && b.type !== 'pagebreak' ? `<hr><small>Niveau</small>${Object.entries(LV).map(([k, x]) => `<button type="button" role="menuitemcheckbox" aria-checked="${!Array.isArray(b.lv) || b.lv.includes(k)}" data-mn="lv" data-v="${k}">${x.sym} ${x.name}</button>`).join('')}` : ''}
    ${gOn ? `<hr><small>Gilt für</small>${[['', 'Alle Gruppen'], ...grpList(state.sheet.meta).map(x => [x.k, 'Nur ' + esc(grpName(state.sheet.meta, x.k))])].map(([v, l]) => `<button type="button" role="menuitemradio" aria-checked="${g === v}" data-mn="grp" data-v="${v}">${l}</button>`).join('')}` : ''}
    <hr><button type="button" role="menuitem" class="danger" data-mn="del">Löschen</button></div>`;
  const m = $('#mn'); const r = o.rect;
  const left = Math.min(Math.max(8, r.right - m.offsetWidth), window.innerWidth - m.offsetWidth - 8);
  let top = r.bottom + 4; if (top + m.offsetHeight > window.innerHeight - 8) top = Math.max(8, r.top - m.offsetHeight - 4);
  m.style.left = left + 'px'; m.style.top = top + 'px';
  const first = m.querySelector('button'); if (first) first.focus({ preventScroll: true });
}
function onMenuClick(e) {
  const a = e.target.closest('[data-mn]'); if (!a || !menu.open) return;
  const bid = menu.open.bid; closeMenu();
  const blocks = state.sheet.blocks; const idx = blocks.findIndex(x => x.id === bid); const b = blocks[idx]; if (!b) return;
  switch (a.dataset.mn) {
    case 'dup': { const c = clone(b); c.id = 'b' + uid(); zlCloneFor(b.id, c.id); blocks.splice(idx + 1, 0, c); state.sel = c.id; changed(true); break; }
    case 'up': case 'down': { const j = a.dataset.mn === 'up' ? idx - 1 : idx + 1; if (j < 0 || j >= blocks.length) return; [blocks[idx], blocks[j]] = [blocks[j], blocks[idx]]; state.sel = bid; changed(true); break; }
    case 'pht': { state.fmtOpen.add('more:pht:' + bid); state.sel = bid; openOnly(bid); renderEditor(); const c = $(`#editor .card[data-bid="${bid}"] .pht`); if (c) c.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); break; }
    case 'oph-all': { const du = state.sheet.meta.anrede === 'du'; let n = 0, none = 0;
      b.items.forEach((it, i) => { if (tipsOf(it).length) return; const S = ophFor(it); if (!S) { none++; return; } it.tips = S.H.tips.slice(0, 3).map(x => duSie(x, du)).concat(['', '', '']).slice(0, 3); state.taskOpen.add(taskKey(b.id, i, 'tips')); n++; });
      if (!n) { toast(none ? 'Bei den übrigen Aufgaben wurde kein Operator erkannt.' : 'Alle Aufgaben haben schon Tipps.'); break; }
      changed(true); toast(`Tipps für ${n} ${n === 1 ? 'Aufgabe' : 'Aufgaben'} vorgeschlagen${none ? `, ${none} ohne erkannten Operator` : ''}`, 'Rückgängig', histUndo); break; }
    case 'snip': saveSnip(b); renderEditor(); break;
    case 'grp': b.group = a.dataset.v || ''; changed(true); break;
    case 'lv': { const k = a.dataset.v; const cur = Array.isArray(b.lv) ? b.lv : Object.keys(LV); const nx = cur.includes(k) ? cur.filter(x => x !== k) : [...cur, k]; if (!nx.length) { toast('Ein Baustein braucht mindestens eine Stufe.'); break; } if (nx.length === 3) delete b.lv; else b.lv = Object.keys(LV).filter(x => nx.includes(x)); changed(true); break; }
    case 'del': snapshot(); blocks.splice(idx, 1); state.sel = null; changed(true); toast(`${typeLabel(b)} gelöscht`, 'Rückgängig', histUndo); break;
  }
}

