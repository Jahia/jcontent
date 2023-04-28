import React from 'react';
import PropTypes from 'prop-types';
import {DialogContent} from '@material-ui/core';
import {Typography} from '@jahia/moonstone';
import styles from './LinkDialog.scss';

export const ExternalLinkDialogContent = ({node, data, t, ...otherProps}) => {
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
    data: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired
};
