import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import AddExpenseModal from '../components/AddExpenseModal';
import TransactionList from '../components/TransactionList';
import React from 'react';
import { CategoriaGasto, TipoComprobante } from '../types';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('AddExpenseModal has no accessibility violations', async () => {
    const { container } = render(<AddExpenseModal onClose={() => {}} initialAction="camera" scanMode="receipt" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('TransactionList has no accessibility violations', async () => {
    const { container } = render(
      <TransactionList 
        expenses={[]} 
        searchQuery="" 
        onDelete={() => {}} 
        onEdit={() => {}} 
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('components have proper ARIA labels', () => {
    const { getByRole } = render(<AddExpenseModal onClose={() => {}} initialAction="camera" scanMode="receipt" />);
    
    expect(getByRole('dialog')).toHaveAttribute('aria-labelledby');
    expect(getByRole('textbox', { name: /total/i })).toHaveAttribute('aria-label');
  });

  it('components have proper keyboard navigation', () => {
    const { getAllByRole } = render(
      <TransactionList 
        expenses={[
          { 
            id: '1', 
            total: 100, 
            categoria: CategoriaGasto.Alimentacion, 
            fecha: new Date().toISOString(),
            razonSocial: '',
            ruc: '',
            tipoComprobante: TipoComprobante.TicketPOS,
            esFormal: true,
            ahorroPerdido: 0,
            igv: 0
          }
        ]} 
        searchQuery=""
        onDelete={() => {}}
        onEdit={() => {}}
      />
    );
    
    const buttons = getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveFocus();
    });
  });
});