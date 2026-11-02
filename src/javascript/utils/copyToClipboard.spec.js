import {copyToClipboard} from './copyToClipboard';

describe('copyToClipboard', () => {
    const originalClipboard = navigator.clipboard;

    const setClipboard = value => {
        Object.defineProperty(navigator, 'clipboard', {value, configurable: true, writable: true});
    };

    afterEach(() => {
        setClipboard(originalClipboard);
        delete document.execCommand;
    });

    it('uses the asynchronous clipboard API when the context exposes it', async () => {
        const writeText = jest.fn(() => Promise.resolve());
        setClipboard({writeText});

        await copyToClipboard('https://example.org/file.png');

        expect(writeText).toHaveBeenCalledWith('https://example.org/file.png');
    });

    it('falls back to execCommand when the context does not expose the clipboard API', async () => {
        setClipboard(undefined);
        document.execCommand = jest.fn(() => true);

        await copyToClipboard('https://example.org/file.png');

        expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    it('leaves no textarea behind once the fallback has run', async () => {
        setClipboard(undefined);
        document.execCommand = jest.fn(() => true);

        await copyToClipboard('https://example.org/file.png');

        expect(document.querySelectorAll('textarea')).toHaveLength(0);
    });

    it('rejects, and still cleans up, when the browser refuses the copy', async () => {
        setClipboard(undefined);
        document.execCommand = jest.fn(() => false);

        await expect(copyToClipboard('https://example.org/file.png')).rejects.toThrow();
        expect(document.querySelectorAll('textarea')).toHaveLength(0);
    });
});
