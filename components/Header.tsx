

import React, { useState, useEffect } from 'react';
import { TreeIcon, BookOpenIcon, MagnifyingGlassIcon, XMarkIcon, SparklesIcon } from './Icons';
import { getAIEducationalTip, getAINextStepTip } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface HeaderProps {
    onOpenProfile: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = React.memo(({ onOpenProfile, searchQuery, onSearchChange }) => {
    const { user } = useAuth();
    const { expenses } = useData();
    const [aiTip, setAiTip] = useState<string>("");
    const [isLoadingTip, setIsLoadingTip] = useState<boolean>(true);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [nextStepTip, setNextStepTip] = useState<string>('');
    const [isLoadingNextStep, setIsLoadingNextStep] = useState(true);

    const toggleMobileSearch = React.useCallback(() => {
        setIsMobileSearchOpen(prev => !prev);
    }, []);

    const handleSearchChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
    }, [onSearchChange]);

    // Effect for the AI Tip of the Day. Runs only once when the component mounts.
    useEffect(() => {
        const fetchTip = async () => {
            setIsLoadingTip(true);
            try {
                const tip = await getAIEducationalTip();
                setAiTip(tip);
            } catch (e) {
                console.error("Failed to fetch AI tip:", e);
                setAiTip("Pide siempre comprobante para maximizar tu ahorro fiscal.");
            } finally {
                setIsLoadingTip(false);
            }
        };
        fetchTip();
    }, []);

    // Effect for the "Next Step" AI Tip. Runs when user or expenses change.
    useEffect(() => {
        const fetchNextStep = async () => {
            if (user) {
                setIsLoadingNextStep(true);
                try {
                    const tip = await getAINextStepTip(user, expenses);
                    setNextStepTip(tip);
                } catch (e) {
                    console.error("Failed to fetch next step tip:", e);
                    setNextStepTip("Registra cada gasto, por más pequeño que sea. ¡Cada sol cuenta para alcanzar tus metas! 🌱");
                } finally {
                    setIsLoadingNextStep(false);
                }
            }
        };

        fetchNextStep();
    }, [user, expenses]);

    return (
        <header className="bg-gradient-to-b from-background to-surface text-on-surface relative overflow-hidden">
            <div className="max-w-3xl mx-auto p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold leading-tight">
                        treev<span className="text-danger">ü</span>t
                    </h1>
                    {user && (
                        <button onClick={onOpenProfile} className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary">
                             {user.name ? (
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center border-2 border-active-surface">
                                    <span className="text-xl font-bold text-primary-dark">{user.name.charAt(0).toUpperCase()}</span>
                                </div>
                             ) : (
                                <img src={user.picture} alt="User" className="w-10 h-10 rounded-full object-cover border-2 border-active-surface"/>
                             )}
                        </button>
                    )}
                </div>

                {/* AI Next Step Card */}
                <div className="bg-surface rounded-2xl p-3 flex items-start space-x-3 animate-fade-in-down border border-primary/30 shadow-lg">
                     <SparklesIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"/>
                     <div>
                        <p className="text-xs font-bold text-primary uppercase tracking-wider">Tu Próximo Paso</p>
                        {isLoadingNextStep ? (
                            <div className="h-4 w-4/5 bg-active-surface rounded-sm animate-pulse mt-1"></div>
                        ) : (
                            <p className="text-sm text-on-surface leading-relaxed">{nextStepTip}</p>
                        )}
                    </div>
                </div>
                
                <div className="bg-surface rounded-2xl p-3 flex items-start space-x-3 animate-fade-in-down border border-active-surface/50 shadow-lg" style={{ animationDelay: '100ms' }}>
                     <BookOpenIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"/>
                     <div>
                        <p className="text-xs font-bold text-primary uppercase tracking-wider">Tip del Día</p>
                        {isLoadingTip ? (
                            <div className="h-4 w-4/5 bg-active-surface rounded-sm animate-pulse mt-1"></div>
                        ) : (
                            <p className="text-sm text-on-surface leading-relaxed">{aiTip}</p>
                        )}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative animate-fade-in-down" style={{ animationDelay: '200ms' }}>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <MagnifyingGlassIcon className="h-5 w-5 text-on-surface-secondary" />
                    </div>
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar por comercio, categoría, monto..."
                        className="block w-full rounded-xl border-transparent bg-surface py-3 pl-11 pr-10 text-on-surface placeholder:text-on-surface-secondary focus:border-primary focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 group"
                            aria-label="Limpiar búsqueda"
                        >
                            <XMarkIcon className="h-5 w-5 text-on-surface-secondary group-hover:text-on-surface transition-colors" />
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
});

export default Header;