# Changeons de regard — expérience web cinématographique

Site immersif sur l’inclusion des personnes en situation de handicap en entreprise. Le haut de la page d’accueil est un film interactif : le scroll pilote une caméra virtuelle à travers 12 photographies, en avant comme en arrière.

## Mise en ligne

- **Dépôt** : github.com/calypso-advisory/agepheel (branche `main`).
- **Hébergement** : Vercel, projet `changeons-de-regard` (équipe Calypso), dossier racine `app/`. Chaque envoi sur `main` publie le site ; chaque autre branche crée un lien d'aperçu.
- **Adresse provisoire** : changeons-de-regard-calypso12.vercel.app (protégée par l'authentification Vercel tant que le domaine définitif n'est pas branché).
- `app/vercel.json` : renvoi de toutes les adresses vers l'application (pages `/solutions`, `/contact`…), cache des médias.
- Tests contre une adresse protégée : `BASE=<url>/ SHARE=<lien de partage Vercel> node tests/e2e.mjs out`.

## Contenu du dossier

```
inclusion-site/
  app/                     projet web (React + TypeScript + Vite + GSAP ScrollTrigger + WebGL2)
  media-src/               sources : photos d’origine, cartes de profondeur, versions nettoyées
  tools/                   scripts de préparation (profondeur, recalage, nettoyage, clips-ponts)
  docs/
    STORYBOARD-TECHNIQUE.md   durées, trajectoires, ancres, statut de chaque séquence
    MATRICE-CONTINUITE.md     audit image par image et raccords
    MEDIAS-MANQUANTS.md       plans à produire + prompts vidéo
    ETAT-AVANCEMENT.md        réalisé / provisoire / nécessite asset, tests effectués
    captures/                 planches de captures issues des tests navigateur
```

## Installation et exécution

Prérequis : Node.js 20 ou plus.

```bash
cd app
npm install
npm run dev          # développement : http://localhost:5173
npm run build        # production dans app/dist (URLs propres, BrowserRouter)
npm run preview      # sert app/dist : http://localhost:4173
```

Variables d’environnement (fichier `app/.env`) :

| Variable | Rôle |
|---|---|
| `VITE_CONTACT_ENDPOINT` | URL qui reçoit le formulaire en POST JSON. Absente : mode démonstration affiché clairement, rien n’est envoyé. |
| `VITE_ROUTER=hash` | Routage par `#/…` pour un hébergement sans réécriture d’URL (aperçu). En production, laisser vide. |

En production, configurer le serveur pour renvoyer `index.html` sur toutes les routes (`/solutions`, `/comprendre-oeth`, etc.). Remplacer le domaine d’exemple dans `public/robots.txt` et `public/sitemap.xml`.

## Fonctionnement — version 2 (éditoriale)

La première version (caméra 2,5D en WebGL sur photos plein écran) a été abandonnée après essai sur iPhone et iPad : les passages entre photos différentes sonnaient faux, et le lissage du scroll contrariait l'inertie du doigt.

Principe actuel : **le scroll change le cadrage, pas la caméra.** Chaque photo vit dans un cadre qui s'ouvre, se partage l'écran ou se resserre, à côté d'une colonne de texte (paysage) ou au-dessus (portrait).

```
scroll natif (aucun lissage)
   │  une lecture de position par image
   ▼
editorial/actOne.ts   evaluate(p, layout) → état de chaque cadre, textes, puces
   │  fonction pure : même position = même image (réversible)
   ▼
components/ActOne.tsx  écrit uniquement transform et opacity
```

- **Cadre et image à échelles inverses** : le masque (overflow: hidden) est mis à l'échelle, l'image reçoit l'échelle inverse. L'image reste immobile, seul le cadre change. Tout est traité par le compositeur, sans clip-path, filtre ni WebGL.
- **Vues** : chaque photo est placée par un point focal (fx, fy), un zoom (1 = elle couvre le cadre) et une ancre. Les vues aux jonctions sont partagées entre séquences pour garantir la continuité.
- **Disposition** calculée au redimensionnement seulement : paysage (texte à gauche) ou portrait (cadre en haut).

L'ancien moteur et sa configuration de cadrages restent dans `src/cinematic/` (types, caméra, liste des scènes) ; seule la liste `SCENES` y est encore utilisée.

## Modifier le contenu sans toucher au moteur

| Quoi | Où |
|---|---|
| Acte I : textes, rythme, points relevés sur les photos, cadrages | `app/src/editorial/actOne.ts` |
| Solutions, chiffres OETH, CTA, options du formulaire | `app/src/content/site.ts` |
| Pages secondaires | `app/src/pages/InfoPages.tsx` |
| Couleurs, typographie | `app/src/styles/globals.css` (variables `:root`) |

### Remplacer une photo

1. Déposer la nouvelle image dans `media-src/scene-XX.png` (idéalement 2560 px de large ou plus).
2. Recalculer sa profondeur : `python3 tools/depth.py` (télécharger d’abord le modèle Depth Anything V2 ONNX dans `models/`).
3. Exporter en WebP dans `app/public/media/scenes/` et `app/public/media/depth/` (voir les dimensions existantes).
4. Si la composition change, reprendre les cadrages et recalages du storyboard (`tools/register.py` affiche les recalages SIFT entre deux photos).

## Tests

```bash
cd app && npm run build && npx vite preview --port 4173 &
node tests/e2e.mjs ../docs/captures/e2e                       # 17 vérifications fonctionnelles
node tests/act.mjs out 390x844 0,0.25,0.5,0.75,1 --mobile     # captures de l'Acte I à des positions données
node tests/perf.mjs                                           # temps par image, iPhone / iPad / bureau
```

Les tests utilisent Playwright et Chromium. Safari (WebKit) n'a pas pu être installé dans l'environnement de développement : la validation finale se fait sur iPhone et iPad réels.
