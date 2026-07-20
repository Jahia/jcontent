import {useCallback, useEffect} from 'react';
import {debounce} from 'es-toolkit';

/**
 * Custom hook to watch for resize events on content editor fields and sync field heights using max-height
 * @param columnSelector one of 'left-column' or 'right-column'
 */
export const useResizeWatcher = ({columnSelector}) => {
    // Memoized version of the resize processing function only if columnSelector changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const processEntriesFn = useCallback(processResizeEntries(columnSelector), [columnSelector]);

    useEffect(() => {
        if (!columnSelector) {
            return;
        }

        // Use pendingEntries to collect and process ResizeObserver entries in a debounced manner
        // This needs to be outside of observer callback to avoid recreating every event.
        let pendingEntries = [];
        const debouncedProcessEntries = debounce(() => {
            processEntriesFn(pendingEntries);
            pendingEntries = [];
        }, 16); // 16ms frame duration debounce to batch resize events

        // ResizeObserver collects entries and debounces processing
        const observer = new ResizeObserver(entries => {
            pendingEntries.push(...entries);
            debouncedProcessEntries();
        });

        const elements = document.querySelectorAll(
            `[data-sel-role="${columnSelector}"] [data-sel-content-editor-field]`
        );
        elements.forEach(el => observer.observe(el));

        return () => {
            observer.disconnect();
        };
    }, [columnSelector, processEntriesFn]);
};

/**
 * Compares pixel values with a tolerance of 1px.
 * We used to do `a !== b` but it triggered unnecessary reflows on high DPI screens.
 *
 * @param {number} a
 * @param {number} b
 */
const areDifferent = (a, b) => Math.abs(a - b) > 1;

/**
 * Restores the scroll position of a column if it has changed.
 * Extracted to reduce cognitive complexity of `processResizeEntries`.
 *
 * @param {Element|undefined} column
 * @param {number} scrollPosition
 */
const restoreScrollPositions = (column, scrollPosition) => {
    if (column && scrollPosition !== undefined && areDifferent(column.scrollTop, scrollPosition)) {
        column.scrollTop = scrollPosition;
    }
};

/**
 * Util function to bind columnSelector to the resize processing logic to be used in useCallback fn.
 *
 * @param {"left-column"|"right-column"} columnSelector
 */
function processResizeEntries(columnSelector) {
    return entries => {
        const processedFields = new Set();

        // When the height of a block changes, the navigator may decide to update the scroll position not to confuse users. Unfortunately, this browser behavior causes weird scroll rollbacks.
        // Instead we preserve the scroll position of both columns, restore them at the end of the layout update.
        const leftColumn = document.querySelector('[data-sel-role="left-column"]');
        const rightColumn = document.querySelector('[data-sel-role="right-column"]');
        const savedLeftScrollTop = leftColumn?.scrollTop;
        const savedRightScrollTop = rightColumn?.scrollTop;

        for (const entry of entries) {
            const el = entry.target;
            const fieldName = el.dataset.selContentEditorField;

            // Prevent double-processing same field
            if (processedFields.has(fieldName)) {
                continue;
            }

            processedFields.add(fieldName);

            const columnPairSelector = (columnSelector === 'left-column') ? 'right-column' : 'left-column';
            const elPair = document.querySelector(`[data-sel-role="${columnPairSelector}"] [data-sel-content-editor-field="${fieldName}"]`);

            // Reset minHeight before measuring
            el.style.minHeight = '';
            if (elPair) {
                elPair.style.minHeight = '';
            }

            // Get natural heights after reset
            const currentHeight = el.scrollHeight;
            const pairHeight = elPair?.scrollHeight || 0;
            const minHeight = Math.max(currentHeight, pairHeight);

            // Only set minHeight if there's a difference
            if (areDifferent(currentHeight, minHeight)) {
                el.style.minHeight = `${minHeight}px`;
            }

            if (elPair && areDifferent(pairHeight, minHeight)) {
                elPair.style.minHeight = `${minHeight}px`;
            }
        }

        // Restore pre-layout update scroll positions to avoid weird jumps
        restoreScrollPositions(leftColumn, savedLeftScrollTop);
        restoreScrollPositions(rightColumn, savedRightScrollTop);
    };
}
