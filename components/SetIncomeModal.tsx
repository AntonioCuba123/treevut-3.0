

import React, { useState } from 'react';
import { CheckIcon, XMarkIcon } from './Icons';
import { useData } from '../contexts/DataContext';

interface SetIncomeModalProps {
    onClose: () => void;
}

const SetIncomeModal: React.FC<SetIncomeModalProps> = ({ onClose }) => {
    const { annualIncome: currentIncome, updateAnnualIncome } = useData();
    const [income, setIncome] = useState<string>(currentIncome ? currentIncome.toString() : '');
    const [error, setError] = useState<string | null>(null);
    const incomeSuggestions = [30000, 50000, 70000];

    const handleSave = () => {
        const newIncome = parseFloat(income);
        if (isNaN(newIncome) || newIncome < 0) {
            setError('Por favor, ingresa un monto no negativo.');
            return;
        }
        updateAnnualIncome(newIncome);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-sm animate-slide-in-up">
                <div className="p-5 border-b border-active-surface/50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-on-surface">Calcula tu Devolución</h2>
                    <button onClick={onClose} className="text-on-surface-secondary hover:text-on-surface">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-5">
                    <p className="text-on-surface-secondary mb-4 text-sm">Para estimar tu devolución de impuestos de forma personalizada, necesitamos tu ingreso anual bruto aproximado. Este dato es privado y solo se usa para este cálculo.</p>
                    {error && <p className="text-red-400 bg-red-900/50 p-2 rounded-md text-xs text-center mb-4">{error}</p>}
                    <div>
                        <label htmlFor="income-input" className="block text-sm font-medium text-on-surface-secondary">
                            Ingreso Anual (Bruto)
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-on-surface-secondary sm:text-sm">S/</span>
                            </div>
                            <input
                                type="number"
                                id="income-input"
                                value={income}
                                onChange={(e) => {
                                    setIncome(e.target.value);
                                    if (error) setError(null);
                                }}
                                className="block w-full rounded-xl border border-active-surface bg-background pl-8 pr-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary sm:text-sm"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="mt-3 flex items-center justify-center space-x-2">
                            {incomeSuggestions.map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => {
                                        setIncome(amount.toString());
                                        if (error) setError(null);
                                    }}
                                    className="px-3 py-1 text-xs font-semibold text-on-surface-secondary bg-active-surface rounded-full hover:bg-primary hover:text-primary-dark transition-colors"
                                >
                                    S/ {amount.toLocaleString('es-PE')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-5 bg-background/50 border-t border-active-surface/50 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-on-surface bg-active-surface rounded-xl hover:bg-active-surface/70 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 text-sm font-bold text-primary-dark bg-primary rounded-xl hover:opacity-90 flex items-center transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary"
                    >
                        <CheckIcon className="w-5 h-5 mr-1.5"/>
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetIncomeModal;