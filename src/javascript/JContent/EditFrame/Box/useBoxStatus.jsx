import React, {useEffect, useMemo} from 'react';
import styles from './Box.scss';
import {useContentStatuses} from '~/JContent/ContentRoute/ContentStatuses/ContentStatuses';
import ContentStatuses from '~/JContent/ContentRoute/ContentStatuses';
import {useDispatch, useSelector} from 'react-redux';
import {addContentStatusPaths} from '~/JContent/redux/contentStatus.redux';
import JContentConstants from '~/JContent/JContent.constants';

export const useBoxStatus = ({node, nodes, element, language, isEnabled}) => {
    const {PUBLISHED, LIVE_ROLE, VISIBILITY, NO_STATUS} = JContentConstants.statusView;
    const statusMode = useSelector(state => state.jcontent.contentStatus.active) || NO_STATUS;
    const contentStatuses = useContentStatuses({node, language});
    const parentStatuses = useContentStatuses({node: nodes[node.parent?.path] || {}, language});
    const dispatch = useDispatch();

    const nodeStatuses = useMemo(() => {
        const statuses = ['workInProgress', 'modified', 'notPublished', 'visibilityCondition', 'noTranslation'];
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
        const {PUBLISHED, LIVE_ROLE, VISIBILITY} = JContentConstants.statusView;
        const statusToViewKeyMapping = {
            modified: PUBLISHED,
            notPublished: PUBLISHED,
            visibilityCondition: VISIBILITY,
            liveRole: LIVE_ROLE
        };

        // Collect statuses that this node has and map it to the redux state keys
        const statusKeys = Object.keys(statusToViewKeyMapping)
            .filter(status => nodeStatuses.has(status))
            .map(status => statusToViewKeyMapping[status]);
        dispatch(addContentStatusPaths({statusKeys, path: node.path}));
    }, [dispatch, nodeStatuses, node.path]);

    const selectedStatus = {
        [PUBLISHED]: ['modified', 'notPublished'],
        [VISIBILITY]: ['visibilityCondition'],
        [LIVE_ROLE]: []
    };

    const activeStatuses = ['workInProgress', 'noTranslation'].concat(selectedStatus[statusMode]);
    const displayStatuses = activeStatuses.filter(s => nodeStatuses.has(s));

    const isStatusHighlighted = isEnabled && displayStatuses.length > 0;
    const BoxStatus = isStatusHighlighted ? (
        <ContentStatuses
            color="warning"
            variant="bright"
            className={styles.displayStatus}
            node={node}
            renderedStatuses={displayStatuses}
        />
    ) : null;

    // Add minHeight so we can add overlay if element is not translated
    if (nodeStatuses.has('noTranslation')) {
        element.style['min-height'] = '100px';
    }

    return {isStatusHighlighted, displayStatuses: new Set(displayStatuses), BoxStatus};
};
