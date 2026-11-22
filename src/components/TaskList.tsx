import type { Task } from '../types/task';
import { TaskItem } from './TaskItem';
import './TaskList.scss';

interface TaskListProps {
    tasks: Task[];
    onToggleTask: (task: Task) => void;
    onDeleteTask: (id: number) => void;
}

export function TaskList({ tasks, onToggleTask, onDeleteTask }: TaskListProps) {
    if (tasks.length === 0) {
        return (
            <div className="task-list__empty">
                <p>Завдань не знайдено.</p>
            </div>
        );
    }

    return (
        <div className="task-list">
            {tasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} />
            ))}
        </div>
    );
}
