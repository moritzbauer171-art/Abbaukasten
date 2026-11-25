"""Ersatzverbindung: Netz sperrt den Live-Kanal (wie im Schul-WLAN) – Companion läuft über die Tabelle ab_relay."""
from conftest import blocks_standard

BLOCK = "window.__blockRT = true;"

def pad_tafel(t):
    try: t.wait_for_selector('.lfc-tkm', timeout=20000)
    except Exception: t.reload(); t.wait_for_selector('.lfc-tkm', timeout=20000)
    t.click('.lfc-tkm'); t.wait_for_timeout(300); t.click('.lfc-modes [data-tab="tafel"]'); t.wait_for_timeout(1200); t.locator('.lfc-palb [data-tool="pen"]').click(); t.wait_for_timeout(300)

def draw(t, n):
    b = t.locator('.lfc-board').bounding_box()
    for r in range(n):
        t.mouse.move(b['x'] + 100, b['y'] + 100 + r * 80); t.mouse.down()
        for k in range(8): t.mouse.move(b['x'] + 100 + k * 30, b['y'] + 110 + r * 80)
        t.mouse.up(); t.wait_for_timeout(200)

def test_beide_geraete_gesperrt(lw):
    pg = lw.open(init=BLOCK); lw.new_lesson(pg); lw.setup(pg, blocks_standard()); pg.evaluate("__SV()"); pg.wait_for_timeout(400)
    pad = lw.open('?tafel', viewport={'width': 1180, 'height': 820}, init=BLOCK)
    pg.evaluate("__OP(0)"); pg.wait_for_timeout(500)
    pad_tafel(pad)
    assert pad.locator('.lfc-fb').count() == 1
    assert pg.locator('.pr-fbst').count() == 1
    draw(pad, 2); pad.wait_for_timeout(2500)
    assert pg.evaluate("__PCT()") == 2
    # Fernbedienung: Folie weiterschalten vom iPad
    pad.click('.lfc-modes [data-tab="fol"]') if pad.locator('.lfc-modes [data-tab="fol"]').is_visible() else None
    n0 = pg.evaluate("document.querySelector('.pr .pr-n') ? document.querySelector('.pr .pr-n').textContent : ''")
    pad.evaluate("(document.querySelector('[data-l=\"next\"]') || document.querySelector('[data-nav=\"next\"]') || {click(){}}).click()"); pad.wait_for_timeout(2000)
    # nichts ging über den (gesperrten) Live-Kanal
    assert pg.evaluate("(window.__sent || []).length") == 0

def test_nur_ipad_gesperrt(lw):
    # Laptop hat Live-Kanal, iPad nicht: der Laptop merkt es an der Tabelle und schaltet mit um
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard()); pg.evaluate("__SV()"); pg.wait_for_timeout(400)
    pad = lw.open('?tafel', viewport={'width': 1180, 'height': 820}, init=BLOCK)
    pg.evaluate("__OP(0)"); pg.wait_for_timeout(500)
    pad_tafel(pad)
    draw(pad, 1); pad.wait_for_timeout(6000)
    assert pg.locator('.pr-fbst').count() == 1
    assert pg.evaluate("__PCT()") == 1

def test_normal_ohne_ersatz(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard()); pg.evaluate("__SV()"); pg.wait_for_timeout(400)
    pad = lw.open('?tafel', viewport={'width': 1180, 'height': 820})
    pg.evaluate("__OP(0)"); pg.wait_for_timeout(500)
    pad_tafel(pad); draw(pad, 1); pad.wait_for_timeout(5000)
    assert pg.locator('.pr-fbst').count() == 0 and pad.locator('.lfc-fb').count() == 0
    assert pg.evaluate("__PCT()") == 1
    assert pg.evaluate("(JSON.parse(localStorage.getItem('fakedb') || '{}').ab_relay || []).length") == 0
