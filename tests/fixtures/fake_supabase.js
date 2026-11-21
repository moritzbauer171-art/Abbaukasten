// Fake-Supabase für Tests: Tabellen im localStorage, Konto über localStorage 'fakeuser'; Zugriffsregeln wie in der echten Datenbank
(() => {
  const DB = () => { try { return JSON.parse(localStorage.getItem('fakedb') || '{}'); } catch { return {}; } };
  const SAVE = d => localStorage.setItem('fakedb', JSON.stringify(d));
  const me = () => { const u = localStorage.getItem('fakeuser'); return u ? { id: u, email: u + '@test.invalid' } : null; };
  const pub = t => t === 'ab_geteilt';
  function q(t) {
    const st = { t, filters: [], op: 'select', cols: '*', single: false, row: null, conflict: '' };
    const run = () => { const d = DB(); const L = d[t] = d[t] || []; const u = me(); if (!u) return { data: null, error: { message: 'not authenticated' } };
      const vis = r => pub(t) && st.op === 'select' ? true : r.user_id === u.id;
      const match = r => st.filters.every(([c, v]) => r[c] === v);
      if (st.op === 'insert') { const rows = (Array.isArray(st.row) ? st.row : [st.row]).map(x => ({ id: 'f' + Math.random().toString(36).slice(2, 10), user_id: u.id, keep: false, ink: null, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 14 * 864e5).toISOString(), ...x })); L.push(...rows); SAVE(d); return { data: st.single ? rows[0] : rows, error: null }; }
      if (st.op === 'update') { L.forEach(r => { if (vis(r) && match(r)) Object.assign(r, st.row); }); SAVE(d); return { data: null, error: null }; }
      if (st.op === 'select') { let R = L.filter(r => vis(r) && match(r)); if (st.ord) R.sort((a, b) => (a[st.ord] < b[st.ord] ? 1 : -1)); if (st.lim) R = R.slice(0, st.lim);
        R = R.map(r => { if (st.cols === '*') return { ...r }; const o = {}; st.cols.split(',').forEach(c => o[c.trim()] = r[c.trim()]); return o; });
        return { data: st.single ? (R[0] || null) : R, error: null }; }
      if (st.op === 'upsert') { const rows = Array.isArray(st.row) ? st.row : [st.row];
        for (const row of rows) { if (row.user_id !== u.id) return { data: null, error: { message: 'new row violates row-level security policy' } };
          const keys = (st.conflict || 'id').split(','); const i = L.findIndex(r => keys.every(k => r[k] === row[k]));
          if (i >= 0) { if (L[i].user_id !== u.id) return { data: null, error: { message: 'rls' } }; L[i] = { ...L[i], ...row, id: L[i].id }; } else L.push({ ...row }); }
        SAVE(d); return { data: null, error: null }; }
      if (st.op === 'delete') { d[t] = L.filter(r => !(vis(r) && match(r))); SAVE(d); return { data: null, error: null }; }
    };
    const b = { select(c) { if (st.op !== 'upsert' && st.op !== 'insert') { st.op = 'select'; st.cols = c || '*'; } return b; }, order(c) { st.ord = c; return b; }, limit(n) { st.lim = n; return b; }, eq(c, v) { st.filters.push([c, v]); return b; },
      maybeSingle() { st.single = true; return b; }, single() { st.single = true; return b; }, upsert(row, o) { st.op = 'upsert'; st.row = row; st.conflict = o && o.onConflict; return b; }, delete() { st.op = 'delete'; return b; }, insert(row) { st.op = t === 'ab_fotos' ? 'insert' : 'upsert'; st.row = row; return b; }, update(row) { st.op = 'update'; st.row = row; return b; }, or() { return b; },
      then(res, rej) { return Promise.resolve(run()).then(res, rej); } };
    return b;
  }
  const FILES = {};
  const storage = { from: () => ({ upload: async (path, blob) => { const fr = new FileReader(); const u = await new Promise(r => { fr.onload = () => r(fr.result); fr.readAsDataURL(blob); }); localStorage.setItem('fakefile:' + path, u); return { data: { path }, error: null }; },
    createSignedUrl: async path => ({ data: { signedUrl: localStorage.getItem('fakefile:' + path) || '' }, error: null }), remove: async ps => { ps.forEach(p => localStorage.removeItem('fakefile:' + p)); return { data: null, error: null }; } }) };
  const channel = name => { const hs = []; const c = { on(t, f, cb) { hs.push(cb); return c; }, subscribe(cb) { window.addEventListener('storage', e => {  if (e.key === 'fakebc:' + name && e.newValue) { const m = JSON.parse(e.newValue); hs.forEach(h => h({ payload: m.p })); } }); setTimeout(() => cb && cb('SUBSCRIBED'), 10); return c; },
    send(m) { (window.__sent = window.__sent || []).push(m.payload); localStorage.setItem('fakebc:' + name, JSON.stringify({ p: m.payload, r: Math.random() })); return Promise.resolve('ok'); } }; return c; };
  window.supabase = { createClient: () => ({ from: q, storage, channel, removeChannel() {}, rpc: async () => ({ data: null, error: null }),
    auth: { getSession: async () => ({ data: { session: me() ? { user: me() } : null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }), signOut: async () => { localStorage.removeItem('fakeuser'); return {}; } } }) };
})();
