/* ---------- Speichern ---------- */
function rememberLast(sh) {
  const last = lsGet(LS.last) || {}; last[sh.klasse] = sh.id; lsSet(LS.last, last);
  lsSet(LS.cur, { sheet: sh });
}
let saveTimer = null, savePending = false, saveChain = Promise.resolve();
function scheduleSave() { clearTimeout(saveTimer); savePending = true; saveTimer = setTimeout(saveNow, 1100); }
// Nimmt den Stand sofort auf und speichert der Reihe nach; so geht beim Wechseln nichts verloren.
function saveNow() {
  clearTimeout(saveTimer);
  const sh = state.sheet;
  if (!sh || sh.example) { savePending = false; return saveChain; }
  if (state.conflict) { savePending = true; return saveChain; }
  if (!backend) { savePending = true; return saveChain; }
  savePending = false;
  sh.updatedAt = Date.now();
  const snap = clone(sh), b = backend;
  rememberLast(snap); setStatus('saving'); FASS.keep(snap, 'auto');
  saveChain = saveChain.then(() => doSave(b, snap)).catch(() => {});
  return saveChain;
}
async function doSave(b, snap) {
  const mine = () => state.sheet && state.sheet.id === snap.id;
  try {
    if (b.stamp && mine() && state.base && state.base.id === snap.id && !snap.force) {
      let r = null; try { r = await b.stamp(snap.id); } catch {}
      if (r && r > state.base.stamp + 500 && mine()) { state.conflict = { remote: r }; savePending = true; setStatus('conflict'); state.dlg = { mode: 'conflict', remote: r }; renderDlg(); return; }
    }
    await b.save(snap);
    if (mine() && state.base && state.base.id === snap.id) state.base.stamp = snap.updatedAt || state.base.stamp;
    if (b.kind !== 'local') dropPending(b, snap.id);
    if (b === backend) upsertLib(entryOf(snap));
    if (mine() && !savePending) setStatus(b.kind);
    if (b.kind !== 'local') flushPending();
  } catch (err) {
    const code = err && err.code;
    if (b.kind !== 'local' && code !== 'toolarge') { addPending(b, snap); if (mine()) setStatus('offline'); }
    else if (mine()) setStatus(code === 'toolarge' ? 'toolarge' : code === 'quota' ? 'quota' : 'error');
  }
}

