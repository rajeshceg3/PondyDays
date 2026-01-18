import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
        this.map = L.map(this.mapContainerId).setView([11.9345, 79.831], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap',
        }).addTo(this.map);

        this.addMarkers();
    }

    addMarkers() {
        this.data.forEach((item, index) => {
            if (item.lat && item.lng) {
                const marker = L.marker([item.lat, item.lng]).addTo(this.map);

                const popupContent = document.createElement('div');
                const title = document.createElement('b');
                title.textContent = item.title;
                popupContent.appendChild(title);
                popupContent.appendChild(document.createElement('br'));
                popupContent.appendChild(document.createTextNode(item.tagline));

                marker.bindPopup(popupContent);

                marker.on('click', () => {
                    // Dispatch a custom event so the main app can handle opening the card
                    const event = new CustomEvent('marker-clicked', {
                        detail: { index: index, data: item },
                    });
                    document.dispatchEvent(event);
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
