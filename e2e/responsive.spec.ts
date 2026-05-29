import { expect, test, type Page } from '@playwright/test';
import { MOCK_TOKEN, mockAuth } from './helpers/auth';

const routes = ['/home', '/land-intelligence', '/monitoring-detection', '/crop-planning'];
const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
];

test.describe('Responsive layout matrix', () => {
  async function gotoResponsiveRoute(page: Page, route: string) {
    await mockAuth(page);
    await page.addInitScript((token) => {
      localStorage.setItem('cropwaygis_auth_token', token);
    }, MOCK_TOKEN);
    await page.goto(route, { waitUntil: 'domcontentloaded' });
  }

  for (const viewport of viewports) {
    for (const route of routes) {
      test(`${route} has no page overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await gotoResponsiveRoute(page, route);

        await page.locator('main').waitFor({ state: 'attached' });
        await page.waitForTimeout(250);

        const overflow = await page.evaluate(() => {
          const root = document.documentElement;
          return root.scrollWidth - root.clientWidth;
        });

        expect(overflow).toBeLessThanOrEqual(2);
      });
    }
  }

  test('mobile shell menu remains usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoResponsiveRoute(page, '/crop-planning');

    await expect(page.getByRole('button', { name: /gis menu/i })).toBeVisible();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /gis menu/i }).click();
    const mobileOverlay = page.locator('div.fixed.inset-0.z-50');
    await expect(mobileOverlay).toBeVisible();
    await expect(page.getByRole('link', { name: /land intelligence/i }).last()).toBeVisible();
    await page.getByRole('button', { name: /close menu/i }).last().click();
    await expect(mobileOverlay).toBeHidden();
  });
});
