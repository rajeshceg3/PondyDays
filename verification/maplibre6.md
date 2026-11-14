# MapLibre security repair, 14 November 2026

MapLibre 5.24.1 was affected by GHSA-jrc7-96c5-q579. Updated to exact 6.18.0, with its module worker bundled by Vite. Warm style, camera, postcards and controls are unchanged.

The old dependency tree had 31 audit findings. Vite 7.3.8, Vitest 4.1.12 and PWA plugin 1.3 clear direct tool advisories. Workbox's glob is overridden to 14.0.6+ and deepmerge to the unaffected 4.1.1 release because the currently published 4.3.1 is affected. These are build-time dependencies. The built service worker and offline gallery reload are tested. Module worker .mjs files are included in the precache. npm 10 crashed during normal peer traversal, so legacy-peer-deps=true is recorded and a fresh npm ci checked for repeatability.

Local gates:
- Fresh npm ci and npm audit: zero vulnerabilities.
- Lint: clean. Unit tests: 19/19.
- Build, including generated service worker: passes.
- All existing 10 browser tests plus 3 new normal-motion touch/offline tests pass against production build, run in separate bounded groups.
- All 22 map marker-to-postcard flows at 320/390/1280, reduced motion, Escape/scroll/bounds and no runtime errors.
- Normal-motion touch at 320/390, actual rendered map features, final postcard full text and close.
- Before/after map pixels inspected at 320/390: unchanged warm palette, labels, coast and camera. Card details remain in the viewport.

CI runs against the built app rather than a dev-only PWA. Ubuntu 24.04 and Chromium only avoid legacy browser-install failures. The full 22-place browser checks have a 90-second test budget. Physical iPhone/Safari not tested. Offline test covers app/gallery assets, not offline basemap tiles.

Production status must be checked separately after green CI and preview verification.
