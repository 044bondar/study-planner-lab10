import { httpClient } from './httpClient';
import type { AuthUser, LoginCredentials, LoginResponse } from '../types/auth';

const TOKEN_TTL_MINUTES = 60;

export const authApi = {
    /** POST /auth/login → accessToken + refreshToken + дані користувача. */
    login(credentials: LoginCredentials): Promise<LoginResponse> {
        return httpClient<LoginResponse>('/auth/login', {
            method: 'POST',
            body: { ...credentials, expiresInMins: TOKEN_TTL_MINUTES },
        });
    },

    /** GET /auth/me з Authorization: Bearer <accessToken>. */
    me(signal?: AbortSignal): Promise<AuthUser> {
        return httpClient<AuthUser>('/auth/me', { method: 'GET', auth: true, signal });
    },
};
