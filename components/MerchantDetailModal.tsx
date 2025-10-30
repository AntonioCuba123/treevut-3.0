
import React, { useMemo } from 'react';
import { type Expense } from '../types';
import { XMarkIcon } from './Icons';

interface MerchantDetailModalProps {
    merchantName: string;
    expenses: Expense[];
    onClose: () => void;
}

const MerchantDetailModal: React.FC<MerchantDetailModalProps> = ({ merchantName, expenses, onClose }) => {
    
    const { merchantExpenses, totalSpent } = useMemo(() => {
        const filtered = expenses.filter(e => e.razonSocial.trim() === merchantName);
        const total = filtered.reduce((sum, exp) => sum + exp.total, 0);
        return { merchantExpenses: filtered, totalSpent: total };
    }, [expenses, merchantName]);

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString + 'T00:00:00');
            return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-surface rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col animate-slide-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-active-surface/50 flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-on-surface truncate pr-4">{merchantName}</h2>
                            <p className="text-on-surface-secondary text-sm">
                                Total Gastado: <span className="font-bold text-primary">S/ {totalSpent.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                            </p>
                        </div>
                        <button onClick={onClose} className="text-on-surface-secondary hover:text-on-surface flex-shrink-0 ml-4">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                
                <div className="p-5 overflow-y-auto">
                    {merchantExpenses.length > 0 ? (
                        <ul className="space-y-3">
                            {merchantExpenses.map(expense => (
                                <li key={expense.id} className="flex justify-between items-center bg-background p-3 rounded-xl">
                                    <span className="text-sm font-medium text-on-surface-secondary">{formatDate(expense.fecha)}</span>
                                    <span className="font-bold text-on-surface">
                                        S/ {expense.total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-on-surface-secondary py-8">No se encontraron gastos para este comercio.</p>
                    )}
                </div>

                <div className="p-4 bg-background/50 border-t border-active-surface/50 flex justify-end flex-shrink-0">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-bold text-primary-dark bg-primary rounded-xl hover:opacity-90 transition-opacity"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MerchantDetailModal;