/* ===== Tastenkürzel: ? zeigt die Übersicht, F5 präsentiert ===== */
const KEYS = [['Allgemein', [['Strg K', 'Befehle und Bausteine suchen'], ['Strg Z / Strg Y', 'Rückgängig / Wiederholen'], ['Strg ⇧ S', 'Speichern unter'], ['Strg ⇧ F', 'In den Materialien suchen'], ['?', 'Diese Übersicht'], ['Esc', 'Fenster schließen']]],
  ['Präsentieren', [['F5', 'Präsentation von Beginn an'], ['⇧ F5', 'Ab der markierten Folie'], ['← → / Leertaste', 'Blättern'], ['T', 'Timer starten und anhalten'], ['H', 'Tipps zeigen'], ['E', 'Erwartung zeigen'], ['Esc', 'Beenden']]],
  ['Folienansicht', [['↑ ↓', 'Folie in der Leiste wählen'], ['⇧ Enter', 'Ab dieser Folie präsentieren']]],
  ['Textfeld', [['Strg B / Strg I', 'Fett / Kursiv'], ['Enter', 'Neue Zeile'], ['Leerzeile', 'Neuer Absatz']]]];
function keysOpen() {
  if (document.getElementById('keys-ov')) return; const ov = document.createElement('div'); ov.id = 'keys-ov'; ov.className = 'pp-cf-ov';
  ov.innerHTML = `<div class="pp-cf keys" role="dialog" aria-modal="true" aria-label="Tastenkürzel"><h3>Tastenkürzel</h3><div class="keys-g">${KEYS.map(([g, L]) => `<section><b>${g}</b>${L.map(([k, t]) => `<div><kbd>${esc(k)}</kbd><span>${esc(t)}</span></div>`).join('')}</section>`).join('')}</div><div class="pp-cf-a"><button type="button" class="btn primary" data-cf="no">Schließen</button></div></div>`;
  document.body.append(ov); const close = () => { ov.remove(); document.removeEventListener('keydown', key, true); }; const key = e => { if (e.key === 'Escape' || e.key === '?') { e.preventDefault(); e.stopPropagation(); close(); } };
  document.addEventListener('keydown', key, true); ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-cf]')) close(); }); ov.querySelector('button').focus();
}
