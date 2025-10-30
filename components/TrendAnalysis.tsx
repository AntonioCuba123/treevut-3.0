
import React from 'react';
import { type Expense } from '../types';
import { ArrowTrendingUpIcon } from './Icons';

interface TrendAnalysisProps {
    expenses: Expense[];
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ expenses }) => {
    return (
        <div className="bg-surface rounded-2xl p-4">
            <h3 className="text-lg font-bold text-on-surface mb-4">Tendencia de Gastos</h3>
            <div className="text-center py-8">
                <ArrowTrendingUpIcon className="w-12 h-12 mx-auto text-on-surface-secondary opacity-50" />
                <p className="mt-4 text-on-surface-secondary">
                    El análisis de tendencia estará disponible pronto para mostrarte la evolución de tus gastos.
                </p>
            </div>
        </div>
    );
};

export default TrendAnalysis;
