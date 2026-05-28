import { test, expect } from '@playwright/test';
import { gotoAuthenticated } from './helpers/auth';

test.describe('Shell & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // GisShell verifies auth on mount — inject token + mock /auth/me/
    await gotoAuthenticated(page, '/crop-planning');
  });

  test('should display main navigation', async ({ page }) => {
    // The top <nav> element inside ProductTopNav
    await expect(page.locator('header nav')).toBeVisible();

    // Sidebar nav links — these come from gisNavItems in config.tsx
    await expect(page.locator('aside nav')).toBeVisible();
  });

  test('should navigate to Climate & Risk module', async ({ page }) => {
    // The sidebar link label is 'Climate & Risk' (from config.tsx line 87)
    await page.locator('aside').getByRole('link', { name: /climate.*risk/i }).click();
    await expect(page).toHaveURL(/.*climate-risk/);
    // The Climate Risk page renders a Leaflet map — check the map container appears
    await expect(page.locator('#gis-leaflet-map-wrapper')).toBeVisible({ timeout: 10000 });
  });
});
