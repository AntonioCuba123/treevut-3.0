import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import AddExpenseModal from "../components/AddExpenseModal";
import TransactionList from "../components/TransactionList";
import { renderWithDataContext } from "./test-utils";
import { CategoriaGasto, TipoComprobante } from "../types";

expect.extend(toHaveNoViolations);

const sampleExpense = {
  id: "1",
  razonSocial: "Test Store",
  ruc: "12345678901",
  fecha: "2024-03-15",
  total: 150,
  categoria: CategoriaGasto.Alimentacion,
  tipoComprobante: TipoComprobante.FacturaElectronica,
  esFormal: true,
  ahorroPerdido: 0,
  igv: 18,
};

describe("Accessibility", () => {
  it("AddExpenseModal cumple con accesibilidad al editar", async () => {
    const { container } = renderWithDataContext(
      <AddExpenseModal
        onClose={() => {}}
        initialAction={null}
        scanMode={null}
        expenseToEdit={sampleExpense}
      />,
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("TransactionList cumple con accesibilidad", async () => {
    const { container } = renderWithDataContext(
      <TransactionList
        expenses={[sampleExpense]}
        searchQuery=""
        onDelete={() => {}}
        onEdit={() => {}}
      />,
      {
        contextOverrides: { expenses: [sampleExpense] },
      },
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("AddExpenseModal tiene nombre accesible", () => {
    const { getByRole } = renderWithDataContext(
      <AddExpenseModal
        onClose={() => {}}
        initialAction={null}
        scanMode={null}
        expenseToEdit={sampleExpense}
      />,
    );

    expect(getByRole("dialog")).toHaveAccessibleName();
  });

  it("TransactionList expone controles navegables", () => {
    const { getByRole } = renderWithDataContext(
      <TransactionList
        expenses={[sampleExpense]}
        searchQuery=""
        onDelete={() => {}}
        onEdit={() => {}}
      />,
      {
        contextOverrides: { expenses: [sampleExpense] },
      },
    );

    expect(getByRole("button", { name: /eliminar gasto/i })).toBeEnabled();
  });
});
