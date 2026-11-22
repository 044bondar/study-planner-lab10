import { useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { authStore } from '../auth/authStore';
import { AuthContext, type AuthContextValue } from './authContextInstance';

export function AuthProvider({ children }: { children: ReactNode }) {
    const state = useSyncExternalStore(authStore.subscribe, authStore.getState);

    // Відновлення сесії після перезавантаження: токен є, користувача ще немає
    useEffect(() => {
        if (state.status === 'restoring') {
            void authStore.getCurrentUser();
        }
    }, [state.status]);

    const value = useMemo<AuthContextValue>(
        () => ({
            user: state.user,
            accessToken: state.accessToken,
            status: state.status,
            isAuthenticated: state.status === 'authenticated' && state.user !== null,
            login: authStore.login,
            logout: authStore.logout,
        }),
        [state]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
