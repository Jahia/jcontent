import {getContentName} from './TagManager.utils';

describe('getContentName', () => {
    it('keeps names up to 100 characters unchanged', () => {
        const name = 'a'.repeat(100);
        expect(getContentName({displayName: name, path: '/p'})).toBe(name);
    });

    it('truncates longer names to 100 characters followed by an ellipsis', () => {
        expect(getContentName({displayName: 'a'.repeat(300), path: '/p'})).toBe('a'.repeat(100) + '...');
    });

    it('falls back to the path when there is no display name', () => {
        expect(getContentName({path: '/sites/digitall/home'})).toBe('/sites/digitall/home');
    });
});
