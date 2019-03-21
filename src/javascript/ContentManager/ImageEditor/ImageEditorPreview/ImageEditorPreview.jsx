import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'react-apollo';
import {Card, CardMedia, withStyles} from '@material-ui/core';
import classNames from 'classnames';
import ReactCrop from 'react-image-crop';
// We ignore this line to avoid breaking the build, as we need this css but we don't use it anywhere
// eslint-disable-next-line
import ReactCropCss from 'react-image-crop/dist/ReactCrop.css';

let styles = theme => ({
    rotate0: {
        transform: 'rotate(0deg)'
    },
    rotate1: {
        transform: 'rotate(90deg)'
    },
    rotate2: {
        transform: 'rotate(180deg)'
    },
    rotate3: {
        transform: 'rotate(270deg)'
    },
    card: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'inherit',
        height: '100%'
    },
    imageViewer: {
        flex: '1 1 0%',
        height: '100%',
        maxWidth: '100%',
        paddingTop: (theme.spacing.unit * 3) + 'px',
        paddingBottom: (theme.spacing.unit * 3) + 'px',
        margin: '0 auto',
        backgroundSize: 'contain'
    },
    cropPreview: {
        background: 'transparent'
    }
});

export class ImageEditorPreview extends React.Component {
    getRotationClass() {
        let {rotations, classes} = this.props;
        switch (rotations) {
            case 0:
                return classes.rotate0;
            case 1:
                return classes.rotate1;
            case 2:
                return classes.rotate2;
            case -1:
                return classes.rotate3;
            default:
                return classes.rotate0;
        }
    }

    render() {
        let {path, cropParams, onCropChange, cropExpanded, dxContext, ts,
            classes, originalHeight, originalWidth, onImageLoaded} = this.props;
        let filepath = dxContext.contextPath + '/files/default' + path + '?ts=' + ts;
        return (
            cropExpanded ?
                <ReactCrop keepSelection
                           useNaturalImageDimensions
                           className={classes.cropPreview}
                           maxHeight={originalHeight}
                           maxWidth={originalWidth}
                           imageStyle={{width: '100%', height: 'auto'}}
                           src={filepath}
                           crop={cropParams}
                           onImageLoaded={onImageLoaded}
                           onChange={crop => onCropChange(crop, originalHeight, originalWidth)}
                /> :
                <Card className={classes.card}>
                    <CardMedia className={classNames(classes.imageViewer, this.getRotationClass())}
                               data-cm-role="preview-image"
                               image={filepath}
                    />
                </Card>
        );
    }
}

ImageEditorPreview.propTypes = {
    path: PropTypes.string.isRequired,
    rotations: PropTypes.number.isRequired,
    classes: PropTypes.object.isRequired,
    ts: PropTypes.number.isRequired,
    dxContext: PropTypes.object.isRequired,
    cropExpanded: PropTypes.bool.isRequired,
    onCropChange: PropTypes.func.isRequired,
    cropParams: PropTypes.object,
    originalWidth: PropTypes.number.isRequired,
    originalHeight: PropTypes.number.isRequired,
    onImageLoaded: PropTypes.func.isRequired
};

export default compose(
    withStyles(styles)
)(ImageEditorPreview);
