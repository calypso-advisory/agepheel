/**
 * Types du moteur cinématographique.
 * Toutes les coordonnées d'image sont normalisées (u, v) dans [0, 1],
 * origine en haut à gauche de la photographie source.
 */

export type EaseName = 'linear' | 'in' | 'out' | 'inOut' | 'expoIn' | 'expoOut' | 'expoInOut'

export interface SceneAsset {
  id: string
  /** photographie pleine résolution (WebP) */
  src: string
  /** version 960 px pour les vignettes et le parcours éditorial */
  srcSmall: string
  /** carte de profondeur (1 = proche, 0 = lointain) */
  depth: string
  width: number
  height: number
  alt: string
  /** séquence d'images (clip-pont) optionnelle : si présente, remplace la photo */
  frames?: string[]
}

/**
 * Caméra virtuelle.
 * - x, y : centre du cadre dans l'image
 * - z    : zoom (1 = l'image couvre exactement le viewport)
 * - w    : alternative à z : largeur visible souhaitée en fraction de l'image
 * - roll : roulis en degrés
 * - px/py: translation latérale de la caméra (parallaxe par profondeur)
 * - push : travelling avant (perspective) : les plans proches grossissent plus vite que le fond
 * - focus: profondeur du plan qui reste fixe (0..1)
 */
export interface Cam {
  x: number
  y: number
  /** centre horizontal de remplacement pour les écrans en portrait (mobile) */
  mx?: number
  z?: number
  w?: number
  /** avec w : hauteur visible maximale (fraction d'image) ; le zoom retenu satisfait les deux */
  h?: number
  roll?: number
  px?: number
  py?: number
  push?: number
  focus?: number
}

export interface CamKey extends Cam {
  t: number
  ease?: EaseName
}

export interface NumKey {
  t: number
  v: number
  ease?: EaseName
}

export interface Grade {
  /** couleur cible (0..1) */
  tint: [number, number, number]
  /** mélange vers la teinte (0..1) */
  amount: number
  /** grain procédural (0..0.2) */
  grain: number
}

export interface GradeKey extends Partial<Grade> {
  t: number
  ease?: EaseName
}

/**
 * Recalage géométrique entre deux photos : transformation de similitude
 * qui envoie un pixel de l'image B dans l'image A.
 */
export interface Registration {
  s: number
  rot: number // degrés
  tx: number // pixels de A
  ty: number
}

export interface LayerSpec {
  scene: string
  cam?: CamKey[]
  /** caméra calculée depuis celle d'un autre calque via un recalage (alignement exact) */
  derive?: { layer: number; reg: Registration; par?: CamKey[] }
  opacity?: NumKey[]
  grade?: GradeKey[]
  /** flou de bougé directionnel automatique (dérivé de la vitesse caméra) */
  motionBlur?: number
  /** pour une scène « frames » (clip-pont) : position dans le clip (0 → 1) pilotée par le scroll */
  frame?: NumKey[]
}

export type TextPos = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center-left' | 'center'

export interface TextSpec {
  id: string
  text: string
  /** version courte pour mobile */
  short?: string
  in: number
  out: number
  pos: TextPos
  size: 'xl' | 'l' | 'm'
  /** rendu sémantique (h1 pour le premier temps fort) */
  as?: 'h1' | 'p'
  tone?: 'light' | 'dark'
}

export type OverlayId = 'paper' | 'oeth-1' | 'oeth-2' | 'oeth-3' | 'cta'

export type TransitionType =
  | 'shot'
  | 'cameraMove'
  | 'matchCut'
  | 'objectOcclusion'
  | 'motionMatch'
  | 'whipPan'
  | 'videoBridge'
  | 'graphicTransformation'

export type Status = 'réalisé' | 'provisoire' | 'nécessite asset'

export interface Segment {
  id: string
  /** libellé lisible (storyboard technique) */
  label: string
  /** durée en hauteurs d'écran de scroll */
  length: number
  type: TransitionType
  status: Status
  note?: string
  act: 1 | 2 | 3 | 4
  theme: 'dark' | 'light'
  layers: LayerSpec[]
  texts?: TextSpec[]
  overlays?: Partial<Record<OverlayId, NumKey[]>>
  /** forme de la surface graphique : disque qui s'ouvre depuis un point lumineux, ou volet vertical */
  paperMode?: 'circle' | 'wipe'
}

export interface EvaluatedCam {
  cx: number
  cy: number
  z: number
  roll: number
  px: number
  py: number
  push: number
  focus: number
}
