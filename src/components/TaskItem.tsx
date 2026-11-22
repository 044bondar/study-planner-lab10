import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import type { Task } from '../types/task';
import './TaskItem.scss';

interface TaskItemProps {
    task: Task;
    onToggle: (task: Task) => void;
    onDelete: (id: number) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const location = useLocation();

    return (
        <article className={`task-item ${task.completed ? 'task-item--completed' : ''}`}>
            <div className="task-item__content">
                <h3 className="task-item__title">
                    {/* state.from — щоб «Назад до списку» зберіг фільтри */}
                    <Link className="task-item__link" to={`/tasks/${task.id}`} state={{ from: location.search }}>
                        {task.title}
                    </Link>
                </h3>
                <p className="task-item__desc">{task.description}</p>
                <div className="task-item__meta">
                    <span className="task-item__badge">{task.category}</span>
                    <span className={`task-item__badge task-item__badge--${task.priority}`}>
                        Пріоритет: {task.priority}
                    </span>
                    <span className="task-item__badge">{task.completed ? 'Виконано' : 'У процесі'}</span>
                </div>
            </div>

            <div className="task-item__actions">
                <Link
                    className="task-item__btn task-item__btn--details"
                    to={`/tasks/${task.id}`}
                    state={{ from: location.search }}
                >
                    Деталі
                </Link>
                <button
                    type="button"
                    className="task-item__btn task-item__btn--toggle"
                    onClick={() => onToggle(task)}
                >
                    {task.completed ? 'Повернути' : 'Виконано'}
                </button>

                {!confirmDelete ? (
                    <button
                        type="button"
                        className="task-item__btn task-item__btn--delete"
                        onClick={() => setConfirmDelete(true)}
                    >
                        Видалити
                    </button>
                ) : (
                    <>
                        <button
                            type="button"
                            className="task-item__btn task-item__btn--delete"
                            onClick={() => {
                                setConfirmDelete(false);
                                onDelete(task.id);
                            }}
                        >
                            Підтвердити?
                        </button>
                        <button
                            type="button"
                            className="task-item__btn"
                            onClick={() => setConfirmDelete(false)}
                        >
                            Ні
                        </button>
                    </>
                )}
            </div>
        </article>
    );
}
