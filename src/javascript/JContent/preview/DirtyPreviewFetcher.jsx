import React from 'react';
import PropTypes from 'prop-types';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {PreviewViewers} from './viewers';
import {NoView} from './viewers/NoView';
import {useContentPreview} from './useContentPreview';
import {useDirtyContentPreview} from './useDirtyContentPreview';

/**
 * PreviewFetcher's counterpart for content that is being edited.
 *
 * Same props, same output: it swaps the read-only preview QUERY for a non-saving MUTATION that
 * applies the form's unsaved values before rendering, so what the editor sees is the content as
 * it WOULD be once saved. Everything downstream — viewers, zoom, CSS injection, the module
 * fallback — is the shared code and is unaware of which fetcher produced the HTML.
 *
 * The CSS source page is still fetched with the ordinary cached query: page CSS does not depend
 * on the values being edited, so it is fetched once and reused across every keystroke.
 */
export const DirtyPreviewFetcher = ({
    previewContext,
    dirtyPayload,
    nodeData = null,
    isFullScreen = false,
    onContentNotFound
}) => {
    const {data, loading, error} = useDirtyContentPreview({previewContext, dirtyPayload});

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

    if (loading || (hasCssSource && cssLoading)) {
        return <LoaderOverlay/>;
    }

    // An error with nothing rendered yet is a dead end; an error with a previous render is just
    // a transient invalid form state, so the last good output stays up.
    if (error && !data) {
        console.error('Error while rendering the unsaved preview', error);
        return <NoView/>;
    }

    const pageCssHtml = hasCssSource ? (cssData?.jcr?.nodeByPath?.renderedContent?.output ?? '') : '';

    return (
        <PreviewViewers
            data={data ?? {}}
            isFullScreen={isFullScreen}
            nodeData={nodeData}
            pageCssHtml={pageCssHtml}
            previewContext={previewContext}
            onContentNotFound={onContentNotFound}
        />
    );
};

DirtyPreviewFetcher.propTypes = {
    previewContext: PropTypes.shape({
        path: PropTypes.string.isRequired,
        workspace: PropTypes.string.isRequired,
        language: PropTypes.string.isRequired,
        templateType: PropTypes.string,
        view: PropTypes.string,
        contextConfiguration: PropTypes.string,
        requestAttributes: PropTypes.array,
        mainResourcePath: PropTypes.string,
        cssSourcePath: PropTypes.string
    }).isRequired,
    dirtyPayload: PropTypes.shape({
        uuid: PropTypes.string.isRequired,
        propertiesToSave: PropTypes.array,
        propertiesToDelete: PropTypes.array,
        mixinsToAdd: PropTypes.array,
        mixinsToDelete: PropTypes.array
    }).isRequired,
    nodeData: PropTypes.object,
    isFullScreen: PropTypes.bool,
    onContentNotFound: PropTypes.func.isRequired
};
