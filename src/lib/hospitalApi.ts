const API_KEY = import.meta.env.VITE_HOSPITAL_API_KEY;
const BASE_URL = 'https://data.gov.in/resource/98fa254e-c5f8-4910-a19b-4828939b477d';

export interface HospitalApiResponse {
    name?: string;
    hospital_name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    pincode?: string;
    phone?: string;
    telephone?: string;
    contact?: string;
    type?: string;
    category?: string;
    ownership?: string;
    emergency_services?: boolean;
    emergency?: string;
    [key: string]: any; // Allow additional fields from the API
}

export const hospitalApiService = {
    /**
     * Fetch hospitals from Data.gov.in API
     * @param limit Number of records to fetch (default 50)
     * @param offset Offset for pagination (default 0)
     * @param filters Optional filters object
     */
    async fetchHospitals(limit: number = 50, offset: number = 0, filters?: Record<string, string>): Promise<HospitalApiResponse[]> {
        try {
            const params = new URLSearchParams();
            params.append('format', 'json');
            params.append('limit', limit.toString());
            params.append('offset', offset.toString());

            // Add API key if provided
            if (API_KEY) {
                params.append('api-key', API_KEY);
            }

            // Add any additional filters
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    params.append(`filters[${key}]`, value);
                });
            }

            const url = `${BASE_URL}?${params.toString()}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                console.error('API Response Status:', response.status, response.statusText);
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // Handle different response formats
            if (data.records && Array.isArray(data.records)) {
                return data.records;
            } else if (Array.isArray(data)) {
                return data;
            } else {
                console.warn('Unexpected API response format:', data);
                return [];
            }
        } catch (error) {
            console.error('Error fetching hospitals:', error);
            throw error;
        }
    },

    /**
     * Search hospitals by name or keyword
     */
    async searchByName(name: string): Promise<HospitalApiResponse[]> {
        return this.fetchHospitals(50, 0, { name });
    },

    /**
     * Search hospitals by city
     */
    async searchByCity(city: string): Promise<HospitalApiResponse[]> {
        return this.fetchHospitals(50, 0, { city });
    },

    /**
     * Search hospitals by state
     */
    async searchByState(state: string): Promise<HospitalApiResponse[]> {
        return this.fetchHospitals(50, 0, { state });
    }
};
