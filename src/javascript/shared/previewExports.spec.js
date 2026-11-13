import {Preview, buildPreviewContextsFromNode} from '~/JContent/preview';

jest.mock('~/JContent/preview/viewers/PDFViewer', () => ({PDFViewer: () => null}));
jest.mock('~/JContent/preview/viewers/PDFViewer/index.js', () => ({PDFViewer: () => null}));

/**
 * The symbols `shared/index.ts` re-exports for a module that previews a node on its own surface.
 *
 * Like the side panel exports, a consumer resolves them at runtime in another repository, so a
 * rename here builds and only fails there. This imports the modules the barrel imports, by the same
 * paths, and does not read the barrel itself.
 */
describe('the preview exports', () => {
    it('exposes the preview shell', () => {
        expect(typeof Preview).toBe('function');
    });

    it('exposes the context builder that turns a node into preview contexts', () => {
        const contexts = buildPreviewContextsFromNode({
            path: '/sites/digitall/samples/components/vision',
            isPage: false,
            displayableNode: {path: '/sites/digitall/samples/components/vision', isFolder: false},
            pageAncestors: [{path: '/sites/digitall/home'}]
        }, 'en');

        expect(contexts.primary).toMatchObject({
            path: '/sites/digitall/samples/components/vision',
            contextConfiguration: 'module',
            view: 'default',
            mainResourcePath: '/sites/digitall/home',
            cssSourcePath: '/sites/digitall/home'
        });
    });
});
