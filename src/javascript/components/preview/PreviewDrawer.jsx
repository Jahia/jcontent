import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Drawer from '@material-ui/core/Drawer';

const styles = theme => ({
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'left',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    }
});

class PreviewDrawer extends React.Component {

    constructor(props) {
        super(props);

    }

    render() {
        const { classes } = this.props;

        return (
            <Drawer anchor="right"
                    open={ this.props.open }>
                <div className={classes.drawerHeader}>
                    <IconButton onClick={ this.props.onClose }>
                         <ChevronRightIcon />
                    </IconButton>
                </div>
                { this.props.children }
            </Drawer>
        );
    }
}

PreviewDrawer.propTypes = {
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default withStyles(styles)(PreviewDrawer);