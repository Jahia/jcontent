import {createContext, useEffect, useRef, useState} from 'react';

export const MenuLoadingContext = createContext(false);

const LOADING_SHOW_DELAY_MS = 300;
const SKELETON_MIN_DISPLAY_MS = 200;

/**
 * Hybrid loading delay for context menus.
 *
 * - Suppresses the menu entirely for the first 300ms of loading so fast loads never
 *   flash a skeleton.
 * - Once skeletons are shown, keeps them visible for at least 200ms to avoid a
 *   flash when loading completes just after the 300ms threshold.
 * - If loading completes before 300ms the menu appears instantly with real content;
 *   no skeleton is ever shown.
 */
export const useMenuLoadingDelay = (isOpen, isLoading) => {
    const [timerExpired, setTimerExpired] = useState(false);
    const [effectiveLoading, setEffectiveLoading] = useState(false);
    const skeletonShownAtRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setTimerExpired(false);
            setEffectiveLoading(false);
            skeletonShownAtRef.current = null;
            return;
        }

        if (!isLoading) {
            if (skeletonShownAtRef.current !== null) {
                // Skeletons are visible — hold for at least SKELETON_MIN_DISPLAY_MS to avoid flicker
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
            setTimerExpired(true);
            setEffectiveLoading(true);
        }, LOADING_SHOW_DELAY_MS);
        return () => clearTimeout(timer);
    }, [isOpen, isLoading]);

    /*
     * 'showMenu' is derived directly from isOpen (not state) so the menu closes instantly
     * with no async render lag — preventing race conditions when a menu is closed and
     * reopened in quick succession.
     */
    const showMenu = isOpen && (!isLoading || timerExpired);

    return {showMenu, effectiveLoading};
};
