// src/utils/lazyLoad.js

/**
 * Dynamically imports Leaflet and initializes the map controller only when needed.
 * @param {string} elementId - The ID of the map container.
 * @param {Array} data - The data to be displayed on the map.
 * @returns {Promise<Object>} - The MapController instance.
 */
export async function loadMap(elementId, data) {
    const container = document.getElementById(elementId);
    // Add spinner class
    container.classList.add('is-loading');

    try {
        const { default: MapController } = await import('../modules/MapController.js');
        const mapController = new MapController(elementId, data);
        mapController.initMap();

        // Remove spinner after slight delay to ensure render is smooth
        requestAnimationFrame(() => {
            container.classList.remove('is-loading');
        });

        return mapController;
    } catch (error) {
        container.classList.remove('is-loading');
        container.innerHTML =
            '<div class="error-message">Unable to load map. Please try again later.</div>';
        // eslint-disable-next-line no-console
        console.error('Failed to load map module:', error);
        throw error;
    }
}
