import { tokenStorage } from './tokenStorage';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://dummyjson.com';

export class HttpError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
    }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
    /** true — запит потребує автентифікації: додається Authorization: Bearer <token>. */
    auth?: boolean;
}

let unauthorizedHandler: (() => void) | null = null;

/** Auth-модуль реєструє реакцію на 401 (очищення сесії). */
export function setUnauthorizedHandler(handler: () => void): void {
    unauthorizedHandler = handler;
}

/**
 * Централізоване формування Authorization header.
 * Компоненти та repository лише вказують `auth: true` — токен вони не бачать.
 */
function buildAuthHeaders(auth: boolean | undefined): Record<string, string> {
    if (!auth) return {};

    const token = tokenStorage.get();
    if (!token) {
        throw new HttpError(401, 'Потрібна авторизація');
    }
    return { Authorization: `Bearer ${token}` };
}

async function readErrorMessage(response: Response): Promise<string> {
    try {
        const data = (await response.json()) as { message?: unknown };
        if (typeof data.message === 'string' && data.message) return data.message;
    } catch {
        // тіло не JSON
    }
    return `HTTP помилка: ${response.status} ${response.statusText}`;
}

export async function httpClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, headers, auth, ...restOptions } = options;
    const url = `${BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...restOptions,
        headers: {
            'Content-Type': 'application/json',
            ...buildAuthHeaders(auth),
            ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        if (auth && response.status === 401) {
            unauthorizedHandler?.();
        }
        throw new HttpError(response.status, await readErrorMessage(response));
    }

    return (await response.json()) as T;
}
