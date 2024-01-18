import {getNewCounter, removeFileExtension, isDescendant} from './JContent.utils';

describe('removeFileExtension', () => {
    it('should remove file extension', () => {
        expect(removeFileExtension('file.jpg')).toEqual('file');
        expect(removeFileExtension('file')).toEqual('file');
        expect(removeFileExtension('file...txt')).toBe('file..');
        expect(removeFileExtension('file.')).toBe('file');
    });
});

describe('getNewCounter', () => {
    it('should get new counter', () => {
        expect(getNewCounter([
            {name: 'file01.jpg'},
            {name: 'file2.jpg'},
            {name: 'file5.jpg'},
            {name: 'file4.jpg'}
        ])).toEqual(6);

        expect(getNewCounter([{name: 'file.jpg'}])).toEqual(1);

        expect(getNewCounter([
            {name: 'file1.jpg'},
            {name: 'file5.jpg'},
            {name: 'file8.jpg'},
            {name: 'file2.jpg'}
        ])).toEqual(9);

        expect(getNewCounter([
            {name: 'file1'},
            {name: 'file5'},
            {name: 'file4'},
            {name: 'file2'}
        ])).toEqual(6);
    });
});

describe('isDescendant', () => {
    it('should check if path is descendant of an ancestor', () => {
        expect(isDescendant('/site', '/site')).toBe(false);
        expect(isDescendant('/site/test', '/site/test')).toBe(false);
        expect(isDescendant('/site/test', '/site')).toBe(true);
        expect(isDescendant('/site/test/sub', '/site/test')).toBe(true);
        expect(isDescendant(null, '/site/test')).toBe(false);
        expect(isDescendant(undefined, '/site/test')).toBe(false);
        expect(isDescendant('', '/site/test')).toBe(false);
        expect(isDescendant('/site', null)).toBe(false);
        expect(isDescendant('/site', '')).toBe(true);
    });
});
