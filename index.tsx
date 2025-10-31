console.log('🚀 [1/10] Starting Treevüt app...');

console.log('🚀 [2/10] Importing React...');
import React from 'react';
console.log('✅ [2/10] React imported successfully');

console.log('🚀 [3/10] Importing ReactDOM...');
import ReactDOM from 'react-dom/client';
console.log('✅ [3/10] ReactDOM imported successfully');

console.log('🚀 [4/10] Importing App component...');
import App from './App';
console.log('✅ [4/10] App component imported successfully');

console.log('🚀 [5/10] Looking for root element...');
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ [5/10] Root element not found!');
  document.body.innerHTML = `<div style="color: white; padding: 20px;"><h1>Error: Root element not found</h1></div>`;
  throw new Error("Could not find root element to mount to");
}
console.log('✅ [5/10] Root element found:', rootElement);

try {
  console.log('🚀 [6/10] Creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  console.log('✅ [6/10] React root created successfully');

  console.log('🚀 [7/10] Rendering App component...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('✅ [7/10] App component rendered successfully');
  console.log('🎉 [10/10] Treevüt app started successfully!');
} catch (error) {
  console.error('❌ Failed to render app:', error);
  console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
  document.body.innerHTML = `<div style="color: white; padding: 20px;">
    <h1>Error rendering app</h1>
    <pre>${error instanceof Error ? error.message : String(error)}</pre>
    <pre>${error instanceof Error ? error.stack : ''}</pre>
  </div>`;
  throw error;
}
