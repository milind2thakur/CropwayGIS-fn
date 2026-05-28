import { test, expect } from '@playwright/test';
import { gotoAuthenticated, mockAuth } from './helpers/auth';

test.describe('Login & Registration Flow', () => {

  test.describe('Login & OTP Verification Flow', () => {
    test('should allow a user to select role, enter phone number, request and verify OTP', async ({ page }) => {
      // Mock the send OTP api call
      await page.route('**/api/v1/auth/send-otp/', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, message: 'OTP sent successfully' }),
        });
      });

      // Mock the verify OTP api call
      await page.route('**/api/v1/auth/verify-otp/', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              token: 'test-session-token',
              user: { id: 1, phone_number: '9876543210', role: 'Farmer' },
            },
          }),
        });
      });

      // Also mock auth/me so any redirect back to an authed page works
      await mockAuth(page);

      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // 1. Role Selection — default should be 'Farmer'
      const farmerTab = page.getByRole('button', { name: 'Farmer', exact: true });
      await expect(farmerTab).toHaveClass(/bg-\[#2B4D1A\]/);

      // Change role to FPOs and check style changes
      const fpoTab = page.getByRole('button', { name: 'FPOs', exact: true });
      await fpoTab.click();
      await expect(fpoTab).toHaveClass(/bg-\[#2B4D1A\]/);
      await expect(farmerTab).not.toHaveClass(/bg-\[#2B4D1A\]/);

      // Re-select Farmer role for rest of test
      await farmerTab.click();

      // 2. Phone Input
      const phoneInput = page.getByPlaceholder('Enter your phone number here');
      await expect(phoneInput).toBeVisible();

      // Submit button should be disabled with empty / too-short number
      const getOtpButton = page.getByRole('button', { name: 'Get OTP' });
      await expect(getOtpButton).toBeDisabled();

      // Enter valid 10-digit phone number
      await phoneInput.fill('9876543210');
      await expect(getOtpButton).toBeEnabled();

      // Click Get OTP — this triggers navigation to OTP page
      await getOtpButton.click();

      // 3. OTP Page
      await expect(page).toHaveURL(/.*\/login\/otp\?phone=9876543210/);
      await expect(page.getByRole('heading', { name: 'Enter OTP' })).toBeVisible();
      await expect(page.getByText("We've sent you OTP at your entered mobile number")).toBeVisible();

      // Submit OTP button should be disabled until all 6 digits are filled
      const submitOtpButton = page.getByRole('button', { name: 'Submit OTP' });
      await expect(submitOtpButton).toBeDisabled();

      // Fill in OTP boxes one by one
      const otpInputs = page.locator('input[inputmode="numeric"]');
      await expect(otpInputs).toHaveCount(6);
      for (let i = 0; i < 6; i++) {
        await otpInputs.nth(i).fill(`${i + 1}`);
      }

      await expect(submitOtpButton).toBeEnabled();

      // Submit and verify redirection to home/dashboard
      await submitOtpButton.click();
      await expect(page).toHaveURL(/.*\/home/);
    });

    test('should display error message when sending OTP fails', async ({ page }) => {
      // Mock the send OTP call to return an API-error shaped response
      await page.route('**/api/v1/auth/send-otp/', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          // apiFetch reads json.error.message for non-ok responses
          body: JSON.stringify({ error: { message: 'Invalid phone number format.' } }),
        });
      });

      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      const phoneInput = page.getByPlaceholder('Enter your phone number here');
      await phoneInput.fill('1234567890');

      const getOtpButton = page.getByRole('button', { name: 'Get OTP' });
      await getOtpButton.click();

      // The error rendered by LoginPage (<p className="...text-red-500">) should appear
      await expect(page.getByText('Invalid phone number format.')).toBeVisible();
    });
  });

  test.describe('Registration Multi-Step Flow', () => {
    test('should complete personal details, Aadhaar verification, and land details steps', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');

      // ── Step 0: Personal Details ─────────────────────────────────────────────
      // Wait for the stepper sidebar text to confirm we are on step 0
      await expect(page.getByText('Personal Details').first()).toBeVisible({ timeout: 10000 });

      const firstNameInput = page.getByPlaceholder('First name');
      const lastNameInput  = page.getByPlaceholder('Last name');
      const phoneInput     = page.getByPlaceholder('+91 1234567890');
      const pinInput       = page.getByPlaceholder('492001');
      const detailedAddressTextarea = page.getByPlaceholder('Q6, Anupam nagar, Shankar nagar.');

      // Next button must be disabled initially (required fields empty)
      const nextButton = page.getByRole('button', { name: 'Next', exact: true });
      await expect(nextButton).toBeDisabled();

      // Fill required fields
      await firstNameInput.fill('John');
      await lastNameInput.fill('Doe');
      await phoneInput.fill('9876543210');
      await pinInput.fill('492001');
      await detailedAddressTextarea.fill('123 Green Field Way, Raipur');

      // Verify Clear button resets fields
      const clearButton = page.getByRole('button', { name: 'Clear' }).first();
      await clearButton.click();
      await expect(firstNameInput).toHaveValue('');
      await expect(lastNameInput).toHaveValue('');

      // Fill again to proceed
      await firstNameInput.fill('John');
      await lastNameInput.fill('Doe');
      await phoneInput.fill('9876543210');
      await pinInput.fill('492001');
      await expect(nextButton).toBeEnabled();

      // Navigate to step 1
      await nextButton.click();

      // ── Step 1: Aadhaar Verification ─────────────────────────────────────────
      await expect(page.getByText('Aadhar Verification').first()).toBeVisible({ timeout: 10000 });

      const aadharInput  = page.getByPlaceholder('Enter 16 digit aadhar number here');
      const verifyButton = page.getByRole('button', { name: 'Verify' });
      const sendOtpButton = page.getByRole('button', { name: 'Send OTP' });

      // Verify button disabled while Aadhaar field is empty
      await expect(verifyButton).toBeDisabled();

      // Fill Aadhaar number
      await aadharInput.fill('1234567890123456');
      // Consent is checked by default + OTP not yet sent → enabled
      await expect(verifyButton).toBeEnabled();

      // Send OTP reveals the OTP field
      await sendOtpButton.click();
      await expect(page.getByText("We've sent OTP to registered mobile number")).toBeVisible();

      // Verify disabled again because OTP field is now required
      await expect(verifyButton).toBeDisabled();

      // Fill Aadhaar OTP (placeholder is "0")
      const aadharOtpInput = page.getByPlaceholder('0');
      await aadharOtpInput.fill('9999');
      await expect(verifyButton).toBeEnabled();

      // Navigate to step 2
      await verifyButton.click();

      // ── Step 2: Land Details ─────────────────────────────────────────────────
      await expect(page.getByText('Land Details').first()).toBeVisible({ timeout: 10000 });

      const districtInput = page.getByPlaceholder('District name');
      const talukaInput   = page.getByPlaceholder('Enter Taluka name');
      const villageInput  = page.getByPlaceholder('Enter Village name');
      const surveyNoInput = page.getByPlaceholder('Enter Survey No.');
      const khataNoInput  = page.getByPlaceholder('Enter Khata no.');
      const ownerNameInput = page.getByPlaceholder('Owner name');
      const registerButton = page.getByRole('button', { name: 'Register' });

      await expect(registerButton).toBeDisabled();

      await districtInput.fill('Raipur District');
      await talukaInput.fill('Raipur Taluka');
      await villageInput.fill('Green Village');
      await surveyNoInput.fill('102/B');
      await khataNoInput.fill('555');
      await ownerNameInput.fill('John Doe Sr.');

      await expect(registerButton).toBeEnabled();

      // Final submit → redirects to /login
      await registerButton.click();
      await expect(page).toHaveURL(/.*\/login/);
    });
  });
});
