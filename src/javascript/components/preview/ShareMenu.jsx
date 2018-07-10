import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from "react-i18next";
import { withStyles, IconButton, MenuItem, Menu } from "@material-ui/core";
import { Share } from "@material-ui/icons";

const styles = theme => ({
    button: {
        margin: theme.spacing.unit
    }
});

class ShareMenu extends Component {

    handleMenuClick(event, anchorType) {
        this.setState({ [anchorType]: event.currentTarget });
    };

    handleMenuClose(anchorType) {
        this.setState({ [anchorType]: null });
    };

    constructor(props) {
        super(props);
        this.state = {
            shareMenuAnchor : null,
        };
    }


    render() {
        const { t, classes } = this.props;
        const { shareMenuAnchor } = this.state;

        return <span>
            <IconButton
                aria-owns={ shareMenuAnchor ? 'share-menu' : null}
                aria-haspopup="true"
                onClick={ ( event) => this.handleMenuClick(event, "shareMenuAnchor") }>
                <Share />
            </IconButton>
            <Menu
                id="share-menu"
                anchorEl={ shareMenuAnchor }
                open={Boolean( shareMenuAnchor )}
                onClose={ () => this.handleMenuClose("shareMenuAnchor") }>
                <MenuItem onClick={ () => this.handleMenuClose("shareMenuAnchor") }>
                    { t('label.contentManager.contentPreview.copyPathToClipboard') }
                </MenuItem>
                <MenuItem onClick={ () => this.handleMenuClose("shareMenuAnchor") }>
                    { t('label.contentManager.contentPreview.copyUUIDToClipboard') }
                </MenuItem>
            </Menu>
        </span>
    }
}

export default translate()(withStyles(styles)(ShareMenu));

ShareMenu.propTypes = {
    selection: PropTypes.object.isRequired
};