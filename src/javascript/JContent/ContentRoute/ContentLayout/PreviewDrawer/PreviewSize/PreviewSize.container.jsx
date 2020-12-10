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
    const {data, loading} = useMetadataPreview({
        workspace: previewMode?.toUpperCase(),
        path: node.path
    });
    if (!loading) {
        node = data?.jcr?.nodeByPath || {};
    }

    return (<PreviewSize node={node}/>);
};

PreviewSizeContainer.propTypes = {
    node: PropTypes.object.isRequired,
    previewMode: PropTypes.string.isRequired
};

export default PreviewSizeContainer;
