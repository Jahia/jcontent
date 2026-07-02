import React from 'react';
import {IframeViewer} from './IframeViewer';
import {zoom} from '../../Preview.utils';
import {shallow} from '@jahia/test-framework';

jest.mock('../../Preview.utils', () => ({
    ...jest.requireActual('../../Preview.utils'),
    removeSiblings: jest.fn(),
    forceDisplay: jest.fn()
}));

describe('IframeViewer', () => {
    let props;
    beforeEach(() => {
        props = {
            previewContext: {
                workspace: 'hello'
            },
            onContentNotFound: jest.fn(),
            data: {}
        };
    });

    it('should display a loader while content is not fully initialized', () => {
        const cmp = shallow(<IframeViewer {...props}/>);
        expect(cmp.find('LoaderOverlay').exists()).toBe(true);
    });
});

describe('Zoom test', () => {
    let iframeDocument;
    let onContentNotFound;
    let nodeData;
    let foundElement;

    // A minimal DOM-like element that satisfies removeSiblings' traversal
    const makeMockElement = () => ({
        style: {},
        parentNode: {tagName: 'BODY', firstChild: null}
    });

    beforeEach(() => {
        onContentNotFound = jest.fn();
        foundElement = true;
        iframeDocument = {
            documentElement: {innerHTML: []},
            getElementById: () => (foundElement ? makeMockElement() : null)
        };
        nodeData = {
            isPage: false,
            displayableNode: {path: '/top'},
            path: '/top/down'
        };
    });

    it('Zoom should find item to zoom in and not call onContentNotFound', () => {
        zoom(iframeDocument, onContentNotFound, nodeData);
        expect(onContentNotFound).not.toHaveBeenCalled();
    });

    it('Zoom should not run - if zoom skipped via ce_preview_skip_zoom', () => {
        iframeDocument.documentElement.innerHTML = ['ce_preview_skip_zoom'];
        zoom(iframeDocument, onContentNotFound, nodeData);
        expect(onContentNotFound).not.toHaveBeenCalled();
    });

    it('Zoom should call onContentNotFound - tag not found, not a page, not a content template', () => {
        foundElement = false;
        nodeData.isPage = false;

        zoom(iframeDocument, onContentNotFound, nodeData);
        expect(onContentNotFound).toHaveBeenCalled();
    });

    it('Zoom should call onContentNotFound - tag not found, not a page, no displayableNode', () => {
        foundElement = false;
        nodeData.isPage = false;
        nodeData.displayableNode = undefined;

        zoom(iframeDocument, onContentNotFound, nodeData);
        expect(onContentNotFound).toHaveBeenCalled();
    });

    it('Zoom should NOT call onContentNotFound - tag not found but is a content template', () => {
        foundElement = false;
        nodeData.isPage = false;
        nodeData.path = '/top'; // Path matches displayableNode.path — treated as content template

        zoom(iframeDocument, onContentNotFound, nodeData);
        expect(onContentNotFound).not.toHaveBeenCalled();
    });

    it('Zoom should NOT call onContentNotFound - tag not found but is a page', () => {
        foundElement = false;
        nodeData.isPage = true;

        zoom(iframeDocument, onContentNotFound, nodeData);
        expect(onContentNotFound).not.toHaveBeenCalled();
    });
});
