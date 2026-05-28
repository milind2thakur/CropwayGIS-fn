/**
 * Shared Playwright fixtures and helpers for the CropwayGIS E2E test suite.
 *
 * The app checks auth on mount by calling GET /api/v1/auth/me/.
 * Any page rendered inside GisShell that calls this endpoint will redirect
 * to /login if unauthenticated. We mock the endpoint to bypass the guard.
 */

import { Page } from '@playwright/test';

export const MOCK_USER = {
  id: 1,
  username: 'testfarmer',
  phone_number: '9876543210',
};

export const MOCK_TOKEN = 'test-e2e-token';

/**
 * Call this at the start of any test that needs to be authenticated.
 * It:
 *  1. Sets the auth token in localStorage.
 *  2. Intercepts GET /api/v1/auth/me/ with a mocked user response so GisShell
 *     does not redirect to /login.
 */
export async function mockAuth(page: Page): Promise<void> {
  // Intercept the auth check endpoint
  await page.route('**/api/v1/auth/me/', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MOCK_USER }),
    });
  });

  // Also intercept the proxy fallback path (apiFetch falls back to /api/proxy*)
  await page.route('**/api/proxy/api/v1/auth/me/', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: MOCK_USER }),
    });
  });
}

/**
 * Navigate to a page and inject auth state before React hydrates, so the
 * AuthContext picks up the token from localStorage on startup.
 */
export async function gotoAuthenticated(page: Page, path: string): Promise<void> {
  await mockAuth(page);

  // Set localStorage before navigation so the token is available on first render
  await page.addInitScript((token) => {
    localStorage.setItem('cropwaygis_auth_token', token);
  }, MOCK_TOKEN);

  await page.goto(path);
  await page.waitForLoadState('networkidle');
}
