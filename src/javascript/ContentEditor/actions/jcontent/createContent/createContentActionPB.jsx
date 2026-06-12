import React, {useEffect, useMemo} from 'react';
import {
    childrenLimitReachedOrExceeded,
    transformNodeTypesToActionsPB
} from './createContent.utils';
import {shallowEqual, useSelector} from 'react-redux';
import * as PropTypes from 'prop-types';
import {useContentEditorApiContext} from '~/ContentEditor/contexts/ContentEditorApi/ContentEditorApi.context';
import {JahiaRenderedModulesUtil} from '~/JContent/JContent.utils';

export const CreateContentPB = ({
    path,
    name,
    isFullscreen,
    onCreate,
    onClosed,
    isDisabled,
    onVisibilityChanged,
    nodeData,
    nodeTypes,
    render: Render,
    loading: Loading,
    labelProps,
    ...otherProps}) => {
    const api = useContentEditorApiContext();
    const {language, uilang} = useSelector(state => ({language: state.language, uilang: state.uilang}), shallowEqual);
    const resNode = nodeData;

    const {loading, isVisible, actions, missingNodes} = useMemo(() => {
        const defaultProps = {
            loading: Loading && !resNode,
            isVisible: false,
            actions: [],
            missingNodes: true
        };
        if (defaultProps.loading) {
            return defaultProps;
        }

        const templateLimit = JahiaRenderedModulesUtil.getArea(path)?.limit;
        if (!resNode || childrenLimitReachedOrExceeded(resNode, templateLimit)) {
            return {...defaultProps, loading: false};
        }

        // Note: acceptedNodeTypes is based on the DOM if we were able to find it, allowedChildNodeTypes is the info from JCR
        let resolvedNodeTypesForAction = [];
        // NodeTypes come from placeholder's nodetypes attribute, as each action is created for such placeholder we want to match what that button can create
        if (resNode.acceptedNodeTypes.size > 0) {
            // If nodetypes is defined, it will be used as the source of truth for calculating available note types
            if (nodeTypes) {
                resolvedNodeTypesForAction = nodeTypes
                    .map(nt => resNode.acceptedNodeTypes.get(nt))
                    .filter(nt => nt !== undefined);
            } else {
                resolvedNodeTypesForAction = [...resNode.acceptedNodeTypes.values()];
            }
        }

        const resolvedNodeTypes = resolvedNodeTypesForAction.length > 0 ? resolvedNodeTypesForAction : resNode.allowedChildNodeTypes;
        const actions = transformNodeTypesToActionsPB(resolvedNodeTypes, false, resNode?.name, otherProps.defaultIcon);

        return {
            loading: false,
            isVisible: resNode.checksResult,
            actions,
            missingNodes: false
        };
    }, [Loading, resNode, path, otherProps.defaultIcon, nodeTypes]);

    useEffect(() => {
        onVisibilityChanged?.(isVisible);
    }, [onVisibilityChanged, isVisible]);

    if (loading) {
        return <Loading {...otherProps}/>;
    }

    if (missingNodes) {
        return <Render {...otherProps} isVisible={false}/>;
    }

    const onClick = ({nodeTypes}) => {
        api.create({uuid: resNode.uuid, lang: language, nodeTypes, name, isFullscreen, createCallback: onCreate, onClosedCallback: onClosed});
    };

    return actions.map(result => (
        <Render
            key={result.key}
            dataSelRole="createContent"
            enabled={!isDisabled && !resNode?.lockOwner}
            buttonIcon={result.nodeTypeIcon || otherProps.defaultIcon}
            tooltipLabel={result.tooltipLabel}
            tooltipParams={result.tooltipParams}
            {...otherProps}
            path={path}
            uilang={uilang}
            isVisible={resNode.checksResult}
            isAllTypes={result.key === 'allTypes'}
            {...result}
            onClick={onClick}
        />
    ));
};

CreateContentPB.propTypes = {
    path: PropTypes.string.isRequired,
    name: PropTypes.string,
    isFullscreen: PropTypes.bool,
    onCreate: PropTypes.func,
    onClosed: PropTypes.func,
    isDisabled: PropTypes.bool,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func,
    onVisibilityChanged: PropTypes.func,
    labelProps: PropTypes.object,
    nodeData: PropTypes.object,
    nodeTypes: PropTypes.arrayOf(PropTypes.string)
};

export const createContentActionPB = {
    component: CreateContentPB
};
