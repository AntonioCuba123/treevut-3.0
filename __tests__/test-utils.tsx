import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import {
  DataContext,
  type DataContextType,
  type AlertState,
} from '../contexts/DataContext';

export const createMockDataContext = (
  overrides: Partial<DataContextType> = {},
): DataContextType => ({
  expenses: [],
  budget: null,
  annualIncome: null,
  alert: null as AlertState,
  totalExpenses: 0,
  totalAhorroPerdido: 0,
  formalityIndex: 100,
  formalityIndexByCount: 100,
  addExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
  updateBudget: vi.fn(),
  updateAnnualIncome: vi.fn(),
  setAlert: vi.fn(),
  ...overrides,
});

interface RenderWithDataContextOptions {
  contextOverrides?: Partial<DataContextType>;
  renderOptions?: RenderOptions;
}

export const renderWithDataContext = (
  ui: React.ReactElement,
  { contextOverrides, renderOptions }: RenderWithDataContextOptions = {},
) => {
  const contextValue = createMockDataContext(contextOverrides);

  const result = render(
    <DataContext.Provider value={contextValue}>
      {ui}
    </DataContext.Provider>,
    renderOptions,
  );

  return { contextValue, ...result };
};
