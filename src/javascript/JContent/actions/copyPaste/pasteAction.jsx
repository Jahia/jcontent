import pasteMutations from './copyPaste.gql-mutations';
import {triggerRefetchAll} from '~/JContent/JContent.refetches';
import {copypasteClear} from './copyPaste.redux';
import {withNotifications} from '@jahia/react-material';
import {isDescendantOrSelf} from '~/JContent/JContent.utils';
import copyPasteConstants from './copyPaste.constants';
import {setLocalStorage} from './localStorageHandler';
import {useDispatch, useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import React from 'react';
import {useApolloClient} from '@apollo/react-hooks';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import {ACTION_PERMISSIONS} from '../actions.constants';
import {useNodeTypeCheck} from '~/JContent';
import {useRefreshTreeAfterMove} from '~/JContent/hooks/useRefreshTreeAfterMove';
import {cmRemoveSelection} from '~/JContent/redux/selection.redux';

function childrenLimitReachedOrExceeded(node) {
    if (!node) {
        return false;
    }

    if (node['jmix:listSizeLimit']) {
        const limit = node?.properties?.find(property => property.name === 'limit')?.value;
        const childrenNumber = node?.subNodes?.pageInfo?.totalCount;
        return limit && childrenNumber >= Number(limit);
    }

    return false;
}

export const PasteActionComponent = withNotifications()(({path, referenceTypes, render: Render, loading: Loading, notificationContext, ...others}) => {
    const client = useApolloClient();
    const dispatch = useDispatch();
    const {t} = useTranslation('jcontent');
    const copyPaste = useSelector(state => state.jcontent.copyPaste);

    const refreshTree = useRefreshTreeAfterMove();

    const res = useNodeChecks(
        {path},
        {
            requiredPermission: 'jcr:addChildNodes',
            requiredSitePermission: [ACTION_PERMISSIONS.pasteAction],
            getChildNodeTypes: true,
            getContributeTypesRestrictions: true,
            getSubNodesCount: true,
            getIsNodeTypes: ['jmix:listSizeLimit'],
            getProperties: ['limit']
        }
    );

    const nodeTypeCheck = useNodeTypeCheck();

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const {nodes, type} = copyPaste;

    let isVisible = res.checksResult && res.node.allowedChildNodeTypes.length > 0 && !childrenLimitReachedOrExceeded(res?.node);
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

    const {loading, checkResult, possibleReferenceTypes} = (isVisible && isEnabled) && nodeTypeCheck(res.node, nodes, referenceTypes);
    if (loading) {
        return <Loading {...others}/>;
    }

    isEnabled = Boolean(checkResult);

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
                        referenceType: possibleReferenceTypes && possibleReferenceTypes.length > 0 ? possibleReferenceTypes[0].name : ''
                    },
                    mutation
                }))).then(datas => {
                    dispatch(copypasteClear());
                    setLocalStorage(copyPasteConstants.COPY, [], client);
                    notificationContext.notify(t('jcontent:label.contentManager.copyPaste.success'), ['closeButton']);

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

    render: PropTypes.func.isRequired,

    loading: PropTypes.func,

    referenceTypes: PropTypes.arrayOf(PropTypes.string)
};
