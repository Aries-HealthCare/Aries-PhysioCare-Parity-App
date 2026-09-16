import { test, expect } from '@playwright/test';

test.describe('expert parity critical journeys', () => {
  test('login page renders expert auth', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/Aries/i)).toBeVisible();
  });
});
