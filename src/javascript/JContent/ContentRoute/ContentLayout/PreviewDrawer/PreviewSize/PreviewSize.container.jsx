import React from 'react';
import {previewSizeQuery} from './PreviewSize.gql-queries';
import {useQuery} from '@apollo/client';
import PropTypes from 'prop-types';
import PreviewSize from './PreviewSize';

const useMetadataPreview = variables => {
    return useQuery(previewSizeQuery, {
        variables,
        fetchPolicy: 'cache-first'
    });
};

export const PreviewSizeContainer = ({node}) => {
    const {data, loading, refetch} = useMetadataPreview({
        workspace: 'EDIT',
        path: node.path
    });

    if (!loading && Object.keys(data || {}).length === 0) {
        refetch();
    }

    /*
     * Sometimes data that comes back doesn't match the requested workspace
     * e.g. when requests are fired off one after the other.
     * Wait until request matches
     */
    const dataWorkspace = data?.jcr?.nodeByPath?.workspace;
    return (loading || dataWorkspace !== 'EDIT') ?
        (<PreviewSize node={node}/>) :
        (<PreviewSize node={data?.jcr?.nodeByPath || {}}/>);
};

PreviewSizeContainer.propTypes = {
    node: PropTypes.object.isRequired
};

export default PreviewSizeContainer;
