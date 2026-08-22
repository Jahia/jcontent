import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {useApolloClient, useMutation, useQuery} from '@apollo/client';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import {Button, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useNotifications} from '@jahia/react-material';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {ClearFocalPointMutation, FocalPointQuery, SetFocalPointMutation} from './FocalPointDialog.gql';
import {
    DEFAULT_FOCAL_POINT,
    fromProperties,
    isDefaultFocalPoint,
    toFocalPoint,
    toObjectPosition
} from './focalPoint.utils';
import styles from './FocalPointDialog.scss';

// Same construction as the media grid cards and the preview: the lastModified cache buster keeps a
// re-uploaded binary from showing its predecessor.
const buildImageUrl = (path, lastModified, useRendition) => {
    const contextPath = window.contextJsParameters?.contextPath || '';
    const encodedPath = path.replaceAll(/[^/]/g, encodeURIComponent);
    const url = `${contextPath}/files/default${encodedPath}${lastModified ? `?lastModified=${lastModified}` : ''}`;
    return useRendition ? `${url}${url.includes('?') ? '&' : '?'}t=thumbnail3` : url;
};

export const FocalPointDialog = ({path, onExit}) => {
    const {t} = useTranslation('jcontent');
    const notificationContext = useNotifications();
    const client = useApolloClient();
    const [open, setOpen] = useState(true);
    const [focalPoint, setFocalPoint] = useState(DEFAULT_FOCAL_POINT);
    const imageRef = useRef(null);

    const {data, loading} = useQuery(FocalPointQuery, {variables: {path}, fetchPolicy: 'network-only'});
    const node = data?.jcr?.nodeByPath;

    useEffect(() => {
        if (node) {
            setFocalPoint(fromProperties(node.focalX?.value, node.focalY?.value));
        }
    }, [node]);

    const onCompleted = () => {
        client.cache.flushNodeEntryByPath(path);
        triggerRefetchAll();
    };

    const [setMutation] = useMutation(SetFocalPointMutation, {onCompleted});
    const [clearMutation] = useMutation(ClearFocalPointMutation, {onCompleted});

    // Report a failure instead of closing as though it had worked: a rejected mutation used to
    // leave the dialog looking successful, and the point silently reverted to the centre.
    const onMutationError = e => {
        console.error('Error while updating the focal point', e);
        notificationContext.notify(t('jcontent:label.contentManager.focalPoint.error'), ['closeButton']);
    };

    const handleSave = () => {
        setMutation({variables: {path, focalX: String(focalPoint.x), focalY: String(focalPoint.y)}})
            .then(() => setOpen(false))
            .catch(onMutationError);
    };

    const handleReset = () => {
        setFocalPoint(DEFAULT_FOCAL_POINT);
        clearMutation({variables: {path}})
            .then(() => setOpen(false))
            .catch(onMutationError);
    };

    const handlePick = event => {
        setFocalPoint(toFocalPoint(event, imageRef.current?.getBoundingClientRect()));
    };

    // The marker is placed with the same percentages that will later drive object-position, so what
    // the editor sees here is literally the value being stored.
    const markerStyle = {left: `${focalPoint.x}%`, top: `${focalPoint.y}%`};

    return (
        <Dialog fullWidth open={open} maxWidth="md" onExited={onExit} onClose={() => setOpen(false)}>
            <DialogTitle>{t('jcontent:label.contentManager.focalPoint.title')}</DialogTitle>
            <DialogContent className={styles.content}>
                <Typography variant="body" className={styles.help}>
                    {t('jcontent:label.contentManager.focalPoint.help')}
                </Typography>

                {!loading && node && (
                    <>
                        <div className={styles.imageFrame}>
                            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                            <img
                                ref={imageRef}
                                className={styles.image}
                                src={buildImageUrl(path, node.lastModified?.value, Boolean(node.hasThumbnail3))}
                                alt={node.displayName}
                                data-sel-role="focal-point-image"
                                onClick={handlePick}
                            />
                            <span className={styles.marker} style={markerStyle} data-sel-role="focal-point-marker"/>
                        </div>

                        <Typography variant="caption" className={styles.value} data-sel-role="focal-point-value">
                            {t('jcontent:label.contentManager.focalPoint.value', {
                                position: toObjectPosition(focalPoint)
                            })}
                        </Typography>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    size="big"
                    variant="ghost"
                    label={t('jcontent:label.contentManager.focalPoint.reset')}
                    disabled={loading || isDefaultFocalPoint(focalPoint)}
                    data-sel-role="focal-point-reset"
                    onClick={handleReset}
                />
                <Button
                    size="big"
                    variant="ghost"
                    label={t('jcontent:label.contentManager.focalPoint.cancel')}
                    data-sel-role="focal-point-cancel"
                    onClick={() => setOpen(false)}
                />
                <Button
                    size="big"
                    color="accent"
                    label={t('jcontent:label.contentManager.focalPoint.save')}
                    disabled={loading}
                    data-sel-role="focal-point-save"
                    onClick={handleSave}
                />
            </DialogActions>
        </Dialog>
    );
};

FocalPointDialog.propTypes = {
    path: PropTypes.string.isRequired,
    onExit: PropTypes.func.isRequired
};

export default FocalPointDialog;
