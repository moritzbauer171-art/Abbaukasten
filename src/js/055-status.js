/* ---------- Status ---------- */
const STATUS = {
  pending: 'Wird geladen …', saving: 'Speichert …',
  supabase: 'Online gespeichert', claude: 'Gespeichert in „Meine Stunden“', local: 'Gespeichert in diesem Browser',
  offline: 'Noch nicht online · lokal gesichert, wird nachgeholt', conflict: 'Nicht gespeichert · auf einem anderen Gerät geändert', error: 'Nicht gespeichert · nächste Änderung versucht es erneut',
  toolarge: 'Zu groß zum Speichern · Bilder verkleinern', quota: 'Browser-Speicher voll · Bilder verkleinern oder Blätter löschen'
};
function setStatus(s) {
  if (state.offline && (s === 'supabase' || s === 'claude')) s = 'offcache';
  const txt = s === 'offcache' ? `Offline · letzter Stand ${offDate(state.offline.at) ? 'vom ' + offDate(state.offline.at) : 'aus diesem Browser'} · Änderungen werden nachgetragen` : s === 'example' ? (state.sheet && state.sheet.sample ? 'Beispielblatt' : 'Neue Stunde') + ' · wird beim Bearbeiten gespeichert' : (STATUS[s] || '');
  const n = $('#status'); n.dataset.s = s; n.querySelector('span').textContent = txt; n.title = txt;
}
function idleStatus() { setStatus(state.sheet.example ? 'example' : (backend ? backend.kind : 'pending')); }

