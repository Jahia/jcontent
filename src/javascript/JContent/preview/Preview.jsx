import React, {startTransition, useCallback, useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {Paper} from '@material-ui/core';
import {Button, Maximize, Minimize} from '@jahia/moonstone';
import styles from './Preview.scss';
import {PreviewFetcher} from './PreviewFetcher';

/**
 * Shared Preview shell.
 *
 * Mounts PreviewFetcher with startTransition so the host form/UI gets render
 * priority (Decision #8). Workspace is driven entirely by previewContext.workspace —
 * the caller is responsible for managing workspace state.
 *
 * Props:
 *   previewContext       — includes workspace; passed through unchanged to PreviewFetcher
 *   nodeData             — { isPage, path, displayableNode } for IframeViewer zoom
 *   isFullScreen         — controlled externally (Decision #6)
 *   onFullScreenToggle   — optional; renders fullscreen button when provided
 *   onRefetchReady       — (refetch) => void — wire to caller's refetch bus (Decision #4)
 *   onRefetchInvalidated — () => void (Decision #4)
 *   header               — optional React node rendered above the preview (badges, info, etc.)
 *   footer               — optional React node rendered below the preview (name/size card, etc.)
 */
export const Preview = ({
    previewContext,
    fallbackPreviewContext = null,
    nodeData = null,
    isFullScreen = false,
    onFullScreenToggle = null,
    onRefetchReady = null,
    onRefetchInvalidated = null,
    header = null,
    footer = null
}) => {
    const [useFallback, setUseFallback] = useState(false);
    const [shouldDisplay, setShouldDisplay] = useState(false);

    // Use startTransition so host UI (form fields, etc.) renders first (Decision #8)
    useEffect(() => {
        startTransition(() => setShouldDisplay(true));
    }, []);

    useEffect(() => {
        setUseFallback(false);
    }, [nodeData?.path]);

    const handleContentNotFound = useCallback(() => {
        if (fallbackPreviewContext && !useFallback) {
            setUseFallback(true);
        }
    }, [fallbackPreviewContext, useFallback]);

    const activeContext = (useFallback && fallbackPreviewContext) ? fallbackPreviewContext : previewContext;

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
            {shouldDisplay && (
                <PreviewFetcher
                    key={useFallback ? 'fallback' : 'primary'}
                    isFullScreen={isFullScreen}
                    nodeData={nodeData}
                    previewContext={activeContext}
                    onContentNotFound={handleContentNotFound}
                    onRefetchInvalidated={onRefetchInvalidated}
                    onRefetchReady={onRefetchReady}
                />
            )}
            {footer}
        </Paper>
    );
};

Preview.propTypes = {
    previewContext: PropTypes.shape({
        workspace: PropTypes.string
    }).isRequired,
    fallbackPreviewContext: PropTypes.object,
    nodeData: PropTypes.object,
    isFullScreen: PropTypes.bool,
    onFullScreenToggle: PropTypes.func,
    onRefetchReady: PropTypes.func,
    onRefetchInvalidated: PropTypes.func,
    header: PropTypes.node,
    footer: PropTypes.node
};
