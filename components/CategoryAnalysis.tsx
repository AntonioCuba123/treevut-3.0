
import React, { useMemo } from 'react';
import { type Expense, CategoriaGasto } from '../types';
import { ChartPieIcon, ShoppingBagIcon, ReceiptPercentIcon, HeartIcon, CogIcon, HomeIcon, TicketIcon, TruckIcon, SparklesIcon, AcademicCapIcon } from './Icons';

interface CategoryAnalysisProps {
    expenses: Expense[];
}

const categoryDetails: { [key in CategoriaGasto]: { color: string, Icon: React.FC<{className?: string}> } } = {
    [CategoriaGasto.Alimentacion]: { color: 'bg-red-500', Icon: ReceiptPercentIcon },
    [CategoriaGasto.Vivienda]: { color: 'bg-blue-500', Icon: HomeIcon },
    [CategoriaGasto.Transporte]: { color: 'bg-yellow-500', Icon: TruckIcon },
    [CategoriaGasto.Salud]: { color: 'bg-teal-500', Icon: HeartIcon },
    [CategoriaGasto.Ocio]: { color: 'bg-purple-500', Icon: TicketIcon },
    [CategoriaGasto.Educacion]: { color: 'bg-orange-500', Icon: AcademicCapIcon },
    [CategoriaGasto.Consumos]: { color: 'bg-gray-500', Icon: ShoppingBagIcon },
    [CategoriaGasto.Servicios]: { color: 'bg-indigo-500', Icon: CogIcon },
    [CategoriaGasto.Otros]: { color: 'bg-pink-500', Icon: SparklesIcon },
};

const CategoryAnalysis: React.FC<CategoryAnalysisProps> = ({ expenses }) => {
    const totalExpenses = useMemo(() => expenses.reduce((sum, exp) => sum + exp.total, 0), [expenses]);
    
    const sortedCategories = useMemo(() => {
        const dataByCategory = expenses.reduce((acc: Record<string, number>, expense) => {
            acc[expense.categoria] = (acc[expense.categoria] || 0) + expense.total;
            return acc;
        }, {});
        
        return Object.entries(dataByCategory)
            .map(([category, total]) => ({ category, total: total as number }))
            .sort((a, b) => b.total - a.total);
    }, [expenses]);
    
    return (
        <div className="bg-surface rounded-2xl p-4 animate-slide-in-up">
            <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center">
                <ChartPieIcon className="w-6 h-6 mr-2 text-primary"/>
                Top Categorías
            </h2>
            {sortedCategories.length > 0 ? (
                <div className="space-y-3">
                    {sortedCategories.map(({ category, total }) => {
                        const percentage = totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;
                        const { color, Icon } = categoryDetails[category as CategoriaGasto] || categoryDetails.Otros;
                        return (
                             <div key={category} className="text-sm">
                                <div className="flex justify-between items-center mb-1.5 font-semibold">
                                    <div className="flex items-center">
                                        <Icon className="w-4 h-4 mr-2 text-on-surface-secondary" />
                                        <span className="text-on-surface">{category}</span>
                                    </div>
                                    <span className="text-on-surface">
                                        S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-active-surface rounded-full">
                                    <div
                                        className={`h-2 rounded-full ${color} transition-all duration-500 ease-out`}
                                        style={{ width: `${percentage}%` }}
                                        title={`${percentage.toFixed(1)}%`}
                                    ></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-center text-on-surface-secondary py-8">No hay datos de gastos para mostrar.</p>
            )}
        </div>
    );
};

export default CategoryAnalysis;
