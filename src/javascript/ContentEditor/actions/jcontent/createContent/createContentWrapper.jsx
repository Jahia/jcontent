import React from 'react';
import * as PropTypes from 'prop-types';
import {CreateContent} from '~/ContentEditor/actions/jcontent/createContent/createContentAction';
import {useQuery} from '@apollo/client';
import {getNodeTypeInfo} from '~/ContentEditor/actions/jcontent/createContent/createContent.gql-queries';
import {toIconComponent} from '@jahia/moonstone';

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
    const skipQuery = !nodeTypes || nodeTypes.length <= 1 || nodeTypes.length > Number(contextJsParameters.config.jcontent['createChildrenDirectButtons.limit']);

    const {data} = useQuery(getNodeTypeInfo, {
        variables: {
            nodeTypes: nodeTypes,
            uiLocale: window.contextJsParameters.uilang
        },
        fetchPolicy: 'cache-first',
        skip: skipQuery
    });

    if (skipQuery) {
        return (
            <CreateContent
                contextNodePath={contextNodePath}
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
                {...otherProps}
            />
        );
    }

    return data?.forms?.nodeTypeInfo.map(nodeType => (
        <CreateContent
            key={nodeType.name}
            contextNodePath={contextNodePath}
            path={path}
            showOnNodeTypes={showOnNodeTypes}
            name={name}
            isIncludeSubTypes={isIncludeSubTypes}
            isFullscreen={isFullscreen}
            hasBypassChildrenLimit={hasBypassChildrenLimit}
            isDisabled={isDisabled}
            render={render}
            loading={loading}
            nodeTypes={[nodeType.name]}
            labelProps={{
                buttonIcon: toIconComponent(nodeType.iconUrl),
                buttonLabel: 'jcontent:label.contentEditor.CMMActions.createNewContent.contentOfType',
                buttonLabelParams: {typeName: nodeType.label}
            }}
            onCreate={onCreate}
            onClosed={onClosed}
            onVisibilityChanged={onVisibilityChanged}
            {...otherProps}
        />
    ));
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
