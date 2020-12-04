import React from 'react';
import bytes from 'bytes';
import PropTypes from 'prop-types';

const PreviewSize = ({node}) => {
    const width = node?.width?.value;
    const height = node?.height?.value;

    const nodes = node?.children?.nodes || [];
    const size = (nodes.length > 0) ? nodes[0]?.data?.size : 0;

    return (
        <>
            { (width && height) ?
                `${width} x ${height} - ${bytes(size, {unitSeparator: ' '})}` : '' }
        </>
    );
};

PreviewSize.propTypes = {
    node: PropTypes.object.isRequired
};

export default PreviewSize;
