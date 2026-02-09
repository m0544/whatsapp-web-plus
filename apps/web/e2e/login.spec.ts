import { expect, test } from '@playwright/test';

test.describe('Login', () => {
  test('login page shows title and QR or waiting state', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByText(/WhatsApp Web Plus|טוען חיבור|סרוק את קוד ה-QR|מחכה ל-QR|החיבור יתחיל|מחובר/i)
    ).toBeVisible({ timeout: 15_000 });
  });

  test('has link or instruction for pairing', async ({ page }) => {
    await page.goto('/login');
    await expect(
      page.getByText(/מכשירים מחוברים|חבר מכשיר|QR/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
