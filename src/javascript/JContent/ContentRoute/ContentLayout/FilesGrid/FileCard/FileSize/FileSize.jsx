import React from 'react';
import bytes from 'bytes';
import PropTypes from 'prop-types';

const FileSize = ({node}) => (
    <>
        {node.children && node.children.nodes.length > 0 && node.children.nodes[0].data &&
        bytes(node.children.nodes[0].data.size, {unitSeparator: ' '})}
    </>
);
FileSize.propTypes = {
    node: PropTypes.object.isRequired
};

export default FileSize;
