import React, {useEffect, useMemo} from 'react';
import styles from './Box.scss';
import {useContentStatuses} from '~/JContent/ContentRoute/ContentStatuses/ContentStatuses';
import ContentStatuses from '~/JContent/ContentRoute/ContentStatuses';
import {useDispatch, useSelector} from 'react-redux';
import {addContentStatusPaths} from '~/JContent/redux/contentStatus.redux';
import JContentConstants from '~/JContent/JContent.constants';

export const useBoxStatus = ({node, nodes, element, language, isEnabled, isMarkedForDeletionRoot}) => {
    const {PUBLISHED, PERMISSIONS, VISIBILITY, NO_STATUS} = JContentConstants.statusView;
    const statusMode = useSelector(state => state.jcontent.contentStatus.active) || NO_STATUS;
    const contentStatuses = useContentStatuses({node, language});
    const parentStatuses = useContentStatuses({node: nodes[node.parent?.path] || {}, language});
    const dispatch = useDispatch();

    const nodeStatuses = useMemo(() => {
        const statuses = ['permissions', 'workInProgress', 'modified', 'notPublished', 'notVisible', 'visibilityConditions', 'noTranslation'];
        const activeStatuses = statuses.filter(s => {
            if (s === 'notPublished') {
                // For 'notPublished' status, we display status only when parent is published
                return Boolean(parentStatuses.published && contentStatuses[s]);
            }

            if (s === 'noTranslation') {
                return Boolean(element.getAttribute('translatable') && contentStatuses[s]);
            }

            return Boolean(contentStatuses[s]);
        });
        return new Set(activeStatuses);
    }, [contentStatuses, element, parentStatuses.published]);

    // Update path in content status redux state to track status count
    useEffect(() => {
        if (isMarkedForDeletionRoot) {
            return;
        }

        const {PUBLISHED, PERMISSIONS, VISIBILITY} = JContentConstants.statusView;
        const statusToViewKeyMapping = {
            modified: PUBLISHED,
            notPublished: PUBLISHED,
            visibilityConditions: VISIBILITY,
            permissions: PERMISSIONS
        };

        // Collect statuses that this node has and map it to the redux state keys
        const statusKeys = Object.keys(statusToViewKeyMapping)
            .filter(status => nodeStatuses.has(status))
            .map(status => statusToViewKeyMapping[status]);
        if (statusKeys.length > 0) {
            dispatch(addContentStatusPaths({statusKeys, path: node.path}));
        }
    }, [dispatch, nodeStatuses, node.path, isMarkedForDeletionRoot]);

    // Mapping of selected status in header dropdown to the status badges to be displayed
    const selectedStatus = {
        [PUBLISHED]: ['modified', 'notPublished'],
        [VISIBILITY]: ['visibilityConditions'],
        [PERMISSIONS]: ['permissions']
    };

    const activeStatuses = ['notVisible']
        .concat(selectedStatus[statusMode] || [])
        .concat(['workInProgress', 'noTranslation']);
    const displayStatuses = activeStatuses.filter(s => nodeStatuses.has(s));

    const isStatusHighlighted = isEnabled && displayStatuses.length > 0;
    const displayLabel = element.getBoundingClientRect().width > 300; // Responsive badges
    const BoxStatus = isStatusHighlighted ? (
        <ContentStatuses
            color="warning"
            variant="bright"
            hasLabel={displayLabel}
            statusProps={{notVisible: {color: 'default', variant: 'default'}}}
            className={styles.displayStatus}
            node={node}
            // We don't want to show notVisible badge if VISIBILITY status (visibilityConditions badge) is enabled
            renderedStatuses={displayStatuses.filter(s => statusMode !== VISIBILITY || s !== 'notVisible')}
        />
    ) : null;

    // Add minHeight so we can add overlay if element is not translated
    if (nodeStatuses.has('noTranslation')) {
        element.style['min-height'] = '100px';
    }

    return {isStatusHighlighted, displayStatuses: new Set(displayStatuses), BoxStatus};
};
