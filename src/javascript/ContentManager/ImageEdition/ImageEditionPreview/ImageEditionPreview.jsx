import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'react-apollo';
import {withStyles} from '@material-ui/core';
import ImageViewer from '../../ContentLayout/PreviewDrawer/ContentPreview/PreviewComponent/ImageViewer/ImageViewer';

let styles = () => ({
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
    }
});

export class ImageEditionPreview extends React.Component {
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
        let {path, ts} = this.props;
        let filepath = '/files/default' + path + '?ts=' + ts;
        return (
            <div className={this.getRotationClass()}>
                <ImageViewer file={filepath} fullScreen={false}/>
            </div>
        );
    }
}

ImageEditionPreview.propTypes = {
    path: PropTypes.string.isRequired,
    rotations: PropTypes.number.isRequired,
    classes: PropTypes.object.isRequired
};

export default compose(
    withStyles(styles)
)(ImageEditionPreview);
