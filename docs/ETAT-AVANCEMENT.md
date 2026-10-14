# État d’avancement — version 3 (film Runway)

## Le film

Neuf clips Runway (Kling 3.0 Pro, 5 s chacun, image de départ et image d’arrivée imposées) enchaînés en un seul film piloté par le scroll. Chaque clip se termine sur l’image où commence le suivant ; aux interludes, l’image quitte le plein écran pour une carte puis revient.

| Temps | Clip / transition | Texte |
|---|---|---|
| Accueil | c00 : plan d’équipe immobile tant qu’on ne fait pas défiler, puis plongée dans ses yeux | Titre, promesse, bouton (`HERO`) |
| Ouverture | c01 : des yeux, recul sur la salariée | — |
| Changer d’angle | c02 : rotation autour d’elle | « Certains méritent… » |
| L’écran | c03 : plongée dans l’écran vierge | « Le handicap ne définit pas un talent. » |
| Le graphique | L’écran devient la page ; la dernière barre s’ouvre en fenêtre | « Ce sont ses compétences… » |
| Bras bionique | p1 : plan large puis **insert** (coupe sèche) sur sa main et le tournevis rouge | « Des compétences différentes. » / « Une même exigence… » |
| Atelier | **raccord dans l’axe** (match cut) : même cadre, même tournevis, une autre main — c04 | « Chaque métier a ses talents. » |
| Logistique | c05 : de l’atelier à l’entrepôt (salarié en fauteuil) | « Chaque talent a sa place. » |
| Fleuriste | **glissé** : l’entrepôt sort, la boutique entre ; f1 : elle s’exprime en langue des signes, une tablette traduit | « Chacun s’exprime à sa façon. » |
| Écran partagé | **triptyque** fleuriste / magasin (r1, prothèse de jambe) / bureau (o1) ; le bureau prend l’écran | « Rien ne se construit seul. » / « La réussite est collective. » |
| Bureau | o1 : salarié avec implant auditif ; **volet par amorce** (un pilier passe devant l’objectif et cache la coupe) | « L’inclusion ne s’improvise pas. » |
| Réunion | c06 | « Elle se construit, ensemble. » |
| La grue | c07 : montée jusqu’à la vue du dessus | Identifier / Construire / Accompagner |
| Liaison | c07b : redescente, la plante passe devant l’objectif | « Des engagements concrets. » / « Des résultats… » |
| La paroi | c08 | « Chaque action fait avancer l’entreprise. » |
| OETH | Le film se range dans la moitié droite (le haut en portrait), une autre personne à chaque chiffre | chiffres OETH |
| Le mot | **lettres découpées** : « REGARD » laisse voir l’image, grandit jusqu’à l’ouvrir en plein écran | — |
| Les yeux | c09 : plongée jusque dans ses yeux | — |
| Conclusion | **fermeture à l’iris** : le cercle se pose à côté du titre et des boutons | CTA |

Longueur : ≈ 29 hauteurs d’écran (réglage `PACE` dans `src/film/storyboard.ts`).

## Mobile (portrait) — version dédiée

Même film, mise en scène adaptée (le bureau n'est pas modifié) :
- textes plus grands, posés plus bas sur un voile plus dense, avec un filet couleur iris ;
- « Passer » seulement à l'accueil ; plus de bouton « Sans animation » (le réglage système « réduire les animations » reste respecté) ;
- écran de présentation : la phrase s'affiche directement sur l'écran ;
- écran partagé : trois bandes cadrées sur les visages ;
- OETH : l'image reste plein écran, teintée de bleu nuit, chiffres en blanc et couleur iris ;
- « REGARD » à la verticale, sur toute la hauteur ;
- conclusion : l'image suit le cercle, l'œil reste au centre (recadrage mobile du dernier plan corrigé).

## Mobile (portrait) — une étape par geste

- 27 arrêts (`STOPS` dans `storyboard.ts`), chacun sur un moment complet ; l'aimantation native du navigateur (scroll-snap, `scroll-snap-stop: always`) choisit l'arrêt suivant, un geste ample n'en saute aucun.
- Le film rejoint l'arrêt à son propre rythme (≈ 0,5 hauteur d'écran par seconde, 1,2 à 2,6 s, départ et arrivée adoucis) : `paced()` dans `Film.tsx`.
- Bandeau « Continuez à défiler pour découvrir » sous l'en-tête, de la fin de l'accueil à la conclusion.
- Après le film, un geste mène à « Solutions » ; la suite de la page défile librement. Ordinateur : défilement libre inchangé.

## Chargement

- Paquets nommés par empreinte de contenu (`tools/finalize-media.py`) : un clip régénéré change d’adresse, aucun cache ne ressort l’ancien.
- Pour chaque clip, 3 images fixes légères (début, milieu, fin) chargées d’abord, en partant du plan affiché : jamais d’écran noir, même sur connexion lente ou en sautant dans le film.
- Les paquets vidéo des plans visibles passent en premier ; ceux qu’on a quittés sont abandonnés.

## Production

- Planche de 4 angles : découpée, écran nettoyé des chiffres inventés, passée en 2752 × 1536 (Runway, nano_banana_2.1).
- 6 photos du storyboard repassées en haute définition, 5 images clés créées (yeux ×2, écran plein cadre, mains, vue du dessus).
- 9 clips générés. Crédits Runway consommés : environ 680.
- Conversion (`tools/build-film.py`) : 15 images/s ; bureau 1440 px ; mobile 608 × 1080 recadré en vertical en suivant le sujet (`tools/focal.json`). Un paquet par clip et par format : ≈ 28 Mo bureau, ≈ 16 Mo mobile au total, chargés clip par clip.

## Tests

- 17/17 vérifications fonctionnelles (réversibilité au pixel, clavier, formulaire, version sans animation, pages, menu mobile).
- Défilement continu (Chromium sans carte graphique, processeur ralenti 4 fois) : ≈ 37 images/s iPhone et iPad, ≈ 50 sur bureau. Sur appareil réel, le dessin passe par la puce graphique : à vérifier sur iPhone et iPad.

## Limites connues

- iPad en portrait : la version verticale est limitée par la définition des clips (1080 p), l’image est un peu douce. Remède possible : agrandissement vidéo Runway.
- c04 : une caisse bleue passe floue au premier plan vers 1,5 s.
- c06 : mouvement rapide au milieu (passage du poste à la réunion).
- Safari réel non testé ici.

Les documents des versions précédentes sont dans `docs/archive-v1/`.
