
import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Abort requests to MapController to simulate failure
        # Using wildcard to match hashed filename in production
        await page.route("**/MapController-*.js", lambda route: route.abort())

        # Go to production preview
        await page.goto("http://localhost:4173")

        # Click the map view button to trigger loading
        await page.click(".map-view-button")

        # Wait for the retry button to appear in the DOM
        retry_button = await page.wait_for_selector(".retry-button")

        # Scroll the retry button into view to ensure it's in the screenshot
        await retry_button.scroll_into_view_if_needed()

        # Take a screenshot
        await page.screenshot(path="verification_map_retry_prod.png")

        await browser.close()

asyncio.run(run())
