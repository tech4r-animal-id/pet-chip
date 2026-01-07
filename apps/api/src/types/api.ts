// API Response Types
export interface ApiResponse<T> {
    message?: string;
    data?: T;
    error?: string;
    details?: any;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface AnimalSearchParams {
    search?: string;
    species?: string;
    status?: string;
}

export interface VaccinationCoverageParams {
    mahalla?: string;
    startDate?: string;
    endDate?: string;
}

// Request Body Types
export interface RegisterAnimalBody {
    microchipNumber: string;
    species: string;
    breed?: string;
    sex: string;
    dateOfBirth?: string;
    color?: string;
    status?: string;
    ownerId?: string;
    currentHoldingId: number;
    birthHoldingId: number;
    officialId: string;
}

export interface CreateMedicalRecordBody {
    procedureType: string;
    procedureDate: string;
    nextDueDate?: string;
    veterinarianName?: string;
    notes?: string;
    holdingId: number;
    diagnosis?: string;
    treatmentAdministered?: string;
    healthStatus?: string;
}

export interface MicrochipValidationResponse {
    microchipNumber: string;
    isValid: boolean;
    manufacturer?: string;
    implantDate?: string;
    implanterClinicId?: string;
    error?: string;
}
