import {createContext, useEffect, useRef, useState} from 'react';

export const MenuLoadingContext = createContext(false);

const LOADING_SHOW_DELAY_MS = 300;
const SKELETON_MIN_DISPLAY_MS = 200;

/**
 * Hybrid loading delay for context menus.
 *
 * - Suppresses the menu entirely for the first 300ms of loading so fast loads never
 *   flash a skeleton.
 * - Once the skeleton is shown, keeps it visible for at least 200ms so it doesn't
 *   flicker out immediately if data arrives just after the threshold.
 * - If loading completes before the 300ms threshold the menu appears instantly with
 *   real content; no skeleton is ever shown.
 */
export const useMenuLoadingDelay = (isOpen, isLoading) => {
    const [showMenu, setShowMenu] = useState(false);
    const [effectiveLoading, setEffectiveLoading] = useState(false);
    const skeletonShownAtRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setShowMenu(false);
            setEffectiveLoading(false);
            skeletonShownAtRef.current = null;
            return;
        }

        if (!isLoading) {
            if (skeletonShownAtRef.current === null) {
                // Loaded before threshold — show immediately with real content, no skeleton ever shown
                setShowMenu(true);
            } else {
                // Skeleton is visible — hold it for at least SKELETON_MIN_DISPLAY_MS to avoid flicker
                const elapsed = Date.now() - skeletonShownAtRef.current;
                const remaining = SKELETON_MIN_DISPLAY_MS - elapsed;
                if (remaining > 0) {
                    const timer = setTimeout(() => setEffectiveLoading(false), remaining);
                    return () => clearTimeout(timer);
                }

                setEffectiveLoading(false);
            }

            return;
        }

        // Still loading: wait before showing skeletons to avoid flicker on fast loads
        const timer = setTimeout(() => {
            skeletonShownAtRef.current = Date.now();
            setShowMenu(true);
            setEffectiveLoading(true);
        }, LOADING_SHOW_DELAY_MS);
        return () => clearTimeout(timer);
    }, [isOpen, isLoading]);

    return {showMenu, effectiveLoading};
};
