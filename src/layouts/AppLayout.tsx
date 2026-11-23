import { Outlet, useNavigation } from 'react-router';
import { Header } from '../components/Header';
import { Toast } from '../components/Toast';
import './AppLayout.scss';

/** Спільний layout: Header з навігацією + основна область контенту (Outlet). */
export function AppLayout() {
    const navigation = useNavigation();
    const isNavigating = navigation.state !== 'idle';

    return (
        <div className="app-layout">
            <div
                className={`app-layout__progress ${isNavigating ? 'app-layout__progress--active' : ''}`}
                aria-hidden="true"
            />
            <Header />
            <main className="app-layout__content" aria-busy={isNavigating}>
                <Outlet />
            </main>
            <Toast />
        </div>
    );
}
