#!/usr/bin/env python3
"""
Logo ICRH — Institut Changeons de Regard sur le Handicap.

Idée : le C de « Changeons » devient un œil. Un C ouvert dont l'ouverture est inclinée (un regard qui
change d'angle), la pupille à l'intérieur tournée vers « RH ». Lettres I, R, H : Manrope 800 vectorisée,
le nom complet en Manrope 600 ; tout est converti en tracés (aucune police requise pour les fichiers).

Produit :
  app/public/brand/*.svg                 fichiers du logo (couleur, blanc, icône)
  app/src/components/logoPaths.ts        tracés utilisés par le composant <Logo>
usage : python3 tools/build-logo.py
"""
import io, math, os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WOFF = f'{ROOT}/app/node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2'
OUT = f'{ROOT}/app/public/brand'
TS = f'{ROOT}/app/src/components/logoPaths.ts'
BLUE = '#102b42'


def font(w):
    f = TTFont(WOFF)
    f.flavor = None
    return instantiateVariableFont(f, {'wght': w})


def glyph_path(f, ch, x0, y_base, scale=1.0):
    """tracé SVG d'un caractère (y vers le bas), renvoie (d, avance)"""
    gs = f.getGlyphSet()
    name = f.getBestCmap()[ord(ch)]
    pen = SVGPathPen(gs)
    gs[name].draw(pen)
    d = pen.getCommands()
    adv = f['hmtx'][name][0]
    return d, adv


def text_paths(f, text, tracking=0):
    """tracés d'un texte, en unités de police, ligne de base y=0 (y vers le haut) ; renvoie liste (d, x) et largeur"""
    gs = f.getGlyphSet()
    cmap = f.getBestCmap()
    x = 0
    out = []
    out_idx = []
    for ch in text:
        name = cmap[ord(ch)]
        if ch != ' ':
            pen = SVGPathPen(gs)
            gs[name].draw(pen)
            out.append((pen.getCommands(), x, len(out_idx)))
        out_idx.append(ch)
        x += f['hmtx'][name][0] + tracking
    return out, x - tracking


def g(paths, sx, sy, tx, ty, accent=None, ini=()):
    """groupe de tracés en coordonnées SVG ; les caractères d'indice dans ini prennent la couleur accent"""
    return ''.join(f'<path transform="translate({tx + x * sx:.2f} {ty:.2f}) scale({sx:.5f} {-sy:.5f})" d="{d}"'
                   + (f' fill="{accent}"' if accent and i in ini else '') + '/>' for d, x, i in paths)


# iris : dégradé bleu-vert cerclé plus foncé, pupille, reflet
ACCENT = {'#102b42': '#1f7a74', '#ffffff': '#6fd3c7', 'currentColor': 'var(--logo-accent, #1f7a74)'}
DEFS = ('<defs><radialGradient id="icrh-iris" cx="0.42" cy="0.4" r="0.62">'
        '<stop offset="0" stop-color="#9be3d3"/><stop offset="0.35" stop-color="#3fb3a4"/>'
        '<stop offset="0.72" stop-color="#1d7f8c"/><stop offset="1" stop-color="#0c3a52"/></radialGradient></defs>')
# initiales dans le nom : I(nstitut) C(hangeons) R(egard) / H(andicap)
INI1, INI2 = (0, 9, 22), (7,)


def main():
    os.makedirs(OUT, exist_ok=True)
    f8 = font(800)
    f6 = font(600)
    cap = f8['OS/2'].sCapHeight  # ≈ 720 unités
    cmap = f8.getBestCmap()
    gs = f8.getGlyphSet()
    bp = BoundsPen(gs)
    gs[cmap[ord('I')]].draw(bp)
    stem = bp.bounds[2] - bp.bounds[0]

    # --- le C-œil, en unités de police, centré sur la hauteur de capitale ---
    over = cap * 0.03          # dépassement optique des formes rondes
    R_out = cap / 2 + over
    sw = stem * 0.96
    r = R_out - sw / 2
    tilt, gap = 12, 80         # ouverture inclinée de 12°, large de 80°
    pr = r * 0.40              # pupille
    pdx = r * 0.24             # pupille décalée vers l'ouverture

    def eye(cx, cy, s=1.0, color='currentColor'):
        # cx, cy : centre en coordonnées SVG (y vers le bas)
        a0, a1 = math.radians(tilt + gap / 2), math.radians(tilt - gap / 2 + 360)
        x0, y0 = cx + r * s * math.cos(a0), cy - r * s * math.sin(a0)
        x1, y1 = cx + r * s * math.cos(a1), cy - r * s * math.sin(a1)
        px, py = cx + pdx * s * math.cos(math.radians(tilt)), cy - pdx * s * math.sin(math.radians(tilt))
        q = pr * s
        # la pupille regarde dans la direction de l'ouverture ; le reflet reste en haut à gauche
        lx, ly = 0.16 * q * math.cos(math.radians(tilt)), -0.16 * q * math.sin(math.radians(tilt))
        return (f'<path d="M{x0:.2f} {y0:.2f} A{r*s:.2f} {r*s:.2f} 0 1 0 {x1:.2f} {y1:.2f}" fill="none" stroke="{color}" '
                f'stroke-width="{sw*s:.2f}" stroke-linecap="round"/>'
                f'<g class="logo-iris"><circle cx="{px:.2f}" cy="{py:.2f}" r="{q:.2f}" fill="url(#icrh-iris)"/>'
                f'<circle cx="{px+lx:.2f}" cy="{py+ly:.2f}" r="{q*0.42:.2f}" fill="#0a1a28"/>'
                f'<circle cx="{px-q*0.34:.2f}" cy="{py-q*0.38:.2f}" r="{q*0.17:.2f}" fill="#ffffff"/></g>')

    # --- mot-symbole I C R H ---
    track = cap * 0.075
    gI = f8['hmtx'][cmap[ord('I')]][0]
    xI = 0
    xC = gI + track * 1.25                      # centre gauche du C
    cC = xC + R_out
    xR = cC + R_out + track * 1.2
    rh, wRH = text_paths(f8, 'RH', track)
    word_w = xR + wRH
    # coordonnées SVG : ligne de base à y = cap (le haut des capitales à y = 0)
    def word(tx=0.0, ty=0.0, s=1.0, color='currentColor'):
        I, _ = text_paths(f8, 'I')
        return (f'<g fill="{color}">' + g(I, s, s, tx + xI * s, ty + cap * s) + g(rh, s, s, tx + xR * s, ty + cap * s) + '</g>'
                + eye(tx + cC * s, ty + cap / 2 * s, s, color))

    # --- nom complet, deux lignes ---
    name1, w1 = text_paths(f6, 'Institut Changeons de Regard', 8)
    name2, w2 = text_paths(f6, 'sur le Handicap', 8)
    ns = 0.25                                    # taille relative du nom (≈ 30 % des capitales)

    def files():
        pad = cap * 0.12
        res = {}
        for suffix, col in (('', BLUE), ('-blanc', '#ffffff')):
            # icône seule
            S = 2 * R_out + 2 * pad
            res[f'icrh-icone{suffix}.svg'] = (S, S, eye(S / 2, S / 2, 1, col))
            # compact
            W, H = word_w + 2 * pad, cap + 2 * pad
            res[f'icrh-compact{suffix}.svg'] = (W, H, word(pad, pad, 1, col))
            # déployé : mot-symbole + nom complet sur deux lignes, à droite d'un filet
            lh = cap * ns * 1.45
            gapx = cap * 0.34
            nx = pad + word_w + gapx * 2
            nw = max(w1, w2) * ns
            W = nx + nw + pad
            H = cap + 2 * pad
            ny = pad + cap / 2 - lh / 2 + cap * ns * 0.36
            body = word(pad, pad, 1, col)
            body += f'<rect x="{pad + word_w + gapx - cap*0.012:.2f}" y="{pad:.2f}" width="{cap*0.024:.2f}" height="{cap:.2f}" fill="{col}" opacity="0.35"/>'
            body += f'<g fill="{col}">' + g(name1, ns, ns, nx, ny, ACCENT[col], INI1) + g(name2, ns, ns, nx, ny + lh, ACCENT[col], INI2) + '</g>'
            res[f'icrh-deploye{suffix}.svg'] = (W, H, body)
            # déployé vertical (pour le carré, la signature de fin)
            nsv = 0.25
            W = max(word_w, w1 * nsv) + 2 * pad
            body = word((W - word_w) / 2, pad, 1, col)
            y1 = pad + cap + cap * 0.62
            body += f'<g fill="{col}">' + g(name1, nsv, nsv, (W - w1 * nsv) / 2, y1, ACCENT[col], INI1) + g(name2, nsv, nsv, (W - w2 * nsv) / 2, y1 + cap * nsv * 1.45, ACCENT[col], INI2) + '</g>'
            H = y1 + cap * nsv * 1.45 + pad
            res[f'icrh-vertical{suffix}.svg'] = (W, H, body)
        # favicon : icône blanche sur carré bleu arrondi
        S = 2 * R_out + 2 * pad * 2.2
        res['favicon.svg'] = (S, S, f'<rect width="{S:.2f}" height="{S:.2f}" rx="{S*0.22:.2f}" fill="#163c5b"/>' + eye(S / 2, S / 2, 1, '#ffffff'))
        for n, (W, H, body) in res.items():
            open(f'{OUT}/{n}', 'w').write(
                f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.2f} {H:.2f}" width="{W/cap*48:.0f}" height="{H/cap*48:.0f}" role="img" aria-label="ICRH — Institut Changeons de Regard sur le Handicap">{DEFS}{body}</svg>\n')
        return res

    files()

    # --- tracés pour le composant React (viewBox en unités de police) ---
    I, _ = text_paths(f8, 'I')
    def flat(paths, tx):
        return [{'d': d, 'x': round(tx + x, 2)} for d, x, _ in paths]
    import json
    data = {
        'cap': cap, 'wordW': round(word_w, 2), 'eye': eye(cC, cap / 2), 'eyeAlone': eye(R_out, R_out), 'eyeSize': round(2 * R_out, 2),
        'letters': flat(I, xI) + flat(rh, xR),
        'defs': DEFS,
        # déplacement de l'iris vers le centre (le regard se tourne vers le visiteur)
        'irisBack': [round(-pdx * math.cos(math.radians(tilt)), 2), round(pdx * math.sin(math.radians(tilt)), 2)],
    }
    open(TS, 'w').write('/** Généré par tools/build-logo.py — ne pas modifier à la main. */\nexport const LOGO = ' + json.dumps(data, ensure_ascii=False) + ' as const\n')
    print('ok', OUT, 'cap', cap, 'stem', stem)


if __name__ == '__main__':
    main()
