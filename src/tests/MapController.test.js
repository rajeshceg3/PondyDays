import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MapController from '../modules/MapController.js';
import L from 'leaflet';

// Setup Mocks
const mapMock = {
    getContainer: vi.fn(() => document.getElementById('map')),
    setView: vi.fn().mockReturnThis(),
    invalidateSize: vi.fn(),
};
const tileLayerMock = {
    getMaplibreMap: vi.fn(() => ({ queryRenderedFeatures: vi.fn(() => []) })),
    addTo: vi.fn().mockReturnThis(),
};

// Stub the MapLibre GL Leaflet bridge so it never loads maplibre-gl in jsdom
vi.mock('@maplibre/maplibre-gl-leaflet', () => ({}));
vi.mock('maplibre-gl', () => ({ setWorkerUrl: vi.fn() }));
const markerMock = {
    addTo: vi.fn().mockReturnThis(),
    bindPopup: vi.fn().mockReturnThis(),
    on: vi.fn(),
};

vi.mock('leaflet', () => {
    return {
        default: {
            map: vi.fn(() => mapMock),
            tileLayer: vi.fn(() => tileLayerMock),
            maplibreGL: vi.fn(() => tileLayerMock),
            marker: vi.fn(() => markerMock),
            Icon: {
                Default: {
                    mergeOptions: vi.fn(),
                    prototype: {
                        _getIconUrl: vi.fn(),
                    },
                },
            },
        },
    };
});

describe('MapController', () => {
    let mapController;
    const mockData = [
        { title: 'Place 1', tagline: 'Tag 1', lat: 10, lng: 20 },
        { title: 'Place 2', tagline: 'Tag 2', lat: 30, lng: 40 },
        { title: 'Invalid Place' }, // Missing lat/lng
    ];

    beforeEach(() => {
        document.body.innerHTML = '<div id="map"></div>';
        mapController = new MapController('map', mockData);
        vi.clearAllMocks();
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should initialize map correctly', () => {
        mapController.initMap();

        expect(L.map).toHaveBeenCalledWith('map', { maxZoom: 18 });
        expect(mapMock.setView).toHaveBeenCalledWith([11.9345, 79.831], 13); // Default view from code
        expect(L.maplibreGL).toHaveBeenCalled();
        expect(tileLayerMock.addTo).toHaveBeenCalledWith(mapMock);
        expect(document.getElementById('map')._warmMap).toBe(tileLayerMock.getMaplibreMap.mock.results[0].value);
    });

    it('should not re-initialize if map exists', () => {
        mapController.initMap();
        mapController.initMap();

        expect(L.map).toHaveBeenCalledTimes(1);
    });

    it('should add markers for valid data', () => {
        mapController.initMap();

        // Should add 2 markers, skipping the invalid one
        expect(L.marker).toHaveBeenCalledTimes(2);
        expect(L.marker).toHaveBeenCalledWith([10, 20], { alt: 'Place 1', title: 'Place 1' });
        expect(L.marker).toHaveBeenCalledWith([30, 40], { alt: 'Place 2', title: 'Place 2' });
        expect(markerMock.addTo).toHaveBeenCalledWith(mapMock);
        expect(markerMock.bindPopup).toHaveBeenCalledTimes(2);
    });

    it('should dispatch event on marker click', () => {
        const dispatchSpy = vi.spyOn(document, 'dispatchEvent');
        mapController.initMap();

        // Verify marker.on('click', handler) was called
        expect(markerMock.on).toHaveBeenCalled();

        // Simulate click on the first marker
        // markerMock.on.mock.calls is an array of [event, handler]
        // We need to find the call corresponding to the first marker.
        // Since the mock object is shared, we assume sequential calls.
        const firstMarkerHandler = markerMock.on.mock.calls[0][1];

        firstMarkerHandler();

        expect(dispatchSpy).toHaveBeenCalled();
        const event = dispatchSpy.mock.calls[0][0];
        expect(event.type).toBe('marker-clicked');
        expect(event.detail.index).toBe(0);
        expect(event.detail.data).toEqual(mockData[0]);
    });

    it('should let Enter and Space open a named place', () => {
        const dispatchSpy = vi.spyOn(document, 'dispatchEvent');
        mapController.initMap();
        const keyHandler = markerMock.on.mock.calls.find(([event]) => event === 'keypress')[1];
        for (const key of ['Enter', ' ']) {
            const preventDefault = vi.fn();
            keyHandler({ originalEvent: { key, preventDefault } });
            expect(preventDefault).toHaveBeenCalled();
            expect(dispatchSpy.mock.calls.at(-1)[0].detail.index).toBe(0);
        }
    });

    it('should invalidate size when requested', () => {
        mapController.initMap();
        mapController.invalidateSize();
        expect(mapMock.invalidateSize).toHaveBeenCalled();
    });
});
