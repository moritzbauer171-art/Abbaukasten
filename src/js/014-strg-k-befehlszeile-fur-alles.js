/* ===== Strg+K: Befehlszeile für alles – Bausteine, Befehle, Wechseln, Einstellungen ===== */
const CMD = { q: '', i: 0, L: [] };
function cmdItems() {
  const L = []; const fake = attrs => () => { const h = document.createElement('div'); h.innerHTML = `<button type="button" ${attrs}></button>`; onClick({ target: h.firstChild, preventDefault() {}, stopPropagation() {} }); };
  const clk = id => () => { const e = document.getElementById(id); if (e) e.click(); };
  const C = (g, label, run, k, kw) => L.push({ g, label, run, k: k || '', kw: kw || '' });
  C('Befehle', 'Präsentieren', () => openPres(0), 'F5', 'beamer folien start');
  C('Befehle', 'Ausgeben: PDF, Word, Drucken', () => openOut(), 'Strg P', 'drucken export');
  C('Befehle', 'Neue Stunde', clk('btn-new'), '', 'anlegen');
  C('Befehle', 'Meine Stunden', clk('btn-lib'), '', 'bibliothek öffnen ordner');
  C('Befehle', 'Speichern unter …', clk('btn-saveas'), 'Strg ⇧ S', 'kopie');
  C('Befehle', state.fassung === 'lehrer' ? 'Schülerfassung zeigen' : 'Lehrerfassung zeigen', () => { state.fassung = state.fassung === 'lehrer' ? 'schueler' : 'lehrer'; renderEditor(); renderPreview(); }, '', 'lösung erwartung');
  C('Befehle', 'In den Materialien suchen', () => { if (state.out !== 'blatt') setOut && setOut('blatt'); msrToggle(true); }, 'Strg ⇧ F', 'finden wort');
  C('Befehle', (typeof GLS !== 'undefined' && GLS.on ? 'Vorschläge zum Glossieren ausblenden' : 'Vorschläge zum Glossieren zeigen'), () => glSugSet(!GLS.on), '', 'worterklärung glossar');
  C('Befehle', 'Weiteres Arbeitsblatt in dieser Stunde', () => abAdd(), '', 'ab neu');
  C('Befehle', 'Tafel öffnen', clk('btn-tafel'), '', 'whiteboard stift');
  C('Befehle', 'Rahmenlehrplan', clk('btn-rlp'), '', 'rlp standards');
  C('Befehle', 'Lehrerzimmer', clk('btn-forum'), '', 'forum kollegium');
  C('Befehle', 'Hilfe und Kniffe', clk('btn-help'), '', 'kniffe tour');
  C('Befehle', 'Tastenkürzel', () => keysOpen(), '?', 'shortcuts tasten');
  if (!isBasis()) C('Befehle', 'Startseite', clk('btn-home'), '', 'home');
  bkItems().forEach(x => C('Baustein · ' + x.g, x.label, fake(x.attrs + (x.ar ? ` data-bk-area="${x.ar}"` : '')), '', 'baustein einfügen ' + x.kw + ' ' + x.desc));
  const fk = fachKey(state.klasse);
  KLASSEN.filter(k => k.fach === fk && k.id !== state.klasse).forEach(k => C('Wechseln', 'Klasse: ' + k.label, () => switchKlasse(k.id), '', 'klasse kurs'));
  (state.lib || []).filter(d => d.klasse === state.klasse && (!state.sheet || d.id !== state.sheet.id)).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 12).forEach(d => C('Wechseln', 'Stunde: ' + (d.title || 'Ohne Titel'), () => openById(d.id), relTime(d.updatedAt), 'stunde öffnen'));
  if (state.sheet) stABs().forEach(x => { if (x.k !== (state.sheet.abActive || 0)) C('Wechseln', abLabel(x.meta, x.k) + ': ' + (plainText(x.meta.title || '') || 'ohne Titel'), () => abGo(x.k), '', 'arbeitsblatt'); });
  SET_TABS.filter(([k]) => !(isBasis() && k === 'zeiten')).forEach(([k, l]) => C('Einstellungen', 'Einstellungen: ' + l, () => openSettings(k), '', 'einstellungen optionen'));
  C('Einstellungen', 'Silbentrennung im Blatt', () => openSettings('blatt'), '', 'trennung hyphen');
  C('Einstellungen', 'Design und Farbe', () => openSettings('design'), '', 'aussehen layout schrift');
  if (ADM.is) C('Einstellungen', 'Folienübergang', () => openSettings('pres'), '', 'morphen übergang');
  C('Einstellungen', 'Basis oder Experte', () => openSettings('app'), '', 'umfang modus');
  return L;
}
function cmdList() {
  const q = bkNorm(CMD.q || '').trim(), W = q.split(/\s+/).filter(Boolean); let L = CMD.all;
  if (W.length) { L = L.filter(x => { const h = bkNorm(x.label + ' ' + x.g + ' ' + x.kw); return W.every(w => h.includes(w)); });
    const sc = x => { const l = bkNorm(x.label); return W.reduce((n, w) => n + (l.startsWith(w) ? 0 : l.includes(w) ? 1 : 2), 0) + (x.g.startsWith('Baustein') ? .5 : 0); };
    L = L.map((x, i) => [sc(x), i, x]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(z => z[2]); }
  else L = L.filter(x => !x.g.startsWith('Baustein') || /Material|Aufgaben/.test(x.g)).slice(0, 40);
  CMD.L = L.slice(0, 60); CMD.i = Math.min(CMD.i, Math.max(0, CMD.L.length - 1));
  let g = '', h = '';
  CMD.L.forEach((x, i) => { if (x.g !== g) { g = x.g; h += `<div class="cmd-g">${esc(g)}</div>`; } h += `<button type="button" class="cmd-it${i === CMD.i ? ' on' : ''}" data-ci="${i}" role="option" aria-selected="${i === CMD.i}"><span>${esc(x.label)}</span>${x.k ? `<small>${esc(x.k)}</small>` : ''}</button>`; });
  return h || '<div class="cmd-none">Nichts gefunden. Versuch es mit einem anderen Wort.</div>';
}
function cmdPaint() { const l = document.getElementById('cmd-list'); if (!l) return; l.innerHTML = cmdList(); const on = l.querySelector('.cmd-it.on'); if (on) on.scrollIntoView({ block: 'nearest' }); }
function cmdOpen() {
  if (document.getElementById('cmd-ov')) return; mmoreToggle(false); CMD.q = ''; CMD.i = 0; CMD.all = cmdItems();
  const ov = document.createElement('div'); ov.id = 'cmd-ov';
  ov.innerHTML = `<div class="cmd" role="dialog" aria-modal="true" aria-label="Befehle und Bausteine"><div class="cmd-h"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="7" cy="7" r="4.3"/><path d="M13.5 13.5 10.2 10.2"/></svg><input type="search" id="cmd-q" placeholder="Baustein, Befehl, Klasse, Stunde oder Einstellung …" aria-label="Suchen" autocomplete="off"><kbd>Esc</kbd></div><div class="cmd-list" id="cmd-list" role="listbox"></div><div class="cmd-f"><span>↑ ↓ wählen</span><span>Enter ausführen</span><span>Esc schließen</span></div></div>`;
  document.body.append(ov); cmdPaint(); const q = document.getElementById('cmd-q'); q.focus();
  const close = () => { ov.remove(); };
  const run = i => { const x = CMD.L[i]; if (!x) return; close(); try { x.run(); } catch (err) { console.warn(err); } };
  ov.addEventListener('mousedown', e => { if (e.target === ov) close(); });
  ov.addEventListener('click', e => { const b = e.target.closest('[data-ci]'); if (b) run(+b.dataset.ci); });
  q.addEventListener('input', () => { CMD.q = q.value; CMD.i = 0; cmdPaint(); });
  q.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); CMD.i = Math.min(CMD.L.length - 1, CMD.i + 1); cmdPaint(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); CMD.i = Math.max(0, CMD.i - 1); cmdPaint(); }
    else if (e.key === 'Enter') { e.preventDefault(); run(CMD.i); } });
}
// „Mehr“: selten gebrauchte Einstellungen einer Aufgabe oder Karte; „Alle Optionen zeigen“ klappt alles auf
const LS_MORE = 'abw.more';
const moreAll = () => String(lsGet(LS_MORE)) === '1';
const moreOn = key => moreAll() || state.fmtOpen.has('more:' + key);
const moreBtn = (key, sum, label = 'Mehr') => moreAll() ? '' : `<button type="button" class="more-b${moreOn(key) ? ' on' : ''}" data-act="more" data-key="${esc(key)}" aria-expanded="${moreOn(key)}"><span>${moreOn(key) ? 'Weniger' : label}</span>${!moreOn(key) && sum ? `<small>${esc(sum)}</small>` : ''}<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg></button>`;
function itMoreSum(it) {
  const m = state.sheet.meta; const p = itPh(it);
  return [p ? PHASEN[p].label : '', m.groupsOn && it.grp ? grpName(m, it.grp) : '', String(it.tag || '').trim() ? 'Etikett: ' + String(it.tag).trim() : '', rlpOf(it).length ? rlpOf(it).length + ' Standards' : '', m.levelsOn && (Array.isArray(it.lv) || String(it.lvb || '').trim() || String(it.lve || '').trim()) ? 'Niveaus' : '', it.fo ? 'nur Folie' : '', !it.fo && it.noDg ? 'nicht digital' : ''].filter(Boolean).join(' · ');
}
// Bausteinleiste je Bereich; auf dem Blatt nach Zweck gruppiert
const PAL_GRP = t => (['tasks', 'match', 'sort', 'table', 'phrases'].includes(t.type) ? 1 : ['heading', 'text', 'lines', 'qr', 'pagebreak'].includes(t.type) ? 2 : 0);
const areaPalette = A => paletteFor().filter(t => (A === 'tafel' ? t.type === 'tafel' : A === 'extras' ? t.type === 'a3' : !['step', 'tafel', 'a3'].includes(t.type)));
// Phase und Zeit: an jedem Baustein oben in der Karte (Aufgaben: für alle Aufgaben des Bausteins)
const PHT_NO = new Set(['step', 'pagebreak', 'a3']);
function phSelHTML(b) {
  const tasks = b.type === 'tasks'; let cur = itPh(b), mixed = false;
  if (tasks) { const P = [...new Set((b.items || []).map(it => itPh(it)))]; cur = P.length === 1 ? P[0] : ''; mixed = P.length > 1; }
  return `<select ${tasks ? 'data-phall="1"' : 'data-k="ph"'} aria-label="Phase"${cur ? ` style="--phc:${PHASEN[cur].c}" class="ph-on"` : ''}>${mixed ? '<option value="__mix" selected>gemischt</option>' : ''}<option value=""${!cur && !mixed ? ' selected' : ''}>keine Phase</option>${Object.entries(PHASEN).map(([k, x]) => `<option value="${k}"${cur === k ? ' selected' : ''}>${x.label}</option>`).join('')}</select>`;
}
const minInHTML = b => `<span class="pht-min"><input type="text" inputmode="numeric" maxlength="3" data-k="min" value="${esc(itMin(b) || '')}" placeholder="–" aria-label="Minuten"><small>Min.</small></span>`;
function phtStrip(b) {
  if (PHT_NO.has(b.type)) return '';
  const key = 'pht:' + b.id; const ph = itPh(b), mn = itMin(b);
  if (!ph && !mn && !moreOn(key) && blockArea(b) === 'blatt' && !(state.prefs && state.prefs.phtAll)) return '';
  if (!moreOn(key)) { const sum = [ph && PHASEN[ph] ? PHASEN[ph].label : '', mn ? mn + ' Min.' : ''].filter(Boolean).join(' · ');
    return `<div class="pht pht-c"><button type="button" class="pht-tg" data-act="more" data-key="${esc(key)}" aria-expanded="false"${ph && PHASEN[ph] ? ` style="--phc:${PHASEN[ph].c}"` : ''}><i></i>${sum ? esc(sum) : 'Phase und Zeit'}</button></div>`; }
  return `<div class="pht"><label><span>Phase</span>${phSelHTML(b)}</label><label><span>Zeit</span>${minInHTML(b)}</label>${moreAll() ? '' : `<button type="button" class="link pht-x" data-act="more" data-key="${esc(key)}">Einklappen</button>`}</div>`;
}
// eine Karte im Editor
function cardHTML(b, i, num, opt = {}) {
  const blocks = state.sheet.blocks; const closed = state.closed.has(b.id); const gOn = state.sheet.meta.groupsOn;
  return `<div class="card${closed ? ' closed' : ''}${state.sel === b.id ? ' sel' : ''}" data-bid="${b.id}">
        <div class="card-h" data-act="toggle"${opt.drag === false ? '' : ' draggable="true" title="Zum Umsortieren ziehen"'}><button type="button" class="chev" data-act="toggle" aria-expanded="${!closed}" title="${closed ? 'Aufklappen' : 'Zuklappen'}"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg></button><span class="kind-i">${typeIcon(iconKey(b))}</span><span class="ch-t"><span class="ch-k"><span class="kind">${typeLabel(b)}</span>${gOn && b.group ? `<span class="gpill">${esc(grpName(state.sheet.meta, b.group))}</span>` : ''}${state.sheet.meta.levelsOn && Array.isArray(b.lv) ? `<span class="gpill" title="${b.lv.map(x => LV[x].name).join(', ')}">${b.lv.map(x => LV[x].sym).join(' ')}</span>` : ''}${isRes(b) ? '<span class="res-badge" title="Reserve: nur, wenn Zeit bleibt">Reserve</span>' : ''}</span><span class="sum${b.type === 'pagebreak' ? ' dim' : ''}" data-sum>${esc(summary(b, num))}</span>${b.type === 'pagebreak' ? '' : `<span class="sum2" data-sum2>${esc(sumDetail(b))}</span>`}</span>${isBasis() ? '' : presBtn(b)}
          ${opt.drag === false ? `<button class="ib" type="button" data-act="up" title="Früher in der Stunde"${i === 0 ? ' disabled' : ''}>${I.up}</button>
          <button class="ib" type="button" data-act="down" title="Später in der Stunde"${i === blocks.length - 1 ? ' disabled' : ''}>${I.down}</button>` : ''}
          <button class="ib" type="button" data-act="menu" title="Weitere Aktionen" aria-haspopup="menu">${I.more}</button></div>
        ${b.type === 'pagebreak' ? '' : `<div class="card-b">${gNote(b.id)}${phtStrip(b)}${bodyFor(b, num)}</div>`}</div>`;
}
// Platzhalter auf dem Blatt für Bausteine anderer Bereiche (zeigt die Stelle in der Stunde)
function phRowHTML(b, num) {
  const ar = blockArea(b); const onSheet = b.type === 'tafel' && (b.onSheet || 'luecke') !== 'aus';
  return `<div class="ph-row" data-ar="${ar}"><i>${typeIcon(iconKey(b))}</i><span class="ph-t"><b>${esc(typeLabel(b))}</b> ${esc(b.type === 'step' ? stepLabel(b) : summary(b, num))}${onSheet ? ' <small>· steht auch auf dem Blatt</small>' : ''}</span>${isBasis() ? '<small class="ph-x">nur in „Experte“</small>' : `<button class="link" type="button" data-act="area-go" data-area="${ar}" data-bid="${b.id}" data-abk="${state.sheet.abActive || 0}">${AREA_NAME[ar]} →</button>`}</div>`;
}
// Bereich „Stunde“: Kopfdaten der ganzen Stunde
function stundeCard() {
  const P = state.sheet, m = P.meta, vp = vpOf(); const closed = state.closed.has('stunde');
  return `<div class="card st-card${closed ? ' closed' : ''}" data-bid="stunde">
    <div class="card-h" data-act="toggle"><button type="button" class="chev" data-act="toggle" aria-expanded="${!closed}" title="${closed ? 'Aufklappen' : 'Zuklappen'}"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg></button><span class="kind-i">${areaIc('stunde')}</span><span class="kind">Zeit</span><span class="sum">${esc(stTitle(P))}${vp.datum ? ' · ' + esc(vp.datum) : ''}</span></div>
    <div class="card-b">
      ${P.abs ? `<label class="f"><span>Titel der Stunde</span><input type="text" data-st="title" value="${esc(stTitle(P))}" placeholder="Titel der Stunde"></label>` : fText('title', 'Titel der Stunde (zugleich Titel des Arbeitsblatts)', m.title, 'Titel')}
      <div class="row">${(() => { const Z = zeitenOf(m.school); return `<label class="f"><span>Zeitfenster</span><select data-k="vp.slot"><option value="">${Z.length ? 'eigene Zeit' : 'eigene Zeit (Zeitfenster in den Einstellungen)'}</option>${Z.filter(z => z.s && z.e).map(z => `<option value="${esc(z.id)}"${vp.slot === z.id ? ' selected' : ''}>${esc([z.l, z.s + '–' + z.e].filter(Boolean).join(' · '))}</option>`).join('')}</select></label>`; })()}</div>
      <div class="row"><label class="f narrow"><span>Beginn</span><input type="text" data-k="vp.start" value="${esc(vp.start || '')}" placeholder="08:00"></label>${Number.isFinite(hm(vp.start)) ? `<div class="f"><span>Ende</span><div class="st-end">${hmFmt(hm(vp.start) + (Number(m.lesson) || 45))} Uhr · ${Number(m.lesson) || 45} Min.${vp.slot ? '' : ' <button class="link" type="button" data-act="settings" data-tab="zeiten">Zeitfenster einrichten</button>'}</div></div>` : ''}</div>
      ${fText('frage', 'Stundenfrage', m.frage, 'z. B. Wie erzeugen Politikerinnen und Politiker in sozialen Medien Nähe?')}
      ${ablaufHTML()}
      <div class="chks">${fCheck('groupsOn', 'Gruppen (eigene Blätter und Aufgaben je Gruppe)', m.groupsOn)}</div>
      ${m.groupsOn ? grpEdHTML(m) : ''}
      <div class="tf-ed-acts"><button class="btn sm" type="button" data-act="abx-out">Ganze Stunde ausgeben</button></div>
    </div></div>`;
}
// Bereich „Stunde“: Ablauf aller Bausteine in Reihenfolge; Unterrichtsschritte werden hier bearbeitet
function flowHTML(num) {
  const P = state.sheet; const A = stABs(); const multi = A.length > 1; const act = P.abActive || 0;
  let h = `<div class="flow-h"><b>Ablauf der Stunde</b><small>Unterrichtsschritte bearbeitest du hier, mit ↑ ↓ setzt du sie an die richtige Stelle. Alles andere öffnet sich in seinem Bereich.</small><button class="btn sm" type="button" data-act="sich-fill" title="Nach jeder Erarbeitung, Vertiefung und jedem Transfer ohne folgende Sicherung einen Schritt „Ergebnisse vergleichen“ einfügen">Fehlende Sicherungen ergänzen</button></div>`;
  A.forEach(x => {
    if (multi) h += `<div class="flow-ab${x.k === act ? ' on' : ''}"><b>${esc(abLabel(x.meta, x.k))}</b><span>${esc(plainText(x.meta.title || '') || 'ohne Titel')}</span>${x.k === act ? '' : `<button class="link" type="button" data-act="abx-go" data-abk="${x.k}">Schritte hier bearbeiten</button>`}</div>`;
    let numX = num; if (x.k !== act) { try { numX = numbering({ ...P, meta: x.meta, blocks: x.blocks }); } catch { numX = {}; } }
    const vis = x.blocks.filter(b => b.type !== 'pagebreak' && b.type !== 'lines');
    if (!vis.length) h += '<div class="flow-empty">Noch keine Bausteine.</div>';
    vis.forEach(b => {
      if (b.type === 'step' && x.k === act) { h += cardHTML(b, P.blocks.indexOf(b), num, { drag: false }); return; }
      const ar = blockArea(b); const phs = b.type === 'tasks' ? [...new Set((b.items || []).map(it => itPh(it)).filter(Boolean))] : b.type === 'step' && itPh(b) ? [itPh(b)] : b.type === 'tafel' ? ['sich'] : [];
      let sum = ''; try { sum = b.type === 'step' ? stepLabel(b) : summary(b, numX); } catch {}
      h += `<div class="flow-row" data-ar="${ar}"><i class="flow-ic">${typeIcon(iconKey(b))}</i><span class="flow-t"><b>${esc(typeLabel(b))}</b>${sum ? ` <span>${esc(sum)}</span>` : ''}</span><span class="flow-m">${isRes(b) ? '<span class="res-badge">Reserve</span>' : ''}${phs.map(p => `<span class="flow-ph" style="--phc:${PHASEN[p].c}" title="${PHASEN[p].label}">${PHASEN[p].label}</span>`).join('')}${itMin(b) ? `<em>${itMin(b)} Min.</em>` : ''}</span><button class="link" type="button" data-act="area-go" data-area="${ar}" data-bid="${b.id}" data-abk="${x.k}">${ar === 'stunde' ? 'bearbeiten' : AREA_NAME[ar]} →</button></div>`;
    });
  });
  return `<div class="flow">${h}</div>`;
}
function stepAdderHTML() {
  const tiles = g => Object.entries(STEP_TPL).filter(([, x]) => x.g === g).map(([k, x]) => `<button type="button" class="st-tp" data-act="st-new" data-v="${k}">${x.label}</button>`).join('');
  return `<div class="adder st-adder"><span class="lbl">Unterrichtsschritt hinzufügen</span>
    <div class="st-tpls"><div class="st-g"><small>Einstieg</small><div class="st-ts">${tiles('ein')}</div></div><div class="st-g"><small>Sicherung</small><div class="st-ts">${tiles('sich')}</div></div><div class="st-g"><small>Schluss</small><div class="st-ts">${tiles('end')}</div></div><div class="st-g"><small>Frei</small><div class="st-ts"><button type="button" class="st-tp" data-act="st-new" data-v="frei">Eigener Schritt</button></div></div></div>
    <small class="hint">Ein Einstieg kommt vor das Material, eine Sicherung hinter die letzten Aufgaben (vor den Schluss), ein Schluss ans Ende der Stunde. Unterrichtsschritte stehen nicht auf dem Arbeitsblatt; verschieben lassen sie sich im Ablauf.</small></div>`;
}
// Nach Erarbeitung, Vertiefung oder Transfer folgt eine Sicherung; fehlt sie, wird ein Unterrichtsschritt „Ergebnisse vergleichen“ (bei Gruppenarbeit „Ergebnisse vorstellen“) eingefügt
const SICH_AFTER = ['era', 'vert', 'trans'];
const sichAutoOn = () => !state.prefs || state.prefs.sichAuto !== false;
const sichLastOn = () => !state.prefs || state.prefs.sichLast !== false;
function blkPhs(b) {
  if (isRes(b)) return null;
  if (b.type === 'tafel') return ['sich', 'sich'];
  if (b.type === 'step') { const p = itPh(b); return p ? [p, p] : null; }
  if (b.type !== 'tasks') return null;
  const L = (b.items || []).map(it => itPh(it)).filter(Boolean); if (!L.length) return null;
  const w = L.filter(p => p !== 'ha'); return w.length ? [w[0], w[w.length - 1]] : ['ha', 'ha'];
}
function sichFill(quiet) {
  const blocks = state.sheet.blocks; let n = 0;
  for (let i = 0; i < blocks.length; i++) {
    const P = blkPhs(blocks[i]); if (!P || !SICH_AFTER.includes(P[1])) continue;
    let j = i + 1, nx = null; for (; j < blocks.length; j++) { nx = blkPhs(blocks[j]); if (nx) break; }
    if (nx && (!nx[0] || nx[0] === P[1] || nx[0] === 'sich')) continue;
    if (!nx && j < blocks.length) continue;
    const b = blocks[i]; const its = b.type === 'tasks' ? (b.items || []).filter(it => itPh(it) !== 'ha') : [b];
    const ga = its.some(it => it.soz === 'ga') || (b.type === 'tasks' && state.sheet.meta.groupsOn && its.some(it => it.grp));
    const nb = paletteBlock('step', 'step'); blocks.splice(i + 1, 0, nb); stepTplQuiet(nb, ga ? 'praes' : 'vergl'); nb.autoSich = true; n++; i++;
  }
  if (n) { changed(true); if (!quiet) toast(n === 1 ? 'Sicherung nach der Arbeitsphase eingefügt (Bereich „Stunde“)' : `${n} Sicherungen nach den Arbeitsphasen eingefügt`, 'Rückgängig', histUndo); }
  return n;
}
function stepTplQuiet(b, k) { const x = STEP_TPL[k]; if (!x) return; const du = state.sheet.meta.anrede === 'du'; Object.assign(b, { tpl: k, title: x.label, ph: x.ph, soz: x.soz, min: x.min ? String(x.min) : '', fol: x.fol, head: duSie(x.head, du), text: duSie(x.text, du), note: x.note, eh: x.eh, exit: false }); if (x.cap && !tfStr(b.cap).trim()) b.cap = x.cap; }
function stepNew(k) {
  const x = STEP_TPL[k]; if (!x) return; const blocks = state.sheet.blocks;
  let at = blocks.length; if (x.g === 'ein') { at = 0; while (at < blocks.length && blocks[at].type === 'step' && !(STEP_TPL[blocks[at].tpl] && STEP_TPL[blocks[at].tpl].g === 'end')) at++; }
  else if (x.g === 'sich') { while (at > 0 && blocks[at - 1].type === 'step' && STEP_TPL[blocks[at - 1].tpl] && STEP_TPL[blocks[at - 1].tpl].g === 'end') at--; }
  snapshot(); const nb = paletteBlock('step', 'step'); blocks.splice(at, 0, nb);
  state.sel = nb.id; if (oneCard()) state.closed = new Set(cardIds().filter(i => i !== nb.id)); else state.closed.delete(nb.id);
  stepTpl(nb, k, at, true);
  const c = $(`#editor .card[data-bid="${nb.id}"]`); if (c) c.scrollIntoView({ block: 'start', behavior: 'smooth' });
}
// Bereich „Präsentation“
// Zwischenfolien = Unterrichtsschritte, die nur in der Präsentation stehen
const ZW_KINDS = [['sichs', 'Sicherung', 'schlichte Folie „Sicherung“'], ['frei', 'Impuls oder Auftrag', 'Überschrift und Text'], ['frage', 'Stundenfrage', 'aus dem Kopf der Stunde'], ['zitat', 'Zitat', 'groß gesetzt'], ['bild', 'Bild', 'stummer Impuls'], ['video', 'Video', 'YouTube oder ARD Mediathek, läuft auf der Folie'], ['equiz', 'Quiz', 'Fragen zum Aufdecken'], ['kapitel', 'Zwischentitel', 'großer Titel'], ['vergl', 'Ergebnisse vergleichen', 'Partnerarbeit'], ['reserve', 'Reserve', 'nur, wenn Zeit bleibt']];
function zwNew(k, at) {
  const blocks = state.sheet.blocks; at = Math.max(0, Math.min(blocks.length, +at || 0));
  snapshot(); const nb = paletteBlock('step', 'step'); nb.tpl = 'frei'; blocks.splice(at, 0, nb);
  const tk = k === 'zitat' || k === 'frei' || k === 'video' ? 'frei' : k === 'bild' ? 'impuls' : k; stepTpl(nb, tk, at, true);
  if (k === 'zitat') Object.assign(nb, { fol: 'zitat', title: 'Zitat' }); if (k === 'video') Object.assign(nb, { fol: 'video', title: 'Video' }); if (k === 'frei') nb.title = 'Impuls';
  state.zwAt = null; state.zwOpen = (k === 'sichs' || k === 'kapitel' || k === 'vergl' || k === 'reserve' || k === 'frage') ? null : nb.id; changed(true);
  toast(`Zwischenfolie „${ZW_KINDS.find(x => x[0] === k)[1]}“ eingefügt`, 'Rückgängig', histUndo);
}
const presRowOK = b => b.type === 'step' || (b.type === 'tasks' && (b.items || []).some(it => tfStr(it.text).trim())) || PRES_OPT.has(b.type);
function fmInsHTML(at) {
  if (state.zwAt === at) return `<div class="fm-pal" data-at="${at}"><div class="fm-pal-h"><b>Zwischenfolie einfügen</b><button type="button" class="ib" data-act="zw-close" title="Schließen">${I.x}</button></div><div class="fm-pal-g">${ZW_KINDS.map(([k, l, d]) => `<button type="button" data-act="zw-add" data-k="${k}" data-at="${at}"><b>${l}</b><small>${d}</small></button>`).join('')}</div></div>`;
  return `<div class="fm-ins"><button type="button" data-act="zw-ins" data-at="${at}" title="Hier eine Folie einfügen, die nur in der Präsentation steht">+ Zwischenfolie</button></div>`;
}
function fmRowHTML(b, i, num, PL) {
  const st = b.type === 'step', tk = b.type === 'tasks', opt = PRES_OPT.has(b.type); const open = st && state.zwOpen === b.id;
  const offSl = st ? !stepSlideFol(b) : opt ? !presOn(b) : false;
  const lab = st ? stepLabel(b) : summary(b, num).replace(/ · \d+ Min\.( · Timer)?$/, '');
  const x = PL && PL.at[b.id]; const late = x && Number.isFinite(x.until) && x.to > x.until + 0.01;
  const timed = st || tk;
  return `<div class="fm-row${st ? ' zw' : ''}${offSl ? ' off' : ''}${open ? ' open' : ''}" data-bid="${b.id}">
    <div class="fm-t"><span class="fm-ic">${typeIcon(iconKey(b))}</span><span class="fm-l"><small>${st ? 'Zwischenfolie' : esc(typeLabel(b))}${isRes(b) ? ' · Reserve' : ''}</small><b>${esc(lab || typeLabel(b))}</b></span>
</div>
    <div class="fm-c">${phSelHTML(b)}${minInHTML(b)}${timed ? `<label class="fm-until" title="Feste Uhrzeit, zu der dieser Teil fertig sein muss (optional)"><small>bis</small><input type="time" data-k="until" value="${esc(hmOk(b.until))}" aria-label="Fertig bis"></label><select data-k="timer" aria-label="Timer"><option value=""${!b.timer ? ' selected' : ''}>kein Timer</option><option value="klick"${b.timer === 'klick' ? ' selected' : ''}>Timer per Klick</option><option value="auto"${b.timer === 'auto' ? ' selected' : ''}>Timer mit der Folie</option></select>` : ''}${x ? `<small class="pt-plan${late ? ' late' : ''}">${hmFmt(x.from)}–${hmFmt(x.to)}</small>` : ''}<span class="fm-acts">${opt ? presBtn(b) : ''}${st ? `<button type="button" class="btn sm" data-act="zw-open" aria-expanded="${open}">${open ? 'Fertig' : 'Bearbeiten'}</button><button type="button" class="ib" data-act="del" title="Zwischenfolie löschen" aria-label="Löschen">${I.x}</button>` : `<button type="button" class="link" data-act="area-go" data-area="blatt" data-bid="${b.id}" data-abk="${state.sheet.abActive || 0}" title="Im Arbeitsblatt bearbeiten">Bearbeiten</button>`}
<span class="fm-mv"><button class="ib" type="button" data-act="up" title="Früher"${i === 0 ? ' disabled' : ''}>${I.up}</button><button class="ib" type="button" data-act="down" title="Später"${i === state.sheet.blocks.length - 1 ? ' disabled' : ''}>${I.down}</button></span></span></div>
    ${open ? `<div class="fm-ed">${cardHTML(b, i, num, { drag: false })}</div>` : ''}</div>`;
}
function presEditorHTML() {
  const blocks = state.sheet.blocks; const num = numbering(state.sheet); const PL = stPlan(); const m = state.sheet.meta;
  const offT = new Set(m.presOff || []).has('title');
  let list = `<div class="fm-row fm-title${offT ? ' off' : ''}"><div class="fm-t"><span class="fm-ic">${areaIc('pres')}</span><span class="fm-l"><small>Titelfolie</small><b>${esc(plainText(m.title || '') || 'Titel der Stunde')}</b></span><label class="chk fm-chk"><input type="checkbox" data-prk="title"${offT ? '' : ' checked'}><span>zeigen</span></label></div></div>`;
  let any = false;
  blocks.forEach((b, i) => { if (!presRowOK(b)) return; list += fmInsHTML(i) + fmRowHTML(b, i, num, PL); any = true; });
  list += fmInsHTML(blocks.length);
  const planNote = PL ? `<small class="hint pt-note">Stunde ${hmFmt(PL.s0)}–${hmFmt(PL.end)} Uhr · geplant ${PL.total} von ${PL.end - PL.s0} Min.${PL.total > PL.end - PL.s0 ? ' · <b class="late">' + (PL.total - (PL.end - PL.s0)) + ' Min. zu viel</b>' : ''}</small>` : '';
  const fine = state.fmtOpen.has('fmfine');
  if (!state.stInit) { state.stInit = true; state.closed.add('stunde'); }
  return `<div class="fm-top"><button class="btn primary" type="button" data-act="pres-go">Präsentieren</button><div class="seg sm" role="group" aria-label="Ansicht beim Präsentieren" title="Wird je Klasse gemerkt">${[['folien', 'Folien'], ['tafel', 'Tafel']].map(([v, t]) => `<button type="button" data-act="pres-mode" data-v="${v}" aria-pressed="${presModeOf(state.sheet.klasse) === v}">${t}</button>`).join('')}</div><button class="btn" type="button" data-act="pres-pptx">PowerPoint</button>${fotoOK() ? '<button class="btn" type="button" data-act="fotos" title="Fotos vom iPad oder Handy zu dieser Stunde">📷 Fotos</button>' : ''}<button class="btn" type="button" data-act="settings" data-tab="pres" title="Phasenleiste, Timergröße, Uhrzeit, Sicherungen">Folien-Einstellungen</button></div>
    ${(state.sheet.abs ? abBarHTML() : '') + (isBasis() ? '' : stundeCard())}
    <div class="fm"><div class="fm-h"><b>Folien</b><small>In der Reihenfolge der Stunde. Mit „+ Zwischenfolie“ fügst du Folien ein, die nur in der Präsentation stehen. Phase und Zeit trägst du direkt ein.</small>${planNote}</div>${list}
      ${any ? '' : '<small class="hint">Noch keine Aufgaben auf dem Arbeitsblatt.</small>'}
      <button class="link fm-fine-b" type="button" data-act="sub-toggle" data-key="fmfine" aria-expanded="${fine}">${fine ? '▾' : '▸'} Einzelne Folien an- und abwählen</button>${fine ? `<div class="fm-fine">${presPickHTML()}</div>` : ''}
      <button class="link" type="button" data-act="sich-fill">Fehlende Sicherungen ergänzen</button></div>`;
}
function presEditorHTMLalt() {
  const blocks = state.sheet.blocks; const num = numbering(state.sheet);
  const rows = blocks.filter(b => (b.type === 'tasks' && (b.items || []).some(it => tfStr(it.text).trim())) || b.type === 'step');
  const tl = { '': 'kein Timer', klick: 'per Klick', auto: 'mit der Folie' }; const PL = stPlan();
  const planNote = PL ? `<small class="hint pt-note">Stunde ${hmFmt(PL.s0)}–${hmFmt(PL.end)} Uhr · geplant ${PL.total} von ${PL.end - PL.s0} Min. · Dauer oder „fertig bis“ eintragen, das andere wird ergänzt${PL.total > PL.end - PL.s0 ? ' · <b class="late">' + (PL.total - (PL.end - PL.s0)) + ' Min. zu viel</b>' : ''}${uhrOn() ? ' · Timer laufen nach der Uhr' : ''}</small>` : '<small class="hint pt-note">Mit Beginn oder Zeitfenster (Bereich „Stunde“) richten sich die Timer nach der Uhr.</small>';
  return `<div class="card pres-ed"><div class="card-b">
      <div class="tf-ed-acts main"><button class="btn primary" type="button" data-act="pres-go">Präsentieren</button><button class="btn" type="button" data-act="pres-pptx">PowerPoint erstellen</button></div>
      <small class="hint">Im Browser: Pfeiltasten oder Klick blättern, T startet den Timer, H zeigt Tipps, E die Erwartung, Esc beendet. Läuft ein Timer, fragt die Präsentation nach, bevor er abgebrochen wird. Rechts ein Klick auf eine Folie startet dort.</small>
    </div></div>
    <div class="card pres-ed"><div class="card-b"><div class="f"><span>Zeit und Timer${state.sheet.abs ? ' · ' + esc(abLabel(state.sheet.meta, state.sheet.abActive || 0)) : ''}</span>${planNote}${rows.length ? `<div class="pt-list">${rows.map(b => `<div class="pt-row" data-bid="${b.id}"><span class="pt-l"><i>${typeIcon(iconKey(b))}</i><span>${esc(b.type === 'step' ? stepLabel(b) : summary(b, num).replace(/ · \d+ Min\.( · Timer)?$/, ''))}</span></span><span class="pt-min"><input type="text" inputmode="numeric" maxlength="3" data-k="min" value="${esc(itMin(b) || '')}" placeholder="–" aria-label="Minuten"><small>Min.</small></span><label class="pt-until" title="Feste Uhrzeit, zu der dieser Teil spätestens fertig sein muss (optional)"><small>fertig bis</small><input type="time" data-k="until" value="${esc(hmOk(b.until))}" aria-label="Fertig bis"></label>${(() => { const x = PL && PL.at[b.id]; if (!x) return ''; const late = Number.isFinite(x.until) && x.to > x.until + 0.01; return `<small class="pt-plan${late ? ' late' : ''}" title="${late ? 'Passt nicht: nach Plan erst um ' + hmFmt(x.to) + ' fertig' : 'Geplante Uhrzeit'}">${hmFmt(x.from)}–${hmFmt(x.to)}</small>`; })()}<div class="seg sm" role="group" aria-label="Timer">${TIMER_OPTS.map(([v]) => `<button type="button" data-act="tm-set" data-v="${v}" aria-pressed="${(b.timer || '') === v}">${tl[v]}</button>`).join('')}</div></div>`).join('')}</div>` : '<small class="hint">Noch keine Aufgaben oder Unterrichtsschritte.</small>'}</div></div></div>
    <div class="card pres-ed"><div class="card-b">${presPickHTML()}</div></div>`;
}
function presPickChange(t) {
  if (!t.dataset) return false;
  if (t.dataset.prph != null) { state.sheet.meta.presPhase = !!t.checked; changed(false); return true; }
  if (t.dataset.prk == null) return false;
  const m = state.sheet.meta; const k = t.dataset.prk; const off = new Set(Array.isArray(m.presOff) ? m.presOff : []);
  if (t.dataset.prb) { const bb = stBlocks().find(x => x.id === t.dataset.prb); if (bb) { if (t.checked) bb.pres = true; else delete bb.pres; } off.delete(k); } else if (t.checked) off.delete(k); else off.add(k);
  m.presOff = [...off]; changed(false);
  const L = presPick(); document.querySelectorAll('#pr-pick-n').forEach(nEl => { nEl.textContent = `${L.filter(x => (x.opt ? presOn(x.opt) : true) && !off.has(x.key)).length} von ${L.length} ausgewählt`; }); return true;
}
// Vorschau rechts: Verlaufsplan und Folien
function renderVPPreview(host) {
  const P = state.sheet, m = P.meta, vp = vpOf();
  host.innerHTML = `<div class="vp-paper"><div class="vp-ph"><b>Verlaufsplan</b><span>${esc(stTitle(P))}${vp.datum ? ' · ' + esc(vp.datum) : ''}${vp.start ? ' · Beginn ' + esc(vp.start) : ''}</span></div>${tfStr(vp.ziel).trim() ? `<p class="vp-z"><b>Stundenziel:</b> ${inlineHTML(vp.ziel)}</p>` : ''}${tfStr(m.frage).trim() ? `<p class="vp-z"><b>Stundenfrage:</b> „${inlineHTML(m.frage)}“</p>` : ''}${vpTableHTML()}</div>`;
}
