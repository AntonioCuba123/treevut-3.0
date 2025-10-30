import React from 'react';
import { formatCurrency } from '../utils';

interface SummaryCardsProps {
  totalGastos: number;
}

const SummaryCards = ({ totalGastos }: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-700">Total Gastos</h3>
        <p className="text-2xl font-bold text-primary mt-2">{formatCurrency(totalGastos)}</p>
      </div>
    </div>
  );
};

export default SummaryCards;
