import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Drawer from '@material-ui/core/Drawer';

const styles = theme => ({});

class UploadDrawer extends React.Component {

    constructor(props) {
        super(props);

    }

    render() {
        const { classes, PaperProps, transitionDuration } = this.props;
        return (
            <Drawer anchor="bottom"
                    style={{position: "initial"}}
                    PaperProps={ PaperProps }
                    open={ this.props.open }
                    transitionDuration={ transitionDuration }>
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

export default withStyles(styles)(UploadDrawer);