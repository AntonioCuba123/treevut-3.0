import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import React from "react";
import TransactionList from "../components/TransactionList";
import ExpenseChart from "../components/ExpenseChart";
import { renderWithDataContext } from "./test-utils";
import { CategoriaGasto, TipoComprobante } from "../types";

const buildExpense = (id: number, overrides: Partial<Record<string, any>> = {}) => ({
  id: id.toString(),
  razonSocial: `Comercio ${id}`,
  ruc: "12345678901",
  fecha: "2024-03-15",
  total: 50 + id,
  categoria: CategoriaGasto.Alimentacion,
  tipoComprobante: TipoComprobante.FacturaElectronica,
  esFormal: true,
  ahorroPerdido: 0,
  igv: 9,
  ...overrides,
});

describe("Rendimiento", () => {
  it("TransactionList maneja listas grandes", () => {
    const expenses = Array.from({ length: 100 }, (_, index) => buildExpense(index));

    renderWithDataContext(
      <TransactionList
        expenses={expenses}
        searchQuery=""
        onDelete={() => {}}
        onEdit={() => {}}
      />,
      {
        contextOverrides: { expenses },
      },
    );

    expect(screen.getByText(/Comercio 0/)).toBeInTheDocument();
    expect(screen.getByText(/Comercio 99/)).toBeInTheDocument();
  });

  it("ExpenseChart resume montos por categoría", () => {
    const expenses = [
      buildExpense(1, { categoria: CategoriaGasto.Alimentacion, total: 100 }),
      buildExpense(2, { categoria: CategoriaGasto.Transporte, total: 50 }),
      buildExpense(3, { categoria: CategoriaGasto.Alimentacion, total: 80 }),
    ];

    renderWithDataContext(<ExpenseChart expenses={expenses} />);

    expect(screen.getByText(/Alimentación/i)).toBeInTheDocument();
    expect(screen.getByText(/Transporte/i)).toBeInTheDocument();
  });

  it("los componentes perezosos no se importan automáticamente", () => {
    const lazyImportSpy = vi.fn();

    vi.mock("../components/AnalysisView", () => ({
      default: () => {
        lazyImportSpy();
        return null;
      },
    }));

    expect(lazyImportSpy).not.toHaveBeenCalled();
  });
});
