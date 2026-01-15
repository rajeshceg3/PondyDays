
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Go to the production preview URL
        page.goto("http://localhost:4173")

        # Press Tab to focus the skip link
        page.keyboard.press("Tab")

        # Check if the skip link is focused and visible
        skip_link = page.locator(".skip-link")
        is_focused = skip_link.evaluate("el => document.activeElement === el")
        is_visible = skip_link.is_visible()

        print(f"Skip link focused: {is_focused}")
        print(f"Skip link visible: {is_visible}")

        if is_focused and is_visible:
            page.screenshot(path="verification_skip_link_prod.png")
            print("Screenshot saved: verification_skip_link_prod.png")

        browser.close()

if __name__ == "__main__":
    run()
