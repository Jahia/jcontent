import React from 'react';
import {translate} from 'react-i18next';
import {
    Button,
    Card,
    CardActions,
    CardContent,
    IconButton,
    Toolbar,
    Tooltip,
    Typography,
    withStyles
} from '@material-ui/core';
import ContentPreview from '../preview/ContentPreview';
import {ChevronRight as ChevronRightIcon, Fullscreen, FullscreenExit} from '@material-ui/icons';
import {connect} from 'react-redux';
import {CM_DRAWER_STATES, cmSetPreviewMode, cmSetPreviewState} from '../redux/actions';
import {compose} from 'react-apollo';
import {buttonRenderer, DisplayActions, iconButtonRenderer} from '@jahia/react-material';
import PublicationInfo from './PublicationStatus';

const styles = theme => ({
    toolbar: {
        color: theme.palette.text.secondary,
        height: theme.contentManager.toolbarHeight + 'px',
        maxHeight: theme.contentManager.toolbarHeight + 'px',
        boxShadow: '0px 1px 2px rgba(54, 63, 69, 0.1), 0px 2px 2px rgba(54, 63, 69, 0.08)'
    },
    toolbarTitle: {
        flexGrow: 1
    },
    toolbarButtonBar: {
        marginRight: '24px'
    },
    card: {
        flex: 0,
        overflow: 'unset'
    },
    ellipsis: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden'
    }
});

class PreviewDrawer extends React.Component {
    render() {
        const {
            classes, previewMode, previewState, setPreviewMode, t, closePreview, openFullScreen, closeFullScreen, selection
        } = this.props;
        let selectedItem = selection[0];
        return (
            <React.Fragment>
                <Toolbar disableGutters classes={{root: classes.toolbar}}>
                    <IconButton color="inherit" onClick={closePreview}>
                        <ChevronRightIcon fontSize="small"/>
                    </IconButton>
                    <Typography variant="subtitle2" color="inherit" className={classes.toolbarTitle}>
                        {t('label.contentManager.contentPreview.preview')}
                    </Typography>

                    <div className={classes.toolbarButtonBar}>
                        <Button size="small"
                            variant="contained"
                            disabled={previewMode === 'edit'}
                            color="primary"
                            onClick={() => setPreviewMode('edit')}
                            >{t('label.contentManager.contentPreview.staging')}
                        </Button>
                        <Button size="small"
                            variant="contained"
                            disabled={previewMode === 'live'}
                            color="primary"
                            onClick={() => setPreviewMode('live')}
                            >{t('label.contentManager.contentPreview.live')}
                        </Button>
                        {previewState === CM_DRAWER_STATES.FULL_SCREEN ?
                            <Tooltip title={t('label.contentManager.contentPreview.collapse')}>
                                <IconButton color="inherit" onClick={closeFullScreen}>
                                    <FullscreenExit/>
                                </IconButton>
                            </Tooltip> :
                            <Tooltip title={t('label.contentManager.contentPreview.expand')}>
                                <IconButton color="inherit" onClick={openFullScreen}>
                                    <Fullscreen/>
                                </IconButton>
                            </Tooltip>
                        }
                    </div>
                </Toolbar>
                <ContentPreview/>
                <Card className={classes.card}>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2" className={classes.ellipsis}>
                            {selectedItem.displayName ? selectedItem.displayName : selectedItem.name}
                        </Typography>
                        <Typography component="p">
                            <PublicationInfo/>
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <DisplayActions target="previewFooterActions" context={{path: selectedItem.path}} render={iconButtonRenderer({color: 'primary'})}/>
                        <DisplayActions target="editPreviewBar" context={{path: selectedItem.path}} render={buttonRenderer({variant: 'contained', color: 'primary'})}/>
                    </CardActions>
                </Card>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        selection: state.selection,
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
