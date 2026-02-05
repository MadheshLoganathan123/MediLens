export interface Hospital {
    id: number;
    name: string;
    lat: number;
    lon: number;
    tags: {
        amenity?: string;
        name?: string;
        emergency?: string;
        healthcare?: string;
        'addr:street'?: string;
        'addr:housenumber'?: string;
        'addr:city'?: string;
        phone?: string;
        website?: string;
        opening_hours?: string;
    };
}

export interface OverpassResponse {
    elements: {
        type: string;
        id: number;
        lat?: number;
        lon?: number;
        center?: {
            lat: number;
            lon: number;
        };
        tags: Record<string, string>;
    }[];
}
