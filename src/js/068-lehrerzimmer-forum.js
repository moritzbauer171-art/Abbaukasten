/* ================= Lehrerzimmer: Forum (Tabellen ab_forum_*, Rechte in der Datenbank) ================= */
const FORUM_CATS = ['Frage', 'Material gesucht', 'Idee und Tipp', 'Vertretung', 'Austausch', 'Technik und LehrWerk'];
const LS_FSEEN = 'abw.forumSeen';
const FO = { open: false, view: 'list', threads: null, posts: {}, tid: '', q: '', fach: 'mine', cat: '', err: '', busy: false, reports: null, edit: '', draft: {}, loadedAt: 0 };
const foSeen = () => { const S = lsGet(LS_FSEEN); if (S && S.base) return S; const n = { base: Date.now(), t: {} }; lsSet(LS_FSEEN, n); return n; };
const foMe = () => store.user && store.user.id;
const foUnread = t => { const S = foSeen(), last = Date.parse(t.last_at) || 0; return last > Math.max(S.base, S.t[t.id] || 0) && (t.last_by || t.user_id) !== foMe(); };
function foMarkSeen(t) { const S = foSeen(); S.t[t.id] = Math.max(Date.now(), Date.parse(t.last_at) || 0); const ids = Object.keys(S.t); if (ids.length > 600) ids.sort((a, b) => S.t[a] - S.t[b]).slice(0, ids.length - 500).forEach(k => delete S.t[k]); lsSet(LS_FSEEN, S); }
function foBadge() { const b = $('#btn-forum .fo-badge'); if (!b) return; const n = (FO.threads || []).filter(foUnread).length; b.hidden = !n; b.textContent = n > 9 ? '9+' : String(n); }
const foSort = L => L.slice().sort((a, b) => (b.pinned - a.pinned) || (Date.parse(b.last_at) - Date.parse(a.last_at)));
async function forumLoad(force) {
  if (!store.sb || !store.user) return;
  if (!force && FO.threads && Date.now() - FO.loadedAt < 60000) return;
  try { const r = await store.sb.from('ab_forum_threads').select('id,user_id,autor,title,body,fach,kategorie,pinned,locked,n_replies,created_at,edited_at,last_at,last_by').order('last_at', { ascending: false }).limit(300); if (r.error) throw r.error; FO.threads = foSort(r.data || []); FO.err = ''; FO.loadedAt = Date.now(); }
  catch (e) { console.error(e); FO.threads = FO.threads || []; FO.err = 'Das Lehrerzimmer ließ sich gerade nicht laden.'; }
  foBadge(); if (!state.shared && canShare()) shareLoad().then(() => { if (FO.open) foRender(); }).catch(() => {});
}
async function foPostsLoad(tid) {
  try { const r = await store.sb.from('ab_forum_posts').select('id,thread_id,user_id,autor,body,created_at,edited_at').eq('thread_id', tid).order('created_at', { ascending: true }).limit(1000); if (r.error) throw r.error; FO.posts[tid] = (r.data || []).sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at)); }
  catch (e) { console.error(e); FO.posts[tid] = FO.posts[tid] || []; toast('Antworten ließen sich nicht laden.'); }
}
async function forumOpen(view, tid) {
  if (!canShare()) { toast('Das Lehrerzimmer gibt es mit Anmeldung.'); return; }
  FO.open = true; FO.view = view || 'list'; FO.tid = tid || ''; FO.edit = ''; foRender();
  await forumLoad(true); if (FO.view === 'thread' && FO.tid) await foPostsLoad(FO.tid);
  if (ADM.is) foReportsLoad();
  foRender(); if (FO.view === 'thread') { const t = (FO.threads || []).find(x => x.id === FO.tid); if (t) { foMarkSeen(t); foBadge(); } }
}
function forumClose() { FO.open = false; foRender(); foBadge(); if (hmS.open) homeRender(); }
async function foReportsLoad() { try { const r = await store.sb.from('ab_forum_reports').select('id,thread_id,post_id,grund,created_at').order('created_at', { ascending: false }).limit(100); if (!r.error) { FO.reports = r.data || []; if (FO.open) foRender(); } } catch {} }
const foText = t => esc(String(t || '')).replace(/(https?:\/\/[^\s<]+[^\s<.,;:!?)\]])/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>').replace(/\n/g, '<br>');
const foWhen = v => { const t = Date.parse(v); return t ? relTime(t) : ''; };
const foAut = (uid, name) => { const R = uid ? rankOfUid(uid) : null; return `${R && R.r ? rankBadge(R.i, 'rk-mini') : ''}<b>${esc(name || 'Ohne Namen')}</b>${uid === foMe() ? ' <span class="fo-me">du</span>' : ''}`; };
const foFachL = k => (FAECHER[k] && FAECHER[k].label) || '';
function foListHTML() {
  const F = myFaecher(); const q = FO.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const L = (FO.threads || []).filter(t => (FO.fach === 'all' || (FO.fach === 'mine' ? (!t.fach || F.has(t.fach)) : t.fach === FO.fach)) && (!FO.cat || t.kategorie === FO.cat) && (!q.length || q.every(w => (t.title + ' ' + t.body + ' ' + t.autor + ' ' + t.kategorie + ' ' + foFachL(t.fach)).toLowerCase().includes(w))));
  const fachOpts = [['mine', 'Meine Fächer'], ['all', 'Alle Fächer'], ...Object.keys(FAECHER).filter(k => !FAECHER[k].base || FAECHER[k].base === k).map(k => [k, foFachL(k)])];
  const rows = L.map(t => `<li class="fo-t${foUnread(t) ? ' new' : ''}${t.pinned ? ' pin' : ''}"><button type="button" data-fo="open" data-id="${t.id}">
      <div class="fo-tags">${t.pinned ? '<span class="fo-tag pin">Angeheftet</span>' : ''}${t.locked ? '<span class="fo-tag lock">Geschlossen</span>' : ''}${t.kategorie ? `<span class="fo-tag c">${esc(t.kategorie)}</span>` : ''}${t.fach ? `<span class="fo-tag">${esc(foFachL(t.fach))}</span>` : '<span class="fo-tag">Fachübergreifend</span>'}</div>
      <b class="fo-tt">${foUnread(t) ? '<i class="fo-dot" aria-label="neu"></i>' : ''}${esc(t.title)}</b>
      <span class="fo-ex">${esc(String(t.body).replace(/\s+/g, ' ').slice(0, 160))}</span>
      <span class="fo-m">${foAut(t.user_id, t.autor)} · ${foWhen(t.created_at)} · ${t.n_replies ? `${t.n_replies} ${t.n_replies === 1 ? 'Antwort' : 'Antworten'}, zuletzt ${foWhen(t.last_at)}` : 'noch keine Antwort'}</span></button></li>`).join('');
  return `<div class="fo-tools"><input class="inp" id="fo-q" type="search" placeholder="Im Lehrerzimmer suchen …" value="${esc(FO.q)}" aria-label="Suchen">
      <select class="inp" id="fo-fach" aria-label="Fach">${fachOpts.map(([v, l]) => `<option value="${v}"${FO.fach === v ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>
      <button type="button" class="btn primary" data-fo="new">+ Neues Thema</button></div>
    <div class="fo-cats"><button type="button" class="sp-chip" data-fo="cat" data-v="" aria-pressed="${!FO.cat}">Alle</button>${FORUM_CATS.map(c => `<button type="button" class="sp-chip" data-fo="cat" data-v="${esc(c)}" aria-pressed="${FO.cat === c}">${esc(c)}</button>`).join('')}</div>
    ${FO.err ? `<p class="adm-err">${esc(FO.err)}</p>` : ''}
    ${!FO.threads ? '<p class="fo-none">Lädt …</p>' : L.length ? `<ul class="fo-list">${rows}</ul>` : `<div class="fo-none"><p>${(FO.threads || []).length ? 'Kein Thema passt zu Suche oder Filter.' : 'Noch ist es still im Lehrerzimmer. Stell die erste Frage oder teile einen Tipp!'}</p><button type="button" class="btn" data-fo="new">Erstes Thema anlegen</button></div>`}`;
}
function foComposeHTML() {
  const d = FO.draft, edit = FO.edit && (FO.threads || []).find(t => t.id === FO.edit);
  const fachOpts = [['', 'Fachübergreifend'], ...Object.keys(FAECHER).filter(k => !FAECHER[k].base || FAECHER[k].base === k).map(k => [k, foFachL(k)])];
  return `<button type="button" class="link fo-back" data-fo="list">‹ Zurück zur Übersicht</button>
    <h3 class="fo-h3">${edit ? 'Thema bearbeiten' : 'Neues Thema'}</h3>
    <label class="f"><span>Titel</span><input class="inp" id="fo-title" maxlength="140" value="${esc(d.title || '')}" placeholder="z. B. Hat jemand eine Vertretungsstunde für Klasse 7 Lyrik?"></label>
    <div class="fo-two"><label class="f"><span>Fach</span><select class="inp" id="fo-tfach">${fachOpts.map(([v, l]) => `<option value="${v}"${(d.fach ?? fachBase(state.klasse)) === v ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></label>
      <label class="f"><span>Art</span><select class="inp" id="fo-tcat">${FORUM_CATS.map(c => `<option${(d.cat || 'Frage') === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select></label>
      <label class="f"><span>Dein Name</span><input class="inp" id="fo-name" maxlength="80" value="${esc(d.name ?? (state.prefs.autor || ''))}" placeholder="z. B. M. Bauer"></label></div>
    <label class="f"><span>Text</span><textarea class="inp" id="fo-body" rows="8" maxlength="5000" placeholder="Worum geht es? Je genauer, desto besser die Antworten.">${esc(d.body || '')}</textarea></label>
    <p class="fo-rules">Bitte keine Namen oder Daten von Schüler*innen und freundlich bleiben. Beiträge sehen alle angemeldeten Konten.</p>
    <div class="row"><button type="button" class="btn primary" data-fo="${edit ? 'save-edit' : 'post-thread'}"${FO.busy ? ' disabled' : ''}>${edit ? 'Speichern' : 'Veröffentlichen'}</button><button type="button" class="btn" data-fo="${edit ? 'open' : 'list'}"${edit ? ` data-id="${edit.id}"` : ''}>Abbrechen</button></div>`;
}
function foThreadHTML() {
  const t = (FO.threads || []).find(x => x.id === FO.tid); if (!t) return '<button type="button" class="link fo-back" data-fo="list">‹ Zurück zur Übersicht</button><p class="fo-none">Dieses Thema gibt es nicht mehr.</p>';
  const P = FO.posts[t.id], me = foMe(), adm = ADM.is;
  const acts = (kind, x) => { const own = x.user_id === me; return `<span class="fo-acts">${own ? `<button type="button" class="link" data-fo="edit-${kind}" data-id="${x.id}">Bearbeiten</button>` : ''}${own || adm ? `<button type="button" class="link danger" data-fo="del-${kind}" data-id="${x.id}">Löschen</button>` : ''}${own ? '' : `<button type="button" class="link" data-fo="report" data-kind="${kind}" data-id="${x.id}">Melden</button>`}</span>`; };
  const body = (kind, x) => FO.edit === kind + ':' + x.id ? `<textarea class="inp fo-edit" id="fo-edit-body" rows="5" maxlength="5000">${esc(x.body)}</textarea><div class="row"><button type="button" class="btn primary" data-fo="save-${kind}" data-id="${x.id}">Speichern</button><button type="button" class="btn" data-fo="edit-no">Abbrechen</button></div>` : `<div class="fo-body">${foText(x.body)}</div>`;
  return `<button type="button" class="link fo-back" data-fo="list">‹ Zurück zur Übersicht</button>
    <article class="fo-op"><div class="fo-tags">${t.pinned ? '<span class="fo-tag pin">Angeheftet</span>' : ''}${t.locked ? '<span class="fo-tag lock">Geschlossen</span>' : ''}${t.kategorie ? `<span class="fo-tag c">${esc(t.kategorie)}</span>` : ''}<span class="fo-tag">${t.fach ? esc(foFachL(t.fach)) : 'Fachübergreifend'}</span></div>
      <h3 class="fo-h3">${esc(t.title)}</h3>
      <div class="fo-m">${foAut(t.user_id, t.autor)} · ${foWhen(t.created_at)}${t.edited_at ? ' · bearbeitet' : ''}${t.user_id === me ? `<span class="fo-acts"><button type="button" class="link" data-fo="edit-thread" data-id="${t.id}">Bearbeiten</button><button type="button" class="link danger" data-fo="del-thread" data-id="${t.id}">Löschen</button></span>` : `<span class="fo-acts">${adm ? `<button type="button" class="link danger" data-fo="del-thread" data-id="${t.id}">Löschen</button>` : ''}<button type="button" class="link" data-fo="report" data-kind="thread" data-id="${t.id}">Melden</button></span>`}</div>
      <div class="fo-body">${foText(t.body)}</div>
      ${adm ? `<div class="fo-adm"><span>Admin:</span><button type="button" class="link" data-fo="pin" data-id="${t.id}">${t.pinned ? 'Nicht mehr anheften' : 'Anheften'}</button><button type="button" class="link" data-fo="lock" data-id="${t.id}">${t.locked ? 'Wieder öffnen' : 'Schließen'}</button></div>` : ''}</article>
    <h4 class="fo-h4">${P ? (P.length ? `${P.length} ${P.length === 1 ? 'Antwort' : 'Antworten'}` : 'Noch keine Antworten') : 'Antworten werden geladen …'}</h4>
    <ol class="fo-posts">${(P || []).map(x => `<li class="fo-p${x.user_id === t.user_id ? ' op' : ''}"><div class="fo-m">${foAut(x.user_id, x.autor)}${x.user_id === t.user_id ? ' <span class="fo-tag">hat gefragt</span>' : ''} · ${foWhen(x.created_at)}${x.edited_at ? ' · bearbeitet' : ''}${acts('post', x)}</div>${body('post', x)}</li>`).join('')}</ol>
    ${t.locked && !adm ? '<p class="fo-none">Dieses Thema ist geschlossen. Antworten sind nicht mehr möglich.</p>' : `<div class="fo-reply"><label class="f"><span>Deine Antwort</span><textarea class="inp" id="fo-rbody" rows="4" maxlength="5000" placeholder="Antworten, Tipp geben, nachfragen …">${esc(FO.draft['r:' + t.id] || '')}</textarea></label>
      <div class="row"><label class="f fo-rname"><span>Name</span><input class="inp" id="fo-rname" maxlength="80" value="${esc(state.prefs.autor || '')}"></label><button type="button" class="btn primary" data-fo="post-reply" data-id="${t.id}"${FO.busy ? ' disabled' : ''}>Antworten</button></div>
      <p class="fo-rules">Keine Namen oder Daten von Schüler*innen.</p></div>`}`;
}
function foReportsHTML() {
  const R = FO.reports || [];
  return `<button type="button" class="link fo-back" data-fo="list">‹ Zurück zur Übersicht</button><h3 class="fo-h3">Meldungen</h3>
    ${R.length ? `<ul class="fo-reps">${R.map(r => { const t = (FO.threads || []).find(x => x.id === r.thread_id); return `<li><div><b>${esc(t ? t.title : 'Thema gelöscht')}</b><small>${r.post_id ? 'Antwort' : 'Thema'} · ${foWhen(r.created_at)}</small>${r.grund ? `<p>${esc(r.grund)}</p>` : ''}</div><span>${t ? `<button type="button" class="link" data-fo="open" data-id="${t.id}">Ansehen</button>` : ''}<button type="button" class="link" data-fo="rep-done" data-id="${r.id}">Erledigt</button></span></li>`; }).join('')}</ul>` : '<p class="fo-none">Keine offenen Meldungen.</p>'}`;
}
function foRender() {
  const root = $('#fo-root'); if (!FO.open) { root.innerHTML = ''; return; }
  const keep = FO.view === 'list' && document.activeElement && document.activeElement.id === 'fo-q' ? document.activeElement.selectionStart : null;
  const sc = root.querySelector('.fo-b'), y = sc ? sc.scrollTop : 0, sameView = root.dataset.v === FO.view + FO.tid;
  const nRep = (FO.reports || []).length;
  const body = FO.view === 'new' || FO.view === 'edit' ? foComposeHTML() : FO.view === 'thread' ? foThreadHTML() : FO.view === 'reports' ? foReportsHTML() : foListHTML();
  root.innerHTML = `<div class="adm-ov" data-fo="x"></div><section class="adm fo" role="dialog" aria-modal="true" aria-label="Lehrerzimmer"><header class="adm-h fo-hd">${FOI_SVG}<div class="fo-ht"><h2>Lehrerzimmer</h2><small>Fragen, Tipps und Austausch im Kollegium</small></div>${ADM.is ? `<button type="button" class="link" data-fo="reports">Meldungen${nRep ? ` <em class="fo-badge">${nRep}</em>` : ''}</button>` : ''}<button type="button" class="link" data-fo="reload">Aktualisieren</button><button type="button" class="ib" data-fo="x" aria-label="Schließen">${I.x}</button></header><div class="adm-body fo-b">${body}</div></section>`;
  root.dataset.v = FO.view + FO.tid;
  if (sameView) root.querySelector('.fo-b').scrollTop = y;
  if (keep != null) { const i = $('#fo-q'); if (i) { i.focus(); try { i.setSelectionRange(keep, keep); } catch {} } }
}
const foKeep = () => { const g = id => { const e = document.getElementById(id); return e ? e.value : undefined; }; const d = FO.draft;
  if (g('fo-title') !== undefined) { d.title = g('fo-title'); d.fach = g('fo-tfach'); d.cat = g('fo-tcat'); d.name = g('fo-name'); d.body = g('fo-body'); }
  if (g('fo-rbody') !== undefined && FO.tid) d['r:' + FO.tid] = g('fo-rbody'); };
const foName = v => { const n = String(v || '').trim().slice(0, 80); if (n && state.prefs.autor !== n) { state.prefs.autor = n; savePrefs(); } return n; };
function foInit() {
  const root = $('#fo-root');
  let tries = 0; const first = setInterval(() => { if (store.user && store.sb) { clearInterval(first); forumLoad(true).then(() => { if (hmS.open) homeRender(); }); } else if (++tries > 120) clearInterval(first); }, 2500);
  setInterval(() => { if (store.user && !FO.open && document.visibilityState === 'visible') forumLoad(true).then(() => { if (hmS.open) homeRender(); }); }, 300000);
  root.addEventListener('input', e => { if (e.target.id === 'fo-q') { FO.q = e.target.value; foRender(); } });
  root.addEventListener('change', e => { if (e.target.id === 'fo-fach') { FO.fach = e.target.value; foRender(); } });
  document.addEventListener('keydown', e => { if (FO.open && e.key === 'Escape' && !document.getElementById('rk-ov')) { e.stopPropagation(); if (FO.edit) { FO.edit = ''; foRender(); } else if (FO.view !== 'list') { foKeep(); FO.view = 'list'; foRender(); } else forumClose(); } }, true);
  root.addEventListener('click', async e => {
    const a = e.target.closest('[data-fo]'); if (!a) return; const k = a.dataset.fo, id = a.dataset.id; const sb = store.sb;
    const T = () => (FO.threads || []).find(x => x.id === (id || FO.tid));
    if (k === 'x') { foKeep(); forumClose(); return; }
    if (k === 'reload') { await forumLoad(true); if (FO.view === 'thread') await foPostsLoad(FO.tid); foRender(); return; }
    if (k === 'list') { foKeep(); FO.view = 'list'; FO.edit = ''; foRender(); return; }
    if (k === 'cat') { FO.cat = a.dataset.v; foRender(); return; }
    if (k === 'reports') { FO.view = 'reports'; foReportsLoad(); foRender(); return; }
    if (k === 'new') { FO.view = 'new'; FO.edit = ''; FO.draft = { ...FO.draft, title: '', body: '', fach: undefined, cat: '' }; foRender(); setTimeout(() => { const t = $('#fo-title'); if (t) t.focus(); }, 20); return; }
    if (k === 'open') { foKeep(); FO.view = 'thread'; FO.tid = id; FO.edit = ''; foRender(); await foPostsLoad(id); const t = T(); if (t) foMarkSeen(t); foBadge(); foRender(); return; }
    if (k === 'edit-no') { FO.edit = ''; foRender(); return; }
    if (k === 'edit-post') { FO.edit = 'post:' + id; foRender(); return; }
    if (k === 'edit-thread') { const t = T(); FO.draft = { ...FO.draft, title: t.title, body: t.body, fach: t.fach, cat: t.kategorie, name: t.autor }; FO.edit = t.id; FO.view = 'edit'; foRender(); return; }
    FO.busy = true;
    try {
      if (k === 'post-thread' || k === 'save-edit') {
        foKeep(); const d = FO.draft, title = (d.title || '').trim(), body = (d.body || '').trim(), autor = foName(d.name);
        if (title.length < 3) throw new Error('Bitte einen Titel mit mindestens drei Zeichen eintragen.'); if (!body) throw new Error('Bitte einen Text schreiben.'); if (!autor) throw new Error('Bitte deinen Namen eintragen.');
        const row = { title, body, fach: d.fach || '', kategorie: d.cat || 'Frage', autor };
        let r;
        if (k === 'post-thread') r = await sb.from('ab_forum_threads').insert({ ...row, user_id: foMe() }).select('id').single();
        else r = await sb.from('ab_forum_threads').update({ ...row, edited_at: new Date().toISOString() }).eq('id', FO.edit).select('id').single();
        if (r.error) throw r.error;
        const nid = (r.data && r.data.id) || FO.edit; FO.draft = {}; FO.edit = ''; await forumLoad(true); FO.view = 'thread'; FO.tid = nid; FO.posts[nid] = FO.posts[nid] || []; await foPostsLoad(nid); const t = T(); if (t) foMarkSeen(t);
        toast(k === 'post-thread' ? 'Thema veröffentlicht.' : 'Gespeichert.');
      }
      if (k === 'post-reply') {
        foKeep(); const body = (FO.draft['r:' + id] || '').trim(), autor = foName(($('#fo-rname') || {}).value);
        if (!body) throw new Error('Bitte eine Antwort schreiben.'); if (!autor) throw new Error('Bitte deinen Namen eintragen.');
        const r = await sb.from('ab_forum_posts').insert({ thread_id: id, body, autor, user_id: foMe() }); if (r.error) throw r.error;
        delete FO.draft['r:' + id]; await Promise.all([foPostsLoad(id), forumLoad(true)]); const t = T(); if (t) foMarkSeen(t); toast('Antwort veröffentlicht.');
        setTimeout(() => { const L = document.querySelectorAll('#fo-root .fo-p'); if (L.length) L[L.length - 1].scrollIntoView({ block: 'center' }); }, 30);
      }
      if (k === 'save-post') { const body = (($('#fo-edit-body') || {}).value || '').trim(); if (!body) throw new Error('Die Antwort ist leer.'); const r = await sb.from('ab_forum_posts').update({ body, edited_at: new Date().toISOString() }).eq('id', id); if (r.error) throw r.error; FO.edit = ''; await foPostsLoad(FO.tid); }
      if (k === 'del-post' || k === 'del-thread') {
        if (a.dataset.sure !== '1') { a.dataset.sure = '1'; a.textContent = 'Wirklich löschen?'; FO.busy = false; return; }
        const r = await sb.from(k === 'del-post' ? 'ab_forum_posts' : 'ab_forum_threads').delete().eq('id', id); if (r.error) throw r.error;
        if (k === 'del-thread') { FO.view = 'list'; FO.tid = ''; } await forumLoad(true); if (FO.view === 'thread') await foPostsLoad(FO.tid); toast('Gelöscht.');
      }
      if (k === 'pin' || k === 'lock') { const t = T(); const r = await sb.from('ab_forum_threads').update(k === 'pin' ? { pinned: !t.pinned } : { locked: !t.locked }).eq('id', t.id); if (r.error) throw r.error; await forumLoad(true); }
      if (k === 'report') { if (a.dataset.sure !== '1') { a.dataset.sure = '1'; a.textContent = 'Wirklich melden?'; FO.busy = false; return; }
        const kind = a.dataset.kind; const r = await sb.from('ab_forum_reports').insert({ user_id: foMe(), thread_id: kind === 'thread' ? id : FO.tid, post_id: kind === 'post' ? id : null, grund: '' }); if (r.error) throw r.error; a.textContent = 'Gemeldet'; a.disabled = true; toast('Danke, die Meldung ist bei den Admins.'); FO.busy = false; return; }
      if (k === 'rep-done') { const r = await sb.from('ab_forum_reports').delete().eq('id', id); if (r.error) throw r.error; await foReportsLoad(); }
    } catch (err) { console.error(err); toast((err && err.message && !/violates|policy|rls|jwt/i.test(err.message)) ? err.message : 'Das hat nicht geklappt.'); }
    FO.busy = false; foRender();
  });
}
const FOI_SVG = '<svg viewBox="0 0 24 24" class="fo-hi" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M19 9h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1v2.5L16 19h-4"/></svg>';

/* ---------- Adminbereich: Konten (nur Metadaten), sperren, löschen, geteilte Stunden moderieren. Rechte prüft die Datenbank (ab_admins). ---------- */
const ADM = { is: false, for: '', open: false, tab: 'konten', users: null, shared: null, err: '', busy: false, titles: {}, show: '', conf: null };
async function admCheck() {
  const uid = store.user && store.user.id; if (!uid || !store.sb) { ADM.is = false; ADM.for = ''; return; }
  if (ADM.for === uid) return; ADM.for = uid; ADM.is = false;
  try { const r = await store.sb.rpc('ab_is_admin'); if (!r.error && r.data === true && store.user && store.user.id === uid) { ADM.is = true; if (state.libOpen) renderLib(); if (state.area === 'einst' || state.area === 'pres') renderEditor(); } } catch {}
}
const admRpc = async (fn, args) => { const r = await store.sb.rpc(fn, args || {}); if (r.error) throw r.error; return r.data; };
const admDate = (v, t) => { if (!v) return '–'; const d = new Date(v); return isNaN(d) ? '–' : d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }) + (t ? ' ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : ''); };
async function admLoad() {
  ADM.busy = true; ADM.err = ''; admRender();
  try { const [u, g] = await Promise.all([admRpc('ab_admin_users'), admRpc('ab_admin_shared')]); ADM.users = u || []; ADM.shared = g || []; }
  catch (e) { ADM.err = e && e.code === '42501' ? 'Dieses Konto hat keine Admin-Rechte.' : 'Laden hat nicht geklappt: ' + ((e && e.message) || 'unbekannter Fehler'); }
  ADM.busy = false; admRender();
}
function admOpen() { ADM.open = true; ADM.conf = null; ADM.show = ''; admLoad(); }
function admClose() { ADM.open = false; ADM.conf = null; admRender(); }
function admRender() {
  const root = $('#adm-root'); if (!ADM.open) { root.innerHTML = ''; return; }
  const me = store.user && store.user.id; const U = ADM.users || [], G = ADM.shared || [];
  const tab = (k, l, n) => `<button type="button" class="adm-tab" data-adm="tab" data-v="${k}" aria-pressed="${ADM.tab === k}">${l}${n != null ? ` <em>${n}</em>` : ''}</button>`;
  let body = '';
  if (ADM.err) body = `<p class="adm-err">${esc(ADM.err)}</p>`;
  else if (!ADM.users) body = '<p class="adm-note">Lädt …</p>';
  else if (ADM.tab === 'konten') {
    const tot = U.reduce((a, u) => a + (u.n_sheets || 0), 0);
    body = `<p class="adm-note">${U.length} Konten · ${tot} Blätter · ${U.filter(u => u.banned).length} gesperrt. Inhalte der Blätter sind hier bewusst nicht einsehbar, nur Titel und Zahlen.</p>
    <div class="adm-wrap"><table class="adm-t"><thead><tr><th>Konto</th><th>Angelegt</th><th>Zuletzt angemeldet</th><th class="n">Blätter</th><th class="n">Geteilt</th><th class="n">Digital</th><th>Zuletzt bearbeitet</th><th></th></tr></thead><tbody>
    ${U.map(u => { const self = u.id === me, prot = self || u.is_admin; const c = ADM.conf && ADM.conf.id === u.id ? ADM.conf : null;
      const T = ADM.titles[u.id];
      return `<tr class="${u.banned ? 'ban' : ''}"><td><b>${esc(u.email || '(ohne E-Mail)')}</b>${u.is_admin ? ' <span class="adm-b adm-b-a">Admin</span>' : ''}${self ? ' <span class="adm-b">Du</span>' : ''}${u.banned ? ' <span class="adm-b adm-b-x">gesperrt</span>' : ''}</td>
      <td>${admDate(u.created_at)}</td><td>${admDate(u.last_sign_in_at, 1)}</td><td class="n">${u.n_sheets}</td><td class="n">${u.n_shared}</td><td class="n">${u.n_digital}</td><td>${admDate(u.last_edit, 1)}</td>
      <td class="adm-a">${u.n_sheets ? `<button type="button" class="link" data-adm="titles" data-id="${u.id}">${ADM.show === u.id ? 'Titel ausblenden' : 'Titel'}</button>` : ''}${prot ? '' : `<button type="button" class="link" data-adm="ban" data-id="${u.id}" data-v="${u.banned ? 0 : 1}">${u.banned ? 'Entsperren' : 'Sperren'}</button><button type="button" class="link danger" data-adm="del" data-id="${u.id}">Löschen</button>`}</td></tr>
      ${ADM.show === u.id ? `<tr class="adm-sub"><td colspan="8">${!T ? 'Lädt …' : !T.length ? 'Keine Blätter.' : `<ul class="adm-ti">${T.map(x => `<li><span>${esc(x.title || 'Ohne Titel')}${x.nr ? ` <small>AB ${esc(x.nr)}</small>` : ''}</span><small>${esc((KLASSEN.find(k => k.id === x.klasse) || {}).label || '')}${(KLASSEN.find(k => k.id === x.klasse) || {}).label ? ' · ' : ''}${admDate(x.updated_at)}</small></li>`).join('')}</ul>`}</td></tr>` : ''}
      ${c ? `<tr class="adm-sub adm-conf"><td colspan="8"><b>Konto ${esc(u.email)} endgültig löschen?</b> Dabei verschwinden auch ${u.n_sheets} Blätter, ${u.n_shared} geteilte Stunden und ${u.n_digital} digitale Fassungen. Das lässt sich nicht rückgängig machen.<div class="adm-cr"><input class="inp" type="text" id="adm-conf-in" placeholder="Zur Bestätigung die E-Mail eintippen" autocomplete="off" value="${esc(c.typed || '')}"><button type="button" class="btn danger" data-adm="del-yes" data-id="${u.id}"${(c.typed || '').trim().toLowerCase() === String(u.email || '').toLowerCase() ? '' : ' disabled'}>Endgültig löschen</button><button type="button" class="btn" data-adm="no">Abbrechen</button></div></td></tr>` : ''}`; }).join('')}
    </tbody></table></div>
    <p class="adm-note">Gesperrte Konten können sich nicht mehr anmelden; ihre Blätter bleiben erhalten. Dein eigenes Konto und andere Admin-Konten lassen sich hier weder sperren noch löschen.</p>`;
  } else {
    body = !G.length ? '<p class="adm-note">Es gibt keine geteilten Stunden.</p>' : `<div class="adm-wrap"><table class="adm-t"><thead><tr><th>Stunde</th><th>Fach · Klasse</th><th>Von</th><th>Geteilt</th><th></th></tr></thead><tbody>
    ${G.map(g => { const c = ADM.conf && ADM.conf.sid === g.id; return `<tr><td><b>${esc(g.title || 'Ohne Titel')}</b>${g.beschreibung ? `<small class="adm-d">${esc(g.beschreibung)}</small>` : ''}</td><td>${esc((FAECHER[g.fach] && FAECHER[g.fach].label) || g.fach || 'Deutsch')}${g.klasse ? ' · ' + esc(g.klasse) : ''}</td><td>${esc(g.autor || '–')}<small class="adm-d">${esc(g.email || '')}</small></td><td>${admDate(g.updated_at)}</td>
      <td class="adm-a">${c ? `<span class="adm-q">Wirklich entfernen?</span><button type="button" class="link danger" data-adm="sdel-yes" data-id="${esc(g.id)}">Ja, entfernen</button><button type="button" class="link" data-adm="no">Nein</button>` : `<button type="button" class="link danger" data-adm="sdel" data-id="${esc(g.id)}">Entfernen</button>`}</td></tr>`; }).join('')}
    </tbody></table></div><p class="adm-note">Entfernen nimmt die Stunde aus „Geteilte Stunden“. Das Original-Blatt im Konto der Person bleibt unberührt.</p>`;
  }
  const keep = document.activeElement && document.activeElement.id === 'adm-conf-in' ? document.activeElement.selectionStart : null;
  root.innerHTML = `<div class="adm-ov" data-adm="bg"></div><section class="adm" role="dialog" aria-modal="true" aria-label="Adminbereich"><header class="adm-h"><h2>Adminbereich</h2><div class="adm-tabs" role="group">${tab('konten', 'Konten', ADM.users ? ADM.users.length : null)}${tab('geteilt', 'Geteilte Stunden', ADM.shared ? ADM.shared.length : null)}</div><button type="button" class="link" data-adm="reload"${ADM.busy ? ' disabled' : ''}>Aktualisieren</button><button type="button" class="ib" data-adm="x" aria-label="Schließen">${I.x}</button></header><div class="adm-body">${body}</div></section>`;
  if (keep != null) { const i = $('#adm-conf-in'); if (i) { i.focus(); try { i.setSelectionRange(keep, keep); } catch {} } }
}
function admInit() {
  const root = $('#adm-root');
  document.addEventListener('input', e => { if (e.target.id !== 'sp-q') return; const q = e.target.value.trim().toLowerCase().split(/\s+/).filter(Boolean); let any = 0;
    document.querySelectorAll('#dlg-root .sp-g').forEach(g => { let n = 0; g.querySelectorAll('li').forEach(li => { const on = q.every(w => li.dataset.q.includes(w)); li.hidden = !on; if (on) n++; }); g.hidden = !n; any += n; });
    const no = document.querySelector('#dlg-root .sp-none'); if (no) no.hidden = !!any; });
  root.addEventListener('input', e => { if (e.target.id === 'adm-conf-in' && ADM.conf) { ADM.conf.typed = e.target.value; admRender(); } });
  document.addEventListener('keydown', e => { if (ADM.open && e.key === 'Escape') { e.stopPropagation(); if (ADM.conf) { ADM.conf = null; admRender(); } else admClose(); } });
  root.addEventListener('click', async e => {
    const t = e.target.closest('[data-adm]'); if (!t) return; const a = t.dataset.adm, id = t.dataset.id;
    if (a === 'x' || a === 'bg') { admClose(); return; }
    if (a === 'tab') { ADM.tab = t.dataset.v; ADM.conf = null; admRender(); return; }
    if (a === 'reload') { admLoad(); return; }
    if (a === 'no') { ADM.conf = null; admRender(); return; }
    if (a === 'titles') { if (ADM.show === id) { ADM.show = ''; admRender(); return; } ADM.show = id; admRender(); try { ADM.titles[id] = await admRpc('ab_admin_titles', { uid: id }) || []; } catch { ADM.titles[id] = []; toast('Titel ließen sich nicht laden.'); } admRender(); return; }
    if (a === 'del') { ADM.conf = { id, typed: '' }; admRender(); const i = $('#adm-conf-in'); if (i) i.focus(); return; }
    if (a === 'sdel') { ADM.conf = { sid: id }; admRender(); return; }
    try {
      if (a === 'ban') { const on = t.dataset.v === '1'; await admRpc('ab_admin_ban', { uid: id, sperren: on }); toast(on ? 'Konto gesperrt.' : 'Konto entsperrt.'); }
      if (a === 'del-yes') { t.disabled = true; await admRpc('ab_admin_delete_user', { uid: id }); ADM.conf = null; toast('Konto gelöscht.'); }
      if (a === 'sdel-yes') { await admRpc('ab_admin_shared_delete', { sid: id }); ADM.conf = null; toast('Geteilte Stunde entfernt.'); try { state.shared = await backend.shareList(); } catch {} }
    } catch (err) { toast((err && err.message) || 'Das hat nicht geklappt.'); }
    admLoad();
  });
}

/* ---------- Meine Blätter ---------- */
function renderLib() {
  const root = $('#lib-root');
  if (!state.libOpen) { root.innerHTML = ''; return; }
  const k = KL(state.klasse);
  const q = state.libQuery.trim().toLowerCase();
  let acct;
  if (backend && backend.kind === 'supabase') { admCheck(); acct = `<span>Online gespeichert für <b>${esc(store.user && store.user.email || '')}</b></span>${ADM.is ? '<button class="link adm-link" type="button" data-act="admin-open">Adminbereich</button>' : ''}<button class="link" type="button" data-act="logout">Abmelden</button>`; }
  else if (backend && backend.kind === 'claude') acct = '<span>Deine Blätter liegen in deinem claude.ai-Konto und sind nur für dich sichtbar.</span>';
  else if (store.sb) acct = '<span>Deine Blätter liegen nur in diesem Browser.</span><button class="link" type="button" data-act="login">Anmelden für die Online-Ablage</button>';
  else acct = '<span>Deine Blätter liegen nur in diesem Browser. Sichere sie ab und zu als Datei.</span>';
  const nLocal = backend && backend.kind === 'supabase' ? Object.keys(localLib()).length : 0;
  const keep = document.activeElement && document.activeElement.id === 'lib-q';
  const oldList = root.querySelector('.lib-list'); const scroll = oldList ? oldList.scrollTop : 0;
  root.innerHTML = `<div class="scrim" data-act="lib-close"></div><aside class="drawer" role="dialog" aria-label="Meine Stunden">
    <div class="drawer-h"><div class="dh"><h2>Meine Stunden</h2><span>${esc(k.label)}</span></div><button class="ib" type="button" data-act="lib-close" title="Schließen">${I.x}</button></div>
    <div class="acct">${acct}</div>
    <div class="lib-tabs" role="tablist" aria-label="Stunden"><button type="button" role="tab" data-act="lib-tab" data-v="mine" aria-selected="${state.libTab !== 'shared'}">Meine Stunden</button><button type="button" role="tab" data-act="lib-tab" data-v="shared" aria-selected="${state.libTab === 'shared'}">Geteilte Stunden${state.shared && sharedVis().length ? ` <em>${sharedVis().length}</em>` : ''}</button></div>
    ${state.libTab === 'shared' ? `<div class="lib-list share-list">${sharedListHTML()}</div>` : `
    ${nLocal ? `<div class="notice"><span>${nLocal} ${nLocal === 1 ? 'Blatt liegt' : 'Blätter liegen'} noch nur in diesem Browser.</span><button class="link" type="button" data-act="lib-migrate">Online übernehmen</button></div>` : ''}
    <div class="row"><button class="btn primary" type="button" data-act="lib-new">Neue Stunde</button>${k.id === 'gk' ? '<button class="btn" type="button" data-act="lib-example">Beispielblatt</button>' : ''}<button class="btn lib-fadd" type="button" data-act="lib-fnew">${FOLDER_SVG}Neuer Ordner</button></div>
    <div class="row lib-tools"><input class="inp" id="lib-q" type="search" placeholder="Suchen in Titeln und Inhalten" value="${esc(state.libQuery)}" aria-label="Blätter durchsuchen" style="flex:1"><select class="inp lib-sort" id="lib-sort" aria-label="Sortierung" title="Sortierung">${LIB_SORT.map(([v, t]) => `<option value="${v}"${libSort() === v ? ' selected' : ''}>${t}</option>`).join('')}</select></div>
    ${state.fNew ? '<div class="lib-fnew">' + FOLDER_SVG + '<input class="inp" id="lib-fnew" type="text" maxlength="60" placeholder="Name des Ordners, z. B. Lyrik" aria-label="Name des neuen Ordners"><button class="btn primary" type="button" data-act="lib-fnew-ok">Anlegen</button><button class="btn" type="button" data-act="lib-fnew-no">Abbrechen</button></div>' : ''}
    <div class="lib-list">${libListHTML(k, q)}</div>`}
    <div class="drawer-foot"><button class="link x-pro" type="button" data-act="lib-krlp">Standards der Klasse</button><button class="link" type="button" data-act="backup">Alle Blätter sichern (.json)</button><button class="link" type="button" data-act="restore">Sicherung oder Datei laden</button><span class="copy-s">LehrWerk · © 2026 Moritz Bauer</span></div></aside>`;
  const nl = root.querySelector('.lib-list'); if (nl) nl.scrollTop = scroll;
  if (keep) { const i = $('#lib-q'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
  else if (state.fNew) { const i = $('#lib-fnew'); if (i) i.focus(); }
  else if (state.fEdit) { const i = root.querySelector('.lib-fren'); if (i) { i.focus(); i.select(); } }
}
async function onLibClick(e) {
  const a = e.target.closest('[data-act]'); if (!a) return;
  const item = a.closest('[data-id]'); const id = item && item.dataset.id;
  const closeLib = () => { state.libOpen = false; state.confirmDel = null; state.fNew = false; state.fEdit = state.fMenu = state.fDel = state.moveOpen = null; renderLib(); };
  const fid = a.closest('[data-fid]') ? a.closest('[data-fid]').dataset.fid : '';
  switch (a.dataset.act) {
    case 'lib-fnew': state.fNew = true; state.fEdit = state.fMenu = state.fDel = null; renderLib(); break;
    case 'lib-fnew-ok': if (!newFolder(($('#lib-fnew') || {}).value)) { const i = $('#lib-fnew'); if (i) i.focus(); } break;
    case 'lib-fnew-no': state.fNew = false; renderLib(); break;
    case 'lib-ftoggle': if (fClosed.has(fid)) fClosed.delete(fid); else fClosed.add(fid); saveFClosed(); renderLib(); break;
    case 'lib-fmenu': state.fMenu = state.fMenu === fid ? null : fid; state.fDel = null; renderLib(); break;
    case 'lib-fren': state.fEdit = fid; state.fMenu = null; renderLib(); break;
    case 'lib-frlp': state.fMenu = null; renderLib(); openRlpDlg('folder', fid); break;
    case 'lib-fmappe': state.fMenu = null; renderLib(); openMappeDlg(fid); break;
    case 'lib-krlp': openRlpDlg('klasse'); break;
    case 'lib-fren-ok': { const i = a.parentNode.querySelector('.lib-fren'); const f = state.prefs.folders.find(x => x.id === fid); const v = i ? i.value.trim().slice(0, 60) : ''; if (f && v) { f.name = v; savePrefs(); } state.fEdit = null; renderLib(); break; }
    case 'lib-fup': stepFolder(fid, -1); break;
    case 'lib-fdown': stepFolder(fid, 1); break;
    case 'lib-fdel': state.fDel = fid; state.fMenu = null; renderLib(); break;
    case 'lib-fdel-no': state.fDel = null; renderLib(); break;
    case 'lib-fdel-yes': {
      const f = state.prefs.folders.find(x => x.id === fid);
      state.prefs.folders = state.prefs.folders.filter(x => x.id !== fid);
      Object.keys(state.prefs.place).forEach(sid => { if (state.prefs.place[sid] === fid) delete state.prefs.place[sid]; });
      delete state.prefs.order[fid]; fClosed.delete(fid); saveFClosed(); state.fDel = null; savePrefs(); renderLib();
      if (f) toast(`Ordner „${f.name}“ gelöscht`);
      break;
    }
    case 'lib-move': state.moveOpen = state.moveOpen === id && state.moveMode !== 'copy' ? null : id; state.moveMode = 'move'; renderLib(); break;
    case 'lib-copy':
      if (KLASSEN.length > 1) { state.moveOpen = state.moveOpen === id && state.moveMode === 'copy' ? null : id; state.moveMode = 'copy'; renderLib(); break; }
      a.dataset.kl = KL(state.klasse).id; // nur eine Klasse: gleich kopieren
      // fallthrough
    case 'lib-tab': state.libTab = a.dataset.v === 'shared' ? 'shared' : 'mine'; renderLib(); if (state.libTab === 'shared') shareLoad(); break;
    case 'share-reload': state.shared = null; renderLib(); shareLoad(true); break;
    case 'share-take': { const it = a.closest('[data-sid]'); if (it) shareTake(it.dataset.sid); break; }
    case 'share-edit': { const it = a.closest('[data-sid]'); const x = it && (state.shared || []).find(y => y.id === it.dataset.sid); if (x) { if (!state.lib.some(dd => dd.id === x.sheetId)) { toast('Die Original-Stunde liegt nicht mehr in deinen Stunden. Du kannst die geteilte Fassung trotzdem zurückziehen.'); } openShare(x.sheetId); } break; }
    case 'lib-share': if (id) { closeLib(); openSharePick(id); } break;
    case 'share-fx': state.shareF = { stufe: '', cat: '' }; renderLib(); break;
    case 'lib-copy-to':
      if (!id) break;
      if (a.dataset.kl && a.dataset.kl !== KL(state.klasse).id) { libToKlasse(id, a.dataset.kl, true); break; }
      state.moveOpen = null; closeLib();
      try {
        const src = await backend.load(id); if (!src) throw new Error('fehlt');
        const c = normalizeSheet(src); c.id = 'ab-' + uid(); c.example = false; c.meta.title = (c.meta.title || 'Ohne Titel') + ' (Kopie)';
        const fo = folderOf(id, c.klasse); if (fo) { setPlace(c.id, fo); savePrefs(); }
        openSheet(c); saveNow();
      } catch { toast('Kopieren hat nicht geklappt. Bitte erneut versuchen.'); }
      break;
    case 'lib-move-kl': if (id && a.dataset.kl) libToKlasse(id, a.dataset.kl, false); break;
    case 'lib-move-to': if (id) moveSheetTo(id, a.dataset.fid || ''); break;
    case 'lib-close': closeLib(); break;
    case 'lib-new': openNew(); break;
    case 'lib-example': closeLib(); openSheet(exampleSheet()); break;
    case 'lib-open-sheet': if (id) { closeLib(); await openById(id); if (isNarrow()) setView(state.area === 'start' ? 'edit' : 'preview'); } break;
    case 'lib-dup':
      if (!id) break;
      closeLib();
      try {
        const src = await backend.load(id); if (!src) throw new Error('fehlt');
        const c = normalizeSheet(src); c.id = 'ab-' + uid(); c.example = false; c.meta.title = (c.meta.title || 'Ohne Titel') + ' (Kopie)';
        const fo = folderOf(id, c.klasse); if (fo) { setPlace(c.id, fo); savePrefs(); }
        openSheet(c); saveNow();
      } catch { toast('Duplizieren hat nicht geklappt. Bitte erneut versuchen.'); }
      break;
    case 'lib-del': state.confirmDel = id; renderLib(); break;
    case 'lib-del-no': state.confirmDel = null; renderLib(); break;
    case 'lib-del-yes': deleteSheet(id); break;
    case 'login': closeLib(); openDlg('login'); break;
    case 'admin-open': closeLib(); admOpen(); break;
    case 'logout': closeLib(); if (savePending) saveNow(); await saveChain; try { await store.sb.auth.signOut({ scope: 'local' }); } catch {} try { localStorage.removeItem(LS_OFFUSER); indexedDB.deleteDatabase('abw-offline'); } catch {} break;
    case 'lib-migrate': migrateLocal(); break;
    case 'backup': exportBackup(); break;
    case 'restore': $('#import-file').click(); break;
  }
}

/* ---------- Anmeldung (nur mit Supabase) ---------- */
function authMsg(err) {
  const m = String((err && (err.message || err.error_description)) || err || ''); const c = err && err.code;
  if (c === 'invalid_credentials' || /invalid login credentials/i.test(m)) return 'E-Mail oder Passwort stimmt nicht.';
  if (c === 'email_not_confirmed' || /email not confirmed/i.test(m)) return 'Bitte bestätige zuerst deine E-Mail-Adresse über den Link in der Bestätigungsmail.';
  if (c === 'user_already_exists' || /already (been )?registered/i.test(m)) return 'Für diese E-Mail gibt es schon ein Konto. Bitte melde dich an.';
  if (c === 'weak_password' || /password should|at least 6/i.test(m)) return 'Das Passwort ist zu kurz oder zu einfach (mindestens 6 Zeichen).';
  if (/rate limit|too many/i.test(m) || /rate_limit/.test(c || '')) return 'Zu viele Versuche. Bitte in ein paar Minuten erneut versuchen.';
  if (c === 'signup_disabled' || /signups? not allowed|signup is disabled/i.test(m)) return 'Neue Konten legt die Person an, die dieses LehrWerk betreut. Du bekommst dann E-Mail und Passwort zum Anmelden.';
  if (c === 'email_address_not_authorized' || /not authorized/i.test(m)) return 'Die Bestätigungsmail kann an diese Adresse noch nicht verschickt werden. Bitte bei der Person melden, die diese AB-Werkstatt betreut.';
  if (c === 'over_email_send_rate_limit' || /email rate limit/i.test(m)) return 'Gerade wurden zu viele Mails verschickt. Bitte in einer Stunde erneut versuchen.';
  if (/failed to fetch|network|load failed/i.test(m)) return 'Keine Verbindung zum Server. Bitte die Internetverbindung prüfen.';
  return 'Das hat nicht geklappt: ' + m;
}
/* Anmeldung ist Pflicht: solange Online-Ablage verfügbar und niemand angemeldet ist, bleibt nur das Anmeldefenster */
const loginForced = () => !!(store.sb && !store.user && backend && backend.kind === 'local');
function openDlg(mode) { if (!store.sb) return; state.dlg = { mode, email: (state.dlg && state.dlg.email) || '' }; renderDlg(); }
function closeDlg() { const d = state.dlg; if (d && d.mode === 'klassen' && d.setup) return; if (d && d.mode === 'login' && loginForced()) return; if (d && d.mode === 'ocr') { ocrRun++; ocrStop(); if (d.url) URL.revokeObjectURL(d.url); } if (d && d.mode === 'dg') dgRead(); if (d && d.mode === 'out' && !d.done && d.orig) { state.dlg = null; outApply(d.orig); renderOut(); } state.dlg = null; renderDlg(); if (d && d.mode === 'login') setTimeout(() => maybeSetup(true), 0); }
/* ---------- Geändert auf einem anderen Gerät ---------- */
function conflictHTML() {
  const t = new Date(state.dlg.remote).toLocaleString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  return `<h2 id="dlg-t">Auf einem anderen Gerät geändert</h2>
    <p>„${esc(state.sheet.meta.title || 'Ohne Titel')}“ wurde inzwischen woanders gespeichert (${esc(t)}). Deine Änderungen hier sind noch nicht gespeichert. Was soll gelten?</p>
    <div class="cf-opts">
      <button type="button" class="tpl" data-act="cf-theirs"><span><b>Neuere Fassung laden</b><span>Die Änderungen vom anderen Gerät übernehmen. Was du hier geändert hast, verfällt.</span></span></button>
      <button type="button" class="tpl" data-act="cf-both"><span><b>Beide behalten</b><span>Deine Fassung wird als Kopie gespeichert, das Blatt behält die Änderungen vom anderen Gerät.</span></span></button>
      <button type="button" class="tpl" data-act="cf-mine"><span><b>Meine Fassung behalten</b><span>Deine Fassung überschreibt die Änderungen vom anderen Gerät.</span></span></button>
    </div>`;
}
async function conflictResolve(how) {
  const sh = state.sheet; const remote = state.conflict && state.conflict.remote; state.dlg = null; renderDlg();
  if (how === 'mine') { state.conflict = null; if (state.base) state.base.stamp = remote || Date.now(); await saveNow(); toast('Ihre Fassung ist gespeichert.'); return; }
  let theirs = null; try { theirs = await backend.load(sh.id); } catch {}
  if (how === 'both') {
    const c = clone(sh); c.id = 'ab-' + uid(); c.meta.title = (c.meta.title || 'Ohne Titel') + ' (Kopie)'; c.updatedAt = Date.now(); c.example = false;
    try { await backend.save(c); upsertLib(entryOf(c)); const fo = folderOf(sh.id, sh.klasse); if (fo) { setPlace(c.id, fo); savePrefs(); } } catch { toast('Die Kopie konnte nicht gespeichert werden.'); return; }
  }
  savePending = false; clearTimeout(saveTimer); state.conflict = null;
  if (theirs) openSheet(theirs, { keepArea: true }); else idleStatus();
  toast(how === 'both' ? 'Deine Fassung liegt jetzt als Kopie in „Meine Stunden“.' : 'Die neuere Fassung ist geladen.');
}
// Beim Zurückkehren zur Seite: neuere Fassung still übernehmen, wenn hier nichts Ungespeichertes ist
let lastStampCheck = 0;
async function checkRemote() {
  const b = backend; const sh = state.sheet;
  if (!b || !b.stamp || !sh || sh.example || state.conflict || state.dlg || Date.now() - lastStampCheck < 4000 || !state.base || state.base.id !== sh.id) return;
  lastStampCheck = Date.now();
  let r = null; try { r = await b.stamp(sh.id); } catch { return; }
  if (!r || r <= state.base.stamp + 500 || state.sheet !== sh) return;
  if (savePending) { saveNow(); return; }
  let theirs = null; try { theirs = await b.load(sh.id); } catch {}
  if (theirs && state.sheet === sh && !savePending) { openSheet(theirs, { keepArea: true }); toast('Neuere Fassung von einem anderen Gerät geladen.'); }
  try { await refreshLib(); } catch {}
}

/* ---------- Hilfe und Tipps ---------- */
const HELP = [
  ['Überblick', [
    ['Übersicht (Haus-Symbol)', 'erscheint beim Öffnen einer Stunde: Titel, Stundenfrage, Arbeitsblätter, Stundenablauf und große Knöpfe zum Bearbeiten, Präsentieren und Ausgeben. Abschalten unter Einstellungen → App.'],
    ['„+ Baustein hinzufügen“ oder Strg+K', 'zeigt alle Bausteine mit Suche: Material, Aufgaben, Unterrichtsschritte, Tafelbild, A4- und A3-Vorlagen, Exit-Ticket, Gespeichertes aus der Sammlung. Tippen filtert, Enter fügt den ersten Treffer ein; der Baustein landet in seinem Bereich.'],
    ['„Mehr“ an Aufgaben und Karten', 'Phase, Gruppe, Etikett, Standards, Niveaus, „Nur auf der Folie“, Zeit und Timer, Spalten und Schrift stehen hinter „Mehr“; was eingestellt ist, steht kurz daneben. „Alle Optionen“ über den Karten zeigt immer alles.'],
    ['Zahnrad oben', 'Einstellungen an einem Ort: Kurs und Anrede, Arbeitsblatt (Namensfeld, AFB …), Aussehen (Design, Farbe, Papier), Präsentation (Phasenleiste) und App (Basis oder Experte, Ansicht).'],
    ['Ausgeben', 'links wählen, was ausgegeben wird (auch „Ganze Stunde“ als Ordner), rechts Format und Fassung.']]],
  ['Bausteine', [
    ['„+ Neue Stunde“ oben', 'fragt Klasse, Vorlage, Nummer, Titel, Thema, Papier und Ordner ab und öffnet danach gleich den ersten Text.'],
    ['„+“ zwischen zwei Karten', 'fügt einen Baustein genau dort ein.'],
    ['Kopfzeile einer Karte anklicken', 'öffnet die Karte und schließt die anderen. Mehrere offen lassen: Haken bei „Eine Karte offen“ herausnehmen.'],
    ['Kopfzeile einer Karte ziehen', 'sortiert die Bausteine um. Tipp: vorher „Alle zuklappen“.'],
    ['⋯ an einer Karte', 'Duplizieren, Löschen, Gruppe A/B, in die Sammlung speichern.'],
    ['Tabelle: Spaltenbreite', 'Die Griffe auf dem Lineal über der Tabelle ziehen, oder einen Griff anklicken und die Pfeiltasten nutzen (mit Umschalt in 5er-Schritten). „gleich breit“ setzt zurück.'],
    ['Tabelle: Ankreuzfelder', 'Unter „Ankreuzfelder“ Spalten wählen: leere Zellen bekommen ein Kästchen. Einzelne Kästchen mit [ ] in einer Zelle, angekreuzt mit [x]. Eine fertige Selbsteinschätzung liegt in der Sammlung.'],
    ['Baustein in der Vorschau anklicken', 'springt zur passenden Karte.']]],
  ['Material und Gedicht', [
    ['Wort in der Vorschau anklicken', 'legt eine Worterklärung an (Fußnote unter dem Material).'],
    ['Zeilennummer in der Vorschau anklicken', 'ergibt eine Zeilenangabe; eine zweite Nummer macht daraus einen Bereich (Z. 3–5). „Einfügen“ setzt sie in die zuletzt bearbeitete Aufgabe.'],
    ['Text aus einem PDF einfügen', 'Zeilenumbrüche, Trennstriche und Zeilennummern werden entfernt. Strg+Umschalt+V behält die Zeilen.'],
    ['Enter / Leerzeile', 'neue Zeile / neuer Absatz.'],
    ['Spalten, Formatierung', 'zweispaltig, Schrift, Größe, Zeilenabstand, Notizrand.']]],
  ['Text formatieren', [
    ['Text markieren', 'zeigt die Leiste mit fett, kursiv, unterstrichen, Marker, Liste, Lücke.'],
    ['Strg+B · Strg+I · Strg+U', 'fett · kursiv · unterstrichen'],
    ['Emojis', 'Windows: Windows-Taste + Punkt · Mac: Ctrl + Cmd + Leertaste · Tablet und Handy: Emoji-Tastatur. Emojis aus Posts (X, Instagram, WhatsApp Web) bleiben beim Einfügen erhalten.'],
    ['Strg+Umschalt+H', 'Textmarker'],
    ['„- “ oder „1. “ am Zeilenanfang', 'beginnt eine Liste; ___ wird eine Lücke zum Ausfüllen.']]],
  ['Digitale Fassung', [
    ['Ausgeben → Digital', 'Das Blatt zum Ausfüllen am Tablet oder Laptop: Lücken, Zuordnen, Ankreuzfelder, Tabellen und Schreibflächen werden ausfüllbar, „Prüfen“ zeigt, was stimmt. Dazu Tipps und ein Antwortfeld je Aufgabe.'],
    ['Online mit QR-Code', 'Mit Anmeldung: „Online stellen“ erzeugt Link und QR-Code (auch groß für den Beamer oder direkt aufs Blatt). Nach Änderungen „Online aktualisieren“, der Link bleibt gleich. „Offline nehmen“ beendet den Zugriff.']]],
  ['Texterkennung', [
    ['Foto oder PDF', 'In der Materialkarte „Text aus Foto oder PDF übernehmen“: Foto einer Buchseite, Screenshot oder PDF wählen, hineinziehen oder einfügen. Der Text kommt bereinigt ins Material (Trennstriche und Zeilennummern entfernt). Ein Bild direkt ins Textfeld einfügen startet die Erkennung ebenfalls.'],
    ['Gut zu wissen', 'Beim ersten Mal wird das deutsche Sprachpaket geladen (einige MB, dafür braucht es Internet). Danach geht es schneller. Bitte den Text immer gegenlesen.']]],
  ['Fächer', [
    ['Fach wechseln', 'Auf die rote Randnotiz neben „LehrWerk“ klicken: Deutsch, Geschichte/Politik oder Biologie. Die Reiter zeigen dann die Klassen dieses Fachs, die Seite bekommt die Farbe des Fachs.'],
    ['Fach einer Klasse', '„+ Klassen“ neben den Reitern. Operatoren, Vorlagen und Formulierungshilfen richten sich nach dem Fach.'],
    ['Quelle, Darstellung', 'In Geschichte/Politik wird ein Material zur Quelle (Q1) oder Darstellung (D1). Bilder bekommen auf Wunsch eine Nummer (M, Q, D) mit Titel.'],
    ['Biologie', 'Bilder als Abbildung nummerieren (Abb. 1), freie Fläche für Zeichnungen und Skizzen (Baustein Schreibfläche, Art „Freie Fläche“).'],
    ['Operatorenübersicht', 'Unter „+ Baustein hinzufügen“ → „Aus der Sammlung“: für Deutsch der IQB-Grundstock, für Geschichte/Politik und Biologie die KMK-Listen mit Erläuterungen.']]],
  ['Aufgaben', [
    ['Operatoren', 'werden erkannt und fett gesetzt; dazu der Anforderungsbereich.'],
    ['Erwartung', 'steht nur in der Lehrerfassung und im Erwartungshorizont (.md).'],
    ['Zuordnen und Sortieren', 'Baustein „Zuordnen“: Paare eins zu eins verbinden. Mit „Sortieren“ stehen links wenige Oberbegriffe und rechts beliebig viele Wörter; mehrere Wörter gehören zum selben Begriff, Ablenker zu keinem. „Mehrere Wörter auf einmal“ nimmt eine ganze Liste.'],
    ['Tipps', 'bis zu drei gestufte Hilfen je Aufgabe; daraus entstehen Tippkarten. Unter „Tipps“ steht ein Vorschlag passend zum Operator und zum Material, dazu Satzanfänge und, bei Niveaustufen, Schritte für die Basis-Fassung. ⋯ am Aufgabenblock schlägt Tipps für alle Aufgaben vor.'],
    ['Zeilenangaben', 'In der Vorschau auf eine Zeilennummer klicken (für einen Bereich danach auf die letzte Zeile), dann „Einfügen“. Eingefügte Angaben wandern mit, wenn sich Text, Schrift oder Papier ändern.'],
    ['Standards', 'unter jeder Aufgabe: Standards aus dem Rahmenlehrplan (Deutsch, gymnasiale Oberstufe) oder eigene zuordnen. Sie stehen in der Lehrerfassung und im Erwartungshorizont.']]],
  ['Meine Stunden', [
    ['Ordner', 'Blätter auf einen Ordner ziehen; ohne Maus bei einem Blatt „Ordner“ wählen.'],
    ['Sortierung', 'zuletzt geändert, nach Nummer, nach Titel oder eigene Reihenfolge (zwischen zwei Blätter ziehen).'],
    ['Suche', 'findet auch Wörter aus Materialtiteln, Aufgaben und Infokästen.'],
    ['Mappe', '⋯ am Ordner → „Als Mappe ausgeben“: alle Blätter des Ordners in einem PDF, mit Deckblatt, Inhaltsverzeichnis und durchgehenden Seitenzahlen.'],
    ['Standards der Reihe', '⋯ am Ordner zeigt, welche Standards die Blätter darin abdecken und wo Lücken sind. „Standards der Klasse“ unten fasst alle Blätter einer Klasse zusammen.'],
    ['Sicherung', '„Alle Blätter sichern“ lädt alles als Datei herunter, „Sicherung oder Datei laden“ spielt sie wieder ein.']]],
  ['Tastenkürzel', [
    ['Strg+Z · Strg+Y', 'Rückgängig · Wiederholen (außerhalb von Textfeldern für das ganze Blatt)'],
    ['Strg+Umschalt+S', 'Speichern unter'],
    ['Esc', 'schließt Fenster, Menüs und „Meine Stunden“'],
    ['In der Windows-App', 'Strg+N Neue Stunde · Strg+E Ausgeben · Strg+P Drucken · Strg+O Meine Stunden']]]
];
