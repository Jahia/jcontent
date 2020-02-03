import {selectionReducer} from './ContentRoute/ContentLayout/contentSelection.redux-reducers';
import {fileUpload} from './ContentRoute/ContentLayout/Upload/Upload.redux-reducer';
import {copyPaste} from './actions/copyPaste/copyPaste.redux-reducer';
import {filesGrid} from './ContentRoute/ContentLayout/FilesGrid/FilesGrid.redux-reducer';
import {
    availableLanguagesReducer,
    languageReducer,
    modeReducer,
    openPathsReducer,
    paramsReducer,
    pathReducer,
    pathsToRefetchReducer,
    searchModeReducer,
    siteDisplayableNameReducer,
    siteReducer,
    treeStateReducer,
    treeWidthReducer,
    uiLanguageReducer
} from './JContent.redux-reducers';
import {extractParamsFromUrl, getSyncListener} from './JContent.redux-utils';
import {previewModeReducer, previewSelectionReducer, previewStateReducer} from './preview.redux-reducers';
import {sortReducer} from './ContentRoute/ContentLayout/sort.redux-reducers';
import {paginationReducer} from './ContentRoute/ContentLayout/pagination.redux-reducers';

const jContentReduxStore = (registry, dxContext) => {
    const pathName = window.location.pathname.substring((dxContext.contextPath + dxContext.urlbase).length);
    const currentValueFromUrl = extractParamsFromUrl(pathName, window.location.search);

    registry.add('redux-reducer', 'uilang', {reducer: uiLanguageReducer(dxContext)});
    registry.add('redux-reducer', 'site', {reducer: siteReducer(dxContext.siteKey)});
    registry.add('redux-reducer', 'siteDisplayableName', {reducer: siteDisplayableNameReducer(dxContext.siteKey)});
    registry.add('redux-reducer', 'language', {reducer: languageReducer(currentValueFromUrl.language)});
    registry.add('redux-reducer', 'availableLanguages', {reducer: availableLanguagesReducer});
    registry.add('redux-reducer', 'mode', {reducer: modeReducer(currentValueFromUrl.mode)});
    registry.add('redux-reducer', 'path', {reducer: pathReducer(currentValueFromUrl.path)});
    registry.add('redux-reducer', 'params', {reducer: paramsReducer(currentValueFromUrl.params)});
    registry.add('redux-reducer', 'fileUpload', {reducer: fileUpload});
    registry.add('redux-reducer', 'previewMode', {reducer: previewModeReducer});
    registry.add('redux-reducer', 'previewState', {reducer: previewStateReducer});
    registry.add('redux-reducer', 'previewSelection', {reducer: previewSelectionReducer});
    registry.add('redux-reducer', 'treeState', {reducer: treeStateReducer});
    registry.add('redux-reducer', 'treeWidth', {reducer: treeWidthReducer});
    registry.add('redux-reducer', 'openPaths', {reducer: openPathsReducer(currentValueFromUrl.site, currentValueFromUrl.path, currentValueFromUrl.mode)});
    registry.add('redux-reducer', 'searchMode', {reducer: searchModeReducer({})});
    registry.add('redux-reducer', 'copyPaste', {reducer: copyPaste});
    registry.add('redux-reducer', 'filesGrid', {reducer: filesGrid});
    registry.add('redux-reducer', 'pagination', {reducer: paginationReducer});
    registry.add('redux-reducer', 'sort', {reducer: sortReducer});
    registry.add('redux-reducer', 'pathsToRefetch', {reducer: pathsToRefetchReducer});
    registry.add('redux-reducer', 'selection', {reducer: selectionReducer});

    registry.add('redux-listener', 'jcontent', {createListener: getSyncListener});
};

export default jContentReduxStore;
