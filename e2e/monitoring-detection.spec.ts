import { test, expect } from '@playwright/test';
import { gotoAuthenticated } from './helpers/auth';

test.describe('Monitoring & Detection', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, '/monitoring-detection');
  });

  test('should display the monitoring page inside the shell', async ({ page }) => {
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });
});
