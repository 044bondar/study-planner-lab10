# Study Planner — Лабораторна робота №11

**Тема:** React Router 8, форми, валідація та автентифікація.
**Варіант:** непарний → **Data Mode** (`createBrowserRouter` + `RouterProvider`, protected route через `loader` + `redirect`).
**Гілка:** `feature/routing-auth`
**Стилі:** SCSS + BEM (кожен компонент/сторінка має власний `.scss` поруч).

## Стек

| Технологія | Версія |
|---|---|
| Node.js | ≥ 22.22 |
| React / React DOM | ^19.3.1 |
| TypeScript | ^5.9 |
| React Router | ^8.5.1 (`react-router`, `RouterProvider` з `react-router/dom`) |
| React Hook Form | ^7.85 + `@hookform/resolvers` ^5.9 |
| Zod | ^4.6 |
| Vite / Sass / ESLint | з лабораторної №10 |

API: DummyJSON (`/todos`, `/auth/login`, `/auth/me`).

## Запуск (WebStorm, Windows)

1. Відкрити папку проєкту в WebStorm.
2. У терміналі WebStorm (`Alt+F12`):
   ```bash
   npm install
   npm run dev
   ```
3. Відкрити `http://localhost:5173` → автоматично перенаправить на `/tasks`.
4. Перевірки: `npm run lint`, `npm run build`.

Тестовий акаунт: **emilys / emilyspass**.

## Маршрути

```
/                 → redirect на /tasks (index loader)
├── /tasks            список; фільтри в query params: ?status=completed&priority=high&page=2
├── /tasks/:taskId    деталі (route param), loader taskDetailsLoader
├── /login            форма входу (RHF + Zod), loader перенаправляє вже авторизованого
├── /profile          PROTECTED: loader requireUser → redirect('/login?redirectTo=/profile')
└── *                 NotFoundPage (404)
```

Конфігурація — `src/routes/router.tsx`. Спільний layout (`AppLayout`) — батьківський route з `children` і `<Outlet />`; всередині pathless route з `errorElement`, тож помилки показуються під Header.

## Структура

```
src/
├── api/            httpClient (Authorization header), authApi, tokenStorage
├── auth/           authStore (сесія поза React), redirect (безпечний redirectTo)
├── components/     Header, TaskFormDialog, TaskFilters, TaskList, TaskItem, TaskStats, Pagination, Toast
├── context/        AuthContext, TaskContext (toast)
├── hooks/          useAuth, useAuthGuard, useTaskContext
├── layouts/        AppLayout
├── pages/          TasksPage, TaskDetailsPage, LoginPage, ProfilePage, NotFoundPage, RouteErrorPage
├── repositories/   taskRepository, clientTaskStore (client-owned дані)
├── routes/         router, loaders, taskSearchParams
├── schemas/        authSchema, taskSchema (Zod)
└── types/
```

## Як виконано вимоги

| Вимога | Де |
|---|---|
| Data Mode, `createBrowserRouter`, `RouterProvider` з `react-router/dom` | `routes/router.tsx`, `App.tsx` |
| Route params | `/tasks/:taskId` → `taskDetailsLoader` (`params.taskId`), `TaskDetailsPage` |
| Query params | `status`, `priority`, `page` у URL; `routes/taskSearchParams.ts`, `TaskFilters`. Фільтр не дублюється в `useState` |
| Спільний layout | `layouts/AppLayout.tsx` (Header + nav + `<Outlet />`) |
| Login: React Hook Form + Zod | `pages/LoginPage.tsx`, `schemas/authSchema.ts` (username обов'язковий, password ≥ 6) — помилки біля полів |
| AuthContext | `context/AuthContext.tsx`: `user`, `accessToken`, `status`, `isAuthenticated`, `login`, `logout` |
| Protected route через loader + redirect | `routes/loaders.ts` → `requireUser` |
| TaskFormDialog (create + edit) | `components/TaskFormDialog.tsx`: props `open`, `mode`, `task`, `onClose`, `onSubmit`; нативний `<dialog>` (заголовок через `aria-labelledby`, фокус у першому полі, Escape, Cancel); pending state і заблокований Submit |
| CRUD лише для авторизованих | `hooks/useAuthGuard.ts` перевіряє сесію перед дією (гість → `/login?redirectTo=...`), а `taskRepository` додатково кидає 401 без токена |
| `Authorization: Bearer <token>` | одне місце — `api/httpClient.ts` (`auth: true` → `buildAuthHeaders`) |
| Без `alert` | повідомлення через Toast, підтвердження видалення — inline-кнопки |
| Profile + Logout | `pages/ProfilePage.tsx`; після Logout у Header — `revalidator.revalidate()`, тож `/profile` знову перенаправляє на Login |

### createdBy / createdAt
Поля є в domain-моделі `Task`. DummyJSON не надає `createdAt` і не зберігає зміни, тому це **client-owned metadata** (позначено коментарями в `types/task.ts` і `repositories/clientTaskStore.ts`):
- `createdBy` — `user #<userId>` з API або `username` автора для завдань, створених у застосунку;
- `createdAt` — дата створення на клієнті або дата, коли клієнт уперше побачив серверне завдання.

DummyJSON лише імітує POST/PUT/DELETE, тому створені, змінені й видалені завдання зберігаються в `clientTaskStore` (localStorage). Так UI лишається узгодженим після переходів і перезавантаження.

### Виконані додаткові завдання
1. Повернення на попередній маршрут після входу (`?redirectTo=`, захист від open redirect).
3. NotFound для 404 (`*` route + 404 з loader-а деталей).
4. Nested routes (`/tasks` → index + `:taskId`, pathless error route).
6. Lazy loading сторінки Profile (`lazy` у route).
7. Відновлення сесії після перезавантаження (токен у localStorage → `/auth/me`).

## Сценарій демонстрації

1. `/tasks` → клік по назві → `/tasks/5`.
2. Фільтри «Виконані» + пріоритет High → URL `/tasks?status=completed&priority=high`; F5 → фільтри збереглися.
3. Гість: «+ Нове завдання» або «Редагувати» на деталях → переходить на `/login?redirectTo=...`.
4. Login: порожня форма / пароль `123` → помилки Zod біля полів; `emilys / emilyspass` → повернення назад.
5. «+» → TaskFormDialog (create); на деталях «Редагувати» → той самий діалог (edit) з даними; Escape закриває.
6. Create / edit / delete → Toast, дані оновлюються без перезавантаження (`revalidate`). У DevTools → Network видно `Authorization: Bearer ...`.
7. `/profile` → дані користувача → Logout → `/profile` знову перенаправляє на Login.

## Відповіді на контрольні запитання

1. **SPA** — один HTML-документ, а сторінки змінює JavaScript без повного перезавантаження. React Router зіставляє URL з деревом маршрутів, перехоплює навігацію (`Link`, `navigate`) через History API і рендерить потрібні компоненти.
2. **Route params** — частина шляху, яка визначає ресурс (`/tasks/:taskId` → `useParams`/`params`). **Query params** — необов'язкові параметри після `?` для фільтрації, сортування й пагінації (`useSearchParams`).
3. URL зберігається після F5, ним можна поділитися, він працює з кнопками Назад/Вперед. Тому фільтри й поточний ресурс — частина стану, яку варто тримати в URL.
4. **Declarative Mode** — маршрути описуються JSX-компонентами (`<BrowserRouter>`, `<Routes>`, `<Route>`), дані вантажаться в компонентах. **Data Mode** — маршрути описуються об'єктами в `createBrowserRouter`, кожен може мати `loader`/`action`/`errorElement`; дані завантажуються до рендеру, є pending-стани та revalidation.
5. `BrowserRouter`, `Routes`, `Route`, `Link`/`NavLink`, `Navigate`, `Outlet`, `useNavigate`, `useParams`, `useSearchParams`, `useLocation`.
6. `createBrowserRouter`, `RouterProvider`, `loader`, `action`, `redirect`, `data`, `useLoaderData`, `useNavigation`, `useRevalidator`, `useRouteError`, `errorElement`, `lazy`.
7. Компонент-обгортка (`<ProtectedRoute>`) читає стан авторизації з контексту: якщо користувача немає, рендерить `<Navigate to="/login" replace />`, інакше — `children` або `<Outlet />`.
8. Перед рендером маршруту викликається `loader` (у нас `requireUser`). Він перевіряє сесію і, якщо користувача немає, кидає `redirect('/login?redirectTo=...')`, тож компонент сторінки навіть не рендериться. Інакше повертає користувача в `useLoaderData`.
9. Loader — звичайна async-функція, яку роутер викликає поза деревом компонентів і до рендеру. Правила hooks дозволяють їх лише в компонентах і кастомних hooks, тому loader бере дані з модулів (у нас `authStore`, `taskRepository`).
10. **Nested routes** — маршрути всередині інших; дочірній рендериться в `<Outlet />` батьківського. **Layout** — батьківський route зі спільною розміткою (Header, навігація), яка не перерендериться при переході між дочірніми сторінками.
11. **Authentication** відповідає на питання «хто ти?» (вхід, перевірка облікових даних). **Authorization** — «що тобі дозволено?» (create/edit/delete лише для авторизованих).
12. **Token** — рядок (тут JWT), який сервер видає після входу. Клієнт додає його до запитів як доказ автентифікації; токен має термін дії.
13. Логіка в одному місці: компоненти не знають про токен, немає дублювання й ризику забути заголовок, легко змінити схему (refresh, обробка 401).
14. Поточного користувача, токен або ознаку сесії, `isAuthenticated`, статус (наприклад, відновлення сесії), функції `login` і `logout`.
15. Інакше логіка дублюється, стан розсинхронізується, складно оновлювати й тестувати. Один `AuthContext` + `authStore` = одне джерело правди.
16. **Schema validation** — опис правил даних однією декларативною схемою. Zod перевіряє дані в runtime і виводить TypeScript-типи (`z.infer`), тож правила й типи не розходяться.
17. `zodResolver(schema)` передається в `useForm({ resolver })`. Під час submit/зміни полів RHF викликає resolver, той валідує значення через Zod і повертає помилки у `formState.errors` за назвами полів.
18. localStorage доступний будь-якому JS на сторінці, тому при XSS токен можна викрасти. Він живе, доки його не видалять, і його не можна позначити як `httpOnly`. Безпечніше — httpOnly cookie або токен у пам'яті + refresh через cookie.
19. Користувач розуміє, чому доступ заборонено, і може увійти; `redirectTo` повертає його на потрібну сторінку. Захищений контент не рендериться навіть на мить.
