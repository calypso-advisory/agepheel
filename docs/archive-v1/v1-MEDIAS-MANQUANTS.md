# Médias manquants

Classés par impact. Chaque clip doit respecter : identité des personnes, vêtements, mobilier, lumière et axe des photos de référence ; aucun visage qui change, aucune main déformée, aucune matière qui mute, aucun mouvement de caméra contradictoire. Format conseillé : 1920 × 1080 minimum (2560 × 1440 idéal), 24–30 i/s, plan unique sans coupe. Les clips sont ensuite convertis en séquence d’images (`tools/extract-frames.sh`) et pilotés image par image par le scroll.

Outils adaptés : générateurs vidéo acceptant **une image de début et une image de fin** (keyframes), par exemple Runway, Kling ou Luma. Fournir les photos d’origine, pas des captures.

---

## V02 — Orbite autour de la salariée (02 → 03) — priorité 1

L’effet phare du concept « Changeons de regard ». Aujourd’hui simulé à ≈ 8° : une vraie orbite exige des vues que la photo ne contient pas.

- Image de début : `scene-02` · image de fin : `scene-03`
- Durée : 3 s · mouvement : arc de caméra de 35 à 45° autour de la salariée, de face vers son profil gauche, hauteur constante (yeux d’une personne assise)
- Contraintes : même cardigan lavande, mêmes lunettes, même fauteuil ; les collègues gardent leur position ; la table et le mobilier doivent être cohérents entre les deux extrémités

Prompt (EN) :
> Smooth cinematic orbit shot. The camera arcs 40 degrees to the right around a smiling young woman in a wheelchair wearing a lavender cardigan and glasses, seated at an office table, holding a pen. She keeps talking with her colleagues, natural small gestures. Constant eye-level height, slow steady speed, no cuts, no zoom. Bright modern office with large windows, soft daylight, shallow depth of field. Photorealistic documentary style. Keep every person's face, clothing and position consistent with the start and end frames.

## M04 — Macro du montant d’étagère (raccord signature 04 → 05) — priorité 1

Le raccord fonctionne, mais le montant est agrandi ×45 au moment de la coupe : la texture du métal est floue.

- Une photo fixe, 2560 × 1440 : montant d’étagère métallique bleu marine (#2C425F), perforé, vertical, centré, remplissant 60 à 80 % de la largeur, même lumière froide que `scene-05`
- Intégration : calque intermédiaire entre la barre et `scene-05` (fondu impossible à percevoir pendant l’occlusion)

Prompt (EN) :
> Extreme close-up of a vertical navy blue painted steel shelving upright with a column of rectangular perforations, filling most of the frame, in an industrial assembly workshop. Cool overhead fluorescent light, slight paint texture and scratches, out-of-focus workshop background visible at the far edges. Photorealistic, sharp, straight vertical alignment.

Variante vidéo (meilleure) — V04, 2,5 s, image de fin `scene-05` : travelling arrière depuis ce macro jusqu’au cadre de `scene-05`, glissement vers la gauche.

## V05 — Raccord de geste atelier → logistique (05 → 06) — priorité 2

- Image de début : `scene-05` recadrée sur les mains (tournevis) · image de fin : `scene-06` recadrée sur les mains (colis)
- Durée : 1,5 s · mouvement : la caméra suit la main droite qui pose l’outil et se tend vers un colis ; panoramique latéral vers la droite
- Contraintes : même gilet gris, même manche bleu marine

Prompt (EN) :
> Close tracking shot of a young man's hands in a navy work jacket putting down a screwdriver on a workbench and reaching to the right to receive a cardboard box from a colleague. Camera pans right following the hand at the same height. Bright workshop, natural movement, photorealistic, no cuts.

## V03 — Insert stylo vers le graphique (03 → 04) — priorité 2

- Image de début : `scene-03` cadré sur le stylo · image de fin : `scene-04`
- Durée : 1,5 s · travelling avant ciblé le long du bras jusqu’au graphique ; supprime la superposition des deux mains

## M06 — Macro carton et macro blazer (06 → 07) — priorité 3

Deux photos fixes 2560 × 1440 : surface de carton kraft plein cadre (lumière de `scene-06`), tissu de blazer beige plein cadre (lumière de `scene-07`). Améliorent la matière pendant l’occlusion.

## G10 — Insert graphique de la liste (10 → 11) — priorité 3

Liste « Recrutement / Intégration / Formation / Évolution » recomposée en graphisme (même écriture, même alignement que la liste de `scene-11`) pour un raccord de forme exact.

## V01 — Clip-pont du travelling avant (01 → 02) — optionnel

Image de début `scene-01`, image de fin `scene-02`, 2 s de travelling avant entre les collègues. Supprime le léger dédoublement actuel.

## HR — Photos en haute définition — priorité 1

Les 12 photos font 1672 px de large. Pour un rendu net sur écrans 1920 px, 2560 px et Retina, et pour les gros plans de raccord, fournir les mêmes images en **2560 × 1440 au minimum** (idéalement les fichiers natifs du générateur ou un agrandissement IA soigné). Remplacement direct : mêmes noms, mêmes cadrages (voir README).

## Option mobile

Les cadrages portrait sont calculés automatiquement (centre de remplacement `mx` par plan). Des versions verticales natives (1080 × 1920) des plans 01, 03, 05 et 12 amélioreraient la composition sur téléphone.
