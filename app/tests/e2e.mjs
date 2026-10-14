// Tests fonctionnels : réversibilité, scroll rapide, clavier, resize, formulaire, version sans animation.
// usage : CHROME=... node tests/e2e.mjs <outDir>
import { chromium } from '@playwright/test'
import fs from 'node:fs'
import sharp from 'sharp'

const out = process.argv[2] ?? 'test-results'
fs.mkdirSync(out, { recursive: true })
const base = process.env.BASE ?? 'http://localhost:4173/'
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const results = []
const check = (name, ok, info = '') => {
  results.push({ name, ok, info })
  console.log(`${ok ? '✔' : '✘'} ${name}${info ? ' — ' + info : ''}`)
}

async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts })
  const page = await ctx.newPage()
  // site protégé (Vercel) : le lien de partage pose le cookie d'accès
  if (process.env.SHARE) await page.goto(process.env.SHARE, { waitUntil: 'load' })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  return { page, errors, ctx }
}

const scrollToP = (page, p) =>
  page.evaluate((p) => {
    const film = document.querySelector('.film')
    const top = film.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, top + p * (film.offsetHeight - window.innerHeight))
  }, p)
const settle = (page, p) => page.waitForFunction((p) => Math.abs(window.__cine.progress - p) < 1e-4, p, { timeout: 10000 })

/* 1. Acte I : réversibilité, navigation, formulaire */
{
  const { page, errors, ctx } = await newPage()
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const toP = (p) =>
    page.evaluate((p) => {
      const sec = document.querySelector('.fm')
      const stage = document.querySelector('.fm-stage')
      const top = sec.getBoundingClientRect().top + window.scrollY
      window.scrollTo(0, top + p * (sec.offsetHeight - stage.clientHeight))
    }, p)
  const probes = [0.05, 0.27, 0.5, 0.72, 0.95]
  const first = {}
  for (const p of probes) {
    await toP(p)
    await page.waitForTimeout(700)
    first[p] = await page.screenshot()
  }
  for (const p of [0.99, 0.01, 0.6, 0.2, 1, 0]) await toP(p)
  let same = 0
  for (const p of [...probes].reverse()) {
    await toP(p)
    await page.waitForTimeout(700)
    const a = await sharp(first[p]).raw().toBuffer()
    const b = await sharp(await page.screenshot()).raw().toBuffer()
    let sum = 0
    for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i])
    if (sum / a.length < 1) same++
  }
  check('Film réversible : mêmes images à position égale après allers-retours rapides', same === probes.length, `${same}/${probes.length}`)

  await toP(0)
  await page.waitForTimeout(200)
  const order = []
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab')
    order.push(await page.evaluate(() => (document.activeElement?.textContent || '').trim().slice(0, 30)))
  }
  check('Ordre de tabulation', order.some((o) => o.startsWith('Passer l’introduction')), order.join(' | '))

  await page.getByRole('button', { name: 'Passer l’introduction' }).click()
  await page.waitForTimeout(400)
  const atSolutions = await page.evaluate(() => Math.abs(document.getElementById('solutions').getBoundingClientRect().top) < 4 && document.activeElement?.id === 'solutions-title')
  check('« Passer l’introduction » amène aux solutions et y place le focus', atSolutions)

  await page.evaluate(() => document.getElementById('contact').scrollIntoView())
  await page.getByRole('button', { name: 'Envoyer ma demande' }).click()
  await page.waitForTimeout(300)
  const errs = await page.locator('[aria-invalid="true"]').count()
  check('Formulaire vide : erreurs signalées', errs >= 6, `${errs} champs`)
  await page.getByLabel('Nom *', { exact: true }).fill('Martin')
  await page.getByLabel('Prénom *').fill('Claire')
  await page.getByLabel('Entreprise *').fill('Exemple SAS')
  await page.getByLabel('Email professionnel *').fill('claire.martin@exemple.fr')
  await page.getByLabel('Effectif approximatif *').selectOption({ index: 2 })
  await page.getByLabel('Objet de la demande *').selectOption({ index: 1 })
  await page.getByLabel(/J’accepte/).check()
  await page.getByRole('button', { name: 'Envoyer ma demande' }).click()
  await page.waitForSelector('.form-alert-demo', { timeout: 3000 }).catch(() => {})
  check('Formulaire valide : mode démonstration affiché', (await page.locator('.form-alert-demo').count()) === 1)

  await page.setViewportSize({ width: 820, height: 1180 })
  await page.waitForTimeout(400)
  const port = await page.evaluate(() => document.querySelector('.fm-stage').dataset.layout)
  check('Redimensionnement : bascule en disposition portrait', port === 'port')
  check('Aucune erreur console', errors.length === 0, errors.slice(0, 3).join(' / '))
  await ctx.close()
}

/* 8. Réduction des mouvements */
{
  const { page, errors, ctx } = await newPage({ reducedMotion: 'reduce' })
  await page.goto(base, { waitUntil: 'networkidle' })
  const hasFilm = await page.locator('.film').count()
  const h1 = await page.locator('h1').count()
  const figures = await page.locator('.editorial-item').count()
  check('prefers-reduced-motion : parcours éditorial statique, un seul H1, 12 scènes', hasFilm === 0 && h1 === 1 && figures === 12, `film=${hasFilm} h1=${h1} scènes=${figures}`)
  await page.screenshot({ path: `${out}/reduced-top.png` })
  await page.screenshot({ path: `${out}/reduced-full.png`, fullPage: true })
  check('Aucune erreur console (réduit)', errors.length === 0, errors.slice(0, 3).join(' / '))
  await ctx.close()
}

/* 9. Film : un seul H1 et contenu indexable présent dans le DOM */
{
  const { page, ctx } = await newPage()
  await page.goto(base, { waitUntil: 'networkidle' })
  const h1 = await page.locator('h1').count()
  const text = await page.evaluate(() => document.querySelector('section.sr-only')?.textContent.length)
  check('Mode film : un seul H1 et récit complet dans le DOM', h1 === 1 && text > 800, `h1=${h1}`)
  await ctx.close()
}

/* 10. Pages secondaires */
{
  const { page, errors, ctx } = await newPage()
  for (const path of ['solutions', 'comprendre-oeth', 'entreprises-adaptees-esat', 'a-propos', 'contact']) {
    await page.goto(base + path, { waitUntil: 'networkidle' })
    const h1 = await page.locator('h1').count()
    check(`Page /${path} : rendu et H1 unique`, h1 === 1)
    await page.screenshot({ path: `${out}/page-${path}.png` })
  }
  check('Aucune erreur console (pages)', errors.length === 0, errors.slice(0, 3).join(' / '))
  await ctx.close()
}

/* 11. Mobile : menu */
{
  const { page, ctx } = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click()
  const vis = await page.locator('#nav-menu').isVisible()
  await page.screenshot({ path: `${out}/mobile-menu.png` })
  await page.keyboard.press('Escape')
  const closed = !(await page.locator('#nav-menu').isVisible())
  check('Menu mobile : ouverture, fermeture à Échap', vis && closed)
  await ctx.close()
}

await browser.close()
fs.writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2))
const failed = results.filter((r) => !r.ok).length
console.log(`\n${results.length - failed}/${results.length} vérifications réussies`)
