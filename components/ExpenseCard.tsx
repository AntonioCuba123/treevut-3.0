
import React from 'react';
import { type Expense, CategoriaGasto } from '../types';
import {
    CalendarIcon,
    ShoppingBagIcon,
    ReceiptPercentIcon,
    HeartIcon,
    CogIcon,
    HomeIcon,
    TicketIcon,
    TruckIcon,
    SparklesIcon,
    AcademicCapIcon,
    TrashIcon,
    ChevronDownIcon,
    ExclamationTriangleIcon,
    PencilIcon,
} from './Icons';

interface ExpenseCardProps {
    expense: Expense;
    onDelete: (expenseId: string) => void;
    onEdit: (expenseId: string) => void;
    isExpanded: boolean;
    onToggle: () => void;
}

const categoryIcons: { [key in CategoriaGasto]: React.FC<{className?: string}> } = {
    [CategoriaGasto.Alimentacion]: ReceiptPercentIcon,
    [CategoriaGasto.Transporte]: TruckIcon,
    [CategoriaGasto.Vivienda]: HomeIcon,
    [CategoriaGasto.Consumos]: ShoppingBagIcon,
    [CategoriaGasto.Ocio]: TicketIcon,
    [CategoriaGasto.Servicios]: CogIcon,
    [CategoriaGasto.Salud]: HeartIcon,
    [CategoriaGasto.Educacion]: AcademicCapIcon,
    [CategoriaGasto.Otros]: SparklesIcon,
};

const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
    } catch (e) {
        return dateString;
    }
};

const ExpenseCard: React.FC<ExpenseCardProps> = React.memo(({ expense, onDelete, onEdit, isExpanded, onToggle }) => {
    const Icon = categoryIcons[expense.categoria] || categoryIcons[CategoriaGasto.Otros];

    const handleDelete = React.useCallback(() => {
        onDelete(expense.id);
    }, [expense.id, onDelete]);

    const handleEdit = React.useCallback(() => {
        onEdit(expense.id);
    }, [expense.id, onEdit]);

    const handleKeyPress = React.useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            onToggle();
        }
    }, [onToggle]);
    

    return (
        <div 
            className={`bg-surface rounded-2xl animate-slide-in-up transition-all duration-300 ease-in-out overflow-hidden expense-card ${!expense.esFormal ? 'informal-expense' : ''}`}
        >
            <div className="p-3 flex items-center space-x-3 cursor-pointer" onClick={onToggle}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-active-surface flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-base text-on-surface truncate">
                        {expense.razonSocial}
                    </p>
                    <p className="text-sm text-on-surface-secondary mt-0.5">{expense.categoria}</p>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                   <p className="font-bold text-lg text-on-surface">
                        -S/{expense.total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </p>
                    <div className="flex items-center justify-end text-sm text-on-surface-secondary mt-0.5">
                        <span>{formatDate(expense.fecha)}</span>
                        <ChevronDownIcon className={`w-4 h-4 ml-1.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </div>
            
            <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-48' : 'max-h-0'}`}
            >
                <div className="px-4 pb-4 pt-2 border-t border-active-surface/50">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-4">
                        <div className="flex flex-col">
                            <span className="font-semibold text-on-surface-secondary text-xs uppercase tracking-wider">RUC</span>
                            <span className="text-on-surface">{expense.ruc || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                             <span className="font-semibold text-on-surface-secondary text-xs uppercase tracking-wider">Comprobante</span>
                            <span className="text-on-surface truncate">{expense.tipoComprobante}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-on-surface-secondary text-xs uppercase tracking-wider">IGV (aprox.)</span>
                            <span className="text-on-surface">S/ {expense.igv.toFixed(2)}</span>
                        </div>
                         <div className="flex flex-col">
                            <span className="font-semibold text-on-surface-secondary text-xs uppercase tracking-wider">Ahorro Perdido</span>
                            <span className={`font-bold ${expense.ahorroPerdido > 0 ? 'text-yellow-400' : 'text-on-surface'}`}>S/ {expense.ahorroPerdido.toFixed(2)}</span>
                        </div>
                    </div>
                     {!expense.esFormal && expense.ahorroPerdido > 0 && (
                        <div className="bg-yellow-400/10 p-2 rounded-lg flex items-center text-xs text-yellow-300/90 space-x-2">
                            <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                            <span>Este gasto informal no suma a tu devolución de impuestos.</span>
                        </div>
                    )}
                    <div className="mt-3 flex justify-end space-x-2">
                        <button
                            onClick={() => onEdit(expense.id)}
                            className="p-2 rounded-lg text-on-surface-secondary/80 bg-active-surface hover:bg-active-surface/70 hover:text-blue-400 transition-colors flex items-center text-sm font-semibold"
                            aria-label="Editar gasto"
                        >
                            <PencilIcon className="w-4 h-4 mr-1.5" /> Editar
                        </button>
                        <button
                            onClick={() => onDelete(expense.id)}
                            className="p-2 rounded-lg text-on-surface-secondary/80 bg-active-surface hover:bg-active-surface/70 hover:text-danger transition-colors flex items-center text-sm font-semibold"
                            aria-label="Eliminar gasto"
                        >
                            <TrashIcon className="w-4 h-4 mr-1.5" /> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ExpenseCard;
