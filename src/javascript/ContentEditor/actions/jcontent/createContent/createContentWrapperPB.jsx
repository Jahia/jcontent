import React from 'react';
import * as PropTypes from 'prop-types';
import {CreateContentPB} from '~/ContentEditor/actions/jcontent/createContent/createContentActionPB';
import {useQuery} from '@apollo/client';
import {getNodeTypeInfo} from '~/ContentEditor/actions/jcontent/createContent/createContent.gql-queries';
import {toIconComponent} from '@jahia/moonstone';

export const CreateContentWrapperPB = ({
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
    actionData,
    render,
    loading,
    ...otherProps}) => {
    const skipQuery = !nodeTypes || nodeTypes.length <= 1 || nodeTypes.length > Number(contextJsParameters.config.jcontent['createChildrenDirectButtons.limit']);

    // TODO replace from action data???
    // const {data} = useQuery(getNodeTypeInfo, {
    //     variables: {
    //         nodeTypes: nodeTypes,
    //         uiLocale: window.contextJsParameters.uilang
    //     },
    //     fetchPolicy: 'cache-first',
    //     skip: skipQuery
    // });

    if (skipQuery) {
        return (
            <CreateContentPB
                contextNodePath={contextNodePath}
                path={path}
                showOnNodeTypes={showOnNodeTypes}
                name={name}
                isIncludeSubTypes={isIncludeSubTypes}
                isFullscreen={isFullscreen}
                hasBypassChildrenLimit={hasBypassChildrenLimit}
                isDisabled={isDisabled}
                actionData={actionData}
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

    //console.log('PB', nodeTypes, actionData?.nodes?.[path]);
    return actionData?.nodes?.[path]?.allowedChildNodeTypes?.map(nodeType => (
        <CreateContentPB
            key={nodeType.name}
            contextNodePath={contextNodePath}
            path={path}
            showOnNodeTypes={showOnNodeTypes}
            name={name}
            actionData={actionData}
            isIncludeSubTypes={isIncludeSubTypes}
            isFullscreen={isFullscreen}
            hasBypassChildrenLimit={hasBypassChildrenLimit}
            isDisabled={isDisabled}
            render={render}
            loading={loading}
            nodeTypes={[nodeType.name]}
            labelProps={{
                buttonIcon: toIconComponent(`${nodeType.icon}.png`),
                buttonLabel: 'jcontent:label.contentEditor.CMMActions.createNewContent.contentOfType',
                buttonLabelParams: {typeName: nodeType.displayName}
            }}
            onCreate={onCreate}
            onClosed={onClosed}
            onVisibilityChanged={onVisibilityChanged}
            {...otherProps}
        />
    ));
};

CreateContentWrapperPB.defaultProps = {
    contextNodePath: undefined,
    loading: undefined
};

CreateContentWrapperPB.propTypes = {
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

export const createContentActionWrapperPB = {
    component: CreateContentWrapperPB
};
