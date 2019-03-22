import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'react-apollo';
import {withStyles} from '@material-ui/core';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

let styles = () => ({
    img: {
        height: 'auto',
        width: '100%'
    },
    cropPreview: {
        background: 'transparent'
    }
});

function getCropValue(cropParams, originalWidth, originalHeight) {
    return {
        width: cropParams.width ? cropParams.width * 100 / originalWidth : null,
        height: cropParams.height ? cropParams.height * 100 / originalHeight : null,
        y: cropParams.top * 100 / originalHeight,
        x: cropParams.left * 100 / originalWidth,
        aspect: cropParams.aspect
    };
}

export const ImageEditorPreview = ({path, cropParams, onCrop, cropExpanded, dxContext, ts, classes, originalHeight, originalWidth, onImageLoaded, rotationParams}) => {
    let filepath = dxContext.contextPath + '/files/default' + path + '?ts=' + ts;

    return (
        <div>
            {cropExpanded ?
                <ReactCrop keepSelection
                           useNaturalImageDimensions
                           className={classes.cropPreview}
                           maxHeight={originalHeight}
                           maxWidth={originalWidth}
                           imageStyle={{width: '100%', height: 'auto'}}
                           src={filepath}
                           crop={getCropValue(cropParams, originalWidth, originalHeight)}
                           onChange={newValue => {
                               onCrop({
                                   width: originalWidth * newValue.width / 100,
                                   height: originalHeight * newValue.height / 100,
                                   top: originalHeight * newValue.y / 100,
                                   left: originalWidth * newValue.x / 100,
                                   aspect: newValue.aspect
                               });
                           }}
                           onImageLoaded={onImageLoaded}
                /> :
                <img className={classes.img}
                     style={{transform: 'rotate(' + (rotationParams.rotations * 90) + 'deg)'}}
                     src={filepath}
                     onLoad={e => onImageLoaded(e.target)}/>
            }
        </div>
    );
};

ImageEditorPreview.propTypes = {
    path: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired,
    ts: PropTypes.number.isRequired,
    dxContext: PropTypes.object.isRequired,
    cropExpanded: PropTypes.bool.isRequired,
    onCrop: PropTypes.func.isRequired,
    cropParams: PropTypes.object,
    rotationParams: PropTypes.object.isRequired,
    originalWidth: PropTypes.number.isRequired,
    originalHeight: PropTypes.number.isRequired,
    onImageLoaded: PropTypes.func.isRequired
};

export default compose(
    withStyles(styles)
)(ImageEditorPreview);
