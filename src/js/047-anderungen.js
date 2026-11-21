/* ---------- Änderungen ---------- */
function target(bid) { return bid === 'meta' || bid === 'seite' || bid === 'stunde' ? state.sheet.meta : bid === 'karten' ? state.sheet : state.sheet.blocks.find(b => b.id === bid); }
function setPath(obj, path, v) { const ks = path.split('.'); let o = obj; for (let i = 0; i < ks.length - 1; i++) { if (o[ks[i]] == null || typeof o[ks[i]] !== 'object') o[ks[i]] = {}; o = o[ks[i]]; } o[ks[ks.length - 1]] = v; }
