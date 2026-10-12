import {getAncestorPathsToOpen, isOverNodeLimit} from './Picker.utils';

const ancestor = (path, isOpenableInPages = false, isOpenableInContent = false) => ({path, isOpenableInPages, isOpenableInContent});

const node = {
    path: '/sites/digitall/home/news/area-main/news-list/news-1',
    ancestors: [
        ancestor('/'),
        ancestor('/sites'),
        ancestor('/sites/digitall'),
        ancestor('/sites/digitall/home', true),
        ancestor('/sites/digitall/home/news', true),
        ancestor('/sites/digitall/home/news/area-main'),
        ancestor('/sites/digitall/home/news/area-main/news-list')
    ]
};

describe('getAncestorPathsToOpen', () => {
    it('should open only the ancestors that open in the view', () => {
        expect(getAncestorPathsToOpen(node, 'pages')).toEqual([
            '/sites/digitall/home',
            '/sites/digitall/home/news'
        ]);
        expect(getAncestorPathsToOpen(node, 'content')).toEqual([]);
    });

    it('should open every ancestor under the site when the query flagged no view', () => {
        expect(getAncestorPathsToOpen(node, undefined)).toEqual([
            '/sites/digitall/home',
            '/sites/digitall/home/news',
            '/sites/digitall/home/news/area-main',
            '/sites/digitall/home/news/area-main/news-list'
        ]);
    });
});

describe('isOverNodeLimit', () => {
    it('should recognise a query the server refused for reading too many nodes', () => {
        expect(isOverNodeLimit({graphQLErrors: [{message: 'This request asked for more than 20000 nodes', extensions: {classification: 'ExecutionAborted'}}]})).toBe(true);
        expect(isOverNodeLimit({graphQLErrors: [{message: 'This request asked for more than 20000 nodes', errorType: 'ExecutionAborted'}]})).toBe(true);
    });

    it('should ignore other errors', () => {
        expect(isOverNodeLimit(undefined)).toBe(false);
        expect(isOverNodeLimit({networkError: new Error('offline')})).toBe(false);
        expect(isOverNodeLimit({graphQLErrors: [{message: 'Permission denied', extensions: {classification: 'GqlAccessDeniedException'}}]})).toBe(false);
    });
});
