import { data, redirect, type LoaderFunctionArgs } from 'react-router';
import { authStore } from '../auth/authStore';
import { buildLoginUrl, getSafeRedirect } from '../auth/redirect';
import { HttpError } from '../api/httpClient';
import { taskRepository } from '../repositories/taskRepository';
import { parsePage } from './taskSearchParams';

export const PAGE_LIMIT = 10;

/**
 * Protected route у Data Mode.
 * Loader — звичайна функція (не компонент), тому hooks тут недоступні:
 * сесію читаємо напряму з authStore.
 */
export async function requireUser({ request }: LoaderFunctionArgs) {
    const user = await authStore.getCurrentUser();
    if (!user) {
        const url = new URL(request.url);
        throw redirect(buildLoginUrl(url.pathname + url.search));
    }
    return user;
}

/** Уже авторизованого користувача з /login одразу повертаємо туди, куди він ішов. */
export async function loginLoader({ request }: LoaderFunctionArgs) {
    const user = await authStore.getCurrentUser();
    if (user) {
        const redirectTo = new URL(request.url).searchParams.get('redirectTo');
        throw redirect(getSafeRedirect(redirectTo));
    }
    return null;
}

export async function tasksLoader({ request }: LoaderFunctionArgs) {
    const page = parsePage(new URL(request.url).searchParams);
    const result = await taskRepository.getAll(PAGE_LIMIT, (page - 1) * PAGE_LIMIT, request.signal);

    return {
        tasks: result.tasks,
        total: result.total,
        page,
        totalPages: Math.max(1, Math.ceil(result.total / PAGE_LIMIT)),
    };
}

export async function taskDetailsLoader({ params, request }: LoaderFunctionArgs) {
    const taskId = Number(params.taskId);
    if (!Number.isInteger(taskId) || taskId <= 0) {
        throw data(`Некоректний id завдання: ${params.taskId}`, { status: 404 });
    }

    try {
        return { task: await taskRepository.getById(taskId, request.signal) };
    } catch (err) {
        if (err instanceof HttpError && err.status === 404) {
            throw data(`Завдання #${taskId} не знайдено`, { status: 404 });
        }
        throw err;
    }
}
