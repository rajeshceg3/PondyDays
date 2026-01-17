import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import GalleryController from '../modules/GalleryController.js';

// Mock data
const mockData = [
    {
        title: 'Test Card 1',
        tagline: 'Test Tagline 1',
        desc: 'Test Description 1<br>Line 2',
        image: 'https://images.unsplash.com/photo-test-1',
        bgColor: '#ffffff',
        lat: 0,
        lng: 0,
        alt: 'Test Alt 1',
    },
    {
        title: 'Test Card 2',
        tagline: 'Test Tagline 2',
        desc: 'Test Description 2',
        image: 'https://images.unsplash.com/photo-test-2',
        bgColor: '#000000',
        lat: 1,
        lng: 1,
        alt: 'Test Alt 2',
    },
];

describe('GalleryController', () => {
    let container;
    let galleryController;
    let onOpen;
    let onClose;

    beforeEach(() => {
        document.body.innerHTML = '<div class="gallery-container"></div>';
        container = document.querySelector('.gallery-container');
        onOpen = vi.fn();
        onClose = vi.fn();
        galleryController = new GalleryController('.gallery-container', mockData, onOpen, onClose);

        // Mock matchMedia
        window.matchMedia = vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(), // deprecated
            removeListener: vi.fn(), // deprecated
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));

        // Mock scrollTo
        window.scrollTo = vi.fn();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        vi.restoreAllMocks();
    });

    it('should render cards correctly', () => {
        galleryController.render();
        const cards = container.querySelectorAll('.postcard');
        expect(cards.length).toBe(2);
        expect(cards[0].querySelector('.postcard__title').textContent).toBe('Test Card 1');
    });

    it('should parse <br> tags in description', () => {
        galleryController.render();
        const focusContent = container.querySelector('.focus-content');
        const paragraphs = focusContent.querySelectorAll('p');
        expect(paragraphs.length).toBe(2);
        expect(paragraphs[0].textContent).toBe('Test Description 1');
        expect(paragraphs[1].textContent).toBe('Line 2');
    });

    it('should optimize unsplash urls', () => {
        const url = 'https://images.unsplash.com/photo-123';
        const optimized = galleryController.optimizeUrl(url, 600);
        expect(optimized).toBe('https://images.unsplash.com/photo-123?w=600');

        const urlWithQuery = 'https://images.unsplash.com/photo-123?foo=bar';
        const optimizedWithQuery = galleryController.optimizeUrl(urlWithQuery, 600);
        expect(optimizedWithQuery).toBe('https://images.unsplash.com/photo-123?foo=bar&w=600');

        const urlWithWidth = 'https://images.unsplash.com/photo-123?w=100';
        const optimizedWithWidth = galleryController.optimizeUrl(urlWithWidth, 600);
        expect(optimizedWithWidth).toBe('https://images.unsplash.com/photo-123?w=600');
    });

    it('should handle card open interaction', () => {
        galleryController.render();
        const card = container.querySelector('.postcard');

        // Mock getBoundingClientRect for animation calculations
        vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
            top: 0,
            left: 0,
            width: 100,
            height: 100,
        });

        galleryController.openPostcard(card);

        expect(onOpen).toHaveBeenCalledWith(card);
        expect(card.classList.contains('is-active')).toBe(true);
        expect(galleryController.activePostcard).toBe(card);
    });

    it('should handle card close interaction', () => {
        galleryController.render();
        const card = container.querySelector('.postcard');

        // Open first
        vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
            top: 0,
            left: 0,
            width: 100,
            height: 100,
        });
        galleryController.openPostcard(card);

        // Then close
        galleryController.closePostcard();

        expect(onClose).toHaveBeenCalledWith(card);
        // Note: 'is-active' is removed immediately, 'is-closing' added
        expect(card.classList.contains('is-active')).toBe(false);
        expect(card.classList.contains('is-closing')).toBe(true);
    });

    it('should respect prefers-reduced-motion', () => {
        window.matchMedia = vi.fn().mockImplementation((query) => ({
            matches: query === '(prefers-reduced-motion: reduce)',
            media: query,
            // ...
        }));

        galleryController.render();
        const card = container.querySelector('.postcard');

        galleryController.openPostcard(card);

        expect(card.classList.contains('is-active')).toBe(true);
        // Should NOT have is-opening class if motion is reduced
        expect(card.classList.contains('is-opening')).toBe(false);

        galleryController.closePostcard();
        expect(card.classList.contains('is-active')).toBe(false);
        // Should NOT have is-closing class if motion is reduced
        expect(card.classList.contains('is-closing')).toBe(false);
    });

    it('should handle keyboard navigation (Arrow Keys)', () => {
        galleryController.render();
        const cards = container.querySelectorAll('.postcard');
        const card1 = cards[0];
        const card2 = cards[1];

        // Focus first card
        card1.focus();
        expect(document.activeElement).toBe(card1);

        // Press ArrowRight on card1
        const rightEvent = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            bubbles: true,
            cancelable: true,
        });
        card1.dispatchEvent(rightEvent);

        // Expect focus to be on card2
        expect(document.activeElement).toBe(card2);

        // Press ArrowLeft on card2
        const leftEvent = new KeyboardEvent('keydown', {
            key: 'ArrowLeft',
            bubbles: true,
            cancelable: true,
        });
        card2.dispatchEvent(leftEvent);

        // Expect focus to be on card1
        expect(document.activeElement).toBe(card1);
    });
});
