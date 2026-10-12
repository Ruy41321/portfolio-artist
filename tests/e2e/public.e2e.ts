import { expect, test } from '@playwright/test'

test.describe('Public site', () => {
  test('redirects the root to the preferred language', async ({ browser }) => {
    const english = await browser.newContext({ locale: 'en-US' })
    const page = await english.newPage()
    await page.goto('/')
    await expect(page).toHaveURL(/\/en$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await english.close()
  })

  test('shows Biography, Works and Contact in this order', async ({ page }) => {
    await page.goto('/it')
    const ids = await page.locator('main > section[id]').evaluateAll((els) => els.map((e) => e.id))
    expect(ids).toEqual(['about', 'works', 'contact'])
    await expect(page.getByRole('heading', { name: 'Biografia' })).toBeVisible()
    await expect(page.locator('.sidebar__name')).toContainText('Giulia Marchetti')
  })

  test('filters works by category', async ({ page }) => {
    await page.goto('/it')
    const works = page.locator('#works .masonry__item')
    await expect(works.first()).toBeVisible()
    // Other tests may add works: compare with the initial total instead of a fixed number.
    const total = await works.count()
    expect(total).toBeGreaterThanOrEqual(12)
    await page.getByRole('button', { name: 'Disegno', exact: true }).click()
    await expect(works).toHaveCount(2)
    await expect(page.getByRole('button', { name: 'Disegno', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await page.getByRole('button', { name: 'Tutti' }).click()
    await expect(works).toHaveCount(total)
  })

  test('switches between Gallery and Cards and remembers the choice', async ({ page }) => {
    await page.goto('/it')
    await expect(page.locator('[data-view="gallery"]')).toBeVisible()
    await page.getByRole('button', { name: 'Schede' }).click()
    await expect(page.locator('[data-view="cards"]')).toBeVisible()
    await expect(page.locator('.card').first()).toContainText('Disponibile')
    await page.reload()
    await expect(page.locator('[data-view="cards"]')).toBeVisible()
  })

  test('opens the lightbox, updates the URL and navigates with the keyboard', async ({ page }) => {
    await page.goto('/it')
    await page.locator('#works .work-card').first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(page).toHaveURL(/\/it\/opere\/mattino-sul-lago$/)
    await expect(dialog).toContainText('Mattino sul lago')

    await page.keyboard.press('ArrowRight')
    await expect(page).toHaveURL(/\/it\/opere\/tricolore-n-3$/)
    await expect(dialog).toContainText('Tricolore n.3')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(page).toHaveURL(/\/it$/)
  })

  test('a direct link opens the artwork page', async ({ page }) => {
    await page.goto('/it/opere/isola')
    await expect(page.getByRole('heading', { level: 1, name: 'Isola' })).toBeVisible()
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      /\/it\/opere\/isola$/,
    )
  })

  test('switches language keeping the page', async ({ page }) => {
    await page.goto('/it/opere/isola')
    await page.locator('.sidebar__foot').getByRole('link', { name: 'English' }).click()
    await expect(page).toHaveURL(/\/en\/opere\/isola$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Island' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Works', exact: true })).toBeVisible()
  })

  test('sends the contact form', async ({ page }) => {
    await page.goto('/it#contact')
    await page.getByRole('button', { name: 'Invia' }).click()
    await expect(page.getByText('Scrivi un indirizzo email valido.')).toBeVisible()

    await page.getByLabel('Nome').fill('Visitatore E2E')
    await page.getByLabel('Email').fill('visitatore@example.com')
    await page.getByLabel('Messaggio').fill('Vorrei sapere se “Isola” è disponibile.')
    await page.getByRole('button', { name: 'Invia' }).click()
    await expect(page.getByRole('status')).toHaveText('Grazie! Il messaggio è stato inviato.')
  })

  test('shows a themed 404 page', async ({ page }) => {
    const response = await page.goto('/en/does-not-exist')
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  })

  test('serves sitemap and robots', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.ok()).toBe(true)
    const xml = await sitemap.text()
    expect(xml).toContain('/it/opere/isola')
    expect(xml).toContain('hreflang="en"')
    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toContain('Disallow: /admin')
  })
})
