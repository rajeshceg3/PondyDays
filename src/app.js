import { postcards } from './data/postcards.js';
import GalleryController from './modules/GalleryController.js';
import FocusManager from './modules/FocusManager.js';
import { loadMap } from './utils/lazyLoad.js';
import './style.css'; // Vite imports CSS

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const body = document.body;
    const mainContent = document.querySelector('.main-content');
    const mapViewButton = document.querySelector('.map-view-button');
    const closeButton = document.querySelector('.close-button');
    const clickOutsideOverlay = document.querySelector('.click-outside-overlay');

    // Modules
    const focusManager = new FocusManager();
    let mapController = null;

    // Gallery Controller Setup
    const galleryController = new GalleryController(
        '.gallery-container',
        postcards,
        (card) => {
            // On Open
            body.classList.add('focus-active');
            if (card.dataset.themeClass) {
                body.classList.add(card.dataset.themeClass);
            }
            closeButton.classList.add('is-visible');

            // Trap focus
            focusManager.captureFocus();
            focusManager.setTrapElement(card, closeButton);
        },
        () => {
            // On Close
            body.classList.remove('focus-active');
            // Remove any theme classes
            body.classList.remove('theme-yellow', 'theme-red', 'theme-blue', 'theme-green');
            closeButton.classList.remove('is-visible');

            // Release focus
            focusManager.releaseTrap();
            focusManager.restoreFocus();
        }
    );

    // Initial Render
    galleryController.render();

    // Event Listeners: Map
    mapViewButton.addEventListener('click', async () => {
        mainContent.classList.toggle('map-active');
        const isActive = mainContent.classList.contains('map-active');

        if (isActive) {
            mapViewButton.textContent = 'Gallery View';
            if (!mapController) {
                // Lazy load the map
                try {
                    mapController = await loadMap('map', postcards);
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error('Error loading map:', e);
                    mapViewButton.textContent = 'Map Unavailable';
                }
            } else {
                mapController.initMap();
            }
        } else {
            mapViewButton.textContent = 'Map View';
        }
    });

    // Handle Marker Clicks from MapController
    document.addEventListener('marker-clicked', (e) => {
        const { index } = e.detail;

        // Switch back to gallery view
        mainContent.classList.remove('map-active');
        mapViewButton.textContent = 'Map View';

        // Use transitionend to ensure smooth switching
        const onTransitionEnd = (evt) => {
            if (
                evt.target === mainContent &&
                (evt.propertyName === 'grid-template-rows' || evt.propertyName === 'opacity')
            ) {
                mainContent.removeEventListener('transitionend', onTransitionEnd);
                galleryController.openCardByIndex(index);
            }
        };

        // Fallback in case transition doesn't fire (e.g. hidden tab)
        const fallbackTimer = setTimeout(() => {
            mainContent.removeEventListener('transitionend', onTransitionEnd);
            galleryController.openCardByIndex(index);
        }, 850); // slightly longer than CSS transition

        mainContent.addEventListener('transitionend', (evt) => {
            clearTimeout(fallbackTimer);
            onTransitionEnd(evt);
        });
    });

    // Event Listeners: Close Actions
    const handleClose = () => {
        galleryController.closePostcard();
    };

    closeButton.addEventListener('click', handleClose);
    clickOutsideOverlay.addEventListener('click', handleClose);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            handleClose();
        }
    });

    window.addEventListener('resize', () => {
        galleryController.closeImmediate();
    });
});
