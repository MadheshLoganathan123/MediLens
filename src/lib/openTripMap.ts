const API_KEY = import.meta.env.VITE_OPEN_TRIP_MAP_API_KEY;
const BASE_URL = 'https://api.opentripmap.com/0.1/en';

export interface OTMPace {
    xid: string;
    name: string;
    dist: number;
    kinds: string;
    point: {
        lon: number;
        lat: number;
    };
}

export interface OTMDetails {
    xid: string;
    name: string;
    address: {
        city?: string;
        road?: string;
        house_number?: string;
        postcode?: string;
        country?: string;
    };
    kinds: string;
    rate: string;
    image?: string;
    info?: {
        descr?: string;
    };
    otm: string;
}

export const openTripMapService = {
    /**
     * Fetch nearby hospitals and clinics within a radius
     * @param lat Latitude
     * @param lon Longitude
     * @param radius Radius in meters (default 5000)
     */
    async fetchNearbyMedical(lat: number, lon: number, radius: number = 5000): Promise<OTMPace[]> {
        if (!API_KEY) {
            console.warn('OpenTripMap API Key is missing. Please add VITE_OPEN_TRIP_MAP_API_KEY to .env');
            return [];
        }

        try {
            const response = await fetch(
                `${BASE_URL}/places/radius?radius=${radius}&lon=${lon}&lat=${lat}&kinds=hospitals,clinics&format=json&apikey=${API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching nearby medical places:', error);
            throw error;
        }
    },

    /**
     * Get detailed information for a specific place by XID
     */
    async getPlaceDetails(xid: string): Promise<OTMDetails> {
        if (!API_KEY) {
            throw new Error('OpenTripMap API Key is missing');
        }

        try {
            const response = await fetch(`${BASE_URL}/places/xid/${xid}?apikey=${API_KEY}`);

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching place details:', error);
            throw error;
        }
    }
};
