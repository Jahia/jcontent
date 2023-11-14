import React from 'react';
import PropTypes from 'prop-types';
import {DialogContent} from '@material-ui/core';
import {Typography} from '@jahia/moonstone';
import styles from './Dialog.scss';
import {useTranslation} from 'react-i18next';

export const ExternalLinkDialogContent = ({node, data, ...otherProps}) => {
    const {t} = useTranslation('jcontent');

    const url = data?.jcr.nodeByPath?.externalLink?.value;
    return (
        <DialogContent {...otherProps}>
            <Typography variant="subheading">
                {t('jcontent:label.contentManager.links.external.editDialog.body')}
            </Typography>
            <br/>
            <Typography variant="subheading" className={styles.url}>{url}</Typography>
        </DialogContent>
    );
};

ExternalLinkDialogContent.propTypes = {
    node: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired
};
