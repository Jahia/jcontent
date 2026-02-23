import {useCallback, useRef, useState} from 'react';

export const useHoverManager = () => {
    const currentHoveredRef = useRef(null);
    const hoveredBoxRefs = useRef(new Map());
    const [currentHoveredPath, setCurrentHoveredPath] = useState(null);

    const registerHoverManager = useCallback((path, updateFn) => {
        hoveredBoxRefs.current.set(path, updateFn);
        return () => hoveredBoxRefs.current.delete(path);
    }, []);

    const setHovered = useCallback(path => {
        if (currentHoveredRef.current === path) {
            return; // Already hovered, no-op
        }

        // Clear previous hover
        if (currentHoveredRef.current) {
            const prevUpdate = hoveredBoxRefs.current.get(currentHoveredRef.current);
            prevUpdate?.(false);
        }

        // Set new hover
        currentHoveredRef.current = path;
        setCurrentHoveredPath(path);
        if (path) {
            const newUpdate = hoveredBoxRefs.current.get(path);
            newUpdate?.(true);
        }
    }, []);

    const clearHovered = useCallback(() => {
        setHovered(null);
    }, [setHovered]);

    return {registerHoverManager, setHovered, clearHovered, currentHoveredRef, currentHoveredPath};
};
