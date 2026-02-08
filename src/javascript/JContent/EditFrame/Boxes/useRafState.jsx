import {useCallback, useEffect, useRef, useState} from 'react';

/**
 * Like useState, but batches setState calls to requestAnimationFrame.
 * Great for hover/mousemove-driven state.
 */
export const useRafState = initialValue => {
    const [state, setState] = useState(initialValue);
    const frame = useRef(0);
    const queued = useRef(false);
    const next = useRef(state);

    useEffect(() => {
        next.current = state;
    }, [state]);

    useEffect(() => {
        return () => {
            if (frame.current) {
                cancelAnimationFrame(frame.current);
            }
        };
    }, []);

    const setRafState = useCallback(value => {
        next.current = typeof value === 'function' ? value(next.current) : value;

        if (queued.current) return;
        queued.current = true;

        frame.current = requestAnimationFrame(() => {
            queued.current = false;
            setState(next.current);
        });
    }, []);

    return [state, setRafState];
};
