
import React from 'react';

interface FloatingActionButtonProps {
    onClick: () => void;
    children: React.ReactNode;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick, children }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 bg-primary text-primary-dark w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary z-20"
            aria-label="Añadir gasto"
        >
            {children}
        </button>
    );
};

export default FloatingActionButton;