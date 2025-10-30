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

// Preload critical chunks on welcome page mount
const preloadCriticalChunks = () => {
  const chunks = [
    'core',
    'expense-management',
    'analysis'
  ];
  chunks.forEach(chunk => {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = `/assets/${chunk}-${process.env.BUILD_ID || 'dev'}.js`;
    document.head.appendChild(link);
  });
};

const AppRouter: React.FC = () => {
    const { user } = useAuth();

    const content = () => {
        if (!user) {
            // Preload critical chunks while on welcome page
            React.useEffect(() => {
                preloadCriticalChunks();
            }, []);
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