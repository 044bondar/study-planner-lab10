export const DEFAULT_AFTER_LOGIN = '/tasks';

/** /login?redirectTo=<куди повернутися після входу> */
export function buildLoginUrl(returnTo: string): string {
    return `/login?redirectTo=${encodeURIComponent(returnTo)}`;
}

/**
 * Дозволяємо повертатися лише на внутрішні шляхи застосунку,
 * щоб ?redirectTo=https://evil.com не став open redirect.
 */
export function getSafeRedirect(value: string | null): string {
    if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/login')) {
        return DEFAULT_AFTER_LOGIN;
    }
    return value;
}
