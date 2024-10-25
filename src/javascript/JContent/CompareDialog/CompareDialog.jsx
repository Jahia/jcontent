import React, {useEffect} from 'react';
import {Button, Reload, Edit, ChevronDown, ButtonGroup, Header, Loading} from '@jahia/moonstone';
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
import {useNodeInfo} from '@jahia/data-helper';

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
    const {node} = useNodeInfo({path});

    console.log('n', node);

    useEffect(() => {
        if (location.hash) {
            const o = decodeHashString(location.hash);
            if (o.jcontent && o.jcontent.compareDialog) {
                dispatch(compareStagingLiveSet(o.jcontent.compareDialog));
            }
        }
    }, [dispatch, location]);

    const publishAction = node?.['jnt:folder'] || node?.['jnt:contentFolder'] ? 'publishAll' : 'publish';

    return (
        <Dialog fullScreen open={open}>
            <Header title={t('jcontent:label.contentManager.actions.compareStagingToLive')}
                    mainActions={[
                        <div key="mainActions" className={styles.actionsRoot}>
                            <Button variant="ghost"
                                    size="big"
                                    className={styles.actionItem}
                                    icon={<Reload/>}
                                    label={t('Refresh')}
                                    onClick={() => dispatch(compareStagingLiveReload())}/>
                            <Button variant="outlined"
                                    size="big"
                                    color="accent"
                                    className={styles.actionItem}
                                    icon={<Edit/>}
                                    label={showHighlights ? t('Unhighlight') : t('Highlight')}
                                    onClick={() => dispatch(showHighlights ? compareStagingLiveHideHighlights() : compareStagingLiveShowHighlights())}/>
                            <ButtonGroup size="big" variant="default" color="accent" className={styles.actionItem}>
                                <DisplayAction isMediumLabel actionKey={publishAction} path={path} render={ButtonRendererShortLabel} buttonProps={{variant: 'default', size: 'big', color: 'accent'}}/>
                                <DisplayAction menuUseElementAnchor actionKey="publishMenu" path={path} render={ButtonRendererNoLabel} buttonProps={{variant: 'default', size: 'big', color: 'accent', icon: <ChevronDown/>}}/>
                            </ButtonGroup>
                        </div>
                    ]}/>
            <div className={styles.dialogContent}>
                {!node && <Loading size="big"/>}
                {node && <FrameManager/>}
            </div>
        </Dialog>
    );
};

export default CompareDialog;
