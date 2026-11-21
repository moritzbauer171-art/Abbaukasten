"""Arbeitsblatt: Vorschau, Seitenleiste, Prüfblick."""
from conftest import blocks_standard

def test_start_ohne_fehler(lw):
    pg = lw.open(); lw.new_lesson(pg)
    assert pg.locator('#editor').count() == 1

def test_absatzanfaenge_ohne_rahmen(lw):
    # Rückfall vom 20.11.: der Kasten „Noch offen“ hieß wie die Absatzzeilen (.pf) und rahmte sie ein
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard())
    n = pg.evaluate("[...document.querySelectorAll('#pages .ln')].filter(x => getComputedStyle(x).borderTopWidth !== '0px' || getComputedStyle(x).borderLeftWidth !== '0px').length")
    assert pg.locator('#pages .ln').count() > 20
    assert n == 0

def test_zwischenueberschriften_als_luecke(lw):
    pg = lw.open(); lw.new_lesson(pg); b = blocks_standard(); b[2]['gapHd'] = 'kasten'; lw.setup(pg, b)
    assert pg.locator('#pages .ln.mh').count() >= 2

def test_gliederung_und_springen(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard())
    chips = pg.locator('#editor .olz .ol-c').all_inner_texts()
    assert [c.strip() for c in chips][:3] == ['Kopf', 'Zitat', 'Merke']
    pg.click('#editor .ol-c:has-text("M1")'); pg.wait_for_timeout(600)
    assert pg.evaluate("document.querySelector('#editor .card.sel').dataset.bid") == 'm1'
    assert pg.locator('#editor .card:not(.closed)').count() == 1

def test_gliederung_umsortieren(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard())
    pg.drag_and_drop('#editor .ol-c:has-text("Merke")', '#editor .ol-c:has-text("Zitat")', target_position={'x': 4, 'y': 10}); pg.wait_for_timeout(700)
    assert pg.evaluate("__S.sheet.blocks.map(b => b.id).slice(0, 2)") == ['i1', 'q1']

def test_pruefblick(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard())
    items = pg.locator('#editor .pfx li').all_inner_texts()
    assert any('Erwartung' in x for x in items)
    pg.locator('#editor .pfx li button').first.click(); pg.wait_for_timeout(500)
    assert pg.locator('#editor .card.sel').count() == 1

def test_schnellfeld_zugeklappt(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard())
    el = pg.locator('#pages [data-bid="m1"]').first; el.scroll_into_view_if_needed(); bb = el.bounding_box()
    pg.mouse.move(bb['x'] + 200, bb['y'] + 120); pg.wait_for_timeout(600)
    assert pg.locator('#pv-tools .pvq').count() == 0 and pg.locator('#pv-tools [data-pv="qx"]').count() == 1

def test_think_pair_share(lw):
    pg = lw.open(); lw.new_lesson(pg); b = blocks_standard(); b[3]['items'][0]['soz'] = 'tps'; lw.setup(pg, b)
    assert pg.locator('#pages .task-soz img[alt="Think-Pair-Share"]').count() == 1
    pg.click('#editor .ol-c:has-text("Aufgaben")'); pg.wait_for_timeout(500)
    assert pg.locator('#editor .card.sel [data-act="soz"][data-v="tps"][aria-pressed="true"]').count() == 1
