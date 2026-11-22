export type Priority = 'low' | 'medium' | 'high';
export type StatusFilter = 'all' | 'completed' | 'active';
export type PriorityFilter = 'all' | Priority;

/**
 * Domain model (використовується в UI).
 *
 * Server-owned (DummyJSON /todos): id, title (todo), completed, userId → createdBy.
 * Client-owned metadata (DummyJSON їх не зберігає, тому ними володіє клієнт):
 * description, priority, category, createdAt, а також createdBy для завдань,
 * створених у цьому застосунку. Див. repositories/clientTaskStore.ts.
 */
export interface Task {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    priority: Priority;
    category: string;
    /** Автор завдання (username або "user #<id>" з DummyJSON). */
    createdBy: string;
    /** ISO-дата створення. CLIENT-OWNED: DummyJSON не повертає це поле. */
    createdAt: string;
}

/** Дані, які редагуються у TaskFormDialog. */
export type TaskFormData = Pick<Task, 'title' | 'description' | 'category' | 'priority'>;
export type UpdateTaskData = Partial<Pick<Task, 'title' | 'description' | 'category' | 'priority' | 'completed'>>;

export interface TaskAuthor {
    id: number;
    username: string;
}

// API DTO (модель DummyJSON)
export interface ApiTodo {
    id: number;
    todo: string;
    completed: boolean;
    userId: number;
}

export interface TodosResponse {
    todos: ApiTodo[];
    total: number;
    skip: number;
    limit: number;
}

export interface PaginatedTasks {
    tasks: Task[];
    total: number;
    skip: number;
    limit: number;
}

export interface ToastMessage {
    id: number;
    text: string;
    type: 'success' | 'info' | 'error';
}
