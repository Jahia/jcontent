import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {isMarkedForDeletion, isWorkInProgress} from '~/JContent/JContent.utils';
import {getTooltip} from './ContentStatuses.utils';
import styles from './ContentStatuses.scss';
import Status from './Status';
import clsx from 'clsx';
import {setPublicationStatus} from '~/utils/contentStatus';

const useContentStatuses = ({node, language}) => {
    const statuses = {
        locked: node.lockOwner,
        markedForDeletion: isMarkedForDeletion(node),
        modified: false,
        published: false,
        notPublished: true,
        warning: false,
        workInProgress: isWorkInProgress(node, language),
        notVisible: Boolean(node.invalidLanguages?.values.includes(language)),
        noTranslation: !node.translationLanguages?.includes(language),
        permissions: Boolean(node.permissions?.children?.nodes?.length > 0),
        visibilityConditions: Boolean(
            node.visibilityConditions?.children?.nodes?.length > 0 ||
            node.invalidLanguages?.values.length > 0 ||
            node.channelConditions?.values.length > 0)
    };

    const {publicationStatus, existsInLive} = node.aggregatedPublicationInfo || {};
    setPublicationStatus(statuses, publicationStatus, existsInLive);

    return statuses;
};

const ContentStatuses = ({node, isDisabled, language, uilang, renderedStatuses, className, hasLabel, statusProps, ...props}) => {
    const {t} = useTranslation('jcontent');
    const statuses = useContentStatuses({node, language});
    const labelParams = {
        noTranslation: {language: language.toUpperCase()}
    };

    const renderStatus = type => (
        <Status
            key={type}
            type={type}
            isDisabled={isDisabled}
            tooltip={getTooltip(node, type, t, uilang)}
            hasLabel={hasLabel}
            labelParams={labelParams?.[type]}
            {...props}
            // Specific override object from a given status type
            {...statusProps?.[type]}
        />
    );

    const statusesToRender = renderedStatuses.map(s => {
        if (s === 'published') {
            return !statuses.warning && renderStatus(statuses.published ? 'published' : 'notPublished');
        }

        return statuses[s] && renderStatus(s);
    });

    // Do not return empty div
    if (statusesToRender.find(s => s) === undefined) {
        return null;
    }

    return (
        <div className={className ? clsx(className, styles.contentStatuses) : styles.contentStatuses}>
            {statusesToRender}
        </div>
    );
};

ContentStatuses.propTypes = {
    node: PropTypes.shape({
        aggregatedPublicationInfo: PropTypes.shape({
            publicationStatus: PropTypes.string,
            existsInLive: PropTypes.bool
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
        translationLanguages: PropTypes.arrayOf(PropTypes.string),
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
    className: PropTypes.string,
    hasLabel: PropTypes.bool,
    statusProps: PropTypes.object
};

ContentStatuses.defaultProps = {
    isDisabled: false,
    hasLabel: true,
    renderedStatuses: ['modified', 'markedForDeletion', 'workInProgress', 'locked', 'published', 'warning']
};

export {ContentStatuses, useContentStatuses};
