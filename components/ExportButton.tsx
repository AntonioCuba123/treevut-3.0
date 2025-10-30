import React from 'react';
import { type Expense } from '../types';
import { DocumentArrowDownIcon } from './Icons';

interface ExportButtonProps {
    expenses: Expense[];
    filename?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ expenses, filename = 'treevut_gastos.csv' }) => {
    
    const convertToCSV = (data: Expense[]): string => {
        const headers = [
            "Fecha",
            "Razón Social",
            "RUC",
            "Categoría",
            "Total (S/)",
            "Comprobante Formal",
            "Ahorro Perdido (S/.)"
        ];
        
        const rows = data.map(expense => [
            expense.fecha,
            `"${expense.razonSocial.replace(/"/g, '""')}"`, // Handle quotes
            expense.ruc,
            expense.categoria,
            expense.total.toFixed(2),
            expense.esFormal ? 'Sí' : 'No',
            expense.ahorroPerdido.toFixed(2)
        ].join(','));

        return [headers.join(','), ...rows].join('\n');
    };

    const handleExport = () => {
        if (expenses.length === 0) {
            // Silently return or show a subtle message, alert can be intrusive.
            return;
        }

        const csvString = convertToCSV(expenses);
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        if (link.download !== undefined) { 
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={expenses.length === 0}
            className="flex items-center text-sm font-semibold text-primary hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Exportar gastos a CSV"
        >
            <DocumentArrowDownIcon className="w-5 h-5 mr-1.5" />
            Exportar
        </button>
    );
};

export default ExportButton;