import React from 'react';
import {ArrowLeft, Button, Chip, Header} from '@jahia/moonstone';
import {MainActionBar} from '~/JContent/ContentRoute/MainActionBar';
import JContentConstants from '~/JContent/JContent.constants';
import ContentStatuses from '~/JContent/ContentRoute/ContentStatuses';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import ContentPath from '~/JContent/ContentRoute/ContentPath';
import {useNodeInfo} from '@jahia/data-helper';
import {getNodeTypeIcon} from '~/JContent/JContent.utils';
import {useTranslation} from 'react-i18next';
import {CM_DRAWER_STATES, cmGoto} from '~/JContent/JContent.redux';
import SearchControlBar from '~/JContent/ContentRoute/ToolBar/SearchControlBar';
import BrowseControlBar from '~/JContent/ContentRoute/ToolBar/BrowseControlBar';
import {cmClearSelection} from '~/JContent/ContentRoute/ContentLayout/contentSelection.redux';
import {cmSetPreviewState} from '~/JContent/preview.redux';
import {SelectionActionsBar} from '~/JContent/ContentRoute/ToolBar/SelectionActionsBar/SelectionActionsBar';
import SearchInput from '../SearchInput';
import {registry} from '@jahia/ui-extender';

const ContentHeader = () => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();
    const {mode, preSearchModeMemo, path, language, displayLanguage, selection, previewSelection} = useSelector(state => ({
        mode: state.jcontent.mode,
        preSearchModeMemo: state.jcontent.preSearchModeMemo,
        path: state.jcontent.path,
        language: state.language,
        displayLanguage: state.uilang,
        selection: state.jcontent.selection,
        previewSelection: state.jcontent.previewState === CM_DRAWER_STATES.SHOW && state.jcontent.previewSelection
    }), shallowEqual);

    const inSearchMode = JContentConstants.mode.SEARCH === mode || JContentConstants.mode.SQL2SEARCH === mode;

    const viewSelector = registry.get('accordionItem', mode)?.viewSelector;

    const {loading, node} = useNodeInfo({path, language: language, displayLanguage}, {getPrimaryNodeType: true, getDisplayName: true});
    const nodeType = node?.primaryNodeType;
    const title = inSearchMode ?
        t('label.contentManager.title.search') :
        ((!loading && node && node.displayName) || 'Loading ...');

    const clearSearchFunc = () => {
        const defaultMode = registry.find({type: 'accordionItem', target: 'jcontent'})[0].key;
        dispatch(cmGoto({mode: preSearchModeMemo ? preSearchModeMemo : defaultMode, params: {}}));
    };

    const paths = selection.length > 0 ? selection : (previewSelection ? [previewSelection] : []);

    let clear = () => selection.length > 0 ? dispatch(cmClearSelection()) : dispatch(dispatch(cmSetPreviewState(CM_DRAWER_STATES.HIDE)));

    return inSearchMode ? (
        <Header
            backButton={<Button icon={<ArrowLeft/>} onClick={clearSearchFunc}/>}
            mainActions={JContentConstants.mode.SEARCH === mode && <SearchInput/>}
            title={title}
            toolbarLeft={<SearchControlBar/>}
            toolbarRight={paths.length > 0 && <SelectionActionsBar paths={paths} clear={clear}/>}
        />
    ) : (
        <Header
            title={title}
            mainActions={<MainActionBar/>}
            breadcrumb={<ContentPath/>}
            contentType={nodeType && <Chip color="accent" label={nodeType.displayName || nodeType.name} icon={getNodeTypeIcon(nodeType.name)}/>}
            status={<ContentStatuses/>}
            toolbarLeft={<BrowseControlBar isShowingActions={selection.length === 0}/>}
            toolbarRight={
                <>
                    {viewSelector}
                    {paths.length > 0 && <SelectionActionsBar paths={paths} clear={clear}/>}
                </>
            }
        />
    );
};

export default ContentHeader;
