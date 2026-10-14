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
    clip: { id: 'c01', t: 0 },
    frame: { R: S, C: S, opacity: 1, fill: 0 },
    paper: 0,
    scrim: 0,
    texts: {},
    chart: { draw: 0, opacity: 0 },
    oeth: { s1: 0, s2: 0, s3: 0, people: 0, dots: 0 },
    cta: 0,
    hint: 0,
  }
  for (const t of TEXTS) st.texts[t.id] = 0
  const full = (id: string, t: number) => {
    st.clip = { id, t }
    st.frame = { R: S, C: S, opacity: 1, fill: 0 }
  }
  /** plein écran ↔ carte (l'image se réduit avec la carte) */
  const toCard = (k: number) => {
    const R = lerpRect(S, card, k)
    st.frame.R = R
    st.frame.C = R
  }

  switch (beat) {
    case 'open': {
      full('c01', seg(u, 0.08, 1))
      st.texts.open = 1 - seg(u, 0.42, 0.56)
      st.scrim = 1
      st.hint = 1 - seg(u, 0.01, 0.08)
      break
    }
    case 'orbit': {
      full('c02', u)
      st.texts.regard = txt(u, 0.12, 0.26, 0.78, 0.92)
      st.scrim = 1
      break
    }
    case 'screen': {
      full('c03', seg(u, 0, 0.9))
      st.texts.def = txt(u, 0.06, 0.2, 0.55, 0.68)
      st.scrim = 1 - seg(u, 0.6, 0.85)
      break
    }
    case 'chart': {
      // l'écran blanc plein cadre devient la page : le graphique se dessine dessus
      full('c03', 1)
      st.paper = seg(u, 0, 0.08)
      st.frame.opacity = 1 - seg(u, 0.02, 0.1)
      const draw = io(seg(u, 0.08, 0.4))
      st.chart = { draw, opacity: 1 - seg(u, 0.72, 0.86) }
      st.texts.comp = txt(u, 0.1, 0.2, 0.36, 0.43)
      st.texts.avance = txt(u, 0.44, 0.52, 0.64, 0.7)
      // la barre « Engagement » devient une fenêtre sur l'atelier
      const grow = io(seg(u, 0.7, 0.99))
      if (u > 0.68) {
        const bar = chartBarRect(L, draw)
        st.clip = { id: 'c04', t: 0 }
        st.frame = { R: lerpRect(bar, S, grow), C: S, opacity: 1, fill: 1 - seg(u, 0.74, 0.88) }
        st.paper = 1 - seg(u, 0.92, 1)
      }
      break
    }
    case 'hands': {
      full('c04', u)
      st.texts.diff = txt(u, 0.1, 0.22, 0.42, 0.52)
      st.texts.exig = txt(u, 0.56, 0.68, 0.9, 1)
      st.scrim = 1
      break
    }
    case 'logi': {
      full('c05', u)
      st.texts.metier = txt(u, 0.1, 0.22, 0.42, 0.52)
      st.texts.place = txt(u, 0.56, 0.68, 0.9, 1)
      st.scrim = 1
      break
    }
    case 'coll': {
      // le plein écran se range dans une carte ; coupe franche vers le bureau, puis retour plein écran
      st.clip = { id: 'c05', t: 1 }
      st.paper = 1
      const k = io(seg(u, 0, 0.26)) * (1 - io(seg(u, 0.8, 1)))
      toCard(k)
      const wipe = io(seg(u, 0.44, 0.7))
      if (wipe > 0) st.clipB = { id: 'c06', t: 0, wipe }
      st.texts.seul = txt(u, 0.16, 0.28, 0.44, 0.5)
      st.texts.coll = txt(u, 0.54, 0.62, 0.74, 0.82)
      break
    }
    case 'desk': {
      full('c06', u)
      st.texts.impro = txt(u, 0.1, 0.22, 0.42, 0.52)
      st.texts.ensemble = txt(u, 0.56, 0.68, 0.9, 1)
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
      // le film se range et laisse place aux chiffres, puis revient
      st.clip = { id: 'c08', t: 1 }
      st.paper = 1
      const away = io(seg(u, 0, 0.12))
      const back = io(seg(u, 0.9, 1))
      const small: Rect = L.land
        ? { x: L.W - L.G - L.W * 0.12, y: L.H - L.G - L.W * 0.12 * 0.5625, w: L.W * 0.12, h: L.W * 0.12 * 0.5625 }
        : { x: L.W - L.G - L.W * 0.3, y: L.H - L.G - L.W * 0.3 * 0.5625, w: L.W * 0.3, h: L.W * 0.3 * 0.5625 }
      const R = back > 0 ? lerpRect(small, S, back) : lerpRect(S, small, away)
      st.frame = { R, C: R, opacity: back > 0 ? 1 : 1 - seg(u, 0.08, 0.14), fill: 0 }
      st.oeth.s1 = txt(u, 0.1, 0.18, 0.36, 0.42)
      st.oeth.people = seg(u, 0.14, 0.32)
      st.oeth.s2 = txt(u, 0.42, 0.5, 0.66, 0.72)
      st.oeth.dots = seg(u, 0.46, 0.62)
      st.oeth.s3 = txt(u, 0.72, 0.8, 0.9, 0.96)
      break
    }
    case 'eyes': {
      full('c09', seg(u, 0, 0.92))
      st.paper = 1 - seg(u, 0, 0.05)
      break
    }
    case 'cta': {
      st.clip = { id: 'c09', t: 1 }
      st.paper = 1
      toCard(io(seg(u, 0, 0.45)))
      st.cta = out(seg(u, 0.3, 0.7))
      break
    }
  }
  return st
}
