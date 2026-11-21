/* ================= Arbeitsbereiche der Stunde =================
   Der Editor zeigt je Bereich nur, was dazugehört; die Vorschau rechts wechselt mit. Daten und Reihenfolge der Bausteine bleiben, wie sie sind. */
const AREA_IC = {
  stunde: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  blatt: '<path d="M6 2.8h8.5l3.5 3.5v14.9H6z"/><path d="M14.5 2.8v3.5H18"/><path d="M8.8 11h6.4M8.8 14.2h6.4M8.8 17.4h4"/>',
  tafel: '<rect x="2.8" y="4.2" width="18.4" height="12.6" rx="1.2"/><path d="M8 20.5l2-3.7M16 20.5l-2-3.7"/><path d="M6.5 9.2h6M6.5 12.2h9"/>',
  extras: '<path d="M7 8V3.2h10V8"/><rect x="3.2" y="8" width="17.6" height="8" rx="1.4"/><path d="M7 13.5h10v7H7z"/>',
  pres: '<rect x="2.8" y="3.8" width="18.4" height="12" rx="1.2"/><path d="M12 15.8v4.4M8.5 20.6h7"/><path d="m10 7.8 4.6 2.2L10 12.2z"/>',
  start: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.8 9.5v10h12.4v-10"/><path d="M10 19.5v-5h4v5"/>',
  einst: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>'
};
const AREAS = [['blatt', 'Arbeitsblatt'], ['pres', 'Präsentation']];
const AREAS_MORE = [['tafel', 'Tafelbilder und Karten'], ['extras', 'Druck-Extras: A4, A3, Exit-Tickets']];
const AREA_NAME = { ...Object.fromEntries([...AREAS, ...AREAS_MORE]), start: 'Arbeitsblatt', stunde: 'Präsentation' };
const areaNorm = a => (a === 'start' || !a ? 'blatt' : a === 'stunde' ? 'pres' : a);
const AREA_OUTS = { start: ['blatt'], einst: ['blatt'], stunde: ['pres'], blatt: ['blatt', 'tipps'], tafel: ['tafel', 'karten'], extras: ['a4', 'a3', 'exit'], pres: ['pres'] };
const OUT_AREA = { vp: 'pres', blatt: 'blatt', tipps: 'blatt', tafel: 'tafel', karten: 'tafel', a3: 'extras', a4: 'extras', exit: 'extras', pres: 'pres' };
const blockArea = b => (b.type === 'step' ? 'stunde' : b.type === 'tafel' ? 'tafel' : b.type === 'a3' ? 'extras' : 'blatt');
const inArea = (b, A) => blockArea(b) === A || (A === 'extras' && b.type === 'step' && !!b.exit);
const areaIc = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${AREA_IC[k]}</svg>`;
function areaBarHTML() {
  const SB = stBlocks(); const n = { start: 0, stunde: SB.filter(b => b.type === 'step').length, blatt: SB.filter(b => blockArea(b) === 'blatt' && b.type !== 'pagebreak').length, tafel: SB.filter(b => b.type === 'tafel').length + (state.sheet.cards || []).length, extras: SB.filter(b => b.type === 'a3').length + exitSteps().length, pres: 0 };
  const A = areaNorm(state.area); const more = AREAS_MORE.find(x => x[0] === A); const mo = state.areaMore;
  return `<nav class="area-bar a2" role="tablist" aria-label="Bereiche der Stunde">${AREAS.map(([k, l]) => `<button type="button" role="tab" class="area-b" data-act="area-set" data-v="${k}" aria-selected="${A === k}" title="${l}"><i>${areaIc(k)}</i><span>${l}</span>${k === 'blatt' && n[k] ? `<em>${n[k]}</em>` : ''}</button>`).join('')}
    <div class="area-more"><button type="button" class="area-mb${more ? ' on' : ''}" data-act="area-more" aria-expanded="${!!mo}" title="Seltener gebraucht: Tafelbilder, Tafelkarten, Druck-Extras">${more ? `<b>${esc(more[1].split(':')[0])}</b>` : 'Mehr'}<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg></button>
    ${mo ? `<div class="area-mp" role="menu">${AREAS_MORE.map(([k, l]) => `<button type="button" role="menuitem" data-act="area-set" data-v="${k}"${A === k ? ' aria-current="true"' : ''}><i>${areaIc(k)}</i><span>${l}</span>${n[k] ? `<em>${n[k]}</em>` : ''}</button>`).join('')}${more ? `<button type="button" role="menuitem" data-act="area-set" data-v="blatt"><i>${areaIc('blatt')}</i><span>Zurück zum Arbeitsblatt</span></button>` : ''}</div>` : ''}</div>${A === 'blatt' ? quickBarHTML() + olHTML() : ''}</nav>`;
}
// Die meistgenutzten Bausteine immer griffbereit; der Rest unter „Weitere“ (mit Suche)
const QUICK_MA = ['tasks', 'rechen', 'wertetabelle', 'info', 'abbildung', 'lines'];
const QUICK = ['material', 'tasks', 'info', 'lines'], QUICK_GS = ['material', 'tasks', 'gs-kreuz', 'lineatur'];
const QB_SHORT = { material: 'Material', tasks: 'Aufgaben', info: 'Kasten', lines: 'Linien', 'gs-kreuz': 'Ankreuzen', lineatur: 'Lineatur', rechen: 'Rechnen', wertetabelle: 'Tabelle', abbildung: 'Abbildung' };
function quickBarHTML() {
  const P = paletteFor(); const L = (isGS() ? QUICK_GS : fachBase() === 'ma' ? QUICK_MA.slice(0, 4) : QUICK).map(k => P.find(t => t.k === k)).filter(Boolean);
  return `<div class="qbar" role="toolbar" aria-label="Baustein hinzufügen"><button type="button" class="qb-add" data-act="bk-open" title="Alle Bausteine mit Suche (Strg+K: auch Befehle)"><b>+</b> Baustein</button>${L.map(t => `<button type="button" data-act="add" data-type="${t.type}" data-pk="${t.k}" title="${esc(t.label + ': ' + t.desc)} · wird hinter dem gewählten Baustein eingefügt" aria-label="${esc(t.label)} hinzufügen" class="qb qb-l"><i>${typeIcon(t.ic)}</i><span>${esc(QB_SHORT[t.k] || t.label)}</span></button>`).join('')}</div>`;
}
function areaOutFor(a) { const L = AREA_OUTS[a]; const o = state.areaOut && state.areaOut[a]; if (o && L.includes(o)) return o; if (a === 'extras') { const SB = stBlocks(); return SB.some(b => b.type === 'a3' && a3Fmt(b) === 'a4') ? 'a4' : SB.some(b => b.type === 'a3') ? 'a3' : exitSteps().length ? 'exit' : 'a4'; } return L[0]; }
function setArea(a) {
  a = areaNorm(a); state.areaMore = false;
  if (!AREA_OUTS[a] || isBasis() && !['blatt', 'einst', 'pres'].includes(a)) return; if (state.area === a && (OUT_AREA[state.out] === a || a === 'start' || a === 'einst')) { $('#editor').scrollTop = 0; return; }
  if (a === 'einst' && state.area !== 'einst') state.prevArea = state.area || 'blatt';
  state.area = a; state.out = areaOutFor(a); state.insAt = null; closeGloss(); closeZl(); closeMenu();
  renderEditor(); $('#editor').scrollTop = 0; clearTimeout(renderTimer); renderPreview();
}
// Sprung in den Bereich eines Bausteins (aus dem Ablauf oder einem Platzhalter); wechselt bei Bedarf das Arbeitsblatt
function areaGo(ar, bid, k) {
  ar = areaNorm(ar); state.areaMore = false;
  if (ar === 'pres' && bid) state.zwOpen = bid;
  if (isBasis() && ar !== 'blatt' && ar !== 'pres') { toast('Das bearbeitest du im Modus „Experte“ (Einstellungen ⚙ → App).'); return; }
  const P = state.sheet;
  if (P.abs && Number.isFinite(k) && k !== (P.abActive || 0)) { abSwitch(k); state.closed = defaultClosed(); state.taskOpen = new Set(); }
  const b = bid ? P.blocks.find(x => x.id === bid) : null;
  state.area = ar; state.out = ar === 'tafel' && b ? 'tafel' : ar === 'extras' && b ? (b.type === 'a3' ? a3Fmt(b) : 'exit') : areaOutFor(ar);
  if (b) { state.sel = b.id; if (oneCard()) state.closed = new Set(cardIds().filter(x => x !== b.id)); else state.closed.delete(b.id); }
  state.insAt = null; closeGloss(); closeZl(); closeMenu();
  renderEditor(); clearTimeout(renderTimer); renderPreview();
  const c = b && $(`#editor .card[data-bid="${b.id}"]`); if (c) c.scrollIntoView({ block: 'start' }); else $('#editor').scrollTop = 0;
}
// Bereich „Übersicht“: die Stunde auf einen Blick, mit großen Wegen in die Bereiche
function startHTML() {
  const P = state.sheet, m = P.meta, vp = vpOf(); const A = stABs(); const SB = stBlocks(); const kl = KL(P.klasse);
  const cnt = (L, t) => L.filter(b => t.includes(b.type)).length;
  const nA4 = SB.filter(b => b.type === 'a3' && a3Fmt(b) === 'a4').length, nA3 = SB.filter(b => b.type === 'a3' && a3Fmt(b) === 'a3').length, nE = exitSteps().length;
  const nTf = cnt(SB, ['tafel']), nK = (P.cards || []).length, nSt = cnt(SB, ['step']);
  const pl = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const tile = (act, attrs, ic, t, sub, cls = '') => `<button type="button" class="sv-t${cls}" data-act="${act}" ${attrs}><i>${ic}</i><b>${t}</b><small>${sub}</small></button>`;
  const when = [vp.datum, vp.start ? vp.start + ' Uhr' : '', (Number(m.lesson) || 45) + ' Min.'].filter(Boolean).join(' · ');
  const upd = P.updatedAt ? new Date(P.updatedAt) : null;
  return `<div class="sv">
    <div class="sv-h"><small>${esc(kl.label)}${m.course ? ' · ' + esc(m.course) : ''}</small><h2>${esc(plainText(stTitle(P)) || 'Ohne Titel')}</h2><span>${esc(when)}${upd ? ` · zuletzt geändert ${upd.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}, ${upd.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
      ${String(m.frage || '').trim() ? `<p class="sv-q"><em>Stundenfrage</em>${esc(m.frage)}</p>` : ''}</div>
    <div class="sv-tiles">
      ${tile('area-set', 'data-v="blatt"', areaIc('blatt'), 'Arbeitsblatt bearbeiten', A.length > 1 ? pl(A.length, 'Arbeitsblatt', 'Arbeitsblätter') : pl(cnt(P.blocks, ['material', 'tasks', 'match', 'table', 'info', 'phrases', 'quote', 'image', 'text', 'heading', 'lines', 'qr']), 'Baustein', 'Bausteine'), ' main')}
      ${tile('pres-go', '', areaIc('pres'), 'Präsentieren', 'Folien der Stunde am Beamer', ' main')}
      ${tile('out-open', '', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="2.5" y="9" width="19" height="8" rx="1.5"/><path d="M6 14h12v7H6z"/></svg>', 'Ausgeben', 'PDF, Word, PowerPoint oder die ganze Stunde', ' main')}
      ${tile('area-set', 'data-v="stunde"', areaIc('stunde'), 'Stunde planen', nSt ? pl(nSt, 'Unterrichtsschritt', 'Unterrichtsschritte') + ' · Verlaufsplan' : 'Ablauf, Stundenziel, Verlaufsplan')}
      ${tile('area-set', 'data-v="tafel"', areaIc('tafel'), 'Tafel', [nTf ? pl(nTf, 'Tafelbild', 'Tafelbilder') : '', nK ? pl(nK, 'Tafelkarte', 'Tafelkarten') : ''].filter(Boolean).join(' · ') || 'Tafelbild und Tafelkarten')}
      ${tile('area-set', 'data-v="extras"', areaIc('extras'), 'Druck-Extras', [nA4 ? nA4 + ' × A4' : '', nA3 ? nA3 + ' × A3' : '', nE ? pl(nE, 'Exit-Ticket', 'Exit-Tickets') : ''].filter(Boolean).join(' · ') || 'Karten, Placemat, Exit-Ticket …')}
    </div>
    <div class="sv-sec"><div class="sv-st"><b>Arbeitsblätter dieser Stunde</b><button class="link" type="button" data-act="abx-add">+ Arbeitsblatt</button></div>
      ${A.map(x => { const nM = cnt(x.blocks, ['material']), nT = x.blocks.filter(b => b.type === 'tasks').reduce((n, b) => n + (b.items || []).filter(it => !itFo(it)).length, 0); return `<button type="button" class="sv-ab" data-act="sv-ab" data-abk="${x.k}"><b>${esc(abLabel(x.meta, x.k))}</b><span>${esc(plainText(x.meta.title || '') || 'ohne Titel')}<small>${[nM ? pl(nM, 'Material', 'Materialien') : '', nT ? pl(nT, 'Aufgabe', 'Aufgaben') : ''].filter(Boolean).join(' · ') || 'noch leer'}</small></span><em>bearbeiten ›</em></button>`; }).join('')}</div>
    <div class="sv-sec" data-bid="stunde">${ablaufHTML()}</div>
    <small class="hint sv-hint">Diese Übersicht erscheint beim Öffnen einer Stunde; abschalten unter <button class="link" type="button" data-act="settings" data-tab="app">Einstellungen</button>.</small>
  </div>`;
}
// Bereich „Einstellungen“: alles, was nicht Inhalt ist, an einem Ort
const SET_TABS = [['kurs', 'Kurs'], ['blatt', 'Arbeitsblatt'], ['design', 'Aussehen'], ['zeiten', 'Zeiten'], ['pres', 'Präsentation'], ['app', 'App']];
function settingsHTML() {
  const m = state.sheet.meta; const basis = isBasis(); const tabs = SET_TABS.filter(([k]) => !(basis && k === 'zeiten'));
  const tab = tabs.some(([k]) => k === state.setTab) ? state.setTab : 'kurs'; const isK = m.mode === 'klausur';
  let c = '';
  if (tab === 'kurs') c = `<div class="card set-card" data-bid="meta"><div class="card-b">
      <div class="row">${fText('course', 'Kurs', m.course, '')}${fText('school', 'Schule', m.school, '')}</div>
      <div class="row">${fSelect('klasse', 'Reiter', state.sheet.klasse, KLASSEN.map(k => [k.id, k.label]))}${fSelect('anrede', 'Anrede in Aufgaben', m.anrede, [['sie', 'Sie'], ['du', 'du']])}</div>
      <div class="chks x-wrap x-pro${m.levelsOn ? ' used' : ''}">${fCheck('levelsOn', 'Niveaustufen ★ Basis · ★★ Standard · ★★★ Experte', m.levelsOn)}</div>
      ${m.levelsOn ? `<div class="chks">${fCheck('lvTip', 'Im Basis-Blatt steht der erste Tipp direkt unter der Aufgabe', m.lvTip !== false)}</div><small class="hint">Bausteine ordnest du über ⋯ an der Karte den Stufen zu. Bei jeder Aufgabe gibt es unter „Mehr“ → „Niveaus“ eigene Fassungen für Basis und Experte.</small>` : ''}
      ${basis ? '' : '<small class="hint">Gruppen, Stundenziel und Stundenlänge stellst du im Bereich <button class="link" type="button" data-act="area-set" data-v="stunde">Stunde</button> ein.</small>'}
    </div></div>`;
  else if (tab === 'blatt') c = `<div class="card set-card" data-bid="meta"><div class="card-b">
      <div class="f"><span>Art</span><div class="seg sm" role="group" aria-label="Art des Blatts"><button type="button" data-act="mode" data-v="blatt" aria-pressed="${!isK}">Arbeitsblatt</button><button type="button" data-act="mode" data-v="klausur" aria-pressed="${isK}">Klausur</button></div></div>
      <div class="row">${fSelect('lineStep', 'Zeilenzählung', m.lineStep, [[5, 'jede 5. Zeile'], [1, 'jede Zeile']])}</div>
      <div class="chks">${isK ? '' : fCheck('showName', 'Namensfeld', m.showName) + fCheck('showDate', 'Datumsfeld', m.showDate)}${fCheck('showAFB', 'AFB neben Aufgaben drucken', m.showAFB) + fCheck('noHy', 'Keine Silbentrennung in Materialtexten', m.noHy)}<span class="x-wrap x-pro${m.showMin ? ' used' : ''}">${fCheck('showMin', 'Bearbeitungszeit neben Aufgaben drucken', m.showMin)}</span>${fCheck('opBold', 'Operatoren fett', m.opBold !== false)}</div>
      <small class="hint">Gilt für ${state.sheet.abs ? 'alle Arbeitsblätter der Stunde' : 'das Arbeitsblatt'}.</small>
    </div></div>`;
  else if (tab === 'design') { const sc = seiteCard(); c = sc.replace('<div class="card', '<div class="card set-card').replace(/<div class="card-h"[\s\S]*?<\/div>\s*<div class="card-b">/, '<div class="card-b">').replace(' closed', ''); c = (state.sheet.abs ? `<small class="hint">Design und Papier gelten für ${esc(abLabel(m, state.sheet.abActive || 0))}; die anderen Arbeitsblätter stellst du jeweils dort ein.</small>` : '') + c; }
  else if (tab === 'zeiten') c = `<div class="card set-card"><div class="card-b">
      <small class="hint">Start und Ende der Unterrichtsstunden je Schule. In der Karte „Stunde“ wählst du dann das Zeitfenster; Beginn und Länge werden übernommen, und die Timer der Präsentation richten sich nach der Uhr. Gespeichert wird mit deinem Konto.</small>
      ${zeitSchulen().map(sch => { const L = zeitenOf(sch); return `<div class="zt-sch"><b>${esc(sch)}</b>${L.length ? `<div class="zt-list">${L.map((z, i) => { const d = hm(z.e) - hm(z.s); return `<div class="zt-row"><input type="text" data-zt="${esc(sch)}|${i}|l" value="${esc(z.l)}" placeholder="Bezeichnung, z. B. 1./2. Stunde" aria-label="Bezeichnung"><input type="time" data-zt="${esc(sch)}|${i}|s" value="${esc(z.s)}" aria-label="Beginn"><span>bis</span><input type="time" data-zt="${esc(sch)}|${i}|e" value="${esc(z.e)}" aria-label="Ende"><small class="zt-d">${d > 0 ? d + ' Min.' : ''}</small><button class="ib" type="button" data-act="zt-del" data-sch="${esc(sch)}" data-i="${i}" title="Entfernen" aria-label="Entfernen">${I.x}</button></div>`; }).join('')}</div>` : '<small class="hint">Noch keine Zeiten.</small>'}<button class="link" type="button" data-act="zt-add" data-sch="${esc(sch)}">+ Zeitfenster</button></div>`; }).join('')}
    </div></div>`;
  else if (tab === 'pres') c = `<div class="card set-card"><div class="card-b">
      <label class="chk"><input type="checkbox" data-uhr${uhrOn() ? ' checked' : ''}><span>Timer nach der Uhr: Arbeitsphasen enden zur geplanten Uhrzeit, wenn die Stunde einen Beginn hat</span></label>
      <small class="hint">Die Endzeit ergibt sich aus Beginn, Länge und den Minuten der Bausteine. Steht bei einem Baustein „fertig bis“, gilt diese Uhrzeit als fester Punkt; sonst ist das Stundenende der feste Punkt. Beginnt eine Phase später, wird sie kürzer, damit das Folgende noch passt. Außerhalb der Stundenzeit zählen die Timer wie bisher nur die Minuten herunter. Bei 30 % Restzeit wird der Timer auf der Folie orange.</small>
      <label class="chk"><input type="checkbox" data-prph${m.presPhase === false ? '' : ' checked'}><span>Phasenleiste unten auf den Folien (aus den Phasen der Aufgaben)</span></label>
      <div class="f"><span>Schrift der Phasenleiste</span><div class="seg sm" role="group" aria-label="Schriftgröße der Phasenleiste">${Object.entries(PH_SIZES).map(([k, v]) => `<button type="button" data-act="ph-size" data-v="${k}" aria-pressed="${(PH_SIZES[m.presPhSize] ? m.presPhSize : 'm') === k}">${v.label}</button>`).join('')}</div></div>
      ${ADM.is ? `<div class="f"><span>Folienübergang <small class="vt-own">nur in deinem Konto</small></span><div class="seg sm" role="group" aria-label="Folienübergang">${Object.entries(PR_VT).map(([k, v]) => `<button type="button" data-act="pr-trans" data-v="${k}" aria-pressed="${(state.prefs.trans || 'none') === k}">${v}</button>`).join('')}</div><small>${document.startViewTransition ? 'Morphen lässt Titel, Kopfzeile, Phasenleiste und Timer von Folie zu Folie gleiten, der Rest wird überblendet. Gilt beim Weiterblättern, auch im Beamerfenster.' : 'Dieser Browser kann keine Folienübergänge; in Chrome, Edge und der Windows-App geht es.'}</small></div>` : ''}
      <div class="f"><span>Anzeige des Timers auf den Folien</span><div class="seg sm" role="group" aria-label="Anzeige des Timers">${Object.entries(TM_SHOW).map(([k, v]) => `<button type="button" data-act="tm-show" data-v="${k}" aria-pressed="${tmMode() === k}" title="${v.hint}">${v.label}</button>`).join('')}</div><small>Beides: Restminuten und „bis 10:35“. Nur Endzeit: „bis 10:35“; die Endzeit pulsiert ab 30 % Restzeit und blinkt rot, wenn die Zeit um ist. Vor dem Start steht dort die geplante Dauer, solange die Endzeit noch offen ist. Gilt für alle Stunden.</small></div>
      <div class="f"><span>Größe des Timers auf den Folien</span><div class="seg sm" role="group" aria-label="Größe des Timers">${Object.entries(TM_SIZES).map(([k, v]) => `<button type="button" data-act="tm-size" data-v="${k}" aria-pressed="${tmSize() === k}">${v.label}</button>`).join('')}</div><small>Gilt für alle Stunden, im Browser und in PowerPoint. „klein“ ist so groß wie die übrigen Angaben oben rechts.</small></div>
      <div class="f"><span>Sicherungen</span>
        <label class="chk"><input type="checkbox" data-pref="sichLast"${sichLastOn() ? ' checked' : ''}><span>In der Phasenleiste nur die letzte Sicherung der Stunde zeigen; bei den Sicherungen davor bleibt die vorige Phase hervorgehoben</span></label></div>
      <small class="hint">Welche Folien gezeigt werden und die Zeiten je Folie stellst du im Bereich <button class="link" type="button" data-act="area-set" data-v="pres">Präsentation</button> ein.</small>
    </div></div>`;
  else c = `<div class="card set-card"><div class="card-b">
      <div class="f"><span>Funktionsumfang</span><div class="seg sm umfang" role="group" aria-label="Funktionsumfang"><button type="button" data-act="umfang" data-v="basis" aria-pressed="${isBasis()}">Basis</button><button type="button" data-act="umfang" data-v="experte" aria-pressed="${!isBasis()}">Experte</button></div><small>${isBasis() ? '<b>Basis:</b> nur Arbeitsblätter und die Präsentation dazu. Stundenplanung (Ziel, Zeiten, Verlaufsplan), Tafelbilder und Karten, Druck-Extras, Startseite und Board sind ausgeblendet, ebenso Standards, Phase und Zeit, Gruppen und Niveaus, solange sie nicht benutzt werden. Gelöscht wird nichts.' : '<b>Experte:</b> alle Funktionen. Mit „Basis“ bleiben nur Arbeitsblätter und die Präsentation dazu.'}</small></div>
      <div class="f"><span>Startseite von selbst zeigen</span><div class="seg sm" role="group" aria-label="Startseite von selbst zeigen">${HOME_MODES.map(([v, l]) => `<button type="button" data-act="home-pref" data-v="${v}" aria-pressed="${homeMode() === v}">${l}</button>`).join('')}</div><small class="hint">„Nach einer Pause“: beim ersten Öffnen und wenn die App mindestens drei Stunden zu war. Über das Haus-Symbol kommst du jederzeit hin.</small></div>
      <div class="f"><span>Darstellung</span><div class="seg sm" role="group" aria-label="Darstellung">${[['light', 'Hell'], ['dark', 'Dunkel'], ['auto', 'Wie das Gerät']].map(([v, l]) => `<button type="button" data-act="theme-set" data-v="${v}" aria-pressed="${themePref() === v}">${l}</button>`).join('')}</div></div>
      <div class="f"><span>Ansicht</span><div class="set-chks">
        ${true ? '' : `<button type="button" class="link onecard" data-act="start-pref" aria-pressed="${String(lsGet(LS_START)) !== '0'}"><span class="cb" aria-hidden="true"></span>Beim Öffnen einer Stunde die Übersicht zeigen</button>`}
        <button type="button" class="link onecard" data-act="more-all" aria-pressed="${moreAll()}"><span class="cb" aria-hidden="true"></span>In den Karten immer alle Optionen zeigen (sonst unter „Mehr“)</button>
        <button type="button" class="link onecard" data-act="onecard" aria-pressed="${oneCard()}"><span class="cb" aria-hidden="true"></span>Nur eine Karte gleichzeitig offen</button></div></div>
      <div class="f"><span>Speicherort</span><div class="set-store">${esc(($('#status span') || {}).textContent || '')}</div>${$('#btn-login') && !$('#btn-login').hidden ? '<button class="btn sm" type="button" data-act="login">Anmelden und online speichern</button>' : ''}</div>
      <div class="f"><span>Hilfe</span><div class="tf-ed-acts"><button class="btn sm" type="button" data-act="help">Hilfe und Kniffe</button></div><small>Tastenkürzel: Strg+K Baustein hinzufügen · Strg+Z rückgängig · Strg+Umschalt+S speichern unter</small></div>
      ${donateHTML()}
    </div></div>`;
  return `<div class="set-h"><button class="link" type="button" data-act="settings-back">‹ Zurück${state.prevArea && state.prevArea !== 'einst' && !isBasis() ? ' zu „' + esc(AREA_NAME[state.prevArea] || 'Arbeitsblätter') + '“' : ''}</button><h2>Einstellungen</h2></div>
    <div class="set-tabs" role="tablist" aria-label="Einstellungen">${tabs.map(([k, l]) => `<button type="button" role="tab" data-act="set-tab" data-v="${k}" aria-selected="${tab === k}">${l}</button>`).join('')}</div>${c}`;
}
function openSettings(tab) { if (tab) state.setTab = tab; if (isNarrow() && state.view !== 'edit') setView('edit'); if (state.area === 'einst') { renderEditor(); return; } closeGloss(); closeZl(); closeMenu(); setArea('einst'); }
// Bereich „Druck-Extras“: A4-Vorlagen, A3-Vorlagen und Exit-Tickets in eigenen Abschnitten
const XS = {
  a4: { t: 'A4-Vorlagen', d: 'Zum Austeilen und Ausschneiden, auf normalem Druckerpapier' },
  a3: { t: 'A3-Vorlagen', d: 'Plakate und Methodenbögen für Gruppen, in A3 oder auf zwei A4-Blättern zum Kleben' },
  exit: { t: 'Exit-Tickets', d: 'Kurze Rückmeldung am Ende der Stunde, mehrere Tickets pro A4-Seite' }
};
const TPL_SHORT = { karten: 'Eigene Texte mit Schnittlinien', lernk: 'Begriff vorn, Erklärung hinten', streifen: 'Sätze zum Ordnen', tandem: 'Partner fragen sich ab', annot: 'Text mit breitem Rand', placemat: 'Für 3 bis 6 Personen', schreib: 'Impuls in der Mitte', plakat: 'Für den Galeriegang', vergleich: 'Texte nach Aspekten', experte: 'Fürs Gruppenpuzzle' };
const xsTpl = (k, x) => `<button type="button" class="xs-tp" data-act="tpl-new" data-v="${k}" title="${esc(x.d)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${x.ic}</svg><b>${x.label}</b><span>${esc(TPL_SHORT[k] || '')}</span></button>`;
function extrasHTML(num) {
  const blocks = state.sheet.blocks;
  const sec = (k, cards, add) => { const on = state.out === k; const n = cards.length;
    return `<section class="xs xs-${k}${on ? ' on' : ''}"><div class="xs-h" data-act="xs-show" data-v="${k}" title="In der Vorschau zeigen"><span class="xs-badge">${k === 'exit' ? 'A4' : k.toUpperCase()}</span><div class="xs-ht"><b>${XS[k].t}${n ? ` <em>${n}</em>` : ''}</b><small>${XS[k].d}</small></div><span class="xs-eye">${on ? 'in der Vorschau' : 'Vorschau ›'}</span></div>
      ${cards.join('')}<div class="xs-add"><small>${n ? 'Weitere hinzufügen' : 'Hinzufügen'}</small><div class="xs-tps">${add}</div></div></section>`; };
  const cardsOf = f => blocks.map((b, i) => (f(b) ? cardHTML(b, i, num) : '')).filter(Boolean);
  return sec('a4', cardsOf(b => b.type === 'a3' && a3Fmt(b) === 'a4'), Object.entries(A3_TPL).filter(([, x]) => x.o === 'a4').map(([k, x]) => xsTpl(k, x)).join(''))
    + sec('a3', cardsOf(b => b.type === 'a3' && a3Fmt(b) === 'a3'), Object.entries(A3_TPL).filter(([, x]) => x.o !== 'a4').map(([k, x]) => xsTpl(k, x)).join(''))
    + sec('exit', cardsOf(b => b.type === 'step' && !!b.exit), `<button type="button" class="xs-tp" data-act="st-new" data-v="exit" title="Unterrichtsschritt am Ende der Stunde mit Fragen zum Ausdrucken"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M8 8h8M8 12h8M8 16h5"/></svg><b>Exit-Ticket</b><span>Zwei bis drei Fragen zum Abschluss</span></button>`);
}
// „+ Baustein“: alle Bausteine der Stunde an einem Ort, mit Suche; der Baustein landet in seinem Bereich
const BK_KW = { material: 'text prosa auszug roman erzählung sachtext zeilennummern', poem: 'lyrik verse strophen', tasks: 'aufgabe arbeitsauftrag operator', match: 'verbinden paare linien', sortieren: 'ordnen kategorien oberbegriffe', info: 'merke tipp definition kasten', phrases: 'satzanfänge schreibhilfe wendungen', tafel: 'sicherung schaubild tafel lückentafelbild', table: 'raster ausfüllen', lines: 'linien schreibzeilen kästchen zeichenfläche', heading: 'zwischentitel', text: 'absatz hinweis einleitung', quote: 'zitat impuls', qr: 'link video', image: 'foto abbildung karikatur grafik', pagebreak: 'neue seite', post: 'social media instagram tiktok x', a3: '' };
const bkNorm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // gleiche Länge wie das Original, damit die Markierung sitzt
function bkItems() {
  const L = []; const basis = isBasis(); const ic = k => typeIcon(k);
  const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  paletteFor().filter(t => !['step', 'tafel', 'a3'].includes(t.type)).forEach(t => L.push({ g: ['Material', 'Aufgaben und Übungen', 'Gestaltung'][PAL_GRP(t)], ar: 'blatt', label: t.label, desc: t.desc, kw: BK_KW[t.k] || BK_KW[t.type] || '', ic: ic(t.ic), attrs: `data-act="add" data-type="${t.type}" data-pk="${t.k}"` }));
  allSnips().forEach(x => L.push({ g: 'Aus der Sammlung', ar: 'blatt', label: x.name, desc: x.builtin ? 'vorbereitet' : (TYPES[x.type] || {}).label || '', kw: 'sammlung gespeichert', ic: ic(x.type), attrs: `data-act="snip-add" data-id="${esc(x.id)}"` }));
  if (!basis) {
    const SG = { ein: 'Unterrichtsschritt · Einstieg', sich: 'Unterrichtsschritt · Sicherung', end: 'Unterrichtsschritt · Schluss' };
    Object.entries(STEP_TPL).forEach(([k, x]) => { if (k === 'exit') return; L.push({ g: SG[x.g] || 'Unterrichtsschritt', ar: 'stunde', label: x.label, desc: plainText(duSie(x.note || '', state.sheet.meta.anrede === 'du')), kw: 'schritt unterrichtsschritt ' + (SG[x.g] || ''), ic: ic('step'), attrs: `data-act="st-new" data-v="${k}"` }); });
    L.push({ g: 'Unterrichtsschritt · Schluss', ar: 'stunde', label: 'Eigener Schritt', desc: 'Leerer Unterrichtsschritt', kw: 'frei schritt', ic: ic('step'), attrs: 'data-act="st-new" data-v="frei"' });
    L.push({ g: 'Tafel', ar: 'tafel', label: 'Tafelbild', desc: TYPES.tafel.desc, kw: BK_KW.tafel, ic: ic('tafel'), attrs: 'data-act="add" data-type="tafel" data-pk="tafel"' });
    Object.entries(A3_TPL).forEach(([k, x]) => L.push({ g: x.o === 'a4' ? 'A4-Vorlage zum Drucken' : 'A3-Vorlage zum Drucken', ar: 'extras', label: x.label, desc: x.d, kw: (x.o === 'a4' ? 'a4 ausschneiden drucken kärtchen ' : 'a3 plakat gruppe drucken ') + (k === 'experte' ? 'gruppenpuzzle' : ''), ic: svg(x.ic), attrs: `data-act="tpl-new" data-v="${k}"` }));
    L.push({ g: 'Exit-Ticket', ar: 'extras', label: 'Exit-Ticket', desc: 'Zwei bis drei Fragen zum Abschluss, mehrmals pro A4-Seite', kw: 'rückmeldung abschluss feedback', ic: ic('step'), attrs: 'data-act="st-new" data-v="exit"' });
  }
  return L;
}
function bkList() {
  const A = state.area || 'blatt'; const q = bkNorm(state.bkQ || '').trim(); const words = q.split(/\s+/).filter(Boolean);
  let L = bkItems(); if (words.length) {
    L = L.filter(x => { const h = bkNorm(`${x.label} ${x.desc} ${x.kw} ${x.g}`); return words.every(w => h.includes(w)); });
    // Treffer im Namen zuerst, dann im Stichwort, dann in der Beschreibung
    const sc = x => { const l = bkNorm(x.label), k = bkNorm(x.kw + ' ' + x.g); return words.reduce((n, w) => n + (l.startsWith(w) ? 0 : l.includes(w) ? 1 : k.includes(w) ? 2 : 3), 0); };
    L = L.map((x, i) => [sc(x), i, x]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(z => z[2]);
    if (!L.length) return '<div class="bk-none">Kein Baustein gefunden. Versuch es mit einem anderen Wort, etwa „Tabelle“, „Karten“ oder „Einstieg“.</div>';
    const order = [...new Set(L.map(x => x.g))];
    return order.map(g => bkGroup(g, L.filter(x => x.g === g), A)).join('');
  }
  if (!L.length) return '<div class="bk-none">Kein Baustein gefunden. Versuch es mit einem anderen Wort, etwa „Tabelle“, „Karten“ oder „Einstieg“.</div>';
  // aktueller Bereich zuerst
  const order = [...new Set([...L.filter(x => x.ar === A).map(x => x.g), ...L.map(x => x.g)])];
  return order.map(g => bkGroup(g, L.filter(x => x.g === g), A)).join('');
}
const bkGroup = (g, G, A) => `<div class="bk-g"><small>${esc(g)}${G[0].ar !== A && !isBasis() ? ` <i>→ ${esc(AREA_NAME[G[0].ar])}</i>` : ''}</small><div class="bk-grid">${G.map(x => `<button type="button" class="bk-it" ${x.attrs} data-bk-area="${x.ar}" title="${esc(x.desc)}"><i class="add-ic">${x.ic}</i><span><b>${esc(x.label)}</b><small>${esc(x.desc)}</small></span></button>`).join('')}</div></div>`;
function bkHTML() {
  if (!state.bkOpen) return `<div class="bk"><button type="button" class="bk-open" data-act="bk-open"><b>+</b> Baustein hinzufügen<small>Strg+K</small></button></div>`;
  return `<div class="bk open"><div class="bk-h"><input type="search" data-bkq value="${esc(state.bkQ || '')}" placeholder="Suchen, z. B. Tabelle, Karten, Einstieg …" aria-label="Baustein suchen" autocomplete="off"><button type="button" class="ib" data-act="bk-close" title="Schließen (Esc)" aria-label="Schließen">${I.x}</button></div>
    <div class="bk-list" id="bk-list">${bkList()}</div><small class="hint">Enter fügt den ersten Treffer ein. Bausteine aus anderen Bereichen landen dort, die Ansicht wechselt mit.</small></div>`;
}
function bkOpen() {
  if (isNarrow() && state.view !== 'edit') setView('edit');
  if (['pres', 'start', 'einst'].includes(state.area || 'blatt') || state.out === 'karten') setArea('blatt');
  state.bkOpen = true; state.bkQ = ''; renderEditor();
  const box = $('#editor .bk'); if (box) { box.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); const q = box.querySelector('[data-bkq]'); if (q) q.focus({ preventScroll: true }); }
}
function bkClose() { state.bkOpen = false; state.bkQ = ''; renderEditor(); }
