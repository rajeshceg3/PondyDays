
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://localhost:5173")

        # Wait for the skip link to exist
        page.wait_for_selector(".skip-link")

        # Get computed style
        bg_color = page.eval_on_selector(".skip-link", "el => window.getComputedStyle(el).backgroundColor")
        color = page.eval_on_selector(".skip-link", "el => window.getComputedStyle(el).color")
        top = page.eval_on_selector(".skip-link", "el => window.getComputedStyle(el).top")

        print(f"Background Color: {bg_color}")
        print(f"Color: {color}")
        print(f"Top: {top}")

        browser.close()

if __name__ == "__main__":
    run()
