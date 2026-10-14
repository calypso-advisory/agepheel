// Captures du film à des progressions données (0..1 du film entier).
// usage : CHROME=... node tests/film.mjs <outDir> <WxH> <p1,p2,...> [--mobile]
import { chromium } from '@playwright/test'
import fs from 'node:fs'
const [outDir, size, spec, ...flags] = process.argv.slice(2)
const [W, H] = size.split('x').map(Number)
const base = process.env.BASE ?? 'http://localhost:4173/'
fs.mkdirSync(outDir, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined })
const mobile = flags.includes('--mobile')
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile })
const page = await ctx.newPage()
if (process.env.SHARE) await page.goto(process.env.SHARE, { waitUntil: 'load' })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await page.goto(base, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
let i = 0
for (const s of spec.split(',')) {
  const p = Number(s)
  await page.evaluate((p) => {
    const sec = document.querySelector('.fm')
    const stage = document.querySelector('.fm-stage')
    const top = sec.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, top + p * (sec.offsetHeight - stage.clientHeight))
  }, p)
  await page.waitForTimeout(700)
  const beat = await page.evaluate(() => window.__film?.beat)
  await page.screenshot({ path: `${outDir}/${String(i++).padStart(3, '0')}_p${s}_${beat}.png` })
}
if (errors.length) console.log('ERREURS', errors.slice(0, 5).join('\n'))
await browser.close()
console.log('ok', i)
