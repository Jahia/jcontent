import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Badge} from '@jahia/design-system-kit';
import {LoaderOverlay} from '~/ContentEditor/DesignSystem/LoaderOverlay';
import {PreviewViewers} from './viewers';
import {NoView} from './viewers/NoView';
import {useContentPreview} from './useContentPreview';
import {useDirtyContentPreview} from './useDirtyContentPreview';
import styles from './DirtyPreviewFetcher.scss';

/**
 * PreviewFetcher's counterpart wherever content can be edited while it is previewed.
 *
 * It covers BOTH states of such a preview — the stored content when the form is untouched, the
 * form's unsaved values once it is dirty — and that is deliberate rather than tidy: a component
 * swap between the two would unmount the frame, and reloading the document on the first
 * keystroke is exactly what the in-place patching exists to avoid. So the fetcher stays mounted
 * and switches data source underneath, which keeps one live document for the whole edit.
 *
 * Unsaved values come from a non-saving MUTATION; stored content from the ordinary query, the
 * same one PreviewFetcher runs. Everything downstream — viewers, zoom, CSS injection, the module
 * fallback — is the shared code and is unaware of which produced the HTML.
 *
 * `dirtyPreviewContext` is where the live render happens and is usually the node's own module
 * render, while `previewContext` stays the full in-context page. The viewer patches one into the
 * other, so the editor keeps the page framing without paying for a page render per keystroke.
 *
 * The CSS source page is fetched with the ordinary cached query: page CSS does not depend on the
 * values being edited, so it is fetched once and reused across every keystroke.
 */
export const DirtyPreviewFetcher = ({
    previewContext,
    dirtyPreviewContext = null,
    dirtyPayload = null,
    nodeData = null,
    isFullScreen = false,
    onContentNotFound
}) => {
    const {t} = useTranslation('jcontent');
    const isDirty = Boolean(dirtyPayload);
    const liveContext = dirtyPreviewContext || previewContext;

    const dirty = useDirtyContentPreview({
        previewContext: liveContext,
        dirtyPayload,
        skip: !isDirty
    });

    const stored = useContentPreview({
        ...previewContext,
        fetchPolicy: 'network-only',
        skip: isDirty
    });

    const data = isDirty ? dirty.data : stored.data?.jcr;
    const loading = isDirty ? dirty.loading : stored.loading;
    const error = isDirty ? dirty.error : stored.error;
    const isStale = isDirty && dirty.isStale;
    const isRefreshing = isDirty && dirty.isRefreshing;
    // The context that produced the HTML now on screen — what the viewer needs to interpret it.
    const activeContext = isDirty ? liveContext : previewContext;

    const hasCssSource = Boolean(activeContext.cssSourcePath);
    const {data: cssData, loading: cssLoading} = useContentPreview({
        path: activeContext.cssSourcePath,
        workspace: activeContext.workspace,
        language: activeContext.language,
        templateType: activeContext.templateType,
        view: 'default',
        contextConfiguration: 'page',
        fetchPolicy: 'cache-first',
        skip: !hasCssSource
    });

    if (loading || (hasCssSource && cssLoading)) {
        return <LoaderOverlay/>;
    }

    // An error with nothing rendered yet is a dead end; an error with a previous render is just
    // a transient invalid form state, so the last good output stays up, flagged as stale.
    if (error && !data) {
        console.error('Error while rendering the preview', error);
        return <NoView/>;
    }

    const pageCssHtml = hasCssSource ? (cssData?.jcr?.nodeByPath?.renderedContent?.output ?? '') : '';

    return (
        <>
            {isStale && (
                <div className={styles.statusBadge} data-sel-role="live-preview-stale">
                    <Badge badgeContent={t('jcontent:label.contentEditor.preview.couldNotUpdate')}
                           variant="normal"
                           color="warning"
                    />
                </div>
            )}
            <PreviewViewers
                data={data ?? {}}
                isFullScreen={isFullScreen}
                isRefreshing={isRefreshing}
                nodeData={nodeData}
                pageCssHtml={pageCssHtml}
                previewContext={activeContext}
                onContentNotFound={onContentNotFound}
            />
        </>
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
    dirtyPreviewContext: PropTypes.object,
    dirtyPayload: PropTypes.shape({
        uuid: PropTypes.string.isRequired,
        propertiesToSave: PropTypes.array,
        propertiesToDelete: PropTypes.array,
        mixinsToAdd: PropTypes.array,
        mixinsToDelete: PropTypes.array
    }),
    nodeData: PropTypes.object,
    isFullScreen: PropTypes.bool,
    onContentNotFound: PropTypes.func.isRequired
};
