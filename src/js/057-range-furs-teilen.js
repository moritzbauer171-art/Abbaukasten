/* ---------- Ränge fürs Teilen ---------- */
const RANKS = [
  { n: 1, name: 'Abendspender', c: '#C0834A', d: 'Deine erste Stunde ist geteilt. Irgendwo hat jemand heute Abend frei.' },
  { n: 3, name: 'Gönnjamin', c: '#8E9BAD', d: 'Drei geteilte Stunden. Du gönnst, und das Kollegium dankt.' },
  { n: 5, name: 'Lehrerzimmerheld', c: '#E0A526', d: 'Fünf Stunden für andere. Im Lehrerzimmer wird dein Name geflüstert.' },
  { n: 10, name: 'Held des Lehrens', c: '#1E9E8F', d: 'Zehn Stunden! Ganze Fachschaften planen mit deinem Material.' },
  { n: 20, name: 'Absolute Lehrlegende', c: '#7A4FD0', d: 'Zwanzig Stunden. Mehr geht nicht: Du bist eine absolute Lehrlegende.' }
];
const rankOf = n => { let i = -1; RANKS.forEach((r, k) => { if (n >= r.n) i = k; }); const nx = RANKS[i + 1] || null; return { i, r: RANKS[i] || null, next: nx, need: nx ? nx.n - n : 0, prev: i >= 0 ? RANKS[i].n : 0 }; };
const myShareN = () => (state.shared || []).filter(x => x.mine).length;
function rankBadge(i, cls) {
  const r = RANKS[i]; if (!r) return '';
  return `<svg class="rk-b ${cls || ''}" viewBox="0 0 40 46" role="img" aria-label="Rang: ${esc(r.name)}"><title>${esc(r.name)}</title><path d="M12 28 7 44l6-3 4 5 4-14z" fill="${r.c}" opacity=".75"/><path d="M28 28l5 16-6-3-4 5-4-14z" fill="${r.c}" opacity=".75"/><circle cx="20" cy="18" r="16" fill="${r.c}"/><circle cx="20" cy="18" r="12.5" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.6"/>${i >= 3 ? `<path d="M20 8.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="#fff"/>` : `<text x="20" y="${18 + 5.5}" text-anchor="middle" font-size="15" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">${i + 1}</text>`}</svg>`;
}
function rankLine(n, du) {
  const R = rankOf(n);
  if (!R.r) return `<div class="rk-line rk-0"><span class="rk-none" aria-hidden="true"></span><div><b>${du ? 'Noch kein Rang' : 'Noch kein Rang'}</b><small>${du ? 'Teile deine erste Stunde und werde ' : 'Mit der ersten geteilten Stunde wird man '}„${esc(RANKS[0].name)}“.</small></div><button type="button" class="link rk-all" data-rk="all">Alle Ränge</button></div>`;
  const pct = R.next ? Math.round((n - R.prev) / (R.next.n - R.prev) * 100) : 100;
  return `<div class="rk-line">${rankBadge(R.i)}<div class="rk-txt"><b>${esc(R.r.name)}</b><small>${n} ${n === 1 ? 'Stunde' : 'Stunden'} geteilt${R.next ? ` · noch ${R.need} bis „${esc(R.next.name)}“` : ' · höchster Rang. Danke!'}</small>${R.next ? `<span class="rk-bar"><i style="width:${pct}%"></i></span>` : ''}</div><button type="button" class="link rk-all" data-rk="all">Alle Ränge</button></div>`;
}
function rankPop(mode, i) {
  const old = document.getElementById('rk-ov'); if (old) old.remove();
  const n = myShareN(), R = rankOf(n);
  const body = mode === 'up' ? `<div class="rk-up">${rankBadge(i, 'rk-big')}<p class="rk-kick">Aufgestiegen!</p><h2>Du bist jetzt „${esc(RANKS[i].name)}“</h2><p>${esc(RANKS[i].d)}</p>${RANKS[i + 1] ? `<p class="rk-nx">Nächster Rang: „${esc(RANKS[i + 1].name)}“ ab ${RANKS[i + 1].n} geteilten Stunden.</p>` : ''}</div>`
    : `<h2>Ränge fürs Teilen</h2><p class="rk-sub">Je mehr Stunden du mit dem Kollegium teilst, desto höher steigst du auf. Dein Rang steht bei deinen geteilten Stunden neben deinem Namen.</p><ol class="rk-list">${RANKS.map((r, k) => `<li class="${k <= R.i ? 'got' : ''}${k === R.i ? ' cur' : ''}">${rankBadge(k)}<div><b>${esc(r.name)}</b><small>ab ${r.n} ${r.n === 1 ? 'geteilten Stunde' : 'geteilten Stunden'}${k === R.i ? ' · dein Rang' : ''}</small></div></li>`).join('')}<li class="rk-fame${n >= FAME_N ? ' got' : ''}">${trophyI}<div><b>Wall of Fame</b><small>ab ${FAME_N} geteilten Stunden: ein eigenes Bild an der Wand</small></div><button type="button" class="link" data-fame-open="1">Ansehen</button></li></ol>`;
  const ov = el(`<div id="rk-ov" class="rk-ov${mode === 'up' ? ' up' : ''}" role="dialog" aria-modal="true" aria-label="Ränge"><div class="rk-card">${mode === 'up' ? '<div class="rk-conf" aria-hidden="true">' + Array.from({ length: 26 }, (_, k) => `<i style="--x:${(k * 37) % 100}%;--d:${(k % 7) * .12}s;--c:${['#E0A526', '#2741B5', '#E0565B', '#1E9E8F', '#7A4FD0'][k % 5]}"></i>`).join('') + '</div>' : ''}${body}<div class="row"><button type="button" class="btn primary" data-rk="x">${mode === 'up' ? 'Weiter so!' : 'Schließen'}</button></div></div></div>`);
  document.body.appendChild(ov);
  ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-rk="x"]')) ov.remove(); });
  const b = ov.querySelector('[data-rk="x"]'); if (b) b.focus();
}
document.addEventListener('click', e => { const a = e.target.closest('[data-rk="all"]'); if (a) { e.preventDefault(); rankPop('all'); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { const o = document.getElementById('rk-ov'); if (o) { e.stopPropagation(); o.remove(); } } }, true);
