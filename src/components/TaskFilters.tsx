import { useSearchParams } from 'react-router';
import {
    PRIORITY_VALUES,
    parsePriority,
    parseStatus,
    withParam,
} from '../routes/taskSearchParams';
import type { PriorityFilter, StatusFilter, Task } from '../types/task';
import './TaskFilters.scss';

const PRIORITY_LABELS: Record<PriorityFilter, string> = {
    all: 'Будь-який',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
};

/** Фільтри читаються з URL і записуються в URL (?status=...&priority=...). */
export function TaskFilters({ tasks }: { tasks: Task[] }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const status = parseStatus(searchParams);
    const priority = parsePriority(searchParams);

    const completedCount = tasks.filter((t) => t.completed).length;
    const statuses: { key: StatusFilter; label: string; count: number }[] = [
        { key: 'all', label: 'Всі', count: tasks.length },
        { key: 'active', label: 'Не виконані', count: tasks.length - completedCount },
        { key: 'completed', label: 'Виконані', count: completedCount },
    ];

    return (
        <div className="task-filters">
            <div className="task-filters__group" role="group" aria-label="Статус">
                {statuses.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        className={`task-filters__btn ${status === item.key ? 'task-filters__btn--active' : ''}`}
                        aria-pressed={status === item.key}
                        onClick={() => setSearchParams(withParam(searchParams, 'status', item.key, 'all'))}
                    >
                        {item.label} ({item.count})
                    </button>
                ))}
            </div>

            <label className="task-filters__select-label">
                Пріоритет:
                <select
                    className="task-filters__select"
                    value={priority}
                    onChange={(e) => setSearchParams(withParam(searchParams, 'priority', e.target.value, 'all'))}
                >
                    {PRIORITY_VALUES.map((value) => (
                        <option key={value} value={value}>
                            {PRIORITY_LABELS[value]}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
}
