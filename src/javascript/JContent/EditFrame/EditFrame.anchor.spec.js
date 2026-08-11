import {captureAnchor, HARD_CAP, QUIET_FOR, restoreAnchor} from './EditFrame.anchor';

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

    const element = module => ({
        getAttribute: name => (name === 'path' ? module.path : null),
        getBoundingClientRect: () => ({
            top: module.documentTop - win.scrollY,
            bottom: module.documentTop + module.height - win.scrollY
        })
    });

    win.document = {
        documentElement: {
            get scrollHeight() {
                return win.modules.reduce((tallest, m) => Math.max(tallest, m.documentTop + m.height), 0);
            }
        },
        querySelectorAll: () => win.modules.map(element),
        querySelector: selector => {
            const path = selector.match(/path="([^"]+)"/)[1];
            const module = win.modules.find(m => m.path === path);
            return module ? element(module) : null;
        }
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
