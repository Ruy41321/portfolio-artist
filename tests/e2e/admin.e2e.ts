import fs from 'node:fs'
import path from 'node:path'

import { expect, test, type Page } from '@playwright/test'
import sharp from 'sharp'

import { adminUser } from './env'

async function login(page: Page) {
  await page.goto('/admin/login')
  await page.locator('input[name="email"]').fill(adminUser.email)
  await page.locator('input[name="password"]').fill(adminUser.password)
  await page.locator('button[type="submit"]').click()
  await expect(page).toHaveURL(/\/admin$/)
}

async function makeImages(dir: string): Promise<string[]> {
  fs.mkdirSync(dir, { recursive: true })
  const colors = [
    { r: 200, g: 80, b: 60 },
    { r: 60, g: 140, b: 200 },
    { r: 230, g: 190, b: 70 },
  ]
  return Promise.all(
    colors.map(async (background, i) => {
      const file = path.join(dir, `nuova-opera-${i + 1}.jpg`)
      await sharp({ create: { width: 900, height: 700, channels: 3, background } })
        .jpeg()
        .toFile(file)
      return file
    }),
  )
}

test.describe('Admin', () => {
  test('a non-technical user publishes an artwork with 3 images in under 2 minutes', async ({
    page,
  }, testInfo) => {
    const files = await makeImages(testInfo.outputDir)
    const started = Date.now()

    await login(page)
    await expect(page.getByRole('heading', { name: /Ciao, Giulia!/ })).toBeVisible()
    await page.getByRole('link', { name: /Aggiungi opera/ }).click()
    await expect(page).toHaveURL(/\/admin\/collections\/artworks\/create/)

    await page.locator('#field-title').fill('Opera di prova E2E')

    // Upload three images at once with the bulk upload drawer.
    await page.locator('#field-images').getByRole('button', { name: 'Crea Nuovo' }).click()
    const chooser = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Seleziona un file' }).click()
    await (await chooser).setFiles(files)
    for (const file of files) {
      await page.getByRole('button', { name: new RegExp(path.basename(file)) }).click()
      await page.locator('#field-alt').fill(`Foto ${path.basename(file)}`)
    }
    await page.getByRole('button', { name: 'Salva', exact: true }).click()
    await expect(page.locator('#field-images')).toContainText('nuova-opera-3.jpg', {
      timeout: 30_000,
    })

    await page.locator('#field-category').click()
    await page.getByRole('option', { name: 'Pittura' }).click()
    await page.locator('#field-year').fill('2026')
    await page.locator('#field-technique').fill('Acrilico su tela')
    await page.locator('#field-shortDescription').fill('Un’opera creata dal test automatico.')
    const editor = page.locator('[data-lexical-editor="true"]').first()
    await editor.click()
    await editor.pressSequentially('Descrizione completa dell’opera di prova.')

    await page.locator('#action-save').click()
    await expect(page.getByText(/pubblicat|aggiornat|salvat/i).first()).toBeVisible({
      timeout: 30_000,
    })

    const elapsed = Date.now() - started
    expect(elapsed).toBeLessThan(120_000)

    // The new artwork is on the public site without any rebuild.
    await page.goto('/it/opere/opera-di-prova-e2e')
    await expect(page.getByRole('heading', { level: 1, name: 'Opera di prova E2E' })).toBeVisible()
    await expect(page.locator('.artwork__figure img')).toHaveCount(3)
    await page.goto('/it')
    await expect(page.locator('#works')).toContainText('Opera di prova E2E')
  })

  test('creates a draft artwork from an image', async ({ page }) => {
    await login(page)
    await page.goto('/admin/collections/media')
    await page
      .locator('table tbody tr')
      .filter({ hasText: 'demo-dune' })
      .first()
      .getByRole('link')
      .first()
      .click()
    await page.getByRole('button', { name: /Crea un’opera da questa immagine/ }).click()
    await expect(page).toHaveURL(/\/admin\/collections\/artworks\/\d+/)
    await expect(page.locator('#field-title')).toHaveValue(/Demo dune/i)
  })

  test('drafts stay hidden from the public site', async ({ page, request }) => {
    await login(page)
    await page.goto('/admin/collections/artworks/create')
    await page.locator('#field-title').fill('Bozza nascosta E2E')
    await page.locator('#action-save-draft').click()
    await expect(page).toHaveURL(/\/admin\/collections\/artworks\/\d+/)
    const response = await request.get('/it/opere/bozza-nascosta-e2e')
    expect(response.status()).toBe(404)
  })

  test('rejects uploads that are too large or of a forbidden type', async ({ request }) => {
    const login = await request.post('/api/users/login', { data: adminUser })
    expect(login.ok()).toBe(true)
    const { token } = (await login.json()) as { token: string }
    const headers = { Authorization: `JWT ${token}` }

    // MAX_UPLOAD_MB is 5 in the e2e environment.
    const big = await sharp({
      create: { width: 4000, height: 4000, channels: 3, background: { r: 10, g: 20, b: 30 } },
    })
      .png({ compressionLevel: 0 })
      .toBuffer()
    expect(big.length).toBeGreaterThan(5 * 1024 * 1024)
    const tooLarge = await request.post('/api/media', {
      headers,
      multipart: {
        file: { name: 'grande.png', mimeType: 'image/png', buffer: big },
        _payload: JSON.stringify({ alt: 'Troppo grande' }),
      },
    })
    expect(tooLarge.ok()).toBe(false)
    expect([400, 413]).toContain(tooLarge.status())

    const html = await request.post('/api/media', {
      headers,
      multipart: {
        file: { name: 'pagina.html', mimeType: 'text/html', buffer: Buffer.from('<h1>x</h1>') },
        _payload: JSON.stringify({ alt: 'HTML' }),
      },
    })
    expect(html.ok()).toBe(false)
  })
})
