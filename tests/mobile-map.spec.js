import { test, expect } from '@playwright/test';
for (const width of [320, 390, 1280]) {
    test(`map and postcard flow fits ${width}px`, async ({ page }) => {
        test.setTimeout(90000);
        await page.setViewportSize({ width, height: 844 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto('/');
        await expect(page.locator('.postcard').first()).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
        await page.screenshot({ path: `/downloads/pondy-gallery-${width}.png`, fullPage: false });
        await page.getByRole('button', { name: 'Map View', exact: true }).click();
        await expect(page.locator('.leaflet-marker-icon').first()).toBeVisible();
        await page.waitForFunction(() => {
            const map = document.querySelector('#map')._warmMap;
            return map && map.queryRenderedFeatures().length > 0;
        });
        await page.waitForTimeout(1200);
        const box = await page.locator('#map').boundingBox();
        expect(box.x).toBe(0);
        expect(box.y).toBe(0);
        expect(Math.abs(box.width - width)).toBeLessThan(1);
        expect(box.height).toBe(844);
        await expect(page.getByRole('button', { name: 'Gallery View', exact: true })).toBeVisible();
        await expect(page.locator('.leaflet-control-attribution')).toBeVisible();
        await page.screenshot({ path: `/downloads/pondy-map-${width}.png` });
        const count = await page.locator('.leaflet-marker-icon').count();
        for (let i = 0; i < count; i++) {
            if (i > 0) {
                await page.getByRole('button', { name: 'Map View', exact: true }).click();
                await expect(page.locator('#map')).toBeVisible();
            }
            await page.locator('.leaflet-marker-icon').nth(i).focus();
            await page.keyboard.press('Enter');
            await expect(page.locator('.postcard.is-active')).toHaveAttribute('data-index', String(i));
            await expect(page.locator('.map-view-button')).toHaveAttribute('aria-expanded', 'false');
            await page.waitForTimeout(700);
            const detailBox = await page.locator('.postcard.is-active').boundingBox();
            expect(detailBox.x).toBeGreaterThanOrEqual(0);
            expect(detailBox.y).toBeGreaterThanOrEqual(0);
            expect(detailBox.x + detailBox.width).toBeLessThanOrEqual(width);
            expect(detailBox.y + detailBox.height).toBeLessThanOrEqual(844);
            await expect(page.locator('.focus-content').nth(i)).toBeInViewport();
            if (i === 0) await page.screenshot({ path: `/downloads/pondy-detail-${width}.png` });
            await page.keyboard.press('Escape');
            await expect(page.locator('.postcard.is-active')).toHaveCount(0);
        }
        await page.getByRole('button', { name: 'Map View', exact: true }).click();
        await page.getByRole('button', { name: 'Gallery View', exact: true }).click();
        await expect(page.locator('.map-view-button')).toHaveAttribute('aria-expanded', 'false');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
        expect(errors).toEqual([]);
    });
}
