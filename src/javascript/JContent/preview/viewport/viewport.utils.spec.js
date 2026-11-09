import {supportsViewport} from './viewport.utils';

describe('supportsViewport', () => {
    it('applies to rendered content and pages', () => {
        expect(supportsViewport({path: '/sites/s/home', isPage: true})).toBe(true);
        expect(supportsViewport({path: '/sites/s/home/area/text', isFile: false, isFolder: false})).toBe(true);
    });

    it('does not apply to a file, which has its own viewer', () => {
        expect(supportsViewport({path: '/sites/s/files/a.png', isFile: true})).toBe(false);
    });

    it('does not apply to a folder, which has nothing to render', () => {
        expect(supportsViewport({path: '/sites/s/contents', isFolder: true})).toBe(false);
    });

    it('does not apply when there is no node yet', () => {
        expect(supportsViewport(null)).toBe(false);
        expect(supportsViewport(undefined)).toBe(false);
    });
});
