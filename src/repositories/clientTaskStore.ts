import type { Task, UpdateTaskData } from '../types/task';

/**
 * CLIENT-OWNED DATA.
 *
 * DummyJSON імітує POST/PUT/DELETE, але нічого не зберігає на сервері.
 * Щоб після create/edit/delete UI був послідовним (і після переходу між сторінками,
 * і після перезавантаження), клієнт сам зберігає:
 *  - created   — завдання, створені в цьому застосунку;
 *  - overrides — зміни серверних завдань (+ поля, яких немає в API: description, priority, category);
 *  - deleted   — id видалених серверних завдань;
 *  - createdAt — дата, коли клієнт уперше побачив серверне завдання (API не надає createdAt).
 */
interface ClientTaskState {
    created: Task[];
    overrides: Record<number, UpdateTaskData>;
    deleted: number[];
    createdAt: Record<number, string>;
}

const STORAGE_KEY = 'study-planner:client-tasks';
/** Локальні id починаються звідси, щоб не перетинатися з id DummyJSON (1–254). */
const LOCAL_ID_START = 100_000;

function emptyState(): ClientTaskState {
    return { created: [], overrides: {}, deleted: [], createdAt: {} };
}

function load(): ClientTaskState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? { ...emptyState(), ...(JSON.parse(raw) as Partial<ClientTaskState>) } : emptyState();
    } catch {
        return emptyState();
    }
}

let state: ClientTaskState = load();

function save(next: ClientTaskState): void {
    state = next;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        // працюємо лише в пам'яті
    }
}

export const clientTaskStore = {
    getCreated(): Task[] {
        return state.created;
    },

    findCreated(id: number): Task | undefined {
        return state.created.find((task) => task.id === id);
    },

    isDeleted(id: number): boolean {
        return state.deleted.includes(id);
    },

    getOverride(id: number): UpdateTaskData | undefined {
        return state.overrides[id];
    },

    deletedCount(): number {
        return state.deleted.length;
    },

    /** Дата першої появи серверного завдання на клієнті. */
    getOrInitCreatedAt(id: number): string {
        const existing = state.createdAt[id];
        if (existing) return existing;

        const now = new Date().toISOString();
        save({ ...state, createdAt: { ...state.createdAt, [id]: now } });
        return now;
    },

    nextLocalId(): number {
        return state.created.reduce((max, task) => Math.max(max, task.id), LOCAL_ID_START) + 1;
    },

    addCreated(task: Task): void {
        save({ ...state, created: [task, ...state.created] });
    },

    update(id: number, data: UpdateTaskData): void {
        if (this.findCreated(id)) {
            save({
                ...state,
                created: state.created.map((task) => (task.id === id ? { ...task, ...data } : task)),
            });
            return;
        }
        save({ ...state, overrides: { ...state.overrides, [id]: { ...state.overrides[id], ...data } } });
    },

    remove(id: number): void {
        if (this.findCreated(id)) {
            save({ ...state, created: state.created.filter((task) => task.id !== id) });
            return;
        }
        const overrides = { ...state.overrides };
        delete overrides[id];
        save({ ...state, overrides, deleted: [...state.deleted, id] });
    },
};
