export interface LocationCoords {
    lat: number;
    lng: number;
}

export interface HealthCase {
    id: string;
    user_id: string;
    symptoms: string;
    ai_analysis?: Record<string, any> | null;
    severity?: string;
    category?: string;
    status: string;
    created_at: string;
    updated_at?: string;
}

export interface HealthCaseCreate {
    symptoms: string;
    severity?: string;
    category?: string;
}

export interface HealthCaseUpdate {
    symptoms?: string;
    severity?: string;
    category?: string;
    status?: string;
}
