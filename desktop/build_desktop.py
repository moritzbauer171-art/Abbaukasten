"""Baut die AB-Werkstatt als Windows-Desktop-App (Electron, portabel, ohne Installation).

Aufruf (im Ordner desktop/):  python3 build_desktop.py [--linux]
Ergebnis: out/AB-Werkstatt-<Version>-Windows-x64.zip  (mit --linux zusätzlich out/linux/ zum Testen)

Grundlage ist ../index.html. Schriften und Bibliotheken werden lokal gebündelt, damit die App
ohne Internet läuft. Benötigt: Python 3 mit Pillow, git, unzip. Alles Weitere lädt das Skript
beim ersten Lauf nach .cache/ (Electron von GitHub, Schriften aus google/fonts, jsPDF, JSZip,
html2canvas, pefile).
"""
import pathlib, re, shutil, struct, subprocess, sys, urllib.request, zipfile

D = pathlib.Path(__file__).resolve().parent
ROOT = D.parent; SRC = D; DL = D / '.cache'; OUT = D / 'out'
EV = 'v44.10.0'
VERSION = (SRC / 'package.json').read_text().split('"version": "')[1].split('"')[0]

# ---------- 0. Zutaten laden (einmalig) ----------
def get(url, dst):
    if dst.exists(): return
    print('lade', url); tmp = dst.with_suffix(dst.suffix + '.part')
    with urllib.request.urlopen(url) as r, open(tmp, 'wb') as f: shutil.copyfileobj(r, f)
    tmp.replace(dst)
def sparse(repo, dst, paths, tag=None):
    if dst.exists(): return
    cmd = ['git', 'clone', '-q', '--depth', '1', '--filter=blob:none', '--sparse'] + (['--branch', tag] if tag else []) + [repo, str(dst)]
    subprocess.run(cmd, check=True); subprocess.run(['git', '-C', str(dst), 'sparse-checkout', 'set'] + paths, check=True)
DL.mkdir(exist_ok=True)
get(f'https://github.com/electron/electron/releases/download/{EV}/electron-{EV}-win32-x64.zip', DL / f'electron-{EV}-win32-x64.zip')
if '--linux' in sys.argv: get(f'https://github.com/electron/electron/releases/download/{EV}/electron-{EV}-linux-x64.zip', DL / f'electron-{EV}-linux-x64.zip')
get('https://github.com/niklasvh/html2canvas/releases/download/v1.4.1/html2canvas.min.js', DL / 'html2canvas.min.js')
sparse('https://github.com/parallax/jsPDF', DL / 'jspdf', ['dist'], 'v2.5.1')
sparse('https://github.com/Stuk/jszip', DL / 'jszip', ['dist'], 'v3.10.1')
sparse('https://github.com/google/fonts', DL / 'gfonts', ['ofl/atkinsonhyperlegible', 'ofl/literata', 'apache/specialelite', 'ofl/courierprime', 'ofl/playfairdisplay', 'ofl/unifrakturmaguntia', 'ofl/caveat'])
if not (DL / 'pefile-src').exists(): subprocess.run(['git', 'clone', '-q', '--depth', '1', 'https://github.com/erocarrera/pefile', str(DL / 'pefile-src')], check=True)
for f, src in (('jspdf.umd.min.js', DL / 'jspdf' / 'dist' / 'jspdf.umd.min.js'), ('jszip.min.js', DL / 'jszip' / 'dist' / 'jszip.min.js')):
    if not (DL / f).exists(): shutil.copy(src, DL / f)

# ---------- 1. Seite ohne Internet-Abhängigkeiten ----------
app = D / 'app'
if app.exists(): shutil.rmtree(app)
(app / 'lib').mkdir(parents=True); (app / 'fonts').mkdir()
shutil.copy(ROOT / 'index.html', app / 'index.html')
h = (app / 'index.html').read_text()
def must(old, new):
    global h
    if old not in h: sys.exit('nicht gefunden: ' + old[:80])
    h = h.replace(old, new)
h = re.sub(r'<link rel="preconnect" href="https://fonts\.(googleapis|gstatic)\.com"[^>]*>\n', '', h)
h, n = re.subn(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/css2[^"]*">', '<link rel="stylesheet" href="fonts/fonts.css">', h)
assert n == 1, 'Font-Link fehlt'
must("'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'", "'lib/html2canvas.min.js'")
must("'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'", "'lib/jspdf.umd.min.js'")
must("'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'", "'lib/jszip.min.js'")
h = h.replace('in diesem Browser', 'auf diesem Computer').replace('im Browser', 'auf diesem Computer')
leftover = re.findall(r'https://(?:fonts\.|cdnjs\.)[^\s"\')]+', h)
assert not leftover, leftover
(app / 'index.html').write_text(h)
for f in ('html2canvas.min.js', 'jspdf.umd.min.js', 'jszip.min.js'): shutil.copy(DL / f, app / 'lib' / f)

G = DL / 'gfonts' / 'ofl'; GA = DL / 'gfonts' / 'apache'
FONTS = [  # (Familie, Datei, Zieldatei, Gewicht, Stil)
    ('Atkinson Hyperlegible', 'atkinsonhyperlegible/AtkinsonHyperlegible-Regular.ttf', None, '400', 'normal'),
    ('Atkinson Hyperlegible', 'atkinsonhyperlegible/AtkinsonHyperlegible-Bold.ttf', None, '700', 'normal'),
    ('Atkinson Hyperlegible', 'atkinsonhyperlegible/AtkinsonHyperlegible-Italic.ttf', None, '400', 'italic'),
    ('Atkinson Hyperlegible', 'atkinsonhyperlegible/AtkinsonHyperlegible-BoldItalic.ttf', None, '700', 'italic'),
    ('Literata', 'literata/Literata[opsz,wght].ttf', 'Literata-VF.ttf', '200 900', 'normal'),
    ('Literata', 'literata/Literata-Italic[opsz,wght].ttf', 'Literata-Italic-VF.ttf', '200 900', 'italic'),
    ('Courier Prime', 'courierprime/CourierPrime-Regular.ttf', None, '400', 'normal'),
    ('Courier Prime', 'courierprime/CourierPrime-Bold.ttf', None, '700', 'normal'),
    ('Courier Prime', 'courierprime/CourierPrime-Italic.ttf', None, '400', 'italic'),
    ('Courier Prime', 'courierprime/CourierPrime-BoldItalic.ttf', None, '700', 'italic'),
    ('Playfair Display', 'playfairdisplay/PlayfairDisplay[wght].ttf', 'PlayfairDisplay-VF.ttf', '400 900', 'normal'),
    ('Playfair Display', 'playfairdisplay/PlayfairDisplay-Italic[wght].ttf', 'PlayfairDisplay-Italic-VF.ttf', '400 900', 'italic'),
    ('UnifrakturMaguntia', 'unifrakturmaguntia/UnifrakturMaguntia-Book.ttf', None, '400', 'normal'),
    ('Caveat', 'caveat/Caveat[wght].ttf', 'Caveat-VF.ttf', '400 700', 'normal'),
]
css = ['/* Schriften lokal (SIL Open Font License bzw. Apache 2.0, siehe Lizenzdateien) */']
for fam, src, dst, w, sty in FONTS:
    dst = dst or pathlib.Path(src).name
    shutil.copy(G / src, app / 'fonts' / dst)
    css.append(f'@font-face{{font-family:"{fam}";src:url("{dst}") format("truetype");font-weight:{w};font-style:{sty};font-display:swap}}')
for d in {pathlib.Path(s).parent.name for _, s, *_ in FONTS}:
    shutil.copy(G / d / 'OFL.txt', app / 'fonts' / f'OFL-{d}.txt')
shutil.copy(GA / 'specialelite' / 'SpecialElite-Regular.ttf', app / 'fonts' / 'SpecialElite-Regular.ttf')
shutil.copy(GA / 'specialelite' / 'LICENSE.txt', app / 'fonts' / 'LICENSE-specialelite-Apache-2.0.txt')
css.append('@font-face{font-family:"Special Elite";src:url("SpecialElite-Regular.ttf") format("truetype");font-weight:400;font-style:normal;font-display:swap}')
(app / 'fonts' / 'fonts.css').write_text('\n'.join(css) + '\n')

# ---------- 2. Programmdateien zusammenstellen ----------
def assemble(platform, zipname, exe_from, exe_to):
    tgt = OUT / platform / 'AB-Werkstatt'
    if tgt.parent.exists(): shutil.rmtree(tgt.parent)
    tgt.mkdir(parents=True)
    subprocess.run(['unzip', '-q', '-o', str(DL / zipname), '-d', str(tgt)], check=True)
    (tgt / exe_from).rename(tgt / exe_to)
    if platform == 'linux': (tgt / exe_to).chmod(0o755)
    da = tgt / 'resources' / 'default_app.asar'
    if da.exists(): da.unlink()
    keep = {'de.pak', 'en-US.pak'}
    for f in (tgt / 'locales').iterdir():
        if f.name not in keep and f.suffix == '.pak': f.unlink()
    dst = tgt / 'resources' / 'app'
    dst.mkdir()
    for f in ('main.js', 'preload.js', 'package.json'): shutil.copy(SRC / f, dst / f)
    shutil.copytree(app, dst / 'app')
    (dst / 'build').mkdir()
    for f in ('icon.ico', 'icon-256.png'): shutil.copy(SRC / 'build' / f, dst / 'build' / f)
    return tgt

# ---------- 3. Icon und Programmname in die .exe ----------
def pad4(b): return b + b'\0' * ((4 - len(b) % 4) % 4)
def vnode(key, value=b'', wtype=1, children=(), vlen=None):
    data = struct.pack('<HHH', 0, len(value) // 2 if (vlen is None and wtype == 1) else (vlen if vlen is not None else len(value)), wtype) + (key + '\0').encode('utf-16le')
    if value: data = pad4(data) + value
    for c in children: data = pad4(data) + c
    data = bytearray(data); struct.pack_into('<H', data, 0, len(data)); return bytes(data)

def version_resource(ver):
    a, b, c = (int(x) for x in ver.split('.'))
    ms, ls = (a << 16) | b, (c << 16)
    ffi = struct.pack('<13I', 0xFEEF04BD, 0x00010000, ms, ls, ms, ls, 0x3F, 0, 0x40004, 1, 0, 0, 0)
    strs = [('CompanyName', 'AB-Werkstatt'), ('FileDescription', 'AB-Werkstatt'), ('FileVersion', ver), ('InternalName', 'AB-Werkstatt'),
            ('OriginalFilename', 'AB-Werkstatt.exe'), ('ProductName', 'AB-Werkstatt'), ('ProductVersion', ver)]
    table = vnode('040904B0', children=[vnode(k, (v + '\0').encode('utf-16le')) for k, v in strs])
    sfi = vnode('StringFileInfo', children=[table])
    vfi = vnode('VarFileInfo', children=[vnode('Translation', struct.pack('<HH', 0x0409, 0x04B0), wtype=0)])
    return vnode('VS_VERSION_INFO', ffi, wtype=0, children=[sfi, vfi])

def dib(im):
    w, hgt = im.size; px = im.load()
    hdr = struct.pack('<IiiHHIIiiII', 40, w, hgt * 2, 1, 32, 0, w * hgt * 4, 0, 0, 0, 0)
    xor = bytearray()
    for y in range(hgt - 1, -1, -1):
        for x in range(w):
            r, g, b_, a = px[x, y]; xor += bytes((b_, g, r, a))
    row = ((w + 31) // 32) * 4
    return hdr + bytes(xor) + b'\0' * (row * hgt)

def patch_exe(exe):
    sys.path.insert(0, str(DL / 'pefile-src'))
    import pefile
    from PIL import Image
    import io
    pe = pefile.PE(str(exe))
    data = bytearray(pe.__data__)
    big = Image.open(SRC / 'build' / 'icon-1024.png').convert('RGBA')
    icons, groups, version = {}, [], None
    for t in pe.DIRECTORY_ENTRY_RESOURCE.entries:
        for e in t.directory.entries:
            for l in e.directory.entries:
                if t.struct.Id == 3: icons[e.struct.Id] = l.data
                elif t.struct.Id == 14: groups.append(l.data)
                elif t.struct.Id == 16: version = l.data
    for g in groups:
        off = pe.get_offset_from_rva(g.struct.OffsetToData); n = struct.unpack_from('<H', data, off + 4)[0]
        for i in range(n):
            eo = off + 6 + 14 * i
            w, hh, cc, rs, pl, bc, sz, nid = struct.unpack_from('<BBBBHHIH', data, eo)
            px = w or 256
            im = big.resize((px, px), Image.LANCZOS)
            if px >= 256: buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True); blob = buf.getvalue()
            else: blob = dib(im)
            ent = icons[nid]
            if len(blob) > ent.struct.Size: sys.exit(f'Icon {px}px zu groß: {len(blob)} > {ent.struct.Size}')
            ioff = pe.get_offset_from_rva(ent.struct.OffsetToData)
            data[ioff:ioff + ent.struct.Size] = blob + b'\0' * (ent.struct.Size - len(blob))
            struct.pack_into('<I', data, ent.struct.get_file_offset() + 4, len(blob))
            struct.pack_into('<BBBBHHIH', data, eo, w, hh, 0, 0, 1, 32, len(blob), nid)
    vr = version_resource(VERSION)
    if len(vr) > version.struct.Size: sys.exit(f'Versionsinfo zu groß: {len(vr)} > {version.struct.Size}')
    voff = pe.get_offset_from_rva(version.struct.OffsetToData)
    data[voff:voff + version.struct.Size] = vr + b'\0' * (version.struct.Size - len(vr))
    struct.pack_into('<I', data, version.struct.get_file_offset() + 4, len(vr))
    pe.close()
    exe.write_bytes(bytes(data))
    pe = pefile.PE(str(exe)); pe.OPTIONAL_HEADER.CheckSum = pe.generate_checksum(); pe.write(str(exe) + '.tmp'); pe.close()
    pathlib.Path(str(exe) + '.tmp').replace(exe)

def zipdir(folder, zpath):
    with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for f in sorted(folder.rglob('*')):
            z.write(f, f.relative_to(folder.parent))

win = assemble('win', f'electron-{EV}-win32-x64.zip', 'electron.exe', 'AB-Werkstatt.exe')
patch_exe(win / 'AB-Werkstatt.exe')
(win / 'LIESMICH.txt').write_text(
    'AB-Werkstatt für Windows\r\n========================\r\n\r\n'
    'Starten: Doppelklick auf AB-Werkstatt.exe. Eine Installation ist nicht nötig.\r\n'
    'Den ganzen Ordner zusammenlassen, die .exe allein läuft nicht.\r\n\r\n'
    'Beim ersten Start fragt die App, ob sie Verknüpfungen auf dem Desktop und im Startmenü anlegen soll.\r\n\r\n'
    'Falls Windows "Der Computer wurde durch Windows geschützt" meldet: auf "Weitere Informationen"\r\n'
    'und dann "Trotzdem ausführen" klicken. Die Meldung kommt, weil die App nicht kostenpflichtig signiert ist.\r\n\r\n'
    'Ihre Blätter liegen in %APPDATA%\\AB-Werkstatt (Hilfe > Datenordner öffnen).\r\n'
    'Eine neue Version einfach über den alten Ordner entpacken oder daneben legen; die Blätter bleiben erhalten.\r\n', encoding='utf-8')
zp = OUT / f'AB-Werkstatt-{VERSION}-Windows-x64.zip'
zipdir(win, zp)
print('Windows:', zp, round(zp.stat().st_size / 1e6, 1), 'MB')
if '--linux' in sys.argv:
    lin = assemble('linux', f'electron-{EV}-linux-x64.zip', 'electron', 'ab-werkstatt')
    print('Linux (Test):', lin)
