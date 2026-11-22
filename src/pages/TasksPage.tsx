import { useState } from 'react';
import { useLoaderData, useNavigation, useRevalidator, useSearchParams } from 'react-router';
import { TaskFilters } from '../components/TaskFilters';
import { TaskFormDialog } from '../components/TaskFormDialog';
import { TaskList } from '../components/TaskList';
import { TaskStats } from '../components/TaskStats';
import { Pagination } from '../components/Pagination';
import { useAuth } from '../hooks/useAuth';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { useTaskContext } from '../hooks/useTaskContext';
import { taskRepository } from '../repositories/taskRepository';
import type { tasksLoader } from '../routes/loaders';
import { filterTasks, parsePriority, parseStatus, withParam } from '../routes/taskSearchParams';
import type { Task, TaskFormData } from '../types/task';
import './TasksPage.scss';

export function TasksPage() {
    const { tasks, total, page, totalPages } = useLoaderData<typeof tasksLoader>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigation = useNavigation();
    const revalidator = useRevalidator();
    const { user } = useAuth();
    const requireAuth = useAuthGuard();
    const { showToast } = useTaskContext();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Фільтри беремо з URL — окремого стану немає
    const visibleTasks = filterTasks(tasks, parseStatus(searchParams), parsePriority(searchParams));
    const isBusy = navigation.state !== 'idle' || revalidator.state !== 'idle';

    const openCreate = () => {
        if (requireAuth()) setIsCreateOpen(true);
    };

    const handleCreate = async (data: TaskFormData) => {
        // Повторна перевірка безпосередньо перед захищеною дією
        if (!requireAuth() || !user) return;

        await taskRepository.create(data, { id: user.id, username: user.username });
        setIsCreateOpen(false);
        showToast('Завдання створено', 'success');
        await revalidator.revalidate(); // оновлюємо дані loader-а без перезавантаження сторінки
    };

    const handleToggle = async (task: Task) => {
        if (!requireAuth()) return;
        try {
            await taskRepository.update(task.id, { completed: !task.completed });
            showToast('Статус завдання оновлено', 'info');
            await revalidator.revalidate();
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Помилка оновлення статусу', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (!requireAuth()) return;
        try {
            await taskRepository.delete(id);
            showToast('Завдання видалено', 'info');
            await revalidator.revalidate();
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Помилка видалення завдання', 'error');
        }
    };

    return (
        <section className="tasks-page" aria-labelledby="tasks-page-title">
            <div className="tasks-page__toolbar">
                <h2 id="tasks-page-title" className="tasks-page__title">
                    Завдання
                </h2>
                <button
                    type="button"
                    className="tasks-page__add"
                    aria-label="Створити нове завдання"
                    onClick={openCreate}
                >
                    + Нове завдання
                </button>
            </div>

            <TaskStats tasks={tasks} />
            <TaskFilters tasks={tasks} />

            <div className={isBusy ? 'tasks-page__list tasks-page__list--busy' : 'tasks-page__list'}>
                <TaskList tasks={visibleTasks} onToggleTask={handleToggle} onDeleteTask={handleDelete} />
            </div>

            <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={total}
                disabled={isBusy}
                onPageChange={(nextPage) =>
                    setSearchParams(withParam(searchParams, 'page', String(nextPage), '1'))
                }
            />

            <TaskFormDialog
                open={isCreateOpen}
                mode="create"
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreate}
            />
        </section>
    );
}
