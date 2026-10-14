import { clamp, lerp, locate } from './math'
import type { Cam, CamKey, EvaluatedCam, Registration } from './types'

export const IMG_W = 1672
export const IMG_H = 941
export const IMG_ASPECT = IMG_W / IMG_H

/** Taille visible (en fraction de l'image) à z = 1 pour un viewport d'aspect V. */
export function coverSize(viewAspect: number, imgAspect = IMG_ASPECT) {
  return viewAspect >= imgAspect ? { w: 1, h: imgAspect / viewAspect } : { w: viewAspect / imgAspect, h: 1 }
}

export function zoomOf(c: Cam, viewAspect: number): number {
  if (c.w !== undefined) {
    const v = coverSize(viewAspect)
    const zw = v.w / c.w
    const zh = c.h !== undefined ? v.h / c.h : 0
    return Math.max(1, zw, zh)
  }
  return Math.max(1, c.z ?? 1)
}

/**
 * Interpolation de caméra.
 * Le zoom est interpolé en espace logarithmique et le centre en espace « 1/z »,
 * ce qui donne un vrai rapprochement vers un point fixe (pas de dérive en S du sujet).
 */
export function evalCam(keys: CamKey[], t: number, viewAspect: number, clampToImage = true): EvaluatedCam {
  const { a, b, k } = locate(keys, t)
  const za = zoomOf(a, viewAspect)
  const zb = zoomOf(b, viewAspect)
  const z = Math.exp(lerp(Math.log(za), Math.log(zb), k))
  let g = k
  if (Math.abs(Math.log(zb / za)) > 0.04) g = (1 / z - 1 / za) / (1 / zb - 1 / za)
  const portrait = viewAspect < 1
  const axv = portrait && a.mx !== undefined ? a.mx : a.x
  const bxv = portrait && b.mx !== undefined ? b.mx : b.x
  let cx = lerp(axv, bxv, g)
  let cy = lerp(a.y, b.y, g)
  const vis = coverSize(viewAspect)
  if (clampToImage) {
    const hw = vis.w / z / 2
    const hh = vis.h / z / 2
    cx = clamp(cx, hw, 1 - hw)
    cy = clamp(cy, hh, 1 - hh)
  }
  return {
    cx,
    cy,
    z,
    roll: lerp(a.roll ?? 0, b.roll ?? 0, k),
    px: lerp(a.px ?? 0, b.px ?? 0, k),
    py: lerp(a.py ?? 0, b.py ?? 0, k),
    push: lerp(a.push ?? 0, b.push ?? 0, k),
    focus: lerp(a.focus ?? 0.25, b.focus ?? 0.25, k),
  }
}

/** Applique un recalage B→A à une caméra évaluée de B : les deux plans affichent alors exactement la même région. */
export function deriveCam(cb: EvaluatedCam, reg: Registration): EvaluatedCam {
  const r = (reg.rot * Math.PI) / 180
  const bx = cb.cx * IMG_W
  const by = cb.cy * IMG_H
  const ax = reg.s * (Math.cos(r) * bx - Math.sin(r) * by) + reg.tx
  const ay = reg.s * (Math.sin(r) * bx + Math.cos(r) * by) + reg.ty
  return { ...cb, cx: ax / IMG_W, cy: ay / IMG_H, z: cb.z / reg.s, roll: cb.roll + reg.rot }
}

/** Version « clé de caméra » de deriveCam, utilisée à l'écriture du storyboard pour raccorder les plans. */
export function deriveKey(cb: Cam, reg: Registration, t: number): CamKey {
  const ev: EvaluatedCam = {
    cx: cb.x,
    cy: cb.y,
    z: cb.z ?? 1,
    roll: cb.roll ?? 0,
    px: 0,
    py: 0,
    push: 0,
    focus: cb.focus ?? 0.25,
  }
  const d = deriveCam(ev, reg)
  return { t, x: d.cx, y: d.cy, z: d.z, roll: d.roll, focus: cb.focus }
}

/**
 * Construit un recalage à partir d'une ancre commune (même point physique vu dans A et dans B),
 * d'une échelle et d'une rotation.
 */
export function regFromAnchor(
  anchorA: [number, number],
  anchorB: [number, number],
  s: number,
  rot = 0,
): Registration {
  const r = (rot * Math.PI) / 180
  const bx = anchorB[0] * IMG_W
  const by = anchorB[1] * IMG_H
  const ax = anchorA[0] * IMG_W
  const ay = anchorA[1] * IMG_H
  return {
    s,
    rot,
    tx: ax - s * (Math.cos(r) * bx - Math.sin(r) * by),
    ty: ay - s * (Math.sin(r) * bx + Math.cos(r) * by),
  }
}
