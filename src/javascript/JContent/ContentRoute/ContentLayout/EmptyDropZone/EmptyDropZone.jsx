import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import JContentConstants from '~/JContent/JContent.constants';
import {Download, Typography} from '@jahia/moonstone';
import {shallowEqual, useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import {ACTION_PERMISSIONS} from '../../../actions/actions.constants';
import styles from './EmptyDropZone.scss';

const EmptyDropZone = ({component: Component, uploadType}) => {
    const currentState = useSelector(state => ({site: state.site, language: state.language}), shallowEqual);
    const {t} = useTranslation('jcontent');

    const permissions = useNodeChecks({
        path: `/sites/${currentState.site}`,
        language: currentState.language
    }, {
        requiredSitePermission: [ACTION_PERMISSIONS.uploadFilesAction, ACTION_PERMISSIONS.importAction]
    });

    if (permissions.loading) {
        return 'Loading...';
    }

    if (uploadType === JContentConstants.mode.UPLOAD && permissions.node.site.uploadFilesAction) {
        return (
            <Component className={styles.dropZone}>
                <Typography variant="heading" weight="light">{t('jcontent:label.contentManager.fileUpload.dropMessage')}</Typography>
                <Download/>
            </Component>
        );
    }

    if (uploadType === JContentConstants.mode.IMPORT && permissions.node.site.importAction) {
        return (
            <Component className={styles.dropZone}>
                <Typography variant="heading" weight="light">{t('jcontent:label.contentManager.import.dropMessage')}</Typography>
                <Download/>
            </Component>
        );
    }

    return (
        <Component className={styles.emptyZone}>
            <Typography variant="heading" weight="light">{t('jcontent:label.contentManager.fileUpload.nothingToDisplay')}</Typography>
            <Typography weight="light">{t('jcontent:label.contentManager.fileUpload.nothingToDisplay2')}</Typography>
        </Component>
    );
};

EmptyDropZone.propTypes = {
    component: PropTypes.string.isRequired,
    uploadType: PropTypes.string.isRequired
};

export default EmptyDropZone;
