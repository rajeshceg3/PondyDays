
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"Page Error: {exc}"))

        page.goto("http://localhost:5173")
        page.wait_for_load_state("networkidle")

        browser.close()

if __name__ == "__main__":
    run()
