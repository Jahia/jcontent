import {captureAnchor, HARD_CAP, POLL_INTERVAL, QUIET_FOR, restoreAnchor} from './EditFrame.anchor';

/**
 * A window with a list of modules at known document positions, which we can move around the way a
 * reloaded page-builder document does while its boxes and images arrive.
 */
const createWindow = ({modules, viewportHeight = 500, viewportWidth = 1000, documentWidth = 1000}) => {
    const listeners = {};
    const win = {
        scrollX: 0,
        scrollY: 0,
        innerHeight: viewportHeight,
        innerWidth: viewportWidth,
        modules,
        // Clamped at both ends like a real one. The upper clamp matters: a reloaded document is shorter
        // than it ends up, so an ask beyond what it can scroll to yet lands short rather than where it
        // was asked, and code that assumes otherwise silently never gets there.
        scrollTo(x, y) {
            const furthest = Math.max(0, win.document.documentElement.scrollHeight - win.innerHeight);
            win.scrollX = Math.max(0, x);
            win.scrollY = Math.min(Math.max(0, y), furthest);
        },
        setInterval: (...args) => setInterval(...args),
        clearInterval: id => clearInterval(id),
        addEventListener(type, listener) {
            listeners[type] = [...(listeners[type] || []), listener];
        },
        removeEventListener(type, listener) {
            listeners[type] = (listeners[type] || []).filter(l => l !== listener);
        },
        dispatch(type, event) {
            (listeners[type] || []).forEach(listener => listener(event));
        }
    };

    // Queries run against a real document rather than a hand-rolled matcher, so that what the
    // selectors actually mean is part of what these tests check — the defect being guarded here was
    // a selector matching modules it should not have. It is rebuilt per query because the tests move
    // the modules about mid-flight, the way a page settling after a reload does.
    const asDocument = () => {
        const doc = document.implementation.createHTMLDocument();
        win.modules.forEach(module => {
            const element = doc.createElement('div');
            element.setAttribute('jahiatype', 'module');
            element.setAttribute('path', module.path);
            element.getBoundingClientRect = () => ({
                top: module.documentTop - win.scrollY,
                bottom: module.documentTop + module.height - win.scrollY,
                left: (module.documentLeft || 0) - win.scrollX
            });
            doc.body.appendChild(element);
        });

        return doc;
    };

    win.document = {
        documentElement: {
            clientWidth: documentWidth,
            get scrollHeight() {
                return win.modules.reduce((tallest, m) => Math.max(tallest, m.documentTop + m.height), 0);
            }
        },
        querySelectorAll: selector => asDocument().querySelectorAll(selector),
        querySelector: selector => asDocument().querySelector(selector)
    };

    return win;
};

const modules = () => [
    {path: '/a', documentTop: 0, height: 400},
    {path: '/b', documentTop: 400, height: 400},
    {path: '/c', documentTop: 800, height: 400}
];

describe('captureAnchor', () => {
    it('should anchor on the module starting closest to the top of the viewport', () => {
        const win = createWindow({modules: modules()});
        win.scrollTo(0, 450);

        // /a ends at 400 and is gone; /b runs 400-800, starting 50px above the top edge, and /c is
        // 350px below it
        expect(captureAnchor(win)).toEqual({path: '/b', top: -50, left: 0});
    });

    it('should anchor on the content rather than the area enclosing it', () => {
        // The area spans the whole page, so it is first in document order and in view — but holding
        // an area still says nothing about where the content inside it ends up
        const win = createWindow({modules: [
            {path: '/area', documentTop: 0, height: 2000},
            {path: '/area/list', documentTop: 400, height: 400}
        ]});
        win.scrollTo(0, 400);

        expect(captureAnchor(win)).toEqual({path: '/area/list', top: 0, left: 0});
    });

    it('should anchor on the content being worked on wherever it is on screen', () => {
        const win = createWindow({modules: [
            {path: '/area', documentTop: 0, height: 2000},
            {path: '/area/near-top', documentTop: 400, height: 100},
            {path: '/area/edited', documentTop: 700, height: 100}
        ]});
        win.scrollTo(0, 400);

        // /area/near-top starts exactly at the top edge, but the editor is working on /area/edited
        expect(captureAnchor(win, '/area/edited')).toEqual({path: '/area/edited', top: 300, left: 0});
    });

    it('should fall back to geometry when the content being worked on is off screen', () => {
        const win = createWindow({modules: [
            {path: '/area', documentTop: 0, height: 2000},
            {path: '/area/visible', documentTop: 400, height: 100},
            {path: '/area/offscreen', documentTop: 1800, height: 100}
        ]});
        win.scrollTo(0, 400);

        expect(captureAnchor(win, '/area/offscreen').path).toBe('/area/visible');
    });

    it('should prefer the deepest module when several start at the same place', () => {
        const win = createWindow({modules: [
            {path: '/area', documentTop: 100, height: 800},
            {path: '/area/list', documentTop: 100, height: 400},
            {path: '/area/list/text', documentTop: 100, height: 200}
        ]});

        expect(captureAnchor(win).path).toBe('/area/list/text');
    });

    it('should return nothing when there is no module to anchor to', () => {
        expect(captureAnchor(createWindow({modules: []}))).toBeNull();
    });

    // A module standing for content in general rather than one node renders path="*". Hundreds of them
    // sit on a page of any size, so the path identifies nothing: looked up in the reloaded document it
    // finds whichever comes first, near the top of the page, and the anchor drags the editor there.
    it('should not anchor on a module that stands for content in general', () => {
        const win = createWindow({modules: [
            {path: '*', documentTop: 400, height: 100},
            {path: '/area/text', documentTop: 500, height: 1000}
        ]});
        win.scrollTo(0, 400);

        // The insertion point starts exactly at the top edge and would win on geometry alone
        expect(captureAnchor(win)).toEqual({path: '/area/text', top: 100, left: 0});
    });

    it('should return nothing when the only modules in view stand for content in general', () => {
        const win = createWindow({modules: [{path: '*', documentTop: 0, height: 100}]});

        // Better the raw offset than an anchor that resolves to an unrelated part of the page
        expect(captureAnchor(win)).toBeNull();
    });

    it('should not anchor on the content being worked on when it has no path of its own', () => {
        const win = createWindow({modules: [
            {path: '*', documentTop: 0, height: 100},
            {path: '/area/text', documentTop: 100, height: 100}
        ]});

        expect(captureAnchor(win, '*')).toEqual({path: '/area/text', top: 100, left: 0});
    });

    // A module can render a path relative to its parent, which Boxes.jsx resolves against
    // data-jahia-parent before it uses it. On its own such a name is not unique in the document, so it
    // is no more an identity than '*' is.
    it('should not anchor on a module whose path is relative', () => {
        const win = createWindow({modules: [
            {path: 'text-1', documentTop: 0, height: 100},
            {path: '/area/list/text-1', documentTop: 100, height: 100}
        ]});

        expect(captureAnchor(win)).toEqual({path: '/area/list/text-1', top: 100, left: 0});
    });

    it('should not anchor on the content being worked on when its path is relative', () => {
        const win = createWindow({modules: [
            {path: 'text-1', documentTop: 0, height: 100},
            {path: '/area/list/text-1', documentTop: 100, height: 100}
        ]});

        expect(captureAnchor(win, 'text-1').path).toBe('/area/list/text-1');
    });
});

describe('restoreAnchor', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should put the anchored module back where it was', () => {
        const win = createWindow({modules: modules()});

        // Everything above the anchor got 300px taller — an image that loaded, say
        win.modules = [
            {path: '/a', documentTop: 0, height: 700},
            {path: '/b', documentTop: 700, height: 400},
            {path: '/c', documentTop: 1100, height: 400}
        ];

        restoreAnchor(win, {path: '/b', top: -50, left: 0});

        // /b has to end up 50px above the top edge again, so 750 rather than the old 450
        expect(win.scrollY).toBe(750);
    });

    it('should hold the anchor while the document keeps moving', () => {
        const win = createWindow({modules: modules()});
        restoreAnchor(win, {path: '/b', top: 100, left: 0});
        expect(win.scrollY).toBe(300);

        // Late-loading content above the anchor pushes it down; the correction follows it
        win.modules[0].height = 600;
        win.modules[1].documentTop = 600;
        win.modules[2].documentTop = 1000;
        jest.advanceTimersByTime(100);

        expect(win.scrollY).toBe(500);
    });

    it('should stop once the page has gone quiet', () => {
        const win = createWindow({modules: modules()});
        restoreAnchor(win, {path: '/b', top: 100, left: 0});
        jest.advanceTimersByTime(QUIET_FOR + 100);

        // Quiet long enough to have stepped out, so a later shift is the page's business, not ours
        const settled = win.scrollY;
        win.modules[1].documentTop = 4000;
        jest.advanceTimersByTime(QUIET_FOR);

        expect(win.scrollY).toBe(settled);
    });

    it('should keep holding the anchor for as long as the page keeps moving', () => {
        const win = createWindow({modules: modules()});
        restoreAnchor(win, {path: '/b', top: 100, left: 0});

        // Nudge the page every second — well beyond the old fixed 3s window, which is what let a
        // slow-loading digitall home page settle at the wrong offset
        for (let elapsed = 0; elapsed < 8000; elapsed += 1000) {
            win.modules[0].height += 100;
            win.modules[1].documentTop += 100;
            jest.advanceTimersByTime(1000);
            expect(win.scrollY).toBe(win.modules[1].documentTop - 100);
        }
    });

    it('should give up at the hard cap on a page that never settles', () => {
        const win = createWindow({modules: modules()});
        restoreAnchor(win, {path: '/b', top: 100, left: 0});

        for (let elapsed = 0; elapsed < HARD_CAP; elapsed += 500) {
            win.modules[1].documentTop += 10;
            jest.advanceTimersByTime(500);
        }

        const abandoned = win.scrollY;
        win.modules[1].documentTop += 1000;
        jest.advanceTimersByTime(QUIET_FOR);

        expect(win.scrollY).toBe(abandoned);
    });

    it('should fall back to the offset when the anchored module is gone', () => {
        const win = createWindow({modules: modules()});
        win.scrollTo(0, 300);

        restoreAnchor(win, {path: '/deleted', top: 100, left: 0}, {fallback: {scrollX: 0, scrollY: 275}});

        expect(win.scrollY).toBe(275);
    });

    it('should never go back to anchoring once the content turned out to be gone', () => {
        const win = createWindow({modules: modules()});

        restoreAnchor(win, {path: '/deleted', top: 100, left: 0}, {fallback: {scrollX: 0, scrollY: 275}});

        // The module reappearing later must not yank the editor to wherever it came back
        win.modules.push({path: '/deleted', documentTop: 3000, height: 100});
        jest.advanceTimersByTime(QUIET_FOR);

        expect(win.scrollY).toBe(275);
    });

    /**
     * The reloaded document is much shorter than it ends up, so the offset the editor had can be further
     * down than it can scroll to yet. Firing once leaves them stranded wherever the clamp put them, with
     * nothing to bring them back — the reason this keeps asserting the offset rather than shooting once.
     */
    it('should keep reaching for the fallback offset until the document is tall enough to hold it', () => {
        const win = createWindow({modules: [{path: '/a', documentTop: 0, height: 800}]});

        restoreAnchor(win, {path: '/deleted', top: 0, left: 0}, {fallback: {scrollX: 0, scrollY: 2000}});

        // 800 tall against a 500 viewport: 300 is as far as it goes for now
        expect(win.scrollY).toBe(300);

        win.modules = [{path: '/a', documentTop: 0, height: 3000}];
        jest.advanceTimersByTime(POLL_INTERVAL * 2);

        expect(win.scrollY).toBe(2000);
    });

    /**
     * A frame pinned at the end of a document that has not finished arriving cannot be corrected at all:
     * the position the anchor needs is further down than the document can scroll to yet, so every ask
     * lands short and nothing on screen moves. It looks exactly like a page that has settled, and letting
     * go there is letting go a moment before the rest of the page arrives and pushes the content away —
     * which is how a refresh landed the watched content 132px below where it started.
     */
    it('should keep holding while the document is too short to be corrected', () => {
        const win = createWindow({modules: [
            {path: '/a', documentTop: 0, height: 300},
            {path: '/b', documentTop: 300, height: 300}
        ]});

        // 600 tall against a 500 viewport, so 100 is the end of it, and /b cannot come up past 200
        win.scrollTo(0, 100);
        restoreAnchor(win, {path: '/b', top: 0, left: 0});
        expect(win.scrollY).toBe(100);

        // Long enough that a watch mistaking the clamp for quiet would have stepped out by now
        jest.advanceTimersByTime(QUIET_FOR + POLL_INTERVAL);

        // The rest of the page arrives
        win.modules.push({path: '/c', documentTop: 600, height: 900});
        jest.advanceTimersByTime(POLL_INTERVAL * 2);

        expect(win.scrollY).toBe(300);
    });

    /**
     * The anchored content can go missing after the watch has started — a refetch removing the module
     * the editor just deleted, say. Handing that to the offset is only half the job: the watch also has
     * to be able to finish. Counting "a correction was called for" as movement leaves the last answer
     * standing for ever once the anchor stops answering, so nothing accumulates towards quiet and the
     * only way out is the cap — half a minute of putting the editor back where they no longer are.
     */
    it('should settle after the anchored content goes missing mid-flight', () => {
        const win = createWindow({modules: modules()});

        restoreAnchor(win, {path: '/b', top: 100, left: 0}, {fallback: {scrollX: 0, scrollY: 275}});
        expect(win.scrollY).toBe(300);

        // A correction lands, so "a correction was called for" is true at the moment it disappears
        win.modules[1].documentTop = 500;
        jest.advanceTimersByTime(POLL_INTERVAL);
        expect(win.scrollY).toBe(400);

        win.modules = win.modules.filter(m => m.path !== '/b');
        jest.advanceTimersByTime(QUIET_FOR + (POLL_INTERVAL * 2));

        // Settled on the offset and let go of it, so the editor can move away and stay there
        win.scrollTo(0, 500);
        jest.advanceTimersByTime(QUIET_FOR);

        expect(win.scrollY).toBe(500);
    });

    it('should stop holding the fallback offset once the page has gone quiet', () => {
        const win = createWindow({modules: modules()});

        restoreAnchor(win, {path: '/deleted', top: 0, left: 0}, {fallback: {scrollX: 0, scrollY: 275}});
        jest.advanceTimersByTime(QUIET_FOR + POLL_INTERVAL);

        // Let go rather than run to the cap: an offset it cannot reach must not mean holding the editor
        // down for another half a minute
        win.scrollTo(0, 500);
        jest.advanceTimersByTime(QUIET_FOR);

        expect(win.scrollY).toBe(500);
    });

    it('should not hold anything when the content is gone and there is no offset to fall back on', () => {
        const win = createWindow({modules: modules()});
        win.scrollTo(0, 300);

        restoreAnchor(win, {path: '/deleted', top: 100, left: 0});

        expect(win.scrollY).toBe(300);
    });

    it('should put back the horizontal position too', () => {
        const win = createWindow({modules: [
            {path: '/a', documentTop: 0, height: 2000, documentLeft: 400}
        ]});

        restoreAnchor(win, {path: '/a', top: 0, left: 100});

        // The module sits 400 across in the document and has to end up 100 from the left edge again
        expect(win.scrollX).toBe(300);
    });

    /**
     * Dragging the scrollbar is the one way of scrolling that raises no wheel, touch or key event, so
     * without this the watch carries on overriding the editor for as long as it holds the anchor.
     */
    it('should step out when the editor presses the scrollbar', () => {
        const win = createWindow({modules: modules(), viewportWidth: 1000, documentWidth: 985});

        restoreAnchor(win, {path: '/b', top: 100, left: 0});
        win.dispatch('mousedown', {clientX: 992});

        const released = win.scrollY;
        win.modules[1].documentTop = 4000;
        jest.advanceTimersByTime(QUIET_FOR);

        expect(win.scrollY).toBe(released);
    });

    it('should keep holding when the editor clicks inside the page', () => {
        const win = createWindow({modules: modules(), viewportWidth: 1000, documentWidth: 985});

        restoreAnchor(win, {path: '/b', top: 100, left: 0});
        win.dispatch('mousedown', {clientX: 500});

        win.modules[0].height = 600;
        win.modules[1].documentTop = 600;
        jest.advanceTimersByTime(POLL_INTERVAL * 2);

        expect(win.scrollY).toBe(500);
    });

    // The page this exists for is the page that starves the timer: the interval competes with the
    // layout of the document it is watching, over one thread. Measured on digitall's home page, a 50ms
    // interval fired every 806ms. Both windows therefore have to come off the clock — counted in ticks,
    // the 2s quiet window lasted 32s of real time and the 15s cap nearly 4 minutes, and the watch spent
    // most of a minute putting back a scroll position the editor was trying to change.
    it('should measure the quiet window in real time, not in ticks', () => {
        const starved = 16;
        const win = createWindow({modules: modules()});
        win.setInterval = (callback, requested) => setInterval(callback, requested * starved);

        restoreAnchor(win, {path: '/b', top: 100, left: 0});
        jest.advanceTimersByTime(QUIET_FOR + (POLL_INTERVAL * starved));

        const settled = win.scrollY;
        win.modules[1].documentTop = 4000;
        jest.advanceTimersByTime(QUIET_FOR * starved);

        expect(win.scrollY).toBe(settled);
    });

    it('should give up at the hard cap in real time on a page that never settles', () => {
        const starved = 16;
        const win = createWindow({modules: modules()});
        win.setInterval = (callback, requested) => setInterval(callback, requested * starved);

        restoreAnchor(win, {path: '/b', top: 100, left: 0});

        // Past the cap, plus the tick that notices it — a starved interval only reads the clock when it
        // gets to run
        for (let elapsed = 0; elapsed < HARD_CAP + (POLL_INTERVAL * starved); elapsed += 500) {
            win.modules[1].documentTop += 10;
            jest.advanceTimersByTime(500);
        }

        const abandoned = win.scrollY;
        win.modules[1].documentTop += 1000;
        jest.advanceTimersByTime(HARD_CAP);

        expect(win.scrollY).toBe(abandoned);
    });

    it('should stop when cancelled', () => {
        const win = createWindow({modules: modules()});
        const cancel = restoreAnchor(win, {path: '/b', top: 100, left: 0});
        cancel();

        const settled = win.scrollY;
        win.modules[1].documentTop = 4000;
        jest.advanceTimersByTime(QUIET_FOR);

        expect(win.scrollY).toBe(settled);
    });
});
