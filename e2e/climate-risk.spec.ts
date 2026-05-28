import { test, expect } from '@playwright/test';
import { gotoAuthenticated } from './helpers/auth';

test.describe('Climate Risk Map', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, '/climate-risk');
  });

  test('should render the climate risk page', async ({ page }) => {
    // The page renders inside GisShell, so the sidebar should be present
    await expect(page.locator('aside')).toBeVisible();
  });

  test('should render the map container', async ({ page }) => {
    // Leaflet renders a div.leaflet-container once the map mounts.
    // Use a longer timeout as map tiles can take a moment to initialise.
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible({ timeout: 15000 });
  });
});
