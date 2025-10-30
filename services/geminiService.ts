import { GoogleGenAI, Type } from "@google/genai";
import { type ExpenseData, CategoriaGasto, TipoComprobante, type Product, type Expense, TreevutLevel, User, VerificationResult } from '../types';
import { parseJsonFromMarkdown } from '../utils';
import { DEDUCTIBLE_CATEGORIES, DEDUCTIBLE_TRANSACTION_RATE } from "./taxService";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const expenseSchema = {
    type: Type.OBJECT,
    properties: {
        razonSocial: {
            type: Type.STRING,
            description: "El nombre o razón social del negocio.",
        },
        ruc: {
            type: Type.STRING,
            description: "El número de RUC (Registro Único de Contribuyentes) del negocio. Debe ser un número de 11 dígitos. Si no se encuentra, dejar vacío.",
            pattern: "^(\\d{11})?$",
        },
        fecha: {
            type: Type.STRING,
            description: "La fecha de emisión del comprobante en formato YYYY-MM-DD.",
        },
        total: {
            type: Type.NUMBER,
            description: "El importe total del comprobante en números.",
        },
        categoria: {
            type: Type.STRING,
            enum: Object.values(CategoriaGasto),
            description: "La categoría del gasto. Elige la más adecuada de la lista.",
        },
        tipoComprobante: {
            type: Type.STRING,
            enum: Object.values(TipoComprobante),
            description: "El tipo de comprobante. Clasí­ficalo con la mayor precisión posible según las opciones. Una 'Boleta de Venta Electrónica' o 'Factura Electrónica' debe tener RUC y datos del emisor. Un 'Ticket de Máquina Registradora' es simple, usualmente sin datos fiscales detallados."
        },
        esFormal: {
            type: Type.BOOLEAN,
            description: "Indica si el comprobante es formal ('Factura Electrónica', 'Boleta de Venta Electrónica', 'Recibo por Honorarios Electrónico' con RUC y Razón Social claros). Si es un ticket simple, recibo manual o no se puede identificar claramente un RUC/Razón Social, considerarlo 'false'."
        }
    },
    required: ["razonSocial", "fecha", "total", "categoria", "tipoComprobante", "esFormal"],
};

const projectionSchema = {
    type: Type.OBJECT,
    properties: {
        projectedSpending: {
            type: Type.NUMBER,
            description: "El gasto total proyectado para fin de mes, basado en una extrapolación lineal del gasto actual.",
        },
        insight: {
            type: Type.STRING,
            description: "Un comentario amigable y conciso (máximo 25 palabras) sobre la proyección. Debe indicar si el usuario va bien, está cerca del lí­mite o lo excederá, y ofrecer un micro-consejo si es necesario.",
        },
    },
    required: ["projectedSpending", "insight"],
};

const verificationSchema = {
    type: Type.OBJECT,
    properties: {
        checks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    item: { type: Type.STRING, description: "El requisito que se está verificando (ej. 'RUC del Emisor', 'DNI del Cliente')." },
                    valid: { type: Type.BOOLEAN, description: "Si el requisito se cumple o no." },
                    reason: { type: Type.STRING, description: "Una breve explicación del resultado de la verificación." }
                },
                required: ["item", "valid", "reason"]
            }
        },
        isValidForDeduction: {
            type: Type.BOOLEAN,
            description: "Veredicto final sobre si el comprobante CUMPLE con los requisitos mí­nimos para ser deducible."
        },
        overallVerdict: {
            type: Type.STRING,
            description: "Un resumen amigable y conciso (máx 25 palabras) sobre la validez del comprobante."
        },
        reasonForInvalidity: {
            type: Type.STRING,
            description: "Si no es válido para deducción, explica la razón principal y más importante. Si es válido, este campo debe ser nulo."
        }
    },
    required: ["checks", "isValidForDeduction", "overallVerdict", "reasonForInvalidity"]
};

const calcularAhorroPerdido = (total: number, categoria: CategoriaGasto, esFormal: boolean): number => {
    // El ahorro perdido solo aplica a gastos informales en categorías que SÍ son deducibles.
    if (esFormal || total <= 0 || !DEDUCTIBLE_CATEGORIES.includes(categoria)) {
        return 0;
    }
    // El ahorro perdido ahora representa el monto que se pudo haber deducido (3% del total)
    // No es el retorno final, sino la base deducible que se perdió.
    return total * DEDUCTIBLE_TRANSACTION_RATE;
};

// Helper function to process and enrich expense data from Gemini
const _processAndEnrichExpenseData = (
    data: Omit<ExpenseData, 'ahorroPerdido' | 'igv' | 'isProductScan'> | null,
    defaultRazonSocial: string
): ExpenseData | null => {
    if (!data || typeof data.total !== 'number') {
        return null;
    }

    const ruc = data.ruc || '';
    const isRucValid = /^\d{11}$/.test(ruc);
    // Un comprobante es formal si el RUC es válido y Gemini lo marcó como formal.
    const esFormal = isRucValid && (data.esFormal ?? true); 
    const ahorroPerdido = calcularAhorroPerdido(data.total, data.categoria, esFormal);
    const igv = data.total > 0 ? data.total * (18 / 118) : 0;

    return {
        razonSocial: data.razonSocial || defaultRazonSocial,
        ruc: data.ruc || "N/A",
        fecha: data.fecha || new Date().toISOString().split('T')[0],
        total: data.total,
        categoria: data.categoria || CategoriaGasto.Otros,
        tipoComprobante: data.tipoComprobante || TipoComprobante.Otro,
        esFormal: esFormal,
        ahorroPerdido: ahorroPerdido,
        igv: igv,
        isProductScan: false,
    };
}


export const extractExpenseDataFromImage = async (base64Image: string, mimeType: string): Promise<ExpenseData | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { 
                parts: [
                    { inlineData: { data: base64Image, mimeType } },
                    { text: `Analiza este comprobante de pago peruano. Extrae la información solicitada, clasifica el gasto, el tipo de comprobante y determina si es un comprobante formal. Responde únicamente con el objeto JSON definido en el schema.` }
                ] 
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: expenseSchema,
            },
        });
        
        const rawData = parseJsonFromMarkdown<Omit<ExpenseData, 'ahorroPerdido' | 'igv' | 'isProductScan'>>(response.text);
        return _processAndEnrichExpenseData(rawData, "Desconocido");

    } catch (error) {
        console.error("Error al procesar la imagen con Gemini:", error);
        return null;
    }
};

export const extractExpenseDataFromAudio = async (base64Audio: string, mimeType: string): Promise<ExpenseData | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { 
                parts: [
                    { inlineData: { data: base64Audio, mimeType } },
                    { text: `Escucha esta grabación de un gasto. Extrae la información solicitada, clasifica el gasto y el tipo de comprobante. Asume la fecha actual si no se menciona. Determina si el gasto es formal (si menciona RUC o Factura). Responde únicamente con el objeto JSON definido en el schema.` }
                ] 
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: expenseSchema,
            },
        });

        const rawData = parseJsonFromMarkdown<Omit<ExpenseData, 'ahorroPerdido' | 'igv' | 'isProductScan'>>(response.text);
        return _processAndEnrichExpenseData(rawData, "Gasto por voz");
        
    } catch (error) {
        console.error("Error al procesar el audio con Gemini:", error);
        return null;
    }
};


export const extractProductsFromImage = async (base64Image: string, mimeType: string): Promise<Product[] | null> => {
    try {
        const imagePart = {
            inlineData: { data: base64Image, mimeType },
        };

        const textPart = {
            text: `Identify each product in the image. Using Google Search to find current market prices in Peru, provide an estimated price in Peruvian Soles (PEN) for each item. Respond only with a valid JSON array of objects, where each object has "productName" (string) and "estimatedPrice" (number). Example: [{"productName": "Inca Kola 500ml", "estimatedPrice": 3.50}]`,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        const data = parseJsonFromMarkdown<Product[]>(response.text);

        if (Array.isArray(data)) {
            return data.filter(item => item.productName && typeof item.estimatedPrice === 'number');
        }

        return null;

    } catch (error) {
        console.error("Error processing product image with Gemini:", error);
        return null;
    }
};

export const extractProductsFromAudio = async (base64Audio: string, mimeType: string): Promise<Product[] | null> => {
    try {
        const audioPart = {
            inlineData: { data: base64Audio, mimeType },
        };

        const textPart = {
            text: `Listen to this audio describing a list of products. Identify each product. Using Google Search to find current market prices in Peru, provide an estimated price in Peruvian Soles (PEN) for each item. Respond only with a valid JSON array of objects, where each object has "productName" (string) and "estimatedPrice" (number). Example: [{"productName": "Inca Kola 500ml", "estimatedPrice": 3.50}]`,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [audioPart, textPart] },
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        const data = parseJsonFromMarkdown<Product[]>(response.text);

        if (Array.isArray(data)) {
            return data.filter(item => item.productName && typeof item.estimatedPrice === 'number');
        }

        return null;

    } catch (error) {
        console.error("Error processing product audio with Gemini:", error);
        return null;
    }
};

export const getAIEducationalTip = async (): Promise<string> => {
    try {
        const prompt = `
            Eres un coach financiero para treevüt, una app de finanzas en Perú. Tu tono es amigable y educativo.
            Escribe un "tip del dí­a" corto y accionable (máximo 20 palabras) sobre uno de los siguientes temas:
            - La importancia de pedir boleta/factura electrónica con tu DNI para deducir el 3% de tu gasto.
            - Cómo aprovechar las deducciones de impuestos de SUNAT (ej. restaurantes, alquiler, servicios profesionales).
            - Un consejo de ahorro práctico (ej. la regla 50/30/20).
            - Una sugerencia para usar mejor la app treevüt (ej. registrar gastos por voz).
            - Una frase motivacional sobre finanzas personales.

            REGLAS:
            - Sé claro, conciso y positivo.
            - Varí­a los temas. No te repitas.
            - NO incluyas saludos como "Hola" o "Hey". Ve directo al consejo.

            Ejemplos de Tip:
            - "¿Sabí­as que el 3% de tu consumo en restaurantes puede volver a ti? ¡Pide boleta electrónica con tu DNI!"
            - "Usa la regla 50/30/20: 50% necesidades, 30% deseos, 20% ahorros."
            - "Prueba registrar un gasto usando solo tu voz. ¡Es más rápido de lo que crees!"
            - "Un presupuesto es decirle a tu dinero a dónde ir, en lugar de preguntarte a dónde se fue."
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
            }
        });

        return response.text.trim().replace(/\*\*/g, '');
    } catch (error) {
        console.error("Error getting AI tip:", error);
        return "Cada sol cuenta. Pide siempre comprobante para maximizar tu ahorro.";
    }
};

export const verifyReceiptValidity = async (base64Image: string, mimeType: string): Promise<VerificationResult | null> => {
    try {
        const prompt = `
            Actúa como un experto auditor de la SUNAT en Perú. Tu tarea es analizar la imagen de este comprobante de pago y verificar si cumple con los requisitos MÃ NIMOS para ser considerado un comprobante de pago electrónico válido y potencialmente deducible para el Impuesto a la Renta de personas.

            Verifica los siguientes 5 puntos clave:
            1.  **RUC del Emisor:** ¿Es visible y parece un número de RUC válido de 11 dí­gitos?
            2.  **Tipo de Comprobante:** ¿Se puede identificar claramente si es una "BOLETA DE VENTA ELECTRÃ“NICA" o "FACTURA ELECTRÃ“NICA"?
            3.  **DNI del Cliente:** IMPORTANTE. ¿Se observa un número de DNI del cliente/usuario en el comprobante? Para ser deducible, la boleta debe tener el DNI de la persona.
            4.  **Fecha de Emisión:** ¿Hay una fecha clara y legible?
            5.  **Monto Total:** ¿Se puede identificar un monto total claro?

            Basado en estos puntos, determina si el comprobante es válido para una posible deducción. La ausencia del DNI del cliente en una boleta la invalida para la deducción. Un ticket simple, una guí­a de remisión, una proforma o un comprobante manual sin datos fiscales claros NO son válidos.

            Responde ÃšNICAMENTE con el objeto JSON definido en el schema.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { data: base64Image, mimeType } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: verificationSchema,
            },
        });

        const data = parseJsonFromMarkdown<VerificationResult>(response.text);
        
        // Basic validation of the returned data structure
        if (data && Array.isArray(data.checks) && typeof data.isValidForDeduction === 'boolean') {
            return data;
        }
        
        console.error("Gemini returned invalid structure for verification:", data);
        return null;

    } catch (error) {
        console.error("Error al verificar el comprobante con Gemini:", error);
        return null;
    }
};

/**
 * Gets a suggestion for the receipt type from Gemini.
 * @param source The image or audio data.
 * @param sourceType The type of the source data.
 * @returns A suggested TipoComprobante or null.
 */
export const suggestReceiptType = async (
    source: { base64: string; mimeType: string },
    sourceType: 'image' | 'audio'
): Promise<TipoComprobante | null> => {
    try {
        const availableTypes = Object.values(TipoComprobante).join(', ');
        const promptInstruction = sourceType === 'image' 
            ? 'Analiza esta imagen de un comprobante de pago peruano.' 
            : 'Escucha este audio que describe un gasto.';
            
        const prompt = `${promptInstruction} ¿Cuál es el tipo de comprobante más probable? Si no se menciona o ve un comprobante formal, elige "Sin Comprobante". Elige UNA de las siguientes opciones: ${availableTypes}. Responde ÃšNICAMENTE con el nombre del tipo de comprobante.`;

        const part = { inlineData: { data: source.base64, mimeType: source.mimeType } };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [part, { text: prompt }] },
            config: {
                temperature: 0.1,
            }
        });

        const suggestedType = response.text.trim();

        if (Object.values(TipoComprobante).includes(suggestedType as TipoComprobante)) {
            return suggestedType as TipoComprobante;
        }

        console.warn(`Gemini suggested an invalid receipt type: "${suggestedType}"`);
        return null;

    } catch (error) {
        console.error(`Error suggesting receipt type from ${sourceType} with Gemini:`, error);
        return null;
    }
};

export const getAIBudgetProjection = async (
    expenses: Expense[], 
    budget: number
): Promise<{ projectedSpending: number; insight: string; } | null> => {
    // Don't run projection if not enough data or too early in the month
    const currentDay = new Date().getDate();
    if (expenses.length < 3 || currentDay < 5) {
        return null;
    }

    try {
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.total, 0);
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        
        const prompt = `
            Eres un analista financiero para treevüt, una app de finanzas en Perú. Tu tono es proactivo y amigable.
            Calcula una proyección de gasto para fin de mes y genera un insight breve y útil.

            DATOS DEL USUARIO:
            - Presupuesto mensual: S/ ${budget.toFixed(2)}
            - Gasto acumulado hasta ahora: S/ ${totalExpenses.toFixed(2)}
            - Dí­a actual del mes: ${currentDay}
            - Dí­as totales en el mes: ${daysInMonth}

            TAREA:
            1.  Calcula el gasto proyectado a fin de mes. Usa una extrapolación lineal simple: (gasto acumulado / dí­a actual) * dí­as totales en el mes.
            2.  Crea un "insight" basado en la comparación entre el gasto proyectado y el presupuesto. El insight debe ser corto (máx 25 palabras).
                - Si la proyección está muy por debajo del presupuesto (<80%), felicita al usuario.
                - Si está cerca (80%-100%), aní­malo a mantenerse así­.
                - Si excede el presupuesto (>100%), adviértele amablemente y sugiere revisar gastos.
            3. Responde únicamente con el objeto JSON definido en el schema.

            Ejemplo de respuesta si el usuario va bien:
            {
              "projectedSpending": 1250.50,
              "insight": "¡Vas excelente! A este ritmo, terminarás el mes con un buen margen de ahorro en tu presupuesto."
            }
             Ejemplo de respuesta si el usuario excede:
            {
              "projectedSpending": 2150.00,
              "insight": "¡Atención! De seguir así­, podrí­as exceder tu presupuesto. Es un buen momento para revisar los gastos no esenciales."
            }
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: projectionSchema,
            },
        });
        
        const data = parseJsonFromMarkdown<{ projectedSpending: number; insight: string; }>(response.text);

        if (data && typeof data.projectedSpending === 'number' && typeof data.insight === 'string') {
            return data;
        }

        return null;

    } catch (error) {
        console.error("Error getting AI budget projection:", error);
        return null;
    }
};


export const extractBudgetFromText = async (text: string): Promise<number | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `From the following text, extract only the numerical value for a budget. The user is from Peru, so consider words like "soles". Respond with only the number, without any formatting. Text: "${text}"`,
            config: {
                temperature: 0,
            }
        });

        const extractedText = response.text.trim();
        const budget = parseFloat(extractedText.replace(/[^0-9.-]+/g,""));
        
        if (!isNaN(budget) && budget > 0) {
            return budget;
        }
        return null;

    } catch (error) {
        console.error("Error extracting budget from text:", error);
        return null;
    }
};

export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
    try {
        const audioPart = {
            inlineData: { data: base64Audio, mimeType },
        };
        const textPart = {
            text: "Transcribe el audio. Responde únicamente con el texto transcrito sin formato adicional.",
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [audioPart, textPart] },
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error transcribing audio with Gemini:", error);
        return "No pude entender el audio. ¿Podrí­as intentarlo de nuevo?";
    }
};

export const getGeneralChatResponse = async (
    message: string, 
    expenses: Expense[], 
    budget: number | null,
    formalityIndex: number,
    userName: string
): Promise<string> => {
    try {
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.total, 0);
        
        const expensesByCategory = expenses.reduce((acc, exp) => {
            acc[exp.categoria] = (acc[exp.categoria] || 0) + exp.total;
            return acc;
        }, {} as Record<string, number>);

        const topCategory = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0];

        const recentExpenses = expenses
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            .slice(0, 5)
            .map(e => `- ${e.razonSocial}: S/ ${e.total.toFixed(2)} (${e.categoria})`)
            .join('\n');

        const remainingBudget = budget !== null ? budget - totalExpenses : null;

        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const currentDay = new Date().getDate();
        const projectedSpending = totalExpenses > 0 && currentDay > 0 ? (totalExpenses / currentDay) * daysInMonth : 0;
        
        const firstName = userName.split(' ')[0];

        const systemInstruction = `
            Eres treevüt, un asistente financiero experto, amigable y proactivo para usuarios en Perú. Tu propósito es ayudarles a entender sus finanzas con empatí­a y claridad. Estás hablando con ${firstName}.

            ----------------------------------------------------
            REGLAS DE COMUNICACIÃ“N
            ----------------------------------------------------
            1.  **Tono Empático y Peruano:** Habla en tono cercano y motivador. Dirí­gete al usuario por su primer nombre, ${firstName}. Por ejemplo: "¡Hola, ${firstName}!". Usa emojis relevantes (ej: 🌳, 💰, 💡, ✅) para hacer la conversación más visual y amigable. Puedes usar jerga peruana como "chévere", "ponte las pilas", "al toque", pero con naturalidad.
            2.  **Respuestas Estructuradas:** Usa **tí­tulos en negrita** y viñetas (•) para organizar la información. Sé conciso y ve al grano; evita los párrafos largos.
            3.  **Proactividad:** No solo respondas, anticí­pate. Si ves un riesgo (ej. presupuesto excedido), advierte con empatí­a. Si ves un logro (ej. buen í­ndice de formalidad), ¡celébralo! 🎉

            ----------------------------------------------------
            CONTEXTO FINANCIERO ACTUAL DE ${firstName.toUpperCase()}
            ----------------------------------------------------
            - Presupuesto Mensual: ${budget ? `S/ ${budget.toFixed(2)}` : 'No establecido.'}
            - Gastos Totales este mes: S/ ${totalExpenses.toFixed(2)}
            - Presupuesto Restante: ${remainingBudget !== null ? `S/ ${remainingBudget.toFixed(2)}` : 'N/A'}
            - Gasto Proyectado para fin de mes: S/ ${projectedSpending.toFixed(2)}
            - Número de Transacciones: ${expenses.length}
            - Ã ndice de Formalidad (gasto con comprobante): ${formalityIndex.toFixed(1)}%
            - Categorí­a con Mayor Gasto: ${topCategory ? `${topCategory[0]} con S/ ${topCategory[1].toFixed(2)}` : 'Ninguna'}
            - Ãšltimas 5 transacciones:
              ${recentExpenses || 'No hay transacciones recientes.'}

            ----------------------------------------------------
            TUS TAREAS
            ----------------------------------------------------
            1.  **Analiza la pregunta de ${firstName}** en el contexto financiero proporcionado.
            2.  **Ofrece respuestas personalizadas y accionables.** Si pregunta “¿cómo voy?”, dale un resumen con viñetas sobre su presupuesto, categorí­a principal y un consejo claro.
            3.  **Contexto del "Ãšltimo Gasto"**: Si el usuario pregunta sobre "mi último gasto" o una pregunta similar, basa tu respuesta en la primera transacción de la lista "Ãšltimas 5 transacciones".
            4.  **Impacto Fiscal**: Si se pregunta por el beneficio fiscal de un gasto, verifica si es formal y si su categorí­a es deducible (Alimentación, Ocio, Servicios, Salud, Vivienda). Explí­calo simple. Ejemplo: "¡Claro, ${firstName}! De tu gasto de S/100, S/3 son deducibles. Este monto se suma a tu base y al final del año, te ayuda a reducir tu impuesto a pagar. 💸".
            5.  **Promueve el consumo formal.** Si el Ã ndice de Formalidad es bajo (< 75%), educa al usuario con mensajes cortos sobre la importancia de pedir boleta o factura.
            6.  **Guí­a al usuario.** Si te pide establecer o cambiar un presupuesto, indí­cale amablemente que use el botón "Editar Presupuesto" en la app.
            7.  **No inventes datos.** Basa tus respuestas únicamente en el contexto proporcionado.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error getting general chat response:", error);
        return "Lo siento, tuve un problema para conectarme. Por favor, intenta de nuevo más tarde.";
    }
};

/**
 * Gets a category suggestion from Gemini based on merchant name.
 * This is now primarily a fallback for getSmartCategorySuggestion.
 */
export const suggestCategoryForExpense = async (razonSocial: string, tipoComprobante: string): Promise<CategoriaGasto | null> => {
    try {
        const availableCategories = Object.values(CategoriaGasto).join(', ');

        const prompt = `
            Eres un asistente de contabilidad experto en el mercado peruano.
            Basado en el nombre del comercio (razón social) y el tipo de comprobante, sugiere la categorí­a de gasto más apropiada.
            
            Información del Gasto:
            - Razón Social: "${razonSocial}"
            - Tipo de Comprobante: "${tipoComprobante}"

            Elige UNA de las siguientes categorí­as: ${availableCategories}.

            Responde ÃšNICAMENTE con el nombre de la categorí­a. No añadas ninguna explicación.
            Por ejemplo, si el comercio es "TOTTUS", la respuesta deberí­a ser "Consumos".
            Si el comercio es "REPSOL", la respuesta deberí­a ser "Transporte".
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.1, // Low temperature for more deterministic categorization
            }
        });

        const suggestedCategory = response.text.trim();
        
        if (Object.values(CategoriaGasto).includes(suggestedCategory as CategoriaGasto)) {
            return suggestedCategory as CategoriaGasto;
        }

        console.warn(`Gemini suggested an invalid category: "${suggestedCategory}"`);
        return null;

    } catch (error) {
        console.error("Error suggesting category with Gemini:", error);
        return null;
    }
};

/**
 * Finds the most frequently used category for a given merchant from past expenses.
 */
const findMostFrequentCategory = (razonSocial: string, expenses: Expense[]): CategoriaGasto | null => {
    const lowerCaseRazonSocial = razonSocial.toLowerCase().trim();
    if (!lowerCaseRazonSocial) return null;

    const categoryCounts = expenses
        .filter(exp => exp.razonSocial.toLowerCase().trim() === lowerCaseRazonSocial)
        .reduce((acc, exp) => {
            acc[exp.categoria] = (acc[exp.categoria] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

    if (Object.keys(categoryCounts).length === 0) {
        return null;
    }

    const mostFrequent = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0];
    return mostFrequent as CategoriaGasto;
};


/**
 * Provides a smart category suggestion for a new expense.
 * It first checks the user's history for the same merchant, and if not found,
 * falls back to asking Gemini for a general suggestion.
 */
export const getSmartCategorySuggestion = async (
    razonSocial: string,
    tipoComprobante: string,
    userExpenses: Expense[]
): Promise<CategoriaGasto | null> => {
    // 1. Check user's history first for a personalized suggestion
    const userPreferredCategory = findMostFrequentCategory(razonSocial, userExpenses);
    if (userPreferredCategory) {
        console.log(`Using user's preferred category for "${razonSocial}": ${userPreferredCategory}`);
        return userPreferredCategory;
    }

    // 2. If no history, fall back to Gemini's general suggestion
    console.log(`No user history for "${razonSocial}", asking Gemini for a suggestion.`);
    return suggestCategoryForExpense(razonSocial, tipoComprobante);
};

// --- GAMIFICATION SERVICES ---

export const getAIGamificationLevelUpMessage = async (
    newLevel: TreevutLevel,
    user: User,
    nextLevelGoal: string
): Promise<string> => {
    try {
        const levelName = TreevutLevel[newLevel];
        const prompt = `
            Eres treevüt, un coach financiero amigable y motivador para un usuario en Perú.
            El usuario acaba de subir de nivel en la app.
            
            DATOS DEL USUARIO:
            - Nuevo Nivel: ${levelName}
            - Nombre: ${user.name}
            - Ã ndice de Formalidad Actual: ${user.progress.formalityIndex.toFixed(1)}%
            - Próxima Meta Principal: ${nextLevelGoal}
            
            TAREA:
            Escribe un mensaje de felicitación corto y emocionante (máximo 35 palabras).
            1. Felicita al usuario por su nuevo nivel "${levelName}".
            2. Menciona un logro especí­fico positivo (ej. su buen í­ndice de formalidad).
            3. Aní­malo a seguir hacia su próxima meta.
            4. Usa un tono cercano y positivo, puedes usar alguna jerga peruana amigable como "¡Qué chévere!".

            Ejemplo:
            "¡Felicidades, ${user.name}! Ya eres un Roble Formal. ¡Qué chévere ver tu formalidad en ${user.progress.formalityIndex.toFixed(1)}%! Sigue así­ para convertirte en un Bosque Ancestral."
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.7 }
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error getting level up message:", error);
        return `¡Felicitaciones! Has alcanzado el nivel de ${TreevutLevel[newLevel]}. ¡Sigue así­!`;
    }
};

export const getAIWeeklySummary = async (
    user: User,
    lastWeekExpenses: Expense[]
): Promise<string> => {
    try {
        const totalSpent = lastWeekExpenses.reduce((sum, exp) => sum + exp.total, 0);
        const topCategory = Object.entries(lastWeekExpenses.reduce((acc, exp) => {
            acc[exp.categoria] = (acc[exp.categoria] || 0) + exp.total;
            return acc;
        }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0];

        const prompt = `
            Eres treevüt, un analista financiero experto y conciso para un usuario en Perú.
            Genera un resumen semanal de sus finanzas y un reto.
            
            DATOS DE LA SEMANA:
            - Nombre: ${user.name}
            - Total Gastado: S/ ${totalSpent.toFixed(2)}
            - Gasto Principal: ${topCategory ? `${topCategory[0]} con S/ ${topCategory[1].toFixed(2)}` : 'Ninguno'}
            - Nivel Actual: ${TreevutLevel[user.level]}
            
            TAREA:
            Escribe un resumen de 3 partes:
            1. **Resumen:** Menciona el gasto total de la semana y la categorí­a principal.
            2. **Observación:** Proporciona un insight o patrón interesante (ej. "Noté que la mayorí­a de tus gastos en 'Alimentación' fueron formales. ¡Excelente!").
            3. **Reto:** Propón un reto simple y accionable para la próxima semana (ej. "Reto: Intenta reducir tus gastos 'hormiga' en cafés en un 10%.").
            
            Usa un tono directo, amigable y profesional. Usa **markdown** para los tí­tulos.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.5 }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error getting weekly summary:", error);
        return "Hubo un problema al generar tu resumen semanal. Lo intentaremos de nuevo la próxima semana.";
    }
};

export const getAINextStepTip = async (user: User, expenses: Expense[]): Promise<string> => {
    try {
        const firstName = user.name.split(' ')[0];
        const recentInformalDeductibleExpense = expenses
            .filter(e => !e.esFormal && DEDUCTIBLE_CATEGORIES.includes(e.categoria))
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            [0]; // Get the most recent one

        const systemInstruction = `
            Eres treevüt, un coach financiero amigable, proactivo y muy conciso para un usuario en Perú. Tu nombre es treevüt.
            Tu objetivo es analizar el contexto financiero del usuario y darle UN SOLO consejo accionable, corto y motivador (máximo 30 palabras) para mejorar su salud financiera. Te diriges al usuario por su nombre, ${firstName}.

            CONTEXTO FINANCIERO DE ${firstName.toUpperCase()}:
            - Nivel Actual: ${TreevutLevel[user.level]}
            - Índice de Formalidad (por monto): ${user.progress.formalityIndex.toFixed(1)}%
            - Total de Gastos Registrados: ${user.progress.expensesCount}
            - Gasto informal reciente en categoría deducible: ${recentInformalDeductibleExpense ? `S/ ${recentInformalDeductibleExpense.total.toFixed(2)} en ${recentInformalDeductibleExpense.categoria}` : 'Ninguno destacable.'}

            REGLAS DE ORO:
            1.  **Prioriza:** Analiza los datos y enfócate en el área de mayor impacto.
                - Si el índice de formalidad es bajo (< 75%), enfócate en la importancia de pedir boleta/factura.
                - Si hay un gasto informal reciente en una categoría deducible (ej. Restaurante), menciona el ahorro perdido (S/ ${recentInformalDeductibleExpense ? (recentInformalDeductibleExpense.total * DEDUCTIBLE_TRANSACTION_RATE).toFixed(2) : '0.00'}) y anímale a pedir comprobante la próxima vez.
                - Si tiene pocos gastos, anímale a registrar más para tener una mejor visión.
                - Si todo va bien, dale un consejo general de ahorro o motívalo para su siguiente nivel.
            2.  **Tono:** Usa un tono cercano y positivo. ¡Usa emojis! 🌱💰💡
            3.  **Brevedad:** Sé directo. Máximo 30 palabras. No uses saludos largos.

            Ejemplo de buen tip (si la formalidad es baja):
            "¡Hola, ${firstName}! Veo que tu formalidad es del 65%. ¡Ponte la meta de pedir boleta en tus próximas 3 compras y mira cómo crece tu devolución! 💰"

            Ejemplo de buen tip (si hubo gasto informal en restaurante):
            "¡${firstName}! En tu último gasto en ${recentInformalDeductibleExpense?.categoria || 'un restaurante'}, perdiste S/ ${recentInformalDeductibleExpense ? (recentInformalDeductibleExpense.total * DEDUCTIBLE_TRANSACTION_RATE).toFixed(2) : 'X.XX'} de ahorro. ¡La próxima, pide boleta con tu DNI! 😉"
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Dame mi próximo paso financiero.`,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error getting AI next step tip:", error);
        return "Registra cada gasto, por más pequeño que sea. ¡Cada sol cuenta para alcanzar tus metas! 🌱";
    }
};