/* ================= Gruppen: eigene Namen, Zuordnung je Baustein (⋯) oder je Aufgabe =================
   meta.groups = [{ k: 'A', name: 'Wandseite', add: 'Szene 3' }, …] gilt für die ganze Stunde; b.group bzw. it.grp verweisen auf k. */
const GRP_KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];
const grpList = m => { m = m || state.sheet.meta; return Array.isArray(m.groups) && m.groups.length >= 2 ? m.groups : [{ k: 'A', name: '', add: tfStr(m.groupA) }, { k: 'B', name: '', add: tfStr(m.groupB) }]; };
function grpNorm(m, had) {
  if (!had || !Array.isArray(m.groups) || m.groups.length < 2) m.groups = [{ k: 'A', name: '', add: m.groupA != null ? tfStr(m.groupA) : 'für Gruppe 1 und 3' }, { k: 'B', name: '', add: m.groupB != null ? tfStr(m.groupB) : 'für Gruppe 2 und 4' }];
  m.groups = m.groups.slice(0, GRP_KEYS.length).map((g, i) => ({ k: GRP_KEYS[i], name: tfStr(g && g.name), add: tfStr(g && g.add) }));
  delete m.groupA; delete m.groupB; return m;
}
const grpName = (m, k) => { const g = grpList(m).find(x => x.k === k); return (g && tfStr(g.name).trim()) || 'Gruppe ' + k; };
const grpAdd = (m, k) => { const g = grpList(m).find(x => x.k === k); return g ? tfStr(g.add).trim() : ''; };
const itGrp = (b, it, m) => ((m || state.sheet.meta).groupsOn ? (it && it.grp) || (b && b.group) || '' : '');
const grpCtl = (i, it) => { const m = state.sheet.meta; if (!m.groupsOn) return ''; const g = it.grp || ''; return `<select data-k="items.${i}.grp" class="ph-sel grp-sel${g ? ' on' : ''}" aria-label="Gruppe" title="Für welche Gruppe gilt die Aufgabe?"><option value="">Alle Gruppen</option>${grpList(m).map(x => `<option value="${x.k}"${g === x.k ? ' selected' : ''}>${esc(grpName(m, x.k))}</option>`).join('')}</select>`; };
function grpEdHTML(m) {
  const L = grpList(m);
  return `<div class="f grp-ed"><span>Gruppen</span>${L.map((g, i) => `<div class="grp-ed-row"><b>${g.k}</b><input type="text" data-k="groups.${i}.name" value="${esc(g.name)}" placeholder="Name, z. B. Wandseite" aria-label="Name von Gruppe ${g.k}"><input type="text" data-k="groups.${i}.add" value="${esc(g.add)}" placeholder="Zusatz, z. B. Tische 1 bis 3" aria-label="Zusatz zu Gruppe ${g.k}"><button class="ib" type="button" data-act="grp-del" data-i="${i}" title="Gruppe entfernen" aria-label="Gruppe ${g.k} entfernen"${L.length <= 2 ? ' disabled' : ''}>${I.x}</button></div>`).join('')}
    <div class="tf-ed-acts"><button class="link" type="button" data-act="grp-add"${L.length >= GRP_KEYS.length ? ' disabled' : ''}>+ Gruppe</button></div></div>
    <small class="hint">Einzelne Aufgaben ordnest du direkt unter der Aufgabe einer Gruppe zu, ganze Bausteine über ⋯ an der Karte. Ohne Zuordnung gilt etwas für alle. Über der Vorschau wählst du das Blatt einer Gruppe; in der Präsentation stehen die Aufgaben der Gruppen nebeneinander.</small>`;
}
function grpRemove(i) {
  const m = state.sheet.meta; const L = grpList(m); if (L.length <= 2 || !L[i]) return;
  snapshot(); const lab = grpName(m, L[i].k); const map = {};
  L.forEach((g, j) => { if (j !== i) map[g.k] = GRP_KEYS[j < i ? j : j - 1]; });
  m.groups = L.filter((_, j) => j !== i).map((g, j) => ({ ...g, k: GRP_KEYS[j] }));
  stBlocks().forEach(b => { if (b.group) b.group = map[b.group] || ''; if (b.type === 'tasks' && Array.isArray(b.items)) b.items.forEach(it => { if (it && it.grp) { if (map[it.grp]) it.grp = map[it.grp]; else delete it.grp; } }); });
  state.grp = map[state.grp] || 'all';
  changed(true); toast(`${lab} entfernt`, 'Rückgängig', histUndo);
}

