import {buildSamplePreviewContext} from './previewContext.utils';

describe('buildSamplePreviewContext', () => {
    const PREVIEW_PAGE = '/sites/luxe/home';
    const sample = {
        path: '/sites/luxe/samples/components/page-header',
        uuid: 'sample-uuid',
        jView: {value: 'default'}
    };

    it('should render the sample as a module dressed in the preview page CSS', () => {
        const context = buildSamplePreviewContext(sample, 'en', PREVIEW_PAGE);

        expect(context.path).toBe(sample.path);
        expect(context.contextConfiguration).toBe('module');
        // A module render collects no CSS of its own, so it is taken from a page rendered alongside.
        expect(context.cssSourcePath).toBe(PREVIEW_PAGE);
        // Passed as main resource too, for components that read the current page.
        expect(context.mainResourcePath).toBe(PREVIEW_PAGE);
        expect(context.workspace).toBe('edit');
        expect(context.language).toBe('en');
    });

    it('should not depend on where the sample is stored', () => {
        // Samples are kept flat, with no page around them - a module render needs no displayable
        // ancestor, which is the whole reason the structure could be flattened.
        const flat = {...sample, path: '/sites/luxe/samples/components/x', displayableNode: null};
        expect(buildSamplePreviewContext(flat, 'en', PREVIEW_PAGE).path).toBe('/sites/luxe/samples/components/x');
    });

    it('should honour an explicit view on the sample', () => {
        expect(buildSamplePreviewContext({...sample, jView: {value: 'teaser'}}, 'en', PREVIEW_PAGE).view).toBe('teaser');
    });

    it('should fall back to the default view', () => {
        expect(buildSamplePreviewContext({...sample, jView: undefined}, 'en', PREVIEW_PAGE).view).toBe('default');
    });

    it('should return null when there is no page to borrow CSS from', () => {
        expect(buildSamplePreviewContext(sample, 'en', undefined)).toBeNull();
        expect(buildSamplePreviewContext(undefined, 'en', PREVIEW_PAGE)).toBeNull();
    });
});
