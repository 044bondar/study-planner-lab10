import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router';
import { getSafeRedirect } from '../auth/redirect';
import { useAuth } from '../hooks/useAuth';
import { useTaskContext } from '../hooks/useTaskContext';
import { loginSchema, type LoginFormData } from '../schemas/authSchema';
import './LoginPage.scss';

export function LoginPage() {
    const { login } = useAuth();
    const { showToast } = useTaskContext();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const fieldId = useId();

    const redirectTo = searchParams.get('redirectTo');

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { username: '', password: '' },
    });

    const onSubmit = handleSubmit(async (values) => {
        try {
            const user = await login(values);
            showToast(`Вітаємо, ${user.firstName || user.username}!`, 'success');
            // Додаткове завдання: повернення на маршрут, з якого прийшли
            navigate(getSafeRedirect(redirectTo), { replace: true });
        } catch (err) {
            setError('root.server', {
                message: err instanceof Error ? err.message : 'Не вдалося увійти',
            });
        }
    });

    return (
        <section className="login-page" aria-labelledby="login-page-title">
            <form className="login-page__form" onSubmit={onSubmit} noValidate>
                <h2 id="login-page-title" className="login-page__title">
                    Вхід
                </h2>

                {redirectTo && (
                    <p className="login-page__notice">Увійдіть, щоб продовжити: {redirectTo}</p>
                )}

                <fieldset className="login-page__fields" disabled={isSubmitting}>
                    <div className="login-page__field">
                        <label className="login-page__label" htmlFor={`${fieldId}-username`}>
                            Username
                        </label>
                        <input
                            id={`${fieldId}-username`}
                            className={`login-page__input ${errors.username ? 'login-page__input--invalid' : ''}`}
                            type="text"
                            autoComplete="username"
                            aria-invalid={errors.username ? true : undefined}
                            aria-describedby={errors.username ? `${fieldId}-username-error` : undefined}
                            {...register('username')}
                        />
                        {errors.username && (
                            <p id={`${fieldId}-username-error`} className="login-page__error">
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    <div className="login-page__field">
                        <label className="login-page__label" htmlFor={`${fieldId}-password`}>
                            Password
                        </label>
                        <input
                            id={`${fieldId}-password`}
                            className={`login-page__input ${errors.password ? 'login-page__input--invalid' : ''}`}
                            type="password"
                            autoComplete="current-password"
                            aria-invalid={errors.password ? true : undefined}
                            aria-describedby={errors.password ? `${fieldId}-password-error` : undefined}
                            {...register('password')}
                        />
                        {errors.password && (
                            <p id={`${fieldId}-password-error`} className="login-page__error">
                                {errors.password.message}
                            </p>
                        )}
                    </div>
                </fieldset>

                {errors.root?.server && (
                    <p className="login-page__error login-page__error--server" role="alert">
                        {errors.root.server.message}
                    </p>
                )}

                <button type="submit" className="login-page__submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Вхід…' : 'Увійти'}
                </button>

                <p className="login-page__hint">
                    Тестовий акаунт DummyJSON: <code>emilys</code> / <code>emilyspass</code>
                </p>
            </form>
        </section>
    );
}
