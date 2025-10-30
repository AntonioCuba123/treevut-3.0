import React, { useEffect } from 'react';
import { GoogleIcon } from './Icons';

interface GoogleSecurityCheckProps {
    onSuccess: () => void;
}

const GoogleSecurityCheck: React.FC<GoogleSecurityCheckProps> = ({ onSuccess }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onSuccess();
        }, 2500); // Simulate a 2.5 second check

        return () => clearTimeout(timer);
    }, [onSuccess]);

    return (
        <div className="security-modal-backdrop">
            <div className="security-modal-content">
                <GoogleIcon className="w-12 h-12 mb-4" />
                <h2 className="text-xl font-semibold text-on-surface">Verificando...</h2>
                <p className="text-sm text-on-surface-secondary mt-2">
                    Realizando una comprobación de seguridad rápida.
                </p>
                <div className="google-spinner mt-6"></div>
            </div>
        </div>
    );
};

export default GoogleSecurityCheck;