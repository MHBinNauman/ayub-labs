"""
Build src/app/favicon.ico (16, 32 and 48 px) from the emblem PNG.

Next.js generates icon.png / apple-icon.png at build time (src/app/icon.tsx,
apple-icon.tsx) but cannot generate a .ico, so this file is made once and
committed. Re-run it whenever the emblem changes (e.g. a vector logo arrives):

    python scripts/generate-favicon.py

Needs Pillow (pip install pillow).
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "public" / "brand" / "logo-emblem-192.png"
TARGET = ROOT / "src" / "app" / "favicon.ico"
SIZES = [(16, 16), (32, 32), (48, 48)]

emblem = Image.open(SOURCE).convert("RGBA")
emblem.save(TARGET, format="ICO", sizes=SIZES)
print(f"Wrote {TARGET.relative_to(ROOT)} ({', '.join(f'{w}px' for w, _ in SIZES)})")
