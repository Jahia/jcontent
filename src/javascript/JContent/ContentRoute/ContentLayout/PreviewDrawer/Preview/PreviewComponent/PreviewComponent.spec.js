import React from 'react';
import {shallow} from '@jahia/test-framework';
import PreviewComponent from './PreviewComponent';

// The file viewers pull in react-pdf, which is not transformed for tests and is irrelevant here:
// these cases render the content (non-file) branch of the component.
jest.mock('./PDFViewer', () => ({PDFViewer: () => null}));
jest.mock('./DocumentViewer', () => ({DocumentViewer: () => null}));
jest.mock('./ImageViewer', () => ({ImageViewer: () => null}));

describe('PreviewComponent', () => {
    let props;
    beforeEach(() => {
        props = {
            data: {},
            workspace: 'edit'
        };
    });

    it('should render the rendered content as a static document, without running its scripts', () => {
        const cmp = shallow(<PreviewComponent {...props}/>);
        const sandbox = cmp.find('iframe').prop('sandbox');

        // The preview shows layout only - the framed document must not execute scripts.
        expect(sandbox).not.toContain('allow-scripts');
        // ...but it must stay same-origin, otherwise the content can no longer be written into
        // the frame and its stylesheets can no longer be added.
        expect(sandbox).toContain('allow-same-origin');
    });

    it('should not let a caller widen the preview frame sandbox', () => {
        const cmp = shallow(<PreviewComponent {...props} iframeProps={{sandbox: 'allow-same-origin allow-scripts'}}/>);

        expect(cmp.find('iframe').prop('sandbox')).toBe('allow-same-origin');
    });
});
