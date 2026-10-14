#!/usr/bin/env python3
"""
Convertit les clips Runway (MP4) en paquets d'images pour le site.

Pour chaque clip :
  - variante « d » (bureau, paysage) : 1440 px de large, 15 images/s, WebP ;
  - variante « m » (téléphone, portrait) : recadrage vertical 9:16 qui suit le sujet
    (points focaux du storyboard, interpolés image par image), 608 × 1080, WebP.
Les images d'une variante sont concaténées dans un seul fichier <clip>-<variante>.bin ;
manifest.json donne les bornes de chaque image.

usage : build-film.py <dossier des mp4> <dossier de sortie> [focal.json]
"""
import json
import os
import subprocess
import sys
import tempfile

from PIL import Image

FPS = 15
DW = 1440
MW, MH = 608, 1080
QUALITY = 64


def focal_at(keys, t):
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, x0), (t1, x1) in zip(keys, keys[1:]):
        if t <= t1:
            k = (t - t0) / (t1 - t0)
            k = k * k * (3 - 2 * k)  # lissage
            return x0 + (x1 - x0) * k
    return keys[-1][1]


def main():
    src, out = sys.argv[1], sys.argv[2]
    focal = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else {}
    os.makedirs(out, exist_ok=True)
    manifest = {"fps": FPS, "variants": {"d": {"w": DW, "h": 0}, "m": {"w": MW, "h": MH}}, "clips": {}}
    clips = sorted(f[:-4] for f in os.listdir(src) if f.endswith('.mp4') and f.startswith('c'))
    for cid in clips:
        with tempfile.TemporaryDirectory() as tmp:
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'{src}/{cid}.mp4', '-vf', f'fps={FPS}', f'{tmp}/%04d.png'], check=True)
            frames = sorted(os.listdir(tmp))
            n = len(frames)
            keys = focal.get(cid, [[0, 0.5], [1, 0.5]])
            entry = {"n": n, "d": [0], "m": [0]}
            with open(f'{out}/{cid}-d.bin', 'wb') as fd, open(f'{out}/{cid}-m.bin', 'wb') as fm:
                for i, name in enumerate(frames):
                    im = Image.open(f'{tmp}/{name}').convert('RGB')
                    W, H = im.size
                    # bureau
                    dh = round(H * DW / W)
                    manifest['variants']['d']['h'] = dh
                    d = im.resize((DW, dh), Image.LANCZOS)
                    p = f'{tmp}/d.webp'
                    d.save(p, 'WEBP', quality=QUALITY, method=5)
                    fd.write(open(p, 'rb').read())
                    entry['d'].append(fd.tell())
                    # portrait : bande 9:16 centrée sur le sujet
                    cw = round(H * 9 / 16)
                    fx = focal_at(keys, i / max(1, n - 1))
                    x0 = round(min(max(fx * W - cw / 2, 0), W - cw))
                    m = im.crop((x0, 0, x0 + cw, H)).resize((MW, MH), Image.LANCZOS)
                    m.save(p, 'WEBP', quality=QUALITY, method=5)
                    fm.write(open(p, 'rb').read())
                    entry['m'].append(fm.tell())
                    if cid == 'c01' and i == 0:
                        d.save(f'{out}/poster-d.webp', 'WEBP', quality=72)
                        m.save(f'{out}/poster-m.webp', 'WEBP', quality=72)
            manifest['clips'][cid] = entry
            print(cid, n, 'images', round(entry['d'][-1] / 1e6, 2), 'Mo bureau', round(entry['m'][-1] / 1e6, 2), 'Mo mobile', flush=True)
    json.dump(manifest, open(f'{out}/manifest.json', 'w'))


if __name__ == '__main__':
    main()
