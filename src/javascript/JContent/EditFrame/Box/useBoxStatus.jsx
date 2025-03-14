import React, {useEffect, useMemo} from 'react';
import styles from './Box.scss';
import {useContentStatuses} from '~/JContent/ContentRoute/ContentStatuses/ContentStatuses';
import ContentStatuses from '~/JContent/ContentRoute/ContentStatuses';
import {useDispatch} from 'react-redux';
import {addContentStatusPaths} from '~/JContent/redux/contentStatus.redux';
import JContentConstants from '~/JContent/JContent.constants';

export const useBoxStatus = ({node, nodes, element, language, isEnabled}) => {
    const contentStatuses = useContentStatuses({node, language});
    const parentStatuses = useContentStatuses({node: nodes[node.parent?.path] || {}, language});
    const dispatch = useDispatch();

    // Filter active status with statuses enabled (from contentStatuses) for the given node, language
    const displayStatuses = useMemo(() => {
        // Statuses that are currently toggled/should be highlighted; values should match `contentStatuses` keys
        // TODO change this array depending on which status is activated from header status dropdown
        const activeStatuses = ['workInProgress', 'modified', 'notPublished', 'noTranslation'];
        const displayStatuses = activeStatuses.filter(s => {
            if (s === 'notPublished') {
                // For 'notPublished' status, we display status only when parent is published
                return Boolean(parentStatuses.published && contentStatuses[s]);
            }

            if (s === 'noTranslation') {
                return Boolean(element.getAttribute('translatable') && contentStatuses[s]);
            }

            return Boolean(contentStatuses[s]);
        });
        return new Set(displayStatuses);
    }, [contentStatuses, element, parentStatuses.published]);

    // Update path in content status redux state to track status count
    useEffect(() => {
        const statusKeys = [];
        const {PUBLISHED, LIVE_ROLE, VISIBILITY} = JContentConstants.statusView;
        ['modified', 'visibilityCondition', 'liveRole'].forEach(status => {
            if (!displayStatuses.has(status)) {
                return;
            }

            // Maps status attribute to status key used in content status state; see contentStatus.redux.js
            const pathKey = {
                modified: PUBLISHED,
                visibilityCondition: VISIBILITY,
                liveRole: LIVE_ROLE
            }[status];
            statusKeys.push(pathKey);
        });
        // Console.log(`DEBUG: Modifying ${node.path}`);
        dispatch(addContentStatusPaths({statusKeys, path: node.path}));
    }, [dispatch, displayStatuses, node.path]);

    const isStatusHighlighted = displayStatuses.size > 0 && isEnabled;
    const badgedStatuses = new Set(['workInProgress', 'modified', 'notPublished', 'visibilityCondition', 'noTranslation']);
    const BoxStatus = isStatusHighlighted ? (
        <ContentStatuses
            color="warning"
            variant="bright"
            className={styles.displayStatus}
            node={node}
            renderedStatuses={[...displayStatuses].filter(s => badgedStatuses.has(s))}
        />
    ) : null;

    // Add minHeight so we can add overlay if element is not translated
    if (displayStatuses.has('noTranslation')) {
        element.style['min-height'] = '100px';
    }

    return {isStatusHighlighted, displayStatuses, BoxStatus};
};
