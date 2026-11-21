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

def test_stift_ist_laser_auf_folie(lw):
    pg = lw.open(); lw.new_lesson(pg); lw.setup(pg, blocks_standard()); pg.evaluate("__SV()"); pg.wait_for_timeout(500)
    pg.evaluate("__OP(0)"); pg.wait_for_timeout(1000)
    pad = lw.open('?tafel', viewport={'width': 1180, 'height': 820})
    for _ in range(3):
        try: pad.wait_for_selector('.lfc-tkm', timeout=10000); break
        except Exception: pad.reload()
    pad.evaluate("""() => { const b = document.querySelector('.lfc-board'), r = b.getBoundingClientRect(); window.__sent = [];
      const ev = (t, x) => b.dispatchEvent(new PointerEvent(t, { pointerId: 7, pointerType: 'pen', pressure: .5, clientX: r.left + x, clientY: r.top + 200, bubbles: true, cancelable: true, buttons: t === 'pointerup' ? 0 : 1 }));
      ev('pointerdown', 200); for (let i = 1; i < 6; i++) ev('pointermove', 200 + i * 20); ev('pointerup', 320); }""")
    pad.wait_for_timeout(300)
    sent = pad.evaluate("(window.__sent || []).map(m => m.t + (m.op ? ':' + m.op : ''))")
    assert 'blas' in sent and 'bop:add' not in sent, sent
