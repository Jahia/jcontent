import React from 'react';
import PropTypes from 'prop-types';
import {DialogContent} from '@material-ui/core';
import {Typography} from '@jahia/moonstone';
import styles from './Dialog.scss';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

export const InternalLinkDialogContent = ({node, data, ...otherProps}) => {
    const {t} = useTranslation('jcontent');
    const siteKey = useSelector(state => state.site);

    const {displayName, path, linkSite} = data?.jcr.nodeByPath?.internalLink?.refNode || {};
    const isSameSite = linkSite?.sitekey === siteKey;

    return (
        <DialogContent {...otherProps}>
            <Typography variant="subheading">
                {t('jcontent:label.contentManager.links.internal.editDialog.body')}&nbsp;
                <Typography variant="subheading" component="span" weight="bold">{displayName}</Typography>&nbsp;
                {!isSameSite && (
                    <>
                        {t('jcontent:label.contentManager.links.internal.editDialog.ofSite')}&nbsp;
                        <Typography variant="subheading" component="span" weight="bold">{linkSite?.displayName}</Typography>
                    </>
                )}
            </Typography>
            <br/>
            <Typography variant="subheading" className={styles.url}>{path || ''}</Typography>
        </DialogContent>
    );
};

InternalLinkDialogContent.propTypes = {
    node: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired
};
