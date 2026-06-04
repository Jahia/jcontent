import React from 'react';
import PropTypes from 'prop-types';
import {createEncodedHashString} from '../../CompareDialog/util';
import {useNodeChecks} from '@jahia/data-helper';
import {useSelector} from 'react-redux';
import {isDefinitelyHidden} from '../utils/nodeVisibilityUtils';

export const CompareHtmlActionComponent = ({path, node: prefetchedNode, render: Render, loading: Loading, ...others}) => {
    const language = useSelector(state => state.language);
    const skip = isDefinitelyHidden(prefetchedNode, {showOnNodeTypes: ['jnt:page', 'jmix:mainResource']});
    const res = useNodeChecks(
        {path, language},
        {
            skip,
            showOnNodeTypes: ['jnt:page', 'jmix:mainResource'],
            getAggregatedPublicationInfo: {subNodes: true}
        }
    );

    if (res.error) {
        console.error(`Error while fetching checks for node ${path}:`, res.error);
        return null;
    }

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
    }

    if (skip) {
        return false;
    }

    const isVisible = res.checksResult && (res?.node?.aggregatedPublicationInfo.publicationStatus === 'PUBLISHED' ||
        res?.node?.aggregatedPublicationInfo.publicationStatus === 'MODIFIED');

    return (
        <Render
            {...others}
            isVisible={isVisible}
            onClick={() => {
                window.open(`${window.location.href}#${createEncodedHashString(path)}`, '_blank');
            }}
        />
    );
};

CompareHtmlActionComponent.propTypes = {
    path: PropTypes.string,
    node: PropTypes.object,
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
