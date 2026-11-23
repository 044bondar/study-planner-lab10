import { NavLink, useRevalidator } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { useTaskContext } from '../hooks/useTaskContext';
import './Header.scss';

function navLinkClass({ isActive }: { isActive: boolean }) {
    return `header__link ${isActive ? 'header__link--active' : ''}`;
}

export function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const { showToast } = useTaskContext();
    const revalidator = useRevalidator();

    const handleLogout = () => {
        logout();
        showToast('Ви вийшли з акаунта', 'info');
        // Повторно запускаємо loaders поточного маршруту:
        // якщо ми на /profile, requireUser перенаправить на /login
        void revalidator.revalidate();
    };

    return (
        <header className="header">
            <div className="header__brand">
                <h1 className="header__title">Study Planner</h1>
                <p className="header__subtitle">Планувальник навчальних завдань</p>
            </div>

            <nav className="header__nav" aria-label="Головна навігація">
                <NavLink to="/tasks" className={navLinkClass}>
                    Tasks
                </NavLink>
                <NavLink to="/profile" className={navLinkClass}>
                    Profile
                </NavLink>
                {isAuthenticated ? (
                    <>
                        <span className="header__user">{user?.username}</span>
                        <button type="button" className="header__link header__link--button" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <NavLink to="/login" className={navLinkClass}>
                        Login
                    </NavLink>
                )}
            </nav>
        </header>
    );
}
