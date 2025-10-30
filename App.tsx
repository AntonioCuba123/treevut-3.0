
import React from 'react';
import AppRouter from './components/AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <DataProvider>
                <AppRouter />
            </DataProvider>
        </AuthProvider>
    );
};

export default App;
