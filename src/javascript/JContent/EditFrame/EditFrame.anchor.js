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
 *
 * Both windows are wall-clock milliseconds, and both are sized from what a long page actually does.
 * Measured on digitall's home page (55000px tall, 1332 modules) by sampling the document every 100ms
 * after a page-builder reload: it arrives 33060px tall, is still growing at 11.4s, and reaches its
 * final 54836px at 14.9s — and it grows in bursts, going as long as 3.6s between them looking exactly
 * like a page that has finished. A quiet window shorter than that pause is not evidence of anything,
 * and a cap shorter than the settle abandons the anchor mid-load. Waiting longer than needed is the
 * cheap mistake here: with the page still, the watch only reads it, and the moment the editor touches
 * the scrollbar it steps out for good.
 */
export const QUIET_FOR = 5000;
export const HARD_CAP = 30000;
export const POLL_INTERVAL = 50;

/** Below this, a correction is not worth making — sub-pixel layout noise, not a real shift. */
const TOLERANCE = 1;

// Anything the user does to scroll the frame themselves — once they take over, we step out.
const USER_SCROLL_EVENTS = ['wheel', 'touchmove', 'keydown'];

/** How much of the viewport's right edge counts as the scrollbar when it takes no layout width. */
const OVERLAY_SCROLLBAR_BAND = 20;

/**
 * Only an absolute path identifies the node a module is showing, and only an identity can be an
 * anchor — it has to be found again in the reloaded document, and found as the *same* module.
 *
 * Two kinds of value fail that. A module renders `path="*"` when it stands for content in general
 * rather than one node — an insertion point in an empty area, say — and there are hundreds of those
 * on a page of any size. A module can also render a path relative to its parent, which is why
 * Boxes.jsx resolves one against `data-jahia-parent` before it uses it. Either way the lookup returns
 * whichever such module comes first in the document — near the top of the page, and nothing to do
 * with what was in view — so the anchor reads as an enormous drift and drags the editor there:
 * measured on digitall's home page as a jump from 30035px to 814px.
 */
const identifiesANode = path => Boolean(path) && path.startsWith('/');

/** Matches only the modules whose path is an identity, per identifiesANode. */
const ANCHORABLE = '[jahiatype="module"][path^="/"]';

const findModule = (win, path) => (identifiesANode(path) ?
    win.document.querySelector(`[jahiatype="module"][path="${path}"]`) :
    null);

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
            return {path: workedOnPath, top: rect.top, left: rect.left};
        }
    }

    return [...win.document.querySelectorAll(ANCHORABLE)]
        .map(element => ({element, rect: element.getBoundingClientRect()}))
        .filter(({rect}) => rect.bottom > 0 && rect.top < win.innerHeight)
        .map(({element, rect}) => ({path: element.getAttribute('path'), top: rect.top, left: rect.left}))
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
    if (!element) {
        return null;
    }

    const rect = element.getBoundingClientRect();
    return {down: rect.top - anchor.top, across: rect.left - anchor.left};
};

/**
 * A press on the frame's own scrollbar, which is the one way of scrolling that produces no wheel,
 * touch or key event — so without this the watch would carry on overriding an editor dragging the
 * thumb, for as long as it holds the anchor.
 *
 * Deliberately not a `scroll` listener comparing against the position we set: the browser moves the
 * scroll by itself too (scroll anchoring, keeping content still as the page above it grows), and
 * reading that as the editor taking over would abandon the anchor on exactly the slow-loading pages
 * this exists for.
 */
const isScrollbarPress = (win, event) => {
    const laidOut = win.document.documentElement.clientWidth;

    // A classic scrollbar is left out of clientWidth, so anything at or past it is on the bar. An
    // overlay scrollbar (macOS) takes no width at all and sits over the content, so there the last few
    // pixels of the viewport have to stand in for it.
    const isOverlay = win.innerWidth - laidOut < 1;
    return event.clientX >= (isOverlay ? win.innerWidth - OVERLAY_SCROLLBAR_BAND : laidOut);
};

/**
 * Puts the anchored module back where it was, and keeps it there while the document settles.
 *
 * Stops as soon as the page holds still, when the timeout elapses, or when the user takes over the
 * scrollbar — we never fight them for it. Returns a function that stops it early.
 */
export const restoreAnchor = (win, anchor, {fallback, quietFor = QUIET_FOR, cap = HARD_CAP, interval = POLL_INTERVAL} = {}) => {
    // Once the anchored content is missing, this watch treats it as missing for good. It can come back
    // — a refetch re-rendering the module — and lining up with it then would throw the editor to
    // wherever it reappeared, which is the opposite of holding the view still.
    let isAnchorGone = false;
    let moved = false;
    let isClamped = false;

    /**
     * Scrolls where asked, and notices when the frame could not go there — a reloaded document is
     * shorter than it ends up, so a position further down than it can reach yet lands short of the ask.
     * That is the page still owing us height, not the page having settled, and the difference decides
     * whether the watch waits or lets go.
     */
    const scrollTowards = (across, down) => {
        win.scrollTo(across, down);
        isClamped = isClamped || Math.abs(win.scrollY - down) > TOLERANCE;
    };

    const holdAnchor = () => {
        const offBy = drift(win, anchor);

        if (offBy === null) {
            // Not in the new document: deleted, or moved elsewhere.
            isAnchorGone = true;
            return;
        }

        if (Math.abs(offBy.down) > TOLERANCE || Math.abs(offBy.across) > TOLERANCE) {
            scrollTowards(win.scrollX + offBy.across, win.scrollY + offBy.down);
        }
    };

    /**
     * With nothing to line up with, the offset the editor had is the best guess left. It is worth
     * re-asserting rather than firing once: the reloaded document is far shorter than it ends up
     * (33060px of an eventual 54836px, measured on digitall's home page), so a single shot at an offset
     * beyond what it can scroll to yet is silently clamped, and nothing would ever come back to it.
     */
    const holdOffset = () => {
        if (!fallback) {
            return;
        }

        if (Math.abs(fallback.scrollY - win.scrollY) > TOLERANCE || Math.abs(fallback.scrollX - win.scrollX) > TOLERANCE) {
            scrollTowards(fallback.scrollX, fallback.scrollY);
        }
    };

    const correct = () => {
        const wasDown = win.scrollY;
        const wasAcross = win.scrollX;
        isClamped = false;

        if (!isAnchorGone) {
            holdAnchor();
        }

        // Checked again rather than in an else: holdAnchor may have just discovered the content is
        // gone, and the offset should take over on this same pass.
        if (isAnchorGone) {
            holdOffset();
        }

        // What the quiet window is really asking is whether the view is still being pulled about, so
        // what counts is whether it actually moved — not whether we asked it to.
        moved = Math.abs(win.scrollY - wasDown) > TOLERANCE || Math.abs(win.scrollX - wasAcross) > TOLERANCE;
    };

    correct();
    if (isAnchorGone && !fallback) {
        // Nothing in the new document to line up with, and no offset to fall back on.
        return () => {};
    }

    let poll = null;
    const stop = () => {
        if (poll !== null) {
            win.clearInterval(poll);
            poll = null;
        }

        USER_SCROLL_EVENTS.forEach(type => win.removeEventListener(type, stop));
        win.removeEventListener('mousedown', onScrollbarPress);
    };

    function onScrollbarPress(event) {
        if (isScrollbarPress(win, event)) {
            stop();
        }
    }

    // Deliberately not "stop once it lines up": it lines up immediately, then drifts again on the
    // next thing to load. What ends the watch is the page going quiet — no correction needed and no
    // change in height for a while — because that is the only evidence that there is nothing left to
    // move the anchor.
    //
    // Both windows are read off the clock rather than counted in ticks. Counting assumes the interval
    // fires on schedule, and on the page that needs this most it does not come close: measured on
    // digitall's home page, a 50ms interval fired every 806ms while the reloaded document laid itself
    // out, because it is competing with that layout for the frame's one thread. Counted in ticks, the
    // 2s quiet window then lasts 32s and the 15s cap that is supposed to bound the whole thing lasts
    // nearly 4 minutes — so the watch spends most of a minute overriding a scroll position the editor
    // is trying to change.
    let lastHeight = win.document.documentElement.scrollHeight;
    const startedAt = Date.now();
    let quietSince = startedAt;

    // Left as a timer knowingly, and this is the case against it: reading scrollHeight and every
    // getBoundingClientRect forces the frame to lay out synchronously, and this asks for both several
    // times a second, on the one thread that is already busy laying out the document it is watching.
    // The contention is real and measured — the 50ms interval above actually fired every 806ms on
    // digitall's home page, and a 100ms sampler in the parent window stalled up to 3105ms, so it is the
    // whole main thread rather than this frame — and this poll is one of the things on it, alongside the
    // 50ms interval EditFrame already runs for the boxes.
    //
    // What is *not* established is that it makes any difference to how long the page takes to settle,
    // and guessing at that by loosening the interval would trade a real behaviour for an unmeasured
    // one. So no change here for now; it wants a measurement first — settle time at 50ms against, say,
    // 150ms, on a page of this size.
    //
    // A ResizeObserver would not simply replace this either: it reports the document changing size, and
    // the anchor can move without that happening at all — content above it replaced by content of the
    // same height. Something at a low frequency would still have to watch for that.
    poll = win.setInterval(() => {
        correct();

        const height = win.document.documentElement.scrollHeight;
        const now = Date.now();

        // Three things say the page is not done with us: the view moved, it changed height, or it could
        // not go where the anchor needs it. That last one is the one worth spelling out — a frame pinned
        // at the end of a document that has not finished arriving looks perfectly still, and reading
        // that as settled lets go exactly when the rest of the page is about to push the content away.
        if (moved || isClamped || height !== lastHeight) {
            quietSince = now;
        }

        lastHeight = height;

        if (now - quietSince >= quietFor || now - startedAt >= cap) {
            stop();
        }
    }, interval);

    USER_SCROLL_EVENTS.forEach(type => win.addEventListener(type, stop));
    win.addEventListener('mousedown', onScrollbarPress);

    return stop;
};
