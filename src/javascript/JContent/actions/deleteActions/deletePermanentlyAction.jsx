import React, {useState} from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {isMarkedForDeletion} from '../../JContent.utils';
import {useSelector} from 'react-redux';
import {PATH_CONTENTS_ITSELF, PATH_FILES_ITSELF} from './../actions.constants';
import Delete from './Delete';

const checkActionOnNodes = res => {
    return res.nodes ? res.nodes.reduce((acc, node) => acc && checkAction(node), true) : true;
};

const checkAction = node => node.operationsSupport.markForDeletion &&
    isMarkedForDeletion(node) &&
    node.aggregatedPublicationInfo.publicationStatus === 'NOT_PUBLISHED' &&
    (node.aggregatedPublicationInfo.existsInLive === undefined ? true : !node.aggregatedPublicationInfo.existsInLive);

export const DeletePermanentlyActionComponent = ({path, paths, buttonProps, render: Render, loading: Loading, ...others}) => {
    const language = useSelector(state => state.language);

    const res = useNodeChecks(
        {path, paths, language},
        {
            getDisplayName: true,
            getProperties: ['jcr:mixinTypes'],
            getAggregatedPublicationInfo: true,
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

    let isVisible = res.node ? checkAction(res.node) : checkActionOnNodes(res);

    return (
        <>
            <Render
                {...others}
                isVisible={isVisible}
                buttonProps={{...buttonProps, color: 'danger'}}
                onClick={() => {
                    setIsDialogOpen(true);
                }}
            />
            <Delete isOpen={isDialogOpen} node={res.node} nodes={res.nodes} isMarkedForDeletionDialog={false} onClose={handleClose}/>
        </>
    );
};

DeletePermanentlyActionComponent.propTypes = {
    path: PropTypes.string,

    paths: PropTypes.arrayOf(PropTypes.string),

    buttonProps: PropTypes.object,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
