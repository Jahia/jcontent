import {CM_SET_UILANGUAGE, CM_NAVIGATE, CM_SET_SELECTION, CM_SET_PREVIEW, CM_SET_OPEN_PATHS, CM_PREVIEW_STATES, CM_SET_SEARCH_MODE, CM_CONTEXTUAL_MENU} from "./actions";
import * as _ from 'lodash';
import {extractPaths} from "../utils.js";

let uiLanguageReducer = (dxContext) => (state = dxContext.uilang, action) => {
    if (action.uiLang && action.type === CM_SET_UILANGUAGE) {
        return action.uiLang;
    } else {
        return state;
    }
};

let siteReducer = (siteKey) => (state = siteKey, action) => {
    if (action.site && action.type === CM_NAVIGATE) {
        return action.site
    } else {
        return state;
    }
};

let languageReducer = (language) => (state = language, action) => {
    if (action.language && action.type === CM_NAVIGATE) {
        return action.language;
    } else {
        return state;
    }
};

let modeReducer = (mode) => (state = mode, action) => {
    if (action.mode && action.type === CM_NAVIGATE) {
        return action.mode
    } else {
        return state;
    }
};

let pathReducer = (path) => (state = path, action) => {
    if (action.path && action.type === CM_NAVIGATE) {
        return action.path
    } else {
        return state;
    }
};

let paramsReducer = (params) => (state = params, action) => {
    if (action.params && action.type === CM_NAVIGATE) {
        return action.params
    } else {
        return state;
    }
};

let selectionReducer = (state = [], action) => {
    if (action.type === CM_SET_SELECTION) {
        return action.selection
    } else if (action.type === CM_NAVIGATE) {
        return [];
    } else {
        return state;
    }
};

let previewModeReducer = (state = 'edit', action) => {
    if (action.previewMode && action.type === CM_SET_PREVIEW) {
        return action.previewMode
    } else {
        return state;
    }
};

let previewModesReducer = (state = [], action) => {
    if (action.previewModes && action.type === CM_SET_PREVIEW) {
        return action.previewModes
    } else {
        return state;
    }
};

let openPathsReducer = (siteKey, path) => (state = _.dropRight(extractPaths(siteKey, path), 1), action) => {
    if (action.type === CM_SET_OPEN_PATHS) {
        if (action.open) {
            return _.union(state, action.open);
        } else if (action.close) {
            return _.difference(state, action.close);
        } else {
            return state;
        }
    } else {
        return state;
    }
};

let previewStateReducer = (state = CM_PREVIEW_STATES.HIDE, action) => {
    if (action.previewState !== undefined && action.type === CM_SET_PREVIEW) {
        return action.previewState;
    } else {
        return state;
    }
};

let searchModeReducer = (params) => (state = (params.sql2SearchFrom ? 'sql2' : 'normal'), action) => {
    if (action.type === CM_SET_SEARCH_MODE) {
        return action.searchMode;
    } else {
        return state;
    }
};

const defaultContextualMenu = {
    isOpen: false,
    event: null,
    path: null,
    uuid: null,
    displayName:null,
    nodeName: null
};
let contextualMenuReducer = (state = defaultContextualMenu, action) => {
    if (action.type === CM_CONTEXTUAL_MENU) {
        if (action.contextualMenu.isOpen) {
            action.contextualMenu.event.preventDefault();
            action.contextualMenu.event.persist();
            return action.contextualMenu
        } else {
            return defaultContextualMenu
        }
    } else {
        return state;
    }
};

export {languageReducer, uiLanguageReducer, siteReducer, modeReducer, pathReducer, paramsReducer, selectionReducer, previewModeReducer, previewModesReducer, openPathsReducer, previewStateReducer, searchModeReducer, contextualMenuReducer};
