/* ================= Verlaufsplan: aus Phase, Zeit, Sozialform, Auftrag und Erwartung der Aufgaben ================= */
const vpOf = () => { const m = state.sheet.meta; if (!m.vp || typeof m.vp !== 'object') m.vp = {}; return m.vp; };
const vpClock = (start, min) => { const t = /^(\d{1,2})[:.](\d{2})$/.exec(String(start || '').trim()); if (!t) return null; const x = (+t[1]) * 60 + (+t[2]) + min; return `${String(Math.floor(x / 60) % 24).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`; };
function vpRows() {
  const P = state.sheet; const multi = !!P.abs; const v = { ...sheetView(), lehrer: true, grp: 'all', pres: true };
  const SB = stBlocks(); const tafel = SB.filter(b => b.type === 'tafel' && blockVisible(b, v)); const a3 = SB.filter(b => b.type === 'a3');
  const rows = []; let imp = null;
  stABs().forEach(A => withAB(A.k, () => {
    const sh = state.sheet, m = sh.meta; const tags = matTags(sh.blocks); const mats = sh.blocks.filter(b => tags[b.id]); const ab = abLabel(m, A.k); const abLab = multi ? ab : '';
    let t = 0, firstTask = -1; const TN = {};
    sh.blocks.forEach((b, bi) => {
      if (b.type === 'step') { if (blockVisible(b, v)) rows.push({ ...stepRow(b, tafel), res: isRes(b) }); return; }
      if (b.type !== 'tasks' || !blockVisible(b, v)) return; t = tnAt(b, t, TN); if (firstTask < 0) firstTask = bi;
      const idx = b.items.map((it, i) => (itOk(it, v) ? i : -1)).filter(i => i >= 0);
      const ITb = itemsFor(b, v); const bRows = []; const allHa = ITb.length > 0 && ITb.every(it => itPh(it) === 'ha'); const bgs = [...new Set(ITb.map(it => itGrp(b, it, m)))]; const bg = bgs.length === 1 ? bgs[0] : '';
      ITb.forEach((it, k) => {
        const fo = itFo(it); if (itCnt(b, it, m)) t++; if (!tfStr(it.text).trim()) return; const ph = itPh(it); const plain = plainText(it.text);
        const refs = [...new Set((plain.match(/\b(?:M|Q|D)\s?\d+\b|\bAbb\.\s?\d+\b/g) || []).map(x => x.replace(/\s+/g, '')))];
        const media = fo ? ['Folie', ...(refs.length ? [`${ab} (${refs.join(', ')})`] : [])] : [refs.length ? `${ab} (${refs.join(', ')})` : mats.length === 1 ? `${ab} (${tags[mats[0].id]})` : ab];
        if (ph === 'sich') tafel.forEach(x => media.push('Tafelbild' + (tfStr(x.title).trim() ? ': ' + tfStrip(x.title) : '')));
        a3.filter(x => x.taskRef === b.id + ':' + idx[k]).forEach(x => media.push(A3_TPL[a3Tpl(x)].label + ' (A3)'));
        if (tipsOf(it).length) media.push(`Tippkarten (${tipsOf(it).length})`);
        if (!fo && m.dg && m.dg.id && (it.soz === 'ea' || it.soz === 'pa' || it.soz === 'tps')) media.push('digitale Fassung (Tablet)');
        const g = itGrp(b, it, m);
        bRows.push({ no: fo || itRkN(it, m) ? 0 : t, fo, abLab, it, ph, min: 0, soz: SOZ[it.soz] ? SOZ[it.soz].label : '', task: taskText(it, m), eh: ehLines(it), media, tag: it.tag || '', g: isRes(b) ? '' : bg, res: isRes(b), gName: g ? grpName(m, g) : '', blk: b.id, isHa: allHa });
      });
      if (bRows.length) { bRows[0].min = itMin(b); bRows[0].span = bRows.length; bRows.slice(1).forEach(r => { r.cont = true; r.head = bRows[0]; }); bRows.forEach(r => rows.push(r)); }
    });
    if (A.k === 0 && !imp) imp = sh.blocks.find((b, bi) => (b.type === 'quote' && plainText(b.text || '').trim() || b.type === 'image' && b.src) && (firstTask < 0 || bi < firstTask)) || null;
  }));
  // Einstieg mit Zitat oder Bild, wenn keine Aufgabe dafür vorgesehen ist
  if (!rows.some(r => r.ph === 'ein') && imp) rows.unshift({ auto: true, ph: 'ein', min: 0, soz: 'Plenum', task: imp.type === 'quote' ? `Impuls: Zitat „${plainText(imp.text).slice(0, 120)}“${imp.author ? ' (' + plainText(imp.author) + ')' : ''}; Schülerinnen und Schüler äußern erste Eindrücke.` : `Impuls: ${plainText(imp.caption || 'Bild')}; Schülerinnen und Schüler beschreiben und deuten.`, eh: [], media: [imp.type === 'quote' ? 'Zitat (Beamer oder Tafel)' : 'Bild (Beamer)'] });
  // Sicherung am Tafelbild, wenn keine Aufgabe dafür vorgesehen ist
  if (tafel.length && !rows.some(r => r.ph === 'sich')) rows.push({ auto: true, ph: 'sich', min: 0, soz: 'Plenum', task: 'Ergebnisse werden im Unterrichtsgespräch gesichert.', eh: [], media: tafel.map(x => 'Tafelbild' + (tfStr(x.title).trim() ? ': ' + tfStrip(x.title) : '')) });
  const isHa = r => (r.blk ? r.isHa : r.ph === 'ha'); const main = rows.filter(r => !isHa(r) && !r.res), resv = rows.filter(r => !isHa(r) && r.res), ha = rows.filter(isHa);
  let c = 0, run = null; const start = vpOf().start;
  // Aufgaben verschiedener Gruppen direkt nacheinander laufen parallel und beginnen gleichzeitig
  main.forEach((r, i) => {
    if (r.cont) { r.from = r.head.from; r.to = r.head.to; r.clock = r.head.clock; r.par = r.head.par; return; }
    if (r.g) {
      if (!run) run = { start: c, acc: {}, end: c, rows: [] };
      r.from = run.start + (run.acc[r.g] || 0); r.to = r.from + (r.min || 0); run.acc[r.g] = r.to - run.start; run.end = Math.max(run.end, r.to); run.rows.push(r);
      let jn = i + 1; while (jn < main.length && main[jn].cont) jn++; const nx = main[jn]; if (!nx || !nx.g) { if (Object.keys(run.acc).length > 1) run.rows.forEach(x => { x.par = true; }); c = run.end; run = null; }
    } else { r.from = c; c += r.min || 0; r.to = c; }
    r.clock = vpClock(start, r.from) ? `${vpClock(start, r.from)}–${vpClock(start, r.to)}` : '';
  });
  return { rows: main.concat(resv, ha), total: c, len: Number(state.sheet.meta.lesson) || 45 };
}
const vpHa = r => (r.blk ? r.isHa : r.ph === 'ha');
const vpTime = r => vpHa(r) ? 'HA' : r.res ? 'Reserve' : r.min ? (r.clock || `${r.from}–${r.to}`) : '';
function vpTableHTML() {
  const R = vpRows(); if (!R.rows.length) return '<p class="hint">Noch keine Aufgaben. Der Verlaufsplan entsteht aus den Aufgaben des Blatts.</p>';
  return `<div class="vp-wrap"><table class="vp-tbl"><thead><tr><th>Zeit</th><th>Phase</th><th>Unterrichtsgeschehen</th><th>Erwartetes Schülerverhalten</th><th>Sozialform</th><th>Medien</th></tr></thead><tbody>${R.rows.map(r => `<tr class="${r.auto ? 'auto' : ''}">${r.cont ? '' : `<td${r.span > 1 ? ` rowspan="${r.span}"` : ''}><b>${esc(vpTime(r))}</b>${r.min && !vpHa(r) ? `<small>${r.min} Min.${r.par ? ' · parallel' : ''}${r.span > 1 ? ` · ${r.span} Aufgaben` : ''}</small>` : ''}</td>`}<td style="--phc:${r.ph ? PHASEN[r.ph].c : '#B7BCC6'}" class="ph">${r.ph ? PHASEN[r.ph].label : '<span class="miss">ohne Phase</span>'}</td><td>${r.no ? `<b>${r.abLab ? esc(r.abLab) + ', ' : ''}Aufgabe ${r.no}${r.gName ? ' · ' + esc(r.gName) : ''}${r.tag ? ' · ' + esc(r.tag) : ''}:</b> ` : r.fo ? `<b>Auftrag (Folie)${r.gName ? ' · ' + esc(r.gName) : ''}${r.tag ? ' · ' + esc(r.tag) : ''}:</b> ` : r.step ? `<b>${esc(r.label)}:</b> ` : ''}${inlineHTML(tfStr(r.task).replace(/\n+/g, ' '))}</td><td>${r.eh.length ? `<ul>${r.eh.map(x => `<li>${inlineHTML(x)}</li>`).join('')}</ul>` : '<span class="miss">noch keine Erwartung</span>'}</td><td>${esc(r.soz)}</td><td>${r.media.map(esc).join('<br>')}</td></tr>`).join('')}</tbody></table></div>
    <p class="vp-sum">${R.total} von ${R.len} Minuten verplant${R.total > R.len ? ` · <b class="warn">${R.total - R.len} Min. zu viel</b>` : ''}${R.rows.some(r => !r.cont && !vpHa(r) && !r.min) ? ' · nicht alle Schritte haben eine Zeit' : ''}${R.rows.some(r => r.auto) ? ' · kursive Zeilen sind ergänzt' : ''}</p>`;
}
function vpHTML() {
  const m = state.sheet.meta, vp = vpOf();
  return `<h2 id="dlg-t">Verlaufsplan</h2>
    <p class="rlp-stat">Entsteht aus Phase, Zeit, Sozialform, Arbeitsauftrag und Erwartung der Aufgaben. Phase und Zeit trägst du neben den Sozialformen jeder Aufgabe ein; in Word lässt sich alles weiter bearbeiten.</p>
    <div class="row vp-meta"><label class="f"><span>Datum</span><input type="text" data-vp="datum" value="${esc(vp.datum || '')}" placeholder="z. B. 12.11.2026"></label><label class="f narrow"><span>Beginn</span><input type="text" data-vp="start" value="${esc(vp.start || '')}" placeholder="08:00"></label><label class="f narrow"><span>Länge</span><select data-vp="lesson">${[45, 60, 75, 90, 135].map(n => `<option value="${n}"${n === (Number(m.lesson) || 45) ? ' selected' : ''}>${n} Min.</option>`).join('')}</select></label></div>
    <label class="f"><span>Stundenziel</span><textarea data-vp="ziel" rows="2" placeholder="Die Schülerinnen und Schüler …">${esc(vp.ziel || '')}</textarea></label>
    <label class="f"><span>Stundenfrage</span><input type="text" data-vp="frage" value="${esc(tfStr(m.frage))}" placeholder="optional, z. B. Wie erzeugen Politikerinnen und Politiker in sozialen Medien Nähe?"></label>
    <div id="vp-prev">${vpTableHTML()}</div>
    <div class="row"><button class="btn primary" type="button" data-act="vp-docx">Als Word speichern</button><button class="btn" type="button" data-act="vp-print">Drucken oder als PDF</button><button class="btn" type="button" data-act="dlg-close">Schließen</button></div>`;
}
function openVP() { state.dlg = { mode: 'vp' }; renderDlg(); }
// Drucken bzw. „Als PDF speichern“ über den Druckdialog des Browsers (Querformat)
function vpPrint() {
  const m = state.sheet.meta, vp = vpOf(); const css = [...document.styleSheets].length ? '' : '';
  const head = `<h1>Verlaufsplan</h1><p class="m">${esc(stTitle(state.sheet))}${vp.datum ? ' · ' + esc(vp.datum) : ''}${vp.start ? ' · Beginn ' + esc(vp.start) : ''} · ${Number(m.lesson) || 45} Minuten · ${esc(KL(state.sheet.klasse).course || KL(state.sheet.klasse).label || '')}</p>${vp.ziel ? `<p><b>Stundenziel:</b> ${esc(vp.ziel)}</p>` : ''}${tfStr(m.frage).trim() ? `<p><b>Stundenfrage:</b> ${esc(tfStrip(m.frage))}</p>` : ''}`;
  const doc = `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Verlaufsplan</title><style>@page{size:A4 landscape;margin:14mm}body{font:10.5pt/1.35 system-ui,-apple-system,'Segoe UI',sans-serif;color:#111;margin:0}h1{font-size:16pt;margin:0 0 2mm}.m{color:#555;margin:0 0 3mm}p{margin:0 0 2mm}.vp-wrap{overflow:visible}table{border-collapse:collapse;width:100%;margin-top:3mm}th{background:#2B45B8;color:#fff;text-align:left;padding:4px 6px;font-size:9.5pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}td{border:1px solid #c9ced8;padding:4px 6px;vertical-align:top}td small{display:block;color:#555}tr{break-inside:avoid}</style></head><body>${head}${vpTableHTML()}</body></html>`;
  const f = document.createElement('iframe'); f.setAttribute('aria-hidden', 'true'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  document.body.appendChild(f); const w = f.contentWindow; w.document.open(); w.document.write(doc); w.document.close();
  setTimeout(() => { try { w.focus(); w.print(); } catch { toast('Drucken ist hier nicht möglich – bitte „Als Word speichern“ nutzen.'); } setTimeout(() => f.remove(), 60000); }, 300);
}
async function exportVP() {
  if (busy) return; busy = true;
  try {
    overlay('Verlaufsplan wird erstellt …'); await loadScript(LIBS.zip);
    const sh = state.sheet, m = sh.meta, vp = vpOf(); const R = vpRows(); const acc = ACCENTS[m.accent] || ACCENTS.tinte; const A = acc.c.slice(1).toUpperCase(), GREY = '5A606E';
    const PW = TW(267); const ws = [22, 27, 80, 72, 24, 42].map(TW);
    const bd = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(x => LINE(x, 4, 'B7BCC6')).join('');
    const cell = (xml, w, o = {}) => xtc(xml || xp(''), { w, ...o });
    const P = (runs, o = {}) => xp(runs, { line: 252, ...o });
    const parts = [];
    parts.push(P(xr('Unterrichtsverlaufsplan', { b: 1, sz: 30, color: A }), { after: 80 }));
    const multiV = !!sh.abs; const abList = stABs().map(x => abLabel(x.meta, x.k) + ': ' + plainText(x.meta.title || ''));
    const info = [['Thema der Stunde', multiV ? stTitle(sh) : [m.title, m.topic].filter(Boolean).map(x => plainText(x)).join(' – ')], ['Lerngruppe', [m.course, KL(sh.klasse).label].filter(Boolean).join(' · ')], ['Schule', m.school || ''], ['Datum', vp.datum || ''], ['Zeit', `${vp.start ? vp.start + ' Uhr, ' : ''}${R.len} Minuten`], ['Material', multiV ? abList.join('; ') : [m.nr ? 'AB ' + m.nr : '', plainText(m.title || '')].filter(Boolean).join(': ')]];
    const iw = [TW(45), PW - TW(45)];
    parts.push(xtbl(iw, info.map(([k, x]) => xtr(cell(P(xr(k, { b: 1, sz: 19, color: GREY })), iw[0]) + cell(P(xr(x || ' ', { sz: 19 })), iw[1]), { cant: 1 })).join(''), NOB));
    parts.push(P('', { after: 60 }));
    parts.push(P(xr('Stundenziel', { b: 1, sz: 21, color: A }), { before: 60, after: 30, keepNext: true }));
    parts.push(vp.ziel ? xpRich(vp.ziel, { sz: 20 }, { gap: 40 }) : P(xr(' '.repeat(120), { sz: 20, u: 1 })));
    if (tfStr(m.frage).trim()) { parts.push(P(xr('Stundenfrage', { b: 1, sz: 21, color: A }), { before: 120, after: 30, keepNext: true })); parts.push(P(xr('„' + plainText(m.frage).trim() + '“', { sz: 20, i: 1 }))); }
    const ids = rlpSheetIds(sh);
    if (ids.length) { parts.push(P(xr('Bezug zum Rahmenlehrplan', { b: 1, sz: 21, color: A }), { before: 120, after: 30, keepNext: true })); ids.forEach(id => { const x = rlpInfo(id); parts.push(P((x.own ? '' : xr(x.code + '  ', { b: 1, sz: 18 })) + xr(x.t, { sz: 18 }), { after: 20, ind: `<w:ind w:left="${TW(4)}" w:hanging="${TW(4)}"/>` })); }); }
    parts.push(P('', { after: 80 }));
    const hd = ['Zeit', 'Phase', 'Unterrichtsgeschehen', 'Erwartetes Schülerverhalten', 'Sozialform', 'Medien'];
    const head = xtr(hd.map((h, i) => cell(P(xr(h, { b: 1, sz: 18, color: 'FFFFFF' })), ws[i], { shd: A })).join(''), { header: 1, cant: 1 });
    const body = R.rows.map(r => {
      const ital = r.auto ? { i: 1 } : {};
      const c0 = r.cont ? P('') : P(xr(vpTime(r), { b: 1, sz: 18 })) + (r.min && !vpHa(r) ? P(xr(r.min + ' Min.' + (r.par ? ' · parallel' : '') + (r.span > 1 ? ` · ${r.span} Aufgaben` : ''), { sz: 16, color: GREY })) : '');
      const c1 = P(xr(r.ph ? PHASEN[r.ph].label : 'ohne Phase', { b: 1, sz: 18, color: r.ph ? PHASEN[r.ph].c.slice(1) : GREY }));
      const c2 = P((r.no ? xr(`${r.abLab ? r.abLab + ', ' : ''}Aufgabe ${r.no}${r.gName ? ' · ' + r.gName : ''}${r.tag ? ' · ' + r.tag : ''}: `, { b: 1, sz: 18, ...ital }) : r.fo ? xr(`Auftrag (Folie)${r.gName ? ' · ' + r.gName : ''}${r.tag ? ' · ' + r.tag : ''}: `, { b: 1, sz: 18, ...ital }) : r.step ? xr(r.label + ': ', { b: 1, sz: 18 }) : '') + xrInline(tfStr(r.task).replace(/\n+/g, ' '), { sz: 18, ...ital }));
      const c3 = r.eh.length ? r.eh.map(x => P(xr('–', { sz: 18, color: A }) + '<w:r><w:tab/></w:r>' + xrInline(x, { sz: 18 }), { ind: `<w:ind w:left="${TW(3.5)}" w:hanging="${TW(3.5)}"/>`, after: 20 })).join('') : P('');
      const c4 = P(xr(r.soz || ' ', { sz: 18 }));
      const c5 = r.media.map(x => P(xr(x, { sz: 17 }), { after: 10 })).join('') || P('');
      return xtr([c0, c1, c2, c3, c4, c5].map((x, i) => cell(x, ws[i], { ...(i === 1 && r.ph ? { shd: mixHex(PHASEN[r.ph].c, .88).slice(1) } : {}), ...(i === 0 && r.span > 1 ? { vm: 'restart' } : i === 0 && r.cont ? { vm: 'cont' } : {}) })).join(''), { cant: 1 });
    }).join('');
    const sum = xtr(cell(P(xr(`${R.total} von ${R.len} Minuten verplant` + (R.total > R.len ? ` (${R.total - R.len} Min. zu viel)` : ''), { sz: 17, color: GREY })), PW, { span: 6 }), { cant: 1 });
    parts.push(xtbl(ws, head + body + sum, bd));
    const ml = []; stABs().forEach(X => { const tags = matTags(X.blocks); X.blocks.filter(b => b.type === 'material').forEach(b => ml.push({ ab: multiV ? abLabel(X.meta, X.k) + ', ' : '', tag: tags[b.id] || 'M', b })); });
    if (ml.length) { parts.push(P(xr('Materialien', { b: 1, sz: 21, color: A }), { before: 200, after: 30, keepNext: true })); ml.forEach(({ ab, tag, b }) => parts.push(P(xr(ab + tag + '  ', { b: 1, sz: 18 }) + xrInline(b.title || 'ohne Titel', { sz: 18 }) + (b.source ? xr('  (' + plainText(b.source) + ')', { sz: 16, color: GREY }) : ''), { after: 20 }))); }
    const sect = `<w:sectPr><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="${TW(14)}" w:right="${TW(15)}" w:bottom="${TW(14)}" w:left="${TW(15)}" w:header="0" w:footer="${TW(8)}" w:gutter="0"/></w:sectPr>`;
    const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
    const XH = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    const documentXml = `${XH}<w:document ${NS}><w:body>${parts.join('')}${sect}</w:body></w:document>`;
    const stylesXml = `${XH}<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${SANS}" w:eastAsia="${SANS}" w:hAnsi="${SANS}" w:cs="${SANS}"/><w:color w:val="1C1F27"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:lang w:val="de-DE"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="252" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Standard"><w:name w:val="Normal"/><w:qFormat/></w:style><w:style w:type="table" w:default="1" w:styleId="NormaleTabelle"><w:name w:val="Normal Table"/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="57" w:type="dxa"/><w:left w:w="85" w:type="dxa"/><w:bottom w:w="57" w:type="dxa"/><w:right w:w="85" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style></w:styles>`;
    const settingsXml = `${XH}<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:defaultTabStop w:val="708"/><w:characterSpacingControl w:val="doNotCompress"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>`;
    const rels = `${XH}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdSettings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/></Relationships>`;
    const ct = `${XH}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`;
    const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    const core = `${XH}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xesc('Verlaufsplan: ' + plainText(m.title || ''))}</dc:title><dc:creator>LehrWerk</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`;
    const rootRels = `${XH}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`;
    const zip = new window.JSZip();
    zip.file('[Content_Types].xml', ct); zip.file('_rels/.rels', rootRels); zip.file('docProps/core.xml', core);
    zip.file('word/document.xml', documentXml); zip.file('word/styles.xml', stylesXml); zip.file('word/settings.xml', settingsXml); zip.file('word/_rels/document.xml.rels', rels);
    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    overlay(''); await deliver((sh.abs ? 'Stunde_' + slug(stTitle(sh)) : fileBase()) + '_Verlaufsplan.docx', blob);
  } catch (err) { console.error(err); overlay(''); toast('Der Verlaufsplan ließ sich nicht erstellen. Bitte erneut versuchen.'); }
  finally { overlay(''); busy = false; }
}
/* Bildschirm wach halten, solange präsentiert wird (Screen Wake Lock); holt die Sperre nach dem Zurückkehren ins Fenster neu */
function keepAwake(win = window, quiet = false) {
  let lock = null, off = false; const nav = win.navigator, doc = win.document;
  if (!nav || !('wakeLock' in nav)) { if (!quiet && !keepAwake.warned) { keepAwake.warned = true; toast('Dieser Browser kann den Standby nicht verhindern. In Chrome, Edge, Firefox oder Safari (aktuell) bleibt der Bildschirm an.'); } return () => {}; }
  const get = async () => { if (off || lock || doc.visibilityState !== 'visible') return; try { lock = await nav.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); if (off) { lock.release(); lock = null; } } catch {} };
  const vis = () => { if (doc.visibilityState === 'visible') get(); };
  doc.addEventListener('visibilitychange', vis); win.addEventListener('focus', vis); get();
  return () => { off = true; doc.removeEventListener('visibilitychange', vis); win.removeEventListener('focus', vis); try { if (lock) lock.release(); } catch {} lock = null; };
}
