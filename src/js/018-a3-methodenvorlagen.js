/* ================= A3-Methodenvorlagen =================
   Baustein „A3-Vorlage“: steht nicht auf dem Arbeitsblatt, sondern in der Ausgabe „A3-Vorlagen“ (A3 oder zwei A4 zum Zusammenkleben). */
const A3_TPL = {
  annot: { label: 'Annotationsbogen', d: 'Text in der Mitte mit weitem Zeilenabstand, breiter Rand zum Markieren, Farblegende', o: 'q', ic: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M9 4v16M15 4v16M10.5 8h3M10.5 11h3M10.5 14h3"/>' },
  placemat: { label: 'Placemat', d: 'Felder für 3 bis 6 Personen, Aufgabe und gemeinsames Ergebnis in der Mitte', o: 'q', ic: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><rect x="8.5" y="9" width="7" height="6" rx=".8"/><path d="M3 4l5.5 5M21 4l-5.5 5M3 20l5.5-5M21 20l-5.5-5"/>' },
  schreib: { label: 'Schreibgespräch', d: 'Impuls in der Mitte, viel Platz für schriftliche Kommentare', o: 'q', ic: '<rect x="3" y="4" width="18" height="16" rx="1.5" stroke-dasharray="2 2"/><rect x="8" y="9.5" width="8" height="5" rx="1"/><path d="M5 7l2.5 2M19 17l-2.5-2"/>' },
  plakat: { label: 'Lernplakat', d: 'Für den Galeriegang: Thema, Gruppe und bis zu sechs Felder (A3 hoch)', o: 'h', ic: '<rect x="5" y="2.5" width="14" height="19" rx="1.5"/><path d="M8 6h8M7.5 9.5h4v4h-4zM12.5 9.5h4v4h-4zM7.5 15h4v4h-4zM12.5 15h4v4h-4z"/>' },
  procon: { label: 'Pro und Contra', d: 'Großer Titel, links Pro, rechts Contra, in der Mitte ein Bildfeld zum Aufdrucken oder Aufkleben, dazu Bildbeschreibung und Infotext', o: 'q', ic: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M12 7v13M5.5 9.5h3M7 8v3M15.5 9.5h3"/><rect x="9" y="11" width="6" height="5" rx=".6"/>' },
  vergleich: { label: 'Vergleichsraster', d: 'Zwei bis vier Texte oder Figuren nach Aspekten vergleichen, mit Fazit', o: 'q', ic: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M8 4v16M14.5 4v16M3 8h18M3 12h18M3 16h18"/>' },
  experte: { label: 'Expertenbogen', d: 'Gruppenpuzzle: Expertenphase, Stammgruppe und gemeinsames Ergebnis', o: 'q', ic: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M11 4v16M13 8h3.5v3.5H13zM17.5 8H21M13 13h3.5v3.5H13zM5 8h4M5 11h4"/>' },
  karten: { label: 'Karten zum Ausschneiden', d: 'Eigene Texte als Kärtchen mit Schnittlinien, 4 bis 12 pro Seite: Rollen, Stationen, Impulse, Textpuzzle', o: 'a4', ic: '<rect x="4" y="2.5" width="16" height="19" rx="1"/><path d="M12 2.5v19M4 9h16M4 15h16" stroke-dasharray="1.6 1.4"/>' },
  lernk: { label: 'Lernkarten', d: 'Begriff vorn, Erklärung hinten; zwei Seiten zum beidseitigen Drucken', o: 'a4', ic: '<rect x="3" y="6" width="13" height="10" rx="1"/><rect x="8" y="9" width="13" height="10" rx="1"/><path d="M11 13h7"/>' },
  streifen: { label: 'Satzstreifen', d: 'Sätze oder Textteile als Streifen zum Ordnen, auf Wunsch gemischt mit Lösungsbuchstaben', o: 'a4', ic: '<rect x="4" y="2.5" width="16" height="19" rx="1"/><path d="M4 7.5h16M4 12h16M4 16.5h16" stroke-dasharray="1.6 1.4"/><path d="M7 5h6M7 9.7h8M7 14.2h5"/>' },
  fotos: { label: 'Fotobogen', d: 'Ein oder mehrere Fotos, jedes beliebig oft, platzsparend auf A4 verteilt und bei Bedarf gedreht, mit Schnittlinien', o: 'a4', ic: '<rect x="4" y="2.5" width="16" height="19" rx="1"/><path d="M12 2.5v19M4 12h16" stroke-dasharray="1.6 1.4"/><circle cx="7.5" cy="6.5" r="1.2"/><path d="M5 10l2.5-2 3 2.5"/><circle cx="15.5" cy="16.5" r="1.2"/><path d="M13 20l2.5-2 3 2.5"/>' },
  tandem: { label: 'Tandembogen', d: 'Partner A und B fragen sich gegenseitig ab, Lösungen auf der Seite des anderen; in der Mitte falten', o: 'a4', ic: '<rect x="4" y="2.5" width="16" height="19" rx="1"/><path d="M12 2.5v19" stroke-dasharray="1.6 1.4"/><path d="M6.5 7h3.5M14 7h3.5M6.5 11h3.5M14 11h3.5M6.5 15h3.5M14 15h3.5"/>' }
};
// A4-Vorlagen: Kartenraster (Spalten × Zeilen)
const A4_GRID = { '2x2': [2, 2], '2x3': [2, 3], '2x4': [2, 4], '3x3': [3, 3], '3x4': [3, 4] };
const a4Grid = b => A4_GRID[b.grid] || A4_GRID[b.tpl === 'lernk' ? '2x4' : '2x3'];
// Schriftgröße so, dass der Text das Kärtchen füllt (Schätzung über die Fläche)
const a4Fs = (txt, wmm, hmm, max = 24) => { const n = Math.max(12, plainText(txt || '').length); return Math.max(8.5, Math.min(max, Math.sqrt(Math.max(40, wmm * hmm) * 0.62 / (n * 0.0809)))); };
const A4_ROLES = du => [
  { h: 'Moderation', t: du ? 'Du achtest darauf, dass alle zu Wort kommen und ihr bei der Aufgabe bleibt.' : 'Sie achten darauf, dass alle zu Wort kommen und die Gruppe bei der Aufgabe bleibt.' },
  { h: 'Zeit', t: du ? 'Du behältst die Uhr im Blick und sagst Bescheid, wenn die Hälfte der Zeit um ist.' : 'Sie behalten die Uhr im Blick und sagen Bescheid, wenn die Hälfte der Zeit um ist.' },
  { h: 'Protokoll', t: du ? 'Du hältst die Ergebnisse der Gruppe schriftlich fest.' : 'Sie halten die Ergebnisse der Gruppe schriftlich fest.' },
  { h: 'Präsentation', t: du ? 'Du stellst die Ergebnisse der Gruppe der Klasse vor.' : 'Sie stellen die Ergebnisse der Gruppe dem Kurs vor.' }];
const a4Seed = (str, seed) => { let h = 2166136261 ^ (seed || 1); for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const A3_COLORS = [['#FFE45C', 'Gelb'], ['#9BE39B', 'Grün'], ['#8EC9FF', 'Blau'], ['#FFB3D1', 'Rosa']];
const a3Tpl = b => (A3_TPL[b && b.tpl] ? b.tpl : 'placemat');
const a3Fmt = b => (A3_TPL[a3Tpl(b)].o === 'a4' ? 'a4' : 'a3');
const A3_RULES = du => du ? 'Schreibt schweigend. Antwortet auf Beiträge der anderen, stellt Fragen und verbindet Gedanken mit Pfeilen.' : 'Schreiben Sie schweigend. Antworten Sie auf Beiträge der anderen, stellen Sie Fragen und verbinden Sie Gedanken mit Pfeilen.';
const PC_OPT = {
  rule: { none: 'ohne', lines: 'Linien', karo: 'Kästchen', dots: 'Punkte' },
  gap: { 8: 'eng', 11: 'normal', 14: 'weit' },
  col: { farbe: 'grün / rot', akzent: 'Akzentfarbe', sw: 'schwarz-weiß' },
  ttl: { 28: 'klein', 40: 'mittel', 54: 'groß' },
  pos: { oben: 'oben', mitte: 'Mitte', unten: 'unten' },
  frame: { dash: 'gestrichelt', solid: 'durchgezogen', none: 'ohne' }
};
const PC_DEF = { gap: '11', col: 'farbe', ttl: '40', pos: 'mitte', frame: 'dash' };
// Gestaltung für die übrigen A3-Vorlagen
const A3G_COL = { akzent: 'Akzentfarbe', sw: 'schwarz-weiß' }, A3G_TTL = { 1: 'klein', 1.4: 'mittel', 1.8: 'groß' };
const a3G = b => b.tpl !== 'procon' && A3_TPL[a3Tpl(b)].o !== 'a4';
function a3Norm(b) {
  if (!Array.isArray(b.legend)) b.legend = ['', '', '', ''];
  if (!Array.isArray(b.sections) || !b.sections.length) b.sections = ['Worum geht es?', 'Unsere Ergebnisse', 'Belege aus dem Material', 'Offene Fragen'];
  if (!Array.isArray(b.cols) || b.cols.length < 2) b.cols = ['', ''];
  if (!Array.isArray(b.aspects) || !b.aspects.length) b.aspects = ['Thema', 'Sprecher oder Erzähler', 'Sprache und Stil', 'Wirkung'];
  if (!Array.isArray(b.experts) || b.experts.length < 2) b.experts = ['Thema A', 'Thema B', 'Thema C', 'Thema D'];
  if (!(+b.n >= 3 && +b.n <= 6)) b.n = 4;
  if (!Array.isArray(b.cards) || !b.cards.length) b.cards = [{ h: '', t: '' }, { h: '', t: '' }, { h: '', t: '' }, { h: '', t: '' }];
  if (!Array.isArray(b.pairs) || !b.pairs.length) b.pairs = [{ f: '', r: '' }, { f: '', r: '' }, { f: '', r: '' }, { f: '', r: '' }];
  if (!Array.isArray(b.tq) || !b.tq.length) b.tq = [{ q: '', a: '' }, { q: '', a: '' }, { q: '', a: '' }, { q: '', a: '' }];
  if (typeof b.strips !== 'string') b.strips = '';
  if (b.tpl === 'fotos') { if (!Array.isArray(b.photos)) b.photos = []; if (!FP_N.includes(+b.fpN)) b.fpN = '4'; if (!['0', '3'].includes(String(b.fpGap))) b.fpGap = '0'; if (!['contain', 'cover'].includes(b.fpFit)) b.fpFit = 'contain'; if (typeof b.fpCut !== 'boolean') b.fpCut = true; if (typeof b.fpRot !== 'boolean') b.fpRot = true; }
  if (a3G(b)) { if (!PC_OPT.rule[b.pcRule]) b.pcRule = 'none'; if (!PC_OPT.gap[b.pcGap]) b.pcGap = '11'; if (!A3G_COL[b.pcCol]) b.pcCol = 'akzent'; if (!A3G_TTL[b.a3Ts]) b.a3Ts = '1'; }
  if (b.tpl === 'procon') { if (!(+b.pcW >= 4 && +b.pcW <= 38)) b.pcW = 14; if (!(+b.pcH >= 3 && +b.pcH <= 26)) b.pcH = 10; if (typeof b.pcLines !== 'boolean') b.pcLines = true;
    if (!PC_OPT.rule[b.pcRule]) b.pcRule = b.pcLines ? 'lines' : 'none'; for (const k of ['gap', 'col', 'ttl', 'pos', 'frame']) { const key = 'pc' + k[0].toUpperCase() + k.slice(1); if (!PC_OPT[k][b[key]]) b[key] = PC_DEF[k]; } if (typeof b.pcSym !== 'boolean') b.pcSym = true; if (typeof b.pcFaz !== 'boolean') b.pcFaz = false; }
  return b;
}
function a3TaskList() {
  const L = []; let t = 0;
  state.sheet.blocks.forEach(b => { if (b.type !== 'tasks') return; if (rst(b)) t = 0; b.items.forEach((it, i) => { if (!itFo(it)) t++; if (tfStr(it.text).trim()) { const p = plainText(it.text).replace(/\s+/g, ' ').trim(); L.push([b.id + ':' + i, `${itFo(it) ? 'Auftrag (Folie)' : 'Aufgabe ' + t}: ${p.length > 70 ? p.slice(0, 68) + ' …' : p}`]); } }); });
  return L;
}
function a3TaskHTML(b) {
  if (b.taskRef) { const [bid, i] = String(b.taskRef).split(':'); const tb = state.sheet.blocks.find(x => x.id === bid); const it = tb && tb.items && tb.items[+i]; if (it) { const tt = taskText(it, state.sheet.meta); return /\n/.test(tt.trim()) ? parasHTML(tt) : inlineHTML(tt); } }
  return tfStr(b.task).trim() ? parasHTML(b.task) : '';
}
function a3MatList() { const num = numbering(state.sheet); return state.sheet.blocks.filter(b => b.type === 'material').map(b => { const z = num[b.id] || {}; return [b.id, `${z.tag || 'M' + (z.m || '')} · ${plainText(b.title || '') || 'ohne Titel'}`]; }); }
function a3Page(b, inner, part) {
  const m = state.sheet.meta, tpl = a3Tpl(b), o = A3_TPL[tpl].o, g = a3G(b), q = tpl === 'procon' ? !b.pcHoch : (o === 'q') !== !!(g && b.a3Flip && tpl !== 'annot'), a4 = o === 'a4';
  const gc = g ? ` ru-${b.pcRule || 'none'}${b.pcCol === 'sw' ? ' a3-sw' : ''}` : '', gs = g ? ` style="--pcg:${b.pcGap || 11}mm;--a3ts:${b.a3Ts || 1}"` : '';
  const foot = esc([m.nr ? 'AB ' + m.nr : '', plainText(m.title || '')].filter(Boolean).join(' · '));
  const pg = el(`<div class="page a3-page a3-${tpl} ${a4 ? 'a4 hoch' : q ? 'quer' : 'hoch'}${gc}"${gs} data-w="${a4 ? 210 : q ? 420 : 297}" data-h="${a4 ? 297 : q ? 297 : 420}"><div class="a3-in">${inner}</div><div class="a3-foot"><span>${foot}</span><span>${esc(A3_TPL[tpl].label)}${part ? ' · ' + part : ''}</span></div></div>`);
  setAccent(pg, m); return pg;
}
const a3Head = (b, name, extra) => `<div class="a3-h"><div class="a3-ht"><span class="a3-kind">${esc(A3_TPL[a3Tpl(b)].label)}</span><div class="a3-title">${inlineHTML(tfStr(b.title).trim() || state.sheet.meta.title || '')}</div></div>${extra || ''}${name && b.a3Name !== false ? `<div class="a3-name"><span>${name}</span><i></i></div>` : ''}</div>`;
const a3Lines = n => '<i></i>'.repeat(n);
function a3Pages(b, mats) {
  a3Norm(b); const tpl = a3Tpl(b), m = state.sheet.meta, acc = a3G(b) && b.pcCol === 'sw' ? '#1C1F27' : pageAcc(m).c; const task = a3TaskHTML(b);
  const taskH = task ? `<div class="a3-task">${task}</div>` : '';
  if (tpl === 'annot') {
    const ids = Object.keys(mats); const id = mats[b.mat] ? b.mat : ids.find(k => mats[k].lines.length); const M = id && mats[id]; const mb = id && state.sheet.blocks.find(x => x.id === id);
    const legend = `<div class="a3-legend">${b.legend.map((t, i) => `<span><b style="background:${A3_COLORS[i][0]}"></b>${tfStr(t).trim() ? esc(t) : '<em></em>'}</span>`).join('')}</div>`;
    if (!M || !M.lines.length || !mb) return [a3Page(b, a3Head(b, 'Name', legend) + taskH + '<div class="a3-empty">Für den Annotationsbogen braucht das Blatt ein Material mit Text.</div>')];
    const fm = matFmt(mb); const pt = FMT_SIZE[fm.size] || 10.5; const lh = 2; const lineMM = pt * lh * 0.3528;
    const bodyMM = 297 - 20 - 24 - (task ? 16 : 0) - 9 - 12; const per = Math.max(8, Math.floor(bodyMM / lineMM));
    const parts = []; for (let i = 0; i < M.lines.length; i += per) parts.push(M.lines.slice(i, i + per));
    return parts.map((L, pi) => a3Page(b, a3Head(b, 'Name', legend) + taskH + `<div class="a3-annot"><div class="a3-margin">Randnotizen</div><div class="a3-text" style="--mfs:${pt}pt;--alh:${lh};--mff:${fmtFF(fm.font)}"><div class="a3-mh"><b>${esc(M.tag || 'M')}</b>${inlineHTML(mb.title || '')}${parts.length > 1 ? ` <small>Teil ${pi + 1} von ${parts.length}</small>` : ''}</div>${L.map(l => `<div class="a3-ln"><span class="n">${esc(l.num)}</span><span class="t">${esc(l.t)}</span></div>`).join('')}${pi === parts.length - 1 && mb.source ? `<div class="a3-src">${inlineHTML(mb.source)}</div>` : ''}</div><div class="a3-margin">Randnotizen</div></div>`, parts.length > 1 ? `Seite ${pi + 1} von ${parts.length}` : ''));
  }
  if (A3_TPL[tpl].o === 'a4') return a4Pages(b);
  if (tpl === 'placemat') {
    const N = Math.min(6, Math.max(3, +b.n || 4)); const IW = 19, IH = 19;
    const at = (deg, hw, hh) => { const r = deg * Math.PI / 180, c = Math.cos(r), sn = Math.sin(r); const k = 1 / Math.max(Math.abs(c), Math.abs(sn)); return [50 + c * hw * k, 50 + sn * hh * k]; };
    const step = 360 / N; const lines = []; const labs = [];
    for (let i = 0; i < N; i++) {
      const phi = 90 + step * i, beta = phi + step / 2; const [x1, y1] = at(beta, IW, IH), [x2, y2] = at(beta, 50, 50);
      lines.push(`<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${acc}" stroke-width="1.6" vector-effect="non-scaling-stroke"/>`);
      const [lx, ly] = at(phi, 50 * .86, 50 * .86); labs.push(`<span class="a3-pm-l" style="left:${lx.toFixed(2)}%;top:${ly.toFixed(2)}%;--r:${(phi - 90).toFixed(1)}deg">Person ${i + 1}</span>`);
    }
    const svg = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect x="0.2" y="0.3" width="99.6" height="99.4" fill="none" stroke="${acc}" stroke-width="2" vector-effect="non-scaling-stroke"/><rect x="${50 - IW}" y="${50 - IH}" width="${2 * IW}" height="${2 * IH}" fill="#fff" stroke="${acc}" stroke-width="2" vector-effect="non-scaling-stroke"/>${lines.join('')}</svg>`;
    return [a3Page(b, a3Head(b, 'Gruppe') + `<div class="a3-pm">${svg}${labs.join('')}<div class="a3-pm-c" style="left:${50 - IW}%;top:${50 - IH}%;width:${2 * IW}%;height:${2 * IH}%"><small>Aufgabe und gemeinsames Ergebnis</small><div class="a3-pm-t">${task || ''}</div></div></div>`)];
  }
  if (tpl === 'schreib') {
    const q = state.sheet.blocks.find(x => x.type === 'quote' && plainText(x.text || '').trim());
    const imp = tfStr(b.impulse).trim() ? parasHTML(b.impulse) : q ? parasHTML(q.text) + (q.author ? `<div class="a3-auth">${inlineHTML(q.author)}</div>` : '') : task || '<span class="a3-ph">Impuls: Zitat, Frage oder These</span>';
    return [a3Page(b, a3Head(b, '', `<div class="a3-rules">${esc(tfStr(b.rules).trim() || A3_RULES(m.anrede === 'du'))}</div>`) + `<div class="a3-sg"><div class="a3-sg-i">${imp}</div></div>`)];
  }
  if (tpl === 'plakat') {
    const S = b.sections.filter(x => tfStr(x).trim()).slice(0, 6); const n = Math.max(1, S.length); const c = n >= 4 ? 2 : 1;
    return [a3Page(b, `<div class="a3-h a3-plh"><div class="a3-ht"><span class="a3-kind">Lernplakat · Thema</span><div class="a3-title big">${tfStr(b.title).trim() ? inlineHTML(b.title) : '<span class="a3-blank"></span>'}</div></div></div>${b.a3Name !== false ? '<div class="a3-name wide"><span>Gruppe</span><i></i></div>' : ''}${taskH}<div class="a3-pl" style="--c:${c}">${(S.length ? S : ['']).map(x => `<div class="a3-box"><h3>${inlineHTML(x)}</h3></div>`).join('')}</div><div class="a3-name wide"><span>Quellen</span><i></i></div>`)];
  }
  if (tpl === 'procon') {
    const W = Math.max(4, Math.min(38, +b.pcW || 14)), H = Math.max(3, Math.min(26, +b.pcH || 10));
    const ttl = tfStr(b.title).trim() ? inlineHTML(b.title) : m.title ? inlineHTML(m.title) : '<span class="a3-blank"></span>';
    const lab = [tfStr(b.pcPro).trim() || 'Pro', tfStr(b.pcCon).trim() || 'Contra'];
    const cap = tfStr(b.pcCap).trim(), src = tfStr(b.pcSrc).trim(), info = tfStr(b.pcInfo).trim();
    const pic = b.src ? `<img src="${esc(b.src)}" alt="" style="object-fit:${b.pcFit === 'cover' ? 'cover' : 'contain'}">` : `<span class="a3-pc-ph">Bild aufkleben<small>${String(W).replace('.', ',')} × ${String(H).replace('.', ',')} cm</small></span>`;
    const col = (k, sym) => `<div class="a3-pc-col ${k}"><h3>${b.pcSym ? `<b>${sym}</b>` : ''}${inlineHTML(lab[k === 'pro' ? 0 : 1])}</h3>${b.pcRule !== 'none' ? `<div class="a3-pc-ln r-${b.pcRule}"></div>` : ''}</div>`;
    const cols = { farbe: ['#1E7A3A', '#B42318'], akzent: ['var(--acc)', 'var(--acc)'], sw: ['#1C1F27', '#1C1F27'] }[b.pcCol] || ['#1E7A3A', '#B42318'];
    const pcSty = `--pcg:${b.pcGap}mm;--pcp:${cols[0]};--pcc:${cols[1]};--pct:${b.pcTtl}pt`;
    return [a3Page(b, `<div class="a3-pc-wrap pf-${b.pcFrame} pp-${b.pcPos}" style="${pcSty}"><div class="a3-pc-h"><div class="a3-pc-t">${ttl}</div>${b.pcName ? '<div class="a3-name"><span>Name / Gruppe</span><i></i></div>' : ''}</div>${info ? `<div class="a3-pc-info">${parasHTML(b.pcInfo)}</div>` : ''}${taskH}
      <div class="a3-pc">${col('pro', '+')}${col('con', '−')}<div class="a3-pc-mid" style="width:${W * 10}mm"><div class="a3-pc-img${b.src ? ' has' : ''}" style="height:${H * 10}mm">${pic}</div>${cap || src ? `<div class="a3-pc-cap">${cap ? parasHTML(b.pcCap) : ''}${src ? `<small>${inlineHTML(b.pcSrc)}</small>` : ''}</div>` : ''}</div></div>${b.pcFaz ? `<div class="a3-pc-faz"><h3>${inlineHTML(tfStr(b.pcFazT).trim() || 'Fazit')}</h3>${b.pcRule !== 'none' ? `<div class="a3-pc-ln r-${b.pcRule}"></div>` : ''}</div>` : ''}</div>`)];
  }
  if (tpl === 'vergleich') {
    const mt = a3MatList(); const C = Math.min(4, Math.max(2, b.cols.length)); const heads = Array.from({ length: C }, (_, i) => tfStr(b.cols[i]).trim() || (mt[i] ? mt[i][1] : 'Text ' + String.fromCharCode(65 + i)));
    const A = b.aspects.filter(x => tfStr(x).trim()).slice(0, 10);
    return [a3Page(b, a3Head(b, 'Name') + taskH + `<div class="a3-vg" style="--n:${C};--r:${Math.max(1, A.length)}"><div class="hd asp">Aspekt</div>${heads.map(h => `<div class="hd">${inlineHTML(h)}</div>`).join('')}${(A.length ? A : ['']).map(a => `<div class="asp">${inlineHTML(a)}</div>${'<div></div>'.repeat(C)}`).join('')}<div class="fz"><b>Fazit:</b> Gemeinsamkeiten und Unterschiede</div></div>`)];
  }
  // Expertenbogen
  const E = b.experts.filter(x => tfStr(x).trim()).slice(0, 6);
  return [a3Page(b, a3Head(b, 'Name') + `<div class="a3-ex"><div class="a3-ex-l"><div class="a3-step"><b>1</b>Expertenphase</div><div class="a3-name"><span>Mein Thema</span><i></i></div>${taskH}<div class="a3-box grow"><h3>Notizen</h3></div></div>
    <div class="a3-ex-r"><div class="a3-step"><b>2</b>Stammgruppe: Was berichten die anderen?</div><div class="a3-ex-g">${E.map(x => `<div class="a3-box"><h3>${inlineHTML(x)}</h3></div>`).join('')}</div><div class="a3-step"><b>3</b>Gemeinsames Ergebnis</div><div class="a3-box res"></div></div></div>`)];
}
function a4Strips(b) {
  const lines = String(b.strips || '').split('\n').map(x => x.trim()).filter(Boolean);
  let order = lines.map((t, i) => i); if (b.mix) order = order.map(i => [a4Seed(lines[i] + i, b.seed), i]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  const letter = i => i < 26 ? String.fromCharCode(65 + i) : 'Z' + (i - 25);
  return { lines, order, letter, sol: lines.map((_, i) => letter(order.indexOf(i))).join(' – ') };
}
// Fotobogen: Raster je Seite so wählen, dass die Fotos möglichst groß werden; quer liegende Fotos auf Wunsch drehen
const FP_N = [1, 2, 4, 6, 8, 9, 12, 16];
const fpGrids = N => { const L = []; for (let c = 1; c <= N; c++) if (N % c === 0) L.push([c, N / c]); return L; };
const fpFitArea = (cw, ch, a) => { const w = Math.min(cw, ch * a); return w * (w / a); };
const FP_ROT = new Map(), FP_DIM = new Map();
// Seitenverhältnis immer am geladenen Bild messen: gespeicherte Maße können fehlen oder nicht passen
function fpAspect(o) {
  const k = o.src; const d = FP_DIM.get(k);
  if (d && d !== 1) { if (Math.abs((+o.w || 0) / (+o.h || 1) - d[0] / d[1]) > .01) { o.w = d[0]; o.h = d[1]; } return d[0] / d[1]; }
  if (!d && k) { FP_DIM.set(k, 1); imgSize(k).then(([w, h]) => { if (w > 4 && h > 4) { FP_DIM.set(k, [w, h]); const old = (+o.w || 0) / (+o.h || 1); if (Math.abs(old - w / h) > .01) { o.w = w; o.h = h; scheduleRender(30); } } }); }
  return (+o.w > 0 && +o.h > 0) ? +o.w / +o.h : 4 / 3;
}
const fpLoad = src => new Promise((res, rej) => { const i = new Image(); if (/^https?:/.test(src)) i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src; });
function fpRotSrc(o) {
  const k = o.src; if (!k) return ''; const hit = FP_ROT.get(k); if (hit && hit !== 1 && hit !== 2) return hit; if (hit === 2) return '';
  if (!hit) { FP_ROT.set(k, 1); fpLoad(k).then(img => { const c = document.createElement('canvas'); c.width = img.naturalHeight; c.height = img.naturalWidth; const x = c.getContext('2d'); x.translate(c.width, 0); x.rotate(Math.PI / 2); x.drawImage(img, 0, 0); FP_ROT.set(k, c.toDataURL('image/jpeg', .88)); scheduleRender(30); }).catch(() => FP_ROT.set(k, 2)); }
  return '';
}
function fpPages(b, hd) {
  const P = b.photos.filter(o => o && o.src); const seq = []; P.forEach(o => { for (let i = 0; i < Math.max(1, Math.min(99, Math.round(+o.n || 1))); i++) seq.push(o); });
  if (!seq.length) return [a3Page(b, hd() + '<div class="a3-empty">Füg links Fotos hinzu und leg fest, wie oft jedes gedruckt wird.</div>')];
  const N = +b.fpN || 4, g = +b.fpGap || 0, cut = b.fpCut !== false, head = !!tfStr(b.title).trim();
  const W = 194, H = 277 - (head ? 11.5 : 0), pad = cut ? 1.5 : 0;
  const pages = []; for (let i = 0; i < seq.length; i += N) pages.push(seq.slice(i, i + N));
  return pages.map((L, pi) => {
    const capH = L.some(o => tfStr(o.cap).trim()) ? 5.5 : 0; const a = fpAspect(L[0]);
    // Raster: die Fläche des ersten Fotos zählt; gedreht, wenn erlaubt und es dann größer wird
    let best = null;
    fpGrids(N).forEach(([c, r]) => { const cw = (W - g * (c - 1)) / c - 2 * pad, ch = (H - g * (r - 1)) / r - 2 * pad - capH; [a, b.fpRot !== false ? 1 / a : a].forEach(ia => { const ar = fpFitArea(cw, ch, ia); if (!best || ar > best.ar + .01) best = { c, r, ar }; }); });
    const { c, r } = best; const cellW = (W - g * (c - 1)) / c, cellH = (H - g * (r - 1)) / r; const bw = cellW - 2 * pad, bh = cellH - 2 * pad - capH;
    const cells = Array.from({ length: c * r }, (_, k) => {
      const o = L[k]; if (!o) return `<div class="fbo-c empty" style="width:${cellW}mm;height:${cellH}mm"></div>`;
      const oa = fpAspect(o); let rot = b.fpRot !== false && fpFitArea(bw, bh, 1 / oa) > fpFitArea(bw, bh, oa) * 1.02;
      let src = o.src; if (rot) { const rs = fpRotSrc(o); if (rs) src = rs; else rot = false; }
      const ia = rot ? 1 / oa : oa; const cover = b.fpFit === 'cover';
      const iw = cover ? Math.max(bw, bh * ia) : Math.min(bw, bh * ia), ih = iw / ia;
      const box = cover ? `<div class="fbo-i" style="width:${bw.toFixed(2)}mm;height:${bh.toFixed(2)}mm"><img src="${esc(src)}" alt="" style="width:${iw.toFixed(2)}mm;height:${ih.toFixed(2)}mm;left:${((bw - iw) / 2).toFixed(2)}mm;top:${((bh - ih) / 2).toFixed(2)}mm"></div>`
        : `<div class="fbo-i" style="width:${iw.toFixed(2)}mm;height:${ih.toFixed(2)}mm"><img src="${esc(src)}" alt="" style="width:${iw.toFixed(2)}mm;height:${ih.toFixed(2)}mm;left:0;top:0"></div>`;
      return `<div class="fbo-c" style="width:${cellW}mm;height:${cellH}mm;padding:${pad}mm"><div class="fbo-a" style="width:${bw.toFixed(2)}mm;height:${bh.toFixed(2)}mm">${box}</div>${capH ? `<div class="fbo-cap">${inlineHTML(tfStr(o.cap))}</div>` : ''}</div>`;
    });
    return a3Page(b, (head ? hd(pages.length > 1 ? `${pi + 1}/${pages.length}` : '') : '') + `<div class="fbo-grid${cut ? ' cut' : ''}" style="width:${W}mm;height:${H}mm;gap:${g}mm">${cut ? '<span class="a4-sc" aria-hidden="true">✂</span>' : ''}${cells.join('')}</div>`, pages.length > 1 ? `${pi + 1}/${pages.length}` : '');
  });
}
function a4Pages(b) {
  const tpl = a3Tpl(b), m = state.sheet.meta, du = m.anrede === 'du', lehrer = !!sheetView().lehrer;
  const kind = A3_TPL[tpl].label; const ttl = tfStr(b.title).trim() ? inlineHTML(b.title) : '';
  const hd = extra => `<div class="a4-h"><span class="a3-kind">${esc(kind)}</span>${ttl ? `<b>${ttl}</b>` : ''}${extra ? `<span class="a4-hx">${extra}</span>` : ''}</div>`;
  const SC = '<span class="a4-sc" aria-hidden="true">✂</span>';
  const GW = 194, GH = 297 - 14 - 9 - 8;   // Fläche für das Raster in mm
  const grid = (cells, c, r) => `<div class="a4-grid" style="--c:${c};--r:${r}">${SC}${cells.join('')}</div>`;
  if (tpl === 'karten' || tpl === 'lernk') {
    const [c, r] = a4Grid(b); const per = c * r; const cw = GW / c, ch = GH / r;
    if (tpl === 'karten') {
      const L = b.cards.filter(x => tfStr(x.t).trim() || tfStr(x.h).trim()); const all = tfStr(b.cardHead).trim();
      if (!L.length) return [a3Page(b, hd() + '<div class="a3-empty">Trag links Texte für die Karten ein.</div>')];
      const pages = []; for (let i = 0; i < L.length; i += per) pages.push(L.slice(i, i + per));
      // eine Schriftgröße pro Seite, damit die Karten einheitlich wirken
      const fsOf = x => a4Fs(x.t, cw - 10, ch - 10 - (all || tfStr(x.h).trim() || b.cnum ? 9 : 0));
      return pages.map((P, pi) => { const fs = Math.min(...P.map(fsOf)); return a3Page(b, hd('Entlang der gestrichelten Linien ausschneiden') + grid(Array.from({ length: per }, (_, k) => { const x = P[k]; if (!x) return '<div class="a4c empty"></div>'; const no = pi * per + k + 1; const h = [all, tfStr(x.h).trim()].filter(Boolean);
        return `<div class="a4c">${h.length || b.cnum ? `<div class="a4c-h">${b.cnum ? `<span class="a4c-no">${no}</span>` : ''}${h.map(inlineHTML).join(' · ')}</div>` : ''}<div class="a4c-t" style="font-size:${fs.toFixed(1)}pt">${parasHTML(x.t || '')}</div></div>`; }), c, r), pages.length > 1 ? `${pi + 1}/${pages.length}` : ''); });
    }
    const L = b.pairs.filter(x => tfStr(x.f).trim() || tfStr(x.r).trim());
    if (!L.length) return [a3Page(b, hd() + '<div class="a3-empty">Trag links Begriffe und Erklärungen ein oder übernimm die Worterklärungen.</div>')];
    const out = [];
    for (let i = 0; i < L.length; i += per) {
      const P = L.slice(i, i + per); const part = L.length > per ? ` · ${i / per + 1}/${Math.ceil(L.length / per)}` : '';
      out.push(a3Page(b, hd('Vorderseite · beidseitig drucken, an der langen Kante wenden') + grid(Array.from({ length: per }, (_, k) => P[k] ? `<div class="a4c lk-f"><div class="a4c-t" style="font-size:${Math.min(26, a4Fs(P[k].f, cw - 12, ch - 12, 30)).toFixed(1)}pt">${inlineHTML(P[k].f || '')}</div></div>` : '<div class="a4c empty"></div>'), c, r), 'Vorderseite' + part));
      // Rückseite gespiegelt: in jeder Zeile von rechts nach links, damit beim Wenden jede Erklärung hinter ihrem Begriff liegt
      const fsR = Math.min(...P.map(x => a4Fs(x.r, cw - 10, ch - 10, 20)));
      out.push(a3Page(b, hd('Rückseite') + grid(Array.from({ length: per }, (_, k) => { const row = Math.floor(k / c), col = c - 1 - (k % c); const x = P[row * c + col]; return x ? `<div class="a4c lk-r"><div class="a4c-t" style="font-size:${fsR.toFixed(1)}pt">${parasHTML(x.r || '')}</div></div>` : '<div class="a4c empty"></div>'; }), c, r), 'Rückseite' + part));
    }
    return out;
  }
  if (tpl === 'fotos') return fpPages(b, hd);
  if (tpl === 'streifen') {
    const { lines, order, letter, sol } = a4Strips(b);
    if (!lines.length) return [a3Page(b, hd() + '<div class="a3-empty">Trag links die Sätze oder Textteile ein, je einen pro Zeile, in der richtigen Reihenfolge.</div>')];
    const maxLen = Math.max(...lines.map(l => plainText(l).length)); const n = lines.length;
    const stripH = Math.max(12, Math.min(34, GH / Math.min(n, 14))); const fs = Math.max(10, Math.min(17, Math.min(stripH * 0.42 / 0.3528 / 1.25, Math.sqrt((GW - 22) * (stripH - 4) * 0.62 / (Math.max(20, maxLen) * 0.0809)))));
    const per = Math.max(1, Math.floor(GH / stripH)); const out = [];
    for (let i = 0; i < n; i += per) {
      const P = order.slice(i, i + per);
      out.push(a3Page(b, hd('Entlang der gestrichelten Linien ausschneiden') + `<div class="a4-strips">${SC}${P.map((ix, k) => `<div class="a4s" style="height:${stripH.toFixed(1)}mm;font-size:${fs.toFixed(1)}pt">${b.mix ? `<span class="a4s-l">${letter(i + k)}</span>` : ''}<span class="a4s-t">${inlineHTML(lines[ix])}</span></div>`).join('')}</div>${lehrer && b.mix && i + per >= n ? `<div class="a4-sol">Richtige Reihenfolge: ${esc(sol)}</div>` : ''}`, n > per ? `${i / per + 1}/${Math.ceil(n / per)}` : ''));
    }
    return out;
  }
  // Tandembogen: A fragt bei ungeraden, B bei geraden Nummern; die Lösung steht jeweils beim anderen
  const Q = b.tq.filter(x => tfStr(x.q).trim());
  if (!Q.length) return [a3Page(b, hd() + '<div class="a3-empty">Trag links Fragen und Lösungen ein.</div>')];
  const rule = du ? 'Lies deine Frage vor. Dein Partner antwortet, du prüfst mit der Lösung und hilfst, wenn nötig. Dann ist dein Partner dran.' : 'Lesen Sie Ihre Frage vor. Ihr Partner antwortet, Sie prüfen mit der Lösung und helfen, wenn nötig. Dann ist Ihr Partner dran.';
  const side = who => Q.map((x, i) => { const mine = (i % 2 === 0) === (who === 'A'); return `<div class="a4t-r${mine ? ' q' : ' a'}"><span class="a4t-n">${i + 1}</span><div>${mine ? `<small>Frage</small>${inlineHTML(x.q)}` : `<small>Lösung zu Frage ${i + 1}</small>${inlineHTML(x.a || '')}`}</div></div>`; }).join('');
  const fsT = Math.max(9.5, Math.min(14, 14 - Math.max(0, Q.length - 6) * 0.5));
  return [a3Page(b, hd() + `<div class="a4t-rule">${esc(rule)}</div><div class="a4t" style="font-size:${fsT}pt"><div class="a4t-c"><div class="a4t-h">Partner A</div>${side('A')}</div><div class="a4t-fold"><span>hier falten</span></div><div class="a4t-c"><div class="a4t-h">Partner B</div>${side('B')}</div></div>`)];
}
// A3 auf zwei A4-Blätter verteilen: verkleinert, mit 10 mm Überlappung und Schnittlinie
function a3Split(pg) {
  const w = +pg.dataset.w, h = +pg.dataset.h, q = w > h; const M = 6, O = 10; const win = 210 - 2 * M; const k = (2 * win - O) / (q ? w : h);
  const pw = q ? 210 : 297, ph = q ? 297 : 210; const winW = q ? win : w * k, winH = q ? h * k : win; const left = (pw - winW) / 2, top = (ph - winH) / 2;
  return [0, 1].map(s => {
    const half = el(`<div class="page a3-half" data-w="${pw}" data-h="${ph}"><div class="a3-win" style="left:${left}mm;top:${top}mm;width:${winW}mm;height:${winH}mm"></div><div class="a3-partno">Teil ${s + 1} von 2</div></div>`);
    const c = pg.cloneNode(true); const sh = s ? win - O : 0; c.style.transform = `${q ? 'translateX' : 'translateY'}(-${sh}mm) scale(${k.toFixed(4)})`; half.firstChild.appendChild(c);
    if (s) half.insertAdjacentHTML('beforeend', q ? `<div class="a3-cut v" style="left:${left + O}mm;top:${top - 4}mm;height:${winH + 8}mm"></div><div class="a3-cutl" style="left:${left + O + 1.5}mm;top:${Math.max(1, top - 5)}mm">✂ hier abschneiden, dann an Teil 1 anlegen und festkleben</div>`
      : `<div class="a3-cut h" style="top:${top + O}mm;left:${left - 4}mm;width:${winW + 8}mm"></div><div class="a3-cutl" style="top:${top + O - 4.5}mm;left:${left}mm">✂ hier abschneiden, dann an Teil 1 anlegen und festkleben</div>`);
    else half.insertAdjacentHTML('beforeend', q ? `<div class="a3-edge v" style="left:${left + winW}mm;top:${top - 4}mm;height:${winH + 8}mm"></div>` : `<div class="a3-edge h" style="top:${top + winH}mm;left:${left - 4}mm;width:${winW + 8}mm"></div>`);
    return half;
  });
}
function layoutA3() {
  const v = sheetView(); const out = [];
  stABs().forEach(A => {
    const fmt = state.out === 'a4' ? 'a4' : 'a3';
    const list = A.blocks.filter(b => b.type === 'a3' && a3Fmt(b) === fmt && blockVisible(b, v)); if (!list.length) return;
    withAB(A.k, () => { const mats = list.some(b => a3Tpl(b) === 'annot') ? presCollect(true) : {}; list.forEach(b => a3Pages(b, mats).forEach(pg => (state.a3p === 'a4x2' && !pg.classList.contains('a4') ? a3Split(pg) : [pg]).forEach(p => out.push({ pg: p, over: false })))); });
  });
  return out;
}
function a4Editor(b, tpl, inp, del, add) {
  const ta = (k, v, ph, rows = 2) => `<textarea data-k="${k}" rows="${rows}" placeholder="${esc(ph || '')}">${esc(tfStr(v))}</textarea>`;
  const gridSeg = keys => `<div class="f"><span>Karten pro Seite</span><div class="seg sm" role="group" aria-label="Karten pro Seite">${keys.map(k => { const [c, r] = A4_GRID[k]; return `<button type="button" data-act="a4-grid" data-v="${k}" aria-pressed="${a4Grid(b) === A4_GRID[k]}">${c * r} (${c} × ${r})</button>`; }).join('')}</div></div>`;
  const fill = list => `<div class="f"><span>Füllen mit</span><div class="tf-ed-acts">${list.map(([v, l]) => `<button class="btn sm" type="button" data-act="a4-fill" data-v="${v}">${l}</button>`).join('')}</div></div>`;
  if (tpl === 'karten') return `${gridSeg(['2x2', '2x3', '2x4', '3x3', '3x4'])}${fText('cardHead', 'Kopf auf jeder Karte (optional)', b.cardHead, 'z. B. Rollenkarte')}<div class="chks">${fCheck('cnum', 'Karten nummerieren', b.cnum)}</div>
    ${fill([['rollen', 'Gruppenrollen'], ['aufgaben', 'Aufgaben des Blatts'], ['absatz', 'Absätzen eines Materials']])}
    <div class="f"><span>Karten</span><div class="tf-ed-list a4-ed">${b.cards.map((x, i) => `<div class="a4-ed-r"><span class="a4-ed-n">${i + 1}</span><div class="a4-ed-f">${inp(`cards.${i}.h`, x.h, 'Überschrift (optional)')}${ta(`cards.${i}.t`, x.t, 'Text der Karte')}</div>${del('cards', i, b.cards.length <= 1)}</div>`).join('')}</div><div class="tf-ed-acts">${add('cards', 'Karte', b.cards.length >= 60)}</div></div>`;
  if (tpl === 'lernk') return `${gridSeg(['2x3', '2x4', '3x4'])}${fill([['glossar', 'Worterklärungen des Blatts']])}
    <div class="f"><span>Begriff · Erklärung</span><div class="tf-ed-list a4-ed">${b.pairs.map((x, i) => `<div class="a4-ed-r"><span class="a4-ed-n">${i + 1}</span><div class="a4-ed-f">${inp(`pairs.${i}.f`, x.f, 'Vorderseite, z. B. Metapher')}${ta(`pairs.${i}.r`, x.r, 'Rückseite: Erklärung')}</div>${del('pairs', i, b.pairs.length <= 1)}</div>`).join('')}</div><div class="tf-ed-acts">${add('pairs', 'Karte', b.pairs.length >= 60)}</div></div>`;
  if (tpl === 'fotos') { const seg = (k, label, opts) => `<div class="f"><span>${label}</span><div class="seg sm" role="group" aria-label="${label}">${opts.map(([v, l]) => `<button type="button" data-act="pc-set" data-k="${k}" data-v="${v}" aria-pressed="${String(b[k]) === v}">${l}</button>`).join('')}</div></div>`;
    const P = b.photos; const n = P.reduce((x, o) => x + (o.src ? Math.max(1, Math.round(+o.n || 1)) : 0), 0); const pg = Math.ceil(n / (+b.fpN || 4));
    return `<div class="f"><span>Fotos</span><div class="tf-ed-list fbo-ed">${P.map((o, i) => `<div class="fbo-ed-r">${o.src ? `<img src="${esc(o.src)}" alt="">` : '<i class="fbo-ed-ph">…</i>'}<div class="fbo-ed-f"><div class="row" style="gap:6px 10px;align-items:flex-end"><label class="f fbo-n"><span>Anzahl</span><input type="number" min="1" max="99" data-k="photos.${i}.n" value="${esc(o.n || 1)}"></label><button class="link" type="button" data-act="fp-fill" data-i="${i}" title="So oft, dass eine Seite voll wird">Seite füllen</button></div>${inp(`photos.${i}.cap`, o.cap, 'Bildunterschrift (optional)')}</div>${del('photos', i)}</div>`).join('')}</div>
      <label class="btn sm fbo-add">${hmI('plus')}Fotos hinzufügen<input type="file" accept="image/*" multiple data-act="fp-add" hidden></label>${n ? `<small class="hint">${n} ${n === 1 ? 'Foto' : 'Fotos'} auf ${pg} ${pg === 1 ? 'Seite' : 'Seiten'} A4</small>` : ''}</div>
      ${seg('fpN', 'Fotos pro Seite', FP_N.map(x => [String(x), String(x)]))}
      ${seg('fpFit', 'Foto im Feld', [['contain', 'ganz zeigen'], ['cover', 'Feld füllen (Ränder abschneiden)']])}
      ${seg('fpGap', 'Abstand', [['0', 'ohne (am sparsamsten)'], ['3', 'mit Abstand']])}
      <div class="chks">${fCheck('fpRot', 'Fotos drehen, wenn sie dann größer werden', b.fpRot !== false)}${fCheck('fpCut', 'Schnittlinien', b.fpCut !== false)}</div>
      <small class="hint">Überschrift leer lassen: dann nutzen die Fotos die ganze Seite.</small>`; }
  if (tpl === 'streifen') return `${fill([['saetze', 'Sätzen eines Materials']])}<label class="f"><span>Streifen (einer pro Zeile, in der richtigen Reihenfolge)</span>${ta('strips', b.strips, 'Erster Satz …\nZweiter Satz …', 8)}</label>
    <div class="chks">${fCheck('mix', 'Gemischt drucken, mit Buchstaben', b.mix)}</div>${b.mix ? `<div class="tf-ed-acts"><button class="link" type="button" data-act="a4-remix">Neu mischen</button></div>${a4Strips(b).lines.length ? `<small class="hint">Lösung: ${esc(a4Strips(b).sol)}</small>` : ''}` : ''}`;
  return `<div class="f"><span>Fragen und Lösungen</span><small class="hint">Partner A fragt bei 1, 3, 5 …, Partner B bei 2, 4, 6 …; die Lösung steht jeweils auf der Seite des anderen.</small><div class="tf-ed-list a4-ed">${b.tq.map((x, i) => `<div class="a4-ed-r"><span class="a4-ed-n">${i % 2 ? 'B' : 'A'}${i + 1}</span><div class="a4-ed-f">${inp(`tq.${i}.q`, x.q, 'Frage')}${inp(`tq.${i}.a`, x.a, 'Lösung')}</div>${del('tq', i, b.tq.length <= 1)}</div>`).join('')}</div><div class="tf-ed-acts">${add('tq', 'Frage', b.tq.length >= 20)}</div></div>`;
}
// „Füllen mit …“: Karten aus vorhandenem Material des Blatts
function a4Fill(b, v) {
  const sh = state.sheet, du = sh.meta.anrede === 'du'; const mats = sh.blocks.filter(x => x.type === 'material' && plainText(x.text || '').trim());
  const keep = arr => arr.filter(x => Object.values(x).some(y => tfStr(y).trim()));
  if (v === 'rollen') { b.cards = [...keep(b.cards), ...A4_ROLES(du)]; if (!tfStr(b.cardHead).trim()) b.cardHead = 'Rollenkarte'; return 'Vier Gruppenrollen angefügt.'; }
  if (v === 'aufgaben') { const L = []; let t = 0; sh.blocks.forEach(x => { if (x.type !== 'tasks') return; if (rst(x)) t = 0; x.items.forEach(it => { if (!itFo(it)) t++; if (tfStr(it.text).trim()) L.push({ h: itFo(it) ? 'Auftrag' : 'Aufgabe ' + t, t: taskText(it, sh.meta) }); }); }); if (!L.length) return 'Das Blatt hat noch keine Aufgaben.'; if (b.cardHead === 'Rollenkarte' && !keep(b.cards).length) b.cardHead = ''; b.cards = [...keep(b.cards), ...L]; return L.length + ' Aufgaben als Karten angefügt.'; }
  if (v === 'absatz' || v === 'saetze') {
    const mb = mats[0]; if (!mb) return 'Das Blatt hat noch kein Material mit Text.';
    const paras = matParas(mb.text).map(p => p.filter(l => !MH_RE.test(l) && l !== MAT_BL).join(' ').replace(/\s+/g, ' ').trim()).filter(Boolean);
    if (v === 'absatz') { b.cards = [...keep(b.cards), ...paras.map(t => ({ h: '', t }))]; return paras.length + ' Absätze als Karten angefügt (zum Ordnen: „Karten nummerieren“ aus).'; }
    const sents = paras.join(' ').split(/(?<=[.!?…][“”"»)]?)\s+(?=[„"»(]?[A-ZÄÖÜ0-9])/).map(x => x.trim()).filter(Boolean).slice(0, 40);
    b.strips = sents.join('\n'); b.mix = true; return sents.length + ' Sätze als Streifen übernommen und gemischt.';
  }
  if (v === 'glossar') { const L = []; sh.blocks.forEach(x => { if (x.type === 'material') (x.glossary || []).forEach(g => { if (tfStr(g.term).trim()) L.push({ f: g.term, r: g.text || '' }); }); }); if (!L.length) return 'Das Blatt hat noch keine Worterklärungen.'; b.pairs = [...keep(b.pairs), ...L]; return L.length + ' Worterklärungen als Lernkarten angefügt.'; }
  return '';
}
const gSeg = (b, key, label, opts) => `<div class="f"><span>${label}</span><div class="seg sm" role="group" aria-label="${label}">${Object.entries(opts).map(([v, l]) => `<button type="button" data-act="pc-set" data-k="${key}" data-v="${v}" aria-pressed="${String(b[key]) === v}">${l}</button>`).join('')}</div></div>`;
const a3GEditor = (b, tpl) => { const o = A3_TPL[tpl].o, q = (o === 'q') !== !!(b.a3Flip && tpl !== 'annot');
  return `<div class="pc-opts"><b class="pc-oh">Gestaltung</b>
    ${gSeg(b, 'pcRule', tpl === 'annot' ? 'Randnotizen' : 'Schreibfläche', PC_OPT.rule)}${b.pcRule !== 'none' ? gSeg(b, 'pcGap', 'Abstand', PC_OPT.gap) : ''}${gSeg(b, 'pcCol', 'Farben', A3G_COL)}${gSeg(b, 'a3Ts', 'Titelgröße', A3G_TTL)}
    ${tpl === 'annot' ? '' : `<div class="f"><span>Blatt</span><div class="seg sm" role="group" aria-label="Ausrichtung"><button type="button" data-act="pc-set" data-k="a3Flip" data-v="${o === 'q' ? '' : '1'}" aria-pressed="${q}">A3 quer</button><button type="button" data-act="pc-set" data-k="a3Flip" data-v="${o === 'q' ? '1' : ''}" aria-pressed="${!q}">A3 hoch</button></div></div>`}
    ${tpl === 'schreib' ? '' : `<div class="chks">${fCheck('a3Name', tpl === 'placemat' || tpl === 'plakat' ? 'Feld für die Gruppe' : 'Feld für den Namen', b.a3Name !== false)}</div>`}</div>`; };
const pcSeg = (b, k, label) => { const key = 'pc' + k[0].toUpperCase() + k.slice(1); return `<div class="f"><span>${label}</span><div class="seg sm" role="group" aria-label="${label}">${Object.entries(PC_OPT[k]).map(([v, l]) => `<button type="button" data-act="pc-set" data-k="${key}" data-v="${v}" aria-pressed="${String(b[key]) === v}">${l}</button>`).join('')}</div></div>`; };
function a3Editor(b) {
  a3Norm(b); const tpl = a3Tpl(b); const T = a3TaskList();
  const inp = (k, v, ph) => `<input type="text" data-k="${k}" value="${esc(tfStr(v))}" placeholder="${esc(ph || '')}">`;
  const del = (w, i, dis) => `<button class="ib" type="button" data-act="a3-del" data-w="${w}" data-i="${i}" title="Entfernen" aria-label="Entfernen"${dis ? ' disabled' : ''}>${I.x}</button>`;
  const add = (w, l, dis) => `<button class="link" type="button" data-act="a3-add" data-w="${w}"${dis ? ' disabled' : ''}>+ ${l}</button>`;
  const list = (w, label, one, arr, ph, min, max) => `<div class="f"><span>${label}</span><div class="tf-ed-list">${arr.map((x, i) => `<div class="tf-ed-row two">${inp(`${w}.${i}`, x, ph(i))}${del(w, i, arr.length <= min)}</div>`).join('')}</div><div class="tf-ed-acts">${add(w, one, arr.length >= max)}</div></div>`;
  let c = '';
  const taskF = tpl === 'schreib' || A3_TPL[tpl].o === 'a4' ? '' : `<label class="f"><span>Arbeitsauftrag</span><select data-k="taskRef"><option value="">${T.length ? 'Eigener Text …' : 'Eigener Text'}</option>${T.map(([k, l]) => `<option value="${k}"${b.taskRef === k ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></label>${b.taskRef ? '' : `<label class="f"><span class="sr">Eigener Arbeitsauftrag</span><textarea data-k="task" rows="2" placeholder="${tpl === 'placemat' ? 'Frage oder Aufgabe für die Mitte' : 'optional'}">${esc(tfStr(b.task))}</textarea></label>`}`;
  if (tpl === 'annot') { const ML = a3MatList(); c = `<label class="f"><span>Material</span><select data-k="mat">${ML.length ? ML.map(([k, l]) => `<option value="${k}"${(b.mat || ML[0][0]) === k ? ' selected' : ''}>${esc(l)}</option>`).join('') : '<option value="">Noch kein Material</option>'}</select></label>
      <div class="f"><span>Farblegende</span><div class="tf-ed-list">${b.legend.map((x, i) => `<div class="a3-leg-ed"><b style="background:${A3_COLORS[i][0]}" title="${A3_COLORS[i][1]}"></b>${inp(`legend.${i}`, x, [A3_COLORS[i][1] + ', z. B. Nähe-Signale', A3_COLORS[i][1] + ', z. B. Distanz', A3_COLORS[i][1], A3_COLORS[i][1]][i])}</div>`).join('')}</div><small class="hint">Leere Farben erscheinen mit einer Linie zum Selbst-Eintragen. Zeilen und Zeilennummern sind dieselben wie auf dem Arbeitsblatt, nur mit doppeltem Zeilenabstand.</small></div>`; }
  else if (tpl === 'placemat') c = `<div class="f"><span>Personen</span><div class="seg sm" role="group" aria-label="Personen">${[3, 4, 5, 6].map(n => `<button type="button" data-act="a3-n" data-v="${n}" aria-pressed="${+b.n === n}">${n}</button>`).join('')}</div></div>`;
  else if (tpl === 'schreib') c = `<label class="f"><span>Impuls in der Mitte</span><textarea data-k="impulse" rows="3" placeholder="leer = Zitat des Blatts oder Aufgabe">${esc(tfStr(b.impulse))}</textarea></label>${fText('rules', 'Regeln', b.rules, A3_RULES(state.sheet.meta.anrede === 'du'))}${taskF ? '' : ''}`;
  else if (tpl === 'plakat') c = list('sections', 'Felder', 'Feld', b.sections, i => 'Feld ' + (i + 1), 1, 6);
  else if (tpl === 'procon') c = `<div class="row">${fText('pcPro', 'Linke Seite', b.pcPro, 'Pro')}${fText('pcCon', 'Rechte Seite', b.pcCon, 'Contra')}</div>
      <div class="f"><span>Bild in der Mitte</span>${b.src ? `<div class="st-img"><img src="${esc(b.src)}" alt=""><button class="link" type="button" data-act="st-img-del">Bild entfernen</button></div>` : ''}<input type="file" accept="image/*" data-act="img" aria-label="${b.src ? 'Bild ersetzen' : 'Bild wählen'}"><small class="hint">${b.src ? 'Wird in das Feld gedruckt.' : 'Ohne Bild bleibt ein Rahmen frei zum Aufkleben, mit Maßangabe.'}</small></div>
      <div class="row"><label class="f"><span>Breite (cm)</span><input type="number" data-k="pcW" min="4" max="38" step="0.5" value="${esc(b.pcW)}"></label><label class="f"><span>Höhe (cm)</span><input type="number" data-k="pcH" min="3" max="26" step="0.5" value="${esc(b.pcH)}"></label></div>
      <div class="f"><span>Größe schnell</span><div class="seg sm" role="group" aria-label="Bildgröße">${[['Postkarte', 15, 10.5], ['A6', 10.5, 14.8], ['A5 quer', 21, 14.8], ['Groß', 28, 20]].map(([l, w, h]) => `<button type="button" data-act="pc-size" data-w="${w}" data-h="${h}" aria-pressed="${+b.pcW === w && +b.pcH === h}">${l}</button>`).join('')}</div></div>
      ${b.src ? `<div class="f"><span>Bild im Feld</span><div class="seg sm" role="group"><button type="button" data-act="pc-fit" data-v="contain" aria-pressed="${b.pcFit !== 'cover'}">ganz zeigen</button><button type="button" data-act="pc-fit" data-v="cover" aria-pressed="${b.pcFit === 'cover'}">Feld füllen</button></div></div>` : ''}
      <label class="f"><span>Bildbeschreibung</span><textarea data-k="pcCap" rows="3" placeholder="steht unter dem Bild, z. B. Bildunterschrift oder kurze Beschreibung">${esc(tfStr(b.pcCap))}</textarea></label>
      ${fText('pcSrc', 'Bildquelle', b.pcSrc, 'z. B. Foto: …, Lizenz')}
      <label class="f"><span>Infotext oben</span><textarea data-k="pcInfo" rows="2" placeholder="optional: kurzer Hintergrund oder die Streitfrage">${esc(tfStr(b.pcInfo))}</textarea></label>
      <div class="pc-opts"><b class="pc-oh">Gestaltung</b>
        ${pcSeg(b, 'rule', 'Schreibfläche')}${b.pcRule !== 'none' ? pcSeg(b, 'gap', 'Abstand') : ''}${pcSeg(b, 'col', 'Farben')}${pcSeg(b, 'ttl', 'Titelgröße')}${pcSeg(b, 'pos', 'Bildfeld')}${pcSeg(b, 'frame', 'Bildrahmen')}
        <div class="f"><span>Blatt</span><div class="seg sm" role="group" aria-label="Ausrichtung"><button type="button" data-act="pc-set" data-k="pcHoch" data-v="" aria-pressed="${!b.pcHoch}">A3 quer</button><button type="button" data-act="pc-set" data-k="pcHoch" data-v="1" aria-pressed="${!!b.pcHoch}">A3 hoch</button></div></div>
        <div class="chks">${fCheck('pcSym', 'Plus- und Minuszeichen', b.pcSym)}${fCheck('pcName', 'Feld für Name oder Gruppe', b.pcName)}${fCheck('pcFaz', 'Fazit-Feld unten', b.pcFaz)}</div>
        ${b.pcFaz ? fText('pcFazT', 'Überschrift Fazit', b.pcFazT, 'Fazit') : ''}</div>`;
  else if (tpl === 'vergleich') { const mt = a3MatList(); c = list('cols', 'Spalten', 'Spalte', b.cols, i => mt[i] ? 'leer = ' + mt[i][1] : 'z. B. Text ' + String.fromCharCode(65 + i), 2, 4) + list('aspects', 'Aspekte', 'Aspekt', b.aspects, () => 'z. B. Sprache', 1, 10); }
  else if (tpl === 'experte') c = list('experts', 'Expertenthemen', 'Thema', b.experts, i => 'Thema ' + String.fromCharCode(65 + i), 2, 6);
  else c = a4Editor(b, tpl, inp, del, add);
  return `<div class="f"><span>Vorlage</span><div class="tf-tpls" role="group" aria-label="Vorlage">${Object.entries(A3_TPL).filter(([, x]) => (x.o === 'a4') === (a3Fmt(b) === 'a4')).map(([k, x]) => `<button type="button" class="tf-tp" data-act="a3-tpl" data-v="${k}" aria-pressed="${tpl === k}" title="${esc(x.d)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${x.ic}</svg><span>${x.label}</span></button>`).join('')}</div></div>
    <small class="hint">${esc(A3_TPL[tpl].d)}. ${A3_TPL[tpl].o === 'a4' ? 'A4 hoch' : A3_TPL[tpl].o === 'q' ? 'A3 quer' : 'A3 hoch'}.</small>
    ${fText('title', 'Überschrift', b.title, state.sheet.meta.title || 'Überschrift')}
    ${taskF}
    <div class="tf-ed">${c}${a3G(b) ? a3GEditor(b, tpl) : ''}</div>
    <div class="tf-ed-acts main"><button class="btn sm" type="button" data-act="a3-show">In der Vorschau zeigen</button><small class="hint">Steht nicht auf dem Arbeitsblatt.</small></div>`;
}
// Folienübergänge (vorerst nur im Admin-Konto): über die View-Transitions-Schnittstelle des Browsers
const PR_VT = { none: 'Keiner', fade: 'Überblenden', morph: 'Morphen', push: 'Schieben', zoom: 'Zoom' };
const presVT = () => { if (!ADM.is || !document.startViewTransition) return ''; const t = state.prefs && state.prefs.trans; return PR_VT[t] && t !== 'none' ? t : ''; };
const presHead = (kick, head, chips) => { if (!head) { head = kick; kick = ''; } return `<div class="pr-top"><div class="pr-hd">${kick ? `<span class="pr-kick">${kick}</span>` : ''}<div class="pr-ttl">${head || ''}</div></div>${chips ? `<span class="pr-chips">${chips}</span>` : ''}</div>`; };
// Arbeitsauftrag auf Folien: ein Schritt je Satz oder Zeile, Operator mit Anrede fett, Material- und Zeilenangaben hervorgehoben
const PR_ABBR = /^(?:\p{L}|\d+|bzw|ggf|vgl|ca|bspw|usw|etc|nr|abb|kap|evtl|sog|insb|inkl|jh|jhd|hrsg|bd|str)$/iu;
function taskSteps(tt) {
  const s = String(tt || '').replace(/\r/g, '').trim(); if (!s) return [];
  if (/\n/.test(s)) return s.split(/\n+/).map(x => x.trim().replace(/^[-•]\s+/, '')).filter(Boolean);
  const out = []; let last = 0; const re = /[.!?][“”"»)]?(?=\s+[„"»(*_]*[A-ZÄÖÜ])/g; let mm;
  while ((mm = re.exec(s))) {
    const w = (s.slice(last, mm.index).match(/([\p{L}\d]+)$/u) || [])[1] || '';
    if (s[mm.index] === '.' && mm[0].length === 1 && PR_ABBR.test(w) && !(/^\d+$/.test(w) && /^\s+\**\p{Lu}[\p{Ll}-]+\**\s+(?:Sie|du|ihr)\b/u.test(s.slice(mm.index + 1)))) continue;
    out.push(s.slice(last, mm.index + mm[0].length).trim()); last = mm.index + mm[0].length;
  }
  out.push(s.slice(last).trim());
  return out.filter(Boolean);
}
const prSie = h => h.replace(/<\/b>(\s+)(Sie|du|ihr)(?=[\s,.;:!?]|$)/g, '$1$2</b>');
const prRefs = h => h.split(/(<[^>]+>)/).map(x => (x.charAt(0) === '<' ? x : x.replace(/(^|[^\p{L}\d])((?:M|Q|D)\s?\d+[a-z]?|(?:Z|V)\.\s?\d+(?:\s?[–-]\s?\d+)?|Abb\.\s?\d+)(?![\p{L}\d])/gu, (_, a, r) => a + '<span class="pr-ref">' + r.replace(/\s/g, '\u00a0') + '</span>'))).join('');
const prImp = x => (/^\*\*/.test(x) ? x : x.replace(/^([„"]?)(\p{Lu}[\p{Ll}-]+)(\s+)(Sie|du|ihr)(?![\p{L}])/u, '$1**$2$3$4**'));
const prStepsOf = (it, m) => taskSteps(taskText(it, m)).map(x => prRefs(prSie(inlineHTML(prImp(x)))));
// Arbeitsauftrag wie auf dem Arbeitsblatt: ein Absatz, Zeilenumbrüche bleiben, keine Aufteilung in Sätze
const prLinesRaw = (it, m) => String(taskText(it, m) || '').replace(/\r/g, '').trim().split(/\n+/).map(x => x.trim()).filter(Boolean);
const prLinesOf = (it, m) => prLinesRaw(it, m).map(x => prRefs(prSie(inlineHTML(prImp(x)))));
// Aufgaben mit Spiegelstrichen oder a)/1.-Unterpunkten: Einleitung als Absatz, Unterpunkte eingerückt wie auf dem Arbeitsblatt
const PR_SUB_B = /^[-•*–]\s+/, PR_SUB_N = /^(\d{1,2}[.)]|[a-z][.)])\s+/i;
const prTaskHTML = (it, m) => {
  const L = String(taskText(it, m) || '').replace(/\r/g, '').trim().split(/\n+/).map(x => x.trim()).filter(Boolean);
  if (L.length > 1 && L.some(x => PR_SUB_B.test(x) || PR_SUB_N.test(x))) {
    const fx = x => prRefs(prSie(inlineHTML(prImp(x)))); let h = '', grp = null; const close = () => { if (grp) { h += `</${grp}>`; grp = null; } };
    L.forEach(x => { const b = PR_SUB_B.test(x), n = !b && PR_SUB_N.test(x); const g = b ? 'ul' : n ? 'ol' : null;
      if (g !== grp) { close(); if (g) { h += g === 'ul' ? '<ul class="pr-subl">' : '<ol class="pr-subl pr-subn">'; grp = g; } }
      if (b) h += `<li>${fx(x.replace(PR_SUB_B, ''))}</li>`; else if (n) { const mk = x.match(PR_SUB_N)[1]; h += `<li><b class="pr-mk">${esc(mk)}</b>${fx(x.replace(PR_SUB_N, ''))}</li>`; } else h += `<p class="pr-lead">${fx(x)}</p>`; });
    close(); return h;
  }
  const st = prLinesOf(it, m); return st.length ? `<p>${st.join('<br>')}</p>` : ''; };
// Zeit einer Aufgabenfolie: Zeilen nacheinander, Gruppenspalten parallel (längste Gruppe)
// Zeit einer Aufgabenfolie = Zeit des Bausteins; nebeneinanderstehende Gruppen-Bausteine laufen parallel (längster zählt)
const tsMin = s => { const by = {}; s.items.forEach(x => { by[x.bid] = x.bmin || 0; }); const v = Object.values(by); return v.length > 1 ? Math.max(0, ...v) : (v[0] || 0); };
const tsTimer = s => ((s.items.find(x => x.btimer) || {}).btimer || '');
const prMin = s => (s.k === 'tasks' ? tsMin(s) : s.k === 'step' ? itMin(s.b) : 0);
const tsHaAll = s => s.items.every(x => itPh(x.it) === 'ha');
const tsArb = s => { const f = s.items.map(x => arbOf(x.it).join(',')); return f.length && f.every(x => x === f[0]) ? arbOf(s.items[0].it) : []; };
const tsSoz = s => { const z = [...new Set(s.items.map(x => x.it.soz).filter(k => SOZ[k]))]; return z.length === 1 && s.items.every(x => x.it.soz === z[0]) ? z[0] : ''; };
const tsCols = s => s.segs.reduce((a, g) => (g.t === 'cols' ? Math.max(a, g.cols.length) : a), 0);
function tsKick(s, m) {
  const its = s.items; const nos = its.map(x => x.no).filter(Boolean); const cons = nos.every((n, i) => !i || n === nos[i - 1] + 1); const one = its.length === 1 ? its[0] : null; const ng = tsCols(s);
  const num = tsHaAll(s) || !nos.length ? '' : nos.length === 1 ? 'Aufgabe ' + nos[0] : 'Aufgaben ' + (cons ? nos[0] + '–' + nos[nos.length - 1] : nos.join(', '));
  return [num, ng ? ng + ' Gruppen parallel' : '', one && one.g ? grpName(m, one.g) : '', one && one.it.tag ? one.it.tag : ''].filter(Boolean).join(' · ');
}
const tsHead = s => (tsHaAll(s) ? 'Hausaufgabe' : s.items.length > 1 ? 'Arbeitsaufträge' : 'Arbeitsauftrag');
// Zusatzzeile je Aufgabe, wenn mehrere auf der Folie stehen: Gruppe, Etikett, Sozialform und Phase (wenn verschieden), Zeit
function tsMeta(x, s, m, col) {
  if (s.items.length < 2) return '';
  const sozU = tsSoz(s); const phD = (s.phs || []).length > 1;
  return [!col && x.g ? grpName(m, x.g) : '', x.it.tag && (!col || tfStr(x.it.tag).trim() !== col.sub) ? x.it.tag : '', !sozU && SOZ[x.it.soz] ? SOZ[x.it.soz].label : '', !tsArb(s).length && arbOf(x.it).length ? arbOf(x.it).map(k => ARB[k].label).join(', ') : '', phD && itPh(x.it) ? PHASEN[itPh(x.it)].label : ''].filter(Boolean).join(' · ');
}
const tsLab = (x, s, m) => [s.items.length > 1 ? (itPh(x.it) === 'ha' ? 'Hausaufgabe' : x.no ? 'Aufgabe ' + x.no : 'Auftrag') : '', x.g ? grpName(m, x.g) : ''].filter(Boolean).join(' · ');
// Größe des Timers auf den Folien (Standard für alle Stunden, mit dem Konto gespeichert)
const TM_SIZES = { s: { label: 'klein', px: 24, pt: 14, h: 0.4 }, m: { label: 'mittel', px: 34, pt: 18, h: 0.52 }, l: { label: 'groß', px: 46, pt: 22, h: 0.64 }, xl: { label: 'sehr groß', px: 64, pt: 30, h: 0.84 } };
// Anzeige des Timers auf den Folien: Restminuten, Endzeit oder beides
const TM_SHOW = { beides: { label: 'Beides', hint: '12 Min. · bis 10:35' }, timer: { label: 'Nur Timer', hint: '12 Min.' }, ende: { label: 'Nur Endzeit', hint: 'bis 10:35' } };
const tmMode = () => (TM_SHOW[state.prefs && state.prefs.tmShow] ? state.prefs.tmShow : 'beides');
const tmSize = () => TM_SIZES[state.prefs && state.prefs.tmSize] ? state.prefs.tmSize : 'l';
const tmApply = () => document.documentElement.style.setProperty('--tmf', TM_SIZES[tmSize()].px + 'px');
const PH_SIZES = { s: { label: 'klein', px: 21, h: 54, pt: 13, ih: 0.45 }, m: { label: 'mittel', px: 26, h: 62, pt: 16, ih: 0.52 }, l: { label: 'groß', px: 31, h: 72, pt: 19, ih: 0.6 }, xl: { label: 'sehr groß', px: 37, h: 84, pt: 22, ih: 0.7 } };
const phSize = meta => PH_SIZES[(meta || {}).presPhSize] || PH_SIZES.m;
// Phasenleiste: zu lange Bezeichnungen verkleinern alle Felder gleichmäßig
function phbFit(root) {
  const b = root && root.querySelector('.pr-phb'); if (!b) return;
  b.style.removeProperty('--phfit'); const sp = [...b.children]; if (!sp.length) return;
  let f = parseFloat(getComputedStyle(sp[0]).fontSize) || 26;
  for (let n = 0; n < 16 && sp.some(x => x.scrollWidth > x.clientWidth + 1); n++) { f = Math.max(10, f * 0.93); b.style.setProperty('--phfit', f.toFixed(1) + 'px'); }
}
const presBarHTML = (bar, cur) => (bar && bar.length ? `<div class="pr-phb${bar.length > 8 ? ' many' : ''}" aria-label="Phasen der Stunde">${bar.map((k, i) => `<span class="${i ? '' : 'first'}${cur && cur.includes(i) ? ' on' : ''}" style="--phc:${PHASEN[k].c}">${PHASEN[k].label}</span>`).join('')}</div>` : '');
const prPops = (tips, eh) => '<div class="pr-pops">'
  + (tips.length ? `<div class="pr-pop pr-tips" hidden>${tips.map(([g, x, n]) => `<div hidden><b>Tipp ${n}${g ? ' · ' + esc(g) : ''}:</b> ${inlineHTML(x)}</div>`).join('')}</div>` : '')
  + (eh.some(e => e[1].length) ? `<div class="pr-pop pr-eh" hidden><b>Erwartung</b>${eh.filter(e => e[1].length).map(([g, L]) => `${g ? `<div class="pr-eh-g">${esc(g)}</div>` : ''}<ul>${L.map(x => `<li>${inlineHTML(x)}</li>`).join('')}</ul>`).join('')}</div>` : '') + '</div>';
const prCk = c => String(c == null ? '' : c).replace(/^\s*\[\s*\]\s*$/, '☐').replace(/^\s*\[[xX]\]\s*$/, '☒');
function presSlideHTML(s, bar) {
  const m = state.sheet.meta; const acc = pageAcc(m).c; const barOn = !!(bar && bar.length);
  const sozChip = it => (it && SOZ[it.soz] ? `<span class="pr-chip"><img src="${sozURI(it.soz, acc, pageAcc(m).t || '#fff')}" alt="">${SOZ[it.soz].label}</span>` : '') + arbOf(it).map(k => `<span class="pr-chip"><img class="arb" src="${arbURI(k, acc)}" alt="">${ARB[k].label}</span>`).join('');
  const phChip = ph => (s.res ? '<span class="pr-chip res">Reserve</span>' : '') + (ph && !barOn ? `<span class="pr-chip ph" style="--phc:${PHASEN[ph].c}">${PHASEN[ph].label}</span>` : '');
  const minChip = (mn, mode) => (!mn ? '' : mode ? `<span class="pr-chip pr-timer" data-min="${mn}"${mode === 'auto' ? ' data-auto="1"' : ''} title="Timer: ${mn} Min. · anklicken oder T zum Starten und Anhalten">${mn} Min.</span>` : `<span class="pr-chip pr-min">${mn} Min.</span>`);
  switch (s.k) {
    case 'foto': return fotoSlideHTML(s);
    case 'blank': if (s.pk) return `<div class="pr-blank pr-pk pat-weiss" aria-label="Pro-und-Contra-Tafel"><div class="pr-pk-in" style="height:${s.h || 900}px;transform:translateY(${-(s.sy || 0)}px)"><h2 class="pr-pk-q${s.q ? '' : ' empty'}">${s.q ? esc(s.q) : 'Stundenfrage im Kopf der Stunde eintragen'}</h2><div class="pr-pk-h${s.either ? ' either' : ''}"><b class="pro">${esc((s.lab || [])[0] || 'Pro')}</b><b class="con">${esc((s.lab || [])[1] || 'Contra')}</b></div><div class="pr-pk-b"></div></div></div>`;
      return `<div class="pr-blank pat-${inkPatBase(s.pat)}" style="background-position:${inkBgPos(s) || '0 0'}" aria-label="${INK_TPLS[s.pat] ? 'Tafel: ' + INK_TPLS[s.pat].l : 'Leere Tafelseite'}">${inkTplSvg(s.pat).replace('<svg class="pr-tpl"', `<svg class="pr-tpl" style="transform:translateY(${-(s.sy || 0)}px)"`)}</div>`;
    case 'abhead': return `<div class="pr-body pr-tbody"><div class="pr-nr ab"><b>${esc(s.lab)}</b></div><div class="pr-h1 sm">${inlineHTML(s.title || '')}</div>${s.topic ? `<div class="pr-sub">${esc(deQuoteStr(s.topic))}</div>` : ''}</div>`;
    case 'title': { if (state.sheet.abs) { const A = stABs(); return `<div class="pr-body pr-tbody"><div class="pr-h1">${esc(stTitle(state.sheet))}</div><div class="pr-sub">${A.map(x => esc(abLabel(x.meta, x.k) + ': ' + plainText(x.meta.title || ''))).join('<br>')}</div><div class="pr-course">${esc([m.course, m.school].filter(Boolean).join(' · '))}</div></div>`; } }
      return `<div class="pr-body pr-tbody">${m.nr ? `<div class="pr-nr"><small>AB</small><b>${esc(m.nr)}</b></div>` : ''}<div class="pr-h1">${inlineHTML(m.title || 'Arbeitsblatt')}</div>${m.topic ? `<div class="pr-sub">${esc(deQuoteStr(m.topic))}</div>` : ''}<div class="pr-course">${esc([m.course, m.school].filter(Boolean).join(' · '))}</div></div>`;
    case 'mat': {
      let h = ''; s.lines.forEach((l, i) => { if (i && (l.st || (l.h && !s.lines[i - 1].h))) h += '<span class="pr-gap"></span><span class="pr-gap"></span>'; h += `<span class="pr-ln">${esc(l.num)}</span><span class="pr-lt${l.h ? ' pr-mh' : ''}">${esc(l.t)}</span>`; });
      return presHead(esc(s.tag), inlineHTML(matTitle(s.b) || '') + (s.of > 1 ? ` <small>${s.part}/${s.of}</small>` : ''), '') + `<div class="pr-body"><div class="pr-fit pr-lines${s.poem ? ' poem' : ''}">${h}</div></div>${s.part === s.of && s.b.source ? `<div class="pr-src">${inlineHTML(s.b.source)}</div>` : ''}`;
    }
    case 'tasks': {
      const multi = s.items.length > 1; const mn = tsMin(s); const sz = tsSoz(s);
      const item = (x, col) => { const meta = tsMeta(x, s, m, col); return `<div class="pr-it">${multi ? `<span class="pr-no${x.no || itPh(x.it) === 'ha' ? '' : ' fo'}">${itPh(x.it) === 'ha' ? 'HA' : x.no || '•'}</span>` : ''}<div class="pr-itb pr-task">${prTaskHTML(x.it, m)}${arbHints(x.it).map(h => `<div class="pr-ihint">${esc(h)}</div>`).join('')}${meta ? `<div class="pr-imeta">${esc(meta)}</div>` : ''}</div></div>`; };
      const body = s.segs.map(g => g.t === 'rows' ? `<div class="pr-rows">${g.items.map(x => item(x)).join('')}</div>`
        : (() => { const n = g.cols.length, nc = n <= 3 ? n : n === 4 ? 2 : 3; return `<div class="pr-cols nc${nc}" style="--nc:${nc}">${g.cols.map(c => `<div class="pr-col"><div class="pr-col-h"><b>${esc(c.name)}</b>${c.sub ? `<span>${esc(c.sub)}</span>` : ''}</div>${c.items.map(x => item(x, c)).join('')}</div>`).join('')}</div>`; })()).join('');
      const tips = []; s.items.forEach(x => tipsOf(x.it).forEach((t, j) => tips.push([tsLab(x, s, m), t, j + 1])));
      // Think-Pair-Share: dezent oben rechts als Dreischritt; beim Präsentieren hebt ein Klick den aktuellen Schritt hervor
      const tps = s.items.some(x => x.it.soz === 'tps') ? `<span class="pr-chip pr-tps" role="list" aria-label="Think-Pair-Share" title="Think-Pair-Share · Klick auf einen Schritt hebt ihn hervor">${[['ea', 'Think'], ['pa', 'Pair'], ['pl', 'Share']].map(([k, t], i) => `<span class="pr-tps-s" role="listitem" data-tps="${i}"><img src="${sozURI(k, acc, pageAcc(m).t || '#fff')}" alt="">${t}</span>`).join('<i class="pr-tps-a" aria-hidden="true">›</i>')}</span>` : '';
      return presHead(esc(tsKick(s, m)), tsHead(s), tps + sozChip({ soz: sz === 'tps' ? '' : sz, arb: tsArb(s) }) + phChip(s.ph) + minChip(mn, tsTimer(s)))
        + `<div class="pr-body"><div class="pr-fit pr-tset${multi ? ' multi' : ''}">${body}</div></div>`
        + prPops(tips, s.items.map(x => [tsLab(x, s, m), ehLines(x.it)]));
    }
    case 'step': {
      const b = s.b, ph = itPh(b), mn = itMin(b); const later = s.fol === 'quiz' && s.qi > 0; const chips = later ? '' : sozChip(b) + phChip(ph) + minChip(mn, b.timer); const pops = later ? '' : prPops([], [['', ehLines(b)]]);
      const qr = tfStr(b.link).trim() ? `<div class="pr-st-qr"><img src="${QR.dataURL(tfStr(b.link).trim(), 8)}" alt="QR-Code"><span>${esc(linkShort(b.link))}</span></div>` : ''; const hq = qr ? ' has-qr' : '';
      const head = tfStr(b.head).trim() ? inlineHTML(b.head) : esc(stepHeadDef(b));
      if (s.fol === 'titel') return (chips ? presHead('', '', chips) : '') + `<div class="pr-body pr-zw${hq}"><div class="pr-zw-h">${head}</div>${tfStr(b.text).trim() ? `<div class="pr-zw-t">${inlineHTML(b.text)}</div>` : ''}${qr}</div>` + pops;
      if (s.fol === 'zitat') return `<div class="pr-body st-zitat${hq}"><div class="pr-fit pr-quote"><div class="pr-q">${parasHTML(b.quote)}</div>${b.author ? `<div class="pr-auth">${inlineHTML(b.author)}</div>` : ''}</div>${qr}</div>` + pops;
      if (s.fol === 'video') { const v = ytInfo(b);
        return presHead('', b.cap ? inlineHTML(b.cap) : 'Video', chips) + `<div class="pr-body pr-vidb">${tfStr(b.text).trim() ? `<div class="pr-yt-auf">${inlineHTML(b.text)}</div>` : ''}<div class="pr-yt" data-yt="${esc(v.id)}" data-src="${esc(ytEmbed(v, true))}"><div class="pr-yt-ph"><span class="pr-yt-go" role="button" tabindex="0" aria-label="Video abspielen"><svg viewBox="0 0 68 48" aria-hidden="true"><path d="M66.5 7.7c-.8-2.9-2.5-5.4-5.4-6.2C55.8.1 34 0 34 0S12.2.1 6.9 1.5C4 2.3 2.3 4.8 1.5 7.7.1 13 0 24 0 24s.1 11 1.5 16.3c.8 2.9 2.5 5.4 5.4 6.2C12.2 47.9 34 48 34 48s21.8-.1 27.1-1.5c2.9-.8 4.6-3.3 5.4-6.2C67.9 35 68 24 68 24s-.1-11-1.5-16.3z" fill="#E33"/><path d="M45 24 27 14v20" fill="#fff"/></svg></span><span class="pr-yt-t">Video abspielen${v.st || v.en ? ` <small>${v.st ? ytFmt(v.st) : '0:00'}${v.en ? '–' + ytFmt(v.en) : ''}</small>` : ''}</span><span class="pr-yt-s">Lädt erst beim Klick von YouTube</span></div><div class="pr-yt-qr"><img src="${QR.dataURL(v.watch, 8)}" alt="QR-Code zum Video"><span>${esc(linkShort(v.watch))}</span></div></div></div>` + pops; }
      if (s.fol === 'bild') return (b.cap ? presHead('', inlineHTML(b.cap), chips) : '') + `<div class="pr-body pr-imgb${hq}"><img class="pr-img" src="${esc(b.src)}" alt="${esc(plainText(b.cap || 'Bild'))}">${qr}</div>` + pops;
      if (s.fol === 'quiz') { const x = s.qz; const open = x.t === 'open'; const O = x.o.map((o, j) => [o, j]).filter(([o]) => tfStr(o).trim());
        const body = open ? `<div class="qz-q">${inlineHTML(x.q)}</div>${tfStr(x.a).trim() ? `<div class="qz-a" data-st="1"><small>Lösung</small>${parasHTML(x.a)}</div>` : ''}`
          : `<div class="qz-q">${inlineHTML(x.q)}</div><ol class="qz-o${O.length > 2 ? ' four' : ''}">${O.map(([o, j]) => `<li${j === x.ok ? ' class="ok"' : ''}><b>${QZ_L[j]}</b><span>${inlineHTML(o)}</span>${j === x.ok ? '<i class="qz-mark" data-st="1">✓</i>' : '<i class="qz-dim" data-st="1"></i>'}</li>`).join('')}</ol>`;
        return presHead(esc(`Frage ${s.qi + 1} von ${s.qn}`), head, chips) + `<div class="pr-body${hq}"><div class="pr-fit pr-qz">${body}</div>${s.qi === 0 ? qr : ''}</div>` + pops; }
      if (s.fol === 'frage') { const q = tfStr(m.frage).trim(); return presHead('', head, chips) + `<div class="pr-body${hq}"><div class="pr-fit pr-sq"><div class="pr-sq-q${q ? '' : ' empty'}">${q ? inlineHTML(q) : 'Stundenfrage noch nicht eingetragen'}</div>${tfStr(b.text).trim() ? `<div class="pr-task pr-sq-t">${prTaskHTML(b, m)}</div>` : ''}</div>${qr}</div>` + pops; }
      const xq = b.exit ? stepQs(b) : [];
      return presHead('', head, chips) + `<div class="pr-body${hq}"><div class="pr-fit pr-task">${prTaskHTML(b, m)}${xq.length ? `<ol class="pr-xq">${xq.map(q => `<li>${inlineHTML(q)}</li>`).join('')}</ol>` : ''}</div>${qr}</div>` + pops;
    }
    case 'tafel': { const cl = tfTpl(s.b) === 'cluster' && !tfStr(s.b.center).trim(); return presHead('Tafelbild', !cl && tfStrip(s.b.title || '').trim() ? inlineHTML(tfStrip(s.b.title)) : '', '') + `<div class="pr-body"><div class="pr-fit pr-tafel">${tafelHTML(cl ? s.b : { ...s.b, title: '' }, { gaps: false, steps: true })}</div></div>`; }
    case 'info': return presHead(esc(s.b.kind || 'Info'), inlineHTML(s.b.title || ''), '') + `<div class="pr-body"><div class="pr-fit pr-info">${parasHTML(s.b.text || '')}</div></div>`;
    case 'quote': return `<div class="pr-body"><div class="pr-fit pr-quote"><div class="pr-q">${parasHTML(s.b.text || '')}</div>${s.b.author ? `<div class="pr-auth">${inlineHTML(s.b.author)}</div>` : ''}</div></div>`;
    case 'image': return (s.b.caption ? presHead('', inlineHTML(s.b.caption), '') : '') + `<div class="pr-body pr-imgb"><img class="pr-img" src="${esc(s.b.src)}" alt="${esc(plainText(s.b.caption || 'Bild'))}"></div>${s.b.source ? `<div class="pr-src">${inlineHTML(s.b.source)}</div>` : ''}`;
    case 'table': { const b = s.b; return presHead('Tabelle', esc(b.title || ''), '') + `<div class="pr-body"><div class="pr-fit"><table class="pr-tbl">${b.cols.some(c => String(c).trim()) ? `<tr>${b.cols.map(c => `<th>${inlineHTML(prCk(c))}</th>`).join('')}</tr>` : ''}${(b.rows || []).map(r => `<tr>${b.cols.map((_, i) => `<td>${inlineHTML(prCk(r[i]))}</td>`).join('')}</tr>`).join('')}</table></div></div>`; }
    case 'phr': return presHead('', inlineHTML(s.b.title || 'Formulierungshilfen'), '') + `<div class="pr-body"><div class="pr-fit pr-phr">${phrGroups(s.b).map(g => `<div>${g.head ? `<b>${inlineHTML(g.head)}</b>` : ''}<ul>${g.lines.map(l => `<li>${inlineHTML(l)}</li>`).join('')}</ul></div>`).join('')}</div></div>`;
    case 'match': { const M = s.M; return presHead(s.b.sort ? 'Sortieren' : 'Zuordnen', inlineHTML(s.b.title || ''), '') + `<div class="pr-body"><div class="pr-fit pr-match"><ul>${M.left.map((x, i) => `<li><b>${i + 1}</b>${inlineHTML(x.a)}</li>`).join('')}</ul><ul>${M.right.map((x, i) => `<li><b>${String.fromCharCode(65 + i)}</b>${inlineHTML(x.b)}</li>`).join('')}</ul></div></div>`; }
    case 'qr': return presHead('', 'Digitale Fassung', '') + `<div class="pr-body pr-qrb"><img src="${QR.dataURL(s.link, 10)}" alt="QR-Code zur digitalen Fassung"><div>${esc(s.link)}</div></div>`;
  }
  return '';
}
