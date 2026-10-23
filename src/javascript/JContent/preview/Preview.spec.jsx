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

let capturedDirtyFetcherProps = {};
jest.mock('./DirtyPreviewFetcher', () => ({
    DirtyPreviewFetcher: props => {
        capturedDirtyFetcherProps = props;
        return <div data-testid="dirty-fetcher"/>;
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
    beforeEach(() => {
        capturedFetcherProps = {};
        capturedDirtyFetcherProps = {};
    });

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

    it('always passes edit workspace unchanged to PreviewFetcher', () => {
        act(() => {
            mount(<Preview previewContext={baseContext}/>);
        });
        expect(capturedFetcherProps.previewContext.workspace).toBe('edit');
    });

    it('renders stored content through PreviewFetcher when the host is not live', () => {
        act(() => {
            mount(<Preview previewContext={baseContext}/>);
        });
        expect(capturedFetcherProps.previewContext).toBeDefined();
        expect(capturedDirtyFetcherProps.previewContext).toBeUndefined();
    });

    // The live fetcher is mounted by isLive alone, before anything is dirty: swapping components
    // on the first keystroke would reload the frame, which is what the in-place patching avoids.
    it('mounts the live fetcher as soon as the host is live, with no dirty payload yet', () => {
        act(() => {
            mount(<Preview isLive previewContext={baseContext}/>);
        });
        expect(capturedDirtyFetcherProps.previewContext.workspace).toBe('edit');
        expect(capturedDirtyFetcherProps.dirtyPayload).toBeNull();
        expect(capturedFetcherProps.previewContext).toBeUndefined();
    });

    it('passes the dirty payload to the live fetcher', () => {
        const dirtyPayload = {uuid: 'test-uuid', propertiesToSave: [], propertiesToDelete: [], mixinsToAdd: [], mixinsToDelete: []};
        act(() => {
            mount(<Preview isLive dirtyPayload={dirtyPayload} previewContext={baseContext}/>);
        });
        expect(capturedDirtyFetcherProps.dirtyPayload).toBe(dirtyPayload);
    });

    it('renders the node rather than its hosting page while live, when a module context exists', () => {
        const fallback = {...baseContext, path: '/site/digitall/home/news', contextConfiguration: 'module'};
        act(() => {
            mount(<Preview isLive fallbackPreviewContext={fallback} previewContext={baseContext}/>);
        });
        expect(capturedDirtyFetcherProps.dirtyPreviewContext).toBe(fallback);
        expect(capturedDirtyFetcherProps.previewContext).toBe(baseContext);
    });
});
