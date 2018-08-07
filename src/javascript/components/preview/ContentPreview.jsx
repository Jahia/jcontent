import React from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import { translate } from 'react-i18next';
import { withStyles, Paper, Grid, IconButton, Button, Dialog, Slide } from "@material-ui/core";
import { Share, Fullscreen, FullscreenExit, Lock, LockOpen, MoreVert } from "@material-ui/icons";
import { previewQuery } from "./gqlQueries";
import PublicationInfo from './PublicationStatus';
import ShareMenu from './ShareMenu';
import Actions from "../Actions";
import CmButton from "../renderAction/CmButton";
import CmIconButton from "../renderAction/CmIconButton";

function Transition(props) {
    return <Slide direction="left" {...props} />;
}

const styles = theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        transition: "left 0.5s ease 0s",
        maxWidth: 650
    },
    button: {
        margin: theme.spacing.unit
    },
    previewPaper: {
        overflow: "auto",
        flex: 9
    },
    previewContainer: {
        maxHeight: 1150, //Fix scroll issue on firefox TODO find better solution, only works for 25 results
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
    },
    contentTitle : {
        fontWeight: 500,
        padding: theme.spacing.unit
    }
});

class ContentPreview extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            additionalActionsMenuAnchor: null,
            fullScreen: false
        };
    }

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
        const { selection, classes, t, layoutQuery, layoutQueryParams, rowSelectionFunc } = this.props;
        const path = selection ? selection.path : "";
        return (
            <div className={ classes.root } >
                <Paper className={ classes.previewPaper } elevation={ 0 }>
                    <Query query={ previewQuery } variables={{path: path}}>
                        {({loading, error, data}) => {
                            return this.previewComponent(data);
                        }}
                    </Query>
                </Paper>
                <Paper className={ classes.controlsPaper } elevation={ 0 }>
                    <Grid container spacing={0}>
                        <Grid item xs={ 10 } className={ classes.titleBar }>
                            <div className={ classes.contentTitle }>{ selection.displayName ? selection.displayName : selection.name }</div>
                            <PublicationInfo selection={ selection }/>
                        </Grid>
                        <Grid item xs={ 2 }>
                            <ShareMenu selection={ selection }/>
                            { this.screenModeButtons() }
                        </Grid>
                        <Grid item xs={ 4 }>
                            <IconButton><Lock/></IconButton>
                        </Grid>
                        <Grid item xs={ 8 }>
                            <Actions menuId={"previewBar"} name={selection.name} path={selection.path}>
                                {(props) => <CmButton {...props}/>}
                            </Actions>
                            <Actions menuId={"additionalMenu"} name={selection.name} path={selection.path}>
                                {(props) => <CmIconButton {...props}/>}
                            </Actions>
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        );
    }

    previewComponent(data) {
        const { classes, t } = this.props;
        let displayValue = data && data.jcr ? data.jcr.nodeByPath.renderedContent.output : t('label.contentManager.contentPreview.emptyMessage');

        if (displayValue === "") {
            displayValue = t('label.contentManager.contentPreview.noViewAvailable');
        }

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
}

export default translate()(withStyles(styles)(ContentPreview));

ContentPreview.propTypes = {
    selection: PropTypes.object,
    layoutQuery: PropTypes.object.isRequired,
    layoutQueryParams: PropTypes.object.isRequired,
    rowSelectionFunc: PropTypes.func.isRequired
};