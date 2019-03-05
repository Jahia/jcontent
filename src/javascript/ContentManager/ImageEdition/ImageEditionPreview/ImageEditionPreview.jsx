import React from 'react';
import {compose} from 'react-apollo';
import {withStyles} from '@material-ui/core';

let styles = () => ({
    rotate1: {
        transform: 'rotate(90deg)'
    },
    rotate2: {
        transform: 'rotate(180deg)'
    },
    rotate3: {
        transform: 'rotate(270deg)'
    },
    rotate0: {
        transform: 'rotate(360deg)'
    }
});

export class ImageEditionPreview extends React.Component {
    getRotationClass() {
        let {rotate, classes} = this.props;
        switch (rotate) {
            case 0:
                return classes.rotate0;
            case 1:
                return classes.rotate1;
            case 2:
                return classes.rotate2;
            case 3:
                return classes.rotate3;
            default:
                return classes.rotate0;
        }
    }

    render() {
        return <div className={this.getRotationClass()}>preview</div>;
    }
}

ImageEditionPreview.propTypes = {

};

export default compose(
    withStyles(styles)
)(ImageEditionPreview);
