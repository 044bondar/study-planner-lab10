import { createContext } from 'react';
import type { ToastMessage } from '../types/task';

/**
 * UI-контекст (toast-повідомлення).
 * Фільтр із лабораторної №10 перенесено в URL (query params), тому тут його більше немає.
 */
export interface UiContextValue {
    toast: ToastMessage | null;
    showToast: (text: string, type?: ToastMessage['type']) => void;
    dismissToast: () => void;
}

export const TaskContext = createContext<UiContextValue | null>(null);
