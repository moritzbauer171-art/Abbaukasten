/* ---------- Frühere Fassungen: Stände je Blatt in diesem Browser (IndexedDB) ----------
   Beim Öffnen und spätestens alle 10 Minuten beim Speichern wird ein Stand abgelegt.
   Behalten werden: alle Stände der letzten 24 Stunden (höchstens 24), danach einer je Tag (30 Tage). */
const FASS = (() => {
  const key = id => 'fass:' + id; const GAP = 10 * 60 * 1000; let busy = Promise.resolve();
  const sig = sh => { try { const j = JSON.stringify([sh.meta, sh.blocks, sh.abs, sh.stunde, sh.cards]); let h = 5381; for (let i = 0; i < j.length; i++) h = ((h << 5) + h + j.charCodeAt(i)) | 0; return j.length + ':' + (h >>> 0).toString(36); } catch { return ''; } };
  const thin = L => { const now = Date.now(), day = 864e5; const recent = L.filter(x => now - x.t < day).slice(-24); const seen = new Set();
    const older = L.filter(x => now - x.t >= day && now - x.t < 30 * day).filter(x => { const d = new Date(x.t).toDateString(); if (seen.has(d)) return false; seen.add(d); return true; });
    return [...older, ...recent].sort((a, b) => a.t - b.t); };
  const list = async id => ((await OFF.get(key(id))) || []).filter(x => x && x.sheet);
  // Stand ablegen; why: 'auto' (beim Speichern), 'open' (beim Öffnen), 'restore' (vor dem Wiederherstellen)
  const keep = (sh, why = 'auto', force = false) => { if (!sh || !sh.id || sh.example) return busy; const snap = clone(sh); busy = busy.then(async () => {
    const L = await list(snap.id); const last = L[L.length - 1];
    if (why === 'auto' && !force && last && Date.now() - last.t < GAP) return;
    if (last && last.sig === sig(snap) && why !== 'restore') return;
    L.push({ t: Date.now(), why, sig: sig(snap), title: stTitle(snap), n: (snap.blocks || []).length + (snap.abs || []).reduce((a, x) => a + ((x && x.blocks) || []).length, 0), sheet: snap });
    await OFF.set(key(snap.id), thin(L)); }).catch(() => {}); return busy; };
  return { keep, list, sig };
})();
const FASS_WHY = { open: 'beim Öffnen', auto: 'beim Arbeiten', restore: 'vor dem Wiederherstellen' };
async function openFass() {
  const sh = state.sheet; if (!sh) return; await FASS.keep(sh, 'auto', true);
  const L = (await FASS.list(sh.id)).reverse();
  state.dlg = { mode: 'fass', L }; renderDlg();
}
function fassHTML() {
  const L = state.dlg.L || []; const fmt = t => new Date(t).toLocaleString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  return `<h2 id="dlg-t">Frühere Fassungen</h2>
    <p class="hint" style="margin-top:-4px">Stände von „${esc(stTitle(state.sheet))}“ aus diesem Browser: beim Öffnen und alle zehn Minuten beim Arbeiten. Wiederherstellen legt den jetzigen Stand vorher ebenfalls ab – du kannst also jederzeit zurück.</p>
    ${L.length ? `<div class="cf-opts fass-l">${L.map((x, i) => `<div class="tpl fass-it"><span><b>${esc(fmt(x.t))}</b><span>${esc(relTime(x.t))} · ${esc(FASS_WHY[x.why] || '')} · ${x.n} ${x.n === 1 ? 'Baustein' : 'Bausteine'}${x.title !== stTitle(state.sheet) ? ' · „' + esc(x.title) + '“' : ''}</span></span><button type="button" class="btn sm" data-act="fass-go" data-i="${i}"${i === 0 && x.sig === FASS.sig(state.sheet) ? ' disabled title="Das ist der jetzige Stand"' : ''}>Wiederherstellen</button></div>`).join('')}</div>`
      : '<p>Für dieses Blatt gibt es in diesem Browser noch keine früheren Fassungen. Sie entstehen beim Öffnen und während du arbeitest.</p>'}
    <div class="row" style="margin-top:12px"><button class="btn" type="button" data-act="dlg-close">Schließen</button></div>`;
}
async function fassRestore(i) {
  const x = (state.dlg && state.dlg.L || [])[i]; if (!x) return; const cur = state.sheet;
  await FASS.keep(cur, 'restore');
  const sh = clone(x.sheet); sh.id = cur.id; sh.updatedAt = Date.now();
  state.dlg = null; renderDlg(); openSheet(sh, { keepArea: true }); scheduleSave();
  toast(`Fassung vom ${new Date(x.t).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} ist wiederhergestellt.`, 'Rückgängig', () => openFass());
}
