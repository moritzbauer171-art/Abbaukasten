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
    assert pg.locator('#pages .blk-lb .lb-a').count() == 3
    assert 'Figuren' in pg.locator('#pages .blk-lb').inner_text()
    # Pfeile zeigen zum Bild: linke Kästen enden links vom Bild, rechte rechts davon
    g = pg.evaluate("""(() => { const r = s => document.querySelector(s).getBoundingClientRect();
      return [r('#pages .lb-col.l .lb-a').right, r('#pages .lb-mid').left, r('#pages .lb-col.r .lb-a').left, r('#pages .lb-mid').right]; })()""")
    assert g[0] <= g[1] + 2 and g[2] >= g[3] - 2
    assert pg.locator('#editor .lb-row').count() == 3
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
    assert pg.locator('#editor .lb-row').count() == 4
    pg.locator('#editor [data-act="lb-add"]').click(); pg.wait_for_timeout(400)
    assert pg.evaluate("__S.sheet.blocks.find(x => Array.isArray(x.lb)).lb.length") == 5
    pg.locator('#editor [data-act="lb-at"][data-i="0"][data-v="m"]').click(); pg.wait_for_timeout(300)
    assert pg.evaluate("__S.sheet.blocks.find(x => Array.isArray(x.lb)).lb[0].at") == 'm'
    pg.locator('#editor [data-act="lb-mode"][data-v="text"]').click(); pg.wait_for_timeout(500)
    assert pg.locator('#pages .blk-lb.lb-leer').count() == 1
