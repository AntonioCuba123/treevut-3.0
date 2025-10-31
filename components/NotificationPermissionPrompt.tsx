import React, { useState, useEffect } from 'react';
import { 
    isNotificationSupported, 
    hasNotificationPermission, 
    requestNotificationPermission,
    scheduleDailyNotifications
} from '../services/gamificationNotificationService';

const NotificationPermissionPrompt: React.FC = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Verificar si debemos mostrar el prompt
        const checkPermission = () => {
            if (!isNotificationSupported()) return;
            
            // No mostrar si ya tenemos permiso
            if (hasNotificationPermission()) {
                scheduleDailyNotifications();
                return;
            }
            
            // No mostrar si el usuario ya rechazó
            if (Notification.permission === 'denied') return;
            
            // Verificar si ya mostramos el prompt antes
            const promptShown = localStorage.getItem('treevut-notification-prompt-shown');
            if (promptShown) return;
            
            // Mostrar el prompt después de 5 segundos
            setTimeout(() => {
                setShowPrompt(true);
            }, 5000);
        };

        checkPermission();
    }, []);

    const handleAllow = async () => {
        setIsLoading(true);
        const granted = await requestNotificationPermission();
        
        if (granted) {
            scheduleDailyNotifications();
            setShowPrompt(false);
            localStorage.setItem('treevut-notification-prompt-shown', 'true');
        }
        
        setIsLoading(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('treevut-notification-prompt-shown', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div className="text-center mb-4">
                    <div className="text-6xl mb-3">🔔</div>
                    <h3 className="text-xl font-bold text-on-surface mb-2">
                        ¡Mantente al Día con Treevüt!
                    </h3>
                    <p className="text-on-surface-secondary text-sm">
                        Recibe notificaciones cuando completes desafíos, subas en el ranking o alcances nuevos hitos. 
                        ¡No te pierdas tus recompensas!
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleAllow}
                        disabled={isLoading}
                        className="w-full bg-primary text-primary-dark py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isLoading ? 'Configurando...' : 'Activar Notificaciones'}
                    </button>
                    <button
                        onClick={handleDismiss}
                        disabled={isLoading}
                        className="w-full bg-surface text-on-surface py-3 rounded-xl font-bold hover:bg-active-surface transition-colors disabled:opacity-50"
                    >
                        Ahora No
                    </button>
                </div>

                <p className="text-xs text-on-surface-secondary text-center mt-4">
                    Puedes cambiar esta configuración en cualquier momento desde tu perfil.
                </p>
            </div>
        </div>
    );
};

export default NotificationPermissionPrompt;
