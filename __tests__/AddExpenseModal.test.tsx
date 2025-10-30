import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddExpenseModal from '../components/AddExpenseModal';
import React from 'react';
import { DataContext } from '../contexts/DataContext';

describe('AddExpenseModal Component', () => {
  const mockAddExpense = vi.fn();
  const mockClose = vi.fn();

  const renderWithContext = (ui: React.ReactElement) => {
    return render(
      <DataContext.Provider value={{ addExpense: mockAddExpense } as any}>
        {ui}
      </DataContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal with all required fields', () => {
    renderWithContext(<AddExpenseModal onClose={mockClose} initialAction="camera" scanMode="receipt" />);
    
    expect(screen.getByText('Agregar Gasto')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /monto/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /fecha/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /categoría/i })).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    renderWithContext(<AddExpenseModal onClose={mockClose} initialAction="camera" scanMode="receipt" />);
    
    const submitButton = screen.getByText('Guardar Gasto');
    fireEvent.click(submitButton);
    
    expect(mockAddExpense).not.toHaveBeenCalled();
    expect(screen.getByText('El monto es requerido')).toBeInTheDocument();
  });

  it('calls addExpense with correct data on valid submission', async () => {
    renderWithContext(<AddExpenseModal onClose={mockClose} initialAction="camera" scanMode="receipt" />);
    
    fireEvent.change(screen.getByLabelText('Monto'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'Alimentos' } });
    
    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);
    
    expect(mockAddExpense).toHaveBeenCalledWith(expect.objectContaining({
      monto: 100,
      categoria: 'Alimentos'
    }));
    expect(mockClose).toHaveBeenCalled();
  });
});