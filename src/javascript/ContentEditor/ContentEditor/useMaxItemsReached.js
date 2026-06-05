import {useEffect, useRef} from 'react';
import {useNodeInfo} from '@jahia/data-helper';
import {childrenLimitReachedOrExceeded} from '~/ContentEditor/actions/jcontent/createContent/createContent.utils';
import {JahiaAreasUtil} from '~/JContent/JContent.utils';

/**
 * Tells whether the item currently being created is the last one allowed by the parent's
 * item-count limit (`j:numberOfItems` on a template area, or the `jmix:listSizeLimit` property).
 *
 * Used to enforce the limit while the "Create another" checkbox is checked: the count is derived
 * deterministically from the parent's initial children count (captured once when the editor opens)
 * plus the editor session `count` (incremented on each "create another"), so it does not depend on
 * Apollo cache propagation timing after each save.
 *
 * @param {string} path the parent node path (the area path, also the key used by JahiaAreasUtil)
 * @param {string} language current language
 * @param {number} count number of items already created in this "create another" session
 * @param {boolean} enabled only compute in create mode
 * @returns {boolean} true when creating the current item reaches the maximum (i.e. it is the last allowed)
 */
export const useMaxItemsReached = ({path, language, count, enabled}) => {
    const {node, loading} = useNodeInfo(
        {path, language},
        {
            getSubNodesCount: ['nt:base'],
            getIsNodeTypes: ['jmix:listSizeLimit'],
            getProperties: ['limit'],
            skip: !enabled || !path
        }
    );

    // Capture the parent's children count once, when first available, and keep it stable for the
    // whole session (the form is reset in place on each "create another", the provider stays mounted).
    const initialChildrenCountRef = useRef(undefined);
    useEffect(() => {
        if (enabled && !loading && node && initialChildrenCountRef.current === undefined) {
            initialChildrenCountRef.current = node['subNodesCount_nt:base'] || 0;
        }
    }, [enabled, loading, node]);

    if (!enabled || !node || initialChildrenCountRef.current === undefined) {
        return false;
    }

    const templateLimit = JahiaAreasUtil.getArea(path)?.limit;
    // Item currently in the form is item number (initialCount + count + 1).
    const projectedCount = initialChildrenCountRef.current + (count || 0) + 1;
    return childrenLimitReachedOrExceeded({...node, 'subNodesCount_nt:base': projectedCount}, templateLimit);
};
