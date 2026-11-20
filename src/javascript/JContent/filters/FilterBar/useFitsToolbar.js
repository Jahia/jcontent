import {useLayoutEffect, useRef, useState} from 'react';

const MARGIN = 8;

// The width of the content of an element, whatever space a flex container gives it
const contentWidth = element => Array.from(element?.children || []).reduce((width, child) => {
    const style = window.getComputedStyle(child);
    return width + child.getBoundingClientRect().width + (Number.parseFloat(style.marginLeft) || 0) + (Number.parseFloat(style.marginRight) || 0);
}, 0);

const overflows = element => Boolean(element) && (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1);

/**
 * Whether the full filter bar fits in the toolbar row of a Moonstone Header.
 * The toolbar row holds the left part, which grows, and the right part, which holds the bar. The bar fits while the left part
 * keeps its content on one line. A hidden copy of the bar gives the width of the full bar while the collapsed chip shows.
 *
 * @param {object} rootRef the element of the bar or of the collapsed chip, in the right part of the toolbar row
 * @param {object} measureRef the hidden copy of the full bar
 * @param {Array} deps the values that change the width of the bar
 * @returns {boolean} true when the full bar fits
 */
export const useFitsToolbar = (rootRef, measureRef, deps) => {
    const [fits, setFits] = useState(true);
    const collapsedAt = useRef(null);

    useLayoutEffect(() => {
        const root = rootRef.current;
        const right = root?.parentElement;
        const row = right?.parentElement;
        const left = row && row.firstElementChild !== right ? row.firstElementChild : null;
        if (!root || !row || !left) {
            return undefined;
        }

        const measure = () => {
            const fullWidth = measureRef.current?.scrollWidth || 0;
            const visibleWidth = root.getBoundingClientRect().width;
            const rowWidth = row.clientWidth;
            setFits(previous => {
                if (previous) {
                    // The left part wraps its controls to a second line, or the right part goes below it
                    const wrapped = right.offsetTop > left.offsetTop + 1 || left.offsetHeight > row.clientHeight + 1 || row.scrollHeight > row.clientHeight + 1;
                    if (overflows(left) || wrapped) {
                        collapsedAt.current = {rowWidth, fullWidth};
                        return false;
                    }

                    return true;
                }

                // The collapsed chip expands again only when the row got wider or the bar narrower than when it collapsed
                const free = left.clientWidth - contentWidth(left);
                const isWiderOrNarrower = !collapsedAt.current || rowWidth > collapsedAt.current.rowWidth || fullWidth < collapsedAt.current.fullWidth;
                return isWiderOrNarrower && fullWidth - visibleWidth + MARGIN <= free;
            });
        };

        measure();
        if (typeof ResizeObserver === 'undefined') {
            return undefined;
        }

        const observer = new ResizeObserver(() => measure());
        observer.observe(row);
        observer.observe(left);
        return () => observer.disconnect();
        // The caller lists the values that change the width of the bar
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rootRef, measureRef, fits, ...deps]);

    return fits;
};
