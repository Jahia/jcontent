import {getFilenameMimeTypeMismatch} from './filenameMimeType';

describe('getFilenameMimeTypeMismatch', () => {
    it('should report no mismatch when the extension matches the stored type', () => {
        expect(getFilenameMimeTypeMismatch('photo.png', 'image/png')).toBe(null);
    });

    it('should report no mismatch for an alias of the same type', () => {
        // .jpg and .jpeg both mean image/jpeg, so neither is a mismatch
        expect(getFilenameMimeTypeMismatch('photo.jpg', 'image/jpeg')).toBe(null);
        expect(getFilenameMimeTypeMismatch('photo.jpeg', 'image/jpeg')).toBe(null);
    });

    it('should ignore the case of both the name and the stored type', () => {
        expect(getFilenameMimeTypeMismatch('PHOTO.PNG', 'IMAGE/PNG')).toBe(null);
    });

    it('should ignore parameters carried by the stored type', () => {
        expect(getFilenameMimeTypeMismatch('notes.txt', 'text/plain; charset=UTF-8')).toBe(null);
    });

    it('should report a mismatch when the file was renamed to another type', () => {
        expect(getFilenameMimeTypeMismatch('photo.jpg', 'image/png')).toEqual({
            storedMimeType: 'image/png',
            expectedExtension: 'png'
        });
    });

    it('should report a mismatch without a suggestion when the type has no known extension', () => {
        const result = getFilenameMimeTypeMismatch('photo.jpg', 'application/x-made-up');
        expect(result).not.toBe(null);
        expect(result.storedMimeType).toBe('application/x-made-up');
        expect(result.expectedExtension).toBeFalsy();
    });

    it('should stay silent when the stored type carries no opinion', () => {
        // What the upload falls back to when it cannot tell - disagreeing with it means nothing
        expect(getFilenameMimeTypeMismatch('photo.jpg', 'application/octet-stream')).toBe(null);
        expect(getFilenameMimeTypeMismatch('photo.jpg', 'application/binary')).toBe(null);
    });

    it('should stay silent when the extension is unknown to the mime database', () => {
        expect(getFilenameMimeTypeMismatch('archive.zzz', 'image/png')).toBe(null);
    });

    it('should stay silent when the name has no extension at all', () => {
        expect(getFilenameMimeTypeMismatch('README', 'image/png')).toBe(null);
    });

    it('should stay silent when either side is missing', () => {
        expect(getFilenameMimeTypeMismatch(undefined, 'image/png')).toBe(null);
        expect(getFilenameMimeTypeMismatch('photo.jpg', undefined)).toBe(null);
        expect(getFilenameMimeTypeMismatch('', '')).toBe(null);
    });

    it('should use the last extension of a name that contains several dots', () => {
        expect(getFilenameMimeTypeMismatch('my.photo.backup.png', 'image/png')).toBe(null);
        expect(getFilenameMimeTypeMismatch('my.photo.backup.jpg', 'image/png')).not.toBe(null);
    });
});
