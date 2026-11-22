import { useLoaderData, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useTaskContext } from '../hooks/useTaskContext';
import type { requireUser } from '../routes/loaders';
import './ProfilePage.scss';

/** Protected route: сюди потрапляє лише користувач, якого пропустив loader requireUser. */
export function ProfilePage() {
    const user = useLoaderData<typeof requireUser>();
    const { isAuthenticated, logout } = useAuth();
    const { showToast } = useTaskContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        showToast('Ви вийшли з акаунта', 'info');
        navigate('/login', { replace: true });
    };

    return (
        <section className="profile-page" aria-labelledby="profile-page-title">
            <div className="profile-page__card">
                {user.image && <img className="profile-page__avatar" src={user.image} alt="" width={96} height={96} />}

                <div className="profile-page__info">
                    <h2 id="profile-page-title" className="profile-page__name">
                        {user.firstName} {user.lastName}
                    </h2>
                    <dl className="profile-page__props">
                        <dt className="profile-page__prop-name">Username</dt>
                        <dd className="profile-page__prop-value">{user.username}</dd>
                        <dt className="profile-page__prop-name">Email</dt>
                        <dd className="profile-page__prop-value">{user.email}</dd>
                        <dt className="profile-page__prop-name">Статус</dt>
                        <dd className="profile-page__prop-value">
                            <span
                                className={`profile-page__badge ${
                                    isAuthenticated ? 'profile-page__badge--active' : ''
                                }`}
                            >
                                {isAuthenticated ? 'Авторизовано' : 'Не авторизовано'}
                            </span>
                        </dd>
                    </dl>

                    <button type="button" className="profile-page__logout" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </section>
    );
}
