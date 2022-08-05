import {isMarkedForDeletion} from '../JContent.utils';
import {useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import React from 'react';
import {PATH_CONTENTS_ITSELF, PATH_FILES_ITSELF} from './actions.constants';

function checkAction(node) {
    return node.operationsSupport.markForDeletion && !isMarkedForDeletion(node);
}

export const DeleteActionComponent = ({path, paths, buttonProps, render: Render, loading: Loading, ...others}) => {
    const language = useSelector(state => state.language);

    const res = useNodeChecks(
        {path, paths, language},
        {
            getProperties: ['jcr:mixinTypes'],
            getDisplayName: true,
            getOperationSupport: true,
            requiredPermission: ['jcr:removeNode'],
            hideOnNodeTypes: ['jnt:virtualsite'],
            hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF]
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const isVisible = res.checksResult && (res.node ? checkAction(res.node) : res.nodes.reduce((acc, node) => acc && checkAction(node), true));

    return (
        <Render
            {...others}
            isVisible={isVisible}
            buttonProps={{...buttonProps, color: 'danger'}}
            enabled={isVisible}
            onClick={() => {
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
            }}
        />
    );
};

DeleteActionComponent.propTypes = {
    path: PropTypes.string,

    paths: PropTypes.arrayOf(PropTypes.string),

    buttonProps: PropTypes.object,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
