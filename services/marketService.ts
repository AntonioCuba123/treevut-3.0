import { VirtualGood } from '../types';

// Base de datos de todos los bienes virtuales disponibles en la aplicación
export const allVirtualGoods: VirtualGood[] = [
    // --- Mejoras para el Árbol ---
    {
        id: 'vg_pot_clay',
        name: 'Maceta de Arcilla',
        description: 'Una maceta clásica y robusta para tu árbol Treevüt.',
        icon: '🏺',
        price: 100,
    },
    {
        id: 'vg_pot_gold',
        name: 'Maceta de Oro',
        description: 'Una maceta de lujo para mostrar tu maestría financiera.',
        icon: '🏆',
        price: 1000,
    },
    {
        id: 'vg_leaves_autumn',
        name: 'Hojas de Otoño',
        description: 'Decora tu árbol con cálidos colores otoñales.',
        icon: '🍂',
        price: 250,
    },
    {
        id: 'vg_bird_nest',
        name: 'Nido de Pájaro',
        description: 'Un hogar para un amiguito emplumado en tu árbol.',
        icon: '🐦',
        price: 500,
    },

    // --- Informes Premium ---
    {
        id: 'vg_report_annual',
        name: 'Informe Anual Avanzado',
        description: 'Un análisis detallado de tus finanzas del último año.',
        icon: '📊',
        price: 750,
    },
    {
        id: 'vg_report_category',
        name: 'Análisis Profundo por Categoría',
        description: 'Desglose exhaustivo de tus gastos en una categoría específica.',
        icon: '📈',
        price: 400,
    },
];
