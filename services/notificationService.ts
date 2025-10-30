import { type Expense } from '../types';

// Ícono genérico de billetes para las notificaciones
const TREEBU_ICON_DATA_URI = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%2322C55E'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z' /%3E%3C/svg%3E";


/**
 * Solicita permiso al usuario para mostrar notificaciones.
 * Solo se lo pide si el permiso no ha sido ya concedido o denegado.
 */
export const requestNotificationPermission = async (): Promise<void> => {
    if (!('Notification' in window)) {
        console.warn('Este navegador no soporta notificaciones de escritorio.');
        return;
    }

    if (Notification.permission === 'default') {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Permiso para notificaciones concedido.');
            } else {
                console.log('Permiso para notificaciones denegado.');
            }
        } catch (error) {
            console.error('Error al solicitar permiso para notificaciones:', error);
        }
    }
};


/**
 * Envía una notificación push al usuario sobre un crédito fiscal potencial perdido.
 * @param {Expense} expense - El gasto informal que se acaba de añadir.
 */
export const sendInformalExpenseNotification = (expense: Expense): void => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    const title = '¡Alerta de Ahorro Perdido!';
    const options: NotificationOptions = {
        body: `Gasto informal de S/ ${expense.total.toFixed(2)}. Perdiste S/ ${expense.ahorroPerdido.toFixed(2)} en beneficios fiscales. ¡La próxima vez pide boleta o factura!`,
        icon: TREEBU_ICON_DATA_URI,
        badge: TREEBU_ICON_DATA_URI, // Para Android
        tag: `treevut-expense-${expense.id}`, // Evita notificaciones duplicadas
    };

    // Usar el Service Worker si está disponible para notificaciones más robustas,
    // de lo contrario, recurrir a una notificación simple.
    navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
            registration.showNotification(title, options);
        } else {
            new Notification(title, options);
        }
    }).catch(err => {
        console.error("Service Worker no encontrado, usando notificación simple.", err);
        new Notification(title, options);
    });
};