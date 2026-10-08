import {getAncestorPathsToOpen, isOverNodeLimit} from './Picker.utils';

const node = {
    path: '/sites/digitall/home/news/area-main/news-list/news-1',
    ancestors: [
        {path: '/', isOpenable: false},
        {path: '/sites', isOpenable: false},
        {path: '/sites/digitall', isOpenable: false},
        {path: '/sites/digitall/home', isOpenable: true},
        {path: '/sites/digitall/home/news', isOpenable: true},
        {path: '/sites/digitall/home/news/area-main', isOpenable: false},
        {path: '/sites/digitall/home/news/area-main/news-list', isOpenable: false}
    ]
};

describe('getAncestorPathsToOpen', () => {
    it('should open only the openable ancestors', () => {
        expect(getAncestorPathsToOpen(node, true)).toEqual([
            '/sites/digitall/home',
            '/sites/digitall/home/news'
        ]);
    });

    it('should open every ancestor under the site without openable types', () => {
        expect(getAncestorPathsToOpen(node, false)).toEqual([
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
