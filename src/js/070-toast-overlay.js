/* ================= Toast / Overlay ================= */
let toastTimer = null;
function toast(msg, actLabel, actFn) {
  const r = $('#toast-root'); clearTimeout(toastTimer);
  r.innerHTML = `<div class="toast" role="status"><span>${esc(msg)}</span>${actLabel ? `<button type="button">${esc(actLabel)}</button>` : ''}</div>`;
  if (actLabel) r.querySelector('button').onclick = () => { r.innerHTML = ''; actFn(); };
  toastTimer = setTimeout(() => { r.innerHTML = ''; }, actLabel ? 6500 : 3200);
}
function overlay(msg) {
  let o = $('#ovl'); if (!msg) { if (o) o.remove(); return; }
  if (!o) { o = el('<div class="overlay" id="ovl"><div></div></div>'); document.body.appendChild(o); }
  o.firstChild.textContent = msg;
}

