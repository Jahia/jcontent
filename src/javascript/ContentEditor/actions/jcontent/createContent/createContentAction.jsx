import React from 'react';
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

export const CreateContent = ({
    contextNodePath,
    path,
    showOnNodeTypes,
    nodeTypes,
    name,
    isIncludeSubTypes,
    isFullscreen,
    hasBypassChildrenLimit,
    templateLimit,
    onCreate,
    onClosed,
    isDisabled,
    render: Render,
    loading: Loading,
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
    const {loadingTypes, error, nodetypes: nodeTypesTree} = useCreatableNodetypesTree({
        nodeTypes,
        childNodeName: name,
        includeSubTypes: isIncludeSubTypes || false,
        path: contextNodePath || path,
        uilang,
        excludedNodeTypes,
        showOnNodeTypes
    });

    if (Loading && (loadingTypes || res.loading || nodeInfo.loading)) {
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

    if (!res || !res.node || (nodeTypesTree && nodeTypesTree.length === 0) || childrenLimitReachedOrExceeded(nodeInfo?.node, templateLimit)) {
        return <Render {...otherProps} isVisible={false} onClick={() => {}}/>;
    }

    const flattenedNodeTypes = flattenNodeTypes(nodeTypesTree);
    const actions = transformNodeTypesToActions(flattenedNodeTypes, hasBypassChildrenLimit);

    const onClick = ({nodeTypesTree}) => {
        api.create({uuid: nodeInfo.node.uuid, lang: language, nodeTypesTree, name, isFullscreen, createCallback: onCreate, onClosedCallback: onClosed});
    };

    return (actions || [{key: 'allTypes', nodeTypeIcon: otherProps.defaultIcon}]).map(result => (
        <Render
            key={result.key}
            enabled={!isDisabled && !res.node?.lockOwner}
            buttonIcon={result.nodeTypeIcon || otherProps.defaultIcon}
            {...otherProps}
            flattenedNodeTypes={flattenedNodeTypes}
            nodeTypesTree={nodeTypesTree}
            path={path}
            uilang={uilang}
            isVisible={res.checksResult}
            isAllTypes={result.key === 'allTypes'}
            {...result}
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
    loading: PropTypes.func
};

export const createContentAction = {
    component: CreateContent
};
