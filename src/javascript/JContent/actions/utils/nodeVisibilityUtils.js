import {hasMixin} from '~/JContent/JContent.utils';

/**
 * Returns true if prefetched row data is sufficient to determine the action
 * is definitely NOT visible — allowing the action to return null immediately
 * without mounting a loading placeholder.
 *
 * Returns false when prefetched data is absent, incomplete, or all checks pass —
 * in that case the action should proceed to call useNodeChecks normally.
 *
 * @param {object|null|undefined} prefetchedNode - The node object from ContextualMenu props (row data)
 * @param {object} options
 * @param {string[]} [options.showOnNodeTypes] - Action is only shown for these node types/mixins
 * @param {string[]} [options.hideOnNodeTypes] - Action is hidden for these node types/mixins
 * @param {string[]} [options.hideMixins] - Action is hidden when node has any of these mixins
 * @param {string[]} [options.showMixins] - Action is only shown when node has at least one of these mixins.
 *   WARNING: Only safe when the mixin is always dynamically applied (addMixin) and never declared as a
 *   supertype in a node type definition — otherwise inherited mixins won't appear in mixinTypes.
 * @returns {boolean}
 */
export function isDefinitelyHidden(prefetchedNode, {
    showOnNodeTypes,
    hideOnNodeTypes,
    hideMixins,
    showMixins
} = {}) {
    if (!prefetchedNode) {
        return false;
    }

    const typeName = prefetchedNode.primaryNodeType?.name;
    const mixins = prefetchedNode.mixinTypes?.map(m => m.name) ?? [];

    if (showOnNodeTypes && typeName) {
        const matches = showOnNodeTypes.some(t => typeName === t || mixins.includes(t));
        if (!matches) {
            return true;
        }
    }

    if (hideOnNodeTypes && (typeName || mixins.length > 0)) {
        const matches = hideOnNodeTypes.some(t => typeName === t || mixins.includes(t));
        if (matches) {
            return true;
        }
    }

    if (hideMixins?.some(m => hasMixin(prefetchedNode, m))) {
        return true;
    }

    if (showMixins && !showMixins.some(m => hasMixin(prefetchedNode, m))) {
        return true;
    }

    return false;
}
