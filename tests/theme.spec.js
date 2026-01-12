import { test, expect } from '@playwright/test';

test('theme class applies to body when card is opened', async ({ page }) => {
    await page.goto('/');

    // Get the first postcard
    const firstCard = page.locator('.postcard').first();
    await expect(firstCard).toBeVisible();

    // Verify it corresponds to "The White Town" which is theme-yellow
    await expect(firstCard).toContainText('The White Town');

    // Click to open
    await firstCard.click();

    // Check if the card is active
    await expect(firstCard).toHaveClass(/is-active/);

    // CRITICAL: Check if body has the theme class
    const body = page.locator('body');
    await expect(body).toHaveClass(/theme-yellow/);
    await expect(body).toHaveClass(/focus-active/);

    // Close the card
    const closeButton = page.locator('.close-button');
    await closeButton.click();

    // Check if theme class is removed
    await expect(body).not.toHaveClass(/theme-yellow/);
    await expect(body).not.toHaveClass(/focus-active/);
});

test('theme class changes when opening a different card', async ({ page }) => {
    await page.goto('/');

    // "Auroville" is the second card (index 1), theme-red
    const secondCard = page.locator('.postcard').nth(1);
    await expect(secondCard).toBeVisible();
    await expect(secondCard).toContainText('Auroville');

    await secondCard.click();

    const body = page.locator('body');
    await expect(body).toHaveClass(/theme-red/);
    await expect(body).not.toHaveClass(/theme-yellow/);
});
