import { Challenge, ChallengeType, ChallengeFrequency, CategoriaGasto } from '../types';

// Base de datos de todos los desafíos disponibles en la aplicación
export const allChallenges: Challenge[] = [
    // --- Desafíos de Onboarding ---
    {
        id: 'onboarding_1',
        title: 'Tu Primer Gasto',
        description: 'Registra tu primer gasto en Treevüt para empezar tu senda.',
        icon: '🎉',
        type: ChallengeType.REGISTER_EXPENSES,
        frequency: ChallengeFrequency.ONCE,
        goal: 1,
        rewardBellotas: 10,
    },
    {
        id: 'onboarding_2',
        title: 'Explorador de Gastos',
        description: 'Registra 5 gastos de cualquier tipo.',
        icon: '🧭',
        type: ChallengeType.REGISTER_EXPENSES,
        frequency: ChallengeFrequency.ONCE,
        goal: 5,
        rewardBellotas: 20,
    },
    {
        id: 'onboarding_3',
        title: 'Define tu Meta',
        description: 'Establece tu primer presupuesto mensual.',
        icon: '🎯',
        type: ChallengeType.SET_BUDGET,
        frequency: ChallengeFrequency.ONCE,
        goal: 1, // Se refiere a 1 presupuesto establecido
        rewardBellotas: 50,
    },

    // --- Desafíos Semanales ---
    {
        id: 'weekly_1',
        title: 'Semana Activa',
        description: 'Registra al menos 10 gastos esta semana.',
        icon: '🏃‍♂️',
        type: ChallengeType.REGISTER_EXPENSES,
        frequency: ChallengeFrequency.WEEKLY,
        goal: 10,
        rewardBellotas: 30,
    },
    {
        id: 'weekly_2',
        title: 'Gourmet de la Semana',
        description: 'Registra 5 gastos en la categoría Alimentación.',
        icon: '🍔',
        type: ChallengeType.REGISTER_IN_CATEGORY,
        frequency: ChallengeFrequency.WEEKLY,
        goal: 5,
        rewardBellotas: 25,
        categoryGoal: CategoriaGasto.Alimentacion,
    },
    {
        id: 'weekly_3',
        title: 'Impulso a la Formalidad',
        description: 'Alcanza un 75% de formalidad en tus gastos de la semana.',
        icon: '📈',
        type: ChallengeType.REACH_FORMALITY_INDEX,
        frequency: ChallengeFrequency.WEEKLY,
        goal: 75,
        rewardBellotas: 75,
    },

    // --- Desafíos Mensuales ---
    {
        id: 'monthly_1',
        title: 'Maratón de Registros',
        description: 'Registra 50 gastos este mes.',
        icon: ' marathon',
        type: ChallengeType.REGISTER_EXPENSES,
        frequency: ChallengeFrequency.MONTHLY,
        goal: 50,
        rewardBellotas: 150,
    },
    {
        id: 'monthly_2',
        title: 'Héroe de la Formalidad',
        description: 'Mantén un índice de formalidad superior al 85% durante el mes.',
        icon: '🦸',
        type: ChallengeType.REACH_FORMALITY_INDEX,
        frequency: ChallengeFrequency.MONTHLY,
        goal: 85,
        rewardBellotas: 200,
    },
];

// Lógica para gestionar y verificar desafíos (placeholder)
// En una implementación real, esto interactuaría con el estado del usuario y los gastos.

/**
 * Obtiene los desafíos activos para un usuario, filtrando los que ya ha completado (si son 'once').
 * @param completedChallengeIds - Array de IDs de desafíos ya completados por el usuario.
 * @returns - Una lista de desafíos disponibles.
 */
export const getAvailableChallenges = (completedChallengeIds: string[]): Challenge[] => {
    return allChallenges.filter(challenge => {
        if (challenge.frequency === ChallengeFrequency.ONCE) {
            return !completedChallengeIds.includes(challenge.id);
        }
        // Lógica para desafíos recurrentes (diarios, semanales, mensuales)
        // Por ahora, los mostramos siempre.
        return true;
    });
};
