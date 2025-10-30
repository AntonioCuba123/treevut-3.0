import React from 'react';
import { useData } from '../contexts/DataContext';
import TransactionList from './TransactionList';
import SummaryCards from './SummaryCards';

const Dashboard = () => {
  const { expenses } = useData();

  const totalExpenses = expenses.reduce((total, expense) => total + expense.total, 0);

  return (
    <div className="p-4">
      <div className="mb-4">
        <SummaryCards totalGastos={totalExpenses} />
      </div>
      <div className="mb-4">
        <TransactionList 
          expenses={expenses}
          searchQuery=""
          onDelete={() => {}}
          onEdit={() => {}}
        />
      </div>
    </div>
  );
};

export default Dashboard;
