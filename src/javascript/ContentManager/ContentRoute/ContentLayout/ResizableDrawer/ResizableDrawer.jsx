import React from 'react';
import PropTypes from 'prop-types';
import {Drawer, RootRef} from '@material-ui/core';
import ResizingHandleBar from './ResizingHandleBar';

export class ResizableDrawer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {resizing: false};
        this.drawer = React.createRef();

        this.startResizing = this.startResizing.bind(this);
        this.stopResizing = this.stopResizing.bind(this);
        this.resize = this.resize.bind(this);
    }

    startResizing() {
        if (this.state.resizing) {
            return;
        }

        this.setState({resizing: true});

        const {ownerDocument} = this.drawer.current;
        ownerDocument.addEventListener('mousemove', this.resize);
        ownerDocument.addEventListener('mouseup', this.stopResizing);
    }

    stopResizing() {
        if (!this.state.resizing) {
            return;
        }

        this.setState({resizing: false});

        const {ownerDocument} = this.drawer.current;
        ownerDocument.removeEventListener('mousemove', this.resize);
        ownerDocument.removeEventListener('mouseup', this.stopResizing);
    }

    resize(event) {
        if (!this.state.resizing) {
            return;
        }

        event.preventDefault();

        const body = this.drawer.current.ownerDocument.body;
        const maxRightX = body.getBoundingClientRect().right;
        if (event.pageX >= maxRightX) {
            return;
        }

        const drawerRightX = this.drawer.current.getBoundingClientRect().right;
        const offset = event.pageX - drawerRightX;
        const newWidth = this.props.width + offset;

        this.props.onResized(Math.max(newWidth, 0));
    }

    render() {
        const {children, onResized, width, open, ...otherProps} = this.props;
        return (
            <>
                {open &&
                    <RootRef rootRef={this.drawer}>
                        <Drawer width={width + 'px'} open={open} {...otherProps}>
                            <ResizingHandleBar onMouseDown={this.startResizing}/>
                            {children}
                        </Drawer>
                    </RootRef>
                }
            </>
        );
    }
}

ResizableDrawer.propTypes = {
    children: PropTypes.node,
    onResized: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    width: PropTypes.number.isRequired
};

export default ResizableDrawer;
