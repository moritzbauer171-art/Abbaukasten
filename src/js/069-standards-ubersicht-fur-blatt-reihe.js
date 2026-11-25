/* ================= Standards: Übersicht für Blatt, Reihe (Ordner) oder Klasse ================= */
const rlpSheetLabel = sh => { const m = sh.meta || {}; return m.nr ? 'AB ' + m.nr : (m.title || 'Ohne Titel'); };
function rlpCoverage(sheets) {
  const cov = {}; let nTasks = 0, nTagged = 0;
  sheets.forEach(sh => { let t = 0; (sh.blocks || []).forEach(b => { if (b.type !== 'tasks') return; if (rst(b)) t = 0; (b.items || []).forEach(it => {
    const fo = itFo(it); if (!fo) t++; nTasks++; const ids = rlpOf(it); if (ids.length) nTagged++;
    ids.forEach(id => { const c = cov[id] || (cov[id] = { n: 0, by: [] }); c.n++; let e = c.by.find(x => x.sh === sh); if (!e) c.by.push(e = { sh, t: [] }); if (!fo && !e.t.includes(t)) e.t.push(t); });
  }); }); });
  return { cov, nTasks, nTagged };
}
async function openRlpDlg(scope, fid) {
  let kl = KL(state.sheet.klasse).id, title = '', list = [];
  const order = libSort() === 'neu' ? 'nr' : libSort();
  if (scope === 'folder') { const f = state.prefs.folders.find(x => x.id === fid); if (!f) return; kl = f.klasse; title = f.name; list = sortLibList(state.lib.filter(x => x.klasse === kl && folderOf(x.id, kl) === fid), fid, kl, order); }
  if (scope === 'klasse') { kl = KL(state.klasse).id; title = KL(kl).label; list = sortLibList(state.lib.filter(x => x.klasse === kl), '', kl, order === 'eigen' ? 'nr' : order); }
  const ph = rlpPhase(kl);
  const d = { mode: 'rlp', scope, fid, kl, title, sheets: scope === 'sheet' ? [state.sheet] : null, show: 'cov', ph: ph === 'own' ? 'q' : ph, prog: '' };
  state.dlg = d; renderDlg(); if (scope === 'sheet') return;
  const cur = state.sheet;
  if (cur && KL(cur.klasse).id === kl && (scope === 'klasse' || folderOf(cur.id, kl) === fid) && !list.some(x => x.id === cur.id)) list = [{ id: cur.id }, ...list];
  const out = new Array(list.length).fill(null); let done = 0, next = 0;
  const work = async () => { while (next < list.length) { const j = next++; const e = list[j];
    if (e.id === cur.id) out[j] = cur; else { try { const sh = backend ? await backend.load(e.id) : null; if (sh) out[j] = normalizeSheet(sh); } catch {} }
    done++; if (state.dlg === d && !d.sheets) { d.prog = `${done} von ${list.length}`; const pr = $('#rlp-prog'); if (pr) pr.textContent = d.prog; } } };
  await Promise.all([0, 1, 2, 3].map(work));
  if (state.dlg !== d) return; d.sheets = out.filter(Boolean); renderDlg();
}
function rlpDlgGroups(d) {
  const fach = fachKey(d.kl), cat = RLP_BY[fach], C = rlpCoverage(d.sheets), ids = Object.keys(C.cov), M = rlpMap(); const G = [];
  if (cat && d.show === 'all') cat[d.ph].groups.forEach(g => G.push({ h: `${g.code} · ${g.name}`, rows: g.items.map((_, j) => `${d.ph}:${g.k}${j + 1}`) }));
  else if (cat) Object.entries(cat).forEach(([ph, P]) => P.groups.forEach(g => { const rows = g.items.map((_, j) => `${ph}:${g.k}${j + 1}`).filter(id => C.cov[id]); if (rows.length) G.push({ h: (ph === 'e' ? P.name + ' · ' : '') + `${g.code} · ${g.name}`, rows }); }));
  const own = [...new Set([...ids.filter(id => id[0] === '~').sort(rlpCmp), ...(d.show === 'all' ? rlpOwnList(fach).map(t => '~' + t) : [])])];
  if (own.length) G.push({ h: 'Eigene Standards', rows: own });
  const unk = ids.filter(id => id[0] !== '~' && !M[id]); if (unk.length) G.push({ h: 'Nicht im Katalog', rows: unk });
  const total = cat && d.show === 'all' ? cat[d.ph].groups.reduce((a, g) => a + g.items.length, 0) : 0;
  const nPh = total ? ids.filter(id => id.startsWith(d.ph + ':')).length : 0;
  return { fach, cat, C, ids, G, total, nPh };
}
function rlpDlgHead(d) { return d.scope === 'sheet' ? 'Standards auf diesem Blatt' : d.scope === 'folder' ? `Standards der Reihe „${d.title}“` : `Standards in ${d.title}`; }
function rlpDlgHTML() {
  const d = state.dlg; const head = esc(rlpDlgHead(d));
  if (!d.sheets) return `<h2 id="dlg-t">${head}</h2><p class="rlp-stat">Die Blätter werden geladen … <span id="rlp-prog">${esc(d.prog)}</span></p><div class="row"><button class="btn" type="button" data-act="dlg-close">Abbrechen</button></div>`;
  const { fach, cat, C, ids, G, total, nPh } = rlpDlgGroups(d); const multi = d.scope !== 'sheet';
  const by = c => c.by.map(e => multi ? `<button type="button" class="chip" data-act="rlp-go" data-id="${esc(e.sh.id)}" title="Blatt öffnen">${esc(rlpSheetLabel(e.sh))} · A ${e.t.join(', ')}</button>` : `<span>Aufgabe ${e.t.join(', ')}</span>`).join('');
  const row = id => { const x = rlpInfo(id), c = C.cov[id]; return `<div class="rlp-orow${c ? '' : ' off'}"><code>${esc(x.own ? 'eigen' : x.code)}</code><div><div>${esc(x.t)}${x.lk ? ' <em class="lk" title="nur Leistungskurs">LK</em>' : ''}</div>${c ? `<div class="by">${by(c)}</div>` : ''}</div><b>${c ? c.n + '×' : '–'}</b></div>`; };
  const stat = [multi ? `${d.sheets.length} ${d.sheets.length === 1 ? 'Blatt' : 'Blätter'}` : '', `${C.nTagged} von ${C.nTasks} Aufgaben zugeordnet`, total ? `${nPh} von ${total} Standards der ${RLP_DE[d.ph].name} abgedeckt` : `${ids.length} ${ids.length === 1 ? 'Standard' : 'Standards'} abgedeckt`].filter(Boolean).join(' · ');
  const body = G.length ? G.map(g => `<div class="rlp-gh">${esc(g.h)}</div>${g.rows.map(row).join('')}`).join('')
    : `<div class="rlp-none">${!C.nTasks ? 'Hier gibt es noch keine Aufgaben.' : 'Noch keine Aufgabe hat einen Standard. Öffne dazu unter einer Aufgabe „Standards“.'}</div>`;
  return `<h2 id="dlg-t">${head}</h2><p class="rlp-stat">${esc(stat)}</p>${total ? `<div class="rlp-bar" title="${Math.round(nPh / total * 100)} %"><i style="width:${Math.round(nPh / total * 100)}%"></i></div>` : ''}
    <div class="row rlp-dtools"><div class="seg sm" role="group" aria-label="Anzeige"><button type="button" data-act="rlp-show" data-v="cov" aria-pressed="${d.show !== 'all'}">Abgedeckt</button><button type="button" data-act="rlp-show" data-v="all" aria-pressed="${d.show === 'all'}">${cat ? 'Alle, mit Lücken' : 'Alle eigenen'}</button></div>${cat && d.show === 'all' ? `<div class="seg sm" role="group" aria-label="Phase">${RLP_PH.filter(([v]) => v !== 'own').map(([v, t]) => `<button type="button" data-act="rlp-dph" data-v="${v}" aria-pressed="${d.ph === v}">${t}</button>`).join('')}</div>` : ''}</div>
    <div class="rlp-ov">${body}</div>
    ${cat ? '' : `<p class="hint">Für ${esc(FAECHER[fach].label)} ist kein Rahmenlehrplan hinterlegt. Eigene Standards legst du bei einer Aufgabe unter „Standards“ an.</p>`}
    <div class="row"><button class="btn primary" type="button" data-act="dlg-close">Schließen</button><button class="btn" type="button" data-act="rlp-copy">Als Text kopieren</button></div>`;
}
function rlpDlgText(d) {
  const { C, G, total, nPh } = rlpDlgGroups(d); const multi = d.scope !== 'sheet'; const L = [];
  L.push(`${rlpDlgHead(d)}${d.scope === 'sheet' ? ': ' + (state.sheet.meta.title || 'Ohne Titel') : ''} (Stand ${new Date().toLocaleDateString('de-DE')})`);
  L.push([multi ? `${d.sheets.length} Blätter` : '', `${C.nTagged} von ${C.nTasks} Aufgaben zugeordnet`, total ? `${nPh} von ${total} Standards abgedeckt` : ''].filter(Boolean).join(' · '));
  G.forEach(g => { L.push('', g.h); g.rows.forEach(id => { const x = rlpInfo(id), c = C.cov[id]; L.push(`  ${x.own ? 'eigen' : x.code}  ${x.t}${c ? '' : '  (noch nicht abgedeckt)'}`); if (c) L.push('      ' + c.by.map(e => (multi ? rlpSheetLabel(e.sh) + ': ' : '') + 'Aufgabe ' + e.t.join(', ')).join(' · ')); }); });
  return L.join('\n') + '\n';
}
function rlpCopy() {
  const txt = rlpDlgText(state.dlg); const ok = () => toast('Übersicht kopiert');
  const fb = () => { const ta = document.createElement('textarea'); ta.value = txt; ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select(); let r = false; try { r = document.execCommand('copy'); } catch {} ta.remove(); if (r) ok(); else toast('Kopieren war nicht möglich.'); };
  try { navigator.clipboard.writeText(txt).then(ok, fb); } catch { fb(); }
}
function helpHTML() {
  return `<h2 id="dlg-t">Hilfe und Kniffe</h2>
    <div class="help">${HELP.map(([h, rows]) => `<section><h3>${h}</h3><dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl></section>`).join('')}</div>
    ${donateHTML('Hilft dir das LehrWerk?')}
    <div class="row"><button class="btn primary" type="button" data-act="dlg-close">Schließen</button><button class="link" type="button" data-act="tips-again">Funktionstour starten</button></div>
    <p class="copy-l">LehrWerk · © 2026 Moritz Bauer</p>`;
}
const TIPS = [
  ['Bausteine einfügen und umsortieren', 'Mit „+“ zwischen zwei Karten fügst du einen Baustein genau dort ein. An der Kopfzeile einer Karte lässt sie sich verschieben.'],
  ['Worterklärung per Klick', 'Klick in der Vorschau auf ein Wort im Material. Die Erklärung erscheint als Fußnote.'],
  ['Zeilenangaben per Klick', 'Klick in der Vorschau auf eine Zeilennummer, für einen Bereich auf eine zweite. „Einfügen“ setzt die Angabe in die Aufgabe.'],
  ['Ausgeben', 'PDF, Word oder Drucken stecken jetzt in einem Fenster, mit Fassung, Papier und einer kurzen Prüfung vor dem Druck.'],
  ['Baustein suchen', '„+ Baustein hinzufügen“ unter den Karten oder Strg+K: tipp ein, was du brauchst, etwa „Tabelle“ oder „Karten“.'],
  ['Rückgängig und Hilfe', 'Strg+Z oder der Pfeil über den Karten macht Schritte rückgängig. Alle Kniffe findest du oben unter „?“, Einstellungen unter dem Zahnrad.']
];
const LS_TIPS = 'abw.tips';
let tipIdx = -1;
function showTip(i) {
  const r = $('#tip-root'); tipIdx = i;
  if (i < 0 || i >= TIPS.length) { r.innerHTML = ''; lsSet(LS_TIPS, 1); return; }
  const [h, t] = TIPS[i];
  r.innerHTML = `<div class="tipcard" role="status"><div class="tip-h"><span>Tipp ${i + 1} von ${TIPS.length}</span><button type="button" class="ib" data-tip="close" title="Tipps ausblenden">${I.x}</button></div><b>${esc(h)}</b><p>${esc(t)}</p><div class="tip-a">${i > 0 ? '<button type="button" class="link" data-tip="prev">Zurück</button>' : '<span></span>'}<button type="button" class="btn primary" data-tip="next">${i < TIPS.length - 1 ? 'Weiter' : 'Fertig'}</button></div></div>`;
}

/* ---------- Ausgeben ---------- */
// Ein Fenster für PDF, Word und Drucken. Die Auswahl wirkt sofort auf die Vorschau; Abbrechen stellt den alten Stand wieder her.
const LS_OUTFMT = 'abw.outfmt';
function outState() { return { out: state.out, fassung: state.fassung, grp: state.grp, lvl: state.lvl || 'all', paper: state.sheet.meta.paper || 'a4', a3p: state.a3p || 'a3' }; }
function outApply(o) {
  if (o.out !== state.out) { state.out = o.out; if (OUT_AREA[o.out]) state.area = OUT_AREA[o.out]; renderEditor(); }
  state.fassung = o.fassung; state.grp = o.grp; state.lvl = o.lvl || 'all'; if (o.a3p !== state.a3p) { state.a3p = o.a3p; lsSet('abw.a3p', o.a3p); }
  if ((state.sheet.meta.paper || 'a4') !== o.paper) { state.sheet.meta.paper = o.paper; changed(true); }
  clearTimeout(renderTimer); renderPreview();
}
const OUT_FMTS = { blatt: ['pdf', 'docx', 'print', 'digital', 'pptx'], vp: ['docx'], pres: ['pptx'] };
const fmtOk = (v, out) => (OUT_FMTS[out] || ['pdf', 'print']).includes(v) && (v !== 'print' || canPrint);
const fmtFirst = out => (OUT_FMTS[out] || ['pdf']).find(v => fmtOk(v, out)) || 'pdf';
function openOut() {
  if (MSR.open) msrToggle(false);
  if (state.gapEdit) { state.gapEdit = null; renderEditor(); clearTimeout(renderTimer); renderPreview(); }
  closeGloss(); closeZl(); closeMenu();
  clearTimeout(renderTimer); renderPreview();
  const f = lsGet(LS_OUTFMT); const fmt = ['pdf', 'docx', 'print', 'digital'].includes(f) && (f !== 'print' || canPrint) ? f : 'pdf';
  state.dlg = { mode: 'out', orig: outState(), fmt: fmtOk(fmt, state.out) ? fmt : fmtFirst(state.out) };
  renderDlg();
}
// Hinweise vor dem Ausgeben (nichts davon hält auf, es ist nur zum Draufschauen)
function outChecks() {
  const sh = state.sheet, m = sh.meta, v = sheetView(), L = [];
  const warn = t => L.push({ k: 'warn', t }), note = t => L.push({ k: 'note', t });
  if (state.out === 'blatt') {
    if (v.lehrer) warn('Lehrerfassung: Erwartungen und Lösungen sind sichtbar. Nicht an die Klasse austeilen.');
    if (v.grp !== 'all') note(`Nur ${grpName(state.sheet.meta, v.grp)}: Bausteine und Aufgaben der anderen Gruppen fehlen.`);
    if (!String(m.title || '').trim() || m.title === 'Neues Arbeitsblatt') warn('Das Blatt hat noch keinen richtigen Titel.');
    const num = numbering(sh); let tno = 0;
    sh.blocks.forEach(b => {
      if (b.type === 'tasks' && rst(b)) tno = 0;
      if (!blockVisible(b, v)) return;
      if (b.type === 'material') {
        const lab = num[b.id] ? num[b.id].tag || 'M' + num[b.id].m : 'M';
        if (String(b.memo || '').trim()) warn(`${lab}: Deine Notiz „${String(b.memo).trim().slice(0, 90)}“`);
        if (!String(b.text || '').trim()) warn(`${lab} hat noch keinen Text.`);
        if (!String(b.source || '').trim()) note(`${lab} hat keine Quellenangabe.`);
      }
      if (b.type === 'tasks') itemsFor(b, v).forEach(it => { tno++; if (!String(it.text || '').trim()) warn(`Aufgabe ${tno} ist leer.`); });
      if (b.type === 'heading' && !String(b.text || '').trim()) note('Eine Überschrift ist leer.');
      if (b.type === 'image' && !b.src) warn('Ein Bild-Baustein hat noch kein Bild.');
      if (b.type === 'match' && !mtLayout(b).sol.some(x => x.rk >= 0)) warn(b.sort ? 'Ein Sortieren-Baustein hat noch kein Wort mit Oberbegriff.' : 'Ein Zuordnen-Baustein hat noch keine vollständigen Paare.');
      if (b.type === 'qr' && !String(b.url || '').trim()) warn('Ein QR-Code hat noch keinen Link.');
    });
    (sh.zrefs || []).filter(r => r.lost).forEach(r => { const fb = sh.blocks.find(x => x.id === r.f); warn(`${fb ? fieldLabel(fb, r.k) : 'Aufgabe'}: Die Angabe ${r.lab} stimmt vielleicht nicht mehr, ${r.lost === 'gone' ? 'das Material wurde gelöscht' : 'die Textstelle im Material wurde geändert'}. Bitte prüfen oder neu einfügen.`); });
    const g = genderHits(['meta', ...sh.blocks.map(b => b.id)].flatMap(id => gTargets(id).map(([o, k]) => o[k])));
    if (g.length) note(`Genderzeichen: ${g.slice(0, 3).map(h => '„' + h.m.replace(/\\/g, '') + '“').join(', ')}${g.length > 3 ? ' …' : ''} (Schulvorgabe: ausschreiben)`);
  }
  const over = document.querySelectorAll('#pages .pg-warn').length;
  if (over) warn(`${over === 1 ? 'Ein Baustein ist' : over + ' Bausteine sind'} länger als eine Seite und ${over === 1 ? 'wird' : 'werden'} abgeschnitten.`);
  return L;
}
function outHTML() {
  const d = state.dlg, sh = state.sheet; const nT = tipCards().length, nK = (sh.cards || []).length, SB = stBlocks(), nTf = SB.filter(x => x.type === 'tafel').length, nA3 = SB.filter(x => x.type === 'a3' && a3Fmt(x) === 'a3').length, nA4 = SB.filter(x => x.type === 'a3' && a3Fmt(x) === 'a4').length, nE = exitSteps().length;
  const seg = (f, opts, cur) => `<div class="seg sm" role="group">${opts.map(([v, t, dis]) => `<button type="button" data-act="out-set" data-f="${f}" data-v="${v}" aria-pressed="${cur === v}"${dis ? ' disabled' : ''}>${t}</button>`).join('')}</div>`;
  const fmts = [['pdf', 'PDF', 'zum Drucken und Teilen', '<path d="M5 2.5h6.5l3 3V17.5H5z"/><path d="M11.5 2.5v3h3"/><path d="M7.5 11h5M7.5 14h3.5"/>'],
    ['docx', 'Word', state.out === 'blatt' || state.out === 'vp' ? 'zum Weiterbearbeiten' : 'für das Arbeitsblatt', '<path d="M5 2.5h6.5l3 3V17.5H5z"/><path d="M11.5 2.5v3h3"/><path d="m7 9.5 1.2 5 1.8-3.8 1.8 3.8 1.2-5"/>'],
    ...(canPrint ? [['print', 'Drucken', 'direkt an den Drucker', '<path d="M6 7V2.5h8V7"/><rect x="3" y="7" width="14" height="6.5" rx="1.2"/><path d="M6 11.5h8v6H6z"/>']] : []),
    ['digital', 'Digital', state.out === 'blatt' ? 'zum Ausfüllen am Tablet, mit QR-Code' : 'nur fürs Arbeitsblatt', '<rect x="4" y="2.5" width="12" height="15" rx="1.8"/><path d="M7.5 7h5M7.5 10h3"/><path d="m8 13.2 1.3 1.3 2.7-2.7"/>'],
    ['pptx', 'PowerPoint', state.out === 'blatt' || state.out === 'pres' ? 'Folien der Stunde, bearbeitbar' : 'für Blatt und Präsentation', '<rect x="2.5" y="3.5" width="15" height="10" rx="1.2"/><path d="M10 13.5v3M7 17.5h6"/><path d="M6 7h4M6 10h7"/>']];
  const pages = document.querySelectorAll('#pages .pout').length;
  const checks = outChecks();
  const go = { pdf: 'PDF erstellen', docx: 'Word-Datei erstellen', print: 'Drucken', digital: 'Weiter zur digitalen Fassung', pptx: 'PowerPoint erstellen' }[d.fmt];
  const W = [['Arbeitsblatt', [['blatt', 'Arbeitsblatt', 0, 1], ['tipps', 'Tippkarten', nT]]], ['Präsentation', [['pres', 'Präsentation', 0, 1]]], ['Tafel', [['tafel', 'Tafelbild', nTf], ['karten', 'Tafelkarten', nK]]], ['Druck-Extras', [['a4', 'A4-Vorlagen', nA4], ['a3', 'A3-Vorlagen', nA3], ['exit', 'Exit-Tickets', nE]]]]
    .map(([g, L]) => [g, L.filter(o => !isBasis() || BASIS_OUTS.includes(o[0]))]).filter(([, L]) => L.length);
  const what = `<nav class="out-what" aria-label="Was ausgeben">${isBasis() ? '' : `<button type="button" class="ow ow-all" data-act="out-set" data-f="whole" data-v="1" aria-pressed="${!!d.whole}"><b>Ganze Stunde</b><small>alles in einem Ordner</small></button>`}
    ${W.map(([g, L]) => `<small class="ow-g">${g}</small>${L.map(([k, l, n, always]) => `<button type="button" class="ow" data-act="out-set" data-f="out" data-v="${k}" aria-pressed="${!d.whole && state.out === k}"${!always && !n ? ' disabled title="Noch nichts angelegt"' : ''}><b>${l}</b>${n ? `<em>${n}</em>` : ''}</button>`).join('')}`).join('')}<small class="ow-g">Planung</small><button type="button" class="ow" data-act="out-vp"><b>Verlaufsplan</b><small>Word oder PDF</small></button></nav>`;
  if (d.whole) { const A = stABs(); const SB2 = stBlocks();
    const L = [...A.map(x => `${esc(abLabel(x.meta, x.k))}: Schüler- und Lehrerfassung als PDF und Word, Erwartungshorizont${tipCards().length ? ', Tippkarten' : ''}, digitale Fassung`), nTf ? 'Tafelbild, vollständig und als Lückenfassung' : '', nK ? 'Tafelkarten' : '', nA4 ? 'A4-Vorlagen' : '', nA3 ? 'A3-Vorlagen in A3 und auf 2 × A4' : '', nE ? 'Exit-Tickets' : '', 'PowerPoint mit allen Folien', 'Inhaltsliste'].filter(Boolean);
    return `<h2 id="dlg-t">Ausgeben</h2><div class="out-2">${what}<div class="out-how"><div class="out-whole"><b>Ganze Stunde als Ordner</b><p>${window.abw ? 'Du wählst einen Ort, der Ordner wird dort angelegt.' : 'Der Ordner kommt als ZIP-Datei.'} Die Dateien sind durchnummeriert:</p><ul>${L.map(x => `<li>${x}</li>`).join('')}</ul></div>
      <div class="row"><button class="btn primary" type="button" data-act="out-stunde">Ordner erstellen</button><button class="btn" type="button" data-act="dlg-close">Abbrechen</button></div></div></div>`; }
  return `<h2 id="dlg-t">Ausgeben</h2><div class="out-2">${what}<div class="out-how">
    <div class="out-g">
    <div class="f"><span>Als</span><div class="out-fmts">${fmts.map(([v, t, sub, ic]) => `<button type="button" class="out-fmt" data-act="out-set" data-f="fmt" data-v="${v}" aria-pressed="${d.fmt === v}"${fmtOk(v, state.out) ? '' : ' disabled'}><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ic}</svg><b>${t}</b><span>${sub}</span></button>`).join('')}</div></div>
    ${state.out === 'blatt' ? `<div class="f"><span>Fassung</span>${seg('fassung', [['schueler', 'Schülerfassung'], ['lehrer', 'Lehrerfassung']], state.fassung)}</div>
      ${sh.meta.groupsOn ? `<div class="f"><span>Gruppe</span>${seg('grp', [['all', 'Alle'], ...grpList(sh.meta).map(x => [x.k, esc(grpName(sh.meta, x.k))])], sheetView().grp)}</div>` : ''}
      ${sh.meta.levelsOn ? `<div class="f"><span>Niveau</span>${seg('lvl', [['all', 'Alle'], ['b', '★ Basis'], ['s', '★★ Standard'], ['e', '★★★ Experte']], state.lvl || 'all')}</div>` : ''}
      <div class="f"><span>Papier</span>${seg('paper', [['a4', 'A4'], ['a4q', 'A4 quer'], ['buch', 'A5 als Buch'], ['a5x2', 'A5 doppelt']], sh.meta.paper || 'a4')}</div>` : ''}
    ${state.out === 'a3' ? `<div class="f"><span>Papier</span>${seg('a3p', [['a3', 'A3'], ['a4x2', '2 × A4 zum Kleben']], state.a3p || 'a3')}</div>` : ''}
    ${state.out === 'tafel' ? `<div class="f"><span>Fassung</span>${seg('fassung', [['lehrer', 'Vollständig'], ['schueler', 'Lückenfassung']], state.fassung)}</div>` : ''}</div>
    ${d.fmt === 'pptx' && (state.out === 'blatt' || state.out === 'pres') ? presPickHTML() : ''}
    ${state.out === 'vp' || state.out === 'pres' ? '' : `<div class="out-chk"><div class="out-chk-h">${checks.some(c => c.k === 'warn') ? 'Bitte kurz prüfen' : 'Alles bereit'}<span>${pages} ${state.out === 'karten' ? (pages === 1 ? 'Blatt' : 'Blätter') : (pages === 1 ? 'Seite' : 'Seiten')}</span></div>
      ${checks.length ? `<ul>${checks.map(c => `<li class="${c.k}">${esc(c.t)}</li>`).join('')}</ul>` : '<p class="out-ok">Keine Auffälligkeiten gefunden.</p>'}</div>`}
    <div class="row"><button class="btn primary" type="button" data-act="out-go">${go}</button>${d.fmt === 'pptx' && (state.out === 'blatt' || state.out === 'pres') ? '<button class="btn" type="button" data-act="out-pres">Im Browser präsentieren</button>' : ''}<button class="btn" type="button" data-act="dlg-close">Abbrechen</button>${state.out === 'blatt' && state.fassung === 'lehrer' ? '<button class="link" type="button" data-act="out-eh" style="margin-left:auto">Erwartungshorizont (.md)</button>' : ''}</div></div></div>`;
}
async function outGo() {
  const d = state.dlg; if (!d) return; d.done = true; lsSet(LS_OUTFMT, d.fmt);
  const fmt = d.fmt; state.dlg = null; renderDlg(); renderOut();
  if (fmt === 'digital') { openDg(); return; }
  if (state.out === 'vp') { await exportVP(); return; }
  if (fmt === 'pptx') { await exportPPTX(); return; }
  if (fmt === 'docx') await exportDOCX(); else if (fmt === 'print') doPrint(); else await exportPDF();
}

/* ---------- Speichern unter ---------- */
const sheetSig = sh => JSON.stringify({ ...sh, updatedAt: 0 });
function openSaveAs() { closeGloss(); closeZl(); closeMenu(); state.dlg = { mode: 'saveas' }; renderDlg(); }
function saveAsHTML() {
  const sh = state.sheet, m = sh.meta; const isK = m.mode === 'klausur';
  const fresh = !state.openSnap; const dirty = !fresh && sheetSig(sh) !== sheetSig(state.openSnap);
  const was = (m.nr ? (isK ? 'Nr. ' : 'AB ') + m.nr + ' · ' : '') + (m.title || 'Ohne Titel');
  const title = m.title && !(fresh && m.title === 'Neues Arbeitsblatt') ? m.title : '';
  return `<h2 id="dlg-t">Speichern unter</h2>
    <p>${fresh ? 'Das Blatt wird unter diesem Namen in „Meine Stunden“ gespeichert.' : 'Es entsteht ein neues Blatt mit dem jetzigen Stand. Danach arbeitest du im neuen Blatt weiter.'}</p>
    <form id="dlg-form" data-mode="saveas" novalidate>
      <div class="row"><label class="f narrow"><span>${isK ? 'Nr.' : 'AB-Nr.'}</span><input type="text" id="sa-nr" value="${esc(m.nr || '')}" placeholder="7"></label>
        <label class="f" style="flex:1"><span>Titel</span><input type="text" id="sa-title" value="${esc(title)}" placeholder="Titel des Arbeitsblatts"></label></div>
      <div class="row"><label class="f" style="flex:1"><span>Reiter</span><select id="sa-kl">${Object.entries(FAECHER).filter(([fk]) => KLASSEN.some(k => k.fach === fk)).map(([fk, f]) => `<optgroup label="${f.label}">${KLASSEN.filter(k => k.fach === fk).map(k => `<option value="${k.id}"${k.id === sh.klasse ? ' selected' : ''}>${esc(k.label)}</option>`).join('')}</optgroup>`).join('')}</select></label>
        <label class="f" style="flex:1"><span>Ordner</span><select id="sa-f">${saFolderOpts(sh.klasse, folderOf(sh.id, sh.klasse))}</select></label></div>
      ${dirty ? `<label class="chk sa-keep"><input type="checkbox" id="sa-keep" checked><span>Das bisherige Blatt „${esc(was)}“ so lassen, wie es beim Öffnen war</span></label>
        <small class="sa-hint">Deine Änderungen seit dem Öffnen stehen dann nur im neuen Blatt. Ohne Haken behält auch das bisherige Blatt die Änderungen.</small>` : ''}
      <div class="err" id="dlg-err" role="alert"></div><div class="ok" id="dlg-ok" role="status" hidden></div>
      <div class="row"><button class="btn primary" type="submit">Speichern</button><button class="btn" type="button" data-act="dlg-close">Abbrechen</button></div>
      <div class="sa-file"><div><b>Als Datei</b><span>Zum Ablegen in einem Ordner oder Weitergeben. Öffnen über „Meine Stunden“ → „Sicherung oder Datei laden“.</span></div>
        <button class="btn" type="button" data-act="sa-file">Als Datei speichern …</button></div>
    </form>`;
}
const saFolderOpts = (kl, sel) => `<option value="">Ohne Ordner</option>` + libFolders(kl).map(f => `<option value="${esc(f.id)}"${f.id === sel ? ' selected' : ''}>${esc(f.name)}</option>`).join('');
function saveAsFields() {
  const title = dlgVal('#sa-title'), nr = dlgVal('#sa-nr'), kl = KL(($('#sa-kl') || {}).value || state.sheet.klasse).id;
  const keep = !!($('#sa-keep') && $('#sa-keep').checked); const folder = ($('#sa-f') || {}).value || '';
  return { title, nr, kl, keep, folder };
}
// Titel, Nummer und Reiter übernehmen; Kurs, Farbe und Schule wechseln mit, solange sie der Voreinstellung entsprechen
function applySaveAs(sh, f) {
  const old = KL(sh.klasse), nw = KL(f.kl);
  if (old.id !== nw.id) {
    if (sh.meta.course === old.course) sh.meta.course = nw.course;
    if (sh.meta.accent === old.accent) sh.meta.accent = nw.accent;
    if (sh.meta.school === old.school) sh.meta.school = nw.school;
    sh.klasse = nw.id;
  }
  sh.meta.title = f.title; sh.meta.nr = f.nr; sh.example = false;
}
async function doSaveAs() {
  const f = saveAsFields();
  if (!f.title) { dlgMsg('Bitte einen Titel eingeben.'); const t = $('#sa-title'); if (t) t.focus(); return; }
  const cur = state.sheet; const from = KL(cur.klasse); const nw = KL(f.kl);
  const where = from.id !== nw.id ? ` unter ${nw.label}` : '';
  closeDlg();
  if (!state.openSnap) {
    // Neues, noch unbenanntes Blatt: einfach benennen
    applySaveAs(cur, f);
    if (state.klasse !== cur.klasse) { state.klasse = cur.klasse; lsSet(LS.klasse, cur.klasse); }
    setPlace(cur.id, f.folder); savePrefs();
    changed(true); renderTabs(); await saveNow(); state.openSnap = clone(state.sheet);
    toast(`Gespeichert als „${f.title}“${where}`); return;
  }
  const dirty = sheetSig(cur) !== sheetSig(state.openSnap);
  const c = clone(cur); c.id = 'ab-' + uid(); applySaveAs(c, f); setPlace(c.id, f.folder); savePrefs();
  let note = '';
  if (dirty && f.keep) {
    // Bisheriges Blatt auf den Stand beim Öffnen zurücksetzen
    clearTimeout(saveTimer); savePending = false;
    const back = clone(state.openSnap); back.updatedAt = Date.now(); const b = backend;
    if (b) saveChain = saveChain.then(() => doSave(b, back)).catch(() => {});
    note = ' · das bisherige Blatt ist unverändert';
  } else if (savePending) saveNow();
  openSheet(c); saveNow();
  toast(`Gespeichert als „${f.title}“${where}${note}`);
}
async function saveAsFile() {
  const f = saveAsFields(); const sh = clone(state.sheet);
  if (f.title) sh.meta.title = f.title; sh.meta.nr = f.nr; sh.example = false; sh.updatedAt = Date.now();
  const name = ((sh.meta.nr ? 'AB' + slug(sh.meta.nr) + '_' : '') + slug(sh.meta.title || 'Arbeitsblatt')) + '.json';
  const data = JSON.stringify({ app: 'AB-Werkstatt', version: 1, exportedAt: new Date().toISOString(), sheets: [sh] });
  closeDlg();
  await deliver(name, new Blob([data], { type: 'application/json' }));
}
function renderDlg() {
  if (loginForced() && (!state.dlg || !['login', 'newpw'].includes(state.dlg.mode))) state.dlg = { mode: 'login', email: (state.dlg && state.dlg.email) || '' };
  const r = $('#dlg-root'); const d = state.dlg; r.classList.toggle('dlg-must', !!(d && d.mode === 'login' && loginForced()));
  if (!d) { r.innerHTML = ''; return; }
  const msgs = '<div class="err" id="dlg-err" role="alert"></div><div class="ok" id="dlg-ok" role="status" hidden></div>';
  const body = d.mode === 'fass' ? fassHTML() : d.mode === 'sharepick' ? sharePickHTML() : d.mode === 'share' ? shareDlgHTML(d) : d.mode === 'vp' ? vpHTML() : d.mode === 'dg' ? dgHTML() : d.mode === 'ocr' ? ocrHTML() : d.mode === 'mappe' ? mappeHTML() : d.mode === 'rlp' ? rlpDlgHTML() : d.mode === 'klassen' ? klassenHTML() : d.mode === 'conflict' ? conflictHTML() : d.mode === 'help' ? helpHTML() : d.mode === 'new' ? newDlgHTML() : d.mode === 'out' ? outHTML() : d.mode === 'saveas' ? saveAsHTML() : d.mode === 'newpw'
    ? `<h2 id="dlg-t">Neues Passwort</h2><p>Leg ein neues Passwort für dein Konto fest.</p>
      <form id="dlg-form" data-mode="newpw" novalidate>
        <label class="f"><span>Neues Passwort</span><input class="inp" id="dlg-pw" type="password" autocomplete="new-password"></label>
        ${msgs}<div class="row"><button class="btn primary" type="submit">Speichern</button></div></form>`
    : `<h2 id="dlg-t">Anmelden</h2><p>Mit einem Konto liegen deine Arbeitsblätter online und sind auf jedem Gerät da. Noch kein Konto? Mit den Zugangsdaten anmelden, die du bekommen hast, oder „Konto anlegen“ wählen.</p>
      <form id="dlg-form" data-mode="login" novalidate>
        <label class="f"><span>E-Mail</span><input class="inp" id="dlg-email" type="email" autocomplete="username" value="${esc(d.email)}"></label>
        <label class="f"><span>Passwort</span><input class="inp" id="dlg-pw" type="password" autocomplete="current-password"></label>
        ${msgs}
        <div class="row"><button class="btn primary" type="submit">Anmelden</button><button class="btn" type="button" data-act="dlg-signup">Konto anlegen</button></div>
        <div class="links"><button class="link" type="button" data-act="dlg-reset">Passwort vergessen?</button></div>
        <small class="hint dlg-must-h">Das LehrWerk funktioniert mit einem kostenlosen Konto. So sind deine Stunden sicher gespeichert, auf jedem Gerät da, und du kannst mit dem Kollegium teilen.</small>
      </form>`;
  const od = r.querySelector('.dlg'), same = od && r.dataset.mode === d.mode, oy = same ? od.scrollTop : 0, inner = same ? [...od.querySelectorAll('*')].filter(x => x.scrollTop > 0).map(x => [x.className, x.scrollTop]) : [];
  r.innerHTML = `<div class="scrim dlg-scrim" data-act="dlg-close"></div><div class="dlg" role="dialog" aria-modal="true" aria-labelledby="dlg-t">${body}</div>`; r.dataset.mode = d.mode;
  if (same) { const nd = r.querySelector('.dlg'); nd.scrollTop = oy; inner.forEach(([c, y]) => { if (!c || typeof c !== 'string') return; const x = nd.querySelector('.' + c.trim().split(/\s+/).join('.')); if (x) x.scrollTop = y; }); }
  if (d.mode === 'saveas') { const t = $('#sa-title'); if (t) { t.focus(); t.select(); } return; }
  if (d.mode === 'help') { r.querySelector('.dlg').classList.add('dlg-help'); return; }
  if (d.mode === 'mappe') { r.querySelector('.dlg').classList.add('dlg-mappe'); return; }
  if (d.mode === 'dg') { r.querySelector('.dlg').classList.add('dlg-dg'); return; }
  if (d.mode === 'ocr') { r.querySelector('.dlg').classList.add('dlg-ocr'); if (d.step === 'run') r.querySelector('.dlg-scrim').removeAttribute('data-act'); const f = r.querySelector(d.step === 'done' ? '#ocr-t' : d.step === 'prep' ? '[data-act="ocr-go"]' : '#ocr-drop'); if (f && d.step !== 'done') f.focus({ preventScroll: true }); return; }
  if (d.mode === 'vp') r.querySelector('.dlg').classList.add('dlg-vp');
  if (d.mode === 'rlp') { r.querySelector('.dlg').classList.add('dlg-rlp'); const g = r.querySelector('[data-act="dlg-close"]'); if (g) g.focus({ preventScroll: true }); return; }
  if (d.mode === 'conflict') { r.querySelector('.dlg-scrim').removeAttribute('data-act'); return; }
  if (d.mode === 'klassen') { r.querySelector('.dlg').classList.add('dlg-kl'); if (d.setup) r.querySelector('.dlg-scrim').removeAttribute('data-act'); const f = r.querySelector(d.setup ? '#kl-school' : '[data-kf="label"]'); if (f && d.setup) f.focus(); return; }
  if (d.mode === 'new') { r.querySelector('.dlg').classList.add('dlg-new'); const f = r.querySelector('#nw-title'); if (f && !d.focused) { d.focused = true; f.focus(); } return; }
  if (d.mode === 'out') { r.querySelector('.dlg').classList.add('dlg-out'); const g = r.querySelector('[data-act="out-go"]'); if (g) g.focus(); return; }
  const f = r.querySelector(d.mode === 'login' && !d.email ? '#dlg-email' : '#dlg-pw'); if (f) f.focus();
}
function dlgMsg(err, info) {
  const e = $('#dlg-err'), o = $('#dlg-ok'); if (!e) return;
  e.textContent = err || ''; o.textContent = info || ''; o.hidden = !info;
}
function dlgBusy(on) { document.querySelectorAll('#dlg-root button').forEach(b => { b.disabled = on; }); }
const dlgVal = id => { const n = $(id); return n ? n.value.trim() : ''; };
async function authCall(fn) { dlgBusy(true); try { return await fn(); } catch (err) { return { error: err }; } finally { dlgBusy(false); } }
async function onDlgSubmit(e) {
  e.preventDefault();
  const mode = e.target.dataset.mode; const pw = ($('#dlg-pw') || {}).value || '';
  if (mode === 'saveas') { doSaveAs(); return; }
  if (mode === 'newpw') {
    if (pw.length < 6) return dlgMsg('Das Passwort braucht mindestens 6 Zeichen.');
    const { error } = await authCall(() => store.sb.auth.updateUser({ password: pw }));
    if (error) return dlgMsg(authMsg(error));
    closeDlg(); toast('Neues Passwort gespeichert'); return;
  }
  const email = dlgVal('#dlg-email');
  if (!email || !pw) return dlgMsg('Bitte E-Mail und Passwort eingeben.');
  state.dlg.email = email;
  const { error } = await authCall(() => store.sb.auth.signInWithPassword({ email, password: pw }));
  if (error) return dlgMsg(authMsg(error));
  closeDlg();
}
async function onDlgClick(e) {
  const a = e.target.closest('[data-act]'); if (!a || !state.dlg) return;
  const act = a.dataset.act;
  if (act === 'dlg-close') { if (state.dlg.mode === 'login' && loginForced()) return; closeDlg(); return; }
  if (act === 'sa-file') { saveAsFile(); return; }
  if (act === 'sp-pick') { spPick(a.dataset.id); return; }
  if (act === 'sp-go') { spKeep(); shareGo(); return; }
  if (act === 'sp-back') { spKeep(); state.dlg.step = 'pick'; renderDlg(); setTimeout(() => { const sel = document.querySelector('#dlg-root .sp-g button.on'); if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' }); const q = $('#sp-q'); if (q && q.value) q.dispatchEvent(new Event('input', { bubbles: true })); }, 20); return; }
  if (act === 'sp-cat') { spKeep(); const d = state.dlg, v = a.dataset.v; d.cats = d.cats || []; d.cats = d.cats.includes(v) ? d.cats.filter(x => x !== v) : [...d.cats, v]; renderDlg(); return; }
  if (act === 'sp-del') { const d = state.dlg; const ex = d && sharedOf(d.pick); if (ex) { d.sid = ex.id; shareDelGo(true); } return; }
  if (act === 'fass-go') { fassRestore(+a.dataset.i); return; }
  if (act === 'cf-theirs' || act === 'cf-mine' || act === 'cf-both') { conflictResolve(act.slice(3)); return; }
  if (state.dlg.mode === 'klassen') {
    const d = state.dlg; if (d.setup) d.school = dlgVal('#kl-school'); const i = +a.dataset.i;
    if (act === 'kl-set' && a.dataset.f === 'stufe') { const r = d.rows[i]; r.stufe = a.dataset.v; if (r.stufe === 'gs') { r.jg = +r.jg || jgGuess(r.label) || 3; r.anrede = 'du'; } else { r.jg = 0; if (!r.anTouch) r.anrede = anredeGuess(r.label, 'os'); } renderDlg(); return; }
    if (act === 'kl-set' && a.dataset.f === 'jg') { d.rows[i].jg = +a.dataset.v; d.rows[i].jgTouch = true; renderDlg(); return; }
      if (act === 'kl-set' && a.dataset.f === 'anrede') d.rows[i].anTouch = true;
    if (act === 'kl-set') { const r = d.rows[i]; if (a.dataset.f === 'fach' && ['', 'Deutsch', 'Geschichte', 'Politik', 'Geschichte/Politik', 'Biologie', 'Englisch', 'Spanisch'].includes(String(r.course || '').trim())) r.course = FAECHER[a.dataset.v].course; r[a.dataset.f] = a.dataset.v; renderDlg(); return; }
    if (act === 'kl-umf') { d.umf = a.dataset.v === 'experte' ? 'experte' : 'basis'; renderDlg(); return; }
    if (act === 'kl-add') { const n = d.rows.length; d.rows.push(normKlasse({ id: 'k-' + uid(), label: '', course: '', school: d.setup ? '' : (d.rows[n - 1] || {}).school, accent: Object.keys(ACCENTS)[n % 3], anrede: (d.rows[n - 1] || {}).anrede, fach: (d.rows[n - 1] || {}).fach, stufe: (d.rows[n - 1] || {}).stufe, jg: (d.rows[n - 1] || {}).jg }, n)); d.rows[n].label = ''; d.rows[n].fresh = true; renderDlg(); const f = document.querySelectorAll('#dlg-root [data-kf="label"]'); if (f[n]) f[n].focus(); return; }
    if (act === 'kl-del') { const k = d.rows[i]; const n = state.lib.filter(x => x.klasse === k.id).length; if (n) { d.rows.forEach(x => { x.delAsk = false; }); k.delAsk = true; renderDlg(); return; } d.rows.splice(i, 1); renderDlg(); return; }
    if (act === 'kl-del-no') { d.rows[i].delAsk = false; d.rows[i].puz = null; renderDlg(); return; }
    if (act === 'kl-del-all' && state.lib.filter(x => x.klasse === d.rows[i].id).length > 1 && !d.rows[i].puzOk) { d.rows[i].puz = klPuzzle(); renderDlg(); setTimeout(() => { const f = document.querySelector(`#dlg-root [data-kpuz="${i}"]`); if (f) f.focus(); }, 20); return; }
    if (act === 'kl-del-puz') { const k = d.rows[i]; const f = document.querySelector(`#dlg-root [data-kpuz="${i}"]`); const v = String(f ? f.value : '').trim().toLowerCase().replace(/\s+/g, ' ');
      if (!k.puz || !k.puz.ok.includes(v)) { const nw = klPuzzle(); nw.err = v ? 'Leider falsch. Hier ist ein neues Rätsel.' : 'Bitte zuerst die Lösung eintragen.'; if (!v) { nw.q = k.puz.q; nw.ok = k.puz.ok; } k.puz = nw; renderDlg(); setTimeout(() => { const g = document.querySelector(`#dlg-root [data-kpuz="${i}"]`); if (g) g.focus(); }, 20); return; }
      k.puzOk = true; k.puz = null; }
    if (act === 'kl-del-move' || act === 'kl-del-all' || act === 'kl-del-puz') { const k = d.rows[i]; const sel = document.querySelector(`#dlg-root [data-kdel-to="${i}"]`); (d.kldel = d.kldel || []).push(act === 'kl-del-move' && sel ? { from: k.id, label: k.label, to: sel ? sel.value : '' } : { from: k.id, label: k.label, del: true }); d.rows.splice(i, 1); renderDlg(); return; }
    if (act === 'kl-up' || act === 'kl-down') { const j = act === 'kl-up' ? i - 1 : i + 1; if (j < 0 || j >= d.rows.length) return; [d.rows[i], d.rows[j]] = [d.rows[j], d.rows[i]]; renderDlg(); return; }
    if (act === 'kl-save') { klassenSave(); return; }
  }
  if (state.dlg.mode === 'new') {
    const d = state.dlg; newDlgRead();
    if (act === 'nw-kl') { d.kl = a.dataset.v; if (!d.nrSet) d.nr = nextNr(d.kl); d.folder = ''; d.src = ''; if (d.tpl === 'copy' && !state.lib.some(x => x.klasse === d.kl)) d.tpl = 'leer'; if (d.tpl !== 'copy' && !tplsFor(d.kl).some(x => x.k === d.tpl)) d.tpl = isKlausurTpl(d.tpl) ? (({ gp: 'g-klausur', bio: 'b-klausur' })[fachKey(d.kl)] || 'klausur') : 'leer'; renderDlg(); return; }
    if (act === 'nw-tpl') { d.tpl = a.dataset.k; renderDlg(); return; }
    if (act === 'nw-paper') { d.paper = a.dataset.v; renderDlg(); return; }
    if (act === 'nw-go') { newGo(); return; }
  }
  if (act === 'tips-again') { closeDlg(); setTimeout(tourStart, 120); return; }
  if (state.dlg.mode === 'dg') {
    const d = state.dlg; const m = state.sheet.meta;
    if (act === 'dg-set') { dgRead(); d[a.dataset.f] = a.dataset.v; lsSet(LS_DGOPT, { lvl: d.lvl, sol: d.sol, ans: d.ans, tips: d.tips }); renderDlg(); return; }
    if (act === 'dg-pub') { await dgPublish(); return; }
    if (act === 'dg-showqr') { dgRead(); d.step = 'qr'; renderDlg(); return; }
    if (act === 'dg-file') { dgRead(); d.busy = true; renderDlg(); try { const html = await dgMake((m.dg && m.dg.id) || dgId()); d.busy = false; renderDlg(); await deliver(fileBase() + '_digital.html', new Blob([html], { type: 'text/html' })); } catch (err) { console.error(err); d.busy = false; d.err = 'Die Datei ließ sich nicht erstellen.'; renderDlg(); } return; }
    if (act === 'dg-try') { dgRead(); d.busy = true; renderDlg(); try { const html = await dgMake('probe' + Math.random().toString(36).slice(2, 8)); d.busy = false; renderDlg(); const ov = document.createElement('div'); ov.className = 'dg-try'; ov.innerHTML = '<div class="dg-try-h"><span>Probeansicht: So sehen es die Schülerinnen und Schüler</span><button class="btn" type="button">Schließen</button></div><iframe title="Probeansicht"></iframe>'; document.body.appendChild(ov); ov.querySelector('iframe').srcdoc = html; ov.querySelector('button').addEventListener('click', () => ov.remove()); } catch (err) { console.error(err); d.busy = false; renderDlg(); } return; }
    if (act === 'dg-copy') { const link = dgLink(m.dg.id); try { navigator.clipboard.writeText(link).then(() => toast('Link kopiert'), () => { const i = $('#dg-link'); if (i) { i.select(); document.execCommand('copy'); toast('Link kopiert'); } }); } catch { const i = $('#dg-link'); if (i) { i.select(); document.execCommand('copy'); toast('Link kopiert'); } } return; }
    if (act === 'dg-qrsave') { const u = QR.dataURL(dgLink(m.dg.id), 16); const bin = atob(u.split(',')[1]); const arr = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i); await deliver(fileBase() + '_QR.png', new Blob([arr], { type: 'image/png' })); return; }
    if (act === 'dg-qrblk') { const nb = newBlock('qr'); nb.url = dgLink(m.dg.id); nb.title = 'Digitale Fassung'; nb.note = m.anrede === 'du' ? 'Scanne den Code, um das Blatt am Tablet auszufüllen.' : 'Code scannen, um das Blatt am Tablet auszufüllen.'; nb.size = 'S'; state.sheet.blocks.unshift(nb); closeDlg(); changed(true); toast('QR-Code oben aufs Blatt gesetzt', 'Rückgängig', histUndo); return; }
    if (act === 'dg-big') { const link = dgLink(m.dg.id); const ov = document.createElement('div'); ov.className = 'dg-big'; ov.title = 'Klicken zum Schließen'; ov.innerHTML = `<img src="${QR.dataURL(link, 16)}" alt="QR-Code"><div>${esc(link)}</div>`; ov.addEventListener('click', () => ov.remove()); document.body.appendChild(ov); return; }
    if (act === 'dg-off') { await dgOff(); return; }
  }
  if (state.dlg.mode === 'vp' && act === 'vp-docx') { exportVP(); return; }
  if (state.dlg.mode === 'vp' && act === 'vp-print') { vpPrint(); return; }
  if (state.dlg.mode === 'ocr') {
    const d = state.dlg;
    if (act === 'ocr-rot') { ocrRead(); d.rot = (d.rot + 90) % 360; renderDlg(); return; }
    if (act === 'ocr-other') { ocrRead(); d.step = 'pick'; d.err = ''; renderDlg(); return; }
    if (act === 'ocr-go') { await ocrGo(); return; }
    if (act === 'ocr-cancel') { ocrRun++; ocrStop(); d.step = 'prep'; renderDlg(); return; }
    if (act === 'ocr-apply') { ocrApply(a.dataset.v); return; }
  }
  if (state.dlg.mode === 'mappe') {
    const d = state.dlg;
    if (act === 'mp-set') { mappeRead(); d[a.dataset.f] = a.dataset.v; renderDlg(); return; }
    if (act === 'mp-go') { await mappeGo(); return; }
  }
  if (state.dlg.mode === 'rlp') {
    const d = state.dlg;
    if (act === 'rlp-show') { d.show = a.dataset.v; renderDlg(); return; }
    if (act === 'rlp-dph') { d.ph = a.dataset.v; renderDlg(); return; }
    if (act === 'rlp-copy') { rlpCopy(); return; }
    if (act === 'rlp-go') { const id = a.dataset.id; closeDlg(); if (state.libOpen) { state.libOpen = false; renderLib(); } if (id !== state.sheet.id) await openById(id); return; }
  }
  if (state.dlg.mode === 'share') { if (act === 'share-go') { shareGo(); return; } if (act === 'share-del') { shareDelGo(); return; } }
  if (state.dlg.mode === 'out') {
    if (act === 'out-set') {
      const f = a.dataset.f, v = a.dataset.v; const o = outState();
      if (f === 'fmt') state.dlg.fmt = v;
      else if (f === 'whole') state.dlg.whole = true;
      else { if (f === 'out') state.dlg.whole = false; o[f] = v; if (f === 'out' && !fmtOk(state.dlg.fmt, v)) state.dlg.fmt = fmtFirst(v); if (f === 'fassung' && v === 'lehrer') state.sheet.blocks.forEach(x => { if (x.type === 'tasks') x.items.forEach((_, i) => state.taskOpen.add(taskKey(x.id, i, 'eh'))); }); outApply(o); renderOut(); }
      renderDlg(); return;
    }
    if (act === 'out-go') { outGo(); return; }
    if (act === 'out-pres') { state.dlg = null; renderDlg(); openPres(0); return; }
    if (act === 'out-stunde') { state.dlg = null; renderDlg(); exportStunde(); return; }
    if (act === 'pr-pick') { presPickSet(a.dataset.v); return; }
    if (act === 'ph-size') { phSizeSet(a.dataset.v); return; }
    if (act === 'out-vp') { openVP(); return; }
    if (act === 'out-eh') { exportEH(); return; }
  }
  const email = dlgVal('#dlg-email'); const pw = ($('#dlg-pw') || {}).value || '';
  if (act === 'dlg-signup') {
    if (!email || pw.length < 6) return dlgMsg('Bitte E-Mail und ein Passwort mit mindestens 6 Zeichen eingeben.');
    state.dlg.email = email;
    const { data, error } = await authCall(() => store.sb.auth.signUp({ email, password: pw, options: { emailRedirectTo: location.origin + location.pathname } }));
    if (error) return dlgMsg(authMsg(error));
    if (data && data.session) { closeDlg(); return; }
    dlgMsg('', `Fast geschafft: Wir haben eine Bestätigungsmail an ${email} geschickt. Nach dem Klick auf den Link kannst du dich hier anmelden.`);
  }
  if (act === 'dlg-reset') {
    if (!email) return dlgMsg('Bitte zuerst deine E-Mail-Adresse eintragen.');
    state.dlg.email = email;
    const { error } = await authCall(() => store.sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }));
    if (error) return dlgMsg(authMsg(error));
    dlgMsg('', `Wir haben einen Link zum Zurücksetzen an ${email} geschickt.`);
  }
}

