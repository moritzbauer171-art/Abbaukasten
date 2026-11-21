/* ================= Funktionsumfang: Basis blendet selten gebrauchte Werkzeuge aus (.x-pro), solange sie nicht benutzt werden (.used) ================= */
const LS_UMFANG = 'abw.umfang';
const UMF = { basis: false };
function setUmfang(v, quiet) {
  UMF.basis = v === 'basis'; const basis = UMF.basis; document.body.classList.toggle('basis', basis);
  document.querySelectorAll('[data-act="umfang"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === (basis ? 'basis' : 'experte'))));
  const uc = document.getElementById('umfang-chip'); if (uc) uc.textContent = basis ? 'Basis' : '';
  if (!quiet) { lsSet(LS_UMFANG, basis ? 'basis' : 'experte'); if (state.prefs && state.klReady && state.prefs.umfang !== (basis ? 'basis' : 'experte')) { state.prefs.umfang = basis ? 'basis' : 'experte'; savePrefs(); } }
  if (!quiet) { if (basis && state.area === 'start') state.area = 'blatt'; basisClamp(); state.insAt = null; closeGloss(); closeZl(); closeMenu(); renderEditor(); clearTimeout(renderTimer); renderPreview(); }
}
// Basis: nur Arbeitsblätter und die Präsentation dazu (Bereiche „Arbeitsblatt“ und „Präsentation“, Ausgaben Arbeitsblatt, Tippkarten und Folien)
const isBasis = () => UMF.basis;
const BASIS_OUTS = ['blatt', 'tipps', 'pres'];
function basisClamp() {
  if (!isBasis()) return;
  if (!['einst', 'blatt', 'pres'].includes(state.area)) state.area = 'blatt'; if (!BASIS_OUTS.includes(state.out)) state.out = state.area === 'pres' ? 'pres' : 'blatt';
}

