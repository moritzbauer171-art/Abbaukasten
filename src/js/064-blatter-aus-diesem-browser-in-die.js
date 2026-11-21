/* ---------- Blätter aus diesem Browser in die Online-Ablage ---------- */
function offerMigration() {
  if (COMPANION_PAGE()) return;
  if (!backend || backend.kind !== 'supabase') return;
  const n = Object.keys(localLib()).length; if (!n) return;
  toast(`${n} ${n === 1 ? 'Blatt liegt' : 'Blätter liegen'} noch nur in diesem Browser`, 'Online übernehmen', migrateLocal);
}
async function migrateLocal() {
  if (!backend || backend.kind !== 'supabase') return;
  const lib = localLib(); let n = 0;
  for (const id of Object.keys(lib)) {
    const sh = lib[id] && lib[id].sheet; if (!sh) { delete lib[id]; continue; }
    try { await backend.save(normalizeSheet(sh)); delete lib[id]; n++; } catch { break; }
  }
  lsSet(LS.lib, lib);
  try { await refreshLib(); } catch {}
  mergePrefs(lsGet(LS_PREF)); if (state.libOpen) renderLib();
  toast(`${n} ${n === 1 ? 'Blatt' : 'Blätter'} online übernommen`);
}

