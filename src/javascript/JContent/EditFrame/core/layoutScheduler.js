import {createContext, useCallback, useContext, useLayoutEffect, useRef, useState} from 'react';

const PORTAL_ROOT_SELECTOR = '#jahia-portal-root';

// Transforms and animations (carousels) move content without any event a page can observe, so a
// slow sweep still catches what the observers cannot see.
const FALLBACK_INTERVAL = 500;

const isInsidePortal = node => {
    const element = node.nodeType === 1 ? node : node.parentElement;
    return Boolean(element?.closest(PORTAL_ROOT_SELECTOR));
};

/**
 * Re-measures the overlays only when the page can have moved, and at most once per frame.
 *
 * A tracker is a callback that reads the geometry of one element and stores it. The scheduler runs
 * every tracker in one animation frame after any of these: a resize of the document or of a tracked
 * element, a change in the page's DOM outside the overlays, an image or font load, the end of a CSS
 * transition, a scroll (for fixed and sticky content), or the fallback sweep.
 */
export const createLayoutScheduler = doc => {
    const win = doc.defaultView;
    const trackers = new Set();
    const observedCount = new Map();
    let frame = null;

    const flush = () => {
        frame = null;
        trackers.forEach(tracker => tracker());
    };

    const schedule = () => {
        if (frame === null) {
            frame = win.requestAnimationFrame(flush);
        }
    };

    const resizeObserver = new win.ResizeObserver(schedule);
    resizeObserver.observe(doc.documentElement);

    const mutationObserver = new win.MutationObserver(records => {
        if (records.some(record => !isInsidePortal(record.target))) {
            schedule();
        }
    });
    mutationObserver.observe(doc.body, {childList: true, subtree: true, attributes: true, characterData: true});

    const capturedEvents = ['load', 'transitionend', 'animationend'];
    capturedEvents.forEach(type => doc.addEventListener(type, schedule, true));
    win.addEventListener('resize', schedule);
    win.addEventListener('scroll', schedule, {passive: true});
    doc.fonts?.ready.then(schedule);
    const interval = win.setInterval(schedule, FALLBACK_INTERVAL);

    const observe = element => {
        observedCount.set(element, (observedCount.get(element) || 0) + 1);
        resizeObserver.observe(element);
    };

    const unobserve = element => {
        const count = observedCount.get(element) - 1;
        if (count > 0) {
            observedCount.set(element, count);
        } else {
            observedCount.delete(element);
            resizeObserver.unobserve(element);
        }
    };

    return {
        schedule,
        track: (tracker, element) => {
            trackers.add(tracker);
            if (element) {
                observe(element);
            }

            return () => {
                trackers.delete(tracker);
                if (element) {
                    unobserve(element);
                }
            };
        },
        destroy: () => {
            if (frame !== null) {
                win.cancelAnimationFrame(frame);
            }

            win.clearInterval(interval);
            resizeObserver.disconnect();
            mutationObserver.disconnect();
            capturedEvents.forEach(type => doc.removeEventListener(type, schedule, true));
            win.removeEventListener('resize', schedule);
            win.removeEventListener('scroll', schedule);
            trackers.clear();
        }
    };
};

export const LayoutSchedulerContext = createContext(null);

const isSameRect = (a, b) => Object.keys(b).every(key => a[key] === b[key]) && Object.keys(a).length === Object.keys(b).length;

/**
 * The geometry of an element, kept current by the layout scheduler. `measure` maps the element to
 * the rectangle to store; pass a stable function, since a new one re-measures at once.
 */
export const useTrackedRect = (element, measure) => {
    const scheduler = useContext(LayoutSchedulerContext);
    const [rect, setRect] = useState(() => measure(element));
    const measureRef = useRef(measure);
    measureRef.current = measure;

    const update = useCallback(() => {
        const next = measureRef.current(element);
        setRect(previous => (isSameRect(previous, next) ? previous : next));
    }, [element]);

    useLayoutEffect(() => scheduler?.track(update, element), [scheduler, update, element]);
    useLayoutEffect(update, [update, measure]);

    return rect;
};
