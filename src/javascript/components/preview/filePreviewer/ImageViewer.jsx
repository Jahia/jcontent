import React  from 'react';
import ReactDOM  from 'react-dom';
import PropTypes from 'prop-types';
import {Canvas} from 'react-darkroom';
import { withStyles } from '@material-ui/core/styles';
import {translate} from "react-i18next";
import {IconButton, Paper} from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components/dist/styled-components.js';

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
        return (
            <ImagePreviewContainer>
                <Canvas crop={cropEnabled} source={file} angle={angle} width={650} height={650} />
            </ImagePreviewContainer>
        )
    }

    componentDidMount() {
        this.renderImageControls();
    }

    componentWillUnmount() {
        ReactDOM.unmountComponentAtNode(document.getElementById(this.props.elementId))
    }
}

ImageViewer.propTypes = {
    elementId: PropTypes.string.isRequired,
    file: PropTypes.string.isRequired
};
export default translate()(withStyles(styles)(ImageViewer));