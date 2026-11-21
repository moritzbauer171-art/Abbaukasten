/* ---------- Zwischenspeicher für Änderungen, die online noch fehlen ---------- */
const pendKey = b => LS.pending + '.' + b.key;
function addPending(b, sh) { const p = lsGet(pendKey(b)) || {}; p[sh.id] = sh; lsSet(pendKey(b), p); }
function dropPending(b, id) { const p = lsGet(pendKey(b)); if (p && p[id]) { delete p[id]; lsSet(pendKey(b), p); } }
async function flushPending() {
  const b = backend; if (!b || b.kind === 'local' || b.offOnly || state.offline) return;
  const p = lsGet(pendKey(b)) || {}; const ids = Object.keys(p); if (!ids.length) return;
  for (const id of ids) {
    const sh = p[id]; const srv = state.lib.find(d => d.id === id && !d.pend);
    if (srv && srv.updatedAt >= (sh.updatedAt || 0)) { delete p[id]; continue; }
    try { await b.save(sh); delete p[id]; upsertLib(entryOf(sh)); } catch { break; }
  }
  lsSet(pendKey(b), p);
}

