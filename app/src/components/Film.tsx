import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CTA, HERO, OETH } from '../content/site'
import { FrameSequence, type SeqIndex } from '../film/sequence'
import { beatStart, chartBarRect, computeLayout, evaluate, TOTAL, type FilmState, type Layout, type Rect } from '../film/film'
import { ACTS, BEATS, CHART_BARS, CLIPS, KNOCKOUT_WORD, TEXTS } from '../film/storyboard'
import { useTheme } from './themeContext'

const base = import.meta.env.BASE_URL
const MEDIA = `${base}media/film/`

interface Manifest {
  /** extension des paquets (« bin » par défaut ; « webp » pour les hébergements qui filtrent les types) */
  ext?: string
  variants: Record<'d' | 'm', { w: number; h: number }>
  clips: Record<string, { n: number; d: number[]; m: number[] }>
}

interface Props {
  onRequestStatic: () => void
  onFail: () => void
}

/** ordre d'apparition des clips, pour précharger le suivant */
const CLIP_ORDER = CLIPS.map((c) => c.id)
const focalOf = (id: string, t: number) => {
  const f = CLIPS.find((c) => c.id === id)?.focal ?? [[0, 0.5]]
  if (t <= f[0][0]) return f[0][1]
  for (let i = 0; i < f.length - 1; i++) {
    if (t <= f[i + 1][0]) {
      const k = (t - f[i][0]) / (f[i + 1][0] - f[i][0])
      return f[i][1] + (f[i + 1][1] - f[i][1]) * k
    }
  }
  return f[f.length - 1][1]
}

export function Film({ onRequestStatic, onFail }: Props) {
  const secRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const { setTheme } = useTheme()
  const [act, setAct] = useState(1)
  const [ready, setReady] = useState(false)

  useEffect(() => setTheme('dark'), [setTheme])

  useLayoutEffect(() => {
    const sec = secRef.current!
    const stage = stageRef.current!
    const q = <T extends HTMLElement>(s: string) => stage.querySelector<T>(s)!
    const mask = q('.fm-mask')
    const canvas = q<HTMLCanvasElement>('.fm-canvas')
    const fill = q('.fm-fill')
    const paper = q('.fm-paper')
    const scrim = q('.fm-scrim')
    const chart = q('.fm-chart')
    const bars = Array.from(stage.querySelectorAll<HTMLElement>('.fm-bar'))
    const cta = q('.fm-cta')
    const hint = q('.fm-hint')
    const hero = q('.fm-hero')
    const knock = q<HTMLCanvasElement>('.fm-knock')
    const PAPER = '#f7f8f6'
    const NIGHT = '#0e1922'
    const rail = q('.fm-rail-fill')
    const oeth = {
      s1: q('[data-o="s1"]'),
      s2: q('[data-o="s2"]'),
      s3: q('[data-o="s3"]'),
      people: Array.from(stage.querySelectorAll<HTMLElement>('.fm-person')),
      dots: Array.from(stage.querySelectorAll<HTMLElement>('.fm-dot.is-on')),
    }
    const texts = TEXTS.map((t) => ({ id: t.id, el: q(`[data-t="${t.id}"]`) }))
    const ctx = canvas.getContext('2d', { alpha: false })!

    let L: Layout = computeLayout(stage.clientWidth, stage.clientHeight)
    let variant: 'd' | 'm' = L.land ? 'd' : 'm'
    let manifest: Manifest | null = null
    let seqs = new Map<string, FrameSequence>()
    let top = 0
    let dist = 1
    let raf = 0
    let lastP = -1
    let dir = 1
    let lastDrawKey = ''
    let destroyed = false
    const cache = new Map<HTMLElement, Record<string, string>>()
    const set = (el: HTMLElement, prop: 'transform' | 'opacity' | 'visibility', v: string) => {
      let c = cache.get(el)
      if (!c) cache.set(el, (c = {}))
      if (c[prop] === v) return
      c[prop] = v
      el.style[prop] = v
    }
    const op = (el: HTMLElement, a: number) => {
      set(el, 'opacity', a >= 0.999 ? '1' : a.toFixed(3))
      set(el, 'visibility', a <= 0.001 ? 'hidden' : 'visible')
    }

    const buildSeqs = () => {
      if (!manifest) return
      for (const s of seqs.values()) s.release()
      seqs = new Map()
      const v = manifest.variants[variant]
      for (const id of CLIP_ORDER) {
        const c = manifest.clips[id]
        if (!c) continue
        const index: SeqIndex = { offsets: c[variant], w: v.w, h: v.h }
        seqs.set(id, new FrameSequence(`${MEDIA}${id}-${variant}.${manifest.ext ?? 'bin'}`, index, L.land ? 14 : 10, () => schedule(true)))
      }
    }

    const layoutChart = () => {
      // positions des barres = mêmes calculs que la fenêtre (raccord exact)
      bars.forEach((b, i) => {
        const r = chartBarRect(L, 1)
        const n = bars.length
        const box = L.card
        const pad = box.w * 0.08
        const gap = box.w * 0.035
        const bw = (box.w - 2 * pad - gap * (n - 1)) / n
        const x = box.x + pad + i * (bw + gap)
        const h = r.h * (0.42 + (0.58 * i) / (n - 1))
        b.style.left = `${x}px`
        b.style.width = `${bw}px`
        b.style.top = `${r.y + r.h - h}px`
        b.style.height = `${h}px`
      })
    }

    const measure = () => {
      L = computeLayout(stage.clientWidth, stage.clientHeight)
      // la toile ne dépasse jamais la résolution des images sources : au-delà, on paie le coût sans gain de netteté
      const src = L.land ? { w: 1440, h: 806 } : { w: 608, h: 1080 }
      const cover = Math.max(src.w / L.W, src.h / L.H)
      const dpr = Math.min(window.devicePixelRatio || 1, Math.max(1, cover))
      canvas.width = Math.round(L.W * dpr)
      canvas.height = Math.round(L.H * dpr)
      for (const [k, v] of Object.entries({ sw: L.W, sh: L.H, cx: L.card.x, cy: L.card.y, cw: L.card.w, ch: L.card.h, tx: L.col.x, ty: L.col.y, tw: L.col.w, th: L.col.h }))
        stage.style.setProperty(`--${k}`, `${v}px`)
      stage.dataset.layout = L.land ? 'land' : 'port'
      const nv = L.land ? 'd' : 'm'
      if (nv !== variant) {
        variant = nv
        buildSeqs()
      }
      layoutChart()
      layoutKnock()
      top = sec.getBoundingClientRect().top + window.scrollY
      dist = Math.max(1, sec.offsetHeight - stage.clientHeight)
      lastDrawKey = ''
    }

    /**
     * dessine l'image du clip, cadrée « cover » dans la zone C (coordonnées du canvas) ;
     * dst : sous-rectangle de C (écran partagé), clipTop : volet vertical
     */
    const drawClip = (id: string, t: number, C: Rect, clipTop?: number, dst?: Rect) => {
      const s = seqs.get(id)
      if (!s) return false
      if (!s.loaded) {
        void s.load()
        return false
      }
      const i = Math.round(t * (s.count - 1))
      s.request(i)
      for (let k = 1; k <= 3; k++) s.request(i + k * dir)
      s.request(i - dir)
      const bm = s.nearest(i)
      if (!bm) return false
      // zone de contenu C étirée sur toute la toile (la toile est ensuite transformée vers C)
      const kx = canvas.width / C.w
      const ky = canvas.height / C.h
      const D = dst ?? { x: 0, y: 0, w: C.w, h: C.h }
      const cover = Math.max(D.w / bm.width, D.h / bm.height)
      const w = bm.width * cover
      const h = bm.height * cover
      const fx = variant === 'd' ? focalOf(id, t) : 0.5
      // en bande horizontale (portrait), on garde le haut du cadre, où sont les visages
      const fy = dst && variant === 'm' ? 0.4 : 0.5
      const x = D.x + Math.min(0, Math.max(D.w - w, D.w / 2 - fx * w))
      const y = D.y + Math.min(0, Math.max(D.h - h, D.h / 2 - fy * h))
      ctx.save()
      ctx.setTransform(kx, 0, 0, ky, 0, 0)
      if (clipTop !== undefined || dst) {
        ctx.beginPath()
        if (dst) ctx.rect(D.x, D.y, D.w, D.h)
        else ctx.rect(0, clipTop! * C.h, C.w, C.h)
        ctx.clip()
      }
      ctx.drawImage(bm, x, y, w, h)
      ctx.restore()
      return true
    }

    /** calque papier percé par le mot géant ; renvoie le point d'ancrage du zoom (au cœur d'une lettre) */
    let knockAnchor = { x: 0, y: 0, d: 1 }
    const layoutKnock = () => {
      const kd = Math.min(2, window.devicePixelRatio || 1)
      knock.width = Math.round(L.W * kd)
      knock.height = Math.round(L.H * kd)
      const k = knock.getContext('2d')!
      k.setTransform(kd, 0, 0, kd, 0, 0)
      k.globalCompositeOperation = 'source-over'
      k.fillStyle = PAPER
      k.fillRect(0, 0, L.W, L.H)
      const family = getComputedStyle(stage).fontFamily || 'sans-serif'
      let size = L.H * 0.4
      k.font = `800 ${size}px ${family}`
      const m = k.measureText(KNOCKOUT_WORD).width
      size = Math.min(size, (size * L.W * 0.9) / m)
      k.font = `800 ${size}px ${family}`
      k.textAlign = 'center'
      k.textBaseline = 'middle'
      k.globalCompositeOperation = 'destination-out'
      k.fillText(KNOCKOUT_WORD, L.W / 2, L.H / 2)
      // point le plus éloigné de tout papier, cherché sur une grille grossière
      const img = k.getImageData(0, 0, knock.width, knock.height).data
      const step = Math.max(2, Math.round(size / 40))
      const open = (x: number, y: number) => img[(Math.round(y * kd) * knock.width + Math.round(x * kd)) * 4 + 3] < 128
      let best = { x: L.W / 2, y: L.H / 2, d: 1 }
      const y0 = L.H / 2 - size * 0.4
      const y1 = L.H / 2 + size * 0.4
      for (let y = y0; y <= y1; y += step) {
        for (let x = L.W * 0.05; x <= L.W * 0.95; x += step) {
          if (!open(x, y)) continue
          let d = step
          while (d < size && open(x + d, y) && open(x - d, y) && open(x, y + d) && open(x, y - d) && open(x + d * 0.7, y + d * 0.7) && open(x - d * 0.7, y - d * 0.7) && open(x + d * 0.7, y - d * 0.7) && open(x - d * 0.7, y + d * 0.7)) d += step
          if (d > best.d) best = { x, y, d }
        }
      }
      knockAnchor = best
      knock.style.transformOrigin = `${best.x}px ${best.y}px`
    }

    const preload = (st: FilmState) => {
      const idx = CLIP_ORDER.indexOf(st.clip.id)
      for (const k of [idx, idx + 1, idx + 2, idx - 1]) {
        const id = CLIP_ORDER[k]
        if (id) void seqs.get(id)?.load()
      }
    }

    const render = () => {
      raf = 0
      if (destroyed) return
      const p = Math.min(1, Math.max(0, (window.scrollY - top) / dist))
      if (lastP >= 0 && p !== lastP) dir = p > lastP ? 1 : -1
      lastP = p
      const st = evaluate(p, L)
      preload(st)

      // cadre (masque) et toile (transformation inverse vers C)
      const { R, C } = st.frame
      const mx = Math.max(R.w / L.W, 1e-4)
      const my = Math.max(R.h / L.H, 1e-4)
      set(mask, 'transform', `translate3d(${R.x.toFixed(2)}px,${R.y.toFixed(2)}px,0) scale(${mx.toPrecision(6)},${my.toPrecision(6)})`)
      const cx = C.w / L.W
      const cy = C.h / L.H
      set(canvas, 'transform', `scale(${(1 / mx).toPrecision(6)},${(1 / my).toPrecision(6)}) translate3d(${(C.x - R.x).toFixed(2)}px,${(C.y - R.y).toFixed(2)}px,0) scale(${cx.toPrecision(6)},${cy.toPrecision(6)})`)
      op(mask, st.frame.opacity)
      op(fill, st.frame.fill)

      // image : on ne redessine que si l'image, le cadrage ou le second clip changent
      const sa = seqs.get(st.clip.id)
      const ia = sa ? Math.round(st.clip.t * (sa.count - 1)) : -1
      const sb = st.clipB ? seqs.get(st.clipB.id) : undefined
      const ib = st.clipB && sb ? Math.round(st.clipB.t * (sb.count - 1)) : -1
      const pk = st.panels ? st.panels.map((q) => `${q.id}:${q.t.toFixed(3)}:${q.r.x.toFixed(0)},${q.r.y.toFixed(0)},${q.r.w.toFixed(0)},${q.r.h.toFixed(0)}`).join(';') : ''
      const ik = st.iris ? `${st.iris.x.toFixed(1)},${st.iris.y.toFixed(1)},${st.iris.r.toFixed(1)}` : ''
      const key = `${st.clip.id}:${ia}|${C.w.toFixed(0)}x${C.h.toFixed(0)}|${st.clipB ? st.clipB.id + ':' + ib + ':' + st.clipB.wipe.toFixed(3) : ''}|${pk}|${ik}`
      if (key !== lastDrawKey || forceDraw) {
        forceDraw = false
        let ok: boolean
        if (st.panels) {
          // écran partagé : fond de nuit visible dans les interstices
          ctx.setTransform(1, 0, 0, 1, 0, 0)
          ctx.fillStyle = NIGHT
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ok = true
          for (const q of st.panels) {
            if (q.r.x >= L.W || q.r.y >= L.H || q.r.x + q.r.w <= 0 || q.r.y + q.r.h <= 0) continue
            ok = drawClip(q.id, q.t, C, undefined, q.r) && ok
          }
        } else {
          ok = drawClip(st.clip.id, st.clip.t, C)
          if (st.clipB) drawClip(st.clipB.id, st.clipB.t, C, 1 - st.clipB.wipe)
        }
        if (ok && st.iris) {
          // iris : tout ce qui est hors du cercle devient papier
          const kx = canvas.width / C.w
          const ky = canvas.height / C.h
          ctx.save()
          ctx.setTransform(kx, 0, 0, ky, 0, 0)
          ctx.beginPath()
          ctx.rect(0, 0, C.w, C.h)
          ctx.arc(st.iris.x - C.x, st.iris.y - C.y, Math.max(0.5, st.iris.r), 0, Math.PI * 2, true)
          ctx.fillStyle = PAPER
          ctx.fill('evenodd')
          ctx.restore()
        }
        if (ok) {
          lastDrawKey = key
          if (!readyFlag) {
            readyFlag = true
            setReady(true)
          }
        }
      }

      op(paper, st.paper)
      op(scrim, st.scrim)
      op(chart, st.chart.opacity * (st.chart.draw > 0 ? 1 : 0))
      bars.forEach((b, i) => {
        const d = Math.min(1, Math.max(0, (st.chart.draw - i * 0.08) / 0.68))
        set(b, 'transform', `scaleY(${d.toFixed(3)})`)
        // la dernière barre cède la place à la fenêtre vidéo
        if (i === bars.length - 1) op(b, st.frame.fill > 0 && st.clip.id === 'p1' ? 0 : 1)
      })
      for (const t of texts) {
        const a = st.texts[t.id] ?? 0
        op(t.el, a)
        set(t.el, 'transform', `translate3d(0,${((1 - a) * 16).toFixed(1)}px,0)`)
      }
      op(oeth.s1, st.oeth.s1)
      op(oeth.s2, st.oeth.s2)
      op(oeth.s3, st.oeth.s3)
      oeth.people.forEach((el, i) => op(el, st.oeth.people * 20 > i ? 1 : 0.12))
      oeth.dots.forEach((el, i) => op(el, st.oeth.dots * 6 > i ? 1 : 0))
      op(cta, st.cta)
      if (st.cta < 0.5) cta.setAttribute('inert', '')
      else cta.removeAttribute('inert')
      op(hint, st.hint)
      op(knock, st.knock.opacity)
      {
        // grossissement jusqu'à ce que la lettre couvre tout l'écran depuis son point d'ancrage
        const reach = Math.hypot(Math.max(knockAnchor.x, L.W - knockAnchor.x), Math.max(knockAnchor.y, L.H - knockAnchor.y))
        const K = Math.max(1, (reach / knockAnchor.d) * 1.15)
        set(knock, 'transform', `scale(${(1 + st.knock.scale * (K - 1)).toPrecision(6)})`)
      }
      op(hero, st.hero)
      set(hero, 'transform', `translate3d(0,${((1 - st.hero) * -24).toFixed(1)}px,0)`)
      if (st.hero < 0.5) hero.setAttribute('inert', '')
      else hero.removeAttribute('inert')
      set(rail, 'transform', `scaleX(${p.toFixed(4)})`)
      stage.dataset.tone = st.paper > 0.5 ? 'light' : 'dark'
      if (st.act !== curAct) {
        curAct = st.act
        setAct(st.act)
      }
      const theme = st.paper > 0.5 ? 'light' : 'dark'
      if (theme !== curTheme) {
        curTheme = theme
        setTheme(theme)
      }
      ;(window as unknown as { __film?: unknown }).__film = { p, beat: st.beat }
    }
    let forceDraw = false
    let readyFlag = false
    let curAct = 1
    let curTheme: 'dark' | 'light' = 'dark'
    const schedule = (force = false) => {
      if (force) forceDraw = true
      if (!raf) raf = requestAnimationFrame(render)
    }
    const onScroll = () => schedule()
    const onResize = () => {
      measure()
      schedule(true)
    }

    measure()
    fetch(`${MEDIA}manifest.json`)
      .then((r) => {
        if (!r.ok) throw new Error('manifest')
        return r.json()
      })
      .then((m: Manifest) => {
        if (destroyed) return
        manifest = m
        buildSeqs()
        schedule(true)
      })
      .catch(() => onFail())
    render()
    window.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(onResize)
    ro.observe(stage)
    window.addEventListener('pageshow', onResize)
    document.fonts?.ready.then(onResize)
    return () => {
      destroyed = true
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pageshow', onResize)
      ro.disconnect()
      cancelAnimationFrame(raf)
      for (const s of seqs.values()) s.release()
      setTheme('light')
    }
  }, [onFail, setTheme])

  const goTo = (beat: (typeof BEATS)[number]['id']) => {
    const sec = secRef.current!
    const stage = stageRef.current!
    const top = sec.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + beatStart(beat) * (sec.offsetHeight - stage.clientHeight) + 2, behavior: 'smooth' })
  }
  const skip = () => {
    const el = document.getElementById('solutions')
    if (!el) return
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'auto' })
    el.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
  }
  const toContact = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
    document.getElementById('contact-title')?.focus({ preventScroll: true })
  }

  return (
    <section ref={secRef} className="fm" style={{ ['--len' as string]: TOTAL }} aria-label="Récit interactif : Changeons de regard">
      <div ref={stageRef} className={`fm-stage ${ready ? 'is-ready' : ''}`} data-tone="dark">
        <picture className="fm-poster" aria-hidden="true">
          <source media="(max-aspect-ratio: 1/1)" srcSet={`${MEDIA}poster-m.webp`} />
          <img src={`${MEDIA}poster-d.webp`} alt="" fetchPriority="high" />
        </picture>
        <div className="fm-paper" />

        <div className="fm-chart" aria-hidden="true">
          {CHART_BARS.map((b) => (
            <div key={b} className="fm-bar">
              <span>{b}</span>
            </div>
          ))}
        </div>

        <div className="fm-mask">
          <canvas className="fm-canvas" role="img" aria-label={CLIPS.map((c) => c.label).join(' ')} />
          <div className="fm-fill" />
        </div>
        <div className="fm-scrim" aria-hidden="true" />
        <canvas className="fm-knock" aria-hidden="true" />

        <div className="fm-hero">
          <h1>{HERO.title}</h1>
          <p>{HERO.text}</p>
          <a className="btn btn-primary" href="#contact" onClick={toContact}>
            {CTA.primary}
          </a>
        </div>

        <div className="fm-texts">
          {TEXTS.map((t) =>
            t.h1 ? (
              <h1 key={t.id} className={`fm-text pos-${t.pos} size-${t.size}`} data-t={t.id}>
                {t.text}
              </h1>
            ) : (
              <p key={t.id} className={`fm-text pos-${t.pos} size-${t.size}`} data-t={t.id} aria-hidden="true">
                {t.short ? (
                  <>
                    <span className="only-wide">{t.text}</span>
                    <span className="only-narrow">{t.short}</span>
                  </>
                ) : (
                  t.text
                )}
              </p>
            ),
          )}
        </div>

        <div className="fm-oeth" aria-hidden="true">
          <div className="fm-o" data-o="s1">
            <p className="fm-o-fig">{OETH.t1.figure}</p>
            <p className="fm-o-text">{OETH.t1.text}</p>
            <div className="fm-people">
              {Array.from({ length: 20 }, (_, i) => (
                <svg key={i} className="fm-person" viewBox="0 0 24 40" aria-hidden="true">
                  <circle cx="12" cy="7" r="6" />
                  <path d="M2 40 V22 a10 10 0 0 1 20 0 V40 Z" />
                </svg>
              ))}
            </div>
          </div>
          <div className="fm-o" data-o="s2">
            <p className="fm-o-fig">{OETH.t2.figure}</p>
            <p className="fm-o-text">{OETH.t2.text}</p>
            <div className="fm-dots">
              {Array.from({ length: 100 }, (_, i) => (
                <span key={i} className={`fm-dot ${i >= 94 ? 'is-on' : ''}`} />
              ))}
            </div>
            <p className="fm-o-note">{OETH.t2.note}</p>
          </div>
          <div className="fm-o" data-o="s3">
            <p className="fm-o-q">{OETH.t3.title}</p>
            <p className="fm-o-text">{OETH.t3.text}</p>
          </div>
        </div>

        <div className="fm-cta" inert>
          <h2>{CTA.title}</h2>
          <p>{CTA.text}</p>
          <div className="cta-actions">
            <a className="btn btn-primary" href="#contact" onClick={toContact}>
              {CTA.primary}
            </a>
            <a
              className="btn btn-ghost-dark"
              href="#solutions"
              onClick={(e) => {
                e.preventDefault()
                skip()
              }}
            >
              {CTA.secondary}
            </a>
          </div>
        </div>

        <p className="fm-hint" aria-hidden="true">
          <span className="fm-hint-line" />
          Faites défiler
        </p>

        <div className="fm-tools">
          <button type="button" className="fm-btn" onClick={skip}>
            <span className="only-wide">Passer l’introduction</span>
            <span className="only-narrow">Passer</span>
          </button>
          <button type="button" className="fm-btn fm-btn-quiet" onClick={onRequestStatic}>
            Sans animation
          </button>
        </div>

        <nav className="fm-nav" aria-label="Chapitres du récit">
          <ol>
            {ACTS.map((a) => (
              <li key={a.act}>
                <button type="button" aria-current={a.act === act ? 'step' : undefined} className={a.act === act ? 'is-current' : ''} onClick={() => goTo(a.beat)}>
                  {a.label}
                </button>
              </li>
            ))}
          </ol>
          <div className="fm-rail" aria-hidden="true">
            <span className="fm-rail-fill" />
          </div>
        </nav>

      </div>
    </section>
  )
}
