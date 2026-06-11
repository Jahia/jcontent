import React, {startTransition, useCallback, useMemo, useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Paper} from '@material-ui/core';
import {Badge} from '@jahia/design-system-kit';
import {Button, ButtonGroup, Maximize, Minimize} from '@jahia/moonstone';
import styles from './Preview.scss';
import {PreviewFetcher} from './PreviewFetcher';

/**
 * Shared Preview shell.
 *
 * Manages workspace toggle state and mounts PreviewFetcher with startTransition
 * so the host form/UI gets render priority (Decision #8).
 *
 * Props:
 *   previewContext       — base context (workspace value overridden internally when toggled)
 *   nodeData             — { isPage, path, displayableNode } for IframeViewer zoom
 *   isFullScreen         — controlled externally (Decision #6)
 *   isLiveDisabled       — disable Live button (e.g. content not published) (Decision #3)
 *   isEditDisabled       — disable Edit button (e.g. content marked for deletion)
 *   onRefetchReady       — (refetch) => void — wire to caller's refetch bus (Decision #4)
 *   onRefetchInvalidated — () => void (Decision #4)
 *   header               — optional React node rendered above the preview (badges, info, etc.)
 */
export const Preview = ({
    previewContext,
    nodeData = null,
    isFullScreen = false,
    isLiveDisabled = false,
    isEditDisabled = false,
    onFullScreenToggle = null,
    onRefetchReady = null,
    onRefetchInvalidated = null,
    header = null
}) => {
    const {t} = useTranslation('jcontent');
    const [workspace, setWorkspace] = useState(previewContext.workspace ?? 'edit');
    const [contentNotFound, setContentNotFound] = useState(false);
    const [shouldDisplay, setShouldDisplay] = useState(false);

    // Sync internal workspace when caller drives it externally (e.g. PreviewDrawer Redux toggle)
    useEffect(() => {
        if (previewContext.workspace !== undefined) {
            setWorkspace(previewContext.workspace);
        }
    }, [previewContext.workspace]);

    // Fall back workspace when the current one becomes disabled
    useEffect(() => {
        if (isEditDisabled && workspace === 'edit') {
            setWorkspace('live');
        }

        if (isLiveDisabled && workspace === 'live') {
            setWorkspace('edit');
        }
    }, [isEditDisabled, isLiveDisabled, workspace]);

    // Use startTransition so host UI (form fields, etc.) renders first (Decision #8)
    useEffect(() => {
        startTransition(() => setShouldDisplay(true));
    }, []);

    const handleContentNotFound = useCallback(() => setContentNotFound(true), []);

    const effectivePreviewContext = useMemo(() => ({
        ...previewContext,
        workspace
    }), [previewContext, workspace]);

    return (
        <Paper className={styles.previewShell}>
            {(header || onFullScreenToggle) && (
                <div className={styles.header}>
                    <div>{header}</div>
                    {onFullScreenToggle && (
                        <Button
                            data-sel-role="preview-fullscreen-toggle"
                            icon={isFullScreen ? <Minimize/> : <Maximize/>}
                            size="small"
                            variant="ghost"
                            onClick={onFullScreenToggle}
                        />
                    )}
                </div>
            )}
            <div className={styles.workspaceToggle}>
                <ButtonGroup>
                    <Button
                        isDisabled={workspace === 'edit' || isEditDisabled}
                        data-sel-role="edit-preview-button"
                        label={t('jcontent:label.contentManager.contentPreview.staging')}
                        onClick={() => setWorkspace('edit')}
                    />
                    <Button
                        isDisabled={workspace === 'live' || isLiveDisabled}
                        data-sel-role="live-preview-button"
                        label={t('jcontent:label.contentManager.contentPreview.live')}
                        onClick={() => setWorkspace('live')}
                    />
                </ButtonGroup>
            </div>
            {contentNotFound && (
                <div>
                    <Badge
                        badgeContent={t('jcontent:label.contentEditor.preview.contentNotFound')}
                        color="warning"
                        variant="normal"
                    />
                </div>
            )}
            {shouldDisplay && (
                <PreviewFetcher
                    isFullScreen={isFullScreen}
                    nodeData={nodeData}
                    previewContext={effectivePreviewContext}
                    onContentNotFound={handleContentNotFound}
                    onRefetchInvalidated={onRefetchInvalidated}
                    onRefetchReady={onRefetchReady}
                />
            )}
        </Paper>
    );
};

Preview.propTypes = {
    previewContext: PropTypes.shape({
        workspace: PropTypes.string
    }).isRequired,
    nodeData: PropTypes.object,
    isFullScreen: PropTypes.bool,
    isLiveDisabled: PropTypes.bool,
    isEditDisabled: PropTypes.bool,
    onFullScreenToggle: PropTypes.func,
    onRefetchReady: PropTypes.func,
    onRefetchInvalidated: PropTypes.func,
    header: PropTypes.node
};
