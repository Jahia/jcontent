import React from 'react';
import PropTypes from 'prop-types';
import EmptyDropZone from '../EmptyDropZone';

export const ContentEmptyDropZone = ({uploadType, reference, isCanDrop}) => (
    <div ref={reference} className="flexFluid flexRow" style={{padding: '16px'}}>
        <EmptyDropZone component="div" uploadType={uploadType} isCanDrop={isCanDrop}/>
    </div>
);

ContentEmptyDropZone.propTypes = {
    uploadType: PropTypes.string,
    reference: PropTypes.object,
    isCanDrop: PropTypes.bool
};

export default ContentEmptyDropZone;
