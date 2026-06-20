import React, {useEffect} from 'react';
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
 *
 * Props:
 *   previewContext     — built by buildCEPreviewContext or buildPreviewContextFromNode
 *   nodeData           — { isPage, path, displayableNode } — passed to IframeViewer for zoom logic
 *   onContentNotFound  — called when zoom anchor (#ce_preview_content) is missing
 *   onRefetchReady     — (refetch) => void  — called on mount; register with your refetch bus
 *   onRefetchInvalidated — () => void       — called on unmount; deregister from your refetch bus
 */
export const PreviewFetcher = React.memo(({
    previewContext,
    nodeData = null,
    isFullScreen = false,
    onContentNotFound,
    onRefetchReady = null,
    onRefetchInvalidated = null
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
        view: 'default',
        contextConfiguration: 'page',
        fetchPolicy: 'cache-first',
        skip: !hasCssSource
    });

    useEffect(() => {
        onRefetchReady?.(refetch);
        return () => {
            onRefetchInvalidated?.();
        };
    }, [refetch, onRefetchReady, onRefetchInvalidated]);

    if (loading || (hasCssSource && cssLoading)) {
        return <LoaderOverlay/>;
    }

    if (error) {
        console.error('Error while fetching preview', error);
        return <NoView/>;
    }

    const pageCssHtml = hasCssSource ? (cssData?.jcr?.nodeByPath?.renderedContent?.output ?? '') : '';

    return (
        <PreviewViewers
            data={data?.jcr ?? {}}
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
        requestAttributes: PropTypes.array,
        requestParameters: PropTypes.array,
        mainResourcePath: PropTypes.string,
        mainResourceContextConfiguration: PropTypes.string,
        cssSourcePath: PropTypes.string
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
    onRefetchInvalidated: PropTypes.func
};
