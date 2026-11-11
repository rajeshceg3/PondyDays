# Verify PondyDays
Pondicherry: A Digital Reverie - PWA exploring Pondicherry heritage (vite root src/, vitest unit tests, leaflet map).
## Launch
npm install, then npm run dev or npm run build && npm run preview.
## Doctor
`python3 .cursor/skills/verify-pondy-days/verify.py`
## Drive
Runs the vitest suite, builds with vite (src root), renders the built app in headless Chromium asserting the boot marker and zero JS console errors.
## Evidence
`.cursor/skills/verify-pondy-days/evidence.json`
## Cleanup
Static/streamlit server terminated after the render.
## Known boundaries
Render smoke only; scene quality unverified. Playwright e2e configs are not exercised (chromium-only sandbox).
