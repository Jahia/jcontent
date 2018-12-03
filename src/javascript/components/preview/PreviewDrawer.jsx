import React from 'react';
import {translate} from 'react-i18next';
import {Button, IconButton, Toolbar, Tooltip, Typography, withStyles} from '@material-ui/core';
import classNames from 'classnames';
import ContentPreview from '../preview/ContentPreview';
import {ChevronRight as ChevronRightIcon, Fullscreen, FullscreenExit} from '@material-ui/icons';
import {connect} from 'react-redux';
import {CM_DRAWER_STATES, cmSetPreviewMode, cmSetPreviewState} from '../redux/actions';
import {compose} from 'react-apollo';

const styles = theme => ({
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: theme.palette.common.white,
        justifyContent: 'space-between',
        padding: '0 8px',
        ...theme.mixins.toolbar
    },
    previewModePaper: {
        background: 'transparent'
    },
    liveButton: {
        '&:disabled': {
            opacity: '.4',
            color: '#F5F5F5',
            backgroundColor: '#686c6f'
        },
        margin: '0 0',
        boxShadow: 'none'
    },
    editButton: {
        margin: '0 0',
        boxShadow: 'none'
    },
    inactiveButton: {
        backgroundColor: '#686c6f',
        color: '#F5F5F5',
        '&:hover': {
            backgroundColor: '#686c6f'
        }
    },
    modalWidth: {
        width: 0,
        position: 'unset',
        overflow: 'hidden!important'
    },
    modalTransition: {
        transition: '.55s cubic-bezier(0, 0, 0.2, 1) 0ms!important',
        width: 550,
        top: String(theme.contentManager.topBarHeight) + 'px!important',
        right: '41px!important'
    },
    drawerTableHead: {
        maxHeight: '28px',
        minHeight: '28px',
        color: '#585757',
        height: '28px'
    },
    drawerTableCell: {
        maxWidth: '50px',
        padding: 0
    },
    insideCell: {
        display: 'inline',
        fontWeight: 700,
        fontSize: '0.75rem',
        color: '#5E6565',
        flexGrow: 1
    },
    drawerWidth: {
        overflow: 'hidden!important',
        transitionDuration: '.3s',
        boxShadow: 'none',
        color: theme.palette.background.paper,
        backgroundColor: theme.palette.common.white,
        height: 'calc(100vh - ' + theme.contentManager.topBarHeight + 'px)',
        maxHeight: 'calc(100vh - ' + theme.contentManager.topBarHeight + 'px)'
    },
    drawerFullScreen: {
        top: '0px!important',
        transitionDuration: '.3s',
        width: '100%',
        boxShadow: 'none',
        color: theme.palette.background.paper,
        backgroundColor: theme.palette.common.white,
        right: '0px!important',
        height: '100vh',
        maxHeight: '100vh'
    },
    grow: {
        flexGrow: 1
    },
    buttonStyle: {
        padding: '0px',
        margin: '0px',
        fontSize: '0.875rem',
        height: '22px!important',
        minHeight: '22px!important',
        maxHeight: '22px!important'
    },
    chevron: {
        color: '#5E6565' // Color is not in the theme
    },
    toolbar: {
        minHeight: theme.contentManager.toolbarHeight + 'px!important',
        maxHeight: theme.contentManager.toolbarHeight + 'px'
    }
});

class PreviewDrawer extends React.Component {
    render() {
        const {
            classes, previewMode, previewState, setPreviewMode, t, closePreview, openFullScreen, closeFullScreen
        } = this.props;
        return (
            <React.Fragment>
                <Toolbar className={classes.toolbar}>
                    <IconButton color="inherit" style={{padding: 0, marginRight: 10}}
                        onClick={closePreview}
                        >
                        <ChevronRightIcon className={classes.chevron} fontSize="small"/>
                    </IconButton>
                    <Typography variant="subtitle2">
                        {t('label.contentManager.contentPreview.preview')}
                    </Typography>
                    <div style={{display: 'inline', textAlign: 'right', marginRight: '5px'}}>
                        {previewState === CM_DRAWER_STATES.FULL_SCREEN ?
                            <Tooltip title={t('label.contentManager.contentPreview.collapse')}>
                                <FullscreenExit className={classes.colorIcon} onClick={closeFullScreen}/>
                            </Tooltip> :
                            <Tooltip title={t('label.contentManager.contentPreview.expand')}>
                                <Fullscreen className={classes.colorIcon} onClick={openFullScreen}/>
                            </Tooltip>
                        }
                        <Button
                            variant="contained"
                            className={classNames(classes.editButton, {
                                [classes.inactiveButton]: previewMode !== 'edit'
                            })}

                            classes={{
                                root: classes.buttonStyle
                            }}
                            color={previewMode === 'edit' ? 'primary' : 'default'}
                            onClick={() => setPreviewMode('edit')}
                            >{t('label.contentManager.contentPreview.staging')}
                        </Button>
                        <Button
                            className={classNames(classes.liveButton, {
                                [classes.inactiveButton]: previewMode !== 'live'
                            })}
                            classes={{
                                root: classes.buttonStyle
                            }}
                            variant="contained"
                            color={previewMode === 'live' ? 'primary' : 'default'}
                            onClick={() => setPreviewMode('live')}
                            >{t('label.contentManager.contentPreview.live')}
                        </Button>
                    </div>
                </Toolbar>
                <ContentPreview/>
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
