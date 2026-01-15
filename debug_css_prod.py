
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        page.on("console", lambda msg: print(f"Console: {msg.text}"))

        # Check port 4173 (Preview/Production)
        page.goto("http://localhost:4173")

        # Wait for the skip link to exist
        page.wait_for_selector(".skip-link")

        # Get computed style
        bg_color = page.eval_on_selector(".skip-link", "el => window.getComputedStyle(el).backgroundColor")
        color = page.eval_on_selector(".skip-link", "el => window.getComputedStyle(el).color")

        print(f"Background Color: {bg_color}")
        print(f"Color: {color}")

        browser.close()

if __name__ == "__main__":
    run()
