import React from 'react';
import PropTypes from 'prop-types';
import {Typography} from '@jahia/moonstone';
import {InfoOutlined} from '@material-ui/icons';
import {publicationStatusByName} from './publicationStatusRenderer';
import {useTranslation} from 'react-i18next';
import classNames from 'clsx';
import styles from './PublicationStatus.scss';

export const PublicationStatus = ({node, className}) => {
    const {t, i18n} = useTranslation();
    const publicationStatus = publicationStatusByName.getStatus(node);
    const publicationStatusClass = publicationStatus.getContentClass(styles);
    if (node.operationsSupport.publication) {
        return (
            <div className={classNames(styles.root, className)}>
                <div className={classNames(styles.border, publicationStatusClass)}/>
                <div className={classNames(styles.publicationInfoWrapper, publicationStatusClass)}>
                    <div className={styles.publicationInfo}
                         data-cm-role="publication-info"
                         data-cm-value={node.aggregatedPublicationInfo.publicationStatus}
                    >
                        <InfoOutlined className={styles.spacing} fontSize="small"/>

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
    className: PropTypes.string
};

export default PublicationStatus;
