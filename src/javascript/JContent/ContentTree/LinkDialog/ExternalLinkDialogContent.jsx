import React from 'react';
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
