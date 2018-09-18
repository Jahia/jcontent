import React, { Component } from 'react';
import { translate } from "react-i18next";
import { withStyles, IconButton, MenuItem, Menu } from "@material-ui/core";
import { Share } from "@material-ui/icons";
import copy from 'copy-to-clipboard';
import {lodash as _} from "lodash";
import {connect} from "react-redux";

const styles = theme => ({
    button: {
        margin: theme.spacing.unit
    }
});

class ShareMenu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            shareMenuAnchor: null,
        };
    }

    copy(value) {
        this.handleMenuClose("shareMenuAnchor");
        copy(value);
    }


    render() {
        const {t, selection} = this.props;
        const {shareMenuAnchor} = this.state;
        if (_.isEmpty(selection)) {
            return null;
        }
        const selectedItem = selection[0];
        return <span>
            <IconButton
                aria-owns={shareMenuAnchor ? 'share-menu' : null}
                aria-haspopup="true"
                onClick={(event) => this.handleMenuClick(event, "shareMenuAnchor")}>
                <Share/>
            </IconButton>
            <Menu
                id="share-menu"
                anchorEl={shareMenuAnchor}
                open={Boolean(shareMenuAnchor)}
                onClose={() => this.handleMenuClose("shareMenuAnchor")}>
                <MenuItem onClick={() => this.copy(selectedItem.path)}>
                    {t('label.contentManager.contentPreview.copyPathToClipboard')}
                </MenuItem>
                <MenuItem onClick={() => this.copy(selectedItem.uuid)}>
                    {t('label.contentManager.contentPreview.copyUUIDToClipboard')}
                </MenuItem>
            </Menu>
        </span>
    }

    handleMenuClick(event, anchorType) {
        this.setState({[anchorType]: event.currentTarget});
    };

    handleMenuClose(anchorType) {
        this.setState({[anchorType]: null});
    };
}
const mapStateToProps = (state, ownProps) => ({
    selection: state.selection
})

export default _.flowRight(
    translate(),
    withStyles(styles),
    connect(mapStateToProps)
)(ShareMenu);
