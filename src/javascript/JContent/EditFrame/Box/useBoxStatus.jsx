import React, {useEffect, useMemo} from 'react';
import styles from './Box.scss';
import {useContentStatuses} from '~/JContent/ContentRoute/ContentStatuses/ContentStatuses';
import ContentStatuses from '~/JContent/ContentRoute/ContentStatuses';

export const useBoxStatus = ({node, nodes, element, language, isEnabled, statusCountState}) => {
    const [statusCount, setStatusCount] = statusCountState;
    const contentStatuses = useContentStatuses({node, language});
    const parentStatuses = useContentStatuses({node: nodes[node.parent?.path] || {}, language});

    // Statuses that are currently toggled/should be highlighted; values should match `contentStatuses` keys
    // TODO change this array depending on which status is activated from header status dropdown
    const activeStatuses = useMemo(() => ['workInProgress', 'modified', 'notPublished', 'notTranslated'], []);
    // Filter active status with statuses enabled for the given node, language (contentStatuses)
    const displayStatuses = useMemo(() => {
        const displayStatuses = activeStatuses.filter(s => {
            if (s === 'notPublished') {
                // For 'notPublished' status, we display status only when parent is published
                return Boolean(parentStatuses.published && contentStatuses[s]);
            }

            if (s === 'notTranslated') {
                return Boolean(element.getAttribute('translatable') && contentStatuses[s]);
            }

            return Boolean(contentStatuses[s]);
        });
        return new Set(displayStatuses);
    }, [activeStatuses, contentStatuses, element, parentStatuses.published]);

    const isStatusHighlighted = displayStatuses.size > 0 && isEnabled;
    const badgedStatuses = new Set(['workInProgress', 'modified', 'notPublished', 'visibilityCondition']);
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
    if (displayStatuses.has('notTranslated')) {
        element.style['min-height'] = '100px';
    }

    // Update path to track status count
    useEffect(() => {
        let status = ['modified', 'visibilityCondition', 'liveRole'].map(s => {
            const needToAdd = displayStatuses.has(s) && !statusCount[s].has(node.path);
            return (needToAdd) ? node.path : null;
        });
        const needsUpdate = status.filter(Boolean).length > 0;
        if (needsUpdate) {
            console.log(`Updating status for path ${node.path}`);
            setStatusCount(s => ({
                modified: s.modified.add(node.path),
                visibilityCondition: s.visibilityCondition.add(node.path),
                liveRole: s.liveRole.add(node.path)
            }));
        }
    }, [statusCount, setStatusCount, isStatusHighlighted, displayStatuses, node.path]);

    return {isStatusHighlighted, displayStatuses, BoxStatus};
};
