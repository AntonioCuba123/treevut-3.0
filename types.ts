export interface Expense {
    id: string;
    razonSocial: string;
    ruc: string;
    fecha: string;
    total: number;
    categoria: CategoriaGasto;
    tipoComprobante: TipoComprobante;
    imageUrl?: string;
    esFormal: boolean;
    ahorroPerdido: number;
    igv: number;
    isProductScan?: boolean;
}

export enum TreevutLevel {
    Brote = 1,
    Plantón = 2,
    Arbusto = 3,
    Roble = 4,
    Bosque = 5,
}

export interface User {
    id: string; // ID único del usuario
    name: string;
    email: string;
    picture: string;
    documentId?: string;
    level: TreevutLevel;
    bellotas: number; // Nueva moneda virtual
    progress: {
        expensesCount: number;
        formalityIndex: number; // Based on amount
    };
    completedChallenges: string[]; // IDs de desafíos completados
    isProfileComplete: boolean;
    purchasedGoods: string[]; // IDs de bienes virtuales comprados
}

// --- Nuevos Tipos para Gamificación: Desafíos y Misiones ---

export enum ChallengeType {
    REGISTER_EXPENSES = 'register_expenses',
    REACH_FORMALITY_INDEX = 'reach_formality_index',
    SET_BUDGET = 'set_budget',
    REGISTER_IN_CATEGORY = 'register_in_category',
}

export enum ChallengeFrequency {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    ONCE = 'once', // Para desafíos únicos
}

export enum ChallengeStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CLAIMED = 'claimed', // Recompensa reclamada
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    icon: string; // Emoji o nombre de ícono
    type: ChallengeType;
    frequency: ChallengeFrequency;
    goal: number; // Valor a alcanzar (e.g., 5 gastos, 80% de formalidad)
    rewardBellotas: number;
    categoryGoal?: CategoriaGasto; // Opcional, para desafíos de categoría
}

export interface VirtualGood {
    id: string;
    name: string;
    description: string;
    icon: string;
    price: number;
}

export interface LeaderboardEntry {
    userId: string;
    userName: string;
    userPicture: string;
    score: number; // Podría ser el índice de formalidad, bellotas ganadas, etc.
    rank: number;
}

export interface UserChallenge {
    challengeId: string;
    status: ChallengeStatus;
    currentProgress: number;
    startDate: string; // ISO Date
    endDate?: string; // ISO Date, para desafíos con tiempo límite
}

export type ExpenseData = Omit<Expense, 'id' | 'imageUrl'>;

export interface Product {
  productName: string;
  estimatedPrice: number;
}


export enum CategoriaGasto {
    Alimentacion = 'Alimentación',
    Vivienda = 'Vivienda',
    Transporte = 'Transporte',
    Salud = 'Salud',
    Ocio = 'Ocio',
    Educacion = 'Educación',
    Consumos = 'Consumos',
    Servicios = 'Servicios',
    Otros = 'Otros',
}

export enum TipoComprobante {
    FacturaElectronica = 'Factura Electrónica',
    BoletaVentaElectronica = 'Boleta de Venta Electrónica',
    ReciboHonorariosElectronico = 'Recibo por Honorarios Electrónico',
    ReciboArrendamiento = 'Recibo por Arrendamiento',
    BoletoTransporte = 'Boleto de Transporte',
    ReciboServiciosPublicos = 'Recibo de Servicios Públicos',
    TicketPOS = 'Ticket POS',
    TicketMaquinaRegistradora = 'Ticket de Máquina Registradora',
    Otro = 'Otro Comprobante',
    SinComprobante = 'Sin Comprobante',
}

export interface VerificationCheck {
    item: string;
    valid: boolean;
    reason: string;
}

export interface VerificationResult {
    checks: VerificationCheck[];
    isValidForDeduction: boolean;
    overallVerdict: string;
    reasonForInvalidity: string | null;
}

// Types for AddExpenseModal useReducer
export type ModalStep = 
    | 'capture' 
    | 'confirm_image' 
    | 'verifying_sunat'
    | 'verification_result'
    | 'analyzing' 
    | 'recording_audio'
    | 'analyzing_audio'
    | 'review' 
    | 'editing' 
    | 'review_products'

export interface ModalState {
    step: ModalStep;
    image: { url: string; base64: string; mimeType: string } | null;
    audio: { base64: string; mimeType: string } | null;
    expenseData: ExpenseData | null;
    verificationResult: VerificationResult | null;
    products: (Product & { id: string })[];
    error: string | null;
    isRecording: boolean;
}

export type ModalAction =
    | { type: 'SET_STEP'; payload: ModalStep }
    | { type: 'SET_IMAGE'; payload: { url: string; base64: string; mimeType: string } | null }
    | { type: 'SET_AUDIO'; payload: { base64: string; mimeType: string } | null }
    | { type: 'SET_EXPENSE_DATA'; payload: ExpenseData | null }
    | { type: 'SET_VERIFICATION_RESULT'; payload: VerificationResult | null }
    | { type: 'UPDATE_EXPENSE_DATA'; payload: Partial<ExpenseData> }
    | { type: 'SET_PRODUCTS'; payload: (Product & { id: string })[] }
    | { type: 'UPDATE_PRODUCT'; payload: { id: string; field: 'productName' | 'estimatedPrice'; value: string | number } }
    | { type: 'ADD_PRODUCT' }
    | { type: 'REMOVE_PRODUCT'; payload: string }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_IS_RECORDING'; payload: boolean }
    | { type: 'RESET' }