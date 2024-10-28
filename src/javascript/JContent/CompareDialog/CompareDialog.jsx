import React, {useEffect} from 'react';
import {Button, Reload, Edit, ChevronDown, ButtonGroup, Header} from '@jahia/moonstone';
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
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '../../utils/getButtonRenderer';

const ButtonRendererNoLabel = getButtonRenderer({labelStyle: 'none', defaultButtonProps: {size: 'big'}});
const ButtonRendererShortLabel = getButtonRenderer({labelStyle: 'short', defaultButtonProps: {size: 'big'}});

const CompareDialog = () => {
    const {t} = useTranslation('jcontent');
    const location = useLocation();
    const dispatch = useDispatch();
    const {open, showHighlights, path} = useSelector(state => ({
        open: state.jcontent.compareStagingAndLive.open,
        showHighlights: state.jcontent.compareStagingAndLive.showHighlights,
        path: state.jcontent.compareStagingAndLive.path
    }), shallowEqual);

    useEffect(() => {
        if (location.hash) {
            const o = decodeHashString(location.hash);
            if (o.jcontent && o.jcontent.compareDialog) {
                dispatch(compareStagingLiveSet(o.jcontent.compareDialog));
            }
        }
    }, [dispatch, location]);

    if (!open) {
        return null;
    }

    return (
        <Dialog fullScreen open={open}>
            <Header className={styles.header}
                    title={t('jcontent:label.contentManager.actions.compareStagingToLive')}
                    mainActions={[
                        <div key="mainActions" className={styles.actionsRoot}>
                            <Button variant="ghost"
                                    size="big"
                                    data-sel-role="refresh"
                                    className={styles.actionItem}
                                    icon={<Reload/>}
                                    label={t('jcontent:label.contentManager.refresh')}
                                    onClick={() => dispatch(compareStagingLiveReload())}/>
                            <Button variant="outlined"
                                    size="big"
                                    color="accent"
                                    data-sel-role="highlight"
                                    className={styles.actionItem}
                                    icon={<Edit/>}
                                    label={showHighlights ? t('Unhighlight') : t('Highlight')}
                                    onClick={() => dispatch(showHighlights ? compareStagingLiveHideHighlights() : compareStagingLiveShowHighlights())}/>
                            <ButtonGroup size="big" variant="default" color="accent" className={styles.actionItem}>
                                <DisplayAction isMediumLabel actionKey="publish" path={path} render={ButtonRendererShortLabel} buttonProps={{variant: 'default', size: 'big', color: 'accent'}}/>
                                <DisplayAction menuUseElementAnchor actionKey="publishMenu" path={path} render={ButtonRendererNoLabel} buttonProps={{variant: 'default', size: 'big', color: 'accent', icon: <ChevronDown/>}}/>
                            </ButtonGroup>
                        </div>
                    ]}/>
            <div className={styles.dialogContent}>
                <FrameManager/>
            </div>
        </Dialog>
    );
};

export default CompareDialog;
