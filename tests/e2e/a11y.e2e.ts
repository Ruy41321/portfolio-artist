import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const pages = ['/it', '/en', '/it/opere/campo-destate', '/it/privacy', '/it/pagina-inesistente']

test.describe('Accessibility (axe)', () => {
  for (const path of pages) {
    test(`no serious or critical violations on ${path}`, async ({ page }) => {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
      const blocking = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      )
      expect(
        blocking.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
      ).toEqual([])
    })
  }

  test('lightbox is accessible', async ({ page }) => {
    await page.goto('/it')
    await page.locator('#works .work-card').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').analyze()
    expect(
      results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious'),
    ).toEqual([])
  })
})
