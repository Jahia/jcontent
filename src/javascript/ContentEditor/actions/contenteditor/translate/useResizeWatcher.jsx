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
 * Util function to bind columnSelector to the resize processing logic to be used in useCallback fn.
 */
function processResizeEntries(columnSelector) {
    return entries => {
        const processedFields = new Set();

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
            if (currentHeight !== minHeight) {
                el.style.minHeight = `${minHeight}px`;
            }

            if (elPair && pairHeight !== minHeight) {
                elPair.style.minHeight = `${minHeight}px`;
            }
        }
    };
}
