import { useState } from 'react';
import { Link, useLoaderData, useLocation, useNavigate, useParams, useRevalidator } from 'react-router';
import { TaskFormDialog } from '../components/TaskFormDialog';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { useTaskContext } from '../hooks/useTaskContext';
import { taskRepository } from '../repositories/taskRepository';
import type { taskDetailsLoader } from '../routes/loaders';
import type { TaskFormData } from '../types/task';
import './TaskDetailsPage.scss';

const PRIORITY_LABELS = { low: 'Низький', medium: 'Середній', high: 'Високий' } as const;

function formatDate(iso: string): string {
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
        ? iso
        : date.toLocaleString('uk-UA', { dateStyle: 'medium', timeStyle: 'short' });
}

export function TaskDetailsPage() {
    // Route param :taskId — його вже використав loader; тут лише для заголовка
    const { taskId } = useParams();
    const { task } = useLoaderData<typeof taskDetailsLoader>();
    const location = useLocation();
    const navigate = useNavigate();
    const revalidator = useRevalidator();
    const requireAuth = useAuthGuard();
    const { showToast } = useTaskContext();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Повернення до списку з тими самими фільтрами, з якими сюди прийшли
    const from = (location.state as { from?: unknown } | null)?.from;
    const backTo = typeof from === 'string' && from.startsWith('?') ? `/tasks${from}` : '/tasks';

    const openEdit = () => {
        if (requireAuth()) setIsEditOpen(true);
    };

    const handleEdit = async (data: TaskFormData) => {
        if (!requireAuth()) return;

        await taskRepository.update(task.id, data);
        setIsEditOpen(false);
        showToast('Завдання оновлено', 'success');
        await revalidator.revalidate();
    };

    const handleDelete = async () => {
        if (!requireAuth()) return;

        setIsDeleting(true);
        try {
            await taskRepository.delete(task.id);
            showToast('Завдання видалено', 'info');
            navigate(backTo, { replace: true });
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Помилка видалення завдання', 'error');
            setIsDeleting(false);
            setConfirmDelete(false);
        }
    };

    return (
        <article className="task-page" aria-labelledby="task-page-title">
            <Link className="task-page__back" to={backTo}>
                &larr; До списку
            </Link>

            <div className="task-page__card">
                <header className="task-page__header">
                    <div>
                        <p className="task-page__id">Завдання #{taskId}</p>
                        <h2 id="task-page-title" className="task-page__title">
                            {task.title}
                        </h2>
                    </div>
                    <span
                        className={`task-page__status ${task.completed ? 'task-page__status--done' : ''}`}
                    >
                        {task.completed ? 'Виконано' : 'Не виконано'}
                    </span>
                </header>

                <p className="task-page__description">{task.description || 'Без опису'}</p>

                <dl className="task-page__props">
                    <div className="task-page__prop">
                        <dt className="task-page__prop-name">Категорія</dt>
                        <dd className="task-page__prop-value">{task.category}</dd>
                    </div>
                    <div className="task-page__prop">
                        <dt className="task-page__prop-name">Пріоритет</dt>
                        <dd className={`task-page__prop-value task-page__prop-value--${task.priority}`}>
                            {PRIORITY_LABELS[task.priority]}
                        </dd>
                    </div>
                    <div className="task-page__prop">
                        <dt className="task-page__prop-name">Стан виконання</dt>
                        <dd className="task-page__prop-value">{task.completed ? 'Виконано' : 'У процесі'}</dd>
                    </div>
                    <div className="task-page__prop">
                        <dt className="task-page__prop-name">Хто створив</dt>
                        <dd className="task-page__prop-value">{task.createdBy}</dd>
                    </div>
                    <div className="task-page__prop">
                        <dt className="task-page__prop-name">Дата створення</dt>
                        <dd className="task-page__prop-value">{formatDate(task.createdAt)}</dd>
                    </div>
                </dl>

                <div className="task-page__actions">
                    <button type="button" className="task-page__btn task-page__btn--edit" onClick={openEdit}>
                        Редагувати
                    </button>

                    {!confirmDelete ? (
                        <button
                            type="button"
                            className="task-page__btn task-page__btn--delete"
                            onClick={() => {
                                if (requireAuth()) setConfirmDelete(true);
                            }}
                        >
                            Видалити
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="task-page__btn task-page__btn--delete"
                                disabled={isDeleting}
                                onClick={handleDelete}
                            >
                                {isDeleting ? 'Видалення…' : 'Так, видалити'}
                            </button>
                            <button
                                type="button"
                                className="task-page__btn"
                                disabled={isDeleting}
                                onClick={() => setConfirmDelete(false)}
                            >
                                Скасувати
                            </button>
                        </>
                    )}
                </div>
            </div>

            <TaskFormDialog
                open={isEditOpen}
                mode="edit"
                task={task}
                onClose={() => setIsEditOpen(false)}
                onSubmit={handleEdit}
            />
        </article>
    );
}
