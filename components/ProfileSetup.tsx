import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { TreeIcon, CheckIcon, SparklesIcon, ExclamationTriangleIcon } from './Icons';
import Spinner from './Spinner';

const inputClasses = "mt-1 block w-full bg-surface border border-active-surface rounded-xl p-2 text-lg text-center font-bold text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary";

const ProfileSetup: React.FC = () => {
    const { user, updateUserDocumentId, updateUserName, completeProfileSetup } = useAuth();
    const { updateBudget, updateAnnualIncome } = useData();

    const [name, setName] = useState(user?.name || '');
    const [documentId, setDocumentId] = useState('');
    const [budget, setBudget] = useState('');
    const [income, setIncome] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDocIdValid, setIsDocIdValid] = useState(false);

    useEffect(() => {
        setIsDocIdValid(documentId.length === 8);
    }, [documentId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        
        const budgetNum = parseFloat(budget);
        const incomeNum = parseFloat(income);

        if (!name.trim()) {
            setError('Por favor, ingresa tu nombre completo.');
            setIsSubmitting(false);
            return;
        }
        if (documentId.length !== 8) {
            setError('El DNI debe tener 8 dígitos.');
            setIsSubmitting(false);
            return;
        }
        if (isNaN(budgetNum) || budgetNum < 0) {
            setError('El presupuesto mensual no puede ser negativo.');
            setIsSubmitting(false);
            return;
        }
        if (isNaN(incomeNum) || incomeNum < 0) {
            setError('El ingreso anual no puede ser negativo.');
            setIsSubmitting(false);
            return;
        }

        // All good, update contexts
        updateUserName(name);
        updateUserDocumentId(documentId);
        updateBudget(budgetNum);
        updateAnnualIncome(incomeNum);
        completeProfileSetup();
        
        // No need to setIsSubmitting(false) as the component will unmount
    };

    const isContinueDisabled = !name || documentId.length !== 8 || !budget || !income || isSubmitting;

    return (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-sm text-center">
                <h1 className="text-2xl font-bold text-on-surface">Crea tu Perfil </h1>
                <p className="text-on-surface-secondary mt-2 mb-6">
                    Personalizemos tu experiencia y empecemos a cosechar.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                     <div>
                        <label className="block text-sm font-medium text-on-surface-secondary text-left mb-1">Tu Nombre Completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Ada Lovelace"
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface-secondary text-left mb-1">Tu Documento de Identidad (DNI)</label>
                        <div className="relative">
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={documentId}
                                onChange={(e) => setDocumentId(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                placeholder="Tu DNI de 8 dígitos"
                                className={inputClasses}
                            />
                            {isDocIdValid && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <CheckIcon className="w-6 h-6 text-primary" />
                                </div>
                            )}
                        </div>
                         <div className="mt-2 p-2.5 bg-yellow-400/10 border-l-4 border-yellow-500 rounded-r-md flex items-start space-x-2.5">
                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-300/90 text-left">
                                <strong>¡Atención!</strong> Ingresa tu DNI con cuidado. treevüt lo usará para verificar que los comprobantes sean válidos para tu ahorro fiscal potencial.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface-secondary text-left mb-1">Tu Presupuesto Mensual de Gastos (S/)</label>
                        <input
                            type="number"
                            inputMode="decimal"
                            step="100"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            placeholder="Ej: 1500"
                            className={inputClasses}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-on-surface-secondary text-left mb-1">Tu Ingreso Anual Bruto Estimado (S/)</label>
                        <input
                            type="number"
                            inputMode="decimal"
                            step="1000"
                            value={income}
                            onChange={(e) => setIncome(e.target.value)}
                            placeholder="Ej: 40000"
                            className={inputClasses}
                        />
                        <p className="text-xs text-on-surface-secondary mt-1">Este dato es clave para estimar tu devolución.</p>
                    </div>
                    
                    {error && <p role="alert" className="text-danger text-sm">{error}</p>}
                    
                    <button
                        type="submit"
                        disabled={isContinueDisabled}
                        className="w-full bg-primary text-primary-dark font-bold py-3 px-6 rounded-xl text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/20"
                    >
                        {isSubmitting ? 'Guardando...' : '¡Únete a treevüt!'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetup;
