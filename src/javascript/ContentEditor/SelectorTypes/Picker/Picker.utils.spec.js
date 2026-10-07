import {getAncestorPathsToOpen} from './Picker.utils';

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
