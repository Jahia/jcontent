import React from 'react';
import PropTypes from 'prop-types';
import { Query, Mutation } from 'react-apollo';
import { translate } from 'react-i18next';
import { withStyles, Paper, Grid, IconButton, Button, Menu, MenuItem } from "@material-ui/core";
import { Share, Fullscreen, FullscreenExit, Lock, LockOpen, MoreVert } from "@material-ui/icons";
import { previewQuery } from "./gqlQueries";
import { publishNode, deleteNode } from './gqlMutations';

const styles = theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        flex: 1
    },
    button: {
        margin: theme.spacing.unit
    },
    previewPaper: {
        overflow: "auto",
        flex: 9
    },
    previewContainer: {
        overflow: "auto",
        padding: theme.spacing.unit * 2
    },
    controlsPaper: {
        flex: 3,
        maxHeight: "150px",
        backgroundColor: "#555",
        opacity: 0.9
    },
    titleBar: {
        color: "whitesmoke",
        padding: theme.spacing.unit,
        minHeight: "100px"
    }
});

class ContentPreview extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            publishMenuAnchor : null,
            additionalActionsMenuAnchor: null
        }
    }

    handleMenuClick = (event, anchorType) => {
        this.setState({ [anchorType]: event.currentTarget });
    };

    handleMenuClose = (anchorType) => {
        this.setState({ [anchorType]: null });
    };

    render() {
        const { selection, classes, t } = this.props;
        const path = selection ? selection.path : "";
        console.log(selection);

        return (
            <div className={ classes.root }>
                <Paper className={ classes.previewPaper } elevation={ 0 }>
                    <Query fetchPolicy={'network-only'} query={ previewQuery } variables={{path: path}}>
                        {({loading, error, data}) => {
                            return this.previewComponent(data);
                        }}
                    </Query>
                </Paper>
                <Paper className={ classes.controlsPaper } elevation={ 0 }>
                    <Grid container spacing={0}>
                        <Grid item xs={ 10 } className={ classes.titleBar }>
                            <div>{ selection.displayName ? selection.displayName : selection.name }</div>
                            <div>{ selection.lastPublished }</div>
                        </Grid>
                        <Grid item xs={ 2 }>
                            <IconButton><Share/></IconButton>
                            <IconButton><Fullscreen/></IconButton>
                        </Grid>
                        <Grid item xs={ 4 }>
                            <IconButton><Lock/></IconButton>
                        </Grid>
                        <Grid item xs={ 8 }>
                            <Button className={ classes.button } variant="contained" size="medium" color="primary" >
                                {t('label.contentManager.contentPreview.edit')}
                            </Button>
                            <Button className={ classes.button } variant="contained" size="medium" color="primary" >
                                {t('label.contentManager.contentPreview.translate')}
                            </Button>
                            { this.publishMenu() }
                            { this.additionalActionsMenu() }
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        );
    }

    previewComponent(data) {
        const { classes, t } = this.props;
        const displayValue = data && data.jcr ? data.jcr.nodeByPath.renderedContent.output : t('label.contentManager.contentPreview.emptyMessage');
        return <div className={ classes.previewContainer } dangerouslySetInnerHTML={{__html: displayValue}} />
    }

    publishMenu() {
        const { t, classes } = this.props;
        const { publishMenuAnchor } = this.state;
        //TODO get language from context
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
        const { t, selection } = this.props;
        return <Mutation mutation={ publishNode }>
            {(publish) => {
                return <MenuItem onClick={ () => {
                        this.handleMenuClose("publishMenuAnchor");
                        publish({ variables: { pathOrId: selection.path }});
                    }
                }>
                    { t('label.contentManager.contentPreview.publishAll') }
                </MenuItem>
            }}
        </Mutation>
    }

    additionalActionsMenu() {
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
        const { t, selection } = this.props;
        return <Mutation mutation={ deleteNode }>
            {(deleteNode) => {
                return <MenuItem onClick={ () => {
                    this.handleMenuClose("additionalActionsMenuAnchor");
                    deleteNode({ variables: { pathOrId: selection.path }});
                }
                }>
                    { t('label.contentManager.contentPreview.delete') }
                </MenuItem>
            }}
        </Mutation>
    }
}

export default translate()(withStyles(styles)(ContentPreview));

ContentPreview.propTypes = {
    selection: PropTypes.object
};