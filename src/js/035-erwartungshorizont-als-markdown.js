/* ================= Erwartungshorizont als Markdown ================= */
const plainMd = s => plainText(s).trim();
function ehMarkdown() {
  const sh = state.sheet, m = sh.meta; const isK = m.mode === 'klausur'; const L = [];
  L.push(`# Erwartungshorizont: ${m.title || 'Ohne Titel'}`, '', [isK ? (m.exam && m.exam.label) || 'Klausur' : '', m.course, m.school, !isK && m.nr ? 'AB ' + m.nr : ''].filter(Boolean).join(' · '));
  if (m.topic && !isK) L.push('', `Thema: ${m.topic}`);
  const mtags = matTags(sh.blocks); const mats = sh.blocks.filter(b => mtags[b.id]);
  if (mats.length) { L.push('', '## Materialien', ''); mats.forEach(b => L.push(`- **${mtags[b.id]}:** ${plainMd(matTitle(b)) || 'ohne Titel'}${b.source ? ` (${plainMd(b.source)})` : ''}`)); }
  L.push('', '## Aufgaben'); let t = 0; const TN = {};
  sh.blocks.forEach(b => {
    if (b.type === 'table' && tbEhCount(b)) {
      L.push('', `### Tabelle${b.title ? ': ' + plainMd(b.title) : ''}`, '');
      b.rows.forEach((r, ri) => r.forEach((_, ci) => { const eh = tbEh(b, ri, ci); if (!eh.length) return;
        const row = plainMd(r[0] || '') || `Zeile ${ri + 1}`; const col = plainMd(b.cols[ci] || '') || `Spalte ${ci + 1}`;
        L.push(`- **${ci === 0 ? `Zeile ${ri + 1}` : row}** · ${col}: ${eh.map(plainMd).join('; ')}`); }));
      return;
    }
    if (b.type === 'material' && gapList(b).length) { L.push('', `### Lückentext${b.title ? ': ' + plainMd(b.title) : ''}`, '', gapList(b).map((x, i) => `${i + 1}. ${plainMd(x.w)}`).join(' · ')); }
    if (b.type === 'match' && b.sort) { const M = mtLayout(b); if (M.sol.length) { L.push('', `### Sortieren${b.title ? ': ' + plainMd(b.title) : ''}`, ''); M.left.forEach((c, li) => { const ws = M.sol.filter(x => x.li === li).map(x => plainMd(M.right[x.rk].b)); L.push(`- ${b.mode === 'buchstaben' ? (li + 1) + ' – ' : ''}${plainMd(c.a)}: ${ws.join(', ') || '–'}`); }); const dist = M.right.filter((_, rk) => !M.sol.some(x => x.rk === rk)); if (dist.length) L.push(`- Ablenker: ${dist.map(w => plainMd(w.b)).join(', ')}`); } return; }
    if (b.type === 'match') { const M = mtLayout(b); const ok = M.sol.filter(x => x.rk >= 0); if (ok.length) { L.push('', `### Zuordnen${b.title ? ': ' + plainMd(b.title) : ''}`, ''); ok.forEach(x => L.push(`- ${b.mode === 'buchstaben' ? x.L + ' – ' + x.R + ': ' : ''}${plainMd(M.left[x.li].a)} → ${plainMd(M.right[x.rk].b)}`)); } return; }
    if (b.type !== 'tasks') return; t = tnAt(b, t, TN); const vEH = sheetView(); if (!blockVisible(b, vEH)) return;
    const itsEH = itemsFor(b, vEH); if (itMin(b) && itsEH.length) L.push('', `_Bearbeitungszeit: ${itMin(b)} Min.${itsEH.length > 1 ? ` für die Aufgaben ${t + 1}–${t + itsEH.length}` : ''}_`);
    itsEH.forEach(it => {
      if (wxIdx(b, it, m, itsEH) <= 0) t++; const ops = detectOps(it.text); const r = opsRange(ops);
      L.push('', `### Aufgabe ${t}${wxLet(b, it, m, itsEH)}${wlTag(b, it) ? ' (' + wlTag(b, it).n + ')' : ''}${itGrp(b, it, m) ? ` (${grpName(m, itGrp(b, it, m))})` : ''}${it.tag ? ` · ${it.tag}` : ''}`, '', (plainMd(it.text) || '–').split('\n').map(l => '> ' + l).join('\n'), '');
      const info = [ops.length ? 'Operator: ' + ops.map(o => o.op).join(', ') : '', r ? 'AFB ' + afbLabel(r) : '', SOZ[it.soz] ? SOZ[it.soz].label : '', itPh(it) ? 'Phase: ' + PHASEN[itPh(it)].label : '', it.pts ? 'Gewichtung: ' + it.pts : ''].filter(Boolean).join(' · ');
      if (info) L.push(`_${info}_`, '');
      const rl = rlpOf(it); if (rl.length) L.push('**Standards**', '', ...rl.map(id => { const x = rlpInfo(id); return `- ${x.own ? '' : x.code + ': '}${x.t}`; }), '');
      const eh = ehLines(it);
      L.push('**Erwartung**', '', ...(eh.length ? eh.map(s => `- ${plainMd(s)}`) : ['- (noch offen)']));
      const tips = tipsOf(it); if (tips.length) L.push('', '**Gestufte Hilfen**', '', ...tips.map((s, j) => `${j + 1}. ${plainMd(s)}`));
    });
  });
  const tfs = sh.blocks.filter(b => b.type === 'tafel' && blockVisible(b, sheetView()));
  tfs.forEach(b => { tfNorm(b); const tpl = tfTpl(b); const md = x => plainMd(tfStrip(x)); L.push('', `## Tafelbild${tfStr(b.title).trim() ? ': ' + md(b.title) : ''}`, '', `_${TF_TPL[tpl].label}_`, '');
    if (tfRaster(b)) { const C = b.cols.length; L.push('| ' + b.cols.map(c => md(c) || ' ').join(' | ') + ' |', '|' + ' --- |'.repeat(C)); b.rows.filter(r => r.some(x => tfStr(x).trim())).forEach(r => L.push('| ' + b.cols.map((_, i) => md(r[i]) || ' ').join(' | ') + ' |')); }
    else if (tpl === 'cluster') { L.push(`**${md(b.center || b.title) || 'Mitte'}**`, ''); b.branches.filter(x => tfStr(x.h).trim() || tfStr(x.t).trim()).forEach(x => { L.push(`- **${md(x.h) || '–'}**`); tfLines(x.t).forEach(z => L.push(`  - ${md(z)}`)); }); }
    else if (tpl === 'ablauf') b.steps.filter(x => tfStr(x.h).trim() || tfStr(x.t).trim()).forEach((x, i) => L.push(`${i + 1}. ${tfStr(x.h).trim() ? `**${md(x.h)}**${tfStr(x.t).trim() ? ': ' : ''}` : ''}${md(x.t)}`));
    else if (tpl === 'skala') { L.push(`${md(b.poles.l) || 'links'} ↔ ${md(b.poles.r) || 'rechts'}`, ''); b.scale.filter(x => tfStr(x.t).trim()).forEach(x => L.push(`- ${md(x.t)} (${TF_POS[(+x.p || 3) - 1]})`)); }
    else { b.nodes.filter(x => tfStr(x.n).trim()).forEach(x => L.push(`- **${md(x.n)}**${tfStr(x.d).trim() ? ': ' + md(x.d) : ''}`)); L.push(''); b.rels.forEach(r => { const A = b.nodes[+r.a], B = b.nodes[+r.b]; if (A && B && +r.a !== +r.b) L.push(`- ${md(A.n)} → ${md(B.n)}${tfStr(r.t).trim() ? ': ' + md(r.t) : ''}`); }); }
  });
  const C = rlpCoverage([sh]); const ids = Object.keys(C.cov).sort(rlpCmp);
  if (ids.length) { L.push('', '## Bezug zum Rahmenlehrplan', '', `${C.nTagged} von ${C.nTasks} Aufgaben sind Standards zugeordnet.`, ''); ids.forEach(id => { const x = rlpInfo(id); L.push(`- ${x.own ? '(eigen) ' : '**' + x.code + '** '}${x.t} · Aufgabe ${C.cov[id].by[0].t.join(', ')}`); }); }
  return L.join('\n') + '\n';
}
async function exportEH() { await deliver(fileBase() + '_Erwartungshorizont.md', new Blob([ehMarkdown()], { type: 'text/markdown' })); }

