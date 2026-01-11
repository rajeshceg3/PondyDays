import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import GalleryController from '../modules/GalleryController.js';

// Mock data
const mockData = [
    {
        title: 'Test Card',
        tagline: 'Test Tagline',
        desc: 'Test Description',
        image: 'https://images.unsplash.com/photo-test',
        bgColor: '#ffffff',
        lat: 0,
        lng: 0,
        alt: 'Test Alt'
    }
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
    });

    afterEach(() => {
        document.body.innerHTML = '';
        vi.restoreAllMocks();
    });

    it('should render cards correctly', () => {
        galleryController.render();
        const cards = container.querySelectorAll('.postcard');
        expect(cards.length).toBe(1);
        expect(cards[0].querySelector('.postcard__title').textContent).toBe('Test Card');
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
            top: 0, left: 0, width: 100, height: 100
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
            top: 0, left: 0, width: 100, height: 100
        });
        galleryController.openPostcard(card);

        // Then close
        galleryController.closePostcard();

        expect(onClose).toHaveBeenCalledWith(card);
        // Note: 'is-active' is removed immediately, 'is-closing' added
        expect(card.classList.contains('is-active')).toBe(false);
        expect(card.classList.contains('is-closing')).toBe(true);
    });
});
