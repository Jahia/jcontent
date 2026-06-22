import React from 'react';
import * as PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import {isDefinitelyHidden} from '~/JContent/actions/utils/nodeVisibilityUtils';
import {EditContent} from './editContentAction';

/**
 * Wrapper around EditContent that supports an optional `isDisplayable` predicate
 * in the action registration. When provided, the predicate is evaluated with
 * `{ siteInfo: node.site }` — the same shape used in registerDropdownOptions —
 * so a single function can gate both the tab and the context-menu entry.
 *
 * When `isDisplayable` is absent the wrapper is a transparent pass-through.
 */
export const EditContentWrapper = ({
    isDisplayable,
    path,
    node: prefetchedNode,
    render: Render,
    loading: Loading,
    ...otherProps
}) => {
    const language = useSelector(state => state.language);

    // Only run the language-check query when isDisplayable is provided and the node
    // is not already statically gated by hideOnNodeTypes.
    const skip = !isDisplayable ||
        isDefinitelyHidden(prefetchedNode, {hideOnNodeTypes: otherProps.hideOnNodeTypes});

    const res = useNodeChecks(
        {path, language},
        {skip, getSiteLanguages: true}
    );

    if (isDisplayable) {
        if (res.loading) {
            return (Loading && <Loading {...otherProps}/>) || false;
        }

        if (!isDisplayable({siteInfo: res.node?.site})) {
            return <Render isVisible={false} {...otherProps}/>;
        }
    }

    return (
        <EditContent
            path={path}
            node={prefetchedNode}
            render={Render}
            loading={Loading}
            {...otherProps}
        />
    );
};

EditContentWrapper.defaultProps = {
    isDisplayable: undefined,
    node: undefined,
    loading: undefined
};

EditContentWrapper.propTypes = {
    path: PropTypes.string.isRequired,
    node: PropTypes.object,
    isDisplayable: PropTypes.func,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};

export const editContentActionWrapper = {
    component: EditContentWrapper
};
