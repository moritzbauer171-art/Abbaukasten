"""Ausgabe: Verlaufsplan und Word."""
import zipfile
from conftest import blocks_standard, OUT

def test_verlaufsplan_word(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard())
    pg.evaluate("__VP()"); pg.wait_for_timeout(800)
    assert pg.locator('#dlg-root .dlg-vp').count() == 1
    with pg.expect_download(timeout=30000) as d:
        pg.click('#dlg-root [data-act="vp-docx"]')
    f = OUT / 'verlaufsplan.docx'; d.value.save_as(str(f))
    xml = zipfile.ZipFile(f).read('word/document.xml').decode()
    assert 'Erarbeitung' in xml and 'Multimodalität' in xml

def test_verlaufsplan_im_ausgeben(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard())
    pg.click('#btn-out'); pg.wait_for_timeout(500)
    pg.click('#dlg-root [data-act="out-vp"]'); pg.wait_for_timeout(600)
    assert pg.locator('#dlg-root .dlg-vp').count() == 1
    assert pg.locator('#dlg-root [data-act="vp-print"]').count() == 1
    assert '75 Min.' in pg.locator('#dlg-root select[data-vp="lesson"]').inner_text()

def test_tps_in_word(lw):
    pg = lw.open(); lw.new_lesson(pg); b = blocks_standard(); b[3]['items'][0]['soz'] = 'tps'; lw.setup(pg, b)
    assert pg.locator('#pages .task-tps .tps-s').count() == 3
    pg.click('#btn-out'); pg.wait_for_timeout(500); pg.click('#dlg-root [data-act="out-set"][data-f="fmt"][data-v="docx"]'); pg.wait_for_timeout(300)
    with pg.expect_download(timeout=30000) as d:
        pg.click('#dlg-root [data-act="out-go"]')
    f = OUT / 'tps.docx'; d.value.save_as(str(f))
    xml = zipfile.ZipFile(f).read('word/document.xml').decode()
    assert '1 Think' in xml and '3 Share' in xml
