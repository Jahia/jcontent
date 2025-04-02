import pasteMutations from './copyPaste.gql-mutations';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {copypasteClear} from './copyPaste.redux';
import {withNotifications} from '@jahia/react-material';
import {isDescendantOrSelf, JahiaAreasUtil} from '~/JContent/JContent.utils';
import copyPasteConstants from './copyPaste.constants';
import {setLocalStorage} from './localStorageHandler';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import React, {useEffect, useMemo} from 'react';
import {useApolloClient} from '@apollo/client';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import {ACTION_PERMISSIONS} from '../actions.constants';
import {useNodeTypeCheck} from '~/JContent';
import {useRefreshTreeAfterMove} from '~/JContent/hooks/useRefreshTreeAfterMove';
import {cmRemoveSelection} from '~/JContent/redux/selection.redux';
import {childrenLimitReachedOrExceeded} from '~/ContentEditor/actions/jcontent/createContent/createContent.utils';

export const PasteActionComponent = withNotifications()(({path, referenceTypes, render: Render, loading: Loading, notificationContext, onAction, onVisibilityChanged, ...others}) => {
    const client = useApolloClient();
    const dispatch = useDispatch();
    const {t} = useTranslation('jcontent');
    const {copyPaste, language} = useSelector(state => ({
        language: state.language,
        copyPaste: state.jcontent.copyPaste
    }), shallowEqual);

    const refreshTree = useRefreshTreeAfterMove();
    const nodeChecksProps = {
        requiredPermission: 'jcr:addChildNodes',
        requiredSitePermission: [ACTION_PERMISSIONS.pasteAction],
        getChildNodeTypes: true,
        getContributeTypesRestrictions: true,
        getSubNodesCount: ['nt:base'],
        getIsNodeTypes: ['jmix:listSizeLimit', 'jnt:contentList', 'jnt:folder', 'jnt:contentFolder', 'jnt:area', 'jnt:mainResourceDisplay'],
        getProperties: ['limit']
    };

    if (others.hideOnNodeTypes) {
        nodeChecksProps.hideOnNodeTypes = others.hideOnNodeTypes;
    }

    if (others.showOnNodeTypes) {
        nodeChecksProps.showOnNodeTypes = others.showOnNodeTypes;
    }

    if (others.hidePasteOnPage) {
        nodeChecksProps.hideOnNodeTypes = [...(nodeChecksProps.hidePasteOnPage || []), 'jnt:page'];
    }

    const res = useNodeChecks(
        {path, language},
        nodeChecksProps
    );

    const nodeTypeCheck = useNodeTypeCheck();

    const {isVisible, isEnabled, loading, type, possibleReferenceTypes, nodeTypesToSkip, nodes} = useMemo(() => {
        const defaultProps = {
            isVisible: false, isEnabled: false, loading: false, type: null, possibleReferenceTypes: [], nodeTypesToSkip: [], nodes: []
        };
        if (res.loading) {
            return defaultProps;
        }

        const {nodes, type} = copyPaste;

        const nodeTypesToSkip = type === copyPasteConstants.COPY_PAGE ? ['jnt:page', 'jmix:navMenuItem'] : [];

        const templateLimit = JahiaAreasUtil.getArea(path)?.limit;
        let isVisible = res.checksResult && res.node?.allowedChildNodeTypes.length > 0 && !childrenLimitReachedOrExceeded(res?.node, templateLimit);
        let isEnabled = true;

        if (nodes.length === 0) {
            isEnabled = false;
            isVisible = false;
        }

        if (isVisible && isEnabled && nodes.reduce((acc, nodeToPaste) => acc ||
            (type === copyPasteConstants.CUT && nodeToPaste.path === res.node.path + '/' + nodeToPaste.name) ||
            (isDescendantOrSelf(res.node.path, nodeToPaste.path)), false)) {
            isEnabled = false;
        }

        if (isVisible && referenceTypes && type === copyPasteConstants.CUT) {
            isVisible = false;
        }

        const {loading, checkResult, possibleReferenceTypes} = (isVisible && isEnabled) && nodeTypeCheck(res.node, nodes, referenceTypes);

        if (loading) {
            return defaultProps;
        }

        return {isVisible, isEnabled: Boolean(checkResult), loading, possibleReferenceTypes, nodeTypesToSkip, type, nodes};
    }, [path, copyPaste, res, nodeTypeCheck, referenceTypes]);

    useEffect(() => {
        onVisibilityChanged?.(!loading && isVisible);
    }, [loading, isVisible, onVisibilityChanged]);

    if (loading) {
        return <Loading {...others}/>;
    }

    return (
        <Render
            {...others}
            isVisible={isVisible}
            enabled={isEnabled}
            onClick={() => {
                const mutation = referenceTypes ?
                    pasteMutations.pasteReferenceNode :
                    (type === copyPasteConstants.CUT ? pasteMutations.moveNode : pasteMutations.pasteNode);

                if (type === copyPasteConstants.CUT) {
                    nodes.forEach(nodeToPaste => {
                        dispatch(cmRemoveSelection(nodeToPaste.path));
                    });
                }

                // Execute paste
                Promise.all(nodes.map(nodeToPaste => client.mutate({
                    variables: {
                        pathOrId: nodeToPaste.path,
                        destParentPathOrId: path,
                        destName: nodeToPaste.name,
                        nodeTypesToSkip,
                        referenceType: possibleReferenceTypes && possibleReferenceTypes.length > 0 ? possibleReferenceTypes[0].name : ''
                    },
                    mutation
                }))).then(datas => {
                    dispatch(copypasteClear());
                    setLocalStorage(copyPasteConstants.COPY, [], client);
                    if (typeof onAction === 'function') {
                        onAction(datas);
                    }

                    notificationContext.notify(t('jcontent:label.contentManager.copyPaste.success'), ['closeButton', 'closeAfter5s']);

                    const moveResults = datas.map(d => d.data.jcr.pasteNode.node).reduce((acc, n) => Object.assign(acc, {[n.uuid]: n}), {});
                    refreshTree(path, nodes, moveResults);
                }, error => {
                    console.error(error);
                    dispatch(copypasteClear());
                    notificationContext.notify(t('jcontent:label.contentManager.copyPaste.error'), ['closeButton']);
                    triggerRefetchAll();
                });
            }}
        />
    );
});

PasteActionComponent.propTypes = {
    path: PropTypes.string,
    referenceTypes: PropTypes.arrayOf(PropTypes.string),
    render: PropTypes.func.isRequired,
    loading: PropTypes.func,
    notificationContext: {notify: PropTypes.func},
    onAction: PropTypes.func,
    onVisibilityChanged: PropTypes.func,
    nodeTypes: [PropTypes.string]
};
