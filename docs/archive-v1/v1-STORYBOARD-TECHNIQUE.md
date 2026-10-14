# Storyboard technique

Généré depuis `app/src/cinematic/storyboard.ts` (source de vérité). Longueur totale : **21.84 hauteurs d’écran** de scroll.

Coordonnées de caméra : centre (x, y) dans la photo, 0 → 1 ; z = zoom (1 = plein cadre) ; w = largeur visible (fraction de la photo) ; px = parallaxe latérale ; push = travelling avant.

## Vue d’ensemble

| # | Segment | Technique | Scroll (écrans) | Statut |
|---|---|---|---|---|
| 1 | Plan 01 — Entrer dans la scène | shot | 0 → 1.05 | réalisé |
| 2 | Transition 01 → 02 — S’approcher | cameraMove | 1.05 → 1.61 | provisoire |
| 3 | Plan 02 — Découvrir la collaboratrice | shot | 1.61 → 2.45 | réalisé |
| 4 | Transition 02 → 03 — Changement d’angle | cameraMove | 2.45 → 3.36 | nécessite asset |
| 5 | Plan 03 — La révélation des compétences | shot | 3.36 → 4.41 | réalisé |
| 6 | Transition 03 → 04 — Le stylo guide la caméra | cameraMove | 4.41 → 5.04 | provisoire |
| 7 | Plan 04 — Le graphique devient un passage | shot | 5.04 → 6.02 | réalisé |
| 8 | Transition 04 → 05 — Du graphique à l’atelier (signature) | matchCut | 6.02 → 7.42 | réalisé |
| 9 | Plan 05 — Le savoir-faire | shot | 7.42 → 8.33 | réalisé |
| 10 | Transition 05 → 06 — Raccord de geste | motionMatch | 8.33 → 8.96 | provisoire |
| 11 | Plan 06 — Logistique | shot | 8.96 → 9.87 | réalisé |
| 12 | Transition 06 → 07 — Occlusion par objet | objectOcclusion | 9.87 → 10.57 | provisoire |
| 13 | Plan 07 — Réussite collective | shot | 10.57 → 11.41 | réalisé |
| 14 | Transition 07 → 08 — Passage derrière un premier plan | objectOcclusion | 11.41 → 12.04 | réalisé |
| 15 | Plan 08 — Accompagnement | shot | 12.04 → 12.88 | réalisé |
| 16 | Transition 08 → 09 — Suivre le geste | whipPan | 12.88 → 13.44 | réalisé |
| 17 | Plan 09 — Plan d’action | shot | 13.44 → 14.63 | réalisé |
| 18 | Transition 09 → 10 — L’écran change de diapositive | cameraMove | 14.63 → 15.26 | réalisé |
| 19 | Plan 10 — Résultats concrets | shot | 15.26 → 16.17 | réalisé |
| 20 | Transition 10 → 11 — De la liste au mur vitré | cameraMove | 16.17 → 16.8 | provisoire |
| 21 | Plan 11 — Mesurer les progrès | shot | 16.8 → 17.57 | réalisé |
| 22 | Transition 11 → OETH — Du photographique au graphique | graphicTransformation | 17.57 → 18.2 | réalisé |
| 23 | Séquence OETH — 20 / 6 % / la question | graphicTransformation | 18.2 → 20.3 | réalisé |
| 24 | Transition OETH → 12 — Décélération | cameraMove | 20.3 → 20.93 | réalisé |
| 25 | Plan 12 — Conclusion et conversion | shot | 20.93 → 21.84 | réalisé |

## Détail par segment

### Plan 01 — Entrer dans la scène

- Identifiant : `s01` · technique : **shot** · durée : 1.05 écran(s) · statut : **réalisé**
- Note : Travelling avant 2,5D : la carte de profondeur fait grossir les collaborateurs du premier plan plus vite que le fond.
- Calque 1 — `scene-01`
  - t0 : (0.5, 0.5) z 1
  - t0.25 : (0.5, 0.5) z 1.03 push 0.03
  - t1 : (0.486, 0.516) z 1.372 roll -0.24° push 0.22
- Texte « Dans chaque entreprise, il y a des talents. » : t 0.04 → 0.7, bottom-left, taille xl

### Transition 01 → 02 — S’approcher

- Identifiant : `t01` · technique : **cameraMove** · durée : 0.56 écran(s) · statut : **provisoire**
- Note : Le travelling continue ; au milieu du mouvement, la photo 02 (recalée au pixel sur 01) prend le relais. Les personnages ayant légèrement bougé entre les deux prises, un clip-pont supprimerait le léger dédoublement des mains.
- Calque 1 — `scene-01` · caméra dérivée du calque 2 par recalage (s 0.729, rotation -0.24°, t 201.7 / 145.4 px)
- Calque 2 — `scene-02` · relais 0@0.3 → 1@0.62
  - t0 : (0.5, 0.5) z 1
  - t1 : (0.515, 0.49) z 1.07 push 0.06

### Plan 02 — Découvrir la collaboratrice

- Identifiant : `s02` · technique : **shot** · durée : 0.84 écran(s) · statut : **réalisé**
- Calque 1 — `scene-02`
  - t0 : (0.515, 0.49) z 1.07 push 0.06
  - t0.5 : (0.52, 0.47) z 1.13 px -0.02 push 0.08
  - t1 : (0.487, 0.362) z 1.161 push 0.04
- Texte « Certains méritent simplement qu’on les regarde autrement. » : t 0.1 → 0.86, bottom-left, taille l (mobile : « Regardons autrement. »)

### Transition 02 → 03 — Changement d’angle

- Identifiant : `t02` · technique : **cameraMove** · durée : 0.91 écran(s) · statut : **nécessite asset**
- Note : Pseudo-orbite 2,5D (≈ 8°) : la caméra glisse latéralement en gardant la salariée fixe, le premier plan et le fond défilent en sens opposés, puis le plan 03 (autre angle réel) prend le relais recalé sur son visage. Une vraie orbite de 30 à 60° exige le clip-pont V02 (voir MEDIAS-MANQUANTS.md).
- Calque 1 — `scene-02` · caméra dérivée du calque 2 par recalage (s 1.12, rotation 3°, t -201.174 / -134.75 px) · flou de bougé 0.5
- Calque 2 — `scene-03` · relais 0@0.32 → 1@0.62 · flou de bougé 0.5
  - t0 : (0.555, 0.4) z 1.3 roll -3° px -0.045
  - t1 : (0.585, 0.42) z 1.18

### Plan 03 — La révélation des compétences

- Identifiant : `s03` · technique : **shot** · durée : 1.05 écran(s) · statut : **réalisé**
- Calque 1 — `scene-03`
  - t0 : (0.585, 0.42) mobile x 0.57 z 1.18
  - t0.45 : (0.62, 0.42) mobile x 0.58 z 1.22 px 0.02
  - t1 : (0.857, 0.331) z 3.476 roll -3.24°
- Texte « Le handicap ne définit pas un talent. » : t 0.06 → 0.44, bottom-left, taille l
- Texte « Ce sont ses compétences qui font la différence. » : t 0.5 → 0.9, bottom-left, taille xl (mobile : « Ses compétences font la différence. »)

### Transition 03 → 04 — Le stylo guide la caméra

- Identifiant : `t03` · technique : **cameraMove** · durée : 0.63 écran(s) · statut : **provisoire**
- Note : Travelling ciblé vers le tableau. Le gros plan 04 est recalé au pixel (SIFT, rotation −3,2°) sur la zone du mur visible en 03 : la caméra « arrive » dans le gros plan sans saut. Pendant le relais, la main et le stylo des deux prises se superposent brièvement : un insert vidéo (V03) le supprimerait.
- Calque 1 — `scene-03` · caméra dérivée du calque 2 par recalage (s 0.633, rotation -3.24°, t 824.7 / 65.7 px)
- Calque 2 — `scene-04` · relais 0@0.3 → 1@0.6
  - t0 : (0.56, 0.47) z 2.2
  - t1 : (0.55, 0.48) z 2.05

### Plan 04 — Le graphique devient un passage

- Identifiant : `s04` · technique : **shot** · durée : 0.98 écran(s) · statut : **réalisé**
- Calque 1 — `scene-04`
  - t0 : (0.55, 0.48) z 2.05
  - t0.45 : (0.64, 0.43) z 2.3
  - t1 : (0.758, 0.37) w 0.07
- Texte « Quand chacun apporte ses compétences… » : t 0.05 → 0.44, bottom-left, taille l
- Texte « C’est toute l’entreprise qui avance. » : t 0.48 → 0.86, bottom-left, taille xl

### Transition 04 → 05 — Du graphique à l’atelier (signature)

- Identifiant : `t04` · technique : **matchCut** · durée : 1.4 écran(s) · statut : **réalisé**
- Note : Match cut par occlusion : la barre « Juin » remplit le cadre, son bleu converge vers celui du montant d’étagère (même axe vertical, même position écran), la coupe a lieu pendant l’occlusion totale, puis la caméra recule le long du montant jusqu’au salarié. Limite : le montant est agrandi ×45 au départ (texture douce) ; le plan macro M04 améliorerait le grain du métal.
- Calque 1 — `scene-04` · étalonnage 0@0.2 → 1@0.34
  - t0 : (0.758, 0.37) w 0.07
  - t0.3 : (0.758, 0.37) w 0.017
  - t0.42 : (0.758, 0.37) w 0.015
- Calque 2 — `scene-05` · relais 0@0.355 → 1@0.4 · étalonnage 1@0.4 → 0@0.56
  - t0.35 : (0.977, 0.3) w 0.021
  - t0.42 : (0.977, 0.3) w 0.024
  - t0.58 : (0.965, 0.33) w 0.11
  - t0.8 : (0.84, 0.4) w 0.4 px -0.025 push -0.08
  - t1 : (0.62, 0.45) z 1.15

### Plan 05 — Le savoir-faire

- Identifiant : `s05` · technique : **shot** · durée : 0.91 écran(s) · statut : **réalisé**
- Note : Ordre de l’acte II inversé par rapport au prompt : seul l’atelier (05) possède le montant bleu vertical nécessaire au raccord signature ; la logistique (06) suit par raccord de geste.
- Calque 1 — `scene-05`
  - t0 : (0.62, 0.45) z 1.15
  - t0.5 : (0.6, 0.52) z 1.3 px 0.015
  - t1 : (0.62, 0.68) z 2.6
- Texte « Des compétences différentes. » : t 0.06 → 0.42, bottom-left, taille l
- Texte « Une même exigence de réussite. » : t 0.48 → 0.86, bottom-left, taille xl

### Transition 05 → 06 — Raccord de geste

- Identifiant : `t05` · technique : **motionMatch** · durée : 0.63 écran(s) · statut : **provisoire**
- Note : La caméra suit la main au travail ; la main qui saisit le colis prend sa place, recalée sur la même position écran, avec flou de bougé. Un insert vidéo de 1,5 s (V05) rendrait le geste continu.
- Calque 1 — `scene-05` · caméra dérivée du calque 2 par recalage (s 1, rotation 0°, t 50.16 / -18.82 px) · flou de bougé 1
- Calque 2 — `scene-06` · relais 0@0.42 → 1@0.56 · flou de bougé 1
  - t0 : (0.59, 0.7) z 2.6
  - t1 : (0.66, 0.6) z 1.5

### Plan 06 — Logistique

- Identifiant : `s06` · technique : **shot** · durée : 0.91 écran(s) · statut : **réalisé**
- Calque 1 — `scene-06`
  - t0 : (0.66, 0.6) z 1.5
  - t0.45 : (0.63, 0.46) z 1.2 px -0.015
  - t1 : (0.79, 0.72) w 0.14
- Texte « Chaque métier a ses talents. » : t 0.06 → 0.42, bottom-left, taille l
- Texte « Chaque talent a sa place. » : t 0.48 → 0.84, bottom-left, taille xl

### Transition 06 → 07 — Occlusion par objet

- Identifiant : `t06` · technique : **objectOcclusion** · durée : 0.7 écran(s) · statut : **provisoire**
- Note : La caméra passe tout près du colis : le carton occupe le cadre, sa teinte rejoint celle du blazer beige du plan 07, d’où la caméra recule sur la poignée de main. Lecture : le colis passe de main en main, puis la main se tend. Fortement agrandi : un plan macro (M06) améliorerait la matière.
- Calque 1 — `scene-06` · étalonnage 0@0.2 → 0.92@0.36
  - t0 : (0.79, 0.72) w 0.14
  - t0.36 : (0.8, 0.73) w 0.045
- Calque 2 — `scene-07` · relais 0@0.36 → 1@0.41 · étalonnage 0.92@0.41 → 0@0.58
  - t0.36 : (0.3, 0.85) w 0.05
  - t1 : (0.45, 0.52) z 1.05

### Plan 07 — Réussite collective

- Identifiant : `s07` · technique : **shot** · durée : 0.84 écran(s) · statut : **réalisé**
- Calque 1 — `scene-07`
  - t0 : (0.45, 0.52) z 1.05
  - t0.55 : (0.5, 0.52) z 1.12 px 0.015
  - t1 : (0.86, 0.58) w 0.24
- Texte « Rien ne se construit seul. » : t 0.06 → 0.42, bottom-left, taille l
- Texte « La réussite est collective. » : t 0.46 → 0.82, bottom-left, taille xl

### Transition 07 → 08 — Passage derrière un premier plan

- Identifiant : `t07` · technique : **objectOcclusion** · durée : 0.63 écran(s) · statut : **réalisé**
- Note : Panoramique vers la droite : le costume marine du premier plan occulte le cadre ; on ressort de l’autre côté sur la chemise sombre du collègue du plan 08. Technique classique de coupe invisible.
- Calque 1 — `scene-07` · étalonnage 0@0.24 → 0.9@0.36 · flou de bougé 0.8
  - t0 : (0.86, 0.58) w 0.24
  - t0.36 : (0.925, 0.62) w 0.07
- Calque 2 — `scene-08` · relais 0@0.36 → 1@0.4 · étalonnage 0.9@0.4 → 0@0.55 · flou de bougé 0.8
  - t0.36 : (0.1, 0.62) w 0.07
  - t1 : (0.45, 0.46) z 1.1

### Plan 08 — Accompagnement

- Identifiant : `s08` · technique : **shot** · durée : 0.84 écran(s) · statut : **réalisé**
- Calque 1 — `scene-08`
  - t0 : (0.45, 0.46) z 1.1
  - t0.55 : (0.56, 0.45) z 1.2 px 0.015
  - t1 : (0.6, 0.42) z 1.8
- Texte « L’inclusion ne s’improvise pas. » : t 0.06 → 0.42, bottom-left, taille l
- Texte « Elle se construit, ensemble. » : t 0.48 → 0.86, bottom-left, taille xl

### Transition 08 → 09 — Suivre le geste

- Identifiant : `t08` · technique : **whipPan** · durée : 0.56 écran(s) · statut : **réalisé**
- Note : Elle désigne l’écran : la caméra part en panoramique filé dans la direction du geste et se pose dans la réunion du plan 09. Coupe cachée dans le flou de bougé (technique de montage classique).
- Calque 1 — `scene-08` · flou de bougé 1.8
  - t0 : (0.6, 0.42) z 1.8
  - t0.5 : (0.76, 0.42) z 1.85
- Calque 2 — `scene-09` · relais 0@0.47 → 1@0.53 · flou de bougé 1.8
  - t0.5 : (0.2, 0.4) z 1.85
  - t1 : (0.42, 0.4) z 1.3

### Plan 09 — Plan d’action

- Identifiant : `s09` · technique : **shot** · durée : 1.19 écran(s) · statut : **réalisé**
- Calque 1 — `scene-09`
  - t0 : (0.42, 0.4) z 1.3
  - t0.3 : (0.4, 0.42) z 1.18 px -0.025
  - t0.62 : (0.46, 0.4) z 1.2 px 0.025
  - t1 : (0.8, 0.245) w 0.36
- Texte « Identifier les besoins. » : t 0.04 → 0.3, bottom-left, taille l
- Texte « Construire les solutions. » : t 0.33 → 0.58, bottom-left, taille l
- Texte « Accompagner durablement. » : t 0.61 → 0.86, bottom-left, taille l

### Transition 09 → 10 — L’écran change de diapositive

- Identifiant : `t09` · technique : **cameraMove** · durée : 0.63 écran(s) · statut : **réalisé**
- Note : La caméra entre dans l’écran de présentation ; quand il remplit le cadre, la diapositive suivante apparaît (raccord diégétique), puis la caméra recule dans la salle du plan 10.
- Calque 1 — `scene-09`
  - t0 : (0.8, 0.245) w 0.36
  - t0.55 : (0.8, 0.25) w 0.3
- Calque 2 — `scene-10` · relais 0@0.36 → 1@0.54
  - t0.35 : (0.837, 0.25) w 0.26
  - t1 : (0.62, 0.45) mobile x 0.5 z 1.1

### Plan 10 — Résultats concrets

- Identifiant : `s10` · technique : **shot** · durée : 0.91 écran(s) · statut : **réalisé**
- Note : Nouvelle photographie fournie (protagoniste différente) : placée ici, où sa présentation de résultats sert le récit.
- Calque 1 — `scene-10`
  - t0 : (0.62, 0.45) mobile x 0.5 z 1.1
  - t0.55 : (0.64, 0.42) mobile x 0.52 z 1.2 px -0.015
  - t1 : (0.59, 0.215) w 0.18
- Texte « Des engagements concrets. » : t 0.06 → 0.42, bottom-left, taille l
- Texte « Des résultats qui comptent. » : t 0.48 → 0.84, bottom-left, taille xl

### Transition 10 → 11 — De la liste au mur vitré

- Identifiant : `t10` · technique : **cameraMove** · durée : 0.63 écran(s) · statut : **provisoire**
- Note : Raccord de forme : la liste à cocher du tableau blanc devient la liste cochée sur la paroi vitrée. Les deux listes n’ont pas la même mise en page ; un insert graphique (G10) rendrait le raccord exact.
- Calque 1 — `scene-10`
  - t0 : (0.59, 0.215) w 0.18
  - t0.55 : (0.59, 0.21) w 0.14
- Calque 2 — `scene-11` · relais 0@0.36 → 1@0.56
  - t0.35 : (0.84, 0.3) w 0.26
  - t1 : (0.55, 0.45) mobile x 0.36 z 1.1

### Plan 11 — Mesurer les progrès

- Identifiant : `s11` · technique : **shot** · durée : 0.77 écran(s) · statut : **réalisé**
- Calque 1 — `scene-11`
  - t0 : (0.55, 0.45) mobile x 0.36 z 1.1
  - t0.6 : (0.5, 0.45) mobile x 0.34 z 1.16 px 0.015
  - t1 : (0.8, 0.62) z 1.6
- Texte « Chaque action fait avancer l’entreprise. » : t 0.08 → 0.74, bottom-left, taille xl

### Transition 11 → OETH — Du photographique au graphique

- Identifiant : `t11` · technique : **graphicTransformation** · durée : 0.63 écran(s) · statut : **réalisé**
- Note : La caméra avance vers la zone lumineuse de la paroi vitrée ; une surface claire s’ouvre depuis ce point et remplace la photo. Changement de registre assumé.
- Calque 1 — `scene-11`
  - t0 : (0.8, 0.62) z 1.6
  - t1 : (0.86, 0.72) z 2.6
- Surface `paper` : 0@0.25 → 1@1

### Séquence OETH — 20 / 6 % / la question

- Identifiant : `oeth` · technique : **graphicTransformation** · durée : 2.1 écran(s) · statut : **réalisé**
- Note : Composition typographique sur fond clair. Chiffres à faire valider juridiquement avant publication.
- Calque 1 — `scene-11` · relais 0@0
  - t0 : (0.86, 0.72) z 2.6
- Surface `paper` : 1@0
- Surface `oeth-1` : 0@0.02 → 1@0.1 → 1@0.26 → 0@0.33
- Surface `oeth-2` : 0@0.35 → 1@0.43 → 1@0.6 → 0@0.67
- Surface `oeth-3` : 0@0.69 → 1@0.78 → 1@1

### Transition OETH → 12 — Décélération

- Identifiant : `t12` · technique : **cameraMove** · durée : 0.63 écran(s) · statut : **réalisé**
- Note : La surface graphique se retire vers le haut et découvre la dernière scène pendant que la caméra ralentit.
- Calque 1 — `scene-12`
  - t0 : (0.46, 0.5) z 1.3 push 0.12
  - t1 : (0.42, 0.5) z 1.12 push 0.03
- Surface `paper` : 1@0 → 0@0.85
- Surface `oeth-3` : 1@0 → 0@0.3

### Plan 12 — Conclusion et conversion

- Identifiant : `s12` · technique : **shot** · durée : 0.91 écran(s) · statut : **réalisé**
- Note : Le texte et le bouton incrustés dans la photo d’origine ont été retirés (inpainting) puis reconstruits en HTML.
- Calque 1 — `scene-12`
  - t0 : (0.42, 0.5) z 1.12 push 0.03
  - t1 : (0.4, 0.5) z 1.05
- Surface `cta` : 0@0.02 → 1@0.3 → 1@1
