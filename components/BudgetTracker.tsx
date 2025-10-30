


import React, { useState, useEffect } from 'react';
import { PencilIcon, LightBulbIcon } from './Icons';
import { getAIBudgetProjection } from '../services/geminiService';
import { useData } from '../contexts/DataContext';

interface BudgetTrackerProps {
    onOpenBudgetModal: () => void;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ onOpenBudgetModal }) => {
    const { expenses, budget, totalExpenses } = useData();
    const [projection, setProjection] = useState<{ projectedSpending: number; insight: string; } | null>(null);
    const [isLoadingProjection, setIsLoadingProjection] = useState(false);

    useEffect(() => {
        const fetchProjection = async () => {
            // Only fetch if budget is set and we have some expenses to work with
            if (budget && budget > 0 && expenses.length > 2) {
                setIsLoadingProjection(true);
                try {
                    const result = await getAIBudgetProjection(expenses, budget);
                    setProjection(result);
                } catch (e) { console.error("Failed to fetch AI projection:", e); }
                finally { setIsLoadingProjection(false); }
            } else {
                // Clear projection if no budget or expenses
                setProjection(null);
            }
        };

        // Debounce to avoid rapid firing on multiple expense additions
        const timeoutId = setTimeout(fetchProjection, 500);

        return () => clearTimeout(timeoutId);
    }, [expenses, budget]);

    if (!budget || budget === 0) {
        return (
            <div className="bg-surface rounded-2xl p-4 mb-4 animate-slide-in-up text-center">
                 <h2 className="text-lg font-bold text-on-surface">Tu Presupuesto</h2>
                 <p className="text-on-surface-secondary my-2">Establece un límite para empezar a monitorear tus gastos.</p>
                 <button onClick={onOpenBudgetModal} className="text-primary hover:opacity-80 flex items-center text-sm font-semibold transition-opacity mx-auto">
                    <PencilIcon className="w-4 h-4 mr-1.5" />
                    Establecer Presupuesto
                </button>
            </div>
        )
    }

    const remaining = budget - totalExpenses;
    const percentage = budget > 0 ? (totalExpenses / budget) * 100 : 0;
    
    const progressBarColor = percentage >= 100 ? 'bg-danger' : percentage > 80 ? 'bg-yellow-400' : 'bg-primary';

    const projectionPercentage = projection ? (projection.projectedSpending / budget) * 100 : null;
    
    const getProjectionStatusStyle = () => {
        if (!projectionPercentage) return { text: 'text-on-surface-secondary', bg: 'bg-on-surface-secondary' };
        if (projectionPercentage > 100) return { text: 'text-danger', bg: 'bg-danger' };
        if (projectionPercentage > 90) return { text: 'text-yellow-400', bg: 'bg-yellow-400' };
        return { text: 'text-primary', bg: 'bg-primary' };
    };
    
    const projectionStyle = getProjectionStatusStyle();

    return (
        <div className="bg-surface rounded-2xl p-4 mb-4 animate-slide-in-up">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-on-surface">Tu Presupuesto</h2>
                <button onClick={onOpenBudgetModal} className="text-primary hover:opacity-80 flex items-center text-sm font-semibold transition-opacity">
                    <PencilIcon className="w-4 h-4 mr-1.5" />
                    Editar
                </button>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-on-surface-secondary">
                    <span>Gastado ({percentage.toFixed(0)}%)</span>
                     <span className={remaining < 0 ? 'text-danger font-bold' : ''}>
                        {remaining < 0 ? 'Excedido' : 'Restante'}: S/ {Math.abs(remaining).toLocaleString('es-PE', { minimumFractionDigits: 2})}
                    </span>
                </div>
                 <div className="relative w-full bg-active-surface rounded-full h-2.5">
                    <div
                        className={`${progressBarColor} h-2.5 rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                     {/* Projection Marker */}
                    {projectionPercentage !== null && !isLoadingProjection && (
                        <div 
                            className={`absolute top-[-2px] h-3.5 w-1 rounded-full ${projectionStyle.bg} transition-all duration-500 ease-out`}
                            title={`Proyección: S/ ${projection.projectedSpending.toLocaleString('es-PE', { minimumFractionDigits: 2})}`}
                            style={{ left: `clamp(0.5%, ${projectionPercentage}%, 99.5%)`, transform: 'translateX(-50%)' }}
                        />
                    )}
                </div>
                <div className="flex justify-between text-sm text-on-surface-secondary">
                    <span>S/ {totalExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                    <span>S/ {budget.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                </div>

                {/* AI Insight Section */}
                 {isLoadingProjection && (
                    <div className="mt-4 p-3 bg-background/50 rounded-lg animate-pulse">
                        <div className="h-3 w-1/3 bg-active-surface rounded-sm mb-2"></div>
                        <div className="h-2 w-full bg-active-surface rounded-sm"></div>
                    </div>
                )}
                {projection && !isLoadingProjection && (
                    <div className="mt-3 p-3 bg-background/50 rounded-lg flex items-start space-x-2.5 animate-slide-in-up" style={{animationDelay: '100ms'}}>
                        <LightBulbIcon className={`w-5 h-5 ${projectionStyle.text} flex-shrink-0 mt-0.5`} />
                        <div>
                            <p className={`text-sm font-semibold ${projectionStyle.text}`}>Proyección IA</p>
                            <p className="text-sm text-on-surface-secondary leading-tight">{projection.insight}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BudgetTracker;