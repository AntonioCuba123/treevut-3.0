
import React from 'react';
import BudgetTracker from './BudgetTracker';
import TransactionList from './TransactionList';
import { Expense } from '../types';

interface WalletViewProps {
    expenses: Expense[];
    searchQuery: string;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    onOpenBudgetModal: () => void;
}

const WalletView: React.FC<WalletViewProps> = ({
    expenses,
    searchQuery,
    onDelete,
    onEdit,
    onOpenBudgetModal,
}) => {
    return (
        <div className="space-y-4 px-4 md:px-6 max-w-2xl mx-auto">
            <BudgetTracker onOpenBudgetModal={onOpenBudgetModal} />
            <TransactionList
                expenses={expenses}
                searchQuery={searchQuery}
                onDelete={onDelete}
                onEdit={onEdit}
                className="mt-4"
            />
        </div>
    );
};

export default WalletView;
