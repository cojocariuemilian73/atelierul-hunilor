# Recodează în WebP toate imaginile JPEG încorporate (data:image/jpeg;base64) dintr-o pagină,
# doar când rezultatul e mai mic. Folosire: python to-webp.py fisier.html [calitate]
import base64, io, re, sys
from PIL import Image
path = sys.argv[1]; q = int(sys.argv[2]) if len(sys.argv) > 2 else 80
s = open(path, encoding='utf-8', newline='').read()
before = len(s); cache = {}; stats = [0, 0]
def conv(m):
    b64 = m.group(1)
    if b64 in cache: return cache[b64]
    raw = base64.b64decode(b64)
    im = Image.open(io.BytesIO(raw)); im.load()
    if im.mode not in ('RGB', 'RGBA'): im = im.convert('RGB')
    out = io.BytesIO(); im.save(out, 'WEBP', quality=q, method=6)
    w = out.getvalue()
    if len(w) < len(raw) * 0.97:
        res = 'data:image/webp;base64,' + base64.b64encode(w).decode(); stats[0] += 1
    else:
        res = m.group(0); stats[1] += 1
    cache[b64] = res
    return res
s = re.sub(r'data:image/jpeg;base64,([A-Za-z0-9+/=]+)', conv, s)
open(path, 'w', encoding='utf-8', newline='').write(s)
print(f'{path}: {stats[0]} recodate, {stats[1]} lasate; {before/1048576:.2f} MB -> {len(s)/1048576:.2f} MB')
