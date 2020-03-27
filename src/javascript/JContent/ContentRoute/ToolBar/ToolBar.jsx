import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import JContentConstants from '~/JContent/JContent.constants';
import SearchControlBar from './SearchControlBar';
import BrowseControlBar from './BrowseControlBar';
import {DisplayAction, DisplayActions} from '@jahia/ui-extender';
import {useTranslation} from 'react-i18next';
import {getButtonRenderer} from '~/utils/getButtonRenderer';
import styles from './Toolbar.scss';
import {Separator, Button, ButtonGroup, Typography} from '@jahia/moonstone';
import {cmClearSelection} from '~/JContent/ContentRoute/ContentLayout/contentSelection.redux';
import {Cancel} from '@jahia/moonstone/dist/icons';

const ButtonRendererMultiple = getButtonRenderer({labelStyle: 'multiple'});
const ButtonRendererShortLabel = getButtonRenderer({labelStyle: 'short'});
const ButtonRendererNoLabel = getButtonRenderer({labelStyle: 'none'});

export const ToolBar = () => {
    const {t} = useTranslation();
    const dispatch = useDispatch();

    const {mode, selection} = useSelector(state => ({
        mode: state.jcontent.mode,
        selection: state.jcontent.selection
    }));

    return (
        <div className={`flexRow ${styles.root}`}>
            {(mode === JContentConstants.mode.SEARCH || mode === JContentConstants.mode.SQL2SEARCH) ?
                <SearchControlBar showActions={selection.length === 0}/> :
                <BrowseControlBar showActions={selection.length === 0}/>}
            {selection.length > 0 &&
            <React.Fragment>
                <Typography variant="caption" data-cm-role="selection-infos" data-cm-selection-size={selection.length}>
                    {t('jcontent:label.contentManager.selection.itemsSelected', {count: selection.length})}
                </Typography>
                <div className={styles.spacer}/>
                <Button icon={<Cancel/>} variant="ghost" size="small" onClick={() => dispatch(cmClearSelection())}/>
                <div className="flexRow">
                    <Separator variant="vertical" invisible="onlyChild"/>
                    <DisplayActions
                        target="selectedContentActions"
                        context={{paths: selection}}
                        filter={action => action.key !== 'deletePermanently' && action.key.indexOf('publish') === -1}
                        render={getButtonRenderer({size: 'small', variant: 'ghost'})}
                    />
                </div>
                <Separator variant="vertical" invisible="onlyChild"/>
                <ButtonGroup size="small" variant="outlined" color="accent">
                    <DisplayAction actionKey="publish" context={{paths: selection}} render={ButtonRendererMultiple}/>
                    <DisplayAction actionKey="publishMenu" context={{paths: selection, menuUseElementAnchor: true}} render={ButtonRendererNoLabel}/>
                </ButtonGroup>
                <DisplayAction actionKey="publishDeletion" context={{paths: selection}} render={ButtonRendererShortLabel}/>
                <DisplayAction actionKey="deletePermanently" context={{paths: selection}} render={ButtonRendererShortLabel}/>
            </React.Fragment>}
        </div>
    );
};

export default ToolBar;
