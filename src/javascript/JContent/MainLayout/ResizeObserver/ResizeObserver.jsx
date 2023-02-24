import {useEffect, useRef, useState, createContext} from 'react';

export const ResizeContext = createContext(0);

export const useResize = () => {
    const ref = useRef(null);
    const [width, setHeaderWidth] = useState(0);
    const RO = useRef(null);

    useEffect(() => {
        if (RO.current === null && ref.current !== null) {
            RO.current = new ResizeObserver(() => setHeaderWidth(ref.current.offsetWidth));
            RO.current.observe(ref.current);
        }

        const currentRef = ref.current;

        return () => {
            if (RO.current !== null) {
                RO.current.unobserve(currentRef);
                RO.current.disconnect();
                RO.current = null;
            }
        };
    }, []);

    return {ref, width};
};
