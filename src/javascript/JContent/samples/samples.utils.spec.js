import {
    getSampleCategoryName,
    isSampleContent,
    getSampleCategoryPath,
    getSamplesPath,
    getSamplesPreviewPagePath,
    getSitePath
} from './samples.utils';

describe('getSamplesPath', () => {
    it('should place the samples branch directly under the site', () => {
        expect(getSamplesPath('/sites/digitall')).toBe('/sites/digitall/samples');
    });
});

describe('getSampleCategoryName', () => {
    it('should route by node kind, so saving a sample asks the author nothing', () => {
        expect(getSampleCategoryName(true)).toBe('pages');
        expect(getSampleCategoryName(false)).toBe('components');
    });
});

describe('getSampleCategoryPath', () => {
    it('should build the full path of the category a sample lands in', () => {
        expect(getSampleCategoryPath('/sites/digitall', true)).toBe('/sites/digitall/samples/pages');
        expect(getSampleCategoryPath('/sites/digitall', false)).toBe('/sites/digitall/samples/components');
    });
});

describe('getSitePath', () => {
    it('should extract the site from a path inside it', () => {
        expect(getSitePath('/sites/digitall/home/main/hero')).toBe('/sites/digitall');
    });

    it('should accept the site root itself', () => {
        expect(getSitePath('/sites/digitall')).toBe('/sites/digitall');
    });

    it('should return null outside a site, so the action hides instead of guessing', () => {
        expect(getSitePath('/modules/luxe/1.0.0')).toBeNull();
        expect(getSitePath('/sites')).toBeNull();
        expect(getSitePath(undefined)).toBeNull();
    });
});

describe('getSamplesPreviewPagePath', () => {
    afterEach(() => {
        delete global.contextJsParameters;
    });

    it('should prefer the configured showcase page', () => {
        global.contextJsParameters = {config: {jcontent: {'samples.previewPagePath': '/sites/luxe/showcase'}}};
        expect(getSamplesPreviewPagePath('/sites/luxe/home')).toBe('/sites/luxe/showcase');
    });

    it('should trim the configured value, since it comes from a .cfg file', () => {
        global.contextJsParameters = {config: {jcontent: {'samples.previewPagePath': '  /sites/luxe/showcase  '}}};
        expect(getSamplesPreviewPagePath('/sites/luxe/home')).toBe('/sites/luxe/showcase');
    });

    it('should fall back to the home page when unset or blank', () => {
        global.contextJsParameters = {config: {jcontent: {}}};
        expect(getSamplesPreviewPagePath('/sites/luxe/home')).toBe('/sites/luxe/home');

        global.contextJsParameters = {config: {jcontent: {'samples.previewPagePath': '   '}}};
        expect(getSamplesPreviewPagePath('/sites/luxe/home')).toBe('/sites/luxe/home');
    });

    it('should be undefined when neither is available, so the preview reports it cannot render', () => {
        global.contextJsParameters = {config: {}};
        expect(getSamplesPreviewPagePath(undefined)).toBeUndefined();
    });
});

describe('isSampleContent', () => {
    it('should accept a component sample', () => {
        expect(isSampleContent({path: '/sites/luxe/samples/components/agency', isPage: false})).toBe(true);
    });

    it('should reject a sample page, which renders as a page and carries its own CSS', () => {
        expect(isSampleContent({path: '/sites/luxe/samples/pages/landing', isPage: true})).toBe(false);
    });

    it('should reject content outside the samples branch', () => {
        expect(isSampleContent({path: '/sites/luxe/contents/agency', isPage: false})).toBe(false);
    });

    it('should be false rather than throwing for a node with no path', () => {
        expect(isSampleContent({})).toBe(false);
        expect(isSampleContent(null)).toBe(false);
    });
});
