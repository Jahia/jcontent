import React, {useEffect, useMemo} from 'react';
import {
    childrenLimitReachedOrExceeded,
    flattenNodeTypes,
    transformNodeTypesToActions,
    useCreatableNodetypesTree
} from './createContent.utils';
import {shallowEqual, useSelector} from 'react-redux';
import {useNodeChecks, useNodeInfo} from '@jahia/data-helper';
import * as PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {useContentEditorApiContext} from '~/ContentEditor/contexts/ContentEditorApi/ContentEditorApi.context';
import {JahiaRenderedModulesUtil} from '~/JContent/JContent.utils';

export const CreateContent = ({
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
    render: Render,
    loading: Loading,
    labelProps,
    ...otherProps}) => {
    const api = useContentEditorApiContext();
    const {t} = useTranslation('jcontent');
    const {language, uilang} = useSelector(state => ({language: state.language, uilang: state.uilang}), shallowEqual);

    const res = useNodeChecks(
        {path: contextNodePath || path, language: language},
        {...otherProps, getLockInfo: true}
    );

    const nodeInfo = useNodeInfo(
        {path: path, language},
        {
            getPrimaryNodeType: true,
            getSubNodesCount: ['nt:base'],
            getIsNodeTypes: ['jmix:listSizeLimit'],
            getProperties: ['limit']
        }
    );
    const excludedNodeTypes = ['jmix:studioOnly', 'jmix:hiddenType'];
    let areaNodeTypes = (nodeTypes?.length > 0) ? nodeTypes : JahiaRenderedModulesUtil.resolveNodeTypes(path);
    const {loadingTypes, error, nodetypes: nodeTypesTree} = useCreatableNodetypesTree({
        nodeTypes: areaNodeTypes,
        childNodeName: name,
        includeSubTypes: isIncludeSubTypes || false,
        path: contextNodePath || path,
        uilang,
        excludedNodeTypes,
        showOnNodeTypes
    });

    const {loading, isVisible, flattenedNodeTypes, actions, missingNodes} = useMemo(() => {
        const defaultProps = {
            loading: Loading && (loadingTypes || res.loading || nodeInfo.loading),
            isVisible: false,
            flattenedNodeTypes: [],
            actions: [],
            missingNodes: true
        };
        if (defaultProps.loading) {
            return defaultProps;
        }

        const templateLimit = JahiaRenderedModulesUtil.getArea(path)?.limit;
        if (!res || !res.node || (nodeTypesTree && nodeTypesTree.length === 0) || childrenLimitReachedOrExceeded(nodeInfo?.node, templateLimit)) {
            return {...defaultProps, loading: false};
        }

        const flattenedNodeTypes = flattenNodeTypes(nodeTypesTree);
        const actions = transformNodeTypesToActions(flattenedNodeTypes, hasBypassChildrenLimit, nodeInfo.node?.name);

        return {
            loading: false,
            isVisible: res.checksResult,
            flattenedNodeTypes,
            actions,
            missingNodes: false
        };
    }, [path, Loading, hasBypassChildrenLimit, loadingTypes, res, nodeInfo, nodeTypesTree]);

    useEffect(() => {
        onVisibilityChanged?.(isVisible);
    }, [onVisibilityChanged, isVisible]);

    if (loading) {
        return <Loading {...otherProps}/>;
    }

    if (error) {
        const message = t(
            'jcontent:label.contentEditor.error.queryingContent',
            {details: error.message ? error.message : ''}
        );
        if (!error.message.includes('javax.jcr.PathNotFoundException')) {
            console.error(message);
        }

        return <Render {...otherProps} isVisible={false} onClick={() => {}}/>;
    }

    if (missingNodes) {
        return <Render {...otherProps} isVisible={false} onClick={() => {}}/>;
    }

    const onClick = ({nodeTypesTree, createdNodeName}) => {
        // Presence of createdNodeName indicates that we create a named child for a specific nodetype so we want to avoid making API call to get type info
        if (createdNodeName) {
            api.create({uuid: nodeInfo.node.uuid, lang: language, nodeTypes: nodeTypesTree, name: createdNodeName, isFullscreen, createCallback: onCreate, onClosedCallback: onClosed});
        } else {
            api.create({uuid: nodeInfo.node.uuid, lang: language, nodeTypesTree, name, isFullscreen, createCallback: onCreate, onClosedCallback: onClosed});
        }
    };

    const additionalProps = labelProps ? {
        ...labelProps
    } : {};

    // Add named child creation actions if any placeholders were found in rendering
    if (JahiaRenderedModulesUtil.getModule(path)) {
        JahiaRenderedModulesUtil.getModule(path).filter(ent => ent.path !== '*' && !ent.path?.startsWith('/')).forEach(ent => {
            actions.push({
                key: ent.nodeTypes[0],
                actionKey: ent.nodeTypes[0],
                nodeTypesTree: ent.nodeTypes,
                nodeTypes: ent.nodeTypes,
                createdNodeName: ent.path,
                buttonLabel: 'jcontent:label.contentEditor.CMMActions.createNewContent.contentOfType',
                buttonLabelParams: {typeName: ent.path}
            });
        });
    }

    return (actions || [{
        key: 'allTypes',
        nodeTypeIcon: otherProps.defaultIcon,
        tooltipLabel: 'jcontent:label.contentEditor.CMMActions.createNewContent.tooltipGeneric',
        tooltipParams: {parent: nodeInfo.node?.name}}]).map(result => (
            <Render
            key={result.key}
            enabled={!isDisabled && !res.node?.lockOwner}
            buttonIcon={result.nodeTypeIcon || otherProps.defaultIcon}
            tooltipLabel={result.tooltipLabel}
            tooltipParams={result.tooltipParams}
            {...otherProps}
            flattenedNodeTypes={flattenedNodeTypes}
            nodeTypesTree={nodeTypesTree}
            path={path}
            uilang={uilang}
            isVisible={res.checksResult}
            isAllTypes={result.key === 'allTypes'}
            {...result}
            {...additionalProps}
            onClick={onClick}
        />
    ));
};

CreateContent.defaultProps = {
    contextNodePath: undefined,
    loading: undefined
};

CreateContent.propTypes = {
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
    onVisibilityChanged: PropTypes.func,
    labelProps: PropTypes.object
};

export const createContentAction = {
    component: CreateContent
};
