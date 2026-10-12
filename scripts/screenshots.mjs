// Takes the screenshots used in README.md and docs/GUIDA-ARTISTA.md from a running
// instance with demo data (`pnpm seed`).
//   BASE_URL=http://localhost:3000 ADMIN_EMAIL=… ADMIN_PASSWORD=… node scripts/screenshots.mjs
import fs from 'node:fs'
import path from 'node:path'

import { chromium } from '@playwright/test'

const base = process.env.BASE_URL || 'http://localhost:3000'
const email = process.env.ADMIN_EMAIL || process.env.SEED_ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD
const out = path.resolve('docs/images')
fs.mkdirSync(out, { recursive: true })

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
  console.log('saved', name)
}

// Public site
const site = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await site.goto(`${base}/it`, { waitUntil: 'networkidle' })
await shot(site, 'site-home')
await site.locator('#works').scrollIntoViewIfNeeded()
await site.evaluate(() => window.scrollBy(0, -40))
await shot(site, 'site-gallery')
await site.getByRole('button', { name: 'Schede' }).click()
await shot(site, 'site-cards')
await site.locator('.card').first().click()
await shot(site, 'site-lightbox')
await site.keyboard.press('Escape')
await site.getByRole('button', { name: 'Galleria' }).click()
await site.goto(`${base}/it/opere/campo-destate`, { waitUntil: 'networkidle' })
await shot(site, 'site-artwork')

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true })
await mobile.goto(`${base}/it`, { waitUntil: 'networkidle' })
await shot(mobile, 'site-mobile')

// Admin
if (email && password) {
  const admin = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'it-IT' })
  await admin.goto(`${base}/admin/login`, { waitUntil: 'networkidle' })
  await shot(admin, 'admin-login')
  await admin.locator('input[name="email"]').fill(email)
  await admin.locator('input[name="password"]').fill(password)
  await admin.locator('button[type="submit"]').click()
  await admin.waitForURL(/\/admin$/)
  await admin.waitForLoadState('networkidle')
  await shot(admin, 'admin-dashboard')

  const pages = [
    ['admin-artworks', '/admin/collections/artworks'],
    ['admin-categories', '/admin/collections/categories'],
    ['admin-profile', '/admin/globals/profile'],
    ['admin-settings', '/admin/globals/site-settings'],
    ['admin-messages', '/admin/collections/messages'],
    ['admin-media', '/admin/collections/media'],
  ]
  for (const [name, url] of pages) {
    await admin.goto(`${base}${url}`, { waitUntil: 'networkidle' })
    await shot(admin, name)
  }

  await admin.goto(`${base}/admin/collections/artworks`, { waitUntil: 'networkidle' })
  await admin.locator('table tbody tr').first().getByRole('link').first().click()
  await admin.waitForLoadState('networkidle')
  await shot(admin, 'admin-artwork-edit', { fullPage: true })

  await admin.getByRole('button', { name: /Locale/ }).click()
  await admin.getByRole('button', { name: 'English' }).click()
  await admin.waitForLoadState('networkidle')
  await shot(admin, 'admin-artwork-english')

  await admin.goto(`${base}/admin/collections/artworks/create`, { waitUntil: 'networkidle' })
  await shot(admin, 'admin-artwork-new')
  await admin.locator('#field-images').getByRole('button', { name: 'Crea Nuovo' }).click()
  await shot(admin, 'admin-bulk-upload')
}

await browser.close()
