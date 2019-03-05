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
    rotate4: {
        transform: 'rotate(360deg)'
    }
});

export class ImageEditionPreview extends React.Component {
    render() {
        let {rotations} = this.props;
        return <div>preview</div>;
    }
}

ImageEditionPreview.propTypes = {

};

export default compose(
    withStyles(styles)
)(ImageEditionPreview);
