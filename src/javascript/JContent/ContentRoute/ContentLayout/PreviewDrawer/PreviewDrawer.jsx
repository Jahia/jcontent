import React from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';
import {AppBar, Card, CardContent, Grid, Toolbar, Tooltip, withStyles} from '@material-ui/core';
import {IconButton, Typography} from '@jahia/design-system-kit';
import {ToggleButton, ToggleButtonGroup} from '@material-ui/lab';
import Preview from './Preview';
import {Close, Fullscreen, FullscreenExit} from '@material-ui/icons';
import {connect} from 'react-redux';
import {CM_DRAWER_STATES} from '../../../JContent.redux';
import {compose} from '~/utils';
import PublicationStatus from './PublicationStatus';
import {cmSetPreviewMode, cmSetPreviewState} from '../../../preview.redux';

const styles = theme => ({
    leftButtons: {
        flex: 'auto',
        display: 'flex',
        justifyContent: 'flex-end',
        '& button': {
            margin: theme.spacing.unit
        }
    },
    leftGutter: {
        marginLeft: theme.spacing.unit * 2
    }
});

const PreviewDrawer = ({previewMode, previewState, setPreviewMode, t, closePreview, openFullScreen, closeFullScreen, previewSelection, selection, classes}) => {
    const notPublished = previewSelection && (previewSelection.aggregatedPublicationInfo.publicationStatus === 'NOT_PUBLISHED' || previewSelection.aggregatedPublicationInfo.publicationStatus === 'UNPUBLISHED' || previewSelection.aggregatedPublicationInfo.publicationStatus === 'MANDATORY_LANGUAGE_UNPUBLISHABLE');
    const deleted = previewSelection && previewSelection.aggregatedPublicationInfo.publicationStatus === 'MARKED_FOR_DELETION';
    const disabledToggle = !previewSelection;
    const disabledEdit = !previewSelection || deleted;
    const disabledLive = !previewSelection || notPublished;

    let effectiveMode = previewMode;
    if (disabledLive && previewMode !== 'edit') {
        effectiveMode = 'edit';
    } else if (disabledEdit && previewMode !== 'live') {
        effectiveMode = 'live';
    }

    return (
        <React.Fragment>
            <AppBar position="relative" color="default">
                <Toolbar variant="dense">
                    <IconButton data-cm-role="preview-drawer-close"
                                icon={<Close fontSize="small"/>}
                                onClick={closePreview}/>
                    <Typography variant="zeta" color="inherit">
                        {t('jcontent:label.contentManager.contentPreview.preview')}
                    </Typography>
                    <Grid container direction="row" justify="flex-end" alignContent="center" alignItems="center">
                        <ToggleButtonGroup exclusive
                                           value={disabledToggle ? '' : effectiveMode}
                                           onChange={(event, value) => setPreviewMode(value)}
                        >
                            <ToggleButton value="edit"
                                          disabled={effectiveMode === 'edit' || disabledEdit || disabledToggle}
                                          data-cm-role="edit-preview-button"
                            >
                                <Typography variant="caption" color="inherit">
                                    {t('jcontent:label.contentManager.contentPreview.staging')}
                                </Typography>
                            </ToggleButton>
                            <ToggleButton value="live"
                                          disabled={effectiveMode === 'live' || disabledLive || disabledToggle}
                                          data-cm-role="live-preview-button"
                            >
                                <Typography variant="caption" color="inherit">
                                    {t('jcontent:label.contentManager.contentPreview.live')}
                                </Typography>
                            </ToggleButton>
                        </ToggleButtonGroup>
                        {previewState === CM_DRAWER_STATES.FULL_SCREEN ?
                            <Tooltip title={t('jcontent:label.contentManager.contentPreview.collapse')}>
                                <IconButton variant="ghost"
                                            color="inherit"
                                            icon={<FullscreenExit/>}
                                            onClick={closeFullScreen}/>
                            </Tooltip> :
                            <Tooltip title={t('jcontent:label.contentManager.contentPreview.expand')}>
                                <IconButton variant="ghost"
                                            color="inherit"
                                            icon={<Fullscreen/>}
                                            onClick={openFullScreen}/>
                            </Tooltip>}
                    </Grid>
                </Toolbar>
            </AppBar>
            <Preview previewSelection={previewSelection} selection={selection} previewMode={effectiveMode} previewState={previewState}/>
            {previewSelection &&
            <Card>
                <CardContent data-cm-role="preview-name" className={classes.leftGutter}>
                    <Typography gutterBottom noWrap variant="gamma">
                        {previewSelection.displayName ? previewSelection.displayName : previewSelection.name}
                    </Typography>
                    <PublicationStatus previewSelection={previewSelection}/>
                </CardContent>
            </Card>}
        </React.Fragment>
    );
};

const mapStateToProps = state => {
    return {
        previewMode: state.jcontent.previewMode,
        previewState: state.jcontent.previewState,
        selection: state.jcontent.selection
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

PreviewDrawer.propTypes = {
    classes: PropTypes.object.isRequired,
    closeFullScreen: PropTypes.func.isRequired,
    closePreview: PropTypes.func.isRequired,
    openFullScreen: PropTypes.func.isRequired,
    previewMode: PropTypes.string.isRequired,
    selection: PropTypes.array.isRequired,
    previewSelection: PropTypes.object,
    previewState: PropTypes.number.isRequired,
    setPreviewMode: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired
};

export default compose(
    withTranslation(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(PreviewDrawer);
