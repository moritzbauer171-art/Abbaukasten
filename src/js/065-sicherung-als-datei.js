/* ---------- Sicherung als Datei ---------- */
async function exportBackup() {
  if (!backend) return;
  overlay('Sicherung wird erstellt …');
  const sheets = [];
  for (const d of state.lib) { try { const sh = await backend.load(d.id); if (sh) sheets.push(sh); } catch {} }
  overlay('');
  if (!sheets.length && !userSnips().length) { toast('Es gibt noch keine gespeicherten Blätter.'); return; }
  const now = new Date(); const stamp = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  const data = JSON.stringify({ app: 'AB-Werkstatt', version: 1, exportedAt: now.toISOString(), sheets, snips: userSnips(), prefs: state.prefs });
  await deliver(`LehrWerk_Sicherung_${stamp}.json`, new Blob([data], { type: 'application/json' }));
}
async function importBackup(file) {
  if (!backend) return;
  let obj; try { obj = JSON.parse(await file.text()); } catch { toast('Die Datei ist keine gültige Sicherung.'); return; }
  const sn = obj && Array.isArray(obj.snips) ? obj.snips.filter(x => x && x.id && x.block && TYPES[x.block.type]) : [];
  if (sn.length) { const have = userSnips(); const ids = new Set(have.map(x => x.id)); lsSet(LS_SNIP, have.concat(sn.filter(x => !ids.has(x.id))).slice(0, 60)); }
  const list = obj && Array.isArray(obj.sheets) ? obj.sheets : [];
  if (!list.length) { if (sn.length) { renderEditor(); toast('Sammlung übernommen'); } else toast('In der Datei sind keine Arbeitsblätter.'); return; }
  overlay('Sicherung wird geladen …');
  let n = 0, same = 0, bad = 0;
  for (const raw of list) {
    if (!raw || typeof raw.id !== 'string' || !raw.meta || !Array.isArray(raw.blocks)) { bad++; continue; }
    const sh = normalizeSheet(clone(raw)); sh.example = false; sh.updatedAt = sh.updatedAt || Date.now();
    const have = state.lib.find(d => d.id === sh.id);
    if (have && have.updatedAt >= sh.updatedAt) { same++; continue; }
    try { await backend.save(sh); upsertLib(entryOf(sh)); n++; } catch { bad++; }
  }
  overlay('');
  try { await refreshLib(); } catch {}
  if (obj.prefs) mergePrefs(obj.prefs);
  const extra = [same ? `${same} schon aktuell` : '', bad ? `${bad} nicht lesbar` : ''].filter(Boolean).join(', ');
  if (list.length === 1 && (n || same) && list[0] && list[0].id) {
    state.libOpen = false; state.confirmDel = null; renderLib();
    if (await openById(list[0].id)) { toast(`„${state.sheet.meta.title || 'Ohne Titel'}“ geöffnet${same ? ' · war schon aktuell' : ''}`); return; }
  }
  toast(`${n} ${n === 1 ? 'Blatt' : 'Blätter'} übernommen${extra ? ' · ' + extra : ''}`);
}

