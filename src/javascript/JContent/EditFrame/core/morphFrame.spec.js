import {canMorph, carryOverModuleIds, markServerContent, morphFrameDocument} from './morphFrame';

// Jest loads the CommonJS build, which exports the object itself where the ES build names it
jest.mock('idiomorph', () => ({Idiomorph: jest.requireActual('idiomorph')}));

const uuid = n => `0000000${n}-0000-0000-0000-000000000000`;

// A page as the edit frame renders it: every module carries a random id that changes on each render.
const render = ({ids, title = 'Hello', extraScript = ''}) => `<!DOCTYPE html><html><head>
    <link rel="stylesheet" href="/modules/site/css/main.css">
    <script src="/modules/site/js/main.js"></script>
    ${extraScript}
</head><body>
    <div jahiatype="mainmodule" path="/sites/s/home" locale="en" template="">
        <div jahiatype="module" id="module${ids[0]}" type="area" path="/sites/s/home/main">
            <div jahiatype="module" id="module${ids[1]}" type="existingNode" path="/sites/s/home/main/text">
                <p class="text">${title}</p>
            </div>
            <div jahiatype="module" id="module${ids[2]}" type="placeholder" path="*"></div>
        </div>
    </div>
</body></html>`;

const parse = html => new DOMParser().parseFromString(html, 'text/html');

describe('carryOverModuleIds', () => {
    it('gives each module of the new rendering the id of its counterpart', () => {
        const doc = parse(render({ids: [uuid(1), uuid(2), uuid(3)]}));
        const newDoc = parse(render({ids: [uuid(4), uuid(5), uuid(6)]}));

        carryOverModuleIds(doc, newDoc);

        expect([...newDoc.querySelectorAll('[jahiatype=module]')].map(e => e.id))
            .toEqual([`module${uuid(1)}`, `module${uuid(2)}`, `module${uuid(3)}`]);
    });

    it('keeps the new id of a module that did not exist before', () => {
        const doc = parse(render({ids: [uuid(1), uuid(2), uuid(3)]}));
        const newDoc = parse(render({ids: [uuid(4), uuid(5), uuid(6)]}));
        const added = newDoc.createElement('div');
        added.setAttribute('jahiatype', 'module');
        added.setAttribute('type', 'existingNode');
        added.setAttribute('path', '/sites/s/home/main/other');
        added.id = `module${uuid(7)}`;
        newDoc.querySelector('[path="/sites/s/home/main"]').appendChild(added);

        carryOverModuleIds(doc, newDoc);

        expect(added.id).toBe(`module${uuid(7)}`);
    });
});

describe('canMorph', () => {
    it('accepts a rendering whose scripts and stylesheets are already loaded', () => {
        const doc = parse(render({ids: [uuid(1), uuid(2), uuid(3)]}));
        expect(canMorph(doc, parse(render({ids: [uuid(4), uuid(5), uuid(6)], title: 'Changed'})))).toBe(true);
    });

    it('accepts an inline script that differs only by module ids', () => {
        const script = id => `<script>init("module${id}")</script>`;
        const doc = parse(render({ids: [uuid(1), uuid(2), uuid(3)], extraScript: script(uuid(1))}));
        expect(canMorph(doc, parse(render({ids: [uuid(4), uuid(5), uuid(6)], extraScript: script(uuid(4))})))).toBe(true);
    });

    it('refuses a rendering that needs a script the page has not run', () => {
        const doc = parse(render({ids: [uuid(1), uuid(2), uuid(3)]}));
        const newDoc = parse(render({ids: [uuid(4), uuid(5), uuid(6)], extraScript: '<script src="/modules/carousel.js"></script>'}));
        expect(canMorph(doc, newDoc)).toBe(false);
    });

    it('refuses a rendering of another page', () => {
        const doc = parse(render({ids: [uuid(1), uuid(2), uuid(3)]}));
        const newDoc = parse(render({ids: [uuid(4), uuid(5), uuid(6)]}).replace('path="/sites/s/home"', 'path="/sites/s/about"'));
        expect(canMorph(doc, newDoc)).toBe(false);
    });
});

describe('morphFrameDocument', () => {
    let doc;

    beforeEach(() => {
        doc = document.implementation.createHTMLDocument('');
        doc.documentElement.innerHTML = parse(render({ids: [uuid(1), uuid(2), uuid(3)]})).documentElement.innerHTML;
        markServerContent(doc);
    });

    it('updates the content in place and keeps the module elements', () => {
        const text = doc.querySelector('[path="/sites/s/home/main/text"]');

        expect(morphFrameDocument(doc, parse(render({ids: [uuid(4), uuid(5), uuid(6)], title: 'Changed'})))).toBe(true);

        expect(doc.querySelector('.text').textContent).toBe('Changed');
        expect(doc.querySelector('[path="/sites/s/home/main/text"]')).toBe(text);
    });

    it('leaves the nodes the client added to the body in place', () => {
        const portal = doc.createElement('div');
        portal.id = 'jahia-portal-root';
        doc.body.appendChild(portal);

        morphFrameDocument(doc, parse(render({ids: [uuid(4), uuid(5), uuid(6)], title: 'Changed'})));

        expect(doc.getElementById('jahia-portal-root')).toBe(portal);
        expect(doc.body.lastElementChild).toBe(portal);
    });

    it('changes nothing when the rendering cannot be morphed in', () => {
        const before = doc.body.innerHTML;
        const newDoc = parse(render({ids: [uuid(4), uuid(5), uuid(6)], title: 'Changed', extraScript: '<script src="/new.js"></script>'}));

        expect(morphFrameDocument(doc, newDoc)).toBe(false);
        expect(doc.body.innerHTML).toBe(before);
    });
});
