import {buildPreviewContextsFromNode, buildSamplePreviewContext} from './previewContext.utils';

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

describe('buildPreviewContextsFromNode, for samples', () => {
    const HOME = '/sites/luxe/home';
    // The case that made the Samples preview blank: a type with no content template has no
    // displayableNode at all, which the generic path answers with view:null - and a module render
    // with no view returns nothing. The picker never hit it because it always asks for a view.
    const noTemplateSample = {
        path: '/sites/luxe/samples/components/texte-illustre',
        uuid: 'no-template-uuid',
        isPage: false,
        displayableNode: null,
        site: {homePage: {path: HOME}}
    };

    beforeEach(() => {
        global.contextJsParameters = {config: {jcontent: {}}};
    });

    it('should preview a sample with no content template the same way the picker does', () => {
        const {primary, fallback} = buildPreviewContextsFromNode(noTemplateSample, 'en', 'content');

        expect(primary.view).toBe('default');
        expect(primary.contextConfiguration).toBe('module');
        expect(primary.path).toBe(noTemplateSample.path);
        expect(primary.cssSourcePath).toBe(HOME);
        expect(fallback).toBeNull();
    });

    it('should produce the same context as the picker for the same sample', () => {
        const {primary} = buildPreviewContextsFromNode(noTemplateSample, 'en', 'content');
        expect(primary).toEqual(buildSamplePreviewContext(noTemplateSample, 'en', HOME));
    });

    it('should honour a configured preview page over the home page', () => {
        global.contextJsParameters = {config: {jcontent: {'samples.previewPagePath': '/sites/luxe/showcase'}}};
        expect(buildPreviewContextsFromNode(noTemplateSample, 'en', 'content').primary.cssSourcePath)
            .toBe('/sites/luxe/showcase');
    });

    it('should leave sample pages on the normal page render, which carries its own CSS', () => {
        const samplePage = {...noTemplateSample, path: '/sites/luxe/samples/pages/landing', isPage: true};
        const {primary} = buildPreviewContextsFromNode(samplePage, 'en', 'pages');

        expect(primary.contextConfiguration).toBe('page');
        expect(primary.cssSourcePath).toBeUndefined();
    });

    it('should not touch content outside the samples branch', () => {
        const ordinary = {...noTemplateSample, path: '/sites/luxe/contents/some-text'};
        // No displayableNode and not a sample: the generic rule still applies, so containers and
        // the like keep being suppressed rather than rendered as a default view.
        expect(buildPreviewContextsFromNode(ordinary, 'en', 'content').primary.view).toBeNull();
    });

    it('should fall through to the generic path when the site has no page to borrow from', () => {
        const noHome = {...noTemplateSample, site: {}};
        expect(buildPreviewContextsFromNode(noHome, 'en', 'content').primary.view).toBeNull();
    });
});
