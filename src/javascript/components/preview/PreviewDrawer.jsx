import React from 'react';
import {translate} from 'react-i18next';
import {
    AppBar,
    Card,
    CardActions,
    CardContent,
    IconButton,
    Toolbar,
    Tooltip,
    Typography,
    Grid
} from '@material-ui/core';
import {ToggleButton, ToggleButtonGroup} from '@material-ui/lab';
import ContentPreview from '../preview/ContentPreview';
import {ChevronRight as ChevronRightIcon, Fullscreen, FullscreenExit} from '@material-ui/icons';
import {connect} from 'react-redux';
import {CM_DRAWER_STATES, cmSetPreviewMode, cmSetPreviewState} from '../redux/actions';
import {compose} from 'react-apollo';
import {buttonRenderer, DisplayActions, iconButtonRenderer} from '@jahia/react-material';
import PublicationInfo from './PublicationStatus';

class PreviewDrawer extends React.Component {
    render() {
        const {previewMode, previewState, setPreviewMode, t, closePreview, openFullScreen, closeFullScreen, selection} = this.props;
        let selectedItem = selection[0];
        return (
            <React.Fragment>
                <AppBar position="relative">
                    <Toolbar variant="dense">
                        <IconButton color="inherit" onClick={closePreview}>
                            <ChevronRightIcon fontSize="small"/>
                        </IconButton>
                        <Typography variant="subtitle2" color="inherit">
                            {t('label.contentManager.contentPreview.preview')}
                        </Typography>
                        <Grid container direction="row" justify="flex-end" alignContent="center" alignItems="center">
                            <ToggleButtonGroup exclusive
                                               value={previewMode === 'edit' ? 'live' : 'edit'}
                                               onChange={event => setPreviewMode(event.target.textContent === 'Staging' ? 'edit' : 'live')}
                            >
                                <ToggleButton value="edit">
                                    <Typography variant="caption">
                                        {t('label.contentManager.contentPreview.staging')}
                                    </Typography>
                                </ToggleButton>
                                <ToggleButton value="live">
                                    <Typography variant="caption">
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
                <ContentPreview/>
                <Card>
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            {selectedItem.displayName ? selectedItem.displayName : selectedItem.name}
                        </Typography>
                        <PublicationInfo/>
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
    connect(mapStateToProps, mapDispatchToProps)
)(PreviewDrawer);
