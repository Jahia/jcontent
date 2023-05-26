import React from 'react';
import PropTypes from 'prop-types';
import EmptyDropZone from '../EmptyDropZone';

export const ContentEmptyDropZone = ({uploadType, reference, isCanDrop, selector}) => (
    <div ref={reference} className="flexFluid flexRow" style={{padding: '16px'}}>
        <EmptyDropZone component="div" uploadType={uploadType} isCanDrop={isCanDrop} selector={selector}/>
    </div>
);

ContentEmptyDropZone.propTypes = {
    uploadType: PropTypes.string,
    reference: PropTypes.object,
    isCanDrop: PropTypes.bool,
    selector: PropTypes.func
};

export default ContentEmptyDropZone;
