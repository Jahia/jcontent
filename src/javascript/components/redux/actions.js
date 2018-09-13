const SET_UILANGUAGE = 'SET_UILANGUAGE';

function setUiLang(uiLang) {
    return {
        type: SET_UILANGUAGE,
        uiLang
    }
}

const SET_URL = 'SET_URL';

function setUrl(site, language, mode, path, params) {
    return {
        type: SET_URL,
        site,
        language,
        mode,
        path,
        params
    }
}

function setSite(site) {
    return {
        type: SET_URL,
        site
    }
}


function setLanguage(language) {
    return {
        type: SET_URL,
        language
    }
}

function setMode(mode) {
    return {
        type: SET_URL,
        mode
    }
}

function setPath(path) {
    return {
        type: SET_URL,
        path
    }
}

function setParams(params) {
    return {
        type: SET_URL,
        params
    }
}

export {
    setLanguage,
    SET_UILANGUAGE,
    setUiLang,
    SET_URL,
    setUrl,
    setSite,
    setMode,
    setPath,
    setParams
}