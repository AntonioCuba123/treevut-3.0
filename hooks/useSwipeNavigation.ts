
import React, { useState, useRef } from 'react';
import type { ActiveTab } from '../components/MainApp';

const SWIPE_THRESHOLD = 75;

export const useSwipeNavigation = (
    activeTab: ActiveTab,
    onTabChange: (newTab: ActiveTab) => void,
    options?: { enabled?: boolean }
) => {
    const enabled = options?.enabled ?? true;
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const touchStartRef = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!enabled) return;
        touchStartRef.current = e.touches[0].clientX;
        setIsSwiping(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!enabled) return;
        if (touchStartRef.current === null) return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - touchStartRef.current;
        setSwipeOffset(diff);
    };

    const handleTouchEnd = () => {
        if (!enabled) {
            setSwipeOffset(0);
            touchStartRef.current = null;
            setIsSwiping(false);
            return;
        }

        const tabs: ActiveTab[] = ['gastos', 'analisis', 'consejos'];
        const currentIndex = tabs.indexOf(activeTab);

        if (Math.abs(swipeOffset) > SWIPE_THRESHOLD) {
            if (swipeOffset > 0 && currentIndex > 0) { // Swipe right
                onTabChange(tabs[currentIndex - 1]);
            } else if (swipeOffset < 0 && currentIndex < tabs.length - 1) { // Swipe left
                onTabChange(tabs[currentIndex + 1]);
            }
        }

        setSwipeOffset(0);
        touchStartRef.current = null;
        setIsSwiping(false);
    };

    return {
        swipeHandlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
        },
        swipeOffset,
        isSwiping,
    };
};
