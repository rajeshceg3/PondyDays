// src/utils/lazyLoad.js

/**
 * Dynamically imports Leaflet and initializes the map controller only when needed.
 * @param {string} elementId - The ID of the map container.
 * @param {Array} data - The data to be displayed on the map.
 * @returns {Promise<Object>} - The MapController instance.
 */
export async function loadMap(elementId, data) {
    // Show loading spinner if needed, handled by CSS usually
    try {
        const { default: MapController } = await import('../modules/MapController.js');
        const mapController = new MapController(elementId, data);
        mapController.initMap();
        return mapController;
    } catch (error) {
        // Log error to monitoring service in production
        // eslint-disable-next-line no-console
        console.error("Failed to load map module:", error);
        throw error;
    }
}
