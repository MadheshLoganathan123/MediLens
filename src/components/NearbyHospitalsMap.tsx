import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Hospital {
    id: string;
    name: string;
    lat: number;
    lng: number;
    [key: string]: any;
}

const NearbyHospitalsMap: React.FC = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);

    // Fetch hospitals from backend
    useEffect(() => {
        async function fetchHospitals() {
            try {
                const response = await fetch('http://localhost:5000/api/hospitals');
                if (!response.ok) throw new Error('Failed to fetch hospitals');
                const data = await response.json();
                setHospitals(data);
            } catch (error) {
                console.error('Error loading hospitals:', error);
            }
        }
        fetchHospitals();
    }, []);

    // Initialize Map
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'http://localhost:5000/api/map-style',
            center: [80.2707, 13.0827], // Chennai, India
            zoom: 12,
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Add Markers
    useEffect(() => {
        if (!map.current || hospitals.length === 0) return;

        hospitals.forEach((hospital) => {
            // Create a DOM element for the marker
            const el = document.createElement('div');
            el.className = 'w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-md cursor-pointer flex items-center justify-center';
            el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"></path><circle cx="12" cy="10" r="3"></circle></svg>';

            // Create Popup
            const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
                `<div class="p-2">
           <h3 class="font-bold text-sm text-gray-900">${hospital.name}</h3>
           <p class="text-xs text-gray-500">Click for details</p>
         </div>`
            );

            // Add Marker
            new maplibregl.Marker({ element: el })
                .setLngLat([hospital.lng, hospital.lat])
                .setPopup(popup)
                .addTo(map.current!);
        });
    }, [hospitals]);

    return (
        <div className="flex flex-col w-full h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Title Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-800">
                    Nearby Hospitals Map
                </h2>
            </div>

            {/* Map Container */}
            <div ref={mapContainer} className="flex-1 relative w-full h-full min-h-[300px]" />
        </div>
    );
};

export default NearbyHospitalsMap;
