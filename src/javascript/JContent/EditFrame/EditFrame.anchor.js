/**
 * Keeping the page still across a reload is not a matter of remembering a scroll offset. An offset
 * only holds the view in place while nothing above it changes height — and after a save plenty does:
 * the edited content itself is a different size, its images load late, and the page-builder
 * decorations arrive with the boxes a few hundred milliseconds after the document does. Restore the
 * number and the editor still loses sight of what they were editing.
 *
 * So remember the view as *content*: which module was at the top of the viewport, and how far below
 * the top edge it sat. Put that module back at that distance and the page looks unmoved, whatever
 * the reload did to everything around it.
 */

/**
 * How long to keep the anchor in place. A fixed window is the wrong shape: a heavy page can be a
 * second and a half settling on a warm cache and considerably longer on a cold one, and stopping
 * early leaves the editor looking at the wrong part of the page — which is the whole defect. So stop
 * when the page has actually gone quiet (QUIET_FOR with the anchor on target and the height still),
 * and only fall back on HARD_CAP for a page that never stops moving.
 */
export const QUIET_FOR = 2000;
export const HARD_CAP = 15000;
export const POLL_INTERVAL = 50;

/** Below this, a correction is not worth making — sub-pixel layout noise, not a real shift. */
const TOLERANCE = 1;

// Anything the user does to scroll the frame themselves — once they take over, we step out.
const USER_SCROLL_EVENTS = ['wheel', 'touchmove', 'keydown'];

const findModule = (win, path) => win.document.querySelector(`[jahiatype="module"][path="${path}"]`);

/**
 * The module the editor is looking at: of those the viewport shows, the one starting closest to its
 * top edge, and the deepest when several start together. Not simply the first in document order —
 * that is the area enclosing everything, and holding an area in place says nothing about where the
 * content inside it ends up, which is the whole point.
 *
 * Returns null for a page with no module in view; there is nothing to anchor to, and the caller
 * should fall back to the raw offset.
 */
export const captureAnchor = (win, workedOnPath) => {
    const depth = path => path.split('/').length;

    if (workedOnPath) {
        // Prefer the content the editor is working on. Picking by geometry alone is not stable enough
        // on a real page: whichever module happens to sit nearest the top edge at this instant wins,
        // nested ones included, and holding a nested module still lets its container move — measured
        // as the same page landing 0px out on one run and 189px out on the next. The content being
        // edited does not shift about like that.
        const preferred = findModule(win, workedOnPath);
        const rect = preferred?.getBoundingClientRect();
        if (rect && rect.bottom > 0 && rect.top < win.innerHeight) {
            return {path: workedOnPath, top: rect.top};
        }
    }

    return [...win.document.querySelectorAll('[jahiatype="module"][path]')]
        .map(element => ({element, rect: element.getBoundingClientRect()}))
        .filter(({rect}) => rect.bottom > 0 && rect.top < win.innerHeight)
        .map(({element, rect}) => ({path: element.getAttribute('path'), top: rect.top}))
        .reduce((best, candidate) => {
            if (!best) {
                return candidate;
            }

            const closer = Math.abs(candidate.top) - Math.abs(best.top);
            const isBetter = closer < 0 || (closer === 0 && depth(candidate.path) > depth(best.path));
            return isBetter ? candidate : best;
        }, null);
};

/** How far the anchored module currently sits from where it should be. Null if it is gone. */
const drift = (win, anchor) => {
    const element = findModule(win, anchor.path);
    return element ? element.getBoundingClientRect().top - anchor.top : null;
};

/**
 * Puts the anchored module back where it was, and keeps it there while the document settles.
 *
 * Stops as soon as the page holds still, when the timeout elapses, or when the user takes over the
 * scrollbar — we never fight them for it. Returns a function that stops it early.
 */
export const restoreAnchor = (win, anchor, {fallback, quietFor = QUIET_FOR, cap = HARD_CAP, interval = POLL_INTERVAL} = {}) => {
    let isAnchorGone = false;
    let corrected = false;

    const correct = () => {
        const offBy = drift(win, anchor);

        if (offBy === null) {
            // The content we were anchored to is not in the new document — deleted, or moved
            // elsewhere. There is nothing to line up with, so the offset the editor had is the best
            // guess available, and a single shot at it beats scrolling somewhere unrelated.
            isAnchorGone = true;
            if (fallback) {
                win.scrollTo(fallback.scrollX, fallback.scrollY);
            }

            return;
        }

        corrected = Math.abs(offBy) > TOLERANCE;
        if (corrected) {
            win.scrollTo(win.scrollX, win.scrollY + offBy);
        }
    };

    correct();
    if (isAnchorGone) {
        return () => {};
    }

    let poll = null;
    const stop = () => {
        if (poll !== null) {
            win.clearInterval(poll);
            poll = null;
        }

        USER_SCROLL_EVENTS.forEach(type => win.removeEventListener(type, stop));
    };

    // Deliberately not "stop once it lines up": it lines up immediately, then drifts again on the
    // next thing to load. What ends the watch is the page going quiet — no correction needed and no
    // change in height for a while — because that is the only evidence that there is nothing left to
    // move the anchor.
    let lastHeight = win.document.documentElement.scrollHeight;
    let quiet = 0;
    let elapsed = 0;

    poll = win.setInterval(() => {
        correct();
        elapsed += interval;

        const height = win.document.documentElement.scrollHeight;
        quiet = (corrected || height !== lastHeight) ? 0 : quiet + interval;
        lastHeight = height;

        if (quiet >= quietFor || elapsed >= cap) {
            stop();
        }
    }, interval);

    USER_SCROLL_EVENTS.forEach(type => win.addEventListener(type, stop));

    return stop;
};
