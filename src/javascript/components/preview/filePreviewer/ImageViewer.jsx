import React  from 'react';
import ReactDOM  from 'react-dom';
import PropTypes from 'prop-types';
import {Canvas} from 'react-darkroom';
import { withStyles } from '@material-ui/core';
import {translate} from "react-i18next";
import {IconButton, Paper, CardMedia, Card} from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components/dist/styled-components.js';
import {connect} from "react-redux";

const styles = theme => ({
    root: {},
    controls: {
        background: 'transparent'
    },
    icon: {
        color:"#fff"
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
        height: 550,
    },
    bigImage: {
        width: '100vw',
        height: '100vh'
    }

});
const ImageControls = styled.div`
`;
const ImagePreviewContainer = styled.div`
`;
class ImageViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            file: props.file,
            cropEnabled: false,
            angle:0,
            controls: {
                resizeActive: false,
                cropActive: false
            },
        };
    }

    handleActiveControl = (control, value) => {
        //@TODO implement crop and resizing features
        this.setState((prevState)=> {
            let {controls} = prevState;
            for (let i in controls) {
                controls[i] = control === i ? value : false;
            }
            return {controls}
        });
    };

    rotateImage = (direction) => {
        this.setState((prevState)=> {
            let {angle} = prevState;
            switch (direction) {
                case 'left':
                    angle -= 90;
                    break;
                case 'right':
                    angle += 90;
                    break;
            }
            return {
                angle: angle
            };
        });
    };

    renderImageControls = () => {
        let {elementId, classes} = this.props;
        const element = document.getElementById(elementId);
        if (element) {
            const controls = <ImageControls>
                <Paper className={classes.controls} elevation={0}>
                    <IconButton className={classes.icon} onClick={()=> {this.handleActiveControl('resizeActive', !this.state.controls.resizeActive)}}>
                        <FontAwesomeIcon icon={"expand"} size={"xs"}/>
                    </IconButton>
                    <div className={classes.iconLabel}>Resize</div>
                    <IconButton className={classes.icon} onClick={()=> {this.rotateImage('left')}}>
                        <FontAwesomeIcon icon={"undo-alt"} size={"xs"}/>
                    </IconButton>
                    <div className={classes.iconLabel}>Rotate left</div>
                    <IconButton className={classes.icon} onClick={()=> {this.rotateImage('right')}}>
                        <FontAwesomeIcon icon={"redo-alt"} size={"xs"}/>
                    </IconButton>
                    <div className={classes.iconLabel}>Rotate right</div>
                    <IconButton className={classes.icon} onClick={()=> {this.handleActiveControl('cropActive', !this.state.controls.cropActive)}}>
                        <FontAwesomeIcon icon={"crop-alt"} size={"xs"}/>
                    </IconButton>
                    <div className={classes.iconLabel}>Crop</div>
                </Paper>
            </ImageControls>;
            ReactDOM.render(controls, element);
        }
    };

    render() {
        let {cropEnabled, file, angle} = this.state;
        let {fullScreen, classes} = this.props;
        //Remove Canvas Tag but react-darkroom still in dependency
        return (
                <CardMedia
                    className={fullScreen ? classes.bigImage : classes.littleImage}
                    image={file}>
                </CardMedia>
        )
    }

    componentDidUpdate(prevProps) {
        if (this.props.previewMode === 'edit' && prevProps.previewMode !== 'edit') {
            //Disabled for now until controls functionality is implemented
            // this.renderImageControls();
        }
    }

    componentWillUnmount() {
        let el = document.getElementById(this.props.elementId);
        if (el != null) {
            ReactDOM.unmountComponentAtNode(el);
        }
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        previewMode: state.previewMode
    }
};

ImageViewer.propTypes = {
    elementId: PropTypes.string.isRequired,
    file: PropTypes.string.isRequired
};

ImageViewer = _.flowRight(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, null)
)(ImageViewer);

export default ImageViewer;