console.log('📦 [App.tsx] Loading App component...');

import React from 'react';
import AppRouter from './components/AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

console.log('📦 [App.tsx] All imports loaded successfully');

const App: React.FC = () => {
    console.log('📦 [App.tsx] App component rendering...');
    
    try {
        return (
            <AuthProvider>
                <DataProvider>
                    <AppRouter />
                </DataProvider>
            </AuthProvider>
        );
    } catch (error) {
        console.error('❌ [App.tsx] Error rendering App:', error);
        return (
            <div style={{color: 'white', padding: '20px'}}>
                <h1>Error in App component</h1>
                <pre>{error instanceof Error ? error.message : String(error)}</pre>
            </div>
        );
    }
};

console.log('📦 [App.tsx] App component defined successfully');

export default App;
