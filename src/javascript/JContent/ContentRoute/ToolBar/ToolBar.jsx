import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import JContentConstants from '~/JContent/JContent.constants';
import SearchControlBar from './SearchControlBar';
import BrowseControlBar from './BrowseControlBar';
import {DisplayAction, DisplayActions} from '@jahia/ui-extender';
import {useTranslation} from 'react-i18next';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import styles from './Toolbar.scss';
import {Button, ButtonGroup, Cancel, Separator, Typography} from '@jahia/moonstone';
import {cmClearSelection} from '~/JContent/ContentRoute/ContentLayout/contentSelection.redux';
import {useNodeInfo} from '@jahia/data-helper';
import {CM_DRAWER_STATES} from '~/JContent/JContent.redux';
import {cmSetPreviewState} from '../../preview.redux';

const ButtonRendererShortLabel = getButtonRenderer({labelStyle: 'short'});
const ButtonRendererNoLabel = getButtonRenderer({labelStyle: 'none'});

export const ToolBar = () => {
    const {t} = useTranslation();
    const dispatch = useDispatch();

    const {mode, selection, previewSelection} = useSelector(state => ({
        mode: state.jcontent.mode,
        selection: state.jcontent.selection,
        previewSelection: state.jcontent.previewState === CM_DRAWER_STATES.SHOW && state.jcontent.previewSelection
    }));

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
                <SearchControlBar showActions={selection.length === 0}/> :
                <BrowseControlBar showActions={selection.length === 0}/>}
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
                        context={context}
                        filter={action => action.key !== 'deletePermanently' && action.key.indexOf('publish') === -1}
                        size="default"
                        variant="ghost"
                        render={getButtonRenderer()}
                    />
                </div>
                <Separator variant="vertical" invisible="onlyChild"/>
                <ButtonGroup size="default" variant="outlined" color="accent">
                    {publishAction && <DisplayAction actionKey={publishAction} context={context} render={ButtonRendererShortLabel}/>}
                    <DisplayAction actionKey="publishMenu" context={{...context, menuUseElementAnchor: true}} render={ButtonRendererNoLabel}/>
                </ButtonGroup>
                <DisplayAction actionKey="publishDeletion" context={context} render={ButtonRendererShortLabel}/>
                <DisplayAction actionKey="deletePermanently" context={context} render={ButtonRendererShortLabel}/>
            </React.Fragment>}
        </div>
    );
};

export default ToolBar;
