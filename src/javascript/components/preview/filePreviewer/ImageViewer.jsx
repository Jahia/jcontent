import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import {translate} from 'react-i18next';
import {CardMedia} from '@material-ui/core';
import {compose} from 'react-apollo';

const styles = () => ({
    root: {},
    controls: {
        background: 'transparent'
    },
    icon: {
        color: '#fff'
    },
    iconLabel: {
        color: '#fff',
        display: 'inline',
        marginLeft: '-5px',
        fontWeight: 500,
        fontSize: '.95em',
        fontFamily: 'sans-serif'
    },
    littleImage: {
        width: 550,
        height: 550
    },
    bigImage: {
        width: '100%',
        height: '100vh'
    },
    CardRoot: {
        backgroundSize: 'contain'
    }

});

class ImageViewer extends React.Component {
    render() {
        let {fullScreen, classes, file} = this.props;

        return (
            <CardMedia
                classes={{root: fullScreen ? classes.CardRoot : classes.CardRoot}}
                className={fullScreen ? classes.bigImage : classes.littleImage}
                image={file}/>
        );
    }
}

ImageViewer.propTypes = {
    classes: PropTypes.object,
    file: PropTypes.string.isRequired,
    fullScreen: PropTypes.bool.isRequired
};

ImageViewer.defaultProps = {
    classes: null
};

export default compose(
    translate(),
    withStyles(styles)
)(ImageViewer);
