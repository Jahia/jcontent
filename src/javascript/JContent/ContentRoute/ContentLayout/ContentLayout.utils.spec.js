import {isBrowserImage, isImage} from './ContentLayout.utils';

describe('image predicates', () => {
    const file = (mimeType, path = '/sites/x/files/asset.bin') => ({
        isFile: true,
        path,
        content: {mimeType: {value: mimeType}}
    });

    describe('isImage - is there a rendition to show', () => {
        it('accepts every image mime type, decodable or not', () => {
            expect(isImage(file('image/jpeg'))).toBe(true);
            expect(isImage(file('image/tiff'))).toBe(true);
            expect(isImage(file('image/vnd.adobe.photoshop'))).toBe(true);
        });

        it('rejects non-images and non-files', () => {
            expect(isImage(file('application/pdf'))).toBe(false);
            expect(isImage(file('video/mp4'))).toBe(false);
            expect(isImage({isFile: false, path: '/sites/x/folder'})).toBe(false);
        });

        it('falls back to the extension when the mime type is unusable', () => {
            expect(isImage(file('application/octet-stream', '/f/a.tif'))).toBe(true);
            expect(isImage(file('application/binary', '/f/a.psd'))).toBe(true);
            expect(isImage(file('application/octet-stream', '/f/a.png'))).toBe(true);
            expect(isImage(file('application/octet-stream', '/f/a.zip'))).toBe(false);
        });
    });

    describe('isBrowserImage - can the browser render these bytes', () => {
        it('accepts only formats a browser decodes', () => {
            ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml', 'image/bmp']
                .forEach(mimeType => expect(isBrowserImage(file(mimeType))).toBe(true));
        });

        it('rejects images the browser cannot decode', () => {
            expect(isBrowserImage(file('image/tiff'))).toBe(false);
            expect(isBrowserImage(file('image/vnd.adobe.photoshop'))).toBe(false);
            expect(isBrowserImage(file('image/x-canon-cr2'))).toBe(false);
        });

        it('is case insensitive on the mime type', () => {
            expect(isBrowserImage(file('IMAGE/JPEG'))).toBe(true);
        });

        it('falls back to the extension when the mime type is unusable', () => {
            expect(isBrowserImage(file('application/octet-stream', '/f/a.png'))).toBe(true);
            expect(isBrowserImage(file('application/binary', '/f/a.tif'))).toBe(false);
        });

        it('reads the mime type from resourceChildren when content is absent', () => {
            const node = {
                isFile: true,
                path: '/f/a.jpg',
                resourceChildren: {nodes: [{mimeType: {value: 'image/jpeg'}}]}
            };
            expect(isBrowserImage(node)).toBe(true);
            expect(isImage(node)).toBe(true);
        });
    });

    // The pairing that matters: a TIFF is an image (so it gets a thumbnail) but is not a browser
    // image (so the preview must not load the original). Conflating the two is what left TIFF and
    // PSD previews blank while their cards worked.
    it('separates the two questions for a TIFF', () => {
        expect(isImage(file('image/tiff'))).toBe(true);
        expect(isBrowserImage(file('image/tiff'))).toBe(false);
    });
});
