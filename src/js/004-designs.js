/* ================= Designs ================= */
/* Ein Design ändert Kopf, Schriften und Schmuckelemente des Blatts. Akte und Zeitung sind einfarbig. */
const DESIGNS = {
  klar: { label: 'Klar' },
  akte: { label: 'Akte', mono: { c: '#2B2925', t: '#E9E1CE' } },
  zeitung: { label: 'Zeitung', mono: { c: '#161616', t: '#ECECEC' } },
  tagebuch: { label: 'Tagebuch' },
  fibel: { label: 'Fibel', gs: true },
  entdecker: { label: 'Entdecker', gs: true },
  bunt: { label: 'Bunt', gs: true },
  feed: { label: 'Social Feed', more: true }, magazin: { label: 'Magazin', more: true }, wiki: { label: 'Lexikon', more: true },
  archiv: { label: 'Archiv', more: true, mono: { c: '#5A4632', t: '#EFE7DC' } }, notiz: { label: 'Notizbuch', more: true },
  programm: { label: 'Programmheft', more: true }, schlicht: { label: 'Schlicht', more: true, mono: { c: '#1E1E1E', t: '#F1F1F1' } }
};
const DESIGN_FONTS = {
  akte: ['400 11pt "Special Elite"', '400 11pt "Courier Prime"', '700 11pt "Courier Prime"', 'italic 400 11pt "Courier Prime"'],
  zeitung: ['400 20pt "UnifrakturMaguntia"', '800 11pt "Playfair Display"', '700 11pt "Playfair Display"', 'italic 600 11pt "Playfair Display"'],
  tagebuch: ['700 11pt "Caveat"', '500 11pt "Caveat"'],
  fibel: ['400 11pt "Andika"', '700 11pt "Andika"'],
  entdecker: ['400 11pt "Andika"', '700 11pt "Andika"', '700 11pt "Fredoka"'],
  bunt: ['400 11pt "Andika"', '700 11pt "Andika"', '700 11pt "Fredoka"'],
  magazin: ['400 11pt "Archivo Black"', 'italic 400 11pt "Literata"'], wiki: ['400 11pt "Literata"', '600 11pt "Literata"'], archiv: ['600 11pt "Literata"', 'italic 400 11pt "Literata"'],
  notiz: ['700 11pt "Caveat"', '500 11pt "Caveat"'], programm: ['800 11pt "Playfair Display"', 'italic 600 11pt "Playfair Display"']
};
const designOf = meta => DESIGNS[meta && meta.design] ? meta.design : 'klar';
function pageAcc(meta) { return DESIGNS[designOf(meta)].mono || ACCENTS[meta.accent] || ACCENTS.tinte; }
const pageBg = meta => designOf(meta) === 'akte' && meta.tone !== false ? '#F5EEDD' : '#FFFFFF';
function loadDesignFonts(d) {
  const specs = DESIGN_FONTS[d]; if (!specs || !document.fonts) return;
  Promise.race([Promise.all(specs.map(f => document.fonts.load(f))), wait(3000)]).then(() => scheduleRender(30)).catch(() => {});
}
const DZ_PREV = {
  klar: '<span class="dzk-bar"></span><span class="dzk-t">Titel</span><span class="dz-l"></span><span class="dz-l s"></span>',
  akte: '<span class="dza-tab">AKTE</span><span class="dza-st">GEHEIM</span><span class="dz-l"></span><span class="dz-l s"></span>',
  zeitung: '<span class="dzz-r"></span><span class="dzz-m">Zeitung</span><span class="dzz-r b"></span><span class="dz-l s"></span>',
  tagebuch: '<span class="dzt-t">Tagebuch</span><span class="dz-l"></span><span class="dz-l s"></span>',
  fibel: '<span class="dzf-b">Fibel</span><span class="dzf-r"><i></i><span class="dz-l"></span></span><span class="dzf-r"><i></i><span class="dz-l s"></span></span>',
  entdecker: '<span class="dze-b"><i>★</i>Entdecker</span><span class="dz-l"></span><span class="dz-l s"></span>',
  bunt: '<span class="dzb-rb"></span><span class="dzb-t">Bunt</span><span class="dzb-c"><i></i><i></i><i></i></span>',
  feed: '<span class="dzs-r"><i></i><em>@kurs</em></span><span class="dzs-c"></span><span class="dz-l s"></span>',
  magazin: '<span class="dzm-k">MAGAZIN</span><span class="dzm-t">Titel</span><span class="dz-l s"></span>',
  wiki: '<span class="dzw-t">Lexikon</span><span class="dzw-b"></span><span class="dz-l"></span><span class="dz-l s"></span>',
  archiv: '<span class="dzr-t">Archiv</span><span class="dz-l"></span><span class="dzr-s">Sig. 4</span>',
  notiz: '<span class="dzn-tp"></span><span class="dzn-t">Notizen</span><span class="dzn-y"></span>',
  programm: '<span class="dzq-k">PROGRAMM</span><span class="dzq-t">Titel</span><span class="dzq-o"><i></i>❦<i></i></span>',
  schlicht: '<span class="dzx-t">Schlicht</span><span class="dz-l"></span><span class="dz-l"></span><span class="dz-l s"></span>'
};
function designEditor(m) {
  const d = designOf(m);
  const tile = ([k, x]) => `<button type="button" class="dz" data-act="design" data-v="${k}" aria-pressed="${d === k}"><span class="dz-p dz-${k}" aria-hidden="true">${DZ_PREV[k]}</span><b>${x.label}</b></button>`;
  const gs = isGS() || DESIGNS[d].gs; const E = Object.entries(DESIGNS);
  const more = state.dzMore || !!DESIGNS[d].more, X = E.filter(([, x]) => x.more);
  const moreH = more ? `<small class="dz-h">Weitere Designs</small>${X.map(tile).join('')}<button type="button" class="dz-more" data-act="dz-more" aria-expanded="true">Weniger anzeigen</button>` : `<button type="button" class="dz-more" data-act="dz-more" aria-expanded="false">Mehr Designs (${X.length}) …</button>`;
  const base = E.filter(([, x]) => !x.gs && !x.more);
  const tiles = (gs ? `<small class="dz-h">Für die Grundschule</small>${E.filter(([, x]) => x.gs).map(tile).join('')}<small class="dz-h">Weitere</small>${base.map(tile).join('')}` : base.map(tile).join('')) + moreH;
  let opts = '';
  if (d === 'akte') opts = `${fText('stamp', 'Stempel', m.stamp == null ? 'VERTRAULICH' : m.stamp, 'leer = kein Stempel')}<div class="chks">${fCheck('tone', 'Papierton (braucht mehr Toner)', m.tone !== false)}</div>`;
  if (d === 'zeitung') opts = fText('masthead', 'Zeitungsname', m.masthead || '', m.course || 'Kurszeitung');
  return `<div class="f"><span>Design</span><div class="dz-grid">${tiles}</div></div>${opts}`;
}
function headHTML(meta) {
  const d = designOf(meta);
  const HL = ({ en: ['Name', 'Date'], es: ['Nombre', 'Fecha'], fr: ['Nom', 'Date'] })[fachLang()] || ['Name', 'Datum'];
  const fields = (meta.showName ? `<span>${HL[0]}<i></i></span>` : '') + (meta.showDate ? `<span class="dt">${HL[1]}<i></i></span>` : '');
  const title = esc(deQuoteStr(meta.title || 'Ohne Titel'));
  if (d === 'akte') {
    const org = [meta.school, meta.course].filter(Boolean).map(esc).join(' · ');
    const stamp = meta.stamp == null ? 'VERTRAULICH' : String(meta.stamp).trim();
    const sig = (meta.showName ? '<div class="ak-f ak-line"><span>Bearbeitet von</span><u></u></div>' : '') + (meta.showDate ? '<div class="ak-f ak-line ak-dt"><span>Datum</span><u></u></div>' : '');
    return `<div class="blk blk-head ak" data-bid="meta"><div class="ak-box">
      <div class="ak-band"><span class="ak-tab">Akte</span><span class="ak-org">${org}</span></div>
      <div class="ak-row">${meta.nr ? `<div class="ak-f ak-az"><span>Aktenzeichen</span><b>AB ${esc(meta.nr)}</b></div>` : ''}<div class="ak-f ak-betr"><span>Betreff</span><b>${title}</b>${meta.topic ? `<i>${esc(deQuoteStr(meta.topic))}</i>` : ''}</div></div>
      ${sig ? `<div class="ak-row ak-sig">${sig}</div>` : ''}</div>
      ${stamp ? `<div class="ak-stamp">${esc(stamp)}</div>` : ''}</div>`;
  }
  if (d === 'zeitung') {
    const mast = (meta.masthead || '').trim();
    const line = [meta.school, mast ? meta.course : ''].filter(Boolean).map(esc).join(' · ');
    return `<div class="blk blk-head zt" data-bid="meta">
      <div class="zt-top"><span>${meta.nr ? 'Ausgabe Nr. ' + esc(meta.nr) : '&nbsp;'}</span><span class="hd-fields">${fields}</span></div>
      <div class="zt-rule"></div><div class="zt-mast">${esc(mast || meta.course || 'Kurszeitung')}</div><div class="zt-rule b"></div>
      ${line ? `<div class="zt-line">${line}</div>` : ''}
      <h1 class="zt-title">${title}</h1>${meta.topic ? `<p class="zt-deck">${esc(deQuoteStr(meta.topic))}</p>` : ''}</div>`;
  }
  const course = [meta.course, meta.school].filter(Boolean).map(esc).join(' · ');
  const topic = meta.topic ? esc(deQuoteStr(meta.topic)) : '';
  if (d === 'feed') {
    const nm = String(meta.course || meta.school || 'Kurs').trim(); const ini = nm.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'K';
    const handle = nm.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 24) || 'kurs';
    return `<div class="blk blk-head fd" data-bid="meta"><div class="fd-bar"><span class="fd-av">${esc(ini)}</span><div class="fd-id"><b>${esc(nm)}</b><span>@${esc(handle)}${meta.school && meta.course ? ' · ' + esc(meta.school) : ''}</span></div><span class="hd-fields">${fields}</span></div>
      <div class="fd-main">${meta.nr ? `<span class="fd-nr">#AB${esc(meta.nr)}</span>` : ''}<h1>${title}</h1>${topic ? `<p>${topic}</p>` : ''}</div><div class="fd-tabs"><span class="on">Beiträge</span><span>Aufgaben</span><span>Medien</span></div></div>`;
  }
  if (d === 'magazin') return `<div class="blk blk-head mz" data-bid="meta"><div class="mz-top"><span class="mz-kick">${course || 'Magazin'}</span><span class="hd-fields">${fields}</span></div><div class="mz-main">${meta.nr ? `<span class="mz-nr">Ausgabe<b>${esc(meta.nr)}</b></span>` : ''}<h1>${title}</h1>${topic ? `<p>${topic}</p>` : ''}</div></div>`;
  if (d === 'wiki') return `<div class="blk blk-head wk" data-bid="meta"><div class="wk-top"><span>${course || '&nbsp;'}</span><span class="hd-fields">${fields}</span></div><div class="wk-h"><h1>${title}</h1><span class="wk-tabs"><span class="on">Artikel</span><span>Diskussion</span></span></div><div class="wk-sub">aus dem Kurslexikon${meta.nr ? ' · Artikel ' + esc(meta.nr) : ''}</div>${topic ? `<p class="wk-lead">${topic}</p>` : ''}</div>`;
  if (d === 'archiv') return `<div class="blk blk-head ar" data-bid="meta"><div class="ar-top"><span>${['Archiv', ...[meta.course, meta.school].filter(Boolean)].map(esc).join(' · ')}</span><span class="hd-fields">${fields}</span></div><div class="ar-main"><div><h1>${title}</h1>${topic ? `<p>${topic}</p>` : ''}</div>${meta.nr ? `<div class="ar-sig"><small>Signatur</small><b>AB ${esc(meta.nr)}</b></div>` : ''}</div></div>`;
  if (d === 'notiz') return `<div class="blk blk-head nb" data-bid="meta"><div class="nb-top"><span>${course || '&nbsp;'}</span><span class="hd-fields">${fields}</span></div><div class="nb-main"><span class="nb-tape"></span><h1>${title}</h1>${topic ? `<p>${topic}</p>` : ''}${meta.nr ? `<span class="nb-nr">#${esc(meta.nr)}</span>` : ''}</div></div>`;
  if (d === 'programm') return `<div class="blk blk-head prg" data-bid="meta"><div class="prg-top"><span>${esc(meta.course || '') || '&nbsp;'}</span><span class="hd-fields">${fields}</span></div><div class="prg-main"><small>${meta.school ? esc(meta.school) + ' präsentiert' : 'Es spielt der Kurs'}</small><h1>${title}</h1><div class="prg-orn"><i></i>❦<i></i></div>${topic ? `<p>${topic}</p>` : ''}${meta.nr ? `<span class="prg-nr">Programm Nr. ${esc(meta.nr)}</span>` : ''}</div></div>`;
  if (d === 'schlicht') return `<div class="blk blk-head sl" data-bid="meta"><div class="sl-top"><span>${course || '&nbsp;'}</span><span class="hd-fields">${fields}</span></div><div class="sl-main">${meta.nr ? `<span class="sl-nr">AB ${esc(meta.nr)}</span>` : ''}<h1>${title}</h1>${topic ? `<p>${topic}</p>` : ''}</div></div>`;
  if (d === 'fibel' || d === 'entdecker' || d === 'bunt') {
    const deco = d === 'entdecker' ? '<svg class="gs-deco" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3l4.9 10.2 11.1 1.5-8.1 7.7 2 11-9.9-5.4-9.9 5.4 2-11-8.1-7.7 11.1-1.5z"/></svg>'
      : d === 'fibel' ? '<svg class="gs-deco" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="8.5"/><g stroke-width="2.6" stroke-linecap="round"><path d="M20 4v5M20 31v5M4 20h5M31 20h5M8.7 8.7l3.5 3.5M27.8 27.8l3.5 3.5M8.7 31.3l3.5-3.5M27.8 12.2l3.5-3.5"/></g></svg>' : '';
    return `<div class="blk blk-head gsh gsh-${d}" data-bid="meta">
      <div class="gsh-top"><span class="gsh-course">${course || '&nbsp;'}</span><span class="hd-fields">${fields}</span></div>
      <div class="gsh-main">${meta.nr ? `<span class="gsh-nr">${esc(meta.nr)}</span>` : ''}<div class="gsh-t"><h1>${title}</h1>${meta.topic ? `<p>${esc(deQuoteStr(meta.topic))}</p>` : ''}</div>${deco}</div></div>`;
  }
  if (d === 'tagebuch') {
    return `<div class="blk blk-head tg" data-bid="meta">
      <div class="tg-top"><span class="tg-course">${course || '&nbsp;'}</span><span class="hd-fields">${fields}</span></div>
      <div class="tg-main${meta.nr ? ' has-nr' : ''}">${meta.nr ? `<span class="tg-nr">Nr. ${esc(meta.nr)}</span>` : ''}<h1>${title}</h1>${meta.topic ? `<p>${esc(deQuoteStr(meta.topic))}</p>` : ''}</div></div>`;
  }
  return `<div class="blk blk-head" data-bid="meta">
    <div class="hd-top"><span class="hd-course">${course || '&nbsp;'}</span><span class="hd-fields">${fields}</span></div>
    <div class="hd-main">${meta.nr ? `<div class="hd-nr"><small>AB</small><b>${esc(meta.nr)}</b></div>` : ''}
      <div class="hd-titles"><h1>${title}</h1>${meta.topic ? `<p>${esc(deQuoteStr(meta.topic))}</p>` : ''}</div></div></div>`;
}

