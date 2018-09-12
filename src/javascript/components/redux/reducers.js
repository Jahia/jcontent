import {SET_LANGUAGE, SET_SITE} from "./actions";

let languageReducer = (dxContext) => (state = dxContext.lang, action) => {
    if (action.type === SET_LANGUAGE) {
        return action.language;
    } else {
        return state;
    }
};

let siteReducer = (dxContext) => (state = dxContext.siteKey, action) => {
    if (action.type === SET_SITE) {
        return action.site
    } else {
        return state;
    }
};


export {languageReducer, siteReducer}
