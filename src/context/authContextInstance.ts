import { createContext } from 'react';
import type { AuthStatus, AuthUser, LoginCredentials } from '../types/auth';

export interface AuthContextValue {
    user: AuthUser | null;
    accessToken: string | null;
    status: AuthStatus;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<AuthUser>;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
