
import React, { useMemo, useState } from 'react';
import { type Expense } from '../types';
import MerchantDetailModal from './MerchantDetailModal';
import { ArrowTopRightOnSquareIcon, ShoppingBagIcon } from './Icons';

interface MerchantAnalysisProps {
    expenses: Expense[];
}

const MerchantAnalysis: React.FC<MerchantAnalysisProps> = ({ expenses }) => {
    const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);

    const dataByMerchant = useMemo(() => {
        const merchantData = expenses
            .filter(expense => !expense.isProductScan) // Exclude expenses from product scans
            .reduce((acc: Record<string, number>, expense) => {
                const name = expense.razonSocial.trim();
                acc[name] = (acc[name] || 0) + expense.total;
                return acc;
            }, {});

        return Object.entries(merchantData)
            .map(([name, total]) => ({ name, total: total as number }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5); // Top 5 merchants
    }, [expenses]);
    
    return (
        <>
            <div className="bg-surface rounded-2xl p-4 animate-slide-in-up">
                <h2 className="text-lg font-bold text-on-surface mb-4 flex items-center">
                    <ShoppingBagIcon className="w-6 h-6 mr-2 text-primary"/>
                    Top Comercios
                </h2>
                <div className="space-y-4">
                    {dataByMerchant.map(({ name, total }) => (
                        <div key={name} className="flex justify-between items-center text-sm">
                            <button onClick={() => setSelectedMerchant(name)} className="font-semibold text-on-surface truncate pr-4 flex items-center group hover:text-primary transition-colors text-left">
                                <span className="truncate">{name}</span>
                                <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </button>
                            <span className="font-bold text-on-surface flex-shrink-0">
                                S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            {selectedMerchant && (
                <MerchantDetailModal
                    merchantName={selectedMerchant}
                    expenses={expenses}
                    onClose={() => setSelectedMerchant(null)}
                />
            )}
        </>
    );
};

export default MerchantAnalysis;
