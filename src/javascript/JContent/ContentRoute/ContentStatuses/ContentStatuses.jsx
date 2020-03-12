import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';

import JContentConstants from '../../JContent.constants';
import {isMarkedForDeletion, isWorkInProgress} from '../../JContent.utils';
import {getTooltip} from './ContentStatuses.utils';
import styles from './ContentStatuses.scss';
import Status from './Status';

const ContentStatuses = ({node, isDisabled, language, uilang}) => {
    const {t} = useTranslation('jcontent');

    const statuses = {
        locked: node.lockOwner,
        markedForDeletion: isMarkedForDeletion(node),
        modified: false,
        new: false,
        published: false,
        warning: false,
        workInProgress: isWorkInProgress(node, language)
    };

    if (node.aggregatedPublicationInfo) {
        const {publicationStatus} = node.aggregatedPublicationInfo;
        if (publicationStatus === JContentConstants.availablePublicationStatuses.MODIFIED) {
            statuses.modified = true;
        } else if (publicationStatus === JContentConstants.availablePublicationStatuses.NOT_PUBLISHED) {
            statuses.new = true;
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
    return (
        <div className={styles.contentStatuses}>
            {statuses.new && renderStatus('new')}
            {statuses.modified && renderStatus('modified')}
            {statuses.markedForDeletion && renderStatus('markedForDeletion')}
            {statuses.workInProgress && renderStatus('workInProgress')}
            {statuses.locked && renderStatus('locked')}
            {renderStatus(statuses.published ? 'published' : 'notPublished')}
            {statuses.warning && renderStatus('warning')}
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
    isDisabled: PropTypes.bool
};

ContentStatuses.defaultProps = {
    isDisabled: false
};

export default ContentStatuses;
