import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PaperAirplaneIcon, XMarkIcon, TreeIcon, MicrophoneIcon, StopIcon } from './Icons';
import { getGeneralChatResponse, transcribeAudio } from '../services/geminiService';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { type Expense } from '../types';

interface AIAssistantChatProps {
    onClose: () => void;
}

type Message = {
    from: 'ai' | 'user';
    text: string;
};

const DEDUCTIBLE_CATEGORIES = ['Alimentación', 'Ocio', 'Servicios', 'Salud', 'Vivienda'];

const generateSuggestions = (expenses: Expense[], totalExpenses: number, budget: number | null, formalityIndex: number): string[] => {
    const suggestions = new Set<string>();
    if (expenses.length > 0) {
        const lastExpense = [...expenses].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];
        if (lastExpense.total > (budget ? budget * 0.1 : 100)) suggestions.add("¿Cómo afecta mi último gasto al presupuesto?");
        if (lastExpense.esFormal && DEDUCTIBLE_CATEGORIES.includes(lastExpense.categoria)) suggestions.add("¿Cuál es el beneficio fiscal de mi último gasto?");
    }
    if (budget && totalExpenses && (totalExpenses / budget) * 100 > 80) suggestions.add("¿Qué gastos puedo recortar?");
    if (expenses.length > 3) {
        const expensesByCategory = expenses.reduce((acc, exp) => {
            acc[exp.categoria] = (acc[exp.categoria] || 0) + exp.total;
            return acc;
        }, {} as Record<string, number>);
        const topCategory = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0];
        if (topCategory && (topCategory[1] / totalExpenses) > 0.4) suggestions.add(`Analizar mis gastos en "${topCategory[0]}"`);
    }
    if (formalityIndex < 75) suggestions.add("¿Cómo puedo mejorar mi índice de formalidad?");
    const defaults = ["¿En qué categoría he gastado más?", "Resumen de mis finanzas del mes", "Dame un consejo de ahorro práctico"];
    defaults.forEach(def => suggestions.size < 3 && suggestions.add(def));
    return Array.from(suggestions);
};

const audioToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

// --- Sub-components for better structure and performance ---

const ChatBubble = React.memo(({ from, text }: { from: 'ai' | 'user'; text: string }) => (
    <div className={`chat-bubble ${from === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'}`}>
        {text}
    </div>
));

const ChatSuggestions = React.memo(({ suggestions, onSuggestionClick, isLoading }: { suggestions: string[]; onSuggestionClick: (s: string) => void; isLoading: boolean }) => (
    <div className="flex flex-wrap gap-2 justify-start py-2">
        {suggestions.map((q, i) => (
            <button
                key={i}
                onClick={() => onSuggestionClick(q)}
                disabled={isLoading}
                className="bg-surface hover:bg-active-surface text-on-surface text-sm font-semibold py-1.5 px-3 rounded-full transition-all duration-200 disabled:opacity-50"
                style={{ animation: `slide-in-up 0.4s ${i * 100}ms both cubic-bezier(0.25, 0.46, 0.45, 0.94)` }}
            >
                {q}
            </button>
        ))}
    </div>
));

const ChatInput = React.memo(({
    inputValue,
    onInputChange,
    onSend,
    onMicClick,
    isRecording,
    isLoading,
}: {
    inputValue: string;
    onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSend: () => void;
    onMicClick: () => void;
    isRecording: boolean;
    isLoading: boolean;
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [inputValue]);

    return (
        <div className="p-3 border-t border-active-surface/50 mt-auto flex-shrink-0 bg-surface">
            <form onSubmit={e => { e.preventDefault(); onSend(); }} className="flex items-end space-x-3">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputValue}
                    onChange={onInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), onSend())}
                    placeholder={isRecording ? "Grabando..." : "Escribe un mensaje..."}
                    disabled={isRecording || isLoading}
                    className="flex-1 bg-background border-none rounded-2xl py-2.5 px-4 resize-none max-h-32 focus:ring-2 focus:ring-primary focus:outline-none"
                    style={{ scrollbarWidth: 'none' }}
                />
                <button
                    type={inputValue.trim() ? "submit" : "button"}
                    onClick={inputValue.trim() ? undefined : onMicClick}
                    disabled={isLoading}
                    className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200 text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-primary'}`}
                    aria-label={inputValue.trim() ? 'Enviar mensaje' : (isRecording ? 'Detener grabación' : 'Grabar mensaje de voz')}
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-t-primary-dark border-background rounded-full animate-spin"></div>
                    ) : inputValue.trim() ? (
                        <PaperAirplaneIcon className="w-6 h-6" />
                    ) : isRecording ? (
                        <StopIcon className="w-6 h-6" />
                    ) : (
                        <MicrophoneIcon className="w-6 h-6" />
                    )}
                </button>
            </form>
            <p className="text-center text-xs text-on-surface-secondary mt-2">Powered by Gemini</p>
        </div>
    );
});


// --- Main Component ---
const AIAssistantChat: React.FC<AIAssistantChatProps> = ({ onClose }) => {
    const { budget, expenses, formalityIndex, totalExpenses } = useData();
    const { user } = useAuth();

    const [messages, setMessages] = useState<Message[]>([
        { from: 'ai', text: `¡Hola, ${user?.name.split(' ')[0] || 'amigo'}! Soy treevüt, tu asistente de ahorro fiscal. Estoy listo para ayudarte a analizar tus gastos y encontrar oportunidades de ahorro. ¿Qué te gustaría saber?` }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isRecording, setIsRecording] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (expenses) {
            setSuggestions(generateSuggestions(expenses, totalExpenses, budget, formalityIndex));
        }
    }, [expenses, totalExpenses, budget, formalityIndex]);

    const handleSend = useCallback(async (messageToSend?: string) => {
        const userMessage = messageToSend || inputValue.trim();
        if (!userMessage || isLoading) return;

        setMessages(prev => [...prev, { from: 'user', text: userMessage }]);
        setInputValue('');
        setIsLoading(true);

        const aiResponseText = await getGeneralChatResponse(userMessage, expenses, budget, formalityIndex, user?.name || 'amigo');

        setIsLoading(false);
        setMessages(prev => [...prev, { from: 'ai', text: aiResponseText }]);
    }, [inputValue, isLoading, expenses, budget, formalityIndex, user?.name]);

    const handleSuggestionClick = useCallback((suggestion: string) => {
        if (isLoading) return;
        handleSend(suggestion);
    }, [isLoading, handleSend]);

    const startRecording = useCallback(async () => {
        if (isLoading) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = event => audioChunksRef.current.push(event.data);
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());
                setIsLoading(true);
                const base64 = await audioToBase64(audioBlob);
                const transcribedText = await transcribeAudio(base64, audioBlob.type);
                setMessages(prev => [...prev, { from: 'user', text: `🎤 "${transcribedText}"` }]);
                const aiResponseText = await getGeneralChatResponse(transcribedText, expenses, budget, formalityIndex, user?.name || 'amigo');
                setMessages(prev => [...prev, { from: 'ai', text: aiResponseText }]);
                setIsLoading(false);
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setMessages(prev => [...prev, { from: 'ai', text: 'No pude acceder a tu micrófono. Revisa los permisos en tu navegador.' }]);
        }
    }, [isLoading, expenses, budget, formalityIndex, user?.name]);

    const stopRecording = useCallback(() => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    }, []);

    const handleMicClick = useCallback(() => {
        isRecording ? stopRecording() : startRecording();
    }, [isRecording, startRecording, stopRecording]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-end sm:items-center z-50 p-0 sm:p-4 animate-fade-in">
            <div className="bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md h-[85vh] sm:h-auto sm:max-h-[80vh] flex flex-col animate-slide-in-up">
                <header className="p-4 border-b border-active-surface/50 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center space-x-2">
                        <div>
                            <h2 className="text-lg font-bold text-on-surface">
                                Asistente treev<span className="text-danger">ü</span>t
                            </h2>
                            <p className="text-xs text-on-surface-secondary">En línea</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-on-surface-secondary hover:text-on-surface">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-1 p-4 overflow-y-auto space-y-4 bg-background">
                    {messages.map((msg, index) => (
                        <ChatBubble key={index} from={msg.from} text={msg.text} />
                    ))}
                    {messages.length === 1 && suggestions.length > 0 && (
                        <ChatSuggestions suggestions={suggestions} onSuggestionClick={handleSuggestionClick} isLoading={isLoading} />
                    )}
                    {isLoading && (
                        <div className="chat-bubble chat-bubble-ai">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-on-surface rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                <div className="w-2 h-2 bg-on-surface rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-on-surface rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </main>

                <ChatInput
                    inputValue={inputValue}
                    onInputChange={(e) => setInputValue(e.target.value)}
                    onSend={handleSend}
                    onMicClick={handleMicClick}
                    isRecording={isRecording}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default AIAssistantChat;