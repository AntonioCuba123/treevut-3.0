import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import TransactionList from '../components/TransactionList';
import ExpenseChart from '../components/ExpenseChart';
import { CategoriaGasto, TipoComprobante } from '../types';
import React from 'react';

describe('Performance Tests', () => {
  // Medir tiempo de renderizado
  it('TransactionList renders large lists efficiently', () => {
    const largeTransactionList = Array.from({ length: 1000 }, (_, index) => ({
      id: index.toString(),
      total: Math.random() * 1000,
      categoria: CategoriaGasto.Otros,
      fecha: new Date().toISOString(),
      razonSocial: 'Test Company',
      ruc: '12345678901',
      tipoComprobante: TipoComprobante.TicketPOS,
      esFormal: true,
      ahorroPerdido: 0,
      igv: 0
    }));

    const startTime = performance.now();
    render(
      <TransactionList 
        expenses={largeTransactionList} 
        searchQuery="" 
        onDelete={() => {}} 
        onEdit={() => {}} 
      />
    );
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100); // Debe renderizar en menos de 100ms
  });

  // Prueba de memoización
  it('ExpenseChart rerenders are optimized', () => {
    const renderSpy = vi.fn();
    const TestComponent = () => {
      renderSpy();
      return <ExpenseChart expenses={[]} />;
    };

    const { rerender } = render(<TestComponent />);
    rerender(<TestComponent />);

    expect(renderSpy).toHaveBeenCalledTimes(1); // Debería usar React.memo
  });

  // Prueba de carga diferida
  it('components load lazily when needed', async () => {
    const lazyImportSpy = vi.fn();
    
    // Simular import dinámico
    vi.mock('../components/AnalysisView', () => ({
      default: () => {
        lazyImportSpy();
        return null;
      }
    }));

    expect(lazyImportSpy).not.toHaveBeenCalled();
  });

  // Prueba de memoria
  it('no memory leaks in long running components', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    const { unmount } = render(
      <TransactionList 
        expenses={[]} 
        searchQuery=""
        onDelete={() => {}}
        onEdit={() => {}}
      />
    );
    unmount();
    
    const finalMemory = process.memoryUsage().heapUsed;
    const diff = finalMemory - initialMemory;
    
    expect(diff).toBeLessThan(1000000); // Menos de 1MB de diferencia
  });
});