"""Companion: zwei Tablets schreiben gleichzeitig auf die Tafel."""
from conftest import blocks_standard

def test_zwei_geraete_parallel(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard())
    pads = []
    for i in range(2):
        t = lw.open('?tafel', viewport={'width': 1180, 'height': 820}); pads.append(t)
    pg.evaluate("__OP(0)")
    for t in pads:
        try: t.wait_for_selector('.lfc-tkm', timeout=12000)
        except Exception: t.reload(); t.wait_for_selector('.lfc-tkm', timeout=15000)
    for t in pads:
        t.click('.lfc-tkm'); t.wait_for_timeout(300); t.click('.lfc-modes [data-tab="tafel"]'); t.wait_for_timeout(900); t.locator('.lfc-palb [data-tool="pen"]').click(); t.wait_for_timeout(300)
    a, q = pads; ba = a.locator('.lfc-board').bounding_box(); bq = q.locator('.lfc-board').bounding_box()
    for r in range(3):
        a.mouse.move(ba['x'] + 100, ba['y'] + 100 + r * 80); q.mouse.move(bq['x'] + 600, bq['y'] + 100 + r * 80); a.mouse.down(); q.mouse.down()
        for k in range(8): a.mouse.move(ba['x'] + 100 + k * 30, ba['y'] + 110 + r * 80); q.mouse.move(bq['x'] + 600 + k * 30, bq['y'] + 110 + r * 80)
        q.mouse.up(); a.mouse.up(); a.wait_for_timeout(150)
    a.wait_for_timeout(2500)
    assert pg.evaluate("__PCT()") == 6
    assert a.evaluate("__LB().tafel.ink.length") == 6 and q.evaluate("__LB().tafel.ink.length") == 6
