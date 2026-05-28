import { test, expect } from '@playwright/test';
import { gotoAuthenticated } from './helpers/auth';

test.describe('Land Intelligence', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, '/land-intelligence');
  });

  test('should display land intelligence page inside the shell', async ({ page }) => {
    // GisShell sidebar and main content area should be present
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('should render the map container', async ({ page }) => {
    // LandIntelligenceClient mounts a Leaflet map; wait up to 15s for tile load
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible({ timeout: 15000 });
  });

  test('should display the map tool bar', async ({ page }) => {
    // The MapToolbar renders tool buttons: Draw area, Pin location, Select, etc.
    // Use a flexible text match since the toolbar renders aria-labels or text
    await expect(page.getByText('Draw area')).toBeVisible({ timeout: 10000 });
  });
});
