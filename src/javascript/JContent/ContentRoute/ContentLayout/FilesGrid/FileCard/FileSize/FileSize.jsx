import React from 'react';
import bytes from 'bytes';
import PropTypes from 'prop-types';

const FileSize = ({node}) => (
    <>
        {node.content && node.content.data &&
        bytes(node.content.data.size, {unitSeparator: ' '})}
    </>
);
FileSize.propTypes = {
    node: PropTypes.object.isRequired
};

export default FileSize;
