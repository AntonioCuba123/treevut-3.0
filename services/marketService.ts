import { VirtualGood } from '../types';

// Base de datos de todos los bienes virtuales disponibles en la aplicación
export const allVirtualGoods: VirtualGood[] = [
    // --- Categoría: Mejoras para el Árbol ---
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

    {
        id: 'vg_leaves_spring',
        name: 'Hojas de Primavera',
        description: 'Hojas verdes vibrantes que simbolizan crecimiento y renovación.',
        icon: '🌿',
        price: 200,
    },
    {
        id: 'vg_flowers',
        name: 'Flores de Cerezo',
        description: 'Hermosas flores rosadas para decorar tu árbol.',
        icon: '🌸',
        price: 300,
    },
    {
        id: 'vg_fruits',
        name: 'Frutos Dorados',
        description: 'Frutos brillantes que representan tu éxito financiero.',
        icon: '🍎',
        price: 400,
    },
    {
        id: 'vg_butterfly',
        name: 'Mariposa Visitante',
        description: 'Una hermosa mariposa que revolotea alrededor de tu árbol.',
        icon: '🦋',
        price: 350,
    },
    {
        id: 'vg_owl',
        name: 'Búho Sabio',
        description: 'Un búho que simboliza sabiduría financiera.',
        icon: '🦉',
        price: 600,
    },

    // --- Categoría: Informes Premium ---
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

    // --- Categoría: Temas Visuales ---
    {
        id: 'vg_theme_dark',
        name: 'Tema Oscuro Premium',
        description: 'Interfaz elegante con colores oscuros y acentos dorados.',
        icon: '🌙',
        price: 800,
    },
    {
        id: 'vg_theme_forest',
        name: 'Tema Bosque Encantado',
        description: 'Colores naturales inspirados en un bosque mágico.',
        icon: '🌲',
        price: 800,
    },
    {
        id: 'vg_theme_ocean',
        name: 'Tema Océano Profundo',
        description: 'Tonos azules relajantes inspirados en el mar.',
        icon: '🌊',
        price: 800,
    },

    // --- Categoría: Funciones Premium ---
    {
        id: 'vg_export_excel',
        name: 'Exportación a Excel',
        description: 'Exporta todos tus gastos a un archivo Excel detallado.',
        icon: '📊',
        price: 500,
    },
    {
        id: 'vg_ai_advisor',
        name: 'Asesor IA Premium (7 días)',
        description: 'Acceso ilimitado al asistente de IA por una semana.',
        icon: '🤖',
        price: 1200,
    },
    {
        id: 'vg_custom_categories',
        name: 'Categorías Personalizadas',
        description: 'Crea tus propias categorías de gastos.',
        icon: '🏷️',
        price: 600,
    },

    // --- Categoría: Descuentos Reales ---
    {
        id: 'vg_discount_food',
        name: 'Cupón 10% Restaurantes',
        description: 'Descuento del 10% en restaurantes asociados.',
        icon: '🍽️',
        price: 300,
    },
    {
        id: 'vg_discount_transport',
        name: 'Cupón 15% Transporte',
        description: 'Descuento del 15% en apps de transporte.',
        icon: '🚗',
        price: 400,
    },
    {
        id: 'vg_discount_shopping',
        name: 'Cupón 20% Compras',
        description: 'Descuento del 20% en tiendas online seleccionadas.',
        icon: '🛍️',
        price: 500,
    },
];
