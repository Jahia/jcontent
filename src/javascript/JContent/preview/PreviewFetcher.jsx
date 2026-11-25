import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {PreviewViewers} from './viewers';
import {NoView} from './viewers/NoView';
import {useContentPreview} from './useContentPreview';

/**
 * Shared preview data fetcher.
 *
 * Fetches rendered content via useContentPreview and delegates rendering
 * to PreviewViewers. Exposes refetch lifecycle via props so callers can
 * register/deregister with their own refetch bus (Decision #4).
 *
 * When previewContext.cssSourcePath is set (hybrid in-context rendering), a second
 * fetch is made for the CSS source page (contextConfiguration='page') to extract
 * full template CSS (Bootstrap, fonts, theme). The page HTML output is passed to
 * IframeViewer as pageCssHtml so it can extract and inject <link> elements.
 * previewContext.cssSourceView names the page template of that render (default: 'default');
 * a content with no page of its own is rendered through the content-template wrapper, and the
 * preview does not wait for that render.
 *
 * When previewContext.unsavedValues is set, the fetch renders the unsaved values of a form, outside
 * the Apollo cache. While a new render loads, or when the server refuses the values, the last render
 * that the server answered with no error stays on screen, and onUnsavedValuesRefused reports the refusal.
 *
 * Props:
 *   previewContext     — built by buildCEPreviewContexts or buildPreviewContextsFromNode
 *   nodeData           — { isPage, path, displayableNode } — passed to IframeViewer for zoom logic
 *   onContentNotFound  — called when zoom anchor (#ce_preview_content) is missing
 *   onRefetchReady     — (refetch) => void  — called on mount; register with your refetch bus
 *   onRefetchInvalidated — () => void       — called on unmount; deregister from your refetch bus
 *   onUnsavedValuesRefused — (isRefused) => void — called when the server refuses or accepts the unsaved values
 */
export const PreviewFetcher = React.memo(({
    previewContext,
    nodeData = null,
    isFullScreen = false,
    onContentNotFound,
    onRefetchReady = null,
    onRefetchInvalidated = null,
    onUnsavedValuesRefused = null
}) => {
    const {data, loading, error, refetch} = useContentPreview({
        ...previewContext,
        fetchPolicy: 'network-only'
    });

    const hasCssSource = Boolean(previewContext.cssSourcePath);
    const {data: cssData, loading: cssLoading} = useContentPreview({
        path: previewContext.cssSourcePath,
        workspace: previewContext.workspace,
        language: previewContext.language,
        templateType: previewContext.templateType,
        view: previewContext.cssSourceView || 'default',
        contextConfiguration: 'page',
        fetchPolicy: 'cache-first',
        skip: !hasCssSource
    });

    // Apollo keeps the data of a refused result as previousData, so the last render with no error is kept here.
    const lastRender = useRef(null);
    if (!loading && !error && data?.jcr?.nodeByPath) {
        lastRender.current = data;
    }

    // A render that loads has no answer yet, so the last answer stands until the server gives the next one.
    const isRefused = Boolean(previewContext.unsavedValues && error);
    useEffect(() => {
        if (!loading) {
            onUnsavedValuesRefused?.(isRefused);
        }
    }, [loading, isRefused, onUnsavedValuesRefused]);

    useEffect(() => {
        onRefetchReady?.(refetch);
        return () => {
            onRefetchInvalidated?.();
        };
    }, [refetch, onRefetchReady, onRefetchInvalidated]);

    // A content with no page renders itself through the content-template wrapper for its CSS. That render is as slow as
    // the preview and no other item shares it, so the preview shows first and takes the stylesheets when they arrive.
    const isCssSourceShared = !previewContext.cssSourceView;
    // While the render of new unsaved values loads, or when the server refuses them, such as a half-typed number, the
    // last render stays on screen.
    const keptData = previewContext.unsavedValues && (loading || error) ? lastRender.current : null;
    if ((loading && !keptData) || (hasCssSource && isCssSourceShared && cssLoading)) {
        return <LoaderOverlay/>;
    }

    if (error && !keptData) {
        console.error('Error while fetching preview', error);
        return <NoView/>;
    }

    const pageCssHtml = hasCssSource ? (cssData?.jcr?.nodeByPath?.renderedContent?.output ?? '') : '';

    return (
        <PreviewViewers
            data={(keptData ?? data)?.jcr ?? {}}
            isFullScreen={isFullScreen}
            nodeData={nodeData}
            pageCssHtml={pageCssHtml}
            previewContext={previewContext}
            onContentNotFound={onContentNotFound}
        />
    );
});

PreviewFetcher.displayName = 'PreviewFetcher';

PreviewFetcher.propTypes = {
    previewContext: PropTypes.shape({
        path: PropTypes.string.isRequired,
        workspace: PropTypes.string.isRequired,
        language: PropTypes.string.isRequired,
        templateType: PropTypes.string,
        view: PropTypes.string,
        contextConfiguration: PropTypes.string,
        cssSourceView: PropTypes.string,
        requestAttributes: PropTypes.array,
        requestParameters: PropTypes.array,
        mainResourcePath: PropTypes.string,
        mainResourceContextConfiguration: PropTypes.string,
        cssSourcePath: PropTypes.string,
        unsavedValues: PropTypes.object
    }).isRequired,
    nodeData: PropTypes.shape({
        isPage: PropTypes.bool,
        path: PropTypes.string,
        displayableNode: PropTypes.shape({
            path: PropTypes.string
        })
    }),
    isFullScreen: PropTypes.bool,
    onContentNotFound: PropTypes.func.isRequired,
    onRefetchReady: PropTypes.func,
    onRefetchInvalidated: PropTypes.func,
    onUnsavedValuesRefused: PropTypes.func
};
