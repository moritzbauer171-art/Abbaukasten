/* ---------- Klassen je Konto ---------- */
// Bestehende Konten (mit Blättern in den alten Reitern) behalten Grundkurs, Klasse 10 und Klasse 9/10.
// Neue Konten richten beim ersten Start ihre eigenen Klassen ein.
function applyKlassen() {
  let ks = Array.isArray(state.prefs.klassen) && state.prefs.klassen.length ? state.prefs.klassen.map(normKlasse) : null;
  state.needSetup = false;
  if (!ks) {
    const legacy = state.lib.some(d => LEGACY_IDS.includes(d.kraw || d.klasse) && (d.kraw || '') !== '');
    // Wer bisher nur im Browser gearbeitet hat und sich jetzt anmeldet, nimmt seine Klassen mit
    const lp = backend && backend.kind !== 'local' ? normPrefs(lsGet(LS_PREF)) : null;
    const localLegacy = backend && backend.kind !== 'local' && Object.values(localLib()).some(x => x && x.sheet && LEGACY_IDS.includes(x.sheet.klasse));
    if (lp && lp.klassen) { ks = lp.klassen; state.prefs.klassen = ks; savePrefs(); }
    else if (legacy || localLegacy) { ks = DEFAULT_KLASSEN.map(normKlasse); state.prefs.klassen = ks; savePrefs(); }
    else if (state.prefsFail || state.lib.length) {
      // Einstellungen fehlen, aber es gibt Blätter: Reiter aus den Blättern ableiten statt neu einrichten (wird nicht gespeichert, solange das Laden fehlschlug)
      const cache = (lsGet(LS_KLCACHE) || []).filter(k => k && k.id);
      const ids = [...new Set(state.lib.map(d => d.kraw || d.klasse).filter(Boolean))];
      ks = ids.length ? ids.map((id, i) => normKlasse(cache.find(k => k.id === id) || { id, label: 'Klasse ' + (i + 1) }, i)) : cache.length ? cache.map(normKlasse) : [normKlasse({ id: 'k1', label: 'Meine Klasse', course: 'Deutsch', accent: 'tinte', anrede: 'sie' }, 0)];
      if (!state.prefsFail) { state.prefs.klassen = ks; savePrefs(); }
    }
    else { ks = [normKlasse({ id: 'k1', label: 'Meine Klasse', course: 'Deutsch', accent: 'tinte', anrede: 'sie' }, 0)]; state.needSetup = true; }
  }
  KLASSEN = ks; lsSet(LS_KLCACHE, ks);
  state.lib.forEach(d => { d.klasse = KL(d.kraw || d.klasse).id; });
  if (!KLASSEN.some(k => k.id === state.klasse)) { state.klasse = KLASSEN[0].id; lsSet(LS.klasse, state.klasse); }
  // Neues Konto: keine Hinweise auf frühere Neuerungen; Startseite und Tour erst nach der Einrichtung
  if (state.needSetup) { state.newAcct = true; lsSet(LS_NEWS, NEWS_ID); }
  state.klReady = true;
  if (!state.needSetup && state.dlg && state.dlg.mode === 'klassen' && state.dlg.setup) { state.dlg = null; renderDlg(); }
  renderTabs(); if (state.libOpen) renderLib();
}
// Ohne Anmeldung, aber mit Online-Ablage: erst anmelden lassen (die Einrichtung folgt nur für neue Konten)
function maybeSetup(afterLogin) { if (COMPANION_PAGE()) return; if (!state.klReady || !state.needSetup || state.dlg) return; if (!afterLogin && store.sb && !store.user) { openDlg('login'); return; } openKlassen(true); }
function openKlassen(setup, addFach) {
  const rows = (setup || addFach ? [] : KLASSEN).map(k => ({ ...k }));
  if (addFach) rows.push(normKlasse({ id: 'k-' + uid(), label: '', course: FAECHER[addFach].course, school: (KLASSEN.find(x => x.fach === addFach) || KLASSEN[KLASSEN.length - 1] || {}).school || '', accent: ({ deutsch: 'tinte', gp: 'wein', bio: 'petrol', en: 'wein', es: 'graphit' })[addFach] || Object.keys(ACCENTS)[FACH_ORDER.indexOf(addFach) % Object.keys(ACCENTS).length], anrede: (KLASSEN[KLASSEN.length - 1] || {}).anrede, fach: addFach }, rows.length));
  if (setup) { rows.push(normKlasse({ id: 'k1', label: '', course: 'Deutsch', accent: 'tinte', anrede: 'du' }, 0)); rows[0].fresh = true; }
  if (addFach) { rows[rows.length - 1].label = ''; rows[rows.length - 1].fresh = true; }
  state.dlg = { mode: 'klassen', setup: !!setup, rows, school: setup ? '' : null, wantFach: addFach || null, single: !!addFach && !setup };
  renderDlg(); if (addFach) setTimeout(() => { const f = document.querySelector('#dlg-root [data-kf="label"]'); if (f) f.focus(); }, 30);
}
function klassenHTML() {
  const d = state.dlg; const cnt = id => state.lib.filter(x => x.klasse === id).length;
  const row = (k, i) => `<div class="kl-row" data-i="${i}">
      <div class="kl-top"><span class="kl-dot" style="background:${ACCENTS[k.accent].c}"></span><input class="inp" data-kf="label" value="${esc(k.label)}" placeholder="Name des Reiters, z. B. 8b oder LK ${esc((FAECHER[k.fach] || FAECHER.deutsch).label)}" maxlength="40" aria-label="Name des Reiters">
        ${d.setup || d.single ? '' : `<button type="button" class="ib" data-act="kl-up" data-i="${i}" title="Nach vorn"${i === 0 ? ' disabled' : ''}>${I.up}</button><button type="button" class="ib" data-act="kl-down" data-i="${i}" title="Nach hinten"${i === d.rows.length - 1 ? ' disabled' : ''}>${I.down}</button>`}
        ${d.single ? '' : `<button type="button" class="ib" data-act="kl-del" data-i="${i}" title="${d.rows.length < 2 ? 'Die letzte Klasse lässt sich nicht entfernen' : 'Klasse entfernen'}"${d.rows.length < 2 ? ' disabled' : ''}>${I.del}</button>`}</div>
      ${k.delAsk ? (() => { const n = cnt(k.id), T = d.rows.filter((x, j) => j !== i && String(x.label).trim()); return `<div class="kl-delask"><b>„${esc(k.label || 'Ohne Namen')}“ enthält ${n} ${n === 1 ? 'Blatt' : 'Blätter'}.</b> Was soll damit passieren?
        <div class="kl-delask-a">${T.length ? `<label class="kl-delask-to">Verschieben nach <select class="inp" data-kdel-to="${i}">${T.map(x => `<option value="${esc(x.id)}">${esc(x.label)}${x.fach && x.fach !== k.fach ? ' (' + esc((FAECHER[x.fach] || {}).label || '') + ')' : ''}</option>`).join('')}</select></label><button type="button" class="btn primary" data-act="kl-del-move" data-i="${i}">Verschieben und Klasse entfernen</button>` : ''}
        ${k.puz ? '' : `<button type="button" class="btn kl-del-hard" data-act="kl-del-all" data-i="${i}">Klasse samt ${n} ${n === 1 ? 'Blatt' : 'Blättern'} löschen</button>`}<button type="button" class="btn" data-act="kl-del-no" data-i="${i}">Abbrechen</button></div>
        ${k.puz ? `<div class="kl-puz"><b>Kleines Rätsel, bevor ${n} Blätter verschwinden:</b><div class="kl-puz-r"><span class="kl-puz-q">${esc(k.puz.q)}</span><input class="inp" type="text" inputmode="numeric" autocomplete="off" data-kpuz="${i}" value="${esc(k.puz.typed || '')}" aria-label="Lösung"><button type="button" class="btn kl-del-hard" data-act="kl-del-puz" data-i="${i}">Lösen und löschen</button></div>${k.puz.err ? `<small class="kl-puz-err">${esc(k.puz.err)}</small>` : '<small class="hint">Nur wer das löst, löscht wirklich.</small>'}</div>` : ''}
        <small class="hint">Ausgeführt wird erst beim Speichern.</small></div>`; })() : ''}
      <div class="kl-grid">
        <label class="f"><span>Kurs auf dem Blatt</span><input class="inp" data-kf="course" value="${esc(k.course)}" placeholder="z. B. Deutsch Klasse 8b" maxlength="80"></label>
        ${d.setup ? '' : `<label class="f"><span>Schule</span><input class="inp" data-kf="school" value="${esc(k.school)}" placeholder="Schule" maxlength="80"></label>`}
        <div class="f kl-stufe"><span>Schulform</span><div class="seg sm" role="group"><button type="button" data-act="kl-set" data-f="stufe" data-v="gs" data-i="${i}" aria-pressed="${k.stufe === 'gs'}">Grundschule</button><button type="button" data-act="kl-set" data-f="stufe" data-v="os" data-i="${i}" aria-pressed="${k.stufe !== 'gs'}">Oberschule</button></div></div>
        ${k.stufe === 'gs' ? `<div class="f kl-jg"><span>Klassenstufe</span><div class="seg sm" role="group">${[1, 2, 3, 4, 5, 6].map(n => `<button type="button" data-act="kl-set" data-f="jg" data-v="${n}" data-i="${i}" aria-pressed="${+k.jg === n}">${n}</button>`).join('')}</div><small class="hint">Bestimmt Lineatur und Schriftgröße neuer Bausteine.</small></div>` : ''}
        <label class="f kl-fach"><span>Fach</span><select class="inp" data-kf="fach" aria-label="Fach">${FACH_ORDER.map(fk => `<option value="${fk}"${k.fach === fk ? ' selected' : ''}>${esc(FAECHER[fk].label)}</option>`).join('')}</select></label>
        <div class="f"><span>Anrede</span><div class="seg sm" role="group"><button type="button" data-act="kl-set" data-f="anrede" data-v="sie" data-i="${i}" aria-pressed="${k.anrede === 'sie'}">Sie</button><button type="button" data-act="kl-set" data-f="anrede" data-v="du" data-i="${i}" aria-pressed="${k.anrede === 'du'}">du</button></div></div>
        <div class="f"><span>Farbe</span><div class="kl-sw">${Object.entries(ACCENTS).map(([a, x]) => `<button type="button" class="kl-c" data-act="kl-set" data-f="accent" data-v="${a}" data-i="${i}" aria-pressed="${k.accent === a}" title="${x.name}" style="background:${x.c}"></button>`).join('')}</div></div>
      </div></div>`;
  if (d.single) return `<h2 id="dlg-t">Neue Klasse in ${esc(FAECHER[d.wantFach].label)}</h2>
    <p class="kl-want">Damit ist <b>${esc(FAECHER[d.wantFach].label)}</b> oben in der Fach-Auswahl. Name, Schulform und Anrede lassen sich später unter „Klassen“ ändern.</p>
    <div class="kl-list">${d.rows.map(row).join('')}</div>
    <div class="err" id="dlg-err" role="alert"></div>
    <div class="row"><button class="btn primary" type="button" data-act="kl-save">Klasse anlegen</button><button class="btn" type="button" data-act="dlg-close">Abbrechen</button></div>`;
  return `<h2 id="dlg-t">${d.setup ? 'Willkommen beim LehrWerk' : 'Klassen'}</h2>
    ${d.wantFach ? `<p class="kl-want">Neue Klasse für <b>${FAECHER[d.wantFach].label}</b>: unten Namen eintragen.</p>` : ''}<p>${d.setup ? 'Leg deine Klassen oder Kurse an. Jede bekommt einen eigenen Reiter mit eigener Ablage, eigenem Kurs im Kopf des Blatts und der passenden Anrede in den Aufgaben. Später lässt sich alles ändern.' : 'Reiter umbenennen, ergänzen, umsortieren. Änderungen an Kurs und Schule gelten für neue Blätter; vorhandene Blätter behalten ihre Angaben.'}</p>
    ${d.setup ? `<label class="f"><span>Deine Schule</span><input class="inp" id="kl-school" value="${esc(d.school || '')}" placeholder="z. B. Musterschule Berlin" maxlength="80"></label>` : ''}
    <div class="kl-list">${d.rows.map(row).join('')}</div>
    <button type="button" class="link" data-act="kl-add">+ Weitere Klasse</button>
    ${d.setup ? `<div class="f kl-umf"><span>Wie viel soll LehrWerk zeigen?</span><div class="kl-umfo" role="radiogroup" aria-label="Funktionsumfang">${[['basis', 'Basis', 'Arbeitsblätter und die Präsentation dazu. Übersichtlich für den Einstieg.'], ['experte', 'Experte', 'Alles: dazu Stundenplanung mit Zeiten und Verlaufsplan, Tafelbilder, Karten, Druck-Extras, Startseite und Board.']].map(([v, l, t]) => `<button type="button" role="radio" class="kl-uo" data-act="kl-umf" data-v="${v}" aria-checked="${(d.umf || 'basis') === v}"><b>${l}</b><small>${t}</small></button>`).join('')}</div><small class="hint">Lässt sich jederzeit ändern: Einstellungen ⚙ → App → Funktionsumfang.</small></div>` : ''}
    <div class="err" id="dlg-err" role="alert"></div><div class="ok" id="dlg-ok" role="status" hidden></div>
    <div class="row"><button class="btn primary" type="button" data-act="kl-save">${d.setup ? 'Los geht’s' : 'Fertig'}</button>${d.setup ? '' : '<button class="btn" type="button" data-act="dlg-close">Abbrechen</button>'}</div>${d.setup ? '<p class="copy-l">LehrWerk · © 2026 Moritz Bauer</p>' : ''}`;
}
async function klassenSave() {
  const d = state.dlg;
  if (d.setup && backend && backend.kind !== 'local' && backend.loadPrefs) {
    let p = null; try { p = await backend.loadPrefs(); } catch (err) { console.error(err); dlgMsg('Dein Konto ist gerade nicht erreichbar. Bitte gleich noch einmal versuchen.'); return; }
    if (p && Array.isArray(p.klassen) && p.klassen.length) { state.prefs = normPrefs(p); state.dlg = null; renderDlg(); applyKlassen(); await openForKlasse(state.klasse); toast('Deine Klassen sind schon im Konto gespeichert und wurden geladen.'); return; }
  } const jobs = (d.kldel || []).map(j => ({ ...j, ids: state.lib.filter(x => x.klasse === j.from).map(x => x.id) })).filter(j => j.ids.length); const school = d.setup ? dlgVal('#kl-school') : null;
  const rows = [...(d.single ? KLASSEN.map(k => ({ ...k })) : []), ...d.rows.filter(k => String(k.label).trim())];
  if (d.single && !d.rows.some(k => String(k.label).trim())) { dlgMsg('Bitte der neuen Klasse einen Namen geben, z. B. 8b oder Q1 Mathe.'); const f = document.querySelector('#dlg-root [data-kf="label"]'); if (f) f.focus(); return; }
  if (!rows.length) { dlgMsg('Bitte mindestens einer Klasse einen Namen geben.'); const f = document.querySelector('#dlg-root [data-kf="label"]'); if (f) f.focus(); return; }
  const used = new Set();
  const ks = rows.map((k, i) => { let id = k.id && !used.has(k.id) ? k.id : 'k-' + uid(); used.add(id); return normKlasse({ ...k, id, school: d.setup ? school : k.school, course: k.course || k.label }, i); });
  const setup = d.setup; const curF = fachKey(state.klasse); const oldIds = new Set(KLASSEN.map(k => k.id)); state.prefs.klassen = ks; if (setup) state.prefs.umfang = d.umf || 'basis'; state.dlg = null; renderDlg();
  KLASSEN = ks; lsSet(LS_KLCACHE, ks); state.needSetup = false; savePrefs();
  state.lib.forEach(x => { x.klasse = KL(x.kraw || x.klasse).id; });
  if (setup || !KLASSEN.some(k => k.id === state.klasse)) { state.klasse = KLASSEN[0].id; lsSet(LS.klasse, state.klasse); openSheet(draftFor(state.klasse)); }
  renderTabs(); renderEditor(); if (state.libOpen) renderLib();
  if (setup) { setUmfang(state.prefs.umfang, true); lsSet(LS_UMFANG, state.prefs.umfang); basisClamp(); renderEditor(); lsSet(LS_NEWS, NEWS_ID); state.newAcct = true; if (hmS.open) homeClose(); toast(`${ks.length === 1 ? 'Klasse' : ks.length + ' Klassen'} eingerichtet · über „+ Neue Stunde“ oben gibt es Vorlagen`); setTimeout(() => tourMaybe(), 900); }
  else if (d.single) { const nk = ks.find(x => !oldIds.has(x.id)); toast(nk ? `„${nk.label}“ in ${FAECHER[nk.fach].label} angelegt` : 'Klasse angelegt'); }
  else { const other = ks.filter(k => !oldIds.has(k.id) && k.fach !== curF); toast(other.length && !d.wantFach ? `„${other[0].label}“ steht im Fach ${FAECHER[other[0].fach].label}. Wechseln über „${FAECHER[curF].label}“ oben neben dem Titel.` : 'Klassen gespeichert'); }
  if (!setup && d.wantFach) { const nk = d.single && d.rows[0] ? ks.find(x => !oldIds.has(x.id) && x.fach === d.wantFach) : null; const k = nk || KLASSEN.find(x => x.fach === d.wantFach); if (k) switchKlasse(k.id); }
  if (jobs.length) klDropSheets(jobs);
}
// Minirätsel vor dem Löschen einer Klasse mit mehreren Blättern
function klPuzzle() {
  const r = n => Math.floor(Math.random() * n), pick = A => A[r(A.length)];
  const kinds = [
    () => { const a = 3 + r(7), b = 3 + r(7); return { q: `${a} × ${b} =`, ok: [String(a * b)] }; },
    () => { const a = 12 + r(30), b = 5 + r(20); return { q: `${a} + ${b} =`, ok: [String(a + b)] }; },
    () => { const s = 2 + r(5), d = 2 + r(4); const L = [s, s + d, s + 2 * d, s + 3 * d]; return { q: `Wie geht es weiter? ${L.join(', ')}, …`, ok: [String(s + 4 * d)] }; },
    () => { const w = pick(['Tafel', 'Kreide', 'Pause', 'Heft', 'Note', 'Klasse', 'Schule']); return { q: `Wie viele Buchstaben hat das Wort „${w}“?`, ok: [String(w.length)] }; },
    () => { const w = pick(['Lehrer', 'Tafel', 'Kreide', 'Heft', 'Pause']); const x = w.split('').reverse().join('').toLowerCase(); return { q: `Rückwärts gelesen: „${x}“. Welches Wort ist das?`, ok: [w.toLowerCase()] }; }
  ];
  return pick(kinds)();
}
// Blätter einer entfernten Klasse verschieben oder löschen (läuft nach dem Speichern der Klassen)
async function klDropSheets(jobs) {
  await saveChain; let nm = 0, nd = 0, bad = 0;
  for (const j of jobs) {
    const K = j.to && KLASSEN.find(x => x.id === j.to);
    for (const id of j.ids) {
      try {
        if (K) { const src = state.sheet && state.sheet.id === id ? clone(state.sheet) : await backend.load(id); if (!src) throw new Error('fehlt'); const c = normalizeSheet(src); klasseSwap(c, K.id); c.updatedAt = Date.now(); await backend.save(c); upsertLib(entryOf(c)); dropPlace(id); nm++; }
        else { await backend.remove(id); if (backend.kind !== 'local') dropPending(backend, id); state.lib = state.lib.filter(x => x.id !== id); dropPlace(id); const cur = lsGet(LS.cur); if (cur && cur.sheet && cur.sheet.id === id) lsDel(LS.cur); nd++; }
      } catch (err) { console.error(err); bad++; }
    }
  }
  renderTabs(); if (state.libOpen) renderLib(); if (hmS.open) homeRender();
  const K0 = jobs.find(j => j.to) && KLASSEN.find(x => x.id === jobs.find(j => j.to).to);
  toast([nm ? `${nm} ${nm === 1 ? 'Blatt' : 'Blätter'} nach „${K0 ? K0.label : 'die neue Klasse'}“ verschoben` : '', nd ? `${nd} ${nd === 1 ? 'Blatt' : 'Blätter'} gelöscht` : '', bad ? `${bad} nicht geklappt, bitte erneut versuchen` : ''].filter(Boolean).join(' · '));
}

