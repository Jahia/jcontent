import React from 'react';
import PropTypes from 'prop-types';
import {Typography} from '@jahia/moonstone';
import {Tooltip} from '@material-ui/core';
import {publicationStatusByName} from './publicationStatusRenderer';
import {useTranslation} from 'react-i18next';
import classNames from 'clsx';
import styles from './PublicationStatus.scss';

export const PublicationStatus = ({node, className, style, isCompact}) => {
    const {t, i18n} = useTranslation('jcontent');
    const publicationStatus = publicationStatusByName.getStatus(node);
    const publicationStatusClass = publicationStatus.getContentClass(styles);
    const publicationStatusBodyClass = publicationStatus.getBodyClass(styles);
    if (!node.operationsSupport.publication) {
        return false;
    }

    // Compact variant for narrow layouts: only the colored bar, the details
    // move from the hover-expanding panel to a tooltip
    if (isCompact) {
        return (
            <div className={classNames(styles.root, className)} style={style || {}}>
                <Tooltip title={<Typography variant="caption">{publicationStatus.geti18nDetailsMessage(node, t, i18n.language)}</Typography>}>
                    <div className={classNames(styles.border, publicationStatusClass)}
                         data-cm-role="publication-info"
                         data-cm-value={node.aggregatedPublicationInfo.publicationStatus}
                    />
                </Tooltip>
            </div>
        );
    }

    return (
        <div className={classNames(styles.root, className)} style={style || {}}>
            <div className={classNames(styles.border, publicationStatusClass)}/>
            <div className={classNames(styles.publicationInfoWrapper, publicationStatusBodyClass)}>
                <div className={styles.publicationInfo}
                     data-cm-role="publication-info"
                     data-cm-value={node.aggregatedPublicationInfo.publicationStatus}
                >
                    {publicationStatus.getIcon({className: styles.spacing, size: 'default'})}

                    <Typography variant="caption" className={styles.spacing}>
                        {publicationStatus.geti18nDetailsMessage(node, t, i18n.language)}
                    </Typography>
                </div>
            </div>
        </div>
    );
};

PublicationStatus.propTypes = {
    node: PropTypes.object.isRequired,
    style: PropTypes.any,
    className: PropTypes.string,
    isCompact: PropTypes.bool
};

export default PublicationStatus;
