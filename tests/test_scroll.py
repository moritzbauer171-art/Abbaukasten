"""Die Vorschau bleibt beim Neuaufbau an ihrer Stelle."""

def test_vorschau_springt_nicht(lw):
    pg = lw.open(); lw.new_lesson(pg)
    B = [{'id': f't{i}', 'type': 'tasks', 'title': '', 'items': [{'text': f'Aufgabe {i}', 'soz': 'ea'}]} for i in range(3)] + [{'id': f'l{i}', 'type': 'lines', 'count': 14, 'style': 'lines'} for i in range(8)]
    lw.setup(pg, B); pg.evaluate("__RP()"); pg.wait_for_timeout(700)
    assert pg.locator('#pages .page').count() >= 3
    pg.evaluate("document.querySelector('#preview-scroll').scrollTop = 1400"); pg.wait_for_timeout(200)
    top = pg.evaluate("document.querySelector('#preview-scroll').scrollTop")
    assert top > 1000
    for _ in range(3):
        pg.evaluate("__S.sheet.blocks[0].items[0].text += ' x'; __RP()"); pg.wait_for_timeout(300)
        assert abs(pg.evaluate("document.querySelector('#preview-scroll').scrollTop") - top) < 3
