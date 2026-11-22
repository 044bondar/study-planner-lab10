import type { PriorityFilter, StatusFilter, Task } from '../types/task';

/**
 * URL — джерело правди для фільтрів: /tasks?status=completed&priority=high&page=2
 * Окремого useState для фільтра немає, тому дублювання стану немає.
 */
export const STATUS_VALUES: StatusFilter[] = ['all', 'active', 'completed'];
export const PRIORITY_VALUES: PriorityFilter[] = ['all', 'low', 'medium', 'high'];

export function parseStatus(params: URLSearchParams): StatusFilter {
    const value = params.get('status');
    return STATUS_VALUES.includes(value as StatusFilter) ? (value as StatusFilter) : 'all';
}

export function parsePriority(params: URLSearchParams): PriorityFilter {
    const value = params.get('priority');
    return PRIORITY_VALUES.includes(value as PriorityFilter) ? (value as PriorityFilter) : 'all';
}

export function parsePage(params: URLSearchParams): number {
    const page = Number(params.get('page'));
    return Number.isInteger(page) && page > 0 ? page : 1;
}

export function filterTasks(tasks: Task[], status: StatusFilter, priority: PriorityFilter): Task[] {
    return tasks.filter((task) => {
        if (status === 'completed' && !task.completed) return false;
        if (status === 'active' && task.completed) return false;
        return priority === 'all' || task.priority === priority;
    });
}

/** Нові параметри на основі поточних; значення за замовчуванням прибираємо з URL. */
export function withParam(params: URLSearchParams, key: string, value: string, defaultValue: string): URLSearchParams {
    const next = new URLSearchParams(params);
    if (value === defaultValue) {
        next.delete(key);
    } else {
        next.set(key, value);
    }
    return next;
}
