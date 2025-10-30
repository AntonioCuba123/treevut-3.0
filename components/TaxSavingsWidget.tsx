
import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { BanknotesIcon } from './Icons';
import { calculateEstimatedTaxReturn, getDeductibleTotals, DEDUCTIBLE_EXPENSE_LIMIT_SOLES } from '../services/taxService';

interface TaxSavingsWidgetProps {
    annualIncome: number | null;
    onSetup: () => void;
}

const TaxSavingsWidget: React.FC<TaxSavingsWidgetProps> = ({ annualIncome, onSetup }) => {
    const { expenses } = useData();
    
    const { formalDeductible, potentialDeductible } = useMemo(() => getDeductibleTotals(expenses), [expenses]);
    
    const estimatedReturn = useMemo(() => {
        if (!annualIncome) return 0;
        return calculateEstimatedTaxReturn(formalDeductible, annualIncome);
    }, [formalDeductible, annualIncome]);

    const potentialReturn = useMemo(() => {
        if (!annualIncome) return 0;
        return calculateEstimatedTaxReturn(potentialDeductible, annualIncome);
    }, [potentialDeductible, annualIncome]);

    const progressPercentage = (formalDeductible / DEDUCTIBLE_EXPENSE_LIMIT_SOLES) * 100;

    // --- Render Setup View ---
    if (!annualIncome) {
        return (
            <div className="bg-surface rounded-2xl p-4 flex flex-col items-center text-center justify-center min-h-[200px] animate-slide-in-up">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <BanknotesIcon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-on-surface">Calcula tu Devolución</h3>
                <p className="text-sm text-on-surface-secondary mt-1 mb-3 max-w-xs">Indica tu ingreso para estimar cuánto podrías recibir de SUNAT.</p>
                <button
                    onClick={onSetup}
                    className="bg-primary text-primary-dark font-bold py-2 px-5 rounded-xl hover:opacity-90 transition-opacity text-sm"
                >
                    Configurar Ingreso
                </button>
            </div>
        );
    }
    
    // --- Render Main View ---
    return (
        <div className="bg-surface rounded-2xl p-4 animate-slide-in-up">
            <h2 className="text-lg font-bold text-on-surface mb-3 flex items-center">
                <BanknotesIcon className="w-6 h-6 mr-2 text-primary"/>
                Ahorro Fiscal 2025
            </h2>

            <div className="text-center bg-background rounded-xl p-3">
                <span className="text-xs text-on-surface-secondary">Devolución estimada</span>
                <p className="text-3xl font-extrabold text-primary tracking-tighter">
                    S/ {estimatedReturn.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
            
            <div className="mt-3">
                <div className="flex justify-between items-center text-xs text-on-surface-secondary mb-1 font-medium">
                    <span>Progreso a tu tope (3 UIT)</span>
                    <span>{Math.min(100, progressPercentage).toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-active-surface rounded-full">
                    <div
                        className="h-2 rounded-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(100, progressPercentage)}%` }}
                    ></div>
                </div>
            </div>

            {potentialReturn > 0 && (
                <div className="mt-3 bg-yellow-900/40 rounded-lg p-2 text-center">
                    <p className="text-xs text-yellow-300">
                        <span className="font-bold">+ S/ {potentialReturn.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span> potenciales perdidos por gastos informales.
                    </p>
                </div>
            )}
        </div>
    );
};

export default TaxSavingsWidget;
