import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {useContentPreview} from '@jahia/data-helper';
import {useTranslation} from 'react-i18next';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {PreviewViewers} from './viewers';

/**
 * Shared preview data fetcher.
 *
 * Fetches rendered content via useContentPreview and delegates rendering
 * to PreviewViewers. Exposes refetch lifecycle via props so callers can
 * register/deregister with their own refetch bus (Decision #4).
 *
 * Props:
 *   previewContext     — built by buildPreviewContextFromEditorContext or buildPreviewContextFromNode
 *   nodeData           — { isPage, path, displayableNode } — passed to IframeViewer for zoom logic
 *   onContentNotFound  — called when zoom anchor (#ce_preview_content) is missing
 *   onRefetchReady     — (refetch) => void  — called on mount; register with your refetch bus
 *   onRefetchInvalidated — () => void       — called on unmount; deregister from your refetch bus
 */
export const PreviewFetcher = React.memo(({
    previewContext,
    nodeData,
    isFullScreen,
    onContentNotFound,
    onRefetchReady,
    onRefetchInvalidated
}) => {
    const {t} = useTranslation('jcontent');
    const {data, loading, error, refetch} = useContentPreview({
        ...previewContext,
        fetchPolicy: 'network-only'
    });

    useEffect(() => {
        onRefetchReady?.(refetch);
        return () => {
            onRefetchInvalidated?.();
        };
    }, [refetch, onRefetchReady, onRefetchInvalidated]);

    if (error) {
        return (
            <>{t('jcontent:label.contentEditor.error.queryingContent', {details: error.message ?? ''})}</>
        );
    }

    if (loading) {
        return <LoaderOverlay/>;
    }

    return (
        <PreviewViewers
            data={data?.jcr ?? {}}
            isFullScreen={isFullScreen}
            nodeData={nodeData}
            previewContext={previewContext}
            onContentNotFound={onContentNotFound}
        />
    );
});

PreviewFetcher.displayName = 'PreviewFetcher';

PreviewFetcher.defaultProps = {
    nodeData: null,
    isFullScreen: false,
    onRefetchReady: null,
    onRefetchInvalidated: null
};

PreviewFetcher.propTypes = {
    previewContext: PropTypes.shape({
        path: PropTypes.string.isRequired,
        workspace: PropTypes.string.isRequired,
        language: PropTypes.string.isRequired,
        templateType: PropTypes.string,
        view: PropTypes.string,
        contextConfiguration: PropTypes.string,
        requestAttributes: PropTypes.array,
        requestParameters: PropTypes.array
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
