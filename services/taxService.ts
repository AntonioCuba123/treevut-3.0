import { CategoriaGasto, Expense, TipoComprobante } from '../types';

export const UIT_VALUE_2024 = 5150;
export const DEDUCTIBLE_EXPENSE_LIMIT_UITS = 3;
export const DEDUCTIBLE_EXPENSE_LIMIT_SOLES = UIT_VALUE_2024 * DEDUCTIBLE_EXPENSE_LIMIT_UITS;

// Tasa fija de deducción sobre el valor del comprobante
export const DEDUCTIBLE_TRANSACTION_RATE = 0.03; // 3%

// Categorías que usualmente califican para la deducción adicional de 3 UIT
export const DEDUCTIBLE_CATEGORIES: CategoriaGasto[] = [
    CategoriaGasto.Alimentacion, // Bares y Restaurantes
    CategoriaGasto.Ocio,          // Hoteles
    CategoriaGasto.Servicios,     // Servicios profesionales
    CategoriaGasto.Salud,
    CategoriaGasto.Vivienda,      // Alquiler
];

const RENTA_BRACKETS = [
    { limit: 5 * UIT_VALUE_2024, rate: 0.08 },
    { limit: 20 * UIT_VALUE_2024, rate: 0.14 },
    { limit: 35 * UIT_VALUE_2024, rate: 0.17 },
    { limit: 45 * UIT_VALUE_2024, rate: 0.20 },
    { limit: Infinity, rate: 0.30 },
];

/**
 * Calculates the user's marginal income tax rate based on their annual income.
 * This is for "Rentas de Trabajo" (4ta y 5ta categoría).
 * @param annualIncome The user's gross annual income.
 * @returns The marginal tax rate (e.g., 0.08 for 8%).
 */
const getMarginalTaxRate = (annualIncome: number): number => {
    // According to Peruvian law, a fixed deduction of 7 UITs applies to the gross income.
    const taxableBase = Math.max(0, annualIncome - (7 * UIT_VALUE_2024));

    for (const bracket of RENTA_BRACKETS) {
        if (taxableBase <= bracket.limit) {
            return bracket.rate;
        }
    }
    // This fallback should ideally not be reached due to the Infinity limit.
    return RENTA_BRACKETS[RENTA_BRACKETS.length - 1].rate;
};


/**
 * Estimates the potential tax return from a given amount of deductible expenses.
 * @param deductibleAmount The total amount of deductible expenses.
 * @param annualIncome The user's gross annual income.
 * @returns The estimated tax return in soles.
 */
export const calculateEstimatedTaxReturn = (deductibleAmount: number, annualIncome: number): number => {
    if (annualIncome <= 0 || deductibleAmount <= 0) {
        return 0;
    }
    
    const marginalRate = getMarginalTaxRate(annualIncome);
    return deductibleAmount * marginalRate;
};

/**
 * Processes a list of expenses to calculate deductible totals based on Peruvian tax law.
 * @param expenses - The list of all user expenses.
 * @returns An object with the total of formal deductible expenses and potential deductible expenses from informal transactions.
 */
export const getDeductibleTotals = (expenses: Expense[]): { formalDeductible: number; potentialDeductible: number } => {
    return expenses.reduce(
        (totals, expense) => {
            // Check if the category is deductible
            if (DEDUCTIBLE_CATEGORIES.includes(expense.categoria)) {
                // Specific rule: 'Servicios' are only deductible if they are 'Recibo por Honorarios'
                if (
                    expense.esFormal &&
                    expense.categoria === CategoriaGasto.Servicios &&
                    expense.tipoComprobante !== TipoComprobante.ReciboHonorariosElectronico
                ) {
                    return totals; // Skip if it's a formal service but not by RHE
                }
                
                // The deductible amount is now a flat 3% of the total transaction
                const deductibleAmount = expense.total * DEDUCTIBLE_TRANSACTION_RATE;
                
                if (expense.esFormal) {
                    totals.formalDeductible += deductibleAmount;
                } else {
                    // This is the potential deductible amount if the expense had been formal
                    totals.potentialDeductible += deductibleAmount;
                }
            }
            return totals;
        },
        { formalDeductible: 0, potentialDeductible: 0 }
    );
};