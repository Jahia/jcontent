import React from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {Card, CardContent, Tooltip} from '@material-ui/core';
import Preview from './Preview';
import {Button, Close, Maximize, Minimize, Typography} from '@jahia/moonstone';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {CM_DRAWER_STATES} from '~/JContent/redux/JContent.redux';
import {cmSetPreviewState} from '~/JContent/redux/preview.redux';
import PreviewSize from './PreviewSize';
import clsx from 'clsx';
import styles from './PreviewDrawer.scss';

const PreviewDrawer = ({previewSelection}) => {
    const {previewState, selection} = useSelector(state => ({
        previewState: state.jcontent.previewState,
        selection: state.jcontent.selection
    }), shallowEqual);
    const dispatch = useDispatch();

    const closePreview = () => {
        dispatch(cmSetPreviewState(CM_DRAWER_STATES.HIDE));
    };

    const openFullScreen = () => {
        dispatch(cmSetPreviewState(CM_DRAWER_STATES.FULL_SCREEN));
    };

    const closeFullScreen = () => {
        dispatch(cmSetPreviewState(CM_DRAWER_STATES.SHOW));
    };

    const {t} = useTranslation('jcontent');

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
            <Preview
                previewSelection={previewSelection}
                previewState={previewState}
                selection={selection}
            />
            {previewSelection &&
            <Card>
                <CardContent data-cm-role="preview-name" className={styles.leftGutter}>
                    <Typography isNowrap variant="subheading">
                        {previewSelection.displayName ? previewSelection.displayName : previewSelection.name}
                    </Typography>
                    <Typography isNowrap variant="body">
                        <PreviewSize node={previewSelection}/>
                    </Typography>
                </CardContent>
            </Card>}
        </React.Fragment>
    );
};

PreviewDrawer.propTypes = {
    previewSelection: PropTypes.object
};

export default PreviewDrawer;
