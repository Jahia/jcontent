import {buildPreviewContexts} from './previewContext.utils';

describe('buildPreviewContexts', () => {
    const language = 'en';

    it('previews a page as a full page render, without a CSS source', () => {
        const node = {path: '/sites/site/home', uuid: 'p', isPage: true, displayableNode: {path: '/sites/site/home'}};
        const {primary} = buildPreviewContexts(node, language);
        expect(primary.contextConfiguration).toBe('page');
        expect(primary.cssSourcePath).toBeUndefined();
    });

    it('takes the CSS of a displayable content from its own page render', () => {
        const node = {path: '/sites/site/contents/news', uuid: 'n', isPage: false, displayableNode: {path: '/sites/site/contents/news', isFolder: false}};
        const {primary} = buildPreviewContexts(node, language);
        expect(primary.contextConfiguration).toBe('module');
        expect(primary.cssSourcePath).toBe('/sites/site/contents/news');
        expect(primary.cssSourceView).toBeUndefined();
    });

    it('takes the CSS of a content living in a page from that page', () => {
        const node = {path: '/sites/site/home/area/text', uuid: 't', isPage: false, displayableNode: {path: '/sites/site/home', isFolder: false}};
        const {primary} = buildPreviewContexts(node, language);
        expect(primary.cssSourcePath).toBe('/sites/site/home');
        expect(primary.cssSourceView).toBeUndefined();
    });

    it('renders a content with no page of its own through the content-template wrapper for its CSS', () => {
        const node = {path: '/sites/site/contents/form', uuid: 'f', isPage: false, displayableNode: null};
        const {primary} = buildPreviewContexts(node, language);
        expect(primary.contextConfiguration).toBe('module');
        expect(primary.view).toBeNull();
        expect(primary.cssSourcePath).toBe('/sites/site/contents/form');
        expect(primary.cssSourceView).toBe('content-template');
    });

    it('does the same when the displayable node is a folder', () => {
        const node = {path: '/sites/site/contents/form', uuid: 'f', isPage: false, displayableNode: {path: '/sites/site/contents', isFolder: true}};
        const {primary} = buildPreviewContexts(node, language);
        expect(primary.cssSourcePath).toBe('/sites/site/contents/form');
        expect(primary.cssSourceView).toBe('content-template');
    });

    it('leaves the in-context strategies untouched', () => {
        const node = {path: '/sites/site/home/area/text', uuid: 't', isPage: false, displayableNode: {path: '/sites/site/home', isFolder: false}};
        const {primary, fallback} = buildPreviewContexts(node, language, {closestPage: {path: '/sites/site/home'}});
        expect(primary.contextConfiguration).toBe('page');
        expect(fallback.cssSourcePath).toBe('/sites/site/home');
        expect(fallback.cssSourceView).toBeUndefined();
    });
});
