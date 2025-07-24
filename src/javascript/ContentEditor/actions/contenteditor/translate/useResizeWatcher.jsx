import {useEffect} from 'react';

/**
 * Custom hook to watch for resize events on content editor fields and sync field heights using max-height
 * @param columnSelector one of 'left-column' or 'right-column'
 */
export const useResizeWatcher = ({columnSelector}) => {
    useEffect(() => {
        if (!columnSelector) {
            return;
        }

        let frameId = null; // Use to track if elements already being processed
        const observer = new ResizeObserver(entries => {
            if (frameId) {
                cancelAnimationFrame(frameId);
            }
            const requestCallback = processResizeEntries(columnSelector, entries);
            frameId = requestAnimationFrame(requestCallback);
        });

        const elements = document.querySelectorAll(
            `[data-sel-role="${columnSelector}"] [data-sel-content-editor-field]`
        );
        elements.forEach(el => observer.observe(el));

        return () => {
            if (frameId) {
                cancelAnimationFrame(frameId);
            }

            observer.disconnect();
        };
    }, [columnSelector]);
};

function processResizeEntries(columnSelector, entries) {
    return () => {
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
    }
}
