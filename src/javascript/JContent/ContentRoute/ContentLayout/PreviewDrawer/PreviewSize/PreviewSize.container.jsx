import React from 'react';
import {previewSizeQuery} from './PreviewSize.gql-queries';
import {useQuery} from 'react-apollo';
import PropTypes from 'prop-types';
import PreviewSize from './PreviewSize';

const useMetadataPreview = variables => {
    return useQuery(previewSizeQuery, {
        variables,
        fetchPolicy: 'cache-first'
    });
};

export const PreviewSizeContainer = ({node, previewMode}) => {
    previewMode = previewMode?.toUpperCase();
    const {data, loading, refetch} = useMetadataPreview({
        workspace: previewMode,
        path: node.path
    });

    if (!loading && Object.keys(data || {}).length === 0) {
        refetch();
    }

    /*
     * Sometimes data that comes back doesn't match previewMode requested
     * e.g. when requests are fired off one after the other.
     * Wait until request matches
     */
    const dataWorkspace = data?.jcr?.nodeByPath?.workspace;
    return (loading || dataWorkspace !== previewMode) ?
        (<PreviewSize node={node}/>) :
        (<PreviewSize node={data?.jcr?.nodeByPath || {}}/>);
};

PreviewSizeContainer.propTypes = {
    node: PropTypes.object.isRequired,
    previewMode: PropTypes.string.isRequired
};

export default PreviewSizeContainer;
