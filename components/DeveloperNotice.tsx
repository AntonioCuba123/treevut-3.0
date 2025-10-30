import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from './Icons';

const DeveloperNotice: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // This check ensures the notice doesn't reappear on hot-reloads or navigation within the same session.
        if (sessionStorage.getItem('treevut-dev-notice-seen') !== 'true') {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        sessionStorage.setItem('treevut-dev-notice-seen', 'true');
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div role="alert" className="fixed bottom-4 left-4 right-4 z-30 bg-surface/95 backdrop-blur border-l-4 border-yellow-500 p-4 rounded-xl shadow-lg flex items-start animate-slide-in-up md:max-w-md md:left-auto">
            <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="ml-3 flex-1">
                <h3 className="text-sm font-bold text-yellow-300">Aviso para Desarrolladores</h3>
                <p className="mt-1 text-xs text-on-surface-secondary">
                    Esta es una app de demostración. Para producción, la API Key de Gemini y los datos del usuario deben ser manejados a través de un backend seguro para evitar exposición y riesgos.
                </p>
            </div>
            <div className="ml-auto pl-3">
                <button
                    onClick={handleDismiss}
                    className="-mx-1.5 -my-1.5 inline-flex rounded-md p-1.5 text-on-surface-secondary hover:bg-active-surface/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-yellow-500"
                    aria-label="Descartar aviso"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default DeveloperNotice;
