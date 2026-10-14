import type { EaseName, NumKey } from './types'

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const invLerp = (a: number, b: number, v: number) => (b === a ? 0 : clamp((v - a) / (b - a)))

export const ease: Record<EaseName, (t: number) => number> = {
  linear: (t) => t,
  in: (t) => t * t * t,
  out: (t) => 1 - Math.pow(1 - t, 3),
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  expoIn: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  expoOut: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  expoInOut: (t) =>
    t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
}

/** Trouve l'intervalle de clés et la progression facilitée entre elles. */
export function locate<K extends { t: number; ease?: EaseName }>(
  keys: K[],
  t: number,
): { a: K; b: K; k: number } {
  if (t <= keys[0].t) return { a: keys[0], b: keys[0], k: 0 }
  const last = keys[keys.length - 1]
  if (t >= last.t) return { a: last, b: last, k: 0 }
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]
    const b = keys[i + 1]
    if (t >= a.t && t <= b.t) {
      const raw = invLerp(a.t, b.t, t)
      return { a, b, k: ease[b.ease ?? 'inOut'](raw) }
    }
  }
  return { a: last, b: last, k: 0 }
}

export function evalNum(keys: NumKey[] | undefined, t: number, fallback: number): number {
  if (!keys || keys.length === 0) return fallback
  const { a, b, k } = locate(keys, t)
  return lerp(a.v, b.v, k)
}

/** Opacité d'un texte : fondu d'entrée, maintien, fondu de sortie. */
export function textAlpha(t: number, tin: number, tout: number) {
  const f = Math.min(0.09, (tout - tin) / 3)
  if (t <= tin || t >= tout) return 0
  if (t < tin + f) return ease.out(invLerp(tin, tin + f, t))
  if (t > tout - f) return 1 - ease.in(invLerp(tout - f, tout, t))
  return 1
}
