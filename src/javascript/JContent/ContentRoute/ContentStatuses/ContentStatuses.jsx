import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';

import JContentConstants from '~/JContent/JContent.constants';
import {isMarkedForDeletion, isWorkInProgress} from '~/JContent/JContent.utils';
import {getTooltip} from './ContentStatuses.utils';
import styles from './ContentStatuses.scss';
import Status from './Status';
import clsx from 'clsx';

const ContentStatuses = ({node, isDisabled, language, uilang, renderedStatuses, className}) => {
    const {t} = useTranslation('jcontent');

    const statuses = {
        locked: node.lockOwner,
        markedForDeletion: isMarkedForDeletion(node),
        modified: false,
        published: false,
        warning: false,
        workInProgress: isWorkInProgress(node, language)
    };

    if (node.aggregatedPublicationInfo) {
        const {publicationStatus} = node.aggregatedPublicationInfo;
        if (publicationStatus === JContentConstants.availablePublicationStatuses.MODIFIED) {
            statuses.modified = true;
            statuses.published = true;
        } else if (publicationStatus === JContentConstants.availablePublicationStatuses.NOT_PUBLISHED) {
            statuses.published = false;
        } else if (publicationStatus === JContentConstants.availablePublicationStatuses.PUBLISHED) {
            statuses.published = true;
        } else if (publicationStatus === JContentConstants.availablePublicationStatuses.UNPUBLISHED) {
            statuses.published = false;
        } else if (publicationStatus && publicationStatus !== JContentConstants.availablePublicationStatuses.MARKED_FOR_DELETION) {
            statuses.warning = true;
        }
    }

    const renderStatus = type => (
        <Status type={type} isDisabled={isDisabled} tooltip={getTooltip(node, type, t, uilang)}/>
    );

    const statusesToRender = renderedStatuses.map(s => {
        if (s === 'published') {
            return !statuses.warning && renderStatus(statuses.published ? 'published' : 'notPublished');
        }

        return statuses[s] && renderStatus(s);
    });

    return (
        <div className={className ? clsx(className, styles.contentStatuses) : styles.contentStatuses}>
            {statusesToRender}
        </div>
    );
};

ContentStatuses.propTypes = {
    node: PropTypes.shape({
        aggregatedPublicationInfo: PropTypes.shape({
            publicationStatus: PropTypes.string
        }),
        deleted: PropTypes.shape({
            value: PropTypes.string
        }),
        deletedBy: PropTypes.shape({
            value: PropTypes.string
        }),
        lastModified: PropTypes.shape({
            value: PropTypes.string
        }),
        lastModifiedBy: PropTypes.shape({
            value: PropTypes.string
        }),
        lastPublished: PropTypes.shape({
            value: PropTypes.string
        }),
        lastPublishedBy: PropTypes.shape({
            value: PropTypes.string
        }),
        lockOwner: PropTypes.shape({
            value: PropTypes.string
        }),
        mixinTypes: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string
        })),
        wipStatus: PropTypes.shape({
            value: PropTypes.string
        }),
        wipLangs: PropTypes.shape({
            values: PropTypes.arrayOf(PropTypes.string)
        }),
        ancestors: PropTypes.arrayOf(PropTypes.shape({
            deleted: PropTypes.shape({
                value: PropTypes.string
            }),
            deletedBy: PropTypes.shape({
                value: PropTypes.string
            })
        }))
    }).isRequired,
    language: PropTypes.string.isRequired,
    uilang: PropTypes.string.isRequired,
    isDisabled: PropTypes.bool,
    renderedStatuses: PropTypes.array,
    className: PropTypes.string
};

ContentStatuses.defaultProps = {
    isDisabled: false,
    renderedStatuses: ['modified', 'markedForDeletion', 'workInProgress', 'locked', 'published', 'warning']
};

export default ContentStatuses;
