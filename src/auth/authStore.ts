import { authApi } from '../api/authApi';
import { setUnauthorizedHandler } from '../api/httpClient';
import { tokenStorage } from '../api/tokenStorage';
import type { AuthState, AuthUser, LoginCredentials } from '../types/auth';

/**
 * Сховище сесії поза React.
 *
 * Його читають і route loaders (де hooks використовувати не можна),
 * і AuthContext (через useSyncExternalStore). Так у застосунку одне джерело правди.
 */
type Listener = () => void;

const initialToken = tokenStorage.get();

let state: AuthState = {
    // Якщо токен лишився з минулого візиту — сесію треба відновити через /auth/me
    status: initialToken ? 'restoring' : 'anonymous',
    user: null,
    accessToken: initialToken,
};

const listeners = new Set<Listener>();
let pendingUser: Promise<AuthUser | null> | null = null;

function setState(next: AuthState): void {
    state = next;
    listeners.forEach((listener) => listener());
}

function clearSession(): void {
    tokenStorage.clear();
    pendingUser = null;
    setState({ status: 'anonymous', user: null, accessToken: null });
}

// Якщо сервер відповів 401 на авторизований запит — токен недійсний
setUnauthorizedHandler(clearSession);

export const authStore = {
    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    getState(): AuthState {
        return state;
    },

    async login(credentials: LoginCredentials): Promise<AuthUser> {
        const { accessToken, refreshToken: _refreshToken, ...user } = await authApi.login(credentials);
        void _refreshToken; // refresh flow — додаткове завдання, токен оновлення не зберігаємо
        tokenStorage.set(accessToken);
        pendingUser = null;
        setState({ status: 'authenticated', user, accessToken });
        return user;
    },

    logout(): void {
        clearSession();
    },

    /**
     * Повертає поточного користувача або null.
     * Якщо є токен, але користувач ще невідомий (після перезавантаження), — питає /auth/me.
     * Паралельні виклики (loader + AuthProvider) ділять один запит.
     */
    getCurrentUser(): Promise<AuthUser | null> {
        if (state.user) return Promise.resolve(state.user);
        if (!state.accessToken) return Promise.resolve(null);

        if (!pendingUser) {
            const token = state.accessToken;
            pendingUser = authApi
                .me()
                .then((user) => {
                    // За час запиту користувач міг вийти — тоді результат ігноруємо
                    if (state.accessToken !== token) return null;
                    setState({ status: 'authenticated', user, accessToken: token });
                    return user;
                })
                .catch(() => {
                    if (state.accessToken === token) clearSession();
                    return null;
                })
                .finally(() => {
                    pendingUser = null;
                });
        }
        return pendingUser;
    },
};
