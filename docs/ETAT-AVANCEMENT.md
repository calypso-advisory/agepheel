# État d’avancement — version 3 (film Runway)

## Le film

Neuf clips Runway (Kling 3.0 Pro, 5 s chacun, image de départ et image d’arrivée imposées) enchaînés en un seul film piloté par le scroll. Chaque clip se termine sur l’image où commence le suivant ; aux interludes, l’image quitte le plein écran pour une carte puis revient.

| Temps | Clip / effet | Texte |
|---|---|---|
| Ouverture | c01 : très gros plan sur les yeux → recul sur la salariée | « Dans chaque entreprise, il y a des talents. » |
| Changer d’angle | c02 : rotation autour d’elle → l’équipe | « Certains méritent simplement qu’on les regarde autrement. » |
| L’écran | c03 : plongée dans l’écran vierge | « Le handicap ne définit pas un talent. » |
| Le graphique | L’écran devient la page ; graphique HTML ; la dernière barre s’ouvre en fenêtre sur l’atelier | « Ce sont ses compétences… » / « Quand chacun apporte… » |
| Les mains | c04 : macro des mains → recul sur l’atelier | « Des compétences différentes. » / « Une même exigence de réussite. » |
| Logistique | c05 : il se retourne, le colis passe de main en main | « Chaque métier a ses talents. » / « Chaque talent a sa place. » |
| Collectif | Carte + volet vers le bureau | « Rien ne se construit seul. » / « La réussite est collective. » |
| Le bureau | c06 : du poste de travail à la réunion | « L’inclusion ne s’improvise pas. » / « Elle se construit, ensemble. » |
| La grue | c07 : montée jusqu’à la vue du dessus | « Identifier… » / « Construire… » / « Accompagner… » |
| Résultats | Carte + volet vers la paroi vitrée | « Des engagements concrets. » / « Des résultats qui comptent. » |
| La paroi | c08 : de la liste cochée à l’ordinateur | « Chaque action fait avancer l’entreprise. » |
| OETH | Le film se range ; 20 silhouettes ; 6 points sur 100 ; la question | chiffres OETH |
| Les yeux | c09 : plongée jusque dans ses yeux | — |
| Conclusion | Les yeux dans une carte, titre et boutons | CTA |

Longueur : ≈ 22 hauteurs d’écran (réglage `PACE` dans `src/film/storyboard.ts`).

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
