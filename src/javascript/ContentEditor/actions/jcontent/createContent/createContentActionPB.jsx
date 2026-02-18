import React, {useEffect, useMemo} from 'react';
import {
    childrenLimitReachedOrExceeded,
    transformNodeTypesToActionsPB
} from './createContent.utils';
import {shallowEqual, useSelector} from 'react-redux';
import * as PropTypes from 'prop-types';
import {useContentEditorApiContext} from '~/ContentEditor/contexts/ContentEditorApi/ContentEditorApi.context';
import {JahiaAreasUtil} from '~/JContent/JContent.utils';

export const CreateContentPB = ({
    path,
    name,
    isFullscreen,
    onCreate,
    onClosed,
    isDisabled,
    onVisibilityChanged,
    nodeData,
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

        const templateLimit = JahiaAreasUtil.getArea(path)?.limit;
        if (!resNode || childrenLimitReachedOrExceeded(resNode, templateLimit)) {
            return {...defaultProps, loading: false};
        }

        // Note: acceptedNodeTypes is based on the DOM if we were able to find it, allowedChildNodeTypes is the info from JCR
        const nodeTypes = resNode.acceptedNodeTypes.length > 0 ? resNode.acceptedNodeTypes : resNode.allowedChildNodeTypes;
        const actions = transformNodeTypesToActionsPB(nodeTypes, false, resNode?.name);

        return {
            loading: false,
            isVisible: resNode.checksResult,
            actions,
            missingNodes: false
        };
    }, [path, Loading, resNode]);

    useEffect(() => {
        onVisibilityChanged?.(isVisible);
    }, [onVisibilityChanged, isVisible]);

    if (loading) {
        return <Loading {...otherProps}/>;
    }

    if (missingNodes) {
        return <Render {...otherProps} isVisible={false} onClick={() => {}}/>;
    }

    const onClick = ({nodeTypes}) => {
        api.create({uuid: resNode.uuid, lang: language, nodeTypes, name, isFullscreen, createCallback: onCreate, onClosedCallback: onClosed});
    };

    return (actions || [{
        key: 'allTypes',
        nodeTypeIcon: otherProps.defaultIcon,
        tooltipLabel: 'jcontent:label.contentEditor.CMMActions.createNewContent.tooltipGeneric',
        tooltipParams: {parent: resNode.name}}]).map(result => (
            <Render
            key={result.key}
            enabled={!isDisabled && !resNode?.lockOwner}
            buttonIcon={result.nodeTypeIcon || otherProps.defaultIcon}
            tooltipLabel={result.tooltipLabel}
            tooltipParams={result.tooltipParams}
            nodeTypes={['jmix:droppableContent']}
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

CreateContentPB.defaultProps = {
    loading: undefined
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
    nodeData: PropTypes.object
};

export const createContentActionPB = {
    component: CreateContentPB
};
