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
        const {maxWidth, minWidth, width} = this.props;

        let newWidth = width + offset;
        newWidth = Math.max(minWidth, newWidth);
        newWidth = Math.min(maxWidth, newWidth);

        this.props.onResized(newWidth);
    }

    render() {
        const {children, maxWidth, minWidth, onResized, width, ...otherProps} = this.props;
        return (
            <>
                <RootRef rootRef={this.drawer}>
                    <Drawer width={width} {...otherProps}>
                        <ResizingHandleBar onMouseDown={this.startResizing}/>
                        {children}
                    </Drawer>
                </RootRef>
            </>
        );
    }
}

ResizableDrawer.propTypes = {
    children: PropTypes.node,
    minWidth: PropTypes.number,
    maxWidth: PropTypes.number,
    onResized: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired
};

ResizableDrawer.defaultProps = {
    minWidth: 0,
    maxWidth: 600
};

export default ResizableDrawer;
