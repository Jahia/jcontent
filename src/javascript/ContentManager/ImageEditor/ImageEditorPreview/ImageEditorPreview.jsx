import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'react-apollo';
import {withStyles} from '@material-ui/core';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

let styles = () => ({
    cropPreview: {
        background: 'transparent'
    }
});

let containerRef = React.createRef();

function getCropValue(cropParams, originalWidth, originalHeight) {
    return {
        width: cropParams.width ? cropParams.width * 100 / originalWidth : null,
        height: cropParams.height ? cropParams.height * 100 / originalHeight : null,
        y: cropParams.top * 100 / originalHeight,
        x: cropParams.left * 100 / originalWidth,
        aspect: cropParams.aspect
    };
}

export const ImageEditorPreview = ({path, cropParams, onCrop, cropExpanded, dxContext, ts, classes, originalHeight, originalWidth, onImageLoaded, rotationParams, resizeParams, theme}) => {
    let filepath = dxContext.contextPath + '/files/default' + path + '?ts=' + ts;
    let containerHeight = containerRef.current ? containerRef.current.parentElement.offsetHeight - theme.spacing.unit * 4 : 0;
    let containerWidth = containerRef.current ? containerRef.current.parentElement.offsetWidth - theme.spacing.unit * 4 : 0;
    let keepOrientation = rotationParams.rotations % 2 === 0;
    let height = resizeParams.height || originalHeight;
    let width = resizeParams.width || originalWidth;
    let rotatedHeight = (keepOrientation ? height : width);
    let rotatedWidth = (keepOrientation ? width : height);
    let reduceFactor = Math.max(1, rotatedHeight / containerHeight, rotatedWidth / containerWidth);
    let translate = (rotationParams.rotations % 2) * (width - height) / reduceFactor / 2;
    return (
        <div ref={containerRef} style={{width: rotatedWidth / reduceFactor, height: rotatedHeight / reduceFactor}}>
            {cropExpanded ?
                <ReactCrop keepSelection
                           useNaturalImageDimensions
                           className={classes.cropPreview}
                           maxHeight={originalHeight}
                           maxWidth={originalWidth}
                           imageStyle={{
                               width: width / reduceFactor,
                               height: height / reduceFactor
                           }}
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
                           onImageLoaded={img => onImageLoaded(img)}
                /> :
                <img className={classes.img}
                     data-cm-role="preview-image"
                     style={{
                         width: width / reduceFactor,
                         height: height / reduceFactor,
                         transform: 'rotate(' + (rotationParams.rotations * 90) + 'deg)' + (keepOrientation ? '' : ' translateX(' + translate + 'px) translateY(' + translate + 'px)')
                     }}
                     src={filepath}
                     onLoad={e => onImageLoaded(e.target)}/>
            }
        </div>
    );
};

ImageEditorPreview.propTypes = {
    path: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    ts: PropTypes.number.isRequired,
    dxContext: PropTypes.object.isRequired,
    cropExpanded: PropTypes.bool.isRequired,
    onCrop: PropTypes.func.isRequired,
    cropParams: PropTypes.object,
    rotationParams: PropTypes.object.isRequired,
    resizeParams: PropTypes.object.isRequired,
    originalWidth: PropTypes.number.isRequired,
    originalHeight: PropTypes.number.isRequired,
    onImageLoaded: PropTypes.func.isRequired
};

export default compose(
    withStyles(styles, {withTheme: true})
)(ImageEditorPreview);
