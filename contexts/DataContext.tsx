import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { type Expense, type ExpenseData, type UserChallenge, type Challenge, ChallengeStatus, ChallengeType, ChallengeFrequency, type VirtualGood } from '../types';
import { allChallenges } from '../services/challengeService';
import { allVirtualGoods } from '../services/marketService';
import { allChallenges } from '../services/challengeService';
import { sendInformalExpenseNotification } from '../services/notificationService';
import { generateUniqueId } from '../utils';

export type AlertState = { message: string; type: 'info' | 'warning' | 'danger' } | null;

export interface DataContextType {
    userChallenges: UserChallenge[];
    bellotas: number;
    purchasedGoods: string[];
    // State
    expenses: Expense[];
    budget: number | null;
    annualIncome: number | null;
    alert: AlertState;

    // Derived State
    totalExpenses: number;
    totalAhorroPerdido: number;
    formalityIndex: number;
    formalityIndexByCount: number;

    // Actions
    addExpense: (newExpenseData: ExpenseData & { imageUrl?: string }) => void;
    updateExpense: (expenseId: string, updatedData: ExpenseData) => void;
    deleteExpense: (expenseId: string) => void;
    updateBudget: (newBudget: number) => void;
    updateAnnualIncome: (newIncome: number) => void;
    // FIX: Correctly type `setAlert` to allow functional updates from `useState`.
    setAlert: React.Dispatch<React.SetStateAction<AlertState>>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Combined State from AppContext and ExpensesContext
    const [expenses, setExpenses] = useState<Expense[]>(() => {
        const saved = localStorage.getItem('treevut-expenses');
        return saved ? JSON.parse(saved) : [];
    });
    const [budget, setBudget] = useState<number>(() => {
        const saved = localStorage.getItem('treevut-budget');
        return saved ? Number(saved) : 0;
    });
    const [annualIncome, setAnnualIncome] = useState<number>(() => {
        const saved = localStorage.getItem('treevut-annual-income');
        return saved ? Number(saved) : 0;
    });
    const [alert, setAlert] = useState<AlertState>(null);
    const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
    const [bellotas, setBellotas] = useState<number>(0);
    const [purchasedGoods, setPurchasedGoods] = useState<string[]>([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Load all data from localStorage on initial render
    useEffect(() => {
        try {
            // Helper for migration
            const migrateLocalStorageItem = (oldKey: string, newKey: string) => {
                const oldData = localStorage.getItem(oldKey);
                if (oldData && !localStorage.getItem(newKey)) {
                    localStorage.setItem(newKey, oldData);
                    localStorage.removeItem(oldKey);
                }
            };

            migrateLocalStorageItem('treebu-expenses', 'treevut-expenses');
            migrateLocalStorageItem('treebu-budget', 'treevut-budget');
            migrateLocalStorageItem('treebu-annualIncome', 'treevut-annualIncome');
            
            const savedExpenses = localStorage.getItem('treevut-expenses');
            if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
            
            const savedBudget = localStorage.getItem('treevut-budget');
            setBudget(savedBudget ? parseFloat(savedBudget) : 1500);

            const savedIncome = localStorage.getItem('treevut-annualIncome');
            setAnnualIncome(savedIncome ? parseFloat(savedIncome) : 0);
        } catch (e) {
            console.error("Failed to parse data from localStorage", e);
        }
        setIsInitialLoad(false);
    }, []);

    // Save all data to localStorage whenever it changes
    useEffect(() => {
        if (isInitialLoad) return;
        try {
            localStorage.setItem('treevut-expenses', JSON.stringify(expenses));
            if (budget !== null) {
                localStorage.setItem('treevut-budget', budget.toString());
            } else {
                localStorage.removeItem('treevut-budget');
            }
            if (annualIncome !== null) {
                localStorage.setItem('treevut-annualIncome', annualIncome.toString());
            localStorage.setItem('treevut-user-challenges', JSON.stringify(userChallenges));
            localStorage.setItem('treevut-bellotas', bellotas.toString());
            localStorage.setItem('treevut-purchased-goods', JSON.stringify(purchasedGoods));
            } else {
                localStorage.removeItem('treevut-annualIncome');
            }
        } catch (e) {
            console.error("Failed to save data to localStorage", e);
        }
    }, [expenses, budget, annualIncome, isInitialLoad]);

    // --- Actions (from both contexts) ---
    const addExpense = (newExpenseData: ExpenseData & { imageUrl?: string }) => {
        const newExpense: Expense = {
            id: generateUniqueId(),
            ...newExpenseData
        };
        setExpenses(prev => [...prev, newExpense]);
        if (!newExpense.esFormal && newExpense.ahorroPerdido > 0) {
            sendInformalExpenseNotification(newExpense);
        }
    };

    const updateExpense = (expenseId: string, updatedData: ExpenseData) => {
        setExpenses(prev =>
            prev.map(expense =>
                expense.id === expenseId
                    ? { ...expense, ...updatedData }
                    : expense
            )
        );
    };

    const deleteExpense = (expenseId: string) => {
        setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    };

    const updateBudget = (newBudget: number) => setBudget(newBudget);
    const updateAnnualIncome = (newIncome: number) => setAnnualIncome(newIncome);

    // --- Derived State (from ExpensesContext) ---
    const totalExpenses = useMemo(() => expenses.reduce((sum, expense) => sum + expense.total, 0), [expenses]);
    const totalAhorroPerdido = useMemo(() => expenses.reduce((sum, expense) => sum + expense.ahorroPerdido, 0), [expenses]);
    const totalFormalExpenses = useMemo(() => expenses.filter(e => e.esFormal).reduce((sum, expense) => sum + expense.total, 0), [expenses]);
    const formalityIndex = useMemo(() => totalExpenses > 0 ? (totalFormalExpenses / totalExpenses) * 100 : 100, [totalFormalExpenses, totalExpenses]);
        // --- Lógica de Desafíos ---
    useEffect(() => {
        if (isInitialLoad) return;
        checkAndUpdateChallenges();
    }, [expenses, budget, formalityIndex]);

    const checkAndUpdateChallenges = () => {
        const activeChallenges = allChallenges.filter(challenge => {
            const userChallenge = userChallenges.find(uc => uc.challengeId === challenge.id);
            if (!userChallenge) return true; // Es un nuevo desafío
            if (userChallenge.status === ChallengeStatus.CLAIMED && challenge.frequency === ChallengeFrequency.ONCE) return false; // Ya completado y reclamado
            // Lógica para resetear desafíos semanales/mensuales aquí
            return true;
        });

            const purchaseGood = (goodId: string, price: number) => {
        if (bellotas >= price) {
            setBellotas(prev => prev - price);
            setPurchasedGoods(prev => [...prev, goodId]);
        } else {
            setAlert({ message: 'No tienes suficientes bellotas para comprar este artículo.', type: 'warning' });
        }
    };

    const updatedChallenges = activeChallenges.map(challenge => {
            let progress = 0;
            let isCompleted = false;

            switch (challenge.type) {
                case ChallengeType.REGISTER_EXPENSES:
                    progress = expenses.length;
                    break;
                case ChallengeType.REACH_FORMALITY_INDEX:
                    progress = formalityIndex;
                    break;
                case ChallengeType.SET_BUDGET:
                    progress = budget ? 1 : 0;
                    break;
                case ChallengeType.REGISTER_IN_CATEGORY:
                    progress = expenses.filter(e => e.categoria === challenge.categoryGoal).length;
                    break;
            }

            if (progress >= challenge.goal) {
                isCompleted = true;
            }

            const existing = userChallenges.find(uc => uc.challengeId === challenge.id);
            if (existing) {
                if (existing.status !== ChallengeStatus.ACTIVE) return existing; // No sobreescribir si ya está completado/reclamado
                return { ...existing, currentProgress: progress, status: isCompleted ? ChallengeStatus.COMPLETED : ChallengeStatus.ACTIVE };
            } else {
                return {
                    challengeId: challenge.id,
                    currentProgress: progress,
                    status: isCompleted ? ChallengeStatus.COMPLETED : ChallengeStatus.ACTIVE,
                    startDate: new Date().toISOString(),
                };
            }
        });

        setUserChallenges(updatedChallenges);
    };


    const formalityIndexByCount = useMemo(() => {
        if (expenses.length === 0) return 100;
        const formalCount = expenses.filter(e => e.esFormal).length;
        return (formalCount / expenses.length) * 100;
    }, [expenses]);
    
    // Context value
    const value = useMemo(() => ({
        expenses, budget, annualIncome, alert,
        totalExpenses, totalAhorroPerdido, formalityIndex, formalityIndexByCount,
        addExpense, updateExpense, deleteExpense, updateBudget, updateAnnualIncome, setAlert, userChallenges, bellotas, purchasedGoods, purchaseGood
    }), [expenses, budget, annualIncome, alert, totalExpenses, totalAhorroPerdido, formalityIndex, formalityIndexByCount, userChallenges, bellotas, purchasedGoods]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};