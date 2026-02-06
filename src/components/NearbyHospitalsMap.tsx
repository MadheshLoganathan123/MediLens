import React, { useEffect, useRef } from 'react';

interface Hospital {
    id: string | number;
    name: string;
    lat: number;
    lng: number;
    address?: string;
    phone?: string;
    status?: 'Open' | 'Busy' | 'Closed';
    department?: string[];
    rating?: number;
    distance?: string;
    [key: string]: any;
}

interface NearbyHospitalsMapProps {
    hospitals: Hospital[];
    center?: [number, number]; // [lng, lat]
    userLocation?: { lat: number; lng: number };
}

// Declare Leaflet on window
declare global {
    interface Window {
        L: any;
    }
}

const NearbyHospitalsMap: React.FC<NearbyHospitalsMapProps> = ({ 
    hospitals, 
    center,
    userLocation 
}) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    // Load Leaflet CSS and JS
    useEffect(() => {
        // Check if Leaflet is already loaded
        if (window.L) return;

        // Load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);

        // Load Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        document.head.appendChild(script);

        return () => {
            // Cleanup if needed
        };
    }, []);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || mapInstance.current) return;

        const initMap = () => {
            if (!window.L) {
                // Retry after a short delay if Leaflet isn't loaded yet
                setTimeout(initMap, 100);
                return;
            }

            // Calculate center: use provided center, userLocation, or first hospital
            let mapCenter: [number, number];
            if (center) {
                mapCenter = [center[1], center[0]]; // Convert [lng, lat] to [lat, lng]
            } else if (userLocation) {
                mapCenter = [userLocation.lat, userLocation.lng];
            } else if (hospitals.length > 0) {
                mapCenter = [hospitals[0].lat, hospitals[0].lng];
            } else {
                mapCenter = [16.9891, 82.2475]; // Default to Kakinada
            }

            // Create map
            const map = window.L.map(mapContainer.current).setView(mapCenter, 12);

            // Add tile layer
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                maxZoom: 19,
            }).addTo(map);

            mapInstance.current = map;
        };

        initMap();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [center, userLocation, hospitals]);

    // Update markers when hospitals change
    useEffect(() => {
        if (!mapInstance.current || !window.L) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add user location marker if available
        if (userLocation) {
            const userIcon = window.L.divIcon({
                html: '<div style="width:24px;height:24px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            });

            const userMarker = window.L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
                .addTo(mapInstance.current)
                .bindPopup('<div style="padding:8px;"><b>Your Location</b></div>');

            markersRef.current.push(userMarker);
        }

        // Add hospital markers
        hospitals.forEach((hospital) => {
            const hospitalIcon = window.L.divIcon({
                html: '<div style="width:30px;height:30px;background:#DC2626;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:18px;font-weight:bold;">+</div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
            });

            // Build popup content
            const statusColors: Record<string, string> = {
                'Open': '#10B981',
                'Busy': '#F59E0B',
                'Closed': '#EF4444'
            };

            const statusColor = hospital.status ? statusColors[hospital.status] || '#6B7280' : '#6B7280';

            const popupContent = `
                <div style="min-width:220px;padding:8px;">
                    <h3 style="margin:0 0 8px 0;font-size:16px;font-weight:bold;color:#1F2937;">${hospital.name}</h3>
                    ${hospital.status ? `<div style="margin:4px 0;"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${statusColor};margin-right:6px;"></span><span style="font-size:14px;color:#374151;font-weight:600;">${hospital.status}</span></div>` : ''}
                    ${hospital.rating ? `<div style="margin:4px 0;font-size:14px;color:#6B7280;">⭐ ${hospital.rating} ${hospital.distance ? `• ${hospital.distance}` : ''}</div>` : ''}
                    ${hospital.department && hospital.department.length > 0 ? `<div style="margin:6px 0;font-size:13px;color:#6B7280;">${hospital.department.slice(0, 2).join(', ')}</div>` : ''}
                    ${hospital.address ? `<p style="margin:6px 0;font-size:13px;color:#6B7280;">${hospital.address}</p>` : ''}
                    ${hospital.phone && hospital.phone !== 'N/A' ? `<p style="margin:4px 0;font-size:13px;color:#2563EB;">📞 ${hospital.phone}</p>` : ''}
                </div>
            `;

            const marker = window.L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon })
                .addTo(mapInstance.current)
                .bindPopup(popupContent);

            markersRef.current.push(marker);
        });

        // Fit bounds to show all markers
        if (hospitals.length > 0 || userLocation) {
            const bounds = window.L.latLngBounds([]);
            
            if (userLocation) {
                bounds.extend([userLocation.lat, userLocation.lng]);
            }
            
            hospitals.forEach(h => {
                bounds.extend([h.lat, h.lng]);
            });

            if (bounds.isValid()) {
                mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }, [hospitals, userLocation]);

    return (
        <div className="flex flex-col w-full h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Map Container */}
            <div ref={mapContainer} className="flex-1 relative w-full h-full min-h-[400px]" />
        </div>
    );
};

export default NearbyHospitalsMap;
