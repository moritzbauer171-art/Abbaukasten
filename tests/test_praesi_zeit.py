"""Zeit der Stunde in der Präsentation wählen."""

def test_zeit_in_praesentation(lw):
    pg = lw.open(); lw.new_lesson(pg)
    lw.setup(pg, [{'id': 't1', 'type': 'tasks', 'title': '', 'items': [{'text': 'Lesen Sie den Text.', 'soz': 'ea'}]}])
    pg.evaluate("__S.prefs.zeiten = { [__S.sheet.meta.school]: [{ id: 'z1', l: '1./2. Stunde', s: '08:00', e: '09:30' }, { id: 'z2', l: '3./4. Stunde', s: '09:50', e: '11:20' }] }")
    pg.evaluate("__OP(0)"); pg.wait_for_timeout(1000)
    c = pg.locator('.pr .pr-bar .pr-clock'); assert c.is_visible()
    c.click(); pg.wait_for_timeout(300)
    assert pg.locator('.pr .pr-slotm [data-z]').count() == 2
    pg.locator('.pr .pr-slotm [data-z="z2"]').click(); pg.wait_for_timeout(400)
    assert pg.evaluate("[__S.sheet.vp ? 1 : 1, __S.sheet.meta.lesson]")[1] == '90'
    assert pg.locator('.pr .pr-slotm').count() == 0
    c.click(); pg.wait_for_timeout(200)
    pg.fill('.pr .pr-slotm [data-zs]', '12:15'); pg.fill('.pr .pr-slotm [data-zl]', '60'); pg.locator('.pr .pr-slotm [data-zok]').click(); pg.wait_for_timeout(300)
    assert pg.evaluate("__S.sheet.meta.lesson") == '60'
    assert pg.locator('.pr .pr-slotm').count() == 0
