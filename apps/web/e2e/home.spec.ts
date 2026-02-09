import { expect, test } from '@playwright/test';

test.describe('Home', () => {
  test('loads and shows app title or main content', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByRole('link', { name: /התחבר|WhatsApp/i })).toBeVisible({ timeout: 10_000 });
  });

  test('navigation to login works', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /התחבר.*התנתק|WhatsApp/ }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});
