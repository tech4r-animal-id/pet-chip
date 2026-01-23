/**
 * Authentication Type Definitions
 */

import type { userRoleEnum } from '@repo/db';

export type UserRole = typeof userRoleEnum.enumValues[number];

export interface JWTPayload {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

export interface AuthUser {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    phoneNumber?: string;
    role: UserRole;
    areaId?: number;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}
