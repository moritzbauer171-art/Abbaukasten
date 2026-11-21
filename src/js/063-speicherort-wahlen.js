/* ---------- Speicherort wählen ---------- */
async function useBackend(b) {
  const t = ++backendToken;
  b = withOffline(b); backend = b; state.offline = null; state.klReady = false; state.needSetup = false; state.prefsFail = false;
  if (b.kind === 'supabase' && !b.offOnly && store.user) lsSet(LS_OFFUSER, { id: store.user.id }); setStatus('pending'); state.shared = null; state.sharedAt = 0;
  let listed = true;
  try { await refreshLib(); } catch (err) { console.error(err); listed = false; }
  if (t !== backendToken) return;
  updateAccountUI();
  if (!listed) {
    state.lib = []; renderTabs(); setStatus('offline');
    toast('Die Ablage ist gerade nicht erreichbar. Änderungen werden lokal gesichert und später nachgetragen.');
    return;
  }
  await loadPrefs(b); applyKlassen(); if (state.libOpen) renderLib();
  if (state.offline) toast(`Offline: Du arbeitest mit dem Stand ${offDate(state.offline.at) ? 'vom ' + offDate(state.offline.at) : 'aus diesem Browser'}. Änderungen werden nachgetragen, sobald wieder Verbindung besteht.`);
  if (!state.offline) await flushPending();
  if (t !== backendToken) return;
  if (state.touched && !state.sheet.example && KLASSEN.some(k => k.id === state.sheet.klasse)) await saveNow();
  else await openForKlasse(state.klasse);
  state.touched = false;
  setTimeout(maybeSetup, 0);
}
async function initBackend() {
  if (inClaude) {
    const get = n => window.claude.use(n).catch(() => null);
    const [db, user, dl, assets] = await Promise.all([get('db'), get('user'), get('downloads'), get('assets')]);
    store.dl = dl; store.assets = assets;
    let id = null; if (db && user) { try { id = await user.id(); } catch {} }
    return useBackend(id ? claudeB(db, id) : localB);
  }
  if (SUPABASE.url && SUPABASE.key) {
    try {
      await loadScript(LIBS.supa);
      const sb = window.supabase.createClient(SUPABASE.url, SUPABASE.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'abw-auth' } });
      store.sb = sb;
      const { data } = await sb.auth.getSession();
      store.user = data && data.session ? data.session.user : null;
      sb.auth.onAuthStateChange((ev, session) => setTimeout(() => onAuth(ev, session), 0));
      const ou = lsGet(LS_OFFUSER);
      if (!store.user && !navigator.onLine && ou && ou.id) { await useBackend(offlineOnlyB(ou)); return; }
      await useBackend(store.user ? supaB(sb, store.user) : localB);
      if (store.user) { offerMigration(); admCheck(); }
      else openDlg('login');
      return;
    } catch (err) {
      console.error(err); store.sb = null; store.user = null;
      const ou = lsGet(LS_OFFUSER); if (ou && ou.id) { await useBackend(offlineOnlyB(ou)); return; }
      toast('Die Online-Ablage ist gerade nicht erreichbar. Blätter werden in diesem Browser gespeichert.');
    }
  }
  return useBackend(localB);
}
function onAuth(ev, session) {
  if (ev === 'PASSWORD_RECOVERY') openDlg('newpw');
  const user = (session && session.user) || null;
  const cur = store.user && store.user.id;
  if (user && user.id !== cur) {
    store.user = user;
    if (state.dlg && state.dlg.mode === 'login') closeDlg();
    useBackend(supaB(store.sb, user)).then(() => { offerMigration(); admCheck(); });
  } else if (!user && cur) {
    store.user = null; lsDel(LS.cur); state.touched = false;
    useBackend(localB).then(() => openDlg('login'));
  }
  updateAccountUI();
}
function updateAccountUI() { $('#btn-login').hidden = !(store.sb && !store.user); if (state.libOpen) renderLib(); }

