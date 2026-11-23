import { Link, useLocation } from 'react-router';
import './NotFoundPage.scss';

export function NotFoundPage() {
    const { pathname } = useLocation();

    return (
        <section className="not-found">
            <p className="not-found__code">404</p>
            <h2 className="not-found__title">Сторінку не знайдено</h2>
            <p className="not-found__text">
                Маршрут <code>{pathname}</code> не існує.
            </p>
            <Link className="not-found__link" to="/tasks">
                До списку завдань
            </Link>
        </section>
    );
}
