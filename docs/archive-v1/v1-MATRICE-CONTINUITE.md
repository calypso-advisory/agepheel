# Matrice de continuité

Toutes les sources font **1672 × 941 px (16:9)**. C’est la limite principale du projet : sur un écran 1920 px ou Retina, toute photo est déjà légèrement agrandie, et les gros plans de raccord l’agrandissent fortement (voir MEDIAS-MANQUANTS.md, item HR).

Ordre retenu : la nouvelle photographie (collaboratrice en tresses, blazer beige) est placée en **plan 10**, comme convenu. L’acte II est inversé par rapport au prompt (atelier avant logistique) : seul l’atelier possède le montant bleu vertical nécessaire au raccord signature 04 → 05.

## Audit image par image

| Plan | Fichier source | Sujet / cadrage | Protagoniste et tenue | Lumière, axe | Éléments de raccord exploitables | Points d’attention |
|---|---|---|---|---|---|---|
| 01 | 64D124D7 | Réunion, plan large depuis l’arrière du groupe, premiers plans flous gauche/droite | Salariée A (lunettes, fauteuil), cardigan lavande | Lumière du jour, baies vitrées en fond ; axe face à la salariée | Le plan 02 est un rapproché exact (SIFT : 124 points) | Bonne profondeur (4 plans) |
| 02 | BFEAF774 | Rapproché sur A, collègues penchés | A, cardigan lavande | Identique 01 | Visage de A (ancre de l’orbite) | Les collègues ont bougé entre 01 et 02 : léger dédoublement pendant le relais |
| 03 | E042B5C0 | Vue de côté, A désigne le mur au stylo | A, cardigan lavande | Même salle, axe tourné ≈ 30–40° | Stylo, mur de graphiques (recalage SIFT avec 04 : 36 points) | Vrai changement d’angle par rapport à 02 : impossible à relier par reprojection seule |
| 04 | C93304E3 | Gros plan sur le graphique, main et stylo | A (bras), cardigan lavande | Identique | Barre « Juin » : 31 px de large, verticale, #4D84B9 | Texte « Résultats Projet 2024 » et axe « Avr » doublé **retirés** (retouche) |
| 05 | 09A430BA | Atelier : assemblage au tournevis | Salarié B (trisomie 21, lunettes), gilet gris | Lumière plus froide (néons) | Montant d’étagère bleu marine vertical, bord droit (x ≈ 96–99 %), 40 px | Montant étroit : agrandi ×45 au raccord |
| 06 | 4BC1DCE5 | Logistique : B transmet un colis | B, même gilet | Proche de 05 | Mains sur le colis (raccord de geste), carton au premier plan | Tenue et identité cohérentes avec 05 |
| 07 | ECF76C6F | Poignée de main, collègues autour | Salariée C (même visage que A), blazer beige | Bureau lumineux | Blazer beige (raccord carton), costume marine au premier plan droit | Changement de tenue lavande → beige : se lit comme un autre jour |
| 08 | 20CABCD2 | C montre l’écran du doigt | C, blazer beige | Identique 07 | Chemise olive sombre au premier plan gauche, geste vers la droite | Fond recalable avec 07 (43 points SIFT) |
| 09 | 416140B2 | Réunion, écran « Plan de projet » | C, blazer beige | Identique | Écran : rectangle x 60–100 %, y 0–49 % | Texte de diapositive conservé (diégétique) |
| 10 | Image_Codex (nouvelle) | Présentation de résultats à l’écran | Salariée D (tresses), blazer beige | Identique | Écran x 69–98 %, tableau blanc avec liste cochée | Protagoniste différente ; années 2021–2024 sur l’écran (datent l’image) |
| 11 | 2684C77F | C coche une liste sur paroi vitrée | C, blazer beige | Contre-jour, bokeh lumineux à droite | Liste cochée (raccord avec le tableau de 10), zone claire (ouverture OETH) | — |
| 12 | 936D2F5B | C à son ordinateur, collègues autour | C, blazer beige | Lumière chaude | Zone droite libre pour le CTA | Titre et bouton incrustés **retirés** (retouche), reconstruits en HTML |

## Matrice des raccords

| Raccord | Technique réalisée | Élément de raccord | Géométrie | Statut |
|---|---|---|---|---|
| 01 → 02 | Travelling avant 2,5D, relais recalé | Salariée A | Recalage SIFT exact (échelle 0,729) | Provisoire : léger dédoublement des collègues |
| 02 → 03 | Pseudo-orbite 2,5D (≈ 8°) puis relais recalé sur le visage | Salariée A | Ancre visage + rotation 3° | **Nécessite asset** V02 (vraie orbite 30–60°) |
| 03 → 04 | Travelling ciblé, relais recalé sur le mur | Stylo, graphique | Recalage SIFT (échelle 0,633, rotation −3,2°) | Provisoire : main et stylo superposés un instant |
| 04 → 05 | Match cut par occlusion | Barre bleue → montant métallique | Même axe vertical, même position écran ; étalonnage convergent ; coupe pendant l’occlusion | Réalisé ; texture du montant douce (M04 recommandé) |
| 05 → 06 | Raccord de geste, flou de bougé | Main au travail → main sur le colis | Ancre main | Provisoire (V05 recommandé) |
| 06 → 07 | Occlusion par objet | Carton → blazer beige | Plein cadre, étalonnage convergent | Provisoire (M06 recommandé) |
| 07 → 08 | Passage derrière un premier plan | Costume marine → chemise olive | Plein cadre sombre, flou de bougé | Réalisé |
| 08 → 09 | Panoramique filé dans la direction du geste | Geste vers l’écran | Coupe dans le flou | Réalisé |
| 09 → 10 | Changement de diapositive | Écran plein cadre | Rectangle d’écran | Réalisé |
| 10 → 11 | Raccord de forme | Liste cochée → liste sur vitre | Plein cadre texte | Provisoire (G10 recommandé) |
| 11 → OETH | Transformation graphique | Zone lumineuse de la vitre | Disque qui s’ouvre depuis le point lumineux | Réalisé |
| OETH → 12 | Décélération | Surface claire | Volet vertical + ralentissement | Réalisé |
