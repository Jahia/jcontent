import React from 'react';
import PropTypes from 'prop-types';
import { Query, Mutation } from 'react-apollo';
import { translate } from 'react-i18next';
import { withStyles, Paper, Grid, IconButton, Button, Menu, MenuItem, Dialog, Slide } from "@material-ui/core";
import { Share, Fullscreen, FullscreenExit, Lock, LockOpen, MoreVert } from "@material-ui/icons";
import { previewQuery, allContentQuery } from "./gqlQueries";
import { publishNode, deleteNode } from './gqlMutations';

function Transition(props) {
    return <Slide direction="left" {...props} />;
}


const styles = theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        transition: "left 0.5s ease 0s",
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
    previewContainerFullScreen: {
        top: "0!important",
        left: "0!important",
        height: "1000px!important"
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
            additionalActionsMenuAnchor: null,
            fullScreen: false
        };
        this.domNode = React.createRef();
    }

    handleMenuClick = (event, anchorType) => {
        this.setState({ [anchorType]: event.currentTarget });
    };

    handleMenuClose = (anchorType) => {
        this.setState({ [anchorType]: null });
    };

    handleDialogState = () => {
        this.setState({
            fullScreen: !this.state.fullScreen
        });
    };

    render() {
        if (!this.state.fullScreen) {
            return this.mainComponent();
        }
        return this.previewDialog(this.mainComponent());
    }

    mainComponent() {
        const { selection, classes, t } = this.props;
        const path = selection ? selection.path : "";
        return (
            <div className={ classes.root } ref={ this.domNode }>
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
                            { this.screenModeButtons() }
                        </Grid>
                        <Grid item xs={ 4 }>
                            <IconButton><Lock/></IconButton>
                        </Grid>
                        <Grid item xs={ 8 }>
                            <Button className={ classes.button }
                                    variant="contained"
                                    size="medium"
                                    color="primary"
                                    onClick={() => window.parent.editContent(selection.path, selection.name, ['jnt:content'], ['nt:base'])}>
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

    previewDialog(component) {
        return <Dialog
            fullScreen
            open={this.state.fullScreen}
            TransitionComponent={Transition}>
            { component }
        </Dialog>
    }

    screenModeButtons() {
        if (this.state.fullScreen) {
            return <IconButton onClick={ this.handleDialogState }><FullscreenExit/></IconButton>
        }
        return <IconButton onClick={ this.handleDialogState }><Fullscreen/></IconButton>
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
        const { t, selection, layoutQueryParams } = this.props;
        //TODO pass a list of all available languages
        return <Mutation
            mutation={ publishNode }
            refetchQueries={[{
                query: allContentQuery,
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

export default translate()(withStyles(styles)(ContentPreview));

ContentPreview.propTypes = {
    selection: PropTypes.object,
    layoutQueryParams: PropTypes.object.isRequired,
    rowSelectionFunc: PropTypes.func.isRequired
};