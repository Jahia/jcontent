import {useCallback, useEffect, useRef, useState} from 'react';
import {DEFAULT_VIEWPORT_WIDTH} from './viewport.constants';

/**
 * Renders a preview at a chosen viewport width and scales it down to whatever room the pane has.
 *
 * The scale depends on the measured pane, not on an assumption, because the pane changes with the
 * window and with the side panel being resized. Measuring happens from a callback ref rather than an
 * effect so that a frame which unmounts and comes back - switching sample, or a preview that renders
 * a placeholder first - is re-measured on attach without needing a dependency list to chase.
 *
 * @returns {object} - frameRef for the clipping element, plus the current width, size and scale
 */
export const useViewportScale = () => {
    const [viewportWidth, setViewportWidth] = useState(DEFAULT_VIEWPORT_WIDTH);
    const [frameSize, setFrameSize] = useState(null);
    const observerRef = useRef(null);

    const frameRef = useCallback(element => {
        observerRef.current?.disconnect();
        observerRef.current = null;

        if (!element) {
            return;
        }

        const measure = () => setFrameSize({width: element.clientWidth, height: element.clientHeight});
        measure();

        if (typeof ResizeObserver !== 'undefined') {
            observerRef.current = new ResizeObserver(measure);
            observerRef.current.observe(element);
        }
    }, []);

    useEffect(() => () => observerRef.current?.disconnect(), []);

    // Never scale up: a narrow viewport in a wide pane should sit at its own size, not be blown up.
    const scaleFor = useCallback(
        width => (frameSize ? Math.min(1, frameSize.width / width) : 1),
        [frameSize]
    );

    return {viewportWidth, setViewportWidth, frameRef, frameSize, scale: scaleFor(viewportWidth), scaleFor};
};
