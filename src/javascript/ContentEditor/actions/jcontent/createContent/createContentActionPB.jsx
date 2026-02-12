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
import {JahiaAreasUtil} from '~/JContent/JContent.utils';

export const CreateContentPB = ({
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
    render: Render,
    loading: Loading,
    labelProps,
    ...otherProps}) => {
    const api = useContentEditorApiContext();
    const {t} = useTranslation('jcontent');
    const {language, uilang} = useSelector(state => ({language: state.language, uilang: state.uilang}), shallowEqual);

    // const res = useNodeChecks(
    //     {path: contextNodePath || path, language: language},
    //     {...otherProps, getLockInfo: true}
    // );

    const resNode = actionData?.nodes[path];

    // showOnNodeTypes: ['jnt:contentFolder', 'jnt:content', 'jnt:category'],
    //     hideOnNodeTypes: ['jnt:navMenuText', 'jnt:page'],
    //     requiredPermission: ['jcr:addChildNodes'],
    //     hasBypassChildrenLimit: false

    // const nodeInfo = useNodeInfo(
    //     {path: path, language},
    //     {
    //         getPrimaryNodeType: true,
    //         getSubNodesCount: ['nt:base'],
    //         getIsNodeTypes: ['jmix:listSizeLimit'],
    //         getProperties: ['limit']
    //     }
    // );

    // if (resNode) {
    //     console.log('NNN', nodeTypes, resNode)
    // }
    const excludedNodeTypes = ['jmix:studioOnly', 'jmix:hiddenType'];
    let areaNodeTypes = (nodeTypes?.length > 0) ? nodeTypes : JahiaAreasUtil.getArea(path)?.nodeTypes;
    // const {loadingTypes, error, nodetypes: nodeTypesTree} = useCreatableNodetypesTree({
    //     nodeTypes: areaNodeTypes,
    //     childNodeName: name,
    //     includeSubTypes: isIncludeSubTypes || false,
    //     path: contextNodePath || path,
    //     uilang,
    //     excludedNodeTypes,
    //     showOnNodeTypes
    // });

    const nodeTypesTree = ['jmix:droppableContent'];// actionData?.contentTrees[path]?.entries;

    // console.log(nodeTypesTree);
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

        const actions = transformNodeTypesToActions(resNode.allowedChildNodeTypes, hasBypassChildrenLimit, resNode?.name);

        return {
            loading: false,
            isVisible: resNode.checksResult,
            actions,
            missingNodes: false
        };
    }, [path, Loading, hasBypassChildrenLimit, resNode]);

    useEffect(() => {
        onVisibilityChanged?.(isVisible);
    }, [onVisibilityChanged, isVisible]);

    if (loading) {
        return <Loading {...otherProps}/>;
    }

    // if (error) {
    //     const message = t(
    //         'jcontent:label.contentEditor.error.queryingContent',
    //         {details: error.message ? error.message : ''}
    //     );
    //     if (!error.message.includes('javax.jcr.PathNotFoundException')) {
    //         console.error(message);
    //     }
    //
    //     return <Render {...otherProps} isVisible={false} onClick={() => {}}/>;
    // }

    if (missingNodes) {
        return <Render {...otherProps} isVisible={false} onClick={() => {}}/>;
    }

    const onClick = ({nodeTypes, ...rest}) => {
        console.log(nodeTypes, rest);
        //uuid, path, site, lang, _, nodeTypes, excludedNodeTypes, includeSubTypes, name, isFullscreen, createCallback, onClosedCallback
        api.create({uuid: resNode.uuid, lang: language, nodeTypes, name, isFullscreen, createCallback: onCreate, onClosedCallback: onClosed});
    };

    const additionalProps = labelProps ? {
        ...labelProps
    } : {};

    console.log('Actions:', actions);
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
            {...otherProps}
            //flattenedNodeTypes={flattenedNodeTypes}
            //nodeTypesTree={nodeTypesTree}
            path={path}
            uilang={uilang}
            isVisible={resNode.checksResult}
            isAllTypes={result.key === 'allTypes'}
            {...result}
            {...additionalProps}
            onClick={onClick}
        />
    ));
};

CreateContentPB.defaultProps = {
    contextNodePath: undefined,
    loading: undefined
};

CreateContentPB.propTypes = {
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
    component: CreateContentPB
};
