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
        container.textContent = '';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Unable to load map. Please try again later.';
        container.appendChild(errorDiv);
        // eslint-disable-next-line no-console
        console.error('Failed to load map module:', error);
        throw error;
    }
}
