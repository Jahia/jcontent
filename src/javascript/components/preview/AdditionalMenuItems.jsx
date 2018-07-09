import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Mutation } from 'react-apollo';
import { translate } from "react-i18next";
import { withStyles, MenuItem, Menu, IconButton } from "@material-ui/core";
import { MoreVert } from "@material-ui/icons";
import {allContentQuery} from "../gqlQueries";
import {deleteNode, publishNode} from "../gqlMutations";

const styles = theme => ({
    button: {
        margin: theme.spacing.unit
    }
});

class AdditionalMenuItems extends Component {

    handleMenuClick(event, anchorType) {
        this.setState({ [anchorType]: event.currentTarget });
    };

    handleMenuClose(anchorType) {
        this.setState({ [anchorType]: null });
    };

    constructor(props) {
        super(props);
        this.state = {
            additionalActionsMenuAnchor : null,
        };
    }


    render() {
        const { t } = this.props;
        const { additionalActionsMenuAnchor } = this.state;

        return <span>
            <IconButton
                aria-owns={ additionalActionsMenuAnchor ? 'additional-actions-menu' : null}
                aria-haspopup="true"
                onClick={ ( event) => this.handleMenuClick(event, "additionalActionsMenuAnchor") }>
                <MoreVert />
            </IconButton>
            <Menu
                id="additional-actions-menu"
                anchorEl={ additionalActionsMenuAnchor }
                open={Boolean( additionalActionsMenuAnchor )}
                onClose={ () => this.handleMenuClose("additionalActionsMenuAnchor") }>
                <MenuItem onClick={ () => this.handleMenuClose("additionalActionsMenuAnchor") }>
                    { t('label.contentManager.contentPreview.copy') }
                </MenuItem>
                <MenuItem onClick={ () => this.handleMenuClose("additionalActionsMenuAnchor") }>
                    { t('label.contentManager.contentPreview.duplicate') }
                </MenuItem>
                { this.deleteMenuItem() }
            </Menu>
        </span>
    }

    deleteMenuItem() {
        const { t, selection, layoutQueryParams, rowSelectionFunc } = this.props;
        return <Mutation
            mutation={ deleteNode }
            refetchQueries={[{
                query: allContentQuery,
                variables: layoutQueryParams
            }]}>
            {(deleteNode, { data }) => {
                return <MenuItem onClick={ () => {
                    this.handleMenuClose("additionalActionsMenuAnchor");
                    deleteNode({ variables: { pathOrId: selection.path }}).then(() => {
                        rowSelectionFunc(selection);
                    }).catch((e) => console.error("Failed to delete", e));
                }
                }>
                    { t('label.contentManager.contentPreview.delete') }
                </MenuItem>
            }}
        </Mutation>
    }
}

export default translate()(withStyles(styles)(AdditionalMenuItems));

AdditionalMenuItems.propTypes = {
    selection: PropTypes.object.isRequired,
    layoutQueryParams: PropTypes.object.isRequired,
    rowSelectionFunc: PropTypes.func.isRequired
};