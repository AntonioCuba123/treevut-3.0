import React, { useRef, useCallback, useEffect, useReducer, useState, useMemo } from 'react';
import { type Expense, CategoriaGasto, TipoComprobante, Product, ModalState, ModalAction, VerificationResult } from '../types';
import { 
    extractExpenseDataFromImage, 
    extractProductsFromImage,
    extractExpenseDataFromAudio,
    extractProductsFromAudio,
    getSmartCategorySuggestion,
    suggestReceiptType,
    verifyReceiptValidity
} from '../services/geminiService';
import { generateUniqueId, compressImage, fileToDataUrl } from '../utils';
import { 
    CameraIcon, CheckIcon, XMarkIcon, DocumentArrowUpIcon, PDFIcon, 
    PencilIcon, PlusIcon, TrashIcon, ExclamationTriangleIcon, 
    MicrophoneIcon, StopIcon, ArrowPathIcon, SparklesIcon, ShieldCheckIcon, CubeIcon, ReceiptPercentIcon 
} from './Icons';
import Spinner from './Spinner';
import { useData } from '../contexts/DataContext';

interface AddExpenseModalProps {
    onClose: () => void;
    initialAction: 'camera' | 'file' | null;
    scanMode: 'receipt' | 'products' | 'verify' | null;
    expenseToEdit?: Expense | null;
}

interface ModalDialogProps {
    id: string;
    title: string;
    description: string;
    children: React.ReactNode;
}

const audioToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
            resolve((reader.result as string).split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

const initialState: ModalState = {
    step: 'capture',
    image: null,
    audio: null,
    expenseData: null,
    verificationResult: null,
    products: [],
    error: null,
    isRecording: false,
};

function modalReducer(state: ModalState, action: ModalAction): ModalState {
    switch (action.type) {
        case 'SET_STEP':
            return { ...state, step: action.payload };
        case 'SET_IMAGE':
            return { ...state, image: action.payload };
        case 'SET_AUDIO':
            return { ...state, audio: action.payload };
        case 'SET_EXPENSE_DATA':
            return { ...state, expenseData: action.payload };
        case 'SET_VERIFICATION_RESULT':
            return { ...state, verificationResult: action.payload };
        case 'UPDATE_EXPENSE_DATA': {
            const updatedData = { ...state.expenseData!, ...action.payload };
            
            // If total is being updated...
            if (action.payload.total !== undefined && state.expenseData) {
                const newTotal = action.payload.total;
                const calculatedIgv = newTotal > 0 ? newTotal * (18 / 118) : 0;
                
                updatedData.igv = calculatedIgv;

                // Recalculate potential credit based on formality status
                if (updatedData.esFormal) {
                    updatedData.ahorroPerdido = 0;
                } else {
                    updatedData.ahorroPerdido = calculatedIgv;
                }
            }
            return { ...state, expenseData: updatedData };
        }
        case 'SET_PRODUCTS':
            return { ...state, products: action.payload };
        case 'UPDATE_PRODUCT':
            return {
                ...state,
                products: state.products.map(p =>
                    p.id === action.payload.id ? { ...p, [action.payload.field]: action.payload.value } : p
                ),
            };
        case 'ADD_PRODUCT':
            return {
                ...state,
                products: [...state.products, { id: generateUniqueId(), productName: '', estimatedPrice: 0 }],
            };
        case 'REMOVE_PRODUCT':
            return { ...state, products: state.products.filter(p => p.id !== action.payload) };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_IS_RECORDING':
            return { ...state, isRecording: action.payload };
        case 'RESET':
            return { ...initialState, step: 'capture' };
        default:
            return state;
    }
}

const defaultExpenseData: Omit<Expense, 'id' | 'imageUrl'> = {
    razonSocial: '', 
    ruc: '', 
    fecha: new Date().toISOString().split('T')[0], 
    total: 0, 
    categoria: CategoriaGasto.Consumos,
    tipoComprobante: TipoComprobante.Otro,
    esFormal: true,
    ahorroPerdido: 0,
    igv: 0,
    isProductScan: false,
};

const inputClasses = "mt-1 block w-full bg-background border border-active-surface rounded-xl p-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary";
const smallInputClasses = "w-full bg-background border border-active-surface rounded-md shadow-sm p-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary";

// Helper sub-component for displaying verification results
const VerificationDisplay = ({ result }: { result: VerificationResult }) => {
    const { isValidForDeduction, checks, overallVerdict, reasonForInvalidity } = result;
    return (
        <>
            <div className={`rounded-2xl p-4 flex items-start space-x-3 ${isValidForDeduction ? 'bg-primary/10' : 'bg-yellow-400/10'}`}>
                {isValidForDeduction ?
                    <ShieldCheckIcon className="w-8 h-8 text-primary flex-shrink-0" /> :
                    <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                }
                <div>
                    <h3 className={`font-bold ${isValidForDeduction ? 'text-primary' : 'text-yellow-300'}`}>
                        {isValidForDeduction ? "Verificación Exitosa" : "Posible Inconsistencia"}
                    </h3>
                    <p className={`text-sm ${isValidForDeduction ? 'text-on-surface' : 'text-yellow-300/90'}`}>{overallVerdict}</p>
                </div>
            </div>

            <div className="space-y-2">
                {checks.map(check => (
                    <div key={check.item} className="flex items-center text-sm p-2 bg-background rounded-lg">
                        {check.valid ?
                            <CheckIcon className="w-5 h-5 text-primary mr-3 flex-shrink-0" /> :
                            <XMarkIcon className="w-5 h-5 text-danger mr-3 flex-shrink-0" />
                        }
                        <span className="font-semibold text-on-surface">{check.item}:</span>
                        <span className="ml-2 text-on-surface-secondary text-xs truncate">{check.reason}</span>
                    </div>
                ))}
            </div>

            {!isValidForDeduction && reasonForInvalidity &&
                <p className="text-left text-xs text-on-surface-secondary p-2 bg-background rounded-md">{reasonForInvalidity}</p>
            }
        </>
    );
};


const ModalDialog: React.FC<ModalDialogProps> = React.memo(({ id, title, description, children }) => (
    <div
        role="dialog"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70"
    >
        <div className="bg-surface w-full max-w-lg rounded-3xl shadow-xl animate-slide-in-up">
            <h2 id={`${id}-title`} className="sr-only">{title}</h2>
            <p id={`${id}-description`} className="sr-only">{description}</p>
            {children}
        </div>
    </div>
));

const AddExpenseModal: React.FC<AddExpenseModalProps> = React.memo(({ onClose, initialAction, scanMode, expenseToEdit }) => {
    const { addExpense, updateExpense, expenses } = useData();
    
    const getInitialState = useCallback((): ModalState => {
        if (expenseToEdit) {
            return {
                ...initialState,
                step: 'editing',
                expenseData: expenseToEdit,
                image: expenseToEdit.imageUrl ? { url: expenseToEdit.imageUrl, base64: '', mimeType: '' } : null,
            };
        }
        return initialState;
    }, [expenseToEdit]);
    
    const [state, dispatch] = useReducer(modalReducer, getInitialState());
    const { step, image, expenseData, products, error, isRecording, verificationResult } = state;

    // New state for category suggestion
    const [suggestedCategory, setSuggestedCategory] = useState<CategoriaGasto | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const productsContainerRef = useRef<HTMLDivElement>(null);
    const prevProductsLength = useRef(products.length);

    const modalTitle = useMemo(() => {
        if (expenseToEdit) return 'Editar Gasto';
        if (scanMode === 'receipt') return 'Registrar Comprobante';
        if (scanMode === 'products') return 'Escanear Productos';
        if (scanMode === 'verify') return 'Verificador de Comprobantes';
        return 'Nuevo Gasto';
    }, [expenseToEdit, scanMode]);

    useEffect(() => {
        if (expenseToEdit) return; // Don't trigger inputs if editing
        if (initialAction === 'camera') cameraInputRef.current?.click();
        else if (initialAction === 'file') fileInputRef.current?.click();
    }, [initialAction, expenseToEdit]);

    // New useEffect for category suggestion
    useEffect(() => {
        const suggestCategory = async () => {
            if (expenseToEdit) {
                setIsSuggesting(true);
                setSuggestedCategory(null);
                try {
                    const suggestion = await getSmartCategorySuggestion(
                        expenseToEdit.razonSocial,
                        expenseToEdit.tipoComprobante,
                        expenses
                    );
                    if (suggestion && suggestion !== expenseToEdit.categoria) {
                        setSuggestedCategory(suggestion);
                    }
                } catch (err) {
                    console.error("Error fetching category suggestion:", err);
                } finally {
                    setIsSuggesting(false);
                }
            }
        };

        if (step === 'editing' && expenseToEdit) {
            suggestCategory();
        } else {
            // Reset suggestion state if not editing or modal is closed/reset
            setSuggestedCategory(null);
            setIsSuggesting(false);
        }
    }, [step, expenseToEdit, expenses]);

    useEffect(() => {
        if (products.length > prevProductsLength.current) {
            if (productsContainerRef.current) {
                const inputs = productsContainerRef.current.querySelectorAll('input[type="text"]');
                if (inputs.length > 0) {
                    const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
                    lastInput.focus();
                    lastInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        }
        prevProductsLength.current = products.length;
    }, [products.length]);

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                let result: { base64: string; url: string; mimeType: string };
                if (file.type.startsWith('image/')) {
                    result = await compressImage(file);
                } else if (file.type === 'application/pdf') {
                    result = await fileToDataUrl(file);
                } else {
                    throw new Error('Unsupported file type');
                }
                dispatch({ type: 'SET_IMAGE', payload: { ...result } });
                dispatch({ type: 'SET_STEP', payload: 'confirm_image' });
            } catch (err) {
                console.error(err);
                const errorMessage = err instanceof Error && err.message === 'Unsupported file type'
                    ? 'Tipo de archivo no soportado. Por favor, sube una imagen o PDF.'
                    : 'Ocurrió un error al procesar el archivo.';
                dispatch({ type: 'SET_ERROR', payload: errorMessage });
                dispatch({ type: 'RESET' });
            }
        } else if (step === 'capture') {
            onClose();
        }
    }, [step, onClose]);

    const analyzeImage = useCallback(async (forceInformal = false) => {
        if (!image) return;
        dispatch({ type: 'SET_ERROR', payload: null });
        
        if (scanMode === 'receipt') {
            dispatch({ type: 'SET_STEP', payload: 'analyzing' });
            let data = await extractExpenseDataFromImage(image.base64, image.mimeType);
            if (data) {
                // If the type is unclear, ask for a specific suggestion.
                if (data.tipoComprobante === TipoComprobante.Otro) {
                    const suggestedType = await suggestReceiptType({ base64: image.base64, mimeType: image.mimeType }, 'image');
                    if (suggestedType) {
                        data.tipoComprobante = suggestedType;
                    }
                }

                const suggestedCategory = await getSmartCategorySuggestion(data.razonSocial, data.tipoComprobante, expenses);
                if (suggestedCategory) {
                    data.categoria = suggestedCategory;
                }
                
                if (forceInformal) {
                    data.esFormal = false;
                }

                dispatch({ type: 'SET_EXPENSE_DATA', payload: data });
                dispatch({ type: 'SET_STEP', payload: 'review' });
            } else {
                dispatch({ type: 'SET_ERROR', payload: 'No pude leer la imagen. Por favor, revisa los datos o ingrésalos manualmente.' });
                dispatch({ type: 'SET_EXPENSE_DATA', payload: defaultExpenseData });
                dispatch({ type: 'SET_STEP', payload: 'editing' });
            }
        } else if (scanMode === 'products') {
            dispatch({ type: 'SET_STEP', payload: 'analyzing' });
            const data = await extractProductsFromImage(image.base64, image.mimeType);
            if (data && data.length > 0) {
                dispatch({ type: 'SET_PRODUCTS', payload: data.map(p => ({ ...p, id: generateUniqueId() })) });
                dispatch({ type: 'SET_STEP', payload: 'review_products' });
            } else {
                 dispatch({ type: 'SET_PRODUCTS', payload: [] });
                 dispatch({ type: 'SET_ERROR', payload: 'No se detectaron productos. ¡Anímate a agregarlos manualmente!' });
                 dispatch({ type: 'SET_STEP', payload: 'review_products' });
            }
        }
    }, [image, scanMode, expenses]);

    const verifyImage = useCallback(async () => {
        if (!image) return;
        dispatch({ type: 'SET_ERROR', payload: null });
        dispatch({ type: 'SET_STEP', payload: 'verifying_sunat' });

        const result = await verifyReceiptValidity(image.base64, image.mimeType);

        if (result) {
            dispatch({ type: 'SET_VERIFICATION_RESULT', payload: result });
            dispatch({ type: 'SET_STEP', payload: 'verification_result' });
        } else {
            dispatch({ type: 'SET_ERROR', payload: 'No pude verificar el comprobante. Analizaremos los datos directamente.' });
            // Fallback to old behavior if verification fails
            await analyzeImage();
        }
    }, [image, analyzeImage]);
    
    const analyzeAudio = useCallback(async () => {
        if (!state.audio) return;
        dispatch({ type: 'SET_ERROR', payload: null });
        dispatch({ type: 'SET_STEP', payload: 'analyzing_audio' });

        if (scanMode === 'receipt') {
            let data = await extractExpenseDataFromAudio(state.audio.base64, state.audio.mimeType);
            if (data) {
                // If the type is unclear, ask for a specific suggestion.
                if (data.tipoComprobante === TipoComprobante.Otro) {
                    const suggestedType = await suggestReceiptType({ base64: state.audio.base64, mimeType: state.audio.mimeType }, 'audio');
                    if (suggestedType) {
                        data.tipoComprobante = suggestedType;
                    }
                }

                const suggestedCategory = await getSmartCategorySuggestion(data.razonSocial, data.tipoComprobante, expenses);
                if (suggestedCategory) {
                    data.categoria = suggestedCategory;
                }
                dispatch({ type: 'SET_EXPENSE_DATA', payload: data });
                dispatch({ type: 'SET_STEP', payload: 'review' });
            } else {
                dispatch({ type: 'SET_ERROR', payload: 'No pude entender el audio. Intenta ser más claro o ingresa los datos manualmente.' });
                dispatch({ type: 'SET_EXPENSE_DATA', payload: defaultExpenseData });
                dispatch({ type: 'SET_STEP', payload: 'editing' });
            }
        } else if (scanMode === 'products') {
            const data = await extractProductsFromAudio(state.audio.base64, state.audio.mimeType);
            if (data && data.length > 0) {
                dispatch({ type: 'SET_PRODUCTS', payload: data.map(p => ({ ...p, id: generateUniqueId() })) });
                dispatch({ type: 'SET_STEP', payload: 'review_products' });
            } else {
                dispatch({ type: 'SET_PRODUCTS', payload: [] });
                dispatch({ type: 'SET_ERROR', payload: 'No identifiqué productos en el audio. ¡Anímate a agregarlos manualmente!' });
                dispatch({ type: 'SET_STEP', payload: 'review_products' });
            }
        }
    }, [state.audio, scanMode, expenses]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const base64 = await audioToBase64(audioBlob);
                dispatch({ type: 'SET_AUDIO', payload: { base64, mimeType: audioBlob.type } });
                stream.getTracks().forEach(track => track.stop()); // Release microphone
            };
            mediaRecorderRef.current.start();
            dispatch({ type: 'SET_IS_RECORDING', payload: true });
        } catch (err) {
            console.error("Error accessing microphone:", err);
            dispatch({ type: 'SET_ERROR', payload: 'No se pudo acceder al micrófono.' });
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        dispatch({ type: 'SET_IS_RECORDING', payload: false });
    };

    useEffect(() => {
        if (!isRecording && state.audio) {
            analyzeAudio();
        }
    }, [isRecording, state.audio, analyzeAudio]);

    const handleSave = () => {
        if (expenseData && expenseData.razonSocial && expenseData.total > 0) {
            if (expenseToEdit) {
                updateExpense(expenseToEdit.id, expenseData);
            } else {
                addExpense({
                    ...expenseData,
                    imageUrl: image?.url,
                });
            }
            onClose();
        } else {
            dispatch({ type: 'SET_ERROR', payload: "Por favor, completa la descripción y el total." });
        }
    };
    
    const handleContinueFromProducts = () => {
        // Validate that all products have a positive price
        if (products.length > 0) {
            const invalidProduct = products.find(p => p.estimatedPrice <= 0);
            if (invalidProduct) {
                const productName = invalidProduct.productName ? `"${invalidProduct.productName}"` : "un producto";
                dispatch({ type: 'SET_ERROR', payload: `El precio de ${productName} debe ser mayor que cero.` });
                return; // Stop execution
            }
        }
        
        // If validation passes, clear any existing error
        dispatch({ type: 'SET_ERROR', payload: null });

        const total = products.reduce((sum, p) => sum + Number(p.estimatedPrice), 0);
        const igv = total > 0 ? total * (18 / 118) : 0;
        
        let description = 'Compra de productos';
        if (products.length === 1) {
            description = products[0].productName;
        } else if (products.length > 1) {
            description = products.map(p => p.productName).join(', ');
        }

        dispatch({ type: 'SET_EXPENSE_DATA', payload: {
            razonSocial: description,
            ruc: 'N/A',
            fecha: new Date().toISOString().split('T')[0],
            total: total,
            categoria: CategoriaGasto.Consumos,
            tipoComprobante: TipoComprobante.SinComprobante,
            esFormal: false,
            ahorroPerdido: igv, // For informal purchases, it's the same as IGV
            igv: igv,
            isProductScan: true,
        }});
        dispatch({ type: 'SET_STEP', payload: 'editing' });
    };

    const handleRetake = () => {
        const isFromCamera = initialAction === 'camera';
        const inputRef = isFromCamera ? cameraInputRef : fileInputRef;
        if (inputRef.current) {
            inputRef.current.value = ''; // Reset to allow re-capturing
            inputRef.current.click();
        }
    };
    
    const renderContent = () => {
        switch (step) {
            case 'capture': {
                let title = "Registrando Gasto";
                let subtitle = "Prepara tu comprobante...";
                let Icon = DocumentArrowUpIcon;

                if (scanMode === 'verify') {
                    title = "Verificador IA de Comprobantes";
                    subtitle = "Toma una foto a tu boleta o factura para analizar su validez con la IA de SUNAT.";
                    Icon = ShieldCheckIcon;
                } else if (scanMode === 'products') {
                    title = "Escanear Productos";
                    subtitle = "Abre la cámara para tomar una foto de tus productos.";
                    Icon = CubeIcon;
                } else if (scanMode === 'receipt') {
                    title = "Registrar Comprobante";
                    Icon = ReceiptPercentIcon;
                    if (initialAction === 'camera') {
                        subtitle = "Apunta con la cámara a tu boleta o factura.";
                    } else if (initialAction === 'file') {
                        subtitle = "Selecciona el archivo de tu comprobante.";
                    }
                }

                return (
                    <div className="flex flex-col items-center justify-center text-center p-6 min-h-[200px]">
                        <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                        <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} ref={cameraInputRef} className="hidden" />
                        
                        <div className="w-16 h-16 bg-active-surface rounded-full flex items-center justify-center mb-4">
                            <Icon className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-on-surface">{title}</h3>
                        <p className="mt-2 text-on-surface-secondary">{subtitle}</p>
                        <p className="text-xs text-on-surface-secondary mt-6">
                            Si el diálogo no aparece, 
                            <button onClick={() => initialAction === 'camera' ? cameraInputRef.current?.click() : fileInputRef.current?.click()} className="text-primary font-semibold ml-1 hover:underline">haz clic aquí</button>.
                        </p>
                    </div>
                );
            }
            case 'confirm_image': {
                const isFromCamera = initialAction === 'camera';
                const isImageFile = image?.mimeType.startsWith('image/');
                
                const confirmButtonText = isImageFile ? 'Usar esta foto' : 'Usar este archivo';
                const retryButtonText = isFromCamera ? 'Volver a tomar' : 'Elegir otro';
            
                return (
                    <div className="text-center">
                        {isImageFile ? (
                            <img src={image.url} alt="Vista previa del comprobante" className="max-h-64 w-auto mx-auto rounded-lg shadow-md" />
                        ) : (
                            <div className="bg-background p-6 rounded-lg flex flex-col items-center">
                                <PDFIcon className="w-16 h-16 text-red-500" />
                                <p className="mt-2 text-sm font-medium text-on-surface">Archivo PDF cargado</p>
                            </div>
                        )}
                         <div className="flex justify-center space-x-4 mt-6">
                            <button onClick={handleRetake} className="font-bold py-3 px-5 rounded-xl bg-active-surface text-on-surface hover:bg-active-surface/70 flex items-center transition-colors">
                                <ArrowPathIcon className="w-5 h-5 inline-block mr-2"/>
                                {retryButtonText}
                            </button>
                            <button onClick={['receipt', 'verify'].includes(scanMode ?? '') ? verifyImage : () => analyzeImage()} className="bg-primary text-primary-dark font-bold py-3 px-6 rounded-xl hover:opacity-90 flex items-center transition-opacity">
                                <CheckIcon className="w-5 h-5 inline-block mr-2"/>
                                {confirmButtonText}
                            </button>
                        </div>
                    </div>
                );
            }
            case 'verifying_sunat':
                return (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <Spinner />
                        <p className="mt-4 text-on-surface-secondary font-semibold">Validando comprobante...</p>
                        <p className="mt-1 text-sm text-on-surface-secondary">
                            Verificando requisitos mínimos con la IA de treevüt.
                        </p>
                    </div>
                );
            case 'verification_result':
                if (!verificationResult) return null;

                return (
                    <div className="space-y-4 animate-fade-in">
                        <VerificationDisplay result={verificationResult} />

                        {scanMode === 'verify' ? (
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                                <button onClick={handleRetake} className="px-4 py-2 text-sm font-bold text-on-surface bg-active-surface rounded-xl hover:bg-active-surface/70 transition-colors flex items-center justify-center"> <ArrowPathIcon className="w-4 h-4 mr-1.5"/> Verificar Otro </button>
                                <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-primary-dark bg-primary rounded-xl hover:opacity-90 flex items-center transition-opacity justify-center"> <CheckIcon className="w-4 h-4 mr-1.5"/> Finalizar </button>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-2">
                                <button onClick={handleRetake} className="px-4 py-2 text-sm font-bold text-on-surface bg-active-surface rounded-xl hover:bg-active-surface/70 transition-colors flex items-center justify-center"> <ArrowPathIcon className="w-4 h-4 mr-1.5"/> Reintentar </button>
                                {verificationResult.isValidForDeduction ?
                                    <button onClick={() => analyzeImage(false)} className="px-6 py-2 text-sm font-bold text-primary-dark bg-primary rounded-xl hover:opacity-90 flex items-center transition-opacity justify-center"> <CheckIcon className="w-4 h-4 mr-1.5"/> Continuar </button>
                                    :
                                    <button onClick={() => analyzeImage(true)} className="px-4 py-2 text-sm font-bold text-yellow-900 bg-yellow-400 rounded-xl hover:opacity-90 flex items-center transition-opacity justify-center"> <ExclamationTriangleIcon className="w-4 h-4 mr-1.5"/> Continuar de todos modos </button>
                                }
                            </div>
                        )}
                    </div>
                );
            case 'recording_audio':
                return (
                    <div className="text-center p-6 animate-fade-in flex flex-col items-center">
                        <h3 className="text-xl font-bold text-on-surface">{isRecording ? "Grabando..." : "Listo para Grabar"}</h3>
                        <p className="mt-2 text-on-surface-secondary">
                            {scanMode === 'receipt' ? 'Di el nombre del comercio, el total y la fecha.' : 'Menciona los productos que compraste.'}
                        </p>
                        <div className="my-8 w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                            <button onClick={isRecording ? stopRecording : startRecording} className={`w-20 h-20 rounded-full text-white flex items-center justify-center transition-colors ${isRecording ? 'bg-danger hover:bg-red-600 animate-pulse' : 'bg-primary'}`}>
                                {isRecording ? <StopIcon className="w-10 h-10 text-primary-dark"/> : <MicrophoneIcon className="w-10 h-10 text-primary-dark"/>}
                            </button>
                        </div>
                    </div>
                );
            case 'analyzing':
            case 'analyzing_audio': {
                 const analyzingSubtitle = scanMode === 'receipt'
                    ? 'Extrayendo datos y sugiriendo la mejor categoría para tu gasto.'
                    : 'Identificando productos y buscando sus precios estimados.';

                return (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <Spinner />
                        <p className="mt-4 text-on-surface-secondary font-semibold">Analizando con IA...</p>
                        <p className="mt-1 text-sm text-on-surface-secondary">
                           {analyzingSubtitle}
                        </p>
                        <p className="text-xs text-slate-500 mt-6">Powered by Gemini</p>
                    </div>
                );
            }
            case 'review':
                 return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-background rounded-2xl p-3">
                           <p className="font-semibold text-on-surface">¡Listo! Esto es lo que encontré:</p>
                           {expenseData && (
                               <div className="mt-2 text-sm border-l-2 border-primary/30 pl-3 space-y-1 text-on-surface-secondary">
                                   <p><strong>Comercio:</strong> {expenseData.razonSocial}</p>
                                   <p><strong>Total:</strong> S/ {expenseData.total.toFixed(2)}</p>
                                   <p><strong>Fecha:</strong> {expenseData.fecha}</p>
                                   <p><strong>Categoría:</strong> {expenseData.categoria}</p>
                                   <p><strong>Comprobante Formal:</strong> <span className={expenseData.esFormal ? 'text-primary' : 'text-yellow-400'}>{expenseData.esFormal ? 'Sí' : 'No'}</span></p>
                               </div>
                           )}
                           <p className="mt-3 text-sm font-semibold text-on-surface">¿Los datos son correctos?</p>
                        </div>
                         <div className="flex justify-end space-x-2">
                             <button onClick={() => dispatch({type: 'SET_STEP', payload: 'editing'})} className="px-4 py-2 text-sm font-bold text-on-surface bg-active-surface rounded-xl hover:bg-active-surface/70 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary flex items-center"> <PencilIcon className="w-4 h-4 mr-1.5"/> Corregir </button>
                             <button onClick={handleSave} className="px-6 py-2 text-sm font-bold text-primary-dark bg-primary rounded-xl hover:opacity-90 flex items-center transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary"> <CheckIcon className="w-4 h-4 mr-1.5"/> Sí, registrar </button>
                         </div>
                    </div>
                );
            case 'review_products':
                const total = products.reduce((sum, p) => sum + Number(p.estimatedPrice), 0);
                return (
                    <div className="animate-fade-in space-y-4">
                        <h3 className="font-bold text-on-surface">Productos Encontrados</h3>
                        {error && <p role="alert" className="text-danger bg-danger/20 p-3 rounded-md text-sm text-center my-2">{error}</p>}
                        <div ref={productsContainerRef} className="max-h-60 overflow-y-auto space-y-2 pr-2">
                           {products.map((p) => (
                               <div key={p.id} className="grid grid-cols-12 gap-2 items-center">
                                   <input type="text" value={p.productName} onChange={e => dispatch({type: 'UPDATE_PRODUCT', payload: {id: p.id, field: 'productName', value: e.target.value}})} placeholder="Producto" className={`col-span-6 ${smallInputClasses}`}/>
                                   <div className="relative col-span-5">
                                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-on-surface-secondary text-sm">S/</span>
                                      <input type="number" value={p.estimatedPrice} onChange={e => dispatch({type: 'UPDATE_PRODUCT', payload: {id: p.id, field: 'estimatedPrice', value: parseFloat(e.target.value) || 0}})} placeholder="Precio" className={`pl-7 ${smallInputClasses}`}/>
                                   </div>
                                   <button onClick={() => dispatch({type: 'REMOVE_PRODUCT', payload: p.id})} className="col-span-1 text-on-surface-secondary hover:text-danger"><TrashIcon className="w-5 h-5"/></button>
                               </div>
                           ))}
                        </div>
                        <button onClick={() => dispatch({type: 'ADD_PRODUCT'})} className="text-primary font-semibold text-sm flex items-center"><PlusIcon className="w-4 h-4 mr-1"/> Añadir producto</button>
                        <div className="border-t border-active-surface pt-3 mt-3 flex justify-between items-center font-bold">
                            <span>Total Estimado:</span>
                            <span>S/ {total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                );
            case 'editing':
                return (
                    <form className="space-y-5 animate-fade-in" onSubmit={(e) => e.preventDefault()}>
                        {error && <p role="alert" className="text-danger bg-danger/20 p-3 rounded-md text-sm text-center my-4">{error}</p>}
                        
                        {(scanMode === 'products' || expenseToEdit?.esFormal === false) && (
                            <div className="bg-yellow-400/10 border-l-4 border-yellow-500 p-3 rounded-md flex items-start space-x-3">
                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-yellow-300">Registro de Compra Informal</h4>
                                    <p className="text-xs text-yellow-300/80 mt-1">
                                        Estas compras sin comprobante afectan tu índice de formalidad. Puedes ajustar los datos si es necesario.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div> 
                            <label className="block text-sm font-medium text-on-surface-secondary">
                                {(scanMode === 'products' || expenseToEdit?.esFormal === false) ? 'Descripción de la Compra' : 'Razón Social'}
                            </label> 
                            <input type="text" name="razonSocial" value={expenseData?.razonSocial || ''} onChange={(e) => dispatch({type: 'UPDATE_EXPENSE_DATA', payload: {razonSocial: e.target.value}})} className={inputClasses} /> 
                        </div>

                        {(scanMode !== 'products' && expenseToEdit?.esFormal !== false) && (
                            <div> 
                                <label className="block text-sm font-medium text-on-surface-secondary">RUC</label> 
                                <input type="text" name="ruc" value={expenseData?.ruc || ''} onChange={(e) => dispatch({type: 'UPDATE_EXPENSE_DATA', payload: {ruc: e.target.value}})} className={inputClasses} /> 
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div> 
                                <label className="block text-sm font-medium text-on-surface-secondary">Fecha</label> 
                                <input type="date" name="fecha" value={expenseData?.fecha || ''} onChange={(e) => dispatch({type: 'UPDATE_EXPENSE_DATA', payload: {fecha: e.target.value}})} className={inputClasses} /> 
                            </div>
                            <div> 
                                <label className="block text-sm font-medium text-on-surface-secondary">Total (S/.)</label> 
                                <input type="number" name="total" step="0.01" value={expenseData?.total || 0} onChange={(e) => dispatch({type: 'UPDATE_EXPENSE_DATA', payload: {total: parseFloat(e.target.value) || 0}})} className={inputClasses} /> 
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface-secondary">Categoría</label>
                                <select name="categoria" value={expenseData?.categoria || ''} onChange={(e) => {
                                    dispatch({ type: 'UPDATE_EXPENSE_DATA', payload: { categoria: e.target.value as CategoriaGasto } });
                                    setSuggestedCategory(null); // Hide suggestion on manual change
                                }} className={inputClasses}>
                                    {Object.values(CategoriaGasto).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                {isSuggesting && (
                                    <div className="mt-2 text-sm text-on-surface-secondary flex items-center">
                                        <div className="w-4 h-4 border-2 border-t-primary border-active-surface rounded-full animate-spin"></div>
                                        <span className="ml-2">Buscando sugerencia inteligente...</span>
                                    </div>
                                )}
                                {suggestedCategory && (
                                    <div className="mt-2 flex items-center justify-between p-2 bg-primary/10 rounded-lg animate-fade-in">
                                        <p className="text-sm text-on-surface">
                                            <SparklesIcon className="w-4 h-4 inline mr-1.5 text-primary" />
                                            Sugerencia: <span className="font-bold">{suggestedCategory}</span>
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                dispatch({ type: 'UPDATE_EXPENSE_DATA', payload: { categoria: suggestedCategory } });
                                                setSuggestedCategory(null);
                                            }}
                                            className="px-3 py-1 text-xs font-bold text-primary-dark bg-primary rounded-full hover:opacity-90 transition-opacity"
                                        >
                                            Aplicar
                                        </button>
                                    </div>
                                )}
                            </div>
                            {(scanMode !== 'products' && expenseToEdit?.esFormal !== false) && (
                                <div> 
                                    <label className="block text-sm font-medium text-on-surface-secondary">Tipo Comprobante</label> 
                                    <select name="tipoComprobante" value={expenseData?.tipoComprobante || ''} onChange={(e) => dispatch({type: 'UPDATE_EXPENSE_DATA', payload: {tipoComprobante: e.target.value as TipoComprobante}})} className={inputClasses}> 
                                        {Object.values(TipoComprobante).map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)} 
                                    </select> 
                                </div>
                            )}
                        </div>
                    </form>
                );
            default: return null;
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-surface rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col animate-slide-in-up">
                <div className="p-5 border-b border-active-surface/50 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-on-surface">{modalTitle}</h2>
                    <button onClick={onClose} className="text-on-surface-secondary hover:text-on-surface"> <XMarkIcon className="w-6 h-6" /> </button>
                </div>
                <div className="p-5 overflow-y-auto">
                    {renderContent()}
                </div>
                
                {(step === 'editing' || step === 'review_products') && (
                    <div className="p-5 bg-background/50 border-t border-active-surface/50 flex justify-end space-x-3 mt-auto flex-shrink-0">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-on-surface bg-active-surface rounded-xl hover:bg-active-surface/70 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary"> Cancelar </button>
                        <button
                            onClick={step === 'editing' ? handleSave : handleContinueFromProducts}
                            className="px-6 py-2 text-sm font-bold text-primary-dark bg-primary rounded-xl hover:opacity-90 flex items-center transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary"
                        >
                            <CheckIcon className="w-5 h-5 mr-1.5"/>
                            {step === 'editing' ? (expenseToEdit ? 'Actualizar Gasto' : 'Guardar Gasto') : 'Continuar'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

export default AddExpenseModal;