# Changeons de regard — notes pour les agents

Site vitrine (Vite + React + TypeScript) dans `app/`. Déployé sur Vercel (Root Directory = `app`).

## Le film (page d'accueil)

- Le récit est un film piloté par le scroll : `app/src/film/` (storyboard, moteur pur `film.ts`, chargement des séquences `sequence.ts`) et `app/src/components/Film.tsx`.
- Les images viennent de clips Runway convertis en paquets (`app/public/media/film/<clip>-<d|m>.bin` + `manifest.json`) par `tools/build-film.py`. « d » = bureau 1440 px, « m » = portrait 608×1080 recadré sur le sujet (`tools/focal.json`).
- Le moteur n'écrit que `transform` et `opacity` et dessine dans un seul canvas. Ne pas introduire de re-rendu React par image, de lissage du scroll, de `clip-path` ou de filtres animés : c'est ce qui garantit la fluidité sur iPhone.
- Transitions disponibles dans le moteur (toutes en canvas ou transform) : volet vertical (`clipB`), écran partagé (`panels`), lettres découpées (`knock`, calque `.fm-knock`), iris (`iris`), fenêtre/carte (rectangles R et C). Les coupes franches se font en changeant de clip d'un temps à l'autre.
- Les longueurs de scroll : `BEATS` et `PACE` dans `app/src/film/storyboard.ts`. Les textes : `TEXTS` dans le même fichier.

## Vérifier avant de livrer

```bash
cd app && npm ci && npm run build && npx vite preview --port 4173 &
node tests/e2e.mjs /tmp/e2e        # 17 vérifications fonctionnelles
node tests/film.mjs /tmp/f 390x844 0,0.25,0.5,0.75,1 --mobile
node tests/perf.mjs                # temps par image
node tests/slownet.mjs /tmp/s.png    # connexion lente : l’affiche doit être visible avant le premier clip
```

## Contenus

- Textes du site, chiffres OETH, CTA, options du formulaire : `app/src/content/site.ts`.
- Aucun chiffre client, certification ou partenariat inventé. Les mentions « À compléter » sont volontaires.
- Formulaire : `app/src/services/contact.ts` ; sans `VITE_CONTACT_ENDPOINT`, mode démonstration affiché.
