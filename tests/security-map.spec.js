import { test, expect } from '@playwright/test';
for (const width of [320, 390]) {
    test(`normal-motion touch map renders at ${width}px`, async ({ browser }) => {
        test.setTimeout(90000);
        const context = await browser.newContext({ viewport: { width, height: 844 }, hasTouch: true, isMobile: true });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto('/');
        await page.getByRole('button', { name: 'Map View', exact: true }).tap();
        await page.waitForFunction(() => document.querySelector('#map')._warmMap?.queryRenderedFeatures().length > 0);
        await page.screenshot({ path: `/downloads/pondy-security-normal-map-${width}.png` });
        await page.locator('.leaflet-marker-icon').last().tap();
        const card = page.locator('.postcard.is-active');
        await expect(card).toBeVisible();
        await page.waitForTimeout(1700);
        const box = await card.boundingBox();
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.y + box.height).toBeLessThanOrEqual(844);
        await card.locator('.focus-content').evaluate(element => element.scrollTop = element.scrollHeight);
        await expect(card.locator('.focus-content p').last()).toBeInViewport();
        await page.locator('.close-button').tap();
        await expect(card).toHaveCount(0);
        expect(errors).toEqual([]);
        await context.close();
    });
}
test('built PWA precaches the module worker and reloads the gallery offline', async ({ page, context }) => {
    await page.goto('/');
    test.skip(!(await page.evaluate(() => 'serviceWorker' in navigator && document.querySelector('script[src*="registerSW"]'))), 'Production build only');
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.waitForFunction(() => navigator.serviceWorker.controller);
    await page.waitForFunction(async () => (await caches.keys()).some(key => key.includes('precache')));
    const cacheKeys = await page.evaluate(async () => {
        const keys = [];
        for (const cacheName of await caches.keys()) {
            const cache = await caches.open(cacheName);
            keys.push(...(await cache.keys()).map(request => request.url));
        }
        return keys;
    });
    expect(cacheKeys.some(url => /maplibre-gl-worker.*\.mjs/.test(url))).toBeTruthy();
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('.postcard').first()).toBeVisible();
    await expect(page).toHaveTitle(/Pondicherry/);
    await context.setOffline(false);
});
