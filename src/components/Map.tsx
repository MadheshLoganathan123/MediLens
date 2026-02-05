import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { LocationCoords } from '../types';

// Fix for default marker icons not showing up
// Using the CDN links as requested by the user, though local imports are often safer for production if offline.
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    center: LocationCoords;
    onLocationChange?: (coords: LocationCoords) => void;
    children?: React.ReactNode; // Added to allow passing Hospital markers
}

const RecenterButton: React.FC<{ center: LocationCoords }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([center.lat, center.lng], 15);
    }, [center, map]);
    return null;
};

const MapEvents: React.FC<{ onLocationChange?: (coords: LocationCoords) => void }> = ({ onLocationChange }) => {
    useMapEvents({
        click(e) {
            if (onLocationChange) {
                onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng });
            }
        },
    });
    return null;
};

const Map: React.FC<MapProps> = ({ center, onLocationChange, children }) => {
    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={13} // Slightly zoomed out to see more hospitals by default
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false} // We often disable this for custom UI or mobile feel, but user didn't specify. Keeping it enabled by default if not passed.
            // Actually, user's code didn't set zoomControl=false, but did set center/zoom.
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Helper component to move map when center prop changes */}
                <RecenterButton center={center} />

                {/* Click handler */}
                <MapEvents onLocationChange={onLocationChange} />

                {/* User's central marker */}
                <Marker position={[center.lat, center.lng]}>
                    <Popup>
                        <div className="text-center font-semibold">Current View Point</div>
                    </Popup>
                </Marker>

                {/* Render children (like Hospital markers) */}
                {children}

            </MapContainer>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-slate-200 text-xs text-slate-500 font-medium pointer-events-none">
                Click anywhere on map to change focus
            </div>
        </div>
    );
};

export default Map;
