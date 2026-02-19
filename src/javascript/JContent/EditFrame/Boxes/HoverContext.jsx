import React, {createContext, useContext, useState, useImperativeHandle, forwardRef} from 'react';

const HoverContext = createContext(null);

export const HoverProvider = forwardRef(({children}, ref) => {
    const [hoveredPath, setHoveredPath] = useState(null);

    useImperativeHandle(ref, () => ({
        setHoveredPath
    }), []);

    return (
        <HoverContext.Provider value={{hoveredPath, setHoveredPath}}>
            {children}
        </HoverContext.Provider>
    );
});

export const useHoverContext = () => useContext(HoverContext);
