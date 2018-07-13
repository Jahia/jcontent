import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Mutation } from 'react-apollo';
import { translate } from "react-i18next";
import { withStyles, Button, MenuItem, Menu } from "@material-ui/core";
import {publishNode} from "./gqlMutations";

const styles = theme => ({
    button: {
        margin: theme.spacing.unit
    }
});

class PublishMenu extends Component {

    handleMenuClick(event, anchorType) {
        this.setState({ [anchorType]: event.currentTarget });
    };

    handleMenuClose(anchorType) {
        this.setState({ [anchorType]: null });
    };

    constructor(props) {
        super(props);
        this.state = {
            publishMenuAnchor : null,
        };
    }


    render() {
        const { t, classes } = this.props;
        const { publishMenuAnchor } = this.state;

        return <span>
            <Button
                className={ classes.button }
                variant="contained"
                size="medium"
                color="primary"
                aria-owns={ publishMenuAnchor ? 'publish-menu' : null}
                aria-haspopup="true"
                onClick={ ( event) => this.handleMenuClick(event, "publishMenuAnchor") }>
                { t('label.contentManager.contentPreview.publish') }
            </Button>
            <Menu
                id="publish-menu"
                anchorEl={ publishMenuAnchor }
                open={Boolean( publishMenuAnchor )}
                onClose={ () => this.handleMenuClose("publishMenuAnchor") }>
                { this.publicationMenuItem() }
                <MenuItem onClick={ () => this.handleMenuClose("publishMenuAnchor") }>
                    { t('label.contentManager.contentPreview.unpublish', { language: "English" } ) }
                </MenuItem>
            </Menu>
        </span>
    }

    publicationMenuItem() {
        const { t, selection, layoutQuery, layoutQueryParams } = this.props;
        //TODO pass a list of all available languages
        return <Mutation
            mutation={ publishNode }
            refetchQueries={[{
                query: layoutQuery,
                variables: layoutQueryParams
            }]}>
            {(publish) => {
                return <MenuItem onClick={ () => {
                    this.handleMenuClose("publishMenuAnchor");
                    publish({ variables: { pathOrId: selection.path, languages: ["en"] }});
                }
                }>
                    { t('label.contentManager.contentPreview.publishAll') }
                </MenuItem>
            }}
        </Mutation>
    }
}

export default translate()(withStyles(styles)(PublishMenu));

PublishMenu.propTypes = {
    selection: PropTypes.object.isRequired,
    layoutQuery: PropTypes.object.isRequired,
    layoutQueryParams: PropTypes.object.isRequired
};