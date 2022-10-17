import React, {useEffect, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core';
import styles from './DownloadFileDialog.scss';
import {Button, Chip, Copy, Dropdown, Folder, Typography} from '@jahia/moonstone';
import {useTranslation} from 'react-i18next';
import {useQuery} from '@apollo/react-hooks';
import {FileInfoQuery} from '~/JContent/actions/downloadFileAction/DownloadFileDialog/DownloadFileDialog.gql-queries';
import clsx from 'clsx';
import {NodeIcon} from '~/utils';
import {FileSize} from '~/shared';
import {useNotifications} from '@jahia/react-material';

export const DownloadFileDialog = ({path, onExit}) => {
    const [open, setOpen] = useState(true);
    const {t} = useTranslation('jcontent');
    const {notify} = useNotifications();
    const aRef = useRef();
    const [mode, setMode] = useState();

    const {data} = useQuery(FileInfoQuery, {
        variables: {path, language: 'en'}
    });

    const handleClose = () => setOpen(false);

    const href = mode && new URL(window.contextJsParameters.contextPath + '/files/' + mode.value + path, window.location.href).toString();
    const node = data?.jcr?.nodeByPath;

    const dropdownData = useMemo(() => [
        {label: t('jcontent:label.contentManager.downloadFile.default'), value: 'default'},
        {label: t('jcontent:label.contentManager.downloadFile.live'), value: 'live', isDisabled: !(node?.aggregatedPublicationInfo?.existsInLive)}
    ], [t, node]);

    useEffect(() => {
        if (node && !node.aggregatedPublicationInfo.existsInLive) {
            setMode(dropdownData[0]);
        } else {
            setMode(dropdownData[1]);
        }
    }, [node, dropdownData]);

    const sizeInfo = (node && node.height && node.width) ? `${parseInt(node.height.value, 10)} x ${parseInt(node.width.value, 10)} - ` : '';

    return (
        <Dialog open={open}
                aria-labelledby="form-dialog-title"
                classes={{paper: styles.root}}
                onClose={handleClose}
                onExited={onExit}
        >
            <DialogTitle id="form-dialog-title">{t('jcontent:label.contentManager.downloadFile.title')}</DialogTitle>
            <DialogContent>
                <Typography weight="bold">
                    {t('jcontent:label.contentManager.downloadFile.selectVersion')}
                </Typography>
                {mode && node && (
                    <>
                        <Dropdown
                            maxWidth="100%"
                            className={styles.dropdown}
                            variant="outlined"
                            data={dropdownData}
                            label={mode.label}
                            value={mode.value}
                            onChange={(e, item) => setMode(item)}
                        />
                        <a ref={aRef} title="download" href={href} download={path.split('/').pop()}> </a>

                        <div className={clsx(styles.card, 'flexRow_nowrap', 'alignCenter')}>
                            <div className={styles.cardThumbnail}>
                                {node.isImage ? <img src={href}/> : <NodeIcon node={node}/>}
                            </div>
                            <div className={clsx(styles.gap, 'flexFluid', 'flexCol')}>
                                <Typography isNowrap>{node?.displayName}</Typography>
                                <div className={clsx('flexRow', styles.gap)}>
                                    <Chip icon={<Folder/>} label={node?.parent?.name}/>
                                    <Typography variant="caption" className={styles.grey}>
                                        {sizeInfo} <FileSize node={node}/>
                                    </Typography>
                                </div>
                            </div>
                            <Button
                                className={styles.grey}
                                icon={<Copy/>}
                                size="default"
                                label={t('jcontent:label.contentManager.downloadFile.copyUrl')}
                                data-sel-role="download-copyUrl"
                                onClick={() => {
                                    navigator.clipboard.writeText(href);
                                    notify(t('jcontent:label.contentManager.downloadFile.copied'), ['closeButton']);
                                }}
                            />
                        </div>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    size="big"
                    label={t('jcontent:label.cancel')}
                    data-sel-role="download-cancel"
                    onClick={handleClose}
                />
                <Button
                    color="accent"
                    size="big"
                    label={t('jcontent:label.contentManager.downloadFile.download')}
                    data-sel-role="do-download"
                    onClick={() => {
                        aRef.current.click();
                    }}
                />
            </DialogActions>
        </Dialog>
    );
};

DownloadFileDialog.propTypes = {
    path: PropTypes.string.isRequired,
    onExit: PropTypes.func.isRequired
};

