import React, { useState, forwardRef } from 'react';
import { PlusIcon, CameraIcon, DocumentPlusIcon, CubeIcon, ChatBubbleIcon, XMarkIcon } from './Icons';

interface ActionButtonsProps {
    onAddReceiptCamera: () => void;
    onAddReceiptFile: () => void;
    onAddProductsCamera: () => void;
    onOpenChat: () => void;
    onMainButtonClick?: () => void;
}

const ActionButtons = forwardRef<HTMLDivElement, ActionButtonsProps>(({ onAddReceiptCamera, onAddReceiptFile, onAddProductsCamera, onOpenChat, onMainButtonClick }, ref) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleActionClick = React.useCallback((action: () => void) => {
        action();
        setIsMenuOpen(false);
    }, []);
    
    const toggleMenu = React.useCallback(() => {
        setIsMenuOpen(prev => !prev);
        onMainButtonClick?.();
    }, [onMainButtonClick]);

    // Handle keyboard navigation
    const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && isMenuOpen) {
            setIsMenuOpen(false);
        }
    }, [isMenuOpen]);

    const actions = [
        {
            label: 'Foto Recibo',
            icon: CameraIcon,
            handler: () => handleActionClick(onAddReceiptCamera)
        },
        {
            label: 'Subir Archivo',
            icon: DocumentPlusIcon,
            handler: () => handleActionClick(onAddReceiptFile)
        },
        {
            label: 'Productos',
            icon: CubeIcon,
            handler: () => handleActionClick(onAddProductsCamera)
        },
        {
            label: 'Asistente',
            icon: ChatBubbleIcon,
            handler: () => handleActionClick(onOpenChat)
        },
    ];
    
    // Vertical stacking calculations
    const verticalSpacing = 68; // 52px button height + 16px margin
    const initialOffset = 80; // Distance from main FAB center to first item center

    return (
        <>
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 z-10"
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                />
            )}
            <div ref={ref} className="fixed bottom-10 right-8 z-20">
                <div className="relative flex items-center justify-center w-[72px] h-[72px]">
                    {actions.map((action, index) => {
                        const yOffset = initialOffset + (index * verticalSpacing);
                        const Icon = action.icon;

                        return (
                            <div
                                key={action.label}
                                className={`fab-menu-item ${isMenuOpen ? 'fab-menu-item-visible' : 'pointer-events-none'}`}
                                style={{
                                    transform: isMenuOpen ? `translateY(-${yOffset}px) scale(1)` : 'translateY(0) scale(0.5)',
                                    transitionDelay: isMenuOpen ? `${index * 40}ms` : `${(actions.length - 1 - index) * 40}ms`,
                                }}
                            >
                                <div className={`fab-label ${isMenuOpen ? 'fab-label-visible' : ''}`} style={{ transitionDelay: isMenuOpen ? `${index * 40 + 100}ms` : '0ms' }}>
                                    <div className="text-right">
                                        <span className="font-bold text-sm text-on-surface">{action.label}</span>
                                    </div>
                                </div>
                                <button
                                    aria-label={action.label}
                                    role="menuitem"
                                    tabIndex={isMenuOpen ? 0 : -1}
                                    onClick={action.handler}
                                    className="bg-surface text-primary w-[52px] h-[52px] rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200"
                                >
                                    <Icon className="w-7 h-7" />
                                </button>
                            </div>
                        )
                    })}
                
                    <button
                        onClick={toggleMenu}
                        className={`absolute bg-primary text-primary-dark w-[72px] h-[72px] rounded-full shadow-xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary`}
                        aria-haspopup="true"
                        aria-expanded={isMenuOpen}
                        aria-label={isMenuOpen ? "Cerrar menú de acciones" : "Abrir menú de acciones"}
                    >
                        <PlusIcon className={`w-9 h-9 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'rotate-45 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
                        <XMarkIcon className={`w-9 h-9 absolute transition-transform duration-300 ease-in-out ${isMenuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-45 scale-75 opacity-0'}`} />
                    </button>
                </div>
            </div>
        </>
    );
});

export default ActionButtons;