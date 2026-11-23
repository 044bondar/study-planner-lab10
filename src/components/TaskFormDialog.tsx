import { useEffect, useId, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema } from '../schemas/taskSchema';
import type { Task, TaskFormData } from '../types/task';
import './TaskFormDialog.scss';

export type TaskFormMode = 'create' | 'edit';

export interface TaskFormDialogProps {
    open: boolean;
    mode: TaskFormMode;
    task?: Task;
    onClose: () => void;
    onSubmit: (data: TaskFormData) => Promise<void>;
}

const EMPTY_VALUES: TaskFormData = {
    title: '',
    description: '',
    category: 'React',
    priority: 'medium',
};

function toFormValues(task?: Task): TaskFormData {
    if (!task) return EMPTY_VALUES;
    const { title, description, category, priority } = task;
    return { title, description, category, priority };
}

/**
 * Один діалог для двох сценаріїв: create і edit.
 * Нативний <dialog> + showModal(): фокус переходить у діалог, решта сторінки неактивна,
 * Escape закриває (подія cancel).
 */
export function TaskFormDialog({ open, mode, task, onClose, onSubmit }: TaskFormDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
            // Keyboard focus: одразу ставимо курсор у перше поле форми
            dialog.querySelector<HTMLElement>('input, textarea, select')?.focus();
        }
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className="task-dialog"
            aria-labelledby={titleId}
            onCancel={(event) => {
                // Escape: керуємо закриттям через React-стан
                event.preventDefault();
                onClose();
            }}
        >
            {/* Форма монтується лише коли діалог відкритий → щоразу свіжі початкові значення */}
            {open && (
                <TaskForm
                    key={task?.id ?? 'new'}
                    titleId={titleId}
                    mode={mode}
                    task={task}
                    onClose={onClose}
                    onSubmit={onSubmit}
                />
            )}
        </dialog>
    );
}

interface TaskFormProps extends Omit<TaskFormDialogProps, 'open'> {
    titleId: string;
}

function TaskForm({ titleId, mode, task, onClose, onSubmit }: TaskFormProps) {
    const fieldId = useId();
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: toFormValues(task),
    });

    const submit = handleSubmit(async (values) => {
        try {
            await onSubmit(values);
        } catch (err) {
            setError('root.server', {
                message: err instanceof Error ? err.message : 'Не вдалося зберегти завдання',
            });
        }
    });

    const heading = mode === 'create' ? 'Нове завдання' : `Редагування завдання #${task?.id ?? ''}`;
    const idFor = (name: keyof TaskFormData) => `${fieldId}-${name}`;
    const errorIdFor = (name: keyof TaskFormData) => `${fieldId}-${name}-error`;

    return (
        <form className="task-dialog__form" onSubmit={submit} noValidate>
            <div className="task-dialog__header">
                <h2 id={titleId} className="task-dialog__title">
                    {heading}
                </h2>
                <button
                    type="button"
                    className="task-dialog__close"
                    aria-label="Закрити діалог"
                    onClick={onClose}
                >
                    &times;
                </button>
            </div>

            <fieldset className="task-dialog__fields" disabled={isSubmitting}>
                <div className="task-dialog__field">
                    <label className="task-dialog__label" htmlFor={idFor('title')}>
                        Назва *
                    </label>
                    <input
                        id={idFor('title')}
                        className={`task-dialog__input ${errors.title ? 'task-dialog__input--invalid' : ''}`}
                        type="text"
                        placeholder="Наприклад: Вивчити React Router"
                        aria-invalid={errors.title ? true : undefined}
                        aria-describedby={errors.title ? errorIdFor('title') : undefined}
                        {...register('title')}
                    />
                    {errors.title && (
                        <p id={errorIdFor('title')} className="task-dialog__error">
                            {errors.title.message}
                        </p>
                    )}
                </div>

                <div className="task-dialog__field">
                    <label className="task-dialog__label" htmlFor={idFor('description')}>
                        Опис
                    </label>
                    <textarea
                        id={idFor('description')}
                        className={`task-dialog__input task-dialog__input--textarea ${
                            errors.description ? 'task-dialog__input--invalid' : ''
                        }`}
                        rows={3}
                        placeholder="Короткий опис завдання"
                        aria-invalid={errors.description ? true : undefined}
                        aria-describedby={errors.description ? errorIdFor('description') : undefined}
                        {...register('description')}
                    />
                    {errors.description && (
                        <p id={errorIdFor('description')} className="task-dialog__error">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                <div className="task-dialog__row">
                    <div className="task-dialog__field">
                        <label className="task-dialog__label" htmlFor={idFor('category')}>
                            Категорія *
                        </label>
                        <input
                            id={idFor('category')}
                            className={`task-dialog__input ${errors.category ? 'task-dialog__input--invalid' : ''}`}
                            type="text"
                            placeholder="React, TypeScript..."
                            aria-invalid={errors.category ? true : undefined}
                            aria-describedby={errors.category ? errorIdFor('category') : undefined}
                            {...register('category')}
                        />
                        {errors.category && (
                            <p id={errorIdFor('category')} className="task-dialog__error">
                                {errors.category.message}
                            </p>
                        )}
                    </div>

                    <div className="task-dialog__field">
                        <label className="task-dialog__label" htmlFor={idFor('priority')}>
                            Пріоритет
                        </label>
                        <select
                            id={idFor('priority')}
                            className="task-dialog__input"
                            aria-invalid={errors.priority ? true : undefined}
                            aria-describedby={errors.priority ? errorIdFor('priority') : undefined}
                            {...register('priority')}
                        >
                            <option value="low">Low (Низький)</option>
                            <option value="medium">Medium (Середній)</option>
                            <option value="high">High (Високий)</option>
                        </select>
                        {errors.priority && (
                            <p id={errorIdFor('priority')} className="task-dialog__error">
                                {errors.priority.message}
                            </p>
                        )}
                    </div>
                </div>
            </fieldset>

            {errors.root?.server && (
                <p className="task-dialog__error task-dialog__error--server" role="alert">
                    {errors.root.server.message}
                </p>
            )}

            <div className="task-dialog__actions">
                <button type="button" className="task-dialog__btn" onClick={onClose}>
                    Скасувати
                </button>
                <button
                    type="submit"
                    className="task-dialog__btn task-dialog__btn--primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Збереження…' : mode === 'create' ? 'Створити' : 'Зберегти зміни'}
                </button>
            </div>
        </form>
    );
}
