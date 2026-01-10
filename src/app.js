import { postcards } from './data/postcards.js';
import GalleryController from './modules/GalleryController.js';
import MapController from './modules/MapController.js';
import FocusManager from './modules/FocusManager.js';
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
    const mapController = new MapController('map', postcards);

    // Gallery Controller Setup
    const galleryController = new GalleryController(
        '.gallery-container',
        postcards,
        (card) => { // On Open
            body.classList.add('focus-active');
            body.style.backgroundColor = card.dataset.bgColor || 'var(--bg-light)';
            closeButton.classList.add('is-visible');

            // Trap focus
            focusManager.captureFocus();
            focusManager.setTrapElement(card, closeButton);
        },
        () => { // On Close
            body.classList.remove('focus-active');
            body.style.backgroundColor = 'var(--bg-light)';
            closeButton.classList.remove('is-visible');

            // Release focus
            focusManager.releaseTrap();
            focusManager.restoreFocus();
        }
    );

    // Initial Render
    galleryController.render();

    // Event Listeners: Map
    mapViewButton.addEventListener('click', () => {
        mainContent.classList.toggle('map-active');
        const isActive = mainContent.classList.contains('map-active');

        if (isActive) {
            mapViewButton.textContent = 'Gallery View';
            mapController.initMap();
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

        // Wait for transition to gallery then open card
        // Transition duration is 0.8s in CSS
        setTimeout(() => {
            galleryController.openCardByIndex(index);
        }, 800);
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
