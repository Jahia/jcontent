import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Card, CardContent, Tooltip} from '@material-ui/core';
import Preview from './Preview';
import {Button, ButtonGroup, Close, Maximize, Minimize, Typography} from '@jahia/moonstone';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {CM_DRAWER_STATES} from '~/JContent/JContent.redux';
import PublicationStatus from './PublicationStatus';
import {cmSetPreviewMode, cmSetPreviewState} from '~/JContent/preview.redux';
import PreviewSize from './PreviewSize';
import clsx from 'clsx';
import styles from './PreviewDrawer.scss';

const PreviewDrawer = ({previewSelection}) => {
    const {previewMode, previewState, selection} = useSelector(state => ({
        previewMode: state.jcontent.previewMode,
        previewState: state.jcontent.previewState,
        selection: state.jcontent.selection
    }), shallowEqual);
    const dispatch = useDispatch();
    const setPreviewMode = mode => {
        dispatch(cmSetPreviewMode(mode));
    };

    const closePreview = () => {
        dispatch(cmSetPreviewState(CM_DRAWER_STATES.HIDE));
    };

    const openFullScreen = () => {
        dispatch(cmSetPreviewState(CM_DRAWER_STATES.FULL_SCREEN));
    };

    const closeFullScreen = () => {
        dispatch(cmSetPreviewState(CM_DRAWER_STATES.SHOW));
    };

    const notPublished = previewSelection && (previewSelection.aggregatedPublicationInfo.publicationStatus === 'NOT_PUBLISHED' || previewSelection.aggregatedPublicationInfo.publicationStatus === 'UNPUBLISHED' || previewSelection.aggregatedPublicationInfo.publicationStatus === 'MANDATORY_LANGUAGE_UNPUBLISHABLE');
    const deleted = previewSelection && previewSelection.aggregatedPublicationInfo.publicationStatus === 'MARKED_FOR_DELETION';
    const disabledToggle = !previewSelection;
    const disabledEdit = !previewSelection || deleted;
    const disabledLive = !previewSelection || notPublished;

    const {t} = useTranslation();

    let effectiveMode = previewMode;
    if (disabledLive && previewMode !== 'edit') {
        effectiveMode = 'edit';
    } else if (disabledEdit && previewMode !== 'live') {
        effectiveMode = 'live';
    }

    return (
        <React.Fragment>
            <div className={clsx(styles.heading, 'flexRow', 'alignCenter')}>
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
                                icon={<Minimize/>}
                                onClick={closeFullScreen}/>
                    </Tooltip> :
                    <Tooltip title={t('jcontent:label.contentManager.contentPreview.expand')}>
                        <Button variant="ghost"
                                icon={<Maximize/>}
                                onClick={openFullScreen}/>
                    </Tooltip>}
            </div>
            <Preview previewSelection={previewSelection} selection={selection} previewMode={effectiveMode} previewState={previewState}/>
            {previewSelection &&
            <Card>
                <CardContent data-cm-role="preview-name" className={styles.leftGutter}>
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

PreviewDrawer.propTypes = {
    previewSelection: PropTypes.object
};

export default PreviewDrawer;
