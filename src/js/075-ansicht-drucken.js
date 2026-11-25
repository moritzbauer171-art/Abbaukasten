/* ================= Ansicht, Drucken ================= */
function setView(v) {
  state.view = v;
  $('#tab-edit').setAttribute('aria-pressed', v === 'edit'); $('#tab-prev').setAttribute('aria-pressed', v === 'preview');
  applyResponsive(); if (typeof mbarSync === 'function') mbarSync();
}
function applyResponsive() {
  const narrow = window.matchMedia('(max-width: 899px)').matches;
  $('#editor').hidden = narrow ? state.view !== 'edit' : !!state.wide;
  $('.main').classList.toggle('wide', !narrow && !!state.wide);
  const wb = $('#btn-wide'); if (wb) { wb.setAttribute('aria-pressed', String(!!state.wide)); wb.title = state.wide ? 'Karten wieder einblenden' : 'Vorschau groß: Karten ausblenden'; }
  $('#preview').hidden = narrow && state.view !== 'preview';
  applyScale();
}
function doPrint() {
  const info = preparePrint(); if (!info) return;
  if (window.abDesktop) { window.abDesktop.print(info).then(r => { if (r === 'pdf') toast('Hoch- und Querseiten gemischt: Das PDF ist zum Drucken geöffnet.'); }).catch(err => console.error(err)); return; }
  window.print();
}
function preparePrint() {
  const pr = $('#printroot'); pr.innerHTML = '';
  const pages = [...document.querySelectorAll('#pages .pout')]; if (!pages.length) { toast('Es gibt noch nichts zu drucken.'); return null; }
  const w = +pages[0].dataset.w || 210, h = +pages[0].dataset.h || 297;
  let st = document.getElementById('print-size'); if (!st) { st = document.createElement('style'); st.id = 'print-size'; }
  document.body.appendChild(st); // ganz ans Ende: sonst gewinnt die allgemeine Druckregel (A4 hoch) und Querseiten werden geteilt oder verkleinert
  const key = p => `s${+p.dataset.w || 210}x${+p.dataset.h || 297}`; const keys = [...new Set(pages.map(key))];
  const mixed = keys.length > 1;
  st.textContent = mixed ? '@media print{@page{margin:0}' + keys.map(k => { const [a, z] = k.slice(1).split('x'); return `@page ${k}{size:${a}mm ${z}mm;margin:0}`; }).join('') + '}' : `@media print{@page{size:${w}mm ${h}mm;margin:0}}`;
  pages.forEach(p => { const c = p.cloneNode(true); c.style.transform = 'none'; c.style.position = 'relative'; if (mixed) c.style.setProperty('page', key(p)); c.querySelectorAll('.lb-tip').forEach(n => n.remove()); c.querySelectorAll('.is-sel,.zsel').forEach(n => n.classList.remove('is-sel', 'zsel')); pr.appendChild(c); });
  return { mixed, landscape: !mixed && w > h, size: Math.max(w, h) > 300 ? 'A3' : 'A4', n: pages.length, name: fileBase() + outSuffix() + '.pdf' };
}

