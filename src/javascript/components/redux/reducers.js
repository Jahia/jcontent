import {SET_UILANGUAGE, SET_URL} from "./actions";



let uiLanguageReducer = (dxContext) => (state = dxContext.uilang, action) => {
    if (action.uiLang && action.type === SET_UILANGUAGE) {
        return action.uiLang;
    } else {
        return state;
    }
};

let siteReducer = (siteKey) => (state = siteKey, action) => {
    if (action.site && action.type === SET_URL) {
        return action.site
    } else {
        return state;
    }
};

let languageReducer = (language) => (state = language, action) => {
    if (action.language && action.type === SET_URL) {
        return action.language;
    } else {
        return state;
    }
};

let modeReducer = (mode) => (state = mode, action) => {
    if (action.mode && action.type ===  SET_URL) {
        return action.mode
    } else {
        return state;
    }
};

let pathReducer = (path) => (state = path, action) => {
    if (action.path && action.type ===  SET_URL) {
        return action.path
    } else {
        return state;
    }
};

let paramsReducer = (params) => (state = params, action) => {
    if (action.params && action.type ===  SET_URL) {
        return action.params
    } else {
        return state;
    }
};

export {languageReducer, uiLanguageReducer, siteReducer, modeReducer, pathReducer, paramsReducer}
