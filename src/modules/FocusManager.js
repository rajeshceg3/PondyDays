export default class FocusManager {
    constructor() {
        this.activeElement = null;
        this.trapFocus = this.trapFocus.bind(this);
    }

    captureFocus() {
        this.previousFocusedElement = document.activeElement;
    }

    restoreFocus() {
        if (this.previousFocusedElement) {
            this.previousFocusedElement.focus();
        }
    }

    setTrapElement(element, closeButton) {
        this.trapElement = element;
        this.closeButton = closeButton;
        document.addEventListener('keydown', this.trapFocus);
    }

    releaseTrap() {
        document.removeEventListener('keydown', this.trapFocus);
        this.trapElement = null;
        this.closeButton = null;
    }

    trapFocus(e) {
        if (e.key !== 'Tab' || !this.trapElement) return;

        // Find all focusable elements inside the trap element (e.g. the expanded card)
        // We include the closeButton explicitly since it might be outside the card container logic in some designs,
        // but here we pass it in.
        const focusableContent = this.trapElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

        // Convert NodeList to Array and add closeButton if it's not already inside
        const focusableElements = Array.from(focusableContent);
        if (this.closeButton && !focusableElements.includes(this.closeButton)) {
            focusableElements.push(this.closeButton);
        }

        if (focusableElements.length === 0) return;

        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    }
}
