"""A4 quer und der Baustein „Bild mit Beschriftungen“."""
import zipfile
from conftest import blocks_standard, OUT

PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

def lb_block(mode=''):
    return {'id': 'lb1', 'type': 'image', 'src': PNG, 'w': 1, 'h': 1, 'caption': 'Meine Lesekiste', 'source': '', 'width': 40, 'lbMode': mode,
            'lb': [{'h': 'Titel', 't': 'Schreibe den Titel auf.', 's': 'l', 'at': 'o'}, {'h': 'Figuren', 't': 'Stelle die Figuren dar.', 's': 'l', 'at': 'u'},
                   {'h': 'Ort', 't': 'Wo spielt es?', 's': 'r', 'at': 'm'}]}

def pages(pg):
    return pg.evaluate("[...document.querySelectorAll('#pages .page')].map(p => [p.dataset.w, p.dataset.h, Math.round(p.getBoundingClientRect().width / p.getBoundingClientRect().height * 100)])")

def docx(pg, name):
    pg.click('#btn-out'); pg.wait_for_timeout(500); pg.click('#dlg-root [data-act="out-set"][data-f="fmt"][data-v="docx"]'); pg.wait_for_timeout(300)
    with pg.expect_download(timeout=30000) as d:
        pg.click('#dlg-root [data-act="out-go"]')
    f = OUT / name; d.value.save_as(str(f))
    return zipfile.ZipFile(f).read('word/document.xml').decode()

def test_a4_hoch_bleibt(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard())
    P = pages(pg); assert P and all(p[0] == '210' and p[1] == '297' for p in P)
    assert pg.locator('#pages .page.a4q').count() == 0
    xml = docx(pg, 'hoch.docx')
    assert '<w:pgSz w:w="11906" w:h="16838"/>' in xml and 'landscape' not in xml

def test_a4_quer(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard())
    pg.evaluate("__S.sheet.meta.paper = 'a4q'; __RE(); __RP()"); pg.wait_for_timeout(900)
    P = pages(pg); assert P and all(p[0] == '297' and p[1] == '210' and p[2] > 130 for p in P)
    xml = docx(pg, 'quer.docx')
    assert 'w:orient="landscape"' in xml

def test_beschriftung_blatt_und_word(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, [lb_block()])
    pg.evaluate("__RP()"); pg.wait_for_timeout(600)
    assert pg.locator('#pages .blk-lb .lb-c').count() == 3
    assert pg.locator('#pages .blk-lb .lb-col.l .lb-c').count() == 2
    assert pg.locator('#pages .blk-lb svg.lb-ov path.lb-a:not(.lb-hd)').count() == 3
    # Pfeile enden am Bild: linke Pfeile links vom Bild, rechte rechts davon
    g = pg.evaluate("""(() => { const ps = [...document.querySelectorAll('#pages .lb-ov path.lb-a:not(.lb-hd)')].map(p => p.getBBox());
      const sv = document.querySelector('#pages .lb-ov'), m = document.querySelector('#pages .lb-mid img').getBoundingClientRect(), G = sv.getBoundingClientRect(), k = sv.viewBox.baseVal.width / G.width;
      return { l: [ps[0].x + ps[0].width, (m.left - G.left) * k], r: [ps[2].x, (m.right - G.left) * k] }; })()""")
    assert g['l'][0] <= g['l'][1] + 0.5 and g['r'][0] >= g['r'][1] - 0.5
    assert pg.locator('#editor .lb-row-e').count() == 3
    xml = docx(pg, 'lb.docx')
    assert 'Figuren' in xml and 'Wo spielt es?' in xml and '<w:drawing>' in xml

def test_beschriftung_leer(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, [lb_block('ganz')])
    pg.evaluate("__RP()"); pg.wait_for_timeout(600)
    t = pg.locator('#pages .blk-lb').inner_text()
    assert 'Figuren' not in t and 'Schreibe' not in t
    assert pg.locator('#pages .blk-lb .lb-wl').count() == 9

def test_beschriftung_aus_palette(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, [])
    pg.click('#editor [data-act="bk-open"]'); pg.wait_for_timeout(500)
    pg.locator('[data-act="add"][data-pk="beschriftet"]').first.click(); pg.wait_for_timeout(700)
    b = pg.evaluate("__S.sheet.blocks.find(x => Array.isArray(x.lb))")
    assert b and b['type'] == 'image' and len(b['lb']) == 4
    assert pg.locator('#editor .lb-row-e').count() == 4
    pg.locator('#editor [data-act="lb-add"]').click(); pg.wait_for_timeout(400)
    assert pg.evaluate("__S.sheet.blocks.find(x => Array.isArray(x.lb)).lb.length") == 5
    pg.locator('#editor [data-act="lb-at"][data-i="0"][data-v="m"]').click(); pg.wait_for_timeout(300)
    assert pg.evaluate("__S.sheet.blocks.find(x => Array.isArray(x.lb)).lb[0].at") == 'm'
    pg.locator('#editor [data-act="lb-mode"][data-v="text"]').click(); pg.wait_for_timeout(500)
    assert pg.locator('#pages .blk-lb.lb-leer').count() == 1

def test_beschriftung_oben_unten_und_freies_ziel(lw):
    pg = lw.open(); lw.new_lesson(pg); b = lb_block(); b['lb'][0]['s'] = 'o'; b['lb'][2]['s'] = 'u'; lw.setup(pg, [b])
    pg.evaluate("__RP()"); pg.wait_for_timeout(600)
    assert pg.locator('#pages .lb-row.o .lb-c').count() == 1 and pg.locator('#pages .lb-row.u .lb-c').count() == 1
    pg.locator('#editor [data-act="lb-free"][data-i="1"]').click(); pg.wait_for_timeout(600)
    dot = pg.locator('#editor .lb-dot[data-lbdot="1"]'); assert dot.count() == 1
    bx = pg.locator('#editor [data-lbpick] img').bounding_box(); d = dot.bounding_box()
    pg.mouse.move(d['x'] + d['width'] / 2, d['y'] + d['height'] / 2); pg.mouse.down()
    pg.mouse.move(bx['x'] + bx['width'] * 0.8, bx['y'] + bx['height'] * 0.2, steps=6); pg.mouse.up(); pg.wait_for_timeout(700)
    x = pg.evaluate("__S.sheet.blocks[0].lb[1]")
    assert 70 < x['tx'] <= 90 and 10 <= x['ty'] < 30
    assert pg.locator('#pages .lb-c[data-lbi="1"][data-tx]').count() == 1
    xml = docx(pg, 'lb2.docx'); assert xml.index('Titel') < xml.index('Figuren') < xml.index('Wo spielt es?')

def test_klick_auf_kasten_springt_zum_feld(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, [lb_block()])
    pg.evaluate("__RP()"); pg.wait_for_timeout(600)
    pg.locator('#pages .lb-c[data-lbi="2"]').click(); pg.wait_for_timeout(900)
    assert pg.evaluate("document.activeElement.dataset.k") == 'lb.2.h'
    assert pg.locator('#editor .lb-row-e.lb-hit').count() == 1

def test_pfeilspitze_im_blatt_ziehen_und_stile(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, [lb_block()])
    pg.evaluate("__RP()"); pg.wait_for_timeout(700)
    tip = pg.locator('#pages .lb-tip[data-lbi="2"]'); assert tip.count() == 1
    pg.locator('#pages .blk-lb').hover(); t = tip.bounding_box(); m = pg.locator('#pages .lb-mid img').bounding_box()
    pg.mouse.move(t['x'] + t['width'] / 2, t['y'] + t['height'] / 2); pg.mouse.down()
    pg.mouse.move(m['x'] + m['width'] * 0.5, m['y'] + m['height'] * 0.5, steps=8); pg.mouse.up(); pg.wait_for_timeout(800)
    x = pg.evaluate("__S.sheet.blocks[0].lb[2]")
    assert 35 < x['tx'] < 65 and 35 < x['ty'] < 65
    assert pg.locator('#editor .lb-dot[data-lbdot="2"]').count() == 1
    for v in ['gerade', 'strich', 'kraeftig', 'punkt']:
        pg.locator(f'#editor [data-act="lb-arr"][data-v="{v}"]').click(); pg.wait_for_timeout(500)
        assert pg.locator(f'#pages .lb-ov.s-{v}').count() == 1
    assert pg.locator('#pages .lb-ov .lb-pt').count() == 3
    # Griffe landen nicht im Druck
    assert pg.evaluate("getComputedStyle(document.querySelector('#pages .lb-tip')).display") != 'none'

def test_moderationskarten(lw):
    pg = lw.open(); lw.new_lesson(pg)
    lw.setup(pg, [{'id': 't1', 'type': 'tasks', 'title': '', 'items': [{'text': 'Sammeln Sie Argumente.', 'soz': 'ga', 'arb': ['karten']}, {'text': 'Lesen Sie den Text.', 'soz': 'ea'}]}])
    pg.evaluate("__RP()"); pg.wait_for_timeout(600)
    H = 'Notieren Sie Ihre Ergebnisse gut leserlich auf Moderationskarten. Präsentieren Sie Ihre Ergebnisse im Plenum.'
    assert pg.locator('#pages .task-hint').count() == 1
    assert pg.locator('#pages .task-hint').inner_text() == H
    assert pg.locator('#pages img.arb[alt="Moderationskarten"]').count() == 1
    # Auswahl im Editor schaltet Piktogramm und Hinweis um
    pg.locator('#editor [data-act="arb"][data-i="1"][data-v="karten"]').click(); pg.wait_for_timeout(500)
    assert pg.locator('#pages .task-hint').count() == 2
    xml = docx(pg, 'karten.docx'); assert xml.count('gut leserlich auf Moderationskarten') == 2

def test_tabelle_farben(lw):
    pg = lw.open(); lw.new_lesson(pg)
    lw.setup(pg, [{'id': 'tb1', 'type': 'table', 'title': '', 'cols': ['Figur', 'Merkmal'], 'rows': [['Anne', ''], ['Peter', ''], ['Abschnitt 2', ''], ['Otto', '']], 'rowHeight': 'normal'}])
    pg.evaluate("__RP()"); pg.wait_for_timeout(500)
    pg.locator('#editor [data-act="tb-mode"][data-v="farbe"]').click(); pg.wait_for_timeout(400)
    pg.locator('#editor [data-act="tb-brush"][data-v="blau"]').click(); pg.wait_for_timeout(300)
    pg.locator('#editor [data-act="tb-paint-row"][data-ri="2"]').click(); pg.wait_for_timeout(400)
    pg.locator('#editor [data-act="tb-brush"][data-v="gelb"]').click(); pg.wait_for_timeout(300)
    pg.locator('#editor [data-act="tb-paint"][data-c="h.0"]').click(); pg.wait_for_timeout(600)
    bg = pg.evaluate("__S.sheet.blocks[0].bg")
    assert bg == {'2.0': 'blau', '2.1': 'blau', 'h.0': 'gelb'}
    cs = pg.evaluate("[...document.querySelectorAll('#pages .tb tbody tr')].map(r => getComputedStyle(r.cells[0]).backgroundColor)")
    assert cs[2] == 'rgb(211, 230, 250)' and cs[0] != cs[2]
    assert pg.evaluate("getComputedStyle(document.querySelector('#pages .tb th')).backgroundColor") == 'rgb(255, 241, 168)'
    xml = docx(pg, 'farbe.docx'); assert 'D3E6FA' in xml and 'FFF1A8' in xml
    # Zeile nochmal mit derselben Farbe: Farbe wieder weg
    pg.locator('#editor [data-act="tb-brush"][data-v="blau"]').click(); pg.wait_for_timeout(300)
    pg.locator('#editor [data-act="tb-paint-row"][data-ri="2"]').click(); pg.wait_for_timeout(400)
    assert pg.evaluate("__S.sheet.blocks[0].bg") == {'h.0': 'gelb'}
    pg.locator('#editor [data-act="tb-mode"][data-v=""]').first.click(); pg.wait_for_timeout(400)
    assert pg.locator('#editor [data-act="tb-mode"][data-v="farbe"]').inner_text().strip() == 'Farbe · 1'

def test_tabelle_popup(lw):
    pg = lw.open(); lw.new_lesson(pg)
    lw.setup(pg, [{'id': 'tb1', 'type': 'table', 'title': '', 'cols': ['A', 'B'], 'rows': [['a1', 'b1'], ['a2', 'b2']], 'cw': [70, 30], 'bg': {'1.0': 'gelb'}, 'rowHeight': 'normal'}])
    pg.evaluate("__RP()"); pg.wait_for_timeout(500)
    pg.locator('#pages .blk-table').dblclick(); pg.wait_for_timeout(500)
    assert pg.locator('#tbm .tbm-grid').count() == 1
    T = lambda: pg.evaluate("(({cols, rows, cw, bg}) => ({cols, rows, cw: cw || null, bg: bg || null}))(__S.sheet.blocks[0])")
    pg.locator('#tbm [data-act="tbx-row-ins"][data-ri="0"][data-pos="0"]').click(); pg.wait_for_timeout(300)
    t = T(); assert t['rows'] == [['', ''], ['a1', 'b1'], ['a2', 'b2']] and t['bg'] == {'2.0': 'gelb'}
    pg.locator('#tbm [data-act="tbx-row-mv"][data-ri="2"][data-d="-1"]').click(); pg.wait_for_timeout(300)
    t = T(); assert t['rows'][1] == ['a2', 'b2'] and t['bg'] == {'1.0': 'gelb'}
    pg.locator('#tbm [data-act="tbx-col-ins"][data-ci="0"][data-pos="1"]').click(); pg.wait_for_timeout(300)
    t = T(); assert t['cols'] == ['A', '', 'B'] and t['rows'][2] == ['a1', '', 'b1'] and len(t['cw']) == 3 and abs(sum(t['cw']) - 100) < 0.5
    pg.locator('#tbm [data-act="tbx-col-mv"][data-ci="2"][data-d="-1"]').click(); pg.wait_for_timeout(300)
    assert T()['cols'] == ['A', 'B', '']
    pg.locator('#tbm [data-act="tbx-col-del"][data-ci="2"]').click(); pg.wait_for_timeout(300)
    pg.locator('#tbm [data-act="tbx-row-del"][data-ri="0"]').click(); pg.wait_for_timeout(300)
    t = T(); assert t['cols'] == ['A', 'B'] and t['rows'] == [['a2', 'b2'], ['a1', 'b1']] and t['bg'] == {'0.0': 'gelb'}
    # Schreiben im Popup kommt im Blatt an
    c = pg.locator('#tbm .rtx[data-k="rows.0.1"]'); c.click(); pg.keyboard.press('End'); pg.keyboard.type(' neu'); pg.wait_for_timeout(900)
    assert 'b2 neu' in pg.locator('#pages .tb').inner_text()
    pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    assert pg.locator('#tbm').count() == 0

def test_raketenaufgabe(lw):
    from conftest import OUT
    pg = lw.open(); lw.new_lesson(pg)
    lw.setup(pg, [{'id': 't1', 'type': 'tasks', 'title': '', 'items': [{'text': 'Beschreiben Sie die Panels.', 'soz': 'ea'}, {'text': 'Entwerfen Sie ein eigenes Panel zu einer Tagebuchstelle.', 'soz': 'ea'}, {'text': 'Vergleichen Sie mit dem Tagebuch.', 'soz': 'pa'}]}])
    pg.evaluate("__RP()"); pg.wait_for_timeout(400)
    pg.locator('#editor [data-act="it-rk"][data-i="1"]').click(); pg.wait_for_timeout(500)
    assert pg.evaluate("__S.sheet.blocks[0].items[1].rk") is True
    # Standard: kleine Rakete an der Nummer
    assert pg.locator('#pages .task-rkb').count() == 1 and pg.locator('#pages .task-rksec').count() == 0
    pg.locator('#pages .blk-tasks').screenshot(path=str(OUT / 'rk_nr.png'))
    xml = docx(pg, 'rk.docx'); assert '🚀' in xml
    pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    # Eigener Abschnitt: Raketenaufgabe wandert ans Ende, Überschrift davor
    pg.locator('#editor [data-act="rk-style"][data-v="abschnitt"]').click(); pg.wait_for_timeout(500)
    assert pg.evaluate("__S.sheet.blocks[0].items.map(x => !!x.rk)") == [False, False, True]
    assert pg.locator('#pages .task-rksec').count() == 1 and pg.locator('#pages .task-rkb').count() == 0
    assert 'fertig sind' in pg.locator('#pages .task-rksec').inner_text()
    pg.locator('#editor [data-rkh]').fill('Raketenstart'); pg.wait_for_timeout(700)
    assert 'Raketenstart' in pg.locator('#pages .task-rksec').inner_text()
    pg.locator('#pages .blk-tasks').screenshot(path=str(OUT / 'rk_ab.png'))
    xml = docx(pg, 'rk2.docx'); assert 'Raketenstart' in xml
    pg.keyboard.press('Escape'); pg.evaluate("__OP(0)"); pg.wait_for_timeout(1000)
    for _ in range(5):
        if pg.locator('.pr .pr-slide .pr-rksec').count(): break
        pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(400)
    assert pg.locator('.pr .pr-slide .pr-rksec').count() == 1
    pg.locator('.pr .pr-slide').screenshot(path=str(OUT / 'rk_folie.png'))
