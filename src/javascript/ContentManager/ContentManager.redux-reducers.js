import {
    CM_ADD_PATHS_TO_REFETCH,
    CM_DRAWER_STATES,
    CM_NAVIGATE,
    CM_SET_AVAILABLE_LANGUAGES,
    CM_SET_SITE_DISPLAYABLE_NAME,
    CM_SET_OPEN_PATHS,
    CM_SET_SEARCH_MODE,
    CM_SET_TREE,
    CM_SET_TREE_WIDTH,
    CM_SET_UILANGUAGE
} from './ContentManager.redux-actions';
import * as _ from 'lodash';
import {extractPaths} from './ContentManager.utils';
import {CM_SET_PREVIEW} from './preview.redux-actions';
import ContentManagerStyleConstants from './ContentManager.style-constants';

let uiLanguageReducer = dxContext => (state = dxContext.uilang, action = {}) => {
    if (action.uilang && action.type === CM_SET_UILANGUAGE) {
        return action.uilang;
    }

    return state;
};

let siteReducer = siteKey => (state = siteKey, action = {}) => {
    if (action.site && action.type === CM_NAVIGATE) {
        return action.site;
    }

    return state;
};

let siteDisplayableNameReducer = siteDisplayableName => (state = siteDisplayableName, action = {}) => {
    if (action.siteDisplayableName && (action.type === CM_NAVIGATE || action.type === CM_SET_SITE_DISPLAYABLE_NAME)) {
        return action.siteDisplayableName;
    }

    return state;
};

let languageReducer = language => (state = language, action = {}) => {
    if (action.language && action.type === CM_NAVIGATE) {
        return action.language;
    }

    return state;
};

let availableLanguagesReducer = (state = [], action = {}) => {
    if (action.availableLanguages && action.type === CM_SET_AVAILABLE_LANGUAGES) {
        return action.availableLanguages;
    }

    return state;
};

let modeReducer = mode => (state = mode, action = {}) => {
    if (action.mode && action.type === CM_NAVIGATE) {
        return action.mode;
    }

    return state;
};

let pathReducer = path => (state = path, action = {}) => {
    if (action.path && action.type === CM_NAVIGATE) {
        return action.path;
    }

    return state;
};

let paramsReducer = params => (state = params, action = {}) => {
    if (action.params && action.type === CM_NAVIGATE) {
        return action.params;
    }

    return state;
};

let openPathsReducer = (siteKey, path, mode) => (state, action) => {
    if (state === undefined) {
        if (mode === 'apps') {
            state = [];
        } else {
            state = _.dropRight(extractPaths(siteKey, path, mode), 1);
        }
    }

    if (action.type === CM_SET_OPEN_PATHS) {
        if (action.open) {
            return _.union(state, action.open);
        }

        if (action.close) {
            return _.difference(state, action.close);
        }

        return state;
    }

    return state;
};

let treeStateReducer = (state = CM_DRAWER_STATES.SHOW, action = {}) => {
    switch (action.type) {
        case CM_SET_TREE:
            return action.treeState;
        case CM_SET_PREVIEW: {
            if (action.previewState === CM_DRAWER_STATES.SHOW && state === CM_DRAWER_STATES.SHOW) {
                return CM_DRAWER_STATES.TEMP;
            }

            if (action.previewState === CM_DRAWER_STATES.HIDE && state === CM_DRAWER_STATES.TEMP) {
                return CM_DRAWER_STATES.SHOW;
            }

            return state;
        }

        default:
            return state;
    }
};

let treeWidthReducer = (state = ContentManagerStyleConstants.treeDrawerWidth, action = {}) => {
    if (action.type === CM_SET_TREE_WIDTH) {
        return action.width;
    }

    return state;
};

let pathsToRefetchReducer = (state, action) => {
    if (state === undefined) {
        state = [];
    }

    if (action.type === CM_ADD_PATHS_TO_REFETCH) {
        return _.union(state, action.paths);
    }

    return _.difference(state, action.paths);
};

let searchModeReducer = params => (state = (params.sql2SearchFrom ? 'sql2' : 'normal'), action = {}) => {
    if (action.type === CM_SET_SEARCH_MODE) {
        return action.searchMode;
    }

    return state;
};

export {
    languageReducer, uiLanguageReducer, siteReducer, modeReducer, pathReducer, paramsReducer, openPathsReducer,
    treeStateReducer, treeWidthReducer, searchModeReducer, siteDisplayableNameReducer, pathsToRefetchReducer,
    availableLanguagesReducer
};
