import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

document.addEventListener('DOMContentLoaded', () => {
    const postcards = document.querySelectorAll('.postcard');
    const body = document.body;
    const closeButton = document.querySelector('.close-button');
    const clickOutsideOverlay = document.querySelector('.click-outside-overlay');
    let activePostcard = null;
    let lastScrollY = 0;
    let previouslyFocusedElement = null;

    const trapFocus = (e) => {
        if (e.key !== 'Tab' || !activePostcard) return;
        const focusableElements = [activePostcard, closeButton];
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
            }
        }
    };

    const openPostcard = (postcard) => {
        if (activePostcard || postcard.classList.contains('is-opening')) return;
        previouslyFocusedElement = document.activeElement;
        lastScrollY = window.scrollY;
        activePostcard = postcard;
        const initialRect = postcard.getBoundingClientRect();
        postcard.classList.add('is-active', 'is-opening');
        const finalRect = postcard.getBoundingClientRect();
        const invertX = initialRect.left - finalRect.left;
        const invertY = initialRect.top - finalRect.top;
        const scaleX = initialRect.width / finalRect.width;
        const scaleY = initialRect.height / finalRect.height;
        postcard.style.transition = 'none';
        postcard.style.transform = `translate(${invertX}px, ${invertY}px) scale(${scaleX}, ${scaleY})`;
        postcard.style.transformOrigin = 'top left';
        requestAnimationFrame(() => {
            postcard.style.transition = '';
            postcard.style.transform = '';
            postcard.style.transformOrigin = '';
        });
        body.classList.add('focus-active');
        body.style.backgroundColor = postcard.dataset.bgColor || 'var(--bg-light)';
        closeButton.classList.add('is-visible');
        postcard.addEventListener('transitionend', () => {
            postcard.classList.remove('is-opening');
            closeButton.focus();
        }, { once: true });
        document.addEventListener('keydown', trapFocus);
    };

    const closePostcard = () => {
        if (!activePostcard || activePostcard.classList.contains('is-closing')) return;
        const placeholder = Array.from(postcards).find(p => p === activePostcard);
        const initialRect = placeholder.getBoundingClientRect();
        activePostcard.classList.add('is-closing');
        body.classList.remove('focus-active');
        body.style.backgroundColor = 'var(--bg-light)';
        closeButton.classList.remove('is-visible');
        activePostcard.style.transform = `translate(${initialRect.left}px, ${initialRect.top}px) scale(${initialRect.width / activePostcard.offsetWidth}, ${initialRect.height / activePostcard.offsetHeight})`;
        activePostcard.style.transformOrigin = 'top left';
        activePostcard.addEventListener('transitionend', function onTransitionEnd() {
            this.removeEventListener('transitionend', onTransitionEnd);
            this.classList.remove('is-active', 'is-closing');
            this.style.transform = '';
            this.style.transformOrigin = '';
            this.style.transition = '';
            activePostcard = null;
            window.scrollTo({ top: lastScrollY, behavior: 'instant' });
            if (previouslyFocusedElement) {
                previouslyFocusedElement.focus();
            }
            document.removeEventListener('keydown', trapFocus);
        });
    };

    const closePostcardImmediate = () => {
        if (!activePostcard) return;
        activePostcard.style.transition = 'none';
        body.classList.remove('focus-active');
        body.style.backgroundColor = 'var(--bg-light)';
        closeButton.classList.remove('is-visible');
        document.removeEventListener('keydown', trapFocus);
        activePostcard.classList.remove('is-active', 'is-closing', 'is-opening');
        activePostcard.style.transform = '';
        activePostcard.style.transformOrigin = '';
        activePostcard = null;
        window.scrollTo({ top: lastScrollY, behavior: 'instant' });
        if (previouslyFocusedElement) {
            previouslyFocusedElement.focus();
        }
    };

    postcards.forEach(postcard => {
        postcard.setAttribute('tabindex', '0');
        postcard.setAttribute('role', 'button');
        const handleOpen = (e) => {
            if (postcard.classList.contains('is-active')) return;
            e.preventDefault();
            openPostcard(postcard);
        };
        postcard.addEventListener('click', handleOpen);
        postcard.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleOpen(e);
            }
        });
    });

    closeButton.addEventListener('click', closePostcard);
    clickOutsideOverlay.addEventListener('click', closePostcard);
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activePostcard) {
            closePostcard();
        }
    });
    window.addEventListener('resize', () => {
        if (activePostcard) {
            closePostcardImmediate();
        }
    });

    const mapViewButton = document.querySelector('.map-view-button');
    const mainContent = document.querySelector('.main-content');
    let map;
    mapViewButton.addEventListener('click', () => {
        mainContent.classList.toggle('map-active');
        if (mainContent.classList.contains('map-active')) {
            if (!map) {
                map = L.map('map').setView([11.9345, 79.831], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }).addTo(map);
            }
            // Fix: Invalidate size after transition to ensure tiles load correctly
            setTimeout(() => {
                map.invalidateSize();
            }, 800); // Match transition duration

            postcards.forEach(postcard => {
                const lat = postcard.dataset.lat;
                const lng = postcard.dataset.lng;
                const title = postcard.querySelector('.postcard__title').textContent;
                if (lat && lng) {
                    const marker = L.marker([lat, lng]).addTo(map);
                    marker.bindPopup(title);
                    marker.on('click', () => {
                        // Close map view first if needed, or open card directly
                        // For this design, we might want to switch back to gallery view
                        // or open the card overlay on top of the map.
                        // The original logic just called openPostcard(postcard)
                        // but since the gallery is hidden, the FLIP animation might look weird.
                        // Let's toggle map off first then open.
                        mainContent.classList.remove('map-active');
                        setTimeout(() => {
                            openPostcard(postcard);
                        }, 800);
                    });
                }
            });
        }
    });
});
