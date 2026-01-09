import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Pondicherry/);
});

test('cards can be opened and closed', async ({ page }) => {
  await page.goto('/');

  // Click the first postcard
  const firstCard = page.locator('.postcard').first();
  await firstCard.click();

  // Check if it has class is-active
  await expect(firstCard).toHaveClass(/is-active/);

  // Check if close button is visible
  const closeButton = page.locator('.close-button');
  await expect(closeButton).toBeVisible();

  // Close the card
  await closeButton.click();

  // Check if it is no longer active
  await expect(firstCard).not.toHaveClass(/is-active/);
});

test('map view toggles', async ({ page }) => {
    await page.goto('/');

    const mapButton = page.locator('.map-view-button');
    const mainContent = page.locator('.main-content');

    await mapButton.click();
    await expect(mainContent).toHaveClass(/map-active/);

    // Check if map container is visible (has height)
    const map = page.locator('#map');
    await expect(map).toBeVisible();

    await mapButton.click();
    await expect(mainContent).not.toHaveClass(/map-active/);
});
