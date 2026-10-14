#!/usr/bin/env python3
"""
Finalise les médias du film après build-film.py :
  - renomme chaque paquet avec l'empreinte de son contenu (<clip>-<v>.<hash>.bin) : un clip régénéré
    change d'adresse, aucun navigateur ne peut ressortir l'ancien depuis son cache ;
  - fabrique pour chaque clip une planche de 3 images fixes légères (début, milieu, fin) affichées
    tant que le paquet n'est pas téléchargé : jamais d'écran noir ni d'image d'un autre plan ;
  - versionne l'affiche (paramètre ?v=) dans index.html et dans src/film/posters.ts.

usage : finalize-media.py <dossier des mp4> <dossier film> <focal.json> <index.html> <posters.ts>
"""
import hashlib, json, os, re, subprocess, sys, tempfile
from PIL import Image

STILLS = [0.0, 0.5, 1.0]
SD, SM = (960, 540), (342, 608)


def focal_at(keys, t):
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, x0), (t1, x1) in zip(keys, keys[1:]):
        if t <= t1:
            k = (t - t0) / (t1 - t0)
            k = k * k * (3 - 2 * k)
            return x0 + (x1 - x0) * k
    return keys[-1][1]


def h8(path):
    return hashlib.sha1(open(path, 'rb').read()).hexdigest()[:8]


def main():
    src, out, focal_p, index_p, posters_p = sys.argv[1:6]
    focal = json.load(open(focal_p))
    man = json.load(open(f'{out}/manifest.json'))
    keep = {'manifest.json'}
    for cid, e in man['clips'].items():
        e.setdefault('files', {})
        e.setdefault('stills', {})
        for v in ('d', 'm'):
            cur = e['files'].get(v) or f'{cid}-{v}.bin'
            p = f'{out}/{cur}'
            if not os.path.exists(p):
                p = f'{out}/{cid}-{v}.bin'
            if not os.path.exists(p):
                # renommé lors d'un passage interrompu
                cands = [f for f in os.listdir(out) if re.fullmatch(rf'{re.escape(cid)}-{v}\.[0-9a-f]{{8}}\.bin', f)]
                p = f'{out}/{cands[0]}'
            name = f'{cid}-{v}.{h8(p)}.bin'
            if os.path.basename(p) != name:
                os.replace(p, f'{out}/{name}')
            e['files'][v] = name
            keep.add(name)
        # images fixes : extraites du mp4 aux mêmes instants que les images du paquet
        # (déjà faites et présentes : on les garde, sauf si ONLY nomme ce clip)
        only = [c for c in os.environ.get('ONLY', '').split(',') if c]
        if cid not in only and all(os.path.exists(f'{out}/{e["stills"].get(v, "-")}') for v in 'dm'):
            keep.update(e['stills'].values())
            continue
        n = e['n']
        keys = focal.get(cid, [[0, 0.5], [1, 0.5]])
        with tempfile.TemporaryDirectory() as tmp:
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'{src}/{cid}.mp4', '-vf', 'fps=15', f'{tmp}/%04d.png'], check=True)
            frames = sorted(os.listdir(tmp))
            for v, (w, h) in (('d', SD), ('m', SM)):
                sheet = Image.new('RGB', (w, h * len(STILLS)))
                for k, t in enumerate(STILLS):
                    i = round(t * (len(frames) - 1))
                    im = Image.open(f'{tmp}/{frames[i]}').convert('RGB')
                    W, H = im.size
                    if v == 'm':
                        cw = round(H * 9 / 16)
                        fx = focal_at(keys, i / max(1, len(frames) - 1))
                        x0 = round(min(max(fx * W - cw / 2, 0), W - cw))
                        im = im.crop((x0, 0, x0 + cw, H))
                    sheet.paste(im.resize((w, h), Image.LANCZOS), (0, k * h))
                tmpw = f'{tmp}/s.webp'
                sheet.save(tmpw, 'WEBP', quality=58, method=5)
                name = f'{cid}-{v}.{h8(tmpw)}.s.webp'
                os.replace(tmpw, f'{out}/{name}')
                e['stills'][v] = name
                keep.add(name)
        e['stillsAt'] = STILLS
    # anciens fichiers
    for f in os.listdir(out):
        if f not in keep and not f.startswith('poster-'):
            os.remove(f'{out}/{f}')
    json.dump(man, open(f'{out}/manifest.json', 'w'))
    # affiche versionnée
    pv = h8(f'{out}/poster-d.webp') + h8(f'{out}/poster-m.webp')[:4]
    s = open(index_p).read()
    s = re.sub(r'poster-(d|m)\.webp(\?v=\w+)?', lambda m: f'poster-{m.group(1)}.webp?v={pv}', s)
    open(index_p, 'w').write(s)
    open(posters_p, 'w').write(f"/** Généré par tools/finalize-media.py : version de l'affiche (contournement du cache). */\nexport const POSTER_V = '{pv}'\n")
    tot = sum(os.path.getsize(f'{out}/{e["stills"][v]}') for e in man['clips'].values() for v in 'd')
    print('ok', len(man['clips']), 'clips ; images fixes bureau', round(tot / 1e3), 'Ko')


if __name__ == '__main__':
    main()
