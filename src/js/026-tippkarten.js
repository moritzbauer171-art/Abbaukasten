/* ================= Tippkarten (gestufte Hilfen) ================= */
function tipCards() {
  const sh = state.sheet, meta = sh.meta; const cards = []; let t = 0; const TN = {};
  for (const b of sh.blocks) {
    if (b.type !== 'tasks') continue; t = tnAt(b, t, TN);
    const v = sheetView(); if (!blockVisible(b, v)) continue;
    for (const it of itemsFor(b, v)) { if (wxIdx(b, it, meta) <= 0) t++; const tips = tipsOf(it); tips.forEach((tx, j) => cards.push({ no: t, lvl: j + 1, of: tips.length, text: tx, grp: itGrp(b, it, meta) ? grpName(meta, itGrp(b, it, meta)) : '' })); }
  }
  return cards;
}
function layoutTipps() {
  const meta = state.sheet.meta; const a = pageAcc(meta); const cards = tipCards(); const pages = []; const host = $('#fit-host');
  for (let i = 0; i < cards.length; i += 8) {
    const pg = el(`<div class="page tk-page" data-w="210" data-h="297"><div class="tk-grid">${cards.slice(i, i + 8).map(c => `<div class="tk-card"><div class="tk-h"><b>Tipp ${c.lvl}</b><span>zu Aufgabe ${c.no}${c.grp ? ' · ' + esc(c.grp) : ''}</span></div><div class="tk-t">${inlineHTML(c.text)}</div><div class="tk-f">${esc(meta.title || '')}${c.of > 1 ? ` · Tipp ${c.lvl} von ${c.of}` : ''}</div></div>`).join('')}</div></div>`);
    pg.style.setProperty('--acc', a.c); pg.style.setProperty('--acc-tint', a.t);
    host.appendChild(pg); pg.querySelectorAll('.tk-t').forEach(n => fitDown(n)); host.removeChild(pg);
    pages.push({ pg, over: false });
  }
  return pages;
}

