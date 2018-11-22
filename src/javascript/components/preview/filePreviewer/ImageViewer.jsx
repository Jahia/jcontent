import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core';
import {translate} from 'react-i18next';
import {CardMedia} from '@material-ui/core';
import {connect} from 'react-redux';
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
    constructor(props) {
        super(props);
        this.state = {
            file: props.file
        };
    }

    render() {
        let {file} = this.state;
        let {fullScreen, classes} = this.props;
        // Remove Canvas Tag but react-darkroom still in dependency
        return (
            <CardMedia
                classes={{root: fullScreen ? classes.CardRoot : classes.CardRoot}}
                className={fullScreen ? classes.bigImage : classes.littleImage}
                image={file}/>
        );
    }

    componentDidUpdate(prevProps) {
        if (this.props.previewMode === 'edit' && prevProps.previewMode !== 'edit') {
            // Disabled for now until controls functionality is implemented
            // this.renderImageControls();
        }
    }

    componentWillUnmount() {
        let el = document.getElementById(this.props.elementId);
        if (el !== null) {
            ReactDOM.unmountComponentAtNode(el);
        }
    }
}

const mapStateToProps = state => {
    return {
        previewMode: state.previewMode
    };
};

ImageViewer.propTypes = {
    elementId: PropTypes.string.isRequired,
    file: PropTypes.string.isRequired
};

export default compose(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, null)
)(ImageViewer);
