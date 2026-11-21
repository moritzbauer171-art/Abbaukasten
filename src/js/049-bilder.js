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

