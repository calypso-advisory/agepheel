# État d’avancement

## Réalisé

- **Moteur cinématographique** : progression unique pilotée par ScrollTrigger, rendu WebGL2 déterministe et réversible, lissage du scroll, React jamais re-rendu par image.
- **Parallaxe 2,5D réelle** : cartes de profondeur Depth Anything V2 pour les 12 photos, marche de rayon dans le shader (travelling avant et latéral avec différentiel de profondeur).
- **Recalages entre photos** (SIFT ou ancre) : alignement exact 01/02, 03/04, 02/03, 05/06.
- **Transition signature 04 → 05** : barre « Juin » → montant d’étagère par occlusion, étalonnage convergent, coupe invisible, recul jusqu’au salarié. Vérifiée image par image en avant et en arrière.
- **Raccords** : passage derrière un premier plan (07 → 08), panoramique filé (08 → 09), changement de diapositive (09 → 10), ouverture graphique OETH, décélération finale.
- **Retouches** : texte et bouton retirés de la photo 12 (reconstruits en HTML) ; titre daté et axe « Avr » doublé retirés du graphique 04.
- **Séquence OETH** (20 / 6 % / question) avec note de nuance juridique.
- **Solutions** (3 cartes avec liens), **conclusion** avec CTA réels, **formulaire** complet (validation, erreurs accessibles, RGPD, état « démonstration » explicite).
- **Navigation** fixe à contraste adaptatif, menu mobile, chapitres cliquables, « Passer l’introduction », indice de scroll, « Version sans animation ».
- **Accessibilité** : parcours éditorial statique (réduction des mouvements, absence de WebGL2 ou choix du visiteur), récit complet dans le DOM, H1 unique, focus visibles, CTA inertes tant qu’ils sont invisibles.
- **Pages** : Accueil, Nos solutions, Comprendre l’OETH, Entreprises adaptées et ESAT, À propos, Contact ; robots.txt et sitemap.xml.
- **Mobile** : recadrages portrait par plan, textes courts, outils regroupés en haut.
- **Clips-ponts** : chemin de code « séquence d’images pilotée au scroll » en place.

## Provisoire

| Élément | Limite | Correction |
|---|---|---|
| 01 → 02 | Léger dédoublement des collègues pendant le relais | V01 |
| 03 → 04 | Main et stylo des deux prises superposés un instant | V03 |
| 05 → 06 | Double exposition brève des mains, masquée par le flou de bougé | V05 |
| 06 → 07 | Carton et blazer très agrandis (matière floue) | M06 |
| 10 → 11 | Les deux listes n’ont pas la même mise en page | G10 |
| Texture du montant (04 → 05) | Agrandi ×45 au moment de la coupe | M04 / V04 |
| Durée du film | ≈ 22 écrans de scroll (au-delà des 10–14 indicatifs) pour laisser lire les textes | `SCROLL_SCALE` dans storyboard.ts |
| Logo, mentions légales, RGPD, contenus des pages secondaires | Marqués « À compléter » | Rédaction et validation |
| Chiffres OETH | Informations générales ; seuil de 20 salariés et taux de 6 % confirmés comme règle en vigueur en 2026 (Tissot, Justice.fr), un décret du 13 février 2026 a précisé le reliquat de fin d’accord | Validation juridique avant publication |
| Formulaire | Aucun service d’envoi | `VITE_CONTACT_ENDPOINT` |

## Nécessite asset

| Élément | Asset |
|---|---|
| Vraie orbite 30–60° (02 → 03), critère d’acceptation « perspective » | V02 |
| Netteté sur grands écrans et Retina | HR (photos 2560 px) |

Le critère « vrai changement d’angle avec révélation des faces cachées » n’est pas atteint avec les seules photos : la pseudo-orbite actuelle (≈ 8°) est une reprojection 2,5D, présentée comme telle.

## Tests effectués

Navigateur Chromium (Playwright, rendu GPU logiciel), 1440 × 900, 1920 × 1080, 1024 × 1366 et 390 × 844 tactile.

- 19/19 vérifications fonctionnelles (`app/tests/e2e.mjs`) : réversibilité au pixel après allers-retours rapides, CTA inaccessible tant qu’il est masqué, ordre de tabulation, « Passer l’introduction » et focus, resize en plein film, formulaire vide puis valide, absence d’erreurs console, réduction des mouvements (12 scènes, un H1), pages secondaires, menu mobile et touche Échap.
- Coût JavaScript d’une image : ≈ 0,03 ms. Le coût GPU (marche de rayon de 40 pas par pixel, résolution plafonnée à 1,5×) n’a pas pu être mesuré sur un vrai GPU dans cet environnement.
- Captures image par image : `docs/captures/`.

## Non testé ici

- Fluidité réelle au trackpad Apple, à la molette et au tactile sur appareil physique ; FPS sur GPU réel ; Safari et Firefox.
- Lecteurs d’écran réels (NVDA, VoiceOver) ; audit RGAA complet.
- Clip-pont réel (aucun n’existe encore).
