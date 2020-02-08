import {
    cmAddPathsToRefetch,
    cmClosePaths,
    cmOpenPaths,
    cmRemovePathsToRefetch,
    cmSetAvailableLanguages,
    cmSetMode,
    cmSetParams,
    cmSetPath,
    cmSetSearchMode,
    cmSetUilanguage
} from './JContent.redux-actions';
import * as _ from 'lodash';
import {extractPaths} from './JContent.utils';
import JContentConstants from './JContent.constants';
import {handleAction, handleActions} from 'redux-actions';

export const uiLanguageReducer = defaultValue => handleAction(cmSetUilanguage, (state, action) => action.payload, defaultValue);

export const availableLanguagesReducer = handleAction(cmSetAvailableLanguages, (state, action) => action.payload, []);

export const modeReducer = defaultValue => handleAction(cmSetMode, (state, action) => action.payload, defaultValue);

export const pathReducer = defaultValue => handleAction(cmSetPath, (state, action) => action.payload, defaultValue);

export const paramsReducer = defaultValue => handleAction(cmSetParams, (state, action) => action.payload, defaultValue);

export const openPathsReducer = (siteKey, path, mode) => handleActions({
    [cmOpenPaths]: (state, action) => _.union(state, action.payload),
    [cmClosePaths]: (state, action) => _.difference(state, action.payload)
}, (mode === JContentConstants.mode.APPS) ? [] : _.dropRight(extractPaths(siteKey, path, mode), 1));

export const pathsToRefetchReducer = handleActions({
    [cmAddPathsToRefetch]: (state, action) => _.union(state, action.payload),
    [cmRemovePathsToRefetch]: (state, action) => _.difference(state, action.payload)
}, []);

export const searchModeReducer = params => handleAction(cmSetSearchMode, (state, action) => action.payload, (params.sql2SearchFrom ? 'sql2' : 'normal'));
