"""Schriftgröße je Aufgabenbaustein: Blatt, Übernahme für alle, Word."""

def test_aufgaben_schriftgroesse(lw):
    pg = lw.open(); lw.new_lesson(pg)
    lw.setup(pg, [{'id': 't1', 'type': 'tasks', 'title': '', 'items': [{'text': 'Lesen Sie den Text.', 'soz': 'ea'}]}, {'id': 't2', 'type': 'tasks', 'title': '', 'items': [{'text': 'Fassen Sie zusammen.', 'soz': 'ea'}]}])
    fs = lambda i: pg.evaluate(f"getComputedStyle(document.querySelectorAll('#pages .blk-tasks .task-body')[{i}]).fontSize")
    assert fs(0) == '14px'  # 10,5 pt
    pg.evaluate("__S.sheet.blocks[0].fs = 'L'; __RP()"); pg.wait_for_timeout(500)
    assert fs(0) == '16px' and fs(1) == '14px'
    pg.evaluate("__S.sel = 't1'; __S.sheet.blocks[0].fs = 'G16'; __RE(); __RP()"); pg.wait_for_timeout(500)
    pg.evaluate("document.querySelector('#editor .card[data-bid=\"t1\"] .more-card button') && 0")
    pg.evaluate("(() => { const b = document.createElement('button'); b.dataset.act = 'tfs-all'; document.querySelector('#editor .card[data-bid=\"t1\"]').appendChild(b); b.click(); })()"); pg.wait_for_timeout(500)
    assert pg.evaluate("__S.sheet.blocks.map(b => b.fs)") == ['G16', 'G16']
    assert abs(float(fs(1)[:-2]) - 21.33) < .1

def test_aufgaben_schriftgroesse_word(lw):
    from test_quer_beschriftung import docx
    pg = lw.open(); lw.new_lesson(pg)
    lw.setup(pg, [{'id': 't1', 'type': 'tasks', 'title': '', 'fs': 'G16', 'items': [{'text': 'Lesen Sie den Text.', 'soz': 'ea'}]}]); pg.evaluate("__RP()"); pg.wait_for_timeout(400)
    x = docx(pg, 'tfs.docx'); i = x.index('Lesen Sie den Text.')
    assert '<w:sz w:val="32"/>' in x[max(0, i - 400):i], x[max(0, i - 400):i]
