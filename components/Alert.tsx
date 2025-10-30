

import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon, InformationCircleIcon } from './Icons';

interface AlertProps {
    message: string;
    type: 'info' | 'warning' | 'danger';
    onDismiss: () => void;
}

const alertStyles = {
    info: {
        border: 'border-blue-500',
        icon: 'text-blue-400',
        buttonHover: 'hover:bg-active-surface/50'
    },
    warning: {
        border: 'border-yellow-500',
        icon: 'text-yellow-400',
        buttonHover: 'hover:bg-active-surface/50'
    },
    danger: {
        border: 'border-danger',
        icon: 'text-danger',
        buttonHover: 'hover:bg-active-surface/50'
    },
};

const Alert: React.FC<AlertProps> = ({ message, type, onDismiss }) => {
    const styles = alertStyles[type];
    const Icon = type === 'info' ? InformationCircleIcon : ExclamationTriangleIcon;

    return (
        <div role="alert" className={`border-l-4 ${styles.border} bg-surface p-4 mb-4 rounded-md flex items-start animate-slide-in-up`}>
            <div className="flex-shrink-0">
                <Icon className={`w-6 h-6 ${styles.icon}`} />
            </div>
            <div className="ml-3">
                <p className={`text-sm text-on-surface-secondary`}>
                    {message}
                </p>
            </div>
            <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                    <button
                        onClick={onDismiss}
                        className={`inline-flex rounded-md p-1.5 text-on-surface-secondary ${styles.buttonHover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background`}
                    >
                        <span className="sr-only">Descartar</span>
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Alert;