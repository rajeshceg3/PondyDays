import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import FocusManager from '../modules/FocusManager.js';

describe('FocusManager', () => {
    let focusManager;
    let button;
    // let input; // Unused
    let trapContainer;

    beforeEach(() => {
        document.body.innerHTML = `
            <button id="outside">Outside</button>
            <div id="trap">
                <button id="first">First</button>
                <input id="middle" type="text" />
                <button id="last">Last</button>
            </div>
            <button id="close">Close</button>
        `;
        button = document.getElementById('outside');
        // input = document.getElementById('middle');
        trapContainer = document.getElementById('trap');

        button.focus();

        focusManager = new FocusManager();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        vi.restoreAllMocks();
    });

    it('should capture previous focus', () => {
        focusManager.captureFocus();
        expect(focusManager.previousFocusedElement).toBe(button);
    });

    it('should restore focus', () => {
        focusManager.captureFocus();
        document.getElementById('first').focus();
        expect(document.activeElement).not.toBe(button);

        focusManager.restoreFocus();
        expect(document.activeElement).toBe(button);
    });

    // Testing actual trap logic with JSDOM might be tricky due to event simulation limitations,
    // but we can verify the trap is set.
    it('should set trap element', () => {
        const closeBtn = document.getElementById('close');
        focusManager.setTrapElement(trapContainer, closeBtn);

        expect(focusManager.trapElement).toBe(trapContainer);
        expect(focusManager.closeButton).toBe(closeBtn);
    });

    it('should release trap', () => {
        const closeBtn = document.getElementById('close');
        focusManager.setTrapElement(trapContainer, closeBtn);
        focusManager.releaseTrap();

        expect(focusManager.trapElement).toBeNull();
        expect(focusManager.closeButton).toBeNull();
    });
});
