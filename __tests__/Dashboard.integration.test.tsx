import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import React from "react";
import Dashboard from "../components/Dashboard";
import { renderWithDataContext } from "./test-utils";
import { CategoriaGasto, TipoComprobante } from "../types";

const baseExpense = {
  id: "1",
  razonSocial: "Test Store",
  ruc: "12345678901",
  fecha: new Date().toISOString().split("T")[0],
  total: 100,
  categoria: CategoriaGasto.Alimentacion,
  tipoComprobante: TipoComprobante.FacturaElectronica,
  esFormal: true,
  ahorroPerdido: 0,
  igv: 18,
};

describe("Dashboard", () => {
  it("muestra el resumen y la lista de gastos", () => {
    renderWithDataContext(<Dashboard />, {
      contextOverrides: {
        expenses: [
          baseExpense,
          {
            ...baseExpense,
            id: "2",
            razonSocial: "Transporte Lima",
            categoria: CategoriaGasto.Transporte,
            total: 80,
            igv: 12,
          },
        ],
        totalExpenses: 180,
      },
    });

    expect(screen.getByText(/Total Gastos/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Store/)).toBeInTheDocument();
    expect(screen.getByText(/Transporte Lima/)).toBeInTheDocument();
  });

  it("muestra el estado vacío cuando no hay transacciones", () => {
    renderWithDataContext(<Dashboard />, {
      contextOverrides: { expenses: [], totalExpenses: 0 },
    });

    expect(screen.getByText(/Todo listo/i)).toBeInTheDocument();
  });
});
