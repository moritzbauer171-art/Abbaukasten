/* ================= Fotos von Arbeitsergebnissen: iPad/Handy als Kamera, Sicherungsfolie, nach 14 Tagen gelöscht ================= */
const FOTO_BUCKET = 'ab-fotos';
const CAM_ID = (() => { try { return new URLSearchParams(location.search).get('kamera') || ''; } catch { return ''; } })();
const fotoOK = () => !!(store.sb && store.user && backend && backend.kind === 'supabase');
// Live-Kanal je Konto (privat): iPad ↔ Präsentation
const fotoCh = { ch: null, uid: '', h: new Set(), ok: false };
function fotoChannel() {
  if (!fotoOK()) return null; if (fotoCh.ch && fotoCh.uid === store.user.id) return fotoCh.ch;
  try { if (fotoCh.ch) store.sb.removeChannel(fotoCh.ch); } catch {}
  const ch = store.sb.channel('lw-foto:' + store.user.id, { config: { broadcast: { self: false, ack: false }, private: true } });
  ch.on('broadcast', { event: 'f' }, ({ payload }) => fotoHand(payload || {}));
  ch.subscribe(st => { fotoCh.ok = st === 'SUBSCRIBED'; });
  fotoCh.ch = ch; fotoCh.uid = store.user.id; return ch;
}
// Jede Nachricht kann doppelt ankommen (Live-Kanal im Internet und Direktverbindung): Kennung merken, zweites Exemplar verwerfen
const fotoSeen = { s: new Set(), q: [] };
function fotoHand(m) {
  if (m && m._i) { if (fotoSeen.s.has(m._i)) return; fotoSeen.s.add(m._i); fotoSeen.q.push(m._i); if (fotoSeen.q.length > 800) fotoSeen.s.delete(fotoSeen.q.shift()); }
  fotoCh.h.forEach(f => { try { f(m || {}); } catch (e) { console.error(e); } });
}
const fotoSend = msg => { if (!msg._i) msg._i = Math.random().toString(36).slice(2, 11); const ch = fotoChannel(); if (ch) try { ch.send({ type: 'broadcast', event: 'f', payload: msg }); } catch {} lanSend(msg); };
const fotoListen = f => { fotoChannel(); lanInit(); fotoCh.h.add(f); return () => fotoCh.h.delete(f); };
/* ---------- Direktverbindung über den Hotspot des Laptops (Windows-App) ----------
   Laptop: die App öffnet einen kleinen Server; die Seite verbindet sich mit ws://127.0.0.1.
   iPad: öffnet http://<Laptop>:<Port>/?tafel&lan=<Schlüssel> und verbindet sich mit demselben Server. Kein Konto nötig. */
const LAN_T = (() => { try { return new URLSearchParams(location.search).get('lan') || ''; } catch { return ''; } })();
const LAN = { ws: null, url: '', info: null, init: false, retry: 0, t: 0, h: new Set() };
const lanOn = () => !!(LAN.ws && LAN.ws.readyState === 1);
const lanPage = () => !!LAN_T && location.protocol === 'http:';
function lanSend(msg) { if (!lanOn()) return false; try { LAN.ws.send(JSON.stringify(msg)); return true; } catch { return false; } }
function lanConnect(url) {
  if (!url) return; LAN.url = url; clearTimeout(LAN.t); try { if (LAN.ws) { LAN.ws.onclose = null; LAN.ws.close(); } } catch {}
  let ws; try { ws = new WebSocket(url); } catch { return; } LAN.ws = ws;
  ws.onopen = () => { LAN.retry = 0; LAN.h.forEach(f => { try { f(true); } catch {} }); };
  ws.onmessage = e => { let m = null; try { m = JSON.parse(e.data); } catch {} if (m && typeof m === 'object') fotoHand(m); };
  ws.onclose = () => { if (LAN.ws !== ws) return; LAN.h.forEach(f => { try { f(false); } catch {} }); if (LAN.url) LAN.t = setTimeout(() => lanConnect(LAN.url), Math.min(8000, 800 * ++LAN.retry)); };
  ws.onerror = () => {};
}
function lanStop() { LAN.url = ''; clearTimeout(LAN.t); try { if (LAN.ws) LAN.ws.close(); } catch {} LAN.ws = null; }
async function lanDesk(on) { const D = window.abDesktop; if (!D || !D.lan) return null; let r = null; try { r = await D.lan(on); } catch (e) { console.error(e); } LAN.info = r; if (r && r.on && r.ws) { if (LAN.url !== r.ws || !lanOn()) lanConnect(r.ws); } else if (r && !r.on) lanStop(); return r; }
function lanInit() {
  if (LAN.init) return; LAN.init = true;
  if (lanPage()) lanConnect(`ws://${location.host}/lw-ws?t=${encodeURIComponent(LAN_T)}`);
  else if (window.abDesktop && window.abDesktop.lan) lanDesk();
}
const FOTO_COLS = 'id,sheet_id,path,w,h,ink,keep,created_at,expires_at';
async function fotoList(sheetId) { const r = await store.sb.from('ab_fotos').select(FOTO_COLS).eq('sheet_id', sheetId).or('keep.eq.true,expires_at.gt.' + new Date().toISOString()).order('created_at'); if (r.error) throw r.error; return r.data || []; }
const fotoUrlC = {};
async function fotoUrl(path) { const c = fotoUrlC[path]; if (c && c.t > Date.now()) return c.u; const r = await store.sb.storage.from(FOTO_BUCKET).createSignedUrl(path, 6 * 3600); if (r.error) throw r.error; fotoUrlC[path] = { u: r.data.signedUrl, t: Date.now() + 5 * 3600e3 }; return r.data.signedUrl; }
async function fotoDelete(f) { const a = await store.sb.storage.from(FOTO_BUCKET).remove([f.path]); if (a.error) throw a.error; const b = await store.sb.from('ab_fotos').delete().eq('id', f.id); if (b.error) throw b.error; }
const fotoLeft = f => (f.keep ? 'wird behalten' : (d => (d <= 0 ? 'wird heute gelöscht' : d === 1 ? 'noch 1 Tag' : `noch ${d} Tage`))(Math.ceil((new Date(f.expires_at) - Date.now()) / 864e5)));
const fotoName = (f, i) => `Foto ${i + 1} ${new Date(f.created_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/[.:,\s]+/g, '-')}.jpg`;
async function fotoDownload(f, i) { const u = await fotoUrl(f.path); const r = await fetch(u); if (!r.ok) throw new Error('Laden fehlgeschlagen'); await deliver(fotoName(f, i || 0), await r.blob()); }
async function fotoShrink(file, max = 2000) {
  let src = null; try { src = await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch {}
  if (!src) src = await new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = URL.createObjectURL(file); });
  const w = src.width || src.naturalWidth, h = src.height || src.naturalHeight, s = Math.min(1, max / Math.max(w, h));
  const c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s); c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.82)); return { blob, w: c.width, h: c.height };
}
// ---------- Scannen: Arbeitsblatt im Foto finden, gerade ziehen und drehen ----------
async function fotoCanvas(src, max = 2000) {
  let im = null;
  if (typeof src === 'string') { im = new Image(); im.crossOrigin = 'anonymous'; await new Promise((res, rej) => { im.onload = res; im.onerror = () => rej(new Error('Bild nicht ladbar')); im.src = src; }); }
  else { try { im = await createImageBitmap(src, { imageOrientation: 'from-image' }); } catch {} if (!im) im = await new Promise((res, rej) => { const x = new Image(); x.onload = () => res(x); x.onerror = rej; x.src = URL.createObjectURL(src); }); }
  const w = im.naturalWidth || im.width, h = im.naturalHeight || im.height, s = Math.min(1, max / Math.max(w, h));
  const c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); return c;
}
const fotoBlob = (c, q = 0.85) => new Promise(r => c.toBlob(r, 'image/jpeg', q));
function fotoRot(c, dir) { const o = document.createElement('canvas'); o.width = c.height; o.height = c.width; const x = o.getContext('2d'); x.translate(o.width / 2, o.height / 2); x.rotate(dir * Math.PI / 2); x.drawImage(c, -c.width / 2, -c.height / 2); return o; }
// Ecken sortieren: oben links, oben rechts, unten rechts, unten links
const fotoQuad = P => { const s = P.map(p => p[0] + p[1]), d = P.map(p => p[0] - p[1]); const at = (a, f) => P[a.indexOf(f(...a))]; return [at(s, Math.min), at(d, Math.max), at(s, Math.max), at(d, Math.min)]; };
// Das hellste, wenig farbige große Feld im Bild ist das Blatt; seine äußersten Punkte sind die Ecken
function fotoDetect(c) {
  const k = Math.min(1, 320 / Math.max(c.width, c.height)), W = Math.max(8, Math.round(c.width * k)), H = Math.max(8, Math.round(c.height * k)), N = W * H;
  const t = document.createElement('canvas'); t.width = W; t.height = H; const x = t.getContext('2d', { willReadFrequently: true }); x.drawImage(c, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data, L = new Uint8Array(N), S = new Float32Array(N), hist = new Uint32Array(256);
  for (let i = 0; i < N; i++) { const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b); L[i] = (0.299 * r + 0.587 * g + 0.114 * b) | 0; S[i] = mx ? (mx - mn) / mx : 0; hist[L[i]]++; }
  let sum = 0; for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sB = 0, wB = 0, best = -1, thr = 128; for (let i = 0; i < 256; i++) { wB += hist[i]; if (!wB) continue; const wF = N - wB; if (!wF) break; sB += i * hist[i]; const mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF); if (v > best) { best = v; thr = i; } }
  const M = new Uint8Array(N); for (let i = 0; i < N; i++) M[i] = L[i] > thr && S[i] < 0.38 ? 1 : 0;
  const lab = new Int32Array(N), st = new Int32Array(N), ctr = (H >> 1) * W + (W >> 1); let id = 0, bestId = 0, bestScore = 0;
  for (let i = 0; i < N; i++) { if (!M[i] || lab[i]) continue; id++; let n = 0, sp = 0, hit = false; st[sp++] = i; lab[i] = id;
    while (sp) { const p = st[--sp]; n++; if (p === ctr) hit = true; const px = p % W; const nb = [px > 0 ? p - 1 : -1, px < W - 1 ? p + 1 : -1, p - W, p + W]; for (const q of nb) if (q >= 0 && q < N && M[q] && !lab[q]) { lab[q] = id; st[sp++] = q; } }
    const sc = n * (hit ? 1.6 : 1); if (sc > bestScore) { bestScore = sc; bestId = id; } }
  if (!bestId) return null;
  let n = 0, a = [1e9, -1e9, -1e9, -1e9], P = [null, null, null, null];
  for (let i = 0; i < N; i++) { if (lab[i] !== bestId) continue; n++; const px = i % W, py = (i / W) | 0, s = px + py, df = px - py;
    if (s < a[0]) { a[0] = s; P[0] = [px, py]; } if (df > a[1]) { a[1] = df; P[1] = [px + 1, py]; } if (s > a[2]) { a[2] = s; P[2] = [px + 1, py + 1]; } if (-df > a[3]) { a[3] = -df; P[3] = [px, py + 1]; } }
  const fr = n / N; if (fr < 0.12 || fr > 0.985) return null;
  const Q = P.map(p => [p[0] / k, p[1] / k]); const area = Math.abs(Q.reduce((s2, p, i) => { const q = Q[(i + 1) % 4]; return s2 + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
  if (area < 0.1 * c.width * c.height) return null; return Q;
}
function fotoHomog(src, dst) {
  const A = [], B = []; for (let i = 0; i < 4; i++) { const [x, y] = src[i], [X, Y] = dst[i]; A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]); B.push(X); A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]); B.push(Y); }
  for (let c = 0; c < 8; c++) { let m = c; for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[m][c])) m = r; [A[c], A[m]] = [A[m], A[c]]; [B[c], B[m]] = [B[m], B[c]];
    for (let r = 0; r < 8; r++) { if (r === c) continue; const f = A[r][c] / A[c][c]; for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k]; B[r] -= f * B[c]; } }
  return B.map((b, i) => b / A[i][i]).concat(1);
}
// echtes Seitenverhältnis des Blatts trotz Schrägaufnahme (Zhang & He, Whiteboard-Scanning); sonst Kantenlängen
function fotoAspect(Q, cw, ch) {
  const u0 = cw / 2, v0 = ch / 2; const m = [Q[0], Q[1], Q[3], Q[2]].map(([x, y]) => [x - u0, y - v0, 1]);
  const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], dt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const k2 = dt(cr(m[0], m[3]), m[2]) / dt(cr(m[1], m[3]), m[2]), k3 = dt(cr(m[0], m[3]), m[1]) / dt(cr(m[2], m[3]), m[1]);
  const n2 = m[1].map((v, i) => k2 * v - m[0][i]), n3 = m[2].map((v, i) => k3 * v - m[0][i]);
  let r;
  if (Math.abs(n2[2]) < 1e-6 || Math.abs(n3[2]) < 1e-6) r = Math.sqrt((n2[0] ** 2 + n2[1] ** 2) / (n3[0] ** 2 + n3[1] ** 2));
  else { const f2 = -(n2[0] * n3[0] + n2[1] * n3[1]) / (n2[2] * n3[2]); if (!(f2 > 0)) return null; r = Math.sqrt((n2[0] ** 2 / f2 + n2[1] ** 2 / f2 + n2[2] ** 2) / (n3[0] ** 2 / f2 + n3[1] ** 2 / f2 + n3[2] ** 2)); }
  return isFinite(r) && r > 0.2 && r < 5 ? r : null;
}
function fotoWarp(c, Q, max = 2000) {
  const ds = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]); let W = Math.max(ds(Q[0], Q[1]), ds(Q[3], Q[2])), H = Math.max(ds(Q[0], Q[3]), ds(Q[1], Q[2]));
  { let r = fotoAspect(Q, c.width, c.height) || W / H; const A4 = Math.SQRT1_2; if (Math.abs(r / A4 - 1) < 0.09) r = A4; else if (Math.abs(r * A4 - 1) < 0.09) r = 1 / A4; const A = W * H; W = Math.sqrt(A * r); H = W / r; } // nahe an A4: genau A4
  const s = Math.min(1, max / Math.max(W, H)); W = Math.max(8, Math.round(W * s)); H = Math.max(8, Math.round(H * s));
  const h = fotoHomog([[0, 0], [W, 0], [W, H], [0, H]], Q); const sw = c.width, sh = c.height;
  const src = c.getContext('2d').getImageData(0, 0, sw, sh).data; const o = document.createElement('canvas'); o.width = W; o.height = H; const ox = o.getContext('2d'); const od = ox.createImageData(W, H), D = od.data;
  for (let v = 0; v < H; v++) for (let u = 0; u < W; u++) {
    const den = h[6] * u + h[7] * v + 1; let x = (h[0] * u + h[1] * v + h[2]) / den, y = (h[3] * u + h[4] * v + h[5]) / den;
    x = Math.max(0, Math.min(sw - 1.001, x)); y = Math.max(0, Math.min(sh - 1.001, y)); const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0, i0 = (y0 * sw + x0) * 4, i1 = i0 + sw * 4, j = (v * W + u) * 4;
    for (let ch = 0; ch < 3; ch++) D[j + ch] = (src[i0 + ch] * (1 - fx) + src[i0 + 4 + ch] * fx) * (1 - fy) + (src[i1 + ch] * (1 - fx) + src[i1 + 4 + ch] * fx) * fy;
    D[j + 3] = 255; }
  ox.putImageData(od, 0, 0); return o;
}
// Foto ersetzen (gedreht oder zugeschnitten): neue Datei, alte weg, Präsentation bekommt Bescheid
async function fotoReplace(f, blob, w, h, ink) {
  const dir = f.path.split('/').slice(0, -1).join('/'); const path = `${dir}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const up = await store.sb.storage.from(FOTO_BUCKET).upload(path, blob, { contentType: 'image/jpeg', upsert: false }); if (up.error) throw up.error;
  const r = await store.sb.from('ab_fotos').update({ path, w, h, ink }).eq('id', f.id); if (r.error) throw r.error;
  try { await store.sb.storage.from(FOTO_BUCKET).remove([f.path]); } catch {}
  Object.assign(f, { path, w, h, ink }); const msg = { t: 'upd', id: f.id, sheet: f.sheet_id, path, w, h, ink };
  fotoCh.h.forEach(fn => { try { fn(msg); } catch {} }); fotoSend(msg); return f;
}
async function fotoRotate(f, dir = 1) {
  const c = fotoRot(await fotoCanvas(await fotoUrl(f.path), 4000), dir);
  const ink = (f.ink || []).map(s => ({ ...s, p: (s.p || []).map((v, i, a) => (i % 2 ? (dir > 0 ? a[i - 1] : 1 - a[i - 1]) : (dir > 0 ? 1 - a[i + 1] : a[i + 1]))).map(v => +v.toFixed(4)) }));
  return fotoReplace(f, await fotoBlob(c), c.width, c.height, ink);
}
async function fotoUpload(sheetId, file, pre) {
  const { blob, w, h } = pre || await fotoShrink(file);
  const path = `${store.user.id}/${String(sheetId).replace(/[^\w-]/g, '_').slice(0, 60)}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const up = await store.sb.storage.from(FOTO_BUCKET).upload(path, blob, { contentType: 'image/jpeg', upsert: false }); if (up.error) throw up.error;
  const r = await store.sb.from('ab_fotos').insert({ sheet_id: sheetId, path, w, h }).select(FOTO_COLS).single(); if (r.error) throw r.error; return r.data;
}
const tafelUrl = () => { const u = new URL(location.protocol === 'https:' && !isFramed ? location.href : 'https://moritzbauer171-art.github.io/Abbaukasten/'); u.search = '?tafel'; u.hash = ''; return u.href; };
const camUrl = sheetId => { const u = new URL(location.protocol === 'https:' && !isFramed ? location.href : 'https://moritzbauer171-art.github.io/Abbaukasten/'); u.search = '?kamera=' + encodeURIComponent(sheetId); u.hash = ''; return u.href; };
// Ansicht (Zoom) und Striche eines Fotos: Zoomstufe s ≥ 1 und Mittelpunkt cx/cy als Anteil des Bildes; Striche in Bildanteilen
// Zoom nutzt die ganze Bildfläche: ist das vergrößerte Foto breiter (höher) als die Fläche, wird es dort verschoben, sonst mittig
const fotoTf = (v, W, H, VW = W, VH = H) => { const s = Math.max(1, Math.min(8, v.fw ? VW / W : +v.s || 1)), sw = W * s, sh = H * s; let tx = VW / 2 - (v.cx ?? 0.5) * sw, ty = VH / 2 - (v.cy ?? 0.5) * sh; tx = sw <= VW ? (VW - sw) / 2 : Math.min(0, Math.max(VW - sw, tx)); ty = sh <= VH ? (VH - sh) / 2 : Math.min(0, Math.max(VH - sh, ty)); return { s, tx, ty }; };
const fotoInkSvg = (ink, w, h) => { const H = Math.round(1000 * h / w); return `<svg class="lf-ink" viewBox="0 0 1000 ${H}" preserveAspectRatio="none" aria-hidden="true">${(ink || []).map(s => `<polyline points="${(s.p || []).map((v, i) => (i % 2 ? v * H : v * 1000).toFixed(1)).join(' ')}" stroke="${/^#[0-9a-f]{6}$/i.test(s.c) ? s.c : '#E5484D'}" stroke-width="${Math.max(1, Math.min(40, +s.w || 6))}"${s.h ? ' stroke-opacity=".42"' : ''} fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`; };

// ---------- Kameramodus auf iPad/Handy (?kamera=<Stunde>) ----------
function camInit(SID = CAM_ID, O = {}) {
  if (!O.host) document.body.classList.add('cam-mode');
  if (!O.host) try { const vp = document.querySelector('meta[name="viewport"]'); if (vp) vp.content = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover'; let tc = document.querySelector('meta[name="theme-color"]'); if (!tc) { tc = document.createElement('meta'); tc.name = 'theme-color'; document.head.appendChild(tc); } tc.content = '#1c1c1e'; } catch {}
  // iPad-App-Aufbau: Navigationsleiste oben, Bühne, Werkzeugleiste unten (mit Rand für Home-Balken und Kamera)
  const I = {
    back: '<path d="M15 5l-7 7 7 7"/>', fs: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', fsx: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
    lib: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/>',
    hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v7c0 4-2.5 7-6.5 7-2.6 0-4-1.2-5.6-3.6L3.4 13.6a1.5 1.5 0 0 1 2.4-1.8L8 14.5"/>',
    pen: '<path d="M4 20l1.2-4.4L16.5 4.3a2 2 0 0 1 2.8 0l.4.4a2 2 0 0 1 0 2.8L8.4 18.8z"/><path d="M14.5 6.3l3.2 3.2"/>',
    hl: '<path d="M9 14l-3 3v3h3l3-3"/><path d="M9 14l7.5-9.5a2 2 0 0 1 3 0l1 1a2 2 0 0 1 0 3L12 17z"/><path d="M3 21h8" opacity=".6"/>',
    laser: '<circle cx="12" cy="12" r="3.2" fill="currentColor"/><circle cx="12" cy="12" r="7.5" opacity=".45"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>', more: '<circle cx="5.5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18.5" cy="12" r="1.4" fill="currentColor"/>',
    rot: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>', rotl: '<path d="M4 11a8 8 0 1 1 2.3 5.7"/><path d="M4 4v7h7"/>',
    crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M2 6h14a2 2 0 0 1 2 2v14"/>', zoom: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4M8 11h6"/>',
    dl: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', tv: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M4 12h16"/>', full: '<rect x="4" y="4" width="16" height="16" rx="1.5"/>', fw: '<path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4"/>'
  };
  const ic = (k, s = 24) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;
  const root = el(`<div id="cam-root"><nav class="cam-nav"><div class="cam-nl"></div><div class="cam-nt"><b>Fotos</b><small class="cam-t">wird geladen …</small></div><div class="cam-nr"></div></nav><main class="cam-m"></main><div class="cam-tip" hidden></div><footer class="cam-bar"></footer></div>`);
  if (O.host) root.classList.add('in-hub'); (O.host || document.body).appendChild(root); const main = root.querySelector('.cam-m'), bar = root.querySelector('.cam-bar'), nl = root.querySelector('.cam-nl'), nr = root.querySelector('.cam-nr'), nb = root.querySelector('.cam-nt b');
  let fotos = [], cur = null, view = { s: 1, cx: 0.5, cy: 0.5 }, shown = false, title = '';
  const msg = h => { main.innerHTML = `<div class="cam-msg">${h}</div>`; bar.innerHTML = ''; };
  const nav = (left, head, right) => { const tp = root.querySelector('.cam-tip'); if (tp) tp.hidden = true; nl.innerHTML = left || ''; nb.textContent = head; nr.innerHTML = right || ''; };
  // kurze Hinweise oben auf der Bühne; jeder nur die ersten Male
  let tipT = 0; const tip = (k, t) => { let n = 0; try { n = +localStorage.getItem('abw.camtip.' + k) || 0; } catch {} if (n >= 3) return; try { localStorage.setItem('abw.camtip.' + k, n + 1); } catch {} const e = root.querySelector('.cam-tip'); e.textContent = t; e.hidden = false; clearTimeout(tipT); tipT = setTimeout(() => { e.hidden = true; }, 4200); };
  // Vollbild: auf dem iPad über die Vollbild-Schnittstelle, beim ersten Antippen automatisch; auf dem iPhone geht das nur über „Zum Home-Bildschirm“
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  const fsCan = () => !O.host && !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen) && !matchMedia('(display-mode: standalone)').matches && !navigator.standalone;
  const fsGo = on => { try { if (on) { const d = document.documentElement; const p = (d.requestFullscreen || d.webkitRequestFullscreen).call(d); if (p && p.catch) p.catch(() => {}); } else (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch {} };
  const fsPref = () => { try { return localStorage.getItem('abw.camfs') !== '0'; } catch { return true; } };
  const fsBtn = () => (fsCan() ? `<button type="button" class="cam-nb ic" data-c="fs" aria-label="${fsEl() ? 'Vollbild beenden' : 'Vollbild'}">${ic(fsEl() ? 'fsx' : 'fs', 22)}</button>` : '');
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(ev => document.addEventListener(ev, () => { const b = root.querySelector('[data-c="fs"]'); if (b) b.outerHTML = fsBtn(); setTimeout(() => lay(), 60); }));
  root.addEventListener('pointerdown', () => { if (fsCan() && fsPref() && !fsEl() && !root.dataset.fsTried) { root.dataset.fsTried = '1'; fsGo(true); } }, { capture: true });
  const ready = async () => {
    if (!store.user) { nav('', 'LehrWerk', ''); msg('<p>Bitte melde dich mit deinem LehrWerk-Konto an.</p><button type="button" class="cam-btn" data-c="login">Anmelden</button>'); return; }
    try { const r = await store.sb.from('ab_arbeitsblaetter').select('title').eq('id', SID).maybeSingle(); title = (r.data && r.data.title) || 'Stunde'; } catch { title = 'Stunde'; }
    root.querySelector('.cam-t').textContent = title; fotoChannel();
    try { fotos = await fotoList(SID); } catch { fotos = []; }
    list();
  };
  // Übersicht: Raster der Fotos, unten Auslöser (Kamera) und Mediathek
  const list = async () => {
    cur = null; shown = false; root.dataset.screen = 'list';
    nav('', 'Fotos', fsBtn());
    main.innerHTML = fotos.length ? `<div class="cam-grid">${fotos.slice().reverse().map(f => `<button type="button" class="cam-th" data-c="open" data-id="${f.id}"><img alt="" data-p="${esc(f.path)}"><small>${fotoLeft(f)}</small></button>`).join('')}</div>`
      : `<div class="cam-empty">${ic('scan', 56)}<b>Noch keine Fotos zu dieser Stunde</b><span>Tippe unten auf den Auslöser. LehrWerk findet das Arbeitsblatt im Foto und schneidet es gerade zu.</span></div>`;
    bar.innerHTML = `<label class="cam-bi"><input type="file" accept="image/*" multiple hidden data-in="lib">${ic('lib')}<span>Mediathek</span></label>
      <label class="cam-shot" aria-label="Foto aufnehmen"><input type="file" accept="image/*" capture="environment" hidden data-in="cam"><span class="cam-ring"></span></label>
      <span class="cam-bi cam-cnt"><b>${fotos.length}</b><span>${fotos.length === 1 ? 'Foto' : 'Fotos'}</span></span>`;
    main.querySelectorAll('img[data-p]').forEach(async im => { try { im.src = await fotoUrl(im.dataset.p); } catch {} });
    bar.querySelectorAll('input[type="file"]').forEach(inp => inp.addEventListener('change', async e => {
      const fs = [...(e.target.files || [])]; if (!fs.length) return;
      try { let last = null; for (const f of fs) { const pre = await camEdit(f); if (!pre) continue; nav('', 'Fotos', ''); msg('<div class="cam-spin"></div><p>Wird hochgeladen …</p>'); last = await fotoUpload(SID, null, pre); fotos.push(last); fotoSend({ t: 'new', sheet: SID, id: last.id }); } if (last) open(last.id); else list(); }
      catch (err) { console.error(err); msg(`<p>Das Hochladen hat nicht geklappt.</p><p class="cam-err">${esc(err.message || String(err))}</p><button type="button" class="cam-btn" data-c="back">Zurück</button>`); }
    }));
    tip('list', 'Neue Fotos erscheinen in der Präsentation zuerst nur bei dir. Auf den Beamer kommen sie mit „Zeigen“.');
  };
  // Zuschneiden wie in der Fotos-App: oben Abbrechen und Fertig, unten Drehen und Erkennen
  const camEdit = src => new Promise(async done => {
    root.dataset.screen = 'crop'; nav('', 'Zuschneiden', ''); msg('<div class="cam-spin"></div><p>Arbeitsblatt wird gesucht …</p>');
    let c; try { c = await fotoCanvas(src, 2600); } catch (err) { console.error(err); done(null); return; }
    const full = () => [[0, 0], [c.width, 0], [c.width, c.height], [0, c.height]];
    let q = fotoDetect(c), auto = !!q; if (!q) q = full();
    nav('<button type="button" class="cam-nb" data-e="x">Abbrechen</button>', 'Zuschneiden', '<button type="button" class="cam-nb strong" data-e="ok">Fertig</button>');
    main.innerHTML = `<div class="cam-crop"><canvas></canvas><svg class="cam-cq" preserveAspectRatio="none"></svg>${[0, 1, 2, 3].map(i => `<i class="cam-hd" data-i="${i}"></i>`).join('')}<span class="cam-ch">${auto ? 'Arbeitsblatt erkannt – Ecken bei Bedarf verschieben' : 'Kein Blatt erkannt – Ecken an das Blatt ziehen'}</span></div>`;
    bar.innerHTML = `<button type="button" class="cam-bi" data-e="rl">${ic('rotl')}<span>Links</span></button><button type="button" class="cam-bi" data-e="rr">${ic('rot')}<span>Rechts</span></button><button type="button" class="cam-bi" data-e="auto">${ic('scan')}<span>Blatt suchen</span></button><button type="button" class="cam-bi" data-e="full">${ic('full')}<span>Ganzes Foto</span></button>`;
    const box = main.querySelector('.cam-crop'), cv = box.querySelector('canvas'), svg = box.querySelector('svg'), hs = [...box.querySelectorAll('.cam-hd')]; let g = { k: 1, ox: 0, oy: 0 };
    const paint = () => { cv.width = c.width; cv.height = c.height; cv.getContext('2d').drawImage(c, 0, 0); svg.setAttribute('viewBox', `0 0 ${c.width} ${c.height}`); lay2(); };
    const lay2 = () => { const bw = box.clientWidth - 40, bh = box.clientHeight - 40, k = Math.min(bw / c.width, bh / c.height); g = { k, ox: 20 + (bw - c.width * k) / 2, oy: 20 + (bh - c.height * k) / 2 };
      [cv, svg].forEach(e => { e.style.cssText = `left:${g.ox}px;top:${g.oy}px;width:${c.width * k}px;height:${c.height * k}px`; });
      const pts = q.map(p => p.map(v => v.toFixed(1)).join(',')).join(' '); const sw = Math.max(c.width, c.height) / 300;
      svg.innerHTML = `<path d="M0 0H${c.width}V${c.height}H0Z M${q.map(p => p.join(' ')).join(' L')}Z" fill="rgba(0,0,0,.6)" fill-rule="evenodd"/><polygon points="${pts}" fill="none" stroke="#fff" stroke-width="${sw}"/>`;
      hs.forEach((h, i) => { h.style.transform = `translate(${g.ox + q[i][0] * k}px,${g.oy + q[i][1] * k}px)`; }); };
    hs.forEach(h => { h.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try { h.setPointerCapture(e.pointerId); } catch {} h.classList.add('on'); });
      h.addEventListener('pointermove', e => { if (!h.classList.contains('on')) return; const r = box.getBoundingClientRect(), i = +h.dataset.i; q[i] = [Math.max(0, Math.min(c.width, (e.clientX - r.left - g.ox) / g.k)), Math.max(0, Math.min(c.height, (e.clientY - r.top - g.oy) / g.k))]; lay2(); });
      const up = () => h.classList.remove('on'); h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up); });
    const ro = new ResizeObserver(() => lay2()); ro.observe(box);
    const fin = v => { ro.disconnect(); root.removeEventListener('click', onClick); done(v); };
    const onClick = async e => { const b = e.target.closest('[data-e]'); if (!b) return; e.stopPropagation(); const a = b.dataset.e;
      if (a === 'x') fin(null);
      else if (a === 'full') { q = full(); lay2(); }
      else if (a === 'auto') { const d2 = fotoDetect(c); if (d2) { q = d2; lay2(); } else toast('Kein Blatt gefunden. Die Ecken lassen sich von Hand setzen.'); }
      else if (a === 'rl' || a === 'rr') { const dir = a === 'rr' ? 1 : -1, H0 = c.height, W0 = c.width; c = fotoRot(c, dir); q = fotoQuad(q.map(([x, y]) => (dir > 0 ? [H0 - y, x] : [y, W0 - x]))); paint(); }
      else if (a === 'ok') { b.disabled = true; b.textContent = 'Moment …'; await new Promise(r => setTimeout(r, 30));
        const isFull = q.every((p, i) => Math.hypot(p[0] - full()[i][0], p[1] - full()[i][1]) < 2); let o = isFull ? c : fotoWarp(c, fotoQuad(q));
        if (Math.max(o.width, o.height) > 2000) { const s = 2000 / Math.max(o.width, o.height), t = document.createElement('canvas'); t.width = Math.round(o.width * s); t.height = Math.round(o.height * s); t.getContext('2d').drawImage(o, 0, 0, t.width, t.height); o = t; }
        fin({ blob: await fotoBlob(o), w: o.width, h: o.height }); } };
    root.addEventListener('click', onClick); paint();
  });
  // Betrachter: Foto randlos, unten Werkzeuge wie bei Markierungen auf dem iPad, alles live auf dem Beamer
  const TOOLS = [['hand', 'Bewegen'], ['pen', 'Stift'], ['hl', 'Marker'], ['laser', 'Laser']];
  const COLS = { pen: ['#FF453A', '#0A84FF', '#30D158', '#FFFFFF', '#1C1C1E'], hl: ['#FFE14D', '#7CF29B', '#7FD3FF', '#FF9EC7'] };
  let tool = 'hand', colP = '#FF453A', colH = '#FFE14D';
  const colsHTML = () => (COLS[tool] ? COLS[tool].map(c => `<button type="button" class="cam-col" data-c="col" data-v="${c}" style="--cc:${c}" aria-pressed="${c === (tool === 'hl' ? colH : colP)}" aria-label="Farbe"></button>`).join('') : '');
  const toolSync = () => { root.querySelectorAll('[data-c="tool"]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === tool))); const cs = root.querySelector('.cam-cols'); if (cs) { cs.innerHTML = colsHTML(); cs.hidden = !COLS[tool]; } const v = main.querySelector('.cam-v'); if (v) v.dataset.tool = tool; };
  const showSync = () => { const b = root.querySelector('[data-c="show"]'); if (!b) return; b.innerHTML = `${ic('tv', 18)}<span>${shown ? 'Auf dem Beamer' : 'Zeigen'}</span>`; b.classList.toggle('on', shown); b.setAttribute('aria-pressed', String(shown)); const v = main.querySelector('.cam-v'); if (v) v.classList.toggle('live', shown); };
  const fwSync = () => { const b = root.querySelector('[data-c="fw"]'); if (b) b.setAttribute('aria-pressed', String(!!view.fw)); };
  const sheet = on => { const s = root.querySelector('.cam-sheet'); if (!s) return; s.hidden = !on; root.querySelector('.cam-scrim').hidden = !on; };
  const open = async id => {
    const f = fotos.find(x => x.id === id); if (!f) return list(); cur = f; view = { s: 1, cx: 0.5, cy: 0.5 }; root.dataset.screen = 'view';
    const i = fotos.indexOf(f) + 1;
    nav(`<button type="button" class="cam-nb" data-c="back">${ic('back', 22)}<span>Fotos</span></button>`, `Foto ${i} von ${fotos.length}`, `${fsBtn()}<button type="button" class="cam-live" data-c="show" aria-pressed="false"></button>`);
    main.innerHTML = `<div class="cam-v" data-tool="${tool}"><div class="cam-w"><img alt="Foto"><div class="cam-svg"></div></div><i class="cam-dot" hidden></i></div>
      <div class="cam-cols" ${COLS[tool] ? '' : 'hidden'}>${colsHTML()}</div>
      <div class="cam-scrim" hidden data-c="nosheet"></div><div class="cam-sheet" hidden role="menu"><div class="cam-sg">
        <button type="button" data-c="rot" role="menuitem">${ic('rot', 22)}<span>Drehen</span></button><button type="button" data-c="crop" role="menuitem">${ic('crop', 22)}<span>Neu zuschneiden</span></button>
        <button type="button" data-c="zoom0" role="menuitem">${ic('zoom', 22)}<span>Zoom zurücksetzen</span></button><button type="button" data-c="dl" role="menuitem">${ic('dl', 22)}<span>Herunterladen</span></button>
        <button type="button" data-c="clear" class="red" role="menuitem">${ic('trash', 22)}<span>Alle Striche löschen</span></button></div>
        <div class="cam-sg"><button type="button" data-c="nosheet" class="strong"><span>Abbrechen</span></button></div></div>`;
    bar.innerHTML = `<div class="cam-seg" role="group" aria-label="Werkzeug">${TOOLS.map(([k, l]) => `<button type="button" class="cam-bi" data-c="tool" data-v="${k}" aria-pressed="${k === tool}">${ic(k)}<span>${l}</span></button>`).join('')}</div>
      <span class="cam-div"></span><button type="button" class="cam-bi" data-c="fw" aria-pressed="false" title="Foto auf die ganze Breite vergrößern, auf dem Beamer und hier">${ic('fw')}<span>Breite</span></button><button type="button" class="cam-bi" data-c="undo">${ic('undo')}<span>Zurück</span></button><button type="button" class="cam-bi" data-c="more" aria-haspopup="menu">${ic('more')}<span>Mehr</span></button>`;
    const im = main.querySelector('img'); im.src = await fotoUrl(f.path); await im.decode().catch(() => {});
    lay(); bind(); showSync(); tip('view', 'Zwei Finger zoomen und verschieben, doppelt tippen vergrößert. „Zeigen“ oben rechts bringt das Foto auf den Beamer.');
  };
  const box = () => { const v = main.querySelector('.cam-v'); const W0 = v.clientWidth, H0 = v.clientHeight, r = cur.w / cur.h; let W = W0, H = W0 / r; if (H > H0) { H = H0; W = H0 * r; } return { v, W, H, ox: 0, oy: 0, VW: W0, VH: H0 }; };
  const inkDraw = () => { const s = main.querySelector('.cam-svg'); if (s) s.innerHTML = fotoInkSvg(cur.ink, cur.w, cur.h); };
  const lay = () => { if (!cur || !main.querySelector('.cam-w')) return; const b = box(); const w = main.querySelector('.cam-w'); const t = fotoTf(view, b.W, b.H, b.VW, b.VH); w.style.cssText = `width:${b.W}px;height:${b.H}px;left:${b.ox}px;top:${b.oy}px;transform:translate(${t.tx}px,${t.ty}px) scale(${t.s})`; inkDraw(); };
  const thr = (fn, ms) => { let t = 0, last = 0, a = null; return (...x) => { a = x; const now = Date.now(); if (now - last >= ms) { last = now; fn(...a); } else if (!t) t = setTimeout(() => { t = 0; last = Date.now(); fn(...a); }, ms - (now - last)); }; };
  const sendView = thr(() => { if (shown && cur) fotoSend({ t: 'view', id: cur.id, v: view }); }, 50);
  const sendStk = thr(s => { if (shown && cur) fotoSend({ t: 'stk', id: cur.id, s }); }, 45);
  const sendLas = thr((x, y) => { if (shown && cur) fotoSend({ t: 'las', id: cur.id, x: +x.toFixed(4), y: +y.toFixed(4) }); }, 30);
  let inkT = 0; const saveInk = () => { if (shown) fotoSend({ t: 'ink', id: cur.id, ink: cur.ink || [] }); clearTimeout(inkT); const f = cur; inkT = setTimeout(() => store.sb.from('ab_fotos').update({ ink: f.ink || [] }).eq('id', f.id).then(() => {}), 800); };
  const bind = () => {
    const v = main.querySelector('.cam-v'), dot = v.querySelector('.cam-dot'); const P = new Map(); let g = null, stroke = null, las = false, lastTap = 0;
    const frac = (x, y) => { const b = box(), r = v.getBoundingClientRect(), t = fotoTf(view, b.W, b.H, b.VW, b.VH); return [((x - r.left - b.ox) - t.tx) / (b.W * t.s), ((y - r.top - b.oy) - t.ty) / (b.H * t.s)]; };
    const mid = () => { const pts = [...P.values()]; return pts.reduce((a, p) => [a[0] + p.x / pts.length, a[1] + p.y / pts.length], [0, 0]); };
    const gStart = () => { const pts = [...P.values()], c = mid(); g = { d: pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0, v: { ...view }, f: frac(c[0], c[1]) }; };
    const lasOff = () => { if (!las) return; las = false; dot.hidden = true; if (shown) fotoSend({ t: 'las', id: cur.id, off: 1 }); };
    const lasAt = e => { const r = v.getBoundingClientRect(); dot.hidden = false; dot.style.transform = `translate(${e.clientX - r.left}px,${e.clientY - r.top}px)`; const [fx, fy] = frac(e.clientX, e.clientY); sendLas(fx, fy); };
    v.addEventListener('pointerdown', e => {
      e.preventDefault(); try { v.setPointerCapture(e.pointerId); } catch {} P.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (P.size > 1) { if (stroke) { cur.ink.pop(); stroke = null; inkDraw(); if (shown) fotoSend({ t: 'ink', id: cur.id, ink: cur.ink || [] }); } lasOff(); gStart(); return; }
      if (tool === 'pen' || tool === 'hl') { const [fx, fy] = frac(e.clientX, e.clientY); const k = Math.random().toString(36).slice(2, 8); stroke = tool === 'hl' ? { k, c: colH, w: 30, h: 1, p: [+fx.toFixed(4), +fy.toFixed(4)] } : { k, c: colP, w: 6, p: [+fx.toFixed(4), +fy.toFixed(4)] }; (cur.ink = cur.ink || []).push(stroke); return; }
      if (tool === 'laser') { las = true; lasAt(e); return; }
      const now = Date.now(); if (now - lastTap < 300) { const [fx, fy] = frac(e.clientX, e.clientY); view = view.fw || view.s > 1.2 ? { s: 1, cx: .5, cy: .5 } : { s: 2.5, cx: fx, cy: fy }; lay(); sendView(); fwSync(); lastTap = 0; return; } lastTap = now;
      gStart();
    });
    v.addEventListener('pointermove', e => {
      if (!P.has(e.pointerId)) return; P.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (stroke) { const [fx, fy] = frac(e.clientX, e.clientY); const n = stroke.p.length; if (Math.hypot(fx - stroke.p[n - 2], fy - stroke.p[n - 1]) > 0.002 && n < 4000) { stroke.p.push(+fx.toFixed(4), +fy.toFixed(4)); inkDraw(); sendStk(stroke); } return; }
      if (las) { lasAt(e); return; }
      if (!g) return; const pts = [...P.values()], c = mid();
      const b = box(), s0 = fotoTf(g.v, b.W, b.H, b.VW, b.VH).s; let s = s0; const fw = !!g.v.fw && pts.length < 2; if (pts.length > 1 && g.d) s = Math.max(1, Math.min(8, s0 * Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) / g.d));
      if (s <= 1.01 && pts.length < 2) return;
      // der Punkt unter den Fingern bleibt unter den Fingern
      const r = v.getBoundingClientRect(); const px = c[0] - r.left - b.ox, py = c[1] - r.top - b.oy;
      const tx = px - g.f[0] * b.W * s, ty = py - g.f[1] * b.H * s; view = { ...(fw ? { fw: 1 } : {}), s, cx: (b.VW / 2 - tx) / (b.W * s), cy: (b.VH / 2 - ty) / (b.H * s) }; fwSync(); lay(); sendView();
    });
    const up = e => { P.delete(e.pointerId); if (stroke) { stroke = null; saveInk(); } if (P.size === 0) { g = null; lasOff(); } else gStart(); };
    v.addEventListener('pointerup', up); v.addEventListener('pointercancel', up);
  };
  window.addEventListener('resize', () => lay());
  const reshow = () => { shown = true; showSync(); fotoSend({ t: 'show', id: cur.id, sheet: SID, v: view, ink: cur.ink || [] }); };
  root.addEventListener('click', async e => {
    const b = e.target.closest('[data-c]'); if (!b) return; const c = b.dataset.c;
    if (c === 'login') openDlg('login');
    else if (c === 'fs') { const on = !fsEl(); try { localStorage.setItem('abw.camfs', on ? '1' : '0'); } catch {} fsGo(on); }
    else if (c === 'back') { if (shown) fotoSend({ t: 'hide' }); try { fotos = await fotoList(SID); } catch {} list(); }
    else if (c === 'open') open(b.dataset.id);
    else if (c === 'show') { shown = !shown; showSync(); fotoSend(shown ? { t: 'show', id: cur.id, sheet: SID, v: view, ink: cur.ink || [] } : { t: 'hide' }); }
    else if (c === 'tool') { tool = b.dataset.v; toolSync(); if (tool === 'laser' && !shown) tip('laser', 'Den Laser sieht die Klasse, sobald das Foto auf dem Beamer läuft („Zeigen“ oben rechts).'); }
    else if (c === 'col') { if (tool === 'hl') colH = b.dataset.v; else colP = b.dataset.v; toolSync(); }
    else if (c === 'undo') { if (cur.ink && cur.ink.length) { cur.ink.pop(); inkDraw(); saveInk(); } }
    else if (c === 'more') sheet(true);
    else if (c === 'nosheet') sheet(false);
    else if (c === 'clear') { sheet(false); if (!cur.ink || !cur.ink.length) return; if (confirm('Alle Striche auf diesem Foto löschen?')) { cur.ink = []; inkDraw(); saveInk(); } }
    else if (c === 'zoom0') { sheet(false); view = { s: 1, cx: .5, cy: .5 }; lay(); sendView(); fwSync(); }
    else if (c === 'fw') { view = view.fw ? { s: 1, cx: .5, cy: .5 } : { fw: 1, cx: .5, cy: 0 }; lay(); sendView(); fwSync(); }
    else if (c === 'dl') { sheet(false); try { await fotoDownload(cur, fotos.indexOf(cur)); } catch { toast('Herunterladen hat nicht geklappt.'); } }
    else if (c === 'rot') { sheet(false); const sh = shown; msg('<div class="cam-spin"></div><p>Wird gedreht …</p>'); try { await fotoRotate(cur, 1); } catch (err) { console.error(err); toast('Drehen hat nicht geklappt.'); } await open(cur.id); if (sh) reshow(); }
    else if (c === 'crop') { sheet(false); const f = cur, sh = shown; if ((f.ink || []).length && !confirm('Beim Zuschneiden gehen die Striche auf dem Foto verloren. Trotzdem zuschneiden?')) return; let pre = null; try { pre = await camEdit(await fotoUrl(f.path)); } catch {} if (pre) { msg('<div class="cam-spin"></div><p>Wird gespeichert …</p>'); try { await fotoReplace(f, pre.blob, pre.w, pre.h, []); } catch (err) { console.error(err); toast('Speichern hat nicht geklappt.'); } } await open(f.id); if (sh) reshow(); }
  });
  // warten, bis die Anmeldung geklärt ist
  let last = null; const poll = setInterval(() => { const u = store.user ? store.user.id : (store.sb ? 'none' : null); if (u && u !== last) { last = u; ready(); } }, 400);
  setTimeout(() => { if (!store.sb && !last) msg('<p>LehrWerk ist gerade nicht erreichbar. Bitte prüfe die Internetverbindung.</p>'); }, 12000);
  return { destroy: () => { clearInterval(poll); root.remove(); } };
}


// ---------- Fotos einer Stunde verwalten (Präsentation und Editor) ----------
function fotoPanelHTML(sheetId, fotos, mode) {
  const qr = (() => { try { return QR.dataURL(camUrl(sheetId), 5); } catch { return ''; } })();
  return `<div class="lf-qr">${qr ? `<img src="${qr}" alt="QR-Code zum Kameramodus">` : ''}<div><b>Mit iPad oder Handy scannen</b><small>Dort mit deinem Konto angemeldet, öffnet sich die Kamera für diese Stunde. Fotos werden nach 14 Tagen gelöscht.</small></div></div>
    ${fotos.length ? `<div class="lf-bar"><b>${fotos.length} Foto${fotos.length === 1 ? '' : 's'}</b>${mode === 'pres' && fotos.length > 1 ? '<button type="button" class="lf-b" data-lf="showall">Alle zeigen</button>' : ''}<button type="button" class="lf-b" data-lf="dlall">Alle herunterladen</button></div>
    <div class="lf-grid">${fotos.map((f, i) => `<div class="lf-it${f._new ? ' new' : ''}" data-id="${f.id}"><img alt="" data-p="${esc(f.path)}"><div class="lf-ia">${mode === 'pres' ? '<button type="button" class="lf-b pri" data-lf="show">Zeigen</button>' : ''}<button type="button" class="lf-b" data-lf="rot" title="Um 90° nach rechts drehen" aria-label="Drehen">⟳</button><button type="button" class="lf-b" data-lf="dl" title="Herunterladen" aria-label="Herunterladen">⬇</button><button type="button" class="lf-b" data-lf="keep" aria-pressed="${!!f.keep}" title="${f.keep ? 'Wird nicht automatisch gelöscht' : 'Nicht nach 14 Tagen löschen'}">${f.keep ? '★' : '☆'}</button><button type="button" class="lf-b" data-lf="del" title="Löschen" aria-label="Löschen">×</button></div><small>${fotoLeft(f)}</small></div>`).join('')}</div>`
    : '<p class="lf-empty">Noch keine Fotos zu dieser Stunde.</p>'}${mode === 'pres' ? `<p class="lf-tafel"><b>iPad als Tafel, ohne QR-Code:</b> Ist LehrWerk auf dem iPad oder Handy offen und angemeldet, erscheint dort während der Präsentation „Als Tafel verbinden“. Fester Einstieg zum Ablegen auf dem Home-Bildschirm: <span>${esc(tafelUrl())}</span></p>` : ''}`;
}
async function fotoPanelAct(e, root, sheetId, fotos, rerender, onShow) {
  const b = e.target.closest('[data-lf]'); if (!b) return false; const a = b.dataset.lf; const it = b.closest('[data-id]'); const f = it && fotos.find(x => x.id === it.dataset.id);
  if (a === 'show' && f) onShow([f]);
  else if (a === 'showall') onShow(fotos.slice());
  else if (a === 'dl' && f) { try { await fotoDownload(f, fotos.indexOf(f)); } catch { toast('Herunterladen hat nicht geklappt.'); } }
  else if (a === 'dlall') { toast('Fotos werden geladen …'); for (let i = 0; i < fotos.length; i++) { try { await fotoDownload(fotos[i], i); } catch {} } }
  else if (a === 'rot' && f) { b.disabled = true; try { await fotoRotate(f, 1); rerender(); } catch (err) { console.error(err); toast('Drehen hat nicht geklappt.'); } }
  else if (a === 'keep' && f) { const k = !f.keep; const r = await store.sb.from('ab_fotos').update({ keep: k }).eq('id', f.id); if (!r.error) { f.keep = k; rerender(); toast(k ? 'Foto wird behalten und nicht automatisch gelöscht.' : 'Foto wird nach Ablauf der 14 Tage gelöscht.'); } }
  else if (a === 'del' && f) { try { await fotoDelete(f); fotos.splice(fotos.indexOf(f), 1); rerender(); toast('Foto gelöscht.'); } catch { toast('Löschen hat nicht geklappt.'); } }
  return true;
}
const fotoThumbs = root => root.querySelectorAll('img[data-p]').forEach(async im => { if (im.src) return; try { im.src = await fotoUrl(im.dataset.p); } catch {} });
// Editor: Fotos der Stunde als Dialog
async function fotoManager() {
  if (!fotoOK()) { toast('Fotos gibt es mit Anmeldung in der Online-Ablage.'); return; }
  if (!state.sheet || !state.sheet.id) return; const sid = state.sheet.id; let fotos = [];
  const ov2 = el(`<div class="lf-dlg-ov" role="dialog" aria-modal="true" aria-label="Fotos dieser Stunde"><div class="lf-dlg"><div class="lf-dh"><b>📷 Fotos dieser Stunde</b><button type="button" class="kb-x" data-lf="x" aria-label="Schließen">×</button></div><div class="lf-body"><p class="lf-empty">Wird geladen …</p></div></div></div>`);
  document.body.appendChild(ov2); const body = ov2.querySelector('.lf-body');
  const rr = () => { body.innerHTML = fotoPanelHTML(sid, fotos, 'ed'); fotoThumbs(body); };
  try { fotos = await fotoList(sid); } catch (err) { console.error(err); } rr();
  const off = fotoListen(async m => { if ((m.t === 'new' || m.t === 'upd') && m.sheet === sid) { try { fotos = await fotoList(sid); rr(); } catch {} } });
  const close = () => { off(); ov2.remove(); document.removeEventListener('keydown', kd, true); };
  const kd = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } }; document.addEventListener('keydown', kd, true);
  ov2.addEventListener('click', async e => { if (e.target === ov2 || e.target.closest('[data-lf="x"]')) { close(); return; } await fotoPanelAct(e, body, sid, fotos, rr, () => {}); });
}
// Sicherungsfolie: Fotos auf der 1600×900-Folie anordnen (eines groß mit Zoom, sonst Raster)
const fotoFit = (w, h, W, H) => { const r = w / h; let a = W, b = W / r; if (b > H) { b = H; a = H * r; } return { W: a, H: b, l: (W - a) / 2, t: (H - b) / 2 }; };
const fotoLasHTML = (las, s) => (las ? `<i class="lf-las" style="left:${(las[0] * 100).toFixed(2)}%;top:${(las[1] * 100).toFixed(2)}%;transform:scale(${(1 / s).toFixed(3)})"></i>` : '');
function fotoSlideHTML(s) {
  const it = (s.items || []).slice(0, 6); if (!it.length) return '<div class="lf-slide"></div>';
  const when = new Date(it[it.length - 1].created_at || Date.now()).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  if (it.length === 1) {
    const f = it[0], bx = fotoFit(f.w || 4, f.h || 3, 1600, 900), t = fotoTf(s.view || {}, bx.W, bx.H, 1600, 900);
    return `<div class="lf-slide one"><div class="lf-clip" style="left:0;top:0;width:1600px;height:900px"><div class="lf-sw" style="width:${bx.W}px;height:${bx.H}px;transform:translate(${t.tx}px,${t.ty}px) scale(${t.s})"><img src="${esc(f.u || '')}" alt="Foto eines Arbeitsergebnisses" draggable="false">${fotoInkSvg((f.ink || []).concat(s.live ? [s.live] : []), f.w, f.h)}${fotoLasHTML(s.las, t.s)}</div></div><span class="lf-tag">Sicherung · ${when} Uhr</span></div>`;
  }
  const cols = it.length <= 2 ? 2 : 3, rows = Math.ceil(it.length / cols), g = 16, cw = (1600 - g * (cols + 1)) / cols, ch = (900 - g * (rows + 1)) / rows;
  return `<div class="lf-slide many">${it.map((f, i) => { const c = i % cols, r = Math.floor(i / cols), bx = fotoFit(f.w || 4, f.h || 3, cw, ch); return `<div class="lf-cell" style="left:${g + c * (cw + g) + bx.l}px;top:${g + r * (ch + g) + bx.t}px;width:${bx.W}px;height:${bx.H}px"><img src="${esc(f.u || '')}" alt="Foto ${i + 1}" draggable="false">${fotoInkSvg(f.ink, f.w, f.h)}</div>`; }).join('')}<span class="lf-tag">Sicherung · ${when} Uhr</span></div>`;
}

