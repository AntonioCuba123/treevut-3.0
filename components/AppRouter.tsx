import React, { Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './Spinner';

// Critical routes with optimized chunking
const Welcome = React.lazy(() => {
  // Preload auth chunk cuando se muestra Welcome
  import('../contexts/AuthContext');
  return import('./Welcome');
});

const MainApp = React.lazy(() => {
  // Preload core chunk cuando se carga MainApp
  import('./WalletView');
  import('./ActionButtons');
  return import('./MainApp');
});

const ProfileSetup = React.lazy(() => {
  // Preload expense management cuando se configura el perfil
  import('./AddExpenseModal');
  import('./ExpenseCard');
  return import('./ProfileSetup');
});

const AppRouter: React.FC = () => {
    const { user } = useAuth();

    const content = () => {
        if (!user) {
            return <Welcome />;
        }

        if (!user.isProfileComplete) {
            return <ProfileSetup />;
        }

        return <MainApp />;
    };

    return (
        <Suspense fallback={<Spinner fullScreen />}>
            {content()}
        </Suspense>
    );
};

export default AppRouter;
