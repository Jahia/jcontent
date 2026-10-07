import React from 'react';
import {act} from 'react-dom/test-utils';
import {mount, shallow} from 'enzyme';
import {Preview} from './Preview';

let capturedFetcherProps = {};
jest.mock('./PreviewFetcher', () => ({
    PreviewFetcher: props => {
        capturedFetcherProps = props;
        return <div data-testid="fetcher"/>;
    }
}));

const baseContext = {
    path: '/site/digitall',
    workspace: 'edit',
    language: 'en',
    templateType: 'html',
    contextConfiguration: 'page'
};

const renderPreview = (props = {}) => shallow(
    <Preview
        previewContext={baseContext}
        {...props}
    />
);

describe('Preview', () => {
    it('renders without workspace toggle buttons', () => {
        const cmp = renderPreview();
        expect(cmp.find('[data-sel-role="edit-preview-button"]').exists()).toBe(false);
        expect(cmp.find('[data-sel-role="live-preview-button"]').exists()).toBe(false);
    });

    it('renders fullscreen toggle button when onFullScreenToggle is provided', () => {
        const cmp = renderPreview({onFullScreenToggle: jest.fn()});
        expect(cmp.find('[data-sel-role="preview-fullscreen-toggle"]').exists()).toBe(true);
    });

    it('does not render fullscreen toggle button when onFullScreenToggle is not provided', () => {
        const cmp = renderPreview();
        expect(cmp.find('[data-sel-role="preview-fullscreen-toggle"]').exists()).toBe(false);
    });

    it('renders the viewport selector only when asked for', () => {
        expect(renderPreview().find('ViewportSelector').exists()).toBe(false);
        expect(renderPreview({hasViewportSelector: true}).find('ViewportSelector').exists()).toBe(true);
    });

    it('wraps the preview in a scaled frame only when the viewport selector is on', () => {
        // Mounted rather than shallow: the preview body only renders once the startTransition effect
        // has flipped shouldDisplay, which shallow rendering never runs.
        let plain;
        let scaled;
        act(() => {
            plain = mount(<Preview previewContext={baseContext}/>);
            scaled = mount(<Preview hasViewportSelector previewContext={baseContext}/>);
        });

        // Off, the fetcher sits directly in the shell - an ordinary preview fills its pane and must
        // not be put behind a transform.
        expect(plain.update().find('ViewportFrame').exists()).toBe(false);
        expect(scaled.update().find('ViewportFrame').exists()).toBe(true);
    });

    it('still renders the preview when the viewport selector is on', () => {
        act(() => {
            mount(<Preview hasViewportSelector previewContext={baseContext}/>);
        });
        expect(capturedFetcherProps.previewContext).toEqual(baseContext);
    });

    it('always passes edit workspace unchanged to PreviewFetcher', () => {
        act(() => {
            mount(<Preview previewContext={baseContext}/>);
        });
        expect(capturedFetcherProps.previewContext.workspace).toBe('edit');
    });
});
