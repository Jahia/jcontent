import {Idiomorph} from 'idiomorph';

// The server gives each module a new random id on every render (id="module<uuid>").
const MODULE_ID = /module[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;

// The body children that came from the server, per document. Everything else in the body was added
// on the client (the page builder's portal, menus) and survives a morph untouched.
const serverContent = new WeakMap();

/** Records the body's current children as the server's. Call once the document has loaded. */
export const markServerContent = doc => {
    serverContent.set(doc, new WeakSet(doc.body ? doc.body.children : []));
};

const moduleKey = element => {
    const chain = [];
    for (let module = element; module; module = module.parentElement?.closest('[jahiatype=module]')) {
        chain.unshift(module.getAttribute('path'));
    }

    return `${element.getAttribute('type')}|${chain.join('>')}`;
};

/**
 * Gives each module of the new document the id its counterpart has in the current one, so that the
 * morph keeps the same element (and the boxes, the clicked element and the page's own handlers
 * attached to it). Counterparts are matched by type and by the chain of paths that leads to them,
 * in document order. A module with no counterpart keeps its new id.
 */
export const carryOverModuleIds = (doc, newDoc) => {
    const idsByKey = new Map();
    doc.querySelectorAll('[jahiatype=module]').forEach(element => {
        const key = moduleKey(element);
        idsByKey.set(key, [...(idsByKey.get(key) || []), element.id]);
    });

    newDoc.querySelectorAll('[jahiatype=module]').forEach(element => {
        const id = idsByKey.get(moduleKey(element))?.shift();
        if (id) {
            newDoc.querySelectorAll(`[data-jahia-parent="${element.id}"]`).forEach(child => {
                child.dataset.jahiaParent = id;
            });
            element.id = id;
        }
    });
};

const assetSignatures = doc => {
    const scripts = [...doc.querySelectorAll('script')]
        .map(script => (script.src ? `src:${script.getAttribute('src')}` : `inline:${script.textContent.replace(MODULE_ID, '').trim()}`));
    const styles = [...doc.querySelectorAll('link[rel="stylesheet"]')].map(link => `css:${link.getAttribute('href')}`);
    return [...scripts, ...styles];
};

const mainModule = doc => {
    const element = doc.querySelector('[jahiatype=mainmodule]');
    return element && ['path', 'locale', 'template'].map(name => element.getAttribute(name)).join('|');
};

/**
 * A morph runs no script and loads no stylesheet, so the new document can only be morphed in when
 * every script and stylesheet it holds is already in the current one, and it shows the same page.
 */
export const canMorph = (doc, newDoc) => {
    if (!newDoc.body || mainModule(doc) === null || mainModule(doc) !== mainModule(newDoc)) {
        return false;
    }

    const loaded = new Set(assetSignatures(doc));
    return assetSignatures(newDoc).every(signature => loaded.has(signature));
};

export const fetchFrameDocument = async (url, signal) => {
    const response = await fetch(url, {credentials: 'same-origin', signal, headers: {Accept: 'text/html'}});
    if (!response.ok) {
        return null;
    }

    return new DOMParser().parseFromString(await response.text(), 'text/html');
};

/**
 * Brings the frame's body to the content of `newDoc` in place. Returns false, and changes nothing,
 * when that cannot be done safely; the caller then reloads the frame.
 */
export const morphFrameDocument = (doc, newDoc) => {
    if (!canMorph(doc, newDoc)) {
        return false;
    }

    carryOverModuleIds(doc, newDoc);

    // Take the client's own nodes out while the body is morphed: no morph can then match one of them
    // to a server node, or remove it. The morph is synchronous, so React never sees them detached.
    const server = serverContent.get(doc) || new WeakSet();
    const clientNodes = [...doc.body.children].filter(child => !server.has(child));
    clientNodes.forEach(node => node.remove());
    try {
        Idiomorph.morph(doc.body, newDoc.body, {morphStyle: 'innerHTML', ignoreActiveValue: true});
    } finally {
        markServerContent(doc);
        clientNodes.forEach(node => doc.body.appendChild(node));
    }

    return true;
};
