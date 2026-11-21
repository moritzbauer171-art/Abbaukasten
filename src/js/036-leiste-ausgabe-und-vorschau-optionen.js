/* ================= Leiste: Ausgabe und Vorschau-Optionen ================= */
function segHTML(key, opts, cur, label) {
  return `<div class="seg sm" role="group" aria-label="${label}">${opts.map(([v, l]) => `<button type="button" data-pv="${key}" data-v="${v}" aria-pressed="${String(cur) === String(v)}">${l}</button>`).join('')}</div>`;
}
function renderOut() {
  const sh = state.sheet; const nT = tipCards().length; const nK = (sh.cards || []).length; const SB = stBlocks(); const nTf = SB.filter(x => x.type === 'tafel').length; const nA3 = SB.filter(x => x.type === 'a3' && a3Fmt(x) === 'a3').length; const nA4 = SB.filter(x => x.type === 'a3' && a3Fmt(x) === 'a4').length; const nE = exitSteps().length;
  const OUTS = { blatt: ['blatt', 'Arbeitsblatt', 0], tipps: ['tipps', 'Tippkarten', nT], karten: ['karten', 'Tafelkarten', nK], tafel: ['tafel', 'Tafelbild', nTf], a4: ['a4', 'A4-Vorlagen', nA4], a3: ['a3', 'A3-Vorlagen', nA3], exit: ['exit', 'Exit-Tickets', nE], vp: ['vp', 'Verlaufsplan', 0], pres: ['pres', 'Folien', 0] };
  const OL = (AREA_OUTS[state.area || 'blatt'] || AREA_OUTS.blatt).map(k => OUTS[k]).filter(([k, , n], i) => i === 0 || n || state.out === k || k === 'vp');
  $('#outsw').hidden = OL.length < 2;
  $('#outsw').innerHTML = OL
    .map(([k, l, n]) => `<button type="button" data-out="${k}" aria-pressed="${state.out === k}">${l}${n ? `<span>${n}</span>` : ''}</button>`).join('');
  let h = '';
  if (state.out === 'blatt') {
    h += segHTML('fassung', [['schueler', 'Schülerfassung'], ['lehrer', 'Lehrerfassung']], state.fassung, 'Fassung');
    if (sh.meta.groupsOn) h += segHTML('grp', [['all', 'Alle'], ...grpList(sh.meta).map(x => [x.k, esc(grpName(sh.meta, x.k))])], sheetView().grp, 'Gruppe');
    if (sh.meta.levelsOn) h += segHTML('lvl', [['all', 'Alle'], ['b', '★ Basis'], ['s', '★★ Standard'], ['e', '★★★ Experte']], state.lvl || 'all', 'Niveau');
    if (state.fassung === 'lehrer') h += '<button class="btn sm" type="button" data-pv="ehmd">Erwartungshorizont (.md)</button>';
    h += '<button class="btn sm msr-btn" type="button" data-pv="msr" title="Wort in den Materialien suchen (Strg+Umschalt+F)" aria-label="In den Materialien suchen"><svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5"/><path d="M13 13l4.5 4.5"/></svg></button>';
  }
  if (state.out === 'vp') h += '<button class="btn sm" type="button" data-pv="vp-docx">Als Word speichern</button><button class="btn sm" type="button" data-pv="st-out">Ganze Stunde ausgeben</button>';
  if (state.out === 'blatt') h += '<button class="btn sm dz-btn" type="button" data-pv="dz-page" title="Design, Farbe, Papier und Abstände"><svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2.5a7.5 7.5 0 1 0 0 15c1 0 1.5-.7 1.5-1.4 0-.9-.8-1.2-.8-2 0-.8.6-1.3 1.4-1.3h1.6a3.8 3.8 0 0 0 3.8-3.8C17.5 5.5 14.2 2.5 10 2.5Z"/><circle cx="6.5" cy="9" r="1"/><circle cx="9" cy="6" r="1"/><circle cx="12.8" cy="6.6" r="1"/></svg>Aussehen</button>';
  if (state.out === 'pres') h += ppOn() ? ppRibbonHTML() : '<button class="btn sm primary" type="button" data-pv="pres">Präsentieren</button><button class="btn sm" type="button" data-pv="pptx">PowerPoint</button>';
  if (state.out === 'a3') h += segHTML('a3p', [['a3', 'A3'], ['a4x2', '2 × A4 zum Kleben']], state.a3p || 'a3', 'Papier');
  if (state.out === 'tafel') { h += segHTML('fassung', [['lehrer', 'Vollständig'], ['schueler', 'Lückenfassung']], state.fassung, 'Fassung'); if (nTf) h += '<button class="btn sm" type="button" data-pv="tfbeam">Am Beamer zeigen</button>'; }
  $('#pv-opts').innerHTML = h;
  const w = $('#btn-docx'); w.disabled = state.out !== 'blatt'; w.title = state.out === 'blatt' ? '' : 'Word gibt es nur für das Arbeitsblatt';
}
function setOut(k) {
  if (state.out === k || isBasis() && !BASIS_OUTS.includes(k)) return;
  state.out = k; if (OUT_AREA[k]) { state.area = OUT_AREA[k]; state.areaOut[state.area] = k; } closeGloss(); closeZl(); closeMenu();
  renderEditor(); $('#editor').scrollTop = 0; renderPreview();
}

