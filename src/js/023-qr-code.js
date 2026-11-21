/* ================= QR-Code (eigener Kodierer: Byte-Modus, Fehlerkorrektur M, Version 1–15) ================= */
const QR = (() => {
  const EXP = new Array(512), LOG = new Array(256);
  let v = 1; for (let i = 0; i < 255; i++) { EXP[i] = v; LOG[v] = i; v <<= 1; if (v & 256) v ^= 0x11D; }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  const mul = (a, b) => (a && b) ? EXP[LOG[a] + LOG[b]] : 0;
  function rs(data, n) {
    let g = [1];
    for (let i = 0; i < n; i++) { const q = new Array(g.length + 1).fill(0); for (let j = 0; j < g.length; j++) { q[j] ^= g[j]; q[j + 1] ^= mul(g[j], EXP[i]); } g = q; }
    const r = new Array(n).fill(0);
    for (const d of data) { const f = d ^ r.shift(); r.push(0); if (f) for (let j = 0; j < n; j++) r[j] ^= mul(g[j + 1], f); }
    return r;
  }
  // [EC je Block, Blöcke Gruppe 1, Daten je Block, Blöcke Gruppe 2, Daten je Block]
  const ECM = [null, [10, 1, 16, 0, 0], [16, 1, 28, 0, 0], [26, 1, 44, 0, 0], [18, 2, 32, 0, 0], [24, 2, 43, 0, 0], [16, 4, 27, 0, 0], [18, 4, 31, 0, 0], [22, 2, 38, 2, 39], [22, 3, 36, 2, 37], [26, 4, 43, 1, 44], [30, 1, 50, 4, 51], [22, 6, 36, 2, 37], [22, 8, 37, 1, 38], [24, 4, 40, 5, 41], [24, 5, 41, 5, 42]];
  const ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70]];
  const MASKS = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x, y) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => x * y % 2 + x * y % 3 === 0,
    (x, y) => (x * y % 2 + x * y % 3) % 2 === 0, (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0];
  function encode(text) {
    const bytes = Array.from(new TextEncoder().encode(String(text)));
    let ver = 0, spec = null;
    for (let k = 1; k <= 15; k++) { const s = ECM[k]; if (4 + (k < 10 ? 8 : 16) + bytes.length * 8 <= (s[1] * s[2] + s[3] * s[4]) * 8) { ver = k; spec = s; break; } }
    if (!ver) return null;
    const dataCw = spec[1] * spec[2] + spec[3] * spec[4];
    const bb = []; const put = (val, len) => { for (let i = len - 1; i >= 0; i--) bb.push((val >>> i) & 1); };
    put(4, 4); put(bytes.length, ver < 10 ? 8 : 16); bytes.forEach(b => put(b, 8));
    put(0, Math.min(4, dataCw * 8 - bb.length));
    while (bb.length % 8) bb.push(0);
    const data = []; for (let i = 0; i < bb.length; i += 8) data.push(parseInt(bb.slice(i, i + 8).join(''), 2));
    for (let p = 0; data.length < dataCw; p++) data.push(p % 2 ? 0x11 : 0xEC);
    const blocks = []; let k = 0;
    for (let g = 0; g < 2; g++) { const cnt = spec[1 + g * 2], len = spec[2 + g * 2]; for (let i = 0; i < cnt; i++) { const d = data.slice(k, k + len); k += len; blocks.push({ d, e: rs(d, spec[0]) }); } }
    const cw = []; const maxD = Math.max(...blocks.map(b => b.d.length));
    for (let i = 0; i < maxD; i++) blocks.forEach(b => { if (i < b.d.length) cw.push(b.d[i]); });
    for (let i = 0; i < spec[0]; i++) blocks.forEach(b => cw.push(b.e[i]));
    const size = ver * 4 + 17;
    const M = Array.from({ length: size }, () => new Array(size).fill(false));
    const F = Array.from({ length: size }, () => new Array(size).fill(false));
    const set = (x, y, on) => { M[y][x] = on; F[y][x] = true; };
    for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    const finder = (cx, cy) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= size || y >= size) continue; const d = Math.max(Math.abs(dx), Math.abs(dy)); set(x, y, d !== 2 && d !== 4); } };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    const al = ALIGN[ver], n = al.length;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(al[i] + dx, al[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
    const format = mask => {
      const d = mask; let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      const bits = ((d << 10) | r) ^ 0x5412; const bit = i => ((bits >>> i) & 1) !== 0;
      for (let i = 0; i <= 5; i++) set(8, i, bit(i));
      set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
      for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
      for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
      for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
      set(8, size - 8, true);
    };
    format(0);
    if (ver >= 7) {
      let r = ver; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25);
      const bits = (ver << 12) | r;
      for (let i = 0; i < 18; i++) { const on = ((bits >>> i) & 1) !== 0; const a = size - 11 + i % 3, b = Math.floor(i / 3); set(a, b, on); set(b, a, on); }
    }
    let bi = 0; const total = cw.length * 8;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
        const x = right - j; const up = ((right + 1) & 2) === 0; const y = up ? size - 1 - vert : vert;
        if (!F[y][x] && bi < total) { M[y][x] = ((cw[bi >>> 3] >>> (7 - (bi & 7))) & 1) !== 0; bi++; }
      }
    }
    const applyMask = m => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!F[y][x] && MASKS[m](x, y)) M[y][x] = !M[y][x]; };
    const p1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], p2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
    const penalty = () => {
      let p = 0;
      for (let y = 0; y < size; y++) { let run = 1; for (let x = 1; x < size; x++) { if (M[y][x] === M[y][x - 1]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
      for (let x = 0; x < size; x++) { let run = 1; for (let y = 1; y < size; y++) { if (M[y][x] === M[y - 1][x]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1; } }
      for (let y = 0; y < size - 1; y++) for (let x = 0; x < size - 1; x++) { const c = M[y][x]; if (c === M[y][x + 1] && c === M[y + 1][x] && c === M[y + 1][x + 1]) p += 3; }
      const hits = get => { let c = 0; for (let i = 0; i + 11 <= size; i++) { let a = true, b = true; for (let q = 0; q < 11; q++) { const val = get(i + q) ? 1 : 0; if (val !== p1[q]) a = false; if (val !== p2[q]) b = false; } if (a) c++; if (b) c++; } return c; };
      for (let y = 0; y < size; y++) p += 40 * hits(i => M[y][i]);
      for (let x = 0; x < size; x++) p += 40 * hits(i => M[i][x]);
      let dark = 0; for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (M[y][x]) dark++;
      const tot = size * size; p += 10 * Math.floor(Math.abs(dark * 20 - tot * 10) / tot);
      return p;
    };
    let best = 0, bestP = Infinity;
    for (let m = 0; m < 8; m++) { applyMask(m); format(m); const p = penalty(); if (p < bestP) { bestP = p; best = m; } applyMask(m); }
    applyMask(best); format(best);
    return { size, M, ver };
  }
  const cache = new Map();
  function dataURL(text, px = 8) {
    const key = px + '|' + text; if (cache.has(key)) return cache.get(key);
    const q = encode(text); if (!q) return '';
    const n = q.size + 8; const c = document.createElement('canvas'); c.width = c.height = n * px;
    const x = c.getContext('2d'); x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#000000';
    for (let y = 0; y < q.size; y++) for (let xx = 0; xx < q.size; xx++) if (q.M[y][xx]) x.fillRect((xx + 4) * px, (y + 4) * px, px, px);
    let u = ''; try { u = c.toDataURL('image/png'); } catch {}
    if (cache.size > 40) cache.clear();
    cache.set(key, u); return u;
  }
  return { encode, dataURL };
})();

