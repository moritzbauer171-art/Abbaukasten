"""Abstand nach dem Kopf und Rand unten: Standard normal, Stufe weniger."""
def test_rand_weniger_normal(lw):
    pg = lw.open(); lw.new_lesson(pg)
    assert pg.evaluate("__S.sheet.meta.headGap") == 'n' and pg.evaluate("__S.sheet.meta.botGap") == 'n'
    lw.setup(pg, [{'id': 't1', 'type': 'tasks', 'title': '', 'items': [{'text': 'Lesen Sie den Text.', 'soz': 'ea'}]}] + [{'id': f'l{i}', 'type': 'lines', 'count': 6, 'style': 'lines'} for i in range(8)])
    out = {}
    for g in ['w', 'n', 'm']:
        pg.evaluate(f"__S.sheet.meta.headGap = '{g}'; __S.sheet.meta.botGap = '{g}'; __RP()"); pg.wait_for_timeout(700)
        out[g] = pg.evaluate("(() => { const p = document.querySelector('#pages .page'); const h = p.querySelector('.blk-head').getBoundingClientRect(), n = p.querySelector('.blk-head').nextElementSibling.getBoundingClientRect(); const bl = [...p.querySelectorAll('.blk')].pop().getBoundingClientRect(); return [Math.round(n.top - h.bottom), Math.round(p.getBoundingClientRect().bottom - bl.bottom), document.querySelectorAll('#pages .page').length]; })()")
    assert out['w'][0] < out['n'][0] and out['m'][2] >= out['n'][2] >= out['w'][2], out


