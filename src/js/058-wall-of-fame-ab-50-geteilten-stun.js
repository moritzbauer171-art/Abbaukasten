/* ---------- Wall of Fame: ab 50 geteilten Stunden ein Bild aufhängen (Tabelle ab_fame, Regeln in der Datenbank) ---------- */
const FAME_N = 50;
const FAME = { list: null, err: '', busy: false };
const trophyI = '<svg class="fame-i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v4a5 5 0 0 1-10 0z" fill="currentColor"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 13v4M8.5 20h7M10 17h4v3h-4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
async function fameLoad() {
  FAME.err = '';
  try { const r = await store.sb.from('ab_fame').select('user_id,name,bild,updated_at').order('updated_at', { ascending: false }).limit(200); if (r.error) throw r.error; FAME.list = r.data || []; }
  catch (e) { console.error(e); FAME.list = []; FAME.err = 'Die Wall of Fame ließ sich gerade nicht laden.'; }
}
function fameImg(file) {
  return new Promise((res, rej) => { const fr = new FileReader(); fr.onerror = rej; fr.onload = () => { const im = new Image(); im.onerror = rej; im.onload = () => {
    const S = 480, c = document.createElement('canvas'); c.width = S; c.height = S; const k = Math.max(S / im.width, S / im.height), w = im.width * k, h = im.height * k;
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, S, S); g.drawImage(im, (S - w) / 2, (S - h) / 2, w, h); res(c.toDataURL('image/jpeg', .82)); }; im.src = fr.result; }; fr.readAsDataURL(file); });
}
async function fameOpen(cheer) {
  if (!canShare()) { toast('Die Wall of Fame gibt es mit Anmeldung.'); return; }
  const old = document.getElementById('fame-ov'); if (old) old.remove();
  const ov = el('<div id="fame-ov" class="fame-ov" role="dialog" aria-modal="true" aria-label="Wall of Fame"><div class="fame"></div></div>'); document.body.appendChild(ov);
  ov.dataset.cheer = cheer ? '1' : '';
  ov.querySelector('.fame').innerHTML = '<p class="fame-load">Lädt …</p>';
  await Promise.all([fameLoad(), state.shared ? null : shareLoad()]); fameRender();
  ov.addEventListener('click', fameClick); ov.addEventListener('change', fameChange);
}
function fameRender() {
  const ov = document.getElementById('fame-ov'); if (!ov) return;
  const me = store.user && store.user.id, n = myShareN(), mine = (FAME.list || []).find(x => x.user_id === me);
  const cnt = uid => (state.shared || []).filter(y => y.uid === uid).length;
  const frames = (FAME.list || []).map(x => { const R = rankOf(cnt(x.user_id)); return `<figure class="fame-f${x.user_id === me ? ' me' : ''}"><div class="fame-pic"><img src="${esc(x.bild)}" alt="${esc(x.name || 'Bild')}"></div><figcaption><b>${R.r ? rankBadge(R.i, 'rk-mini') : ''}${esc(x.name || 'Ohne Namen')}</b><small>${cnt(x.user_id)} Stunden geteilt</small></figcaption>${ADM.is || x.user_id === me ? `<button type="button" class="link fame-del" data-fame="del" data-uid="${esc(x.user_id)}">${x.user_id === me ? 'Mein Bild abhängen' : 'Abhängen'}</button>` : ''}</figure>`; }).join('');
  const myBox = n >= FAME_N ? `<div class="fame-me">${ov.dataset.cheer ? `<p class="fame-cheer">${n} geteilte Stunden! Dein Platz an der Wall of Fame wartet.</p>` : ''}
      <label class="f"><span>Name unter dem Bild</span><input class="inp" id="fame-name" maxlength="80" value="${esc((mine && mine.name) || state.prefs.autor || '')}"></label>
      <label class="btn primary fame-up">${mine ? 'Neues Bild aufhängen' : 'Bild aufhängen'}<input type="file" accept="image/*" data-fame="file" hidden></label>
      <small class="hint">Das Bild wird quadratisch zugeschnitten und ist für alle angemeldeten Konten sichtbar. Ein Foto, ein Avatar oder dein Lieblingsmeme.</small></div>`
    : `<div class="fame-me fame-wait"><p>Ab <b>${FAME_N} geteilten Stunden</b> darfst du hier ein Bild aufhängen. Du hast ${n}, noch <b>${FAME_N - n}</b>.</p><span class="rk-bar"><i style="width:${Math.min(100, Math.round(n / FAME_N * 100))}%"></i></span></div>`;
  ov.querySelector('.fame').innerHTML = `<div class="fame-h">${trophyI}<div><h2>Wall of Fame</h2><p>Hier hängen alle, die ${FAME_N} oder mehr Stunden mit dem Kollegium geteilt haben.</p></div><button type="button" class="ib fame-x" data-fame="x" aria-label="Schließen">${I.x}</button></div>
    ${FAME.err ? `<p class="adm-err">${esc(FAME.err)}</p>` : ''}
    <div class="fame-wall">${frames || '<p class="fame-empty">Die Wand ist noch leer. Wer hängt hier als erstes?</p>'}</div>
    ${myBox}${FAME.busy ? '<p class="fame-load">Wird aufgehängt …</p>' : ''}`;
}
async function fameChange(e) {
  const t = e.target;
  if (t.id === 'fame-name') { const me = store.user && store.user.id, mine = (FAME.list || []).find(x => x.user_id === me); if (mine && t.value.trim() !== mine.name) { try { const r = await store.sb.from('ab_fame').upsert({ user_id: me, name: t.value.trim().slice(0, 80), bild: mine.bild, updated_at: mine.updated_at }, { onConflict: 'user_id' }); if (r.error) throw r.error; await fameLoad(); fameRender(); toast('Name geändert.'); } catch { toast('Der Name ließ sich nicht ändern.'); } } return; }
  if (t.dataset.fame !== 'file' || !t.files || !t.files[0]) return;
  const f = t.files[0]; t.value = '';
  const name = (($('#fame-name') || {}).value || '').trim().slice(0, 80);
  FAME.busy = true; fameRender();
  try { const bild = await fameImg(f); const r = await store.sb.from('ab_fame').upsert({ user_id: store.user.id, name, bild, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }); if (r.error) throw r.error; await fameLoad(); toast('Dein Bild hängt jetzt an der Wall of Fame.'); }
  catch (err) { console.error(err); toast(/security|policy|rls/i.test(String(err && err.message)) ? `Aufhängen geht erst ab ${FAME_N} geteilten Stunden.` : 'Das Bild ließ sich nicht aufhängen. Bitte ein anderes versuchen.'); }
  FAME.busy = false; fameRender();
}
async function fameClick(e) {
  const ov = document.getElementById('fame-ov'); if (e.target === ov) { ov.remove(); return; }
  const a = e.target.closest('[data-fame]'); if (!a) return; const k = a.dataset.fame;
  if (k === 'x') { ov.remove(); return; }
  if (k === 'del') { if (a.dataset.sure !== '1') { a.dataset.sure = '1'; a.textContent = 'Wirklich abhängen?'; return; }
    try { const r = await store.sb.from('ab_fame').delete().eq('user_id', a.dataset.uid); if (r.error) throw r.error; await fameLoad(); fameRender(); toast('Bild abgehängt.'); } catch (err) { console.error(err); toast('Das hat nicht geklappt.'); } }
}
document.addEventListener('click', e => { const a = e.target.closest('[data-fame-open]'); if (a) { e.preventDefault(); const o = document.getElementById('rk-ov'); if (o) o.remove(); fameOpen(); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { const o = document.getElementById('fame-ov'); if (o && !document.getElementById('rk-ov')) { e.stopPropagation(); o.remove(); } } }, true);
// Rang eines anderen Kontos (aus den geteilten Stunden gezählt)
const rankOfUid = uid => rankOf((state.shared || []).filter(y => y.uid && y.uid === uid).length);
const autorBadge = x => { if (!x.uid) return ''; const R = rankOfUid(x.uid); return R.r ? rankBadge(R.i, 'rk-mini') : ''; };

/* Kategorien für geteilte Stunden */
const SHARE_CATS = ['Vertretungsstunde', 'Einstieg in ein Thema', 'Erarbeitung', 'Übung und Wiederholung', 'Klassenarbeit vorbereiten', 'Prüfung (MSA, Abitur)', 'Doppelstunde', 'Projekt', 'Digital / Tablet', 'Differenziert', 'Gruppenarbeit', 'Ohne Material einsetzbar'];
const STUFEN = [['', 'keine Angabe'], ...Array.from({ length: 10 }, (_, k) => [String(k + 1), 'Klasse ' + (k + 1)]), ['OS', 'Oberstufe']];
const stufeLabel = v => v === 'OS' ? 'Oberstufe' : v ? 'Klasse ' + v : '';
function stufeGuess(klId) {
  const k = KL(klId); if (k.stufe === 'gs' && +k.jg) return String(+k.jg);
  const t = (k.label + ' ' + (k.course || '')).toLowerCase();
  if (/grundkurs|leistungskurs|\b(gk|lk)\b|\bq[1-4]\b|oberstufe|\b1[123]\b|sek ?ii|einführungsphase/.test(t)) return 'OS';
  const m = t.match(/(?:^|\D)(10|[1-9])(?!\d)/); return m ? m[1] : '';
}
const shareTags = (x, max) => { const T = [...(x.stufe ? [`<span class="sh-tag st">${esc(stufeLabel(x.stufe))}</span>`] : []), ...(x.cats || []).map(c => `<span class="sh-tag${c === 'Vertretungsstunde' ? ' vt' : ''}">${esc(c)}</span>`)]; if (!T.length) return ''; const more = max && T.length > max ? T.length - max : 0; return `<div class="sh-tags">${(max ? T.slice(0, max) : T).join('')}${more ? `<span class="sh-tag more">+${more}</span>` : ''}</div>`; };

/* Auswahl: welche eigene Stunde teilen? */
async function openSharePick(pre) {
  if (!canShare()) { toast('Zum Teilen bitte anmelden.'); return; }
  state.dlg = { mode: 'sharepick', pick: '', autor: state.prefs.autor || '', text: '' }; renderDlg(); await shareLoad();
  if (state.dlg && state.dlg.mode === 'sharepick') { if (pre) spPick(pre); else renderDlg(); }
  setTimeout(() => { const f = $('#sp-q'); if (f && !isNarrow()) f.focus(); }, 30);
}
function spPick(id) {
  const d = state.dlg; if (!d || d.mode !== 'sharepick') return; spKeep();
  const ex = sharedOf(id); const e = (state.lib || []).find(x => x.id === id); d.pick = id; d.own = null;
  if (ex) { d.text = ex.text || ''; if (ex.autor) d.autor = ex.autor; d.cats = [...(ex.cats || [])]; d.stufe = ex.stufe || (e ? stufeGuess(e.klasse) : ''); }
  else { if (d.pickWas && sharedOf(d.pickWas)) { d.text = ''; d.cats = []; } d.cats = d.cats || []; d.stufe = e ? stufeGuess(e.klasse) : ''; }
  d.pickWas = id; d.step = 'form'; renderDlg(); setTimeout(() => { const q = $('#sp-q'); if (q && q.value) q.dispatchEvent(new Event('input', { bubbles: true })); const t = $('#share-text'); const sel = document.querySelector('#dlg-root .sp-g button.on'); if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' }); if (t && !isNarrow()) t.focus(); }, 20);
}
const spKeep = () => { const d = state.dlg; if (!d) return; const a = $('#share-autor'), t = $('#share-text'), q = $('#sp-q'), st = $('#sp-stufe'), ow = $('#sp-own'); if (a) d.autor = a.value; if (t) d.text = t.value; if (q) d.q = q.value; if (st) d.stufe = st.value; if (ow) d.own = ow.value; };
function sharePickHTML() {
  const d = state.dlg; const L = (state.lib || []).slice().sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  const groups = KLASSEN.map(k => [k, L.filter(d => d.klasse === k.id)]).filter(([, A]) => A.length);
  const item = d => { const sh = sharedOf(d.id); return `<li data-q="${esc((d.title + ' ' + (d.nr || '') + ' ' + KL(d.klasse).label).toLowerCase())}"><button type="button" data-act="sp-pick" data-id="${esc(d.id)}"${state.dlg.pick === d.id ? ' class="on" aria-pressed="true"' : ''}>${d.nr && d.nr !== '0' ? `<em>AB ${esc(d.nr)}</em>` : ''}<b>${esc(d.title || 'Ohne Titel')}</b><small>${esc(relTime(d.updatedAt))}</small>${sh ? '<span class="sp-on">schon geteilt</span>' : ''}</button></li>`; };
  const P = d.pick && L.find(x => x.id === d.pick); const ex = P && sharedOf(P.id);
  if (d.step !== 'form' || !P) return `<h2 id="dlg-t">Welche Stunde möchtest du teilen?</h2>
    ${rankLine(myShareN(), true)}
    ${L.length ? `<input class="inp" id="sp-q" type="search" placeholder="Stunde suchen …" autocomplete="off" aria-label="Stunden durchsuchen" value="${esc(d.q || '')}">
    <div class="sp-list">${groups.map(([k, A]) => `<section class="sp-g"><h3><i style="background:${ACCENTS[k.accent] ? ACCENTS[k.accent].c : 'var(--tinte)'}"></i>${esc(k.label)} <small>${esc((FAECHER[k.fach] || FAECHER.deutsch).label)}</small></h3><ul>${A.map(item).join('')}</ul></section>`).join('')}</div>
    <p class="sp-none" hidden>Keine Stunde passt zur Suche.</p>` : '<p class="sp-none">Du hast noch keine gespeicherten Stunden.</p>'}
    <div class="row sp-step1"><small class="hint">Tippe eine Stunde an. Im nächsten Schritt kommen Klassenstufe und Kategorien.</small><button class="btn" type="button" data-act="dlg-close">Abbrechen</button></div>`;
  // Schritt 2: Angaben und Kategorien
  return `<div class="sp-head"><button type="button" class="link sp-back" data-act="sp-back">‹ Andere Stunde wählen</button><span class="sp-stepn">Schritt 2 von 2</span></div>
    <h2 id="dlg-t">„${esc(P.title || 'Ohne Titel')}“ teilen</h2>
    <p class="sp-meta">${esc(KL(P.klasse).label)}${P.nr && P.nr !== '0' ? ' · AB ' + esc(P.nr) : ''}${ex ? ' · <b>schon geteilt</b>' : ''}</p>
    <div class="sp-form">
      <div class="sp-two"><label class="f"><span>Dein Name bei der Stunde</span><input class="inp" id="share-autor" type="text" maxlength="80" value="${esc(d.autor || '')}" placeholder="z. B. M. Bauer"></label>
      <label class="f"><span>Kurz: worum geht es? (optional)</span><input class="inp" id="share-text" type="text" maxlength="600" value="${esc(d.text || '')}" placeholder="z. B. Einstieg Kurzgeschichte, GA, 45 Min."></label></div>
      <div class="sp-cat"><label class="f sp-st"><span>Klassenstufe</span><select class="inp" id="sp-stufe">${STUFEN.map(([v, l]) => `<option value="${v}"${(d.stufe || '') === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
        <div class="f"><span>Kategorien (mehrere möglich)</span><div class="sp-chips">${SHARE_CATS.map(c => `<button type="button" class="sp-chip" data-act="sp-cat" data-v="${esc(c)}" aria-pressed="${(d.cats || []).includes(c)}">${esc(c)}</button>`).join('')}</div></div>
        <label class="f sp-ownf"><span>Eigene Schlagworte (optional, mit Komma)</span><input class="inp" id="sp-own" type="text" maxlength="120" value="${esc(d.own != null ? d.own : (d.cats || []).filter(c => !SHARE_CATS.includes(c)).join(', '))}" placeholder="z. B. Lyrik, Romantik"></label></div>
      <small class="hint">${P ? (ex ? `„${esc(P.title)}“ ist schon geteilt. „Aktualisieren“ ersetzt die geteilte Fassung durch den jetzigen Stand.` : `„${esc(P.title)}“ wird mit allen Konten geteilt, so wie sie jetzt gespeichert ist. Andere können eine eigene Kopie übernehmen; dein Original bleibt bei dir.`) : 'Erst oben eine Stunde antippen.'}</small>
    </div>
    <div class="row"><button class="btn primary" type="button" data-act="sp-go"${P ? '' : ' disabled'}>${ex ? 'Aktualisieren' : 'Teilen'}</button>${ex ? '<button class="btn danger" type="button" data-act="sp-del">Nicht mehr teilen</button>' : ''}<button class="btn" type="button" data-act="dlg-close">Abbrechen</button></div>`;
}
function shareDlgHTML(d) {
  return `<h2 id="dlg-t">Stunde teilen</h2>
    <p class="dlg-sub">„${esc(d.title)}“ wird mit allen Konten dieses LehrWerks geteilt: alle Arbeitsblätter, Unterrichtsschritte, Tafelbilder, Druckvorlagen und die Präsentation, so wie sie jetzt gespeichert sind. Andere können sie ansehen und eine eigene Kopie übernehmen; ändern kann die geteilte Fassung nur ${d.sid ? 'dein Konto' : 'dein Konto'}.</p>
    <label class="f"><span>Dein Name, wie er bei der Stunde steht</span><input class="inp" id="share-autor" type="text" maxlength="80" value="${esc(d.autor || '')}" placeholder="z. B. M. Bauer"></label>
    <label class="f"><span>Kurze Beschreibung (optional)</span><textarea class="inp" id="share-text" rows="3" maxlength="600" placeholder="Worum geht es, welche Klasse, was ist besonders?">${esc(d.text || '')}</textarea></label>
    ${d.sid ? '<small class="hint">Die Stunde ist schon geteilt. „Aktualisieren“ ersetzt die geteilte Fassung durch den jetzigen Stand; Kopien, die andere schon übernommen haben, ändern sich nicht.</small>' : '<small class="hint">Später geänderte Stunden bleiben in der geteilten Fassung auf dem Stand von heute, bis du „Aktualisieren“ wählst.</small>'}
    <div class="row"><button class="btn primary" type="button" data-act="share-go">${d.sid ? 'Aktualisieren' : 'Teilen'}</button>${d.sid ? '<button class="btn danger" type="button" data-act="share-del">Nicht mehr teilen</button>' : ''}<button class="btn" type="button" data-act="dlg-close">Abbrechen</button></div>`;
}
async function shareGo() {
  const d0 = state.dlg; if (!d0 || (d0.mode !== 'share' && d0.mode !== 'sharepick')) return;
  const d = d0.mode === 'sharepick' ? { ...d0, sheetId: d0.pick, sid: (sharedOf(d0.pick) || {}).id || '' } : d0; if (!d.sheetId) return;
  const before = myShareN();
  const autor = (($('#share-autor') || {}).value || '').trim(), text = (($('#share-text') || {}).value || '').trim();
  if (!autor) { toast(d0.mode === 'sharepick' ? 'Bitte deinen Namen eintragen, damit andere wissen, von wem die Stunde ist.' : 'Bitte deinen Namen eintragen, damit andere wissen, von wem die Stunde ist.'); const i = $('#share-autor'); if (i) i.focus(); return; }
  if (state.prefs.autor !== autor) { state.prefs.autor = autor; savePrefs(); }
  try {
    if (state.sheet && state.sheet.id === d.sheetId) await saveNow();
    const sh = state.sheet && state.sheet.id === d.sheetId ? clone(state.sheet) : await backend.load(d.sheetId); if (!sh) throw new Error('fehlt');
    const cats = d0.mode === 'sharepick' ? [...new Set([...(d0.cats || []).filter(c => SHARE_CATS.includes(c)), ...String(d0.own != null ? d0.own : (d0.cats || []).filter(c => !SHARE_CATS.includes(c)).join(',')).split(',').map(x => x.trim()).filter(Boolean)])].slice(0, 12) : ((sharedOf(d.sheetId) || {}).cats || []);
    const stufe = d0.mode === 'sharepick' ? (d0.stufe || '') : ((sharedOf(d.sheetId) || {}).stufe || '');
    await backend.sharePut(sh, { id: d.sid, text, autor, cats, stufe }); state.dlg = null; renderDlg(); await shareLoad(true);
    const r0 = rankOf(before), r1 = rankOf(myShareN());
    if (!d.sid && before < FAME_N && myShareN() >= FAME_N) fameOpen(true);
    else if (!d.sid && r1.i > r0.i) rankPop('up', r1.i);
    else toast(d.sid ? 'Geteilte Fassung aktualisiert' : `Stunde geteilt. Danke!${r1.next ? ` Noch ${r1.need} bis „${r1.next.name}“.` : ''}`);
    if (hmS.open) homeRender();
  } catch (err) { console.error(err); toast(/too large|payload|413/i.test(String(err && err.message)) ? 'Die Stunde ist zu groß zum Teilen. Bitte Bilder verkleinern.' : 'Teilen hat nicht geklappt. Bitte erneut versuchen.'); }
}
async function shareDelGo() {
  const d = state.dlg; if (!d || !d.sid) return;
  try { await backend.shareDel(d.sid); state.dlg = null; renderDlg(); await shareLoad(true); toast('Die Stunde wird nicht mehr geteilt. Übernommene Kopien anderer bleiben bestehen.'); }
  catch (err) { console.error(err); toast('Das hat nicht geklappt. Bitte erneut versuchen.'); }
}
