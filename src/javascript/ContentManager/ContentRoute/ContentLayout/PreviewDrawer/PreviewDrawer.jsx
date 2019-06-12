import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {
    AppBar,
    Card,
    CardActions,
    CardContent,
    Grid,
    Toolbar,
    Tooltip,
    withStyles
} from '@material-ui/core';
import {Typography, IconButton} from '@jahia/design-system-kit';
import {ToggleButton, ToggleButtonGroup} from '@material-ui/lab';
import Preview from './Preview';
import {Close, Fullscreen, FullscreenExit} from '@material-ui/icons';
import {connect} from 'react-redux';
import {CM_DRAWER_STATES} from '../../../ContentManager.redux-actions';
import {compose} from 'react-apollo';
import {DisplayAction, DisplayActions, iconButtonRenderer} from '@jahia/react-material';
import PublicationStatus from './PublicationStatus';
import * as _ from 'lodash';
import {cmSetPreviewMode, cmSetPreviewState} from '../../../preview.redux-actions';

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

export class PreviewDrawer extends React.Component {
    componentDidUpdate() {
        // Set preview mode to 'edit' when content is never published/unpublished
        if (this.props.previewMode !== 'edit' && this.props.previewSelection && (this.props.previewSelection.publicationStatus === 'NOT_PUBLISHED' || this.props.previewSelection.publicationStatus === 'UNPUBLISHED')) {
            this.props.setPreviewMode('edit');
        }
    }

    render() {
        const {previewMode, previewState, setPreviewMode, t, closePreview, openFullScreen, closeFullScreen, previewSelection, classes} = this.props;
        const disabledToggle = !previewSelection;
        const disabledLive = !previewSelection || previewSelection.aggregatedPublicationInfo.publicationStatus === 'NOT_PUBLISHED' || previewSelection.aggregatedPublicationInfo.publicationStatus === 'UNPUBLISHED' || previewSelection.aggregatedPublicationInfo.publicationStatus === 'MANDATORY_LANGUAGE_UNPUBLISHABLE';
        return (
            <React.Fragment>
                <AppBar position="relative" color="default">
                    <Toolbar variant="dense">
                        <IconButton data-cm-role="preview-drawer-close" icon={<Close fontSize="small"/>} onClick={closePreview}/>
                        <Typography variant="zeta" color="inherit">
                            {t('label.contentManager.contentPreview.preview')}
                        </Typography>
                        <Grid container direction="row" justify="flex-end" alignContent="center" alignItems="center">
                            <ToggleButtonGroup exclusive
                                               value={disabledToggle ? '' : previewMode}
                                               onChange={(event, value) => setPreviewMode(value)}
                            >
                                <ToggleButton value="edit" disabled={previewMode === 'edit' || disabledToggle} data-cm-role="edit-preview-button">
                                    <Typography variant="caption" color="inherit">
                                        {t('label.contentManager.contentPreview.staging')}
                                    </Typography>
                                </ToggleButton>
                                <ToggleButton value="live" disabled={previewMode === 'live' || disabledLive} data-cm-role="live-preview-button">
                                    <Typography variant="caption" color="inherit">
                                        {t('label.contentManager.contentPreview.live')}
                                    </Typography>
                                </ToggleButton>
                            </ToggleButtonGroup>
                            {previewState === CM_DRAWER_STATES.FULL_SCREEN ?
                                <Tooltip title={t('label.contentManager.contentPreview.collapse')}>
                                    <IconButton variant="ghost" color="inherit" icon={<FullscreenExit/>} onClick={closeFullScreen}/>
                                </Tooltip> :
                                <Tooltip title={t('label.contentManager.contentPreview.expand')}>
                                    <IconButton variant="ghost" color="inherit" icon={<Fullscreen/>} onClick={openFullScreen}/>
                                </Tooltip>
                            }
                        </Grid>
                    </Toolbar>
                </AppBar>
                <Preview previewSelection={previewSelection}/>
                {previewSelection &&
                    <Card>
                        <CardContent data-cm-role="preview-name" className={classes.leftGutter}>
                            <Typography gutterBottom noWrap variant="gamma">
                                {previewSelection.displayName ? previewSelection.displayName : previewSelection.name}
                            </Typography>
                            <PublicationStatus previewSelection={previewSelection}/>
                        </CardContent>
                        <CardActions disableActionSpacing={false}>
                            <div className={classes.leftButtons}>
                                <DisplayActions
                                    target="contentActions"
                                    filter={value => {
                                        return _.includes(['edit', 'publishMenu'], value.key);
                                    }}
                                    context={{path: previewSelection.path}}
                                    render={iconButtonRenderer({disableRipple: true}, {}, true)}
                                />
                                <DisplayAction
                                    actionKey="contentMenu"
                                    context={{
                                        path: previewSelection.path,
                                        menuFilter: value => {
                                            return !_.includes(['edit', 'publishMenu', 'preview'], value.key);
                                        }
                                    }}
                                    render={iconButtonRenderer({disableRipple: true}, {}, true)}
                                />
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

PreviewDrawer.propTypes = {
    classes: PropTypes.object.isRequired,
    closeFullScreen: PropTypes.func.isRequired,
    closePreview: PropTypes.func.isRequired,
    openFullScreen: PropTypes.func.isRequired,
    previewMode: PropTypes.string.isRequired,
    previewSelection: PropTypes.object,
    previewState: PropTypes.number.isRequired,
    setPreviewMode: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired
};

export default compose(
    translate(),
    withStyles(styles),
    connect(mapStateToProps, mapDispatchToProps)
)(PreviewDrawer);
