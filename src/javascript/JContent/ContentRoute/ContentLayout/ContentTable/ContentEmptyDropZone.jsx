import React from 'react';
import PropTypes from 'prop-types';
import EmptyDropZone from '../EmptyDropZone';

export const ContentEmptyDropZone = ({uploadType, reference, isCanDrop, allowDrop, selector}) => (
    <div ref={reference} className="flexFluid flexRow" style={{padding: '16px'}}>
        <EmptyDropZone component="div" uploadType={uploadType} isCanDrop={isCanDrop} allowDrop={allowDrop} selector={selector}/>
    </div>
);

ContentEmptyDropZone.propTypes = {
    uploadType: PropTypes.string,
    reference: PropTypes.object,
    isCanDrop: PropTypes.bool,
    // eslint-disable-next-line react/boolean-prop-naming
    allowDrop: PropTypes.bool,
    selector: PropTypes.func
};
