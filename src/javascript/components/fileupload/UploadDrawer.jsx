import React from 'react';
import PropTypes from 'prop-types';
import {Drawer} from '@material-ui/core';

class UploadDrawer extends React.Component {
    render() {
        const {PaperProps, transitionDuration} = this.props;
        return (
            <Drawer anchor="bottom"
                style={{position: 'initial'}}
                PaperProps={PaperProps}
                open={this.props.open}
                transitionDuration={transitionDuration}
            >
                { this.props.children }
            </Drawer>
        );
    }
}

UploadDrawer.propTypes = {
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    PaperProps: PropTypes.object,
    transitionDuration: PropTypes.number.isRequired
};

export default UploadDrawer;
