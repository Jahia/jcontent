import {CM_SET_UILANGUAGE, CM_NAVIGATE, CM_SET_SELECTION} from "./actions";



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
    if (action.mode && action.type ===  CM_NAVIGATE) {
        return action.mode
    } else {
        return state;
    }
};

let pathReducer = (path) => (state = path, action) => {
    if (action.path && action.type ===  CM_NAVIGATE) {
        return action.path
    } else {
        return state;
    }
};

let paramsReducer = (params) => (state = params, action) => {
    if (action.params && action.type ===  CM_NAVIGATE) {
        return action.params
    } else {
        return state;
    }
};

let selectionReducer = (state = [], action) => {
    if (action.type === CM_SET_SELECTION) {
        return action.selection
    } else {
        return state;
    }
}

export {languageReducer, uiLanguageReducer, siteReducer, modeReducer, pathReducer, paramsReducer, selectionReducer}
