import {resolveTarget} from './useFrameEvents';

const page = () => {
    document.body.innerHTML = `
        <div jahiatype="mainmodule" path="/sites/s/home">
            <div jahiatype="module" id="area" type="area" path="/sites/s/home/main">
                <div jahiatype="module" id="text" type="existingNode" path="/sites/s/home/main/text"><p id="inner">Text</p></div>
                <div jahiatype="module" id="placeholder" type="placeholder" path="*"><span id="in-placeholder"></span></div>
            </div>
            <p id="outside">Outside</p>
        </div>
        <div id="jahia-portal-root">
            <header jahiatype="header" data-jahia-id="text"><span id="in-header"></span></header>
            <div jahiatype="createbuttons" data-jahia-parent="area"><button id="in-create" type="button"></button></div>
            <div jahiatype="createbuttons" data-jahia-parent="area" data-insertion-point="true"><button id="in-insertion" type="button"></button></div>
        </div>`;
    return document;
};

const boxed = ids => element => ids.includes(element.id);
const byId = id => document.getElementById(id);

describe('resolveTarget', () => {
    it('resolves a pointer inside a module to that module', () => {
        const doc = page();
        expect(resolveTarget(doc, byId('inner'), boxed(['area', 'text']))).toEqual({kind: 'module', element: byId('text'), path: '/sites/s/home/main/text'});
    });

    it('resolves a header to the module it stands for', () => {
        const doc = page();
        expect(resolveTarget(doc, byId('in-header'), boxed(['area', 'text'])).element).toBe(byId('text'));
    });

    it('resolves create buttons to their parent module', () => {
        const doc = page();
        expect(resolveTarget(doc, byId('in-create'), boxed(['area', 'text'])).element).toBe(byId('area'));
    });

    it('hands a module without a box to the nearest module above it that has one', () => {
        const doc = page();
        expect(resolveTarget(doc, byId('in-placeholder'), boxed(['area', 'text'])).element).toBe(byId('area'));
    });

    it('reports an insertion point without a module', () => {
        const doc = page();
        expect(resolveTarget(doc, byId('in-insertion'), boxed(['area']))).toEqual({kind: 'insertionPoint'});
    });

    it('returns null outside every module', () => {
        const doc = page();
        expect(resolveTarget(doc, byId('outside'), boxed(['area', 'text']))).toBeNull();
    });
});
