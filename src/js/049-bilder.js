/* ---------- Bilder ---------- */
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
async function handleImage(file, b) {
  try {
    const url = URL.createObjectURL(file); const img = await loadImg(url);
    const inDb = backend && backend.kind === 'claude';
    const max = store.assets ? 1600 : (inDb ? 1000 : 1400);
    let w = img.naturalWidth, h = img.naturalHeight; const s = Math.min(1, max / Math.max(w, h)); w = Math.round(w * s); h = Math.round(h * s);
    const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
    b.w = w; b.h = h; b.src = '';
    if (store.assets) {
      try { const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .86)); const up = await store.assets.upload(blob); b.src = up.url; b.assetId = up.id; } catch (err) { b.src = ''; }
    }
    if (!b.src) b.src = c.toDataURL('image/jpeg', inDb ? .72 : .84);
    changed(true);
  } catch { toast('Das Bild ließ sich nicht öffnen. Bitte JPG oder PNG wählen.'); }
}

// Bild aus der Zwischenablage (Strg+V / ⌘V): füllt einen leeren, gewählten Bild-Baustein, sonst neuer Bild-Baustein hinter dem gewählten
function clipImage(cd) {
  if (!cd) return null;
  const f = [...(cd.files || [])].find(x => /^image\//.test(x.type)); if (f) return f;
  for (const it of [...(cd.items || [])]) if (it.kind === 'file' && /^image\//.test(it.type)) { const g = it.getAsFile(); if (g) return g; }
  return null;
}
async function pasteImage(f) {
  const blocks = state.sheet.blocks; const cur = state.sel && state.sel !== 'meta' ? blocks.find(b => b.id === state.sel) : null;
  if (hist.timer) histCommit();
  if (cur && cur.type === 'image' && !cur.src) { await handleImage(f, cur); renderEditor(); toast('Bild aus der Zwischenablage eingefügt', 'Rückgängig', histUndo); return; }
  const nb = paletteBlock('image', 'image');
  let at = cur ? blocks.indexOf(cur) + 1 : blocks.length;
  if (!cur) { const A = state.area || 'blatt'; let li = -1; blocks.forEach((x, j) => { if (inArea(x, A) || (A === 'blatt' && x.type === 'pagebreak')) li = j; }); if (li >= 0) at = li + 1; }
  blocks.splice(at, 0, nb); state.sel = nb.id; openOnly(nb.id);
  await handleImage(f, nb); renderEditor();
  const nc = $(`#editor [data-bid="${nb.id}"]`); if (nc) nc.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  toast('Bild aus der Zwischenablage eingefügt', 'Rückgängig', histUndo);
}
document.addEventListener('paste', e => {
  if (e.defaultPrevented || !state.sheet || state.dlg || document.querySelector('.pr')) return;
  const f = clipImage(e.clipboardData); if (!f) return;
  const t = e.target; const ed = t && t.closest && t.closest('input,textarea,[contenteditable="true"],[contenteditable=""]');
  if (ed && ((e.clipboardData.getData('text/plain') || '').trim())) return; // Text mit Bild (z. B. aus Word) bleibt Text
  if ((state.area || 'blatt') !== 'blatt' && !(state.sel && (state.sheet.blocks.find(b => b.id === state.sel) || {}).type === 'image')) return;
  e.preventDefault(); pasteImage(f);
});
