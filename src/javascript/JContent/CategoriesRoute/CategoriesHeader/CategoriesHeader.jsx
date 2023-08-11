import React, {useContext} from 'react';
import {ArrowLeft, Button, Chip, Header} from '@jahia/moonstone';
import {MainActionBar} from '~/JContent/CategoriesRoute/CategoriesHeader/MainActionBar';
import JContentConstants from '~/JContent/JContent.constants';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import ContentPath from '~/JContent/ContentRoute/ContentPath';
import {useNodeInfo} from '@jahia/data-helper';
import {getNodeTypeIcon} from '~/JContent/JContent.utils';
import {useTranslation} from 'react-i18next';
import {cmGoto} from '~/JContent/redux/JContent.redux';
import SearchControlBar from '~/JContent/ContentRoute/ToolBar/SearchControlBar';
import BrowseControlBar from '~/JContent/ContentRoute/ToolBar/BrowseControlBar';
import {cmClearSelection} from '~/JContent/redux/selection.redux';
import {SelectionActionsBar} from '~/JContent/CategoriesRoute/CategoriesHeader/SelectionActionsBar';
import SearchInput from './SearchInput';
import {registry} from '@jahia/ui-extender';
import {ResizeContext} from '~/JContent/MainLayout/ResizeObserver';
import {NarrowHeaderActions} from './NarrowHeaderActions';

const NARROW_HEADER_WIDTH = 750;

const excludedActions = [
    'subContents',
    'edit',
    'editPage',
    'publishMenu',
    'publishDeletion',
    'createFolder',
    'createContentFolder',
    'createContent',
    'fileUpload'
];

let extractNodeInfo = function (node, loading) {
    const nodeType = node?.primaryNodeType;
    const title = ((!loading && node && node.displayName) || 'Loading ...');
    return {nodePath: node?.path, nodeType, title};
};

const CategoriesHeader = () => {
    const {t} = useTranslation('jcontent');
    const dispatch = useDispatch();
    const {mode, preSearchModeMemo, path, language, displayLanguage, selection, previewSelection} = useSelector(state => ({
        mode: state.jcontent.mode,
        preSearchModeMemo: state.jcontent.preSearchModeMemo,
        path: state.jcontent.path,
        language: state.language,
        displayLanguage: state.uilang,
        selection: state.jcontent.selection
    }), shallowEqual);

    const width = useContext(ResizeContext);
    const narrow = width !== 0 && width <= NARROW_HEADER_WIDTH;

    const inSearchMode = JContentConstants.mode.SEARCH === mode;

    const {loading, node} = useNodeInfo({path, language: language, displayLanguage}, {getPrimaryNodeType: true, getDisplayName: true});

    let clear = () => dispatch(cmClearSelection());

    if (inSearchMode) {
        const clearSearchFunc = () => {
            const defaultMode = registry.find({type: 'accordionItem', target: 'jcontent'})[0].key;
            dispatch(cmGoto({mode: preSearchModeMemo ? preSearchModeMemo : defaultMode, params: {}}));
        };

        return narrow ? (
            <Header
                backButton={<Button icon={<ArrowLeft/>} onClick={clearSearchFunc}/>}
                mainActions={JContentConstants.mode.SEARCH === mode && <SearchInput/>}
                title={t('label.contentManager.title.search')}
                toolbarLeft={selection.length > 0 ? <NarrowHeaderActions previewSelection={previewSelection} selection={selection} clear={clear}/> : <SearchControlBar searchActionParams={{isShowingOnlySearchInput: true}}/>}
            />
        ) : (
            <Header
                backButton={<Button icon={<ArrowLeft/>} onClick={clearSearchFunc}/>}
                mainActions={JContentConstants.mode.SEARCH === mode && <SearchInput/>}
                title={t('label.contentManager.title.search')}
                toolbarLeft={
                    <>
                        {selection.length > 0 && <SelectionActionsBar paths={selection} clear={clear}/>}
                        {selection.length === 0 && <SearchControlBar searchActionParams={{isShowingOnlySearchInput: true}}/>}
                    </>
                }
            />
        );
    }

    const {nodePath, nodeType, title} = extractNodeInfo(node, loading);

    return narrow ? (
        <Header
            title={title}
            mainActions={<MainActionBar/>}
            breadcrumb={<ContentPath/>}
            contentType={nodeType && <Chip color="accent" label={nodeType.displayName || nodeType.name} icon={getNodeTypeIcon(nodeType.name)}/>}
            toolbarLeft={<NarrowHeaderActions path={nodePath} previewSelection={previewSelection} selection={selection} clear={clear}/>}
        />
    ) : (
        <Header
            title={title}
            mainActions={<MainActionBar/>}
            breadcrumb={<ContentPath/>}
            contentType={nodeType && <Chip color="accent" label={nodeType.displayName || nodeType.name} icon={getNodeTypeIcon(nodeType.name)}/>}
            toolbarLeft={
                <>
                    {selection.length > 0 && <SelectionActionsBar paths={selection} clear={clear}/>}
                    <BrowseControlBar isShowingActions={selection.length === 0}
                                      actionsToExcludeFromMenu={excludedActions}
                                      selector={state => ({
                        path: state.jcontent.path,
                        siteKey: state.site,
                        selection: state.jcontent.selection
                    })}/>
                </>
            }
        />
    );
};

export default CategoriesHeader;
