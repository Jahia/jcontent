import {isMarkedForDeletion} from '../JContent.utils';
import {useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import React from 'react';

function checkAction(node) {
    return node.operationsSupport.markForDeletion && !isMarkedForDeletion(node);
}

export const DeleteActionComponent = ({context, render: Render, loading: Loading}) => {
    const {language} = useSelector(state => ({language: state.language}));

    const res = useNodeChecks(
        {path: context.path, paths: context.paths, language},
        {
            getProperties: ['jcr:mixinTypes'],
            getDisplayName: true,
            getOperationSupport: true,
            requiredPermission: ['jcr:removeNode'],
            ...context
        }
    );

    if (res.loading) {
        return (Loading && <Loading context={context}/>) || false;
    }

    const isVisible = res.checksResult && (res.node ? checkAction(res.node) : res.nodes.reduce((acc, node) => acc && checkAction(node), true));

    return (
        <Render context={{
            ...context,
            isVisible: isVisible,
            enabled: isVisible,
            onClick: () => {
                if (res.node) {
                    window.authoringApi.deleteContent(res.node.uuid, res.node.path, res.node.displayName, ['jnt:content'], ['nt:base'], false, false);
                } else if (res.nodes) {
                    window.authoringApi.deleteContents(res.nodes.map(node => ({
                        uuid: node.uuid,
                        path: node.path,
                        displayName: node.displayName,
                        nodeTypes: ['jnt:content'],
                        inheritedNodeTypes: ['nt:base']
                    })), false, false);
                }
            }
        }}/>
    );
};

DeleteActionComponent.propTypes = {
    context: PropTypes.object.isRequired,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};

const deleteAction = {
    component: DeleteActionComponent
};

export default deleteAction;
