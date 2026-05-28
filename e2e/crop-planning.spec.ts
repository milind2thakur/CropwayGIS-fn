import { test, expect } from '@playwright/test';
import { gotoAuthenticated } from './helpers/auth';

test.describe('Crop Planning', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, '/crop-planning');
  });

  test('should display the crop planning page with heading', async ({ page }) => {
    // h1 in CropPlanningClient reads "Plan Crop"
    await expect(page.getByRole('heading', { name: 'Plan Crop', exact: true })).toBeVisible();
  });

  test('should display the crop search input and season selector', async ({ page }) => {
    await expect(page.getByPlaceholder('Search Crop')).toBeVisible();

    // Season toggle buttons
    await expect(page.getByRole('button', { name: 'Kharif' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Rabi' })).toBeVisible();
  });

  test('should show empty state when no crop is selected', async ({ page }) => {
    await expect(page.getByText('Search and select a crop to start planning.')).toBeVisible();
  });
});
