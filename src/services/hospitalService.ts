import { Hospital, OverpassResponse } from '@/types/hospital';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

export async function fetchNearbyHospitals(
    latitude: number,
    longitude: number,
    radiusMeters: number = 5000
): Promise<Hospital[]> {
    const query = `
    [out:json];
    (
      node["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
      way["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
      relation["amenity"="hospital"](around:${radiusMeters},${latitude},${longitude});
    );
    out center;
  `;

    try {
        const response = await fetch(OVERPASS_API_URL, {
            method: 'POST',
            body: query,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: OverpassResponse = await response.json();

        const hospitals: Hospital[] = data.elements.map((element) => {
            const lat = element.lat || element.center?.lat || 0;
            const lon = element.lon || element.center?.lon || 0;
            return {
                id: element.id,
                name: element.tags.name || 'Unnamed Hospital',
                lat,
                lon,
                tags: element.tags,
            };
        }).filter((hospital) => hospital.lat && hospital.lon);

        console.log(`Found ${hospitals.length} hospitals nearby`);
        return hospitals;
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        throw error;
    }
}
