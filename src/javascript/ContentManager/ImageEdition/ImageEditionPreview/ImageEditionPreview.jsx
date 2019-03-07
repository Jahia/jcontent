import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'react-apollo';
import {Card, withStyles} from '@material-ui/core';
import ImageViewer from '../../ContentLayout/PreviewDrawer/ContentPreview/PreviewComponent/ImageViewer/ImageViewer';
import classNames from 'classnames';

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
    },
    card: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'inherit'
    },
    imageViewer: {
        flex: '1 1 0%',
        maxWidth: '100%'
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
        let {path, ts, classes} = this.props;
        let filepath = '/files/default' + path + '?ts=' + ts;
        return (
            <Card className={classes.card}>
                <ImageViewer file={filepath} fullScreen={false} className={classNames(classes.imageViewer, this.getRotationClass())}/>
            </Card>
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
