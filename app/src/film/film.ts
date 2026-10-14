/**
 * Moteur du film : fonction pure progression → état, puis écriture DOM/canvas.
 *
 * Le cadre vidéo est un masque (div, overflow hidden) dont on anime la position et la taille
 * par transform ; la toile (canvas) à l'intérieur reçoit la transformation inverse puis se place
 * dans un « rectangle de contenu » C. Deux usages :
 *  - C = scène entière : l'image reste immobile, seul le cadre s'ouvre (fenêtre, fente) ;
 *  - C = cadre : l'image se réduit avec le cadre (le plein écran devient une carte).
 */
import { BEATS, PACE, TEXTS, type BeatId } from './storyboard'

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface Layout {
  W: number
  H: number
  land: boolean
  S: Rect
  card: Rect
  col: Rect
  G: number
}

export interface ClipRef {
  id: string
  t: number
}

export interface FilmState {
  beat: BeatId
  act: number
  /** clip principal */
  clip: ClipRef
  /** second clip révélé par un volet vertical dans le cadre (coupe franche assumée) */
  clipB?: ClipRef & { wipe: number }
  frame: { R: Rect; C: Rect; opacity: number; fill: number }
  paper: number
  scrim: number
  texts: Record<string, number>
  chart: { draw: number; opacity: number }
  oeth: { s1: number; s2: number; s3: number; people: number; dots: number }
  cta: number
  hint: number
  /** invitation « continuez à faire défiler » (portrait), sur les plans sans texte */
  cue: number
  /** écran partagé : plusieurs clips, chacun dans son panneau (coordonnées de la scène) */
  panels?: (ClipRef & { r: Rect; fy?: number })[]
  /** lettres découpées : échelle du calque papier percé par le mot, opacité */
  knock: { scale: number; opacity: number }
  /** iris : cercle (coordonnées de la scène) hors duquel l'image est remplacée par le papier */
  iris?: { x: number; y: number; r: number }
  /** bloc d'accueil (titre, phrase, bouton) */
  hero: number
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const seg = (u: number, a: number, b: number) => clamp((u - a) / (b - a))
const io = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const out = (t: number) => 1 - Math.pow(1 - t, 3)
const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
})
/** apparition / disparition d'un texte */
const txt = (u: number, a: number, b: number, c = 2, d = 3) => out(seg(u, a, b)) * (1 - seg(u, c, d))

export function computeLayout(W: number, H: number): Layout {
  const G = clamp(W * 0.04, 16, 56)
  const NAV = 72
  const land = W / H >= 1
  const S = { x: 0, y: 0, w: W, h: H }
  if (land) {
    const colW = clamp(W * 0.34, 260, 540)
    const cx = G + colW + G
    const card = { x: cx, y: NAV + 12, w: W - cx - G, h: H - NAV - 12 - G }
    return { W, H, land, S, card, col: { x: G, y: NAV + 12, w: colW, h: card.h }, G }
  }
  const card = { x: G, y: NAV + 6, w: W - 2 * G, h: Math.round((H - NAV) * 0.58) }
  const cy = card.y + card.h + 20
  return { W, H, land, S, card, col: { x: G, y: cy, w: W - 2 * G, h: H - cy - G }, G }
}

/** Longueurs cumulées des temps (en hauteurs d'écran). */
export const BEAT_LEN = BEATS.map((b) => b.len * PACE)
export const TOTAL = BEAT_LEN.reduce((a, b) => a + b, 0)

/** progression globale (0 → 1) d'un point (temps, progression locale) */
export function beatPoint(id: BeatId, u: number) {
  let acc = 0
  for (let i = 0; i < BEATS.length; i++) {
    if (BEATS[i].id === id) return Math.min(1, (acc + u * BEAT_LEN[i]) / TOTAL)
    acc += BEAT_LEN[i]
  }
  return 0
}

export function beatStart(id: BeatId) {
  let acc = 0
  for (let i = 0; i < BEATS.length; i++) {
    if (BEATS[i].id === id) return acc / TOTAL
    acc += BEAT_LEN[i]
  }
  return 0
}

/** Rectangle de la barre « Engagement » du graphique HTML (doit correspondre au CSS de .chart). */
export function chartBarRect(L: Layout, draw: number): Rect {
  // le graphique occupe la carte en paysage, la zone haute en portrait
  const box = L.land ? L.card : L.card
  const n = 5
  const pad = box.w * 0.08
  const gap = box.w * 0.035
  const bw = (box.w - 2 * pad - gap * (n - 1)) / n
  const base = box.y + box.h * 0.86
  const maxH = box.h * 0.7
  const h = maxH * draw
  return { x: box.x + pad + (n - 1) * (bw + gap), y: base - h, w: bw, h }
}

export function evaluate(p: number, L: Layout): FilmState {
  const { S, card } = L
  let acc = 0
  let bi = BEATS.length - 1
  let u = 1
  for (let i = 0; i < BEATS.length; i++) {
    const a = acc / TOTAL
    const b = (acc + BEAT_LEN[i]) / TOTAL
    if (p < b || i === BEATS.length - 1) {
      bi = i
      u = seg(p, a, b)
      break
    }
    acc += BEAT_LEN[i]
  }
  const beat = BEATS[bi].id
  const st: FilmState = {
    beat,
    act: BEATS[bi].act,
    clip: { id: 'c00', t: 0 },
    frame: { R: S, C: S, opacity: 1, fill: 0 },
    paper: 0,
    scrim: 0,
    texts: {},
    chart: { draw: 0, opacity: 0 },
    oeth: { s1: 0, s2: 0, s3: 0, people: 0, dots: 0 },
    cta: 0,
    hint: 0,
    cue: 0,
    hero: 0,
    knock: { scale: 1, opacity: 0 },
  }
  for (const t of TEXTS) st.texts[t.id] = 0
  const full = (id: string, t: number) => {
    st.clip = { id, t }
    st.frame = { R: S, C: S, opacity: 1, fill: 0 }
  }
  switch (beat) {
    case 'open': {
      // plan d'équipe immobile à l'arrivée, avec titre, phrase et bouton ; puis la caméra plonge jusque dans ses yeux
      full('c00', seg(u, 0.1, 1))
      st.hero = 1 - seg(u, 0.03, 0.16)
      st.scrim = 1 - seg(u, 0.12, 0.3)
      st.hint = 1 - seg(u, 0.01, 0.06)
      break
    }
    case 'reveal': {
      full('c01', u)
      // plan sans texte : sur téléphone, on invite à continuer
      if (!L.land) st.cue = txt(u, 0.04, 0.14, 0.86, 0.98)
      break
    }
    case 'orbit': {
      full('c02', u)
      st.texts.regard = txt(u, 0.12, 0.26, 0.78, 0.92)
      st.scrim = 1
      break
    }
    case 'screen': {
      full('c03', seg(u, 0, 0.92))
      // dans la salle, la phrase est posée sur l'image ; quand l'écran remplit le cadre, elle s'y affiche comme sa diapositive
      if (L.land) {
        st.texts.def = txt(u, 0.06, 0.18, 0.4, 0.5)
        st.texts.slide = out(seg(u, 0.48, 0.66))
        st.scrim = 1 - seg(u, 0.42, 0.6)
      } else {
        // en portrait, l'écran remplit vite le cadre : la phrase s'y affiche directement, en encre sombre
        st.texts.slide = out(seg(u, 0.4, 0.6))
        st.scrim = 1 - seg(u, 0.1, 0.3)
      }
      break
    }
    case 'chart': {
      // l'écran blanc plein cadre devient la page : le graphique se dessine dessus
      full('c03', 1)
      st.paper = seg(u, 0, 0.08)
      st.frame.opacity = 1 - seg(u, 0.02, 0.1)
      // la diapositive cède la place au graphique, qui commence à se dessiner aussitôt
      st.texts.slide = 1 - seg(u, 0.07, 0.13)
      const draw = io(seg(u, 0.04, 0.36))
      st.chart = { draw, opacity: 1 - seg(u, 0.72, 0.86) }
      st.texts.comp = txt(u, 0.13, 0.2, 0.36, 0.43)
      st.texts.avance = txt(u, 0.44, 0.52, 0.64, 0.7)
      // la barre « Engagement » devient une fenêtre sur l'atelier
      const grow = io(seg(u, 0.7, 0.99))
      if (u > 0.68) {
        const bar = chartBarRect(L, draw)
        st.clip = { id: 'p1', t: 0 }
        st.frame = { R: lerpRect(bar, S, grow), C: S, opacity: 1, fill: 1 - seg(u, 0.74, 0.88) }
        st.paper = 1 - seg(u, 0.92, 1)
      }
      break
    }
    case 'arm': {
      // plan large, puis insert (coupe sèche) sur la main bionique et le tournevis rouge…
      // le clip contient un fondu entre 2,0 et 2,5 s : on le saute pour en faire une vraie coupe
      full('p1', u < 0.46 ? 0.4 * seg(u, 0, 0.46) : 0.52 + 0.48 * seg(u, 0.46, 0.94))
      st.texts.diff = txt(u, 0.08, 0.18, 0.36, 0.44)
      st.texts.exig = txt(u, 0.54, 0.64, 0.82, 0.9)
      st.scrim = 1 - seg(u, 0.86, 0.96)
      break
    }
    case 'hands': {
      // … raccord dans l'axe : même cadre, même tournevis, une autre main (coupe franche)
      full('c04', u)
      st.texts.metier = txt(u, 0.4, 0.52, 0.86, 0.98)
      st.scrim = seg(u, 0.3, 0.42)
      break
    }
    case 'logi': {
      full('c05', u)
      st.texts.place = txt(u, 0.6, 0.72, 0.9, 1)
      st.scrim = 1
      break
    }
    case 'florist': {
      // glissé : l'entrepôt sort par la gauche, la boutique entre par la droite (comme un panoramique filé)
      const k = io(seg(u, 0, 0.2))
      st.clip = { id: 'f1', t: seg(u, 0.12, 1) }
      if (k < 1) {
        const dx = L.land ? S.w : 0
        const dy = L.land ? 0 : S.h
        st.panels = [
          { id: 'c05', t: 1, r: { x: -k * dx, y: -k * dy, w: S.w, h: S.h } },
          { id: 'f1', t: 0, r: { x: (1 - k) * dx, y: (1 - k) * dy, w: S.w, h: S.h } },
        ]
      }
      st.texts.signe = txt(u, 0.3, 0.42, 0.72, 0.84)
      st.scrim = seg(u, 0.2, 0.3) * (1 - seg(u, 0.84, 0.95))
      break
    }
    case 'split': {
      // écran partagé : le plan se range à gauche, le magasin et le bureau entrent ; puis le bureau prend tout l'écran
      st.clip = { id: 'f1', t: 1 }
      st.frame = { R: S, C: S, opacity: 1, fill: 0 }
      const g = Math.max(4, Math.round(L.G / 4))
      const n = 3
      const slot = (i: number): Rect =>
        L.land
          ? { x: (i * (S.w + g)) / n, y: 0, w: (S.w - (n - 1) * g) / n, h: S.h }
          : { x: 0, y: (i * (S.h + g)) / n, w: S.w, h: (S.h - (n - 1) * g) / n }
      const open = io(seg(u, 0, 0.28))
      const grow = io(seg(u, 0.72, 0.98))
      const off = (i: number): Rect => {
        // panneaux entrants : glissent depuis le bord (droite en paysage, bas en portrait)
        const r = slot(i)
        const d = L.land ? S.w - r.x : S.h - r.y
        return L.land ? { ...r, x: r.x + d } : { ...r, y: r.y + d }
      }
      const out = (i: number): Rect => {
        // à l'agrandissement, les autres panneaux sortent par le bord opposé
        const r = slot(i)
        return L.land ? { ...r, x: r.x - S.w } : { ...r, y: r.y - S.h }
      }
      let p0 = lerpRect(S, slot(0), open)
      let p1 = lerpRect(off(1), slot(1), io(seg(u, 0.02, 0.28)))
      let p2 = lerpRect(off(2), slot(2), io(seg(u, 0.05, 0.31)))
      if (grow > 0) {
        p0 = lerpRect(slot(0), out(0), grow)
        p1 = lerpRect(slot(1), out(1), grow)
        p2 = lerpRect(slot(2), S, grow)
      }
      st.panels = [
        // fy : en bandes horizontales (portrait), hauteur du cadrage pour garder les visages
        { id: 'f1', t: 1, r: p0, fy: 0.22 },
        { id: 'r1', t: seg(u, 0.1, 0.9), r: p1, fy: 0.3 },
        { id: 'o1', t: 0, r: p2, fy: 0.24 },
      ]
      st.texts.seul = txt(u, 0.3, 0.4, 0.5, 0.56)
      st.texts.coll = txt(u, 0.56, 0.64, 0.74, 0.8)
      st.scrim = seg(u, 0.24, 0.34) * (1 - seg(u, 0.78, 0.86))
      break
    }
    case 'office': {
      // la caméra glisse derrière un pilier : la coupe vers la réunion voisine est cachée par le premier plan
      full('o1', u)
      st.texts.impro = txt(u, 0.08, 0.2, 0.38, 0.46)
      st.scrim = 1 - seg(u, 0.4, 0.5)
      break
    }
    case 'desk': {
      full('c06', u)
      st.texts.ensemble = txt(u, 0.2, 0.32, 0.86, 0.98)
      st.scrim = 1
      break
    }
    case 'crane': {
      full('c07', seg(u, 0, 0.55))
      st.texts.id = txt(u, 0.28, 0.38, 0.5, 0.56)
      st.texts.build = txt(u, 0.56, 0.64, 0.74, 0.8)
      st.texts.acc = txt(u, 0.8, 0.88, 0.97, 1)
      st.scrim = 0.6 * seg(u, 0.25, 0.35)
      break
    }
    case 'results': {
      // plan de liaison : la caméra redescend de la vue du dessus jusqu'à la paroi vitrée
      // on saute le début immobile du clip ; la plante passe devant l'objectif vers u ≈ 0,35–0,5
      full('c07b', 0.2 + 0.8 * u)
      st.texts.engag = txt(u, 0.04, 0.14, 0.26, 0.33)
      st.texts.res = txt(u, 0.58, 0.68, 0.9, 1)
      st.scrim = 1
      break
    }
    case 'glass': {
      full('c08', u)
      st.texts.action = txt(u, 0.12, 0.26, 0.8, 0.94)
      st.scrim = 1
      break
    }
    case 'oeth': {
      // le film se range dans la moitié droite (le haut en portrait) ; à chaque chiffre, une autre personne, un autre métier
      if (!L.land) {
        // portrait : l'image reste plein écran, teintée de bleu nuit, et les chiffres s'écrivent dessus en blanc
        st.paper = 0
        st.clip = u < 0.44 ? { id: 'c08', t: 1 } : u < 0.74 ? { id: 'p1', t: 0.2 } : { id: 'c02', t: 1 }
        st.frame = { R: S, C: S, opacity: 1 - seg(u, 0.95, 1), fill: 0.74 * io(seg(u, 0, 0.12)) }
        st.oeth.s1 = txt(u, 0.1, 0.19, 0.38, 0.44)
        st.oeth.people = seg(u, 0.14, 0.33)
        st.oeth.s2 = txt(u, 0.44, 0.52, 0.68, 0.74)
        st.oeth.dots = seg(u, 0.48, 0.64)
        st.oeth.s3 = txt(u, 0.75, 0.83, 0.94, 1)
        break
      }
      st.paper = 1
      const away = io(seg(u, 0, 0.13))
      const band: Rect = L.land ? card : { x: L.G, y: card.y, w: L.W - 2 * L.G, h: Math.round((L.H - card.y) * 0.3) }
      const R = lerpRect(S, band, away)
      st.frame = { R, C: R, opacity: 1, fill: 0 }
      st.clip = u < 0.44 ? { id: 'c08', t: 1 } : u < 0.74 ? { id: 'p1', t: 0.2 } : { id: 'c02', t: 1 }
      st.oeth.s1 = txt(u, 0.11, 0.2, 0.38, 0.44)
      st.oeth.people = seg(u, 0.15, 0.34)
      st.oeth.s2 = txt(u, 0.44, 0.52, 0.68, 0.74)
      st.oeth.dots = seg(u, 0.48, 0.64)
      st.oeth.s3 = txt(u, 0.75, 0.83, 0.94, 1)
      // la vignette s'efface juste avant le mot géant
      st.frame.opacity = 1 - seg(u, 0.94, 1)
      break
    }
    case 'word': {
      // lettres découpées : le mot géant laisse voir le dernier plan ; il grandit jusqu'à ce que l'image remplisse l'écran
      full('c09', 0)
      st.paper = 1 - seg(u, 0.86, 0.96)
      const k = Math.pow(seg(u, 0.28, 0.66), 2.4)
      // le calque papier reste opaque ; c'est l'image qui apparaît dans les lettres, puis le calque s'efface quand il a tout ouvert
      st.knock = { scale: k, opacity: 1 - seg(u, 0.44, 0.58) }
      st.frame.opacity = out(seg(u, 0, 0.18))
      break
    }
    case 'eyes': {
      full('c09', seg(u, 0, 0.94))
      break
    }
    case 'cta': {
      // fermeture à l'iris : le regard se resserre en un cercle qui vient se poser à côté de la conclusion
      full('c09', 1)
      const k = io(seg(u, 0, 0.55))
      const diag = Math.hypot(L.W, L.H) / 2
      const eye = { x: L.W * 0.5, y: L.H * 0.46 }
      const rest = L.land
        ? { x: card.x + card.w * 0.5, y: card.y + card.h * 0.5, r: Math.min(card.w, card.h) * 0.42 }
        : { x: card.x + card.w * 0.5, y: card.y + card.h * 0.5, r: Math.min(card.w, card.h) * 0.46 }
      st.iris = { x: lerp(eye.x, rest.x, k), y: lerp(eye.y, rest.y, k), r: lerp(diag * 1.05, rest.r, k) }
      if (!L.land) {
        // portrait : l'image accompagne le cercle, l'œil reste au centre de l'iris
        // l'image ne descend jamais sous la taille du cercle (sinon il serait coupé sur les côtés)
        const sc = lerp(1, Math.max(0.78, (2.15 * rest.r) / L.W), k)
        const ex = 0.5
        const ey = 0.48
        st.iris = { x: lerp(L.W * ex, rest.x, k), y: lerp(L.H * ey, rest.y, k), r: lerp(diag * 1.05, rest.r, k) }
        st.frame.C = { x: st.iris.x - ex * L.W * sc, y: st.iris.y - ey * L.H * sc, w: L.W * sc, h: L.H * sc }
      }
      st.paper = seg(u, 0.05, 0.3)
      st.cta = out(seg(u, 0.4, 0.75))
      break
    }
  }
  return st
}
