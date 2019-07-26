import React from 'react';
import PropTypes from 'prop-types';
import {Drawer, withStyles} from '@material-ui/core';
import ResizingHandleBar from './ResizingHandleBar';

const constants = Object.freeze({
    handleBarOffset: 4
});

const styles = theme => ({
    handleBar: {
        backgroundColor: 'transparent',
        cursor: 'col-resize',
        minHeight: '100%',
        height: '100%',
        position: 'absolute',
        right: `-${constants.handleBarOffset}px`,
        width: `calc(${constants.handleBarOffset}px * 2 + 1px)`,
        zIndex: theme.zIndex.drawer
    }
});

export class ResizableDrawer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {resizing: false};
        this.handleBar = React.createRef();

        this.startResizing = this.startResizing.bind(this);
        this.stopResizing = this.stopResizing.bind(this);
        this.resize = this.resize.bind(this);
    }

    startResizing() {
        if (this.state.resizing) {
            return;
        }

        this.setState({resizing: true});

        const {ownerDocument} = this.handleBar.current;
        ownerDocument.addEventListener('mousemove', this.resize);
        ownerDocument.addEventListener('mouseup', this.stopResizing);
    }

    stopResizing() {
        if (!this.state.resizing) {
            return;
        }

        this.setState({resizing: false});

        const {ownerDocument} = this.handleBar.current;
        ownerDocument.removeEventListener('mousemove', this.resize);
        ownerDocument.removeEventListener('mouseup', this.stopResizing);
    }

    resize(event) {
        if (!this.state.resizing) {
            return;
        }

        event.preventDefault();

        const initialPosition = this.handleBar.current.getBoundingClientRect().right - constants.handleBarOffset;
        const offset = event.pageX - initialPosition;
        const newWidth = this.props.width + offset;

        this.props.onResized(Math.max(newWidth, 0));
    }

    render() {
        const {children, classes, width, open, onResized, ...otherProps} = this.props;
        const {handleBar: handleBarClass, ...otherClasses} = classes;
        return (
            <>
                {open &&
                <Drawer width={width + 'px'} classes={otherClasses} open={open} {...otherProps}>
                    <ResizingHandleBar ref={this.handleBar} className={handleBarClass} onMouseDown={this.startResizing}/>
                    {children}
                </Drawer>
                }
            </>
        );
    }
}

ResizableDrawer.propTypes = {
    children: PropTypes.node,
    classes: PropTypes.object.isRequired,
    onResized: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    width: PropTypes.number.isRequired
};

export default withStyles(styles)(ResizableDrawer);
