/* ================= Phase und Zeit je Aufgabe (Phasierung nach Tilman von Brand) ================= */
const PHASEN = {
  ein: { label: 'Einstieg', c: '#C2410C' },
  era: { label: 'Erarbeitung', c: '#2741B5' },
  sich: { label: 'Sicherung', c: '#1E7A46' },
  vert: { label: 'Vertiefung', c: '#7B3FB0' },
  trans: { label: 'Transfer', c: '#0E7C86' },
  refl: { label: 'Reflexion', c: '#9D2F6E' },
  ha: { label: 'Hausaufgabe', c: '#6B7280' }
};
const itMin = it => { const n = parseInt(String((it && it.min) || '').replace(/\D/g, ''), 10); return n > 0 && n < 1000 ? n : 0; };
const itPh = it => (it && PHASEN[it.ph] ? it.ph : '');
const isRes = b => !!(b && b.res);
// Alle Aufgaben des Blatts mit Nummer, Phase und Minuten
function ablaufOf(sh) {
  const rows = []; let t = 0; const TN = {}; const m = sh.meta || {};
  (sh.blocks || []).forEach(b => { if (b.type === 'step') { rows.push({ no: 0, it: b, b, ph: itPh(b), min: itMin(b), g: '', res: isRes(b) }); return; } if (b.type !== 'tasks') { if (!PHT_NO.has(b.type) && (itPh(b) || itMin(b))) rows.push({ no: 0, it: b, b, ph: itPh(b), min: itMin(b), g: '', res: false }); return; } t = tnAt(b, t, TN); const its = b.items || []; const nAb = its.filter(it => itCnt(b, it, sh.meta)).length; const n0 = nAb ? t + 1 : 0; t += nAb; if (!its.length) return;
    const phs = its.map(it => itPh(it)); const ph = phs.every(p => p === 'ha') ? 'ha' : (phs.find(p => p && p !== 'ha') || ''); const gs = [...new Set(its.map(it => itGrp(b, it, m)))];
    // Zeit eines Bausteins mit Aufgaben verschiedener Phasen: zu gleichen Teilen auf die Phasen seiner Aufgaben verteilt
    const cnt = {}; its.filter(it => ph === 'ha' || itPh(it) !== 'ha').forEach(it => { const k = itPh(it) || ''; cnt[k] = (cnt[k] || 0) + 1; });
    rows.push({ no: n0, it: b, b, ph, min: itMin(b), g: isRes(b) ? '' : gs.length === 1 ? gs[0] : '', res: isRes(b), split: Object.keys(cnt).length > 1 ? cnt : null }); });
  // Aufeinanderfolgende Aufgaben verschiedener Gruppen laufen parallel: gezählt wird nur die längste Gruppe
  for (let i = 0; i < rows.length;) {
    if (!rows[i].g) { i++; continue; }
    let j = i; const acc = {}; while (j < rows.length && rows[j].g) { acc[rows[j].g] = (acc[rows[j].g] || 0) + rows[j].min; j++; }
    const keys = Object.keys(acc); if (keys.length > 1) { const best = keys.reduce((a, k) => (acc[k] > acc[a] ? k : a), keys[0]); for (let x = i; x < j; x++) if (rows[x].g !== best) rows[x].par = true; }
    i = j;
  }
  const by = {}; Object.keys(PHASEN).forEach(k => (by[k] = 0)); let open = 0, none = 0;
  rows.forEach(r => { if (r.res) return; const mn = r.par ? 0 : r.min; if (r.split) { const n = Object.values(r.split).reduce((a, x) => a + x, 0); Object.entries(r.split).forEach(([k, x]) => { if (k) by[k] += mn * x / n; else open += mn * x / n; }); } else if (r.ph) by[r.ph] += mn; else open += mn; if (!r.min && r.ph !== 'ha') none++; });
  const total = rows.reduce((a, r) => a + (r.ph === 'ha' || r.par || r.res ? 0 : r.min), 0);
  const res = rows.reduce((a, r) => a + (r.res ? r.min : 0), 0);
  return { rows, by, open, none, total, res, any: rows.some(r => !r.res && (r.ph || r.min)) };
}
function ablaufHTML() {
  const sh = state.sheet, m = sh.meta; const A = ablaufOf({ meta: m, blocks: stBlocks() }); const L0 = Number(m.lesson) || 45;
  if (!A.any) return `<div class="f abl-sum"><span>Stundenablauf</span><div class="abl-tot"><b>0 von</b><select data-k="lesson" aria-label="Länge der Stunde">${[...new Set([45, 60, 75, 90, 135, L0])].sort((a, b) => a - b).map(n => `<option value="${n}"${n === L0 ? ' selected' : ''}>${n}</option>`).join('')}</select><b>Min.</b><small>Zeiten trägst du an den Aufgaben-Bausteinen und Unterrichtsschritten ein.</small></div></div>`;
  const L = Number(m.lesson) || 45; const base = Math.max(L, A.total) || 1;
  const segs = Object.entries(PHASEN).filter(([k]) => k !== 'ha' && A.by[k]).map(([k, x]) => `<i style="width:${(A.by[k] / base * 100).toFixed(2)}%;background:${x.c}" title="${x.label}: ${Math.round(A.by[k])} Min."></i>`).join('')
    + (A.open ? `<i style="width:${(A.open / base * 100).toFixed(2)}%;background:#B7BCC6" title="ohne Phase: ${Math.round(A.open)} Min."></i>` : '');
  const parts = Object.entries(PHASEN).filter(([k]) => k !== 'ha' && A.by[k]).map(([k, x]) => `<span><b style="background:${x.c}"></b>${x.label} ${Math.round(A.by[k])}</span>`);
  if (A.open) parts.push(`<span><b style="background:#B7BCC6"></b>ohne Phase ${Math.round(A.open)}</span>`);
  const diff = A.total - L;
  const st = diff > 0 ? `<em class="warn">${diff} Min. zu viel</em>` : diff < 0 ? `<em>${-diff} Min. frei</em>` : '<em class="ok">passt genau</em>';
  return `<div class="f abl-sum"><span>Stundenablauf</span>
    <div class="abl-bar" style="--fill:${Math.min(100, L / base * 100).toFixed(2)}%">${segs}</div>
    <div class="abl-leg">${parts.join('')}</div>
    <div class="abl-tot"><b>${A.total} von</b><select data-k="lesson" aria-label="Länge der Stunde">${[...new Set([45, 60, 75, 90, 135, L])].sort((a, b) => a - b).map(n => `<option value="${n}"${n === L ? ' selected' : ''}>${n}</option>`).join('')}</select><b>Min.</b>${st}${A.by.ha ? `<small>+ Hausaufgabe ${A.by.ha} Min.</small>` : ''}${A.res ? `<small>+ Reserve ${A.res} Min. (nicht mitgezählt)</small>` : ''}${A.none ? `<small>${A.none} ${A.none === 1 ? 'Baustein' : 'Bausteine'} ohne Zeit</small>` : ''}</div></div>`;
}
// Zeit gilt für den ganzen Aufgaben-Baustein (b.min); Timer beim Präsentieren: b.timer = '' | 'klick' | 'auto'
const TIMER_OPTS = [['', 'aus'], ['klick', 'Start per Klick'], ['auto', 'startet mit der Folie']];
const timeCtl = (b, label) => `<div class="row tm-row${b.type === 'tasks' ? ' x-pro' + (itMin(b) || b.timer ? ' used' : '') : ''}"><label class="f narrow" title="${b.type === 'tasks' ? 'Bearbeitungszeit für alle Aufgaben dieses Bausteins' : 'Dauer des Schritts'}"><span>${label}</span><input type="text" inputmode="numeric" maxlength="3" data-k="min" value="${esc(itMin(b) || '')}" placeholder="–"></label><label class="f narrow" title="Feste Uhrzeit, zu der dieser Teil spätestens fertig sein muss (optional)"><span>Fertig bis</span><input type="time" data-k="until" value="${esc(hmOk(b.until))}"></label><div class="f"><span>Timer beim Präsentieren</span><div class="seg sm" role="group" aria-label="Timer beim Präsentieren">${TIMER_OPTS.map(([v, l]) => `<button type="button" data-act="tm-set" data-v="${v}" aria-pressed="${(b.timer || '') === v}">${l}</button>`).join('')}</div>${b.timer && !itMin(b) ? '<small class="hint">Für den Timer bitte eine Zeit eintragen.</small>' : ''}</div><div class="f"><span>Reserve</span><button type="button" class="ck-chip res-chip${isRes(b) ? ' used' : ''}" data-act="res-tg" aria-pressed="${isRes(b)}" title="Reserve für den Fall, dass Zeit übrig bleibt: steht in der Präsentation, aber nicht in der Phasenleiste unten, zählt nicht zur Stundenzeit"><span class="cbx" aria-hidden="true"></span>Als Reserve</button></div></div>`;
// Ältere Blätter: Minuten je Aufgabe werden einmalig zur Zeit des Bausteins (parallele Gruppen zählen einmal, Hausaufgaben nur, wenn alles Hausaufgabe ist)
function minMigrate(blocks) {
  (blocks || []).forEach(b => {
    if (!b || b.type !== 'tasks' || !Array.isArray(b.items) || !b.items.some(it => it && it.min != null && String(it.min).trim() !== '')) return;
    if (!itMin(b)) {
      const allHa = b.items.every(it => itPh(it) === 'ha'); const its = b.items.filter(it => it && (allHa || itPh(it) !== 'ha')); let sum = 0;
      for (let i = 0; i < its.length;) {
        if (its[i].grp) { let j = i; const acc = {}; while (j < its.length && its[j].grp) { acc[its[j].grp] = (acc[its[j].grp] || 0) + itMin(its[j]); j++; } sum += Math.max(0, ...Object.values(acc)); i = j; }
        else { sum += itMin(its[i]); i++; }
      }
      if (sum) b.min = String(sum);
    }
    b.items.forEach(it => { if (it) delete it.min; });
  });
}
const phCtl = (i, it) => { const p = itPh(it); return `<span class="ph-ctl x-pro${p ? ' used' : ''}"><select data-k="items.${i}.ph" aria-label="Phase der Stunde" class="ph-sel${p ? ' on' : ''}"${p ? ` style="--phc:${PHASEN[p].c}"` : ''}><option value="">Phase …</option>${Object.entries(PHASEN).map(([k, x]) => `<option value="${k}"${p === k ? ' selected' : ''}>${x.label}</option>`).join('')}</select></span>`; };
