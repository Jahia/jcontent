import React from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import JContentConstants from '~/JContent/JContent.constants';
import SearchControlBar from './SearchControlBar';
import BrowseControlBar from './BrowseControlBar';
import {DisplayAction, DisplayActions} from '@jahia/ui-extender';
import {useTranslation} from 'react-i18next';
import {ButtonRenderer, ButtonRendererNoLabel, ButtonRendererShortLabel} from '~/utils/getButtonRenderer';
import styles from './ToolBar.scss';
import {Button, ButtonGroup, Cancel, Separator, Typography} from '@jahia/moonstone';
import {cmClearSelection} from '~/JContent/redux/selection.redux';
import {useNodeInfo} from '@jahia/data-helper';
import {CM_DRAWER_STATES} from '~/JContent/redux/JContent.redux';
import {cmSetPreviewState} from '~/JContent/redux/preview.redux';

export const ToolBar = () => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();

    const {mode, selection, previewSelection} = useSelector(state => ({
        mode: state.jcontent.mode,
        selection: state.jcontent.selection,
        previewSelection: state.jcontent.previewState === CM_DRAWER_STATES.SHOW && state.jcontent.previewSelection
    }), shallowEqual);

    const {nodes, loading} = useNodeInfo({paths: selection}, {getIsNodeTypes: ['jnt:page', 'jnt:contentFolder', 'jnt:folder']});

    let publishAction;
    if (!loading) {
        const canPublish = nodes && nodes.map(n => n['jnt:page'] || !(n['jnt:contentFolder'] || n['jnt:folder'])).reduce((v, a) => v && a, true);
        publishAction = canPublish ? 'publish' : 'publishAll';
    }

    const paths = selection.length > 0 ? selection : (previewSelection ? [previewSelection] : []);
    let context = paths.length === 1 ? {path: paths[0]} : {paths};

    let clear = () => selection.length > 0 ? dispatch(cmClearSelection()) : dispatch(dispatch(cmSetPreviewState(CM_DRAWER_STATES.HIDE)));
    return (
        <div className={`flexRow ${styles.root}`}>
            {(mode === JContentConstants.mode.SEARCH || mode === JContentConstants.mode.SQL2SEARCH) ?
                <SearchControlBar/> :
                <BrowseControlBar isShowingActions={selection.length <= 1}/>}
            {paths.length > 0 &&
            <React.Fragment>
                <div className="flexRow">
                    <Typography variant="caption" data-cm-role="selection-infos" data-cm-selection-size={paths.length} className={`${styles.selection}`}>
                        {t('jcontent:label.contentManager.selection.itemsSelected', {count: paths.length})}
                    </Typography>
                    <div className={styles.spacer}/>
                    <Button icon={<Cancel/>} variant="ghost" size="default" onClick={clear}/>
                </div>
                <div className="flexRow">
                    <Separator variant="vertical" invisible="onlyChild"/>
                    <DisplayActions
                        target="selectedContentActions"
                        {...context}
                        filter={action => action.key !== 'deletePermanently' && action.key.indexOf('publish') === -1}
                        buttonProps={{size: 'default', variant: 'ghost'}}
                        render={ButtonRenderer}
                    />
                </div>
                <Separator variant="vertical" invisible="onlyChild"/>
                <ButtonGroup size="default" variant="outlined" color="accent">
                    {publishAction && <DisplayAction actionKey={publishAction} {...context} isMediumLabel render={ButtonRendererShortLabel}/>}
                    <DisplayAction menuUseElementAnchor actionKey="publishMenu" {...context} render={ButtonRendererNoLabel}/>
                </ButtonGroup>
                <DisplayAction actionKey="publishDeletion" {...context} render={ButtonRendererShortLabel}/>
                <DisplayAction actionKey="deletePermanently" {...context} render={ButtonRendererShortLabel}/>
            </React.Fragment>}
        </div>
    );
};

export default ToolBar;
