import { Expense, CategoriaGasto } from '../types';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'achievement' | 'mastery' | 'exploration' | 'social';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Catálogo completo de badges disponibles
export const allBadges: Badge[] = [
    // --- Badges de Logros (Achievement) ---
    {
        id: 'badge_first_expense',
        name: 'Primer Paso',
        description: 'Registraste tu primer gasto en Treevüt',
        icon: '🎯',
        category: 'achievement',
        rarity: 'common',
    },
    {
        id: 'badge_100_expenses',
        name: 'Centenario',
        description: 'Registraste 100 gastos',
        icon: '💯',
        category: 'achievement',
        rarity: 'rare',
    },
    {
        id: 'badge_500_expenses',
        name: 'Maestro del Registro',
        description: 'Registraste 500 gastos',
        icon: '🏆',
        category: 'achievement',
        rarity: 'epic',
    },
    {
        id: 'badge_1000_expenses',
        name: 'Leyenda Financiera',
        description: 'Registraste 1000 gastos',
        icon: '👑',
        category: 'achievement',
        rarity: 'legendary',
    },

    // --- Badges de Maestría (Mastery) ---
    {
        id: 'badge_formality_90',
        name: 'Héroe de la Formalidad',
        description: 'Alcanzaste 90% de índice de formalidad',
        icon: '🦸',
        category: 'mastery',
        rarity: 'rare',
    },
    {
        id: 'badge_formality_95',
        name: 'Campeón de la Formalidad',
        description: 'Alcanzaste 95% de índice de formalidad',
        icon: '🏅',
        category: 'mastery',
        rarity: 'epic',
    },
    {
        id: 'badge_formality_100',
        name: 'Perfección Absoluta',
        description: '100% de formalidad en todos tus gastos',
        icon: '💎',
        category: 'mastery',
        rarity: 'legendary',
    },
    {
        id: 'badge_streak_30',
        name: 'Mes de Oro',
        description: 'Mantuviste una racha de 30 días',
        icon: '🔥',
        category: 'mastery',
        rarity: 'rare',
    },
    {
        id: 'badge_streak_90',
        name: 'Trimestre Legendario',
        description: 'Mantuviste una racha de 90 días',
        icon: '⚡',
        category: 'mastery',
        rarity: 'epic',
    },
    {
        id: 'badge_streak_365',
        name: 'Año de Maestría',
        description: 'Mantuviste una racha de 365 días',
        icon: '🌟',
        category: 'mastery',
        rarity: 'legendary',
    },

    // --- Badges de Exploración (Exploration) ---
    {
        id: 'badge_all_categories',
        name: 'Explorador de Categorías',
        description: 'Registraste gastos en todas las categorías',
        icon: '🧭',
        category: 'exploration',
        rarity: 'rare',
    },
    {
        id: 'badge_10_companies',
        name: 'Gurú del RUC',
        description: 'Registraste gastos de 10 empresas diferentes',
        icon: '🏢',
        category: 'exploration',
        rarity: 'common',
    },
    {
        id: 'badge_budget_master',
        name: 'Maestro del Presupuesto',
        description: 'Mantuviste tu presupuesto por 3 meses consecutivos',
        icon: '💰',
        category: 'exploration',
        rarity: 'rare',
    },

    // --- Badges Sociales (Social) ---
    {
        id: 'badge_leaderboard_top10',
        name: 'Top 10',
        description: 'Alcanzaste el Top 10 en el leaderboard',
        icon: '🥉',
        category: 'social',
        rarity: 'rare',
    },
    {
        id: 'badge_leaderboard_top3',
        name: 'Podio',
        description: 'Alcanzaste el Top 3 en el leaderboard',
        icon: '🥈',
        category: 'social',
        rarity: 'epic',
    },
    {
        id: 'badge_leaderboard_1',
        name: 'Número Uno',
        description: 'Alcanzaste el #1 en el leaderboard',
        icon: '🥇',
        category: 'social',
        rarity: 'legendary',
    },
];

/**
 * Verifica qué badges debe desbloquear el usuario basándose en su actividad
 */
export const checkBadgesToUnlock = (
    expenses: Expense[],
    formalityIndex: number,
    currentStreak: number,
    longestStreak: number,
    unlockedBadges: string[]
): Badge[] => {
    const newBadges: Badge[] = [];

    // Badge: Primer gasto
    if (expenses.length >= 1 && !unlockedBadges.includes('badge_first_expense')) {
        newBadges.push(allBadges.find(b => b.id === 'badge_first_expense')!);
    }

    // Badge: 100 gastos
    if (expenses.length >= 100 && !unlockedBadges.includes('badge_100_expenses')) {
        newBadges.push(allBadges.find(b => b.id === 'badge_100_expenses')!);
    }

    // Badge: 500 gastos
    if (expenses.length >= 500 && !unlockedBadges.includes('badge_500_expenses')) {
        newBadges.push(allBadges.find(b => b.id === 'badge_500_expenses')!);
    }

    // Badge: 1000 gastos
    if (expenses.length >= 1000 && !unlockedBadges.includes('badge_1000_expenses')) {
        newBadges.push(allBadges.find(b => b.id === 'badge_1000_expenses')!);
    }

    // Badge: 90% formalidad
    if (formalityIndex >= 90 && !unlockedBadges.includes('badge_formality_90')) {
        newBadges.push(allBadges.find(b => b.id === 'badge_formality_90')!);
    }

    // Badge: 95% formalidad
    if (formalityIndex >= 95 && !unlockedBadges.includes('badge_formality_95')) {
        newBadges.push(allBadges.find(b => b.id === 'badge_formality_95')!);
    }

    // Badge: 100% formalidad
    if (formalityIndex === 100 && !unlockedBadges.includes('badge_formality_100')) {
        newBadges.push(allBadges.find(b => b.id === 'badge_formality_100')!);
    }

    // Badge: Racha de 30 días
    if (longestStreak >= 30 && !unlockedBadges.includes('badge_streak_30')) {
        newBadges.push(allBadges.find(b => b.id === 'badge_streak_30')!);
    }

    // Badge: Racha de 90 días
    if (longestStreak >= 90 && !unlockedBadges.includes('badge_streak_90')) {
        newBadges.push(allBadges.find(b => b.id === 'badge_streak_90')!);
    }

    // Badge: Racha de 365 días
    if (longestStreak >= 365 && !unlockedBadges.includes('badge_streak_365')) {
        newBadges.push(allBadges.find(b => b.id === 'badge_streak_365')!);
    }

    // Badge: Todas las categorías
    const uniqueCategories = new Set(expenses.map(e => e.categoria));
    const allCategories = Object.values(CategoriaGasto);
    if (uniqueCategories.size === allCategories.length && !unlockedBadges.includes('badge_all_categories')) {
        newBadges.push(allBadges.find(b => b.id === 'badge_all_categories')!);
    }

    // Badge: 10 empresas diferentes
    const uniqueCompanies = new Set(expenses.map(e => e.ruc));
    if (uniqueCompanies.size >= 10 && !unlockedBadges.includes('badge_10_companies')) {
        newBadges.push(allBadges.find(b => b.id === 'badge_10_companies')!);
    }

    return newBadges;
};

/**
 * Obtiene el color asociado a la rareza del badge
 */
export const getRarityColor = (rarity: Badge['rarity']): string => {
    switch (rarity) {
        case 'common':
            return 'bg-gray-500';
        case 'rare':
            return 'bg-blue-500';
        case 'epic':
            return 'bg-purple-500';
        case 'legendary':
            return 'bg-yellow-500';
    }
};

/**
 * Obtiene el nombre traducido de la rareza
 */
export const getRarityName = (rarity: Badge['rarity']): string => {
    switch (rarity) {
        case 'common':
            return 'Común';
        case 'rare':
            return 'Raro';
        case 'epic':
            return 'Épico';
        case 'legendary':
            return 'Legendario';
    }
};
