import React from 'react';
import prettyBytes from 'pretty-bytes';
import PropTypes from 'prop-types';

const FileSize = ({node}) => (
    <>
        {node.children && node.children.nodes.length > 0 && node.children.nodes[0].data && prettyBytes(node.children.nodes[0].data.size)}
    </>
);
FileSize.propTypes = {
    node: PropTypes.object.isRequired
};

export default FileSize;
