"""ONY Panel simgeleri: Nova işareti (altıgen içinde hologram çekirdeği), koyu lacivert zeminde varsayılan tema mavisiyle.

Çalıştırma: python make-icons.py  (Pillow gerekir; çıktılar bu klasöre yazılır)
"""
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

HERE = Path(__file__).parent
SS = 4  # kenarlar temiz olsun diye büyük çizip küçültülür


def oklch(l, c, h):
    """oklch → sRGB (0-255). Varsayılan tema: oklch(0.8 0.14 245), admin.css'teki --accent."""
    a, b = c * math.cos(math.radians(h)), c * math.sin(math.radians(h))
    l_, m_, s_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3, (l - 0.1055613458 * a - 0.0638541728 * b) ** 3, (l - 0.0894841775 * a - 1.2914855480 * b) ** 3
    lin = (4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
           -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
           -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_)
    srgb = [12.92 * v if v <= 0.0031308 else 1.055 * v ** (1 / 2.4) - 0.055 for v in lin]
    return tuple(round(min(1, max(0, v)) * 255) for v in srgb)


ACCENT = oklch(0.8, 0.14, 245)
CORE = oklch(0.97, 0.03, 245)
NAVY_IN, NAVY_OUT = oklch(0.24, 0.06, 255), oklch(0.12, 0.03, 255)


def hexagon(cx, cy, r):
    return [(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))) for a in range(-90, 270, 60)]


def radial(size, inner, outer, radius):
    """Ortası açık, kenarı koyu yuvarlak geçiş."""
    img = Image.new("RGB", (size, size), outer)
    px = img.load()
    c = size / 2
    for y in range(size):
        for x in range(size):
            t = min(1, math.hypot(x - c, y - c) / radius)
            px[x, y] = tuple(round(i + (o - i) * t) for i, o in zip(inner, outer))
    return img


def mark(draw, c, R, color, core, dots=True):
    """Altıgen çerçeve, halka yayları ve çekirdek."""
    w = max(2, R * 0.085)
    pts = hexagon(c, c, R)
    draw.line(pts + pts[:2], fill=color, width=round(w), joint="curve")
    box = lambda r: (c - r, c - r, c + r, c + r)
    if dots:  # en dışta noktalı halka
        for k in range(36):
            a = math.radians(k * 10)
            r0, d = R * 0.78, R * 0.018
            draw.ellipse((c + r0 * math.cos(a) - d, c + r0 * math.sin(a) - d, c + r0 * math.cos(a) + d, c + r0 * math.sin(a) + d), fill=color)
    for k in range(3):  # üç kalın yay
        start = -80 + k * 120
        draw.arc(box(R * 0.63), start, start + 82, fill=color, width=round(R * 0.09))
    for k in range(2):  # iki ince yay, ters yönde
        start = 30 + k * 180
        draw.arc(box(R * 0.45), start, start + 120, fill=color, width=round(R * 0.05))
    draw.ellipse(box(R * 0.17), fill=core)


def render(size, *, full_bleed, scale):
    S = size * SS
    c = S / 2
    R = S * scale
    bg = radial(S // 8, NAVY_IN, NAVY_OUT, S // 8 * 0.62).resize((S, S), Image.BICUBIC)
    img = bg.convert("RGBA")

    # Parıltı: işaretin bulanık kopyası alta, çekirdeğin hâlesi daha geniş
    glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    mark(gd, c, R, ACCENT + (200,), ACCENT + (255,), dots=False)
    gd.ellipse((c - R * 0.36, c - R * 0.36, c + R * 0.36, c + R * 0.36), fill=ACCENT + (150,))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(S * 0.022)))

    # Altıgenin içi biraz daha açık
    inner = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(inner).polygon(hexagon(c, c, R * 0.97), fill=NAVY_IN + (110,))
    img.alpha_composite(inner)

    crisp = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    mark(ImageDraw.Draw(crisp), c, R, ACCENT + (255,), CORE + (255,), dots=size >= 96)
    img.alpha_composite(crisp)

    if not full_bleed:  # "any" simgeleri yuvarlatılmış kare
        mask = Image.new("L", (S, S), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, S - 1, S - 1), radius=S * 0.22, fill=255)
        img.putalpha(mask)
    return img.resize((size, size), Image.LANCZOS)


def badge(size):
    """Android bildirim rozeti: saydam zeminde yalnızca beyaz siluet."""
    S = size * SS
    c = S / 2
    R = S * 0.44
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    white = (255, 255, 255, 255)
    pts = hexagon(c, c, R)
    d.line(pts + pts[:2], fill=white, width=round(R * 0.13), joint="curve")
    box = lambda r: (c - r, c - r, c + r, c + r)
    for k in range(3):
        start = -80 + k * 120
        d.arc(box(R * 0.58), start, start + 82, fill=white, width=round(R * 0.13))
    d.ellipse(box(R * 0.2), fill=white)
    return img.resize((size, size), Image.LANCZOS)


if __name__ == "__main__":
    render(192, full_bleed=False, scale=0.40).save(HERE / "icon-192.png")
    render(512, full_bleed=False, scale=0.40).save(HERE / "icon-512.png")
    render(512, full_bleed=True, scale=0.33).save(HERE / "icon-maskable-512.png")  # önemli kısım ortadaki %80'lik güvenli alanda
    render(64, full_bleed=False, scale=0.42).save(HERE / "favicon-64.png")
    badge(96).save(HERE / "badge-96.png")
    print("ok", ACCENT)
