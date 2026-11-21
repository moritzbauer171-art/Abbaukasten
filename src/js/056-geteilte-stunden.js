/* ---------- Geteilte Stunden ---------- */
const canShare = () => !!(backend && backend.kind === 'supabase' && backend.shareList);
/* Geteilte Stunden nur aus Fächern zeigen, in denen man selbst eine Klasse hat (eigene immer) */
const myFaecher = () => new Set(KLASSEN.map(k => k.fach || 'deutsch'));
const sharedVis = () => { const F = myFaecher(); return (state.shared || []).filter(x => x.mine || F.has(x.fach || 'deutsch')); };
async function shareLoad(force) {
  if (!canShare()) { state.shared = null; return; }
  if (state.shared && !force && Date.now() - state.sharedAt < 60000) return;
  try { state.shared = await backend.shareList(); state.sharedAt = Date.now(); state.sharedErr = ''; }
  catch (err) { console.error(err); state.sharedErr = /relation|does not exist|schema cache/i.test(String(err && err.message)) ? 'Die Ablage für geteilte Stunden fehlt noch in der Datenbank.' : 'Die geteilten Stunden konnten nicht geladen werden. Bitte später erneut versuchen.'; state.shared = state.shared || []; }
  if (state.libOpen) renderLib();
  if (hmS.open) homeRender();
}
const sharedOf = sheetId => (state.shared || []).find(x => x.mine && x.sheetId === sheetId);
function sharedListHTML() {
  if (!canShare()) return `<div class="lib-empty"><p>Geteilte Stunden siehst du, wenn du angemeldet bist.</p>${store.sb ? '<button class="btn primary" type="button" data-act="login">Anmelden</button>' : ''}</div>`;
  if (!state.shared) { if (!state.shareLoading) { state.shareLoading = true; setTimeout(() => shareLoad(true).finally(() => { state.shareLoading = false; }), 0); } return '<div class="lib-empty"><p>Wird geladen …</p></div>'; }
  const q = state.shareQuery.trim().toLowerCase(); const words = q ? q.split(/\s+/).filter(Boolean) : [];
  const F = state.shareF || (state.shareF = { stufe: '', cat: '' });
  const V = sharedVis(); const L = V.filter(x => (!words.length || words.every(w => (x.title + ' ' + x.klasse + ' ' + x.autor + ' ' + x.text + ' ' + x.q + ' ' + (x.cats || []).join(' ')).toLowerCase().includes(w))) && (!F.stufe || x.stufe === F.stufe) && (!F.cat || (x.cats || []).includes(F.cat)));
  const usedCats = [...new Set([...SHARE_CATS.filter(c => V.some(x => (x.cats || []).includes(c))), ...V.flatMap(x => x.cats || []).filter(c => !SHARE_CATS.includes(c))])];
  const filt = `<div class="row sh-filt"><select class="inp" id="share-fst" aria-label="Klassenstufe">${STUFEN.map(([v, l]) => `<option value="${v}"${F.stufe === v ? ' selected' : ''}>${v ? l : 'Alle Klassenstufen'}</option>`).join('')}</select><select class="inp" id="share-fcat" aria-label="Kategorie"><option value="">Alle Kategorien</option>${usedCats.map(c => `<option${F.cat === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select>${F.stufe || F.cat ? '<button class="link" type="button" data-act="share-fx">Filter zurücksetzen</button>' : ''}</div>`;
  const fmt = t => new Date(t).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const head = `${state.sharedErr ? `<div class="notice"><span>${esc(state.sharedErr)}</span></div>` : ''}<div class="row lib-tools"><input class="inp" id="share-q" type="search" placeholder="Geteilte Stunden durchsuchen" value="${esc(state.shareQuery)}" aria-label="Geteilte Stunden durchsuchen" style="flex:1"><button class="btn" type="button" data-act="share-reload" title="Neu laden">Aktualisieren</button></div>${filt}
    <small class="hint share-hint">Hier stehen Stunden, die Kolleginnen und Kollegen mit allen Konten dieses LehrWerks teilen. Angezeigt werden Stunden aus deinen Fächern. „Übernehmen“ legt eine eigene Kopie in „${esc(KL(state.klasse).label)}“ an; das Original bleibt unverändert.</small>`;
  if (!L.length) return head + `<div class="lib-empty"><p>${V.length ? 'Keine geteilte Stunde passt zur Suche oder zum Filter.' : state.shared.length ? 'In deinen Fächern hat noch niemand eine Stunde geteilt. Angezeigt werden nur Stunden aus Fächern, in denen du eine Klasse hast.' : 'Noch keine geteilten Stunden. Teile eine eigene Stunde über „Teilen“ in der Liste „Meine Stunden“.'}</p></div>`;
  return head + L.map(x => `<div class="lib-item share-item" data-sid="${esc(x.id)}">
      <div class="t"><span>${esc(x.title)}</span>${x.mine ? '<em class="share-mine">von dir</em>' : ''}</div>
      ${shareTags(x)}<div class="m">${autorBadge(x)}${esc([(FAECHER[x.fach] || {}).label, x.klasse, x.autor ? 'von ' + x.autor : '', 'geteilt ' + fmt(x.updatedAt)].filter(Boolean).join(' · '))}</div>
      ${x.text ? `<div class="share-text">${esc(x.text)}</div>` : ''}
      <div class="a">${state.shareBusy === x.id ? '<span class="m">Wird übernommen …</span>' : `<button class="link" type="button" data-act="share-take">Übernehmen</button>${x.mine ? '<button class="link" type="button" data-act="share-edit">Bearbeiten</button>' : ''}`}</div>
    </div>`).join('');
}
async function shareTake(sid) {
  const x = (state.shared || []).find(y => y.id === sid); if (!x) return;
  state.shareBusy = sid; renderLib();
  try {
    const src = await backend.shareGet(sid); if (!src) throw new Error('fehlt');
    const c = normalizeSheet(src); c.id = 'ab-' + uid(); c.example = false; c.klasse = KL(state.klasse).id; c.updatedAt = Date.now();
    state.shareBusy = null; state.libOpen = false; state.libTab = 'mine'; renderLib(); openSheet(c); saveNow();
    toast(`„${x.title}“ übernommen${x.autor ? ' (von ' + x.autor + ')' : ''} · Deine Kopie liegt in „Meine Stunden“`);
  } catch (err) { console.error(err); state.shareBusy = null; renderLib(); toast('Übernehmen hat nicht geklappt. Bitte erneut versuchen.'); }
}
// Fenster „Stunde teilen“
async function openShare(sheetId) {
  if (!canShare()) { toast('Zum Teilen bitte anmelden.'); return; }
  await shareLoad(); const ex = sharedOf(sheetId); const e = state.lib.find(d => d.id === sheetId);
  state.dlg = { mode: 'share', sheetId, title: (e && e.title) || stTitle(state.sheet), sid: ex ? ex.id : '', text: ex ? ex.text : '', autor: ex ? ex.autor : (state.prefs.autor || '') }; renderDlg();
}
