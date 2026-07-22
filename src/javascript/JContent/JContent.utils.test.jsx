import {getNewCounter, removeFileExtension, isDescendant, resolveUrlForLiveOrPreview} from './JContent.utils';

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

describe('resolveUrlForLiveOrPreview', () => {
    // Sites used in test scenarios:
    //   luxe    → j:serverName=servera, aliases=[server2]
    //   digitall → j:serverName=localhost
    //   siteb   → j:serverName=serverb

    // renderUrl from GQL:
    //   relative (/cms/render/...) when j:serverName=localhost
    //   absolute (http://servera/cms/render/...) when j:serverName is non-localhost

    const relativePath = '/cms/render/live/en/sites/digitall/home.html';
    const absoluteServera = 'http://servera/cms/render/live/en/sites/luxe/home.html';
    const absoluteServeraWithPort = 'http://servera:8080/cms/render/live/en/sites/luxe/home.html';
    const absoluteServerb = 'http://serverb/cms/render/live/en/sites/siteb/home.html';

    const setLocation = (hostname, port = '') => {
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {hostname, port, protocol: 'http:'}
        });
    };

    describe('preview (isLive=false) or no serverName', () => {
        it('uses current domain with port for preview', () => {
            setLocation('servera', '8080');
            expect(resolveUrlForLiveOrPreview(absoluteServera, false, 'servera')).toBe('http://servera:8080/cms/render/live/en/sites/luxe/home.html');
        });

        it('uses current domain with port when serverName is not provided', () => {
            setLocation('servera', '8080');
            expect(resolveUrlForLiveOrPreview(relativePath, true, null)).toBe('http://servera:8080/cms/render/live/en/sites/digitall/home.html');
        });

        it('omits port when on standard port', () => {
            setLocation('servera', '');
            expect(resolveUrlForLiveOrPreview(absoluteServera, false, 'servera')).toBe('http://servera/cms/render/live/en/sites/luxe/home.html');
        });
    });

    describe('login to servera (luxe default server name)', () => {
        beforeEach(() => setLocation('servera', '8080'));

        it('luxe: select servera (current domain) → opens with port', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServera, true, 'servera')).toBe('http://servera:8080/cms/render/live/en/sites/luxe/home.html');
        });

        it('luxe: select server2 (alias, external) → opens without port', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServera, true, 'server2')).toBe('http://server2/cms/render/live/en/sites/luxe/home.html');
        });

        it('digitall: select localhost → opens at localhost with port', () => {
            expect(resolveUrlForLiveOrPreview(relativePath, true, 'localhost')).toBe('http://localhost:8080/cms/render/live/en/sites/digitall/home.html');
        });

        it('siteb: select serverb (external) → opens without port', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServerb, true, 'serverb')).toBe('http://serverb/cms/render/live/en/sites/siteb/home.html');
        });
    });

    describe('login to localhost (digitall default server name)', () => {
        beforeEach(() => setLocation('localhost', '8080'));

        it('luxe: select servera (external) → opens without port', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServera, true, 'servera')).toBe('http://servera/cms/render/live/en/sites/luxe/home.html');
        });

        it('luxe: select server2 (external) → opens without port', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServera, true, 'server2')).toBe('http://server2/cms/render/live/en/sites/luxe/home.html');
        });

        it('digitall: select localhost (current domain) → opens with port', () => {
            expect(resolveUrlForLiveOrPreview(relativePath, true, 'localhost')).toBe('http://localhost:8080/cms/render/live/en/sites/digitall/home.html');
        });

        it('siteb: select serverb (external) → opens without port', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServerb, true, 'serverb')).toBe('http://serverb/cms/render/live/en/sites/siteb/home.html');
        });
    });

    describe('login to serverb (siteb default server name)', () => {
        beforeEach(() => setLocation('serverb', '8080'));

        it('luxe: select servera (external) → opens without port', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServeraWithPort, true, 'servera')).toBe('http://servera/cms/render/live/en/sites/luxe/home.html');
        });

        it('luxe: select server2 (external alias) → opens without port, not at servera', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServeraWithPort, true, 'server2')).toBe('http://server2/cms/render/live/en/sites/luxe/home.html');
        });

        it('luxe: select serverb (current domain) → opens with port', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServeraWithPort, true, 'serverb')).toBe('http://serverb:8080/cms/render/live/en/sites/luxe/home.html');
        });

        it('digitall: select localhost → opens at localhost with port, not at serverb', () => {
            expect(resolveUrlForLiveOrPreview(relativePath, true, 'localhost')).toBe('http://localhost:8080/cms/render/live/en/sites/digitall/home.html');
        });

        it('siteb: select serverb (current domain) → opens with port', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServerb, true, 'serverb')).toBe('http://serverb:8080/cms/render/live/en/sites/siteb/home.html');
        });
    });

    describe('login to server2 (luxe additional server name)', () => {
        beforeEach(() => setLocation('server2', '8080'));

        it('luxe: select servera (external) → opens without port', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServera, true, 'servera')).toBe('http://servera/cms/render/live/en/sites/luxe/home.html');
        });

        it('luxe: select server2 (current domain) → opens with port', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServera, true, 'server2')).toBe('http://server2:8080/cms/render/live/en/sites/luxe/home.html');
        });

        it('digitall: select localhost → opens at localhost with port, not at server2', () => {
            expect(resolveUrlForLiveOrPreview(relativePath, true, 'localhost')).toBe('http://localhost:8080/cms/render/live/en/sites/digitall/home.html');
        });

        it('siteb: select serverb (external) → opens without port', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServerb, true, 'serverb')).toBe('http://serverb/cms/render/live/en/sites/siteb/home.html');
        });
    });

    describe('login to local1 (not any site\'s server name)', () => {
        beforeEach(() => setLocation('local1', '8080'));

        it('luxe: select servera (external) → opens without port', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServera, true, 'servera')).toBe('http://servera/cms/render/live/en/sites/luxe/home.html');
        });

        it('luxe: select server2 (external) → opens without port', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServera, true, 'server2')).toBe('http://server2/cms/render/live/en/sites/luxe/home.html');
        });

        it('luxe: select local1 (current domain) → opens with port', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServera, true, 'local1')).toBe('http://local1:8080/cms/render/live/en/sites/luxe/home.html');
        });

        it('digitall: select localhost → opens at localhost with port, not at local1', () => {
            expect(resolveUrlForLiveOrPreview(relativePath, true, 'localhost')).toBe('http://localhost:8080/cms/render/live/en/sites/digitall/home.html');
        });

        it('siteb: select serverb (external) → opens without port', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServerb, true, 'serverb')).toBe('http://serverb/cms/render/live/en/sites/siteb/home.html');
        });

        it('siteb: select local1 (current domain) → opens with port', () => {
            expect(resolveUrlForLiveOrPreview(absoluteServerb, true, 'local1')).toBe('http://local1:8080/cms/render/live/en/sites/siteb/home.html');
        });
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
