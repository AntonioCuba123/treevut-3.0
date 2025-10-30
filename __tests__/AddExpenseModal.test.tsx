import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import React from "react";
import AddExpenseModal from "../components/AddExpenseModal";
import { renderWithDataContext } from "./test-utils";
import { CategoriaGasto, TipoComprobante } from "../types";

const baseExpense = {
  id: "exp-1",
  razonSocial: "Restaurante Central",
  ruc: "12345678901",
  fecha: "2024-03-15",
  total: 120,
  categoria: CategoriaGasto.Alimentacion,
  tipoComprobante: TipoComprobante.FacturaElectronica,
  esFormal: true,
  ahorroPerdido: 0,
  igv: 18.31,
};

describe("AddExpenseModal", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra la vista de captura por defecto", () => {
    renderWithDataContext(
      <AddExpenseModal
        onClose={onClose}
        initialAction="camera"
        scanMode="receipt"
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: /Registrar Comprobante/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/boleta o factura/i)).toBeInTheDocument();
  });

  it("valida campos requeridos al editar", async () => {
    const updateExpense = vi.fn();

    renderWithDataContext(
      <AddExpenseModal
        onClose={onClose}
        initialAction={null}
        scanMode={null}
        expenseToEdit={{ ...baseExpense, razonSocial: "" }}
      />,
      {
        contextOverrides: { updateExpense },
      },
    );

    fireEvent.click(
      screen.getByRole("button", { name: /actualizar gasto/i }),
    );

    expect(updateExpense).not.toHaveBeenCalled();
    const alert = await screen.findByRole('alert');
    const normalized = alert.textContent ? alert.textContent.normalize('NFD') : '';
    expect(normalized).toMatch(/descripci.*n y el total/i);
  });

  it("actualiza un gasto existente", () => {
    const updateExpense = vi.fn();

    renderWithDataContext(
      <AddExpenseModal
        onClose={onClose}
        initialAction={null}
        scanMode={null}
        expenseToEdit={baseExpense}
      />,
      {
        contextOverrides: { updateExpense },
      },
    );

    fireEvent.change(screen.getByLabelText(/Total/i), {
      target: { value: "150" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /actualizar gasto/i }),
    );

    expect(updateExpense).toHaveBeenCalledWith(
      baseExpense.id,
      expect.objectContaining({ total: 150 }),
    );
    expect(onClose).toHaveBeenCalled();
  });
});
