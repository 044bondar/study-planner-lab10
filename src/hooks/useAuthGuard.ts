import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { buildLoginUrl } from '../auth/redirect';
import { useAuth } from './useAuth';
import { useTaskContext } from './useTaskContext';

/**
 * Authorization для CRUD-дій.
 * Повертає функцію, яку викликаємо ПЕРЕД захищеною дією:
 * якщо користувач не увійшов — переводимо на /login і повертаємо false.
 */
export function useAuthGuard() {
    const { isAuthenticated } = useAuth();
    const { showToast } = useTaskContext();
    const navigate = useNavigate();
    const location = useLocation();

    return useCallback((): boolean => {
        if (isAuthenticated) return true;

        showToast('Увійдіть, щоб виконати цю дію', 'info');
        navigate(buildLoginUrl(location.pathname + location.search));
        return false;
    }, [isAuthenticated, showToast, navigate, location.pathname, location.search]);
}
