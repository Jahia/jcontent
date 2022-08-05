import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import JContentConstants from '~/JContent/JContent.constants';
import {Publish, Typography} from '@jahia/moonstone';
import {shallowEqual, useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import {ACTION_PERMISSIONS} from '../../../actions/actions.constants';
import styles from './EmptyDropZone.scss';

const EmptyDropZone = ({component: Component, mode}) => {
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

    if (mode === JContentConstants.mode.MEDIA && permissions.node.site.uploadFilesAction) {
        return (
            <Component className={styles.dropZone}>
                <Typography variant="heading" weight="light">{t('jcontent:label.contentManager.fileUpload.dropMessage')}</Typography>
                <Publish/>
            </Component>
        );
    }

    if (mode === JContentConstants.mode.CONTENT_FOLDERS && permissions.node.site.importAction) {
        return (
            <Component className={styles.dropZone}>
                <Typography variant="heading" weight="light">{t('jcontent:label.contentManager.import.dropMessage')}</Typography>
                <Publish/>
            </Component>
        );
    }

    return (
        <Component className={styles.emptyZone}>
            <Typography variant="heading" weight="light">{t('jcontent:label.contentManager.fileUpload.nothingToDisplay')}</Typography>
        </Component>
    );
};

EmptyDropZone.propTypes = {
    component: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired
};

export default EmptyDropZone;
