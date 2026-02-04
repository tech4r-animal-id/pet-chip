import type { MicrochipValidationResponse } from '../types/api';





const ISO_MICROCHIP_REGEX = /^\d{15}$/;


export function validateMicrochipFormat(microchipNumber: string): boolean {
    return ISO_MICROCHIP_REGEX.test(microchipNumber);
}


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


export async function validateMicrochip(
    microchipNumber: string
): Promise<MicrochipValidationResponse> {
    
    if (!validateMicrochipFormat(microchipNumber)) {
        return {
            microchipNumber,
            isValid: false,
            error: 'Invalid microchip format. Must be 15 digits according to ISO 11784/11785',
        };
    }

    
    await new Promise((resolve) => setTimeout(resolve, 100));

    
    const chipData = mockMicrochipDatabase[microchipNumber];

    if (chipData) {
        return chipData;
    }

    
    return {
        microchipNumber,
        isValid: true,
        manufacturer: 'Unknown',
        error: 'Microchip not found in manufacturer registry (will be registered in local system)',
    };
}


export function getMicrochipManufacturerCode(microchipNumber: string): string {
    if (validateMicrochipFormat(microchipNumber)) {
        return microchipNumber.substring(0, 3);
    }
    return '';
}


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
        
    };

    return countryCodes[code] || 'Unknown';
}