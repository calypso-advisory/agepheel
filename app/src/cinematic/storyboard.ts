/**
 * STORYBOARD — source unique de vérité de l'expérience.
 *
 * Tout ce qui se modifie sans toucher au moteur est ici : photos, textes, durées de scroll,
 * cadrages, recalages entre plans, étalonnage des raccords, statut de chaque séquence.
 *
 * Unités :
 *  - length : hauteurs d'écran de scroll
 *  - t      : progression locale du segment (0 → 1)
 *  - x, y   : centre du cadre dans la photo (0 → 1)
 *  - z      : zoom (1 = photo plein cadre) ; w/h : largeur/hauteur visibles souhaitées (fraction de la photo)
 *  - px     : translation latérale de caméra en fraction du cadre (parallaxe par profondeur)
 *  - push   : travelling avant (perspective) ; focus : profondeur du plan qui reste fixe
 */
import { deriveKey, regFromAnchor } from './camera'
import type { CamKey, Registration, SceneAsset, Segment } from './types'

// import.meta.env n'existe que sous Vite ; repli pour les scripts de génération de documentation
const base: string = import.meta.env?.BASE_URL ?? '/'

const scene = (n: number, alt: string): SceneAsset => {
  const id = `scene-${String(n).padStart(2, '0')}`
  return {
    id,
    src: `${base}media/scenes/${id}.webp`,
    srcSmall: `${base}media/scenes/${id}-960.webp`,
    depth: `${base}media/depth/${id}.webp`,
    width: 1672,
    height: 941,
    alt,
  }
}

export const SCENES: SceneAsset[] = [
  scene(1, "Réunion dans un bureau lumineux : une salariée en fauteuil roulant rit avec ses collègues penchés vers elle autour de la table."),
  scene(2, 'Plan rapproché : la salariée, stylo en main, explique un point à ses collègues qui l’écoutent en souriant.'),
  scene(3, 'Vue de côté : la salariée désigne du stylo un graphique affiché au mur ; l’équipe suit sa présentation.'),
  scene(4, 'Gros plan sur le graphique en barres croissantes que la salariée pointe avec son stylo.'),
  scene(5, 'Atelier : un salarié porteur de trisomie 21 réalise un assemblage technique au tournevis, entouré de deux collègues.'),
  scene(6, 'Zone logistique : le même salarié transmet un colis à un collègue pendant qu’une collègue scanne une référence.'),
  scene(7, 'Une salariée en fauteuil roulant échange une poignée de main avec un interlocuteur, ses collègues autour d’elle.'),
  scene(8, 'La salariée montre un écran du doigt à deux collègues penchés vers son poste.'),
  scene(9, 'Réunion de travail : la salariée prend la parole devant un écran présentant un plan de projet en quatre étapes.'),
  scene(10, 'Une salariée en fauteuil roulant présente un graphique de résultats à l’écran devant son équipe attentive.'),
  scene(11, 'La salariée coche une liste d’objectifs écrite sur une paroi vitrée, entourée de ses collègues.'),
  scene(12, 'La salariée travaille sur son ordinateur, entourée de collègues souriants.'),
]

/* ------------------------------------------------------------------ */
/* Recalages entre photos (calculés par appariement SIFT ou par ancre) */
/* ------------------------------------------------------------------ */

/** 02 → 01 : SIFT, 124 points cohérents. Le plan 02 est un rapproché exact du plan 01. */
const R02_01: Registration = { s: 0.729, rot: -0.24, tx: 201.7, ty: 145.4 }
/** 03 → 02 : ancre sur le visage de la salariée (SIFT trop faible : l'angle change réellement). */
const R03_02: Registration = regFromAnchor([0.505, 0.33], [0.57, 0.37], 1.12, 3)
/** 04 → 03 : SIFT, 36 points sur le tableau. Le gros plan 04 est exactement une partie du mur visible en 03. */
const R04_03: Registration = { s: 0.633, rot: -3.24, tx: 824.7, ty: 65.7 }
/** 06 → 05 : ancre sur la main de travail (raccord de geste). */
const R06_05: Registration = regFromAnchor([0.62, 0.68], [0.59, 0.7], 1.0, 0)

/* Couleurs de raccord (0..1) */
const BLUE_MATCH: [number, number, number] = [0.235, 0.365, 0.53] // entre la barre (#4D84B9) et le montant (#2C425F)
const KRAFT_MATCH: [number, number, number] = [0.66, 0.48, 0.38] // carton ↔ blazer beige
const DARK_MATCH: [number, number, number] = [0.08, 0.1, 0.13] // costume marine ↔ chemise olive

/* Points de jonction partagés entre plans */
const T01_B0: CamKey = { t: 0, x: 0.5, y: 0.5, z: 1.0, focus: 0.19 }
const T02_B0: CamKey = { t: 0, x: 0.555, y: 0.4, z: 1.3, roll: -3, px: -0.045, focus: 0.2 }
const T03_B0: CamKey = { t: 0, x: 0.56, y: 0.47, z: 2.2, focus: 0.45 }
const T05_B0: CamKey = { t: 0, x: 0.59, y: 0.7, z: 2.6, focus: 0.5 }

const at = (k: CamKey, t: number, extra: Partial<CamKey> = {}): CamKey => ({ ...k, ...extra, t })

const SEGMENTS: Segment[] = [
  /* ============================ ACTE I ============================ */
  {
    id: 's01',
    label: 'Plan 01 — Entrer dans la scène',
    length: 1.5,
    type: 'shot',
    status: 'réalisé',
    note: 'Travelling avant 2,5D : la carte de profondeur fait grossir les collaborateurs du premier plan plus vite que le fond.',
    act: 1,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-01',
        cam: [
          { t: 0, x: 0.5, y: 0.5, z: 1.0, push: 0, focus: 0.27 },
          { t: 0.25, x: 0.5, y: 0.5, z: 1.03, push: 0.03, focus: 0.27 },
          at(deriveKey(T01_B0, R02_01, 1), 1, { push: 0.22, focus: 0.27, ease: 'inOut' }),
        ],
      },
    ],
    texts: [
      { id: 't01', text: 'Dans chaque entreprise, il y a des talents.', in: 0.04, out: 0.7, pos: 'bottom-left', size: 'xl', as: 'h1' },
    ],
  },
  {
    id: 't01',
    label: 'Transition 01 → 02 — S’approcher',
    length: 0.8,
    type: 'cameraMove',
    status: 'provisoire',
    note: 'Le travelling continue ; au milieu du mouvement, la photo 02 (recalée au pixel sur 01) prend le relais. Les personnages ayant légèrement bougé entre les deux prises, un clip-pont supprimerait le léger dédoublement des mains.',
    act: 1,
    theme: 'dark',
    layers: [
      { scene: 'scene-01', derive: { layer: 1, reg: R02_01, par: [{ t: 0, x: 0, y: 0, push: 0.22, focus: 0.27 }, { t: 1, x: 0, y: 0, push: 0.32, focus: 0.27 }] } },
      {
        scene: 'scene-02',
        cam: [T01_B0, { t: 1, x: 0.515, y: 0.49, z: 1.07, push: 0.06, focus: 0.19 }],
        opacity: [
          { t: 0.3, v: 0 },
          { t: 0.62, v: 1 },
        ],
      },
    ],
  },
  {
    id: 's02',
    label: 'Plan 02 — Découvrir la collaboratrice',
    length: 1.2,
    type: 'shot',
    status: 'réalisé',
    act: 1,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-02',
        cam: [
          { t: 0, x: 0.515, y: 0.49, z: 1.07, push: 0.06, focus: 0.19 },
          { t: 0.5, x: 0.52, y: 0.47, z: 1.13, px: -0.02, push: 0.08, focus: 0.19 },
          at(deriveKey(T02_B0, R03_02, 1), 1, { px: 0, push: 0.04, focus: 0.19 }),
        ],
      },
    ],
    texts: [
      { id: 't02', text: 'Certains méritent simplement qu’on les regarde autrement.', short: 'Regardons autrement.', in: 0.1, out: 0.86, pos: 'bottom-left', size: 'l' },
    ],
  },
  {
    id: 't02',
    label: 'Transition 02 → 03 — Changement d’angle',
    length: 1.3,
    type: 'cameraMove',
    status: 'nécessite asset',
    note: 'Pseudo-orbite 2,5D (≈ 8°) : la caméra glisse latéralement en gardant la salariée fixe, le premier plan et le fond défilent en sens opposés, puis le plan 03 (autre angle réel) prend le relais recalé sur son visage. Une vraie orbite de 30 à 60° exige le clip-pont V02 (voir MEDIAS-MANQUANTS.md).',
    act: 1,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-02',
        motionBlur: 0.5,
        derive: { layer: 1, reg: R03_02, par: [{ t: 0, x: 0, y: 0, px: 0, push: 0.04, focus: 0.19 }, { t: 1, x: 0, y: 0, px: 0.05, push: 0.04, focus: 0.19 }] },
      },
      {
        scene: 'scene-03',
        motionBlur: 0.5,
        cam: [T02_B0, { t: 1, x: 0.585, y: 0.42, z: 1.18, roll: 0, px: 0, focus: 0.2 }],
        opacity: [
          { t: 0.32, v: 0 },
          { t: 0.62, v: 1 },
        ],
      },
    ],
  },
  {
    id: 's03',
    label: 'Plan 03 — La révélation des compétences',
    length: 1.5,
    type: 'shot',
    status: 'réalisé',
    act: 1,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-03',
        cam: [
          { t: 0, x: 0.585, mx: 0.57, y: 0.42, z: 1.18, roll: 0, px: 0, focus: 0.2 },
          { t: 0.45, x: 0.62, mx: 0.58, y: 0.42, z: 1.22, px: 0.02, focus: 0.2 },
          at(deriveKey(T03_B0, R04_03, 1), 1, { px: 0, focus: 0.2 }),
        ],
      },
    ],
    texts: [
      { id: 't03a', text: 'Le handicap ne définit pas un talent.', in: 0.06, out: 0.44, pos: 'bottom-left', size: 'l' },
      { id: 't03b', text: 'Ce sont ses compétences qui font la différence.', short: 'Ses compétences font la différence.', in: 0.5, out: 0.9, pos: 'bottom-left', size: 'xl' },
    ],
  },
  {
    id: 't03',
    label: 'Transition 03 → 04 — Le stylo guide la caméra',
    length: 0.9,
    type: 'cameraMove',
    status: 'provisoire',
    note: 'Travelling ciblé vers le tableau. Le gros plan 04 est recalé au pixel (SIFT, rotation −3,2°) sur la zone du mur visible en 03 : la caméra « arrive » dans le gros plan sans saut. Pendant le relais, la main et le stylo des deux prises se superposent brièvement : un insert vidéo (V03) le supprimerait.',
    act: 1,
    theme: 'dark',
    layers: [
      { scene: 'scene-03', derive: { layer: 1, reg: R04_03, par: [{ t: 0, x: 0, y: 0, focus: 0.2 }] } },
      {
        scene: 'scene-04',
        cam: [T03_B0, { t: 1, x: 0.55, y: 0.48, z: 2.05, focus: 0.45 }],
        opacity: [
          { t: 0.3, v: 0 },
          { t: 0.6, v: 1 },
        ],
      },
    ],
  },
  {
    id: 's04',
    label: 'Plan 04 — Le graphique devient un passage',
    length: 1.4,
    type: 'shot',
    status: 'réalisé',
    act: 1,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-04',
        cam: [
          { t: 0, x: 0.55, y: 0.48, z: 2.05, focus: 0.45 },
          { t: 0.45, x: 0.64, y: 0.43, z: 2.3, focus: 0.5 },
          { t: 1, x: 0.758, y: 0.37, w: 0.07, h: 0.34, focus: 0.62 },
        ],
      },
    ],
    texts: [
      { id: 't04a', text: 'Quand chacun apporte ses compétences…', in: 0.05, out: 0.44, pos: 'bottom-left', size: 'l' },
      { id: 't04b', text: 'C’est toute l’entreprise qui avance.', in: 0.48, out: 0.86, pos: 'bottom-left', size: 'xl' },
    ],
  },

  /* ================= TRANSITION SIGNATURE 04 → 05 ================= */
  {
    id: 't04',
    label: 'Transition 04 → 05 — Du graphique à l’atelier (signature)',
    length: 2.0,
    type: 'matchCut',
    status: 'réalisé',
    note: 'Match cut par occlusion : la barre « Juin » remplit le cadre, son bleu converge vers celui du montant d’étagère (même axe vertical, même position écran), la coupe a lieu pendant l’occlusion totale, puis la caméra recule le long du montant jusqu’au salarié. Limite : le montant est agrandi ×45 au départ (texture douce) ; le plan macro M04 améliorerait le grain du métal.',
    act: 2,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-04',
        cam: [
          { t: 0, x: 0.758, y: 0.37, w: 0.07, h: 0.34, focus: 0.62 },
          { t: 0.3, x: 0.7585, y: 0.37, w: 0.0165, h: 0.3, focus: 0.62, ease: 'in' },
          { t: 0.42, x: 0.7585, y: 0.37, w: 0.015, h: 0.28, focus: 0.62, ease: 'linear' },
        ],
        grade: [
          { t: 0.2, amount: 0, grain: 0, tint: BLUE_MATCH },
          { t: 0.34, amount: 1, grain: 0.045, tint: BLUE_MATCH },
        ],
      },
      {
        scene: 'scene-05',
        cam: [
          { t: 0.35, x: 0.9765, y: 0.3, w: 0.021, h: 0.3, focus: 0.7 },
          { t: 0.42, x: 0.9765, y: 0.3, w: 0.024, h: 0.3, focus: 0.7, ease: 'linear' },
          { t: 0.58, x: 0.965, y: 0.33, w: 0.11, h: 0.5, focus: 0.7, ease: 'out' },
          { t: 0.8, x: 0.84, y: 0.4, w: 0.4, px: -0.025, push: -0.08, focus: 0.4, ease: 'inOut' },
          { t: 1, x: 0.62, y: 0.45, z: 1.15, px: 0, push: 0, focus: 0.3, ease: 'out' },
        ],
        opacity: [
          { t: 0.355, v: 0, ease: 'linear' },
          { t: 0.4, v: 1, ease: 'linear' },
        ],
        grade: [
          { t: 0.4, amount: 1, grain: 0.045, tint: BLUE_MATCH },
          { t: 0.56, amount: 0, grain: 0, tint: BLUE_MATCH },
        ],
      },
    ],
  },
  /* ============================ ACTE II ============================ */
  {
    id: 's05',
    label: 'Plan 05 — Le savoir-faire',
    length: 1.3,
    type: 'shot',
    status: 'réalisé',
    note: 'Ordre de l’acte II inversé par rapport au prompt : seul l’atelier (05) possède le montant bleu vertical nécessaire au raccord signature ; la logistique (06) suit par raccord de geste.',
    act: 2,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-05',
        cam: [
          { t: 0, x: 0.62, y: 0.45, z: 1.15, focus: 0.3 },
          { t: 0.5, x: 0.6, y: 0.52, z: 1.3, px: 0.015, focus: 0.3 },
          at(deriveKey(T05_B0, R06_05, 1), 1, { px: 0, focus: 0.45 }),
        ],
      },
    ],
    texts: [
      { id: 't05a', text: 'Des compétences différentes.', in: 0.06, out: 0.42, pos: 'bottom-left', size: 'l' },
      { id: 't05b', text: 'Une même exigence de réussite.', in: 0.48, out: 0.86, pos: 'bottom-left', size: 'xl' },
    ],
  },
  {
    id: 't05',
    label: 'Transition 05 → 06 — Raccord de geste',
    length: 0.9,
    type: 'motionMatch',
    status: 'provisoire',
    note: 'La caméra suit la main au travail ; la main qui saisit le colis prend sa place, recalée sur la même position écran, avec flou de bougé. Un insert vidéo de 1,5 s (V05) rendrait le geste continu.',
    act: 2,
    theme: 'dark',
    layers: [
      { scene: 'scene-05', motionBlur: 1.0, derive: { layer: 1, reg: R06_05, par: [{ t: 0, x: 0, y: 0, focus: 0.45 }] } },
      {
        scene: 'scene-06',
        motionBlur: 1.0,
        cam: [T05_B0, { t: 1, x: 0.66, y: 0.6, z: 1.5, focus: 0.5 }],
        opacity: [
          { t: 0.42, v: 0 },
          { t: 0.56, v: 1 },
        ],
      },
    ],
  },
  {
    id: 's06',
    label: 'Plan 06 — Logistique',
    length: 1.3,
    type: 'shot',
    status: 'réalisé',
    act: 2,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-06',
        cam: [
          { t: 0, x: 0.66, y: 0.6, z: 1.5, focus: 0.5 },
          { t: 0.45, x: 0.63, y: 0.46, z: 1.2, px: -0.015, focus: 0.35 },
          { t: 1, x: 0.79, y: 0.72, w: 0.14, h: 0.2, px: 0, focus: 0.6 },
        ],
      },
    ],
    texts: [
      { id: 't06a', text: 'Chaque métier a ses talents.', in: 0.06, out: 0.42, pos: 'bottom-left', size: 'l' },
      { id: 't06b', text: 'Chaque talent a sa place.', in: 0.48, out: 0.84, pos: 'bottom-left', size: 'xl' },
    ],
  },
  {
    id: 't06',
    label: 'Transition 06 → 07 — Occlusion par objet',
    length: 1.0,
    type: 'objectOcclusion',
    status: 'provisoire',
    note: 'La caméra passe tout près du colis : le carton occupe le cadre, sa teinte rejoint celle du blazer beige du plan 07, d’où la caméra recule sur la poignée de main. Lecture : le colis passe de main en main, puis la main se tend. Fortement agrandi : un plan macro (M06) améliorerait la matière.',
    act: 2,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-06',
        cam: [
          { t: 0, x: 0.79, y: 0.72, w: 0.14, h: 0.2, focus: 0.6 },
          { t: 0.36, x: 0.8, y: 0.73, w: 0.045, h: 0.1, focus: 0.6, ease: 'in' },
        ],
        grade: [
          { t: 0.2, amount: 0, grain: 0, tint: KRAFT_MATCH },
          { t: 0.36, amount: 0.92, grain: 0.03, tint: KRAFT_MATCH },
        ],
      },
      {
        scene: 'scene-07',
        cam: [
          { t: 0.36, x: 0.3, y: 0.85, w: 0.05, h: 0.12, focus: 0.5 },
          { t: 1, x: 0.45, y: 0.52, z: 1.05, focus: 0.24, ease: 'out' },
        ],
        opacity: [
          { t: 0.36, v: 0, ease: 'linear' },
          { t: 0.41, v: 1, ease: 'linear' },
        ],
        grade: [
          { t: 0.41, amount: 0.92, grain: 0.03, tint: KRAFT_MATCH },
          { t: 0.58, amount: 0, grain: 0, tint: KRAFT_MATCH },
        ],
      },
    ],
  },
  {
    id: 's07',
    label: 'Plan 07 — Réussite collective',
    length: 1.2,
    type: 'shot',
    status: 'réalisé',
    act: 2,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-07',
        cam: [
          { t: 0, x: 0.45, y: 0.52, z: 1.05, focus: 0.24 },
          { t: 0.55, x: 0.5, y: 0.52, z: 1.12, px: 0.015, focus: 0.24 },
          { t: 1, x: 0.86, y: 0.58, w: 0.24, h: 0.4, px: 0, focus: 0.6 },
        ],
      },
    ],
    texts: [
      { id: 't07a', text: 'Rien ne se construit seul.', in: 0.06, out: 0.42, pos: 'bottom-left', size: 'l' },
      { id: 't07b', text: 'La réussite est collective.', in: 0.46, out: 0.82, pos: 'bottom-left', size: 'xl' },
    ],
  },

  /* ============================ ACTE III ============================ */
  {
    id: 't07',
    label: 'Transition 07 → 08 — Passage derrière un premier plan',
    length: 0.9,
    type: 'objectOcclusion',
    status: 'réalisé',
    note: 'Panoramique vers la droite : le costume marine du premier plan occulte le cadre ; on ressort de l’autre côté sur la chemise sombre du collègue du plan 08. Technique classique de coupe invisible.',
    act: 3,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-07',
        motionBlur: 0.8,
        cam: [
          { t: 0, x: 0.86, y: 0.58, w: 0.24, h: 0.4, focus: 0.6 },
          { t: 0.36, x: 0.925, y: 0.62, w: 0.07, h: 0.25, focus: 0.6, ease: 'in' },
        ],
        grade: [
          { t: 0.24, amount: 0, tint: DARK_MATCH },
          { t: 0.36, amount: 0.9, tint: DARK_MATCH },
        ],
      },
      {
        scene: 'scene-08',
        motionBlur: 0.8,
        cam: [
          { t: 0.36, x: 0.1, y: 0.62, w: 0.07, h: 0.25, focus: 0.5 },
          { t: 1, x: 0.45, y: 0.46, z: 1.1, focus: 0.2, ease: 'out' },
        ],
        opacity: [
          { t: 0.36, v: 0, ease: 'linear' },
          { t: 0.4, v: 1, ease: 'linear' },
        ],
        grade: [
          { t: 0.4, amount: 0.9, tint: DARK_MATCH },
          { t: 0.55, amount: 0, tint: DARK_MATCH },
        ],
      },
    ],
  },
  {
    id: 's08',
    label: 'Plan 08 — Accompagnement',
    length: 1.2,
    type: 'shot',
    status: 'réalisé',
    act: 3,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-08',
        cam: [
          { t: 0, x: 0.45, y: 0.46, z: 1.1, focus: 0.2 },
          { t: 0.55, x: 0.56, y: 0.45, z: 1.2, px: 0.015, focus: 0.2 },
          { t: 1, x: 0.6, y: 0.42, z: 1.8, px: 0, focus: 0.2 },
        ],
      },
    ],
    texts: [
      { id: 't08a', text: 'L’inclusion ne s’improvise pas.', in: 0.06, out: 0.42, pos: 'bottom-left', size: 'l' },
      { id: 't08b', text: 'Elle se construit, ensemble.', in: 0.48, out: 0.86, pos: 'bottom-left', size: 'xl' },
    ],
  },
  {
    id: 't08',
    label: 'Transition 08 → 09 — Suivre le geste',
    length: 0.8,
    type: 'whipPan',
    status: 'réalisé',
    note: 'Elle désigne l’écran : la caméra part en panoramique filé dans la direction du geste et se pose dans la réunion du plan 09. Coupe cachée dans le flou de bougé (technique de montage classique).',
    act: 3,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-08',
        motionBlur: 1.8,
        cam: [
          { t: 0, x: 0.6, y: 0.42, z: 1.8, focus: 0.2 },
          { t: 0.5, x: 0.76, y: 0.42, z: 1.85, focus: 0.2, ease: 'in' },
        ],
      },
      {
        scene: 'scene-09',
        motionBlur: 1.8,
        cam: [
          { t: 0.5, x: 0.2, y: 0.4, z: 1.85, focus: 0.22 },
          { t: 1, x: 0.42, y: 0.4, z: 1.3, focus: 0.22, ease: 'out' },
        ],
        opacity: [
          { t: 0.47, v: 0, ease: 'linear' },
          { t: 0.53, v: 1, ease: 'linear' },
        ],
      },
    ],
  },
  {
    id: 's09',
    label: 'Plan 09 — Plan d’action',
    length: 1.7,
    type: 'shot',
    status: 'réalisé',
    act: 3,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-09',
        cam: [
          { t: 0, x: 0.42, y: 0.4, z: 1.3, focus: 0.22 },
          { t: 0.3, x: 0.4, y: 0.42, z: 1.18, px: -0.025, focus: 0.22 },
          { t: 0.62, x: 0.46, y: 0.4, z: 1.2, px: 0.025, focus: 0.22 },
          { t: 1, x: 0.8, y: 0.245, w: 0.36, h: 0.4, px: 0, focus: 0.3 },
        ],
      },
    ],
    texts: [
      { id: 't09a', text: 'Identifier les besoins.', in: 0.04, out: 0.3, pos: 'bottom-left', size: 'l' },
      { id: 't09b', text: 'Construire les solutions.', in: 0.33, out: 0.58, pos: 'bottom-left', size: 'l' },
      { id: 't09c', text: 'Accompagner durablement.', in: 0.61, out: 0.86, pos: 'bottom-left', size: 'l' },
    ],
  },
  {
    id: 't09',
    label: 'Transition 09 → 10 — L’écran change de diapositive',
    length: 0.9,
    type: 'cameraMove',
    status: 'réalisé',
    note: 'La caméra entre dans l’écran de présentation ; quand il remplit le cadre, la diapositive suivante apparaît (raccord diégétique), puis la caméra recule dans la salle du plan 10.',
    act: 3,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-09',
        cam: [
          { t: 0, x: 0.8, y: 0.245, w: 0.36, h: 0.4, focus: 0.3 },
          { t: 0.55, x: 0.8, y: 0.25, w: 0.3, h: 0.34, focus: 0.3 },
        ],
      },
      {
        scene: 'scene-10',
        cam: [
          { t: 0.35, x: 0.837, y: 0.25, w: 0.26, h: 0.3, focus: 0.3 },
          { t: 1, x: 0.62, mx: 0.5, y: 0.45, z: 1.1, focus: 0.19, ease: 'inOut' },
        ],
        opacity: [
          { t: 0.36, v: 0 },
          { t: 0.54, v: 1 },
        ],
      },
    ],
  },
  {
    id: 's10',
    label: 'Plan 10 — Résultats concrets',
    length: 1.3,
    type: 'shot',
    status: 'réalisé',
    note: 'Nouvelle photographie fournie (protagoniste différente) : placée ici, où sa présentation de résultats sert le récit.',
    act: 3,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-10',
        cam: [
          { t: 0, x: 0.62, mx: 0.5, y: 0.45, z: 1.1, focus: 0.19 },
          { t: 0.55, x: 0.64, mx: 0.52, y: 0.42, z: 1.2, px: -0.015, focus: 0.19 },
          { t: 1, x: 0.59, y: 0.215, w: 0.18, h: 0.22, px: 0, focus: 0.3 },
        ],
      },
    ],
    texts: [
      { id: 't10a', text: 'Des engagements concrets.', in: 0.06, out: 0.42, pos: 'bottom-left', size: 'l' },
      { id: 't10b', text: 'Des résultats qui comptent.', in: 0.48, out: 0.84, pos: 'bottom-left', size: 'xl' },
    ],
  },
  {
    id: 't10',
    label: 'Transition 10 → 11 — De la liste au mur vitré',
    length: 0.9,
    type: 'cameraMove',
    status: 'provisoire',
    note: 'Raccord de forme : la liste à cocher du tableau blanc devient la liste cochée sur la paroi vitrée. Les deux listes n’ont pas la même mise en page ; un insert graphique (G10) rendrait le raccord exact.',
    act: 3,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-10',
        cam: [
          { t: 0, x: 0.59, y: 0.215, w: 0.18, h: 0.22, focus: 0.3 },
          { t: 0.55, x: 0.59, y: 0.21, w: 0.14, h: 0.17, focus: 0.3 },
        ],
      },
      {
        scene: 'scene-11',
        cam: [
          { t: 0.35, x: 0.84, y: 0.3, w: 0.26, h: 0.5, focus: 0.3 },
          { t: 1, x: 0.55, mx: 0.36, y: 0.45, z: 1.1, focus: 0.22, ease: 'inOut' },
        ],
        opacity: [
          { t: 0.36, v: 0 },
          { t: 0.56, v: 1 },
        ],
      },
    ],
  },
  {
    id: 's11',
    label: 'Plan 11 — Mesurer les progrès',
    length: 1.1,
    type: 'shot',
    status: 'réalisé',
    act: 3,
    theme: 'dark',
    layers: [
      {
        scene: 'scene-11',
        cam: [
          { t: 0, x: 0.55, mx: 0.36, y: 0.45, z: 1.1, focus: 0.22 },
          { t: 0.6, x: 0.5, mx: 0.34, y: 0.45, z: 1.16, px: 0.015, focus: 0.22 },
          { t: 1, x: 0.8, y: 0.62, z: 1.6, px: 0, focus: 0.3 },
        ],
      },
    ],
    texts: [
      { id: 't11', text: 'Chaque action fait avancer l’entreprise.', in: 0.08, out: 0.74, pos: 'bottom-left', size: 'xl' },
    ],
  },

  /* ======================= ACTE IV — AGIR ======================= */
  {
    id: 't11',
    label: 'Transition 11 → OETH — Du photographique au graphique',
    length: 0.9,
    type: 'graphicTransformation',
    status: 'réalisé',
    note: 'La caméra avance vers la zone lumineuse de la paroi vitrée ; une surface claire s’ouvre depuis ce point et remplace la photo. Changement de registre assumé.',
    act: 4,
    theme: 'dark',
    paperMode: 'circle',
    layers: [
      {
        scene: 'scene-11',
        cam: [
          { t: 0, x: 0.8, y: 0.62, z: 1.6, focus: 0.3 },
          { t: 1, x: 0.86, y: 0.72, z: 2.6, focus: 0.3, ease: 'in' },
        ],
      },
    ],
    overlays: { paper: [{ t: 0.25, v: 0 }, { t: 1, v: 1, ease: 'in' }] },
  },
  {
    id: 'oeth',
    label: 'Séquence OETH — 20 / 6 % / la question',
    length: 3.0,
    type: 'graphicTransformation',
    status: 'réalisé',
    note: 'Composition typographique sur fond clair. Chiffres à faire valider juridiquement avant publication.',
    act: 4,
    theme: 'light',
    paperMode: 'circle',
    layers: [{ scene: 'scene-11', cam: [{ t: 0, x: 0.86, y: 0.72, z: 2.6 }], opacity: [{ t: 0, v: 0 }] }],
    overlays: {
      paper: [{ t: 0, v: 1 }],
      'oeth-1': [
        { t: 0.02, v: 0 },
        { t: 0.1, v: 1 },
        { t: 0.26, v: 1 },
        { t: 0.33, v: 0 },
      ],
      'oeth-2': [
        { t: 0.35, v: 0 },
        { t: 0.43, v: 1 },
        { t: 0.6, v: 1 },
        { t: 0.67, v: 0 },
      ],
      'oeth-3': [
        { t: 0.69, v: 0 },
        { t: 0.78, v: 1 },
        { t: 1, v: 1 },
      ],
    },
  },
  {
    id: 't12',
    label: 'Transition OETH → 12 — Décélération',
    length: 0.9,
    type: 'cameraMove',
    status: 'réalisé',
    note: 'La surface graphique se retire vers le haut et découvre la dernière scène pendant que la caméra ralentit.',
    act: 4,
    theme: 'light',
    paperMode: 'wipe',
    layers: [
      {
        scene: 'scene-12',
        cam: [
          { t: 0, x: 0.46, y: 0.5, z: 1.3, push: 0.12, focus: 0.11 },
          { t: 1, x: 0.42, y: 0.5, z: 1.12, push: 0.03, focus: 0.11, ease: 'out' },
        ],
      },
    ],
    overlays: {
      paper: [{ t: 0, v: 1 }, { t: 0.85, v: 0, ease: 'inOut' }],
      'oeth-3': [{ t: 0, v: 1 }, { t: 0.3, v: 0 }],
    },
  },
  {
    id: 's12',
    label: 'Plan 12 — Conclusion et conversion',
    length: 1.3,
    type: 'shot',
    status: 'réalisé',
    note: 'Le texte et le bouton incrustés dans la photo d’origine ont été retirés (inpainting) puis reconstruits en HTML.',
    act: 4,
    theme: 'light',
    layers: [
      {
        scene: 'scene-12',
        cam: [
          { t: 0, x: 0.42, y: 0.5, z: 1.12, push: 0.03, focus: 0.11 },
          { t: 1, x: 0.4, y: 0.5, z: 1.05, push: 0, focus: 0.11, ease: 'out' },
        ],
      },
    ],
    overlays: { cta: [{ t: 0.02, v: 0 }, { t: 0.3, v: 1, ease: 'out' }, { t: 1, v: 1 }] },
  },
]

/**
 * Rythme global : multiplie toutes les durées de scroll. 1 = rythme « contemplatif » (≈ 31 écrans),
 * 0,7 = rythme retenu (≈ 22 écrans). Ajuster ici plutôt que segment par segment.
 */
export const SCROLL_SCALE = 0.7

export const STORYBOARD: Segment[] = SEGMENTS.map((s) => ({ ...s, length: +(s.length * SCROLL_SCALE).toFixed(3) }))

export const ACTS: { act: 1 | 2 | 3 | 4; label: string }[] = [
  { act: 1, label: 'Changer de regard' },
  { act: 2, label: 'Tous les métiers' },
  { act: 3, label: 'Une démarche' },
  { act: 4, label: 'Agir' },
]

export const TOTAL_LENGTH = STORYBOARD.reduce((s, x) => s + x.length, 0)
