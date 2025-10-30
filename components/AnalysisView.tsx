
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import FormalityIndexWidget from './FormalityIndexWidget';
import CategoryAnalysis from './CategoryAnalysis';
import MerchantAnalysis from './MerchantAnalysis';
import TaxSavingsWidget from './TaxSavingsWidget';
import SetIncomeModal from './SetIncomeModal';
import { SparklesIcon } from './Icons';
import { getAIWeeklySummary } from '../services/geminiService';

const AIInsightCard = () => {
    const { user } = useAuth();
    const { expenses } = useData();
    const [aiSummary, setAiSummary] = useState('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            if (user && expenses.length > 0) {
                setIsLoadingSummary(true);
                try {
                    const lastWeekExpenses = expenses.filter(e => {
                        const expenseDate = new Date(e.fecha);
                        const today = new Date();
                        const oneWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
                        return expenseDate >= oneWeekAgo;
                    });

                    if (lastWeekExpenses.length > 0) {
                        const summary = await getAIWeeklySummary(user, lastWeekExpenses);
                        setAiSummary(summary);
                    } else {
                        setAiSummary("No hay suficientes gastos recientes para un resumen. ¡Sigue registrando! 🌳");
                    }
                } catch (e) {
                    console.error("Failed to fetch AI summary", e);
                    setAiSummary("No pude generar tu resumen esta semana. Intenta de nuevo más tarde.");
                } finally {
                    setIsLoadingSummary(false);
                }
            } else {
                setAiSummary("Registra algunos gastos para que pueda darte un resumen inteligente de tu semana.");
                setIsLoadingSummary(false);
            }
        };
        fetchSummary();
    }, [user, expenses]);

    // Simple markdown to HTML
    const renderSummary = (text: string) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .split('\n').map((line, index) => <p key={index}>{line}</p>);
    };

    return (
        <div className="bg-surface rounded-2xl p-4 md:col-span-2 animate-slide-in-up">
            <h2 className="text-lg font-bold text-on-surface mb-2 flex items-center">
                <SparklesIcon className="w-6 h-6 mr-2 text-primary"/>
                Descubrimiento IA
            </h2>
            <div className="text-sm text-on-surface-secondary space-y-2 prose">
                {isLoadingSummary ? (
                    <div className="space-y-2">
                        <div className="h-4 w-3/4 bg-active-surface rounded animate-pulse"></div>
                        <div className="h-4 w-1/2 bg-active-surface rounded animate-pulse"></div>
                    </div>
                ) : (
                    renderSummary(aiSummary)
                )}
            </div>
        </div>
    );
};


const AnalysisView: React.FC = React.memo(() => {
    const { expenses, annualIncome, formalityIndex, formalityIndexByCount } = useData();
    const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

    const handleIncomeModalToggle = React.useCallback(() => {
        setIsIncomeModalOpen(prev => !prev);
    }, []);
    
    if (expenses.length === 0) {
        return (
            <div className="text-center py-16">
                 <p className="text-on-surface-secondary">Registra tu primer gasto para ver tus insights.</p>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AIInsightCard />
                <TaxSavingsWidget
                    annualIncome={annualIncome}
                    onSetup={() => setIsIncomeModalOpen(true)}
                />
                {/* FIX: Pass required props to FormalityIndexWidget */}
                <FormalityIndexWidget 
                    formalityIndex={formalityIndex} 
                    formalityIndexByCount={formalityIndexByCount} 
                />
                <CategoryAnalysis expenses={expenses} />
                <MerchantAnalysis expenses={expenses} />
            </div>

            {isIncomeModalOpen && (
                <SetIncomeModal onClose={() => setIsIncomeModalOpen(false)} />
            )}
        </>
    );
});

export default AnalysisView;