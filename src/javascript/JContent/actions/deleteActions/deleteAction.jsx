import {isMarkedForDeletion} from '../../JContent.utils';
import {useSelector} from 'react-redux';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {PATH_CONTENTS_ITSELF, PATH_FILES_ITSELF} from '../actions.constants';
import Delete from './Delete';

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
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleClose = () => {
        setIsDialogOpen(false);
    };

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    const isVisible = res.checksResult && (res.node ? checkAction(res.node) : res.nodes.reduce((acc, node) => acc && checkAction(node), true));

    return (
        <>
            <Render
            {...others}
            isVisible={isVisible}
            buttonProps={{...buttonProps, color: 'danger'}}
            enabled={isVisible}
            onClick={() => {
                setIsDialogOpen(true);
            }}
        />
            <Delete isMarkedForDeletionDialog isOpen={isDialogOpen} node={res.node} nodes={res.nodes} onClose={handleClose}/>
        </>
    );
};

DeleteActionComponent.propTypes = {
    path: PropTypes.string,

    paths: PropTypes.arrayOf(PropTypes.string),

    buttonProps: PropTypes.object,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
