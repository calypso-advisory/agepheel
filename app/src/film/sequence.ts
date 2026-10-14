/**
 * Séquence d'images d'un clip, chargée en un seul fichier (« paquet ») puis décodée à la demande.
 *
 * Pourquoi un paquet : une vidéo pilotée par currentTime saccade sur iPhone quand on recule.
 * Une séquence d'images donne un contrôle exact, image par image, dans les deux sens.
 * Pourquoi décoder à la demande : 75 images 1440 px décodées pèsent ~400 Mo ; on n'en garde
 * qu'une douzaine (cache LRU), les autres restent compressées (~40 Ko chacune).
 */

export interface SeqIndex {
  offsets: number[] // n + 1 bornes dans le paquet
  w: number
  h: number
}

export class FrameSequence {
  private blobs: Blob[] | null = null
  private loadP: Promise<void> | null = null
  private cache = new Map<number, ImageBitmap>()
  private pending = new Map<number, Promise<void>>()
  private readonly url: string
  readonly index: SeqIndex
  private readonly limit: number
  private readonly onDecoded: () => void
  failed = false

  constructor(url: string, index: SeqIndex, limit: number, onDecoded: () => void) {
    this.url = url
    this.index = index
    this.limit = limit
    this.onDecoded = onDecoded
  }

  get count() {
    return this.index.offsets.length - 1
  }

  get loaded() {
    return this.blobs !== null
  }

  load(): Promise<void> {
    if (this.loadP) return this.loadP
    this.loadP = fetch(this.url)
      .then((r) => {
        if (!r.ok) throw new Error(`${this.url} : ${r.status}`)
        return r.arrayBuffer()
      })
      .then((buf) => {
        const o = this.index.offsets
        const blobs: Blob[] = []
        for (let i = 0; i < o.length - 1; i++) blobs.push(new Blob([buf.slice(o[i], o[i + 1])], { type: 'image/webp' }))
        this.blobs = blobs
        this.onDecoded()
      })
      .catch((e) => {
        this.failed = true
        console.warn('Séquence indisponible', e)
      })
    return this.loadP
  }

  /** Demande le décodage d'une image (sans attendre). */
  request(i: number) {
    if (!this.blobs) return
    i = Math.max(0, Math.min(this.count - 1, i))
    if (this.cache.has(i) || this.pending.has(i)) {
      const bm = this.cache.get(i)
      if (bm) {
        // rafraîchit l'ordre LRU
        this.cache.delete(i)
        this.cache.set(i, bm)
      }
      return
    }
    const p = createImageBitmap(this.blobs[i])
      .then((bm) => {
        this.pending.delete(i)
        this.cache.set(i, bm)
        while (this.cache.size > this.limit) {
          const first = this.cache.keys().next().value as number
          this.cache.get(first)?.close()
          this.cache.delete(first)
        }
        this.onDecoded()
      })
      .catch(() => {
        this.pending.delete(i)
      })
    this.pending.set(i, p)
  }

  /** Image décodée la plus proche de i (ou null). */
  nearest(i: number): ImageBitmap | null {
    const exact = this.cache.get(i)
    if (exact) return exact
    let best: ImageBitmap | null = null
    let bd = Infinity
    for (const [k, v] of this.cache) {
      const d = Math.abs(k - i)
      if (d < bd) {
        bd = d
        best = v
      }
    }
    return best
  }

  release() {
    for (const bm of this.cache.values()) bm.close()
    this.cache.clear()
  }
}
