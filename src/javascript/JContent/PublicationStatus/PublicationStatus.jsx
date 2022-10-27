import React from 'react';
import PropTypes from 'prop-types';
import {Information, Typography} from '@jahia/moonstone';
import {publicationStatusByName} from './publicationStatusRenderer';
import {useTranslation} from 'react-i18next';
import classNames from 'clsx';
import styles from './PublicationStatus.scss';

export const PublicationStatus = ({node, className, style}) => {
    const {t, i18n} = useTranslation('jcontent');
    const publicationStatus = publicationStatusByName.getStatus(node);
    const publicationStatusClass = publicationStatus.getContentClass(styles);
    if (node.operationsSupport.publication) {
        return (
            <div className={classNames(styles.root, className)} style={style || {}}>
                <div className={classNames(styles.border, publicationStatusClass)}/>
                <div className={classNames(styles.publicationInfoWrapper, publicationStatusClass)}>
                    <div className={styles.publicationInfo}
                         data-cm-role="publication-info"
                         data-cm-value={node.aggregatedPublicationInfo.publicationStatus}
                    >
                        <Information className={styles.spacing} size="default"/>

                        <Typography variant="caption" className={styles.spacing}>
                            {publicationStatus.geti18nDetailsMessage(node, t, i18n.language)}
                        </Typography>
                    </div>
                </div>
            </div>
        );
    }

    return false;
};

PublicationStatus.propTypes = {
    node: PropTypes.object.isRequired,
    style: PropTypes.any,
    className: PropTypes.string
};

export default PublicationStatus;
