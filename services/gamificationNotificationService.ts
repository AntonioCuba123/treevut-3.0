import { Challenge } from '../types';

/**
 * Servicio de notificaciones para eventos de gamificación
 */

// Verificar si el navegador soporta notificaciones
export const isNotificationSupported = (): boolean => {
    return 'Notification' in window && 'serviceWorker' in navigator;
};

// Solicitar permiso para mostrar notificaciones
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!isNotificationSupported()) {
        console.warn('Notifications are not supported in this browser');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
};

// Verificar si tenemos permiso para notificaciones
export const hasNotificationPermission = (): boolean => {
    return isNotificationSupported() && Notification.permission === 'granted';
};

/**
 * Envía una notificación cuando el usuario completa un desafío
 */
export const sendChallengeCompletedNotification = (challenge: Challenge): void => {
    if (!hasNotificationPermission()) return;

    const title = '🎉 ¡Desafío Completado!';
    const body = `Has completado "${challenge.title}". Reclama tus ${challenge.rewardBellotas} bellotas.`;
    const icon = '/treevut-icon.png';
    const badge = '/treevut-badge.png';

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        // Usar Service Worker para notificaciones persistentes
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, {
                body,
                icon,
                badge,
                tag: `challenge-${challenge.id}`,
                requireInteraction: true,
                data: {
                    type: 'challenge_completed',
                    challengeId: challenge.id,
                },
                actions: [
                    {
                        action: 'claim',
                        title: 'Reclamar Recompensa',
                    },
                    {
                        action: 'dismiss',
                        title: 'Cerrar',
                    },
                ],
            });
        });
    } else {
        // Fallback a notificación básica
        new Notification(title, {
            body,
            icon,
            badge,
            tag: `challenge-${challenge.id}`,
        });
    }
};

/**
 * Envía una notificación recordando desafíos próximos a expirar
 */
export const sendChallengeExpiringNotification = (challenge: Challenge, hoursRemaining: number): void => {
    if (!hasNotificationPermission()) return;

    const title = '⏰ Desafío Por Expirar';
    const body = `"${challenge.title}" expira en ${hoursRemaining} horas. ¡No pierdas tus ${challenge.rewardBellotas} bellotas!`;
    const icon = '/treevut-icon.png';

    new Notification(title, {
        body,
        icon,
        tag: `challenge-expiring-${challenge.id}`,
    });
};

/**
 * Envía una notificación cuando el usuario sube en el leaderboard
 */
export const sendLeaderboardRankUpNotification = (newRank: number, oldRank: number): void => {
    if (!hasNotificationPermission()) return;

    const title = '🏆 ¡Subiste en el Ranking!';
    const body = `Has pasado del puesto #${oldRank} al #${newRank} en el Bosque Comunitario.`;
    const icon = '/treevut-icon.png';

    new Notification(title, {
        body,
        icon,
        tag: 'leaderboard-rank-up',
    });
};

/**
 * Envía una notificación cuando el usuario pierde su racha
 */
export const sendStreakLostNotification = (streakDays: number): void => {
    if (!hasNotificationPermission()) return;

    const title = '😢 Racha Perdida';
    const body = `Has perdido tu racha de ${streakDays} días. ¡Registra un gasto formal hoy para empezar una nueva!`;
    const icon = '/treevut-icon.png';

    new Notification(title, {
        body,
        icon,
        tag: 'streak-lost',
    });
};

/**
 * Envía una notificación cuando el usuario alcanza un hito de racha
 */
export const sendStreakMilestoneNotification = (streakDays: number, rewardBellotas: number): void => {
    if (!hasNotificationPermission()) return;

    const title = '🔥 ¡Hito de Racha Alcanzado!';
    const body = `¡${streakDays} días consecutivos! Has ganado ${rewardBellotas} bellotas de bonificación.`;
    const icon = '/treevut-icon.png';

    new Notification(title, {
        body,
        icon,
        tag: `streak-milestone-${streakDays}`,
    });
};

/**
 * Envía una notificación cuando el usuario desbloquea un nuevo badge
 */
export const sendBadgeUnlockedNotification = (badgeName: string, badgeIcon: string): void => {
    if (!hasNotificationPermission()) return;

    const title = '🏅 ¡Nuevo Badge Desbloqueado!';
    const body = `Has obtenido el badge "${badgeName}" ${badgeIcon}`;
    const icon = '/treevut-icon.png';

    new Notification(title, {
        body,
        icon,
        tag: `badge-unlocked-${badgeName}`,
    });
};

/**
 * Envía una notificación diaria motivacional
 */
export const sendDailyMotivationalNotification = (): void => {
    if (!hasNotificationPermission()) return;

    const messages = [
        '¡Buenos días! Registra tus gastos de hoy y mantén tu racha.',
        '¿Ya revisaste tus desafíos de hoy? ¡Hay bellotas esperándote!',
        'Un pequeño paso cada día te acerca a tus metas financieras.',
        '¡El Bosque Comunitario te espera! Compite con otros ahorradores.',
        'Recuerda: cada gasto formal te acerca a tu libertad financiera.',
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const title = '🌳 Treevüt';
    const body = randomMessage;
    const icon = '/treevut-icon.png';

    new Notification(title, {
        body,
        icon,
        tag: 'daily-motivational',
    });
};

/**
 * Programa notificaciones diarias
 */
export const scheduleDailyNotifications = (): void => {
    if (!hasNotificationPermission()) return;

    // Programar notificación para las 9:00 AM cada día
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(9, 0, 0, 0);

    // Si ya pasaron las 9 AM hoy, programar para mañana
    if (now > scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
        sendDailyMotivationalNotification();
        // Reprogramar para el día siguiente
        scheduleDailyNotifications();
    }, timeUntilNotification);
};
