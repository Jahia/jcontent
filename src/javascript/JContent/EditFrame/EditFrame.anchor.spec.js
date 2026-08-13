import {captureAnchor, HARD_CAP, POLL_INTERVAL, QUIET_FOR, restoreAnchor} from './EditFrame.anchor';

/**
 * A window with a list of modules at known document positions, which we can move around the way a
 * reloaded page-builder document does while its boxes and images arrive.
 */
const createWindow = ({modules, viewportHeight = 500}) => {
    const win = {
        scrollX: 0,
        scrollY: 0,
        innerHeight: viewportHeight,
        modules,
        scrollTo(x, y) {
            win.scrollX = x;
            win.scrollY = Math.max(0, y);
        },
        setInterval: (...args) => setInterval(...args),
        clearInterval: id => clearInterval(id),
        addEventListener() {},
        removeEventListener() {}
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
                bottom: module.documentTop + module.height - win.scrollY
            });
            doc.body.appendChild(element);
        });

        return doc;
    };

    win.document = {
        documentElement: {
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
        expect(captureAnchor(win)).toEqual({path: '/b', top: -50});
    });

    it('should anchor on the content rather than the area enclosing it', () => {
        // The area spans the whole page, so it is first in document order and in view — but holding
        // an area still says nothing about where the content inside it ends up
        const win = createWindow({modules: [
            {path: '/area', documentTop: 0, height: 2000},
            {path: '/area/list', documentTop: 400, height: 400}
        ]});
        win.scrollTo(0, 400);

        expect(captureAnchor(win)).toEqual({path: '/area/list', top: 0});
    });

    it('should anchor on the content being worked on wherever it is on screen', () => {
        const win = createWindow({modules: [
            {path: '/area', documentTop: 0, height: 2000},
            {path: '/area/near-top', documentTop: 400, height: 100},
            {path: '/area/edited', documentTop: 700, height: 100}
        ]});
        win.scrollTo(0, 400);

        // /area/near-top starts exactly at the top edge, but the editor is working on /area/edited
        expect(captureAnchor(win, '/area/edited')).toEqual({path: '/area/edited', top: 300});
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
            {path: '/area/text', documentTop: 500, height: 100}
        ]});
        win.scrollTo(0, 400);

        // The insertion point starts exactly at the top edge and would win on geometry alone
        expect(captureAnchor(win)).toEqual({path: '/area/text', top: 100});
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

        expect(captureAnchor(win, '*')).toEqual({path: '/area/text', top: 100});
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

        restoreAnchor(win, {path: '/b', top: -50});

        // /b has to end up 50px above the top edge again, so 750 rather than the old 450
        expect(win.scrollY).toBe(750);
    });

    it('should hold the anchor while the document keeps moving', () => {
        const win = createWindow({modules: modules()});
        restoreAnchor(win, {path: '/b', top: 100});
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
        restoreAnchor(win, {path: '/b', top: 100});
        jest.advanceTimersByTime(QUIET_FOR + 100);

        // Quiet long enough to have stepped out, so a later shift is the page's business, not ours
        const settled = win.scrollY;
        win.modules[1].documentTop = 4000;
        jest.advanceTimersByTime(QUIET_FOR);

        expect(win.scrollY).toBe(settled);
    });

    it('should keep holding the anchor for as long as the page keeps moving', () => {
        const win = createWindow({modules: modules()});
        restoreAnchor(win, {path: '/b', top: 100});

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
        restoreAnchor(win, {path: '/b', top: 100});

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

        restoreAnchor(win, {path: '/deleted', top: 100}, {fallback: {scrollX: 0, scrollY: 275}});

        expect(win.scrollY).toBe(275);
    });

    it('should not keep watching once the anchor turned out to be gone', () => {
        const win = createWindow({modules: modules()});

        restoreAnchor(win, {path: '/deleted', top: 100}, {fallback: {scrollX: 0, scrollY: 275}});

        // The module reappearing later must not yank the editor around
        win.modules.push({path: '/deleted', documentTop: 3000, height: 100});
        jest.advanceTimersByTime(QUIET_FOR);

        expect(win.scrollY).toBe(275);
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

        restoreAnchor(win, {path: '/b', top: 100});
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

        restoreAnchor(win, {path: '/b', top: 100});

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
        const cancel = restoreAnchor(win, {path: '/b', top: 100});
        cancel();

        const settled = win.scrollY;
        win.modules[1].documentTop = 4000;
        jest.advanceTimersByTime(QUIET_FOR);

        expect(win.scrollY).toBe(settled);
    });
});
