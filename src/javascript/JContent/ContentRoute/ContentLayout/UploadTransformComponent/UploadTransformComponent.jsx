import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {useFileDrop} from '~/JContent/dnd/useFileDrop';
import {RootRef} from '@material-ui/core';

export const UploadTransformComponent = React.forwardRef(({
    uploadTargetComponent: Component,
    uploadPath,
    uploadAcceptedFileTypes,
    uploadMinSize,
    uploadMaxSize,
    uploadType,
    uploadFilter,
    ...props
}, ref) => {
    const rootRef = useRef();
    useFileDrop({uploadPath, uploadType, uploadMaxSize, uploadMinSize, uploadFilter, ref: rootRef});
    return (
        <RootRef rootRef={rootRef}>
            <Component ref={ref} {...props}/>
        </RootRef>
    );
});

UploadTransformComponent.propTypes = {
    uploadTargetComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired,
    uploadPath: PropTypes.string.isRequired,
    uploadType: PropTypes.string,
    uploadAcceptedFileTypes: PropTypes.array,
    uploadMaxSize: PropTypes.number,
    uploadMinSize: PropTypes.number,
    uploadFilter: PropTypes.func
};

UploadTransformComponent.defaultProps = {
    uploadMaxSize: Infinity,
    uploadMinSize: 0,
    uploadFilter: () => true
};

UploadTransformComponent.displayName = 'UploadTransformComponent';

export default UploadTransformComponent;
