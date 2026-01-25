# Mission Directive: Code Standards & Operational Protocols

## 1. Operational Overview

This repository contains the source code for "Pondicherry: A Digital Reverie," a high-fidelity web application. All operatives (agents/developers) must adhere to the following protocols to maintain mission readiness.

## 2. Code Quality Standards (The "Standard of Care")

### Architecture

- **Modularity:** Maintain strict separation of concerns.
    - `GalleryController`: Handles grid layout and card interactions.
    - `MapController`: Manages Leaflet map logic (lazy-loaded).
    - `FocusManager`: Enforces accessibility focus traps.
- **State Management:** Avoid global state. Use class instances and event delegation.

### Security Protocols

- **Strict CSP:** Content Security Policy is strictly enforced.
    - `script-src 'self'` only. No inline scripts.
    - `style-src 'self' https://fonts.googleapis.com`.
    - `img-src 'self' data: https:`.
- **Sanitization:**
    - **PROHIBITED:** `innerHTML` on user-supplied or dynamic data.
    - **MANDATED:** Use `document.createElement`, `textContent`, and `appendChild` for DOM manipulation.
    - **EXCEPTION:** Leaflet `bindPopup` may use HTML strings but data MUST be static/sanitized.

### Testing Directives

- **Unit Tests:** `npm run test:unit` (Vitest). Must pass before any commit.
- **E2E Tests:** `npm test` (Playwright). Run for UI/UX verification.
- **Coverage:** Maintain 100% logic coverage on Controllers.

## 3. User Experience (UX) ROE (Rules of Engagement)

### Accessibility (A11y)

- **Focus Management:** Modal/Overlay elements MUST trap focus.
- **Keyboard Nav:** All interactive elements must be keyboard accessible (`Tab`, `Enter`, `Escape`).
- **ARIA:** Use appropriate labels (`aria-label`, `role`).

### Performance

- **Lazy Loading:** Heavy assets (Maps) must be lazy-loaded.
- **Image Optimization:** Use `srcset` and correct `sizes` attributes.
- **Debouncing:** High-frequency events (resize) must be debounced.

### Motion

- **Respect Preferences:** ALL animations must respect `prefers-reduced-motion`.
    - JS: Check `window.matchMedia('(prefers-reduced-motion: reduce)')`.
    - CSS: Use media query override.

### Visual Continuity

- **Error States:** Use high-fidelity SVG icons for missing assets (images). Plain text is prohibited for visual components.
- **Loading States:** Ensure background color placeholders (`bgColor`) match the content palette.

## 4. Deployment & Build

- **Build:** `npm run build` must produce a clean asset directory without warnings.
- **Linting:** `npm run lint` must return zero errors.
- **Formatting:** Prettier is enforced.

---

_Failure to adhere to these protocols will result in immediate code rejection._
