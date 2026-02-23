import {useCallback, useRef, useState} from 'react';

export const useHoverManager = () => {
    const currentHoveredRef = useRef(null);
    const [currentHoveredPath, setCurrentHoveredPath] = useState(null);

    const setHovered = useCallback(path => {
        if (currentHoveredRef.current === path) {
            return; // Already hovered, no-op
        }
        currentHoveredRef.current = path;
        setCurrentHoveredPath(path);
    }, []);

    const clearHovered = useCallback(() => {
        setCurrentHoveredPath(null);
    }, [setHovered]);

    return {setHovered, clearHovered, currentHoveredRef, currentHoveredPath};
};
