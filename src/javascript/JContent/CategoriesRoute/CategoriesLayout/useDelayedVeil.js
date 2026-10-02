import {useEffect, useState} from 'react';

/**
 * Whether to veil the panel while the query runs.
 *
 * Covering the table is only honest when there is nothing to look at. Once rows are on screen an
 * expansion merely adds to them, so veiling hides content that is still correct and makes a 200ms
 * round trip feel like a page load - the side navigation tree this replaced never greyed out the
 * main panel to open a branch. So the veil is kept for the first load only, and even then it waits:
 * a load that resolves quickly never flashes it on screen at all.
 */
export const VEIL_DELAY_MS = 300;

export const useDelayedVeil = (loading, hasRows) => {
    const [isVisible, setIsVisible] = useState(false);
    const shouldVeil = loading && !hasRows;

    useEffect(() => {
        if (!shouldVeil) {
            setIsVisible(false);
            return undefined;
        }

        const timer = window.setTimeout(() => setIsVisible(true), VEIL_DELAY_MS);
        return () => window.clearTimeout(timer);
    }, [shouldVeil]);

    return isVisible;
};

export default useDelayedVeil;
