import React from 'react';
import {translate} from 'react-i18next';
import {
    AppBar,
    Card,
    CardActions,
    CardContent,
    Grid,
    IconButton,
    Toolbar,
    Tooltip,
    Typography,
    withStyles
} from '@material-ui/core';
import {ToggleButton, ToggleButtonGroup} from '@material-ui/lab';
import ContentPreview from '../preview/ContentPreview';
import {ChevronRight as ChevronRightIcon, Fullscreen, FullscreenExit} from '@material-ui/icons';
import {connect} from 'react-redux';
import {CM_DRAWER_STATES, cmSetPreviewMode, cmSetPreviewState} from '../redux/actions';
import {compose} from 'react-apollo';
import {buttonRenderer, DisplayAction, DisplayActions, iconButtonRenderer} from '@jahia/react-material';
import PublicationStatus from './PublicationStatus';

const styles = theme => ({
    leftButtons: {
        flex: 'auto',
        display: 'flex',
        justifyContent: 'flex-end',
        '& button': {
            margin: theme.spacing.unit
        }
    }
});

class PreviewDrawer extends React.Component {
    render() {
        const {previewMode, previewState, setPreviewMode, t, closePreview, openFullScreen, closeFullScreen, selection, classes} = this.props;
        const disabledLive = selection.publicationStatus === 'NOT_PUBLISHED';
        return (
            <React.Fragment>
                <AppBar position="relative" color="default">
                    <Toolbar variant="dense">
                        <IconButton color="inherit" onClick={closePreview}>
                            <ChevronRightIcon fontSize="small"/>
                        </IconButton>
                        <Typography variant="subtitle2" color="inherit">
                            {t('label.contentManager.contentPreview.preview')}
                        </Typography>
                        <Grid container direction="row" justify="flex-end" alignContent="center" alignItems="center">
                            <ToggleButtonGroup exclusive
                                               value={previewMode}
                                               onChange={() => setPreviewMode(previewMode === 'live' ? 'edit' : 'live')}
                            >
                                <ToggleButton value="edit">
                                    <Typography variant="caption" color="inherit">
                                        {t('label.contentManager.contentPreview.staging')}
                                    </Typography>
                                </ToggleButton>
                                <ToggleButton value="live" disabled={disabledLive}>
                                    <Typography variant="caption" color="inherit">
                                        {t('label.contentManager.contentPreview.live')}
                                    </Typography>
                                </ToggleButton>
                            </ToggleButtonGroup>
                            {previewState === CM_DRAWER_STATES.FULL_SCREEN ?
                                <Tooltip title={t('label.contentManager.contentPreview.collapse')}>
                                    <IconButton color="primary" onClick={closeFullScreen}>
                                        <FullscreenExit/>
                                    </IconButton>
                                </Tooltip> :
                                <Tooltip title={t('label.contentManager.contentPreview.expand')}>
                                    <IconButton color="primary" onClick={openFullScreen}>
                                        <Fullscreen/>
                                    </IconButton>
                                </Tooltip>
                            }
                        </Grid>
                    </Toolbar>
                </AppBar>
                <ContentPreview selection={selection}/>
                {selection &&
                    <Card>
                        <CardContent>
                            <Typography gutterBottom noWrap variant="h5" component="h2" color="textPrimary">
                                {selection.displayName ? selection.displayName : selection.name}
                            </Typography>
                            <PublicationStatus selection={selection}/>
                        </CardContent>
                        <CardActions disableActionSpacing={false}>
                            <DisplayActions target="previewFooterActions"
                                            context={{path: selection.path}}
                                            render={iconButtonRenderer({disableRipple: true, color: 'primary'}, true)}/>
                            <div className={classes.leftButtons}>
                                <DisplayAction actionKey="edit"
                                               context={{path: selection.path}}
                                               render={buttonRenderer({variant: 'contained', size: 'small'})}/>
                                <DisplayAction actionKey="publishMenu"
                                               context={{path: selection.path}}
                                               render={buttonRenderer({variant: 'contained', color: 'primary', size: 'small'})}/>
                            </div>
                        </CardActions>
                    </Card>
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        previewMode: state.previewMode,
        previewState: state.previewState
    };
};

const mapDispatchToProps = dispatch => ({
    setPreviewMode: mode => {
        dispatch(cmSetPreviewMode(mode));
    },
    closePreview: () => {
        dispatch(cmSetPreviewState(CM_DRAWER_STATES.HIDE));
    },
    openFullScreen: () => {
        dispatch(cmSetPreviewState(CM_DRAWER_STATES.FULL_SCREEN));
    },
    closeFullScreen: () => {
        dispatch(cmSetPreviewState(CM_DRAWER_STATES.SHOW));
    }
});

PreviewDrawer.propTypes = {};

export default compose(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(PreviewDrawer);
