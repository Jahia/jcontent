import {getPageBuilderPath} from './openInPageBuilderAction';

describe('getPageBuilderPath', () => {
    it('opens a content laid out in a page in that page', () => {
        const form = {path: '/sites/site/home/area/form', displayableNode: {path: '/sites/site/home', isFolder: false}};
        expect(getPageBuilderPath(form)).toBe('/sites/site/home');
    });

    it('opens a content with no page on its own', () => {
        expect(getPageBuilderPath({path: '/sites/site/contents/form', displayableNode: null})).toBe('/sites/site/contents/form');
        expect(getPageBuilderPath({path: '/sites/site/contents/form', displayableNode: {path: '/sites/site/contents', isFolder: true}})).toBe('/sites/site/contents/form');
    });

    it('opens a main resource with a template of its own on itself', () => {
        const news = {path: '/sites/site/contents/news', displayableNode: {path: '/sites/site/contents/news', isFolder: false}};
        expect(getPageBuilderPath(news)).toBe('/sites/site/contents/news');
    });
});
