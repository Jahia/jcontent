import React from 'react';
import * as PropTypes from 'prop-types';
import {CreateContent} from '~/ContentEditor/actions/jcontent/createContent/createContentAction';

export const CreateContentWrapper = ({
    contextNodePath,
    path,
    showOnNodeTypes,
    nodeTypes,
    name,
    isIncludeSubTypes,
    isFullscreen,
    hasBypassChildrenLimit,
    onCreate,
    onClosed,
    isDisabled,
    onVisibilityChanged,
    render,
    loading,
    ...otherProps}) => {
    if (nodeTypes && nodeTypes.length > 1) {
        const actions = [];

        nodeTypes.forEach(nodeType => actions.push(
            <CreateContent contextNodePath={contextNodePath}
                           path={path}
                           showOnNodeTypes={showOnNodeTypes}
                           name={name}
                           isIncludeSubTypes={isIncludeSubTypes}
                           isFullscreen={isFullscreen}
                           hasBypassChildrenLimit={hasBypassChildrenLimit}
                           isDisabled={isDisabled}
                           render={render}
                           loading={loading}
                           nodeTypes={[nodeType]}
                           onCreate={onCreate}
                           onClosed={onClosed}
                           onVisibilityChanged={onVisibilityChanged}
                           {...otherProps}/>
        ));

        return actions;
    }

    return (
        <CreateContent contextNodePath={contextNodePath}
                       path={path}
                       showOnNodeTypes={showOnNodeTypes}
                       name={name}
                       isIncludeSubTypes={isIncludeSubTypes}
                       isFullscreen={isFullscreen}
                       hasBypassChildrenLimit={hasBypassChildrenLimit}
                       isDisabled={isDisabled}
                       render={render}
                       loading={loading}
                       nodeTypes={nodeTypes}
                       onCreate={onCreate}
                       onClosed={onClosed}
                       onVisibilityChanged={onVisibilityChanged}
                       {...otherProps}/>
    );
};

CreateContentWrapper.defaultProps = {
    contextNodePath: undefined,
    loading: undefined
};

CreateContentWrapper.propTypes = {
    contextNodePath: PropTypes.string,
    path: PropTypes.string.isRequired,
    showOnNodeTypes: PropTypes.array,
    nodeTypes: PropTypes.array,
    name: PropTypes.string,
    isIncludeSubTypes: PropTypes.bool,
    isFullscreen: PropTypes.bool,
    hasBypassChildrenLimit: PropTypes.bool,
    templateLimit: PropTypes.number,
    onCreate: PropTypes.func,
    onClosed: PropTypes.func,
    isDisabled: PropTypes.bool,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func,
    onVisibilityChanged: PropTypes.func
};

export const createContentActionWrapper = {
    component: CreateContentWrapper
};
