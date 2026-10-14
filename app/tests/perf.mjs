// Mesure de fluidité : défilement tactile synthétique (CDP) sur tout l'Acte I, processeur ralenti.
import { chromium } from '@playwright/test'
const base = process.env.BASE ?? 'http://localhost:4173/'
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--enable-gpu-rasterization'] })
for (const [name, vp, throttle] of [['iPhone 390×844, CPU ÷4', { width: 390, height: 844 }, 4], ['iPad 820×1180, CPU ÷4', { width: 820, height: 1180 }, 4], ['Bureau 1440×900', { width: 1440, height: 900 }, 1]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: vp.width < 1000, hasTouch: vp.width < 1000 })
  const page = await ctx.newPage()
  if (process.env.SHARE) await page.goto(process.env.SHARE, { waitUntil: 'load' })
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  const cdp = await ctx.newCDPSession(page)
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle })
  // Défilement « au doigt » : la page avance d'un pas à chaque image (≈ 1 500 px/s), comme un geste continu.
  const t0 = Date.now()
  const r = await page.evaluate(
    () =>
      new Promise((done) => {
        const sec = document.querySelector('.fm')
        const end = sec.offsetHeight - innerHeight
        const step = 30
        const frames = []
        let last = performance.now()
        const loop = (t) => {
          frames.push(t - last)
          last = t
          if (scrollY < end) {
            window.scrollBy(0, step)
            requestAnimationFrame(loop)
          } else {
            const f = frames.slice(2)
            const s = [...f].sort((a, b) => a - b)
            const pct = (q) => s[Math.floor(q * (s.length - 1))]
            done({ n: f.length, mean: f.reduce((a, b) => a + b, 0) / f.length, p95: pct(0.95), max: s[s.length - 1], over33: f.filter((x) => x > 33.4).length, act: window.__act })
          }
        }
        requestAnimationFrame(loop)
      }),
  )
  const ms = Date.now() - t0
  console.log(`${name} : ${r.n} images en ${ms} ms · moyenne ${r.mean.toFixed(1)} ms · p95 ${r.p95.toFixed(1)} ms · max ${r.max.toFixed(1)} ms · images > 33 ms : ${r.over33} · fin p=${r.act?.p?.toFixed(2)}`)
  await ctx.close()
}
await browser.close()
