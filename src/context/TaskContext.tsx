import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { TaskContext, type UiContextValue } from './taskContextInstance';
import type { ToastMessage } from '../types/task';

export function TaskProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<ToastMessage | null>(null);

    const showToast = useCallback((text: string, type: ToastMessage['type'] = 'info') => {
        setToast({ id: Date.now(), text, type });
    }, []);

    const dismissToast = useCallback(() => setToast(null), []);

    useEffect(() => {
        if (!toast) return;
        const timerId = window.setTimeout(() => setToast(null), 3000);
        return () => window.clearTimeout(timerId);
    }, [toast]);

    const value = useMemo<UiContextValue>(
        () => ({ toast, showToast, dismissToast }),
        [toast, showToast, dismissToast]
    );

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
