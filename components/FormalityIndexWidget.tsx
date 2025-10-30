
import React from 'react';
import { CheckBadgeIcon } from './Icons';

interface FormalityIndexWidgetProps {
    formalityIndex: number;
    formalityIndexByCount: number;
}

const FormalityIndexWidget: React.FC<FormalityIndexWidgetProps> = ({ formalityIndex, formalityIndexByCount }) => {
    const index = Math.round(formalityIndex);
    const circumference = 2 * Math.PI * 34; // 2 * pi * radius
    const strokeDashoffset = circumference - (index / 100) * circumference;

    const getStatus = () => {
        if (index >= 90) return { text: '¡Maestro Formal!', color: 'text-primary' };
        if (index >= 70) return { text: 'Buen Camino', color: 'text-yellow-400' };
        if (index >= 50) return { text: 'Puedes Mejorar', color: 'text-orange-400' };
        return { text: 'Alerta Informal', color: 'text-red-400' };
    };

    const status = getStatus();

    return (
        <div className="bg-surface rounded-2xl p-4 animate-slide-in-up">
            <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center">
                <CheckBadgeIcon className="w-6 h-6 mr-2 text-primary"/>
                Índice de Formalidad
            </h2>
            <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 80 80">
                        <circle
                            className="text-active-surface"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="36"
                            cx="40"
                            cy="40"
                        />
                        <circle
                            className={`${status.color}`}
                            strokeWidth="8"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="36"
                            cx="40"
                            cy="40"
                            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease-out' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-2xl font-bold ${status.color}`}>{index}%</span>
                    </div>
                </div>
                <div className="text-left">
                    <p className={`font-bold text-lg ${status.color}`}>{status.text}</p>
                    <p className="text-xs text-on-surface-secondary mt-1">
                        Este índice mide el % de tu gasto total que es formal y ayuda a tu devolución.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FormalityIndexWidget;
