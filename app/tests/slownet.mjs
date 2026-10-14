// Arrivée sur une connexion lente : l'affiche doit être visible avant que le premier clip soit chargé.
// usage : node tests/slownet.mjs <out.png> [WxH] [délai ms] [saut p]
import { chromium } from '@playwright/test'
const [out, size = '1440x900', delay = '2500', jump = ''] = process.argv.slice(2)
const [w, h] = size.split('x').map(Number)
const base = process.env.BASE ?? 'http://localhost:4173/'
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined })
const ctx = await browser.newContext({ viewport: { width: w, height: h } })
const page = await ctx.newPage()
const cdp = await ctx.newCDPSession(page)
await cdp.send('Network.enable')
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.5 * 1024 * 1024) / 8, uploadThroughput: 750 * 1024 / 8 })
await page.goto(base, { waitUntil: 'commit' })
await page.waitForTimeout(Number(delay))
// option : saut direct à une position du film (p), comme un visiteur qui défile vite
if (jump) {
  await page.evaluate((p) => {
    const sec = document.querySelector('.fm')
    const stage = document.querySelector('.fm-stage')
    const top = sec.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, top + p * (sec.offsetHeight - stage.clientHeight))
  }, Number(jump))
  await page.waitForTimeout(Number(process.env.AFTER ?? 1500))
}
const ready = await page.evaluate(() => document.querySelector('.fm-stage')?.classList.contains('is-ready'))
await page.screenshot({ path: out })
console.log('prêt :', ready)
await browser.close()
