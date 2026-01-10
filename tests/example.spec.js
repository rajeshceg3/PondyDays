import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Pondicherry/);
});

test('cards are loaded dynamically', async ({ page }) => {
  await page.goto('/');
  // Wait for postcards to be present
  await expect(page.locator('.postcard').first()).toBeVisible();
  const postcards = await page.locator('.postcard').count();
  expect(postcards).toBeGreaterThan(0);
});

test('cards can be opened and closed', async ({ page }) => {
  await page.goto('/');

  // Wait for postcards
  const firstCard = page.locator('.postcard').first();
  await expect(firstCard).toBeVisible();

  // Click the first postcard
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

    // Check if map container is visible
    const map = page.locator('#map');
    await expect(map).toBeVisible();

    await mapButton.click();
    await expect(mainContent).not.toHaveClass(/map-active/);
});

test('marker click opens postcard', async ({ page }) => {
    await page.goto('/');

    const mapButton = page.locator('.map-view-button');
    await mapButton.click();

    // Wait for map to be active and markers to load
    const map = page.locator('#map');
    await expect(map).toBeVisible();

    // Leaflet markers are usually images with class leaflet-marker-icon
    // We wait for at least one marker
    const marker = page.locator('.leaflet-marker-icon').first();
    await expect(marker).toBeVisible();

    // Force click because sometimes the marker animation or map tiles might be overlaying
    // or the "stability" check fails due to map rendering.
    await marker.click({ force: true });

    // We need to wait for the transition.
    const mainContent = page.locator('.main-content');
    await expect(mainContent).not.toHaveClass(/map-active/, { timeout: 5000 });

    // Check if a card is active.
    const activeCard = page.locator('.postcard.is-active');
    await expect(activeCard).toBeVisible({ timeout: 5000 });
});
