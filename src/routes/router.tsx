import { createBrowserRouter, redirect } from 'react-router';
import { AppLayout } from '../layouts/AppLayout';
import { TasksPage } from '../pages/TasksPage';
import { TaskDetailsPage } from '../pages/TaskDetailsPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { RouteErrorPage } from '../pages/RouteErrorPage';
import { loginLoader, requireUser, taskDetailsLoader, tasksLoader } from './loaders';

/**
 * Data Mode (непарний варіант): createBrowserRouter + RouterProvider.
 *
 * /
 * ├── /tasks            — список, фільтри в query params
 * ├── /tasks/:taskId    — деталі (route params)
 * ├── /login
 * ├── /profile          — protected: loader requireUser + redirect
 * └── *                 — 404
 */
export const router = createBrowserRouter([
    {
        path: '/',
        Component: AppLayout,
        hydrateFallbackElement: <p className="app-fallback">Завантаження…</p>,
        children: [
            {
                // Pathless route: помилка рендериться всередині layout, header лишається
                errorElement: <RouteErrorPage />,
                children: [
                    { index: true, loader: () => redirect('/tasks') },
                    {
                        path: 'tasks',
                        children: [
                            { index: true, loader: tasksLoader, Component: TasksPage },
                            { path: ':taskId', loader: taskDetailsLoader, Component: TaskDetailsPage },
                        ],
                    },
                    { path: 'login', loader: loginLoader, Component: LoginPage },
                    {
                        path: 'profile',
                        loader: requireUser,
                        // Lazy loading: код сторінки профілю завантажується лише при першому переході
                        lazy: async () => {
                            const { ProfilePage } = await import('../pages/ProfilePage');
                            return { Component: ProfilePage };
                        },
                    },
                    { path: '*', Component: NotFoundPage },
                ],
            },
        ],
    },
]);
