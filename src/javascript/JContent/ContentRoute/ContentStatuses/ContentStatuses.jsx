import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {isMarkedForDeletion, isWorkInProgress} from '~/JContent/JContent.utils';
import {getTooltip} from './ContentStatuses.utils';
import styles from './ContentStatuses.scss';
import Status from './Status';
import clsx from 'clsx';
import {setPublicationStatus} from '~/utils/contentStatus';

/**
 * Custom hook to compute all available status flags for a content node.
 *
 * @param {Object} params - Hook parameters
 * @param {Object} params.node - The content node to evaluate
 * @param {string} params.language - The language code to evaluate statuses for
 * @returns {Object} Object containing boolean flags for each possible status:
 *   - locked: Whether the node is locked by a user
 *   - markedForDeletion: Whether the node or its ancestor is marked for deletion
 *   - modified: Whether the node has unpublished modifications
 *   - published: Whether the node is published in live
 *   - notPublished: Whether the node is not published
 *   - warning: Whether there are publication warnings
 *   - workInProgress: Whether the node is in work-in-progress status
 *   - notVisible: Whether the node is not visible in the current language
 *   - noTranslation: Whether the node lacks translation in the current language
 *   - permissions: Whether the node has specific permissions set
 *   - visibilityConditions: Whether the node has visibility/channel conditions
 *   - usagesCount: Number of times the node is referenced
 */
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
            node.channelConditions?.values.length > 0),
        usagesCount: node.usagesCount
    };

    const {publicationStatus, existsInLive} = node.aggregatedPublicationInfo || {};
    setPublicationStatus(statuses, publicationStatus, existsInLive);

    return statuses;
};

/**
 * ContentStatuses Component
 *
 * Renders a collection of status indicators for a content node in Jahia's jContent application.
 * The component displays visual badges/chips representing various states of the content such as
 * publication status, locks, work-in-progress, translations, and more.
 * @see {@link useContentStatuses} for different status types this component can render
 *
 * @component
 * @example
 * // Basic usage with default statuses
 * <ContentStatuses
 *   node={contentNode}
 *   language="en"
 *   uilang="en"
 * />
 *
 * @example
 * // Custom rendered statuses with labels disabled
 * <ContentStatuses
 *   node={contentNode}
 *   language="fr"
 *   uilang="en"
 *   renderedStatuses={['locked', 'published', 'workInProgress']}
 *   hasLabel={false}
 * />
 *
 * @example
 * // With custom styling and status-specific props
 * <ContentStatuses
 *   node={contentNode}
 *   hasLabel={false}
 *   language="en"
 *   uilang="en"
 *   className="custom-statuses"
 *   statusProps={{
 *     published: { size: 'big' },
 *     locked: { onClick: handleLockClick, hasLabel: true }
 *   }}
 * />
 *
 * @param {Object} props - Component props
 * @param {Object} props.node - The content node object containing all necessary metadata
 * @param {string} props.language - Content language code (e.g., 'en', 'fr')
 * @param {string} props.uilang - User interface language code for displaying tooltips
 * @param {boolean} [props.isDisabled=false] - Whether status badges should be disabled/non-interactive
 * @param {string} [props.className] - Additional CSS class name to apply to the container
 * @param {boolean} [props.hasLabel=true] - Whether to display text labels alongside status icons
 * @param {Object} [props.statusProps] - Object containing props to override status props for specific status types.
 * @param {Object} props...rest - Additional props for Status components
 *
 * @returns {React.JSX.Element|null} A div containing Status components, or null if no statuses are active
 *
 * @see {@link useContentStatuses} - Hook used internally to compute statuses
 * @see {@link Status} - Individual status component
 */
const ContentStatuses = ({node, isDisabled, language, uilang, renderedStatuses, className, hasLabel, statusProps, ...props}) => {
    const {t} = useTranslation('jcontent');
    const statuses = useContentStatuses({node, language});
    const labelParams = {
        noTranslation: {language: language.toUpperCase()},
        usagesCount: {count: statuses.usagesCount}
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

        if (s === 'usagesCount' && statuses[s] === 0) {
            return null;
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
