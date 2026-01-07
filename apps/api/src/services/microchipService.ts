import type { MicrochipValidationResponse } from '../types/api';

/**
 * ISO 11784/11785 Microchip Validation Service
 * 
 * This service validates microchip numbers against ISO standards
 * and provides mock integration with microchip manufacturers
 */

// ISO 11784/11785 format: 15 digits
const ISO_MICROCHIP_REGEX = /^\d{15}$/;

/**
 * Validates microchip number format according to ISO 11784/11785
 */
export function validateMicrochipFormat(microchipNumber: string): boolean {
    return ISO_MICROCHIP_REGEX.test(microchipNumber);
}

/**
 * Mock microchip manufacturer database
 * In production, this would call external APIs
 */
const mockMicrochipDatabase: Record<string, MicrochipValidationResponse> = {
    '981200012345678': {
        microchipNumber: '981200012345678',
        isValid: true,
        manufacturer: 'HomeAgain',
        implantDate: '2024-01-10',
        implanterClinicId: 'CLINIC-12345',
    },
    '981200012345679': {
        microchipNumber: '981200012345679',
        isValid: true,
        manufacturer: 'PetLink',
        implantDate: '2024-02-15',
        implanterClinicId: 'CLINIC-67890',
    },
    '981200012345680': {
        microchipNumber: '981200012345680',
        isValid: true,
        manufacturer: 'AKC Reunite',
        implantDate: '2024-03-20',
        implanterClinicId: 'CLINIC-11111',
    },
};

/**
 * Validates microchip against manufacturer registry
 * @param microchipNumber - 15-digit ISO microchip number
 * @returns Validation response with manufacturer details
 */
export async function validateMicrochip(
    microchipNumber: string
): Promise<MicrochipValidationResponse> {
    // Validate format first
    if (!validateMicrochipFormat(microchipNumber)) {
        return {
            microchipNumber,
            isValid: false,
            error: 'Invalid microchip format. Must be 15 digits according to ISO 11784/11785',
        };
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check mock database
    const chipData = mockMicrochipDatabase[microchipNumber];

    if (chipData) {
        return chipData;
    }

    // For demo purposes, accept any valid format but mark as unregistered
    return {
        microchipNumber,
        isValid: true,
        manufacturer: 'Unknown',
        error: 'Microchip not found in manufacturer registry (will be registered in local system)',
    };
}

/**
 * Extract manufacturer code from microchip number
 * First 3 digits indicate country/manufacturer
 */
export function getMicrochipManufacturerCode(microchipNumber: string): string {
    if (validateMicrochipFormat(microchipNumber)) {
        return microchipNumber.substring(0, 3);
    }
    return '';
}

/**
 * Get country from microchip code
 * Based on ISO 11784/11785 country codes
 */
export function getMicrochipCountry(microchipNumber: string): string {
    const code = getMicrochipManufacturerCode(microchipNumber);

    const countryCodes: Record<string, string> = {
        '981': 'Uzbekistan',
        '982': 'Kazakhstan',
        '985': 'Thailand',
        '900': 'United States',
        '901': 'United States',
        '953': 'Germany',
        '956': 'China',
        // Add more as needed
    };

    return countryCodes[code] || 'Unknown';
}
