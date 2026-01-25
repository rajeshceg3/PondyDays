import { postcards } from '../data/postcards.js';
import GalleryController from './GalleryController.js';
import FocusManager from './FocusManager.js';
import ToastManager from './ToastManager.js';
import { loadMap } from '../utils/lazyLoad.js';
import { debounce } from '../utils/debounce.js';

export default class AppController {
    constructor() {
        this.dom = {
            body: document.body,
            mainContent: document.querySelector('.main-content'),
            mapViewButton: document.querySelector('.map-view-button'),
            closeButton: document.querySelector('.close-button'),
            clickOutsideOverlay: document.querySelector('.click-outside-overlay'),
            mapContainer: document.getElementById('map'),
        };

        this.modules = {
            focusManager: new FocusManager(),
            toastManager: new ToastManager(),
            galleryController: null,
            mapController: null,
        };

        this.lastWidth = window.innerWidth;

        this.bindEvents = this.bindEvents.bind(this);
        this.handleMapToggle = this.handleMapToggle.bind(this);
        this.handleMarkerClick = this.handleMarkerClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleNetworkChange = this.handleNetworkChange.bind(this);
    }

    init() {
        this.initGallery();
        this.bindEvents();
        this.checkInitialNetwork();
    }

    initGallery() {
        this.modules.galleryController = new GalleryController(
            '.gallery-container',
            postcards,
            (card) => this.onCardOpen(card),
            () => this.onCardClose()
        );
        this.modules.galleryController.render();
    }

    onCardOpen(card) {
        this.dom.body.classList.add('focus-active');
        if (card.dataset.themeClass) {
            this.dom.body.classList.add(card.dataset.themeClass);
        }
        this.dom.closeButton.classList.add('is-visible');

        // Trap focus
        this.modules.focusManager.captureFocus();
        this.modules.focusManager.setTrapElement(card, this.dom.closeButton);
    }

    onCardClose() {
        this.dom.body.classList.remove('focus-active');
        this.dom.body.classList.remove('theme-yellow', 'theme-red', 'theme-blue', 'theme-green');
        this.dom.closeButton.classList.remove('is-visible');

        // Release focus
        this.modules.focusManager.releaseTrap();
        this.modules.focusManager.restoreFocus();
    }

    async initMapController() {
        this.dom.mapContainer.classList.add('is-loading');
        try {
            this.modules.mapController = await loadMap('map', postcards);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Error loading map:', e);
            this.renderMapError();
            this.modules.toastManager.show(
                'Failed to load the map. Please check your connection.',
                'error'
            );
        } finally {
            this.dom.mapContainer.classList.remove('is-loading');
        }
    }

    renderMapError() {
        this.dom.mapViewButton.textContent = 'Map Unavailable';
        this.dom.mapContainer.textContent = '';

        const errorWrapper = document.createElement('div');
        errorWrapper.className = 'error-wrapper';

        const errorMsg = document.createElement('p');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Unable to load map.';

        const retryBtn = document.createElement('button');
        retryBtn.className = 'retry-button';
        retryBtn.textContent = 'Retry';
        retryBtn.onclick = () => {
            this.dom.mapContainer.textContent = '';
            this.dom.mapViewButton.textContent = 'Gallery View';
            this.initMapController();
        };

        errorWrapper.appendChild(errorMsg);
        errorWrapper.appendChild(retryBtn);
        this.dom.mapContainer.appendChild(errorWrapper);
    }

    async handleMapToggle() {
        this.dom.mainContent.classList.toggle('map-active');
        const isActive = this.dom.mainContent.classList.contains('map-active');

        this.dom.mapViewButton.setAttribute('aria-expanded', isActive);

        if (isActive) {
            this.dom.mapViewButton.textContent = 'Gallery View';
            if (!this.modules.mapController) {
                await this.initMapController();
            } else {
                this.modules.mapController.initMap();
            }
        } else {
            this.dom.mapViewButton.textContent = 'Map View';
        }
    }

    handleMarkerClick(e) {
        const { index } = e.detail;

        // Switch back to gallery view
        this.dom.mainContent.classList.remove('map-active');
        this.dom.mapViewButton.textContent = 'Map View';

        // Use transitionend to ensure smooth switching
        const onTransitionEnd = (evt) => {
            if (
                evt.target === this.dom.mainContent &&
                (evt.propertyName === 'grid-template-rows' || evt.propertyName === 'opacity')
            ) {
                this.dom.mainContent.removeEventListener('transitionend', onTransitionEnd);
                this.modules.galleryController.openCardByIndex(index);
            }
        };

        // Fallback in case transition doesn't fire
        // 620ms = 600ms (CSS transition) + 20ms buffer for elite responsiveness
        const fallbackTimer = setTimeout(() => {
            this.dom.mainContent.removeEventListener('transitionend', onTransitionEnd);
            this.modules.galleryController.openCardByIndex(index);
        }, 620);

        this.dom.mainContent.addEventListener('transitionend', (evt) => {
            clearTimeout(fallbackTimer);
            onTransitionEnd(evt);
        });
    }

    handleClose() {
        this.modules.galleryController.closePostcard();
    }

    handleNetworkChange() {
        if (navigator.onLine) {
            this.modules.toastManager.show('You are back online.', 'success');
            this.dom.body.classList.remove('is-offline');
        } else {
            this.modules.toastManager.show('You are offline. Maps may be unavailable.', 'info');
            this.dom.body.classList.add('is-offline');
        }
    }

    checkInitialNetwork() {
        if (!navigator.onLine) {
            this.modules.toastManager.show('You are currently offline.', 'info');
        }
    }

    bindEvents() {
        this.dom.mapViewButton.addEventListener('click', this.handleMapToggle);

        // Custom event from MapController
        document.addEventListener('marker-clicked', this.handleMarkerClick);

        this.dom.closeButton.addEventListener('click', this.handleClose);
        this.dom.clickOutsideOverlay.addEventListener('click', this.handleClose);

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleClose();
            }
        });

        window.addEventListener(
            'resize',
            debounce(() => {
                // Elite UX: Only close if width changes significantly (avoids mobile url bar jank)
                if (Math.abs(window.innerWidth - this.lastWidth) > 50) {
                    this.modules.galleryController.closeImmediate();
                    this.lastWidth = window.innerWidth;
                }
            }, 300)
        );

        // Network Status
        window.addEventListener('online', this.handleNetworkChange);
        window.addEventListener('offline', this.handleNetworkChange);
    }
}
