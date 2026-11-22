/**
 * Єдине місце, де зберігається accessToken.
 *
 * Зберігаємо в localStorage, щоб відновлювати сесію після перезавантаження.
 * Ризик: localStorage доступний будь-якому JS на сторінці, тож при XSS токен можна викрасти.
 * Для навчального проєкту це прийнятно; у продакшені краще httpOnly cookie.
 */
const TOKEN_KEY = 'study-planner:access-token';

export const tokenStorage = {
    get(): string | null {
        try {
            return localStorage.getItem(TOKEN_KEY);
        } catch {
            return null;
        }
    },

    set(token: string): void {
        try {
            localStorage.setItem(TOKEN_KEY, token);
        } catch {
            // Сховище недоступне (приватний режим тощо) — сесія житиме лише в пам'яті
        }
    },

    clear(): void {
        try {
            localStorage.removeItem(TOKEN_KEY);
        } catch {
            // ignore
        }
    },
};
