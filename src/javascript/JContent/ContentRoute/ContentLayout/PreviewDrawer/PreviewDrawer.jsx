import React from 'react';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';
import {Card, CardContent, Tooltip, withStyles} from '@material-ui/core';
import Preview from './Preview';
import {Button, ButtonGroup, Close, Typography} from '@jahia/moonstone';
import {Fullscreen, FullscreenExit} from '@material-ui/icons';
import {connect} from 'react-redux';
import {CM_DRAWER_STATES} from '~/JContent/JContent.redux';
import {compose} from '~/utils';
import PublicationStatus from './PublicationStatus';
import {cmSetPreviewMode, cmSetPreviewState} from '~/JContent/preview.redux';
import PreviewSize from './PreviewSize';
import clsx from 'clsx';

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
    },
    heading: {
        height: 'var(--spacing-big)',
        '& > *': {
            margin: 'var(--spacing-small)'
        }
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
            <div className={clsx(classes.heading, 'flexRow', 'alignCenter')}>
                <Button data-cm-role="preview-drawer-close"
                        variant="ghost"
                        icon={<Close/>}
                        onClick={closePreview}/>
                <Typography variant="subheading">
                    {t('jcontent:label.contentManager.contentPreview.preview')}
                </Typography>
                <div className="flexFluid"/>
                <ButtonGroup>
                    <Button disabled={effectiveMode === 'edit' || disabledEdit || disabledToggle}
                            data-cm-role="edit-preview-button"
                            label={t('jcontent:label.contentManager.contentPreview.staging')}
                            onClick={() => setPreviewMode('edit')}
                    />
                    <Button disabled={effectiveMode === 'live' || disabledLive || disabledToggle}
                            data-cm-role="live-preview-button"
                            label={t('jcontent:label.contentManager.contentPreview.live')}
                            onClick={() => setPreviewMode('live')}
                    />
                </ButtonGroup>
                {previewState === CM_DRAWER_STATES.FULL_SCREEN ?
                    <Tooltip title={t('jcontent:label.contentManager.contentPreview.collapse')}>
                        <Button variant="ghost"
                                icon={<FullscreenExit/>}
                                onClick={closeFullScreen}/>
                    </Tooltip> :
                    <Tooltip title={t('jcontent:label.contentManager.contentPreview.expand')}>
                        <Button variant="ghost"
                                icon={<Fullscreen/>}
                                onClick={openFullScreen}/>
                    </Tooltip>}
            </div>
            <Preview previewSelection={previewSelection} selection={selection} previewMode={effectiveMode} previewState={previewState}/>
            {previewSelection &&
            <Card>
                <CardContent data-cm-role="preview-name" className={classes.leftGutter}>
                    <Typography isNowrap variant="subheading">
                        {previewSelection.displayName ? previewSelection.displayName : previewSelection.name}
                    </Typography>
                    <Typography isNowrap variant="body">
                        <PreviewSize node={previewSelection} previewMode={effectiveMode}/>
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
