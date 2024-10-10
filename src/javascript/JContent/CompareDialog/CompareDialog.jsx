import React, {useEffect} from 'react';
import {Button, Close, Typography} from '@jahia/moonstone';
import {Dialog} from '@material-ui/core';
import {useTranslation} from 'react-i18next';
import styles from './CompareDialog.scss';
import FrameManager from './FrameManager';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {
    compareStagingLiveHideHighlights,
    compareStagingLiveReload, compareStagingLiveSet,
    compareStagingLiveShowHighlights
} from '../redux/compareStagingAndLive.redux';
import {useLocation} from 'react-router-dom';
import {decodeHashString} from './util';

const CompareDialog = () => {
    const {t} = useTranslation('jcontent');
    const location = useLocation();
    const dispatch = useDispatch();
    const {open, showHighlights} = useSelector(state => ({open: state.jcontent.compareStagingAndLive.open, showHighlights: state.jcontent.compareStagingAndLive.showHighlights}), shallowEqual);

    useEffect(() => {
        if (location.hash) {
            const o = decodeHashString(location.hash);
            if (o.jcontent && o.jcontent.compareDialog) {
                dispatch(compareStagingLiveSet(o.jcontent.compareDialog));
            }
        }
    }, [dispatch, location]);

    return (
        <Dialog fullScreen open={open} style={{background: 'grey'}}>
            <div className={styles.dialogTitle}>
                <Typography isUpperCase variant="subheading">
                    {t('Compare staging and live')}
                </Typography>
                <Button variant="outlined"
                        size="big"
                        icon={<Close/>}
                        label={t('Show highlights')}
                        onClick={() => dispatch(showHighlights ? compareStagingLiveHideHighlights() : compareStagingLiveShowHighlights())}/>
                <Button variant="outlined"
                        size="big"
                        icon={<Close/>}
                        label={t('Reload')}
                        onClick={() => dispatch(compareStagingLiveReload())}/>
            </div>
            <div className={styles.dialogContent}>
                <FrameManager/>
            </div>
        </Dialog>
    );
};

export default CompareDialog;
