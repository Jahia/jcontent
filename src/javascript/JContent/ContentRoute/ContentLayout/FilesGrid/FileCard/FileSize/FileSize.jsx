import React from 'react';
import bytes from 'bytes';
import PropTypes from 'prop-types';

const FileSize = ({node}) => (
    <>
        {node.descendant && node.descendant.data &&
        bytes(node.descendant.data.size, {unitSeparator: ' '})}
    </>
);
FileSize.propTypes = {
    node: PropTypes.object.isRequired
};

export default FileSize;
