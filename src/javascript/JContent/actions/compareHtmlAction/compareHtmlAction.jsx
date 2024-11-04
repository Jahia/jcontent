import React from 'react';
import PropTypes from 'prop-types';
import {createEncodedHashString} from '../../CompareDialog/util';
import {useNodeChecks} from '@jahia/data-helper';

export const CompareHtmlActionComponent = ({path, render: Render, loading: Loading, ...others}) => {
    const res = useNodeChecks(
        {path},
        {
            showOnNodeTypes: ['jnt:page'],
            getAggregatedPublicationInfo: {subNodes: true}
        }
    );

    if (res.loading) {
        return (Loading && <Loading {...others}/>) || false;
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
    render: PropTypes.func.isRequired,
    loading: PropTypes.func
};
