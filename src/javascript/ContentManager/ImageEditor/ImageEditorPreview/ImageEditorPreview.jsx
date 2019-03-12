import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'react-apollo';
import {Card, CardMedia, withStyles} from '@material-ui/core';
import classNames from 'classnames';

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
        let {path, ts, classes, dxContext} = this.props;
        let filepath = dxContext.contextPath + '/files/default' + path + '?ts=' + ts;
        return (
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
    dxContext: PropTypes.object.isRequired
};

export default compose(
    withStyles(styles)
)(ImageEditorPreview);
