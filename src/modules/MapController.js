import L from 'leaflet';
import { setWorkerUrl } from 'maplibre-gl';
import mapWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
setWorkerUrl(mapWorkerUrl);
import 'leaflet/dist/leaflet.css';
import '@maplibre/maplibre-gl-leaflet';
import 'maplibre-gl/dist/maplibre-gl.css';
import warmMapStyle from '../vendor/warm-map/style.json';

// Fix for Leaflet marker icons in bundlers
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

export default class MapController {
    constructor(mapContainerId, data) {
        this.mapContainerId = mapContainerId;
        this.data = data;
        this.map = null;
        this.markers = [];
    }

    initMap() {
        if (this.map) {
            // Map already initialized, just make sure size is correct
            setTimeout(() => {
                this.map.invalidateSize();
            }, 100);
            return;
        }

        // Initialize map
        // Centered roughly on Pondicherry White Town
        this.map = L.map(this.mapContainerId, { maxZoom: 18 }).setView([11.9345, 79.831], 13);

        // Warm-paper basemap: OpenFreeMap vector tiles via the MapLibre GL Leaflet bridge.
        // Canonical style module shared across the worlds (src/vendor/warm-map/style.json).
        const glLayer = L.maplibreGL({
            style: warmMapStyle,
            attribution:
                '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        }).addTo(this.map);

        // Read-only readiness handle for rendered-feature regression tests.
        this.map.getContainer()._warmMap = glLayer.getMaplibreMap();

        this.addMarkers();
    }

    addMarkers() {
        this.data.forEach((item, index) => {
            if (item.lat && item.lng) {
                const marker = L.marker([item.lat, item.lng], { alt: item.title, title: item.title }).addTo(this.map);

                const popupContent = document.createElement('div');
                const title = document.createElement('b');
                title.textContent = item.title;
                popupContent.appendChild(title);
                popupContent.appendChild(document.createElement('br'));
                popupContent.appendChild(document.createTextNode(item.tagline));

                marker.bindPopup(popupContent);

                const choosePlace = () => {
                    // Dispatch a custom event so the main app can handle opening the card
                    const event = new CustomEvent('marker-clicked', {
                        detail: { index: index, data: item },
                    });
                    document.dispatchEvent(event);
                };
                marker.on('click', choosePlace);
                marker.on('keypress', (e) => {
                    if (e.originalEvent.key === 'Enter' || e.originalEvent.key === ' ') {
                        e.originalEvent.preventDefault();
                        choosePlace();
                    }
                });

                this.markers.push(marker);
            }
        });
    }

    invalidateSize() {
        if (this.map) {
            this.map.invalidateSize();
        }
    }
}
