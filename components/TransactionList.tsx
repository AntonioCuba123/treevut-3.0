



import React, { useMemo, useState } from 'react';
import { type Expense } from '../types';
import ExpenseCard from './ExpenseCard';
import { useData } from '../contexts/DataContext';
import ExportButton from './ExportButton';

const formatDateGroup = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayString = today.toISOString().split('T')[0];
    const yesterdayString = yesterday.toISOString().split('T')[0];

    if (dateString === todayString) return 'Hoy';
    if (dateString === yesterdayString) return 'Ayer';
    
    return new Intl.DateTimeFormat('es-PE', { dateStyle: 'full' }).format(date);
};

const groupTransactionsByDate = (transactions: Expense[]) => {
    return transactions.reduce((acc, transaction) => {
        const dateKey = transaction.fecha;
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(transaction);
        return acc;
    }, {} as Record<string, Expense[]>);
};

interface TransactionListProps {
    expenses: Expense[];
    searchQuery: string;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    className?: string;
}

const TransactionList: React.FC<TransactionListProps> = React.memo(({ expenses, searchQuery, onDelete, onEdit }) => {
    const { expenses: allExpenses } = useData();
    const [expandedCardIds, setExpandedCardIds] = useState(new Set<string>());

    const toggleCardExpansion = React.useCallback((expenseId: string) => {
        setExpandedCardIds(prevIds => {
            const newIds = new Set(prevIds);
            if (newIds.has(expenseId)) {
                newIds.delete(expenseId);
            } else {
                newIds.add(expenseId);
            }
            return newIds;
        });
    }, []);

    const groupedTransactions = useMemo(() => {
        const sorted = [...expenses].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        return groupTransactionsByDate(sorted);
    }, [expenses]);
    
    const sortedDateGroups = useMemo(() => {
        return Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    }, [groupedTransactions]);
    
    const totalOfFilteredExpenses = useMemo(() => expenses.reduce((sum, expense) => sum + expense.total, 0), [expenses]);
    
    const renderEmptyState = () => {
        if (searchQuery) {
            return (
                <div className="text-center py-10 bg-surface rounded-2xl">
                    <p className="text-lg font-semibold">Sin Resultados</p>
                    <p className="text-on-surface-secondary mt-1">No se encontraron transacciones para "<span className="font-bold text-on-surface">{searchQuery}</span>".</p>
                </div>
            );
        }
        if (allExpenses.length === 0) {
            return (
                <div className="text-center py-10 bg-surface rounded-2xl">
                    <p className="text-lg font-semibold">¡Todo listo!</p>
                    <p className="text-on-surface-secondary mt-1">Toca el botón (+) para registrar tu primer gasto.</p>
                </div>
            );
        }
        return null;
    };
    
    return (
        <>
            <div className="bg-surface p-3 rounded-2xl mb-4 animate-slide-in-up">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-on-surface-secondary">
                            {searchQuery 
                                ? <>Mostrando <span className="font-bold text-on-surface">{expenses.length}</span> resultados que suman un total de</>
                                : <>Mostrando <span className="font-bold text-on-surface">{expenses.length}</span> transacciones que suman un total de</>
                            }
                        </p>
                        <p className="text-lg font-bold text-primary">
                            S/ {totalOfFilteredExpenses.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <ExportButton expenses={expenses} />
                </div>
            </div>
            
            {expenses.length === 0 ? (
                renderEmptyState()
            ) : (
                <div className="space-y-4">
                    {sortedDateGroups.map(dateKey => (
                        <div key={dateKey}>
                            <h2 className="text-xs font-bold text-on-surface-secondary uppercase tracking-wider py-2">
                                {formatDateGroup(dateKey)}
                            </h2>
                            <div className="space-y-2">
                                {groupedTransactions[dateKey].map(expense => (
                                    <ExpenseCard
                                        key={expense.id}
                                        expense={expense}
                                        onDelete={onDelete}
                                        onEdit={onEdit}
                                        isExpanded={expandedCardIds.has(expense.id)}
                                        onToggle={() => toggleCardExpansion(expense.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
});

export default TransactionList;