/** Користувач, якого повертає DummyJSON (/auth/login, /auth/me). */
export interface AuthUser {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    image?: string;
    role?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

/** Відповідь POST /auth/login. */
export interface LoginResponse extends AuthUser {
    accessToken: string;
    refreshToken: string;
}

export type AuthStatus = 'anonymous' | 'restoring' | 'authenticated';

export interface AuthState {
    status: AuthStatus;
    user: AuthUser | null;
    accessToken: string | null;
}
