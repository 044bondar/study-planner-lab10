import { isRouteErrorResponse, Link, useRevalidator, useRouteError } from 'react-router';
import { NotFoundPage } from './NotFoundPage';
import './RouteErrorPage.scss';

/** errorElement: помилки loader-ів і рендеру всередині layout. */
export function RouteErrorPage() {
    const error = useRouteError();
    const revalidator = useRevalidator();

    if (isRouteErrorResponse(error) && error.status === 404) {
        if (typeof error.data === 'string') {
            return (
                <section className="route-error">
                    <h2 className="route-error__title">404</h2>
                    <p className="route-error__text">{error.data}</p>
                    <Link className="route-error__link" to="/tasks">
                        До списку завдань
                    </Link>
                </section>
            );
        }
        return <NotFoundPage />;
    }

    const message = isRouteErrorResponse(error)
        ? `${error.status} ${error.statusText}`
        : error instanceof Error
          ? error.message
          : 'Невідома помилка';

    return (
        <section className="route-error" role="alert">
            <h2 className="route-error__title">Не вдалося завантажити дані</h2>
            <p className="route-error__text">{message}</p>
            <div className="route-error__actions">
                <button
                    type="button"
                    className="route-error__btn"
                    disabled={revalidator.state !== 'idle'}
                    onClick={() => void revalidator.revalidate()}
                >
                    Спробувати ще
                </button>
                <Link className="route-error__link" to="/tasks">
                    До списку завдань
                </Link>
            </div>
        </section>
    );
}
