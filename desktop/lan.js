'use strict';
// Direktverbindung Laptop ↔ iPad ohne Internet-Live-Kanal (z. B. über den mobilen Hotspot von Windows).
// Kleiner HTTP-Server: liefert die LehrWerk-Seite ans iPad aus und reicht Live-Nachrichten (WebSocket unter /lw-ws)
// zwischen allen Geräten mit demselben Schlüssel weiter. Nur Node-Bordmittel, kein Zusatzpaket.
const http = require('http');
const crypto = require('crypto');
const os = require('os');

const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
const MAX_MSG = 64 * 1024 * 1024;

function frame(data, op = 1) {
  const n = data.length; let h;
  if (n < 126) h = Buffer.from([0x80 | op, n]);
  else if (n < 65536) { h = Buffer.alloc(4); h[0] = 0x80 | op; h[1] = 126; h.writeUInt16BE(n, 2); }
  else { h = Buffer.alloc(10); h[0] = 0x80 | op; h[1] = 127; h.writeUInt32BE(Math.floor(n / 4294967296), 2); h.writeUInt32BE(n >>> 0, 6); }
  return Buffer.concat([h, data]);
}

// Adressen dieses Rechners; der Windows-Hotspot hat fast immer 192.168.137.1
function addresses() {
  const out = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) for (const a of list || []) {
    if (a.family !== 'IPv4' && a.family !== 4) continue; if (a.internal) continue;
    out.push({ name, address: a.address, hotspot: /^192\.168\.137\./.test(a.address) });
  }
  return out.sort((a, b) => (b.hotspot - a.hotspot));
}

function createLan({ token, getFile, log = () => {} }) {
  const socks = new Set();
  let srv = null, port = 0;

  function relay(from, data, op) { const f = frame(data, op); for (const c of socks) if (c !== from && c.open) { try { c.sock.write(f); } catch {} } }
  function parse(c) {
    while (c.buf.length >= 2) {
      const b0 = c.buf[0], b1 = c.buf[1], fin = b0 & 0x80, op = b0 & 0x0f, masked = b1 & 0x80; let len = b1 & 0x7f, off = 2;
      if (len === 126) { if (c.buf.length < 4) return; len = c.buf.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (c.buf.length < 10) return; len = c.buf.readUInt32BE(2) * 4294967296 + c.buf.readUInt32BE(6); off = 10; }
      if (len > MAX_MSG) { c.sock.destroy(); return; }
      const mo = masked ? 4 : 0; if (c.buf.length < off + mo + len) return;
      let data = Buffer.from(c.buf.subarray(off + mo, off + mo + len));
      if (masked) { const m = c.buf.subarray(off, off + 4); for (let i = 0; i < data.length; i++) data[i] ^= m[i & 3]; }
      c.buf = c.buf.subarray(off + mo + len);
      if (op === 8) { c.open = false; try { c.sock.end(frame(Buffer.alloc(0), 8)); } catch {} return; }
      if (op === 9) { try { c.sock.write(frame(data, 10)); } catch {} continue; }
      if (op === 10) continue;
      if (op === 1 || op === 2) { if (fin) relay(c, data, op); else c.frag = { op, parts: [data], n: data.length }; continue; }
      if (op === 0 && c.frag) { c.frag.parts.push(data); c.frag.n += data.length; if (c.frag.n > MAX_MSG) { c.sock.destroy(); return; } if (fin) { relay(c, Buffer.concat(c.frag.parts), c.frag.op); c.frag = null; } }
    }
  }
  function upgrade(req, sock) {
    let u; try { u = new URL(req.url, 'http://x'); } catch { sock.destroy(); return; }
    const key = req.headers['sec-websocket-key'];
    if (u.pathname !== '/lw-ws' || u.searchParams.get('t') !== token || !key) { try { sock.end('HTTP/1.1 403 Forbidden\r\n\r\n'); } catch {} return; }
    const acc = crypto.createHash('sha1').update(key + WS_GUID).digest('base64');
    sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + acc + '\r\n\r\n');
    sock.setNoDelay(true); sock.setKeepAlive(true, 15000);
    const c = { sock, buf: Buffer.alloc(0), frag: null, open: true, ip: sock.remoteAddress || '' };
    socks.add(c); log('verbunden', c.ip, socks.size);
    sock.on('data', d => { c.buf = c.buf.length ? Buffer.concat([c.buf, d]) : d; try { parse(c); } catch { sock.destroy(); } });
    const gone = () => { if (socks.delete(c)) log('getrennt', c.ip, socks.size); c.open = false; };
    sock.on('close', gone); sock.on('error', gone); sock.on('end', gone);
  }
  async function handle(req, res) {
    let u; try { u = new URL(req.url, 'http://x'); } catch { res.writeHead(400); res.end(); return; }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
    if (u.pathname === '/lw-ping') { res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify({ ok: true, n: socks.size })); return; }
    let p = decodeURIComponent(u.pathname).replace(/^\/+/, '');
    if (!p || p.endsWith('/')) p += 'index.html';
    if (p.split('/').some(x => x === '..' || x === '.') || p === 'sw.js') { res.writeHead(404); res.end(); return; }
    let f = null; try { f = await getFile(p); } catch (err) { log('Datei', p, String(err)); }
    if (!f) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Nicht gefunden'); return; }
    res.writeHead(200, { 'Content-Type': f.type || 'application/octet-stream', 'Cache-Control': 'no-cache', 'Content-Length': f.buf.length });
    res.end(req.method === 'HEAD' ? undefined : f.buf);
  }
  function start(want = 47811) {
    if (srv) return Promise.resolve(port);
    return new Promise((resolve, reject) => {
      const s = http.createServer((q, r) => { handle(q, r).catch(() => { try { r.writeHead(500); r.end(); } catch {} }); });
      s.on('upgrade', upgrade);
      let p = want;
      s.on('error', err => { if (err.code === 'EADDRINUSE' && p < want + 10) { p++; s.listen(p, '0.0.0.0'); } else reject(err); });
      s.on('listening', () => { srv = s; port = s.address().port; resolve(port); });
      s.listen(p, '0.0.0.0');
    });
  }
  function stop() { for (const c of socks) { try { c.sock.destroy(); } catch {} } socks.clear(); if (srv) { try { srv.close(); } catch {} } srv = null; port = 0; }
  return { start, stop, clients: () => socks.size, port: () => port, running: () => !!srv };
}

const TYPES = { html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', json: 'application/json', webmanifest: 'application/manifest+json', png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml', ico: 'image/x-icon', woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', txt: 'text/plain; charset=utf-8' };
const typeOf = p => TYPES[(p.split('.').pop() || '').toLowerCase()] || 'application/octet-stream';

module.exports = { createLan, addresses, typeOf, frame };
