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
    name: string;
    email: string;
    picture: string;
    documentId?: string;
    level: TreevutLevel;
    progress: {
        expensesCount: number;
        formalityIndex: number; // Based on amount
    };
    isProfileComplete: boolean;
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