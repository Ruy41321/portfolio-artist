// Takes the screenshots used in the README files and in docs/<lang>/ from a running
// instance with demo data (`pnpm seed`). Images are saved in docs/images/<lang>/.
//   SHOTS_LANG=it|en BASE_URL=http://localhost:3000 ADMIN_EMAIL=… ADMIN_PASSWORD=… \
//     node scripts/screenshots.mjs
import fs from 'node:fs'
import path from 'node:path'

import { chromium } from '@playwright/test'

const lang = process.env.SHOTS_LANG === 'en' ? 'en' : 'it'
const base = process.env.BASE_URL || 'http://localhost:3000'
const email = process.env.ADMIN_EMAIL || process.env.SEED_ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD
const out = path.resolve('docs/images', lang)
fs.mkdirSync(out, { recursive: true })

// UI labels used to drive the pages, per language.
const labels = {
  it: {
    browserLocale: 'it-IT',
    cards: 'Schede',
    gallery: 'Galleria',
    createNew: 'Crea Nuovo',
  },
  en: {
    browserLocale: 'en-US',
    cards: 'Cards',
    gallery: 'Gallery',
    createNew: 'Create New',
  },
}[lang]

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
})

async function shot(page, name, options = {}) {
  await page.waitForTimeout(400)
  await page.screenshot({
    path: path.join(out, `${name}.jpg`),
    type: 'jpeg',
    quality: 80,
    ...options,
  })
  console.log('saved', `${lang}/${name}`)
}

// Public site
const site = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  locale: labels.browserLocale,
})
await site.goto(`${base}/${lang}`, { waitUntil: 'networkidle' })
await shot(site, 'site-home')
await site.locator('#works').scrollIntoViewIfNeeded()
await site.evaluate(() => window.scrollBy(0, -40))
await shot(site, 'site-gallery')
await site.getByRole('button', { name: labels.cards }).click()
await shot(site, 'site-cards')
await site.locator('.card').first().click()
await shot(site, 'site-lightbox')
await site.keyboard.press('Escape')
await site.getByRole('button', { name: labels.gallery }).click()
await site.goto(`${base}/${lang}/opere/campo-destate`, { waitUntil: 'networkidle' })
await shot(site, 'site-artwork')

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  locale: labels.browserLocale,
})
await mobile.goto(`${base}/${lang}`, { waitUntil: 'networkidle' })
await shot(mobile, 'site-mobile')

// Admin (its language follows the browser language)
if (email && password) {
  const admin = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    locale: labels.browserLocale,
  })
  await admin.goto(`${base}/admin/login`, { waitUntil: 'networkidle' })
  await shot(admin, 'admin-login')
  await admin.locator('input[name="email"]').fill(email)
  await admin.locator('input[name="password"]').fill(password)
  await admin.locator('button[type="submit"]').click()
  await admin.waitForURL(/\/admin$/)
  await admin.waitForLoadState('networkidle')
  await shot(admin, 'admin-dashboard')

  const pages = [
    ['admin-artworks', '/admin/collections/artworks?locale=it'],
    ['admin-categories', '/admin/collections/categories?locale=it'],
    ['admin-profile', '/admin/globals/profile?locale=it'],
    ['admin-settings', '/admin/globals/site-settings?locale=it'],
    ['admin-messages', '/admin/collections/messages?locale=it'],
    ['admin-media', '/admin/collections/media?locale=it'],
  ]
  for (const [name, url] of pages) {
    await admin.goto(`${base}${url}`, { waitUntil: 'networkidle' })
    await shot(admin, name)
  }

  await admin.goto(`${base}/admin/collections/artworks`, { waitUntil: 'networkidle' })
  await admin.locator('table tbody tr').first().getByRole('link').first().click()
  await admin.waitForURL(/\/artworks\/\d+/)
  // The content language is remembered per user: always start from Italian.
  const editUrl = admin.url().split('?')[0]
  await admin.goto(`${editUrl}?locale=it`, { waitUntil: 'networkidle' })
  await shot(admin, 'admin-artwork-edit', { fullPage: true })

  // Content language switch: shows the English translation of an artwork.
  await admin.getByRole('button', { name: /Locale/ }).click()
  await admin.getByRole('button', { name: 'English' }).click()
  await admin.waitForLoadState('networkidle')
  await shot(admin, 'admin-artwork-english')

  await admin.goto(`${base}/admin/collections/artworks/create?locale=it`, {
    waitUntil: 'networkidle',
  })
  await shot(admin, 'admin-artwork-new')
  await admin.locator('#field-images').getByRole('button', { name: labels.createNew }).click()
  await shot(admin, 'admin-bulk-upload')
}

await browser.close()
