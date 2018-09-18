const CM_NAVIGATE = 'CM_NAVIGATE';
const CM_SET_UILANGUAGE = 'CM_SET_UILANGUAGE';
const CM_SET_SELECTION = 'CM_SET_SELECTION';

function setUiLang(uiLang) {
    return {
        type: CM_SET_UILANGUAGE,
        uiLang
    }
}

function cmSetSelection(selection) {
    return {
        type: CM_SET_SELECTION,
        selection
    }
}

function cmGoto(data) {
    return Object.assign(data || {}, {type: CM_NAVIGATE});
}

function cmSetSite(site) {
    return cmGoto({site});
}


function cmSetLanguage(language) {
    return cmGoto({language});
}

function cmSetMode(mode) {
    return cmGoto({mode});
}

function cmSetPath(path) {
    return cmGoto({path});
}

function cmSetParams(params) {
    return cmGoto({params});
}

export {
    CM_NAVIGATE,
    CM_SET_UILANGUAGE,
    CM_SET_SELECTION,
    cmGoto,
    cmSetLanguage,
    setUiLang,
    cmSetSelection,
    cmSetSite,
    cmSetMode,
    cmSetPath,
    cmSetParams
}