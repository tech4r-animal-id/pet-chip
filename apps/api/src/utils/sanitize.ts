import validator from 'validator';


export function sanitizeString(input: string | undefined | null): string {
    if (!input) return '';
    return validator.escape(validator.trim(input));
}


export function sanitizeEmail(email: string | undefined | null): string {
    if (!email) return '';
    const trimmed = validator.trim(email).toLowerCase();
    return validator.normalizeEmail(trimmed) || trimmed;
}


export function sanitizePhone(phone: string | undefined | null): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
}


export function sanitizeMicrochipNumber(chipNumber: string | undefined | null): string {
    if (!chipNumber) throw new Error('Microchip number is required');
    const sanitized = chipNumber.replace(/\D/g, '');
    if (sanitized.length !== 15) {
        throw new Error('Microchip number must be exactly 15 digits');
    }
    return sanitized;
}


export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized as T;
}


export function isValidUUID(uuid: string): boolean {
    return validator.isUUID(uuid, 4);
}


export function isValidEmail(email: string): boolean {
    return validator.isEmail(email);
}