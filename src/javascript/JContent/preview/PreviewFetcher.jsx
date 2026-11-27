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
 * the Apollo cache. While a new render loads, or when the server refuses the values with a GraphQL error,
 * the last render with no error of the same path, language, view and context configuration stays on screen, and
 * onUnsavedValuesRefused reports the refusal. A network error shows no view, as without unsaved values.
 *
 * Props:
 *   previewContext     — built by buildCEPreviewContexts or buildPreviewContextsFromNode
 *   nodeData           — { isPage, path, displayableNode } — passed to IframeViewer for zoom logic
 *   onContentNotFound  — called when zoom anchor (#ce_preview_content) is missing
 *   onRefetchReady     — (refetch) => void  — called on mount; register with your refetch bus
 *   onRefetchInvalidated — () => void       — called on unmount; deregister from your refetch bus
 *   onUnsavedValuesRefused — (isRefused) => void — called when a load of unsaved values ends: true for a GraphQL
 *                            refusal of the values, false for any other end, a network error included
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

    // Apollo keeps the data of a refused result as previousData, so the last render with no error is kept here, with the
    // context that it renders: a language switch keeps the form, and must not keep the page of the other language.
    const renderKey = [previewContext.path, previewContext.language, previewContext.view, previewContext.contextConfiguration].join('|');
    const lastRender = useRef(null);
    if (!loading && !error && data?.jcr?.nodeByPath) {
        lastRender.current = {key: renderKey, data};
    }

    // The server refuses values with a GraphQL error, and a network error says nothing about the values.
    const isRefused = Boolean(previewContext.unsavedValues && error?.graphQLErrors?.length);
    // A render that loads has not ended, so the last report stands until the load ends.
    useEffect(() => {
        if (!loading) {
            onUnsavedValuesRefused?.(isRefused);
        }
    }, [loading, isRefused, onUnsavedValuesRefused]);

    useEffect(() => {
        if (error) {
            console.error('Error while fetching preview', error);
        }
    }, [error]);

    useEffect(() => {
        onRefetchReady?.(refetch);
        return () => {
            onRefetchInvalidated?.();
        };
    }, [refetch, onRefetchReady, onRefetchInvalidated]);

    // A content with no page renders itself through the content-template wrapper for its CSS. That render is as slow as
    // the preview and no other item shares it, so the preview shows first and takes the stylesheets when they arrive.
    const isCssSourceShared = !previewContext.cssSourceView;
    const keptData = previewContext.unsavedValues && (loading || isRefused) && lastRender.current?.key === renderKey ?
        lastRender.current.data : null;
    if ((loading && !keptData) || (hasCssSource && isCssSourceShared && cssLoading)) {
        return <LoaderOverlay/>;
    }

    if (error && !keptData) {
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
