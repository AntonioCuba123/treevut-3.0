import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataContext } from '../contexts/DataContext';
import Dashboard from '../components/Dashboard';

describe('Dashboard Integration Tests', () => {
  const mockExpenses = [
    { 
      id: '1', 
      total: 100, 
      categoria: 'ALIMENTOS', 
      fecha: new Date().toISOString(),
      razonSocial: 'Test Store',
      ruc: '12345678901',
      tipoComprobante: 'FACTURA',
      esFormal: true,
      ahorroPerdido: 0,
      igv: 15.25
    },
    { 
      id: '2', 
      total: 200, 
      categoria: 'TRANSPORTE', 
      fecha: new Date().toISOString(),
      razonSocial: 'Test Transport',
      ruc: '12345678902',
      tipoComprobante: 'BOLETA',
      esFormal: true,
      ahorroPerdido: 0,
      igv: 30.51
    }
  ];

  const mockContextValue = {
    expenses: mockExpenses,
    addExpense: vi.fn(),
    removeExpense: vi.fn(),
    budget: 1000
  };

  const renderWithContext = (ui: React.ReactElement) => {
    return render(
      <DataContext.Provider value={mockContextValue as any}>
        {ui}
      </DataContext.Provider>
    );
  };

  it('shows expense summary and list correctly', () => {
    renderWithContext(<Dashboard />);
    
    expect(screen.getByText('300')).toBeInTheDocument(); // Total gastos
    expect(screen.getByText('700')).toBeInTheDocument(); // Restante
    expect(screen.getAllByTestId('expense-card')).toHaveLength(2);
  });

  it('allows adding new expense through modal', async () => {
    renderWithContext(<Dashboard />);
    
    fireEvent.click(screen.getByText('Agregar Gasto'));
    
    const montoInput = await screen.findByLabelText('Monto');
    fireEvent.change(montoInput, { target: { value: '150' } });
    
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'Alimentos' } });
    
    fireEvent.click(screen.getByText('Guardar'));
    
    await waitFor(() => {
      expect(mockContextValue.addExpense).toHaveBeenCalledWith(
        expect.objectContaining({
          monto: 150,
          categoria: 'Alimentos'
        })
      );
    });
  });

  it('allows removing an expense', async () => {
    renderWithContext(<Dashboard />);
    
    const deleteButtons = screen.getAllByTestId('delete-expense');
    fireEvent.click(deleteButtons[0]);
    
    const confirmButton = await screen.findByText('Confirmar');
    fireEvent.click(confirmButton);
    
    expect(mockContextValue.removeExpense).toHaveBeenCalledWith('1');
  });
});