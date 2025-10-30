import React, { useMemo } from 'react';
import { type Expense, CategoriaGasto } from '../types';
import { ChartBarIcon } from './Icons';

interface ExpenseChartProps {
    expenses: Expense[];
}

const categoryColors: { [key in CategoriaGasto]: string } = {
    [CategoriaGasto.Alimentacion]: '#FF6384',
    [CategoriaGasto.Vivienda]: '#36A2EB',
    [CategoriaGasto.Transporte]: '#FFCE56',
    [CategoriaGasto.Salud]: '#4BC0C0',
    [CategoriaGasto.Ocio]: '#9966FF',
    [CategoriaGasto.Educacion]: '#FF9F40',
    [CategoriaGasto.Consumos]: '#C9CBCF',
    [CategoriaGasto.Servicios]: '#7C4DFF',
    [CategoriaGasto.Otros]: '#F7464A',
};


const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses }) => {
    const chartData = useMemo(() => {
        if (expenses.length === 0) return [];
        
        // FIX: Untyped function calls may not accept type arguments. Typing the accumulator directly.
        const dataByCategory = expenses.reduce((acc: Record<string, number>, expense) => {
            acc[expense.categoria] = (acc[expense.categoria] || 0) + expense.total;
            return acc;
        }, {});

        return Object.entries(dataByCategory)
            .map(([categoria, total]) => ({ categoria, total: total as number }))
            .sort((a, b) => b.total - a.total);
    }, [expenses]);

    const maxTotal = useMemo(() => {
        if (chartData.length === 0) return 0;
        return Math.max(...chartData.map(d => d.total));
    }, [chartData]);

    if (expenses.length === 0) {
        return null;
    }

    return (
        <div className="bg-surface rounded-2xl p-4 animate-slide-in-up">
            <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center">
                <ChartBarIcon className="w-6 h-6 mr-2 text-primary"/>
                Gastos por Categoría
            </h2>
            <div className="space-y-4">
                {chartData.map(({ categoria, total }) => {
                    const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                    const color = categoryColors[categoria as CategoriaGasto] || categoryColors[CategoriaGasto.Otros];
                    return (
                        <div key={categoria} className="text-sm">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-on-surface">{categoria}</span>
                                <span className="font-bold text-on-surface">
                                    S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-active-surface rounded-full">
                                <div
                                    className="h-2 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${percentage}%`, backgroundColor: color }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ExpenseChart;