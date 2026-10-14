// Arrivée sur une connexion lente : l'affiche doit être visible avant que le premier clip soit chargé.
// usage : node tests/slownet.mjs <out.png> [WxH] [délai ms]
import { chromium } from '@playwright/test'
const [out, size = '1440x900', delay = '2500'] = process.argv.slice(2)
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
const ready = await page.evaluate(() => document.querySelector('.fm-stage')?.classList.contains('is-ready'))
await page.screenshot({ path: out })
console.log('prêt :', ready)
await browser.close()
