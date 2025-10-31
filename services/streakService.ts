/**
 * Servicio para gestionar rachas de formalidad
 * Una racha se mantiene cuando el usuario registra al menos un gasto formal cada día
 */

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastFormalExpenseDate: string | null;
}

// Hitos de racha con sus recompensas
export const STREAK_MILESTONES = [
    { days: 7, reward: 100, name: 'Semana Perfecta' },
    { days: 14, reward: 250, name: 'Dos Semanas Imparables' },
    { days: 30, reward: 500, name: 'Mes de Oro' },
    { days: 60, reward: 1000, name: 'Campeón de Dos Meses' },
    { days: 90, reward: 2000, name: 'Trimestre Legendario' },
    { days: 180, reward: 5000, name: 'Medio Año de Excelencia' },
    { days: 365, reward: 10000, name: 'Año de Maestría' },
];

/**
 * Verifica si dos fechas son consecutivas (diferencia de 1 día)
 */
const areDatesConsecutive = (date1: Date, date2: Date): boolean => {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
};

/**
 * Verifica si dos fechas son del mismo día
 */
const areSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

/**
 * Calcula la racha actual basándose en la última fecha de gasto formal
 */
export const calculateStreak = (lastFormalExpenseDate: string | null): number => {
    if (!lastFormalExpenseDate) return 0;

    const lastDate = new Date(lastFormalExpenseDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    // Si la última fecha es hoy o ayer, la racha continúa
    if (areSameDay(lastDate, today) || areDatesConsecutive(lastDate, today)) {
        return 1; // La racha base es 1, se incrementará con el historial
    }

    // Si han pasado más de 1 día, la racha se rompió
    return 0;
};

/**
 * Actualiza la racha cuando se registra un nuevo gasto formal
 */
export const updateStreakOnFormalExpense = (
    currentStreakData: StreakData,
    newExpenseDate: string
): { streakData: StreakData; milestoneReached: { days: number; reward: number; name: string } | null } => {
    const newDate = new Date(newExpenseDate);
    newDate.setHours(0, 0, 0, 0);

    const lastDate = currentStreakData.lastFormalExpenseDate 
        ? new Date(currentStreakData.lastFormalExpenseDate)
        : null;

    if (lastDate) {
        lastDate.setHours(0, 0, 0, 0);
    }

    let newStreak = currentStreakData.currentStreak;
    let milestoneReached = null;

    // Si no hay fecha previa, iniciar racha en 1
    if (!lastDate) {
        newStreak = 1;
    }
    // Si es el mismo día, mantener la racha
    else if (areSameDay(lastDate, newDate)) {
        newStreak = currentStreakData.currentStreak;
    }
    // Si es el día siguiente, incrementar la racha
    else if (areDatesConsecutive(lastDate, newDate)) {
        newStreak = currentStreakData.currentStreak + 1;

        // Verificar si se alcanzó un hito
        const milestone = STREAK_MILESTONES.find(m => m.days === newStreak);
        if (milestone) {
            milestoneReached = milestone;
        }
    }
    // Si han pasado más de 1 día, reiniciar la racha
    else {
        newStreak = 1;
    }

    const newLongestStreak = Math.max(newStreak, currentStreakData.longestStreak);

    return {
        streakData: {
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastFormalExpenseDate: newExpenseDate,
        },
        milestoneReached,
    };
};

/**
 * Verifica si la racha se rompió (útil para notificaciones diarias)
 */
export const checkIfStreakBroken = (lastFormalExpenseDate: string | null): boolean => {
    if (!lastFormalExpenseDate) return false;

    const lastDate = new Date(lastFormalExpenseDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Si han pasado más de 1 día, la racha se rompió
    return diffDays > 1;
};

/**
 * Obtiene el siguiente hito de racha
 */
export const getNextMilestone = (currentStreak: number): { days: number; reward: number; name: string } | null => {
    return STREAK_MILESTONES.find(m => m.days > currentStreak) || null;
};
