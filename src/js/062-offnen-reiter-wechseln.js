/* ---------- Öffnen, Reiter wechseln ---------- */
const LS_START = 'abw.start';
const startWanted = () => !isBasis() && String(lsGet(LS_START)) !== '0';
function openSheet(sh, opt = {}) {
  if (sh && sh.id) setTimeout(() => FASS.keep(sh, 'open'), 1500);
  state.gapEdit = null; state.bkOpen = false;
  if (!opt.keepArea) { if (startWanted() && !opt.edit) { state.area = 'start'; state.out = 'blatt'; if (typeof isNarrow === 'function' && isNarrow() && state.view !== 'edit') setTimeout(() => setView('edit'), 0); } else if (state.area === 'start' || state.area === 'einst' || !state.area) { state.area = 'blatt'; state.out = 'blatt'; } }
  closeGloss(); closeZl(); closeMenu();
  if (savePending) saveNow();
  state.sheet = normalizeSheet(sh); state.sel = null; state.closed = loadClosed(state.sheet.id) || defaultClosed(); state.allOpen = false; state.taskOpen = new Set(); undoSnap = null; state.touched = false;
  state.openSnap = state.sheet.example ? null : clone(state.sheet);
  if (!state.sheet.meta.groupsOn) state.grp = 'all';
  if (!state.sheet.meta.levelsOn) state.lvl = 'all';
  if (state.sheet.klasse !== state.klasse) { state.klasse = state.sheet.klasse; lsSet(LS.klasse, state.klasse); renderTabs(); }
  histReset(); state.insAt = null; state.base = { id: state.sheet.id, stamp: state.sheet.updatedAt || 0 }; state.conflict = null;
  if (!state.sheet.example) rememberLast(state.sheet);
  idleStatus();
  renderEditor(); renderPreview(); $('#editor').scrollTop = 0;
  loadDesignFonts(designOf(state.sheet.meta));
}
async function openById(id) {
  try { const sh = await backend.load(id); if (sh) { openSheet(sh); return true; } } catch {}
  toast('Das Blatt ließ sich nicht laden. Bitte erneut versuchen.');
  return false;
}
async function openForKlasse(k) {
  const inK = state.lib.filter(d => d.klasse === k);
  const lastId = (lsGet(LS.last) || {})[k];
  const pick = inK.find(d => d.id === lastId) || inK[0];
  if (pick && backend) { try { const sh = await backend.load(pick.id); if (sh) { openSheet(sh); return; } } catch {} }
  if (state.klasse === k) openSheet(draftFor(k));
}
async function switchKlasse(k) {
  if (k === state.klasse) return;
  if (savePending) saveNow();
  state.klasse = k; lsSet(LS.klasse, k); state.confirmDel = null; state.libQuery = '';
  renderTabs(); if (state.libOpen) renderLib();
  if (!backend) { openSheet(draftFor(k)); return; }
  await openForKlasse(k);
}
// Klasse eines Blatts wechseln: Kurs, Schule und Farbe folgen, wenn sie noch die der alten Klasse waren
function klasseSwap(sh, v) {
  const old = KL(sh.klasse), nw = KL(v); if (old.id === nw.id) return false;
  if (sh.meta.course === old.course) sh.meta.course = nw.course;
  if (sh.meta.accent === old.accent) sh.meta.accent = nw.accent;
  if (sh.meta.school === old.school) sh.meta.school = nw.school;
  sh.klasse = nw.id; return true;
}
function moveKlasse(v) {
  const sh = state.sheet; const nw = KL(v); if (!klasseSwap(sh, v)) return;
  state.klasse = nw.id; lsSet(LS.klasse, nw.id);
  changed(true); renderTabs();
  toast(`Das Blatt liegt jetzt unter ${nw.label}`);
}
async function deleteSheet(id) {
  if (state.sheet.id === id) { clearTimeout(saveTimer); savePending = false; }
  await saveChain;
  try { await backend.remove(id); } catch { toast('Löschen hat nicht geklappt. Bitte erneut versuchen.'); return; }
  if (backend.kind !== 'local') dropPending(backend, id);
  state.lib = state.lib.filter(d => d.id !== id); state.confirmDel = null; dropPlace(id);
  const cur = lsGet(LS.cur); if (cur && cur.sheet && cur.sheet.id === id) lsDel(LS.cur);
  renderTabs(); renderLib();
  if (state.sheet.id === id) await openForKlasse(state.klasse);
  toast('Blatt gelöscht');
}

