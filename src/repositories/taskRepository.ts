import { HttpError, httpClient } from '../api/httpClient';
import { tokenStorage } from '../api/tokenStorage';
import type {
    ApiTodo,
    PaginatedTasks,
    Task,
    TaskAuthor,
    TaskFormData,
    TodosResponse,
    UpdateTaskData,
} from '../types/task';
import { clientTaskStore } from './clientTaskStore';

// Мапінг API DTO -> Domain Model
function toTask(dto: ApiTodo): Task {
    const base: Task = {
        id: dto.id,
        title: dto.todo,
        completed: dto.completed,
        // server-owned: хто створив — userId з DummyJSON
        createdBy: `user #${dto.userId}`,
        // client-owned metadata (у DummyJSON немає цих полів)
        description: `Навчальне завдання #${dto.id} (DummyJSON userId: ${dto.userId})`,
        priority: dto.id % 3 === 0 ? 'high' : dto.id % 2 === 0 ? 'medium' : 'low',
        category: dto.userId % 2 === 0 ? 'React' : 'TypeScript',
        createdAt: clientTaskStore.getOrInitCreatedAt(dto.id),
    };

    // Локальні зміни (edit) мають пріоритет над даними API
    return { ...base, ...clientTaskStore.getOverride(dto.id) };
}

/**
 * Authorization на рівні даних: навіть якщо кнопку не сховали,
 * захищена операція не виконається без токена.
 */
function assertAuthenticated(): void {
    if (!tokenStorage.get()) {
        throw new HttpError(401, 'Потрібна авторизація');
    }
}

export const taskRepository = {
    async getAll(limit = 10, skip = 0, signal?: AbortSignal): Promise<PaginatedTasks> {
        const data = await httpClient<TodosResponse>(`/todos?limit=${limit}&skip=${skip}`, {
            method: 'GET',
            signal,
        });

        const apiTasks = data.todos
            .filter((dto) => !clientTaskStore.isDeleted(dto.id))
            .map(toTask);

        // Створені на клієнті завдання показуємо на першій сторінці
        const tasks = skip === 0 ? [...clientTaskStore.getCreated(), ...apiTasks] : apiTasks;

        return {
            tasks,
            total: data.total + clientTaskStore.getCreated().length - clientTaskStore.deletedCount(),
            skip: data.skip,
            limit: data.limit,
        };
    },

    async getById(id: number, signal?: AbortSignal): Promise<Task> {
        const local = clientTaskStore.findCreated(id);
        if (local) return local;

        if (clientTaskStore.isDeleted(id)) {
            throw new HttpError(404, `Завдання #${id} видалено`);
        }

        const dto = await httpClient<ApiTodo>(`/todos/${id}`, { method: 'GET', signal });
        return toTask(dto);
    },

    async create(data: TaskFormData, author: TaskAuthor): Promise<Task> {
        assertAuthenticated();

        const dto = await httpClient<ApiTodo>('/todos/add', {
            method: 'POST',
            auth: true,
            body: { todo: data.title, completed: false, userId: author.id },
        });

        // DummyJSON завжди повертає id 255 і нічого не зберігає → власний id і client-owned metadata
        const task: Task = {
            ...data,
            id: clientTaskStore.nextLocalId(),
            title: dto.todo || data.title,
            completed: dto.completed ?? false,
            createdBy: author.username,
            createdAt: new Date().toISOString(),
        };
        clientTaskStore.addCreated(task);
        return task;
    },

    async update(id: number, data: UpdateTaskData): Promise<void> {
        assertAuthenticated();

        // Створені на клієнті завдання не існують у DummyJSON (PUT дав би 404)
        if (!clientTaskStore.findCreated(id)) {
            const payload: Record<string, unknown> = {};
            if (data.title !== undefined) payload.todo = data.title;
            if (data.completed !== undefined) payload.completed = data.completed;

            if (Object.keys(payload).length > 0) {
                await httpClient<ApiTodo>(`/todos/${id}`, { method: 'PUT', auth: true, body: payload });
            }
        }

        clientTaskStore.update(id, data);
    },

    async delete(id: number): Promise<void> {
        assertAuthenticated();

        if (!clientTaskStore.findCreated(id)) {
            await httpClient<ApiTodo & { isDeleted: boolean }>(`/todos/${id}`, {
                method: 'DELETE',
                auth: true,
            });
        }

        clientTaskStore.remove(id);
    },
};
