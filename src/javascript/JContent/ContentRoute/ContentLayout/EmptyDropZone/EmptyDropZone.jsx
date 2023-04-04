import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import JContentConstants from '~/JContent/JContent.constants';
import {Download, Lock, Typography} from '@jahia/moonstone';
import {shallowEqual, useSelector} from 'react-redux';
import {useNodeChecks, useNodeInfo} from '@jahia/data-helper';
import {ACTION_PERMISSIONS} from '../../../actions/actions.constants';
import styles from './EmptyDropZone.scss';
import clsx from 'clsx';

const EmptyDropZone = ({component: Component, isCanDrop, uploadType}) => {
    const currentState = useSelector(state => ({
        site: state.site,
        language: state.language,
        path: state.jcontent.path
    }), shallowEqual);
    const {t} = useTranslation('jcontent');

    const permissions = useNodeChecks({
        path: `/sites/${currentState.site}`,
        language: currentState.language
    }, {
        requiredSitePermission: [ACTION_PERMISSIONS.uploadFilesAction, ACTION_PERMISSIONS.importAction]
    });

    // Check lock status for node
    const nodeInfo = useNodeInfo(
        {path: currentState.path},
        {getLockInfo: true, getIsNodeTypes: ['jmix:markedForDeletion']},
        {fetchPolicy: 'network-only'}
    );

    if (permissions.loading || nodeInfo.loading) {
        return 'Loading...';
    }

    if (nodeInfo.node.lockOwner) {
        let lockReason = '';
        if (nodeInfo.node['jmix:markedForDeletion']) {
            lockReason = t('label.contentManager.contentStatus.markedForDeletion');
        } else {
            lockReason = t('label.contentManager.lockedBy', {userName: nodeInfo.node.lockOwner.value});
        }

        return (
            <Component data-type="emptyZone" className={styles.emptyZone}>
                <Typography variant="heading">
                    {t('jcontent:label.contentManager.fileUpload.locked')}
                    { lockReason ? `: ${lockReason}` : ''}
                </Typography>
                <Lock/>
            </Component>
        );
    }

    if (uploadType === JContentConstants.mode.UPLOAD && permissions.node.site.uploadFilesAction) {
        return (
            <Component data-type="upload" className={clsx(styles.dropZone, isCanDrop && styles.dropZoneEnabled)}>
                {!isCanDrop && <Typography variant="heading">{t('jcontent:label.contentManager.fileUpload.dropMessage')}</Typography>}
                {isCanDrop && <Typography variant="heading">{t('jcontent:label.contentManager.fileUpload.drop')}</Typography>}
                <Download/>
            </Component>
        );
    }

    if (uploadType === JContentConstants.mode.IMPORT && permissions.node.site.importAction) {
        return (
            <Component data-type="import" className={clsx(styles.dropZone, isCanDrop && styles.dropZoneEnabled)}>
                {!isCanDrop && <Typography variant="heading">{t('jcontent:label.contentManager.import.dropMessage')}</Typography>}
                {isCanDrop && <Typography variant="heading">{t('jcontent:label.contentManager.import.drop')}</Typography>}
                <Download/>
            </Component>
        );
    }

    return (
        <Component data-type="emptyZone" className={styles.emptyZone}>
            <Typography variant="heading">{t('jcontent:label.contentManager.fileUpload.nothingToDisplay')}</Typography>
            <Typography>{t('jcontent:label.contentManager.fileUpload.nothingToDisplay2')}</Typography>
        </Component>
    );
};

EmptyDropZone.propTypes = {
    component: PropTypes.string.isRequired,
    uploadType: PropTypes.string,
    isCanDrop: PropTypes.bool
};

export default EmptyDropZone;
