import React, {useContext} from 'react';
import {useNodeChecks} from '@jahia/data-helper';
import PropTypes from 'prop-types';
import {isMarkedForDeletion} from '../../JContent.utils';
import {useSelector} from 'react-redux';
import {PATH_CATEGORIES_ITSELF, PATH_CONTENTS_ITSELF, PATH_FILES_ITSELF} from './../actions.constants';
import Delete from './Delete';
import {ComponentRendererContext} from '@jahia/ui-extender';

const checkActionOnNodes = res => {
    return res.nodes ? res.nodes.reduce((acc, node) => acc && checkAction(node), true) : true;
};

const checkAction = node => {
    const isCategory = (node['jnt:category'] || node.primaryNodeType?.name === 'jnt:category');
    const isMarkForDeletionAllowed = node.operationsSupport.markForDeletion &&
        isMarkedForDeletion(node) &&
        node.aggregatedPublicationInfo.publicationStatus === 'NOT_PUBLISHED' &&
        (node.aggregatedPublicationInfo.existsInLive === undefined ? true : !node.aggregatedPublicationInfo.existsInLive);
    const isAutoPublish = node['jmix:autoPublish'];
    return Boolean(isCategory || isMarkForDeletionAllowed || isAutoPublish);
};

export const DeletePermanentlyActionComponent = ({path, paths, buttonProps, onDeleted, render: Render, loading: Loading, ...others}) => {
    const componentRenderer = useContext(ComponentRendererContext);
    const language = useSelector(state => state.language);

    const res = useNodeChecks(
        {path, paths, language},
        {
            getDisplayName: true,
            getPrimaryNodeType: true,
            getIsNodeTypes: ['jmix:autoPublish'],
            getProperties: ['jcr:mixinTypes'],
            getAggregatedPublicationInfo: true,
            getOperationSupport: true,
            requiredPermission: ['jcr:removeNode'],
            hideOnNodeTypes: ['jnt:virtualsite'],
            hideForPaths: [PATH_FILES_ITSELF, PATH_CONTENTS_ITSELF, PATH_CATEGORIES_ITSELF]
        },
        {
            fetchPolicy: 'network-only'
        }
    );

    const onExit = () => {
        componentRenderer.destroy('deleteDialog');
    };

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    let isVisible = res.checksResult && (res.node ? checkAction(res.node) : checkActionOnNodes(res));

    return (
        <Render
            {...others}
            isVisible={isVisible}
            buttonProps={{...buttonProps, color: 'danger'}}
            onClick={() => {
                componentRenderer.render('deleteDialog', Delete, {
                    dialogType: 'permanently',
                    path: path,
                    paths: paths,
                    onDeleted,
                    onExit
                });
            }}
        />
    );
};

DeletePermanentlyActionComponent.propTypes = {
    path: PropTypes.string,

    paths: PropTypes.arrayOf(PropTypes.string),

    buttonProps: PropTypes.object,

    onDeleted: PropTypes.func,

    render: PropTypes.func.isRequired,

    loading: PropTypes.func
};
