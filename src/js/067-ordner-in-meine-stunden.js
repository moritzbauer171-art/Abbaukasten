/* ---------- Ordner in „Meine Stunden“ ---------- */
// Ordner gelten je Reiter. Gespeichert wird ein kleines Einstellungsdokument je Ablage: Ordner, Zuordnung der Blätter, eigene Reihenfolge.
const LS_PREF = 'abw.ordner', LS_SORT = 'abw.sort', LS_FZU = 'abw.fzu';
const LIB_SORT = [['neu', 'Zuletzt geändert'], ['nr', 'Nach AB-Nr.'], ['titel', 'Nach Titel'], ['eigen', 'Eigene Reihenfolge']];
// Uhrzeiten „HH:MM“ ↔ Minuten des Tages
const hmOk = v => { const m = String(v || '').trim().match(/^(\d{1,2})[:.](\d{2})$/); return m && +m[1] < 24 && +m[2] < 60 ? String(+m[1]).padStart(2, '0') + ':' + m[2] : ''; };
const hm = v => { const t = hmOk(v); return t ? +t.slice(0, 2) * 60 + +t.slice(3) : NaN; };
const hmFmt = min => { const x = Math.round(min); const h = Math.floor(((x % 1440) + 1440) % 1440 / 60), mm = ((x % 60) + 60) % 60; return `${h}:${String(mm).padStart(2, '0')}`; };
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60; };
// Vorbelegung: Georg-Herwegh-Gymnasium
const ZEIT_DEF = { 'Georg-Herwegh-Gymnasium': [{ id: 'ghg60', l: '60 Min.', s: '14:00', e: '15:00' }, { id: 'ghg75', l: '75 Min.', s: '08:15', e: '09:30' }] };
const zeitSchulen = () => [...new Set([...KLASSEN.map(k => String(k.school || '').trim()), String((state.sheet && state.sheet.meta.school) || '').trim()].filter(Boolean))];
const zeitenOf = sch => { const z = state.prefs && state.prefs.zeiten; return z && Array.isArray(z[sch]) ? z[sch] : (ZEIT_DEF[sch] || []); };
function zeitenSet(sch, L) { if (!state.prefs.zeiten) state.prefs.zeiten = {}; state.prefs.zeiten[sch] = L; savePrefs(); }
const uhrOn = () => !state.prefs || state.prefs.uhr !== false;
// Zeitplan der Stunde: geplante Zeiten je Baustein, feste Ankerpunkte („fertig bis“), Stundenende
function stPlan() {
  const m = state.sheet.meta, vp = vpOf(); const s0 = hm(vp.start); if (!Number.isFinite(s0)) return null;
  const L = Number(m.lesson) || 45; const end = s0 + L;
  const TL = ablaufOf({ meta: m, blocks: stBlocks() }).rows.filter(r => r.ph !== 'ha' && !r.par && !r.res && r.min);
  let t = s0; const at = {}; TL.forEach((r, i) => { at[r.b.id] = { i, from: t, to: t + r.min, until: r.b.untilAuto ? NaN : hm(r.b.until) }; t += r.min; });
  return { s0, end, TL, at, total: t - s0 };
}
// Dauer und „fertig bis“ ergänzen sich: aus der Dauer wird die Uhrzeit (ab dem geplanten Beginn des Bausteins), aus der Uhrzeit die Dauer.
// Berechnete Uhrzeiten (untilAuto) wandern mit, wenn sich davor etwas ändert; selbst eingetragene bleiben feste Punkte.
function timeSync(b, src) {
  const vp = vpOf(); const s0 = hm(vp.start); if (!Number.isFinite(s0)) return false;
  const rows = ablaufOf({ meta: state.sheet.meta, blocks: stBlocks() }).rows.filter(r => r.ph !== 'ha' && !r.par && !r.res);
  const startOf = x => { let t = s0; for (const r of rows) { if (r.b === x) return t; const u = hm(r.b.until); t = Number.isFinite(u) && !r.b.untilAuto ? Math.max(u, t) : t + itMin(r.b); } return NaN; };
  if (b && src === 'until') { const u = hm(b.until); delete b.untilAuto; if (Number.isFinite(u)) b.minAuto = true; else delete b.minAuto; }
  if (b && src === 'min') { delete b.minAuto; if (itMin(b)) b.untilAuto = true; else if (b.untilAuto) { delete b.until; delete b.untilAuto; } }
  let t = s0;
  rows.forEach(r => { const x = r.b, mn = itMin(x); const u = hm(x.until);
    if (x.minAuto && Number.isFinite(u)) { if (u > t) x.min = String(Math.round(u - t)); t = Math.max(u, t); }
    else if (x.untilAuto) { if (mn) { x.until = hmOk(hmFmt(t + mn)); t += mn; } else { delete x.until; delete x.untilAuto; } }
    else if (Number.isFinite(u)) t = Math.max(u, t); else t += mn; });
  return true;
}
// Ende eines Bausteins nach der Uhr: eigene Dauer, aber spätestens so, dass bis zum nächsten Anker (oder Stundenende) alles Folgende noch passt
function planEnd(P, bid, now) {
  const x = P && P.at[bid]; if (!x) return null; const TL = P.TL; const i = x.i;
  let anchor = P.end, a = TL.length - 1;
  for (let j = i; j < TL.length; j++) { const u = TL[j].b.untilAuto ? NaN : hm(TL[j].b.until); if (Number.isFinite(u)) { anchor = u; a = j; break; } }
  let rest = 0; for (let k = i + 1; k <= a; k++) rest += TL[k].min;
  // Reicht die Zeit bis zum festen Punkt nicht, werden diese und die folgenden Phasen bis dorthin anteilig gekürzt
  const d = TL[i].min, avail = anchor - now, need = d + rest; const f = need > avail ? Math.max(0, avail) / need : 1;
  return { end: now + d * f, short: f < 1, anchor, fixed: a === i && !TL[i].b.untilAuto && Number.isFinite(hm(TL[i].b.until)) };
}
function normPrefs(p) {
  p = p && typeof p === 'object' ? p : {};
  const obj = o => (o && typeof o === 'object' && !Array.isArray(o) ? o : {});
  const folders = (Array.isArray(p.folders) ? p.folders : []).filter(f => f && typeof f.id === 'string' && String(f.name || '').trim())
    .map(f => ({ id: f.id, klasse: KL(f.klasse).id, name: String(f.name).trim().slice(0, 60) }));
  const klassen = Array.isArray(p.klassen) && p.klassen.length ? p.klassen.map(normKlasse) : null;
  const rlpOwn = {}; Object.entries(obj(p.rlpOwn)).forEach(([f, l]) => { if (Array.isArray(l)) { const L = [...new Set(l.filter(x => typeof x === 'string').map(x => x.trim().slice(0, 300)).filter(Boolean))].slice(0, 400); if (L.length) rlpOwn[f] = L; } });
  const zeiten = {}; Object.entries(obj(p.zeiten)).forEach(([sch, l]) => { if (Array.isArray(l)) zeiten[String(sch).slice(0, 120)] = l.filter(x => x && typeof x === 'object').slice(0, 20).map(x => ({ id: String(x.id || 'z' + uid()).slice(0, 20), l: String(x.l || '').slice(0, 40), s: hmOk(x.s), e: hmOk(x.e) })); });
  return { v: 1, folders, place: { ...obj(p.place) }, order: { ...obj(p.order) }, rlpOwn, zeiten, ...(Object.keys(obj(p.noTime)).length ? { noTime: Object.fromEntries(Object.entries(obj(p.noTime)).filter(([, v]) => v === true).slice(0, 50)) } : {}), ...(typeof p.uhr === 'boolean' ? { uhr: p.uhr } : {}), ...(p.umfang === 'basis' || p.umfang === 'experte' ? { umfang: p.umfang } : {}), ...(PR_VT[p.trans] ? { trans: p.trans } : {}), ...(['s', 'm', 'l', 'xl'].includes(p.tmSize) ? { tmSize: p.tmSize } : {}), ...(TM_SHOW[p.tmShow] ? { tmShow: p.tmShow } : {}), ...(kbNorm(p.kanban) ? { kanban: kbNorm(p.kanban) } : {}),
    ...(Object.keys(obj(p.presMode)).length ? { presMode: Object.fromEntries(Object.entries(obj(p.presMode)).filter(([k, v]) => k.length < 60 && (v === 'tafel' || v === 'folien')).slice(0, 80)) } : {}), ...(typeof p.autor === 'string' ? { autor: p.autor.slice(0, 80) } : {}), ...(typeof p.sichAuto === 'boolean' ? { sichAuto: p.sichAuto } : {}), ...(typeof p.sichLast === 'boolean' ? { sichLast: p.sichLast } : {}), ...(klassen ? { klassen } : {}) };
}
const fClosed = new Set(lsGet(LS_FZU) || []);
const saveFClosed = () => lsSet(LS_FZU, [...fClosed]);
let prefsTimer = null;
function savePrefs() {
  clearTimeout(prefsTimer); const b = backend;
  prefsTimer = setTimeout(async () => {
    if (!b || !b.savePrefs || b !== backend || state.prefsFail || !state.klReady) return;
    try { await b.savePrefs(clone(state.prefs)); } catch (err) { console.error(err); toast('Die Ordner konnten gerade nicht gespeichert werden. Die nächste Änderung versucht es erneut.'); }
  }, 250);
}
async function loadPrefs(b) { let p = null, fail = false; try { p = b && b.loadPrefs ? await b.loadPrefs() : null; } catch (err) { console.error(err); fail = true; } if (b === backend) { state.prefs = normPrefs(p); state.prefsFail = fail && b.kind !== 'local'; tmApply(); if (state.prefs.umfang && (state.prefs.umfang === 'basis') !== isBasis()) { setUmfang(state.prefs.umfang, true); lsSet(LS_UMFANG, state.prefs.umfang); basisClamp(); try { renderEditor(); } catch {} } if (state.prefsFail) toast('Deine Einstellungen ließen sich gerade nicht laden. Bis zum Neuladen speichert LehrWerk keine Änderungen an Klassen und Ordnern.'); } }
function mergePrefs(p) {
  const lp = normPrefs(p); if (!lp.folders.length && !Object.keys(lp.place).length && !lp.klassen) return false;
  const ids = new Set(state.prefs.folders.map(f => f.id));
  lp.folders.forEach(f => { if (!ids.has(f.id)) state.prefs.folders.push(f); });
  Object.entries(lp.place).forEach(([sid, fid]) => { if (!state.prefs.place[sid]) state.prefs.place[sid] = fid; });
  Object.entries(lp.order).forEach(([k, v]) => { if (!state.prefs.order[k] && Array.isArray(v)) state.prefs.order[k] = v; });
  Object.entries(lp.zeiten || {}).forEach(([k, v]) => { if (!state.prefs.zeiten) state.prefs.zeiten = {}; if (!state.prefs.zeiten[k]) state.prefs.zeiten[k] = v; });
  if (lp.klassen) { const have = state.prefs.klassen || []; const ids = new Set(have.map(k => k.id)); state.prefs.klassen = have.concat(lp.klassen.filter(k => !ids.has(k.id))); applyKlassen(); }
  savePrefs(); return true;
}
const libFolders = kl => state.prefs.folders.filter(f => f.klasse === kl);
function folderOf(id, kl) { const f = state.prefs.place[id]; return f && state.prefs.folders.some(x => x.id === f && x.klasse === kl) ? f : ''; }
function setPlace(id, fid) { if (fid) state.prefs.place[id] = fid; else delete state.prefs.place[id]; }
function dropPlace(id) { let ch = !!state.prefs.place[id]; delete state.prefs.place[id]; Object.values(state.prefs.order).forEach(o => { const i = Array.isArray(o) ? o.indexOf(id) : -1; if (i >= 0) { o.splice(i, 1); ch = true; } }); if (ch) savePrefs(); }
const libSort = () => { const v = lsGet(LS_SORT); return LIB_SORT.some(x => x[0] === v) ? v : 'neu'; };
const orderKey = (fid, kl) => fid || '_' + kl;
function sortLibList(arr, fid, kl, mode = libSort()) {
  const a = arr.slice();
  const nrv = d => { const n = parseFloat(String(d.nr).replace(',', '.')); return isNaN(n) ? Infinity : n; };
  if (mode === 'nr') a.sort((x, y) => nrv(x) - nrv(y) || x.title.localeCompare(y.title, 'de', { numeric: true }));
  else if (mode === 'titel') a.sort((x, y) => x.title.localeCompare(y.title, 'de', { numeric: true }));
  else if (mode === 'eigen') { const o = state.prefs.order[orderKey(fid, kl)] || []; const pos = id => { const i = o.indexOf(id); return i < 0 ? Infinity : i; }; a.sort((x, y) => pos(x.id) - pos(y.id) || y.updatedAt - x.updatedAt); }
  else a.sort((x, y) => y.updatedAt - x.updatedAt);
  return a;
}
// Beim Wechsel auf „Eigene Reihenfolge“ bleibt die Reihenfolge stehen, die gerade zu sehen ist
function freezeOrder(kl) {
  const mode = libSort(); if (mode === 'eigen') return;
  const all = state.lib.filter(d => d.klasse === kl);
  ['', ...libFolders(kl).map(f => f.id)].forEach(fid => { state.prefs.order[orderKey(fid, kl)] = sortLibList(all.filter(d => folderOf(d.id, kl) === fid), fid, kl, mode).map(d => d.id); });
  lsSet(LS_SORT, 'eigen');
}
const FOLDER_SVG = '<svg class="fi" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 5.5a1.5 1.5 0 0 1 1.5-1.5h3.6l1.6 1.8H16a1.5 1.5 0 0 1 1.5 1.5v7.7A1.5 1.5 0 0 1 16 16.5H4A1.5 1.5 0 0 1 2.5 15z"/></svg>';
const CHEV_SVG = '<svg class="chev-s" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 4l4 4-4 4"/></svg>';
const GRIP_SVG = '<svg class="grip" viewBox="0 0 10 16" fill="currentColor" aria-hidden="true"><circle cx="3" cy="4" r="1.2"/><circle cx="7" cy="4" r="1.2"/><circle cx="3" cy="8" r="1.2"/><circle cx="7" cy="8" r="1.2"/><circle cx="3" cy="12" r="1.2"/><circle cx="7" cy="12" r="1.2"/></svg>';
// Ziel-Auswahl unter einem Eintrag: Kopie in diese oder eine andere Klasse; verschieben in einen Ordner oder eine andere Klasse
function libMvHTML(d, k, fs, fid) {
  const others = KLASSEN.filter(x => x.id !== k.id);
  const kc = (act, x) => `<button type="button" class="chip" data-act="${act}" data-kl="${esc(x.id)}">${esc(x.label)}${x.fach && x.fach !== k.fach && FAECHER[x.fach] ? ' · ' + esc(FAECHER[x.fach].label) : ''}</button>`;
  if (state.moveMode === 'copy') return `<div class="lib-mv"><span>Kopie anlegen in</span><button type="button" class="chip" data-act="lib-copy-to" data-kl="${esc(k.id)}">${esc(k.label)} (hier)</button>${others.map(x => kc('lib-copy-to', x)).join('')}</div>`;
  return `<div class="lib-mv">${fs.length ? `<span>In Ordner</span>${[['', 'Ohne Ordner'], ...fs.map(f => [f.id, f.name])].map(([id, n]) => `<button type="button" class="chip${fid === id ? ' on' : ''}" data-act="lib-move-to" data-fid="${esc(id)}">${esc(n)}</button>`).join('')}` : ''}${others.length ? `<span${fs.length ? ' class="lib-mv-k"' : ''}>In andere Klasse</span>${others.map(x => kc('lib-move-kl', x)).join('')}` : ''}</div>`;
}
// Stunde in eine andere Klasse kopieren (Kopie bleibt dort ungeöffnet) oder verschieben (Ordner der alten Klasse entfällt)
async function libToKlasse(id, kl, copy) {
  const K = KLASSEN.find(x => x.id === kl); if (!K || !backend) return;
  const open = state.sheet && state.sheet.id === id;
  try {
    if (open && !copy) { state.moveOpen = null; dropPlace(id); moveKlasse(K.id); upsertLib(entryOf(state.sheet)); renderLib(); return; }
    const src = open ? clone(state.sheet) : await backend.load(id); if (!src) throw new Error('fehlt');
    const c = normalizeSheet(src); klasseSwap(c, K.id); c.updatedAt = Date.now();
    if (copy) { c.id = 'ab-' + uid(); c.example = false; }
    await backend.save(c); upsertLib(entryOf(c));
    if (!copy) dropPlace(id);
    state.moveOpen = null; renderLib();
    toast(copy ? `Kopie von „${stTitle(c)}“ liegt jetzt in ${K.label}.` : `„${stTitle(c)}“ liegt jetzt in ${K.label}.`);
  } catch (err) { console.error(err); toast(copy ? 'Kopieren hat nicht geklappt. Bitte erneut versuchen.' : 'Verschieben hat nicht geklappt. Bitte erneut versuchen.'); }
}
function libListHTML(k, q) {
  const fmt = t => new Date(t).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const fs = libFolders(k.id); const all = state.lib.filter(d => d.klasse === k.id);
  const words = q ? q.split(/\s+/).filter(Boolean) : [];
  const hay = d => (d.title + ' ' + d.nr + ' ' + (d.q || '')).toLowerCase();
  const match = d => !words.length || words.every(w => hay(d).includes(w));
  const hit = d => { if (!words.length) return ''; const head = (d.title + ' ' + d.nr).toLowerCase(); const w = words.find(x => !head.includes(x)); if (!w) return ''; const t = d.q || ''; const i = t.toLowerCase().indexOf(w); if (i < 0) return ''; const a = Math.max(0, t.lastIndexOf(' ', Math.max(0, i - 28)) + 1), e = Math.min(t.length, i + w.length + 40); const sn = t.slice(a, e); const j = sn.toLowerCase().indexOf(w); return `<div class="m lib-hit">${a > 0 ? '… ' : ''}${esc(sn.slice(0, j))}<mark>${esc(sn.slice(j, j + w.length))}</mark>${esc(sn.slice(j + w.length))}${e < t.length ? ' …' : ''}</div>`; };
  const item = d => { const fid = folderOf(d.id, k.id); return `<div class="lib-item${d.id === state.sheet.id ? ' cur' : ''}" data-id="${esc(d.id)}" draggable="true">
      <div class="t" data-act="lib-open-sheet">${d.nr ? `<em>AB ${esc(d.nr)}</em>` : ''}<span>${esc(d.title)}</span>${GRIP_SVG}</div>
      ${hit(d)}<div class="m">${d.abs > 1 ? d.abs + ' Arbeitsblätter · ' : ''}geändert ${fmt(d.updatedAt)}${d.id === state.sheet.id ? ' · gerade geöffnet' : ''}</div>
      <div class="a">${state.confirmDel === d.id
        ? `<span class="m">Endgültig löschen?</span><button class="link danger" type="button" data-act="lib-del-yes">Löschen</button><button class="link" type="button" data-act="lib-del-no">Abbrechen</button>`
        : `<button class="link" type="button" data-act="lib-open-sheet">Öffnen</button><button class="link" type="button" data-act="lib-copy" aria-expanded="${state.moveOpen === d.id && state.moveMode === 'copy'}">Kopieren</button>${canShare() ? `<button class="link" type="button" data-act="lib-share">${sharedOf(d.id) ? 'Geteilt ✓' : 'Teilen'}</button>` : ''}${fs.length || KLASSEN.length > 1 ? `<button class="link" type="button" data-act="lib-move" aria-expanded="${state.moveOpen === d.id && state.moveMode !== 'copy'}">Verschieben</button>` : ''}<button class="link danger" type="button" data-act="lib-del">Löschen</button>`}</div>
      ${state.moveOpen === d.id ? libMvHTML(d, k, fs, fid) : ''}
    </div>`; };
  const sec = f => {
    const total = all.filter(d => folderOf(d.id, k.id) === f.id).length;
    const its = sortLibList(all.filter(d => folderOf(d.id, k.id) === f.id && match(d)), f.id, k.id);
    if (q && !its.length) return '';
    const open = !!q || !fClosed.has(f.id); const edit = state.fEdit === f.id;
    return `<section class="lib-fs${open ? ' open' : ''}" data-fid="${esc(f.id)}">
      <div class="lib-f" data-fid="${esc(f.id)}" draggable="${edit ? 'false' : 'true'}">${edit
        ? `<input class="inp lib-fren" type="text" value="${esc(f.name)}" maxlength="60" aria-label="Name des Ordners"><button class="btn primary" type="button" data-act="lib-fren-ok">OK</button>`
        : `<button type="button" class="lib-fh" data-act="lib-ftoggle" aria-expanded="${open}" title="${open ? 'Zuklappen' : 'Aufklappen'}">${CHEV_SVG}${FOLDER_SVG}<span class="fn">${esc(f.name)}</span><span class="fc">${total}</span></button><button type="button" class="ib" data-act="lib-fmenu" title="Ordner bearbeiten" aria-expanded="${state.fMenu === f.id}">${I.more}</button>`}</div>
      ${state.fMenu === f.id && !edit ? `<div class="lib-fmenu"><button class="link" type="button" data-act="lib-fmappe">Als Mappe ausgeben</button><button class="link x-pro" type="button" data-act="lib-frlp">Standards der Reihe</button><button class="link" type="button" data-act="lib-fren">Umbenennen</button><button class="link" type="button" data-act="lib-fup">Nach oben</button><button class="link" type="button" data-act="lib-fdown">Nach unten</button><button class="link danger" type="button" data-act="lib-fdel">Löschen</button></div>` : ''}
      ${state.fDel === f.id ? `<div class="lib-fmenu warnrow"><span>Ordner „${esc(f.name)}“ löschen?${total === 1 ? ' Das Blatt darin bleibt erhalten und liegt danach ohne Ordner.' : total ? ` Die ${total} Blätter darin bleiben erhalten und liegen danach ohne Ordner.` : ''}</span><button class="link danger" type="button" data-act="lib-fdel-yes">Löschen</button><button class="link" type="button" data-act="lib-fdel-no">Abbrechen</button></div>` : ''}
      ${open ? `<div class="lib-fb" data-fid="${esc(f.id)}">${its.length ? its.map(item).join('') : `<div class="lib-fe">Leer · Blätter hierher ziehen oder bei einem Blatt „Ordner“ wählen</div>`}</div>` : ''}
    </section>`;
  };
  const loose = sortLibList(all.filter(d => !folderOf(d.id, k.id) && match(d)), '', k.id);
  const folders = fs.map(sec).join('');
  if (!all.length && !fs.length) return `<div class="empty">Noch keine Blätter unter ${esc(k.label)}. Sobald du ein Blatt bearbeitest, erscheint es hier.</div>`;
  if (q && !folders && !loose.length) return '<div class="empty">Keine Treffer.</div>';
  return folders + ((loose.length || fs.length) && !(q && !loose.length) ? `<section class="lib-fs lib-loose open" data-fid="">${fs.length ? '<div class="lib-f lib-lh" data-fid="">Ohne Ordner</div>' : ''}<div class="lib-fb" data-fid="">${loose.length ? loose.map(item).join('') : '<div class="lib-fe">Hierher ziehen, um ein Blatt aus seinem Ordner zu nehmen</div>'}</div></section>` : '');
}
function newFolder(name) {
  name = String(name || '').trim().slice(0, 60); if (!name) return false;
  const f = { id: 'f-' + uid(), klasse: KL(state.klasse).id, name };
  state.prefs.folders.push(f); state.fNew = false; savePrefs(); renderLib();
  toast(`Ordner „${name}“ angelegt · Blätter einfach hineinziehen`); return true;
}
function moveSheetTo(id, fid, ref, before) {
  const kl = KL(state.klasse).id; const d = state.lib.find(x => x.id === id); if (!d) return;
  const from = folderOf(id, kl); let note = '';
  if (ref) {
    if (libSort() !== 'eigen') { freezeOrder(kl); note = ' · Sortierung jetzt: eigene Reihenfolge'; }
    const grp = sortLibList(state.lib.filter(x => x.klasse === kl && folderOf(x.id, kl) === fid && x.id !== id), fid, kl).map(x => x.id);
    let i = grp.indexOf(ref); if (i < 0) i = grp.length; else if (!before) i++;
    grp.splice(i, 0, id); state.prefs.order[orderKey(fid, kl)] = grp;
  }
  setPlace(id, fid);
  if (from !== fid) { Object.values(state.prefs.order).forEach(o => { if (Array.isArray(o) && o !== state.prefs.order[orderKey(fid, kl)]) { const j = o.indexOf(id); if (j >= 0) o.splice(j, 1); } }); if (fid) fClosed.delete(fid), saveFClosed(); }
  state.moveOpen = null; savePrefs(); renderLib();
  if (from !== fid) { const f = state.prefs.folders.find(x => x.id === fid); toast(`„${d.title}“ ${f ? `liegt jetzt in „${f.name}“` : 'liegt jetzt ohne Ordner'}${note}`); }
  else if (note) toast(note.slice(3));
}
function moveFolder(id, ref, before) {
  const a = state.prefs.folders; const i = a.findIndex(f => f.id === id); if (i < 0) return;
  const [f] = a.splice(i, 1); let j = a.findIndex(x => x.id === ref); if (j < 0) j = a.length; else if (!before) j++;
  a.splice(j, 0, f); savePrefs(); renderLib();
}
function stepFolder(id, dir) {
  const kl = KL(state.klasse).id; const mine = libFolders(kl); const i = mine.findIndex(f => f.id === id); const t = mine[i + dir];
  if (t) moveFolder(id, t.id, dir < 0);
}
/* Ziehen und Ablegen in „Meine Stunden“ */
let libDrag = null;
function libClearDrop() { document.querySelectorAll('#lib-root .drop-into,#lib-root .drop-before,#lib-root .drop-after').forEach(n => n.classList.remove('drop-into', 'drop-before', 'drop-after')); }
function libTarget(e) {
  const d = libDrag; if (!d) return null;
  const secEl = e.target.closest && e.target.closest('.lib-fs'); if (!secEl) return null;
  if (d.kind === 'folder') {
    if (secEl.classList.contains('lib-loose') || secEl.dataset.fid === d.id) return null;
    const r = secEl.getBoundingClientRect(); const before = e.clientY < r.top + Math.min(r.height, 44) / 2 || e.clientY < r.top + r.height / 2;
    return { el: secEl, cls: before ? 'drop-before' : 'drop-after', ref: secEl.dataset.fid, before };
  }
  const it = e.target.closest('.lib-item');
  if (it && it.dataset.id !== d.id) { const r = it.getBoundingClientRect(); const before = e.clientY < r.top + r.height / 2; return { el: it, cls: before ? 'drop-before' : 'drop-after', fid: secEl.dataset.fid, ref: it.dataset.id, before }; }
  if (it) return null;
  return { el: secEl, cls: 'drop-into', fid: secEl.dataset.fid };
}

