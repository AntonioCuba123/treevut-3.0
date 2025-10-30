import React, { useEffect, useState } from 'react';

interface OnboardingTourProps {
    step: {
        targetRef: React.RefObject<HTMLElement>;
        text: string;
        position: 'top' | 'bottom';
        isInteractive?: boolean;
    };
    onNext: () => void;
    onSkip: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ step, onNext, onSkip }) => {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [targetBorderRadius, setTargetBorderRadius] = useState<string>('8px');

    useEffect(() => {
        const targetEl = step.targetRef.current;
        if (!targetEl) return;

        const updatePosition = () => {
            setTargetRect(targetEl.getBoundingClientRect());
            const targetStyle = window.getComputedStyle(targetEl);
            setTargetBorderRadius(targetStyle.borderRadius);
        };

        if (step.isInteractive) {
            // Bring interactive element to the front so it can be clicked
            targetEl.style.zIndex = '9999';
        }

        const timer = setTimeout(updatePosition, 50);
        
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
            // Cleanup styles
            if (step.isInteractive && targetEl) {
                targetEl.style.zIndex = '';
            }
        };
    }, [step]);

    if (!targetRect || targetRect.width === 0) return null;
    
    // Add a small padding around the spotlighted element
    const spotlightPadding = 8;
    const spotlightStyle: React.CSSProperties = {
        top: `${targetRect.top - spotlightPadding}px`,
        left: `${targetRect.left - spotlightPadding}px`,
        width: `${targetRect.width + spotlightPadding * 2}px`,
        height: `${targetRect.height + spotlightPadding * 2}px`,
        borderRadius: `calc(${targetBorderRadius} + ${spotlightPadding}px)`,
    };

    const textBoxStyle: React.CSSProperties = {
        // This robust logic centers the textbox but keeps it on screen
        left: `min(calc(100vw - 320px - 16px), max(16px, ${targetRect.left + targetRect.width / 2 - 160}px))`,
    };

    const margin = 24; // Space between target and textbox, including arrow

    if (step.position === 'bottom') {
        textBoxStyle.top = `${targetRect.bottom + margin}px`;
    } else { // position === 'top'
        textBoxStyle.bottom = `${window.innerHeight - targetRect.top + margin}px`;
    }

    return (
        <>
            {/* Overlay to catch clicks for skipping/next */}
            {!step.isInteractive && (
                 <div 
                    className="fixed inset-0 z-[9997]" 
                    onClick={onNext}
                 />
            )}
            
            <div 
                className={`tour-spotlight ${step.isInteractive ? 'tour-spotlight-interactive' : ''}`} 
                style={spotlightStyle}
            />
            <div className={`tour-textbox tour-textbox-${step.position}`} style={textBoxStyle}>
                <p className="text-sm text-on-surface-secondary">{step.text}</p>
                {!step.isInteractive && (
                    <div className="flex justify-between items-center mt-4">
                        <button onClick={(e) => { e.stopPropagation(); onSkip(); }} className="text-xs font-semibold text-on-surface-secondary hover:text-on-surface">Omitir Tour</button>
                        <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="bg-primary text-primary-dark text-sm font-bold py-1.5 px-4 rounded-full">Siguiente</button>
                    </div>
                )}
            </div>
        </>
    );
};

export default OnboardingTour;